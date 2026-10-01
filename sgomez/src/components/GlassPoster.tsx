import { useId } from "react";

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
      <g transform="rotate(18 200 200)">
        <path
          d="M222 78c58 4 106 46 106 104 0 56-28 92-72 116-44 24-106 18-136-28-28-44-18-98 18-136 26-28 50-58 84-56z"
          fill={`url(#${body})`}
          opacity="0.92"
        />
        <path
          d="M222 78c58 4 106 46 106 104 0 56-28 92-72 116-44 24-106 18-136-28-28-44-18-98 18-136 26-28 50-58 84-56z"
          fill={`url(#${depth})`}
        />
        <path
          d="M222 78c58 4 106 46 106 104 0 56-28 92-72 116-44 24-106 18-136-28-28-44-18-98 18-136 26-28 50-58 84-56z"
          fill={`url(#${sheen})`}
        />
        <path
          d="M222 78c58 4 106 46 106 104 0 56-28 92-72 116-44 24-106 18-136-28-28-44-18-98 18-136 26-28 50-58 84-56z"
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
