import React, { useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Drawer,
  Button,
  Fade,
} from "@mui/material";
import { Menu, Close, ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import SewedyLogo from "../assets/sewedy2.png";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../Slices/AuthSlice/Authslice";

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();


  const isAuth = useSelector(selectIsAuth);



 const navItems = [
   { text: "Home", path: "/" },
   { text: "Apply Now", path: "/apply" },
   { text: "Our Services", path: "/Work" },
   { text: "About", path: "/about" },
   ...(isAuth ? [{ text: "Dashboard", path: "/orders" }] : []),
 ];


  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <Stack
        sx={{
          width: "100%",
          height: "70px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          position: "fixed",
          backgroundColor: "white",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
          padding: "0 16px",
          zIndex: theme.zIndex.appBar,
        }}
      >
        {/* Menu Button */}
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            width: 40,
            height: 40,
            "&:hover": {
              backgroundColor: "rgba(239, 49, 49, 0.04)",
            },
          }}
        >
          <Menu sx={{ fontSize: 28, color: "#EF3131" }} />
        </IconButton>

        {/* Centered Logo */}
        <Box
          component="img"
          src={SewedyLogo}
          alt="Sewedy Logo"
          sx={{
            height: "40px",
            width: "auto",
            position: "absolute",
            left: "45%",
            transform: "translateX(-50%)",
            cursor: "pointer",
            mb: 1,
          }}
          onClick={() => navigate("/")}
        />
      </Stack>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: "280px",
            background: "white",
            pt: 2,
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={() => setIsOpen(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#EF3131",
          }}
        >
          <Close />
        </IconButton>

        {/* Logo in Drawer */}
        <Box
          component="img"
          src={SewedyLogo}
          alt="Sewedy Logo"
          sx={{
            width: "140px",
            height: "auto",
            mx: "auto",
            mt: 2,
            mb: 4,
          }}
        />

        {/* Navigation Items */}
        <Stack spacing={0.5} sx={{ px: 2 }}>
          {navItems.map((item, index) => (
            <Fade
              key={item.text}
              in={isOpen}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <Button
                onClick={() => handleNavigation(item.path)}
                sx={{
                  justifyContent: "flex-start",
                  py: 2,
                  px: 3,
                  borderRadius: 2,
                  color: "text.primary",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    bgcolor: "rgba(239, 49, 49, 0.04)",
                    "&::after": {
                      transform: "translateX(0)",
                    },
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    height: "2px",
                    width: "100%",
                    bgcolor: "#EF3131",
                    transform: "translateX(-100%)",
                    transition: "transform 0.3s ease",
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: "100%" }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400,
                      fontSize: "1rem",
                    }}
                  >
                    {item.text}
                  </Typography>
                  <ChevronRight
                    sx={{
                      color: "#EF3131",
                      opacity: 0.5,
                      transition: "opacity 0.2s ease",
                    }}
                  />
                </Stack>
              </Button>
            </Fade>
          ))}
        </Stack>

        {/* Bottom Content */}
        <Box sx={{ mt: "auto", p: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "center",
              mb: 2,
            }}
          >
            Connect with El Sewedy
          </Typography>
          <Button
            href="mailto:elsewedy.iats@gmail.com"
            fullWidth
            variant="outlined"
            sx={{
              borderColor: "#EF3131",
              color: "#EF3131",
              "&:hover": {
                borderColor: "#D32F2F",
                bgcolor: "rgba(239, 49, 49, 0.04)",
              },
            }}
          >
            Contact Us
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default MobileNavbar;
