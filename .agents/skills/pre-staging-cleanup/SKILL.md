---
name: pre-staging-cleanup
description: "Pre-staging template residue cleanup — checklist por fases para auditar y eliminar residuos del template base (modelos demo, endpoints, stores Pinia, vistas, traducciones, docs) que quedaron dispersos en el proyecto antes de promover a staging."
argument-hint: "[optional: fase B1..B10, F1..F9, D1..D6, o sección 'backend'|'frontend'|'docs'|'all']"
---

# Pre-Staging Cleanup — Limpieza de Residuos del Template

## Goal

El proyecto fue iniciado clonando `base_django_vue_feature/`. A medida que se construyó el nuevo proyecto, **residuos del template original quedaron dispersos**: modelos demo (`Blog`, `Product`, `Sale`), endpoints, stores Pinia, vistas, traducciones y referencias en docs que ya no aportan al producto real.

Este skill audita el repo **por fases**, clasifica cada item del template como **residuo puro** (eliminar), **adaptado** (preservar) o **roto** (referencias colgantes), y aplica la limpieza solo con confirmación humana, una fase a la vez. Está pensado para ejecutarse cuando el proyecto está maduro y próximo a staging.

## Inputs

- Argumento opcional: una fase puntual (`B1`, `F3`, `D4`, etc.) o sección (`backend`, `frontend`, `docs`, `all`). Sin argumento, el skill recorre todas las fases en orden.
- Variante detectada: este SKILL es para **Vue 3 / Pinia / Composition API / JavaScript**.

## Reglas obligatorias

1. **Nunca eliminar sin confirmación explícita** — incluso si la clasificación dice "residuo puro".
2. **Inventario fijo es la fuente de verdad** — la lista de items del template está embebida abajo. No inferir items en runtime.
3. **Cada fase = un commit aislado** — facilita rollback (`git revert <sha>`).
4. **Lista de PRESERVAR siempre** (no proponer jamás eliminar): `User`, `PasswordCode` modelos; `views/auth.py`, `urls/auth.py`, `urls/user.py`, `views/user_crud.py`, `serializers/user_*.py`; `forms/user.py`; `django_attachments/`; `views/error_handlers.py`; `src/components/layouts/Header.vue`, `Footer.vue`, `SearchBar.vue`; `src/stores/auth.js`, `i18n.js`, `language.js`, `stores/services/request_http.js`; `src/services/http/client.js`, `tokens.js`; `src/composables/useAuth.js`, `useNotification.js`; `src/views/Home.vue`, `NotFound.vue`, `auth/SignIn.vue`, `auth/SignUp.vue`.
5. **Antes de eliminar un archivo, verificar referencias** con `grep -r "<symbol>" backend/ frontend/ --include="*.py" --include="*.vue" --include="*.js"`. Si hay referencias **fuera** de la lista de archivos demo, marcar **adaptado** y preservar.
6. **Detectar archivos modificados** con `git log --oneline -- <file>` — más de 1 commit (el inicial) ⇒ probablemente adaptado.
7. **Migraciones:** nunca eliminar migraciones aplicadas a producción. Para limpieza de modelos, generar nueva migración con `python manage.py makemigrations` tras eliminar el modelo.

## Workflow por fases

Para cada fase: **(1)** listar inventario fijo de la fase → **(2)** ejecutar grep para clasificar → **(3)** mostrar tabla de hallazgos → **(4)** pedir confirmación → **(5)** aplicar `git rm` / edits → **(6)** verificación mínima → **(7)** commit aislado.

Formato de tabla de hallazgos:

```
## Fase <ID> — <Nombre>

| # | Archivo / símbolo                              | Estado git    | Refs externas | Acción          |
|---|------------------------------------------------|---------------|---------------|-----------------|
| 1 | backend/base_feature_app/models/blog.py        | sin cambios   | 0             | DELETE          |
| 2 | backend/base_feature_app/models/product.py     | +12 líneas    | 4             | KEEP (adaptado) |
| 3 | backend/base_feature_app/models/sale.py        | sin cambios   | 1 colgante    | REVIEW: <ref>   |

¿Aplicar las acciones DELETE de esta fase? [y/N]
```

---

### BACKEND (Django)

