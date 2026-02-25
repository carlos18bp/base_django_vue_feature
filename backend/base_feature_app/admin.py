from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import Blog, Product, Sale, SoldProduct, User
from .forms.blog import BlogForm
from .forms.product import ProductForm
from .forms.user import UserChangeForm, UserCreationForm
from django_attachments.admin import AttachmentsAdminMixin

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
        (None, {'fields': ('email', 'password')}),
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

    readonly_fields = ('date_joined', 'last_login')
    filter_horizontal = ('groups', 'user_permissions')


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