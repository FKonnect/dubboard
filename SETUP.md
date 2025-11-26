# Setup Guide for Dubboard

This guide will walk you through setting up your personal dashboard on your Synology NAS.

## Prerequisites

Before you begin, make sure you have:
- A Synology NAS with Docker installed
- Node.js 18+ installed on your development machine (for local development)
- Basic familiarity with Docker and command line

## Step 0: Set Up Self-Hosted Supabase

This project includes a complete self-hosted Supabase setup that runs alongside your Next.js application.

### 0.1: Generate Secure Secrets

First, you need to generate secure secrets for your Supabase instance. You can do this using Node.js:

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate Postgres Password
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate Anon Key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate Service Role Key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Save these values - you'll need them in the next step.

### 0.2: Create Environment File

Create a `.env` file in the project root with the following variables:

```bash
# Supabase URL - Replace 'your-nas-ip' with your actual NAS IP address
NEXT_PUBLIC_SUPABASE_URL=http://your-nas-ip:8010
SUPABASE_PUBLIC_URL=http://your-nas-ip:8010
API_EXTERNAL_URL=http://your-nas-ip:8010
SITE_URL=http://your-nas-ip:3000

# Paste the generated secrets here
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

**Important Notes:**
- Replace `your-nas-ip` with your actual Synology NAS IP address (e.g., `192.168.1.100`)
- For local development, you can use `localhost` instead
- Keep the `.env` file secure and never commit it to version control
- The `ANON_KEY` and `SERVICE_ROLE_KEY` are used by both Supabase services and your Next.js app

### 0.3: Generate Kong Configuration

Kong (the API Gateway) needs your API keys in its configuration file. Generate it from your `.env` file:

```bash
npm run generate-kong-config
```

This will create `supabase/kong.yml` with your actual API keys. You need to run this whenever you change your `ANON_KEY` or `SERVICE_ROLE_KEY`.

### 0.4: Start Supabase Services

Start all Supabase services using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- **Postgres Database** (port 54322)
- **Supabase Studio** (port 8002) - Web UI for managing your database
- **Kong API Gateway** (ports 8010 for API, 8011 for Admin API)
- **GoTrue** (Authentication service)
- **PostgREST** (REST API)
- **Realtime** (WebSocket server)
- **Storage** (File storage)
- **Image Proxy** (Image transformations)

Wait a few minutes for all services to start up. You can check the status with:

```bash
docker-compose ps
```

### 0.5: Access Supabase Studio

Once the services are running, access Supabase Studio at:

```
http://your-nas-ip:8002
```

**Note:** Studio is on port 8002, while the Supabase API (Kong) is on port 8010.

You should see the Supabase Studio interface. This is where you'll:
- View and manage your database tables
- Run SQL queries
- View API documentation
- Manage authentication settings

### 0.6: Get Your API Keys

1. In Supabase Studio, click on the **Settings** icon (gear icon) in the left sidebar
2. Navigate to **API** section
3. You'll see:
   - **Project URL**: `http://your-nas-ip:8010` (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

**Note:** If you don't see these keys in Studio, they should match the `ANON_KEY` and `SERVICE_ROLE_KEY` values you set in your `.env` file.

### 0.7: Run Database Migrations

1. In Supabase Studio, click on the **SQL Editor** in the left sidebar
2. Click **New Query**

3. **First, fix the duplicate index issue** (if you see a performance warning):
   - Copy and paste the contents of `supabase/migrations/002_fix_schema_migrations_index.sql`
   - Click **Run** (or press Ctrl+Enter)
   - This fixes the duplicate index issue on the `schema_migrations` table

4. **Then, create the application tables**:
   - Click **New Query** again
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Click **Run** (or press Ctrl+Enter)

5. Verify the tables were created by checking the **Table Editor** in the left sidebar

You should now see these tables:
- `user_preferences`
- `todos`
- `calendar_events`

## Step 1: Verify Environment Variables

If you followed Step 0, your `.env` file should already be configured. Verify that it contains:

- `NEXT_PUBLIC_SUPABASE_URL` - Should point to your Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Should match your `ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` - Should match your `SERVICE_ROLE_KEY`

For local development, you can also create a `.env.local` file with the same variables.

## Step 2: Local Development (Optional)

