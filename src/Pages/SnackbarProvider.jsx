import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info"); // Can be "error", "warning", "info", "success"

  const showSnackbar = (message, severity = "info") => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const hideSnackbar = () => {
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000} // Snackbar will auto-close after 6 seconds
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Position of the Snackbar
        TransitionProps={{ direction: "down" }} // Slide down from the top
      >
        <Alert
          onClose={hideSnackbar}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
