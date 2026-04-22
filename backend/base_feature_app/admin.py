import logging
from urllib.parse import urlencode

from django.conf import settings
from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin
from django.core.exceptions import PermissionDenied
from django.http import HttpResponseRedirect
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
        if not obj or not obj.pk:
            return '—'
        url = reverse('myadmin:base_feature_app_user_login_as', args=[obj.pk])
        return format_html(
            '<a class="button" href="{}" style="text-decoration:none" target="_blank" rel="noopener">Login as this user</a>',
            url,
        )
    login_as_link.short_description = _('Impersonate')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:user_id>/login_as/',
                self.admin_site.admin_view(self.login_as_user_view),
                name='base_feature_app_user_login_as',
            ),
        ]
        return custom_urls + urls

    def login_as_user_view(self, request, user_id):
        if not (request.user.is_active and request.user.is_superuser):
            raise PermissionDenied('Only active superusers can use Login-as.')

        target = get_object_or_404(User, pk=user_id)
        change_url = reverse('myadmin:base_feature_app_user_change', args=[user_id])

        if target.is_superuser and target.pk != request.user.pk:
            messages.error(request, _('You cannot log in as another superuser.'))
            return HttpResponseRedirect(change_url)

        if not target.is_active:
            messages.error(request, _('This user is inactive.'))
            return HttpResponseRedirect(change_url)

        tokens = generate_auth_tokens(target)
        logger.info('admin %s logged in as user %s', request.user.email, target.email)

        query = urlencode({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'redirect': '/',
        })
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/admin-login?{query}')


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
