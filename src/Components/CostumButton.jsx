import React from "react";
import { Button, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CustomButton = styled(Button)({
  background: " #DA1B1B ",
  border: 0,
  width: "150px",
  height: "60px",
  borderRadius: "18px",
  color: "white",
  padding: "12px 24px",
  fontSize: "16px",
  fontWeight: "bold",
  textTransform: "none",
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    // background: "linear-gradient(45deg, #DA1B1B 30%, #ff8e53 90%)",
    background: " #DA1B1B ",
    boxShadow: "0 5px 7px 2px rgba(255, 105, 135, 0.4)",
    transform: "translateY(-2px)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
});

const CostumButton = ({ Text, path, Icon, width, height, border }) => {
  const navigate = useNavigate();

  return (
    <CustomButton
      sx={{
        width: width ? width : "150px",
        height: height ? height : "60px",
        borderRadius: border ? border : "18px",
      }}
      variant="contained"
      onClick={() => navigate(path)}
    >
      {Text || "sewedy"} {Icon && <Icon />}
    </CustomButton>
  );
};

export default CostumButton;
