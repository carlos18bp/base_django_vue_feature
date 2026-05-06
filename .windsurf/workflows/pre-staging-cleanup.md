---
description: Limpieza por fases de residuos del template base (modelos demo, endpoints, stores Pinia, vistas, traducciones, docs) antes de promover a staging — auditoría con confirmación humana fase por fase
auto_execution_mode: 2
---

# Pre-Staging Cleanup — Limpieza de Residuos del Template

## Goal
El proyecto fue iniciado clonando `base_django_vue_feature/`. Cuando el proyecto está maduro y próximo a staging, este workflow audita el repo por fases, clasifica cada item del template como **residuo puro** (eliminar), **adaptado** (preservar) o **roto** (referencias colgantes), y aplica la limpieza solo con confirmación humana, una fase a la vez.

## Restricciones No Negociables
1. **Nunca eliminar sin confirmación humana** — incluso si el inventario fijo dice "residuo puro".
2. **Inventario fijo es la fuente de verdad** — la lista de items del template está embebida abajo.
3. **Cada fase = un commit aislado** — facilita rollback (`git revert <sha>`).
4. **PRESERVAR siempre:** `User`/`PasswordCode`, `views/auth.py`, `urls/auth.py`, `urls/user.py`, `views/user_crud.py`, `views/error_handlers.py`, `serializers/user_*.py`, `forms/user.py`, `django_attachments/`, `src/components/layouts/Header.vue`, `Footer.vue`, `SearchBar.vue`, `src/stores/auth.js`, `i18n.js`, `language.js`, `stores/services/request_http.js`, `src/services/http/client.js`, `tokens.js`, `src/composables/useAuth.js`, `useNotification.js`, `src/views/Home.vue`, `NotFound.vue`, `auth/SignIn.vue`, `auth/SignUp.vue`. **Staging Phase Banner** (NUNCA eliminar — se oculta vía `StagingPhaseBanner.is_visible=False` en Django admin): `models/staging_phase_banner.py`, `serializers/staging_phase_banner.py`, `views/staging_phase_banner.py`, `urls/staging_phase_banner.py`, `StagingPhaseBannerAdmin` en `admin.py`; `src/components/staging/`, `src/stores/stagingBanner.js`, `src/services/http/stagingBanner.js`.
5. **Verificar referencias** con `grep -r "<symbol>" backend/ frontend/` antes de eliminar. Si hay refs externas a la lista demo ⇒ marcar **adaptado** y preservar.
6. **Migraciones aplicadas en prod NUNCA se eliminan** — generar nueva migración con `makemigrations` tras eliminar el modelo.

## Pasos

Para cada fase: **(1)** listar inventario fijo → **(2)** grep para clasificar → **(3)** mostrar tabla de hallazgos → **(4)** confirmación → **(5)** `git rm` / edits → **(6)** verificación mínima → **(7)** commit aislado.

### Fase B1 — Modelos demo
- `backend/base_feature_app/models/blog.py` (`Blog`)
- `backend/base_feature_app/models/product.py` (`Product`)
- `backend/base_feature_app/models/sale.py` (`Sale`, `SoldProduct`)
- Actualizar `models/__init__.py` y `admin.py` tras eliminar.

### Fase B2 — Serializers demo
- `serializers/blog.py`, `blog_list.py`, `blog_detail.py`, `blog_create_update.py`
- `serializers/product.py`, `product_list.py`, `product_detail.py`, `product_create_update.py`
- `serializers/sale.py`, `sale_list.py`, `sale_detail.py`
- Actualizar `serializers/__init__.py`.

### Fase B3 — Views/Endpoints demo
- `views/blog.py`, `views/blog_crud.py`
- `views/product.py`, `views/product_crud.py`
- `views/sale.py`, `views/sale_crud.py`
- `views/captcha_views.py` (solo si reCAPTCHA no se usa)
- Preservar: `views/auth.py`, `views/user_crud.py`, `views/error_handlers.py`.

### Fase B4 — URLs demo
- `urls/blog.py`, `urls/product.py`, `urls/sale.py`, `urls/captcha.py`
- Editar `urls/__init__.py` para quitar `include()` correspondientes.
- Revisar `backend/base_feature_project/urls.py` para rutas registradas a nivel proyecto.
- Preservar: `urls/auth.py`, `urls/user.py`.

### Fase B5 — Forms demo
- `forms/blog.py`, `forms/product.py`
- Preservar: `forms/user.py`, `forms/__init__.py`.

