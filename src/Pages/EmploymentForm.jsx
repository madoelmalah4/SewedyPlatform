// src/pages/EmploymentFormPage.jsx
"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Container,
  Paper,
  Fade,
  useMediaQuery,
} from "@mui/material";
import { useAddEmploymentMutation } from "../Slices/AuthSlice/AuthInjection.js";
import sewedy from "../assets/sewedy.png";
import { motion } from "framer-motion";
import { theme } from "../Theme.js";
import Footer from "../components/Footer.jsx";

const MotionBox = motion.create(Box);

const employmentTypes = ["Full-time", "Part-time", "Internship", "Other"];

const specializationOptions = [
  "Software Development",
  "Web Development",
  "Mobile App Development",
  "Data Science & Analytics",
  "Cloud Computing & DevOps",
  "IT Infrastructure & Networking",
  "UI/UX Design",
  "Other",
];

function EmploymentForm() {
  const [formData, setFormData] = useState({
    company_Name: "",
    linkedin: "",
    email_company: "",
    phone_company: "",
    address: "",
    specialization: "", // Initialize as empty string for dropdown
    amount: "",
    name_own: "",
    phone_own: "",
    email_own: "",
    type_of_Employment: "",
  });

  const [addEmployment, { isLoading: isMutationLoading }] =
    useAddEmploymentMutation();

    
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

   const validateForm = () => {
     const newErrors = {};
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
     // Regex for common LinkedIn profile URL patterns
     // Allows for http/https, www optional, /in/, /pub/, /company/ paths, and profile names/company names
     const linkedinRegex =
       /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company)\/[\w-]+\/?$/i;

     if (!formData.company_Name.trim())
       newErrors.company_Name = "Company name is required";
     // Updated LinkedIn Validation
     if (!formData.linkedin.trim()) {
       newErrors.linkedin = "LinkedIn Profile URL is required";
     } else if (!linkedinRegex.test(formData.linkedin.trim())) {
       newErrors.linkedin =
         "Please enter a valid LinkedIn Profile URL (e.g., https://www.linkedin.com/in/yourprofile)";
     }
     // ... rest of the validations
     if (!formData.email_company.trim()) {
       newErrors.email_company = "Company email is required";
     } else if (!emailRegex.test(formData.email_company)) {
       newErrors.email_company = "Please enter a valid company email address";
     }
     if (!formData.phone_company.trim()) {
       newErrors.phone_company = "Company phone is required";
     } else if (!phoneRegex.test(formData.phone_company)) {
       newErrors.phone_company = "Please enter a valid phone number";
     }
     if (!formData.address.trim())
       newErrors.address = "Company address is required";
     if (!formData.specialization)
       newErrors.specialization = "Primary Industry/Specialization is required";
     if (!formData.amount.trim())
       newErrors.amount = "Amount of Hiring Students is required";
     if (!formData.name_own.trim())
       newErrors.name_own = "Your name is required";
     if (!formData.email_own.trim()) {
       newErrors.email_own = "Your email is required";
     } else if (!emailRegex.test(formData.email_own)) {
       newErrors.email_own = "Please enter a valid email address";
     }
     if (!formData.phone_own.trim()) {
       newErrors.phone_own = "Your phone is required";
     } else if (!phoneRegex.test(formData.phone_own)) {
       newErrors.phone_own = "Please enter a valid phone number";
     }
     if (!formData.type_of_Employment)
       newErrors.type_of_Employment = "Employment type is required";

     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setSnackbarMessage("Please fill out all required fields correctly.");
      setSeverity("warning");
      setOpenSnackbar(true);
      setIsSubmitting(false);
      return;
    }

    const formattedData = {
      company_Name: formData.company_Name.trim(),
      linkedin: formData.linkedin.trim(),
      email_company: formData.email_company.trim().toLowerCase(),
      phone_company: formData.phone_company.trim(),
      address: formData.address.trim(),
      specialization: formData.specialization, // Use the selected value
      amount: formData.amount.trim(),
      name_own: formData.name_own.trim(),
      phone_own: formData.phone_own.trim(),
      email_own: formData.email_own.trim().toLowerCase(),
      type_of_Employment: formData.type_of_Employment,
    };

    try {
      await addEmployment(formattedData).unwrap();
      setSnackbarMessage("Information submitted successfully!");
      setSeverity("success");
      setOpenSnackbar(true);
      setFormData({
        company_Name: "",
        linkedin: "",
        email_company: "",
        phone_company: "",
        address: "",
        specialization: "", // Reset specialization
        amount: "",
        name_own: "",
        phone_own: "",
        email_own: "",
        type_of_Employment: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error?.data?.title ||
        error?.data?.message ||
        error?.message ||
        "An error occurred.";
      let detailedErrors = "";
      if (error?.data?.errors) {
        detailedErrors = Object.entries(error.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ");
      }
      setSnackbarMessage(
        `Error: ${errorMessage}${detailedErrors ? ` (${detailedErrors})` : ""}`
      );
      setSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isMutationLoading || isSubmitting;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: { xs: "70vh", md: "80vh" },
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          mb: { xs: 6, md: 10 },
        }}
      >
        <MotionBox
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
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
            filter: "brightness(0.6)",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.8))",
            },
          }}
        />
        <Box
          sx={{ position: "relative", zIndex: 2, textAlign: "center", px: 3 }}
        >
          <Fade in timeout={1000}>
            <Typography
              variant={isMobile ? "h2" : "h1"}
              sx={{
                color: "white",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
                textShadow: "2px 2px 6px rgba(0,0,0,0.4)",
                "& span": {
                  color: "#FF0000",
                  display: "block",
                  fontSize: { xs: "1.8rem", sm: "2.2rem", md: "3rem" },
                  mb: 1,
                },
              }}
            >
              <span>Hiring Coders</span> From El Sewedy IATS
            </Typography>
          </Fade>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, pb: 6 }}>
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Partner with El Sewedy IATS
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: "800px",
              mx: "auto",
              mb: 4,
              color: "text.secondary",
            }}
          >
            Connect with highly skilled, industry-ready graduates. Please fill
            out all fields below to share details about your company and
            potential employment opportunities.
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                  Company Contact Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Your Name"
                  name="name_own"
                  value={formData.name_own}
                  onChange={handleChange}
                  error={!!errors.name_own}
                  helperText={errors.name_own}
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Your Email"
                  name="email_own"
                  type="email"
                  value={formData.email_own}
                  onChange={handleChange}
                  error={!!errors.email_own}
                  helperText={errors.email_own}
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Your Phone"
                  name="phone_own"
                  type="tel"
                  value={formData.phone_own}
                  onChange={handleChange}
                  error={!!errors.phone_own}
                  helperText={errors.phone_own}
                  inputProps={{ maxLength: 25 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                  Company Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Company Name"
                  name="company_Name"
                  value={formData.company_Name}
                  onChange={handleChange}
                  error={!!errors.company_Name}
                  helperText={errors.company_Name}
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Company Email"
                  name="email_company"
                  type="email"
                  value={formData.email_company}
                  onChange={handleChange}
                  error={!!errors.email_company}
                  helperText={errors.email_company}
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Company Phone"
                  name="phone_company"
                  type="tel"
                  value={formData.phone_company}
                  onChange={handleChange}
                  error={!!errors.phone_company}
                  helperText={errors.phone_company}
                  inputProps={{ maxLength: 25 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Company LinkedIn URL"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  error={!!errors.linkedin}
                  helperText={errors.linkedin}
                  inputProps={{ maxLength: 250 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Company Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  inputProps={{ maxLength: 250 }}
                />
              </Grid>
              {/* =============================================== */}
              {/* == Primary Industry/Specialization Dropdown == */}
              {/* =============================================== */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Available specializations"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  error={!!errors.specialization}
                  helperText={errors.specialization || " "} // Add space helper to prevent layout shift on error
                >
                  {/* Add a default placeholder option */}
                  <MenuItem value="" disabled>
                    <em>Select an industry...</em>
                  </MenuItem>
                  {specializationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {/* =============================================== */}
              {/* == End Specialization Dropdown              == */}
              {/* =============================================== */}
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Amount of Hiring Students"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                  Type of Opportunity
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Type of Employment Offered"
                  name="type_of_Employment"
                  value={formData.type_of_Employment}
                  onChange={handleChange}
                  error={!!errors.type_of_Employment}
                  helperText={errors.type_of_Employment || " "} // Add space helper
                >
                  <MenuItem value="" disabled>
                    <em>Select employment type...</em>
                  </MenuItem>
                  {employmentTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isProcessing}
                sx={{
                  minWidth: 150,
                  bgcolor: "#FF0000",
                  color: "white",
                  "&:hover": { bgcolor: "#D50000" },
                  borderRadius: 1,
                  py: 1.2,
                  px: 3,
                }}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {isProcessing ? "Submitting..." : "SUBMIT INFORMATION"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={severity}
          variant="filled"
          sx={{
            width: "100%",
            ...(severity === "success" && {
              bgcolor: "#FF0000",
              color: "white",
              "& .MuiAlert-icon": { color: "white" },
            }),
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
}

export default EmploymentForm;
