import io

import pytest
from django.core.files.base import ContentFile
from rest_framework.test import APIRequestFactory
from PIL import Image

from base_feature_app.models import Blog
from base_feature_app.serializers.blog import BlogSerializer
from base_feature_app.serializers.blog_list import BlogListSerializer
from base_feature_app.serializers.blog_detail import BlogDetailSerializer
from base_feature_app.serializers.blog_create_update import BlogCreateUpdateSerializer
from django_attachments.models import Attachment, Library


def _placeholder_image(name='placeholder.webp'):
    image = Image.new('RGB', (10, 10), color=(240, 240, 240))
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP')
    buffer.seek(0)
    return ContentFile(buffer.read(), name=name)


@pytest.mark.django_db
class TestBlogListSerializer:
    def test_blog_list_serializer_includes_absolute_image_url(self):
        library = Library.objects.create(title='Blog Image')
        Attachment.objects.create(library=library, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
        blog = Blog.objects.create(title='Test Blog', description='Description', category='Technology', image=library)

        factory = APIRequestFactory()
        request = factory.get('/api/blogs/')

        serializer = BlogListSerializer(blog, context={'request': request})
        assert serializer.data['image_url'].startswith('http://testserver/')
        assert serializer.data['title'] == 'Test Blog'
        assert serializer.data['category'] == 'Technology'

    def test_blog_list_serializer_without_attachments(self):
        library = Library.objects.create(title='Empty Library')
        blog = Blog.objects.create(title='No Attachments Blog', description='Description', category='Tech', image=library)

        factory = APIRequestFactory()
        request = factory.get('/api/blogs/')

        serializer = BlogListSerializer(blog, context={'request': request})
        # Should be None because library has no attachments
        assert serializer.data['image_url'] is None

    def test_blog_list_serializer_without_request_context(self):
        library = Library.objects.create(title='Blog Image')
        Attachment.objects.create(library=library, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
        blog = Blog.objects.create(title='Test', description='D', category='C', image=library)

        serializer = BlogListSerializer(blog)
        assert serializer.data['image_url'] is None


@pytest.mark.django_db
class TestBlogDetailSerializer:
    def test_blog_detail_serializer_with_image(self):
        library = Library.objects.create(title='Blog Image')
        Attachment.objects.create(library=library, file=_placeholder_image(), original_name='placeholder.webp', rank=0)
        blog = Blog.objects.create(title='Detail Blog', description='Long description', category='Tech', image=library)

        factory = APIRequestFactory()
        request = factory.get('/api/blogs/1/')

        serializer = BlogDetailSerializer(blog, context={'request': request})
        assert serializer.data['image_url'].startswith('http://testserver/')
        assert serializer.data['title'] == 'Detail Blog'
        assert serializer.data['description'] == 'Long description'


@pytest.mark.django_db
class TestBlogCreateUpdateSerializer:
    def test_create_blog(self):
        """Verifies that BlogCreateUpdateSerializer creates a Blog with the correct fields."""
        library = Library.objects.create(title='Blog Image')
        
        payload = {
            'title': 'New Blog',
            'description': 'New Description',
            'category': 'Technology',
            'image': library.id
        }

        serializer = BlogCreateUpdateSerializer(data=payload)
        assert serializer.is_valid(), serializer.errors
        blog = serializer.save()

        assert blog.title == 'New Blog'
        assert blog.description == 'New Description'
        assert blog.category == 'Technology'
        assert blog.image == library

    def test_update_blog(self):
        """Verifies that BlogCreateUpdateSerializer partially updates a Blog's fields."""
        library = Library.objects.create(title='Old Image')
        blog = Blog.objects.create(title='Old Title', description='Old Desc', category='Old Cat', image=library)

        new_library = Library.objects.create(title='New Image')
        payload = {
            'title': 'Updated Title',
            'description': 'Updated Description',
            'image': new_library.id
        }

        serializer = BlogCreateUpdateSerializer(blog, data=payload, partial=True)
        assert serializer.is_valid(), serializer.errors
        updated_blog = serializer.save()

        assert updated_blog.title == 'Updated Title'
        assert updated_blog.description == 'Updated Description'
        assert updated_blog.image == new_library


@pytest.mark.django_db
class TestBlogSerializer:
    def test_get_image_url_returns_absolute_url_when_attachment_exists(self):
        """Verifies that BlogSerializer returns an absolute image URL when an attachment is present."""
        library = Library.objects.create(title='Blog Serializer Library')
        Attachment.objects.create(
            library=library,
            file=_placeholder_image(),
            original_name='placeholder.webp',
            rank=0,
        )
        blog = Blog.objects.create(
            title='Serializer Blog',
            description='Desc',
            category='Tech',
            image=library,
        )

        factory = APIRequestFactory()
        request = factory.get('/api/blogs/')

        serializer = BlogSerializer(blog, context={'request': request})

        assert serializer.data['image_url'].startswith('http://testserver/')

    def test_get_image_url_returns_none_when_library_has_no_attachments(self):
        """Verifies that BlogSerializer returns None for image_url when the library has no attachments."""
        library = Library.objects.create(title='Empty Blog Library')
        blog = Blog.objects.create(
            title='Blog Without Attachments',
            description='Desc',
            category='Tech',
            image=library,
        )

        factory = APIRequestFactory()
        request = factory.get('/api/blogs/')

        serializer = BlogSerializer(blog, context={'request': request})

        assert serializer.data['image_url'] is None
