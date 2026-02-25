import io

import pytest
from django.core.files.base import ContentFile
from PIL import Image

from base_feature_app.models import Blog
from django_attachments.models import Attachment, Library


def _placeholder_image(name='placeholder.webp'):
    image = Image.new('RGB', (10, 10), color=(240, 240, 240))
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP')
    buffer.seek(0)
    return ContentFile(buffer.read(), name=name)


@pytest.mark.django_db
class TestBlogModel:
    def test_blog_delete_removes_library(self):
        library = Library.objects.create(title='Blog Image')
        Attachment.objects.create(library=library, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
        blog = Blog.objects.create(title='Test Blog', description='Description', category='Technology', image=library)

        library_id = library.id
        blog.delete()

        assert not Library.objects.filter(id=library_id).exists()

    def test_blog_creation(self):
        library = Library.objects.create(title='Blog Image')
        blog = Blog.objects.create(
            title='Test Blog',
            description='This is a test blog description',
            category='Technology',
            image=library
        )
        
        assert blog.title == 'Test Blog'
        assert blog.description == 'This is a test blog description'
        assert blog.category == 'Technology'
        assert blog.image == library

    def test_blog_str_representation(self):
        library = Library.objects.create(title='Blog Image')
        blog = Blog.objects.create(
            title='My Blog Title',
            description='Description',
            category='Health',
            image=library
        )
        assert str(blog) == 'My Blog Title'

    def test_blog_update(self):
        """Verifies that blog fields can be updated and persisted correctly."""
        library = Library.objects.create(title='Original Image')
        blog = Blog.objects.create(
            title='Original Title',
            description='Original Description',
            category='Education',
            image=library
        )
        
        blog.title = 'Updated Title'
        blog.category = 'Technology'
        blog.save()
        
        updated_blog = Blog.objects.get(id=blog.id)
        assert updated_blog.title == 'Updated Title'
        assert updated_blog.category == 'Technology'
