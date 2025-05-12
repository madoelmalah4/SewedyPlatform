"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Box,
  Grid,
  Stack,
  Alert,
  IconButton,
  Snackbar,
  Paper,
  Divider,
} from "@mui/material";
import { PhotoCamera, Close, ArrowBack } from "@mui/icons-material";
import {
  useGetAchievementByIdQuery,
  useUpdateAchievementMutation,
} from "../Slices/AuthSlice/AuthInjection";
import { selectUserRole } from "../Slices/AuthSlice/Authslice";
import { useSelector } from "react-redux";

const EditAchievement = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const Role = useSelector(selectUserRole);
  console.log(Role);
  
  // Get achievement data either from location state or fetch it
  const initialAchievement = location.state?.achievement;
  const { data: fetchedAchievement, isLoading: isFetching } =
    useGetAchievementByIdQuery(id, {
      skip: !!initialAchievement,
    });

  const [updateAchievement, { isLoading: isUpdating }] =
    useUpdateAchievementMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Set initial form data when achievement data is available
  useEffect(() => {
    if (initialAchievement) {
      setFormData({
        title: initialAchievement.title || "",
        description: initialAchievement.description || "",
        image: null,
      });

      // Set image preview if available
      if (initialAchievement.imageUrl) {
        setPreview(initialAchievement.imageUrl);
      }
    } else if (fetchedAchievement) {
      setFormData({
        title: fetchedAchievement.title || "",
        description: fetchedAchievement.description || "",
        image: null,
      });

      // Set image preview if available
      if (fetchedAchievement.imageUrl) {
        setPreview(fetchedAchievement.imageUrl);
      }
    }
  }, [initialAchievement, fetchedAchievement]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files[0]) {
      const selectedFile = files[0];

      // Validate file type
      if (!selectedFile.type.match("image.*")) {
        setError("Please select an image file");
        return;
      }

      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);

      setFormData((prev) => ({
        ...prev,
        image: selectedFile,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Clear image
  const handleClearImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    // Don't clear preview if it's the original image and not a new upload
    if (
      !initialAchievement?.imageUrl ||
      preview !== initialAchievement.imageUrl
    ) {
      setPreview(initialAchievement?.imageUrl || null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("id", id || initialAchievement?.id);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);

    // Only append image if a new one is selected
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      await updateAchievement(formDataToSend).unwrap();
      setOpenSnackbar(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error.data?.message || "Error updating achievement. Please try again."
      );
    }
  };

  // Show loading state while fetching achievement data
  if (isFetching) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/")}
        sx={{ mb: 3 }}
      >
        Back to Achievements
      </Button>

      <Card elevation={3}>
        <CardContent>
          <Typography
            variant="h4"
            gutterBottom
            color="primary"
            sx={{ mb: 3, fontWeight: "bold" }}
          >
            Edit Achievement
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Achievement Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  required
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Achievement Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
                  required
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Achievement Image
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{ borderRadius: 1 }}
                  >
                    {preview ? "Change Image" : "Upload Image"}
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      hidden
                    />
                  </Button>

                  {formData.image && (
                    <Typography variant="body2" color="text.secondary">
                      {formData.image.name}
                    </Typography>
                  )}
                </Stack>
              </Grid>

              {preview && (
                <Grid item xs={12}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 1,
                      mt: 2,
                      position: "relative",
                      maxWidth: 400,
                      mx: "auto",
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(255,255,255,0.7)",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.9)",
                        },
                      }}
                      onClick={handleClearImage}
                    >
                      <Close />
                    </IconButton>
                    <Box
                      component="img"
                      src={preview}
                      alt="Achievement preview"
                      sx={{
                        width: "100%",
                        height: "auto",
                        maxHeight: 300,
                        objectFit: "contain",
                        display: "block",
                        borderRadius: 1,
                      }}
                    />
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isUpdating}
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 1,
                      textTransform: "none",
                      fontWeight: "bold",
                    }}
                  >
                    {isUpdating ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Update Achievement"
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => navigate("/")}
                    disabled={isUpdating}
                    sx={{
                      borderRadius: 1,
                      textTransform: "none",
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Achievement updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditAchievement;
