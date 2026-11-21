# Samchu Dance Studio API

Express and MongoDB REST API for the existing Vite/React frontend.

## Local setup

1. Install Node.js and MongoDB, then run `npm install` in this directory.
2. Copy `.env.example` to `.env` and set `JWT_SECRET` to a cryptographically random value of at least 32 characters.
3. Confirm `MONGODB_URI`, `CLIENT_ORIGIN`, and `FRONTEND_URL`; the default API port is `3000`, matching the frontend's `VITE_API_URL`.
4. Run `npm run dev`. The API seeds the initial FAQ and dance-style catalog without overwriting existing entries. The API health check is `GET http://localhost:3000/api/health`.
5. To create the first administrator, provide `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (at least 12 characters) in `.env`, then run `npm run create-admin`. Remove those bootstrap values afterward.

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` to deliver reset emails. In development without SMTP, reset links are printed to the backend console. The reset page is `/reset-password?token=...`.

## API overview

All routes are prefixed with `/api`. Send JSON request bodies and use `Authorization: Bearer <token>` for protected routes. The public registration endpoint only creates student accounts; administrator and teacher accounts are managed by an administrator.

Class `startsAt` and `endsAt` values should be ISO-8601 timestamps. Teacher availability uses UTC day-of-week and `HH:mm` values.

| Area | Routes |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/me` |
| Students | `GET/PATCH /students/me`; admin: `GET /students`, `GET/PATCH/DELETE /students/:id` |
| Teachers | `GET /teachers`, `GET /teachers/:id`; teacher: `GET/PATCH /teachers/me`; admin: `GET /teachers/admin`, `POST /teachers`, `PATCH/DELETE /teachers/:id` |
| Dance styles | `GET /dance-styles`; admin: `GET /dance-styles/admin`, `POST /dance-styles`, `PATCH/DELETE /dance-styles/:id` |
| Scheduling | `GET /slots`, `GET /slots/availability/:teacherId`; admin: `GET /slots/admin`, `POST /slots`, `PATCH/DELETE /slots/:id` |
| Bookings | Student: `POST /bookings` with `{ "slotId": "..." }`, `GET /bookings/my-bookings`, `PATCH /bookings/:id/cancel` (at least 12 hours before class); admin: `GET /bookings/admin` |
| Contact | `POST /contact`; admin: `GET /contact/admin`, `PATCH /contact/admin/:id` |
| FAQs | `GET /faqs`; admin: `GET /faqs/admin`, `POST /faqs`, `PATCH/DELETE /faqs/:id` |
| Administration | Admin: `GET /admin/dashboard`, `GET /admin/users`, `PATCH /admin/users/:id/role`, `DELETE /admin/users/:id` |

The API uses bcrypt password hashes, expiring JWTs, hashed one-time password-reset tokens, role checks, request validation, CORS allowlisting, and rate limiting on authentication endpoints.
