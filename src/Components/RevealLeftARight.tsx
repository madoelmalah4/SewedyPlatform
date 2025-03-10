import React, { useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

interface Props {
  children: JSX.Element;
  width?: "fit-content" | "100%";
  duration: number;
  direction?: "left" | "right"; // Changed to a string for clarity
  isOnce?: boolean; // Optional prop to determine if animation should run once
}

export const RevealLeftARight = ({
  children,
  width = "fit-content",
  duration,
  direction = "left", // Default to left
  isOnce = false, // Default false
}: Props) => {
    
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: isOnce }); // Fixed hook usage

  const animationControls = useAnimation();

  useEffect(() => {
    if (inView) {
      animationControls.start("visible");
    } else if (!isOnce) {
      animationControls.start("hidden");
    }
  }, [inView]);

  return (
    <div ref={ref} style={{ width }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, x: direction === "left" ? -75 : 75 }, // Uses string instead of boolean
          visible: { opacity: 1, x: 0 },
        }}
        initial="hidden"
        animate={animationControls}
        transition={{ duration: duration, delay: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};
