# Architecture Overview - Supabase Deployment

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET / USERS                        │
└────────────────────────┬──────────────────────────────────────┬┘
                         │                                       │
                    HTTPS                                   HTTPS
                         │                                       │
          ┌──────────────▼────────────────┐         ┌────────────▼──────────────┐
          │   Frontend (React + Vite)    │         │  Browser/Mobile Client    │
          │   Deployed on Vercel         │         │                           │
          │                              │         │  • Login/Signup           │
          │  • Dashboard UI              │◄────────┤  • View Properties        │
          │  • Property Management       │ JSON    │  • Manage Leases          │
          │  • Payment Tracking          │ HTTPS   │  • Track Payments         │
          │  • Maintenance Requests      │         │  • Schedule Maintenance   │
          │  • Utilities Tracking        │         │  • Process Utilities      │
          └──────────────┬────────────────┘         └───────────────────────────┘
                         │
                         │ REST API Calls
                         │ JSON + JWT
                    HTTPS│
                         │
          ┌──────────────▼────────────────┐
          │   Backend API (Express)       │
          │   Deployed on Vercel          │
          │                               │
          │  • Authentication (JWT)       │
          │  • User Management            │
          │  • Property Services          │
          │  • Lease Management           │
          │  • Payment Processing         │
          │  • Maintenance Tracking       │
          │  • Utilities Processing       │
          │  • Email Notifications        │
          │  • Data Validation            │
          └──────────────┬────────────────┘
                         │
                         │ SQL Queries
                         │ Authenticated
                    HTTPS│
                         │
          ┌──────────────▼────────────────┐
          │     Supabase Database        │
          │   (PostgreSQL + Auth)        │
          │                               │
          │  Tables:                     │
          │  • users                     │
          │  • properties                │
          │  • tenants                   │
          │  • leases                    │
          │  • payments                  │
          │  • maintenance               │
          │  • utilities                 │
          │                               │
          │  Features:                   │
          │  • Row-Level Security (RLS)  │
          │  • Auto-Timestamps           │
          │  • Indexes for Performance   │
          │  • Backup & Recovery         │
          │  • REST API                  │
          │  • Real-time Subscriptions   │
          └───────────────────────────────┘
```

## Data Flow - Creating a New Property

```
1. USER INTERACTION
   ┌─────────────────────────────────────────┐
   │ User fills form in React Frontend       │
   │ Clicks "Create Property"                │
   └────────────────┬────────────────────────┘
                    │
                    ▼
2. FRONTEND VALIDATION
   ┌─────────────────────────────────────────┐
   │ Frontend validates input (Joi)          │
   │ Shows error or proceeds                 │
   └────────────────┬────────────────────────┘
                    │
                    ▼
3. API REQUEST
   ┌─────────────────────────────────────────┐
   │ POST /api/v1/properties                 │
   │ Headers: Authorization: Bearer <JWT>   │
   │ Body: { name, address, type, ... }    │
   └────────────────┬────────────────────────┘
                    │
                    ▼
4. BACKEND PROCESSING
   ┌─────────────────────────────────────────┐
   │ Express Route Handler                   │
   │ • Verify JWT token                      │
   │ • Validate request body                 │
   │ • Generate UUID for property            │
   │ • Set timestamps (created_at, etc)      │
   └────────────────┬────────────────────────┘
                    │
                    ▼
5. DATABASE INSERT
   ┌─────────────────────────────────────────┐
   │ Supabase Client (supabase-js)           │
   │ INSERT INTO properties (...)            │
   │ VALUES (...)                            │
   │ RETURNING *                             │
   └────────────────┬────────────────────────┘
                    │
                    ▼
6. RESPONSE
   ┌─────────────────────────────────────────┐
   │ JSON Response                           │
   │ { id, name, address, ... }             │
   │ Status: 201 Created                     │
   └────────────────┬────────────────────────┘
                    │
                    ▼
7. FRONTEND UPDATE
   ┌─────────────────────────────────────────┐
   │ React updates UI                        │
   │ Shows success message                   │
   │ Refreshes properties list               │
   └─────────────────────────────────────────┘
```

## Authentication Flow

```
1. SIGN UP
   User ──email/password──> Frontend ──POST /auth/signup──> Backend
                                                              │
                                          ┌─────────────────┘
                                          │
                                          ▼ Generate JWT
                                       Response: {token, user}
                                          │
   Frontend stores token in localStorage◄┘

2. LOGIN
   User ──email/password──> Frontend ──POST /auth/login──> Backend
                                                              │
                                    Validate credentials      │
                                          │                   │
   Frontend stores token in localStorage◄──JWT token──────────┘

3. AUTHENTICATED REQUESTS
   Frontend includes JWT in Authorization header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                                │
                                ▼ Backend verifies JWT
                          JWT_SECRET (32+ chars)
                                │
                    Valid ──────┴────── Invalid
                    │                      │
                  Process            Return 401
              Continue API call    Unauthorized
```

## Environment Variables Flow

```
┌──────────────────────────────────────────────────────────┐
│              Deployment Environment Setup                │
└──────────────────────────────────────────────────────────┘

DEVELOPMENT (Local)
├─ backend/.env (your local file)
│  ├─ SUPABASE_URL=local_or_dev_url
│  ├─ JWT_SECRET=dev_key
│  └─ FRONTEND_URL=http://localhost:5173
│
└─ frontend/.env.development
   ├─ VITE_SUPABASE_URL=local_url
   └─ VITE_API_URL=http://localhost:5000/api/v1

