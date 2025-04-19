// src/components/Navbar.jsx
"use client";

import React from "react"; // Removed useState as mobile menu isn't implemented yet
import {
  AppBar,
  Box,
  // Button removed, wasn't used
  Container,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Toolbar, // Added Toolbar
  IconButton, // Added IconButton
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
// Assuming Reveal is for animation, keep it if you use it
import { Reveal } from "../Components/Reveal"; // !! Adjust path if needed !!
import SewedyLogo from "../assets/sewedylogo.png"; // !! Adjust path !!
import { useSelector } from "react-redux";
// --- Import Role Selector ---
import { selectIsAuth, selectUserRole } from "../Slices/AuthSlice/Authslice"; // !! Adjust path !!
import MenuIcon from "@mui/icons-material/Menu"; // Added for mobile placeholder

// --- NavLink Component (Using styling from your example, added active prop) ---
const NavLink = ({ text, to, active, duration }) => {
  // Added active prop
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Reveal duration={duration}>
      {" "}
      {/* Keep Reveal if desired */}
      <Typography
        onClick={() => navigate(to)}
        sx={{
          cursor: "pointer",
          fontWeight: active ? 500 : 300, // Bolder if active to match image example
          fontSize: { xs: "16px", md: "17px" }, // Slightly adjusted size
          color: active ? "#EF3131" : "#1A1A1A", // Red if active, dark otherwise
          position: "relative",
          transition: "color 0.3s ease",
          textWrap: "nowrap",
          py: 1, // Padding for hover/click area
          "&:hover": {
            color: "#EF3131", // Red on hover
          },
          "&::after": {
            content: '""',
            position: "absolute",
            // Show underline only if active, matching the image exactly
            width: active ? "100%" : "0%",
            height: "2px",
            bottom: "-5px", // Position from your original code
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#EF3131", // Red underline
            // Animate underline only on hover IF NOT active (optional)
            transition: active ? "none" : "width 0.3s ease-in-out",
          },
          // Optional: Add underline on hover only if not active
          // "&:hover::after": {
          //   width: "100%",
          // },
        }}
      >
        {text}
      </Typography>
    </Reveal>
  );
};
// --- End NavLink ---

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Use clearer name

  const isAuth = useSelector(selectIsAuth);
  const userRole = useSelector(selectUserRole);

  // Base navigation links from your code
  const baseNavLinks = [
    { text: "Home", to: "/" },
    { text: "Apply Now!", to: "/apply" },
    { text: "Our Services", to: "/Work" },
    { text: "Hiring Coders", to: "/emp" },
    { text: "About Us", to: "/about" },
  ];

  // Determine final links array dynamically
  let finalNavLinks = [...baseNavLinks];
  if (isAuth) {
    let dashboardPath = "/"; // Default fallback
    switch (userRole?.toLowerCase()) {
      case "super admin":
        dashboardPath = "/admin/empdata";
        break; // Or "/admin"
      case "tech admin":
        dashboardPath = "/tech/orders";
        break; // Or "/tech"
      case "grad admin":
        dashboardPath = "/grad/studentsgrad";
        break; // Or "/grad"
      default:
        console.warn("Unhandled role:", userRole);
        dashboardPath = "/";
        break;
    }
    finalNavLinks.push({ text: "Dashboard", to: dashboardPath });
  }

  // Mobile menu state and handler (placeholder)
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const handleDrawerToggle = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <AppBar
      position="fixed"
      elevation={0} // No shadow like image
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #EAEAEA",
        // Remove fixed height, Toolbar defines it
      }}
    >
      <Container maxWidth="xl">
        {/* Toolbar provides structure. Position relative allows absolute child positioning. */}
        <Toolbar
          disableGutters
          sx={{ minHeight: { xs: 70, md: 80 }, position: "relative" }}
        >
          {/* Logo - Aligned Left */}
          <Box
            component="img"
            src={SewedyLogo}
            alt="Sewedy Logo"
            sx={{
              height: { xs: 35, md: 45 },
              width: "auto",
              cursor: "pointer",
              // Position it relative to the start of the Toolbar
              position: "absolute", // Takes it out of flow so middle links can truly center
              left: { xs: theme.spacing(2), md: theme.spacing(3) }, // Adjust left padding as needed
              top: "50%",
              transform: "translateY(-50%)", // Vertically center
            }}
            onClick={() => navigate("/")}
          />

          {/* --- Centered Desktop Navigation Links using Absolute Positioning --- */}
          <Stack
            direction="row"
            spacing={4} // Spacing between links
            sx={{
              display: { xs: "none", md: "flex" }, // Only display on medium screens and up
              position: "absolute", // Position absolutely within the Toolbar
              left: "50%", // Start at the center
              top: "50%", // Start at the center vertically
              transform: "translate(-50%, -50%)", // Shift left and up by half its own size to perfectly center
              alignItems: "center", // Align items vertically if needed
            }}
          >
            {finalNavLinks.map((link, index) => (
              <NavLink
                key={link.text + index} // Better key if text could repeat
                text={link.text}
                to={link.to}
                active={location.pathname === link.to}
                duration={(index + 1) * 0.2} // Keep animation prop if using Reveal
              />
            ))}
          </Stack>
          {/* --- End Centered Links --- */}

          {/* Mobile Menu Icon - Aligned Right */}
          {/* Ensures something is on the right for layout balance if needed, only shown on mobile */}
          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
            {" "}
            {/* Pushes icon to the right */}
            <IconButton
              size="large"
              aria-label="navigation menu"
              // onClick={handleDrawerToggle} // Add handler when implementing drawer
              color="inherit"
              sx={{ color: "#1A1A1A" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
