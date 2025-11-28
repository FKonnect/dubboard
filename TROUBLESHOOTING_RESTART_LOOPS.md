# Troubleshooting Container Restart Loops

If your Supabase containers (studio, storage, realtime, rest) keep restarting, follow these steps:

## Step 1: Check Container Logs

First, identify which service is failing and why:

```bash
# Check all container status
docker-compose ps

# Check logs for each service
docker-compose logs studio --tail 50
docker-compose logs storage --tail 50
docker-compose logs realtime --tail 50
docker-compose logs rest --tail 50
```

Common error patterns:
- `password authentication failed` - Missing or wrong password for database user
- `role does not exist` - Missing database role
- `schema does not exist` - Missing database schema
- `connection refused` - Service dependency not ready
- `out of memory` - Resource constraints

## Step 2: Fix Missing Database Roles

Run the migration to create missing roles:

```bash
docker exec -i supabase_db_dubboard psql -U supabase_admin -d postgres < migration_009_fix_missing_roles.sql
```

## Step 3: Set Passwords for Database Users

Set passwords for the database users (must match your POSTGRES_PASSWORD):

```bash
# Get your POSTGRES_PASSWORD from .env file first
docker exec -i supabase_db_dubboard psql -U supabase_admin -d postgres -c "ALTER ROLE authenticator WITH PASSWORD 'your-postgres-password';"
docker exec -i supabase_db_dubboard psql -U supabase_admin -d postgres -c "ALTER ROLE supabase_storage_admin WITH PASSWORD 'your-postgres-password';"
```

## Step 4: Check Resource Constraints

If you're running on a NAS or low-resource system, you may need to add resource limits:

```bash
# Check system resources
free -h
df -h
```

If memory is low, consider:
1. Reducing the number of services
2. Adding swap space
3. Increasing Docker memory limits

## Step 5: Restart Services in Order

Restart services in dependency order:

```bash
# Stop all services
docker-compose down

# Start core services first
docker-compose up -d db
sleep 10

# Start dependencies
docker-compose up -d meta kong
sleep 10

# Start auth and rest
docker-compose up -d auth rest
sleep 10

# Start remaining services
docker-compose up -d storage realtime studio
```

## Step 6: Verify Service Health

Check if services are healthy:

```bash
# Check service health
docker-compose ps

# Test endpoints
curl http://localhost:8010/auth/v1/health
curl http://localhost:8010/rest/v1/
```

## Common Issues and Solutions

### Issue: "authenticator" role missing
**Solution**: Run migration_009_fix_missing_roles.sql

### Issue: Password authentication failed
**Solution**: Set passwords for authenticator and supabase_storage_admin

### Issue: Storage schema missing
**Solution**: The migration creates it, but you can manually create:
```sql
CREATE SCHEMA IF NOT EXISTS storage;
ALTER SCHEMA storage OWNER TO supabase_storage_admin;
```

### Issue: Out of memory
**Solution**: 
1. Check available memory: `free -h`
2. Add resource limits to docker-compose.yml
3. Consider running fewer services

### Issue: Service dependency not ready
**Solution**: 
1. Ensure db is healthy: `docker-compose ps db`
2. Check health checks are passing
3. Increase start_period in health checks

## Adding Resource Limits (Optional)

If you have limited resources, add limits to docker-compose.yml:

```yaml
services:
  studio:
    # ... existing config ...
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
  
  storage:
    # ... existing config ...
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
```

## Monitoring

Monitor container restarts:

```bash
# Watch container status
watch -n 2 'docker-compose ps'

# Check restart counts
docker-compose ps | grep -E "restarting|unhealthy"
```

## Still Having Issues?

1. Check all logs: `docker-compose logs > all-logs.txt`
2. Verify environment variables are set correctly
3. Ensure database is healthy: `docker exec supabase_db_dubboard pg_isready`
4. Check network connectivity: `docker network inspect dubboard-network`

