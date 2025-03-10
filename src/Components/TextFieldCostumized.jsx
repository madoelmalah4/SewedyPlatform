import React from "react";
import { TextField } from "@mui/material";
import { styled } from "@mui/system";

const StyledTextField = styled(TextField)({
  backgroundColor: "#f9f9f9", 
  borderRadius: "8px", 
  width: "310px",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#1a1a1a",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#007bff",
      boxShadow: "0 0 5px rgba(0, 123, 255, 0.5)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#1a1a1a", 
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#007bff", 
  },
});

const TextFieldCostumized = ({ label, placeholder, ...props }) => {
  return (
    <StyledTextField
      label={label}
      variant="outlined"
      placeholder={placeholder}
      {...props}
    />
  );
};
export default TextFieldCostumized;
