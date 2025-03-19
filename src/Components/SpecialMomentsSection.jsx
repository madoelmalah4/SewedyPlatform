import React, { useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  ThemeProvider,
  createTheme,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { Calendar, ArrowRight, Trophy, Users, Star } from 'lucide-react';
import sp1 from "../assets/sp1.jpg";
import sp2 from "../assets/sp2.jpg";
// Create custom theme with red, white, and black colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF0000',
      light: '#FF3333',
      dark: '#CC0000',
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

const moments = [
  {
    title: "Special Visit",
    date: "2023",
    image: sp1,
    description: "During her visit to Egypt, U.S. First Lady Dr. Jill Biden toured the Sewedy International Applied Technology and Software School. She explored student projects, admired their skills, and emphasized youth empowerment and U.S.-Egypt partnerships.",
    icon: <Users />,
    category: "Distinguished Guest",
    highlights: ["International Relations", "Student Engagement", "Educational Excellence"],
  },
  {
    title: "El Sewedy ICPC",
    date: "2025",
    image: sp2,
    description: "The launch of the first edition of the Elsewedy CPC Problem-Solving Competition, attended by Coach Mohamed Abdel Wahab, one of the top 50 programmers in the world. This marks a proud moment for our school!",
    icon: <Trophy />,
    category: "Competition",
    highlights: ["Programming Excellence", "Global Recognition", "Student Achievement"],
  },
];

function MotionBox(props) {
  return <Box component={motion.div} {...props} />;
}

function SpecialMomentsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <ThemeProvider theme={theme}>
      <Box
        ref={sectionRef}
        sx={{
          bgcolor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 8, md: 12 },
          minHeight: '100vh',
          backgroundColor:"#1a1a1a"
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `
              radial-gradient(#FF0000 2px, transparent 2px),
              radial-gradient(#000000 2px, transparent 2px)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Section Header */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.7 }}
            sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}
          >
            <Typography
              variant="h2"
              component="h2"
              color="primary"
              sx={{
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textTransform: 'uppercase',
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 4,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                },
              }}
            >
              Special Moments
            </Typography>
            <Typography
              variant="subtitle1"
              color="white"
              sx={{ 
                maxWidth: 600, 
                mx: 'auto', 
                mt: 3,
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.8,

              }}
            >
              Celebrating our achievements and memorable occasions that shape our school's legacy
            </Typography>
          </MotionBox>

          {/* Moments Grid */}
          <Grid container spacing={4}>
            {moments.map((moment, index) => (
              <Grid item xs={12} md={6} key={index}>
                <MotionBox
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card elevation={4}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="300"
                        image={moment.image}
                        alt={moment.title}
                        sx={{
                          objectFit: 'cover',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: 16,
                          right: 16,
                          color: 'white',
                        }}
                      >
                        <Chip
                          icon={moment.icon}
                          label={moment.category}
                          sx={{
                            bgcolor: '#1a1a1a',
                            color: 'white',
                            mb: 2,
                          }}
                        />
                        <Typography variant="h5" gutterBottom>
                          {moment.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar size={16} />
                          <Typography variant="body2">
                            {moment.date}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        paragraph
                        sx={{ 
                          fontSize: '1rem',
                          lineHeight: 1.8,
                          mb: 3 
                        }}
                      >
                        {moment.description}
                      </Typography>
                    
                    </CardContent>
                  </Card>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default SpecialMomentsSection;