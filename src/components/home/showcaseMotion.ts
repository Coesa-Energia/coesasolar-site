export type ShowcaseDirection = "left" | "right";

export const showcaseProgress = (scrollProgress: number) =>
  Math.min(Math.max((scrollProgress - 0.05) / 0.9, 0), 1);

export const showcaseOffset = (direction: ShowcaseDirection, progress: number, distance: number) =>
  direction === "left" ? -progress * distance : -(1 - progress) * distance;
