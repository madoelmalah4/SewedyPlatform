"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  useMediaQuery,
  useTheme,
  Stack,
  Fade,
} from "@mui/material";
import {
  School,
  CheckCircle,
  Person,
  Grade,
  Public,
  ExpandMore,
  Computer,
  Work,
  Language,
  Psychology,
  Assignment,
} from "@mui/icons-material";
import { motion } from "framer-motion";

// Assuming you have these images in your project
import sewedy from "../assets/sewedy.png";
import Footer from "../Components/Footer";

const MotionBox = motion.create(Box);

const testimonials = [
  {
    name: "Anas Magdy",
    year: "Class of 2023",
    text: "El Sewedy IATS opened up amazing opportunities for my career in technology.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Abdelrahman Khaled",
    year: "Class of 2022",
    text: "The practical experience and industry connections helped me secure my dream job.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Ramez Ramzy",
    year: "Class of 2023",
    text: "The supportive environment and modern curriculum exceeded my expectations.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
];

const applicationSteps = [
  "Submit Online Application",
  "Document Verification",
  "Entrance Examination",
  "Personal Interview",
  "Medical Check",
  "Final Acceptance",
];

const faqs = [
  {
    question: "Is the school public or private?",
    answer:
      "The school is a public institution but operates with international standards.",
  },
  {
    question: "Does the school accept international students?",
    answer: "No, the school is only open to Egyptian students.",
  },
  {
    question: "What subjects do students study at the school?",
    answer:
      "Students study a combination of technical subjects (such as programming, database management, and software development) and general education subjects (such as Arabic, English, Mathematics, and physics).",
  },
  {
    question: "Does the school provide job opportunities after graduation?",
    answer:
      "Yes! The school collaborates with leading technology companies to provide students with internships, training programs, and job opportunities upon graduation.",
  },
  {
    question: " Does the school offer extracurricular activities?",
    answer:
      "Yes! The school encourages students to participate in clubs, competitions, and extracurricular activities related to programming, robotics, entrepreneurship, and more.",
  },
  {
    question: "Does the school provide transportation for students?",
    answer:
      "No, the school does not offer transportation services.",
  },
];

const ApplicationPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleFaqChange = (panel) => (event, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ minHeight: "100vh", color: "#ffffff" }}>
      {/* Hero Section with Parallax Effect */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "70vh", md: "80vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          mb: { xs: 8, md: 12 },
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
            filter: "brightness(0.7)",
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
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 2, textAlign: "center" }}
        >
          <Fade in timeout={1000}>
            <Typography
              variant={isMobile ? "h2" : "h1"}
              sx={{
                color: "white",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "4rem" },
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                "& span": {
                  color: "#FF0000",
                  display: "block",
                  fontSize: { xs: "2rem", md: "3rem" },
                  mb: 2,
                },
              }}
            >
              <span>Apply in</span>
              El Sewedy IATS
            </Typography>
          </Fade>
        </Container>
      </Box>

      {/* Program Highlights */}
      {/* <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          sx={{
            mb: 6,
            fontWeight: 700,
            color: "#DA1B1B",
          }}
        >
          Why Choose El Sewedy IATS?
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              icon: <Computer sx={{ fontSize: 40 }} />,
              title: "Modern Technology",
              description: "State-of-the-art labs and tools",
            },
            {
              icon: <Work sx={{ fontSize: 40 }} />,
              title: "Industry Partnership",
              description: "Connections with tech companies",
            },
            {
              icon: <Language sx={{ fontSize: 40 }} />,
              title: "Global Recognition",
              description: "Internationally recognized certification",
            },
            {
              icon: <Psychology sx={{ fontSize: 40 }} />,
              title: "Practical Learning",
              description: "Hands-on experience with projects",
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: "100%",
                  textAlign: "center",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                  border: "1px solid #DA1B1B",
                }}
              >
                <Box sx={{ mb: 2 }}>{item.icon}</Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  color="#1a1a1a"
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" color="#DA1B1B">
                  {item.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container> */}

      {/* Requirements Section */}
      <Box sx={{ py: { xs: 6, md: 15 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={10}>
            {/* Application Requirements */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid #DA1B1B",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Assignment sx={{ color: "#DA1B1B", fontSize: 32, mr: 2 }} />
                  <Typography
                    variant="h5"
                    component="h3"
                    fontWeight="bold"
                    color="#DA1B1B"
                  >
                    Application Requirements
                  </Typography>
                </Box>
                <List>
                  {[
                    {
                      icon: <School />,
                      primary: "Middle School Certificate",
                      secondary: "Current or previous year",
                    },
                    {
                      icon: <Person />,
                      primary: "Age Requirement",
                      secondary: "Not exceeding 18 years by October 1st",
                    },
                    {
                      icon: <Grade />,
                      primary: "Minimum Score",
                      secondary: "220 degrees or higher",
                    },
                    {
                      icon: <Public />,
                      primary: "Open to All",
                      secondary:
                        "Open to participants from all governmental and international entities",
                    },
                  ].map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ color: "#DA1B1B" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography color="#1a1a1a">
                            {item.primary}
                          </Typography>
                        }
                        secondary={
                          <Typography color="#DA1B1B">
                            {item.secondary}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Admission Requirements */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid #DA1B1B",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <CheckCircle sx={{ color: "#DA1B1B", fontSize: 32, mr: 2 }} />
                  <Typography
                    variant="h5"
                    component="h3"
                    fontWeight="bold"
                    color="#DA1B1B"
                  >
                    Admission Process
                  </Typography>
                </Box>
                <List>
                  {[
                    {
                      primary: "Official Application",
                      secondary:
                        "Submit through National Education Foundation website",
                    },
                    {
                      primary: "Assessment Tests",
                      secondary:
                        "Entrance exam, interview, and aptitude assessment",
                    },
                    {
                      primary: "Medical Examination",
                      secondary: "Physical fitness and health screening",
                    },
                  ].map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: "#DA1B1B" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography color="#1a1a1a">
                            {item.primary}
                          </Typography>
                        }
                        secondary={
                          <Typography color="#DA1B1B">
                            {item.secondary}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Application Timeline */}
      {!isMobile && (
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 700, color: "#DA1B1B" }}
          >
            Application Timeline
          </Typography>
          <Stepper activeStep={-1} alternativeLabel>
            {applicationSteps.map((label) => (
              <Step key={label}>
                <StepLabel>
                  <Typography color="#1a1a1a">{label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      )}

      {/* Testimonials */}
      <Box sx={{ bgcolor: "#0A0A0A", py: { xs: 6, md: 10 }, mt: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            sx={{ mb: 6, fontWeight: 700, color: "#ffffff" }}
          >
            Student Reviews
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                    },
                    border: "1px solid #DA1B1B",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={testimonial.avatar}
                        sx={{
                          width: 60,
                          height: 60,
                          mr: 2,
                          border: "2px solid #DA1B1B",
                        }}
                      />
                      <Box>
                        <Typography variant="h6" component="h3" color="#1a1a1a">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="#DA1B1B">
                          {testimonial.year}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" color="#1a1a1a">
                      "{testimonial.text}"
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQs */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          sx={{ mb: 6, fontWeight: 700, color: "#1a1a1a" }}
        >
          Frequently Asked Questions
        </Typography>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expandedFaq === `panel${index}`}
              onChange={handleFaqChange(`panel${index}`)}
              sx={{
                mb: 2,
                borderRadius: "8px !important",
                color: "#ffffff",
                border: "1px solid #DA1B1B",
                "&:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: "#DA1B1B" }} />}
              >
                <Typography variant="h6" component="h3" color="#DA1B1B">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="#1a1a1a">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            fontWeight="bold"
            color="#1a1a1a"
          >
            Ready to Begin Your Journey?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9, color: "#1a1a1a" }}
          >
            Join El Sewedy IATS and become part of the next generation of tech
            innovators
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              color: "#ffffff",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
            }}
            href="https://forms.gle/oWLperGviKxBwpW49"
          >
            Apply Now
          </Button>
        </Container>
      </Box>
      <Stack>
        <Footer />
      </Stack>
    </Box>
  );
};

export default ApplicationPage;
