// Ilustración vectorial del hero: no depende de una foto externa y pesa casi nada.
// Se puede reemplazar por una foto real del vivero cuando esté disponible.
export default function IlustracionBonsai({ className = '' }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Ilustración de un bonsái">
      <circle cx="200" cy="190" r="170" fill="var(--color-musgo-100)" />
      {/* Copa */}
      <g fill="var(--color-musgo-700)">
        <ellipse cx="140" cy="140" rx="70" ry="38" />
        <ellipse cx="250" cy="110" rx="80" ry="42" />
        <ellipse cx="275" cy="185" rx="55" ry="28" />
      </g>
      <g fill="var(--color-musgo-600)">
        <ellipse cx="160" cy="125" rx="45" ry="22" />
        <ellipse cx="240" cy="95" rx="50" ry="24" />
      </g>
      {/* Tronco */}
      <path
        d="M195 300 C190 260 170 240 180 210 C188 185 220 180 215 150 C212 132 230 120 245 112
           M200 230 C225 222 255 205 270 188 M185 200 C165 180 150 160 140 142"
        fill="none" stroke="var(--color-tierra-800)" strokeWidth="14" strokeLinecap="round"
      />
      {/* Maceta */}
      <path d="M110 300 h180 l-16 50 h-148 z" fill="var(--color-tierra-500)" />
      <rect x="100" y="290" width="200" height="16" rx="4" fill="var(--color-tierra-600)" />
    </svg>
  )
}
