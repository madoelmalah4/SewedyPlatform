"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
  Divider,
  Paper,
  Fade,
  Button,
} from "@mui/material";
import ReactPlayer from "react-player";
import { motion, useScroll, useTransform } from "framer-motion";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CostumButton from "../components/CostumButton";
import SliderPartners from "../components/Slider";
import Footer from "../components/Footer";
import LandPic from "../assets/landpic.png";
import sp1 from "../assets/sp1.jpg";
import sp2 from "../assets/sp2.jpg";
import sewedy from "../assets/sewedy.png";
import homep from "../assets/homep.png";
import { BuildTwoTone } from "@mui/icons-material";

const MotionBox = motion(Box);

const CountUpAnimation = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  
  
  useEffect(() => {
    const node = nodeRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min(
              (timestamp - start) / (duration * 1000),
              1
            );
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    if (node) observer.observe(node);
    
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [end, duration]);
  
  return (
    <Typography
    ref={nodeRef}
      variant="h2"
      sx={{
        fontWeight: 700,
        color: "#DA1B1B",
        textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {count}
    </Typography>
  );
};

export default function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [inView, setInView] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const VidoeLink =
    "https://drive.google.com/uc?export=download&id=1dphnvXMfm-A8PuZCdgFKJvgwLgNgmwVG";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const target = document.querySelector("#special-moments");
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, []);

  return (
    <Box sx={{ overflow: "hidden" }}>
      {/* Hero Section with Parallax Effect */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "100vh", md: "115vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <MotionBox
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${sewedy})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.9)",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7))",
            },
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography
                variant="h1"
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem" },
                  mb: 3,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                El Sewedy International School
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: "white",
                  fontWeight: 400,
                  fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2.5rem" },
                  mb: 5,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                  backgroundColor: "rgba(218, 27, 27, 0.9)", // Reduced opacity (0.7 for 70%)
                  p: 1.5,
                  width: "fit-content",
                  mb: 10,
                  fontWeight: 700,
                }}
              >
                For Applied Technology and Software
              </Typography>

              <Button
                variant="contained"
                href="https://www.facebook.com/profile.php?id=100083837165938"
                sx={{
                  bgcolor: "#EF3131",
                  color: "white",
                  px: 3,
                  py: 1,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: "500",
                  height: "50px",
                  "&:hover": {
                    bgcolor: "#D32F2F",
                  },
                  minWidth: "110px",
                }}
              >
                Learn more
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ my: { xs: 10, md: 15 } }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 6, md: 10 }}
            alignItems="center"
          >
            <Box flex={1}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  mb: 4,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
                }}
              >
                What is El Sewedy International School?
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3, fontSize: "1.1rem", lineHeight: 1.8 }}
              >
                El Sewedy International School for Applied Technology and
                Software, established in 2022, is ranked among the top ten
                international schools for applied technology. Our mission is to
                empower students with the skills and knowledge needed for
                success in both local and global industries, fostering a
                brighter future through cutting-edge education and innovation.
              </Typography>
            </Box>
            <Box
              flex={1}
              sx={{
                width: "100%",
                maxWidth: 600,
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <ReactPlayer
                url={VidoeLink}
                width="100%"
                height="auto"
                controls
                muted={true}
                playing={true}
              />
            </Box>
          </Stack>
        </motion.div>
      </Container>

      {/* Specialization Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 10, md: 10 },
          mt: { xs: 10, md: 15 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: "linear-gradient(45deg, #FF512F, #DD2476)",
            opacity: 0.2,
          }}
          animate={{
            x: ["0%", "100%", "0%"],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            duration: 10,
          }}
        />
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 10, p: 1 }}
        >
          {!isMobile && (
            <Box
              component="img"
              src={homep}
              alt="Homepage decoration"
              sx={{
                width: { lg: "350px", xs: "250px" },
                position: "absolute",
                right: -50,
                opacity: 0.9,
                zIndex: -1,
                top: 100,
              }}
            />
          )}

          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 4,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Software Programming Specialization
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: "1.3rem", lineHeight: 1.8 }}
          >
            The Integrated Systems (IS) and Information Systems (IS)
            specializations at our school provide essential knowledge for the
            digital age. The Integrated Systems specialization focuses on
            combining hardware and software solutions, teaching students to
            design, implement, and maintain advanced technological systems. The
            Information Systems specialization emphasizes system analysis,
            database management, and cybersecurity, preparing students to
            develop and manage efficient digital solutions. Both programs equip
            students with practical skills, preparing them for diverse roles in
            the evolving tech industry.
          </Typography>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Container maxWidth="lg" sx={{ my: { xs: 10, md: 15 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 6, md: 10 }}
          alignItems="center"
          justifyContent="center"
        >
          <Box
            flex={1}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                mb: 4,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Why El Sewedy International School?
            </Typography>

            <Stack spacing={3}>
              {[
                "Competitive education with local and international job opportunities.",
                "Experienced teachers and experts from El Sewedy Electrometer.",
                "Hands-on training at partner companies.",
                "English-language courses in a tech-driven environment.",
                "Small class sizes (max 25 students).",
                "Each student receives a laptop and school uniform.",
                "Various sports, arts, music, and drama activities.",
                "Annual Capstone project to apply research skills.",
                "Opportunities to join tech colleges and institutes.",
                "Career guidance through the Career Development Center (CDC).",
                "Help with applying for competitions and representing the school locally and internationally.",
              ].map((text, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "1.1rem",
                      lineHeight: 1.6,
                      textAlign: "left",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        mr: 2,
                        flexShrink: 0,
                      }}
                    />
                    {text}
                  </Typography>
                </motion.div>
              ))}
            </Stack>
          </Box>

          <Box
            flex={1}
            component={motion.img}
            src={LandPic}
            alt="School facilities"
            sx={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: "20%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              display: "block",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </Stack>
      </Container>

      {/* Statistics Section */}
      <Box
        sx={{
          py: { xs: 10, md: 15 },
          mt: { xs: 10, md: 15 },
          mb: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 6, md: 10 }}
            justifyContent="space-around"
            alignItems="center"
          >
            {[
              { count: 60, label: "Capstone projects every year" },
              { count: 300, label: "Students" },
              { count: 2, label: "Accredited Certificates" },
            ].map((item, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 4,
                  transition: "transform 0.3s ease-in-out",
                  width: "250px",
                  "&:hover": {
                    transform: "translateY(-10px)",
                  },
                }}
              >
                <CountUpAnimation end={item.count} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {item.label}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Special Moments Section */}
      <Box
        id="special-moments"
        sx={{
          bgcolor: inView ? "#1C1D1F" : "white",
          color: inView ? "white" : "text.primary",
          py: { xs: 10, md: 15 },
          transition: "background-color 0.3s ease",
        }}
      >
        <Container maxWidth="lg">
          <motion.div style={{ opacity }}>
            <Typography
              variant="h2"
              sx={{
                textAlign: "center",
                mb: 3,
                color: "primary.main",
                fontWeight: 700,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              }}
            >
              Special Moments!!
            </Typography>
            <Divider
              sx={{
                width: { xs: 200, md: 400 },
                mx: "auto",
                mb: 8,
                borderColor: "primary.main",
              }}
            />
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 8, md: 10 }}
              alignItems="flex-start"
            >
              {[
                {
                  title: "Special Visit",
                  image: sp1,
                  description:
                    "During her visit to Egypt, U.S. First Lady Dr. Jill Biden toured the Sewedy International Applied Technology and Software School. She explored student projects, admired their skills, and emphasized youth empowerment and U.S.-Egypt partnerships. The school's curriculum aligns with industry standards, and her visit concluded with commemorative photos with students.",
                },
                {
                  title: "El Sewedy ICPC",
                  image: sp2,
                  description:
                    "The launch of the first edition of the Elsewedy CPC Problem-Solving Competition, attended by Coach Mohamed Abdel Wahab, one of the top 50 programmers in the world. This marks a proud moment for our school as we foster innovation and excellence in programming. Stay tuned for more updates on this exciting competition!",
                },
              ].map((moment, index) => (
                <Box key={index} flex={1} textAlign="center">
                  <Typography
                    variant="h3"
                    sx={{
                      mb: 3,
                      fontWeight: 600,
                      color: inView ? "white" : "black",
                    }}
                  >
                    {moment.title}
                  </Typography>
                  <Box
                    component="img"
                    src={moment.image}
                    alt={moment.title}
                    sx={{
                      width: "100%",
                      maxWidth: 400,
                      height: "auto",
                      borderRadius: 4,
                      mb: 3,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: 500,
                      mx: "auto",
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                      textAlign: "center",
                    }}
                  >
                    {moment.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Partners Section */}
      <Box sx={{ py: { xs: 10, md: 15 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              color: "#1a1a1a",
            }}
          >
            Our Partners
          </Typography>
          <Stack
            sx={{
              mr: { xs: 6, sm: 6 },
            }}
          >
            <SliderPartners />
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      {/* <Container
        maxWidth="lg"
        sx={{ textAlign: "center", mb: { xs: 10, md: 15 } }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CostumButton
            Text="Our Courses"
            Icon={ArrowForwardIosIcon}
            width="170px"
            path="/courses"
          />
        </motion.div>
      </Container> */}

      {/* Footer */}
      <Footer />
    </Box>
  );
}
