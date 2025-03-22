import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Reveal } from "../Components/Reveal";
import SewedyLogo from "../assets/sewedylogo.png";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../Slices/AuthSlice/Authslice";

const NavLink = ({ text, to, duration }) => {
  const navigate = useNavigate();

  return (
    <Reveal duration={duration}>
      <Typography
        onClick={() => navigate(to)}
        sx={{
          cursor: "pointer",
          fontWeight: "300",
          fontSize: { xs: "16px", md: "18px" },
          color: "#1A1A1A",
          position: "relative",
          transition: "color 0.3s ease",
          textWrap: "nowrap",
          "&:hover": {
            color: "#EF3131",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "0%",
            height: "2px",
            bottom: "-5px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#EF3131",
            transition: "width 0.3s ease-in-out",
          },
          "&:hover::after": {
            width: "100%",
          },
        }}
      >
        {text}
      </Typography>
    </Reveal>
  );
};

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Get isAuth from Redux store
  const isAuth = useSelector(selectIsAuth);

  const navLinks = [
    { text: "Home", to: "/" },
    { text: "Apply Now!", to: "/apply" },
    { text: "Work with us", to: "/Work" },
    { text: "About Us", to: "/about" },
  ];

  // Add "Dashboard" link if authenticated
  if (isAuth) {
    navLinks.push({ text: "Dashboard", to: "/orders" });
  }

  

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #EAEAEA",
        height: "90px",
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          sx={{
            height: "90px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src={SewedyLogo}
            alt="Sewedy Logo"
            sx={{
              height: "50px",
              width: "auto",
              cursor: "pointer",
              transition: "transform 0.3s ease",
              mb: 2,
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
            onClick={() => navigate("/")}
          />

          {/* Navigation Links - Center */}
          {!isSmallScreen && (
            <Stack
              direction="row"
              spacing={4}
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {navLinks.map((link, index) => (
                <NavLink
                  key={index}
                  text={link.text}
                  to={link.to}
                  duration={(index + 1) * 0.2}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </AppBar>
  );
};

export default Navbar;
