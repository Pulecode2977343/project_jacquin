@echo off
echo ================================================
echo       ZROK - JACQUIN ACADEMIA MUSICAL
echo       Enlace Permanente: lsw34loontpx
echo       Puerto XAMPP: 8080
echo ================================================
echo.

REM Verificar XAMPP
echo [1/2] Verificando XAMPP...
echo.
echo IMPORTANTE: Verifica que XAMPP este ejecutandose:
echo   - Apache debe estar en "Running" (verde)
echo   - MySQL debe estar en "Running" (verde)
echo.
echo Apache esta configurado en puerto: 8080
echo.
echo Presiona cualquier tecla cuando XAMPP este listo...
pause

echo.
echo [2/2] Iniciando zrok con enlace permanente...
echo.
echo Compartiendo: http://localhost:8080 (XAMPP)
echo Enlace: lsw34loontpx
echo.
echo URLs de acceso:
echo   - Frontend: https://lsw34loontpx.share.zrok.io/jacquin_web/pages/index.html
echo   - API:      https://lsw34loontpx.share.zrok.io/jacquin_api/login.php
echo.
echo MANTÉN ESTA VENTANA ABIERTA mientras uses zrok
echo Para detener: Presiona Ctrl + C
echo.
echo ================================================
echo.

REM Iniciar zrok compartiendo localhost:8080 (XAMPP)
"D:\Diseno WEB\Tools\zrok_1.1.10\zrok.exe" share reserved lsw34loontpx --backend-mode web http://localhost:8080

echo.
echo ================================================
echo zrok se ha detenido
echo ================================================
pause