To test locally before deploying to your NAS:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Test the database connection by visiting [http://localhost:3000/test-db](http://localhost:3000/test-db)

## Step 3: Deploy to Synology NAS

### Option A: Using Docker Compose (Recommended)

1. Copy your `.env.local` file to `.env` in the project root (Docker Compose will use this)

2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

3. The app will be available at `http://your-nas-ip:3000`

### Option B: Using Synology Docker GUI

1. Build the Docker image:
   ```bash
   docker build -t dubboard:latest .
   ```

2. In Synology Docker:
   - Create a new container from the image
   - Set port mapping: `3000:3000`
   - Add environment variables from your `.env` file
   - Start the container

## Step 4: Verify Everything Works

1. Visit your dashboard at `http://your-nas-ip:3000`

2. Click on "Test DB" in the navigation to verify database connectivity

3. You should see:
   - ✅ Database connection successful
   - Table counts (all should be 0 initially)

## Troubleshooting

### Supabase Services Won't Start

- **Check Docker logs**: Run `docker-compose logs` to see error messages
- **Verify environment variables**: Make sure all required variables are set in `.env`
- **Check port conflicts**: Ensure ports 8010, 8011, 3000, and 54322 aren't already in use
- **Database initialization**: If Postgres fails to start, try removing the volume: `docker-compose down -v` (WARNING: This deletes all data!)

### Database Connection Fails

- **Check Supabase is running**: Run `docker-compose ps` to verify all services are up
- **Verify environment variables**: Double-check your `.env` file has the correct values
- **Check Studio access**: Try accessing `http://your-nas-ip:8002` in your browser
- **Check migrations**: Make sure you ran the SQL migration in Step 0.6
- **Firewall**: Ensure ports 8010, 8011, and 3000 are open on your NAS
- **Network connectivity**: If services can't communicate, check Docker network: `docker network inspect dubboard_dubboard-network`

### Docker Issues

- **Port conflicts**: Make sure ports 3000, 8010, 8011, and 54322 aren't already in use
- **Build errors**: Try `docker-compose build --no-cache` to rebuild from scratch
- **Permissions**: Make sure Docker has proper permissions on your NAS
- **Memory issues**: Supabase requires significant resources. Ensure your NAS has enough RAM (recommended: 4GB+)

### Studio Won't Load

- **Wait for services**: Studio depends on Kong and Meta services. Wait 1-2 minutes after starting
- **Check Kong health**: Run `docker-compose logs kong` to see if Kong is healthy
- **Verify Kong config**: Check that `supabase/kong.yml` exists and is properly formatted
- **Clear browser cache**: Try accessing Studio in an incognito/private window

### API Keys Not Working

- **Verify keys match**: The keys in Studio should match your `.env` file
- **Check Kong consumers**: The keys are configured in `supabase/kong.yml`
- **Restart services**: Try `docker-compose restart kong` if keys aren't working

## Next Steps

Once the foundation is working:
1. ✅ Test database connection
2. 🔐 Add authentication
3. ✅ Build the To-Do List feature
4. 🌤️ Add Weather widget
5. 📅 Add Calendar feature
6. 📱 Enable PWA capabilities

## Understanding the Code Structure

- **`app/`**: Next.js pages and routes
- **`components/`**: Reusable UI components
- **`lib/`**: Utility functions (like database connection)
- **`supabase/migrations/`**: Database schema changes
- **`Dockerfile`**: Instructions for building the Docker image
- **`docker-compose.yml`**: Configuration for running multiple containers (includes Supabase services)
- **`supabase/config.toml`**: Supabase service configuration
- **`supabase/kong.yml`**: Kong API Gateway configuration
- **`supabase/migrations/`**: Database schema changes

## Supabase Services Overview

Your self-hosted Supabase instance includes:

- **Postgres** (port 54322): The main database
- **Studio** (port 8002): Web UI for database management
- **Kong** (port 8010): API Gateway that routes requests to services
- **Kong Admin** (port 8011): Admin API for Kong
- **GoTrue**: Authentication service (handles user signup/login)
- **PostgREST**: Automatically generates REST API from your database schema
- **Realtime**: WebSocket server for real-time features
- **Storage**: File storage service with image transformation
- **Image Proxy**: Handles image resizing and optimization

All services communicate via the internal Docker network, so your Next.js app connects to Supabase using the service names (e.g., `http://kong:8000`).

Each feature will be added step-by-step so you can understand how everything works!

