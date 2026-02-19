@echo off
TITLE Iniciar Proyecto Jacquin (React APP)
ECHO Iniciando aplicacion web...
ECHO ----------------------------------------

:: Navegar a la carpeta donde esta el package.json
cd /d "%~dp0\web_page\pages"

:: Verificar si existe node_modules, si no, instalar
IF NOT EXIST "node_modules" (
    ECHO [INFO] Primera vez ejecutando? Instalando dependencias...
    call npm install
)

:: Iniciar el servidor de desarrollo (CRA usa 'start')
call npm start

PAUSE
