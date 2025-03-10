import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Typography } from '@mui/material';

interface Props {
  children: JSX.Element;
  width?: "fit-content" | "100%";
  duration: number;
  direction: boolean; // New prop to determine direction
  isOnce: boolean; // New prop to determine if animation should run once
}

export const Reveal = ({ children, width = "fit-content", duration, direction, isOnce }: Props) => {
  const ref = useRef(null);
  const inViewRef = useInView(ref);

  const animationcontrols = useAnimation();

  useLayoutEffect(() => {
    if (inViewRef) {
      animationcontrols.start("visible");
    } else {
      if (isOnce !== null && isOnce == true) {
        animationcontrols.start("hidden");
      }
    }
  }, [inViewRef]);

  return (
    <div ref={ref} style={{ width }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: direction ? -75 : 75 },  // Dynamic y value based on direction
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={animationcontrols}
        transition={{ duration: duration, delay: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};