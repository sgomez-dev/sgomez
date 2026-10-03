# Fase 4: revisión con opus y ronda de arreglos

**Veredicto:** se puede integrar una vez arreglados el 1 y el 2. Esta ronda está **aplicada** (puntos 1 a 9 y 11 a 15, el 10 queda como deuda). Commits 0e3e28e, 9769f5f y 8ba1754, informe en «Ronda de arreglos tras la revisión» de `2026-10-02-fase-4.md`.

## De la revisión con opus

1. **(Alta) Memoria de `ScrollSequence`** (`player.ts:90,128`). Hoy son unos 500 MB decodificados en escritorio y 130 MB en móvil.
   - Hay que guardar los `Blob` comprimidos y decodificar como `ImageBitmap` solo una ventana de ±8 fotogramas alrededor del actual. Los que salen de la ventana se cierran con `close()`.
   - Además, `MAX_DPR` pasa a 1,5.
2. **(Alta) El botón de pausa del hero se queda huérfano** (`hero-loop-player.ts:31-40,112`). `teardown` tiene que quitar el botón. Nunca debe quedar un control con foco dentro de `aria-hidden`.
3. **(Media) Progreso en pantallas altas.**
   - En `chapterProgress` (`player.ts:38`), cuando `span ≤ 0` hay que usar `sectionProgress`.
   - En `Build.tsx`, la caja del sticky lleva `lg:w-[min(100%,70vh)]` para que no se salga en alturas de 850 px o menos.
4. **(Media) Margen de JS.**
   - `<Image>` de `next/image` se sustituye por `getImageProps()` en los componentes de servidor (`Portrait`, `SkyQuetz` y `LatestPosts`), así sale un `<img>` normal sin JS de cliente.
   - En `Portrait`, que es el LCP, se conservan `fetchPriority="high"` y la precarga con `ReactDOM.preload`.
   - Objetivo, unos 7 KB menos. Hay que comprobar que el LCP y el CLS no cambian.
5. **(Media) Monograma en iOS** (`monogram-player.ts:54`). Se quita la espera de `canplaythrough` y se llama a `play()` al 50 % visible.
6. **(Media) Fixtures en el CI.**
   - En `ci.yml`, antes de «Production build for Lighthouse», `rm -rf .next/server public/media/__fixture`.
   - En `next.config`, el build se aborta si `E2E_FIXTURES === "1"` y `VERCEL_ENV` está definida.
7. **(Baja) LCP del monograma** (`monogram-player.ts:60`). El `<video>` no entra en el DOM hasta `playing`, o se pinta en un canvas como el del hero.
8. **(Baja) Liberar los vídeos.**
   - En los tres `dispose`, quitar las `source` y llamar a `v.load()`.
   - En `reel-player.ts:18`, `stop()` quita su listener y su `MutationObserver`.
   - En `hero-loop-player.ts:75`, el respaldo con rAF se para en pausa.
9. **(Baja) Equipos modestos.** `useLazyMedia` aplica `gatingPasses` (núcleos y memoria).
10. Anotado como deuda, no se hace en esta ronda: HEVC con alfa para Safari. No se puede comprobar sin un Safari real.

## Del controlador

11. **El reel solo se reproduce a petición** (WCAG 2.2.2).
    - Se reproduce con `pointerenter` o `focusin` de la ficha, y solo si `matchMedia("(hover: hover) and (pointer: fine)")` se cumple.
    - El vídeo se crea en la primera interacción. Al salir, se pausa y vuelve al fotograma 0, sin destruirlo.
    - En táctil y con movimiento reducido, solo el póster.
12. **Botón de pausa del hero.** No tapa el cristal: va abajo a la derecha de la columna, o debajo de ella, y en el DOM sigue antes del h1.
13. **El velo gris del monograma.** El cristal se funde a transparente mientras entra el logotipo, sin pasar por gris.
14. **Espacio duro antes de «%».** En los textos de los casos y de las fichas (ES y EN), la cifra y el % van con espacio duro (` `) para que «80 %» no se parta. Mejor en el componente que pinta el texto, con un reemplazo `/(\d) %/g`, que en los datos aprobados.
15. **El presupuesto de JS del e2e** tiene que quedar con margen, al menos 5 KB bajo 170, y la suite e2e entera tiene que pasar desde un `.next` limpio.
