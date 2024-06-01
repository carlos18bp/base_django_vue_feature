from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from base_feature_app.views import product

urlpatterns = [
    path('api/products/', product.product_list, name='product-list'),
]