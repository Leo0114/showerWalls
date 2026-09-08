import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Spring settle time in seconds — Apple's "response", not a duration. */
  duration?: number;
}

/**
 * 20 px, not 60. The reveal is a hint that content just arrived, not a slide:
 * anything further reads as the page assembling itself while you wait.
 */
const OFFSET = 20;

const directionOffset = {
  up: { y: OFFSET },
  down: { y: -OFFSET },
  left: { x: OFFSET },
  right: { x: -OFFSET },
  none: {},
} as const;

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.5,
}: ScrollRevealProps) {
  // Reduced motion keeps the cross-fade and drops only the travel — the arrival
  // still reads, it just stops moving the reader's field of view.
  const reduced = useReducedMotion();
  const offset = reduced ? {} : directionOffset[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduced
          ? { duration: 0.25, delay }
          : // bounce 0 = critically damped: it settles without overshooting,
            // which is what content arriving on its own should do.
            { type: "spring", bounce: 0, duration, delay }
      }
    >
      {children}
    </motion.div>
  );
}
