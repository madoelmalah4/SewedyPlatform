"use client";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme,
  Fade,
} from "@mui/material";
import { motion } from "framer-motion";
import { School, Groups, Engineering, Lightbulb } from "@mui/icons-material";
import anas from '../assets/1.png'
const MotionPaper = motion(Paper);

const CapstoneSection = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <Groups sx={{ fontSize: 40 }} />,
      title: "Team Collaboration",
      description: "Five-student teams working together annually",
    },
    {
      icon: <Engineering sx={{ fontSize: 40 }} />,
      title: "Expert Guidance",
      description: "Mentored by experienced engineers",
    },
    {
      icon: <School sx={{ fontSize: 40 }} />,
      title: "Skill Development",
      description: "Enhanced technical and problem-solving abilities",
    },
    {
      icon: <Lightbulb sx={{ fontSize: 40 }} />,
      title: "Real Impact",
      description: "Solutions for sustainable development challenges",
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "#1a1a1a",
        py: { xs: 8, md: 12 },
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100px",
          transform: "translateY(-100%)",
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Left side - Text content */}
          <Grid item xs={12} md={6}>
            <Box sx={{ color: "white" }}>
              <Fade in timeout={1000}>
                <div>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "#DA1B1B",
                      letterSpacing: 3,
                      fontWeight: "bold",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Final Milestone
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      mb: 4,
                      background:
                        "linear-gradient(45deg, #ffffff 30%, #DA1B1B 90%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Capstone Project
                  </Typography>
                </div>
              </Fade>

              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                A graduation project that brings together theoretical knowledge
                and practical application, where teams of five students tackle
                real-world challenges in sustainable development. Under expert
                guidance, students transform innovative ideas into impactful
                solutions.
              </Typography>

              <Grid container spacing={5}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <MotionPaper
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      elevation={0}
                      sx={{
                        p: 2,
                        height: "100%",
                        bgcolor: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                        transition: "transform 0.3s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          bgcolor: "rgba(255,255,255,0.08)",
                        },
                      }}
                    >
                      <Box sx={{ color: "#DA1B1B", mb: 1 }}>{feature.icon}</Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "white",
                          mb: 1,
                          fontWeight: "bold",
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {feature.description}
                      </Typography>
                    </MotionPaper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Right side - Image */}
          <Grid item xs={12} md={6}>
            <MotionPaper
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              elevation={24}
              sx={{
                overflow: "hidden",
                borderRadius: 4,
                bgcolor: "transparent",
                height: "95%",
                minHeight: 400,
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={anas}
                alt="Capstone Project Presentation"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                  p: 3,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "white",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  Students presenting their innovative solutions
                </Typography>
              </Box>
            </MotionPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CapstoneSection;
