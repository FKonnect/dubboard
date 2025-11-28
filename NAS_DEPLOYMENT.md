# NAS Deployment Guide

This guide provides step-by-step instructions for deploying Dubboard to your Synology NAS.

## Prerequisites

- Synology NAS with Docker installed
- SSH access to your NAS (or use Synology's Docker GUI)
- Your NAS IP address (e.g., `192.168.1.100`)
- Ports available: 3000, 8002, 8010, 8011, 54322

## Step 1: Prepare Environment Variables

### 1.1 Update .env File for NAS

Create or update your `.env` file in the project root. Replace `localhost` with your NAS IP address:

```bash
# Supabase URL - Use your NAS IP address
NEXT_PUBLIC_SUPABASE_URL=http://YOUR_NAS_IP:8010
SUPABASE_PUBLIC_URL=http://YOUR_NAS_IP:8010
API_EXTERNAL_URL=http://YOUR_NAS_IP:8010
SITE_URL=http://YOUR_NAS_IP:3000

# Generated secure secrets (keep these secure!)
JWT_SECRET=your_generated_jwt_secret_here
POSTGRES_PASSWORD=your_generated_postgres_password_here
ANON_KEY=your_generated_anon_key_here
SERVICE_ROLE_KEY=your_generated_service_role_key_here

# Next.js App Configuration
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

# Optional Settings
JWT_EXP=3600
DISABLE_SIGNUP=false
# Set to true to automatically confirm users (no email confirmation needed)
# Set to false to require email confirmation before users can log in
MAILER_AUTOCONFIRM=true
DEFAULT_ORGANIZATION_NAME=Default Organization
DEFAULT_PROJECT_NAME=Default Project
PGRST_DB_SCHEMAS=public,storage,graphql_public
PGRST_DB_EXTRA_SEARCH_PATH=public,extensions
```

**Important:** Replace `YOUR_NAS_IP` with your actual NAS IP address (e.g., `192.168.1.100`).

### 1.2 Generate Kong Configuration

After updating your `.env` file, generate the Kong configuration:

```bash
npm run generate-kong-config
```

This creates `supabase/kong.yml` with your API keys.

## Step 2: Transfer Files to NAS

### Option A: Using Git (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. SSH into your NAS
3. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dubboard.git
   cd dubboard
   ```

### Option B: Using SCP/SFTP

1. From your local machine, transfer files to NAS:
   ```bash
   scp -r . admin@YOUR_NAS_IP:/volume1/docker/dubboard/
   ```
2. SSH into your NAS and navigate to the directory

### Option C: Using Synology File Station

1. Use Synology's File Station to upload the project folder
2. Extract if needed
3. Note the full path to the project directory

## Step 3: Deploy Using Docker Compose

### 3.1 SSH into Your NAS

```bash
ssh admin@YOUR_NAS_IP
```

### 3.2 Navigate to Project Directory

```bash
cd /path/to/dubboard
```

### 3.3 Verify Environment File

Make sure your `.env` file exists and has the correct NAS IP addresses:

```bash
cat .env | grep NAS_IP
```

### 3.4 Start Services

```bash
docker-compose up -d
```

This will:
- Pull required Docker images (first time only)
- Build the Next.js application
- Start all Supabase services
- Start the Next.js app

### 3.5 Monitor Startup

Watch the logs to ensure everything starts correctly:

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f kong
```

Wait 2-3 minutes for all services to fully start.

## Step 4: Verify Deployment

### 4.1 Check Container Status

```bash
docker-compose ps
```

All containers should show "Up" status.

### 4.2 Test Application Access

1. Open your browser and navigate to: `http://YOUR_NAS_IP:3000`
2. You should see the Dubboard homepage

### 4.3 Test Database Connection

1. Navigate to: `http://YOUR_NAS_IP:3000/test-db`
2. Click "Test Connection"
3. You should see: ✅ Database connection successful

### 4.4 Access Supabase Studio

1. Navigate to: `http://YOUR_NAS_IP:8009`
2. You should see the Supabase Studio interface
3. Use this to manage your database, run migrations, and view data

### 4.5 Run Database Migrations (if not done)

1. In Supabase Studio (`http://YOUR_NAS_IP:8009`), go to SQL Editor
2. Run the migration files in order:
   - `supabase/migrations/002_fix_schema_migrations_index.sql`
   - `supabase/migrations/001_initial_schema.sql`

## Step 5: Network Configuration

### 5.1 Firewall Settings

Ensure these ports are open on your NAS:
- **3000**: Next.js application
- **8010**: Supabase API (Kong)
- **8011**: Kong Admin API
- **8009**: Supabase Studio
- **54322**: PostgreSQL (optional, for direct DB access)

### 5.2 Router Port Forwarding (Optional)

If you want to access from outside your local network:
- Forward external ports to your NAS IP
- Update `.env` with your external domain/IP
- **Security Warning**: Only do this if you have proper security measures (firewall, authentication, etc.)

## Step 6: Update Application

When you make changes to the code:

```bash
# Pull latest changes (if using Git)
git pull

# Rebuild and restart
docker-compose up -d --build
```

## Troubleshooting

### Containers Won't Start

1. **Check logs:**
   ```bash
   docker-compose logs
   ```

2. **Check port conflicts:**
   ```bash
   netstat -tuln | grep -E '3000|8002|8010|8011|54322'
   ```

3. **Check disk space:**
   ```bash
   df -h
   ```

### Database Connection Fails

1. **Verify Supabase is running:**
   ```bash
   docker-compose ps
   ```

2. **Check environment variables:**
   ```bash
   docker-compose exec app env | grep SUPABASE
   ```

3. **Test Kong health:**
   ```bash
   curl http://YOUR_NAS_IP:8011/health
   ```

### Application Shows Errors

1. **Check app logs:**
   ```bash
   docker-compose logs app
   ```

2. **Rebuild the app:**
   ```bash
   docker-compose up -d --build app
   ```

### 404 Not Found Error

**Error:** `GET https://dubboard.dubclouds.synology.me/ 404 (Not Found)`

**Cause:** The reverse proxy isn't forwarding requests to the Next.js app, or the app container isn't running.

**Solution:**

1. **Check if the app container is running:**
   ```bash
   docker-compose ps
   ```
   Look for the `app` container - it should show "Up" status.

2. **Check app container logs:**
   ```bash
   docker-compose logs app
   ```
   Look for errors or startup issues.

3. **Verify the app is accessible directly:**
   ```bash
   # Test if the app responds on port 3000
   curl http://localhost:3000
   # Or from another machine on your network:
   curl http://YOUR_NAS_IP:3000
   ```

4. **Check Synology Reverse Proxy Configuration:**
   - Open **Control Panel** → **Application Portal** → **Reverse Proxy**
   - Find the rule for `dubboard.dubclouds.synology.me`
   - Verify:
     - **Source Protocol:** HTTPS
     - **Source Hostname:** `dubboard.dubclouds.synology.me`
     - **Source Port:** 443 (or your HTTPS port)
     - **Destination Protocol:** HTTP
     - **Destination Hostname:** `localhost` (or your NAS IP like `10.0.0.112`)
     - **Destination Port:** `3000`
   - If the rule doesn't exist, create it:
     - Click **Create** → **Reverse Proxy Rule**
     - Fill in the above settings
     - Save and apply

5. **Restart the app container:**
   ```bash
   docker-compose restart app
   ```

6. **If the app still doesn't work, rebuild it:**
   ```bash
   docker-compose up -d --build app
   ```

### Mixed Content Error (HTTPS/HTTP Mismatch)

**Error:** `Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource 'http://...'`

**Cause:** Your application is accessed via HTTPS, but `NEXT_PUBLIC_SUPABASE_URL` is configured with HTTP.

**Solution:**

1. **If using Synology Reverse Proxy:**
   - Set up a reverse proxy rule for port 8010 (Supabase API)
   - Use a subdomain like `api.dubclouds.synology.me` or `dubboard-api.dubclouds.synology.me`
   - Configure it to forward to `http://localhost:8010` with HTTPS enabled

2. **Update your `.env` file:**
   ```bash
   # Change from HTTP to HTTPS
   NEXT_PUBLIC_SUPABASE_URL=https://api.dubclouds.synology.me
   # Or if using same domain with different port:
   # NEXT_PUBLIC_SUPABASE_URL=https://dubboard.dubclouds.synology.me:8010
   
   SUPABASE_PUBLIC_URL=https://api.dubclouds.synology.me
   API_EXTERNAL_URL=https://api.dubclouds.synology.me
   SITE_URL=https://dubboard.dubclouds.synology.me
   ```

3. **Rebuild and restart the app:**
   ```bash
   docker-compose up -d --build app
   ```

4. **Verify the fix:**
   - Check browser console - no more mixed content errors
   - Test login/signup functionality

**Alternative (Development Only):** If you can't set up HTTPS for the API immediately, you can temporarily access your app via HTTP (`http://dubboard.dubclouds.synology.me`) instead of HTTPS. However, this is **not recommended for production**.

### Studio Won't Load

1. **Wait longer** - Studio takes 1-2 minutes to start
2. **Check Kong is healthy:**
   ```bash
   docker-compose logs kong
   ```
3. **Verify Kong config exists:**
   ```bash
   ls -la supabase/kong.yml
   ```

### Performance Issues

- **Increase NAS resources:** Ensure your NAS has at least 4GB RAM
- **Check container resources:** Use `docker stats` to monitor usage
- **Optimize database:** Run `VACUUM` in PostgreSQL if needed

### 400 Bad Request Error When Signing In

**Error**: `POST /auth/v1/token?grant_type=password 400 (Bad Request)`

**Problem**: Users can't sign in after creating an account because email confirmation is required, but no SMTP server is configured.

**Solution**:

1. **Enable auto-confirmation** by adding to your `.env` file:
   ```env
   MAILER_AUTOCONFIRM=true
   ```

2. **Restart the auth service**:
   ```bash
   docker-compose restart auth
   ```

3. **Confirm existing users** (if you already have unconfirmed users):

   **On Linux/Mac:**
   ```bash
   chmod +x scripts/confirm-users.sh
   ./scripts/confirm-users.sh
   ```

   **On Windows (PowerShell):**
   ```powershell
   .\scripts\confirm-users.ps1
   ```

   **Or manually via SQL:**
   ```bash
   docker exec -it supabase_db_dubboard psql -U supabase_admin -d postgres -c "UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;"
   ```

   **To confirm a specific user by email:**
   ```bash
   docker exec -it supabase_db_dubboard psql -U supabase_admin -d postgres -c "UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'user@example.com';"
   ```
   
   **Note**: `confirmed_at` is a generated column in Supabase, so we only update `email_confirmed_at`.

## Maintenance

### Backup Database

```bash
# Create backup
docker-compose exec db pg_dump -U supabase_admin postgres > backup.sql

# Restore backup
docker-compose exec -T db psql -U supabase_admin postgres < backup.sql
```

### Update Services

```bash
# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d
```

### View Resource Usage

```bash
docker stats
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes Data)

```bash
docker-compose down -v
```

## Security Considerations

1. **Change default passwords:** Use strong, unique passwords
2. **Keep secrets secure:** Never commit `.env` file to Git
3. **Use HTTPS:** Consider setting up reverse proxy with SSL
4. **Firewall rules:** Only expose necessary ports
5. **Regular updates:** Keep Docker images and NAS OS updated

## Next Steps

After successful deployment:
1. ✅ Test database connection
2. 🔐 Set up authentication
3. ✅ Build features (todos, calendar, weather)
4. 📱 Configure PWA capabilities



