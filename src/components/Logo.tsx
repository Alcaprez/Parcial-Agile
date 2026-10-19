export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Algarrobo"
      style={{ display: "block", flex: "none" }}
    >
      <defs>
        <linearGradient id="alg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a2540" />
          <stop offset="1" stopColor="#12806f" />
        </linearGradient>
        <linearGradient id="alg-coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd777" />
          <stop offset="1" stopColor="#f0a523" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#alg-bg)" />
      <path d="M29.6 35 H34.4 C34.1 43 35 49 38.5 56 H25.5 C29 49 29.9 43 29.6 35 Z" fill="#fff" />
      <path d="M32 45 L22.5 37 M32 45 L41.5 37" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <g fill="#fff">
        <circle cx="16" cy="28" r="8" />
        <circle cx="26.5" cy="20" r="10" />
        <circle cx="38.5" cy="19.5" r="10" />
        <circle cx="48" cy="28" r="8" />
        <ellipse cx="32" cy="28.5" rx="23" ry="8" />
      </g>
      <circle cx="32" cy="23.5" r="6.6" fill="url(#alg-coin)" />
      <circle cx="32" cy="23.5" r="4.2" fill="none" stroke="#b8730a" strokeOpacity=".55" strokeWidth="1.1" />
      <circle cx="17.5" cy="29" r="2.1" fill="url(#alg-coin)" />
      <circle cx="46.5" cy="29" r="2.1" fill="url(#alg-coin)" />
      <path d="M16 57.5 H48" stroke="#fff" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Marca({ size = 38, claro = true }: { size?: number; claro?: boolean }) {
  const color = claro ? "#fff" : "#0a2540";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11, color }}>
      <LogoMark size={size} />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontSize: size * 0.52, fontWeight: 800, letterSpacing: "-0.02em" }}>Algarrobo</span>
        <span
          style={{
            fontSize: size * 0.24,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            opacity: 0.72,
            marginTop: 4,
          }}
        >
          Préstamos
        </span>
      </span>
    </span>
  );
}