// src/layouts/SuperAdminProtectedLayout.jsx (Combined component focusing on role)
"use client"; // If using Next.js App Router

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom'; // Still need Outlet
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
} from '@mui/material';

// --- Import Selectors ---
import { selectUserRole } from '../Slices/AuthSlice/Authslice'; // Adjust path - ONLY NEED ROLE SELECTOR

// --- Import Icons ---
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// --- Layout Configuration ---
const drawerWidth = 240;

// Access Denied Message Component (Unchanged)
const AccessDeniedMessage = () => (
    <Container>
        <Box sx={{ textAlign: 'center', mt: 8, p: 4, border: '1px dashed grey', borderRadius: 2 }}>
            <Typography variant="h5" color="error" gutterBottom>Access Denied</Typography>
            <Typography variant="body1" color="text.secondary">You do not have the required 'super admin' role.</Typography>
        </Box>
    </Container>
);


function SuperAdminRouteGuard() {
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
    "Access Restricted: Super Admin role required."
  ); // Static message

  useEffect(() => {
    // Show snackbar if role is not super admin
    if (userRole !== "super admin" && !snackbarOpen) {
      setSnackbarOpen(true);
    }
    // Hide if role becomes super admin (e.g., after some action elsewhere)
    if (userRole === "super admin" && snackbarOpen) {
      setSnackbarOpen(false);
    }
  }, [userRole, snackbarOpen]); // Depend only on role and snackbar state

  // --- Handlers (Unchanged, except logout requires separate auth check/dispatch) ---
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
    // You'll likely need to import `useDispatch` and `logoutSuccess` action
    console.log("Logout Clicked - Implement Dispatch");
    alert("Logout logic needs to be implemented!");
    // Example: const dispatch = useDispatch(); dispatch(logoutSuccess());
  };
  // --- End Handlers ---

  // --- Conditional Rendering Logic (Simplified based on ROLE ONLY) ---

  // 1. If NOT a super admin, show Access Denied message and Snackbar
  if (userRole !== "super admin") {
    return (
      <>
        <AccessDeniedMessage />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={null}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          {/* autoHideDuration set to null or remove it to keep snackbar until closed */}
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

  // 2. If authenticated AND is a super admin, render the full layout with Outlet

  // --- Drawer Content Definition (Unchanged) ---
 
  return (
    
        <Box sx={{ flexGrow: 0.3 }}>
          {/* Child routes will render here if role === 'super admin' */}
          <Outlet />
        </Box>
      
    
  );
}

export default SuperAdminRouteGuard; // Renamed export to match component name