#### Fase B1 — Modelos demo
- `backend/base_feature_app/models/blog.py` (modelo `Blog`)
- `backend/base_feature_app/models/product.py` (modelo `Product`)
- `backend/base_feature_app/models/sale.py` (modelos `Sale`, `SoldProduct`)
- Verificar: ningún modelo nuevo tiene `ForeignKey`/`ManyToMany` a estos.
- Si se elimina, también: actualizar `models/__init__.py` y `admin.py` para quitar registros.

#### Fase B2 — Serializers demo
- `backend/base_feature_app/serializers/blog.py`, `blog_list.py`, `blog_detail.py`, `blog_create_update.py`
- `backend/base_feature_app/serializers/product.py`, `product_list.py`, `product_detail.py`, `product_create_update.py`
- `backend/base_feature_app/serializers/sale.py`, `sale_list.py`, `sale_detail.py`
- Actualizar `serializers/__init__.py`.

#### Fase B3 — Views/Endpoints demo
- `backend/base_feature_app/views/blog.py`, `views/blog_crud.py`
- `backend/base_feature_app/views/product.py`, `views/product_crud.py`
- `backend/base_feature_app/views/sale.py`, `views/sale_crud.py`
- `backend/base_feature_app/views/captcha_views.py` — **solo eliminar si reCAPTCHA no se usa en el nuevo proyecto** (`grep -r RECAPTCHA backend/ frontend/`).
- **Preservar:** `views/auth.py`, `views/user_crud.py`, `views/error_handlers.py`.

#### Fase B4 — URLs demo
- `backend/base_feature_app/urls/blog.py`
- `backend/base_feature_app/urls/product.py`
- `backend/base_feature_app/urls/sale.py`
- `backend/base_feature_app/urls/captcha.py` (acompaña a B3-captcha)
- Editar `urls/__init__.py` para quitar los `include()` de los routers eliminados.
- Revisar `backend/base_feature_project/urls.py` para quitar `path('blog/', ...)`, `path('product/', ...)`, etc. si están registradas a nivel proyecto.
- **Preservar:** `urls/auth.py`, `urls/user.py`.

#### Fase B5 — Forms demo
- `backend/base_feature_app/forms/blog.py`
- `backend/base_feature_app/forms/product.py`
- **Preservar:** `forms/user.py`, `forms/__init__.py`.

#### Fase B6 — Management commands de fake data
- `backend/base_feature_app/management/commands/create_fake_data.py` (orquestador)
- `backend/base_feature_app/management/commands/create_fake_blogs.py`
- `backend/base_feature_app/management/commands/create_fake_products.py`
- `backend/base_feature_app/management/commands/create_fake_sales.py`
- `backend/base_feature_app/management/commands/create_fake_users.py` — revisar: si el equipo usa estos usuarios para QA en staging, **preservar y solo limpiar los de Blog/Product/Sale**.
- `backend/base_feature_app/management/commands/delete_fake_data.py`
- `backend/base_feature_app/management/commands/test_email.py` — preservar si se usa para QA email; eliminar si nunca se invoca.
- **Preservar:** `silk_garbage_collect.py` (infra de profiling).
- También revisar `backend/base_feature_project/management/` (commands a nivel proyecto, si existen).
- **Huey tasks demo:** `backend/base_feature_project/tasks.py` puede contener tasks demo (notificaciones de blog/product/sale, cron jobs). Revisar y limpiar.

#### Fase B7 — Migraciones obsoletas
- Listar migraciones que solo afecten modelos eliminados: `ls backend/base_feature_app/migrations/`.
- **NO eliminar migraciones ya aplicadas en producción/staging.**
- Acción recomendada: tras eliminar modelos en B1, ejecutar `python manage.py makemigrations` para generar la migración de drop, y commitearla.
- Si el proyecto aún no tiene producción, considerar `migrations/0001_initial.py` reset documentado.

