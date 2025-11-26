# Docker Deployment Troubleshooting Guide

This guide helps you resolve common issues when deploying Dubboard with Docker Compose.

## Common Issues and Solutions

### 1. npm ci Fails During Build

**Error:** `npm error The command '/bin/sh -c npm ci' returned a non-zero code: 1`

**Causes:**
- `package-lock.json` is out of sync with `package.json`
- npm version mismatch
- Corrupted package-lock.json

**Solutions:**

**Option A: Regenerate package-lock.json (Recommended)**

**For Linux/Mac (bash):**
```bash
# Delete old lock file and node_modules
rm -rf node_modules package-lock.json

# Reinstall and generate new lock file
npm install

# Commit the new package-lock.json
git add package-lock.json
git commit -m "Update package-lock.json"
```

**For Windows (PowerShell):**
```powershell
# Delete old lock file and node_modules
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue

# Reinstall and generate new lock file
npm install

# Commit the new package-lock.json
git add package-lock.json
git commit -m "Update package-lock.json"
```

**Option B: Use the updated Dockerfile**
The Dockerfile now automatically falls back to `npm install` if `npm ci` fails. This should resolve most issues.

**Option C: Clear Docker build cache**
```bash
docker-compose build --no-cache app
```

### 2. Build Fails Due to Missing Environment Variables

**Error:** `Missing Supabase environment variables`

**Solution:**
Ensure your `.env` file exists and contains all required variables:
```bash
# Check if .env exists
ls -la .env

# Verify required variables are set
cat .env | grep -E "NEXT_PUBLIC_SUPABASE|ANON_KEY|JWT_SECRET|POSTGRES_PASSWORD"
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `ANON_KEY`)
- `JWT_SECRET`
- `POSTGRES_PASSWORD`
- `SERVICE_ROLE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`)

### 3. Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solutions:**

**Option A: Stop conflicting services**

**On Linux/Mac:**
```bash
# Find what's using the port
lsof -i :3000
```

**On Windows (PowerShell):**
```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Or use Get-NetTCPConnection (PowerShell 5.1+)
Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress, LocalPort, State, OwningProcess
```

**Stop the conflicting service or change ports in docker-compose.yml**

**Option B: Change ports in docker-compose.yml**
```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### 4. Database Connection Fails

**Error:** `Database connection failed` or `Connection refused`

**Solutions:**

1. **Check database container is running:**
   ```bash
   docker-compose ps db
   ```

2. **Check database logs:**
   ```bash
   docker-compose logs db
   ```

3. **Verify environment variables:**
   ```bash
   docker-compose exec db env | grep POSTGRES
   ```

4. **Wait for database to be ready:**
   The database container has a healthcheck. Wait 30-60 seconds after starting.

5. **Check network connectivity:**
   ```bash
   docker-compose exec app ping db
   ```

### 5. Kong Gateway Not Starting

**Error:** `Kong health check failed`

**Solutions:**

1. **Verify kong.yml exists:**
   ```bash
   ls -la supabase/kong.yml
   ```

2. **Generate Kong config if missing:**
   ```bash
   npm run generate-kong-config
   ```

3. **Check Kong logs:**
   ```bash
   docker-compose logs kong
   ```

4. **Verify Kong config syntax:**
   ```bash
   docker-compose exec kong kong config -c /var/lib/kong/kong.yml
   ```

### 6. Next.js App Won't Start

**Error:** `Cannot find module` or `server.js not found`

**Solutions:**

1. **Rebuild the app:**
   ```bash
   docker-compose build --no-cache app
   docker-compose up -d app
   ```

2. **Check if standalone output is enabled:**
   Verify `next.config.js` has:
   ```js
   output: 'standalone',
   ```

3. **Check app logs:**
   ```bash
   docker-compose logs app
   ```

### 7. Out of Disk Space

**Error:** `no space left on device`

**Solutions:**

1. **Clean up Docker:**
   ```bash
   # Remove unused images
   docker image prune -a

   # Remove unused volumes
   docker volume prune

   # Remove build cache
   docker builder prune
   ```

2. **Check disk usage:**
   ```bash
   docker system df
   ```

### 8. Permission Denied Errors

**Error:** `Permission denied` when accessing files

**Solutions:**

1. **On Linux, fix file permissions:**
   ```bash
   sudo chown -R $USER:$USER .
   ```

   **On Windows:**
   - Usually not needed, but if you see permission errors:
   ```powershell
   # Take ownership of files (run as Administrator)
   takeown /F . /R /D Y
   icacls . /grant %USERNAME%:F /T
   ```

2. **Check Docker volume permissions:**
   ```bash
   docker-compose exec app ls -la /app
   ```

### 9. Services Start But App Shows Errors

**Check service health:**
```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f kong
```

**Common runtime issues:**

1. **Environment variables not set correctly:**
   ```bash
   docker-compose exec app env | grep SUPABASE
   ```

2. **Network connectivity between services:**
   ```bash
   docker-compose exec app curl http://kong:8000/health
   ```

3. **Database migrations not run:**
   Access Supabase Studio at `http://localhost:8002` and run migrations.

### 10. Build Takes Too Long

**Solutions:**

1. **Use Docker build cache:**
   ```bash
   docker-compose build
   ```

2. **Build only the app service:**
   ```bash
   docker-compose build app
   ```

3. **Use .dockerignore effectively:**
   Ensure large files and `node_modules` are excluded.

## Step-by-Step Recovery

If everything is broken, follow these steps:

1. **Stop all containers:**
   ```bash
   docker-compose down
   ```

2. **Clean up:**
   ```bash
   docker-compose down -v  # Removes volumes (⚠️ deletes data)
   docker system prune -a  # Removes unused images
   ```

3. **Verify .env file:**
   ```bash
   cp ENV_TEMPLATE.txt .env
   # Edit .env with your values
   ```

4. **Generate Kong config:**
   ```bash
   npm run generate-kong-config
   ```

5. **Rebuild everything:**
   ```bash
   docker-compose build --no-cache
   ```

6. **Start services:**
   ```bash
   docker-compose up -d
   ```

7. **Monitor logs:**
   ```bash
   docker-compose logs -f
   ```

8. **Wait 2-3 minutes** for all services to start

9. **Verify services:**
   ```bash
   docker-compose ps
   ```

## Getting Help

If you're still experiencing issues:

1. **Collect diagnostic information:**
   ```bash
   # Docker version
   docker --version
   docker-compose --version

   # Service status
   docker-compose ps

   # Recent logs
   docker-compose logs --tail=100

   # System resources
   docker system df
   ```

2. **Check the logs:**
   - App: `docker-compose logs app`
   - Database: `docker-compose logs db`
   - Kong: `docker-compose logs kong`

3. **Verify configuration:**
   - `.env` file exists and has correct values
   - `supabase/kong.yml` exists
   - `package-lock.json` is up to date

## Prevention Tips

1. **Keep package-lock.json in sync:**
   - Always commit `package-lock.json` after `npm install`
   - Don't manually edit `package-lock.json`

2. **Use version control:**
   - Commit `.env.example` (not `.env`)
   - Document required environment variables

3. **Regular maintenance:**
   - Update Docker images regularly
   - Clean up unused Docker resources
   - Monitor disk space

4. **Test locally first:**
   - Test changes locally before deploying
   - Use `docker-compose up` (not `-d`) to see errors immediately

