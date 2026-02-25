# 🚀 Base Django Vue Feature

> Base template for developing projects with Django REST Framework + Vue 3 + Vite

This repository serves as a foundation for rapid implementation of future projects using Django backend and Vue 3 frontend, with RESTful architecture and JWT authentication.

[![Django](https://img.shields.io/badge/Django-4.2+-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.0+-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
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
- [Contributing](#-contributing)

---

## ✨ Features

### Backend (Django)
- ✅ **Django REST Framework** - Complete RESTful API
- ✅ **JWT Authentication** - Simple JWT for tokens
- ✅ **Custom User Model** - User with email as identifier
- ✅ **Complete CRUD** - Blog, Product, Sale, User
- ✅ **Customized Django Admin** - Organized by sections
- ✅ **File Management** - django-attachments for images and files
- ✅ **Fake Data Generation** - Management commands for test data
- ✅ **Complete Tests** - Pytest for models, serializers, and views
- ✅ **CORS Configured** - Ready for local development

### Frontend (Vue)
- ✅ **Vue 3 + Composition API** - With script setup
- ✅ **Vite** - Fast and modern build tool
- ✅ **Pinia** - State management
- ✅ **Vue Router** - SPA navigation
- ✅ **Axios** - HTTP client with interceptors
- ✅ **TailwindCSS** - Utility-first styling
- ✅ **i18n** - Multi-language internationalization
- ✅ **GSAP** - Smooth animations
- ✅ **Jest** - Unit and integration tests
- ✅ **Playwright** - E2E tests
- ✅ **Reusable Components** - Carousels, filters, shopping cart

### DevOps & Tooling
- ✅ **Git Configuration** - Complete .gitignore, .gitattributes
- ✅ **EditorConfig** - Consistent code standards
- ✅ **Prettier** - Automatic code formatting
- ✅ **Environment Variables** - Documented .env.example files
- ✅ **Documentation** - Complete configuration guides

---

## 🛠 Technologies

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Python | 3.10+ | Programming language |
| Django | 4.2+ | Web framework |
| Django REST Framework | 3.14+ | REST API toolkit |
| Simple JWT | 5.3+ | JWT authentication |
| django-cors-headers | 4.3+ | CORS middleware |
| django-attachments | Custom | File management |
| Faker | Latest | Fake data generation |
| Pytest | Latest | Testing framework |

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| Vue.js | 3.4+ | Progressive framework |
| Vite | 5.0+ | Build tool |
| Pinia | 2.1+ | State management |
| Vue Router | 4.2+ | Routing |
| Axios | 1.6+ | HTTP client |
| TailwindCSS | 3.4+ | CSS framework |
| GSAP | 3.12+ | Animations |
| Jest | 29.7+ | Unit testing |
| Playwright | 1.40+ | E2E testing |

---

## 📁 Project Structure

```
base_django_vue_feature/
├── backend/                          # Django Backend
│   ├── base_feature_app/            # Main app
│   │   ├── models/                  # Blog, Product, Sale, User
│   │   ├── serializers/             # List, Detail, CreateUpdate
│   │   ├── views/                   # CRUD ViewSets
│   │   ├── urls/                    # URL routing by model
│   │   ├── forms/                   # Django forms
│   │   ├── tests/                   # Tests (models, serializers, views)
│   │   └── management/commands/     # create_fake_data, delete_fake_data
│   ├── base_feature_project/        # Settings and configuration
│   ├── django_attachments/          # File management app
│   ├── requirements.txt             # Python dependencies
│   ├── pytest.ini                   # Pytest configuration
│   └── .env.example                 # Environment variables (example)
│
├── frontend/                         # Vue Frontend
│   ├── src/
│   │   ├── components/              # Vue components
│   │   │   ├── blog/                # BlogCarousel, BlogPresentation
│   │   │   ├── product/             # ProductCarousel, ShoppingCart, etc.
│   │   │   └── layouts/             # Header, Footer, SearchBar
│   │   ├── views/                   # Pages/Views
│   │   │   ├── auth/                # SignIn
│   │   │   ├── blog/                # List, Detail
│   │   │   ├── product/             # Catalog, Detail, Checkout
│   │   │   ├── Home.vue
│   │   │   ├── Dashboard.vue
│   │   │   └── Backoffice.vue
│   │   ├── stores/                  # Pinia stores
│   │   │   ├── auth.js              # Authentication
│   │   │   ├── blog.js              # Blog state
│   │   │   ├── product.js           # Product + Cart state
│   │   │   └── language.js          # i18n state
│   │   ├── services/http/           # API clients
│   │   ├── router/                  # Vue Router
│   │   ├── i18n/                    # Translations
│   │   └── mixins/                  # Global mixins
│   ├── test/                        # Tests
│   │   ├── components/              # Component tests
│   │   ├── stores/                  # Store tests
│   │   └── e2e/                     # Playwright tests
│   ├── package.json                 # npm dependencies
│   ├── jest.config.cjs              # Jest configuration
│   ├── playwright.config.mjs        # Playwright configuration
│   └── .env.example                 # Environment variables (example)
│
├── scripts/                          # Test & quality tooling
│   ├── run-tests-all-suites.py     # Global test runner (sequential by default; backend + unit + E2E)
│   ├── test_quality_gate.py        # Test quality gate CLI
│   └── quality/                    # Quality gate analyzers
│
├── docs/                            # Project documentation
│   ├── BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md
│   ├── DJANGO_VUE_ARCHITECTURE_STANDARD.md
│   ├── E2E_FLOW_COVERAGE_REPORT_STANDARD.md
│   ├── TESTING_QUALITY_STANDARDS.md
│   └── TEST_QUALITY_GATE_REFERENCE.md
│
├── .gitignore                       # Git ignore rules
├── .gitattributes                   # Git attributes (line endings)
├── .editorconfig                    # Editor config
├── .prettierrc                      # Prettier config
└── README.md                        # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/carlos18bp/base_feature.git
cd base_feature
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

# Create test data (optional)
python manage.py create_fake_data --users 10 --blogs 20 --products 50 --sales 30

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

# Production settings_prod database variables
# DB_NAME=your_db_name
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password
# DB_HOST=localhost
# DB_PORT=3306

# JWT
DJANGO_JWT_ACCESS_MINUTES=15
DJANGO_JWT_REFRESH_DAYS=7
```

**Generate new SECRET_KEY:**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Available Models

| Model | Description | Main Fields |
|-------|-------------|------------|
| **User** | Custom user | email, first_name, last_name, phone, role |
| **Blog** | Blog entries | title, description, image, created_at |
| **Product** | Products | title, description, price, category, subcategory, gallery |
| **Sale** | Sales | customer, total_price, created_at |
| **SoldProduct** | Sold products | sale, product, quantity, unit_price |

### API Endpoints

#### Authentication (JWT)
```
POST   /api/token/              # Get tokens (access + refresh)
POST   /api/token/refresh/      # Refresh token
```

#### Blog
```
GET    /api/blogs-data/         # List blogs
POST   /api/blogs/              # Create blog (auth)
GET    /api/blogs/<id>/         # Blog detail
PUT    /api/blogs/<id>/         # Update blog (auth)
DELETE /api/blogs/<id>/         # Delete blog (auth)
```

#### Product
```
GET    /api/products-data/      # List products
POST   /api/products/           # Create product (auth)
GET    /api/products/<id>/      # Product detail
PUT    /api/products/<id>/      # Update product (auth)
DELETE /api/products/<id>/      # Delete product (auth)
```

#### Sale
```
GET    /api/sales/              # List sales (auth)
POST   /api/sales/              # Create sale
GET    /api/sales/<id>/         # Sale detail (auth)
PUT    /api/sales/<id>/         # Update sale (auth)
DELETE /api/sales/<id>/         # Delete sale (auth)
```

#### User
```
GET    /api/users/              # List users (admin)
POST   /api/users/              # Create user
GET    /api/users/<id>/         # User detail (auth)
PUT    /api/users/<id>/         # Update user (auth)
DELETE /api/users/<id>/         # Delete user (auth)
```

### Management Commands

#### Create Fake Data

```bash
# Create all data
python manage.py create_fake_data --users 10 --blogs 20 --products 50 --sales 30

# Only some models
python manage.py create_fake_data --blogs 10
python manage.py create_fake_data --products 20 --sales 10

# Individual options
python manage.py create_blogs 20
python manage.py create_products 50
python manage.py create_sales 30
python manage.py create_users 10
```

**Note:** The `create_users` command never deletes superusers or staff.

#### Delete Fake Data

```bash
# Delete all fake data (protects superusers)
python manage.py delete_fake_data --confirm
```

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
```

**Note:** In Vite, variables must start with `VITE_` to be accessible.

### Store Structure (Pinia)

#### Auth Store (`stores/auth.js`)
```javascript
// State
{ accessToken, refreshToken }

// Actions
signIn(email, password)
signOut()

// Getters
isAuthenticated
```

#### Blog Store (`stores/blog.js`)
```javascript
// State
{ blogs: [] }

// Actions
fetchBlogs()

// Getters
blogById(id)
```

#### Product Store (`stores/product.js`)
```javascript
// State
{ products: [], cart: [] }

// Actions
fetchProducts()
addProductToCart(product, quantity)
removeProductFromCart(productId)
createSale(customer)

// Getters
productById(id)
totalCartProducts
totalCartPrice
```

#### Language Store (`stores/language.js`)
```javascript
// State
{ currentLanguage: 'en' }

// Actions
setLanguage(lang)
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
| `/blog/:id` | blog/Detail | Blog detail |
| `/products` | product/Catalog | Product catalog |
| `/product/:id` | product/Detail | Product detail |
| `/checkout` | product/Checkout | Checkout |
| `/signin` | auth/SignIn | Sign in |
| `/dashboard` | Dashboard | Dashboard (auth) |
| `/backoffice` | Backoffice | Backoffice (auth) |
| `/about` | AboutUs | About us |
| `/contact` | Contact | Contact |

### NPM Scripts

```bash
# Development
npm run dev              # Development server

# Build
npm run build            # Production build
npm run preview          # Preview build

# Testing
npm run test             # Tests with Jest
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Tests with coverage

# E2E
npm run e2e              # Playwright tests
npm run e2e:ui           # Playwright with UI
npm run e2e:coverage     # Playwright + V8 coverage report

# Linting & Formatting
npm run lint             # Run ESLint
npm run format           # Format with Prettier
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

- ✅ **Models**: User, Blog, Product, Sale, SoldProduct
- ✅ **Serializers**: List, Detail, CreateUpdate for all models
- ✅ **Views**: CRUD endpoints, JWT, public endpoints

#### Test Structure

```
backend/base_feature_app/tests/
├── conftest.py                      # Shared fixtures
├── models/
│   ├── test_user_model.py
│   ├── test_blog_model.py
│   ├── test_product_model.py
│   └── test_sale_model.py
├── serializers/
│   ├── test_user_serializers.py
│   ├── test_blog_serializers.py
│   ├── test_product_serializers.py
│   └── test_sale_serializer.py
└── views/
    ├── test_crud_endpoints.py
    ├── test_jwt_endpoints.py
    └── test_public_endpoints.py
```

### Frontend (Jest + Playwright)

#### Unit Tests (Jest)

```bash
cd frontend

# All tests
npm run test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific tests
npm test -- stores/auth.test.js
npm test -- components/ShoppingCart.test.js
```

#### Test Coverage

- ✅ **Stores**: auth, blog, product, language
- ✅ **Components**: ShoppingCart, CartProduct, HelloWorld
- ✅ **E2E**: Smoke tests with Playwright

#### E2E Tests (Playwright)

```bash
cd frontend

# Install browsers (first time)
npx playwright install

# Run tests (all viewports: desktop + mobile + tablet)
npm run e2e

# Run tests + flow coverage report (all viewports)
npm run e2e:coverage

# List available E2E modules
npm run e2e:modules

# Run a single module (example: auth)
npm run e2e:module -- auth
npm run e2e:module -- --module auth --clean

# Module-scoped coverage (example: auth)
clear && npm run e2e:clean && npm run e2e:coverage -- --grep @module:auth

# Helper alias for module-scoped coverage
npm run e2e:coverage:module -- auth
npm run e2e:coverage:module -- --module auth --clean

# Per-viewport filtering
npm run e2e:desktop          # Desktop Chrome only
npm run e2e:mobile           # Mobile Chrome (Pixel 5) only
npm run e2e:tablet           # Tablet (iPad Mini) only

# Combine viewport filter with a specific spec
npm run e2e:desktop -- e2e/auth/auth-login.spec.js

# Coverage with viewport filter
E2E_COVERAGE=1 npm run e2e:mobile -- e2e/auth/auth-login.spec.js

# With interactive UI
npm run e2e:ui

# Headed mode
npm run e2e:headed
```

**Note:** `--grep @module:<name>` only runs tests tagged with that module. When you run a subset, the flow coverage report will still list other modules/flows as missing because they were not executed.

**Note:** E2E tests automatically start the Vite server. Keep backend running to avoid proxy errors.

#### Test Structure

```
frontend/test/
├── components/
│   ├── CartProduct.test.js
│   ├── ShoppingCart.test.js
│   └── HelloWorld.test.js
├── stores/
│   ├── auth.test.js
│   ├── blog.test.js
│   ├── product.test.js
│   └── language.test.js
└── e2e/
    ├── navigation.spec.js
    ├── blog.spec.js
    ├── product.spec.js
    ├── auth.spec.js
    ├── static-pages.spec.js
    ├── responsive.spec.js
    ├── helpers.js
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
| `.editorconfig` | Code standards for editors |
| `.prettierrc` | Prettier configuration for formatting |
| `backend/.env.example` | Environment variables template (backend) |
| `frontend/.env.example` | Environment variables template (frontend) |

---

## 🎯 Reference Projects

Real implementation examples using this base:

### E-commerce
- [🕯️ Candle Project](https://github.com/carlos18bp/candle_project) - Artisanal candles store
- [💎 Jewel Project](https://github.com/carlos18bp/jewel_project) - Jewelry store

### Rental
- [👗 Dress Rental Project](https://github.com/carlos18bp/dress_rental_project) - Dress rental system

### Features
- [🔐 Sign In/Sign On Feature](https://github.com/carlos18bp/signin_signon_feature) - Complete authentication system with registration

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
3. Create viewset in `views/`
4. Add URLs in `urls/`
5. Register in admin (`admin.py`)
6. Create fake data command if needed
7. Write tests (models, serializers, views)

### Add New Views/Pages

1. Create component in `frontend/src/views/`
2. Add route in `router/index.js`
3. Update Pinia store if needed
4. Create reusable components in `components/`
5. Write tests

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a suggestion:

1. **Fork** the project
2. Create a **branch** for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### Code Standards

- **Backend**: Follow PEP 8 (use `flake8` or `black`)
- **Frontend**: Follow ESLint and Prettier configuration
- **Tests**: Write tests for new functionality
- **Commits**: Descriptive messages in English

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

## 📞 Support

If you have questions or need help:

1. Check the [documentation](#-documentation)
2. Search in [existing issues](https://github.com/carlos18bp/base_feature/issues)
3. Create a [new issue](https://github.com/carlos18bp/base_feature/issues/new)

---

## 🗺️ Roadmap

Planned future improvements:

- [ ] Docker configuration
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] PostgreSQL support
- [ ] Redis caching
- [ ] Celery for async tasks
- [ ] Websockets (Django Channels)
- [ ] PWA support
- [ ] Multi-tenant architecture
- [ ] GraphQL API (optional)
- [ ] Deployment guides (AWS, DigitalOcean, Heroku)

---

**⭐ If this project helps you, consider giving it a star!**

*Last updated: February 2026*
