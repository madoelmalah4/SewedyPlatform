// src/Pages/Login.jsx
"use client"; // If using Next.js App Router

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLoginMutation } from "../Slices/AuthSlice/AuthInjection"; // Adjust path
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "./SnackbarProvider"; // !! ADJUST PATH !!
import sewedylogo from "../assets/sewedylogo.png"; // Adjust path
import { useDispatch } from "react-redux";
import { setCredentials } from "../Slices/AuthSlice/Authslice"; // Adjust path

const Login = () => {
  const [formValues, setFormValues] = useState({ name: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();

  const validate = () => {
    const newErrors = {};
    if (!formValues.name.trim()) {
      newErrors.name = "Username is required.";
    }
    if (!formValues.password) {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // --- CORRECTED handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await login({ ...formValues }).unwrap();

      // --- Check Response based on your JSON example ---
      if (res?.massege === "Valid" && res?.token && res?.role) {
        // --- Dispatch Correct Credentials ---
        dispatch(
          setCredentials({
            role: res.role,
            isAuth: true, // Set isAuth to tru
          })
        );

        showSnackbar("Login successful! Redirecting...", "success");

        // --- Role-Based Navigation ---
        let redirectPath = "/"; // Default fallback

        switch (
          res?.role.toLowerCase() // Use lowercase for robustness
        ) {
          case "super admin":
            redirectPath = "/admin/empdata"; // Example Super Admin landing page
            break;
          case "tech admin":
            redirectPath = "/tech/orders"; // Example Tech Admin landing page
            break;
          case "grad admin":
            redirectPath = "/grad/studentsgrad"; // Example Grad Admin landing page
            break;
          default:
            redirectPath = "/"; // Fallback to home or a generic dashboard
            break;
        }
        navigate(redirectPath, { replace: true }); // Navigate after successful login and dispatch
      } else {
        // Handle unsuccessful login attempts (e.g., invalid credentials message from API)
        showSnackbar(res?.massege || "Invalid username or password.", "error");
      }
    } catch (error) {
      // Handle network errors or unexpected errors from the login mutation
      console.error("Login API Error:", error);
      const message =
        error?.data?.title ||
        error?.data?.message ||
        "Login failed. Please try again later.";
      showSnackbar(message, "error");
    }
  };
  // --- End CORRECTED handleSubmit ---

  // --- JSX Structure (No Changes) ---
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.mode === "dark" ? "#121212" : "#f4f4f9",
        p: 2,
      }}
    >
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: "background.paper",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={sewedylogo}
            alt="Sewedy Logo"
            style={{ width: 150, marginBottom: theme.spacing(4) }}
          />
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}
          >
            Admin Login
          </Typography>
          <TextField
            label="Username"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formValues.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            required
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {" "}
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {" "}
                    {showPassword ? <VisibilityOff /> : <Visibility />}{" "}
                  </IconButton>{" "}
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ py: 1.5, fontWeight: "bold" }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;
