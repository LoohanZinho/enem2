@echo off
echo ========================================
echo    ENEM Pro - Inicializacao Completa
echo ========================================
echo.

echo [1/5] Verificando estrutura do projeto...
if not exist "backend" (
    echo ERRO: Pasta backend nao encontrada
    pause
    exit /b 1
)

if not exist "src" (
    echo ERRO: Pasta src nao encontrada
    pause
    exit /b 1
)

echo [2/5] Configurando Backend...
cd backend

if not exist ".env" (
    echo Copiando env.example para .env...
    copy env.example .env
    echo.
    echo IMPORTANTE: Configure as variaveis no arquivo backend\.env
    echo Especialmente DATABASE_URL, CAKTO_API_KEY e CAKTO_WEBHOOK_SECRET
    echo.
    pause
)

echo Instalando dependencias do backend...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do backend
    pause
    exit /b 1
)

echo.
echo [3/5] Configurando Frontend...
cd ..

if not exist ".env" (
    echo Copiando env.example para .env...
    copy env.example .env
)

echo Instalando dependencias do frontend...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)

echo.
echo [4/5] Verificando PostgreSQL...
echo Testando conexao com banco de dados...
cd backend
call npm run migrate
if %errorlevel% neq 0 (
    echo AVISO: Falha na migracao do banco
    echo Verifique se o PostgreSQL esta rodando e a DATABASE_URL esta correta
    echo.
    echo Continuando sem migracao...
) else (
    echo Banco de dados configurado com sucesso!
)

echo.
echo [5/5] Iniciando servidores...
echo.
echo Backend sera iniciado em: http://localhost:3001
echo Frontend sera iniciado em: http://localhost:5173
echo.
echo Para parar os servidores, pressione Ctrl+C em cada terminal
echo.

echo Iniciando Backend...
start "ENEM Pro Backend" cmd /k "cd backend && npm start"

echo Aguardando 3 segundos...
timeout /t 3 /nobreak > nul

echo Iniciando Frontend...
start "ENEM Pro Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    Sistema iniciado com sucesso!
echo ========================================
echo.
echo Acesse: http://localhost:5173
echo API: http://localhost:3001
echo.
echo Para testar a integracao:
echo 1. Acesse http://localhost:5173
echo 2. Clique em "Comecar Agora"
echo 3. Preencha o cadastro
echo 4. Sera redirecionado para pagamento na Cakto
echo 5. Apos pagamento, faca login
echo.
echo Para parar tudo, feche as janelas do terminal
echo.
pause
