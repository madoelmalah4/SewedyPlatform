import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  EmojiEvents as AchievementsIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { logoutLocally } from "../Slices/AuthSlice/Authslice";
import SchoolIcon from "@mui/icons-material/School";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Handle user menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutLocally());
    navigate("/");
    handleMenuClose();
  };

  // Toggle mobile drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Navigation items
  const navItems = [
    { text: "StudentsGrads", icon: <SchoolIcon />, path: "/studentsgrad" },
    { text: "Orders", icon: <OrdersIcon />, path: "/orders" },
    { text: "Achievements", icon: <AchievementsIcon />, path: "/acheivments" },
    { text: "Home", icon: <HomeIcon />, path: "/" },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={3}
      sx={{
        backgroundColor: "black",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left side - Logo and title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <DashboardIcon sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.5,
              display: { xs: "none", sm: "block" },
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>

        {/* Center - Navigation buttons (desktop only) */}
        {!isMobile && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 0.5,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}

        {/* Right side - User menu */}
        <Box>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#DA1B1B" }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* User dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              bgcolor: "#121212",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              "& .MuiMenuItem-root": {
                py: 1,
                px: 2,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "#121212",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Divider sx={{ my: 1, borderColor: "rgba(255, 255, 255, 0.12)" }} />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#f44336" }} />
            </ListItemIcon>
            <Typography color="#f44336">Logout</Typography>
          </MenuItem>
        </Menu>

        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          PaperProps={{
            sx: {
              width: 240,
              bgcolor: "#121212",
              color: "white",
            },
          }}
        >
          <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <DashboardIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" component="div" fontWeight={600}>
              Admin Dashboard
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
          <List>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  toggleDrawer();
                }}
                sx={{
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            <Divider sx={{ my: 1, borderColor: "rgba(255, 255, 255, 0.12)" }} />
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                color: "#f44336",
                "&:hover": {
                  bgcolor: "rgba(244, 67, 54, 0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#f44336", minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
