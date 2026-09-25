type BoxProps = {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  animClass?: string;
  filled?: boolean;
};

/** A simple line-art parcel: body, a flap seam, and a strip of tape. */
function Box({ x, y, scale = 1, rotate = 0, animClass = "", filled = false }: BoxProps) {
  return (
    <g className={animClass} style={{ transformOrigin: `${x}px ${y}px` }}>
      <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rotate})`}>
        {filled ? (
          <rect x="-32" y="-32" width="64" height="64" rx="8" className="fill-ink" />
        ) : (
          <rect
            x="-32"
            y="-32"
            width="64"
            height="64"
            rx="8"
            className="fill-bg text-line"
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
        <line
          x1="-32"
          y1="-8"
          x2="32"
          y2="-8"
          className={filled ? "text-bg" : "text-line"}
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity={filled ? 0.4 : 1}
        />
        <rect
          x="-6"
          y="-32"
          width="12"
          height="64"
          className={filled ? "fill-accent" : "fill-line"}
        />
      </g>
    </g>
  );
}

/** Simple line-art shopping cart, used as the hero's focal accent. */
function CartIcon({ x, y, scale = 1, animClass = "" }: { x: number; y: number; scale?: number; animClass?: string }) {
  return (
    <g className={animClass} style={{ transformOrigin: `${x}px ${y}px` }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`} className="fill-accent">
        <path d="M-30 -28 h10 l6 34 h34 l8 -22 h-38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="-6" cy="18" r="5" />
        <circle cx="18" cy="18" r="5" />
      </g>
    </g>
  );
}

export function HeroGraphic() {
  return (
    <div className="relative">
      {/* soft glow backdrop for depth — purely decorative, sits behind the artwork */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-full bg-accent/25 blur-3xl"
      />

      <svg
        viewBox="0 0 480 440"
        className="relative h-full w-full"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* laptop base, screen tilted back slightly */}
        <g transform="translate(90 300)">
          <rect x="0" y="0" width="300" height="18" rx="6" className="fill-ink" />
          <path d="M20 0 L40 -170 H260 L280 0 Z" className="fill-ink" fillOpacity="0.9" />
          <rect x="52" y="-158" width="196" height="130" rx="6" className="fill-bg" fillOpacity="0.12" />
        </g>

        {/* boxes lifting off the screen, staggered float animation */}
        <Box x={130} y={190} scale={1.15} rotate={-10} animClass="animate-float" filled />
        <Box x={230} y={140} scale={0.85} rotate={8} animClass="animate-float-fast" />
        <Box x={310} y={205} scale={1} rotate={-6} animClass="animate-float-slow" filled />
        <Box x={175} y={95} scale={0.7} rotate={14} animClass="animate-float-fast" />
        <Box x={355} y={110} scale={0.75} rotate={-16} animClass="animate-float" />

        <CartIcon x={280} y={70} scale={1.3} animClass="animate-float-slow" />

        {/* price tag, tucked among the boxes to keep the discount motif */}
        <g transform="translate(60 150) rotate(-14)" className="fill-accent animate-float">
          <path d="M-40 -18 L20 -18 C24 -18 28 -16 30 -13 L54 12 C59 17 59 25 54 30 L33 51 C28 56 20 56 15 51 L-9 26 C-12 23 -13 19 -13 15 L-13 -8 C-13 -14 -18 -18 -24 -18 Z" />
          <circle cx="-20" cy="-6" r="6" className="fill-bg" />
        </g>

        {/* scattered detail dots for texture */}
        <g className="fill-line">
          <circle cx="40" cy="40" r="4" />
          <circle cx="60" cy="28" r="4" />
          <circle cx="80" cy="40" r="4" />
          <circle cx="440" cy="260" r="4" />
          <circle cx="458" cy="248" r="4" />
        </g>
      </svg>
    </div>
  );
}