### Fase B6 — Management commands de fake data
- `management/commands/create_fake_data.py` (orquestador)
- `management/commands/create_fake_blogs.py`, `create_fake_products.py`, `create_fake_sales.py`
- `management/commands/create_fake_users.py` — revisar antes (puede ser útil para QA staging)
- `management/commands/delete_fake_data.py`
- `management/commands/test_email.py` (revisar uso real)
- Preservar: `silk_garbage_collect.py`.
- Huey tasks: revisar `backend/base_feature_project/tasks.py` por tasks demo.
- También revisar `backend/base_feature_project/management/` (commands a nivel proyecto).

### Fase B7 — Migraciones obsoletas
- Listar `backend/base_feature_app/migrations/` y validar contra modelos restantes.
- **NO eliminar migraciones aplicadas en prod.** Generar migración de drop con `python manage.py makemigrations`.

### Fase B8 — Tests demo
- `backend/base_feature_app/tests/models/test_blog_model.py`, `test_product_model.py`, `test_sale_model.py`, `test_models_delete.py`
- `backend/base_feature_app/tests/serializers/test_blog_serializers.py`, `test_product_serializers.py`, `test_sale_serializer.py`, `test_media_serializers.py` (revisar)
- `backend/base_feature_app/tests/views/test_public_endpoints.py`, `test_crud_endpoints.py`, `test_crud_endpoints_extended.py`, `test_crud_permissions.py` (revisar)
- `backend/base_feature_app/tests/views/test_captcha_views.py` (acompaña B3-captcha)
- Preservar tests de auth/JWT/user/admin/forms/services/utils/management.

### Fase B9 — Permissions / signals / utils demo
- Revisar `permissions/roles.py` y reemplazar roles si no aplican al nuevo dominio.
- Revisar templates de email demo en `templates/`.
- Preservar (infra): `exceptions.py`, `services/auth_service.py`, `utils/auth_utils.py`.

### Fase B10 — Admin demo
- Editar `admin.py` para quitar registros de `Blog/Product/Sale/SoldProduct`.

### Fase F1 — Páginas/Vistas demo (Vue Router)
- `frontend/src/views/blog/{List,Detail}.vue`
- `frontend/src/views/product/{Catalog,Detail,Checkout}.vue`
- `frontend/src/views/manual/Manual.vue`
- `frontend/src/views/Backoffice.vue`, `AboutUs.vue`, `Contact.vue`
- `frontend/src/views/Dashboard.vue` (revisar antes de eliminar)
- `frontend/src/views/auth/AdminLogin.vue`
- Editar `frontend/src/router/index.js` tras eliminar rutas.
- Preservar: `Home.vue`, `NotFound.vue`, `auth/SignIn.vue`, `auth/SignUp.vue`.

### Fase F2 — Componentes demo
- `frontend/src/components/HelloWorld.vue`
- `frontend/src/components/blog/{BlogCarousel,BlogPresentation}.vue`
- `frontend/src/components/product/{ProductCarousel,CategoryFilter,SubCategoryFilter,ShoppingCart,CartProduct}.vue`
- `frontend/src/components/manual/{ManualSearch,ManualSidebar,ProcessCard}.vue`
- Auditar links en `components/layouts/Header.vue`, `Footer.vue`, `SearchBar.vue`.

### Fase F3 — Stores Pinia demo
- `src/stores/blog.js`, `src/stores/product.js`
- Preservar: `stores/auth.js`, `i18n.js`, `language.js`, `stores/services/request_http.js`.

### Fase F4 — Composables demo
- (Sin composables demo en el template; solo infra.)
- Preservar: `composables/useAuth.js`, `useNotification.js`.

### Fase F5 — Servicios / API clients demo
- Revisar `src/services/http/client.js` y eliminar helpers de `/api/blogs|products|sales`.
- Revisar `src/helpers/googleLogin.js` (eliminar si Google OAuth no se usa).
- Revisar `src/shared/constants.js` (constantes demo `BLOG_*`, `PRODUCT_*`, `CART_*`, `MANUAL_*`).
- Preservar instancia axios + `services/http/tokens.js`, `helpers/notification.js`, `utils/format.js`, `utils/validators.js`, `mixins/globalMixin.js`.

### Fase F6 — Tipos / interfaces demo
- El template es JS plano; auditar manualmente si el proyecto migró a TS.

### Fase F7 — i18n / traducciones demo
- `src/i18n/index.js`: eliminar claves `manual.*`, `blog.*`, `product.*`, `cart.*`, `checkout.*`, `backoffice.*`, `about.*`, `contact.*`.
- Reemplazar `common.app_name` si dice "Base Feature".

### Fase F8 — Assets / branding del template
- `src/assets/vue.svg`, `public/vite.svg`. Buscar `base_feature*`, `template*`, `placeholder*` en `public/` y `src/assets/`.
- Reemplazar `frontend/public/favicon.ico` si sigue siendo el del template.
- `frontend/index.html`: actualizar `<title>`, meta `description`, `og:*`, link al favicon, referencia a `vite.svg`.

