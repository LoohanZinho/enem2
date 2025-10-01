@echo off
echo ========================================
echo    ENEM PRO API - Sistema de Chaves
echo ========================================
echo.

echo [1/4] Navegando para o diretorio backend...
cd backend

echo [2/4] Instalando dependencias...
call npm install

echo [3/4] Executando migracoes do banco...
call npm run migrate

echo [4/4] Iniciando servidor...
echo.
echo ✅ Servidor iniciado em http://localhost:3001
echo 📊 Health: http://localhost:3001/health
echo 📈 Status: http://localhost:3001/status
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm run dev

pause
