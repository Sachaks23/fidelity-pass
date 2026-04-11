/**
 * Logo Fidco — Option 1 validée (carré arrondi doré, F + étoile)
 * Usage : <FidcoLogo size={32} />
 */
export default function FidcoLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Fidco"
    >
      <rect width="200" height="200" rx="44" fill="url(#fidco-gold)"/>
      {/* F — barre verticale */}
      <rect x="50" y="48" width="24" height="104" rx="5" fill="white"/>
      {/* F — barre horizontale haute */}
      <rect x="50" y="48" width="92" height="24" rx="5" fill="white"/>
      {/* F — barre horizontale milieu */}
      <rect x="50" y="88" width="66" height="22" rx="5" fill="white"/>
      {/* Étoile fidélité */}
      <path d="M148,108 L153,123 L169,123 L157,133 L161,148 L148,139 L135,148 L139,133 L127,123 L143,123 Z" fill="white"/>
      <defs>
        <linearGradient id="fidco-gold" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24"/>
          <stop offset="1" stopColor="#b45309"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
