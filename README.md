# Fleet Demo

A small end-to-end commuter benefits platform demo.

This repo shows how I'd build a “Fleet-style” product:
- Admin web app where an employer can log in, view employees, view reports
- Django API backing it
- Modern stack (Next.js, Django REST, Postgres/Redis style patterns, Redux Toolkit, etc.)
- Basic tests + basic auth guard + rate limiting / caching concepts

It’s not production. It’s a realistic interview-ready prototype.

---

## Status / Honesty

**Working right now**
- Next.js web app with login page, protected routes, header/nav, etc.
- Global UI shell and basic pages (`/login`, `/employees`, `/reports`)
- Centralized state with Redux Toolkit (store is wired in `Provider`)
- Django project bootstrapped in `/api`
- Django app `commuters` with models, serializers, and views started
- Local dev environment using Python virtual env + SQLite

**Planned / scaffolded but not fully built yet**
- Real auth (currently just a placeholder login screen + client-side “hide nav if not logged in” logic)
- Actual employee data flowing from Django API into the web UI via RTK Query
- Swapping SQLite → Postgres
- Redis-backed caching / rate limiting patterns on the API
- Minimal test coverage:
  - pytest for API
  - React Testing Library / Playwright for web
- Deploy targets:
  - API to Railway / Render
  - Web to Vercel

So: some things are wired, some things are mocked, some things are still TODO on purpose. This is intentional. The point is to demo architecture, not ship prod.

---

## Tech Stack

### Web ( `/web` )
- **Next.js (App Router)**
- **TypeScript**
- **Redux Toolkit + RTK Query**
- **Tailwind CSS**
- Simple client-side route protection for now (hide nav on `/login`, etc.)
- Goal: call the Django API for employees / reports

### API ( `/api` )
- **Django**
- **Django REST Framework**
- App: `commuters/` for commuter benefits data (employees, usage, etc.)
- Currently running on **SQLite locally**
- Designed to move to **Postgres**
- Redis is planned for caching / rate limits, not wired yet
- Settings already split into `settings.py` and `settings.local.py` for dev

### Infra targets (scaffolded / roadmap)
- Postgres (prod)
- Redis (caching, throttling, maybe session/token cache)
- Railway / Render for the API container
- Vercel for the web frontend

---

## Repo Structure

```txt
FLEET-DEMO/
├─ api/                 # Django REST API service
│  ├─ manage.py
│  ├─ db.sqlite3        # local dev DB (will be Postgres in real deploy)
│  ├─ .venv/            # local Python venv
│  ├─ core/             # Django project settings/asgi/urls
│  │   ├─ settings.py
│  │   ├─ settings.local.py
│  │   ├─ urls.py
│  │   └─ asgi.py / wsgi.py
│  └─ commuters/        # example app: commuter benefits / employees
│      ├─ models.py
│      ├─ serializers.py
│      ├─ views.py
│      ├─ tests.py      # pytest-style API tests (planned to expand)
│      └─ migrations/
│
└─ web/                 # Admin dashboard web app
   ├─ next.config.js
   ├─ package.json
   ├─ src/
   │   ├─ app/
   │   │   ├─ login/           # public login screen
   │   │   ├─ employees/       # protected
   │   │   ├─ reports/         # protected
   │   │   ├─ api/             # (Next.js route handlers if needed)
   │   │   ├─ layout.tsx       # global layout (wraps pages, Redux Provider)
   │   │   └─ page.tsx         # root landing route
   │   ├─ components/ui/       # shared UI pieces (headers, stat cards, etc.)
   │   ├─ store/               # Redux Toolkit store setup
   │   └─ global.css           # Tailwind / global styles
   └─ tests/                   # web tests (React Testing Library / Playwright plan)
       └─ enroll.spec.ts
