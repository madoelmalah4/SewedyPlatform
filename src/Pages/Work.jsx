import React from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Fade,
  Zoom,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useSnackbar } from "./SnackbarProvider";
import Footer from "../Components/Footer";
import sewedy from "../assets/sewedy.png";
import {
  Send,
  Business,
  Description,
  Email,
  Phone,
  Person,
} from "@mui/icons-material";
import { useFormSubmitMutation } from "../Slices/AuthSlice/AuthInjection";
import { useNavigate } from "react-router-dom";

const MotionBox = motion(Box);

const ProjectForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showSnackbar } = useSnackbar();
  const [formSub , {isLoading , isError}] =  useFormSubmitMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  const navigate = useNavigate();



  const onSubmit = async (data) => {
    console.log(data);
    
    try
    {
    const res = await formSub(data).unwrap();
    if (res?.bool == true)
    {
      showSnackbar("Form submitted successfully", "success");
      navigate(-1);
    }else
    {
     showSnackbar("Failed", "error");
    }
  }catch(c){
     showSnackbar("invalid credentials", "error");
  }
  
};


  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };


 

  if (isError) {
    return (
      <Typography variant="h6" color="error" align="center" mt={4}>
        Error loading orders. Please try again.
      </Typography>
    );
  }


  return (
    <Box sx={{ overflow: "hidden" }}>
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
              <span>Work with</span>
              El Sewedy IATS Students
            </Typography>
          </Fade>
        </Container>
      </Box>

      {/* Introduction Section */}
      <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 12 } }}>
        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: "center" }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "#DA1B1B",
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "2.5rem" },
              mb: 3,
            }}
          >
            Looking for help with your project?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              maxWidth: "800px",
              mx: "auto",
              mb: 6,
              color: "#1a1a1a",
              lineHeight: 1.8,
              fontSize: { xs: "1.1rem", md: "1.25rem" },
            }}
          >
            <strong>El Sewedy School</strong> offers you the opportunity to
            collaborate with our students on various projects. Whether you need{" "}
            <Box
              component="span"
              sx={{
                color: "#DA1B1B",
                fontWeight: 500,
              }}
            >
              software development, web development, mobile app development,
              artificial intelligence, UI/UX design, or any other IT-related
              field
            </Box>
            , we're here to help.
          </Typography>
        </MotionBox>
      </Container>

      {/* Form Section */}
      <Container maxWidth="md" sx={{ mb: { xs: 8, md: 12 } }}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          elevation={3}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 4,
              color: "#1a1a1a",
              fontWeight: 700,
              fontSize: { xs: "1.75rem", md: "2.25rem" },
            }}
          >
            Project Request Form
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  InputProps={{
                    startAdornment: (
                      <Business sx={{ mr: 1, color: "#1a1a1a" }} />
                    ),
                  }}
                  {...register("company_name", {
                    required: "Company name is required",
                  })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: "#1a1a1a" }} />,
                  }}
                  {...register("f_name", {
                    required: "First name is required",
                  })}
                  error={!!errors.f_name}
                  helperText={errors.f_name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: "#1a1a1a" }} />,
                  }}
                  {...register("l_name", { required: "Last name is required" })}
                  error={!!errors.l_name}
                  helperText={errors.l_name?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address *"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: "#1a1a1a" }} />,
                  }}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number *"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: "#1a1a1a" }} />,
                  }}
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Information *"
                  multiline
                  rows={4}
                  InputProps={{
                    startAdornment: (
                      <Description sx={{ mr: 1, mt: 1, color: "#1a1a1a" }} />
                    ),
                  }}
                  {...register("project_information", {
                    required: "Project information is required",
                  })}
                  error={!!errors.project_information}
                  helperText={errors.project_information?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Message"
                  multiline
                  rows={3}
                  {...register("massege")}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    mb: 3,
                    color: "#1a1a1a",
                    fontSize: "0.9rem",
                  }}
                >
                  * Once you submit your request, our program manager will
                  review it and contact you shortly.
                </Typography>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  endIcon={<Send />}
                  disabled={isLoading}
                  sx={{
                    bgcolor: "#DA1B1B",
                    py: 1.5,
                    fontSize: "1.1rem",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "#CC0000",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {isLoading ? <CircularProgress /> : "Submit Request"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default ProjectForm;
