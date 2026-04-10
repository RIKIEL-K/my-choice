/**
 * Shared GSAP animation presets for consistent motion across the app.
 * Import individual functions and call them with a ref or selector.
 */
import gsap from "gsap";

/** Fade + slide-up entrance for a single element */
export function fadeSlideUp(
  target: gsap.TweenTarget,
  options?: gsap.TweenVars
) {
  return gsap.fromTo(
    target,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", ...options }
  );
}

/** Staggered fade + slide-up for a list of elements */
export function staggerFadeUp(
  targets: gsap.TweenTarget,
  options?: gsap.TweenVars
) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.1,
      ...options,
    }
  );
}

/** Slot-machine counter animation for number values */
export function countUp(
  target: HTMLElement,
  endValue: number,
  options?: gsap.TweenVars
) {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: endValue,
    duration: 1.2,
    ease: "power2.out",
    onUpdate() {
      target.textContent = Math.round(obj.val).toLocaleString("fr-FR");
    },
    ...options,
  });
}

/** Scale + fade pop-in (used for success overlays) */
export function popIn(
  target: gsap.TweenTarget,
  options?: gsap.TweenVars
) {
  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.7 },
    { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", ...options }
  );
}

/** Slide-in from the left */
export function slideInLeft(
  target: gsap.TweenTarget,
  options?: gsap.TweenVars
) {
  return gsap.fromTo(
    target,
    { opacity: 0, x: -50 },
    { opacity: 1, x: 0, duration: 0.55, ease: "power3.out", ...options }
  );
}
