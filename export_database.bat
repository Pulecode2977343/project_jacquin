@echo off
echo ====================================
echo  EXPORTADOR DE BASE DE DATOS
echo  Jacquin Academia Musical
echo ====================================
echo.

REM Configuración
set DB_NAME=jacquin_db
set DB_USER=root
set DB_PASS=
set OUTPUT_FILE=jacquin_db_export_%date:~-4,4%%date:~-7,2%%date:~-10,2%.sql
set MYSQL_PATH=C:\xampp\mysql\bin

echo [1/3] Verificando MySQL...
if not exist "%MYSQL_PATH%\mysqldump.exe" (
    echo ERROR: No se encontro mysqldump.exe en %MYSQL_PATH%
    echo Verifica que XAMPP este instalado correctamente.
    pause
    exit /b 1
)

echo [2/3] Exportando base de datos...
echo Database: %DB_NAME%
echo Output: %OUTPUT_FILE%
echo.

"%MYSQL_PATH%\mysqldump.exe" -u %DB_USER% --password=%DB_PASS% --no-tablespaces --skip-add-drop-table %DB_NAME% > "%OUTPUT_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [3/3] EXITO! Base de datos exportada correctamente.
    echo.
    echo Archivo creado: %OUTPUT_FILE%
    echo Tamano: 
    dir "%OUTPUT_FILE%" | find "%OUTPUT_FILE%"
    echo.
    echo IMPORTANTE:
    echo - Usa este archivo para importar en InfinityFree
    echo - Abrelo en un editor de texto antes de importar
    echo - Verifica que NO contenga DROP TABLE statements
    echo.
) else (
    echo.
    echo ERROR: Fallo la exportacion.
    echo Verifica que:
    echo - MySQL este corriendo en XAMPP
    echo - El nombre de la base de datos sea correcto: %DB_NAME%
    echo - Las credenciales sean correctas
    echo.
)

echo Presiona cualquier tecla para salir...
pause > nul
