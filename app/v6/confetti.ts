import confetti from "canvas-confetti";

/** Brand-colour confetti burst for successful form submits. Skipped for reduced-motion users. */
export function celebrate() {
  confetti({
    particleCount: 160,
    spread: 100,
    origin: { y: 0.6 },
    colors: ["#8B5CF6", "#22D3EE", "#F472B6", "#ffffff"],
    disableForReducedMotion: true,
  });
}
