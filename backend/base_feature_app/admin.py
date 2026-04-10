import json
import logging

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.http import HttpResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.urls import path, reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django_attachments.admin import AttachmentsAdminMixin

from .forms.blog import BlogForm
from .forms.product import ProductForm
from .forms.user import UserChangeForm, UserCreationForm
from .models import Blog, Product, Sale, SoldProduct, User
from .utils.auth_utils import generate_auth_tokens

logger = logging.getLogger(__name__)

# ============================================================================
# BLOG SECTION
# ============================================================================

class BlogAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    form = BlogForm
    list_display = ('title', 'category')
    search_fields = ('title', 'category', 'description')
    list_filter = ('category',)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


# ============================================================================
# PRODUCT SECTION
# ============================================================================

class ProductAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    form = ProductForm
    list_display = ('title', 'category', 'sub_category', 'price')
    search_fields = ('title', 'category', 'sub_category', 'description')
    list_filter = ('category', 'sub_category')
    list_editable = ('price',)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


# ============================================================================
# SALE SECTION
# ============================================================================

class SoldProductInline(admin.TabularInline):
    model = Sale.sold_products.through
    extra = 1
    verbose_name = _('Sold Product')
    verbose_name_plural = _('Sold Products')


class SoldProductAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity')
    search_fields = ('product__title',)
    list_filter = ('product__category',)


class SaleAdmin(admin.ModelAdmin):
    list_display = ('email', 'address', 'city', 'state', 'postal_code', 'total_products')
    search_fields = ('email', 'address', 'city', 'state', 'postal_code')
    list_filter = ('state', 'city')
    inlines = [SoldProductInline]

    def total_products(self, obj):
        return obj.sold_products.count()
    total_products.short_description = _('Total Products')

    def delete_queryset(self, request, queryset):
        for sale in queryset:
            sale.delete()


# ============================================================================
# USER SECTION
# ============================================================================

class BaseFeatureUserAdmin(UserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    ordering = ('email',)
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    fieldsets = (
        (None, {'fields': ('email', 'password', 'login_as_link')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone')}),
        (_('Role'), {'fields': ('role',)}),
        (
            _('Permissions'),
            {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')},
        ),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('email', 'password1', 'password2', 'role'),
            },
        ),
    )

    readonly_fields = ('date_joined', 'last_login', 'login_as_link')
    filter_horizontal = ('groups', 'user_permissions')

    def login_as_link(self, obj):
        if not obj.pk:
            return '-'
        url = reverse('myadmin:base_feature_app_user_login-as', args=[obj.pk])
        return format_html(
            '<a href="{}" target="_blank" style="'
            'background:#417690;color:#fff;padding:5px 15px;'
            'border-radius:4px;text-decoration:none;font-weight:bold;'
            '">Login as this user</a>',
            url,
        )
    login_as_link.short_description = _('Impersonate')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:user_id>/login-as/',
                self.admin_site.admin_view(self.login_as_user),
                name='base_feature_app_user_login-as',
            ),
        ]
        return custom_urls + urls

    def login_as_user(self, request, user_id):
        if not request.user.is_superuser:
            return HttpResponseForbidden('Only superusers can use this feature.')

        from django.utils.html import escape as html_escape

        user = get_object_or_404(User, pk=user_id)
        tokens = generate_auth_tokens(user)
        access_token = tokens['access']
        refresh_token = tokens['refresh']
        user_data = json.dumps(tokens['user'])

        logger.info('Admin %s logged in as %s', request.user.email, user.email)

        safe_email = html_escape(user.email)
        js_access = json.dumps(access_token).replace('</', '<\\/')
        js_refresh = json.dumps(refresh_token).replace('</', '<\\/')
        js_user = json.dumps(user_data).replace('</', '<\\/')

        html = f"""<!DOCTYPE html>
<html>
<head><title>Logging in as {safe_email}...</title></head>
<body>
<p>Logging in as <strong>{safe_email}</strong>...</p>
<script>
localStorage.setItem("access_token", {js_access});
localStorage.setItem("refresh_token", {js_refresh});
localStorage.setItem("user", {js_user});
window.location.href = "/dashboard";
</script>
</body>
</html>"""
        return HttpResponse(html)


# ============================================================================
# CUSTOM ADMIN SITE WITH SECTIONS
# ============================================================================

class BaseFeatureAdminSite(admin.AdminSite):
    site_header = _('Base Feature Administration')
    site_title = _('Base Feature Admin')
    index_title = _('Welcome to Base Feature Control Panel')

    def get_app_list(self, request):
        app_dict = self._build_app_dict(request)
        base_app = app_dict.get('base_feature_app', {})
        models_dict = {model['object_name']: model for model in base_app.get('models', [])}
        
        # Custom structure for the admin index - organized by sections
        custom_app_list = [
            {
                'name': _('👥 User Management'),
                'app_label': 'user_management',
                'models': [
                    models_dict.get('User')
                ] if 'User' in models_dict else []
            },
            {
                'name': _('📝 Blog Management'),
                'app_label': 'blog_management',
                'models': [
                    models_dict.get('Blog')
                ] if 'Blog' in models_dict else []
            },
            {
                'name': _('🛍️ Product Management'),
                'app_label': 'product_management',
                'models': [
                    models_dict.get('Product')
                ] if 'Product' in models_dict else []
            },
            {
                'name': _('💰 Sales Management'),
                'app_label': 'sales_management',
                'models': [
                    model for model in [
                        models_dict.get('Sale'),
                        models_dict.get('SoldProduct')
                    ] if model is not None
                ]
            },
        ]
        
        # Filter out empty sections
        custom_app_list = [section for section in custom_app_list if section['models']]
        
        return custom_app_list


# ============================================================================
# REGISTRATION
# ============================================================================

# Create an instance of the custom AdminSite
admin_site = BaseFeatureAdminSite(name='myadmin')

# Register models with the custom AdminSite
admin_site.register(User, BaseFeatureUserAdmin)
admin_site.register(Blog, BlogAdmin)
admin_site.register(Product, ProductAdmin)
admin_site.register(Sale, SaleAdmin)
admin_site.register(SoldProduct, SoldProductAdmin)