# 🎨 COMPONENTE LOGO MEMBRETE - DOCUMENTACIÓN

## 📦 ¿Qué es?

`logo-membrete` es un componente web reutilizable que contiene el logo institucional completo de Jacquin Academia Musical, incluyendo:
- Letras "JACQUIN" en tipografía institucional
- Teclas del piano (diseño completo)
- Leyenda "ACADEMIA MUSICAL"

## 🎯 Ventajas

✅ **Un solo lugar de control**: Cambia el logo una vez y se actualiza en todos los documentos
✅ **Consistencia de marca**: El mismo logo en todo el proyecto
✅ **Fácil de usar**: Solo una línea de código HTML
✅ **Personalizable**: Color, tamaño y opciones configurables

---

## 🚀 Uso básico

### 1. Incluir el script (solo una vez por página)

```html
<script src="js/components/logo_membrete.js"></script>
```

### 2. Usar el componente

```html
<logo-membrete></logo-membrete>
```

Eso es todo! El logo aparecerá en naranja (#ff6b35) con el subtítulo "ACADEMIA MUSICAL".

---

## ⚙️ Personalización

### Atributos disponibles:

| Atributo | Descripción | Valor por defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `color` | Color del logo | `#ff6b35` (naranja) | `color="#1a2a3a"` |
| `width` | Ancho del SVG | `239` | `width="180"` |
| `height` | Alto del SVG | `58` | `height="40"` |
| `show-subtitle` | Mostrar "ACADEMIA MUSICAL" | `true` | `show-subtitle="false"` |

### Ejemplos de uso:

#### Logo naranja con subtítulo (por defecto):
```html
<logo-membrete></logo-membrete>
```

#### Logo naranja SIN subtítulo:
```html
<logo-membrete show-subtitle="false"></logo-membrete>
```

#### Logo más pequeño (para encabezados compactos):
```html
<logo-membrete width="180" height="40"></logo-membrete>
```

#### Logo en color oscuro (para fondos claros):
```html
<logo-membrete color="#1a2a3a"></logo-membrete>
```

#### Logo blanco (para fondos oscuros):
```html
<logo-membrete color="white" show-subtitle="false"></logo-membrete>
```

#### Logo completo personalizado:
```html
<logo-membrete 
    color="#ff6b35" 
    width="239" 
    height="58" 
    show-subtitle="true">
</logo-membrete>
```

---

## 📍 Dónde se usa actualmente

### ✅ Ya implementado:
1. **Documentos de funciones del cargo** (`user_profile_modal.js`)
   - Ubicación: Modal de perfil de usuario
   - Configuración: Color naranja, tamaño completo, con subtítulo

### 🔜 Próximas implementaciones sugeridas:
2. **Certificados**
3. **Constancias**
4. **Reportes administrativos**
5. **Documentación legal** (términos, políticas)
6. **Facturas y recibos**

---

## 🛠️ Mantenimiento

### Para cambiar el logo globalmente:

1. Abre el archivo: `web_page/pages/js/components/logo_membrete.js`
2. Modifica el SVG dentro del método `render()`
3. Guarda el archivo
4. **Ya está!** El cambio se reflejará en todos los documentos que usen el componente

### Para agregar el componente a un nuevo documento:

1. Incluye el script:
   ```javascript
   const logoScript = document.createElement('script');
   logoScript.src = 'js/components/logo_membrete.js';
   document.head.appendChild(logoScript);
   ```

2. Usa el componente en tu HTML:
   ```html
   <logo-membrete color="#ff6b35"></logo-membrete>
   ```

---

## 💡 Mejores prácticas

### Para membretes de documentos oficiales:
```html
<logo-membrete color="#ff6b35" width="239" height="58" show-subtitle="true"></logo-membrete>
```

### Para encabezados compactos:
```html
<logo-membrete color="#ff6b35" width="180" height="40" show-subtitle="false"></logo-membrete>
```

### Para firmas o pie de página:
```html
<logo-membrete color="#1a2a3a" width="150" height="35" show-subtitle="false"></logo-membrete>
```

---

## 🎨 Colores institucionales

| Uso | Color | Código |
|-----|-------|--------|
| Primary (naranja) | 🟠 | `#ff6b35` |
| Secundario (oscuro) | ⬛ | `#1a2a3a` |
| Acento (dorado) | 🟡 | `#ac8421` |
| Blanco | ⬜ | `white` o `#FFFFFF` |

---

## 📝 Notas técnicas

- El componente es un **Custom Element** (Web Component)
- Compatible con todos los navegadores modernos
- No requiere framework (vanilla JavaScript)
- Tamaño mínimo (< 5KB)
- Se renderiza como SVG (escalable sin pérdida de calidad)
- Incluye gradientes radiales para las sombras de las teclas del piano

---

## 🆘 Solución de problemas

### El logo no aparece:
1. Verifica que el script esté cargado: `<script src="js/components/logo_membrete.js"></script>`
2. Revisa la consola del navegador (F12) por errores
3. Asegúrate de que la ruta del script sea correcta

### El logo aparece sin estilo:
1. Espera a que el componente se registre (puede tardar unos milisegundos)
2. No uses el componente inmediatamente después de cargar el script

### Quiero cambiar el diseño:
1. Edita `logo_membrete.js`
2. Modifica el SVG en el método `render()`
3. Guarda y recarga la página

---

## 📜 Ejemplo completo

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mi Documento</title>
    <script src="js/components/logo_membrete.js"></script>
</head>
<body>
    <header>
        <logo-membrete color="#ff6b35" width="239" height="58"></logo-membrete>
        <h1>MANUAL DE RESPONSABILIDADES</h1>
    </header>
    
    <main>
        <!-- Contenido del documento -->
    </main>
    
    <footer>
        <logo-membrete color="#1a2a3a" width="150" height="35" show-subtitle="false"></logo-membrete>
        <p>JACQUIN ACADEMIA MUSICAL © 2026</p>
    </footer>
</body>
</html>
```

---

**Archivo:** `web_page/pages/js/components/logo_membrete.js`
**Versión:** 1.0
**Fecha:** Enero 2026
**Mantenedor:** Equipo de Desarrollo Jacquin
