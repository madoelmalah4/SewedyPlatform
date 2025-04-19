// src/components/AdminNavbar.jsx (or wherever you place shared components)
"use client"; // If using Next.js App Router

import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom"; // Use RouterLink
import { useDispatch } from "react-redux";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container, // Added Container
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle, // Use default for avatar icon
  ChevronLeft as ChevronLeftIcon, // For closing drawer
} from "@mui/icons-material";
// Import logout action from your slice
import { logoutLocally } from "../Slices/AuthSlice/Authslice";
// --- Layout Configuration ---
const drawerWidth = 240; // Consistent drawer width

const AdminNavbar = ({ navItems = [], pageTitle = "Admin Area" }) => {
  // Receive navItems and title as props
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for user menu
  const [anchorElUser, setAnchorElUser] = useState(null);
  const userMenuOpen = Boolean(anchorElUser);

  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // --- Handlers ---
  const handleMenuOpen = (event) => setAnchorElUser(event.currentTarget);
  const handleMenuClose = () => setAnchorElUser(null);
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };
  const handleLogout = () => {
    handleMenuClose();
    dispatch(logoutLocally()); // Dispatch logout action
    navigate("/login/admin"); // Redirect to login after logout
  };

  const handelNavigation = ()=>{
    navigate("/"); // Redirect to orders page
  }
  // --- End Handlers ---

  // --- Drawer Content ---
  const drawerContent = (
    <Box
      sx={{ width: drawerWidth }}
      role="presentation"
      onClick={toggleDrawer(false)} // Close drawer on item click
      onKeyDown={toggleDrawer(false)}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Menu
        </Typography>
        <IconButton onClick={toggleDrawer(false)}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {/* Map over the navItems passed as props */}
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              {" "}
              {/* Use RouterLink */}
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                {item.icon || <DashboardIcon />}{" "}
                {/* Use provided icon or default */}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: "auto" }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ color: theme.palette.error.main }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  // --- End Drawer Content ---

  return (
    <>
      <AppBar
        position="sticky" // Sticky might be better for admin panels
        elevation={1}
        sx={{
          backgroundColor: theme.palette.background.paper, // Use paper background
          color: theme.palette.text.primary, // Use primary text color
          borderBottom: `1px solid ${theme.palette.divider}`, // Use theme divider
          zIndex: (theme) => theme.zIndex.drawer + 1, // Keep above drawer
        }}
      >
        <Container maxWidth="xl">
          {" "}
          {/* Use Container for consistent padding */}
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 70 } }}>
            {" "}
            {/* Standard toolbar height */}
            {/* Mobile Menu Toggle */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2, display: { md: "none" } }} // Show only on mobile
            >
              <MenuIcon />
            </IconButton>
            {/* Page Title */}
            <Typography
              variant="h6"
              component="div"
              noWrap // Prevent wrapping
              sx={{ flexGrow: 1, fontWeight: 600 }}
            >
              {pageTitle} {/* Use dynamic title */}
            </Typography>
            {/* Desktop Navigation Buttons */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 1,
                alignItems: "center",
                mr: 2,
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  component={RouterLink} // Use RouterLink
                  to={item.path}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": { bgcolor: theme.palette.action.hover },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
            {/* User Menu */}
            <Box>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  aria-controls={userMenuOpen ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen ? "true" : undefined}
                >
                  {/* Use standard AccountCircle or user image */}
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: theme.palette.secondary.main,
                    }}
                  >
                    <AccountCircle />
                    {/* Or user initials */}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorElUser}
                id="account-menu"
                open={userMenuOpen}
                onClose={handleMenuClose}
                onClick={handleMenuClose} // Close menu on item click
                PaperProps={{
                  elevation: 2,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {/* <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}> Profile </MenuItem> */}
                {/* <Divider /> */}
                <MenuItem onClick={handelNavigation} sx={{ color: "black" }}>
                  <ListItemIcon>
                    {" "}
                    <LogoutIcon fontSize="small" color="black" />{" "}
                  </ListItemIcon>
                  Home
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  <ListItemIcon>
                    {" "}
                    <LogoutIcon fontSize="small" color="error" />{" "}
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: drawerWidth } }}
        sx={{ display: { xs: "block", md: "none" } }} // Only on mobile
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminNavbar;
