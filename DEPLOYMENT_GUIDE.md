# Deployment Guide: Live on Supabase

## Overview
This guide walks you through deploying your Property Lease Management System live on Supabase with the frontend and backend both in production.

---

## Step 1: Set Up Supabase Project

### 1.1 Create a Supabase Account & Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project" 
4. Choose a name: `property-management`
5. Create a strong database password
6. Select a region closest to your users
7. Wait for the project to initialize (5-10 minutes)

### 1.2 Get Your Credentials
Once your project is ready:
1. Go to Settings → API
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

Save these securely - you'll need them for environment variables.

---

## Step 2: Set Up Database Schema

### 2.1 Run Migrations in Supabase
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Click "New Query"
4. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
5. Paste it into the editor
6. Click "Run"
7. Repeat for other migration files in order:
   - `002_create_indexes.sql`
   - `003_create_functions.sql`

This creates all your tables: users, properties, leases, tenants, payments, maintenance, utilities.

---

## Step 3: Configure Environment Variables

### 3.1 Backend Environment (.env)

Create `.env` file in the `backend` folder:

```env
# Node Environment
NODE_ENV=production

# Server
PORT=8000

# Supabase
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT
JWT_SECRET=your_secure_jwt_secret_here_min_32_chars
JWT_EXPIRE=30d

# Email (Gmail or your provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 3.2 Frontend Environment (.env.production)

Create `.env.production` file in the `frontend` folder:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=https://your-backend-domain.com/api/v1
```

---

## Step 4: Deploy Backend

### Option A: Deploy on Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **From backend folder, run:**
   ```bash
   cd backend
   vercel
   ```

3. **Follow prompts:**
   - Link to your Vercel account
   - Select project name
   - Select "Nodejs" as framework

4. **Set Environment Variables in Vercel Dashboard:**
   - Go to Settings → Environment Variables
   - Add all variables from `.env` file
   - Redeploy

5. **Get your backend URL** (e.g., `https://property-backend.vercel.app`)

### Option B: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub account
3. New Project → Deploy from GitHub
4. Select your repo
5. Choose `backend` directory as root
6. Add environment variables
7. Deploy

### Option C: Deploy on Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Select `backend` folder
5. Runtime: Node
6. Build command: `npm install`
7. Start command: `npm start`
8. Add environment variables
9. Deploy

---

## Step 5: Deploy Frontend

### Option A: Deploy on Vercel (Recommended)

1. **From project root:**
   ```bash
   cd frontend
   vercel
   ```

2. **Follow prompts to deploy**

3. **Set Environment Variables:**
   - Settings → Environment Variables
   - Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
   - Redeploy

### Option B: Deploy on Netlify

1. Commit code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. New site from Git
4. Select repo
5. Build command: `npm run build` (in frontend folder)
6. Publish directory: `frontend/dist`
7. Add environment variables
8. Deploy

---

## Step 6: Update CORS & Security

### 6.1 Backend CORS Configuration

Update [backend/src/app.js](backend/src/app.js) CORS settings with your frontend URL:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 6.2 Supabase RLS (Row-Level Security)

Enable RLS on all tables for security:
1. Go to Supabase Dashboard → Authentication → Policies
2. Enable RLS on each table
3. Create policies for your app logic

---

## Step 7: Enable Supabase Features

### Authentication
1. Go to Authentication → Providers
2. Enable Email/Password
3. Configure email templates if needed

### Storage (for images)
1. Go to Storage
2. Create buckets:
   - `property-images`
   - `user-avatars`
3. Set public access policies

---

## Step 8: Test Your Live Deployment

1. Visit your frontend URL
2. Test sign up / login
3. Create a property
4. Create a lease
5. Check all API calls work correctly

---

## Step 9: Set Up Monitoring & Backups

### Supabase Backups
1. Go to Settings → Backups
2. Enable automatic backups
3. Configure backup schedule

### Logging
Check logs on:
- Backend: Vercel/Railway/Render dashboard
- Frontend: Browser console + Sentry (optional)
- Database: Supabase → Database → Query Performance

---

## Useful Commands

```bash
# Build frontend
cd frontend && npm run build

# Test backend locally
cd backend && npm start

# View Supabase logs
supabase functions logs

# Deploy Supabase functions (optional)
supabase functions deploy
```

---

## Common Issues & Fixes

### Frontend can't connect to API
- Check `VITE_API_URL` is correct
- Verify backend is running
- Check CORS headers in backend
- Open browser DevTools → Network tab

### Database tables not showing
- Verify migrations ran successfully
- Check Supabase SQL Editor for errors
- Ensure you used correct SQL from migrations

### Authentication not working
- Verify `SUPABASE_URL` and keys are correct
- Check Supabase Authentication settings
- Verify email provider is configured

### Deployment fails
- Check environment variables are set
- Verify all dependencies in package.json
- Check build logs on deployment platform

---

## Next Steps

1. Set up custom domain (optional)
2. Enable HTTPS (automatic on most platforms)
3. Set up CI/CD for automatic deployments
4. Monitor performance and errors
5. Scale as needed

---

## Support

- Supabase Docs: https://supabase.com/docs
- Backend Framework: https://expressjs.com/
- Frontend Framework: https://react.dev/
- Deployment Platforms:
  - Vercel: https://vercel.com/docs
  - Railway: https://docs.railway.app/
  - Render: https://render.com/docs
