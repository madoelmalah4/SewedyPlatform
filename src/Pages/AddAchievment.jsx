import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { PhotoCamera, Close } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUserRole } from "../Slices/AuthSlice/Authslice";
import { useLayoutEffect } from "react";

const AddAchievement = () => {
  const userRole = useSelector(selectUserRole);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files[0]) {
      const selectedFile = files[0];

      // Validate file type
      if (!selectedFile.type.match("image.*")) {
        setErrors((prev) => ({
          ...prev,
          image: ["Please select a valid image file."],
        }));
        return;
      }

      // Image preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);

      setFormData((prev) => ({ ...prev, image: selectedFile }));
      setErrors((prev) => ({ ...prev, image: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Clear Image
  const handleClearImage = () => {
    setPreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!formData.title.trim() || !formData.description.trim() || !formData.image) {
      setErrors({
        title: !formData.title.trim() ? ["Title is required."] : null,
        description: !formData.description.trim() ? ["Description is required."] : null,
        image: !formData.image ? ["Image is required."] : null,
      });
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("image", formData.image);


    try {
      const response = await fetch("https://sewedy-platform1.runasp.net/api/Achivments/add", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        } else {
          throw new Error("Unknown error occurred");
        }
      } else {
        setOpenSnackbar(true);
        if(userRole === "super admin") {
          setTimeout(() => navigate("/admin/acheivments"), 1500);
        }else if(userRole === "grad admin") {
            setTimeout(() => navigate("/grad/acheivments"), 1500);
        }else
        {
          navigate("/")
        }
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setErrors({ general: ["Failed to add achievement. Try again later."] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (userRole === "super admin") {
      navigate("/admin/acheivments");
    } else if (userRole === "grad admin") {
      navigate("/grad/acheivments");
    } else {
      navigate("/");
    }
  };


  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography
            variant="h4"
            gutterBottom
            color="primary"
            sx={{ mb: 3, fontWeight: "bold" }}
          >
            Add Achievement
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {errors.general && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.general}
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
                  error={!!errors.title}
                  helperText={errors.title ? errors.title[0] : ""}
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
                  error={!!errors.description}
                  helperText={errors.description ? errors.description[0] : ""}
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
                  >
                    Upload Image
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      hidden
                    />
                  </Button>

                  {preview && (
                    <Typography variant="body2" color="text.secondary">
                      Image Uploaded
                    </Typography>
                  )}
                </Stack>
                {errors.image && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.image[0]}
                  </Alert>
                )}
              </Grid>

              {preview && (
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ mt: 2, position: "relative" }}>
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(255,255,255,0.7)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                      }}
                      onClick={handleClearImage}
                    >
                      <Close />
                    </IconButton>
                    <Box
                      component="img"
                      src={preview}
                      alt="Achievement preview"
                      sx={{ width: "100%", maxHeight: 300 }}
                    />
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Save Achievement"
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </Stack>
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
          Achievement added successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddAchievement;
