# 🚀 Installation Instructions

## Before You Start

This project is **100% complete and ready to use**. Follow these steps to get started.

## Prerequisites

### Install Node.js (Required)

This project requires **Node.js 18+** and **npm** (which comes with Node.js).

**If you see an error like `'npm' is not recognized`:**
- Node.js is not installed or not in your PATH
- You need to install Node.js first

#### Windows Installation:

1. **Download Node.js**
   - Visit: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version
   - Choose the Windows Installer (.msi) for your system (64-bit recommended)

2. **Run the Installer**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - ✅ **Important**: Check "Add to PATH" option (usually checked by default)
   - Complete the installation

3. **Verify Installation**
   - Close and reopen your terminal/PowerShell
   - Run these commands to verify:
   ```powershell
   node --version
   npm --version
   ```
   - You should see version numbers (e.g., `v20.x.x` and `10.x.x`)

4. **If npm is still not recognized:**
   - Restart your computer (sometimes required for PATH changes)
   - Or manually add Node.js to PATH:
     - Find where Node.js was installed (usually `C:\Program Files\nodejs\`)
     - Add it to your system PATH environment variable

#### Alternative: Using a Package Manager

**Using Chocolatey (if installed):**
```powershell
choco install nodejs-lts
```

**Using Winget (Windows 10/11):**
```powershell
winget install OpenJS.NodeJS.LTS
```

### Other Prerequisites

- **Git** (for cloning the repository, if needed)
- **A code editor** (VS Code recommended)
- **Supabase account** (for Method A) or **Docker** (for Method B)

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI components
- Supabase client
- And all other dependencies

## Step 2: Choose Your Setup Method

### Method A: Using Supabase Cloud (Easiest for Testing)

1. **Sign up for Supabase** (free tier available)
   - Visit: https://supabase.com
   - Create an account
   - Create a new project

2. **Get your credentials**
   - Go to Settings → API in your Supabase project
   - Copy the Project URL and anon/public key

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Edit `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run database migration**
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to http://localhost:3000
   - Sign up for an account
   - Start using Dubboard!

### Method B: Self-Hosted with Docker (Production)

1. **Navigate to docker folder**
   ```bash
   cd docker
   ```

2. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

3. **Generate secrets**
   
   **For Linux/Mac (bash):**
   ```bash
   # Generate JWT secret
   openssl rand -base64 32
   
   # Generate PostgreSQL password
   openssl rand -base64 24
   ```
   
   **For Windows (PowerShell):**
   ```powershell
   # Generate JWT secret (requires OpenSSL or use online generator)
   # If you have Git Bash installed, you can use:
   openssl rand -base64 32
   
   # Or generate using PowerShell (less secure but works):
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   
   # Generate PostgreSQL password
   openssl rand -base64 24
   ```

4. **Edit `.env` file**
   - Add your generated secrets
   - Configure your domain or use localhost

5. **Generate JWT tokens**
   
   **For Linux/Mac (bash):**
   ```bash
   cd ..
   JWT_SECRET=your-jwt-secret-here node scripts/generate-jwt-keys.js
   ```
   
   **For Windows (PowerShell):**
   ```powershell
   cd ..
   $env:JWT_SECRET="your-jwt-secret-here"; node scripts/generate-jwt-keys.js
   ```
   
   - Copy the generated ANON_KEY and SERVICE_ROLE_KEY to docker/.env

6. **Start all services**
   ```bash
   cd docker
   docker-compose up -d
   ```

7. **Initialize database**
   ```bash
   docker exec -i dubboard-postgres psql -U postgres -d dubboard < ../supabase/migrations/001_initial_schema.sql
   ```

8. **Access your dashboard**
   - Open http://localhost (or your configured domain)
   - Sign up for an account
   - Start using Dubboard!

## Step 3: Generate PWA Icons (Optional)

For a complete PWA experience, generate icons:

1. Create a 512x512px icon for your app
2. Use https://realfavicongenerator.net/ to generate all sizes
3. Place generated icons in `public/icons/`
4. Required sizes: 72, 96, 128, 144, 152, 192, 384, 512

Or use the placeholder icons for testing.

## Step 4: Test Everything

### Test Checklist:
- [ ] Sign up for a new account
- [ ] Login with your credentials
- [ ] Weather widget loads with your location
- [ ] Create a new task
- [ ] Create a new calendar event
- [ ] Toggle dark/light mode
- [ ] Open in another browser tab (test real-time sync)
- [ ] Install as PWA on your device

## Common Issues

### 'npm' is not recognized (Windows)

**Error:** `The term 'npm' is not recognized as the name of a cmdlet, function, script file, or operable program.`

**Solution:**
1. Install Node.js from https://nodejs.org/ (see Prerequisites above)
2. Close and reopen your terminal/PowerShell after installation
3. Verify with: `node --version` and `npm --version`
4. If still not working, restart your computer to refresh PATH variables

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't Connect to Supabase
- Verify your credentials in .env.local
- Check Supabase project is active
- Ensure you've run the database migration

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Docker Issues
```bash
# Check all containers are running
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

## Next Steps

After installation:

1. **Read the docs**
   - [README.md](README.md) - Complete overview
   - [QUICKSTART.md](QUICKSTART.md) - Quick start guide
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

2. **Customize**
   - Change theme colors in `app/globals.css`
   - Modify weather location in `components/WeatherWidget.tsx`
   - Add your own features!

3. **Deploy**
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
   - See [docker/README.md](docker/README.md) for Synology NAS

## Need Help?

- 📖 Check [README.md](README.md) for full documentation
- 🐛 Issues? Check the troubleshooting section
- 💬 Questions? Open a GitHub issue

## What You Get

✅ Weather widget with auto-refresh  
✅ Full calendar (Month/Week/Day views)  
✅ Task management with real-time sync  
✅ Secure authentication  
✅ Dark/Light mode  
✅ PWA support  
✅ Mobile responsive  
✅ Docker deployment ready  

---

**Enjoy Dubboard! 🎉**

Built with ❤️ for the self-hosting community

