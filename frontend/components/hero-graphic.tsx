export function HeroGraphic() {
  return (
    <svg
      viewBox="0 0 480 480"
      className="h-full w-full"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* back parcel */}
      <rect
        x="70"
        y="120"
        width="230"
        height="230"
        rx="18"
        fill="#FAF9F6"
        stroke="#DEDBD2"
        strokeWidth="2"
        transform="rotate(-8 185 235)"
      />
      <line
        x1="70"
        y1="205"
        x2="300"
        y2="205"
        stroke="#DEDBD2"
        strokeWidth="2"
        transform="rotate(-8 185 235)"
      />

      {/* product-card rectangle */}
      <rect
        x="180"
        y="90"
        width="190"
        height="240"
        rx="16"
        fill="#1B1F3B"
        transform="rotate(6 275 210)"
      />
      <rect
        x="205"
        y="120"
        width="140"
        height="95"
        rx="8"
        fill="#FAF9F6"
        fillOpacity="0.12"
        transform="rotate(6 275 210)"
      />
      <rect
        x="205"
        y="230"
        width="100"
        height="10"
        rx="5"
        fill="#FAF9F6"
        fillOpacity="0.5"
        transform="rotate(6 275 210)"
      />
      <rect
        x="205"
        y="250"
        width="70"
        height="10"
        rx="5"
        fill="#E1A730"
        transform="rotate(6 275 210)"
      />

      {/* large price tag, front */}
      <g transform="rotate(-14 205 330)">
        <path
          d="M120 300 L210 300 C216 300 222 302 226 306 L268 348 C276 356 276 369 268 377 L232 413 C224 421 211 421 203 413 L161 371 C157 367 155 361 155 355 L155 314 C155 306 148 300 140 300 Z"
          fill="#E1A730"
        />
        <circle cx="172" cy="317" r="9" fill="#FAF9F6" />
      </g>

      {/* scattered detail dots */}
      <circle cx="60" cy="90" r="4" fill="#DEDBD2" />
      <circle cx="82" cy="78" r="4" fill="#DEDBD2" />
      <circle cx="104" cy="90" r="4" fill="#DEDBD2" />
      <circle cx="400" cy="380" r="4" fill="#DEDBD2" />
      <circle cx="422" cy="368" r="4" fill="#DEDBD2" />
      <circle cx="422" cy="392" r="4" fill="#DEDBD2" />
    </svg>
  );
}
