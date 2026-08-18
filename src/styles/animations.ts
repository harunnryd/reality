import type { Variants } from "framer-motion";
import { springEase } from "./theme";

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: springEase },
  },
};

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, x: 16 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: springEase },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};
