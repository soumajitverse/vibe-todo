# 📱 Vibe Todo — Mobile-First Full-Stack Todo Application

A modern, responsive, mobile-first Todo web application built with **React (Vite + Tailwind CSS)**, **Node.js/Express.js**, and **NeonDB (Serverless PostgreSQL)**.

### 🌐 Live Production Deployments
- **Frontend (Vercel):** [https://vibe-todo-gray.vercel.app](https://vibe-todo-gray.vercel.app/login)
- **Backend API (Render):** [https://vibe-todo-7rhs.onrender.com](https://vibe-todo-7rhs.onrender.com)
- **Health Check Status:** [https://vibe-todo-7rhs.onrender.com/health](https://vibe-todo-7rhs.onrender.com/health)

---

## 🌟 Features & Highlights

- **Mobile-First UX / Ergonomics**:
  - Thumb-friendly touch targets (min 44px) for checkboxes, navigation, and actions.
  - Floating Action Button (FAB) and sticky bottom navigation on mobile devices.
  - Slide-up bottom sheet modal on mobile, centered modal on desktop.
  - Safe-area inset support (`env(safe-area-inset-bottom)`) for modern bezel-less smartphones.
  - Debounced search input (350ms delay) with instant reset and clear buttons.
  - Tab filters (*All*, *Active*, *Done*) and clean status badges.
  - Responsive pagination controls with page indicators and boundary handling.
  - Rich state feedback: animated skeleton loading cards, empty states, and toast notifications.

- **Robust & Secure Backend**:
  - **PostgreSQL / NeonDB**: Connected using `pg` Pool with SSL support (`sslmode=require`).
  - **UUID Primary Keys**: Uses `gen_random_uuid()` for collision-resistant keys.
  - **Strict Multi-Tenant Scoping**: All queries are strictly scoped to the authenticated `req.user.id`.
  - **Fine-Grained Authorization**:
    - `404 Not Found` if a task does not exist.
    - `403 Forbidden` if a task exists but belongs to another user.
  - **Server-Side Search & Pagination**:
    - Case-insensitive search on title & description (`ILIKE`).
    - Configurable `page` and `limit`, returning `items`, `total`, `page`, and `totalPages`.
  - **JWT Authentication**: Passwords hashed with `bcryptjs` (salt rounds = 10), verified via Bearer token middleware.

---

## 🏗️ Architecture & Project Structure

```
vibe-todo/
├── backend/
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Express dependencies
│   ├── schema.sql            # PostgreSQL / NeonDB initialization SQL
│   ├── scripts/
│   │   └── init-db.js        # Automated script to apply schema.sql
│   └── src/
│       ├── config/
│       │   └── db.js         # pg Pool with SSL configuration
│       ├── middleware/
│       │   └── auth.js       # Bearer JWT verification middleware
│       ├── routes/
│       │   ├── auth.js       # /api/auth (signup, login, me)
│       │   └── todos.js      # /api/todos (CRUD with pagination & search)
│       └── server.js         # Express app entrypoint & health check
│
├── frontend/
│   ├── .env.example          # Frontend API URL configuration
│   ├── index.html            # Mobile-optimized viewport HTML
│   ├── package.json          # React + Vite + Tailwind dependencies
│   ├── tailwind.config.js    # Custom Tailwind styling & brand colors
│   ├── vite.config.js        # Vite dev server with /api proxy
│   └── src/
│       ├── api/
│       │   └── client.js     # Axios instance with auth interceptor
│       ├── context/
│       │   └── AuthContext.jsx # Token persistence & auth state
│       ├── hooks/
│       │   └── useDebounce.js# Reusable debouncing hook
│       ├── components/
│       │   ├── Navbar.jsx    # Top header with profile & logout
│       │   ├── BottomBar.jsx # Thumb-friendly mobile action bar & FAB
│       │   ├── TodoItem.jsx  # Touch-friendly todo card with toggle/edit/delete
│       │   ├── TodoModal.jsx # Bottom-sheet modal for task creation & editing
│       │   ├── Pagination.jsx# Touch-friendly page switch controls
│       │   ├── EmptyState.jsx# Contextual illustrations for empty lists
│       │   └── LoadingSkeleton.jsx # Shimmer placeholder cards
│       ├── pages/
│       │   ├── LoginPage.jsx # Mobile-friendly sign-in view
│       │   ├── SignupPage.jsx# Mobile-friendly registration view
│       │   └── DashboardPage.jsx # Main todo management dashboard
│       ├── App.jsx           # React Router setup & protected routes
│       ├── index.css         # Tailwind & safe-area utility classes
│       └── main.jsx          # React DOM entrypoint
└── package.json              # Monorepo convenience scripts
```

---

## 🗄️ Database Schema (`backend/schema.sql`)

```sql
-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Todos table strictly scoped to users
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient user-scoped queries, sorting and search
CREATE INDEX IF NOT EXISTS idx_todos_user_created ON todos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_user_search ON todos(user_id, title, description);
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **NeonDB Account** (Free PostgreSQL database at [neon.tech](https://neon.tech))

---

### 2. Configure Backend `.env`

Copy `backend/.env.example` to `backend/.env`:
```bash
cd backend
cp .env.example .env
```

Update `backend/.env` with your NeonDB connection string:
```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:your_password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

---

### 3. Initialize Database Tables

You can initialize the database tables in either of two ways:

#### Option A: Run the automated script
```bash
cd backend
npm run db:init
```

#### Option B: Run in Neon Console
Copy the contents of `backend/schema.sql` and run it directly inside the NeonDB **SQL Editor**.

---

### 4. Start the Application

#### Step 4a: Start Backend Server
```bash
cd backend
npm run dev
```
The backend server runs on `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`

#### Step 4b: Start Frontend App
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend application runs on `http://localhost:5173`.

---

## 📡 API Reference

### 🔐 Auth Endpoints

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user | `{ email, password }` | `{ token, user }` (201) |
| `POST` | `/api/auth/login` | Authenticate user | `{ email, password }` | `{ token, user }` (200) |
| `GET` | `/api/auth/me` | Current session info | *(Bearer Token)* | `{ user }` (200) |

### 📝 Todos Endpoints (Protected by Bearer JWT)

| Method | Endpoint | Query / Body | Description |
|---|---|---|---|
| `GET` | `/api/todos` | `?search=term&page=1&limit=10` | Returns `{ items, total, page, totalPages, limit }` |
| `POST` | `/api/todos` | `{ title, description }` | Creates a new task for `req.user.id` |
| `PATCH` | `/api/todos/:id` | `{ title, description, completed }` | Updates task. Returns 404 if not found, 403 if not owned by user |
| `DELETE` | `/api/todos/:id` | None | Deletes task. Returns 404 if not found, 403 if not owned by user |

---

## 📱 Mobile-First Design Principles Implemented

1. **Touch Targets**: Checkbox buttons and actions are sized to meet minimum touch guidelines (at least 44x44px target area).
2. **Bottom-First Interactions**: The quick-add button (FAB) and filter switchers are positioned at the bottom of the viewport within natural thumb range.
3. **Safe Areas**: Native iOS/Android browser home bar spacing handled via `pb-safe` utilities.
4. **Debounced Search**: Search input triggers backend queries after 350ms idle, avoiding unnecessary DB queries.
5. **Clear Error States & Skeletons**: Instant feedback when tasks are loading or if network requests fail.
