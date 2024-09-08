from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Blog, Product, Sale, SoldProduct
from .forms.blog import BlogForm
from .forms.product import ProductForm
from django_attachments.admin import AttachmentsAdminMixin

class BlogAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    form = BlogForm
    list_display = ('title', 'category')

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()

class ProductAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    form = ProductForm
    list_display = ('title', 'category', 'sub_category', 'price')

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()

class SaleAdmin(admin.ModelAdmin):
    list_display = ('email', 'address', 'city', 'state', 'postal_code')

    def delete_queryset(self, request, queryset):
        for sale in queryset:
            sale.delete()

# Custom AdminSite to organize models by sections
class BaseFeatureAdminSite(admin.AdminSite):
    site_header = 'Base Feature'
    site_title = 'Base Feature'
    index_title = 'Welcome to Base Feature Control Panel'

    def get_app_list(self, request):
        app_dict = self._build_app_dict(request)
        # Custom structure for the admin index
        custom_app_list = [
            {
                'name': _('Blog Management'),
                'app_label': 'blog_management',
                'models': [
                    model for model in app_dict.get('base_feature_app', {}).get('models', [])
                    if model['object_name'] in ['Blog']
                ]
            },
            {
                'name': _('Product Management'),
                'app_label': 'product_management',
                'models': [
                    model for model in app_dict.get('base_feature_app', {}).get('models', [])
                    if model['object_name'] in ['Product', 'SoldProduct', 'Sale']
                ]
            },
        ]
        return custom_app_list

# Create an instance of the custom AdminSite
admin_site = BaseFeatureAdminSite(name='myadmin')

# Register models with the custom AdminSite
admin_site.register(Blog, BlogAdmin)
admin_site.register(Product, ProductAdmin)
admin_site.register(Sale, SaleAdmin)
admin_site.register(SoldProduct)