---
trigger: manual
description: System architecture, component relationships and data model. Includes the current-workflow section updated on significant changes.
---

# Architecture — Base Django Vue Feature

## 1. System overview

```mermaid
flowchart LR
    subgraph Client
        SPA[Vue 3 SPA<br/>Vite · Pinia · vue-router]
    end
    subgraph Backend[Django 6 · base_feature_project]
        URLS[urls.py<br/>/api/health · /api/token · /admin]
        APP[base_feature_app<br/>urls/ · views/ FBV · serializers/]
        SVC[services/<br/>auth_service]
        MODELS[models/<br/>User · Blog · Product · Sale · SoldProduct · StagingPhaseBanner]
        ATT[django_attachments<br/>Library + easy_thumbnails]
    end
    DB[(SQLite dev/tests<br/>MySQL 8 prod)]
    REDIS[(Redis · Huey<br/>immediate en dev)]

    SPA -- axios · JWT --> URLS --> APP --> SVC --> MODELS --> DB
    APP --> ATT --> DB
    Backend -.-> REDIS
```

- Dev/E2E: Playwright `webServer` boots Django `127.0.0.1:8001` + Vite `127.0.0.1:5174`; the SPA talks to the API via `VITE_BACKEND_URL`.
- Staging: gunicorn service `base_django_vue_feature_staging` + `base_django_vue_feature-staging-huey` (per fleet registry); Django serves no SPA catch-all — the frontend is built by Vite and served as static.

## 2. Request flow (auth example)

```mermaid
sequenceDiagram
    participant U as SPA (stores/auth.js)
    participant H as stores/services (http)
    participant D as Django /api/token/
    participant A as base_feature_app views (FBV)
    U->>H: login(email, password)
    H->>D: POST /api/token/ (simplejwt)
    D-->>H: access + refresh
    H-->>U: tokens en store
    U->>H: GET /api/... (Bearer access)
    H->>A: @api_view + permissions
    A-->>U: JSON
```

## 3. Data model (ER)

```mermaid
erDiagram
    USER {
        string email "login (custom UserManager)"
    }
    PRODUCT {
        gallery gallery "GalleryField -> attachments Library"
    }
    SOLDPRODUCT {
        int quantity
    }
    SALE {
        string email "guest checkout"
        string address
        string city
    }
    BLOG
    STAGINGPHASEBANNER
    LIBRARY

    SALE }o--o{ SOLDPRODUCT : "sold_products M2M"
    SOLDPRODUCT }o--|| PRODUCT : "FK on_delete=PROTECT"
    PRODUCT ||--o| LIBRARY : "gallery"
```

- `Sale` has **no FK to User** — checkout is by email (guest).
- `Sale.delete()` cleans up its own `SoldProduct` rows; products are PROTECTed.

## 4. Deployment (staging-only template)

- Work host: `vps-projectapp-staging`; path `/home/ryzepeck/webapps/base_django_vue_feature` (registry: status `scaffold`, no domain).
- CI: GitHub Actions (`ci.yml` — 3 test suites + coverage summary; `test-quality-gate.yml` — junk gate at error severity).
- The repo is **prod-direct** (no release branch): work lands via feature/qa branches + PR to `master`.

## 5. Current workflow (updated 2026-08-12)

- **QA closure run in progress** (`/qa --apply`, branch `qa/12082026`): backend venv provisioned (Django 6.0.5), SQLite dev seeded (admin user + 12 sales), Memory Bank regenerated, `USER_FLOW_MAP.md` being regenerated from code, coverage audit + per-layer test authoring to follow (target: close error/failure outcome gaps in the 20-flow map).
