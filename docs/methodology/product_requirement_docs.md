---
trigger: manual
description: PRD — why this project exists, core requirements, features, and scope. Read before significant implementation or planning tasks.
---

# Product Requirement Docs — Base Django Vue Feature

## 1. Overview

**Base Django Vue Feature** is the fleet's **reference template (scaffold)** for new Django + Vue projects. It is not a product deployed to end users: its "product" is a working, fully-tested starting point that new projects clone and rebrand (via the `new-project-setup` skill, with `pre-staging-cleanup` removing demo residue).

- **Status**: `scaffold` in the fleet registry (`projects.yml`) — staging only, never production.
- **Stack**: Django 6 + DRF (backend) · Vue 3 + Vite SPA (frontend) · SQLite (dev/tests) / MySQL 8 (prod settings) · Redis + Huey (queue, configured, immediate in dev).

## 2. Problems It Solves

1. **Bootstrap time** — a new fleet project starts from a codebase with auth, CRUD, admin, testing and CI already wired, instead of from `startproject`.
2. **Convention drift** — the template encodes the fleet's conventions (FBV views, service layer, Pinia Options API stores, per-domain packages, test quality gate) so every derived project inherits them.
3. **Testing baseline** — 3 test layers (pytest / Jest / Playwright) plus the flow map and quality gate ship working, so derived projects never start untested.

## 3. Core Features (demo domain, all verified in code)

| Feature | Backend | Frontend |
|---|---|---|
| Auth (JWT) | `rest_framework_simplejwt` token obtain/refresh (`/api/token/`), custom `User` (email login, `UserManager`), `services/auth_service.py`, captcha views | `stores/auth.js`, auth views + e2e `auth/` flows |
| Blog | `Blog` model, `views/blog.py` + `blog_crud.py`, `urls/blog.py` | `stores/blog.js`, blog views, e2e `blog/` |
| Products / shopping | `Product` (with `GalleryField` → django_attachments `Library`), `Sale` + `SoldProduct` (guest checkout by email, M2M sold products, FK PROTECT to product) | `stores/product.js`, shopping views, e2e `shopping/` |
| Staging banner | `StagingPhaseBanner` model + view + urls | `stores/stagingBanner.js` |
| Media/galleries | `django_attachments` + `easy_thumbnails` (small/medium/large presets), `django-cleanup` | product galleries |
| Ops | `/api/health/` returns `{status, project, environment}` (identity probe — F24 lesson), `dbbackup`, custom `admin_site` | — |
| i18n / theming | — | `stores/i18n.js`, `language.js`, `theme.js` (frontend-side i18n; **no** bilingual model fields in this template) |

## 4. Users

- **Primary**: fleet developers cloning the template for a new client project.
- **Secondary**: QA automation (the demo flows exist so the 3 test layers and the flow map have real behavior to exercise — 20 declared user flows in `frontend/e2e/flow-definitions.json`).

## 5. Scope & Non-Goals

- **In scope**: everything needed for a derived project's first commit — auth, demo CRUD domain, admin, seeding (`create_fake_data`), tests, CI, quality gate, flow map.
- **Non-goals**: production deployment of THIS repo; real business logic; CMS/JSONField content patterns (those belong to sibling lineages, not this template).

## 6. Business Rules (as encoded)

- Fake data must respect model invariants: `create_fake_data N` seeds N sales with products (see `management/commands/`); e2e seeding recipe = migrate + `admin@gmail.com`/`password` user + `create_fake_data 12` (mirrors `ci.yml`).
- Sales never delete products (`on_delete=PROTECT`); sale deletion cleans up its own sold products (custom `delete`).
- Environment identity: the health endpoint must always report which project and environment answered (dead-domain fallthrough detection).
