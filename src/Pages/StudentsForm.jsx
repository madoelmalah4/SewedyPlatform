"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Paper,
  InputAdornment,
  Alert,
  Fade,
  Tooltip,
} from "@mui/material";
import { Search, InfoOutlined, ErrorOutline } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useGradesStore } from "../store"; // Still needed IF you want to potentially *update* the store, otherwise remove

// Import Firebase Firestore instance and functions
import { db } from "../firebaseConfig"; // Adjust path if needed
import { doc, getDoc } from "firebase/firestore";

// --- Configuration ---
const COLLECTION_NAME = "gradeData"; // Firestore collection name
const METADATA_KEYS = new Set([
  // Keys to exclude from grades table
  "National ID",
  "Name",
  "Grade Level",
  "Student ID",
  "ID",
  "id",
]);

// Helper to capitalize first letter (e.g., "junior" -> "Junior")
const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1).toLowerCase();

// --- Component ---
export default function StudentsFormFirebase() {
  // Get raw grade param from URL (might be lowercase)
  const { grade: rawGradeParam } = useParams();
  // Capitalize for Firestore lookup and display consistency
  const grade = useMemo(() => capitalize(rawGradeParam), [rawGradeParam]);

  // Zustand store hook (optional, only if needed elsewhere or for potential updates)
  // const { setJuniorGrades, setWheelerGrades, setSeniorGrades } = useGradesStore();

  // --- State ---
  const [nationalId, setNationalId] = useState(""); // Input field value
  const [studentData, setStudentData] = useState(null); // Found student object
  const [searchLoading, setSearchLoading] = useState(false); // Loading state for search operation
  const [fetchLoading, setFetchLoading] = useState(true); // Loading state for fetching data from Firestore
  const [error, setError] = useState(null); // Error messages (fetch or search)
  const [searched, setSearched] = useState(false); // Flag if search attempted
  const [currentGradeData, setCurrentGradeData] = useState([]); // Holds fetched data for the current grade

  // --- Firestore Data Fetching ---
  const fetchDataForGrade = useCallback(
    async (gradeLevel) => {
      if (!gradeLevel) {
        // Don't fetch if grade is invalid/undefined
        setError("Invalid grade level specified in URL.");
        setCurrentGradeData([]);
        setFetchLoading(false);
        return;
      }
      setFetchLoading(true);
      setError(null);
      setStudentData(null); // Clear previous search result
      setSearched(false);
      setCurrentGradeData([]); // Clear previous grade data

      try {
        console.log(`Fetching data for grade: ${gradeLevel}`); // Debug log
        const docRef = doc(db, COLLECTION_NAME, gradeLevel); // Use capitalized grade for Firestore ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (Array.isArray(cloudData?.data)) {
            console.log(`Data fetched successfully for ${gradeLevel}`); // Debug log
            setCurrentGradeData(cloudData.data);
            // Optional: Update Zustand store if needed for other components
            // const storeSetter = gradeLevel === 'Junior' ? setJuniorGrades : gradeLevel === 'Wheeler' ? setWheelerGrades : setSeniorGrades;
            // storeSetter(cloudData.data);
          } else {
            console.warn(
              `Invalid data structure in Firestore document for ${gradeLevel}. Expected 'data' field to be an array.`
            );
            throw new Error(
              `Data format error for ${gradeLevel}. Contact administrator.`
            );
          }
        } else {
          console.log(`No document found for grade: ${gradeLevel}`); // Debug log
          // Don't set error here, handle as "no data found" later if needed
          // Or set a specific info message if preferred:
          // setError(`No data has been uploaded for the ${gradeLevel} grade level yet.`);
          setCurrentGradeData([]); // Ensure data is empty
        }
      } catch (err) {
        console.error(`Error fetching Firestore data for ${gradeLevel}:`, err);
        setError(
          `Failed to load student data for ${gradeLevel}. Check connection or contact support. (${err.message})`
        );
        setCurrentGradeData([]); // Ensure data is empty on error
      } finally {
        setFetchLoading(false);
      }
    },
    [
      /* Optional: add Zustand setters here if using them */
    ]
  ); // Dependencies

  // Effect to fetch data when the capitalized 'grade' changes
  useEffect(() => {
    fetchDataForGrade(grade);
  }, [grade, fetchDataForGrade]); // Rerun fetch when grade changes

  // --- UI and Search Logic ---
  const getGradeLevelColor = useCallback(() => {
    switch (
      grade // Use capitalized grade for color logic too
    ) {
      case "Junior":
        return "#4CAF50";
      case "Wheeler":
        return "#E6B325";
      case "Senior":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  }, [grade]);

  const handleSearch = useCallback(() => {
    const trimmedId = nationalId.trim();

    setSearchLoading(true);
    setError(null); // Clear previous search errors
    setStudentData(null);
    setSearched(true);

    if (!trimmedId) {
      setError("Please enter a National ID.");
      setSearchLoading(false);
      return;
    }

    if (fetchLoading || !Array.isArray(currentGradeData)) {
      setError(
        "Data is still loading or unavailable. Please wait or try refreshing."
      );
      setSearchLoading(false);
      return;
    }

    // Simulate slight delay for UX if needed, or process immediately
    setTimeout(() => {
      try {
        let foundStudent = null;
        if (currentGradeData.length > 0) {
          // Robust search comparing as numbers (handles scientific notation)
          foundStudent = currentGradeData.find((student) => {
            const storedIdValue = student?.["National ID"];
            if (
              storedIdValue === null ||
              storedIdValue === undefined ||
              storedIdValue === ""
            )
              return false;
            try {
              const storedIdNumber = parseFloat(storedIdValue);
              const inputIdNumber = parseFloat(trimmedId);
              return (
                !isNaN(storedIdNumber) &&
                !isNaN(inputIdNumber) &&
                storedIdNumber === inputIdNumber
              );
            } catch {
              return false;
            } // Ignore parsing errors
          });
        }
        setStudentData(foundStudent || null); // Set result or null
      } catch (err) {
        console.error("Search Error (within local data):", err);
        setError(`An unexpected error occurred during the search.`);
        setStudentData(null);
      } finally {
        setSearchLoading(false);
      }
    }, 150); // Short delay
  }, [nationalId, currentGradeData, fetchLoading]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !searchLoading && !fetchLoading) {
        handleSearch();
      }
    },
    [handleSearch, searchLoading, fetchLoading]
  );

  // --- Render Logic ---
  const renderFeedback = () => {
    // Priority 1: Show fetch loading indicator
    if (fetchLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            my: 4,
            gap: 1,
          }}
        >
          <CircularProgress size={24} />
          <Typography color="text.secondary">
            Loading {grade} data...
          </Typography>
        </Box>
      );
    }
    // Priority 2: Show any critical error (fetch or search)
    if (error) {
      return (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          variant="outlined"
          icon={<ErrorOutline fontSize="inherit" />}
        >
          {error}
        </Alert>
      );
    }
    // Priority 3: Show search loading indicator
    if (searchLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            my: 4,
            gap: 1,
          }}
        >
          <CircularProgress size={24} />
          <Typography color="text.secondary">Searching...</Typography>
        </Box>
      );
    }
    // Priority 4: Show "Not Found" message after search attempt
    if (searched && !studentData) {
      return (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          variant="outlined"
          icon={<InfoOutlined fontSize="inherit" />}
        >
          No student found with National ID '{nationalId}' in the {grade} grade
          level data. Please verify the ID.
        </Alert>
      );
    }
    // Priority 5: Show initial prompt if no search done yet
    if (!searched && !studentData) {
      return (
        <Typography
          sx={{ textAlign: "center", color: "text.secondary", mt: 4, mb: 2 }}
        >
          Enter a student's National ID and click Search.
        </Typography>
      );
    }
    // Default: No feedback needed (results will show)
    return null;
  };

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 3, md: 4 },
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: "center", mb: 3, mt: 10 }}
      >
        Student Grades{" "}
        <Typography
          component="span"
          sx={{ color: getGradeLevelColor(), fontWeight: "medium" }}
        >
          ({grade || "Loading..."})
        </Typography>
      </Typography>

      {/* Search Bar Area */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          mb: 4,
          flexWrap: { xs: "wrap", sm: "nowrap" },
          borderRadius: 2,
        }}
      >
        <TextField
          placeholder="Enter Student National ID"
          variant="outlined"
          fullWidth
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={fetchLoading || searchLoading} // Disable if fetching data OR searching
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "8px",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              "& fieldset": { border: "none" },
            },
          }}
        />
        <Tooltip title={`Search within loaded ${grade} data`} placement="top">
          <span>
            {" "}
            {/* Span needed for Tooltip when Button is disabled */}
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={fetchLoading || searchLoading || !nationalId.trim()} // Disable if loading, empty input
              size="large"
              sx={{
                minWidth: "120px",
                backgroundColor: getGradeLevelColor(),
                color: "white",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor:
                    grade === "Junior"
                      ? "#3d8b40"
                      : grade === "Wheeler"
                        ? "#c99a1e"
                        : grade === "Senior"
                          ? "#d32f2f"
                          : "#757575",
                },
                transition: (theme) =>
                  theme.transitions.create(["background-color", "opacity"]),
                "&.Mui-disabled": {
                  backgroundColor: "action.disabledBackground",
                },
              }}
            >
              {searchLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Search"
              )}
            </Button>
          </span>
        </Tooltip>
      </Paper>

      {/* Results / Feedback Area */}
      <Box sx={{ mt: 3, minHeight: "100px" /* Prevent layout jump */ }}>
        {renderFeedback()}

        {/* Student Data Card (Fade in when data is ready and found) */}
        <Fade
          in={!fetchLoading && !searchLoading && !error && !!studentData}
          timeout={400}
        >
          {/* Conditional rendering inside Fade to prevent empty card flashing */}
          {
            studentData ? (
              <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Box
                  sx={{
                    p: { xs: 2, md: 3 },
                    backgroundColor: getGradeLevelColor(),
                    color: "white",
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: "medium", mb: 0.5 }}
                  >
                    {studentData.Name || "N/A"}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    National ID: {studentData["National ID"] ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Grade Level: {studentData["Grade Level"] || grade || "N/A"}
                  </Typography>
                </Box>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Academic Performance
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  >
                    <Table size="small">
                      <TableHead
                        sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}
                      >
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Subject
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", textAlign: "right" }}
                          >
                            Grade
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(studentData)
                          .filter(([key]) => !METADATA_KEYS.has(key))
                          .map(([key, value]) => (
                            <TableRow
                              key={key}
                              hover
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {key}
                              </TableCell>
                              <TableCell sx={{ textAlign: "right" }}>
                                {String(value ?? "N/A")}
                              </TableCell>
                            </TableRow>
                          ))}
                        {Object.entries(studentData).filter(
                          ([key]) => !METADATA_KEYS.has(key)
                        ).length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              sx={{
                                textAlign: "center",
                                fontStyle: "italic",
                                color: "text.secondary",
                                py: 2,
                              }}
                            >
                              No subject grades available.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            ) : (
              <Box />
            ) /* Render empty Box while Fade is 'out' or if studentData is null */
          }
        </Fade>
      </Box>
    </Box>
  );
}