#### Fase B8 — Tests demo
- `backend/base_feature_app/tests/models/test_blog_model.py`, `test_product_model.py`, `test_sale_model.py`, `test_models_delete.py`
- `backend/base_feature_app/tests/serializers/test_blog_serializers.py`, `test_product_serializers.py`, `test_sale_serializer.py`, `test_media_serializers.py` (revisar)
- `backend/base_feature_app/tests/views/test_public_endpoints.py`, `test_crud_endpoints.py`, `test_crud_endpoints_extended.py`, `test_crud_permissions.py` (revisar caso por caso)
- `backend/base_feature_app/tests/views/test_captcha_views.py` (acompaña B3-captcha si aplica)
- **Preservar:** `test_auth_endpoints.py`, `test_jwt_endpoints.py`, `test_urls.py`, `test_user_serializers.py`, `tests/conftest.py`, `tests/factories.py` (puede requerir limpieza de factories Blog/Product/Sale), `tests/admin/`, `tests/forms/test_forms.py`, `tests/services/test_auth_service.py`, `tests/utils/`, `tests/management/test_commands.py`.

#### Fase B9 — Permissions / signals / utils demo
- Revisar `backend/base_feature_app/permissions/roles.py` — si los roles son específicos del template (sin uso en el nuevo dominio), proponer reemplazo.
- Revisar templates de email demo en `backend/base_feature_app/templates/`.
- **Preservar (infra):** `backend/base_feature_app/exceptions.py` (custom exceptions usadas por `views/error_handlers.py`), `backend/base_feature_app/services/auth_service.py`, `backend/base_feature_app/utils/auth_utils.py`.

#### Fase B10 — Admin demo
- Editar `backend/base_feature_app/admin.py` para quitar `admin.site.register(Blog/Product/Sale/SoldProduct)` y sus `ModelAdmin` clases.

---

### FRONTEND (Vue 3 + Pinia)

#### Fase F1 — Páginas/Vistas demo (`src/views/`)
- `frontend/src/views/blog/List.vue`, `blog/Detail.vue`
- `frontend/src/views/product/Catalog.vue`, `product/Detail.vue`, `product/Checkout.vue`
- `frontend/src/views/manual/Manual.vue`
- `frontend/src/views/Backoffice.vue` (panel admin demo)
- `frontend/src/views/AboutUs.vue`, `Contact.vue` (páginas marketing genéricas — revisar si se usan)
- `frontend/src/views/Dashboard.vue` — **revisar antes de eliminar:** muchos proyectos extienden el dashboard.
- `frontend/src/views/auth/AdminLogin.vue` (login alterno demo)
- Editar `frontend/src/router/index.js` para quitar las rutas eliminadas.
- **Preservar:** `views/Home.vue`, `views/NotFound.vue`, `views/auth/SignIn.vue`, `views/auth/SignUp.vue`.

#### Fase F2 — Componentes demo
- `frontend/src/components/HelloWorld.vue` (boilerplate de Vue)
- `frontend/src/components/blog/BlogCarousel.vue`, `BlogPresentation.vue`
- `frontend/src/components/product/ProductCarousel.vue`, `CategoryFilter.vue`, `SubCategoryFilter.vue`, `ShoppingCart.vue`, `CartProduct.vue`
- `frontend/src/components/manual/ManualSearch.vue`, `ManualSidebar.vue`, `ProcessCard.vue`
- **Preservar:** `components/layouts/Header.vue`, `Footer.vue`, `SearchBar.vue` — pero auditar el contenido (links a /blogs, /catalog, /manual deben removerse si las páginas se eliminaron).

#### Fase F3 — Stores Pinia demo
- `frontend/src/stores/blog.js`
- `frontend/src/stores/product.js` (incluye lógica de carrito)
- **Preservar:** `stores/auth.js`, `stores/i18n.js`, `stores/language.js`, `stores/services/request_http.js`.

#### Fase F4 — Composables demo
- (No hay composables específicos del template más allá de los infra.)
- **Preservar:** `composables/useAuth.js`, `composables/useNotification.js`.

#### Fase F5 — Servicios / API clients demo
- Revisar `frontend/src/services/http/client.js` y helpers que apunten a `/api/blogs`, `/api/products`, `/api/sales` — eliminar funciones específicas; preservar instancia axios e interceptores.
- Revisar `frontend/src/helpers/googleLogin.js` — **eliminar si Google OAuth no se usa** en el nuevo proyecto (el template viene con Google login configurado por defecto).
- Revisar `frontend/src/shared/constants.js` — eliminar constantes demo (`BLOG_PAGE_SIZE`, `PRODUCT_*`, `CART_*`, `MANUAL_*`, `BACKOFFICE_*`); preservar las que el nuevo proyecto reutiliza.
- **Preservar:** `services/http/tokens.js`, `helpers/notification.js`, `utils/format.js`, `utils/validators.js`, `mixins/globalMixin.js`.

