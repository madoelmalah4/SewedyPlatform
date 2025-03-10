import React from "react";
import { Outlet } from "react-router-dom";
import { theme } from "../Theme";
import MobileNavbar from "../Navbars/MobileNavbar";
import { useMediaQuery } from "@mui/material";
import Navbar from "../Navbars/Navbar";
import Footer from "../Components/Footer";

const NavbarLayOut = () => {

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      {isMobile ? (<MobileNavbar/>) : (<Navbar />)}
      <Outlet />
    </>
  );
};

export default NavbarLayOut;
