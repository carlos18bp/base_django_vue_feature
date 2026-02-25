# Unified Architecture
## Django REST Backend + SPA Frontend

**Development Standards and Patterns Guide**

This document defines the architecture standard for fullstack projects combining Django REST Framework and a modern SPA frontend. It is intentionally framework-agnostic: the patterns apply to both **Vue 3** and **React**. Framework-specific sections are marked with their profile (`[Vue]` or `[React]`).

**Version 3.1 - February 2026**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
   - 1.1 [Technology Stack](#11-technology-stack)
   - 1.2 [Design Principles](#12-design-principles)
   - 1.3 [Mandatory Reference Documents](#13-mandatory-reference-documents)
   - 1.4 [Testing and Quality Governance](#14-testing-and-quality-governance)
2. [Backend - Django REST Framework](#2-backend---django-rest-framework)
   - 2.1 [Standard Folder Structure](#21-standard-folder-structure)
   - 2.2 [Custom User Model](#22-custom-user-model)
   - 2.3 [Environment Configuration](#23-environment-configuration)
   - 2.4 [Domain Models](#24-domain-models)
   - 2.5 [Custom Permissions](#25-custom-permissions)
   - 2.6 [Serializers](#26-serializers)
   - 2.7 [API Views (@api_view)](#27-api-views-api_view)
   - 2.8 [Module URLs](#28-module-urls)
   - 2.9 [Django Admin and Forms](#29-django-admin-and-forms)
   - 2.10 [Management Commands (Fake Data)](#210-management-commands-fake-data)
   - 2.11 [Services and Integrations](#211-services-and-integrations)
   - 2.12 [Error and Exception Handling](#212-error-and-exception-handling)
   - 2.13 [Documentation Conventions](#213-documentation-conventions)
   - 2.14 [Image Gallery — Optional (media-heavy)](#214-image-gallery--optional-module-profile-media-heavy)
   - 2.15 [Testing (Backend)](#215-testing-backend)
3. [Frontend SPA](#3-frontend-spa)
   - 3.1 [Folder Structure](#31-folder-structure)
   - 3.2 [Configuration (main.js / index.js)](#32-configuration)
   - 3.3 [HTTP Service (Axios + JWT)](#33-http-service-axios--jwt)
   - 3.4 [Global State (Stores)](#34-global-state-stores)
   - 3.5 [Composables / Hooks](#35-composables--hooks)
   - 3.6 [Router and Guards](#36-router-and-guards)
   - 3.7 [Internationalization (i18n)](#37-internationalization-i18n)
   - 3.8 [Global Error Handling](#38-global-error-handling)
   - 3.9 [Testing (Frontend)](#39-testing-frontend)
     - 3.9.3 [E2E Module-based Directory Structure](#393-e2e-module-based-directory-structure)
     - 3.9.4 [E2E Test Infrastructure and Practical Patterns](#394-e2e-test-infrastructure-and-practical-patterns)
       - 3.9.4.8 [Responsive / Multi-Viewport Testing](#3948-responsive--multi-viewport-testing)
     - 3.9.5 [Flow Coverage Methodology — Overview](#395-flow-coverage-methodology--overview)
     - 3.9.6 [Step 1 — Define User Flows](#396-step-1--define-user-flows-flow-definitionsjson)
     - 3.9.7 [Step 2 — Tag Tests with @flow:](#397-step-2--tag-tests-with-flow)
     - 3.9.8 [Step 3 — Flow Tag Constants](#398-step-3--flow-tag-constants-flow-tagsjs)
     - 3.9.9 [Step 4 — Custom Reporter and Artifacts](#399-step-4--custom-reporter-and-artifacts)
     - 3.9.10 [Coverage Goals and Maintenance](#3910-coverage-goals-and-maintenance)
     - 3.9.11 [Execution and Quality](#3911-execution-and-quality)
     - 3.9.12 [User Flow Map](#3912-user-flow-map-user_flow_mapmd)
4. [CI/CD and Pre-commit](#4-cicd-and-pre-commit)
5. [Standard Dependencies](#5-standard-dependencies)
6. [Execution Commands](#6-execution-commands)
7. [New Project Checklist](#7-new-project-checklist)
8. [Annex A: Change Implementation Guide](#annex-a-change-implementation-guide)
9. [Annex B: Test Quick Reference](#annex-b-test-quick-reference)

---

## 1. Architecture Overview

This architecture defines the standard for fullstack projects that combine a robust backend with Django REST Framework and a modern frontend with Vue 3. The goal is to maximize code reuse, maintain consistency across projects, and facilitate onboarding of new developers.

### 1.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend | Django 4.x + DRF | REST API, ORM, Admin |
| Authentication | SimpleJWT | JWT tokens with refresh |
| Database | MySQL | Data persistence |
| Cache | Redis (optional) | Sessions, query caching |
| Frontend | Vue 3 + Vite | SPA with Composition API |
| State | Pinia + Persistence | Reactive stores |
| Routing | Vue Router 4 | SPA navigation |
| HTTP Client | Axios | API requests |
| Styles | TailwindCSS | CSS utilities |
| i18n | Vue I18n | Multi-language |

### 1.2 Design Principles

- **Layer separation:** Models, Serializers, Views, URLs clearly separated.
- **Modularity:** Each domain in its own module (separate files).
- **Reusability:** Generic HTTP services, stores, composables and components.
- **Consistency:** Same API response patterns and store structure.
- **Security:** JWT by default, CORS configured, credentials in environment variables.
- **Documentation in English:** All code comments must be in English and use DocStrings.
- **Business logic intact:** Do not alter existing behavior without explicit instruction. See `GLOBAL_RULES_GUIDELINES.md` §Priority Zero.

### 1.3 Mandatory Reference Documents

These documents are the project's sources of truth. This standard **does not duplicate** their content — it references it. In case of conflict, the specialized document prevails.

| Document | Purpose | When to consult |
|----------|---------|-----------------|
| `GLOBAL_RULES_GUIDELINES.md` | Operational rules: commits, PRs, logging, security, migrations, code review | Before any change |
| `TESTING_QUALITY_STANDARDS.md` | Test quality criteria: mandatory rules, examples, anti-patterns, exceptions | Before writing or modifying tests |
| `TEST_QUALITY_GATE_REFERENCE.md` | Technical quality gate reference: CLI, architecture, modes, report schema | When running or configuring the gate |
| `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` | Backend & frontend unit test coverage reports: custom reporters, configuration, output format, quick-start checklist | When setting up or maintaining unit/component coverage reports |
| `E2E_FLOW_COVERAGE_REPORT_STANDARD.md` | E2E Flow Coverage Report: reporter source, flow definitions schema, tagging, JSON output, setup checklist | When setting up or maintaining E2E flow coverage |
| `USER_FLOW_MAP.md` | User Flow Map: human-readable narrative of all E2E user flows with steps, branches, variations, and coverage references | When adding, modifying, or reviewing user flows and E2E test coverage |

> **Path note:** All documents live at the repository root or in `docs/`. If the project uses a `docs/` folder, references must be updated consistently across all files.

**Precedence rule:**
1. If there is a conflict about test quality → `TESTING_QUALITY_STANDARDS.md` prevails
2. If there is a conflict about the quality gate → `TEST_QUALITY_GATE_REFERENCE.md` prevails
3. If there is a conflict about backend/frontend unit coverage reports → `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` prevails
4. If there is a conflict about E2E flow coverage → `E2E_FLOW_COVERAGE_REPORT_STANDARD.md` prevails
5. If there is a conflict about process rules → `GLOBAL_RULES_GUIDELINES.md` prevails

### 1.4 Testing and Quality Governance

#### 1.4.1 Quality Gate Tooling

The automated quality gate lives in `scripts/` and is executed from the repository root:

```
scripts/
├── test_quality_gate.py        # CLI entry point
└── quality/
    ├── base.py                 # Shared base analyzer
    ├── backend_analyzer.py     # Python/pytest rules
    ├── frontend_unit_analyzer.py  # JS/Jest rules
    ├── frontend_e2e_analyzer.py   # Playwright rules
    ├── js_ast_bridge.py        # Babel parser bridge
    ├── external_lint.py        # Ruff/ESLint integration
    └── report.py               # Report generation
```

Common execution modes:

```bash
# Backend suite — specific files
python3 scripts/test_quality_gate.py --suite backend \
  --include-file backend/core_app/tests/views/test_order.py

# Frontend unit suite
python3 scripts/test_quality_gate.py --suite frontend-unit \
  --include-file frontend/test/stores/orderStore.test.js

# E2E suite
python3 scripts/test_quality_gate.py --suite frontend-e2e \
  --include-file frontend/e2e/flows/checkout.spec.js

# With external Ruff lint enabled
python3 scripts/test_quality_gate.py --suite backend --external-lint run \
  --include-file backend/core_app/tests/views/test_order.py
```

Consult `TEST_QUALITY_GATE_REFERENCE.md` for full CLI options, report structure and exceptions.

---

## 2. Backend - Django REST Framework

### 2.1 Standard Folder Structure

```
backend/
├── core_project/               # Django project
│   ├── settings.py             # Base configuration
│   ├── settings_dev.py         # Development overrides
│   ├── settings_prod.py        # Production overrides
│   ├── urls.py                 # Root URLs
│   └── wsgi.py / asgi.py       # Entry points
├── core_app/                   # Main domain app
│   ├── models/                 # Models per entity
│   │   ├── __init__.py
│   │   ├── user.py             # ALWAYS first (AUTH_USER_MODEL)
│   │   ├── product.py
│   │   └── order.py
│   ├── serializers/            # Serializers per module
│   │   ├── __init__.py
│   │   └── product_serializers.py
│   ├── views/                  # API views per module
│   │   ├── __init__.py
│   │   └── product_views.py
│   ├── urls/                   # URLs per module (large projects)
│   │   ├── __init__.py
│   │   └── product_urls.py
│   │   # Alternative for small projects: a single urls.py
│   ├── forms/                  # ModelForms for the Admin
│   │   └── product_form.py
│   ├── services/               # Business logic / external integrations
│   │   └── email_service.py
│   ├── permissions/            # Custom permissions (if applicable)
│   │   └── object_permissions.py
│   ├── management/
│   │   └── commands/           # Django commands (fake data, etc.)
│   ├── tests/                  # Test suite per domain
│   ├── admin.py                # Admin configuration
│   └── utils/                  # Shared helpers
├── django_attachments/         # Gallery sub-project (optional)
├── media/                      # Uploaded files
├── static/                     # Static files
├── pytest.ini                  # pytest configuration
└── requirements.txt
```

> **Note:** Each model, serializer, view and URL must be in its own file. URLs can live in a single `urls.py` for small projects or in a `urls/` directory for large projects. Define `AUTH_USER_MODEL` **before the first migration**.

---

### 2.2 Custom User Model

**Critical rule:** Define `AUTH_USER_MODEL` before running `python manage.py migrate` for the first time. Changing it afterwards requires manual migration and is expensive.

```python
# core_app/models/user.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    Extending from the start allows adding fields later without
    complex migrations. Add project-specific fields here.
    """

    # Example custom fields
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return self.email
```

```python
# core_project/settings.py
AUTH_USER_MODEL = 'core_app.User'  # Must be set before first migration
```

```python
# core_app/models/__init__.py
from .user import User
from .product import Product
from .order import Order
```

---

### 2.3 Environment Configuration

Separating settings by environment avoids configuration errors in production and simplifies local development.

#### 2.3.1 Settings Structure

```
core_project/
├── settings.py         # Base configuration (shared)
├── settings_dev.py     # Overrides: DEBUG=True, SQLite, console email
└── settings_prod.py    # Overrides: DEBUG=False, MySQL, real email, S3
```

```python
# core_project/settings.py  (base)
import os
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

def get_env(var_name, default=None, required=False):
    """
    Retrieve environment variable or raise if required and missing.
    """
    value = os.getenv(var_name, default)
    if required and value is None:
        raise ImproperlyConfigured(f"Missing required env variable: {var_name}")
    return value

SECRET_KEY = get_env('DJANGO_SECRET_KEY', required=True)
DEBUG = get_env('DJANGO_DEBUG', 'False') == 'True'
ALLOWED_HOSTS = get_env('DJANGO_ALLOWED_HOSTS', 'localhost').split(',')

AUTH_USER_MODEL = 'core_app.User'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party (required)
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Third-party (optional)
    'easy_thumbnails',
    'django_cleanup.apps.CleanupConfig',
    # Project apps
    'core_app',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CORS_ALLOWED_ORIGINS = get_env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization', 'content-type',
    'origin', 'x-csrftoken', 'x-requested-with',
    'x-currency', 'accept-language',
]
```

```python
# core_project/settings_dev.py
from .settings import *  # noqa: F401, F403

DEBUG = True
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

```python
# core_project/settings_prod.py
from .settings import *  # noqa: F401, F403

DEBUG = False
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': get_env('DB_NAME', required=True),
        'USER': get_env('DB_USER', required=True),
        'PASSWORD': get_env('DB_PASSWORD', required=True),
        'HOST': get_env('DB_HOST', 'localhost'),
        'PORT': get_env('DB_PORT', '3306'),
    }
}
```

#### 2.3.2 Environment Variables (.env.example)

```bash
# .env.example — commit this, never the real .env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Database (production)
DB_NAME=mydb
DB_USER=myuser
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

> **Naming convention:** Use `DJANGO_` prefix for core Django variables. Use the service name as prefix for integrations (`STRIPE_KEY`, `SENDGRID_KEY`, `AWS_ACCESS_KEY_ID`). Document all variables in `README.md`.

---

### 2.4 Domain Models

Models represent domain entities. Each model lives in its own file inside `models/`. Use computed properties for derived logic.

```python
# core_app/models/product.py
import os
from django.db import models

class Product(models.Model):
    """
    Product model representing items available for sale.
    
    Attributes:
        name_en: Product name in English.
        name_es: Product name in Spanish.
        price: Product price in default currency.
        stock: Available quantity in inventory.
        is_active: Whether the product is visible to customers.
    """
    
    # Bilingual fields (standard pattern)
    name_en = models.CharField(max_length=255)
    name_es = models.CharField(max_length=255)
    description_en = models.TextField(blank=True)
    description_es = models.TextField(blank=True)

    # Business fields
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    # File fields
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    # Timestamps (always include)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name_en
    
    @property
    def is_in_stock(self):
        """Check if product has available inventory."""
        return self.stock > 0
    
    def delete(self, *args, **kwargs):
        """Override delete to clean up associated files."""
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)
        super().delete(*args, **kwargs)
```

---

### 2.5 Custom Permissions

Views use `AllowAny`, `IsAuthenticated` and `IsAdminUser` for most cases. For more granular access logic (e.g., object owner, customer role), create custom permissions inheriting from `BasePermission`.

```python
# core_app/permissions/object_permissions.py
from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Allow access only to the owner of the object.

    Expects the model to have a `user` FK field pointing to the request user.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsCustomer(BasePermission):
    """
    Allow access only to authenticated non-staff users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and not request.user.is_staff
        )
```

Usage in views:

```python
from ..permissions.object_permissions import IsOwner

@api_view(['DELETE'])
@permission_classes([IsOwner])
def delete_review(request, review_id):
    """Delete a review — only the owner can delete it."""
    review = get_object_or_404(Review, id=review_id)
    check_object_permissions(request, review)  # Triggers has_object_permission
    review.delete()
    return Response({'message': 'Review deleted'}, status=status.HTTP_200_OK)
```

> Document permissions in `core_app/permissions/`. For small projects with one or two permissions, they can live directly in `views/` or in a `permissions.py` file at the app level.

---

### 2.6 Serializers

Create specific serializers per use case: List (lightweight), Detail (complete), CreateUpdate (with validations). This optimizes performance and clarifies the API.

```python
# core_app/serializers/product_serializers.py
from rest_framework import serializers
from ..models import Product

class ProductListSerializer(serializers.ModelSerializer):
    '''Lightweight serializer for listings'''
    
    class Meta:
        model = Product
        fields = ['id', 'name_en', 'name_es', 'price', 'is_in_stock', 'image']


class ProductDetailSerializer(serializers.ModelSerializer):
    '''Full serializer for detail'''
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    '''Serializer for create/update with validations'''
    
    class Meta:
        model = Product
        fields = ['name_en', 'name_es', 'description_en', 'description_es',
                  'price', 'stock', 'is_active', 'image']
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than 0')
        return value
```

---

### 2.7 API Views (@api_view)

The standard uses function-based views with `@api_view`. Each endpoint has its own function with explicit permissions. Responses follow a consistent format with descriptive keys (e.g., 'products', 'message', 'error').

```python
# core_app/views/product_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from ..models import Product
from ..serializers.product_serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_products(request):
    '''List all active products'''
    products = Product.objects.filter(is_active=True)
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response({'products': serializer.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def retrieve_product(request, product_id):
    '''Retrieve product detail'''
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProductDetailSerializer(product, context={'request': request})
    return Response({'product': serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_product(request):
    '''Create a new product (admin only)'''
    serializer = ProductCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.save()
        return Response({
            'message': 'Product created successfully',
            'product': ProductDetailSerializer(product).data
        }, status=status.HTTP_201_CREATED)
    return Response({'error': 'Invalid data', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def update_product(request, product_id):
    '''Update an existing product'''
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    partial = request.method == 'PATCH'
    serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=partial)
    if serializer.is_valid():
        product = serializer.save()
        return Response({
            'message': 'Product updated successfully',
            'product': ProductDetailSerializer(product).data
        }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid data', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product(request, product_id):
    '''Delete a product'''
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    product.delete()
    return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)
```

---

### 2.8 Module URLs

URLs are organized by functional module. Each module has its own URL file included in the main urlpatterns.

```python
# core_app/urls/product_urls.py
from django.urls import path
from ..views.product_views import (
    list_products, retrieve_product, create_product, update_product, delete_product
)

urlpatterns = [
    path('', list_products, name='list-products'),
    path('<int:product_id>/', retrieve_product, name='retrieve-product'),
    path('create/', create_product, name='create-product'),
    path('<int:product_id>/update/', update_product, name='update-product'),
    path('<int:product_id>/delete/', delete_product, name='delete-product'),
]
```

```python
# core_project/urls.py
from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core_app.urls.auth_urls')),
    path('api/products/', include('core_app.urls.product_urls')),
    path('api/orders/', include('core_app.urls.order_urls')),
    # ... more modules
]
```

#### Endpoint Conventions

| Action | Method | URL | Name |
|--------|--------|-----|------|
| List | GET | /api/entities/ | list-entities |
| Detail | GET | /api/entities/{id}/ | retrieve-entity |
| Create | POST | /api/entities/create/ | create-entity |
| Update | PUT/PATCH | /api/entities/{id}/update/ | update-entity |
| Delete | DELETE | /api/entities/{id}/delete/ | delete-entity |

---

### 2.9 Django Admin and Forms

Configure an explicit ModelAdmin for each model with `list_display`, `search_fields`, `list_filter`, etc. For large projects, create a custom AdminSite that groups models by functional sections.

```python
# core_app/admin.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Product, Order, User


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'price', 'stock', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name_en', 'name_es', 'description_en')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_active', 'stock')
    ordering = ('-created_at',)


# Custom AdminSite (for large projects)
class ProjectAdminSite(admin.AdminSite):
    site_header = 'Administration Panel'
    site_title = 'Admin'
    index_title = 'Control Panel'

    def get_app_list(self, request):
        app_dict = self._build_app_dict(request)
        # Organize by logical sections
        return [
            {'name': _('Users'), 'models': [...]},
            {'name': _('Products'), 'models': [...]},
            {'name': _('Orders'), 'models': [...]},
        ]

admin_site = ProjectAdminSite(name='project_admin')
```

---

### 2.10 Management Commands (Fake Data)

Management commands allow populating and cleaning test data in a controlled way. A SEPARATE FILE must be created for each entity/model, following the single responsibility principle. The master command orchestrates calls in the correct order respecting model dependencies.

> **IMPORTANT RULE:** Each model must have its own command file to generate fake data. This allows running individual commands during development and simplifies maintenance. Commands must respect relationships/dependencies between models.

#### 2.10.1 Command File Structure

```
core_app/
└── management/
    └── commands/
        ├── create_fake_data.py       # Master command (orchestrator)
        ├── delete_fake_data.py       # Data cleanup
        ├── create_fake_users.py      # Users (no dependencies)
        ├── create_fake_categories.py # Categories (no dependencies)
        ├── create_fake_products.py   # Products (depends on Category)
        ├── create_fake_carts.py      # Carts (depends on User, Product)
        ├── create_fake_orders.py     # Orders (depends on User, Product)
        └── create_fake_reviews.py    # Reviews (depends on User, Product)
```

#### 2.10.2 Master Command (Orchestrator)

```python
# core_app/management/commands/create_fake_data.py
"""
Master command to orchestrate fake data creation for the entire system.

This command calls individual entity commands in the correct order,
respecting model dependencies (e.g., Products need Categories first).
"""
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create fake data for all entities in the correct order'
    
    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=20,
                            help='Number of users to create')
        parser.add_argument('--categories', type=int, default=10,
                            help='Number of categories to create')
        parser.add_argument('--products', type=int, default=50,
                            help='Number of products to create')
        parser.add_argument('--orders', type=int, default=30,
                            help='Number of orders to create')
        parser.add_argument('--reviews', type=int, default=100,
                            help='Number of reviews to create')
    
    def handle(self, *args, **options):
        self.stdout.write('🚀 Starting fake data creation...\n')
        
        # Order matters! Respect dependencies
        # 1. Independent entities first
        self.stdout.write('Creating users...')
        call_command('create_fake_users', '--num', options['users'])
        
        self.stdout.write('Creating categories...')
        call_command('create_fake_categories', '--num', options['categories'])
        
        # 2. Entities with single dependency
        self.stdout.write('Creating products...')
        call_command('create_fake_products', '--num', options['products'])
        
        # 3. Entities with multiple dependencies
        self.stdout.write('Creating orders...')
        call_command('create_fake_orders', '--num', options['orders'])
        
        self.stdout.write('Creating reviews...')
        call_command('create_fake_reviews', '--num', options['reviews'])
        
        self.stdout.write(self.style.SUCCESS(
            '\n✅ Fake data created successfully!'
        ))
```

#### 2.10.3 Per-Entity Command — Full Example (Products)

This is a full example of how to create a fake data command for an entity with dependencies (Product depends on Category). Includes relationship handling, image files and validations.

```python
# core_app/management/commands/create_fake_products.py
"""
Command to generate fake product data for development and testing.

This command creates realistic product records with:
- Bilingual content (English/Spanish)
- Random pricing and stock levels
- Association with existing categories
- Placeholder images

Dependencies:
    - Category model must have existing records

Usage:
    python manage.py create_fake_products --num 50
    python manage.py create_fake_products --num 100 --with-images
"""
import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from faker import Faker

from core_app.models import Product, Category


class Command(BaseCommand):
    help = 'Create fake products with realistic data'
    
    def __init__(self):
        super().__init__()
        self.fake_en = Faker('en_US')
        self.fake_es = Faker('es_ES')
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--num',
            type=int,
            default=50,
            help='Number of products to create (default: 50)'
        )
        parser.add_argument(
            '--with-images',
            action='store_true',
            help='Generate placeholder images for products'
        )
    
    def handle(self, *args, **options):
        num_products = options['num']
        with_images = options['with_images']
        
        # Validate dependencies exist
        categories = list(Category.objects.all())
        if not categories:
            self.stdout.write(self.style.ERROR(
                'No categories found. Run create_fake_categories first.'
            ))
            return
        
        self.stdout.write(f'Creating {num_products} fake products...')
        
        created_count = 0
        for i in range(num_products):
            product = self._create_product(categories, with_images)
            if product:
                created_count += 1
                if created_count % 10 == 0:
                    self.stdout.write(f'  Created {created_count} products...')
        
        self.stdout.write(self.style.SUCCESS(
            f'✅ Successfully created {created_count} products'
        ))
    
    def _create_product(self, categories, with_images=False):
        """
        Create a single product with randomized data.
        
        Args:
            categories: List of available Category instances.
            with_images: Whether to generate placeholder images.
        
        Returns:
            Product: The created product instance.
        """
        # Generate bilingual product name
        product_type = random.choice([
            'Laptop', 'Phone', 'Tablet', 'Headphones', 'Camera',
            'Watch', 'Speaker', 'Monitor', 'Keyboard', 'Mouse'
        ])
        brand = self.fake_en.company()
        name_en = f'{brand} {product_type} {self.fake_en.word().title()}'
        name_es = f'{product_type} {brand} {self.fake_es.word().title()}'
        
        # Generate descriptions
        desc_en = self.fake_en.paragraph(nb_sentences=3)
        desc_es = self.fake_es.paragraph(nb_sentences=3)
        
        # Generate realistic pricing
        base_price = random.choice([29.99, 49.99, 99.99, 149.99, 299.99, 499.99])
        price = Decimal(str(base_price)) + Decimal(random.randint(0, 50))
        
        # Create product
        product = Product.objects.create(
            name_en=name_en,
            name_es=name_es,
            description_en=desc_en,
            description_es=desc_es,
            price=price,
            stock=random.randint(0, 100),
            is_active=random.random() > 0.1,  # 90% active
            category=random.choice(categories),
        )
        
        # Add placeholder image if requested
        if with_images:
            self._add_placeholder_image(product)
        
        return product
    
    def _add_placeholder_image(self, product):
        """Generate and attach a placeholder image to the product."""
        # Simple SVG placeholder
        svg_content = f'''
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            <rect width="200" height="200" fill="#f0f0f0"/>
            <text x="100" y="100" text-anchor="middle" fill="#999">
                {product.id}
            </text>
        </svg>
        '''
        product.image.save(
            f'product_{product.id}.svg',
            ContentFile(svg_content.encode()),
            save=True
        )
```

#### 2.10.4 Command for Entity with Multiple Dependencies (Orders)

```python
# core_app/management/commands/create_fake_orders.py
"""
Command to generate fake order data with related items.

Orders have multiple dependencies:
- User (customer who placed the order)
- Product (items in the order)

This command creates orders with realistic:
- Order items (1-5 products per order)
- Quantities and calculated totals
- Status progression
- Timestamps

Dependencies:
    - User model must have existing records
    - Product model must have existing records
"""
import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

from core_app.models import User, Product, Order, OrderItem


class Command(BaseCommand):
    help = 'Create fake orders with order items'
    
    def __init__(self):
        super().__init__()
        self.fake = Faker()
    
    def add_arguments(self, parser):
        parser.add_argument('--num', type=int, default=30)
    
    def handle(self, *args, **options):
        # Validate dependencies
        users = list(User.objects.filter(is_staff=False))
        products = list(Product.objects.filter(is_active=True))
        
        if not users:
            self.stdout.write(self.style.ERROR(
                'No users found. Run create_fake_users first.'
            ))
            return
        
        if not products:
            self.stdout.write(self.style.ERROR(
                'No products found. Run create_fake_products first.'
            ))
            return
        
        num_orders = options['num']
        self.stdout.write(f'Creating {num_orders} fake orders...')
        
        statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        
        for i in range(num_orders):
            # Create order
            order = Order.objects.create(
                user=random.choice(users),
                status=random.choice(statuses),
                shipping_address=self.fake.address(),
                created_at=self.fake.date_time_between(
                    start_date='-90d',
                    end_date='now',
                    tzinfo=timezone.get_current_timezone()
                ),
            )
            
            # Add 1-5 random items
            num_items = random.randint(1, 5)
            order_products = random.sample(products, min(num_items, len(products)))
            
            total = Decimal('0.00')
            for product in order_products:
                quantity = random.randint(1, 3)
                item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    unit_price=product.price,
                )
                total += item.unit_price * quantity
            
            # Update order total
            order.total = total
            order.save()
        
        self.stdout.write(self.style.SUCCESS(
            f'✅ Created {num_orders} orders with items'
        ))
```

#### 2.10.5 Cleanup Command (Delete)

```python
# core_app/management/commands/delete_fake_data.py
"""
Command to safely delete all fake/test data from the database.

IMPORTANT: This command respects the reverse order of dependencies
to avoid foreign key constraint violations.

Protected records (not deleted):
- Superusers
- Users with specific protected emails
- System configuration records
"""
from django.core.management.base import BaseCommand
from core_app.models import (
    User, Category, Product, Order, OrderItem, Review, Cart, CartItem
)


class Command(BaseCommand):
    help = 'Delete all fake data (requires --confirm flag)'
    
    # Emails that should never be deleted
    PROTECTED_EMAILS = {
        'admin@example.com',
        'superadmin@company.com',
    }
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Required flag to confirm deletion'
        )
    
    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(self.style.WARNING(
                '⚠️ This will DELETE ALL test data!\n'
                'Run with --confirm to proceed:\n'
                '  python manage.py delete_fake_data --confirm'
            ))
            return
        
        self.stdout.write('🗑️ Deleting fake data...\n')
        
        # Delete in reverse dependency order
        # 1. Entities with most dependencies first
        self._delete_model(OrderItem, 'order items')
        self._delete_model(Order, 'orders')
        self._delete_model(CartItem, 'cart items')
        self._delete_model(Cart, 'carts')
        self._delete_model(Review, 'reviews')
        
        # 2. Entities with single dependency
        self._delete_model(Product, 'products')
        
        # 3. Independent entities
        self._delete_model(Category, 'categories')
        
        # 4. Users (with protection)
        deleted_users = User.objects.exclude(
            email__in=self.PROTECTED_EMAILS
        ).exclude(
            is_superuser=True
        ).delete()
        self.stdout.write(f'  Deleted {deleted_users[0]} users')
        
        self.stdout.write(self.style.SUCCESS('\n✅ All fake data deleted'))
    
    def _delete_model(self, model, name):
        """Helper to delete all records of a model."""
        count = model.objects.count()
        model.objects.all().delete()
        self.stdout.write(f'  Deleted {count} {name}')
```

#### 2.10.6 Dependency Diagram

Understanding and respecting model dependencies is crucial when creating and deleting data:

**CREATION order (from fewest to most dependencies):**

```
[User] ──────────────────────┐
                             │
[Category] ───────┐          │
                  │          │
                  ▼          │
            [Product] ───────┤
                  │          │
                  ▼          ▼
            [Review] ─── [User]
            [Order] ──── [User]
                  │
                  ▼
            [OrderItem] ─── [Product]
```

**DELETION order (reverse — from most to fewest dependencies):**

1. OrderItem (depends on Order, Product)
2. Order (depends on User)
3. Review (depends on User, Product)
4. CartItem (depends on Cart, Product)
5. Cart (depends on User)
6. Product (depends on Category)
7. Category (independent)
8. User (independent, protect admins)

---

### 2.11 Services and Integrations

Complex business logic and external integrations go in `services/`. This keeps views clean and simplifies unit testing.

```python
# core_app/services/email_service.py
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


class EmailService:
    """
    Service class for handling email notifications.
    
    Provides static methods for sending various types of emails
    using Django's email backend with HTML templates.
    """
    
    @staticmethod
    def send_welcome_email(user):
        """
        Send a welcome email to a newly registered user.
        
        Args:
            user: User instance with email attribute.
        
        Returns:
            int: Number of successfully delivered messages (0 or 1).
        """
        subject = 'Welcome to our platform'
        html_message = render_to_string('emails/welcome.html', {'user': user})
        
        return send_mail(
            subject=subject,
            message='',  # Plain text fallback
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    
    @staticmethod
    def send_order_confirmation(order):
        """
        Send order confirmation email to customer.
        
        Args:
            order: Order instance with customer and items data.
        """
        # Implementation follows same pattern...
        pass


# Usage in views:
# from ..services.email_service import EmailService
# EmailService.send_welcome_email(user)

```

---

### 2.12 Error and Exception Handling

#### 2.12.1 Custom Exceptions

Define domain exceptions in `core_app/exceptions.py` for errors with clear business semantics:

```python
# core_app/exceptions.py
from rest_framework.exceptions import APIException
from rest_framework import status


class ResourceNotFoundException(APIException):
    """Raised when a requested resource does not exist."""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found.'
    default_code = 'not_found'


class BusinessRuleViolationException(APIException):
    """Raised when an operation violates a business rule."""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = 'Business rule violation.'
    default_code = 'business_rule_violation'
```

#### 2.12.2 Standard Error Response Format

All error responses follow the same format to simplify frontend error handling:

```python
# Validation errors (400)
{'error': 'Invalid data', 'details': {'field': ['error message']}}

# Resource not found (404)
{'error': 'Not found'}

# Business error (422)
{'error': 'Cannot checkout with empty cart'}

# Server error (500) — do not expose internal details
{'error': 'Internal server error'}
```

#### 2.12.3 Global Handler (optional)

To standardize all project error responses, register a custom handler in `settings.py`:

```python
# core_app/views/error_handlers.py
from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler that normalizes error response format.

    Wraps all error responses under a consistent {'error': ..., 'details': ...} shape.
    """
    response = exception_handler(exc, context)

    if response is not None and isinstance(response.data, dict):
        if 'detail' in response.data:
            response.data = {'error': str(response.data['detail'])}

    return response
```

```python
# core_project/settings.py
REST_FRAMEWORK = {
    # ...existing config...
    'EXCEPTION_HANDLER': 'core_app.views.error_handlers.custom_exception_handler',
}
```

---

### 2.13 Code Documentation Conventions

> **MANDATORY RULE:** All comments and documentation inside code must be written in **ENGLISH** and must use **DocString** format for Python. This convention applies to both backend (Python/Django) and frontend (JavaScript/Vue).

#### 2.13.1 Python DocStrings (Backend)

```python
# CORRECT - DocString in English
class OrderService:
    """
    Service class for handling order operations.
    
    This service manages order creation, updates, and integrations
    with external payment providers.
    
    Attributes:
        payment_gateway: Instance of the payment provider client.
        notification_service: Service for sending order notifications.
    
    Example:
        >>> service = OrderService()
        >>> order = service.create_order(user_id=1, items=[...])
    """
    
    def calculate_total(self, items):
        """
        Calculate the total price for a list of order items.
        
        Args:
            items: List of OrderItem objects with price and quantity.
        
        Returns:
            Decimal: The total price including taxes.
        
        Raises:
            ValueError: If items list is empty.
        """
        if not items:
            raise ValueError("Items list cannot be empty")
        return sum(item.price * item.quantity for item in items)


# INCORRECT - Comments in Spanish
class ServicioOrdenes:  # NO: name in Spanish
    # Este servicio maneja las órdenes  # NO: comment in Spanish
    def calcular_total(self, items):
        # Calcular el total  # NO
        pass
```

#### 2.13.2 JavaScript/Vue Comments (Frontend)

```javascript
// CORRECT - JSDoc in English
/**
 * Fetches products from the API with optional filters.
 *
 * @param {Object} filters - Filter options for the query
 * @param {string} filters.category - Product category to filter by
 * @param {number} filters.minPrice - Minimum price threshold
 * @param {number} filters.maxPrice - Maximum price threshold
 * @returns {Promise<Array>} Array of product objects
 * @throws {Error} If the API request fails
 *
 * @example
 * const products = await fetchProducts({ category: 'electronics' });
 */
async function fetchProducts(filters = {}) {
    // Build query parameters from filters
    const params = new URLSearchParams(filters);
    
    // Make API request
    const response = await get_request(`products/?${params}`);
    
    // Return parsed data
    return response.data.products;
}

// INCORRECT
async function obtenerProductos(filtros) {  // NO: name in Spanish
    // Obtener los productos del servidor  // NO: comment in Spanish
    const respuesta = await get_request('products/');
    return respuesta.data;
}
```

#### 2.13.3 Conventions Summary

- **Language:** Everything in ENGLISH (comments, DocStrings, variable/function/class names).
- **Python format:** Use triple-quoted DocStrings. Include description, Args, Returns, Raises.
- **JavaScript format:** Use JSDoc with `/** */`. Include `@param`, `@returns`, `@throws`, `@example`.
- **Classes:** Document purpose, main attributes and usage example.
- **Functions:** Document what it does, parameters, return value and exceptions.
- **Complex code:** Add inline comments explaining non-obvious logic.
- **TODO/FIXME:** Use standard format: `// TODO: description` or `# TODO: description`.

---

### 2.14 Image Gallery — Optional Module `[profile: media-heavy]`

`django_attachments` is an **optional** module for projects that require managed image galleries. Enable only when the project domain involves multiple images per entity with ordering, thumbnails and automatic deletion. It lives as a vendored sub-project in `backend/django_attachments/`.

> For full documentation (configuration, serializers, admin forms), see the sub-project's own README at `backend/django_attachments/`.

#### 2.14.1 Mandatory Integration Rules

```
backend/
├── django_attachments/       # Vendored sub-project
│   ├── fields.py             # GalleryField, LibraryField
│   ├── models.py             # Library, Attachment
│   ├── admin.py              # AttachmentsAdminMixin
│   └── migrations/
├── core_app/
└── core_project/
```

**Integration checklist:**

| Step | What to do |
|------|------------|
| settings.py | Add `easy_thumbnails`, `django_cleanup.apps.CleanupConfig`, `django_attachments` to `INSTALLED_APPS` |
| settings.py | Configure `MEDIA_URL`, `MEDIA_ROOT` and `THUMBNAIL_ALIASES` |
| Model | Use `GalleryField` for image galleries |
| Model | **ALWAYS** implement `delete()` to clean up galleries — without this, files become orphans |
| Form (Admin) | Create `ModelForm` that auto-initializes the Library in `__init__` |
| Admin | Inherit from `AttachmentsAdminMixin`, override `delete_queryset` with a loop calling `obj.delete()` |
| Serializer | Use `SerializerMethodField` to extract attachment URLs |
| URLs | No manual configuration required — admin registers them automatically |

**After configuring, run migrations:**

```bash
python manage.py makemigrations
python manage.py migrate django_attachments
python manage.py migrate
```

#### 2.14.2 Minimal Model Pattern

```python
# core_app/models/product.py
from django.db import models
from django_attachments.fields import GalleryField
from django_attachments.models import Library


class Product(models.Model):
    """Product entity with image gallery support."""

    name = models.CharField(max_length=255)
    gallery = GalleryField(related_name='products_gallery',
                           on_delete=models.CASCADE, null=True, blank=True)

    def delete(self, *args, **kwargs):
        """
        Override delete to clean up associated gallery files.

        CRITICAL: Without this, media files become orphans on deletion.
        """
        try:
            if self.gallery:
                self.gallery.delete()
        except Library.DoesNotExist:
            pass
        super().delete(*args, **kwargs)
```

**For models with multiple galleries:** repeat the same `GalleryField` + `delete()` pattern for each gallery field.

---

### 2.15 Testing (Backend)

Backend tests are part of the application design, not a later phase. The base standard uses `pytest` + `pytest-django` and organizes tests by domain to maintain clarity and traceability.

#### 2.15.1 Objective and scope

- Verify observable behavior of models, serializers, services, views and tasks.
- Keep tests atomic, deterministic and isolated.
- Avoid coupling to implementation details when a more stable observable outcome exists.

#### 2.15.2 Test hierarchy

```
backend/
└── core_app/
    └── tests/
        ├── conftest.py        # Shared pytest fixtures (api_client, user, product...)
        ├── factories.py       # Factory helpers for models and complex payloads
        ├── contracts/         # OpenAPI/schema contract tests
        ├── forms/             # Admin form validation tests
        ├── integration/       # Cross-layer integration tests
        ├── management/        # Management command tests
        ├── models/            # Domain rules in models
        ├── serializers/       # DRF transformation and validation
        ├── services/          # Business logic in services (if services/ exists)
        ├── utils/             # Pure utility tests
        ├── views/             # REST endpoint tests
        └── test_admin.py      # Django admin tests (standalone file)
```

**When to use each layer:**

| Directory | What to test |
|-----------|-------------|
| `contracts/` | Validate that the generated OpenAPI schema (`schema.py`) matches the real implementation |
| `forms/` | Admin ModelForm validation, custom `clean()` and `save()` |
| `integration/` | Flows crossing two or more layers (e.g., view → service → model) |
| `management/` | Management commands (`create_fake_data`, `delete_fake_data`) |
| `test_admin.py` | Admin access, list/change/delete views, admin permissions |

#### 2.15.3 conftest.py and factories.py

```python
# core_app/tests/conftest.py
import pytest
from rest_framework.test import APIClient
from .factories import UserFactory, ProductFactory


@pytest.fixture
def api_client():
    """Unauthenticated DRF API client."""
    return APIClient()


@pytest.fixture
def user(db):
    """Regular authenticated user."""
    return UserFactory()


@pytest.fixture
def admin_user(db):
    """Staff user for admin-gated endpoints."""
    return UserFactory(is_staff=True)


@pytest.fixture
def product(db):
    """Active product with default values."""
    return ProductFactory()
```

```python
# core_app/tests/factories.py
from django.contrib.auth import get_user_model
from core_app.models import Product

User = get_user_model()


class UserFactory:
    """Factory for User model with sensible defaults."""

    @staticmethod
    def __call__(is_staff=False, **kwargs):
        """Create and return a User instance."""
        defaults = {
            'username': f'user_{User.objects.count()}',
            'email': f'user{User.objects.count()}@example.com',
            'password': 'testpass123',
            'is_staff': is_staff,
        }
        defaults.update(kwargs)
        return User.objects.create_user(**defaults)


class ProductFactory:
    """Factory for Product model."""

    @staticmethod
    def __call__(**kwargs):
        """Create and return a Product instance."""
        from decimal import Decimal
        defaults = {'name': 'Test Product', 'price': Decimal('9.99'), 'is_active': True}
        defaults.update(kwargs)
        return Product.objects.create(**defaults)


def product_payload(**overrides):
    """Return a valid product creation payload with optional field overrides."""
    base = {'name': 'Test Product', 'price': '9.99', 'stock': 10, 'is_active': True}
    return {**base, **overrides}
```

> For projects with more complex models, use `factory-boy` (`factory.django.DjangoModelFactory`). Keep factories in a single `factories.py` at the `tests/` level to avoid dispersal.

#### 2.15.4 Execution and quality

> **Full rules, examples and anti-patterns:** see `TESTING_QUALITY_STANDARDS.md`.
> **Quality gate CLI options:** see `TEST_QUALITY_GATE_REFERENCE.md`.
> **Coverage report configuration and custom reporter:** see `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` §2.

```bash
# Activate virtual environment
source venv/bin/activate

# Scoped-first: only the modified file
pytest core_app/tests/views/test_order_views.py -v

# Related regression from the same module
pytest core_app/tests/views/ core_app/tests/serializers/ -v

# Coverage report (custom colored report via conftest.py hooks)
pytest --cov

# Quality gate on specific files
python3 scripts/test_quality_gate.py --suite backend \
  --include-file backend/core_app/tests/views/test_order_views.py

# With external lint (CI / pre-release)
python3 scripts/test_quality_gate.py --suite backend --external-lint run \
  --include-file backend/core_app/tests/views/test_order_views.py
```

Inline exceptions when strictly necessary:

```python
# quality: disable RULE_ID (reason)
# quality: allow-call-contract (reason)
```

---

## 3. Frontend SPA

> **Framework profiles:** The sections in this part apply primarily to the **Vue 3 + Vite + Pinia** profile, which is the reference implementation. For **React** projects: replace Pinia with Redux Toolkit / Zustand, `useX` composables with React hooks, and Vue Test Utils with React Testing Library. The HTTP, routing, i18n, testing and CI patterns are identical for both profiles.

### 3.1 Folder Structure

```
frontend/
├── src/
│   ├── main.js              # App bootstrap
│   ├── App.vue              # Root component
│   ├── style.css            # Global styles + Tailwind
│   │
│   ├── router/
│   │   └── index.js         # Routes and guards
│   │
│   ├── stores/              # Flat structure (option A) or with modules/ (option B)
│   │   ├── product.js       # Option A: flat files per domain
│   │   ├── auth.js
│   │   └── services/
│   │       └── request_http.js  # HTTP client (Axios)
│   │   # Option B: stores/modules/productStore.js (for projects with >5 stores)
│   │
│   ├── views/               # Pages/Views per domain
│   │   ├── auth/
│   │   └── products/
│   │
│   ├── components/          # Reusable components
│   │   ├── common/
│   │   ├── forms/
│   │   └── layouts/
│   │
│   ├── composables/         # Reusable logic (useX hooks)
│   ├── mixins/              # Vue mixins (prefer composables when possible)
│   ├── shared/              # Shared types, constants and helpers
│   ├── locales/             # Translation files
│   │   ├── en.json
│   │   └── es.json
│   └── utils/               # Helpers and utilities
│
├── test/                    # Unit/component tests
│   ├── stores/
│   ├── components/
│   ├── views/
│   ├── router/
│   ├── composables/
│   ├── shared/
│   └── data_sample/         # JSON fixtures for tests
├── e2e/                     # Playwright E2E tests
│   ├── flow-definitions.json  # Source of truth: all user flows
│   ├── reporters/
│   │   └── flow-coverage-reporter.mjs
│   ├── helpers/
│   │   ├── test.js            # Custom test base (§3.9.4.1)
│   │   ├── flow-tags.js       # Tag constants (optional)
│   │   ├── auth.js            # Auth helpers (setAuthLocalStorage)
│   │   ├── api.js             # API mock helpers (mockApi)
│   │   ├── captcha.js         # Captcha bypass helper
│   │   └── <module>Mocks.js   # Mock data per module
│   ├── auth/                  # One directory per module
│   ├── dashboard/
│   ├── documents/
│   ├── organizations/
│   │   ├── corporate/         # Role-specific subdirectories
│   │   ├── client/
│   │   └── cross-role/
│   └── ...
├── e2e-results/               # Auto-generated (gitignored)
│   └── flow-coverage.json
├── public/
├── index.html
├── vite.config.js
├── playwright.config.mjs
├── jest.config.cjs
├── tailwind.config.js
└── package.json
```

---

### 3.2 Configuration (main.js)

```javascript
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { i18n, useI18nStore } from './stores/modules/i18nStore'
import { useCurrencyStore } from './stores/modules/currencyStore'

import './style.css'

const app = createApp(App)
const pinia = createPinia()

// Persistence plugin for stores
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(i18n)

// Asynchronous initialization (non-blocking)
const i18nStore = useI18nStore()
i18nStore.initializeIfNeeded().catch(console.error)

const currencyStore = useCurrencyStore()
currencyStore.initializeIfNeeded().catch(console.error)

app.mount('#app')
```

---

### 3.3 HTTP Service (Axios + JWT + Refresh)

The HTTP service centralizes all requests. It automatically handles: JWT in headers, expired token refresh, language and currency headers.

```javascript
// src/stores/services/request_http.js
import axios from 'axios'
import { useI18nStore } from '@/stores/modules/i18nStore'
import { useCurrencyStore } from '@/stores/modules/currencyStore'

// Token helpers
export function getJWTToken() {
    return localStorage.getItem('access_token')
}

export function getRefreshToken() {
    return localStorage.getItem('refresh_token')
}

export function setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
}

export function clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
}

export function isAuthenticated() {
    return !!getJWTToken()
}

// Main request function
async function makeRequest(method, url, params = {}, config = {}) {
    const i18nStore = useI18nStore()
    const currencyStore = useCurrencyStore()
    const token = getJWTToken()
    
    const headers = {
        'Accept-Language': i18nStore?.locale || 'en',
        'X-Currency': currencyStore?.currentCurrency || 'USD',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...config.headers,
    }
    
    try {
        let response
        switch (method) {
            case 'GET':
                response = await axios.get(`/api/${url}`, { ...config, headers })
                break
            case 'POST':
                response = await axios.post(`/api/${url}`, params, { ...config, headers })
                break
            case 'PUT':
                response = await axios.put(`/api/${url}`, params, { ...config, headers })
                break
            case 'PATCH':
                response = await axios.patch(`/api/${url}`, params, { ...config, headers })
                break
            case 'DELETE':
                response = await axios.delete(`/api/${url}`, { ...config, headers })
                break
        }
        return response
    } catch (error) {
        // Auto-refresh token on 401
        if (error.response?.status === 401 && token) {
            const refreshToken = getRefreshToken()
            if (refreshToken) {
                try {
                    const refreshResponse = await axios.post('/api/auth/token/refresh/',
                        { refresh: refreshToken })

                    if (refreshResponse.data.access) {
                        setTokens(refreshResponse.data.access, refreshToken)
                        // Retry original request
                        return makeRequest(method, url, params, config)
                    }
                } catch {
                    clearTokens()
                }
            }
        }
        throw error
    }
}

// CRUD wrappers
export const get_request = (url, responseType = 'json') =>
    makeRequest('GET', url, {}, { responseType })

export const create_request = (url, params) =>
    makeRequest('POST', url, params)

export const update_request = (url, params) =>
    makeRequest('PUT', url, params)

export const patch_request = (url, params) =>
    makeRequest('PATCH', url, params)

export const delete_request = (url) =>
    makeRequest('DELETE', url)

// Global Axios configuration
axios.defaults.timeout = 120000
```

---

### 3.4 Global State (Stores) `[Vue: Pinia]` `[React: Redux Toolkit / Zustand]`

Each store follows the same pattern: reactive state, computed getters, and CRUD actions. Use Composition API (setup syntax) for consistency.

**Store structure:** for projects with few domains use flat files (`stores/product.js`). For projects with many stores, organize in `stores/modules/productStore.js` with a `stores/index.js` that re-exports everything.

```javascript
// src/stores/modules/productStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    get_request, create_request, update_request, delete_request
} from '@/stores/services/request_http'

export const useProductStore = defineStore('product', () => {
    // State
    const items = ref([])
    const currentItem = ref(null)
    const isLoading = ref(false)
    const isUpdating = ref(false)
    const error = ref(null)
    
    // Getters
    const totalItems = computed(() => items.value.length)
    const hasItems = computed(() => items.value.length > 0)
    const getById = computed(() => (id) =>
        items.value.find(item => item.id === id)
    )
    
    // Actions
    async function fetchItems() {
        isLoading.value = true
        error.value = null
        try {
            const response = await get_request('products/')
            items.value = response.data.products || []
            return { success: true, data: items.value }
        } catch (err) {
            error.value = err.response?.data?.error || 'Error loading'
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }
    
    async function fetchItem(id) {
        isLoading.value = true
        error.value = null
        try {
            const response = await get_request(`products/${id}/`)
            currentItem.value = response.data.product
            return { success: true, data: currentItem.value }
        } catch (err) {
            error.value = err.response?.data?.error || 'Product not found'
            currentItem.value = null
            return { success: false, error: error.value }
        } finally {
            isLoading.value = false
        }
    }
    
    async function createItem(payload) {
        isUpdating.value = true
        error.value = null
        try {
            const response = await create_request('products/create/', payload)
            const newItem = response.data.product
            items.value.unshift(newItem)
            return { success: true, message: response.data.message, data: newItem }
        } catch (err) {
            error.value = err.response?.data?.details || 'Error creating'
            return { success: false, error: error.value }
        } finally {
            isUpdating.value = false
        }
    }
    
    async function updateItem(id, payload) {
        isUpdating.value = true
        error.value = null
        try {
            const response = await update_request(`products/${id}/update/`, payload)
            const updated = response.data.product
            const index = items.value.findIndex(item => item.id === id)
            if (index !== -1) items.value[index] = updated
            if (currentItem.value?.id === id) currentItem.value = updated
            return { success: true, message: response.data.message, data: updated }
        } catch (err) {
            error.value = err.response?.data?.details || 'Error updating'
            return { success: false, error: error.value }
        } finally {
            isUpdating.value = false
        }
    }
    
    async function deleteItem(id) {
        isUpdating.value = true
        error.value = null
        try {
            const response = await delete_request(`products/${id}/delete/`)
            items.value = items.value.filter(item => item.id !== id)
            if (currentItem.value?.id === id) currentItem.value = null
            return { success: true, message: response.data.message }
        } catch (err) {
            error.value = err.response?.data?.error || 'Error deleting'
            return { success: false, error: error.value }
        } finally {
            isUpdating.value = false
        }
    }
    
    function clearError() {
        error.value = null
    }
    
    return {
        // State
        items, currentItem, isLoading, isUpdating, error,
        // Getters
        totalItems, hasItems, getById,
        // Actions
        fetchItems, fetchItem, createItem, updateItem, deleteItem, clearError
    }
})
```

---

### 3.5 Composables / Hooks `[Vue: composables]` `[React: custom hooks]`

Composables (Vue) or custom hooks (React) encapsulate reusable logic with reactive state between stores and components. Use the `use` prefix and keep them in `src/composables/` (Vue) or `src/hooks/` (React).

```javascript
// src/composables/useProducts.js
import { ref, computed } from 'vue'
import { useProductStore } from '@/stores/product'

/**
 * Composable for product listing with filtering and loading state.
 *
 * @returns {object} products, isLoading, error, fetchProducts, activeProducts
 */
export function useProducts() {
    const store = useProductStore()
    const searchQuery = ref('')

    const activeProducts = computed(() =>
        store.items.filter(p =>
            p.is_active && p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    )

    async function fetchProducts() {
        await store.fetchItems()
    }

    return {
        products: store.items,
        isLoading: store.isLoading,
        error: store.error,
        searchQuery,
        activeProducts,
        fetchProducts,
    }
}
```

---

### 3.6 Router and Guards

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/stores/services/request_http'
import { useI18nStore } from '@/stores/modules/i18nStore'

const availableLanguages = ['en', 'es']

// Base routes
const baseRoutes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'Home' }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { requiresGuest: true, title: 'Login' }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' }
    },
    {
        path: '/products',
        name: 'Products',
        component: () => import('@/views/products/ProductListView.vue'),
        meta: { title: 'Products' }
    },
    {
        path: '/products/:id',
        name: 'ProductDetail',
        component: () => import('@/views/products/ProductDetailView.vue'),
        meta: { title: 'Product Detail' }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFoundView.vue')
    }
]

// Auto-generate localized routes
const routes = [
    ...baseRoutes,
    ...availableLanguages.flatMap(lang =>
        baseRoutes.map(route => ({
            ...route,
            path: `/${lang}${route.path === '/' ? '' : route.path}`,
            name: route.name ? `${route.name}-${lang}` : undefined,
        }))
    )
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        if (to.hash) return { el: to.hash, behavior: 'smooth' }
        return { top: 0, behavior: 'smooth' }
    }
})

// Guards
router.beforeEach((to, from, next) => {
    const i18nStore = useI18nStore()
    const urlLang = to.path.split('/')[1]

    // Detect and sync language from URL
    if (availableLanguages.includes(urlLang) && urlLang !== i18nStore.locale) {
        i18nStore.setLocale(urlLang)
    }

    // Authentication guard
    if (to.meta.requiresAuth && !isAuthenticated()) {
        const targetLang = urlLang || i18nStore.locale || 'en'
        return next({ name: `Login-${targetLang}`, query: { redirect: to.fullPath } })
    }

    // Guest guard (redirect if already authenticated)
    if (to.meta.requiresGuest && isAuthenticated()) {
        const targetLang = urlLang || i18nStore.locale || 'en'
        return next({ name: `Home-${targetLang}` })
    }

    // Update page title
    document.title = to.meta.title || 'My Application'
    
    next()
})

export default router
```

---

### 3.7 Internationalization (i18n)

```javascript
// src/stores/modules/i18nStore.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { createI18n } from 'vue-i18n'

// Translation messages
const messages = {
    en: {
        common: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            loading: 'Loading...',
            error: 'An error occurred'
        },
        auth: {
            login: 'Log In',
            logout: 'Log Out',
            register: 'Register'
        },
        products: {
            title: 'Products',
            addToCart: 'Add to Cart',
            outOfStock: 'Out of Stock'
        }
    },
    es: {
        common: {
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            loading: 'Cargando...',
            error: 'Ocurrió un error'
        },
        auth: {
            login: 'Iniciar Sesión',
            logout: 'Cerrar Sesión',
            register: 'Registrarse'
        },
        products: {
            title: 'Productos',
            addToCart: 'Agregar al Carrito',
            outOfStock: 'Agotado'
        }
    }
}

// Create i18n instance
export const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages
})

// Store to manage the active language
export const useI18nStore = defineStore('i18n', () => {
    const locale = ref('en')
    const availableLocales = ['en', 'es']
    
    function setLocale(newLocale) {
        if (availableLocales.includes(newLocale)) {
            locale.value = newLocale
            i18n.global.locale.value = newLocale
            localStorage.setItem('locale', newLocale)
        }
    }
    
    async function initializeIfNeeded() {
        const saved = localStorage.getItem('locale')
        if (saved && availableLocales.includes(saved)) {
            setLocale(saved)
        } else {
            // Detect from browser
            const browserLang = navigator.language.split('-')[0]
            setLocale(availableLocales.includes(browserLang) ? browserLang : 'en')
        }
    }

    return { locale, availableLocales, setLocale, initializeIfNeeded }
}, {
    persist: true  // Persist in localStorage
})
```

---

### 3.8 Global Error Handling

Vue 3 exposes `app.config.errorHandler` to capture unhandled errors from components, composables and lifecycle hooks.

```javascript
// src/main.js (add after creating the app)
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

/**
 * Global error handler — catches unhandled errors from components,
 * composables, lifecycle hooks, and watchers.
 *
 * @param {Error} error - The caught error
 * @param {object} instance - Vue component instance where error occurred
 * @param {string} info - Vue-specific error info (lifecycle hook name, etc.)
 */
app.config.errorHandler = (error, instance, info) => {
    // Log to monitoring service (Sentry, Datadog, etc.) in production
    console.error('[Vue Error]', { error, info })

    // Optionally set a global error state for UI feedback
    // useNotificationStore().showError(error.message)
}

// For promise rejections not caught by Vue
window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason)
})
```

**Error handling in stores:**

The standard pattern in each store is to return `{ success: false, error }` instead of re-throwing exceptions, so components can react without needing local try/catch blocks:

```javascript
async function fetchItems() {
    isLoading.value = true
    try {
        const response = await get_request('products/')
        items.value = response.data.products || []
        return { success: true, data: items.value }
    } catch (err) {
        error.value = err.response?.data?.error || 'Error loading products'
        return { success: false, error: error.value }
    } finally {
        isLoading.value = false
    }
}
```

---

### 3.9 Testing (Frontend)

The frontend combines unit/component tests and E2E tests. Both types must validate observable behavior and use quality signals consistent with `TESTING_QUALITY_STANDARDS.md`.

#### 3.9.1 Objective and test layers

- **Unit/Component (`frontend/test/**`):** stores, composables, router and components.
- **E2E (`frontend/e2e/**`):** multi-page flows, UI + API integration and UX regressions.

#### 3.9.2 Hierarchy

```
frontend/
├── test/                          # Unit/component tests
│   ├── stores/
│   ├── composables/
│   ├── router/
│   ├── components/
│   ├── views/
│   ├── shared/
│   └── data_sample/               # JSON fixtures for tests
├── e2e/                           # Playwright E2E tests
│   ├── flow-definitions.json      # Source of truth: all user flows
│   ├── reporters/
│   │   └── flow-coverage-reporter.mjs  # Custom flow-level coverage reporter
│   ├── helpers/
│   │   ├── test.js                # Custom test base (§3.9.4.1)
│   │   ├── flow-tags.js           # Tag constants (optional but recommended)
│   │   ├── auth.js                # Auth helpers (setAuthLocalStorage)
│   │   ├── api.js                 # API mock helpers (mockApi)
│   │   ├── captcha.js             # Captcha bypass helper
│   │   └── <module>Mocks.js       # Mock data per module
│   ├── auth/                      # One directory per module
│   ├── dashboard/
│   ├── documents/
│   ├── subscriptions/
│   ├── process/
│   ├── signatures/
│   ├── legal-requests/
│   ├── organizations/
│   │   ├── corporate/             # Role-specific subdirectories when needed
│   │   ├── client/
│   │   └── cross-role/            # Flows involving multiple roles
│   ├── misc/
│   └── ...                        # Additional modules as the project grows
├── e2e-results/                   # Auto-generated (gitignored)
│   └── flow-coverage.json         # JSON coverage artifact
├── playwright.config.mjs
└── ...
```

#### 3.9.3 E2E module-based directory structure

E2E tests are organized by **functional module**, mirroring the `module` field in `flow-definitions.json`. Each module gets its own directory under `e2e/`.

**Directory naming rules:**

| Rule | Example |
|---|---|
| One directory per module | `e2e/auth/`, `e2e/documents/`, `e2e/organizations/` |
| Directory name matches the module ID in `flow-definitions.json` | Module `"legal-requests"` → `e2e/legal-requests/` |
| Use kebab-case | `e2e/legal-requests/` (not `e2e/legalRequests/`) |
| Role-specific subdirectories when a module has many flows per role | `e2e/organizations/corporate/`, `e2e/organizations/client/` |
| Cross-role flows in a `cross-role/` subdirectory | `e2e/organizations/cross-role/` |

**Spec file naming convention:**

```
<module>-<flow-action>.spec.js
```

Examples:
- `auth/auth-login.spec.js`
- `dashboard/dashboard-recent-documents.spec.js`
- `organizations/corporate/organizations-corporate-create-organization.spec.js`
- `organizations/cross-role/organizations-cross-invite-accept-stats.spec.js`

#### 3.9.4 E2E test infrastructure and practical patterns

This section covers the foundational infrastructure every new project needs **before writing any E2E spec**. These helpers and patterns ensure tests are isolated, reproducible, and maintainable.

##### 3.9.4.1 Custom test base (`helpers/test.js`)

All spec files must import `test` and `expect` from a **custom test base** instead of directly from `@playwright/test`. This custom base extends the default fixtures (e.g., to add error logging):

```javascript
// e2e/helpers/test.js
import { test as base, expect } from "@playwright/test";

const shouldLogErrors = process.env.E2E_LOG_ERRORS === "1";

export const test = base.extend({
  page: async ({ page }, use) => {
    if (shouldLogErrors) {
      page.on("pageerror", (err) => {
        console.error("[e2e:pageerror]", err);
      });
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          console.error("[e2e:console:error]", msg.text());
        }
      });
    }
    await use(page);
  },
});

export { expect };
```

**Usage in every spec file:**

```javascript
// ✅ CORRECT — import from custom base
import { test, expect } from "../helpers/test.js";

// ❌ WRONG — bypasses custom fixtures
import { test, expect } from "@playwright/test";
```

> This pattern allows adding global behaviors (error logging, custom fixtures, shared setup) in a single place without modifying every spec file.

##### 3.9.4.2 API mocking (`helpers/api.js`)

E2E tests mock backend API responses using Playwright route interception. The standard uses a `mockApi()` helper that intercepts all `/api/**` requests and delegates to a handler function:

```javascript
// e2e/helpers/api.js
export function getApiPath(requestUrl) {
  const url = new URL(requestUrl);
  return url.pathname.replace(/^\/api\//, "");
}

export async function mockApi(page, handler) {
  await page.route("**/api/**", async (route) => {
    const apiPath = getApiPath(route.request().url());
    const result = await handler({ route, apiPath });

    if (result) {
      return route.fulfill(result);
    }

    // Default: return empty JSON for unhandled routes
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });
}
```

**Usage in spec files:**

```javascript
await mockApi(page, async ({ route, apiPath }) => {
  if (apiPath === "validate_token/") return { status: 200, contentType: "application/json", body: "{}" };
  if (apiPath === "users/") return { status: 200, contentType: "application/json", body: JSON.stringify([user]) };
  if (apiPath === `users/${userId}/`) return { status: 200, contentType: "application/json", body: JSON.stringify(user) };
  // ... more routes
  return null; // fallback to default empty JSON
});
```

> **Key rule:** `mockApi` must be called **before** any `page.goto()`. The handler receives a stripped `apiPath` (e.g., `"users/123/"`) and returns a `{ status, contentType, body }` object or `null` for the default response.

##### 3.9.4.3 Auth state setup (`helpers/auth.js`)

Authenticated routes require JWT tokens in localStorage. The `setAuthLocalStorage()` helper injects auth state **before** navigation using `page.addInitScript`:

```javascript
// e2e/helpers/auth.js
export async function setAuthLocalStorage(page, { token, userAuth }) {
  await page.addInitScript(
    ({ token: t, userAuth: u }) => {
      localStorage.setItem("token", t);
      localStorage.setItem("userAuth", JSON.stringify(u));
    },
    { token, userAuth }
  );
}
```

**Usage:**

```javascript
await setAuthLocalStorage(page, {
  token: "e2e-token",
  userAuth: {
    id: userId,
    role: "lawyer",
    is_gym_lawyer: true,
    is_profile_completed: true,
  },
});

await page.goto("/dashboard"); // Page loads already authenticated
```

> **Order matters:** Call `setAuthLocalStorage` before `page.goto()`. The `addInitScript` runs at the start of every navigation, so auth state is available when the SPA initializes.

##### 3.9.4.4 Module mock installers

For complex modules, create a centralized **mock installer function** in `helpers/<module>Mocks.js` that sets up all API routes for that module in a single call:

```javascript
// e2e/helpers/organizationsDashboardMocks.js
import { mockApi } from "./api.js";

export function buildMockUser({ id, role, firstName = "E2E", ... }) {
  return { id, first_name: firstName, ... };
}

export function buildMockOrganization({ id, title, ... }) {
  return { id, title, ... };
}

export async function installOrganizationsDashboardApiMocks(page, {
  userId,
  role = "corporate_client",
  startWithOrganizations = true,
  ...
}) {
  const user = buildMockUser({ id: userId, role });
  // ... build all mock data based on options

  await mockApi(page, async ({ route, apiPath }) => {
    if (apiPath === "validate_token/") return { ... };
    if (apiPath === "organizations/") return { ... };
    // ... all routes for this module
    return null;
  });
}
```

**Naming convention:**

| File | Installer function | Builder functions |
|---|---|---|
| `<module>Mocks.js` | `install<Module>ApiMocks(page, options)` | `buildMock<Entity>(fields)` |
| `authSignInMocks.js` | `installAuthSignInApiMocks(page, { userId, role, signInStatus })` | — |
| `organizationsDashboardMocks.js` | `installOrganizationsDashboardApiMocks(page, { userId, role, ... })` | `buildMockUser()`, `buildMockOrganization()` |
| `processMocks.js` | `installProcessMocks(page, { userId, role, processes })` | `buildProcess()` |

For simpler modules, the mock installer can be defined **inline in the spec file** instead of in a shared helper. Move it to `helpers/` when multiple spec files need the same mocks.

##### 3.9.4.5 Test isolation — unique user IDs

Each test must use a **unique `userId`** to avoid state collisions between parallel tests. Use a simple convention of incrementing numeric IDs per spec file or test group:

```javascript
// Spec file A — IDs in the 3200 range
test("lawyer sees tabs", { ... }, async ({ page }) => {
  const userId = 3200;
  // ...
});

test("switching tabs shows content", { ... }, async ({ page }) => {
  const userId = 3201;
  // ...
});

// Spec file B — IDs in the 4200 range
test("corporate creates org", { ... }, async ({ page }) => {
  const userId = 4200;
  // ...
});
```

> **Why:** Playwright runs tests in parallel. If two tests share the same userId and the mock handlers are stateful, responses will collide. Unique IDs guarantee isolation.

##### 3.9.4.6 Cross-role test pattern

Flows that involve **multiple user roles** (e.g., corporate invites → client accepts) use sequential role switching within a single test by calling `setAuthLocalStorage` multiple times:

```javascript
test("corporate invites client, client accepts", {
  tag: ['@flow:org-cross-invite-flow', '@module:organizations', '@priority:P1'],
}, async ({ page }) => {
  test.setTimeout(60_000); // Cross-role tests need longer timeouts

  const corporateUserId = 4700;
  const clientUserId = 4701;

  // Install mocks that handle both roles
  await installMocks(page, { corporateUserId, clientUserId, ... });

  // Step 1: corporate sends invitation
  await setAuthLocalStorage(page, {
    token: "e2e-token",
    userAuth: { id: corporateUserId, role: "corporate_client", ... },
  });
  await page.goto("/organizations_dashboard");
  // ... corporate actions ...

  // Step 2: switch to client role
  await setAuthLocalStorage(page, {
    token: "e2e-token",
    userAuth: { id: clientUserId, role: "client", ... },
  });
  await page.goto("/organizations_dashboard");
  // ... client actions ...

  // Step 3: switch back to corporate, verify state changed
  await setAuthLocalStorage(page, {
    token: "e2e-token",
    userAuth: { id: corporateUserId, role: "corporate_client", ... },
  });
  await page.goto("/organizations_dashboard");
  // ... verify stats updated ...
});
```

**Cross-role test rules:**

- Place in a `cross-role/` subdirectory: `e2e/organizations/cross-role/`.
- Use `test.setTimeout(60_000)` — these tests involve multiple navigations.
- The mock installer must handle API routes for **both roles** and maintain state between navigations (e.g., accepting an invite decrements the pending count).
- Tag with all participating roles: `@role:shared` or `['@role:corporate', '@role:client']`.

##### 3.9.4.7 Playwright configuration essentials

The `playwright.config.mjs` must include the custom reporter, a `webServer` block, and sensible defaults:

```javascript
// playwright.config.mjs
import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT ? Number(process.env.E2E_PORT) : 4173;
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;
const reuseExistingServer = process.env.E2E_REUSE_SERVER === "1" && !process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "e2e-results/results.json" }],
    ["./e2e/reporters/flow-coverage-reporter.mjs", { outputDir: "e2e-results" }],
  ],
  use: {
    baseURL,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

**Environment variables:**

| Variable | Default | Purpose |
|---|---|---|
| `E2E_PORT` | `4173` | Port for the dev server |
| `E2E_BASE_URL` | `http://127.0.0.1:4173` | Override base URL (e.g., for external servers) |
| `E2E_REUSE_SERVER` | `"0"` | Set to `"1"` to reuse an already running dev server |
| `E2E_LOG_ERRORS` | `"0"` | Set to `"1"` to log page errors and console errors to stdout |
| `CI` | — | Set automatically by CI runners; affects retries and server reuse |

##### 3.9.4.8 Responsive / Multi-Viewport Testing

Responsive layout is a **cross-cutting design property**, not a user flow. Do **not** create a dedicated `e2e/viewport/` or `e2e/responsive/` module — it contradicts the module-based organization defined in §3.9.3.

**Strategy:** Use Playwright `projects` to define additional viewport sizes. Functional tests run automatically at all configured viewports without any test changes.

```javascript
// playwright.config.mjs — multi-project viewport setup
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // ... reporter, webServer, use, etc.
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Tablet",
      use: { ...devices["iPad Mini"] },
    },
  ],
});
```

**npm scripts for per-viewport filtering:**

```bash
# All viewports (default)
npm run e2e

# Single viewport
npm run e2e:desktop          # Desktop Chrome only
npm run e2e:mobile           # Mobile Chrome (Pixel 5) only
npm run e2e:tablet           # Tablet (iPad Mini) only

# Combine viewport filter with a specific spec
npm run e2e:desktop -- e2e/auth/auth-login.spec.js
```

**When a viewport-specific behavioral test IS needed:**

If a specific component has viewport-dependent **behavior** (e.g., sidebar collapses on mobile, hamburger menu appears), the test belongs in that component's functional module — not in a separate viewport module.

```
# ✅ CORRECT — viewport-specific behavior in the owning module
e2e/dashboard/dashboard-sidebar-mobile.spec.js
e2e/navigation/navigation-mobile-menu.spec.js

# ❌ WRONG — standalone viewport module
e2e/viewport/viewport-responsive.spec.js
e2e/responsive/responsive-layout.spec.js
```

#### 3.9.5 Flow Coverage methodology — overview

The standard E2E strategy measures coverage at the **user-flow level** rather than at the code-line level. This answers the question: *"Do our tests cover real user journeys?"*

The system has **three pillars:**

1. **Flow definitions** (`flow-definitions.json`) — a JSON registry of every user flow the application supports, classified by module, role, and priority.
2. **Flow tags** (`@flow:<flow-id>`) — Playwright test tags that link each test to one or more flow definitions.
3. **Custom reporter** (`flow-coverage-reporter.mjs`) — a Playwright reporter that computes flow-level coverage and generates a terminal report + JSON artifact.

> **Full implementation guide:** see `E2E_FLOW_COVERAGE_REPORT_STANDARD.md` for the complete reporter source code, JSON output schema, report sections, and the new-project checklist.

#### 3.9.6 Step 1 — Define user flows (`flow-definitions.json`)

Create `e2e/flow-definitions.json` as the **single source of truth** for all user flows tracked by the report.

**Schema:**

```jsonc
{
  "version": "<semver>",          // Version of this definitions file
  "lastUpdated": "<YYYY-MM-DD>",  // Date of last modification
  "flows": {
    "<flow-id>": {
      "name": "<string>",           // Human-readable flow name
      "module": "<string>",         // Module grouping (e.g., "auth", "documents")
      "roles": ["<string>", ...],   // Applicable roles (e.g., ["lawyer", "client"])
      "priority": "<P1|P2|P3|P4>",  // P1 = critical, P4 = nice-to-have
      "description": "<string>",    // What the flow does
      "expectedSpecs": <number>,    // How many spec files should cover this flow
      "knownGaps": ["<string>", ...]  // (Optional) Known coverage gaps
    }
  }
}
```

**Field reference:**

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | `string` | Yes | Semantic version. Bump on structural changes. |
| `lastUpdated` | `string` | Yes | ISO date (`YYYY-MM-DD`) of the last edit. |
| `flows.<id>.name` | `string` | Yes | Display name shown in the report. |
| `flows.<id>.module` | `string` | Yes | Logical module. Used for grouping and must match a directory in `e2e/`. |
| `flows.<id>.roles` | `string[]` | Yes | Which user roles exercise this flow. Use `"shared"` for all roles. |
| `flows.<id>.priority` | `string` | Yes | `P1` (critical) → `P4` (nice-to-have). Affects "Missing Flows by Priority" in the report. |
| `flows.<id>.description` | `string` | Yes | One-line explanation of what the flow covers. |
| `flows.<id>.expectedSpecs` | `number` | Yes | Target number of spec files for this flow. Informational. |
| `flows.<id>.knownGaps` | `string[]` | No | Documented limitations. Displayed in the "Partial Coverage" section. |

**Priority levels:**

| Level | Meaning | Example |
|---|---|---|
| P1 | Critical — core business flow, blocks release if missing | Login, checkout, create document |
| P2 | High — important feature, should be covered before release | Edit profile, manage subscriptions |
| P3 | Medium — secondary feature, cover after P1/P2 | Search, filters, secondary modals |
| P4 | Nice-to-have — informational pages, low-risk | Privacy policy, PWA install prompt |

**Flow ID naming conventions:**

- Use **kebab-case**: `auth-login-email`, `docs-create-template`.
- Prefix with the **module name**: `auth-`, `docs-`, `org-`, `sign-`, `legal-`.
- Keep IDs **stable** — tests reference them via `@flow:` tags.
- For cross-role flows use a `cross-` infix: `org-cross-invite-flow`.

**Annotated example:**

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-15",
  "flows": {
    "auth-login-email": {
      "name": "Login with email/password",
      "module": "auth",
      "roles": ["shared"],
      "priority": "P1",
      "description": "User signs in with email and password credentials",
      "expectedSpecs": 1
    },
    "docs-create-template": {
      "name": "Create document template",
      "module": "documents",
      "roles": ["lawyer"],
      "priority": "P1",
      "description": "Lawyer creates a new document template with TinyMCE editor",
      "expectedSpecs": 1
    },
    "org-cross-invite-flow": {
      "name": "Cross-role: full invitation flow",
      "module": "organizations",
      "roles": ["corporate", "client"],
      "priority": "P1",
      "description": "Corporate invites, client accepts/rejects, stats update",
      "expectedSpecs": 1,
      "knownGaps": ["Test verifies accept path only, reject path not covered"]
    }
  }
}
```

#### 3.9.7 Step 2 — Tag tests with `@flow:`

Every Playwright test must be tagged with one or more `@flow:<flow-id>` tags to link it to a flow definition.

**Syntax — at test level:**

```javascript
import { test, expect } from '../helpers/test.js'; // Always use custom base (§3.9.4.1)

test('user can sign in with email and password', {
  tag: ['@flow:auth-login-email', '@module:auth', '@priority:P1', '@role:shared'],
}, async ({ page }) => {
  // test body
});
```

**Syntax — at describe level (all tests inherit the tags):**

```javascript
test.describe('Login flows', {
  tag: ['@flow:auth-login-email', '@module:auth', '@priority:P1', '@role:shared'],
}, () => {
  test('signs in with valid credentials', {
    tag: ['@flow:auth-login-email'],
  }, async ({ page }) => {
    // ...
  });

  test('shows error for invalid password', {
    tag: ['@flow:auth-login-email'],
  }, async ({ page }) => {
    // ...
  });
});
```

**Additional metadata tags:**

While only `@flow:` tags are consumed by the reporter, tests should also carry additional tags for CLI filtering:

| Tag | Purpose | Example |
|---|---|---|
| `@module:<name>` | Group by module for Playwright `--grep` | `@module:auth` |
| `@priority:<P1-P4>` | Filter by priority | `@priority:P1` |
| `@role:<name>` | Filter by user role | `@role:client` |

```bash
# Run only auth module tests
npx playwright test --grep @module:auth

# Run only P1 (critical) tests
npx playwright test --grep @priority:P1

# Run only client-role tests
npx playwright test --grep @role:client
```

**What happens to untagged tests:**

Tests without any `@flow:` tag are collected in the `unmappedTests` array and displayed in a warning section of the report. They do **not** affect any flow's status.

> **Goal:** Every E2E test should have at least one `@flow:` tag. The "Tests Without Flow Tag" section should be empty in a mature project.

#### 3.9.8 Step 3 — Flow tag constants (`flow-tags.js`)

To avoid repeating the same tag arrays across spec files, create a constants helper at `e2e/helpers/flow-tags.js`.

**Purpose:**
- **Single source** for tag arrays — change a tag value in one place.
- **Consistent metadata** — each constant bundles `@flow:`, `@module:`, and `@priority:` together.
- **Spread syntax** — use `...` to compose tags in tests.

**Example implementation:**

```javascript
/**
 * Flow tag constants for consistent E2E test tagging.
 *
 * Usage:
 *   import { AUTH_LOGIN_EMAIL } from '../helpers/flow-tags.js';
 *   test('...', { tag: [...AUTH_LOGIN_EMAIL, '@role:client'] }, async ({ page }) => { ... });
 */

// ── Auth ──
export const AUTH_LOGIN_EMAIL = ['@flow:auth-login-email', '@module:auth', '@priority:P1'];
export const AUTH_REGISTER = ['@flow:auth-register', '@module:auth', '@priority:P1'];
export const AUTH_FORGOT_PASSWORD = ['@flow:auth-forgot-password', '@module:auth', '@priority:P2'];

// ── Documents ──
export const DOCS_CREATE_TEMPLATE = ['@flow:docs-create-template', '@module:documents', '@priority:P1'];
export const DOCS_EDITOR = ['@flow:docs-editor', '@module:documents', '@priority:P1'];

// ... add one constant per flow defined in flow-definitions.json
```

**Usage in spec files:**

```javascript
import { test, expect } from '@playwright/test';
import { AUTH_LOGIN_EMAIL } from '../helpers/flow-tags.js';

test('user can sign in with email and password', {
  tag: [...AUTH_LOGIN_EMAIL, '@role:shared'],
}, async ({ page }) => {
  // test body
});
```

**Naming convention:**

| Pattern | Example |
|---|---|
| `SCREAMING_SNAKE_CASE` matching the flow ID | `auth-login-email` → `AUTH_LOGIN_EMAIL` |
| One constant per flow in `flow-definitions.json` | N flows → N constants |
| Grouped by module with section comments | `// ── Auth ──`, `// ── Documents ──` |

> This file is **optional** but recommended for projects with more than 10 flows. Tests can use inline tag arrays (`tag: ['@flow:auth-login-email']`) if you prefer not to maintain a constants file.

#### 3.9.9 Step 4 — Custom reporter and artifacts

The custom reporter lives at `e2e/reporters/flow-coverage-reporter.mjs` and is registered in `playwright.config.mjs`.

**Registration:**

```javascript
// playwright.config.mjs
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "e2e-results/results.json" }],
    ["./e2e/reporters/flow-coverage-reporter.mjs", { outputDir: "e2e-results" }],
  ],
  // ... rest of your config (see §3.9.4.7 for full example)
});
```

**How it works:**

1. On construction, the reporter loads `flow-definitions.json` and initializes all flows with status `missing`.
2. As each test finishes (`onTestEnd`), it extracts `@flow:` tags and updates the corresponding flow stats (passed/failed/skipped counters, spec file set).
3. When the suite ends (`onEnd`), it computes the final status for each flow, prints a colored terminal report, and writes `flow-coverage.json`.

**Status state machine:**

| Status | Condition | Meaning |
|---|---|---|
| `missing` | `tests.total === 0` | No tests exist for this flow |
| `failing` | `tests.failed > 0` | At least one test failed or timed out |
| `covered` | `tests.passed > 0 && tests.skipped === 0` | All tests passed, none skipped |
| `partial` | _(default)_ | Some passed but at least one skipped |

**Terminal report sections:**

| Section | Condition |
|---|---|
| Summary | Always shown |
| Missing Flows by Priority | At least one flow is `missing` |
| Failing Flows | At least one flow is `failing` |
| Partial Coverage | At least one flow is `partial` |
| Coverage by Module | Always shown (progress bars per module) |
| Tests Without Flow Tag | At least one test has no `@flow:` tag |

**JSON artifact** (`e2e-results/flow-coverage.json`):

A machine-readable report written after every run. Contains summary counts, per-flow status with test stats, and unmapped tests. Add `e2e-results/` to `.gitignore`.

> **Full reporter source code, JSON schema, and report examples:** see `E2E_FLOW_COVERAGE_REPORT_STANDARD.md`.

#### 3.9.10 Coverage goals and maintenance

**Coverage goal:** 100% of defined flows have status `covered` — zero `missing`, zero `failing`.

**Adding a new flow:**

1. Add a new entry to `flow-definitions.json` with all required fields.
2. Bump the `version` field if the change is structural.
3. Update the `lastUpdated` date.
4. Add a corresponding constant to `flow-tags.js` (if used).
5. Create or update spec files with the `@flow:<new-flow-id>` tag.
6. Run the E2E suite and verify the new flow appears as `covered` in the report.

**Removing a flow:**

1. Delete the entry from `flow-definitions.json`.
2. Remove the `@flow:<deleted-id>` tag from all spec files.
3. Remove the constant from `flow-tags.js`.
4. Run the suite and verify no tests became unmapped.

**Renaming a flow ID:**

1. Update the key in `flow-definitions.json`.
2. Update **all** `@flow:` tags in spec files to match the new ID.
3. Update the constant in `flow-tags.js`.
4. This must be done atomically — a mismatch causes the old ID to appear as `missing` and the new ID as auto-detected under `unknown`.

**Version bumping guidelines:**

| Change | Version bump |
|---|---|
| Add/remove a flow | Patch (`1.0.0` → `1.0.1`) |
| Rename flow IDs or restructure modules | Minor (`1.0.0` → `1.1.0`) |
| Change the schema of the definitions file | Major (`1.0.0` → `2.0.0`) |

**Keeping definitions in sync:**

| Signal in the report | Action |
|---|---|
| "Missing Flows by Priority" appears | Write tests for those flows or remove the definition if the feature was deleted |
| "Tests Without Flow Tag" appears | Add `@flow:` tags to the listed tests |
| A flow appears under module `unknown` | The `@flow:` tag references an ID not in definitions — add the definition |

#### 3.9.11 Execution and quality

> **Full rules, selectors, naming, anti-patterns and examples:** see `TESTING_QUALITY_STANDARDS.md`.
> **Quality gate CLI options:** see `TEST_QUALITY_GATE_REFERENCE.md`.
> **Unit test coverage report configuration:** see `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` §3.

```bash
# Unit/component: specific file
npm test -- test/stores/orderStore.test.js

# Unit/component: related regression
npm test -- test/stores/orderStore.test.js test/components/OrderSummary.test.js

# Unit/component: coverage report (custom styled summary via coverage-summary.cjs)
npm run test:coverage

# E2E: specific spec
npx playwright test e2e/flows/checkout.spec.js

# E2E: filter by module
npx playwright test --grep @module:auth

# E2E: list modules
npm run e2e:modules

# E2E: run a single module (alias)
npm run e2e:module -- auth
npm run e2e:module -- --module auth --clean

# E2E: module-scoped coverage
clear && npm run e2e:clean && npm run e2e:coverage -- --grep @module:auth

# E2E: module-scoped coverage (alias)
npm run e2e:coverage:module -- auth
npm run e2e:coverage:module -- --module auth --clean

# E2E: filter by priority
npx playwright test --grep @priority:P1

# E2E: filter by role
npx playwright test --grep @role:client

# Note: module-scoped runs only execute tagged tests. The flow coverage report will list
# other modules/flows as missing because they were not executed in that subset.

# Quality gate on specific files
python3 scripts/test_quality_gate.py --suite frontend-unit \
  --include-file frontend/test/stores/orderStore.test.js

python3 scripts/test_quality_gate.py --suite frontend-e2e \
  --include-file frontend/e2e/flows/checkout.spec.js
```

Inline exceptions when strictly necessary:

```javascript
// quality: disable RULE_ID (reason)
// quality: allow-serial (reason)
```

#### 3.9.12 User Flow Map (`USER_FLOW_MAP.md`)

Every project must maintain a **User Flow Map** — a human-readable document that describes all end-to-end user navigation flows in detail. While `flow-definitions.json` (§3.9.6) is the machine-readable registry consumed by the reporter, the User Flow Map is the **narrative companion** that developers, QA, and product stakeholders read to understand the full picture.

**Location:** `docs/USER_FLOW_MAP.md`

**Relationship to `flow-definitions.json`:**

| Artifact | Format | Audience | Contains |
|----------|--------|----------|----------|
| `flow-definitions.json` | JSON | Reporter, CI | Flow ID, module, priority, roles, expectedSpecs |
| `USER_FLOW_MAP.md` | Markdown | Developers, QA, product | Steps, branches, variations, routes, E2E coverage references |

Both files must stay in sync. Every flow in `flow-definitions.json` must have a corresponding entry in the User Flow Map, and vice versa.

**Document structure:**

```markdown
# User Flow Map

Version: <semver matching flow-definitions.json>
Last Updated: <YYYY-MM-DD>
Description: End-to-end user flows for the <project> frontend, grouped by role.
Sources: frontend/e2e/flow-definitions.json, frontend/e2e/helpers/flow-tags.js,
         frontend/e2e specs, frontend/src/router.

## System Roles
- <Role 1>: <description>
- <Role 2>: <description>

## <Role Group> Flows

### <flow-id>: <Flow Name>
- Module: <module>
- Priority: <P1–P4>
- Route: <route path>
- Roles: <comma-separated roles>
- Description: <one-line description>
- E2E Coverage: <Covered|Missing|Partial> (<spec file path>)

**Steps**
1. <step 1>
2. <step 2>
3. ...

**Branches / Variations**
- <variation 1>
- <variation 2>
```

**Required fields per flow entry:**

| Field | Required | Description |
|-------|----------|-------------|
| Flow ID (heading) | Yes | Must match the key in `flow-definitions.json` |
| Module | Yes | Logical module grouping |
| Priority | Yes | P1–P4 |
| Route | Yes | Primary route path for the flow |
| Roles | Yes | Which roles exercise this flow |
| Description | Yes | One-line summary |
| E2E Coverage | Yes | Coverage status + spec file reference |
| Steps | Yes | Numbered list of user actions from start to finish |
| Branches / Variations | Yes | Alternate paths, error states, edge cases |

**Role grouping:**

- If the project has distinct user roles (e.g., admin, customer, guest), group flows by role section.
- If all flows are shared across roles, use a single **"Shared Flows"** section.
- Flows accessible without authentication go under **"Guest Flows"** or **"Public Flows"**.
- Cross-role flows that span multiple roles go under **"Shared Flows"** with roles listed.

**Maintenance rules:**

| Trigger | Action |
|---------|--------|
| New flow added to `flow-definitions.json` | Add corresponding entry to User Flow Map |
| Flow removed from `flow-definitions.json` | Remove entry from User Flow Map |
| E2E spec file created or renamed | Update the E2E Coverage field |
| Route path changed | Update the Route field |
| New branch/variation discovered during testing | Add to Branches / Variations |
| Version bump in `flow-definitions.json` | Bump version in User Flow Map header |

> **When to create:** The User Flow Map should be created as part of the initial E2E Flow Coverage setup (§3.9.5–3.9.10). It is a living document — update it whenever flows change.

---

## 4. CI/CD and Pre-commit

### 4.1 Pre-commit

The project uses `pre-commit` to run automatic checks before each commit. Configuration in `.pre-commit-config.yaml` at the repository root.

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.3.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.x.x
    hooks:
      - id: eslint
        files: \.(js|vue)$
        args: [--fix]
```

Installation and setup:

```bash
pip install pre-commit
pre-commit install        # Install hook in .git/hooks/pre-commit
pre-commit run --all-files  # Run manually on all files
```

### 4.2 CI — GitHub Actions

The quality gate integrates into CI to block merges with quality issues. The workflow lives in `.github/workflows/test-quality-gate.yml`.

```yaml
# .github/workflows/test-quality-gate.yml
name: Test Quality Gate

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install backend dependencies
        run: |
          cd backend && python -m venv venv
          source venv/bin/activate
          pip install -r requirements.txt
          pip install ruff

      - name: Run backend quality gate
        run: |
          source backend/venv/bin/activate
          python3 scripts/test_quality_gate.py --suite backend --external-lint run

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Run frontend quality gates
        run: |
          python3 scripts/test_quality_gate.py --suite frontend-unit
          python3 scripts/test_quality_gate.py --suite frontend-e2e
```

> For new projects, copy these files from the reference project. See `TEST_QUALITY_GATE_REFERENCE.md` for advanced gate configuration options.

---

## 5. Standard Dependencies

### 5.1 Backend (requirements.txt)

| Category | Package | Purpose |
|----------|---------|---------|
| Core | Django>=4.2 | Web framework |
| Core | djangorestframework | REST API |
| Auth | djangorestframework-simplejwt | JWT authentication |
| CORS | django-cors-headers | CORS handling |
| Cache | django-redis | Redis caching |
| Images | Pillow | Image processing |
| Images | easy-thumbnails | Automatic thumbnails |
| Cleanup | django-cleanup | File cleanup |
| Testing | Faker | Test data |
| Testing | pytest | Test runner |
| Testing | pytest-django | pytest + Django integration |
| Testing | pytest-cov | Test coverage (pytest plugin) |
| Testing | coverage | Coverage engine (used by custom reporter in `conftest.py`) |
| Testing | pytest-freezegun | Time control in tests |
| Testing | factory-boy | Factories for models and payloads |
| HTTP | requests | External integrations |

### 5.2 Frontend (package.json)

| Category | Package | Profile | Purpose |
|----------|---------|---------|---------|
| Core | vue@^3.x | `[Vue]` | Reactive framework |
| Core | react@^18.x | `[React]` | Reactive framework |
| Build | vite + @vitejs/plugin-vue | `[Vue]` | Fast bundler |
| Build | vite + @vitejs/plugin-react | `[React]` | Fast bundler |
| State | pinia | `[Vue]` | Store management |
| State | @reduxjs/toolkit / zustand | `[React]` | Store management |
| Routing | vue-router@^4.x | `[Vue]` | SPA navigation |
| Routing | react-router-dom@^6.x | `[React]` | SPA navigation |
| HTTP | axios | both | HTTP client |
| i18n | vue-i18n | `[Vue]` | Internationalization |
| i18n | react-i18next | `[React]` | Internationalization |
| Styles | tailwindcss | both | CSS utilities |
| Testing Unit | jest + @vue/test-utils | `[Vue]` | Component tests |
| Testing Unit | jest + @testing-library/react | `[React]` | Component tests |
| Testing Unit | @testing-library/jest-dom | both | DOM matchers |
| Testing Unit | axios-mock-adapter | both | Axios mock |
| Testing E2E | @playwright/test | both | E2E tests |

---

## 6. Execution Commands

### 6.1 Backend (Django)

```bash
# 1. Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Environment variables (create .env)
# DJANGO_SECRET_KEY=...
# DATABASE_URL=...
# EMAIL_HOST_PASSWORD=...

# 4. Migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Create test data
python manage.py create_fake_data --users 20 --products 50 --orders 30

# 7. Delete test data
python manage.py delete_fake_data --confirm

# 8. Run tests (scoped-first)
pytest core_app/tests/views/test_order_views.py -v
pytest core_app/tests/views/test_order_views.py core_app/tests/serializers/test_order_serializers.py -v

# 9. Coverage report (custom colored report — see BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md)
pytest --cov

# 10. Quality gate on specific files (from backend folder)
python3 scripts/test_quality_gate.py --suite backend \
  --include-file backend/core_app/tests/views/test_order_views.py

# 11. Full suite only for final validation/CI
pytest

# 12. Development server
python manage.py runserver  # http://localhost:8000

# 13. Production server (with gunicorn)
gunicorn core_project.wsgi:application --bind 0.0.0.0:8000
```

### 6.2 Frontend (Vue + Vite)

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Development server
npm run dev  # http://localhost:5173

# 3. Production build
npm run build

# 4. Preview build
npm run preview

# 5. Linting
npm run lint

# 6. Unit/component tests (scoped-first)
npm test -- test/stores/orderStore.test.js
npm test -- test/stores/orderStore.test.js test/components/OrderSummary.test.js

# 7. Unit/component coverage report (custom styled summary — see BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md)
npm run test:coverage

# 8. E2E tests (scoped-first)
npx playwright test e2e/flows/checkout.spec.js

# 9. Quality gate on specific files (from repo root)
python3 scripts/test_quality_gate.py --suite frontend-unit \
  --include-file frontend/test/stores/orderStore.test.js

python3 scripts/test_quality_gate.py --suite frontend-e2e \
  --include-file frontend/e2e/flows/checkout.spec.js

# 10. Full suite (only for final validation/CI)
npm run test
npm run e2e
```

### 6.3 Development Access URLs

| Resource | URL | Description |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | Vue application |
| API | http://localhost:8000/api/ | REST endpoints |
| Admin | http://localhost:8000/admin/ | Django Admin panel |
| API Docs | http://localhost:8000/api/docs/ | Documentation (if enabled) |

---

## 7. New Project Checklist

Use this list when starting a new project to ensure all standards defined in this document are followed.

### 7.1 Initial Setup

- [ ] Create repository with `backend/` and `frontend/` structure
- [ ] Configure `.gitignore` (venv, node_modules, .env, db.sqlite3, media/)
- [ ] Edit `README.md` with: environment setup, migrations, fake data, tests, servers
- [ ] Create `.env.example` file with required variables
- [ ] Create `TESTING_QUALITY_STANDARDS.md` (or copy from reference project)
- [ ] Create `TEST_QUALITY_GATE_REFERENCE.md` (or copy from reference project)
- [ ] Create `GLOBAL_RULES_GUIDELINES.md` with team development rules
- [ ] Define custom `AUTH_USER_MODEL` from the start
- [ ] Configure CORS for local frontend (localhost:5173)
- [ ] Configure JWT with appropriate expiration times

### 7.2 Backend

- [ ] Create folder structure: `models/`, `serializers/`, `views/`, `urls/`
- [ ] Implement User model with required fields
- [ ] Create separate serializers: List, Detail, CreateUpdate
- [ ] Implement views with `@api_view` and explicit permissions
- [ ] Organize URLs by functional module
- [ ] Configure Django Admin with detailed ModelAdmins
- [ ] Create `create_fake_data` and `delete_fake_data` commands
- [ ] Verify and integrate `django_attachments` if image galleries are required
- [ ] Implement services for complex business logic
- [ ] Define backend test hierarchy by domain (`models/`, `serializers/`, `views/`, etc.)
- [ ] Ensure minimum coverage per change: happy path + edge cases + error conditions
- [ ] Configure test execution in scoped-first + related regression mode
- [ ] **Coverage report setup (see `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` §2):**
  - [ ] Configure `backend/pytest.ini` with `DJANGO_SETTINGS_MODULE` and `addopts = -q`
  - [ ] Create custom coverage reporter in `backend/conftest.py` (suppress default report, render colored table)
  - [ ] Update app name filter in `conftest.py` to match your app name
  - [ ] Verify `pytest --cov` prints the custom coverage report

### 7.3 Frontend

- [ ] Configure Vite with proxy to backend (`/api` → localhost:8000)
- [ ] Implement HTTP service with JWT and refresh handling
- [ ] Create Pinia stores with standard CRUD pattern
- [ ] Configure router with auth guards
- [ ] Implement internationalization (i18n)
- [ ] Configure TailwindCSS
- [ ] Create reusable base components
- [ ] Implement global error handling
- [ ] Define unit/component test structure (`frontend/test/**`) and E2E (`frontend/e2e/**`)
- [ ] Ensure stable selector strategy for tests (roles/testid/data-*)
- [ ] Configure frontend test execution in scoped-first + related regression mode
- [ ] **Unit test coverage report setup (see `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md` §3):**
  - [ ] Configure `jest.config.cjs` with `coverageReporters: ['text', 'json-summary']`
  - [ ] Create `frontend/scripts/coverage-summary.cjs` (custom styled coverage reporter)
  - [ ] Update source path regex in `coverage-summary.cjs` to match your source directory
  - [ ] Add `test:coverage` script to `package.json`
  - [ ] Verify `npm run test:coverage` prints the custom coverage summary
- [ ] **E2E infrastructure setup (§3.9.4):**
  - [ ] Create `e2e/helpers/test.js` — custom test base with error logging fixture
  - [ ] Create `e2e/helpers/api.js` — `mockApi()` route interception helper
  - [ ] Create `e2e/helpers/auth.js` — `setAuthLocalStorage()` for authenticated routes
  - [ ] Create `e2e/helpers/captcha.js` — captcha bypass helper (if app uses captcha)
  - [ ] Configure `playwright.config.mjs` with `webServer`, timeouts, retries, and reporters
- [ ] **E2E Flow Coverage setup (§3.9.5–3.9.10):**
  - [ ] Create `e2e/flow-definitions.json` with initial user flows (at least P1 flows)
  - [ ] Create `e2e/reporters/flow-coverage-reporter.mjs` (copy from reference project or `E2E_FLOW_COVERAGE_REPORT_STANDARD.md`)
  - [ ] Register the custom reporter in `playwright.config.mjs`
  - [ ] Create `e2e/helpers/flow-tags.js` with tag constants per flow
  - [ ] Organize `e2e/` directories by functional module (one directory per module)
  - [ ] Tag all E2E tests with `@flow:<flow-id>` tags
  - [ ] Add `e2e-results/` to `.gitignore`
  - [ ] Run suite and verify Flow Coverage Report appears in terminal output
- [ ] **User Flow Map (§3.9.12):**
  - [ ] Create `docs/USER_FLOW_MAP.md` with all user flows listed in `flow-definitions.json`
  - [ ] Document steps, branches/variations, routes, and E2E coverage references for each flow
  - [ ] Group flows by role (Shared, Guest, User, Admin as applicable)
  - [ ] Verify every flow in `flow-definitions.json` has a corresponding entry in the map

### 7.4 Before Production

- [ ] Migrate to MySQL database
- [ ] Configure Redis for caching and sessions
- [ ] Move ALL credentials to environment variables
- [ ] Configure HTTPS and update CORS/CSRF
- [ ] Configure collectstatic for static files
- [ ] Configure media file server (S3, etc.)
- [ ] Implement appropriate logging
- [ ] Run `delete_fake_data --confirm`
- [ ] Review permissions on sensitive endpoints
- [ ] Frontend production build
- [ ] Run backend/frontend quality gate and review active exceptions
- [ ] Run related regression for critical modules before releasing

> **This document must be updated when new technologies, patterns or best practices are adopted by the team. For process and test quality rules, update the reference documents (`GLOBAL_RULES_GUIDELINES.md`, `TESTING_QUALITY_STANDARDS.md`) — not this document.**

---

## Annex A: Change Implementation Guide

> **Full reference:** `GLOBAL_RULES_GUIDELINES.md` — contains all process rules: commits, PRs, code review, logging, security, migrations, mocking and assertions. This annex is only a quick reference summary.

### A.1 Phase Checklist

```
BEFORE IMPLEMENTING
  □ Confirm the new behavior is consistent with business rules
  □ Identify affected areas (models, views, stores, tests)
  □ Review existing tests in those areas

DURING IMPLEMENTATION
  □ Write/update docstrings in English
  □ Follow established project patterns (§1.2 Principles)
  □ Create migrations if there are model changes
  □ Update fake data if there are new fields/relationships

AFTER IMPLEMENTING
  □ Add tests: happy path + edge cases + error conditions
  □ Run scoped tests + related regression from the same module
  □ Run quality gate (scoped) for modified files
  □ Update manual/documentation if there are user-visible changes

BEFORE MERGE/DEPLOY
  □ Code review completed
  □ All tests pass
  □ Breaking changes communicated to the team
  □ Environment variables documented if added
```

### A.2 Commit Format

```
FEAT: <what behavior or feature is added>
FIX: <what problem is fixed>
REFACTOR: <what was restructured without changing behavior>
TEST: <what was tested>
DOCS: <what documentation was updated>
CHORE: <config, deps, scripts>
```

> For the full PR, commit and code review standard: see `GLOBAL_RULES_GUIDELINES.md` §Commit/PR Format and §Code Review Focus Areas.

---

## Annex B: Test Quick Reference

Quick daily reference. For the full specification and examples see `TESTING_QUALITY_STANDARDS.md`.

### B.1 Anti-patterns to Avoid

| Anti-pattern | Symptom | Solution |
|---|---|---|
| **God Test** | A test verifies 10+ behaviors | Split into atomic tests, one per behavior |
| **Mystery Guest** | Test fails without a clear message; hidden dependency on a global fixture | Make fixtures explicit and minimal |
| **Eager Mocking** | Mock of internal classes/services; test passes even when core logic is broken | Mock only boundaries (HTTP, email, storage) |
| **Silent Mock** | `mock.return_value = True` without verifying it was called with the right args | Use `assert_called_once_with(...)` or verify observable effect |
| **Time Bomb** | `datetime.now()` hardcoded; fails in 2026 | Use `freeze_time` or inject the date |
| **Selector Roulette** | Selector by generated CSS class; breaks after visual refactor | Use `data-testid` or ARIA roles |
| **Sleep Walking** | `waitForTimeout(3000)` in E2E | Use `toBeVisible`, `toHaveURL`, `waitForResponse` |
| **Assertion Roulette** | Multiple asserts without message; hard to know which one failed | One assert per behavior or descriptive messages |
| **Conditional Test** | `if condition: assert X else: assert Y` inside the test | Split into two parameterized tests |
| **Loop Assert** | `for item in items: assert item.active` | Use `all()` with a single assertion or parametrize |

### B.2 Quality Gate Checks by Suite

#### Backend (pytest)

| Check | Signal | Level |
|-------|--------|-------|
| Test with no `assert` | `NO_ASSERTIONS` | Error |
| Empty test or only `pass` | `EMPTY_TEST` | Error |
| Name with conjunction (`_and_`) | `NO_CONJUNCTION` | Warning |
| Forbidden token in name | `NO_FORBIDDEN_TOKEN` | Warning |
| Inline payload with >5 fields | `INLINE_PAYLOAD` | Warning |
| Missing docstring on public function | `MISSING_DOCSTRING` | Warning (Ruff D) |
| Disordered import | `IMPORT_ORDER` | Warning (Ruff I) |
| `assertRaises` instead of `pytest.raises` | `PT027` | Warning (Ruff PT) |

#### Frontend Unit (Jest)

| Check | Signal | Level |
|-------|--------|-------|
| Test with no `expect(...)` | `NO_ASSERTIONS` | Error |
| Empty test | `EMPTY_TEST` | Error |
| Name with conjunction | `NO_CONJUNCTION` | Warning |
| Forbidden token in name | `NO_FORBIDDEN_TOKEN` | Warning |
| >8 `expect` in a single test | `TOO_MANY_ASSERTIONS` | Warning |
| Test >50 lines | `TEST_TOO_LONG` | Warning |

#### Frontend E2E (Playwright)

| Check | Signal | Level |
|-------|--------|-------|
| Test with no `expect(...)` | `NO_ASSERTIONS` | Error |
| `waitForTimeout(...)` present | `HARDCODED_TIMEOUT` | Warning |
| Selector by CSS class (`'.class'`) | `FRAGILE_SELECTOR` | Warning |
| `test.describe.serial` without justification | `SERIAL_WITHOUT_REASON` | Warning |
| Name with conjunction | `NO_CONJUNCTION` | Warning |

### B.3 Quick Reference Checklist

Use before committing new or modified tests:

```
Tests — Quick Reference Checklist
───────────────────────────────────────────────────────────────
Naming
  □ Test name describes action + result + condition
  □ No conjunctions (_and_, _or_) in the name
  □ No forbidden tokens (batch, all, misc, general, various)
  □ File in the correct directory for its domain

Assertions
  □ At least one assert/expect that verifies observable behavior
  □ No asserts inside loops or conditionals
  □ Happy path + edge case + error condition covered

Isolation
  □ Does not depend on execution order with other tests
  □ Global state cleaned in afterEach / teardown
  □ Time controlled with freeze_time / fake timers (if applicable)
  □ Environment variables via monkeypatch / @override_settings

Mocking
  □ Only boundaries are mocked: external HTTP, email, storage, queues
  □ No internal domain classes or methods are mocked
  □ No access to wrapper.vm.* (frontend) unless DOM alternative is absent

Selectors (frontend)
  □ Preference: getByRole > getByTestId > data-testid > visible text
  □ No selectors by generated CSS class or nth position
  □ No waitForTimeout in E2E

Flow Coverage (E2E)
  □ Every test has at least one @flow:<flow-id> tag
  □ Flow ID exists in flow-definitions.json
  □ New user flows added to flow-definitions.json before writing tests
  □ flow-tags.js constants updated if constants file is used
  □ Spec file lives in the correct module directory under e2e/
  □ "Tests Without Flow Tag" section is empty after run

Quality Gate
  □ Run in scoped mode for the modified files
  □ Score 100/100 or exceptions documented with justification
  □ Exceptions reviewed and not accumulated without reason
───────────────────────────────────────────────────────────────
```