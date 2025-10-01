# 🚀 Script de Deploy Automático - EnemPro (PowerShell)
# Execute: .\deploy.ps1

Write-Host "🚀 Iniciando deploy do EnemPro..." -ForegroundColor Blue

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não está instalado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não está instalado. Instale o npm primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green

Write-Host "🔨 Fazendo build do projeto..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer build do projeto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build realizado com sucesso!" -ForegroundColor Green

# Verificar se a pasta dist foi criada
if (Test-Path "dist") {
    Write-Host "✅ Pasta 'dist' criada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Pasta 'dist' não foi criada. Verifique o build." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deploy preparado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://vercel.com" -ForegroundColor White
Write-Host "2. Faça login com sua conta GitHub" -ForegroundColor White
Write-Host "3. Clique em 'New Project'" -ForegroundColor White
Write-Host "4. Selecione seu repositório" -ForegroundColor White
Write-Host "5. Clique em 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "📱 Ou use o Vercel CLI:" -ForegroundColor Yellow
Write-Host "npm i -g vercel" -ForegroundColor White
Write-Host "vercel login" -ForegroundColor White
Write-Host "vercel" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Seu site estará no ar em poucos minutos!" -ForegroundColor Green
Write-Host "URL: https://enempro.vercel.app" -ForegroundColor Cyan