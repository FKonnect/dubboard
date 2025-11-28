# PowerShell script to confirm all unconfirmed users in Supabase auth
# This allows users to sign in without email confirmation

param(
    [string]$ContainerName = "supabase_db_dubboard",
    [string]$DbUser = "supabase_admin",
    [string]$DbName = "postgres",
    [string]$Email = ""  # Optional: confirm only a specific email
)

Write-Host "Confirming unconfirmed users..." -ForegroundColor Yellow

if ($Email) {
    Write-Host "Confirming user: $Email" -ForegroundColor Cyan
    $sql = "UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '$Email' AND email_confirmed_at IS NULL;"
} else {
    Write-Host "Confirming ALL unconfirmed users..." -ForegroundColor Cyan
    $sql = "UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;"
}

# Execute the SQL command
docker exec -i $ContainerName psql -U $DbUser -d $DbName -c $sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nUsers confirmed successfully!" -ForegroundColor Green
    Write-Host "Users can now sign in without email confirmation." -ForegroundColor Green
} else {
    Write-Host "`nError confirming users. Please check:" -ForegroundColor Red
    Write-Host "1. Docker container '$ContainerName' is running" -ForegroundColor Red
    Write-Host "2. Database credentials are correct" -ForegroundColor Red
    exit 1
}

