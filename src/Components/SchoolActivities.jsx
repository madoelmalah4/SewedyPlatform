"use client";
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  SportsBasketball,
  Palette,
  MusicNote,
  Build,
  ArrowForward,
  Groups,
} from "@mui/icons-material";
import mohammed from "../assets/mohammed.jpeg";
import art from "../assets/art.jpg";
import VideocamIcon from "@mui/icons-material/Videocam";
import fab from '../assets/fab.jpg'
import drama from '../assets/drama.jpg'
import music from '../assets/music.jpg'

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionTypography = motion.create(Typography);

// Activity data with images
const activities = [
  {
    title: "Physical Education",
    subtitle: "Active Bodies, Active Minds",
    icon: <SportsBasketball />,
    description:
      "Our comprehensive sports program develops teamwork, discipline, and physical fitness through basketball, soccer, swimming, and track activities. Students participate in interschool competitions and learn the value of sportsmanship.",
    image: mohammed,
    color: "#1976d2",
    highlights: [
      "Basketball Team",
      "Soccer League Team",
      "Volleyball Team",
      "Ping Pong Team",
    ],
  },
  {
    title: "Drama",
    subtitle: "Lights, Camera, Act!",
    icon: <VideocamIcon />,
    description:
      "Our dynamic drama program fosters creativity, confidence, and collaboration through acting, scriptwriting, and stage production. Students engage in performances, explore various theatrical techniques, and participate in school plays and drama festivals, building communication skills and a love for storytelling.",
    image:drama,
    color: "#2C2C54 ",
    highlights: [
      "Acting Techniques",
      "Scriptwriting & Storytelling",
      "Voice & Movement Training ",
      "Film & Media Acting",
    ],
  },
  {
    title: "Art Studio",
    subtitle: "Unleashing Creativity",
    icon: <Palette />,
    description:
      "Our art program encourages creative expression through painting, drawing, sculpture, and digital arts. Students explore various techniques and materials while developing their artistic skills and preparing for our annual art exhibition.",
    image: art,
    color: "#e53935",
    highlights: [
      "Painting Classes",
      "Sculpture Workshop",
      "Digital Art",
      "Annual Exhibition",
    ],
  },
  {
    title: "Music Program",
    subtitle: "Harmony & Expression",
    icon: <MusicNote />,
    description:
      "Our music program offers vocal and instrumental training with opportunities to perform in school concerts and community events. Students learn music theory, composition, and performance skills while developing their unique musical voice.",
    image:music,
    color: "#7b1fa2",
    highlights: [
      "Choir",
      "Instrumental Classes",
      "Music Theory",
      "Seasonal Concerts",
    ],
  },
  {
    title: "Fabrication Lab",
    subtitle: "Innovation & Creation",
    icon: <Build />,
    description:
      "Our state-of-the-art Fablab provides hands-on experience with digital fabrication, 3D printing, electronics, and prototyping. Students bring their innovative ideas to life while learning valuable STEM skills for the future.",
    image:fab,
    color: "#f57c00",
    highlights: ["3D Printing", "Electronics", "Robotics", "Prototyping"],
  },
];

