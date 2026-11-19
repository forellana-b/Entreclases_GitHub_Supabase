# Entreclases · Campus San Joaquín

## Preparar el proyecto

Abre esta carpeta en VS Code. Si ya editaste los lugares, copia tu versión de catalogo.js y tus imágenes a fotos/. Conserva tus cambios de interfaz mediante una comparación en VS Code antes de fusionar dos versiones de app.js o index.html.

## Configurar Supabase

1. Crea un proyecto en tu cuenta de Supabase y guarda en privado la contraseña de base de datos.
2. En SQL Editor, pega el contenido de supabase/01_resenas.sql y pulsa Run. En Table Editor aparecerá public.resenas.
3. En Authentication activa Allow anonymous sign-ins. En Data API comprueba que la API esté activa y public esté entre los esquemas expuestos. El SQL ya concede permisos de lectura de los campos públicos e inserción con sesión.
4. Copia la Project URL y la Publishable key desde Connect o API Keys del proyecto y pégalas entre comillas en config.js. Usa exclusivamente la clave publicable del cliente.
5. Si tienes Python en Windows, abre Terminal → New Terminal en VS Code y ejecuta py -m http.server 8000 --bind 127.0.0.1. Visita http://localhost:8000. El atajo Ctrl+C detiene el servidor. También puedes usar una vista previa HTTP de VS Code.

## Publicar en GitHub Pages

1. Instala Git, abre la carpeta en VS Code y comprueba git --version en la terminal.
2. En Control de código fuente, inicializa el repositorio. Selecciona los archivos, añade un mensaje y haz el primer commit.
3. Con Ctrl+Shift+P ejecuta Publish to GitHub, inicia sesión y elige repositorio público. Comprueba que index.html está en la raíz en GitHub.
4. En el repositorio entra a Settings → Pages → Deploy from a branch. Elige la rama que acabas de publicar y /(root). Guarda y espera al despliegue de Pages en Actions. Usa el enlace Visit site.
5. Escribe una reseña de prueba y abre el mismo lugar desde el celular. Al cargar de nuevo la página debe verse la reseña. Abre Table Editor → resenas para comprobar que la fila quedó guardada.

## Mantenimiento

Edita, prueba en localhost, crea un commit y usa Push o Sync Changes. Los cambios de catálogo o interfaz se publican en el mismo enlace. Las reseñas están en Supabase. Para moderar un comentario, localiza su fila en Table Editor. El prototipo descarga las reseñas al abrir la web o regresar a la pestaña; también puedes recargarla.

Cada identidad anónima puede publicar una reseña por lugar. Las reseñas anteriores guardadas en otros navegadores no se importan. Los reportes de ocupación y los controles de simulación siguen siendo locales. Esta versión usa el cliente de Supabase desde una CDN y requiere internet.

Documentación:
- https://code.visualstudio.com/docs/sourcecontrol/quickstart
- https://docs.github.com/es/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://supabase.com/docs/guides/auth/auth-anonymous
- https://supabase.com/docs/guides/getting-started/api-keys
