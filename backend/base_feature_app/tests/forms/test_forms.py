import pytest
from django import forms

from base_feature_app.forms.blog import BlogForm
from base_feature_app.forms.product import ProductForm
from base_feature_app.forms.user import UserChangeForm, UserCreationForm
from base_feature_app.models import User


class DummyObject:
    def __init__(self):
        self.saved = False

    def save(self):  # pragma: no cover - trivial
        self.saved = True


class FakeAttachmentSet:
    def __init__(self, count):
        self._count = count

    def count(self):  # pragma: no cover - trivial
        return self._count


class FakeImage:
    def __init__(self, count):
        self.attachment_set = FakeAttachmentSet(count)


def test_blog_form_clean_image_allows_zero_or_one_attachment():
    form = BlogForm()
    form.cleaned_data = {"image": FakeImage(0)}
    assert form.clean_image() is not None

    form.cleaned_data = {"image": FakeImage(1)}
    assert form.clean_image() is not None


def test_blog_form_clean_image_raises_when_more_than_one_attachment():
    form = BlogForm()
    form.cleaned_data = {"image": FakeImage(2)}

    with pytest.raises(forms.ValidationError) as exc_info:
        form.clean_image()

    assert exc_info.type is forms.ValidationError
    assert 'Only one file is allowed' in str(exc_info.value)


@pytest.mark.django_db
def test_blog_form_save_assigns_library_when_object_has_no_image(monkeypatch):
    dummy = DummyObject()

    def fake_save(self, commit=False):
        return dummy

    monkeypatch.setattr("django.forms.ModelForm.save", fake_save)

    form = BlogForm()
    obj = form.save(commit=True)

    assert hasattr(obj, "image")
    assert getattr(obj, "saved", False) is True


@pytest.mark.django_db
def test_product_form_save_assigns_gallery_when_missing(monkeypatch):
    dummy = DummyObject()

    def fake_save(self, commit=False):
        return dummy

    monkeypatch.setattr("django.forms.ModelForm.save", fake_save)

    form = ProductForm()
    obj = form.save(commit=True)

    assert hasattr(obj, "gallery")
    assert getattr(obj, "saved", False) is True


@pytest.mark.django_db
def test_user_creation_form_validates_passwords_and_saves_user():
    """Verifies that UserCreationForm validates matching passwords and persists the user."""
    form = UserCreationForm(
        data={
            "email": "form@example.com",
            "first_name": "Form",
            "last_name": "User",
            "phone": "123",
            "role": "customer",
            "password1": "secret123",
            "password2": "secret123",
        }
    )
    assert form.is_valid()

    user = form.save()
    assert isinstance(user, User)
    assert user.check_password("secret123")


@pytest.mark.django_db
def test_user_creation_form_rejects_mismatched_passwords():
    """Verifies that UserCreationForm rejects submissions with non-matching password fields."""
    form = UserCreationForm(
        data={
            "email": "form2@example.com",
            "first_name": "Form",
            "last_name": "User",
            "phone": "123",
            "role": "customer",
            "password1": "secret123",
            "password2": "different",
        }
    )

    assert not form.is_valid()
    assert "Passwords do not match" in str(form.errors)


@pytest.mark.django_db
def test_user_change_form_returns_initial_password():
    user = User.objects.create_user(email="change@example.com", password="pass12345")
    form = UserChangeForm(instance=user)
    form.initial["password"] = "hashed-password"

    assert form.clean_password() == "hashed-password"


def test_forms_package_exports():
    import base_feature_app.forms as forms_module

    assert forms_module.BlogForm is BlogForm
    assert forms_module.ProductForm is ProductForm
    assert forms_module.UserCreationForm is UserCreationForm
    assert forms_module.UserChangeForm is UserChangeForm
