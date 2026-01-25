# Deploying to Render

This guide walks you through deploying the app to [Render](https://render.com) - a simple cloud platform that handles all the infrastructure for you.

## What Gets Deployed

| Service | Type | Description |
|---------|------|-------------|
| **frontend** | Static Site | React app served globally |
| **backend** | Web Service | Node.js GraphQL API |
| **app-db** | PostgreSQL | Managed database |

## One-Time Setup (5 minutes)

### Step 1: Create a Render Account

1. Go to [render.com](https://render.com) and click **Get Started**
2. Sign up with your GitHub account (recommended for easy deploys)

### Step 2: Push Code to GitHub

If your code isn't on GitHub yet:

```bash
# From the project root
git init
git add .
git commit -m "Initial commit"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 3: Deploy with Render Blueprint

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and show you what will be created
5. Click **Apply** to deploy everything

That's it! Render will:
- Create the PostgreSQL database
- Build and deploy the backend
- Build and deploy the frontend
- Wire everything together automatically

## After Deployment

### Find Your URLs

Once deployed, find your service URLs in the Render dashboard:
- **Frontend**: `https://frontend-xxxx.onrender.com`
- **Backend**: `https://backend-xxxx.onrender.com`

### Update Frontend API URL

The frontend needs to know where the backend is. Update the environment variable:

1. Go to your **frontend** service in Render
2. Click **Environment** in the left sidebar
3. Find `VITE_API_URL` and set it to your backend URL (e.g., `https://backend-xxxx.onrender.com`)
4. Click **Save Changes** - this triggers a redeploy

## Ongoing Deployments

After initial setup, deployments are automatic:

1. Push code to GitHub
2. Render detects changes and redeploys
3. Database migrations run automatically on backend start

## Costs

With the **free tier**:
- Frontend: Free (static hosting)
- Backend: Free (spins down after 15 min inactivity, ~30s cold start)
- Database: Free (90 days, then $7/month for starter)

For production, upgrade to paid plans (~$7/month each) for:
- No cold starts
- Persistent database
- Better performance

## Troubleshooting

### Backend won't start
- Check **Logs** in the Render dashboard
- Verify `DATABASE_URL` is set (should be automatic)

### Frontend can't reach backend
- Verify `VITE_API_URL` points to the correct backend URL
- Make sure it includes `https://`

### Database connection errors
- Wait a few minutes - the database might still be provisioning
- Check that the backend service has the `DATABASE_URL` environment variable

## Manual Deployment (Alternative)

If you prefer not to use Blueprints, you can create each service manually:

1. **Create Database**: New → PostgreSQL → name it `app-db`
2. **Create Backend**: New → Web Service → connect repo → set root directory to `backend`
3. **Create Frontend**: New → Static Site → connect repo → set root directory to `frontend`
4. **Link them**: Copy the database's Internal URL to the backend's `DATABASE_URL` env var
