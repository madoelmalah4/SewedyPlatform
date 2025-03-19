"use client";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Psychology,
  Lightbulb,
  BusinessCenter,
  Diversity3,
  School,
} from "@mui/icons-material";
import cg from '../assets/cg.jpg'
import emp from '../assets/emp.jpg'
import php from '../assets/php.jpg'
import hub from '../assets/hub.jpg'
// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionTypography = motion(Typography);

const CDCSection = () => {
  const theme = useTheme();

  // Core services data with a bit more detail
  const services = [
    {
      id: "career-counselling",
      title: "Career guidance ",
      titleArabic: "الإرشاد المهني",
      description:
        "Helping students explore career paths and make informed decisions about their professional future. The department provides opportunities for students to understand job market requirements and develop skills.",
      keyPoints: [
        "Career guidance program (3 years)",
        "One-to-one counselling sessions",
      ],
      icon: <Psychology />,
      color: "#FF5757",
      image: cg,
    },
    {
      id: "ihub",
      title: "I-Hub – Innovation Center",
      titleArabic: "مركز الابتكار وريادة الأعمال",
      description:
        "Supporting innovation and entrepreneurship through a stimulating environment where students can develop creative skills and transform ideas into real projects.",
      keyPoints: [
        "Entrepreneurship program (3 years)",
        "Fab Lab with 3D printing & electronics",
        "Local and global competitions",
      ],
      icon: <Lightbulb />,
      color: "#5271FF",
      image: hub,
    },
    {
      id: "employment-training",
      title: "Employment & Training",
      titleArabic: "التوظيف والتدريب",
      description:
        "Preparing students for the job market through training opportunities within companies and employment services that match their skills and specializations.",
      keyPoints: [
        "Job fairs and professional forums",
        "CV writing and interview preparation",
        "Summer training programs",
      ],
      icon: <BusinessCenter />,
      color: "#38B6FF",
      image: emp,
    },
    {
      id: "student-activities",
      title: "Student & Leadership Activities",
      titleArabic: "الأنشطة الطلابية والقيادية",
      description:
        "Developing leadership and personal skills through a variety of activities that combine creativity, sports, and arts, promoting teamwork and cooperation.",
      keyPoints: [
        "Peer Helping Program (PHP)",
        "Extracurricular activities (music, art, drama)",
        "Cultural festivals and competitions",
      ],
      icon: <Diversity3 />,
      color: "#8C52FF",
      image: php,
    },
  ];

  return (
    <Box sx={{ py: 8, background: "#ffffff" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <MotionBox
          sx={{ mb: 6, textAlign: "center" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: "inline-flex", alignItems: "center", mb: 2 }}>
            <School sx={{ fontSize: 36, color: "#FF5757", mr: 1.5 }} />
            <MotionTypography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(90deg, #FF5757 0%, #8C52FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Career Development Center (CDC)
            </MotionTypography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: "#555555",
              maxWidth: "700px",
              mx: "auto",
              mb: 2,
            }}
          >
            Supporting students through specialized programs and practical
            training
          </Typography>
          <Box
            sx={{
              width: "80px",
              height: "3px",
              background: "linear-gradient(90deg, #FF5757, #8C52FF)",
              mx: "auto",
            }}
          />
        </MotionBox>

        {/* Services */}
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} key={service.id}>
              <MotionCard
                elevation={2}
                sx={{
                  height: "100%",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: `1px solid ${alpha(service.color, 0.2)}`,
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  y: -10,
                  boxShadow: `0 15px 30px ${alpha(service.color, 0.2)}`,
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={service.image}
                  alt={service.title}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "8px",
                        background: alpha(service.color, 0.1),
                        color: service.color,
                        mr: 2,
                      }}
                    >
                      {service.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        component="h2"
                        sx={{ fontWeight: 700, lineHeight: 1.2 }}
                      >
                        {service.title}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: service.color, fontWeight: 600 }}
                      >
                        {service.titleArabic}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      color: "#555555",
                      mb: 2,
                      lineHeight: 1.6,
                    }}
                  >
                    {service.description}
                  </Typography>

                  <Divider
                    sx={{ my: 2, borderColor: alpha(service.color, 0.2) }}
                  />

                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                      color: "#333333",
                    }}
                  >
                    Key Programs:
                  </Typography>

                  {service.keyPoints.map((point, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        mb: 0.75,
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: service.color,
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2">{point}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

     
      </Container>
    </Box>
  );
};

export default CDCSection;
