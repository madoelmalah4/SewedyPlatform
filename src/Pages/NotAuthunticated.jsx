import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect, useLayoutEffect } from "react";
import SewedyLogo from "../assets/sewedy2.png";
import CostumButton from "../Components/CostumButton";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "./SnackbarProvider";

const NotAuthunticated = () => {
  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    showSnackbar("this route isen't available for you", "warning");
    navigate("/");
  }, []);

  return (
    <Stack
      sx={{
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    ></Stack>
  );
};

export default NotAuthunticated;
