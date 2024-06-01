from django.contrib import admin
from .models import Product
from .forms import ProductForm

from django_attachments.admin import AttachmentsAdminMixin

admin.site.site_header = "Base Feature Project"
admin.site.site_title = "Base Feature Project"
admin.site.index_title = "Welcome to Base Feature Control Panel"


class ProductAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
	form = ProductForm

	def delete_queryset(self, request, queryset):
		for obj in queryset:
			obj.delete()


admin.site.register(Product, ProductAdmin)