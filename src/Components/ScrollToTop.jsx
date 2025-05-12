// src/components/ScrollToTop.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Fab,
  Box,
  LinearProgress,
  Zoom,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { styled } from "@mui/material/styles";

// Styled LinearProgress for a more modern look
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  backgroundColor: "transparent", // Make background transparent to blend
  "& .MuiLinearProgress-bar": {
    backgroundColor: theme.palette.primary.main, // Use theme primary color
    borderRadius: theme.shape.borderRadius,
  },
}));

// Styled Fab for a slightly more refined appearance
const StyledFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(3), // Use theme spacing
  right: theme.spacing(3),
  zIndex: theme.zIndex.speedDial, // Use a standard z-index value
  boxShadow: theme.shadows[6],
  transition: "transform 0.2s ease-in-out, opacity 0.2s ease-in-out", // Smoother transitions
  "&:hover": {
    transform: "scale(1.1)", // Slightly more subtle hover scale
    backgroundColor: theme.palette.primary.dark, // Darken on hover for feedback
  },
}));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Adjust breakpoint if needed

  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Debounce scroll handler for performance
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    // Ensure documentElement and body are available
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );

    const totalScrollableHeight = docHeight - windowHeight;

    if (totalScrollableHeight <= 0) {
      // No scrollbar or nothing to scroll
      setScrollProgress(0);
      setIsVisible(false);
      return;
    }

    const currentProgress = (scrollY / totalScrollableHeight) * 100;
    setScrollProgress(Math.min(100, Math.max(0, currentProgress))); // Clamp progress between 0 and 100
    setIsVisible(scrollY > (isMobile ? 200 : 300)); // Show button sooner on mobile
  }, [isMobile]);

  const debouncedScrollHandler = useMemo(
    () => debounce(handleScroll, 50),
    [handleScroll]
  );

  // Effect for scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", debouncedScrollHandler, {
      passive: true,
    });
    // Initial check in case the page loads already scrolled
    debouncedScrollHandler();
    return () => window.removeEventListener("scroll", debouncedScrollHandler);
  }, [debouncedScrollHandler]);

  // Effect for scrolling to top on pathname change
  useEffect(() => {
    // Using behavior: 'instant' as smooth scroll here might conflict with page load animations
    // or feel sluggish if the content above the fold is small.
    // The manual scroll button will have 'smooth'.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  const handleScrollToTopClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Scroll Progress Bar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: theme.zIndex.appBar + 1, // Ensure it's above app bar but below modal-like elements
          opacity: scrollProgress > 0 && scrollProgress < 100 ? 1 : 0, // Hide if at top or bottom
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <StyledLinearProgress variant="determinate" value={scrollProgress} />
      </Box>

      {/* Scroll to Top Button */}
      <Zoom in={isVisible} timeout={{ enter: 200, exit: 200 }}>
        <StyledFab
          color="primary"
          size={isMobile ? "small" : "medium"} // Smaller button on mobile
          onClick={handleScrollToTopClick}
          aria-label="scroll to top"
        >
          <KeyboardArrowUpIcon />
        </StyledFab>
      </Zoom>
    </>
  );
};

export default ScrollToTop;
