# 🚀 Base Django Vue Feature

> Base template for developing projects with Django REST Framework + Vue 3 + Vite

This repository serves as a foundation for rapid implementation of future projects using Django backend and Vue 3 frontend, with RESTful architecture and JWT authentication.

[![Django](https://img.shields.io/badge/Django-6.0+-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Backend (Django)](#-backend-django)
- [Frontend (Vue)](#-frontend-vue)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Reference Projects](#-reference-projects)
- [Customization](#-customization)
- [Contributing](#-contributing)

---

## ✨ Features

### Backend (Django)
- ✅ **Django REST Framework** - Complete RESTful API with function-based views
- ✅ **JWT Authentication** - Simple JWT for tokens
- ✅ **Google OAuth** - Sign in with Google (`google-auth` + `google-auth-oauthlib`)
- ✅ **Custom User Model** - User with email as identifier and role-based permissions
- ✅ **Auth Service Layer** - Centralized authentication logic (`services/auth_service.py`)
- ✅ **Complete CRUD** - Blog, Product, Sale, User
- ✅ **Customized Django Admin** - Organized by sections
- ✅ **File Management** - `django-attachments` for images and files
- ✅ **Image Thumbnails** - `easy-thumbnails` for automatic resizing
- ✅ **Automatic File Cleanup** - `django-cleanup` removes orphan files
- ✅ **Fake Data Generation** - Management commands with Faker + factory-boy
- ✅ **Complete Tests** - Pytest for models, serializers, views, services, admin, forms, and commands
- ✅ **Linting** - Ruff for fast Python linting
- ✅ **Coverage Reporting** - Custom terminal coverage report with top-N focus files
- ✅ **CORS Configured** - Ready for local development
- ✅ **Environment Management** - `python-dotenv` with split settings (dev / prod)

### Frontend (Vue)
- ✅ **Vue 3 + Composition API** - With script setup
- ✅ **Vite** - Fast and modern build tool
- ✅ **Pinia** - State management with `pinia-plugin-persistedstate`
- ✅ **Vue Router** - SPA navigation with auth guards
- ✅ **Axios** - HTTP client with interceptors and token refresh
- ✅ **TailwindCSS 4** - Utility-first styling
- ✅ **Headless UI + Heroicons** - Accessible UI primitives and icons
- ✅ **Bootstrap Icons + Flowbite** - Additional icon set and UI components
- ✅ **SweetAlert2** - Beautiful notification dialogs
- ✅ **vue-i18n** - Multi-language internationalization (en/es)
- ✅ **GSAP** - Smooth animations
- ✅ **Google Login** - `vue3-google-login` integration
- ✅ **Composables** - `useAuth`, `useNotification`
- ✅ **Helpers & Utils** - Formatters, validators, notification helpers
- ✅ **Jest** - Unit and component tests
- ✅ **Playwright** - Modular E2E tests with flow coverage reporter
- ✅ **Reusable Components** - Carousels, filters, shopping cart

### DevOps & Tooling
- ✅ **Git Configuration** - Complete `.gitignore`, `.gitattributes`
- ✅ **Pre-commit Hook** - Test quality gate on staged test files
- ✅ **ESLint** - JavaScript linting
- ✅ **Ruff** - Python linting
- ✅ **Environment Variables** - Documented `.env.example` files (backend + frontend)
- ✅ **CI Workflow** - GitHub Actions test quality gate
- ✅ **Documentation** - Complete architecture, testing, and quality standards

---

## 🛠 Technologies

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Python | 3.10+ | Programming language |
| Django | 6.0+ | Web framework |
| Django REST Framework | 3.16+ | REST API toolkit |
| Simple JWT | 5.5+ | JWT authentication |
| django-cors-headers | 4.9+ | CORS middleware |
| django-attachments | Custom | File management |
| django-cleanup | 9.0+ | Automatic orphan file removal |
| easy-thumbnails | 2.10+ | Image thumbnail generation |
| google-auth | 2.48+ | Google OAuth verification |
| python-dotenv | 1.2+ | Environment variable management |
| Faker | 40.5+ | Fake data generation |
| factory-boy | 3.3+ | Test factories |
| freezegun | 1.5+ | Time mocking for tests |
| Pytest | 9.0+ | Testing framework |
| pytest-cov | 7.0+ | Coverage plugin |
| Ruff | 0.15+ | Python linter |

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| Vue.js | 3.5+ | Progressive framework |
| Vite | 6.4+ | Build tool |
| Pinia | 3.0+ | State management |
| pinia-plugin-persistedstate | 4.7+ | Persisted state |
| Vue Router | 5.0+ | Routing |
| vue-i18n | 11.2+ | Internationalization |
| Axios | 1.13+ | HTTP client |
| TailwindCSS | 4.2+ | CSS framework |
| Headless UI | 1.7+ | Accessible UI primitives |
| Heroicons | 2.2+ | SVG icons |
| Bootstrap Icons | 1.13+ | Icon set |
| Flowbite | 4.0+ | UI components |
| SweetAlert2 | 11.26+ | Notification dialogs |
| GSAP | 3.14+ | Animations |
| vue3-google-login | 2.0+ | Google OAuth |
| ESLint | 9.39+ | JavaScript linting |
| Jest | 29.7+ | Unit testing |
| Playwright | 1.58+ | E2E testing |

---

## 📁 Project Structure

```
base_django_vue_feature/
├── backend/                              # Django Backend
│   ├── base_feature_app/                # Main app
│   │   ├── models/                      # Blog, Product, Sale, User
│   │   ├── serializers/                 # List, Detail, CreateUpdate per model
│   │   ├── views/                       # Function-based CRUD views + auth
│   │   ├── urls/                        # URL routing by model
│   │   ├── forms/                       # Django forms (blog, product, user)
│   │   ├── services/                    # Business logic (auth_service)
│   │   ├── permissions/                 # Role-based permissions
│   │   ├── exceptions.py               # Custom exception classes
│   │   ├── tests/                       # Tests
│   │   │   ├── models/                  # Model tests
│   │   │   ├── serializers/             # Serializer tests
│   │   │   ├── views/                   # View/endpoint tests
│   │   │   ├── services/               # Service tests
│   │   │   ├── admin/                   # Admin tests
│   │   │   ├── forms/                   # Form tests
│   │   │   ├── management/             # Management command tests
│   │   │   ├── utils/                   # Utility & settings tests
│   │   │   ├── conftest.py              # App-level fixtures
│   │   │   └── factories.py            # factory-boy factories
│   │   └── management/commands/         # create_fake_data, delete_fake_data, silk_garbage_collect, etc.
│   ├── base_feature_project/            # Settings and configuration
│   │   ├── settings.py                  # Base settings (shared)
│   │   ├── settings_dev.py              # Development overrides
│   │   ├── settings_prod.py             # Production overrides
│   │   ├── urls.py                      # Root URL configuration
│   │   ├── wsgi.py / asgi.py            # Server entry points
│   │   └── __init__.py
│   ├── django_attachments/              # File management app
│   ├── conftest.py                      # Root pytest config (coverage report)
│   ├── .coveragerc                      # Coverage configuration
│   ├── pytest.ini                       # Pytest configuration
│   ├── requirements.txt                 # Python dependencies
│   └── .env.example                     # Environment variables (example)
│
├── frontend/                             # Vue Frontend
│   ├── src/
│   │   ├── components/                  # Vue components
│   │   │   ├── blog/                    # BlogCarousel, BlogPresentation
│   │   │   ├── product/                 # ProductCarousel, ShoppingCart, etc.
│   │   │   └── layouts/                 # Header, Footer, SearchBar
│   │   ├── views/                       # Pages/Views
│   │   │   ├── auth/                    # SignIn, SignUp
│   │   │   ├── blog/                    # List, Detail
│   │   │   ├── product/                 # Catalog, Detail, Checkout
│   │   │   ├── Home.vue, Dashboard.vue, Backoffice.vue
│   │   │   ├── AboutUs.vue, Contact.vue
│   │   │   └── NotFound.vue             # 404 page
│   │   ├── stores/                      # Pinia stores
│   │   │   ├── auth.js                  # Authentication + token management
│   │   │   ├── blog.js                  # Blog state
│   │   │   ├── product.js               # Product + Cart state
│   │   │   ├── language.js              # Language state
│   │   │   ├── i18n.js                  # vue-i18n integration store
│   │   │   └── services/request_http.js # HTTP request helpers
│   │   ├── services/http/               # API client + token utilities
│   │   ├── composables/                 # useAuth, useNotification
│   │   ├── helpers/                     # googleLogin, notification
│   │   ├── utils/                       # format, validators
│   │   ├── shared/                      # constants
│   │   ├── router/                      # Vue Router
│   │   ├── i18n/                        # Translations
│   │   └── mixins/                      # Global mixins
│   ├── test/                            # Unit & component tests (Jest)
│   │   ├── components/                  # Component tests
│   │   ├── stores/                      # Store tests
│   │   ├── composables/                 # Composable tests
│   │   ├── helpers/                     # Helper tests
│   │   ├── views/                       # View tests
│   │   ├── services/http/               # HTTP service tests
│   │   ├── router/                      # Router tests
│   │   ├── mixins/                      # Mixin tests
│   │   ├── utils/                       # Utility tests
│   │   └── e2e/                         # Legacy E2E tests
│   ├── e2e/                             # Modular E2E tests (Playwright)
│   │   ├── auth/                        # Login, logout, register, redirects
│   │   ├── blog/                        # Blog list, detail
│   │   ├── shopping/                    # Cart, catalog, checkout, product detail
│   │   ├── navigation/                  # Search, cart overlay, 404
│   │   ├── home/                        # Home carousels
│   │   ├── static/                      # Static pages
│   │   ├── helpers/                     # Auth helpers, flow tags, test utils
│   │   ├── reporters/                   # Flow coverage reporter
│   │   └── flow-definitions.json        # E2E flow definitions
│   ├── scripts/                         # Coverage & module helpers
│   ├── package.json                     # npm dependencies
│   ├── jest.config.cjs                  # Jest configuration
│   ├── playwright.config.mjs            # Playwright configuration
│   └── .env.example                     # Environment variables (example)
│
├── scripts/                              # Test & quality tooling
│   ├── run-tests-all-suites.py          # Global test runner (backend + unit + E2E)
│   ├── test_quality_gate.py             # Test quality gate CLI
│   └── quality/                         # Quality gate analyzer modules
│
├── docs/                                 # Project documentation
│   ├── DJANGO_VUE_ARCHITECTURE_STANDARD.md
│   ├── TESTING_QUALITY_STANDARDS.md
│   ├── BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md
│   ├── E2E_FLOW_COVERAGE_REPORT_STANDARD.md
│   ├── TEST_QUALITY_GATE_REFERENCE.md
│   ├── GLOBAL_RULES_GUIDELINES.md
│   └── USER_FLOW_MAP.md
│
├── .github/workflows/                    # CI pipelines
│   └── test-quality-gate.yml            # Quality gate GitHub Action
├── .pre-commit-config.yaml              # Pre-commit hooks
├── .gitignore                            # Git ignore rules
├── .gitattributes                        # Git attributes (line endings)
├── test-reports/                         # Test runner logs & resume metadata
├── test-results/                         # Quality gate reports
└── README.md                             # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/carlos18bp/base_django_vue_feature.git
cd base_django_vue_feature
```

### 2. Backend Setup

```bash
# Create virtual environment
python3 -m venv backend/venv

# Activate virtual environment
source backend/venv/bin/activate  # Linux/Mac
# backend\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Run migrations
cd backend
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create test data with defaults (optional)
python manage.py create_fake_data

# Create test data with custom counts (optional)
python manage.py create_fake_data --users 10 --blogs 20 --products 50 --sales 30

# Delete test data (optional — protects superusers)
python manage.py delete_fake_data --confirm

# Start server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 4. Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

---

## 🐍 Backend (Django)

### Environment Variables

Create a `backend/.env` file based on `backend/.env.example`:

```bash
# Core settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=true
# Settings module selection
# Local dev: base_feature_project.settings_dev
# Production: base_feature_project.settings_prod
# DJANGO_SETTINGS_MODULE=base_feature_project.settings_dev
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
DJANGO_CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
DJANGO_CSRF_TRUSTED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173

# Database (SQLite by default)
DJANGO_DB_ENGINE=django.db.backends.sqlite3
DJANGO_DB_NAME=db.sqlite3

# Production database (when using settings_prod)
# DB_NAME=your_db_name
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password
# DB_HOST=localhost
# DB_PORT=3306

# JWT
DJANGO_JWT_ACCESS_MINUTES=15
DJANGO_JWT_REFRESH_DAYS=7

# Google OAuth (optional)
DJANGO_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Email (optional)
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=true
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password
```

**Generate new SECRET_KEY:**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Available Models

| Model | Description | Main Fields |
|-------|-------------|------------|
| **User** | Custom user (email as identifier) | email, first_name, last_name, phone, role, is_active, date_joined |
| **Blog** | Blog entries | title, description, category, image, created_at, updated_at |
| **Product** | Products | title, category, sub_category, description, price, gallery, created_at, updated_at |
| **Sale** | Sales | email, address, city, state, postal_code, sold_products (M2M), created_at |
| **SoldProduct** | Products in a sale | product (FK), quantity, created_at, updated_at |

### API Endpoints

#### Authentication
```
POST   /api/token/                       # Get JWT tokens (access + refresh)
POST   /api/token/refresh/               # Refresh JWT token
POST   /api/sign_in/                     # Sign in (email + password)
POST   /api/sign_up/                     # Register new user
POST   /api/google_login/                # Sign in with Google OAuth
GET    /api/validate_token/              # Validate current token (auth)
```

#### Blog
```
GET    /api/blogs/                       # List blogs
POST   /api/blogs/create/                # Create blog (auth)
GET    /api/blogs/<id>/                  # Blog detail
PUT    /api/blogs/<id>/update/           # Update blog (auth)
DELETE /api/blogs/<id>/delete/           # Delete blog (auth)
```

#### Product
```
GET    /api/products/                    # List products
POST   /api/products/create/             # Create product (auth)
GET    /api/products/<id>/               # Product detail
PUT    /api/products/<id>/update/        # Update product (auth)
DELETE /api/products/<id>/delete/        # Delete product (auth)
```

#### Sale
```
POST   /api/create-sale/                 # Create sale (public checkout)
GET    /api/sales/                       # List sales (auth)
GET    /api/sales/<id>/                  # Sale detail (auth)
```

#### User
```
GET    /api/users/                       # List users (auth)
POST   /api/users/create/                # Create user
GET    /api/users/<id>/                  # User detail (auth)
PUT    /api/users/<id>/update/           # Update user (auth)
DELETE /api/users/<id>/delete/           # Delete user (auth)
```

### Management Commands

#### Create Fake Data

```bash
# Create all data with defaults (10 each)
python manage.py create_fake_data

# Create all data with a single count for every model
python manage.py create_fake_data 20

# Custom counts per model
python manage.py create_fake_data --users 10 --blogs 20 --products 50 --sales 30

# Only some models
python manage.py create_fake_data --blogs 10
python manage.py create_fake_data --products 20 --sales 10

# Individual commands
python manage.py create_fake_blogs 20
python manage.py create_fake_products 50
python manage.py create_fake_sales 30
python manage.py create_fake_users 10
```

**Note:** The `create_fake_users` command never deletes superusers or staff.

#### Delete Fake Data

```bash
# Delete all fake data (protects superusers)
python manage.py delete_fake_data --confirm
```

#### Silk Garbage Collect

Deletes `silk.models.Request` profiling records older than N days. Only meaningful when `ENABLE_SILK=true`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--days N` | `int` | `7` | Retention period in days |
| `--dry-run` | flag | `False` | Show what would be deleted without deleting |

```bash
# Delete records older than 7 days (default)
python manage.py silk_garbage_collect

# Custom retention period
python manage.py silk_garbage_collect --days=14

# Preview without deleting
python manage.py silk_garbage_collect --dry-run

# Preview with custom retention
python manage.py silk_garbage_collect --days=3 --dry-run
```

**Example output:**

```
Silk records older than 2026-02-19 04:00:00+00:00:
  - Requests to delete: 1243
Deleted 1243 records
```

```
Silk records older than 2026-02-19 04:00:00+00:00:
  - Requests to delete: 1243
DRY RUN: Nothing was deleted
```

> This command runs automatically every day at **4:00 AM** via the `silk_garbage_collection` Huey task (see [Task Queue](#%EF%B8%8F-task-queue)).

### Django Admin

Admin is organized in logical sections:

- **👥 User Management**: Users
- **📝 Blog Management**: Blogs, Libraries (images)
- **🛍️ Product Management**: Products, Galleries
- **💰 Sales Management**: Sales, SoldProducts

Access: http://localhost:8000/admin

---

## 🎨 Frontend (Vue)

### Environment Variables

Create a `frontend/.env` file based on `frontend/.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api

# App Configuration
VITE_APP_NAME="Base Django Vue Feature"
VITE_APP_VERSION=1.0.0
VITE_DEFAULT_LANG=en

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
```

**Note:** In Vite, variables must start with `VITE_` to be accessible. Changes require a dev server restart.

### Store Structure (Pinia)

#### Auth Store (`stores/auth.js`)
```javascript
// State
{ user, token, accessToken, refreshToken }

// Actions
login(data)                    // Set tokens + user from response
signIn({ email, password })    // Authenticate via API
logout() / signOut()           // Clear tokens + user
validateToken()                // Verify token with backend
checkAuth()                    // Full auth check

// Getters
isAuthenticated                // Boolean: token + user.id present

// Persisted via pinia-plugin-persistedstate
```

#### Blog Store (`stores/blog.js`)
```javascript
// State
{ blogs: [], dataLoaded: false }

// Actions
fetchBlogs()                   // Fetch once, skip if loaded

// Getters
blogById(id)                   // Find blog by ID
```

#### Product Store (`stores/product.js`)
```javascript
// State
{ products: [], categories: [], filteredProducts: [], cartProducts: [], dataLoaded: false }

// Actions
fetchProducts()                // Fetch + extract categories
addProductToCart(product, qty)  // Add/increment cart item
removeProductFromCart(product)  // Decrement/remove cart item
productBySubCategory()         // Filter by checked sub-categories
createSale(form)               // Submit checkout

// Getters
productById(id)
productsByName(name)
totalCartProducts
totalCartPrice
```

#### Language Store (`stores/language.js`)
```javascript
// State
{ currentLanguage: 'en' }

// Actions
setCurrentLanguage(lang)

// Getters
getCurrentLanguage
```

#### i18n Store (`stores/i18n.js`)
```javascript
// State
{ locale: 'en' }

// Actions
setLocale(newLocale)           // Switch locale, persist, sync vue-i18n

// Getters
currentLocale
supportedLocales               // ['en', 'es']
```

### Main Components

#### Blog
- **BlogCarousel** - Featured blogs carousel
- **BlogPresentation** - Blog presentation card

#### Product
- **ProductCarousel** - Products carousel
- **CategoryFilter** - Category filter
- **SubCategoryFilter** - Subcategory filter
- **ShoppingCart** - Shopping cart with animations
- **CartProduct** - Cart item

#### Layouts
- **Header** - Main navigation
- **Footer** - Footer
- **SearchBar** - Global search

### Available Views

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Home page |
| `/blogs` | blog/List | Blog list |
| `/blog/:blog_id` | blog/Detail | Blog detail |
| `/catalog` | product/Catalog | Product catalog |
| `/product/:product_id` | product/Detail | Product detail |
| `/checkout` | product/Checkout | Checkout |
| `/sign_in` | auth/SignIn | Sign in (guest only) |
| `/sign_up` | auth/SignUp | Sign up (guest only) |
| `/dashboard` | Dashboard | Dashboard (auth) |
| `/backoffice` | Backoffice | Backoffice (auth) |
| `/about_us` | AboutUs | About us |
| `/contact` | Contact | Contact |
| `/:pathMatch(.*)*` | NotFound | 404 page |

### NPM Scripts

```bash
# Development
npm run dev                # Development server

# Build
npm run build              # Production build
npm run preview            # Preview build

# Unit Testing (Jest)
npm run test               # Run all unit tests
npm run test:coverage      # Unit tests with coverage report

# E2E Testing (Playwright)
npm run e2e                # Run all E2E tests
npm run e2e:ui             # Playwright with interactive UI
npm run e2e:headed         # Run tests in headed browser
npm run e2e:coverage       # E2E + user flow coverage report
npm run e2e:report         # Show last HTML report

# E2E — viewport filters
npm run e2e:desktop        # Desktop Chrome only
npm run e2e:mobile         # Mobile Chrome (Pixel 5) only
npm run e2e:tablet         # Tablet (iPad Mini) only

# E2E — module helpers
npm run e2e:modules        # List available E2E modules
npm run e2e:module -- auth # Run a single module
npm run e2e:coverage:module -- auth  # Module-scoped coverage

# Cleanup
npm run e2e:clean          # Remove test-results, playwright-report, e2e-results

# Linting
npm run lint               # Run ESLint
```

---

## 🧪 Testing

### Global Test Runner (Backend + Frontend + E2E)

Run **backend pytest**, **frontend unit (Jest)**, and **frontend E2E (Playwright)** from a single command. By default suites run **sequentially** with verbose output; use `--parallel` for parallel execution with a live progress indicator. Use `--resume` to re-run only failed/unknown suites from the last run.

```bash
# From repo root — sequential (default)
python3 scripts/run-tests-all-suites.py

# Parallel mode
python3 scripts/run-tests-all-suites.py --parallel

# Resume failed/unknown suites from last run
python3 scripts/run-tests-all-suites.py --resume

# Skip a suite
python3 scripts/run-tests-all-suites.py --skip-e2e
python3 scripts/run-tests-all-suites.py --skip-backend --skip-unit

# Pass extra args to individual suites
python3 scripts/run-tests-all-suites.py --backend-args="-k test_user" --e2e-args="--headed"

# Control worker counts
python3 scripts/run-tests-all-suites.py --unit-workers=2 --e2e-workers=1

# Force output mode
python3 scripts/run-tests-all-suites.py --parallel --verbose
python3 scripts/run-tests-all-suites.py --quiet

# Enable coverage reporting (opt-in)
python3 scripts/run-tests-all-suites.py --coverage
```

**What it does:**
- Runs up to 3 suites (backend, frontend-unit, frontend-e2e), sequential by default.
- In parallel mode, shows a live progress bar with per-suite status and elapsed time.
- Keeps going even if a suite fails so you get all reports.
- Prints a final summary with per-suite status and duration. Coverage highlights appear only when `--coverage` is enabled.
- `--resume` re-runs only failed/unknown suites based on `test-reports/last-run.json`.
- Without `--resume`, logs and resume metadata are overwritten at the start of a run.
- Jest output is run with `--silent` in this runner to avoid noisy console logs; run `npm run test` directly if you need console output.

**Outputs:**
- Logs per suite: `test-reports/backend.log`, `test-reports/frontend-unit.log`, `test-reports/frontend-e2e.log`
- Backend coverage: terminal summary (only with `--coverage`)
- Frontend unit coverage: `frontend/coverage/coverage-summary.json` (only with `--coverage`)
- Frontend E2E flow coverage: `frontend/e2e-results/flow-coverage.json` (only with `--coverage`)
- Resume metadata: `test-reports/last-run.json`

### Backend (Pytest)

#### Run Tests

```bash
cd backend

# All tests
pytest

# With coverage
pytest --cov

# Specific tests
pytest base_feature_app/tests/models/
pytest base_feature_app/tests/serializers/
pytest base_feature_app/tests/views/

# Single file tests
pytest base_feature_app/tests/models/test_user_model.py

# Verbose tests
pytest -v
```

#### Test Coverage

- ✅ **Models**: User, Blog, Product, Sale, SoldProduct, cascade deletes
- ✅ **Serializers**: List, Detail, CreateUpdate for all models + media serializers
- ✅ **Views**: CRUD endpoints, auth endpoints, JWT, public endpoints, permissions
- ✅ **Services**: Auth service (sign in, sign up, Google login)
- ✅ **Admin**: Admin site registration and configuration
- ✅ **Forms**: Blog, Product, User forms
- ✅ **Management**: Fake data creation, deletion, and Silk garbage collection commands
- ✅ **Utils**: Email script, exceptions, settings modules, global test runner

#### Test Structure

```
backend/base_feature_app/tests/
├── conftest.py                       # App-level fixtures
├── factories.py                      # factory-boy factories
├── models/
│   ├── test_user_model.py
│   ├── test_blog_model.py
│   ├── test_product_model.py
│   ├── test_sale_model.py
│   └── test_models_delete.py
├── serializers/
│   ├── test_user_serializers.py
│   ├── test_blog_serializers.py
│   ├── test_product_serializers.py
│   ├── test_sale_serializer.py
│   └── test_media_serializers.py
├── views/
│   ├── test_auth_endpoints.py
│   ├── test_crud_endpoints.py
│   ├── test_crud_endpoints_extended.py
│   ├── test_crud_permissions.py
│   ├── test_jwt_endpoints.py
│   ├── test_public_endpoints.py
│   └── test_urls.py
├── services/
│   └── test_auth_service.py
├── admin/
│   └── test_admin.py
├── forms/
│   └── test_forms.py
├── management/
│   └── test_commands.py
└── utils/
    ├── test_email_script.py
    ├── test_exceptions.py
    ├── test_run_tests_all_suites.py
    └── test_settings_modules.py
```

### Frontend (Jest + Playwright)

#### Unit Tests (Jest)

```bash
cd frontend

# All tests
npm run test

# With coverage
npm run test:coverage

# Specific tests
npm test -- test/stores/auth.test.js
npm test -- test/components/ShoppingCart.test.js
```

#### Unit Test Coverage

- ✅ **Stores**: auth, blog, product, language, i18n, services/request_http
- ✅ **Components**: ShoppingCart, CartProduct, BlogCarousel, ProductCarousel
- ✅ **Views**: Home, Dashboard, SignIn
- ✅ **Composables**: useAuth, useNotification
- ✅ **Helpers**: googleLogin, notification
- ✅ **Services**: HTTP client, tokens
- ✅ **Router**: Route definitions, auth guards
- ✅ **Mixins**: globalMixin
- ✅ **Utils**: format, validators

#### E2E Tests (Playwright)

```bash
cd frontend

# Install browsers (first time)
npx playwright install

# Run all E2E tests
npm run e2e

# Run tests + flow coverage report
npm run e2e:coverage

# List available E2E modules
npm run e2e:modules

# Run a single module (example: auth)
npm run e2e:module -- auth
npm run e2e:module -- --module auth --clean

# Module-scoped coverage
npm run e2e:coverage:module -- auth
npm run e2e:coverage:module -- --module auth --clean

# Per-viewport filtering
npm run e2e:desktop          # Desktop Chrome only
npm run e2e:mobile           # Mobile Chrome (Pixel 5) only
npm run e2e:tablet           # Tablet (iPad Mini) only

# Combine viewport filter with a specific spec
npm run e2e:desktop -- e2e/auth/auth-login.spec.js

# With interactive UI
npm run e2e:ui

# Headed mode
npm run e2e:headed
```

**Note:** `--grep @module:<name>` only runs tests tagged with that module. When you run a subset, the flow coverage report will still list other modules/flows as missing because they were not executed.

**Note:** E2E tests automatically start both Vite and Django dev servers. Keep backend available to avoid proxy errors.

#### Unit Test Structure

```
frontend/test/
├── HelloWorld.test.js
├── components/
│   ├── BlogCarousel.test.js
│   ├── CartProduct.test.js
│   ├── ProductCarousel.test.js
│   └── ShoppingCart.test.js
├── stores/
│   ├── auth.test.js
│   ├── blog.test.js
│   ├── product.test.js
│   ├── language.test.js
│   ├── i18n.test.js
│   └── services/request_http.test.js
├── composables/
│   ├── useAuth.test.js
│   └── useNotification.test.js
├── helpers/
│   ├── googleLogin.test.js
│   └── notification.test.js
├── views/
│   ├── Home.test.js
│   ├── Dashboard.test.js
│   └── SignIn.test.js
├── services/http/
│   ├── client.test.js
│   └── tokens.test.js
├── router/
│   └── router.test.js
├── mixins/
│   └── globalMixin.test.js
├── utils/
│   ├── format.test.js
│   └── validators.test.js
└── e2e/                             # Legacy E2E tests
    ├── auth.spec.js
    ├── blog.spec.js
    ├── product.spec.js
    ├── navigation.spec.js
    ├── home.spec.js
    ├── header.spec.js
    ├── static-pages.spec.js
    ├── responsive.spec.js
    └── helpers.js
```

#### E2E Test Structure (Modular)

```
frontend/e2e/
├── auth/
│   ├── auth-login.spec.js
│   ├── auth-logout.spec.js
│   ├── auth-register.spec.js
│   ├── auth-protected-redirect.spec.js
│   └── auth-guest-redirect.spec.js
├── blog/
│   ├── blog-list.spec.js
│   └── blog-detail.spec.js
├── shopping/
│   ├── shopping-catalog.spec.js
│   ├── shopping-product-detail.spec.js
│   ├── shopping-cart.spec.js
│   └── shopping-checkout.spec.js
├── navigation/
│   ├── navigation-search.spec.js
│   ├── navigation-cart-overlay.spec.js
│   └── navigation-not-found.spec.js
├── home/
│   └── home-carousels.spec.js
├── static/
│   └── static-pages.spec.js
├── helpers/
│   ├── auth.js
│   ├── flow-tags.js
│   └── test.js
├── reporters/
│   └── flow-coverage-reporter.mjs
├── flow-definitions.json
└── README.md
```

---

## 📚 Documentation

The project includes complete documentation:

### Available Guides

| File | Description |
|------|-------------|
| **docs/DJANGO_VUE_ARCHITECTURE_STANDARD.md** | Full architecture standard (models, views, stores, router, i18n, admin, fake data, tests) |
| **docs/TESTING_QUALITY_STANDARDS.md** | Test quality standards (naming, assertions, isolation, anti-patterns) |
| **docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md** | Backend & frontend coverage report configuration |
| **docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md** | E2E flow coverage reporter & flow definitions |
| **docs/TEST_QUALITY_GATE_REFERENCE.md** | Quality gate checks reference |
| **docs/USER_FLOW_MAP.md** | End-to-end user flow map by module |
| **docs/GLOBAL_RULES_GUIDELINES.md** | Global development rules & guidelines |
| **README.md** | This file — general project documentation |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/run-tests-all-suites.py` | Global test runner (sequential by default; backend + frontend unit + E2E) |
| `scripts/test_quality_gate.py` | Test quality gate CLI |
| `scripts/quality/` | Quality gate analyzer modules |

### Configuration Files

| File | Purpose |
|------|---------|
| `.gitignore` | Files to ignore in Git (complete and organized) |
| `.gitattributes` | Line endings and diff configuration |
| `.pre-commit-config.yaml` | Pre-commit hooks (test quality gate on staged tests) |
| `.github/workflows/test-quality-gate.yml` | GitHub Actions CI workflow |
| `backend/.env.example` | Environment variables template (backend) |
| `backend/.coveragerc` | Coverage configuration |
| `backend/pytest.ini` | Pytest configuration |
| `frontend/.env.example` | Environment variables template (frontend) |
| `frontend/.eslintrc.cjs` | ESLint configuration |
| `frontend/jest.config.cjs` | Jest configuration |
| `frontend/playwright.config.mjs` | Playwright configuration |
| `frontend/tailwind.config.js` | TailwindCSS configuration |
| `frontend/postcss.config.js` | PostCSS configuration |
| `frontend/vite.config.js` | Vite configuration |

---

## 🔒 Environment Configuration

This project uses environment variables for configuration. Copy the example file and configure your environment:

```bash
cp backend/.env.example backend/.env
# Edit .env with your values
```

See `backend/.env.example` for all available options.

**Settings are split into three files:**

| File | Purpose |
|------|---------|
| `settings.py` | Base/shared settings |
| `settings_dev.py` | Development overrides (SQLite, DEBUG=True, console email) |
| `settings_prod.py` | Production overrides (MySQL, DEBUG=False, security hardening) |

Select the settings module via `DJANGO_SETTINGS_MODULE` environment variable.

## 💾 Backups

Automated backups run every 20 days via Huey task queue (days 1 & 21, 3:00 AM). Backups are stored in `/var/backups/base_feature_project/` with retention of ~5 backups.

Storage is configured via the `STORAGES['dbbackup']` key using the path from `BACKUP_STORAGE_PATH` env var.

Manual backup (creates compressed backup and removes old ones):

```bash
python manage.py dbbackup --compress --clean
python manage.py mediabackup --compress --clean
```

Manual backup without cleanup:

```bash
python manage.py dbbackup --compress
python manage.py mediabackup --compress
```

## 📊 Performance Monitoring

SQL query profiling via `django-silk`. Enable with `ENABLE_SILK=true` in `.env`.

**Headless mode only** — the `/silk/` UI is not exposed. Silk records requests and SQL queries to the database; analysis is done exclusively via the weekly automated report.

**What is monitored:**
- SQL query duration (`time_taken`) per request
- Query count per request (N+1 detection)

**Weekly report** generated every Monday at 8:00 AM → `backend/logs/silk-weekly-report.log`:
- Slow queries above `SLOW_QUERY_THRESHOLD_MS` (default: 500ms), top 50
- Requests with more than `N_PLUS_ONE_THRESHOLD` queries (default: 10), top 20

**Configurable thresholds** (in `.env`):
```bash
SLOW_QUERY_THRESHOLD_MS=500
N_PLUS_ONE_THRESHOLD=10
```

Old profiling data is purged daily at 4:00 AM via `silk_garbage_collection` (7-day retention by default, configurable via `--days`).

## ⚙️ Task Queue

This project uses Huey with Redis for background tasks:

| Task | Schedule | Description |
|------|----------|-------------|
| `scheduled_backup` | Days 1 & 21, 3:00 AM | DB and media backup |
| `silk_garbage_collection` | Daily, 4:00 AM | Clean old profiling data |
| `weekly_slow_queries_report` | Mondays, 8:00 AM | Performance report |

In production, ensure the Huey service is running:

```bash
sudo systemctl status base_feature_project-huey
```

---

## 🎯 Reference Projects

Real implementation examples built on top of this base:

### E-commerce
- [🕯️ Candle Project](https://github.com/carlos18bp/candle_project) — Artisanal candles store with Square payments, product reviews, shopping cart, bilingual (EN/ES), and full E2E coverage
- [💘 CrushMe](https://github.com/carlos18bp/crushme_project) — Wishlist-sharing e-commerce with dual payments (PayPal + Wompi), WooCommerce sync, offline translation, and dual auth (JWT + session)

### Platform & NFC
- [📌 TapTag](https://github.com/gustavop-dev/taptag) — NFC digital business card platform with 8 Django apps, multi-tenant user sites, product catalog, and dual HTTP clients

### Agency & Proposals
- [💼 ProjectApp](https://github.com/gustavop-dev/projectapp) — Software agency platform with dynamic 12-section proposal system, expiration workflows, GSAP animations, and Nuxt 3 frontend

### Interactive / Creative
- [🌅 Azurita](https://github.com/gustavop-dev/azurita) — Interactive advent calendar with Vue 3 + TypeScript, GSAP animations, and lightweight SQLite setup

### Also see
- [🚀 Base Django React Next Feature](https://github.com/carlos18bp/base_django_react_next_feature) — Companion template for Django + Next.js + React projects (TypeScript, Zustand, next-intl)

---

## 🔧 Customization

### Change Project Name

If you want to use this base for a new project:

1. **Search and replace** all occurrences of `base_feature`:

```bash
# Use ag (the silver searcher) or grep
ag base_feature
# Or
grep -r "base_feature" .

# Replace in files
find . -type f -exec sed -i 's/base_feature/your_new_name/g' {} +
```

2. **Rename directories**:

```bash
mv backend/base_feature_project backend/your_project
mv backend/base_feature_app backend/your_app
```

3. **Update imports** in Python and references in configuration.

### Add New Models

1. Create model in `backend/base_feature_app/models/`
2. Create serializers (List, Detail, CreateUpdate)
3. Create views in `views/`
4. Add URLs in `urls/`
5. Register in admin (`admin.py`)
6. Create fake data command if needed
7. Write tests (models, serializers, views)

### Add New Views/Pages

1. Create component in `frontend/src/views/`
2. Add route in `router/index.js`
3. Update Pinia store if needed
4. Create reusable components in `components/`
5. Write unit and e2e tests

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a suggestion:

1. **Fork** the project
2. Create a **branch** for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### Code Standards

- **Global & Architecture**: Follow the guidelines and architecture described in
  [docs/GLOBAL_RULES_GUIDELINES.md](docs/GLOBAL_RULES_GUIDELINES.md) and
  [docs/DJANGO_VUE_ARCHITECTURE_STANDARD.md](docs/DJANGO_VUE_ARCHITECTURE_STANDARD.md).
- **Backend**: Follow PEP 8 (enforced by `ruff`) along with the standards above.
- **Frontend**: Follow ESLint configuration along with the standards above.
- **Tests & Quality**: Apply the standards defined in
  [docs/TESTING_QUALITY_STANDARDS.md](docs/TESTING_QUALITY_STANDARDS.md),
  [docs/TEST_QUALITY_GATE_REFERENCE.md](docs/TEST_QUALITY_GATE_REFERENCE.md), and the coverage reports in
  [docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md](docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md) and
  [docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md](docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md).
- **User Flows**: Align changes with the flow map in
  [docs/USER_FLOW_MAP.md](docs/USER_FLOW_MAP.md).
- **Commits**: Descriptive messages in English.

---

## 📄 License

This project is under the MIT License. See `LICENSE` file for more details.

---

## 👤 Author

**Carlos Buitrago**

- GitHub: [@carlos18bp](https://github.com/carlos18bp)

---

## 🙏 Acknowledgments

- Django REST Framework for the excellent toolkit
- Vue.js team for Vue 3 and the ecosystem
- Vite for the incredible developer experience
- All contributors of the libraries used

---

**⭐ If this project helps you, consider giving it a star!**

*Last updated: February 2026*
