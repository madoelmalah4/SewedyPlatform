import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import { Typography } from '@mui/material'

interface Props {
  children: JSX.Element;
  width?: "fit-content" | "100%";
  duration: number;
}

export const RevealText = ({ children, width = "fit-content", duration }: Props) => {

  const ref = useRef(null);
  const inViewRef = useInView(ref, { once: true });

  const animationcontrols = useAnimation();
  const slideControls = useAnimation();

  useLayoutEffect(() => {
    if (inViewRef) {
      animationcontrols.start("visible");
      slideControls.start("visible");
    }
    else
    {
      animationcontrols.start("hidden");
      slideControls.start("hidden");
    }
  }, [inViewRef]);

  return (
    <div ref={ref} style={{ width, position: "relative" }}> {/* Ensure parent is relative */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={animationcontrols}
        transition={{ duration, delay: 0.5, ease: "easeInOut" }}
      >
        {children}
      </motion.div>

      {/* Slide effect */}
      <motion.div
        variants={{
          hidden: { left: "0%" }, // Hide initially with width 0
          visible: { left: "100%" }, // Expand to full width
        }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top:4,
          bottom: 4,  // Position it at the bottom of the container
          right: 0, // Start from the right
          left: 0, // Start from the left
          background: "#EF3131",
          zIndex:100
        }}
      />
    </div>
  );
};
