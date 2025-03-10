import {  Stack } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "./SnackbarProvider";

const NoMatchRoute = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    showSnackbar("No Match Routes", "warning");
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

export default NoMatchRoute;
