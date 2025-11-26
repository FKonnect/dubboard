# Git Setup and Push Guide

This guide will help you set up Git and push your changes to a repository.

## Step 1: Install Git (if not already installed)

### Option A: Download Git for Windows
1. Visit: https://git-scm.com/download/win
2. Download the installer
3. Run the installer and follow the setup wizard
4. **Important**: Make sure to select "Add Git to PATH" during installation
5. Restart your terminal/PowerShell after installation

### Option B: Using Winget (Windows 10/11)
```powershell
winget install Git.Git
```

### Option C: Using Chocolatey (if installed)
```powershell
choco install git
```

## Step 2: Verify Git Installation

After installing, close and reopen PowerShell, then run:
```powershell
git --version
```

You should see something like: `git version 2.x.x`

## Step 3: Configure Git (First Time Only)

Set your name and email (required for commits):
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 4: Initialize Git Repository

Navigate to your project directory:
```powershell
cd C:\Users\franc\Desktop\dubboard
```

Initialize Git:
```powershell
git init
```

## Step 5: Create .gitignore (if not exists)

Make sure you have a `.gitignore` file to exclude sensitive files:
```powershell
# Check if .gitignore exists
cat .gitignore
```

If it doesn't exist or is incomplete, create/update it with:
```
# Dependencies
node_modules/
package-lock.json

# Environment variables (IMPORTANT - never commit these!)
.env
.env.local
.env*.local

# Next.js
.next/
out/

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Docker
.dockerignore
```

**⚠️ IMPORTANT**: Make sure `.env` is in `.gitignore` before committing!

## Step 6: Stage Your Changes

Add all files (except those in .gitignore):
```powershell
git add .
```

Or add specific files:
```powershell
git add Dockerfile docker-compose.yml package-lock.json DOCKER_TROUBLESHOOTING.md
git add app/ components/ hooks/ lib/ middleware.ts next.config.js
```

## Step 7: Commit Your Changes

Create a commit with a descriptive message:
```powershell
git commit -m "Fix Docker build issues and TypeScript errors

- Update Dockerfile: Node.js 20, npm ci fallback
- Fix toast imports: use useToast hook in all components
- Fix Edge Runtime compatibility in next.config.js
- Add comprehensive Docker troubleshooting guide
- Update docker-compose.yml with build args"
```

## Step 8: Set Up Remote Repository

### Option A: Create New Repository on GitHub

1. Go to https://github.com/new
2. Create a new repository (don't initialize with README)
3. Copy the repository URL (e.g., `https://github.com/yourusername/dubboard.git`)

### Option B: Use Existing Repository

If you already have a remote repository, use its URL.

### Add Remote

```powershell
git remote add origin https://github.com/yourusername/dubboard.git
```

Replace `yourusername/dubboard` with your actual repository.

## Step 9: Push to GitHub

Push your changes:
```powershell
git branch -M main
git push -u origin main
```

If you're using `master` instead of `main`:
```powershell
git branch -M master
git push -u origin master
```

## Step 10: Enter Credentials

When prompted:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your GitHub password)

### Create Personal Access Token (if needed):

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "dubboard-push")
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token and use it as your password when pushing

## Quick Reference Commands

```powershell
# Check status
git status

# See what files changed
git diff

# Add all changes
git add .

# Commit
git commit -m "Your commit message"

# Push
git push

# Pull latest changes
git pull

# View commit history
git log --oneline
```

## Troubleshooting

### "Git is not recognized"
- Make sure Git is installed
- Restart PowerShell after installation
- Check if Git is in PATH: `$env:PATH -split ';' | Select-String git`

### "Permission denied" or "Authentication failed"
- Use Personal Access Token instead of password
- Make sure you have write access to the repository

### "Remote origin already exists"
```powershell
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/yourusername/dubboard.git
```

### "Failed to push some refs"
```powershell
# Pull first, then push
git pull origin main --rebase
git push origin main
```

## What Files Should NOT Be Committed

❌ **Never commit these:**
- `.env` files (contains secrets!)
- `node_modules/` (too large, regenerated from package.json)
- `.next/` (build output)
- Personal access tokens or API keys

✅ **Always commit these:**
- Source code (`.tsx`, `.ts`, `.js` files)
- Configuration files (`package.json`, `next.config.js`, `Dockerfile`)
- Documentation (`.md` files)
- `.gitignore`

## Next Steps After Pushing

1. ✅ Your code is now backed up on GitHub
2. ✅ You can clone it on your NAS or other machines
3. ✅ Others can contribute (if repository is public or you add collaborators)
4. ✅ You can track changes and revert if needed

---

**Need help?** Check the Git documentation: https://git-scm.com/doc



