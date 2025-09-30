# 🔧 Solución: Problemas de Content Security Policy (CSP)

## 📋 Problema Identificado

Estás viendo errores de CSP como:
```
Refused to connect to '<URL>' because it violates the following Content Security Policy directive: "connect-src 'self' <URL> <URL> <URL> <URL>".
```

## 🔍 Análisis del Problema

Los errores que estás viendo **NO** vienen de tu aplicación, sino de:
- GitHub Pages o servicios externos
- Otros sitios web que tienes abiertos
- Extensiones del navegador

Tu aplicación de Spotify **SÍ** puede funcionar correctamente a pesar de estos errores.

## ✅ Soluciones Implementadas

### 1. Página de Diagnóstico
Se ha creado `debug_auth.html` que te permite:
- ✅ Verificar el estado de autenticación
- ✅ Probar la conectividad con Spotify
- ✅ Diagnosticar problemas de configuración
- ✅ Limpiar datos de autenticación

### 2. Verificación de Configuración
- ✅ URLs de redirección correctas
- ✅ Scopes actualizados
- ✅ Manejo de errores mejorado

## 🚀 Pasos para Solucionar

### Paso 1: Usar la Herramienta de Diagnóstico

1. Abre `debug_auth.html` en tu navegador
2. Ejecuta el "Diagnóstico Completo"
3. Verifica el estado de autenticación
4. Prueba la conectividad con Spotify

### Paso 2: Limpiar Datos del Navegador

Si hay problemas de autenticación:

1. **En debug_auth.html**:
   - Haz clic en "Limpiar Datos de Auth"
   - Luego haz clic en "Re-autenticar"

2. **En el navegador**:
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Application" o "Storage"
   - Limpia localStorage y sessionStorage
   - Recarga la página

### Paso 3: Verificar Configuración

1. **Asegúrate de que estés usando la URL correcta**:
   - Local: `http://127.0.0.1/spotify-playlist-desktop/`
   - GitHub Pages: `https://cedenofofo.github.io/spotify-playlist/`

2. **Verifica que las URLs de redirección estén configuradas correctamente en Spotify Developer Dashboard**

## 🔧 Soluciones Específicas

### Para Errores de CSP:

1. **Ignorar errores externos**: Los errores de CSP que ves vienen de otros sitios, no de tu aplicación
2. **Usar modo incógnito**: Prueba tu aplicación en una ventana incógnita
3. **Deshabilitar extensiones**: Algunas extensiones pueden causar conflictos
4. **Limpiar cache**: Limpia completamente el cache del navegador

### Para Problemas de Autenticación:

1. **Re-autenticación completa**:
   ```javascript
   // Limpiar todos los datos
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Verificar configuración de Spotify**:
   - Client ID correcto
   - Redirect URI configurado
   - Scopes necesarios habilitados

3. **Usar la herramienta de debug**:
   - Abre `debug_auth.html`
   - Ejecuta todas las pruebas
   - Sigue las recomendaciones

## 📊 Verificación de Funcionamiento

### ✅ Indicadores de que Funciona:

1. **Puedes hacer login con Spotify**
2. **Se cargan tus playlists** (más de 11)
3. **Puedes editar playlists**
4. **Las APIs de Spotify responden correctamente**

### ❌ Indicadores de Problema:

1. **No puedes hacer login**
2. **Solo se cargan 11 playlists**
3. **Errores 401 o 403 en la consola**
4. **No se pueden hacer llamadas a la API**

## 🛠️ Herramientas de Debug

### Archivos de Diagnóstico:

1. **`debug_auth.html`** - Diagnóstico completo de autenticación
2. **`test_scopes.html`** - Verificación de scopes y permisos
3. **`SOLUCION_PLAYLISTS.md`** - Solución para playlists faltantes

### Cómo Usar:

```bash
# 1. Abrir herramienta de debug
debug_auth.html

# 2. Ejecutar diagnóstico completo
# 3. Verificar estado de autenticación
# 4. Probar API de Spotify
# 5. Seguir recomendaciones
```

## 🐛 Troubleshooting Avanzado

### Si los errores persisten:

1. **Verificar configuración de Spotify**:
   - Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Verifica que las URLs de redirección estén correctas
   - Asegúrate de que el Client ID sea el correcto

2. **Probar en diferentes navegadores**:
   - Chrome
   - Firefox
   - Edge
   - Safari

3. **Verificar configuración de red**:
   - Firewall
   - Proxy
   - VPN

4. **Usar herramientas de desarrollo**:
   - Network tab en DevTools
   - Console para ver errores específicos
   - Application tab para verificar tokens

## 📞 Soporte

### Si el problema persiste:

1. **Ejecuta el diagnóstico completo** en `debug_auth.html`
2. **Toma capturas de pantalla** de los errores
3. **Verifica la configuración** en Spotify Developer Dashboard
4. **Prueba en modo incógnito** para descartar extensiones

### Información útil para debugging:

- URL actual
- Estado de autenticación
- Errores específicos en la consola
- Configuración de Spotify
- Resultados de las pruebas de API

---

**Nota**: Los errores de CSP que mencionas probablemente vienen de otros sitios web o servicios externos, no de tu aplicación de Spotify. Tu aplicación puede funcionar correctamente a pesar de estos errores. 