### Fase F9 — Tests unit + E2E demo
- Unit (Jest): `test/HelloWorld.test.js`, `test/components/{blog,product,manual}/`, `test/views/{blog,product,manual,Backoffice,AboutUs,Contact,Dashboard}*`, `test/stores/{blog,product}.test.js`, `test/router/`.
- E2E (Playwright): `e2e/blog/blog-list.spec.js`, `blog-detail.spec.js`; `e2e/shopping/{shopping-catalog,shopping-product-detail,shopping-cart,shopping-checkout}.spec.js`; `e2e/home/home-carousels.spec.js`; `e2e/static/static-pages.spec.js`; `e2e/navigation/{navigation-cart-overlay,navigation-search}.spec.js`.
- Actualizar `frontend/e2e/flow-definitions.json`.
- Preservar: `e2e/auth/*`, `e2e/navigation/navigation-not-found.spec.js`, `e2e/helpers/`, `e2e/reporters/`.

### Fase D1 — README.md raíz
- `grep -nE "Blog|Product|Sale|Manual|catalog|checkout|base[_ -]feature" README.md` y actualizar.

### Fase D2 — CLAUDE.md / AGENTS.md / GEMINI.md
- Raíz, `backend/`, `frontend/`. Reemplazar ejemplos `Blog/Product/Sale` y "Project Identity".

### Fase D3 — Docs en `/docs/`
- `USER_FLOW_MAP.md`, `BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`, `E2E_FLOW_COVERAGE_REPORT_STANDARD.md`, `TESTING_QUALITY_STANDARDS.md`, `TEST_QUALITY_GATE_REFERENCE.md`, `DJANGO_VUE_ARCHITECTURE_STANDARD.md`, `GLOBAL_RULES_GUIDELINES.md`, `claude-code-methodology-setup-guide.md`, `frontend/e2e/README.md`.
- `docs/methodology/` (memory bank: `architecture.md`, `product_requirement_docs.md`, `technical.md`, `error-documentation.md`, `lessons-learned.md`) y `tasks/active_context.md`, `tasks/tasks_plan.md`.
- `frontend/PLAYWRIGHT_CLEANUP.md`.
- `audit-report.md` raíz.

### Fase D4 — `.env.example`
- `backend/.env.example`: `BACKUP_STORAGE_PATH`, `DJANGO_GOOGLE_OAUTH_CLIENT_ID`, `FRONTEND_URL`.
- `frontend/.env.example`: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_APP_NAME`, `VITE_APP_VERSION`.

### Fase D5 — `package.json` y `pyproject.toml`
- `frontend/package.json`: `name`, `version`, `description`.
- `backend/pyproject.toml` (si existe).

### Fase D6 — Workflows `.windsurf/` y skills `.claude/` / `.agents/`
- `grep -rln "base_feature_app\|base_feature_project" .claude/ .agents/ .windsurf/` y actualizar.

### Fase D7 — Scripts raíz, CI y systemd
- `scripts/run-tests-all-suites.py`, `scripts/test_quality_gate.py`, `scripts/quality/`, `scripts/coverage-summary-ci.cjs`.
- `scripts/ci/` — workflows / pipelines.
- `scripts/systemd/` — unit files (`base_django_vue_feature_*.service`, `*-huey.service`) deben renombrarse al servicio real.
- `frontend/scripts/` — scripts de soporte.
- `.github/workflows/*.yml` (si existen).

## Comandos de Validación

| Tipo | Comando | Cuándo |
|------|---------|--------|
| Backend imports | `cd backend && source venv/bin/activate && python manage.py check` | Tras B1–B10 |
| Backend migraciones | `cd backend && source venv/bin/activate && python manage.py makemigrations --check --dry-run` | Tras B1, B7 |
| Backend tests afectados | `cd backend && source venv/bin/activate && pytest <tests-restantes> -x --ff` | Tras B8 |
| Frontend lint | `cd frontend && npm run lint` | Tras F1–F8 |
| Frontend tests | `cd frontend && npm test -- <archivos-restantes>` | Tras F9 |
| E2E (solo reportar) | `cd frontend && npx playwright test --list` | Tras F9 |

> No correr la suite completa. Solo el subset afectado por la fase.

## Formato de Output

Al terminar (o al ejecutar una fase puntual), entregar:

1. **Resumen** — fases ejecutadas, items eliminados, preservados, en review.
2. **Commits creados** — sha + mensaje por fase, en orden.
3. **Pendientes manuales** — items REVIEW con archivo y razón.
4. **Verificaciones ejecutadas** — qué corrió, resultado, output si falló.
5. **Próxima fase recomendada**.
