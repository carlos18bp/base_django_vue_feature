from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from base_feature_app.views import product, blog, sale

urlpatterns = [
    path('blogs-data/', blog.blog_list, name='blog-list'),
    path('products-data/', product.product_list, name='product-list'),
    path('create-sale/', sale.create_sale, name='create-sale'),
]