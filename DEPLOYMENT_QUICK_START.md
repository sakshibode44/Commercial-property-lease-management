# Supabase Deployment Quick Start

This guide helps you deploy your Property Lease Management System to production on Supabase in 30 minutes.

## Prerequisites

- GitHub account
- Vercel account (free tier) - https://vercel.com
- Supabase account (free tier) - https://supabase.com
- Node.js 18+ installed locally

## Step-by-Step Deployment

### ⏱️ 5 Minutes: Create Supabase Project

1. **Go to https://supabase.com and sign in**
   
2. **Create new project:**
   - Click "New Project"
   - Name: `property-management`
   - Database Password: Choose a strong password
   - Region: Select closest to your users
   - Click "Create new project"

3. **Wait for initialization** (5-10 minutes)

4. **Copy your credentials:**
   - Go to Settings (gear icon) → API
   - Copy and save these:
     ```
     Project URL: https://xxxxx.supabase.co
     Anon Public Key: eyJhbGciOiJIUzI1NiIs...
     Service Role Key: eyJhbGciOiJIUzI1NiIs...
     ```

### ⏱️ 5 Minutes: Set Up Database

1. **Go to SQL Editor** in Supabase dashboard

2. **Run migrations in order:**
   - Click "New Query"
   - Copy entire content from `supabase/migrations/001_initial_schema.sql`
   - Paste & click "Run"
   - Repeat for `002_create_functions.sql`
   - Repeat for `003_enable_rls.sql`

3. **Verify tables were created:**
   - Go to Table Editor
   - You should see: users, properties, tenants, leases, payments, maintenance, utilities

### ⏱️ 5 Minutes: Configure Backend

1. **In your project, create `backend/.env`:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Edit `backend/.env`** and fill in:
   ```env
   NODE_ENV=production
   PORT=8000

   # From Supabase Settings → API
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

   # Generate a random 32+ character string
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

   JWT_EXPIRE=30d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FRONTEND_URL=https://your-frontend-url.com
   ```

3. **Install dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### ⏱️ 5 Minutes: Configure Frontend

1. **Create `frontend/.env.production`:**
   ```bash
   cp frontend/.env.example frontend/.env.production
   ```

2. **Edit `frontend/.env.production`:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   VITE_API_URL=https://your-backend-url.com/api/v1
   ```

3. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### ⏱️ 3 Minutes: Deploy Backend to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Push your code to GitHub** (create repo if needed):
   ```bash
   git add .
   git commit -m "Ready for production"
   git push
   ```

3. **Deploy from backend folder:**
   ```bash
   cd backend
   vercel --prod
   ```

4. **Follow prompts:**
   - Link to Vercel account
   - Select project name
   - Keep defaults for most questions

5. **After deployment, add environment variables in Vercel Dashboard:**
   - Go to Settings → Environment Variables
   - Add all variables from your `.env` file
   - Click "Redeploy" to apply changes

6. **Get your backend URL** from Vercel (e.g., `https://property-backend-xxxxx.vercel.app`)

### ⏱️ 3 Minutes: Deploy Frontend to Vercel

1. **From project root:**
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Follow prompts to deploy**

3. **Add environment variables in Vercel:**
   - Settings → Environment Variables
   - Add:
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
     VITE_API_URL=https://your-backend-url.com/api/v1
     ```
   - Redeploy

4. **Get your frontend URL** (e.g., `https://property-management-xxxxx.vercel.app`)

### ⏱️ 1 Minute: Final Configuration

1. **Update backend FRONTEND_URL:**
   - In Vercel backend Settings → Environment Variables
   - Update `FRONTEND_URL` to your frontend URL
   - Redeploy

2. **Test your deployment:**
   - Visit your frontend URL
   - Sign up / Login
   - Create a property
   - Check everything works!

## Testing Checklist

- [ ] Can access frontend URL
- [ ] Can sign up new account
- [ ] Can log in
- [ ] Can create property
- [ ] Can create lease
- [ ] Can record payment
- [ ] Dashboard shows data
- [ ] No console errors

## Troubleshooting

### Frontend won't connect to API
- Check `VITE_API_URL` environment variable is correct
- Verify backend is running on Vercel
- Check browser DevTools → Network tab for error details

### Database errors
- Verify migrations ran successfully in Supabase SQL Editor
- Check table structure with Supabase Table Editor
- Look for errors in deployment logs

### Authentication issues
- Verify Supabase credentials are correct
- Check JWT_SECRET is set and is 32+ characters
- Enable Email/Password in Supabase Authentication settings

### CORS errors
- Update FRONTEND_URL in backend environment variables
- Ensure it matches your deployed frontend URL exactly

## Production Checklist

Before going live with real data:

- [ ] Set up database backups in Supabase
- [ ] Enable HTTPS (automatic on Vercel/Supabase)
- [ ] Set up email notifications
- [ ] Configure DNS with custom domain (optional)
- [ ] Monitor errors with Vercel error logs
- [ ] Set up analytics/monitoring
- [ ] Create admin user account
- [ ] Test payment processing
- [ ] Verify backup & recovery process
- [ ] Document deployment process

## Next Steps

- **Custom Domain:** Go to Vercel Project Settings → Domains
- **Monitoring:** Enable Vercel Analytics for insights
- **Backups:** Schedule automated backups in Supabase
- **Scaling:** Upgrade plans as your usage grows

## Useful Links

- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Your Backend: https://your-backend-url.com/health
- Your Frontend: https://your-frontend-url.com

## Support

If deployment fails:
1. Check Vercel deployment logs
2. Check Supabase SQL editor for migration errors
3. Review environment variables match exactly
4. Verify GitHub code is latest version

Good luck! 🚀
