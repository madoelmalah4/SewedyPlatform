// src/components/Admin/AddAdminForm.jsx
"use client";

import React, { useState } from "react";
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
  InputAdornment,
  IconButton,
} from "@mui/material";
// --- Ensure this import matches the corrected slice export ---
import {
  useAddAdminUserMutation,
  useLazyGetUsersQuery,
} from "../Slices/AuthSlice/AuthInjection.js"; // !! Adjust path !!
import { useTheme } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const adminRoles = ["tech admin", "super admin", "grad admin"]; // Example roles

function AddAdminForm() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Mutation Hook for adding a user ---
  const [addAdminUser, { isLoading: isMutationLoading }] =
    useAddAdminUserMutation();

  // --- Lazy Query Hook for fetching users (triggered manually) ---
  // We get the trigger function, and optionally the query state if needed elsewhere
  const [
    triggerGetUsers,
    { isLoading: isLazyLoading, isFetching: isLazyFetching },
  ] = useLazyGetUsersQuery();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.role) newErrors.role = "Role selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Use local submitting state for immediate UI feedback

    if (!validateForm()) {
      setSnackbarMessage("Please fix the errors in the form.");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      password: formData.password,
      role: formData.role,
    };

    try {
      await addAdminUser(payload).unwrap();

      setSnackbarMessage(
        "Admin user added successfully! Refreshing user list..."
      );
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setFormData({ name: "", password: "", role: "" });
      setShowPassword(false);
      setErrors({});

      // --- Trigger the lazy query after successful addition ---
      // This will refetch the user list, updating the cache.
      // Other components using useGetUsersQuery or useLazyGetUsersQuery
      // will potentially see the updated data.
      console.log("Triggering lazy user list fetch after adding admin...");
      triggerGetUsers(); // Call the trigger function
    } catch (error) {
      console.error("Add admin error:", error);
      const errorMessage =
        error?.data?.title ||
        error?.data?.message ||
        error?.message ||
        "Failed to add admin user.";
      let detailedErrors = "";
      if (error?.data?.errors && typeof error.data.errors === "object") {
        detailedErrors = Object.entries(error.data.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
          )
          .join("; ");
      }
      setSnackbarMessage(
        `Error: ${errorMessage}${detailedErrors ? ` (${detailedErrors})` : ""}`
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false); // Reset local submitting state
    }
  };

  // Combine loading states if needed, e.g., disable button if mutation OR lazy fetch is happening
  const isProcessing = isMutationLoading || isSubmitting || isLazyFetching;
  // const isProcessing = isMutationLoading || isSubmitting; // Or just rely on mutation loading

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 4, borderRadius: 2 }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: 600 }}
        >
          Add New Admin/User
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{ textAlign: "center", mb: 3 }}
        >
          Create a new administrative user account.
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                autoComplete="name"
                disabled={isProcessing} // Disable fields during processing
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || "Minimum 6 characters"}
                autoComplete="new-password"
                disabled={isProcessing} // Disable fields during processing
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        disabled={isProcessing} // Disable icon button too
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                required
                fullWidth
                id="role"
                label="Assign Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                error={!!errors.role}
                helperText={errors.role || "Select user's permission level"}
                disabled={isProcessing} // Disable fields during processing
              >
                {adminRoles.map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={isProcessing} // Use combined processing state
                sx={{ minWidth: 150, py: 1.2, px: 3 }}
                startIcon={
                  isProcessing ? ( // Show spinner if mutation or lazy fetch is running
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {/* Adjust button text based on state */}
                {isMutationLoading || isSubmitting
                  ? "Adding User..."
                  : isLazyFetching
                    ? "Refreshing..."
                    : "Add User"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AddAdminForm;
