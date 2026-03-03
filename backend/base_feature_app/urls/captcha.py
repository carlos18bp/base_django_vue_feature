"""URL configuration for Google reCAPTCHA endpoints."""

from django.urls import path

from base_feature_app.views.captcha_views import get_site_key, verify_captcha

urlpatterns = [
    path('site-key/', get_site_key, name='captcha-site-key'),
    path('verify/', verify_captcha, name='captcha-verify'),
]
