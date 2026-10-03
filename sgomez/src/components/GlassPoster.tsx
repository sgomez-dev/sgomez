import { useId } from "react";
import { POSTER_SILHOUETTE } from "@/lib/lost/shards";

/**
 * Sustituto estático del cristal 3D de la fase 3: un blob iridiscente en SVG
 * con un halo desenfocado. Es decorativo (sin texto, `aria-hidden`) y solo se
 * coloca detrás del retrato, nunca detrás de un bloque de texto.
 */
export default function GlassPoster({ className = "" }: { className?: string }) {
  // Ids por instancia: el hero y el contacto pintan el mismo SVG y un id
  // repetido en el documento es inválido (y `url(#id)` apuntaría siempre al
  // primero).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const body = `glass-body-${uid}`;
  const sheen = `glass-sheen-${uid}`;
  const depth = `glass-depth-${uid}`;
  const glow = `glass-glow-${uid}`;
  const clip = `glass-clip-${uid}`;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-motion="glass"
      viewBox="0 0 400 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={body} x1="8%" y1="6%" x2="92%" y2="94%">
          <stop offset="0" stopColor="#8FA8FF" />
          <stop offset="0.34" stopColor="#FFFFFF" />
          <stop offset="0.66" stopColor="#6EF0DC" />
          <stop offset="1" stopColor="#5B6CFF" />
        </linearGradient>
        <radialGradient id={sheen} cx="32%" cy="26%" r="62%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={depth} cx="72%" cy="78%" r="55%">
          <stop offset="0" stopColor="#5B6CFF" stopOpacity="0.7" />
          <stop offset="1" stopColor="#5B6CFF" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clip}>
          <path d={POSTER_SILHOUETTE.d} />
        </clipPath>
        <filter id={glow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="11" />
        </filter>
      </defs>
      <g transform="translate(238 166) scale(0.95) translate(-200 -200)">
      <path
        d="M214 52c62-10 124 30 136 92 10 54-12 98-44 138-34 42-96 74-150 52-58-24-102-72-96-132 6-60 50-130 154-150z"
        fill={`url(#${body})`}
        opacity="0.55"
        filter={`url(#${glow})`}
      />
      {/* Con el cristal vivo solo se apaga el cuerpo: el halo se queda detrás del lienzo. */}
      <g data-glass-body="" transform="rotate(18 200 200)">
        <path
          d={POSTER_SILHOUETTE.d}
          fill={`url(#${body})`}
          opacity="0.92"
        />
        <path
          d={POSTER_SILHOUETTE.d}
          fill={`url(#${depth})`}
        />
        {/* El brillo cruza recortado a la silueta y acaba en su sitio, el mismo que ve quien no tiene movimiento. */}
        <g clipPath={`url(#${clip})`}>
          <path
            data-glass-sheen=""
            d={POSTER_SILHOUETTE.d}
            fill={`url(#${sheen})`}
          />
        </g>
        <path
          d={POSTER_SILHOUETTE.d}
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />
      </g>
      </g>
    </svg>
  );
}
