# Fleet Demo
Mini commuter-benefits demo on Fleet-like stack.

## Stack
- Backend: Django REST, Postgres, Redis
- Frontend: Next.js + TypeScript + Redux Toolkit / RTK Query
- Tests: pytest (API), React Testing Library / Playwright (Web)
- Deploy: Railway/Render (API), Vercel (Web)

## Folders
- /api — Django REST service
- /web — Next.js admin web

## Goals
- Ship a working demo
- Minimal tests (1 unit, 1 API, 1 E2E)
- Feature-flagged AI stub + caching + rate limits
