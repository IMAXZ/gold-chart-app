param(
    [string]$apiUrl = "http://localhost:41736"
)

Write-Host "Setting backend API URL: $apiUrl" -ForegroundColor Green

$env:VUE_APP_API_BASE_URL = $apiUrl

Write-Host "Starting build..." -ForegroundColor Yellow
npm run build

Write-Host "Build completed!" -ForegroundColor Green
Write-Host "Backend URL: $apiUrl" -ForegroundColor Cyan
