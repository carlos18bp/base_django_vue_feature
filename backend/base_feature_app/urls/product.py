from django.urls import path

from base_feature_app.views import product_crud

urlpatterns = [
    path('products/', product_crud.list_products, name='list-products'),
    path('products/create/', product_crud.create_product, name='create-product'),
    path('products/<int:product_id>/', product_crud.retrieve_product, name='retrieve-product'),
    path('products/<int:product_id>/update/', product_crud.update_product, name='update-product'),
    path('products/<int:product_id>/delete/', product_crud.delete_product, name='delete-product'),
]
