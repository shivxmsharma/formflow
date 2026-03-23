# FormFlow

A real-time collaborative form builder. Create forms, invite collaborators to edit simultaneously, share with respondents, and analyse responses — all in one place.

**Live demo:** https://formflow-p54h.onrender.com

---

## Features

- **Drag-and-drop builder** — reorder fields by dragging, 8 field types supported
- **Real-time collaboration** — multiple users edit the same form simultaneously, changes sync instantly
- **Live presence** — see who else is editing with colored avatar indicators
- **Live preview** — side-by-side preview panel updates as you build
- **Public sharing** — publish a form and share a link, no login required to respond
- **Response analytics** — bar charts for choice fields, individual response viewer
- **JWT authentication** — secure access + refresh token flow with silent renewal

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| State management | Zustand |
| Drag and drop | dnd-kit |
| Real-time | Socket.io |
| Backend | Node.js, Express |
| Database | PostgreSQL, Sequelize ORM |
| Auth | JWT (access + refresh tokens) |
| Deployment | Render (single service) |

---

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Clone the repo
```bash
git clone https://github.com/shivxmsharma/formflow.git
cd formflow
```

### 2. Create the database
```sql
CREATE DATABASE formflow_db;
```

### 3. Set up the server
```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=formflow_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_ACCESS_SECRET=any_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 4. Set up the client
```bash
cd ../client
npm install
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

---

## Architecture

### Authentication flow
```
Login → access token (15min, stored in memory)
      + refresh token (7 days, httpOnly cookie)

Every API request → Axios attaches access token via interceptor
401 TOKEN_EXPIRED → interceptor silently calls /refresh → retries original request
Page reload       → initAuth() hits /refresh → restores session from cookie
```

### Real-time collaboration
```
BuilderPage mounts → socket connects → emits join_form { formId }
Server adds socket to a room keyed by formId
User adds a field → API saves to DB → emits field_added to room
Other clients receive field_added → update local Zustand state instantly
User leaves page → socket emits leave_form → removed from presence map
```

### Production architecture
```
https://formflow-p54h.onrender.com
├── /api/*         → Express API routes
├── /socket.io/*   → Socket.io
└── /*             → React app (static files from client/dist)
```

One Render Web Service serves everything. The build command installs dependencies and runs `vite build` — Express then serves the resulting `dist/` folder.

---

## API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get tokens |
| POST | /api/auth/refresh | Refresh access token via cookie |
| POST | /api/auth/logout | Clear refresh token cookie |
| GET | /api/auth/me | Get current user |

### Forms
| Method | Route | Description |
|---|---|---|
| GET | /api/forms | List user's forms |
| POST | /api/forms | Create form |
| GET | /api/forms/:id | Get form with fields |
| PATCH | /api/forms/:id | Update title / publish |
| DELETE | /api/forms/:id | Delete form |

### Fields
| Method | Route | Description |
|---|---|---|
| POST | /api/forms/:id/fields | Add field |
| PATCH | /api/forms/:id/fields/reorder | Reorder fields after drag |
| PATCH | /api/forms/:id/fields/:fieldId | Update field properties |
| DELETE | /api/forms/:id/fields/:fieldId | Delete field |

### Public (no auth)
| Method | Route | Description |
|---|---|---|
| GET | /api/public/:token | Get published form |
| POST | /api/public/:token/submit | Submit response |

### Responses
| Method | Route | Description |
|---|---|---|
| GET | /api/forms/:id/responses | Get responses + analytics |

---

## Key Design Decisions

**Why JWT over sessions?**
Stateless — the server doesn't need to store session state. Scales horizontally without a shared session store. Two-token pattern: short-lived access token limits exposure if stolen, long-lived refresh token in httpOnly cookie is safe from XSS.

**Why Last-Write-Wins for collaboration conflict resolution?**
Simpler than Operational Transformation (OT) or CRDTs, and acceptable for this use case — form fields are discrete objects, not shared text documents. Two people editing the same field label simultaneously is rare; the last save wins. OT would be the right choice if we were building a Google Docs-style shared text editor.

**Why optimistic updates?**
UI state updates immediately on user action, API call fires in background. Combined with 600ms debounce on text inputs, this gives a fast, native-feeling editor without hammering the server on every keystroke.

**Why single-server deployment?**
Express serves both the API and the React static build from the same Render service. No CORS configuration in production, simpler deployment, one URL for everything. The tradeoff is that the frontend and backend scale together — acceptable for a project at this stage.

---

## Project Structure

```
formflow/
├── client/                    # React frontend
│   └── src/
│       ├── api/               # Axios instances and API functions
│       ├── components/
│       │   ├── builder/       # FieldCard, FieldEditor, FieldPalette, etc.
│       │   └── shared/        # Navbar, ProtectedRoute, ErrorBoundary, Skeleton
│       ├── pages/             # Dashboard, BuilderPage, PublicForm, ResponsesPage
│       ├── socket/            # Socket.io instance and useFormSocket hook
│       └── store/             # Zustand stores (auth, form, socket)
│
└── server/                    # Express backend
    ├── config/                # DB connection, JWT helpers
    ├── controllers/           # auth, forms, fields, responses
    ├── middleware/            # auth guard, error handler
    ├── models/                # Sequelize models + associations
    ├── routes/                # auth, forms, public
    └── socket/                # Socket.io server and event handlers
```

---

## Author

**Shivam Sharma**
Full-Stack Developer · [github.com/shivxmsharma](https://github.com/shivxmsharma)