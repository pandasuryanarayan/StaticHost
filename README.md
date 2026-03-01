# ⚡ StaticHost — Netlify-like Static Website Hosting Platform

A complete, full-stack static website hosting platform where users can upload and host their static websites. Built with Node.js + Express (backend) and React (frontend).

---

## 🚀 Features

- **Drag & Drop Upload** — Drag your HTML/CSS/JS/Images and deploy instantly
- **Unique Hosted URLs** — Each site gets a unique URL: `http://localhost:3001/sites/<sitename>/`
- **JWT Authentication** — Secure signup/login with bcrypt password hashing
- **Real-time Deploy Logs** — See live terminal output during deployment
- **Site Management** — View, manage, delete your deployed sites
- **Deployment History** — Track all your past deployments
- **Analytics Dashboard** — View page views, visitors, bandwidth, countries
- **Rollback** — Roll back to any previous deployment (coming soon)
- **Custom Domains** — Configure custom domains (UI ready)
- **Settings** — Profile, security, API keys, billing, team management
- **Pricing Page** — Beautiful 3-tier pricing with comparison table

---

## 📁 Project Structure

```
statichost/
├── backend/           ← Node.js + Express API
│   ├── server.js      ← Main server file (all routes)
│   ├── package.json
│   ├── .env           ← Environment variables
│   ├── sites/         ← Deployed sites storage (auto-created)
│   └── uploads/       ← Temporary upload storage (auto-created)
│
├── frontend/          ← React Application
│   ├── src/
│   │   ├── App.js          ← App routing + Auth/Toast contexts
│   │   ├── api.js          ← Axios API client
│   │   ├── index.css       ← Global styles + animations
│   │   ├── components/
│   │   │   └── Layout.js   ← Sidebar + Top navbar
│   │   └── pages/
│   │       ├── LandingPage.js   ← Marketing homepage
│   │       ├── Dashboard.js     ← Main dashboard
│   │       ├── NewSite.js       ← Multi-step deploy wizard
│   │       ├── SitesList.js     ← All sites grid
│   │       ├── SiteDetail.js    ← Site detail + deployments
│   │       ├── Analytics.js     ← Analytics charts
│   │       ├── Settings.js      ← Account settings
│   │       └── Pricing.js       ← Pricing page
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** v16+ — [Download here](https://nodejs.org/)
- **npm** v8+

### Step 1: Clone / Download the project
```bash
cd statichost
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Start the Backend Server
```bash
cd backend
npm start
# or for auto-reload during development:
npm run dev
```
Backend runs on **http://localhost:3001**

### Step 5: Start the Frontend (new terminal)
```bash
cd frontend
npm start
```
Frontend runs on **http://localhost:3000**

---

## 🌐 How It Works

### Deploying a Site
1. Sign up / Log in at `http://localhost:3000`
2. Click **"Deploy New Site"**
3. Drag & drop your static files (must include `index.html`)
4. Set a site name (auto-generated or custom)
5. Click **"Deploy Now"**
6. Your site goes live at: `http://localhost:3001/sites/<sitename>/`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/sites` | List user's sites |
| POST | `/api/sites` | Create new site |
| GET | `/api/sites/:id` | Get site details |
| DELETE | `/api/sites/:id` | Delete site |
| PATCH | `/api/sites/:id` | Update site settings |
| POST | `/api/sites/:id/deploy` | Upload & deploy files |
| GET | `/api/sites/:id/deployments` | Deployment history |
| GET | `/api/sites/:id/analytics` | Site analytics |
| GET | `/api/user/stats` | User statistics |
| GET | `/sites/:siteName/*` | **Serve hosted site** |

---

## 🎨 Tech Stack

### Backend
- **Express.js** — Web framework
- **Multer** — File upload handling
- **JWT + bcryptjs** — Authentication
- **Helmet** — Security headers
- **Morgan** — Request logging
- **express-rate-limit** — Rate limiting
- **mime-types** — File type detection

### Frontend
- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **React Dropzone** — Drag & drop file upload
- **Axios** — HTTP client
- **Custom CSS** — No UI library (fully custom dark theme)

---

## 🔧 Configuration

Edit `backend/.env`:
```env
PORT=3001
JWT_SECRET=your_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Deployment to Production

For production, you would need to:
1. Use a real database (MongoDB, PostgreSQL) instead of in-memory arrays
2. Use cloud storage (AWS S3, Cloudflare R2) instead of local filesystem
3. Set up actual subdomain routing (e.g., `*.statichost.app`)
4. Add a CDN for serving static files
5. Set up real DNS management

---

## 📄 License

MIT License — Free to use and modify.

---

Built with ❤️ — **StaticHost**
