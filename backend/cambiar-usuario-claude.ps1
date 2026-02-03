param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("estudiante", "capitan", "admin")]
    [string]$usuario
)

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$backendPath = "C:\Users\Usuario\Desktop\UIDEportes-backend\backend"

Write-Host ""
Write-Host "🔄 Cambiando configuración de Claude Desktop a: $usuario" -ForegroundColor Cyan
Write-Host ""

# Copiar configuración según el usuario
switch ($usuario) {
    "estudiante" { 
        Copy-Item "$backendPath\claude_config_estudiante.json" $configPath 
        Write-Host "✅ Configurado como ESTUDIANTE (Juan, ID: 4)" -ForegroundColor Green
        Write-Host "   Verá: Tigres FC" -ForegroundColor Gray
    }
    "capitan" { 
        Copy-Item "$backendPath\claude_config_capitan.json" $configPath 
        Write-Host "✅ Configurado como CAPITAN (María, ID: 5)" -ForegroundColor Green
        Write-Host "   Verá: Lobos UIDE" -ForegroundColor Gray
    }
    "admin" { 
        Copy-Item "$backendPath\claude_config_admin.json" $configPath 
        Write-Host "✅ Configurado como ADMIN (ID: 6)" -ForegroundColor Green
        Write-Host "   Verá: TODOS los equipos" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🔄 Cerrando Claude Desktop..." -ForegroundColor Yellow

# Intentar cerrar Claude Desktop
Stop-Process -Name "Claude" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "✅ Claude Desktop cerrado" -ForegroundColor Green
Write-Host ""
Write-Host "📝 PRÓXIMO PASO:" -ForegroundColor Cyan
Write-Host "   1. Abre Claude Desktop manualmente" -ForegroundColor White
Write-Host "   2. Espera 5 segundos a que se conecte" -ForegroundColor White
Write-Host "   3. Pregunta: '¿Cuáles son mis equipos?'" -ForegroundColor White
Write-Host ""

# Buscar Claude Desktop en ubicaciones comunes
$claudePaths = @(
    "C:\Users\Usuario\AppData\Local\Programs\Claude\Claude.exe",
    "$env:LOCALAPPDATA\Programs\Claude\Claude.exe",
    "C:\Program Files\Claude\Claude.exe",
    "C:\Program Files (x86)\Claude\Claude.exe"
)

$claudeFound = $false
foreach ($path in $claudePaths) {
    if (Test-Path $path) {
        Write-Host "🚀 Iniciando Claude Desktop automáticamente..." -ForegroundColor Green
        Start-Process $path
        $claudeFound = $true
        Write-Host "✅ Claude Desktop iniciado" -ForegroundColor Green
        break
    }
}

if (-not $claudeFound) {
    Write-Host "⚠️  Abre Claude Desktop manualmente desde el menú de inicio" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⏱️  Espera 5-10 segundos antes de hacer preguntas" -ForegroundColor Cyan
Write-Host ""
