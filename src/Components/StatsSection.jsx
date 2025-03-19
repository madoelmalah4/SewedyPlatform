"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { motion, useInView, useAnimationControls } from "framer-motion";
import { School, EmojiEvents, WorkOutline } from "@mui/icons-material";

// Advanced CountUp animation component with easing
const CountUpAnimation = ({ end, duration = 2, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // Easing function for more natural counting
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  useEffect(() => {
    if (!isInView) return;

    let startTime= null;
    let animationFrame;
    const startDelay = delay * 1000;

    const startAnimation = () => {
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        if (elapsed < duration * 1000) {
          // Apply easing for more natural animation
          const progress = easeOutExpo(elapsed / (duration * 1000));
          setCount(Math.floor(progress * end));
          animationFrame = requestAnimationFrame(step);
        } else {
          setCount(end);
        }
      };

      animationFrame = requestAnimationFrame(step);
    };

    const delayTimeout = setTimeout(startAnimation, startDelay);

    return () => {
      clearTimeout(delayTimeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, end, duration, delay]);

  return <span ref={ref}>{count}</span>;
};

// Animated underline component
const AnimatedUnderline = ({ color, delay = 0 }) => {
  const controls = useAnimationControls();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      controls.start({
        width: "40px",
        transition: { delay, duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] },
      });
    }
  }, [isInView, controls, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ width: 0 }}
      animate={controls}
      style={{
        height: "3px",
        background: color,
        marginTop: "8px",
        marginBottom: "16px",
        borderRadius: "2px",
      }}
    />
  );
};

// Stats data with icons and descriptions
const statsData = [
  {
    count: 60,
    label: "Capstone projects every year",
    description: "Innovative solutions developed by our students",
    icon: EmojiEvents,
    color: "#FF0000",
  },
  {
    count: 300,
    label: "Students",
    description: "Talented individuals pursuing excellence",
    icon: School,
    color: "#000000",
  },
  {
    count: 2,
    label: "Accredited Certificates",
    description: "Industry-recognized qualifications",
    icon: WorkOutline,
    color: "#FF0000",
  },
];

export default function StatsSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  return (
    <Box
      sx={{
        position: "relative",
        py: { xs: 10, sm: 12, md: 10 },
        mt: { xs: 8, md: 12 },
        mb: { xs: 4, md: 8 },
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={{ xs: 3, md: 5 }} justifyContent="center">
          {statsData.map((item, index) => {
            const Icon = item.icon;

            return (
              <Grid item xs={10} sm={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.7,
                      delay: index * 0.15,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    },
                  }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      height: "100%",
                      minHeight: { xs: "240px", md: "280px" },
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      borderRadius: 3,
                      position: "relative",
                      overflow: "hidden",
                      background: "#ffffff",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                      border: "1px solid rgba(0,0,0,0.03)",
                      transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: `0 20px 40px ${alpha(item.color, 0.12)}`,
                        "& .stat-icon-wrapper": {
                          transform: "translateY(-5px)",
                          boxShadow: `0 15px 25px ${alpha(item.color, 0.2)}`,
                        },
                        "& .stat-number": {
                          color: item.color,
                        },
                        "& .stat-shine": {
                          transform: "translateX(250px) skewX(-20deg)",
                        },
                      },
                    }}
                  >
                    {/* Shine effect overlay */}
                    <Box
                      className="stat-shine"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: -150,
                        width: "50px",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                        transform: "translateX(-250px) skewX(-20deg)",
                        transition: "transform 1s",
                        zIndex: 2,
                      }}
                    />

                    {/* Card content */}
                    <Box
                      sx={{ position: "relative", zIndex: 1, width: "100%" }}
                    >
                      <Box
                        className="stat-icon-wrapper"
                        sx={{
                          mb: 2.5,
                          width: { xs: "60px", md: "65px" },
                          height: { xs: "60px", md: "65px" },
                          borderRadius: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: item.color,
                          color: "#ffffff",
                          mx: "auto",
                          transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
                          boxShadow: `0 8px 20px ${alpha(item.color, 0.15)}`,
                        }}
                      >
                        <Icon sx={{ fontSize: { xs: 30, md: 32 } }} />
                      </Box>

                      <Typography
                        variant="h3"
                        className="stat-number"
                        sx={{
                          fontWeight: 700,
                          mb: 0.5,
                          color: "#222222",
                          fontSize: { xs: "2.8rem", sm: "3rem", md: "3.2rem" },
                          lineHeight: 1.1,
                          transition: "color 0.4s ease",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        <CountUpAnimation
                          end={item.count}
                          delay={index * 0.15}
                        />
                        +
                      </Typography>

                      <AnimatedUnderline
                        color={item.color}
                        delay={0.3 + index * 0.15}
                      />

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: "#333333",
                          mb: 1,
                          fontSize: { xs: "1rem", md: "1.1rem" },
                        }}
                      >
                        {item.label}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666666",
                          maxWidth: "90%",
                          mx: "auto",
                          fontSize: { xs: "0.85rem", md: "0.9rem" },
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>

                    {/* Background decorative elements */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "100%",
                        height: "100%",
                        background: `radial-gradient(circle at 90% 90%, ${alpha(item.color, 0.06)} 0%, transparent 40%)`,
                        zIndex: 0,
                      }}
                    />

                    {/* Corner accent */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "30px",
                        height: "30px",
                        background: item.color,
                        clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                        opacity: 0.8,
                        zIndex: 1,
                      }}
                    />
                  </Paper>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Floating decorative elements */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.5,
          scale: 1,
          transition: { duration: 1, delay: 0.2 },
        }}
        sx={{
          position: "absolute",
          top: "15%",
          left: "5%",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: "#FF0000",
          filter: "blur(1px)",
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.3,
          scale: 1,
          transition: { duration: 1, delay: 0.4 },
        }}
        sx={{
          position: "absolute",
          bottom: "20%",
          right: "8%",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#000000",
          filter: "blur(1px)",
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.2,
          scale: 1,
          transition: { duration: 1, delay: 0.6 },
        }}
        sx={{
          position: "absolute",
          top: "60%",
          left: "15%",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#000000",
          filter: "blur(1px)",
          zIndex: 0,
        }}
      />
    </Box>
  );
}
