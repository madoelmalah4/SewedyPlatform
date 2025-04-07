import React from "react";
import {
  Box,
  Typography,
  Grid, // Use Grid for responsive layout
  Card,
  CardContent,
  CardActionArea, // Make the whole card clickable
  Paper,
  Container, // Helps center and constrain width
  useTheme, // Access theme for consistent styling
  alpha, // Utility for color transparency
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School"; // Main dashboard icon
// Choose icons representing progression or levels
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // Junior (e.g., new/bright)
import TrendingUpIcon from "@mui/icons-material/TrendingUp"; // Wheeler (e.g., progressing)
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium"; // Senior (e.g., top level/achievement)

// Grade configurations
const gradesConfig = [
  {
    name: "junior",
    icon: <AutoAwesomeIcon fontSize="large" />,
    color: "#4CAF50", // Green
    hoverColor: "#3d8b40",
    description: "Access forms and data for Junior grade students.",
  },
  {
    name: "wheeler",
    icon: <TrendingUpIcon fontSize="large" />,
    color: "#E6B325", // Amber/Gold
    hoverColor: "#c99a1e",
    description: "Access forms and data for Wheeler grade students.",
  },
  {
    name: "senior",
    icon: <WorkspacePremiumIcon fontSize="large" />,
    color: "#F44336", // Red
    hoverColor: "#d32f2f",
    description: "Access forms and data for Senior grade students.",
  },
];

export default function Btns() {
  const navigate = useNavigate();
  const theme = useTheme(); // Access theme for spacing, palette, etc.

  const handleNavigate = (grade) => {
    navigate(`/students/${grade}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          backgroundColor: "transparent",
        }}
      >
        {" "}
        {/* Optional: Use Paper for subtle background/border */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <SchoolIcon sx={{ fontSize: "3rem", color: "primary.main", mb: 1 }} />
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Students Forms
          </Typography>
        </Box>
        <Grid container spacing={4} justifyContent="center">
          {gradesConfig.map((grade) => (
            <Grid item xs={12} sm={6} md={4} key={grade.name}>
              <Card
                elevation={4} // Subtle shadow
                sx={{
                  textAlign: "center",
                  height: "100%", // Make cards equal height in a row
                  display: "flex",
                  flexDirection: "column",
                  borderTop: `5px solid ${grade.color}`, // Colored top border
                  transition:
                    "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)", // Lift effect
                    boxShadow: theme.shadows[8], // Increase shadow on hover
                  },
                }}
              >
                {/* Make the entire card content area clickable */}
                <CardActionArea
                  onClick={() => handleNavigate(grade.name)}
                  sx={{
                    flexGrow: 1, // Allow CardActionArea to fill card height
                    display: "flex",
                    flexDirection: "column",
                    p: 3, // Padding inside the clickable area
                    // Optional: add a subtle background gradient on hover
                    "&:hover": {
                      backgroundColor: alpha(grade.color, 0.05),
                    },
                  }}
                >
                  <Box sx={{ color: grade.color, mb: 2 }}>
                    {/* Render the icon associated with the grade */}
                    {grade.icon}
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: 0 /* Remove default padding here, use ActionArea's */,
                    }}
                  >
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      sx={{ fontWeight: "medium" }}
                    >
                      {grade.name} Grades
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {grade.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
}
