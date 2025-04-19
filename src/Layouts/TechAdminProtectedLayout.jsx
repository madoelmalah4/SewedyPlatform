// src/layouts/TechAdminProtectedLayout.jsx (New component)
"use client"; // If using Next.js App Router

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom"; // Still need Outlet and Navigate
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Container,
  // CircularProgress removed as loading check is removed
} from "@mui/material";

// --- Import Selectors ---
import { selectUserRole } from "../Slices/AuthSlice/Authslice"; // Adjust path - ONLY NEED ROLE SELECTOR

// --- Import Icons ---
// Import icons relevant to the Tech Admin role
import MenuIcon from "@mui/icons-material/Menu";
import BuildIcon from "@mui/icons-material/Build"; // Example: Tools/Configuration
import StorageIcon from "@mui/icons-material/Storage"; // Example: Data/Servers
import BugReportIcon from "@mui/icons-material/BugReport"; // Example: Logs/Debugging
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

// --- Layout Configuration ---
const drawerWidth = 240;

// Access Denied Message Component - Modified message
const AccessDeniedMessage = () => (
  <Container>
    <Box
      sx={{
        textAlign: "center",
        mt: 8,
        p: 4,
        border: "1px dashed grey",
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" color="error" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary">
        You do not have the required 'Tech Admin' role.
      </Typography>
    </Box>
  </Container>
);

function TechAdminProtectedLayout() {
  // Renamed component
  // --- Role Check Only ---
  const userRole = useSelector(selectUserRole); // Get the role directly

  // --- Layout State ---
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);

  // --- Snackbar State ---
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(
    "Access Restricted: Tech Admin role required."
  ); // Updated static message

  useEffect(() => {
    // Show snackbar if role is not tech admin
    // Make sure the role string matches exactly what's in your Redux state
    if (userRole !== "tech admin" && !snackbarOpen) {
      setSnackbarOpen(true);
    }
    // Hide if role becomes tech admin
    if (userRole === "tech admin" && snackbarOpen) {
      setSnackbarOpen(false);
    }
  }, [userRole, snackbarOpen]);

  // --- Handlers (Unchanged) ---
  const handleDrawerToggle = () => {
    if (!isClosing) setMobileOpen(!mobileOpen);
  };
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };
  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };
  const handleLogout = () => {
    handleCloseUserMenu();
    // !!! Add your actual logout dispatch/logic here !!!
    console.log("Logout Clicked - Implement Dispatch");
    alert("Logout logic needs to be implemented!");
    // Example: const dispatch = useDispatch(); dispatch(logoutSuccess());
  };
  // --- End Handlers ---

  // --- Conditional Rendering Logic (Modified role check) ---

  // 1. If NOT a tech admin, show Access Denied message and Snackbar
  // Ensure the role string 'tech admin' exactly matches what's stored in Redux
  if (userRole !== "tech admin") {
    return (
      <>
        <AccessDeniedMessage />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={null}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // 2. If is a tech admin, render the full layout with Outlet

  // --- Drawer Content Definition (CUSTOMIZE FOR TECH ADMIN) ---

  // --- End Drawer Content ---

  return (
    <Box sx={{ flexGrow: 0.3 }}>
             {/* Child routes will render here if role === 'super admin' */}
             <Outlet />
     </Box>
  );
}

export default TechAdminProtectedLayout; // Renamed export
