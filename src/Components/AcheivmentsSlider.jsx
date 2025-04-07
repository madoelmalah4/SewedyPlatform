"use client";

import React from "react";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Container,
  Chip,
  Divider,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Slide,
} from "@mui/material";
import {
  EmojiEvents,
  School,
  Close,
  Refresh,
  ErrorOutline,
  Star,
  StarBorder,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useLazyGetAchievementsQuery } from "../Slices/AuthSlice/AuthInjection";

// Slide transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AcheivmentsSlider = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [
    fetchAchievements,
    { data: achievements, isFetching, isError, error },
  ] = useLazyGetAchievementsQuery();

  const [isRetrying, setIsRetrying] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Securely sanitize and validate achievement data
  const validateAchievement = (achievement) => {
    return {
      id: achievement.id || crypto.randomUUID(),
      title: achievement.title?.trim() || "Untitled Achievement",
      description:
        achievement.description?.trim() || "No description available.",
      imageUrl: achievement.imageUrl?.startsWith("http")
        ? achievement.imageUrl
        : "https://via.placeholder.com/400",
      date: achievement.createdAt
        ? new Date(achievement.createdAt).toLocaleDateString()
        : null,
    };
  };

  // Fetch achievements securely on mount
  const handleFetchAchievements = useCallback(async () => {
    try {
      await fetchAchievements();
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  }, [fetchAchievements]);

  useEffect(() => {
    handleFetchAchievements();
  }, [handleFetchAchievements]);

  // Retry logic
  const handleRetry = async () => {
    setIsRetrying(true);
    await handleFetchAchievements();
    setIsRetrying(false);
  };

  // Show more achievements
  const handleShowMore = () => {
    setVisibleCount((prev) =>
      achievements?.length > prev + 3 ? prev + 3 : achievements?.length
    );
  };

  // Show less achievements
  const handleShowLess = () => {
    setVisibleCount(3);
    // Scroll back to the top of the section
    document.getElementById("achievements-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Open achievement detail dialog
  const openAchievementDialog = (achievement) => {
    setSelectedAchievement(achievement);
    setDialogOpen(true);
  };

  // Close achievement detail dialog
  const closeAchievementDialog = () => {
    setDialogOpen(false);
  };

  // Rotate featured achievement every 5 seconds
  useEffect(() => {
    if (!achievements || achievements.length <= 1) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % achievements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [achievements]);

  // Get validated achievements
  const validatedAchievements = (achievements || []).map(validateAchievement);

  // Get featured achievement
  const featuredAchievement = validatedAchievements[featuredIndex];

  return (
    <Box
      id="achievements-section"
      sx={{
        bgcolor: "#1a1a1a",
        py: { xs: 6, md: 3 },
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}>
          <Chip
            icon={<School />}
            label="Student Excellence"
            color="primary"
            sx={{
              mb: 2,
              fontWeight: "bold",
              bgcolor: "#DA1B1B",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: "700",
              color: "white",
              textAlign: "center",
              mb: 2,
            }}
          >
            Our Achievements
          </Typography>
          <Divider
            sx={{
              width: "80px",
              mx: "auto",
              borderColor: "#DA1B1B",
              borderWidth: 2,
              mb: 3,
            }}
          />
          <Typography
            variant="subtitle1"
            color="rgba(255,255,255,0.8)"
            sx={{ maxWidth: "700px", mx: "auto" }}
          >
            Celebrating the outstanding accomplishments of our talented students
          </Typography>
        </Box>

        {/* Loading State */}
        {isFetching && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
            <CircularProgress sx={{ color: "#DA1B1B" }} />
          </Box>
        )}

        {/* Error Handling */}
        {isError && !isFetching && (
          <Paper
            elevation={3}
            sx={{
              my: 4,
              p: 3,
              borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,0,0,0.2)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ErrorOutline color="error" fontSize="large" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="error" gutterBottom>
                  Failed to load achievements
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  {error?.message || "Please try again."}
                </Typography>
              </Box>
              <Button
                onClick={handleRetry}
                variant="outlined"
                color="error"
                startIcon={<Refresh />}
                disabled={isRetrying}
              >
                {isRetrying ? "Retrying..." : "Retry"}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Featured Achievement */}
        {!isFetching && !isError && featuredAchievement && (
          <Paper
            elevation={3}
            sx={{
              mb: 6,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              position: "relative",
              cursor: "pointer",
            }}
            onClick={() => openAchievementDialog(featuredAchievement)}
          >
            <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 2 }}>
              <Chip
                icon={<Star />}
                label="Featured Achievement"
                sx={{
                  bgcolor: "rgba(0,0,0,0.7)",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            </Box>

            <Grid container>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    height: { xs: 250, md: 400 },
                    position: "relative",
                  }}
                >
                  <Box
                    component="img"
                    src={featuredAchievement.imageUrl}
                    alt={featuredAchievement.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {featuredAchievement.date && (
                    <Chip
                      label={featuredAchievement.date}
                      size="small"
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                        bgcolor: "rgba(0,0,0,0.7)",
                        color: "white",
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: "white",
                      fontWeight: "600",
                      mb: 2,
                    }}
                  >
                    {featuredAchievement.title}
                  </Typography>
                  <Divider
                    sx={{ mb: 3, borderColor: "rgba(255,255,255,0.1)" }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      lineHeight: 1.8,
                      mb: 3,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {featuredAchievement.description}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Achievement Grid */}
        {!isFetching && !isError && validatedAchievements.length > 0 && (
          <>
            <Grid container spacing={3}>
              {validatedAchievements
                .slice(0, visibleCount)
                .map((achievement, index) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <Card
                      elevation={2}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        cursor: "pointer",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                        },
                      }}
                      onClick={() => openAchievementDialog(achievement)}
                    >
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          image={achievement.imageUrl}
                          alt={achievement.title}
                          sx={{
                            height: 270,
                            objectFit: "cover",
                          }}
                        />
                        {achievement.date && (
                          <Chip
                            label={achievement.date}
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 16,
                              right: 16,
                              bgcolor: "rgba(0,0,0,0.6)",
                              color: "white",
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "white",
                            fontWeight: "600",
                            mb: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {achievement.title}
                        </Typography>
                        <Divider
                          sx={{ mb: 2, borderColor: "rgba(255,255,255,0.1)" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.8)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            lineHeight: 1.6,
                          }}
                        >
                          {achievement.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>

            {/* Show More/Less Button */}
            {validatedAchievements.length > 3 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={
                    visibleCount < validatedAchievements.length
                      ? handleShowMore
                      : handleShowLess
                  }
                  startIcon={
                    visibleCount < validatedAchievements.length ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )
                  }
                  sx={{
                    bgcolor: "#DA1B1B",
                    "&:hover": {
                      bgcolor: "#b01616",
                    },
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  {visibleCount < validatedAchievements.length
                    ? `Show More (${validatedAchievements.length - visibleCount} remaining)`
                    : "Show Less"}
                </Button>
              </Box>
            )}
          </>
        )}

        {/* Empty State */}
        {!isFetching && !isError && validatedAchievements.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <EmojiEvents
              sx={{ fontSize: 60, color: "rgba(255,255,255,0.3)", mb: 2 }}
            />
            <Typography variant="h6" color="white" gutterBottom>
              No achievements yet
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              Student achievements will be displayed here once they are added.
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Achievement Detail Dialog - Simplified */}
      <Dialog
        open={dialogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={closeAchievementDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#000000",
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        {selectedAchievement && (
          <>
            <Box sx={{ position: "relative" }}>
              <Box
                component="img"
                src={selectedAchievement.imageUrl}
                alt={selectedAchievement.title}
                sx={{
                  width: "100%",
                  height: { xs: 200, sm: 300, md: 400 },
                  objectFit: "cover",
                }}
              />
              <IconButton
                onClick={closeAchievementDialog}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(218,27,27,0.8)",
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>

            <DialogContent sx={{ bgcolor: "#000000", p: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  color: "white",
                  fontWeight: "700",
                  mb: 3,
                }}
              >
                {selectedAchievement.title}
              </Typography>

              <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.1)" }} />

              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.8,
                }}
              >
                {selectedAchievement.description}
              </Typography>
            </DialogContent>

            <DialogActions sx={{ bgcolor: "#000000", p: 3 }}>
              <Button
                onClick={closeAchievementDialog}
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AcheivmentsSlider;
