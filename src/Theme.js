import { createTheme } from "@mui/material";

const colors = {
    lion: {
        100: "#FFFFFF",
        200: "#DEC8B7",
        300: "#CEAD93",
        400: "#C69F81",
        500: "#6e6a51",
        600: "#A67F62",
        700: "#484733",
        800: "#5F4938",
        900: "#000000",
    },
    green: {
        100: "#7A887C",
        200: "#606C62",
        300: "#1E5A3E",
        400: "#4D574F",
        500: "#5F8B67",
        600: "#3E463F",
        700: "#042F20",
        800: "#232824",
        900: "#000000",
    },
    black: {
        100: "#FFFFFF",
        200: "#8A8D91",
        300: "#50545A",
        400: "#33373E",
        500: "#061E1E",
        600: "#10141A",
        700: "#0B0D11",
        800: "#060709",
        900: "#000000",
    },
};

export const theme = createTheme({
    palette: {
        common: {
            black: "#000",
            white: "#fff",
        },
        primary: {
            dark: colors.green[700],
            main: "#DA1B1B",
            light: colors.green[300],
            200: colors.green[200],
            contrastText: "#fff",
        },
        secondary: {
            dark: colors.black[700],
            main: colors.black[500],
            light: colors.black[300],
            200: colors.black[200],
            contrastText: "#fff",
        },
        background: {
            default: "#EFEFEF",
            paper: `#F8F8F8`,
        },
        text: {
            primary: colors.black[500],
            secondary: colors.green[500],
            disabled: "#6B6A65",
        },
        divider: "#EFEFEF",
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 400,
            md: 834,
            lg: 1280,
            xl: 1536,
        },
    },
    typography: {
        fontFamily: ["Inter"].join(","),
        h1: {
            fontSize: 49,
            fontWeight: "bold",
        },
        h2: {
            fontSize: 36,
            fontWeight: "bold",
        },
        h3: {
            fontSize: 25,
            fontWeight: 500,
        },
        h4: {
            fontSize: 20,
            fontWeight: "bold",
        },
        h5: {
            fontSize: 16,
            fontWeight: 600,
        },
        h6: {
            fontSize: 16,
        },
        body1: {
            fontSize: 14,
        },
        body2: {
            fontSize: 12,
        },
        subtitle1: {
            fontSize: 18,
            fontWeight: 700,
        },
        subtitle2: {
            fontSize: 22,
            fontWeight: "bold",
        },
    },
});

theme.typography.h1 = {
    ...theme.typography.h1,
    [theme.breakpoints.down("md")]: {
        fontSize: 36,
    },
    [theme.breakpoints.down("sm")]: {
        fontSize: 25,
    },
};

theme.typography.h2 = {
    ...theme.typography.h2,
    [theme.breakpoints.down("md")]: {
        fontSize: 32,
    },
    [theme.breakpoints.down("sm")]: {
        fontSize: 22,
    },
};

theme.typography.h3 = {
    ...theme.typography.h3,
    [theme.breakpoints.down("sm")]: {
        fontSize: 15,
    },
};

theme.typography.body1 = {
    ...theme.typography.body1,
    [theme.breakpoints.down("md")]: {
        fontSize: 12,
    },
};

theme.typography.body2 = {
    ...theme.typography.body2,
    [theme.breakpoints.down("md")]: {
        fontSize: 10,
    },
};
