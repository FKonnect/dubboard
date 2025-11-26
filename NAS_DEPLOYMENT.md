# NAS Deployment Guide

This guide provides step-by-step instructions for deploying Dubboard to your Synology NAS.

## Prerequisites

- Synology NAS with Docker installed
- SSH access to your NAS (or use Synology's Docker GUI)
- Your NAS IP address (e.g., `192.168.1.100`)
- Ports available: 3000, 8000, 8001, 8002, 54322

## Step 1: Prepare Environment Variables

### 1.1 Update .env File for NAS

Create or update your `.env` file in the project root. Replace `localhost` with your NAS IP address:

```bash
# Supabase URL - Use your NAS IP address
NEXT_PUBLIC_SUPABASE_URL=http://YOUR_NAS_IP:8000
SUPABASE_PUBLIC_URL=http://YOUR_NAS_IP:8000
API_EXTERNAL_URL=http://YOUR_NAS_IP:8000
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

1. Navigate to: `http://YOUR_NAS_IP:8002`
2. You should see the Supabase Studio interface
3. Use this to manage your database, run migrations, and view data

### 4.5 Run Database Migrations (if not done)

1. In Supabase Studio (`http://YOUR_NAS_IP:8002`), go to SQL Editor
2. Run the migration files in order:
   - `supabase/migrations/002_fix_schema_migrations_index.sql`
   - `supabase/migrations/001_initial_schema.sql`

## Step 5: Network Configuration

### 5.1 Firewall Settings

Ensure these ports are open on your NAS:
- **3000**: Next.js application
- **8000**: Supabase API (Kong)
- **8001**: Kong Admin API
- **8002**: Supabase Studio
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
   netstat -tuln | grep -E '3000|8000|8001|8002|54322'
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
   curl http://YOUR_NAS_IP:8001/health
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



