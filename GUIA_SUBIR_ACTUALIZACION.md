# 🚀 GUÍA RÁPIDA - SUBIR ACTUALIZACIÓN A INFINITYFREE

## 📤 Archivos a subir (4 archivos + 1 opcional)

### 1️⃣ JavaScript - Documento de Funciones
**Archivo local:**
```
D:\Documentos\GitHub\project_jacquin\web_page\pages\js\user_profile_modal.js
```

**Destino en servidor:**
```
htdocs/pages/js/user_profile_modal.js
```

**Acción:** Reemplazar archivo existente

---

### 2️⃣ CSS - Términos y Política de Datos
**Archivo local:**
```
D:\Documentos\GitHub\project_jacquin\web_page\pages\css\terms.css
```

**Destino en servidor:**
```
htdocs/pages/css/terms.css
```

**Acción:** Reemplazar archivo existente

---

### 3️⃣ CSS - Política de Cookies
**Archivo local:**
```
D:\Documentos\GitHub\project_jacquin\web_page\pages\css\doc-Cookie.css
```

**Destino en servidor:**
```
htdocs/pages/css/doc-Cookie.css
```

**Acción:** Reemplazar archivo existente

---

### 4️⃣ HTML - Página Principal (título actualizado)
**Archivo local:**
```
D:\Documentos\GitHub\project_jacquin\web_page\pages\index.html
```

**Destino en servidor:**
```
htdocs/pages/index.html
```

**Acción:** Reemplazar archivo existente

---

### 5️⃣ (OPCIONAL) Archivo de redirección raíz
**Archivo local:**
```
D:\Documentos\GitHub\project_jacquin\ROOT_INDEX.html
```

**Destino en servidor:**
```
htdocs/index.html
```

**Acción:** Solo si aún no lo has creado

---

## 📋 Pasos en File Manager de InfinityFree:

1. **Login a InfinityFree**
   - Ve a https://infinityfree.net
   - Inicia sesión con tu cuenta

2. **Abrir File Manager**
   - Panel de Control → File Manager
   - Navega a `htdocs`

3. **Subir archivos JavaScript:**
   - Ve a `htdocs/pages/js/`
   - Busca `user_profile_modal.js`
   - Click derecho → Delete (borra el viejo)
   - Click en Upload
   - Selecciona el archivo de tu PC
   - Espera a que termine

4. **Subir archivos CSS:**
   - Ve a `htdocs/pages/css/`
   - Busca `terms.css`
   - Click derecho → Delete
   - Upload el nuevo
   - Repite para `doc-Cookie.css`

5. **Subir index.html:**
   - Ve a `htdocs/pages/`
   - Busca `index.html`
   - Delete y Upload el nuevo

6. **(Si es necesario) Crear redirección raíz:**
   - Ve a `htdocs/` (raíz)
   - Si NO existe `index.html`, súbelo
   - Renombra `ROOT_INDEX.html` a `index.html`

---

## ✅ Verificación después de subir:

### Probar URLs:
1. **Página principal:**
   ```
   http://academiajacquin.infinityfreeapp.com/pages/index.html
   ```

2. **Términos:**
   ```
   http://academiajacquin.infinityfreeapp.com/pages/terms.html
   ```

3. **Política de Datos:**
   ```
   http://academiajacquin.infinityfreeapp.com/pages/dataPolicy.html
   ```

4. **Política de Cookies:**
   ```
   http://academiajacquin.infinityfreeapp.com/pages/coockie.html
   ```

### Verificar en cada página:
- ✅ El fondo de los documentos es beige (papel reciclado)
- ✅ Se ve la textura sutil
- ✅ El logo en documentos de funciones es naranja
- ✅ Los PDFs se descargan correctamente

---

## 🔧 Si algo no funciona:

### Cache del navegador:
1. Presiona `Ctrl + Shift + R` (forzar recarga)
2. O borra el caché del navegador

### Verificar archivos:
1. En File Manager, click derecho → View
2. Confirma que el contenido sea el nuevo

### Error 500:
1. Revisa que los archivos tengan permisos 644
2. Click derecho → Permissions → 644

---

## 📞 Soporte:

Si encuentras problemas, revisa:
- Que los archivos estén en las rutas correctas
- Que no haya errores de JavaScript en la consola del navegador (F12)
- Que los archivos CSS se carguen (Network tab en F12)

---

**¡Listo para actualizar!** 🚀

Solo sube estos 4-5 archivos y ya tendrás el nuevo estilo aplicado.
