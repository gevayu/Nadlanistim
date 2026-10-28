import { useId } from "react";

// LinkedIn-style "#OPENTOWORK" ring. Drop it inside a square, position:relative avatar box;
// it draws a green arc down the left side and along the bottom, fading out at both ends.
// Geometry (viewBox 100): band r=38–50, arc from 215° to 15° counter-clockwise.
export default function OpenToWorkRing() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg className="otw-ring" viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="14" y1="25" x2="92" y2="61">
          <stop offset="0" stopColor="#2E6B45" stopOpacity="0" />
          <stop offset=".3" stopColor="#2E6B45" />
          <stop offset=".72" stopColor="#2E6B45" />
          <stop offset="1" stopColor="#2E6B45" stopOpacity="0" />
        </linearGradient>
        <path id={`${id}t`} d="M11.91 23.33 A46.5 46.5 0 1 0 94.92 62.04" />
      </defs>
      <path d="M13.96 24.76 A44 44 0 1 0 92.5 61.39" fill="none" stroke={`url(#${id}g)`} strokeWidth="12" />
      <text className="otw-ring__text">
        <textPath href={`#${id}t`} startOffset="50%" textAnchor="middle">#OPENTOWORK</textPath>
      </text>
    </svg>
  );
}
