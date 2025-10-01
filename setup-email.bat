@echo off
echo ========================================
echo    CONFIGURACAO DO SERVICO DE EMAIL
echo           ENEM PRO - CAKTO
echo ========================================
echo.

echo [1/5] Instalando dependencias...
call npm install express nodemailer cors
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo [2/5] Criando arquivo de configuracao...
if not exist .env (
    copy email.env.example .env
    echo Arquivo .env criado! Configure suas credenciais SMTP.
) else (
    echo Arquivo .env ja existe.
)

echo.
echo [3/5] Criando diretorio de logs...
if not exist logs mkdir logs

echo.
echo [4/5] Testando configuracao...
echo Verifique se o arquivo .env esta configurado corretamente.
echo.

echo [5/5] Iniciando servidor de email...
echo.
echo ========================================
echo   SERVIDOR DE EMAIL INICIADO!
echo ========================================
echo.
echo Interface de Teste: http://localhost:3002
echo Configuracao: http://localhost:3002/config
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

node email-server.js
