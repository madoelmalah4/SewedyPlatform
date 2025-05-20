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
  tableCellClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Search,
  InfoOutlined,
  ErrorOutline,
  WarningAmber,
  Block,
  WrongLocation, // Icon for grade mismatch
} from "@mui/icons-material";
import { useParams } from "react-router-dom"; // Make sure this is installed and router is set up

import { db } from "../firebaseConfig"; // Adjust path if needed
import { doc, getDoc } from "firebase/firestore";

// --- Configuration ---
const COLLECTION_NAME = "gradeData";
const ALLOWED_GRADES = ["Junior", "Wheeler", "Senior"]; // Canonical names

// !!! IMPORTANT: Verify these EXACTLY match the field names in your Firestore documents !!!
const NATIONAL_ID_KEY = "National ID"; // Case-sensitive key for the National ID
const GRADE_LEVEL_KEY = "Grade Level"; // <--- !!! VERIFY THIS KEY NAME !!!

// Metadata keys to exclude when displaying grades in the table
const METADATA_KEYS = new Set([
  NATIONAL_ID_KEY,
  GRADE_LEVEL_KEY, // Also exclude the grade level key itself from the subjects table
  "Name",
  "Student ID", // Add any other variations if necessary
  "ID",
  "id",
]);

// Helper to capitalize first letter
const capitalize = (s) =>
  s && typeof s === "string"
    ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    : "";

// --- Basic Styled Components ---
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.common.black,
    fontWeight: "bold",
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

