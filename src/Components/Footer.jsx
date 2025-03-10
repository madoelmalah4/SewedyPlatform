import React from "react";
import {
  Box,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";

const MotionBox = motion(Box);

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/profile.php?id=100083837165938",
      icon: <Facebook />,
    },
    {
      name: "Instagram",
      url: "",
      icon: <Instagram />,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/el-sewedy-iats/posts/?feedView=all",
      icon: <LinkedIn />,
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1a1a1a",
        color: "white",
        pt: { xs: 8, md: 10 },
        pb: { xs: 6, md: 8 },
        position: "relative",
        overflow: "hidden",
      }}
    >
        <Box sx={{ maxWidth: "100%", mx: "auto", px: { xs: 2, md: 6 } }}>
        {/* Main Content */}
        <Grid container spacing={6}>
          {/* Title Section */}
          <Grid item xs={12}>
            <MotionBox
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}
            >
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                  lineHeight: 1.4,
                  maxWidth: "800px",
                  mx: "auto",
                  "& span": {
                    color: "#FF0000",
                    fontWeight: 800,
                  },
                }}
              >
                <span>El Sewedy</span> International School for Applied
                Technology and Software
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  color: "grey.400",
                  fontSize: { xs: "1rem", md: "1.25rem" },
                }}
              >
                The best choice for your future in technology
              </Typography>
            </MotionBox>
          </Grid>

          {/* Contact Sections */}
          <Grid item xs={12}>
            <Grid
              container
              spacing={4}
              justifyContent="center"
              sx={{
                textAlign: "center",
                "& .MuiGrid-item": {
                  borderRight: {
                    md: "1px solid rgba(255,255,255,0.1)",
                  },
                  "&:last-child": {
                    borderRight: "none",
                  },
                },
              }}
            >
              {/* Social Media Section */}
              <Grid item xs={12} md={4}>
                <Stack spacing={3} alignItems="center">
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                      color: "#FF0000",
                    }}
                  >
                    Connect With Us
                  </Typography>
                  <Stack spacing={2} direction="row" justifyContent="center">
                    {socialLinks.map((social) => (
                      <Link
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            color: "#FF0000",
                            transform: "translateY(-3px)",
                          },
                        }}
                      >
                        <Box sx={{ fontSize: "2rem" }}>{social.icon}</Box>
                      </Link>
                    ))}
                  </Stack>
                </Stack>
              </Grid>

              {/* Location Section */}
              <Grid item xs={12} md={4}>
                <Stack spacing={3} alignItems="center">
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                      color: "#FF0000",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <LocationOn /> Our Location
                  </Typography>
                  <Stack spacing={1}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        color: "grey.300",
                      }}
                    >
                      6th of October, Giza, Egypt
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        color: "grey.300",
                      }}
                    >
                      Egypt (A.R.E)
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>

              {/* Contact Section */}
              <Grid item xs={12} md={4}>
                <Stack spacing={3} alignItems="center">
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                      color: "#FF0000",
                    }}
                  >
                    Contact Us
                  </Typography>
                  <Stack spacing={2}>
                    <Link
                      href="mailto:elsewedy.iats@gmail.com"
                      sx={{
                        color: "grey.300",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        transition: "all 0.3s ease",
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        "&:hover": {
                          color: "#FF0000",
                        },
                      }}
                    >
                      <Email fontSize="small" />
                      elsewedy.iats@gmail.com
                    </Link>
                    <Link
                      href="tel:+201289007669"
                      sx={{
                        color: "grey.300",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        transition: "all 0.3s ease",
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        "&:hover": {
                          color: "#FF0000",
                        },
                      }}
                    >
                      <Phone fontSize="small" />
                      +20 1289007669
                    </Link>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Copyright Section */}
        <Divider sx={{ mt: 8, mb: 4, bgcolor: "rgba(255,255,255,0.1)" }} />
        <Box
          sx={{
            textAlign: "center",
            color: "grey.500",
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} El Sewedy International School. All
            rights reserved.
          </Typography>
        </Box>
      </Box>

      {/* Background Gradient Effect */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(255,0,0,0.05) 0%, rgba(0,0,0,0) 100%)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
};

export default Footer;
