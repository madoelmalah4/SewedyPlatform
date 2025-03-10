import { useTheme } from "@emotion/react";
import { useMediaQuery } from "@mui/material";

const theme = useTheme();
export const isMobile = useMediaQuery(theme.breakpoints.down("md"));