#### Fase F6 — Tipos / interfaces demo
- El template usa JS plano; no hay archivos `.ts` de tipos demo.
- Si el nuevo proyecto migró a TS, auditar manualmente cualquier interfaz `Blog`, `Product`, `Sale`.

#### Fase F7 — i18n / traducciones demo
- `frontend/src/i18n/index.js` — eliminar claves bajo `manual.*`, `blog.*`, `product.*`, `cart.*`, `checkout.*`, `backoffice.*`, `about.*`, `contact.*`.
- Cambiar `common.app_name` si aún dice "Base Feature" o "Base Django Vue Feature".

#### Fase F8 — Assets / branding del template
- `frontend/src/assets/vue.svg` (logo Vue default)
- `frontend/public/vite.svg` (logo Vite default)
- Buscar logos/imágenes con nombres como `base_feature*`, `template*`, `placeholder*` en `frontend/public/` y `frontend/src/assets/`.
- Reemplazar `frontend/public/favicon.ico` si sigue siendo el del template.
- **`frontend/index.html`** — actualizar `<title>`, meta `description`, `og:*`, link al favicon, referencia a `vite.svg`.

#### Fase F9 — Tests unit + E2E demo
- Tests unit (Jest):
  - `frontend/test/HelloWorld.test.js`
  - `frontend/test/components/{blog,product,manual}/`
  - `frontend/test/views/{blog,product,manual,Backoffice,AboutUs,Contact,Dashboard}*`
  - `frontend/test/stores/{blog,product}.test.js`
  - `frontend/test/router/` — actualizar tests de rutas tras F1.
- Tests E2E (Playwright):
  - `frontend/e2e/blog/blog-list.spec.js`, `blog-detail.spec.js`
  - `frontend/e2e/shopping/shopping-catalog.spec.js`, `shopping-product-detail.spec.js`, `shopping-cart.spec.js`, `shopping-checkout.spec.js`
  - `frontend/e2e/home/home-carousels.spec.js`
  - `frontend/e2e/static/static-pages.spec.js`
  - `frontend/e2e/navigation/navigation-cart-overlay.spec.js`
  - `frontend/e2e/navigation/navigation-search.spec.js` (revisar si hay buscador en el nuevo proyecto)
- Actualizar `frontend/e2e/flow-definitions.json` para reflejar flujos reales.
- **Preservar:** `e2e/auth/auth-*.spec.js`, `e2e/navigation/navigation-not-found.spec.js`, `e2e/helpers/`, `e2e/reporters/`.

---

### DOCUMENTACIÓN Y CONFIGURACIÓN

#### Fase D1 — README.md raíz
- `grep -nE "Blog|Product|Sale|Manual|catalog|checkout|base[_ -]feature" README.md`
- Eliminar secciones que describan features del template; actualizar features list al producto real.

#### Fase D2 — CLAUDE.md / AGENTS.md / GEMINI.md
- `CLAUDE.md` raíz, `backend/CLAUDE.md`, `frontend/CLAUDE.md`
- Buscar y reemplazar referencias a `Blog/Product/Sale` en ejemplos de código y memory bank.
- Actualizar la sección "Project Identity" con el nombre real del proyecto si aún dice "Base Django Vue Feature".
- Si existen `tasks/active_context.md` o `tasks/tasks_plan.md`, sincronizar con el estado actual.

#### Fase D3 — Docs en `/docs/`
- `docs/USER_FLOW_MAP.md`, `docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md`, `docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md`, `docs/TESTING_QUALITY_STANDARDS.md`, `docs/TEST_QUALITY_GATE_REFERENCE.md`, `docs/DJANGO_VUE_ARCHITECTURE_STANDARD.md`, `docs/GLOBAL_RULES_GUIDELINES.md`, `docs/claude-code-methodology-setup-guide.md` — `grep -ln "base_feature\|Blog\|Product\|Sale" docs/` y actualizar.
- `docs/methodology/` — memory bank: `architecture.md`, `product_requirement_docs.md`, `technical.md`, `error-documentation.md`, `lessons-learned.md` deben reflejar el dominio real, no el template. También `tasks/active_context.md`, `tasks/tasks_plan.md`.
- `frontend/e2e/README.md` — actualizar con flujos reales.
- `frontend/PLAYWRIGHT_CLEANUP.md` — revisar (limpieza histórica de Playwright que puede estar obsoleta).
- `audit-report.md` raíz — output de auditorías previas; revisar si quedan referencias obsoletas.

