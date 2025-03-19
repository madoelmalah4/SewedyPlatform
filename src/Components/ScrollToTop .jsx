// ScrollToTop.js
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Fab, Box, LinearProgress, Zoom } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll behavior and progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / totalHeight) * 100;

      setScrollProgress(progress);
      setVisible(scrollY > 300); // Show button after scrolling 300px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to the top when the route changes
  useEffect(() => {
    const smoothScrollToTop = () => {
      const scrollStep = -window.scrollY / 30;
      const smoothScroll = () => {
        if (window.scrollY > 0) {
          window.scrollBy(0, scrollStep);
          requestAnimationFrame(smoothScroll);
        }
      };
      requestAnimationFrame(smoothScroll);
    };
    smoothScrollToTop();
  }, [pathname]);

  // Manual scroll-to-top function
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Scroll Progress Indicator */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1100,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={scrollProgress}
          sx={{ height: 4, backgroundColor: "#f0f0f0" }}
        />
      </Box>

      {/* Floating Scroll-to-Top Button */}
      <Zoom in={visible}>
        <Fab
          color="primary"
          onClick={handleScrollTop}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1100,
            boxShadow: 3,
            transition: "transform 0.3s",
            "&:hover": { transform: "scale(1.2)" },
          }}
          aria-label="scroll-to-top"
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Zoom>
    </>
  );
};

export default ScrollToTop;
