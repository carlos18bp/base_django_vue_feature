from django.urls import path

from base_feature_app.views import blog_crud

urlpatterns = [
    path('blogs/', blog_crud.list_blogs, name='list-blogs'),
    path('blogs/create/', blog_crud.create_blog, name='create-blog'),
    path('blogs/<int:blog_id>/', blog_crud.retrieve_blog, name='retrieve-blog'),
    path('blogs/<int:blog_id>/update/', blog_crud.update_blog, name='update-blog'),
    path('blogs/<int:blog_id>/delete/', blog_crud.delete_blog, name='delete-blog'),
]