// --- Component ---
// Renamed for clarity in previous step, keep if you like or revert to StudentsForm
export default function StudentGradeSearchByGradeStrict() {
  const { grade: rawGradeParam } = useParams();

  // --- State ---
  const [currentGrade, setCurrentGrade] = useState(null);
  const [nationalId, setNationalId] = useState("");
  const [studentData, setStudentData] = useState(null); // Found student matching currentGrade
  const [gradeData, setGradeData] = useState([]); // Raw data fetched for currentGrade document
  const [searchLoading, setSearchLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null); // General errors
  const [searchFeedback, setSearchFeedback] = useState(null); // Specific feedback for search results
  const [searched, setSearched] = useState(false);

  // --- Security Warning (Still relevant) ---
  // Consider a backend Cloud Function search for optimal security/performance.
  // --- End Security Warning ---

  // --- Validate URL Parameter ---
  useEffect(() => {
    const gradeParamNormalized = capitalize(rawGradeParam);
    if (ALLOWED_GRADES.includes(gradeParamNormalized)) {
      console.log(
        `URL parameter valid: Setting current grade to ${gradeParamNormalized}`
      );
      setCurrentGrade(gradeParamNormalized);
      setError(null);
      setSearchFeedback(null);
    } else {
      console.warn(`Invalid or missing grade parameter: "${rawGradeParam}"`);
      setCurrentGrade(null);
      setFetchLoading(false); // Stop loading if grade is invalid
      setError(`Invalid grade in URL. Allowed: ${ALLOWED_GRADES.join(", ")}.`);
      setGradeData([]);
      setStudentData(null);
      setSearchFeedback(null);
    }
    // Reset search state when grade changes
    setSearched(false);
    setNationalId("");
    setStudentData(null); // Clear student details if grade changes
  }, [rawGradeParam]);

  // --- Firestore Data Fetching (Single Grade Document) ---
  const fetchGradeData = useCallback(async (gradeToFetch) => {
    if (!gradeToFetch) return;

    console.log(`Fetching data for grade document: ${gradeToFetch}...`);
    setFetchLoading(true);
    setError(null); // Clear general errors on new fetch
    setSearchFeedback(null); // Clear specific search feedback
    setStudentData(null); // Clear previous student
    setSearched(false); // Reset search status
    setGradeData([]); // Clear previous raw grade data

    const docRef = doc(db, COLLECTION_NAME, gradeToFetch);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        // Validate the structure basic check
        if (cloudData && Array.isArray(cloudData.data)) {
          const validData = cloudData.data.filter(
            (row) =>
              row && typeof row === "object" && Object.keys(row).length > 0
          );
          setGradeData(validData); // Store the raw fetched data for searching
          console.log(
            `Fetched ${validData.length} rows from ${gradeToFetch} document.`
          );
        } else {
          console.warn(
            `Invalid or missing 'data' array in Firestore doc for ${gradeToFetch}.`
          );
          setGradeData([]); // Set empty data
          // Set an error state to inform the user about potential data issues
          setError(
            `Data structure issue for ${gradeToFetch}. Check Firestore.`
          );
        }
      } else {
        console.log(`No Firestore document found for ${gradeToFetch}.`);
        setGradeData([]); // Set empty data
        // Set an error state if the document itself is missing
        setError(
          `No data document found for ${gradeToFetch} grade in Firestore.`
        );
      }
    } catch (err) {
      console.error(`Error fetching Firestore data for ${gradeToFetch}:`, err);
      setError(
        `Failed to load data for ${gradeToFetch}. Check connection or permissions.`
      );
      setGradeData([]); // Ensure data is cleared on error
    } finally {
      setFetchLoading(false); // Stop loading indicator
    }
  }, []); // Dependencies: db, COLLECTION_NAME implicitly from constants

  // Fetch data when currentGrade is set and valid
  useEffect(() => {
    if (currentGrade) {
      fetchGradeData(currentGrade);
    }
    // If currentGrade is null (invalid URL), fetchGradeData won't run.
  }, [currentGrade, fetchGradeData]);

  // --- UI and Search Logic ---

  // Helper to get theme color based on grade
  const getGradeLevelColor = useCallback(
    (gradeLevel) => {
      const g = gradeLevel || currentGrade;
      switch (g) {
        case "Junior":
          return "#4CAF50"; // Green
        case "Wheeler":
          return "#E6B325"; // Yellow/Gold
        case "Senior":
          return "#F44336"; // Red
        default:
          return "#9E9E9E"; // Grey
      }
    },
    [currentGrade] // Depends on the current grade context
  );

  // Robust National ID comparison
  const compareNationalIds = (storedIdValue, inputIdTrimmed) => {
    if (
      storedIdValue === null ||
      storedIdValue === undefined ||
      storedIdValue === ""
    )
      return false;
    if (!inputIdTrimmed) return false;
    const storedIdStr = String(storedIdValue).trim();
    if (storedIdStr.length === 0) return false;
    return storedIdStr === inputIdTrimmed;
  };

  // Search handler with STRICT grade validation
  const handleSearch = useCallback(() => {
    const trimmedId = nationalId.trim();
    setSearchLoading(true);
    setError(null); // Clear general errors on new search
    setSearchFeedback(null); // Clear previous search feedback
    setStudentData(null); // Clear previous student data
    setSearched(true); // Mark that search attempt was made

    // --- Validations ---
    if (!currentGrade) {
      // This case should ideally be prevented by disabling the button, but double-check
      setError("Cannot search: No valid grade selected.");
      setSearchLoading(false);
      return;
    }
    if (!trimmedId) {
      setSearchFeedback({
        type: "error",
        message: "Please enter a National ID.",
      });
      setSearchLoading(false);
      return;
    }
    if (fetchLoading) {
      // Prevent search if data is still loading initially
      setSearchFeedback({
        type: "warning",
        message: "Student data is loading, please wait.",
      });
      setSearchLoading(false);
      return;
    }
    // Check if gradeData array is actually empty (e.g., Firestore doc was empty or had bad structure)
    if (gradeData.length === 0 && !fetchLoading) {
      setSearchFeedback({
        type: "info",
        message: `No student data available to search within the ${currentGrade} grade document.`,
      });
      setSearchLoading(false);
      return;
    }
    // --- End Validations ---

    console.log(
      `Searching for National ID: "${trimmedId}" within data fetched for ${currentGrade}...`
    );

    // Simulate slight delay for UX feedback, prevents instant flash
    setTimeout(() => {
      let foundStudentRaw = null;
      let finalStudentData = null;
      let feedback = null;

      try {
        // Step 1: Find student by National ID within the fetched gradeData
        foundStudentRaw = gradeData.find((student) => {
          const studentNatId = student?.[NATIONAL_ID_KEY];
          return compareNationalIds(studentNatId, trimmedId);
        });

        // Step 2: *** CRUCIAL VALIDATION *** Check if found and if grade matches
        if (foundStudentRaw) {
          console.log(`Found student record by ID:`, foundStudentRaw);
          const studentActualGrade = foundStudentRaw[GRADE_LEVEL_KEY];
          // Normalize the grade found in the record for comparison
          const studentActualGradeNormalized = capitalize(studentActualGrade);

          // Compare normalized stored grade with the current page's grade (already normalized)
          if (studentActualGradeNormalized === currentGrade) {
            console.log(
              `Grade match confirmed: ${studentActualGradeNormalized} === ${currentGrade}.`
            );
            // Success! Store the validated student data
            finalStudentData = {
              data: foundStudentRaw,
              foundInGrade: currentGrade,
            };
            // No specific feedback message needed for success, the card will show
          } else {
            // Mismatch found! Provide specific feedback.
            console.warn(
              `Student found by ID, but grade mismatch: Record Grade='${studentActualGrade}' (Normalized: ${studentActualGradeNormalized}), Page Grade='${currentGrade}'.`
            );
            feedback = {
              type: "warning", // Use warning severity
              message: `Student with ID '${trimmedId}' found, but belongs to the '${studentActualGradeNormalized || "Unknown"}' grade, not '${currentGrade}'.`,
            };
            // Do NOT set finalStudentData here - we don't display mismatching students
          }
        } else {
          // Step 3: Handle case where ID was not found at all in the fetched data
          console.log(
            `Student with National ID "${trimmedId}" not found in data fetched for ${currentGrade}.`
          );
          feedback = {
            type: "info", // Use info severity
            message: `No student found with National ID '${trimmedId}' in the ${currentGrade} grade. Please verify the ID.`,
          };
        }
      } catch (searchErr) {
        // Catch unexpected errors during the find/comparison process
        console.error(
          `Error during search within ${currentGrade} data:`,
          searchErr
        );
        feedback = {
          type: "error",
          message: `An error occurred during the search.`,
        };
        finalStudentData = null; // Ensure no stale data is shown
      } finally {
        // Update state based on search outcome
        setStudentData(finalStudentData); // Will be null if not found or mismatch
        setSearchFeedback(feedback); // Set the specific outcome message
        setSearchLoading(false); // Stop search loading indicator
      }
    }, 150); // Small delay
  }, [nationalId, gradeData, currentGrade, fetchLoading]); // Dependencies for the search callback

  // Handle Enter key press in the input field
  const handleKeyPress = useCallback(
    (e) => {
      // Trigger search only if Enter is pressed, not loading, and input has text
      if (
        e.key === "Enter" &&
        !searchLoading &&
        !fetchLoading &&
        nationalId.trim() &&
        currentGrade // Ensure grade is valid too
      ) {
        handleSearch();
      }
    },
    [handleSearch, searchLoading, fetchLoading, nationalId, currentGrade]
  );

  // --- Render Logic ---

  // Component to render feedback messages (loading, errors, search results)
  const renderFeedback = () => {
    // Priority 1: Invalid Grade from URL parameter
    if (!fetchLoading && !currentGrade) {
      return (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          icon={<Block fontSize="inherit" />}
        >
          {error || "No valid grade specified in the URL."}
        </Alert>
      );
    }

    // Priority 2: Initial Data Loading for the selected grade
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
            Loading {currentGrade} student data...
          </Typography>
        </Box>
      );
    }

    // Priority 3: General Fetch/Setup Errors (shown if no search is active/completed)
    // e.g., Firestore connection error, missing document, bad data structure
    if (error && !searchLoading && !searchFeedback) {
      // Show general error only if no specific search feedback exists
      return (
        <Alert
          severity="error" // Usually fetch/setup errors are critical
          sx={{ mb: 2 }}
          variant="outlined"
          icon={<ErrorOutline fontSize="inherit" />}
        >
          {error} {/* Display the specific error message */}
        </Alert>
      );
    }

    // Priority 4: Search in Progress
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
          <Typography color="text.secondary">
            Searching in {currentGrade}...
          </Typography>
        </Box>
      );
    }

    // Priority 5: Specific Search Feedback (after search completes)
    // This includes "not found", "found but wrong grade", "input error"
    if (searched && searchFeedback && !searchLoading) {
      // Determine icon based on feedback type
      let icon = <InfoOutlined fontSize="inherit" />; // Default for info
      if (searchFeedback.type === "error")
        icon = <ErrorOutline fontSize="inherit" />;
      // Use specific icon for the grade mismatch warning
      if (searchFeedback.type === "warning")
        icon = <WrongLocation fontSize="inherit" />;

      return (
        <Alert
          severity={searchFeedback.type} // 'info', 'warning', or 'error'
          sx={{ mb: 2 }}
          variant="outlined"
          icon={icon}
        >
          {searchFeedback.message}
        </Alert>
      );
    }

    // Priority 6: Data loaded successfully, no search yet attempted, or previous search was successful (card shown)
    if (
      !searched &&
      !studentData &&
      !fetchLoading &&
      !error &&
      !searchFeedback &&
      currentGrade
    ) {
      // Show initial prompt only if everything is ready and no search has happened
      return (
        <Typography
          sx={{ textAlign: "center", color: "text.secondary", mt: 4, mb: 2 }}
        >
          Enter a student's National ID to search within the {currentGrade}{" "}
          grade.
        </Typography>
      );
    }

    // If studentData is correctly set (found and validated), the card will render below.
    // No specific message needed here in that case.
    return null;
  };

  // Memoize the filtering of subjects to display in the table
  const subjectsToDisplay = useMemo(() => {
    const details = studentData?.data; // Only use data if studentData is set (meaning valid student found)
    if (!details) return [];
    // Filter out keys defined in METADATA_KEYS (including NATIONAL_ID_KEY and GRADE_LEVEL_KEY)
    return Object.entries(details).filter(([key]) => !METADATA_KEYS.has(key));
  }, [studentData]); // Recalculate only when studentData changes

  // Get the validated student details (will be null if not found or mismatch)
  const foundStudentDetails = studentData?.data;

  // --- JSX Structure ---
  return (
    <Box sx={{ padding: { xs: 2, sm: 3 }, maxWidth: "800px", margin: "auto" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: "center", mb: 3, mt: 2, fontWeight: "medium" }}
      >
        {/* Dynamic Title based on valid grade */}
        {currentGrade ? `${currentGrade} Grade Lookup` : "Student Grade Lookup"}
      </Typography>

      {/* Search Input Area */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          gap: 1.5,
          mb: 3,
          flexWrap: "nowrap", // Prevent wrapping
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <TextField
          id="national-id-input"
          placeholder="Enter Student National ID"
          variant="outlined"
          fullWidth
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          onKeyPress={handleKeyPress}
          // Disable input if fetching initial data, searching, or if the grade context is invalid
          disabled={fetchLoading || searchLoading || !currentGrade}
          aria-label="Student National ID Input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  color={
                    fetchLoading || searchLoading || !currentGrade
                      ? "disabled"
                      : "action"
                  }
                />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "8px",
              // Subtle background, changes when disabled
              backgroundColor:
                fetchLoading || searchLoading || !currentGrade
                  ? "action.disabledBackground"
                  : "rgba(0, 0, 0, 0.04)",
              "& fieldset": { border: "none" }, // Remove default outline
              "& input::placeholder": {
                // Style placeholder text
                fontSize: "0.95rem",
                color: "text.secondary",
                opacity: 0.8,
              },
            },
          }}
        />
        <Tooltip
          title={
            currentGrade
              ? `Search within ${currentGrade} grade`
              : "Select a valid grade in URL to enable search"
          }
          placement="top"
        >
          {/* Wrap button in span for Tooltip to work correctly when disabled */}
          <span>
            <Button
              variant="contained"
              onClick={handleSearch}
              // Disable button if loading, searching, input is empty, or grade is invalid
              disabled={
                fetchLoading ||
                searchLoading ||
                !nationalId.trim() ||
                !currentGrade
              }
              size="large"
              sx={{
                minWidth: "100px",
                px: 2.5,
                backgroundColor: "#1976d2", // Standard blue
                color: "white",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#115293" }, // Darker hover
                // Explicit disabled styles for clarity
                "&.Mui-disabled": {
                  backgroundColor: "action.disabledBackground",
                  color: "action.disabled",
                  cursor: "not-allowed",
                },
              }}
              aria-label={
                currentGrade
                  ? `Search ${currentGrade} for student grades`
                  : "Search disabled"
              }
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
      <Box sx={{ mt: 2, minHeight: "150px" }}>
        {" "}
        {/* Min height prevents layout jumps */}
        {/* Render dynamic feedback messages here */}
        {renderFeedback()}
        {/* Student Data Card - Renders only if studentData is populated (found and validated) */}
        <Fade
          in={
            !fetchLoading &&
            !searchLoading &&
            !!foundStudentDetails &&
            !!currentGrade
          }
          timeout={400}
        >
          {/* Conditional rendering inside Fade prevents rendering empty card */}
          {foundStudentDetails && currentGrade ? (
            <Card
              elevation={3}
              sx={{ borderRadius: 2, overflow: "hidden", mt: 2 }}
            >
              {/* Card Header with Grade Color */}
              <Box
                sx={{
                  p: { xs: 1.5, md: 2 },
                  backgroundColor: getGradeLevelColor(currentGrade), // Color based on the page's grade context
                  color: "primary.contrastText",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ fontWeight: "medium" }}
                >
                  {/* Use found student's name, provide fallback */}
                  {foundStudentDetails.Name ?? "Name Not Available"}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {/* Use constant for National ID key */}
                  National ID: {foundStudentDetails[NATIONAL_ID_KEY] ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                  {/* Display the grade context of the current page */}
                  Grade Level: {currentGrade}
                  {/* Optional: Show original grade from data if different and exists, for debugging */}
                  {/* {foundStudentDetails[GRADE_LEVEL_KEY] && foundStudentDetails[GRADE_LEVEL_KEY] !== currentGrade && ` (Data: ${foundStudentDetails[GRADE_LEVEL_KEY]})`} */}
                </Typography>
              </Box>

              {/* Card Content - Grades Table */}
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                {" "}
                {/* Slightly more padding */}
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "medium" }}
                >
                  Subject Grades
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {subjectsToDisplay.length > 0 ? (
                  // Render table only if there are subjects after filtering metadata
                  <TableContainer
                    component={Paper}
                    elevation={0} // Use Card's elevation
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  >
                    <Table size="small" aria-label="student grades detail">
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Subject</StyledTableCell>
                          <StyledTableCell align="right">Mark</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {/* Map over the filtered subjects */}
                        {subjectsToDisplay.map(([subjectKey, subjectValue]) => (
                          <StyledTableRow key={subjectKey}>
                            <StyledTableCell component="th" scope="row">
                              {subjectKey || "(Unknown Subject)"}{" "}
                              {/* Fallback for empty keys */}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {/* Display value, handle null/undefined gracefully */}
                              {subjectValue ?? "N/A"}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  // Message if student found but no grade columns exist after filtering
                  <Typography
                    sx={{
                      textAlign: "center",
                      color: "text.secondary",
                      mt: 3,
                      mb: 2,
                      fontStyle: "italic",
                    }}
                  >
                    No specific subject grades are available for display for
                    this student.
                  </Typography>
                )}
              </CardContent>
            </Card>
          ) : (
            // Render an empty Box when fading out or if no valid student found/validated
            // This prevents layout jumps during the Fade transition
            <Box />
          )}
        </Fade>
      </Box>
    </Box>
  ); // End of main return Box
} // End of component function
