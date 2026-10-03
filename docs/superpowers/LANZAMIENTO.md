# Lanzamiento del rediseño v3

Este documento reúne lo que hay que hacer para publicar `feat/redesign-v3`. Primero va lo que se comprueba antes de fusionar y después lo que hace el dueño con sus cuentas.

## 1. Antes de fusionar (lo hace Claude)

1. Abrir el PR de `feat/redesign-v3` contra `main`.
2. Esperar al CI del PR:
   - tipos, lint y unitarios;
   - fechas desde git;
   - e2e;
   - presupuesto de JS;
   - Lighthouse móvil (simulado, más el LCP con devtools) y de escritorio.
3. Abrir la preview de Vercel del PR y repasar:
   - `/` y `/en`;
   - un caso de estudio;
   - `/contact`;
   - el 404 (`/en/no-existe`);
   - el móvil.
4. Comprobar con curl que la preview responde 200 a los bots de IA y de búsqueda en `/`, `/en`, `/llms.txt` y `/sitemap.xml`. Los user agents son GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot y DuckAssistBot:

   ```bash
   for ua in GPTBot ClaudeBot PerplexityBot Google-Extended bingbot DuckAssistBot; do
     for p in / /en /llms.txt /sitemap.xml; do
       printf "%-16s %-14s %s\n" "$ua" "$p" "$(curl -s -o /dev/null -w '%{http_code}' -A "Mozilla/5.0 (compatible; $ua)" "$PREVIEW$p")"
     done
   done
   ```

   Si la preview tiene la protección de Vercel activada, contestará 401. En ese caso, la comprobación se repite contra producción justo después de fusionar.
5. Pasar al dueño el enlace del PR, el de la preview y el resumen del CI. **Se fusiona solo con su visto bueno.** Fusionar publica en sgomez.dev.

## 2. Justo después de fusionar (lo hace Claude)

- Ver que el despliegue de producción termina en Vercel y que el workflow «IndexNow» corre y responde 200 o 202.
- Repetir la comprobación con curl del punto 1.4 contra `https://sgomez.dev`.
- Ver que `https://sgomez.dev/9f24f7814d138c217f41f29911b56dc7.txt` sirve la clave de IndexNow.

## 3. Pasos manuales del dueño

### Google Search Console (https://search.google.com/search-console)

1. Si la propiedad `sgomez.dev` no existe, añadirla como propiedad de dominio, que se verifica con un registro TXT en el DNS.
2. En Sitemaps, enviar `https://sgomez.dev/sitemap.xml`.
3. En Inspección de URLs, inspeccionar `https://sgomez.dev/` y `https://sgomez.dev/en` y pulsar «Solicitar indexación» en cada una.
4. Pasada una semana, mirar Páginas (indexación) y Mejoras (datos estructurados).

### Bing Webmaster Tools (https://www.bing.com/webmasters)

1. Añadir el sitio. Se puede importar desde Search Console.
2. En Sitemaps, enviar `https://sgomez.dev/sitemap.xml`.
3. Mirar el informe AI Performance (Copilot), que muestra en qué respuestas de IA aparece el sitio.
4. IndexNow ya avisa a Bing en cada despliegue y no hay que configurar nada más.

### Brave Search

1. Brave no tiene consola de webmasters. El sitio entra por su rastreador.
2. Para acelerarlo, buscar `site:sgomez.dev` en https://search.brave.com y, si no aparece, enviar la URL desde la opción de comentarios de los resultados.

### Opcional

- Probar la web en un iPhone (Safari) y en Firefox. Solo se ha podido verificar en Chromium.
- Revisar las traducciones al inglés de la web (§11 de la especificación).
