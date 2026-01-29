# 🌐 REINICIAR ZROK - GUÍA RÁPIDA

## Problema: El enlace de zrok no funciona

Esto sucede porque los shares de zrok tienen una duración limitada o el proceso se detuvo.

## ✅ Solución:

### Paso 1: Detener zrok actual

1. Presiona `Ctrl + C` en la terminal donde esté corriendo zrok
2. O cierra esa terminal

### Paso 2: Reiniciar XAMPP

1. Abre el panel de control de XAMPP
2. **Detén** Apache y MySQL
3. **Inicia** Apache y MySQL nuevamente
4. Verifica que estén en verde (running)

### Paso 3: Reiniciar zrok share

Abre una nueva terminal (PowerShell o CMD) y ejecuta:

```powershell
cd D:\Documentos\GitHub\project_jacquin\web_page\pages
zrok share public http://localhost --headless
```

### Paso 4: Copiar la nueva URL

Verás algo como:
```
https://xxxxxxxx.share.zrok.io
```

Copia esa URL y úsala para acceder a tu sitio.

---

## 🔧 Alternativa: Usar el archivo bat

Si creaste un archivo `.bat` para zrok, simplemente:

1. Haz doble clic en el archivo `.bat`
2. Espera a que aparezca la URL
3. Copia la nueva URL

---

## 📱 Para acceder desde tu móvil:

Una vez que tengas la nueva URL de zrok:

1. Escanea el código QR que aparece en la terminal de zrok
2. O copia manualmente la URL en el navegador del móvil

---

## ⚠️ Importante:

- Cada vez que reinicies zrok, obtendrás una **URL diferente**
- Guarda la URL actual si la necesitas compartir
- Zrok debe estar ejecutándose todo el tiempo que necesites acceso remoto

---

## 🆘 Si sigue sin funcionar:

1. Verifica que Apache esté ejecutándose en XAMPP
2. Prueba acceder primero a `http://localhost` en tu navegador
3. Si localhost funciona, el problema es solo con zrok
4. Reinicia zrok como se indicó arriba

---

**Última actualización:** Enero 2026
