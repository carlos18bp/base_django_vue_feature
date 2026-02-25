from django.urls import path

from base_feature_app.views import sale, sale_crud

urlpatterns = [
    path('create-sale/', sale.create_sale, name='create-sale'),
    path('sales/', sale_crud.list_sales, name='list-sales'),
    path('sales/<int:sale_id>/', sale_crud.retrieve_sale, name='retrieve-sale'),
]
