# FormFlow — Real-time Collaborative Form Builder

A full-stack web app where authenticated users build forms collaboratively in real time, share them publicly, and collect responses with analytics.

**Tech stack:** React + Vite + Tailwind · Node.js + Express · Socket.io · PostgreSQL + Sequelize · JWT Auth

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Database
```sql
CREATE DATABASE formflow_db;
```

### 2. Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env — set DB_PASSWORD and both JWT secrets
npm run dev
```

Server runs on `http://localhost:5000`

### 3. Client
```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`

---

## Deployment

We deploy the backend to **Render** (Web Service + PostgreSQL) and the frontend to **Vercel**.

### Step 1 — Push to GitHub
Make sure your code is on GitHub. Both Render and Vercel deploy directly from it.

---

### Step 2 — Create PostgreSQL database on Render

1. Go to [render.com](https://render.com) → **New** → **PostgreSQL**
2. Give it a name like `formflow-db`
3. Choose the **Free** tier
4. Click **Create Database**
5. Once created, copy the **Internal Database URL** — you'll need it in Step 3

---

### Step 3 — Deploy the server on Render

1. **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `formflow-server` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

4. Add these **Environment Variables**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Internal Database URL from Step 2 |
| `JWT_ACCESS_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Run the same command again for a different value |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Leave blank for now — fill in after Vercel deploy |

5. Click **Create Web Service**
6. Wait for deploy — note your server URL e.g. `https://formflow-server.onrender.com`

---

### Step 4 — Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `client` |
| **Framework Preset** | Vite (auto-detected) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Add this **Environment Variable**:

| Key | Value |
|---|---|
| `VITE_SERVER_URL` | Your Render server URL from Step 3 (no trailing slash) |

5. Click **Deploy**
6. Note your frontend URL e.g. `https://formflow.vercel.app`

---

### Step 5 — Wire them together

1. Go back to your **Render Web Service** → **Environment**
2. Set `CLIENT_URL` to your Vercel frontend URL
3. Click **Save Changes** — Render auto-redeploys

Your app is now live. Test the full flow:
- Register at your Vercel URL
- Create a form, publish it
- Open the share link in an incognito window
- Submit a response
- Check the responses dashboard

---

### Important note on Render's free tier

Render free web services **spin down after 15 minutes of inactivity**. The first request after sleep takes ~30 seconds to wake up. This is normal for the free tier — upgrade to a paid plan for always-on behaviour before showing it in interviews.

The PostgreSQL free tier does **not** sleep and has no cold start issue.

---

## Interview talking points

- **JWT**: Access token (15min, stored in memory) + refresh token (7 days, httpOnly cookie). Silent refresh via Axios interceptor on 401. Can explain why memory > localStorage for XSS safety.
- **WebSockets**: Socket.io rooms keyed by form ID, JWT verified on handshake, Last-Write-Wins conflict resolution — deliberate choice, can explain tradeoffs vs OT/CRDT.
- **Database**: Normalised relational schema, Sequelize ORM with associations, JSON column for dynamic field options, UUID primary keys to prevent ID enumeration.
- **Optimistic updates**: UI updates instantly, API call fires in background. Debounce (600ms) on text inputs avoids per-keystroke API calls.
- **Drag and drop**: dnd-kit `SortableContext` + `arrayMove`, `sort_order` persisted to DB after every drop.
- **Security**: Server-side `canEdit()` guard on every mutation — frontend protection is UX, backend protection is actual security.
- **Deployment decision**: Evaluated Railway vs Render, chose Render for free PostgreSQL tier and better logging. Migrated from MySQL to PostgreSQL — only 2 config changes in Sequelize since it's dialect-agnostic.