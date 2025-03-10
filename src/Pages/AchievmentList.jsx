"use client";

import { useEffect, useState } from "react";
import {
  useLazyGetAchievementsQuery,
  useDeleteAchievementMutation,
} from "../Slices/AuthSlice/AuthInjection";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Container,
  Paper,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Divider,
  Alert,
  Snackbar,
  Chip,
  TextField,
  InputAdornment,
  Fade,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  EmojiEvents as TrophyIcon,
  SentimentDissatisfied as EmptyIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AchievementList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [
    getAchievements,
    { data: achievements = [], isLoading, isError, error },
  ] = useLazyGetAchievementsQuery();
  const [deleteAchievement, { isLoading: isDeleting }] =
    useDeleteAchievementMutation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    achievement: null,
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch achievements on component mount
  useEffect(() => {
    getAchievements();
  }, [getAchievements]);

  // Filter achievements based on search term
  const filteredAchievements = achievements.filter(
    (achievement) =>
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open delete confirmation dialog
  const openDeleteDialog = (achievement) => {
    setDeleteDialog({ open: true, achievement });
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, achievement: null });
  };

  // Handle Achievement Deletion
  const handleDelete = async () => {
    if (!deleteDialog.achievement) return;

    try {
      await deleteAchievement({
        title: deleteDialog.achievement.title,
      }).unwrap();
      setNotification({
        open: true,
        message: "Achievement deleted successfully!",
        severity: "success",
      });
      getAchievements();
    } catch (err) {
      console.error("Error deleting achievement:", err);
      setNotification({
        open: true,
        message: err.data?.message || "Failed to delete achievement.",
        severity: "error",
      });
    } finally {
      closeDeleteDialog();
    }
  };

  // Handle edit navigation
  const handleEdit = (achievement) => {
    navigate(`/editachiev/${achievement.title}`);
  };

  // Handle refresh
  const handleRefresh = () => {
    getAchievements();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TrophyIcon sx={{ fontSize: 36, mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              School Achievements
            </Typography>
          </Box>

          <Box>
            <Tooltip title="Refresh achievements">
              <IconButton
                onClick={handleRefresh}
                color="inherit"
                disabled={isLoading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          boxShadow: 3,
          m: 2,
          "&:hover": {
            backgroundColor: "secondary.main",
            boxShadow: 6,
            transform: "scale(1.05)",
            transition: "0.3s",
          },
        }}
        onClick={() => navigate("/addachiev")}
      >
        Add Achievement
      </Button>

      {/* Search and filters */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search achievements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {filteredAchievements?.length} achievement
            {filteredAchievements?.length !== 1 ? "s" : ""} found
          </Typography>

          {searchTerm && (
            <Button
              size="small"
              onClick={() => setSearchTerm("")}
              variant="outlined"
            >
              Clear Search
            </Button>
          )}
        </Box>
      </Paper>

      {/* Error state */}
      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error?.data?.message ||
            "Failed to load achievements. Please try again."}
        </Alert>
      )}

      {/* Loading state */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item key={item} xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Skeleton variant="rectangular" height={200} animation="wave" />
                <CardContent>
                  <Skeleton
                    variant="text"
                    height={32}
                    width="80%"
                    animation="wave"
                  />
                  <Skeleton variant="text" height={20} animation="wave" />
                  <Skeleton
                    variant="text"
                    height={20}
                    width="60%"
                    animation="wave"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredAchievements.length === 0 ? (
        // Empty state
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 2,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <EmptyIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchTerm
              ? "No matching achievements found"
              : "No achievements yet"}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchTerm
              ? "Try adjusting your search terms or clear the search"
              : "Start adding achievements to showcase your school's accomplishments"}
          </Typography>
          {searchTerm && (
            <Button
              variant="outlined"
              onClick={() => setSearchTerm("")}
              startIcon={<SearchIcon />}
            >
              Clear Search
            </Button>
          )}
        </Paper>
      ) : (
        // Achievement cards
        <Grid container spacing={3}>
          {filteredAchievements.map((achievement, index) => (
            <Grid item key={achievement.id || index} xs={12} sm={6} md={4}>
              <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <Box>
                  <AchievementCard
                    achievement={achievement}
                    onDelete={openDeleteDialog}
                    onEdit={handleEdit}
                    isDeleting={isDeleting}
                  />
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the achievement "
            {deleteDialog.achievement?.title}"?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />
            }
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Enhanced Achievement Card Component
const AchievementCard = ({ achievement, onDelete, onEdit, isDeleting }) => {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  // Format date if available
  const formattedDate = achievement.createdAt
    ? new Date(achievement.createdAt).toLocaleDateString()
    : null;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: 2,
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 6,
        },
        position: "relative",
        overflow: "visible",
      }}
    >
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        {imageError ? (
          <Box
            sx={{
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.hover",
            }}
          >
            <TrophyIcon
              sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }}
            />
          </Box>
        ) : (
          <CardMedia
            component="img"
            height="200"
            image={achievement.imageUrl || "/placeholder.jpg"}
            alt={achievement.title}
            onError={() => setImageError(true)}
            sx={{
              objectFit: "cover",
              transition: "transform 0.5s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          />
        )}

        {/* Date chip if available */}
        {formattedDate && (
          <Chip
            label={formattedDate}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(4px)",
              fontWeight: 500,
            }}
          />
        )}
      </Box>

      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{
            textTransform: "capitalize",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.3,
          }}
        >
          {achievement.title}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            flexGrow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {achievement.description}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: "auto",
            gap: 1,
          }}
        >
          <Tooltip title="Edit achievement">
            <IconButton
              color="primary"
              onClick={() => onEdit(achievement)}
              size="medium"
              sx={{
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete achievement">
            <IconButton
              color="error"
              onClick={() => onDelete(achievement)}
              disabled={isDeleting}
              size="medium"
              sx={{
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: theme.palette.error.light,
                  color: theme.palette.error.contrastText,
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AchievementList;
