@echo off
TITLE Iniciar Tunel Zrok - Project Jacquin
ECHO Iniciando tunel para project_jacquin...
ECHO ----------------------------------------
ECHO NOTA: Si ves un error de "no such host", verifica tu conexion a internet.
ECHO.

:: Configuracion del Token
SET TOKEN=lsw34loontpx

:: Iniciar el tunel apuntando al puerto 3000 (React/Vite)
"C:\zrok_1.1.10\zrok.exe" share reserved %TOKEN% --override-endpoint http://localhost:3000

PAUSE
