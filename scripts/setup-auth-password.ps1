# PowerShell script to set the password for supabase_auth_admin role
# This password must match your POSTGRES_PASSWORD environment variable

$ErrorActionPreference = "Stop"

Write-Host "Setting password for supabase_auth_admin role..." -ForegroundColor Yellow

# Check if POSTGRES_PASSWORD is set
if (-not $env:POSTGRES_PASSWORD) {
    Write-Host "Error: POSTGRES_PASSWORD environment variable is not set" -ForegroundColor Red
    Write-Host "Please set it in your .env file or set it:"
    Write-Host "  `$env:POSTGRES_PASSWORD = 'your-password'"
    exit 1
}

# Check if docker is available
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Docker is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if the database container is running
$containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "supabase_db_dubboard"
if (-not $containerRunning) {
    Write-Host "Error: Database container (supabase_db_dubboard) is not running" -ForegroundColor Red
    Write-Host "Please start your Docker containers first:"
    Write-Host "  docker-compose up -d"
    exit 1
}

# Set the password
Write-Host "Setting password for supabase_auth_admin..." -ForegroundColor Yellow
$password = $env:POSTGRES_PASSWORD
$sqlCommand = "ALTER ROLE supabase_auth_admin WITH PASSWORD '$password';"

docker exec -i supabase_db_dubboard psql -U supabase_admin -d postgres -c $sqlCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Password set successfully for supabase_auth_admin" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart the auth service: docker-compose restart auth"
    Write-Host "  2. Check auth logs: docker-compose logs auth"
    Write-Host "  3. Verify auth.users exists: docker exec -it supabase_db_dubboard psql -U supabase_admin -d postgres -c `"SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth';`""
} else {
    Write-Host "✗ Failed to set password" -ForegroundColor Red
    exit 1
}