#### Fase D4 — `.env.example`
- `backend/.env.example`:
  - `BACKUP_STORAGE_PATH=/var/backups/base_feature_project` → reemplazar por path real.
  - `DJANGO_GOOGLE_OAUTH_CLIENT_ID=931303546385-...` → debe ser el ID del nuevo proyecto, no el del template.
  - `FRONTEND_URL` → URL del nuevo dominio.
- `frontend/.env.example`:
  - `VITE_API_BASE_URL` → URL del backend del nuevo proyecto.
  - `VITE_GOOGLE_CLIENT_ID` → ID Google del nuevo proyecto.
  - `VITE_APP_NAME="Base Django Vue Feature"` → nombre real.
  - `VITE_APP_VERSION=1.0.0` → versión real.

#### Fase D5 — `package.json` y `pyproject.toml`
- `frontend/package.json` — `name: "base-django-vue-feature-frontend"`, `version`, `description`.
- `backend/pyproject.toml` (si existe) — metadatos del proyecto.

#### Fase D6 — Workflows `.windsurf/` y skills `.claude/` / `.agents/`
- `grep -rln "base_feature_app\|base_feature_project" .claude/ .agents/ .windsurf/`
- Actualizar referencias en otros skills (ej. `repo-cleanup`, `plan-task`, `vuln-audit`) que mencionen el nombre del módulo si fue renombrado.

#### Fase D7 — Scripts raíz, CI y systemd
- `scripts/run-tests-all-suites.py` — verificar que apunte a la app correcta tras renames; quitar suites de tests demo eliminados.
- `scripts/test_quality_gate.py` y `scripts/quality/` — actualizar thresholds y rutas si cambiaron.
- `scripts/coverage-summary-ci.cjs` — verificar paths de coverage.
- `scripts/ci/` — workflows GitHub Actions / scripts de pipeline; actualizar nombres de jobs, branch protection, deploy targets si referencian "base_feature_*".
- `scripts/systemd/` — unit files (`base_django_vue_feature_staging.service`, `*-huey.service`) deben renombrarse al nombre real del servicio en producción.
- `frontend/scripts/` — scripts de soporte del frontend; revisar referencias.
- `.github/workflows/*.yml` (si existen) — nombres de jobs, secretos referenciados, tags de deploy.

---

## Verificación post-fase

| Tipo | Comando | Cuándo |
|------|---------|--------|
| Backend imports | `cd backend && source venv/bin/activate && python manage.py check` | Tras B1–B10 |
| Backend migraciones | `cd backend && source venv/bin/activate && python manage.py makemigrations --check --dry-run` | Tras B1, B7 |
| Backend tests afectados | `cd backend && source venv/bin/activate && pytest <tests-restantes> -x --ff` | Tras B8 |
| Frontend lint | `cd frontend && npm run lint` | Tras F1–F8 |
| Frontend tests | `cd frontend && npm test -- <archivos-restantes>` | Tras F9 |
| E2E (solo reportar) | `cd frontend && npx playwright test --list` | Tras F9 |

> No correr la suite completa. Solo el subset afectado por la fase.

## Output Contract

Al terminar (o al ejecutar una fase puntual), entregar:

1. **Resumen** — fases ejecutadas, items eliminados, items preservados, items en review.
2. **Commits creados** — sha + mensaje por fase, en orden.
3. **Pendientes manuales** — items marcados REVIEW que requieren juicio humano (con archivo y razón).
4. **Verificaciones ejecutadas** — qué corrió, resultado, output relevante si falló.
5. **Próxima fase recomendada** — si quedan fases pendientes.

## Ejemplos de invocación

- `/pre-staging-cleanup` → recorre todas las fases en orden, con confirmación por fase.
- `/pre-staging-cleanup B1` → solo modelos demo.
- `/pre-staging-cleanup backend` → fases B1–B10.
- `/pre-staging-cleanup frontend` → fases F1–F9.
- `/pre-staging-cleanup docs` → fases D1–D6.
