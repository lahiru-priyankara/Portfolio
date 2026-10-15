# Portfolio Backend (Node.js + Express + Supabase)

Robust REST API backend powering the portfolio and administrative dashboard.

---

## 📁 Folder Structure

```
server/
├── src/
│   ├── config/
│   │   └── supabase.js         # Supabase client & admin client configuration
│   ├── controllers/
│   │   ├── authController.js     # Admin login, session check, logout
│   │   ├── messagesController.js # Contact inbox management
│   │   ├── profileController.js  # Profile & about bio updates
│   │   ├── projectsController.js # Projects CRUD
│   │   ├── servicesController.js # Services CRUD
│   │   └── skillsController.js   # Skills CRUD
│   ├── middlewares/
│   │   ├── auth.js               # JWT verification with Supabase Auth
│   │   └── errorHandler.js       # Centralized error handler
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── index.js              # Aggregated API router (/api/...)
│   │   ├── messageRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── serviceRoutes.js
│   │   └── skillRoutes.js
│   └── index.js                  # Express server entry point
├── .env.example
└── package.json
```

---

## 🚀 Local Development

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` from template:
   ```bash
   cp .env.example .env
   ```
   Fill in your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

4. Start development server with live watch:
   ```bash
   npm run dev
   ```
   Server will start at `http://localhost:5000`.

---

## 📡 API Endpoints Reference

### Public Endpoints
- `GET /health` - Health check
- `GET /api/profile` - Get portfolio profile details
- `GET /api/projects` - Get all projects
- `GET /api/skills` - Get all skills
- `GET /api/services` - Get all services
- `POST /api/messages` - Submit contact message

### Protected Admin Endpoints (Requires `Authorization: Bearer <token>`)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Validate session
- `POST /api/auth/logout` - Sign out
- `PUT /api/profile` - Update profile data
- `POST /api/projects` - Add project
- `PUT /api/projects/:id` - Edit project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/skills` - Add skill
- `PUT /api/skills/:id` - Edit skill
- `DELETE /api/skills/:id` - Delete skill
- `POST /api/services` - Add service
- `PUT /api/services/:id` - Edit service
- `DELETE /api/services/:id` - Delete service
- `GET /api/messages` - View all contact submissions
- `PATCH /api/messages/:id/status` - Mark message status (unread/read/archived)
- `DELETE /api/messages/:id` - Delete message

---

## 🚢 Deployment Guide

### Option 1: Render.com (Recommended Free/Low Cost)
1. Push code to GitHub.
2. In Render Dashboard, click **New Web Service**.
3. Connect your repository.
4. Set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `CLIENT_URL`: Your deployed frontend URL (e.g., `https://yeshini.dev`)

### Option 2: Railway.app
1. Click **New Project** -> **Deploy from GitHub repo**.
2. Select repository and set Root Directory to `server`.
3. Add environment variables. Railway will auto-detect `npm start`.
