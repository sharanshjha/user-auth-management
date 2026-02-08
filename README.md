# PulseAuth Console

A full revamp of the original project into a production-ready auth + user-management platform.

Think: secure API, role-based access, and a React dashboard that looks like your product team drank three cold brews and shipped from the future.

## What got upgraded

- Rebuilt frontend into a modern React SPA (Vite + React Router)
- Reworked backend into a secure JWT-based API
- Added role-aware authorization (`admin`, `member`)
- Added profile management + admin user directory controls
- Added global API error handling with consistent response shape
- Added production middleware: `helmet`, rate limiting, request logs
- Added environment templates for backend + frontend
- Added Render blueprint for API + static web deployment

## Tech stack

### Frontend
- React 18
- React Router 6
- Vite 5
- Custom CSS system (responsive, animated, non-boilerplate UI)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Security middleware (`helmet`, `express-rate-limit`, `cors`)
- Request logging (`morgan`)

## Architecture

```text
user-auth-management/
|-- backend/
|   |-- config/db.js
|   |-- controllers/
|   |   |-- authController.js
|   |   `-- userController.js
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |   `-- errorMiddleware.js
|   |-- models/User.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   `-- userRoutes.js
|   |-- utils/
|   |   |-- appError.js
|   |   |-- asyncHandler.js
|   |   |-- token.js
|   |   `-- validators.js
|   |-- .env.example
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- src/
|   |   |-- api/client.js
|   |   |-- components/
|   |   |   |-- ProtectedRoute.jsx
|   |   |   `-- Toast.jsx
|   |   |-- context/AuthContext.jsx
|   |   |-- pages/
|   |   |   |-- AuthPage.jsx
|   |   |   `-- DashboardPage.jsx
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- styles.css
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.js
|-- render.yaml
`-- README.md
```

## Quick start

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/user-auth-management
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Update `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Run frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## API reference

Base URL: `http://localhost:3000/api/v1`

### Health

- `GET /health` -> API health payload

### Auth

- `POST /auth/register`
  - Body: `{ "name", "email", "password" }`
  - Returns: JWT + user
  - Note: first registered user becomes `admin`

- `POST /auth/login`
  - Body: `{ "email", "password" }`
  - Returns: JWT + user

### Profile (authenticated)

Use header:

```http
Authorization: Bearer <token>
```

- `GET /users/me` -> current profile
- `PATCH /users/me` -> update own `name`, `email`, `password`
- `DELETE /users/me` -> delete own account (blocked for last admin)

### Admin-only user management

- `GET /users?page=1&limit=12&q=search`
- `PATCH /users/:id` (update `name`, `email`, `role`)
- `DELETE /users/:id`

## Response contract

Success:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Security details

- Passwords are hashed with bcrypt salt rounds
- JWT tokens are signed with configurable expiry
- Rate limiting enabled (200 requests / 10 min / IP)
- Helmet headers enabled
- CORS origin allow-list via `CLIENT_URL`
- Structured centralized error handling
- Admin safety guard prevents deleting/demoting the final admin

## Deployment

### Netlify (frontend)

This repo includes both root and frontend Netlify configs so deployment still works even if Netlify is configured at repo root or `frontend/` base:

- Build command: `npm run build` (root command delegates to frontend build)
- Publish directory: `frontend` (postbuild mirrors compiled output for compatibility)
- SPA rewrite fallback: `/* -> /index.html`

`frontend/public/_redirects` is included as a backup SPA rule.

### Render (backend)

`render.yaml` includes the API service blueprint.

Set secrets in Render dashboard:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL` (can be a comma-separated allow-list)

## Scripts

### Backend

- `npm run dev` -> start with nodemon
- `npm start` -> production start
- `npm run check` -> syntax check

### Frontend

- `npm run dev` -> local dev server
- `npm run build` -> production build
- `npm run preview` -> preview built app

## Product notes

- This is now production-structured, not tutorial-structured
- Admin dashboard visibility is role-based
- UI is intentionally expressive (future-facing) while staying responsive

## Troubleshooting

- Netlify `Page not found`: ensure the deploy uses this repo root so `netlify.toml` is detected, then redeploy.
- Netlify path refresh returns 404: fixed by the included SPA rewrite config (`netlify.toml` + `_redirects`).
- Netlify blank page with console JSX errors: fixed by forcing a real production build during deploy (instead of serving raw `frontend/src`).
- `401 Invalid authentication token`: login again to refresh your session
- `403 not allowed`: current account is `member`; use an `admin` account
- `Cannot delete the last admin account`: create/promote another admin first
- CORS errors: make sure `CLIENT_URL` matches your frontend origin exactly

## Credits

Built and revamped by **Sharansh Jha**.

If the app feels fast, secure, and slightly overconfident, that is intentional.