PRODUCTION (Deployed)
├─ Vercel Backend
│  ├─ Environment Variables Dashboard
│  ├─ SUPABASE_URL=production_url
│  ├─ JWT_SECRET=production_key
│  ├─ FRONTEND_URL=https://property-management-xxxxx.vercel.app
│  └─ Auto-deployed on git push
│
├─ Vercel Frontend
│  ├─ Environment Variables Dashboard
│  ├─ VITE_SUPABASE_URL=production_url
│  ├─ VITE_API_URL=https://property-backend-xxxxx.vercel.app/api/v1
│  └─ Auto-deployed on git push
│
└─ Supabase Project
   ├─ Project Settings > API
   ├─ Project URL
   ├─ Anon Key
   └─ Service Role Key
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Architecture                    │
└─────────────────────────────────────────────────────────────┘

1. HTTPS/TLS
   ├─ All communication encrypted
   ├─ Automatic on Vercel & Supabase
   └─ Certificates auto-renewed

2. CORS (Cross-Origin Resource Sharing)
   ├─ Backend whitelists Frontend URL
   ├─ Prevents unauthorized API access
   └─ Configured in backend/src/app.js

3. JWT Tokens (JSON Web Tokens)
   ├─ Signed with JWT_SECRET (32+ chars)
   ├─ Includes user ID & expiration
   ├─ Verified on every API request
   └─ Expires in 30 days by default

4. Row-Level Security (RLS)
   ├─ Database level access control
   ├─ Users only see their own data
   ├─ Policies defined in RLS migration
   └─ Prevents SQL injection attacks

5. Password Hashing
   ├─ Bcryptjs (12 salt rounds)
   ├─ Never store plain passwords
   ├─ Passwords hashed before storage
   └─ Verified during login

6. Rate Limiting
   ├─ API endpoints rate limited
   ├─ Prevents brute force attacks
   ├─ Prevents DDoS attacks
   └─ Configured in middleware

7. Helmet Security Headers
   ├─ Content Security Policy (CSP)
   ├─ X-Frame-Options (clickjacking)
   ├─ X-Content-Type-Options
   └─ Strict-Transport-Security (HSTS)

8. Environment Variables
   ├─ Never hardcoded in code
   ├─ Stored securely in Vercel
   ├─ Never committed to GitHub
   └─ Rotated periodically
```

## Deployment Checklist Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Pipeline                      │
└─────────────────────────────────────────────────────────────┘

STEP 1: PREPARE (30 mins)
├─ Create Supabase project
├─ Copy credentials
├─ Generate JWT_SECRET
└─ Create environment files

STEP 2: SETUP DATABASE (10 mins)
├─ Run 001_initial_schema.sql
├─ Run 002_create_functions.sql
├─ Run 003_enable_rls.sql
└─ Verify tables exist

STEP 3: CONFIGURE (5 mins)
├─ Fill backend/.env
├─ Fill frontend/.env.production
└─ Commit to git

STEP 4: DEPLOY BACKEND (5 mins)
├─ Push code to GitHub
├─ Run: vercel --prod
├─ Add environment variables
└─ Copy backend URL

STEP 5: DEPLOY FRONTEND (5 mins)
├─ Run: vercel --prod
├─ Add environment variables
└─ Copy frontend URL

STEP 6: UPDATE CORS (2 mins)
├─ Update backend FRONTEND_URL
├─ Redeploy backend
└─ Test everything

STEP 7: VERIFY (5 mins)
├─ Test sign up
├─ Test login
├─ Create property
├─ Create lease
└─ Check dashboard

TOTAL TIME: ~60 minutes
```

## Monitoring & Troubleshooting

```
┌─────────────────────────────────────────────────────────────┐
│              Monitoring & Logs Location                     │
└─────────────────────────────────────────────────────────────┘

FRONTEND ISSUES
├─ Browser Console (DevTools > Console tab)
├─ Network tab (API call errors)
├─ Vercel Dashboard > Deployments > Logs
└─ Check VITE_API_URL is correct

BACKEND ISSUES
├─ Vercel Dashboard > Deployments > Logs
├─ Check environment variables are set
├─ Verify backend URL in CORS
└─ Test health endpoint: /health

DATABASE ISSUES
├─ Supabase Dashboard > SQL Editor
├─ Supabase Dashboard > Logs (query performance)
├─ Check table structure
└─ Verify Row-Level Security policies

AUTHENTICATION ISSUES
├─ Check JWT_SECRET (32+ chars)
├─ Verify tokens in browser localStorage
├─ Check token expiration
└─ Verify Supabase Auth settings

COMMON ERRORS
├─ CORS Error → Update FRONTEND_URL
├─ 401 Unauthorized → Check JWT token/secret
├─ Connection refused → Backend not running
├─ Table not found → Run migrations
└─ RLS policy → Check database policies
```

## Performance Optimization

```
Database Indexes:
- users(email) - for login lookups
- properties(created_by, status) - for filtering
- leases(property_id, tenant_id, status) - for queries
- payments(lease_id, status, due_date) - for reports
- maintenance(property_id, status) - for tracking
- utilities(property_id, lease_id) - for billing

Caching Strategies:
- Frontend caches API responses (if needed)
- Use pagination for large datasets
- Implement lazy loading for lists
- Cache database queries (optional)

Scaling:
- Start with Supabase free tier
- Monitor usage in Supabase Dashboard
- Upgrade when needed
- Same for Vercel deployment
```

---

This architecture provides a secure, scalable foundation for your property management system!
