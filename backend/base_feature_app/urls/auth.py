from django.urls import path
from base_feature_app.views.auth import sign_up, sign_in, google_login, validate_token

urlpatterns = [
    path('sign_up/', sign_up, name='sign_up'),
    path('sign_in/', sign_in, name='sign_in'),
    path('google_login/', google_login, name='google_login'),
    path('validate_token/', validate_token, name='validate_token'),
]