const SchoolActivities = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle activity change
  const handleActivityChange = (index) => {
    setActiveIndex(index);
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        py: { xs: 3, md: 3 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background design elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(25,118,210,0.05) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "200px",
          height: "200px",
          background:
            "radial-gradient(circle, rgba(229,57,53,0.05) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Creative section header */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mb: 2,
              fontSize: { xs: "2rem", md: "3.5rem" },
              position: "relative",
              display: "inline-block",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                width: "80px",
                height: "4px",
                background:
                  "linear-gradient(90deg, #1976d2, #e53935, #7b1fa2, #f57c00)",
                borderRadius: "2px",
              },
            }}
          >
            Explore Our Activities
          </Typography>
          <Typography
            variant="h6"
            color="red"
            sx={{
              maxWidth: "800px",
              mx: "auto",
              mt: 4,
              fontWeight: 400,
            }}
          >
            Discover the diverse range of extracurricular programs that enrich
            our students' educational experience and foster their talents and
            passions.
          </Typography>
        </MotionBox>

        {/* Activity navigation - horizontal tabs for larger screens */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 5,
              flexWrap: "wrap", // Allows wrapping on smaller screens
              gap: 2, // Spacing between buttons for better UX
            }}
          >
            {activities.map((activity, index) => (
              <Button
                key={index}
                onClick={() => handleActivityChange(index)}
                sx={{
                  px: { xs: 2, sm: 3 }, // Adjust padding for different screens
                  py: 1.2,
                  borderRadius: "50px",
                  color: activeIndex === index ? "white" : "text.primary",
                  bgcolor:
                    activeIndex === index ? activity.color : "transparent",
                  border: `2px solid ${activeIndex === index ? activity.color : "transparent"}`,
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap", // Prevents text from breaking
                  "&:hover": {
                    bgcolor:
                      activeIndex === index
                        ? activity.color
                        : `${activity.color}15`,
                    transform: "translateY(-3px)",
                  },
                  fontWeight: "bold",
                }}
                startIcon={activity.icon}
              >
                {activity.title}
              </Button>
            ))}
          </Box>
        )}

        {/* Mobile activity selector */}
        {isMobile && (
          <Grid container spacing={1} sx={{ mb: 4 }}>
            {activities.map((activity, index) => (
              <Grid item xs={6} key={index}>
                <Button
                  fullWidth
                  onClick={() => handleActivityChange(index)}
                  sx={{
                    py: 1,
                    borderRadius: "8px",
                    color: activeIndex === index ? "white" : "text.primary",
                    bgcolor:
                      activeIndex === index ? activity.color : "transparent",
                    border: `1px solid ${activeIndex === index ? activity.color : "rgba(0,0,0,0.12)"}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor:
                        activeIndex === index
                          ? activity.color
                          : `${activity.color}15`,
                    },
                    fontSize: "0.75rem",
                  }}
                  startIcon={activity.icon}
                >
                  {activity.title}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Featured activity display */}
        <AnimatePresence mode="wait">
          <MotionBox
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={4} alignItems="center">
              {/* Activity image - left side on desktop, top on mobile */}
              <Grid item xs={12} md={6} order={{ xs: 1, md: 1 }}>
                <MotionCard
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  sx={{
                    overflow: "hidden",
                    borderRadius: 4,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    border: `1px solid ${activities[activeIndex].color}20`,
                    position: "relative",
                  }}
                >
                  <CardMedia
                    component="img"
                    height={isMobile ? "200" : "400"}
                    image={activities[activeIndex].image}
                    alt={activities[activeIndex].title}
                    sx={{
                      transition: "transform 0.5s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: `linear-gradient(to top, ${activities[activeIndex].color}90 0%, transparent 50%)`,
                      opacity: 0.3,
                    }}
                  />
                </MotionCard>
              </Grid>

              {/* Activity details - right side on desktop, bottom on mobile */}
              <Grid item xs={12} md={6} order={{ xs: 2, md: 2 }}>
                <Box sx={{ p: { xs: 2, md: 4 } }}>
                  <MotionTypography
                    variant="overline"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    sx={{
                      color: activities[activeIndex].color,
                      fontWeight: "bold",
                      letterSpacing: 1.5,
                      mb: 1,
                      display: "block",
                    }}
                  >
                    {activities[activeIndex].subtitle}
                  </MotionTypography>

                  <MotionTypography
                    variant="h3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      mb: 3,
                      fontSize: { xs: "1.75rem", md: "2.5rem" },
                    }}
                  >
                    {activities[activeIndex].title}
                  </MotionTypography>

                  <MotionTypography
                    variant="body1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    sx={{
                      color: "black",
                      mb: 4,
                      lineHeight: 1.8,
                    }}
                  >
                    {activities[activeIndex].description}
                  </MotionTypography>

                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: "text.primary",
                      }}
                    >
                      Program Highlights:
                    </Typography>

                    <Grid container spacing={1}>
                      {activities[activeIndex].highlights.map(
                        (highlight, idx) => (
                          <Grid item xs={6} key={idx}>
                            <Chip
                              label={highlight}
                              size="small"
                              icon={<ArrowForward sx={{ fontSize: 16 }} />}
                              sx={{
                                bgcolor: `${activities[activeIndex].color}10`,
                                color: activities[activeIndex].color,
                                fontWeight: 500,
                                mb: 1,
                              }}
                            />
                          </Grid>
                        )
                      )}
                    </Grid>
                  </MotionBox>
                </Box>
              </Grid>
            </Grid>
          </MotionBox>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default SchoolActivities;
