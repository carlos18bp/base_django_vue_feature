from django.urls import path

from base_feature_app.views import user_crud

urlpatterns = [
    path('users/', user_crud.list_users, name='list-users'),
    path('users/create/', user_crud.create_user, name='create-user'),
    path('users/<int:user_id>/', user_crud.retrieve_user, name='retrieve-user'),
    path('users/<int:user_id>/update/', user_crud.update_user, name='update-user'),
    path('users/<int:user_id>/delete/', user_crud.delete_user, name='delete-user'),
]
