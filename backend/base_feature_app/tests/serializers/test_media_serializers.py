import pytest
from types import SimpleNamespace

from base_feature_app.serializers.blog import BlogSerializer
from base_feature_app.serializers.blog_detail import BlogDetailSerializer
from base_feature_app.serializers.product import ProductSerializer
from base_feature_app.serializers.product_detail import ProductDetailSerializer
from base_feature_app.serializers.product_list import ProductListSerializer


class FakeRequest:
    def __init__(self):
        self.called_with = []

    def build_absolute_uri(self, url):
        self.called_with.append(url)
        return f"ABS:{url}"


class FakeAttachment:
    def __init__(self, url):
        self.file = SimpleNamespace(url=url)


class FakeAttachmentSet:
    def __init__(self, attachments):
        self._attachments = attachments

    def order_by(self, *args, **kwargs):  # pragma: no cover - order_by itself is trivial
        return self

    def first(self):
        return self._attachments[0] if self._attachments else None

    def all(self):
        return list(self._attachments)

    def __iter__(self):
        return iter(self._attachments)


class FakeImage:
    def __init__(self, attachments):
        self.attachment_set = FakeAttachmentSet(attachments)


class FakeGallery(FakeImage):
    pass


@pytest.mark.django_db
class TestBlogSerializers:
    def test_blog_serializer_image_url_no_request_returns_none(self):
        obj = SimpleNamespace(image=None)
        serializer = BlogSerializer(context={})

        assert serializer.get_image_url(obj) is None

    def test_blog_serializer_image_url_with_attachment_builds_uri(self):
        request = FakeRequest()
        attachment = FakeAttachment("/media/img1.jpg")
        obj = SimpleNamespace(image=FakeImage([attachment]))
        serializer = BlogSerializer(context={"request": request})

        url = serializer.get_image_url(obj)

        assert url == "ABS:/media/img1.jpg"
        assert request.called_with == ["/media/img1.jpg"]

    def test_blog_detail_serializer_handles_missing_request(self):
        obj = SimpleNamespace(image=None)
        serializer = BlogDetailSerializer(context={})

        assert serializer.get_image_url(obj) is None


@pytest.mark.django_db
class TestProductSerializers:
    def test_product_serializer_gallery_urls_no_request_returns_empty(self):
        obj = SimpleNamespace(gallery=None)
        serializer = ProductSerializer(context={})

        assert serializer.get_gallery_urls(obj) == []

    def test_product_serializer_gallery_urls_with_gallery(self):
        request = FakeRequest()
        attachments = [FakeAttachment("/media/p1.jpg"), FakeAttachment("/media/p2.jpg")]
        obj = SimpleNamespace(gallery=FakeGallery(attachments))
        serializer = ProductSerializer(context={"request": request})

        urls = serializer.get_gallery_urls(obj)

        assert urls == ["ABS:/media/p1.jpg", "ABS:/media/p2.jpg"]

    def test_product_serializer_gallery_urls_with_request_but_no_gallery(self):
        request = FakeRequest()
        obj = SimpleNamespace(gallery=None)
        serializer = ProductSerializer(context={"request": request})

        assert serializer.get_gallery_urls(obj) == []

    def test_product_detail_serializer_no_request_returns_empty(self):
        obj = SimpleNamespace(gallery=None)
        serializer = ProductDetailSerializer(context={})

        assert serializer.get_gallery_urls(obj) == []

    def test_product_detail_serializer_with_gallery_and_request(self):
        request = FakeRequest()
        attachments = [FakeAttachment("/media/d1.jpg"), FakeAttachment("/media/d2.jpg")]
        gallery = FakeGallery(attachments)
        obj = SimpleNamespace(gallery=gallery)
        serializer = ProductDetailSerializer(context={"request": request})

        urls = serializer.get_gallery_urls(obj)

        assert urls == ["ABS:/media/d1.jpg", "ABS:/media/d2.jpg"]

    def test_product_detail_serializer_with_request_but_no_gallery(self):
        request = FakeRequest()
        obj = SimpleNamespace(gallery=None)
        serializer = ProductDetailSerializer(context={"request": request})

        assert serializer.get_gallery_urls(obj) == []

    def test_product_list_serializer_with_gallery_and_request(self):
        request = FakeRequest()
        attachments = [FakeAttachment("/media/l1.jpg")] 
        gallery = FakeGallery(attachments)
        obj = SimpleNamespace(id=1, title="P", category="C", sub_category="S", price=10, gallery=gallery)
        serializer = ProductListSerializer(context={"request": request})

        urls = serializer.get_gallery_urls(obj)

        assert urls == ["ABS:/media/l1.jpg"]

    def test_product_list_serializer_with_request_but_no_gallery(self):
        request = FakeRequest()
        obj = SimpleNamespace(gallery=None)
        serializer = ProductListSerializer(context={"request": request})

        assert serializer.get_gallery_urls(obj) == []
