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
  tableCellClasses, // Keep for potential basic styling
} from "@mui/material";
import { styled } from "@mui/material/styles"; // Keep for basic styling if needed
import {
  Search,
  InfoOutlined,
  ErrorOutline,
  // Person, // Removed as not used
  WarningAmber,
} from "@mui/icons-material";
// import { useParams } from "react-router-dom"; // Removed if not directly using URL params here

import { db } from "../firebaseConfig"; // Adjust path if needed
import { doc, getDoc } from "firebase/firestore";

// --- Configuration ---
const COLLECTION_NAME = "gradeData";
const GRADES_TO_FETCH = ["Junior", "Wheeler", "Senior"]; // Define grades to search across

// !!! IMPORTANT: Verify this EXACTLY matches the field name in your Firestore documents !!!
const NATIONAL_ID_KEY = "National ID"; // Case-sensitive key for the National ID

// Metadata keys to exclude when displaying grades in the table
const METADATA_KEYS = new Set([
  NATIONAL_ID_KEY, // Use the constant
  "Name",
  "Grade Level",
  "Student ID", // Add any other ID variations if they exist
  "ID",
  "id", // Internal ID used by DataGrid often
]);

// Helper to capitalize first letter (if needed elsewhere, otherwise could be removed)
// const capitalize = (s) =>
//   s && typeof s === "string"
//     ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
//     : "";

// --- Basic Styled Components --- (Optional, useful for table consistency)
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[200], // Lighter header
    color: theme.palette.common.black,
    fontWeight: "bold",
    borderBottom: `2px solid ${theme.palette.divider}`, // Stronger header border
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderBottom: `1px solid ${theme.palette.divider}`, // Ensure body rows have borders
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover, // Subtle alternating row color
  },
  "&:last-child td, &:last-child th": {
    border: 0, // Remove border for the last row
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected, // Highlight on hover
  },
}));

// --- Component ---
export default function StudentsForm() {
  // const { grade: rawGradeParam } = useParams(); // Keep if using URL param context
  // const initialGradeContext = useMemo(
  //   () => capitalize(rawGradeParam),
  //   [rawGradeParam]
  // );

  // --- State ---
  const [nationalId, setNationalId] = useState("");
  const [studentData, setStudentData] = useState(null); // Stores { data: {...studentDetails}, foundInGrade: 'GradeName' }
  const [searchLoading, setSearchLoading] = useState(false); // Loading state for search button click
  const [fetchLoading, setFetchLoading] = useState(true); // Loading state for initial data fetch
  const [error, setError] = useState(null); // Stores error messages
  const [searched, setSearched] = useState(false); // Flag to know if a search has been attempted
  const [allGradesData, setAllGradesData] = useState(
    GRADES_TO_FETCH.reduce((acc, grade) => ({ ...acc, [grade]: [] }), {}) // Initialize with empty arrays per grade
  );

  // --- Security Warning ---
  // THIS COMPONENT FETCHES ALL STUDENT DATA FOR SPECIFIED GRADES TO THE CLIENT.
  // THIS IS A SECURITY RISK IN PRODUCTION.
  // MOVE SEARCH LOGIC TO A BACKEND FUNCTION (e.g., Firebase Cloud Function)
  // TO AVOID EXPOSING ALL DATA. THE FUNCTION SHOULD ONLY RETURN THE MATCHING STUDENT.
  // --- End Security Warning ---

  // --- Firestore Data Fetching (All Grades) ---
  const fetchAllGradesData = useCallback(async () => {
    console.log("Starting data fetch...");
    setFetchLoading(true);
    setError(null);
    setStudentData(null); // Clear previous student data
    setSearched(false); // Reset search status
    const fetchedData = {};
    let encounteredError = null;

    console.log(`Fetching data for grades: ${GRADES_TO_FETCH.join(", ")}`);

    const fetchPromises = GRADES_TO_FETCH.map(async (gradeLevel) => {
      const docRef = doc(db, COLLECTION_NAME, gradeLevel);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          // Basic validation: Check if data exists and is an array
          if (cloudData && Array.isArray(cloudData.data)) {
            // Filter out potentially empty/invalid rows before storing
            fetchedData[gradeLevel] = cloudData.data.filter(
              (row) =>
                row && typeof row === "object" && Object.keys(row).length > 0
            );
            console.log(
              `Fetched ${fetchedData[gradeLevel].length} valid rows for ${gradeLevel}`
            );
          } else {
            console.warn(
              `Invalid or missing 'data' array in Firestore document for ${gradeLevel}. Setting empty.`
            );
            fetchedData[gradeLevel] = [];
          }
        } else {
          console.log(`No Firestore document found for ${gradeLevel}.`);
          fetchedData[gradeLevel] = [];
        }
      } catch (err) {
        console.error(`Error fetching Firestore data for ${gradeLevel}:`, err);
        encounteredError = `Failed to load data for ${gradeLevel}.`; // Store first error encountered
        fetchedData[gradeLevel] = []; // Ensure grade has an empty array on error
      }
    });

    try {
      await Promise.all(fetchPromises);
      setAllGradesData(fetchedData);
      if (encounteredError) {
        setError(encounteredError + " Some data may be unavailable."); // Inform user about partial data
      }
      console.log("Data fetching completed.");
    } catch (err) {
      // This catch is mainly for errors within Promise.all itself, less likely here
      console.error("Unexpected error processing fetch results:", err);
      setError("An critical error occurred while fetching data.");
      // Ensure state is clean on major failure
      setAllGradesData(
        GRADES_TO_FETCH.reduce((acc, grade) => ({ ...acc, [grade]: [] }), {})
      );
    } finally {
      setFetchLoading(false); // Stop loading indicator regardless of outcome
    }
  }, []); // No dependencies needed as it uses constants

  // Fetch data on component mount
  useEffect(() => {
    fetchAllGradesData();
  }, [fetchAllGradesData]);

  // --- UI and Search Logic ---

  // Helper to get theme color based on grade
  const getGradeLevelColor = useCallback(
    (gradeLevel) => {
      const g = gradeLevel || studentData?.foundInGrade; // Use found grade or context
      switch (g) {
        case "Junior":
          return "#4CAF50"; // Green
        case "Wheeler":
          return "#E6B325"; // Yellow/Gold
        case "Senior":
          return "#F44336"; // Red
        default:
          return "#9E9E9E"; // Grey (Default/Unknown)
      }
    },
    [studentData] // Depends on the found student data
  );

  // *** Robust, String-Based National ID Comparison Function ***
  const compareNationalIds = (storedIdValue, inputIdTrimmed) => {
    // 1. Handle null/undefined/empty stored values directly
    if (
      storedIdValue === null ||
      storedIdValue === undefined ||
      storedIdValue === ""
    ) {
      return false;
    }
    // 2. Ensure input is also valid
    if (!inputIdTrimmed) {
      return false;
    }

    // 3. Convert stored value to string AND trim whitespace
    const storedIdStr = String(storedIdValue).trim();

    // 4. Check if stored value became empty after conversion/trimming
    if (storedIdStr.length === 0) {
      return false;
    }

    // 5. Perform strict comparison on the cleaned, trimmed strings
    return storedIdStr === inputIdTrimmed;
  };

  // Search handler
  const handleSearch = useCallback(() => {
    const trimmedId = nationalId.trim(); // Trim input ID immediately
    setSearchLoading(true);
    setError(null); // Clear previous errors
    setStudentData(null); // Clear previous student data
    setSearched(true); // Mark that a search has been initiated

    if (!trimmedId) {
      setError("Please enter a National ID.");
      setSearchLoading(false);
      return;
    }

    // Prevent searching if initial data is still loading
    if (fetchLoading) {
      setError("Student data is still loading, please wait.");
      setSearchLoading(false);
      return;
    }

    console.log(`Searching for National ID: "${trimmedId}"`); // Log the ID being searched

    // Simulate slight delay for better UX, prevents UI freezing on large datasets
    setTimeout(() => {
      let foundStudent = null;
      let foundInGrade = null;

      // Iterate through the pre-fetched data for each grade level
      for (const gradeLevel of GRADES_TO_FETCH) {
        const gradeData = allGradesData[gradeLevel];
        console.log(
          `Checking ${gradeData?.length ?? 0} students in ${gradeLevel}...`
        ); // Log check

        if (Array.isArray(gradeData) && gradeData.length > 0) {
          try {
            // Use the robust comparison function within find
            foundStudent = gradeData.find((student) => {
              // Access the National ID using the constant key
              const studentNatId = student?.[NATIONAL_ID_KEY];
              // Debugging log (optional):
              // console.log(`Comparing Input: "${trimmedId}" vs Stored: "${studentNatId}" (Type: ${typeof studentNatId}) -> Result: ${compareNationalIds(studentNatId, trimmedId)}`);
              return compareNationalIds(studentNatId, trimmedId);
            });

            // If found, store details and stop searching
            if (foundStudent) {
              console.log(`Student found in ${gradeLevel}:`, foundStudent); // Log success
              foundInGrade = gradeLevel;
              break; // Exit the loop once found
            }
          } catch (searchErr) {
            console.error(
              `Error while searching within ${gradeLevel} data:`,
              searchErr
            );
            // Set an error but continue searching other grades if possible
            setError(
              `An error occurred searching ${gradeLevel}. Results may be incomplete.`
            );
          }
        } else {
          console.log(
            `No data or empty data for ${gradeLevel}, skipping search.`
          );
        }
      }

      if (foundStudent) {
        setStudentData({ data: foundStudent, foundInGrade: foundInGrade });
      } else {
        console.log(
          `Student with National ID "${trimmedId}" not found in any checked grade.`
        );
        // Error message will be handled by renderFeedback based on `searched` and `studentData` state
      }

      setSearchLoading(false); // End search loading state
    }, 150); // Small delay
  }, [nationalId, allGradesData, fetchLoading]); // Dependencies

  // Handle Enter key press in the input field
  const handleKeyPress = useCallback(
    (e) => {
      // Trigger search only if Enter is pressed and not currently loading
      if (
        e.key === "Enter" &&
        !searchLoading &&
        !fetchLoading &&
        nationalId.trim()
      ) {
        handleSearch();
      }
    },
    [handleSearch, searchLoading, fetchLoading, nationalId] // Include nationalId trim check logic dependency
  );

  // --- Render Logic ---

  // Component to render feedback messages (loading, errors, not found)
  const renderFeedback = () => {
    // Show initial data loading indicator first
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
            Loading student database...
          </Typography>
        </Box>
      );
    }

    // Show search in progress
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

    // Show critical errors (that are not just about data availability)
    // Modify condition if needed based on error message content
    if (
      error &&
      !error.includes("unavailable") &&
      !error.includes("incomplete")
    ) {
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

    // Show warnings (like partial load or search errors)
    if (
      error &&
      (error.includes("unavailable") || error.includes("incomplete"))
    ) {
      return (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          variant="outlined"
          icon={<WarningAmber fontSize="inherit" />}
        >
          {error} {/* Display the specific warning message */}
        </Alert>
      );
    }

    // If search was done and no student was found
    if (searched && !studentData) {
      return (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          variant="outlined"
          icon={<InfoOutlined fontSize="inherit" />}
        >
          No student found with the entered National ID '{nationalId}'. Please
          verify the ID and try again.
        </Alert>
      );
    }

    // Initial state before any search
    if (!searched && !studentData && !fetchLoading) {
      return (
        <Typography
          sx={{ textAlign: "center", color: "text.secondary", mt: 4, mb: 2 }}
        >
          Enter a student's National ID above and click Search.
        </Typography>
      );
    }

    // If student data exists, feedback is handled by showing the card, so return null
    return null;
  };

  // Memoize the filtering of subjects to display in the table
  const subjectsToDisplay = useMemo(() => {
    const details = studentData?.data;
    if (!details) return [];
    // Filter out keys defined in METADATA_KEYS
    return Object.entries(details).filter(([key]) => !METADATA_KEYS.has(key));
  }, [studentData]); // Recalculate only when studentData changes

  const foundStudentDetails = studentData?.data;
  const foundStudentGrade = studentData?.foundInGrade;

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 3 }, // Adjusted padding
        maxWidth: "800px", // Slightly narrower max width
        margin: "auto",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: "center", mb: 3, mt: 2, fontWeight: "medium" }} // Less margin top
      >
        Student Grade Lookup
      </Typography>

      {/* --- Search Input Area --- */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          gap: 1.5, // Reduced gap
          mb: 3, // Reduced margin bottom
          flexWrap: "nowrap", // Prevent wrapping
          alignItems: "center", // Align items vertically
          borderRadius: 2,
        }}
      >
        <TextField
          id="national-id-input" // Add id for accessibility
          placeholder="Enter Student National ID"
          variant="outlined"
          fullWidth
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          onKeyPress={handleKeyPress} // Use keypress handler
          disabled={fetchLoading || searchLoading} // Disable when loading/searching
          aria-label="Student National ID Input" // Accessibility label
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  color={fetchLoading || searchLoading ? "disabled" : "action"}
                />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "8px", // Consistent border radius
              backgroundColor:
                fetchLoading || searchLoading
                  ? "action.disabledBackground"
                  : "rgba(0, 0, 0, 0.04)", // Subtle bg
              "& fieldset": { border: "none" }, // Remove default outline
              "& input::placeholder": {
                // Style placeholder
                fontSize: "0.95rem",
                color: "text.secondary",
                opacity: 0.8,
              },
            },
          }}
        />
        <Tooltip title="Search across all grade levels" placement="top">
          {/* Wrap button in span for Tooltip when disabled */}
          <span>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={fetchLoading || searchLoading || !nationalId.trim()} // Disable also if input is empty
              size="large" // Keep size large for prominence
              sx={{
                minWidth: "100px", // Slightly smaller min-width
                px: 2.5, // Adjust padding
                backgroundColor: "#1976d2", // Standard blue
                color: "white",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#115293" }, // Darker hover
                "&.Mui-disabled": {
                  // Clearer disabled style
                  backgroundColor: "action.disabledBackground",
                  color: "action.disabled",
                  cursor: "not-allowed",
                },
              }}
              aria-label="Search for student grades" // Accessibility label
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

      {/* --- Results / Feedback Area --- */}
      <Box sx={{ mt: 2, minHeight: "150px" }}>
        {" "}
        {/* Ensure minimum height */}
        {renderFeedback()}
        {/* --- Student Data Card --- */}
        <Fade
          in={!fetchLoading && !searchLoading && !!foundStudentDetails}
          timeout={400}
        >
          {/* Render Card only if details exist, prevents rendering empty card during fade out */}
          {foundStudentDetails ? (
            <Card
              elevation={3}
              sx={{ borderRadius: 2, overflow: "hidden", mt: 2 }}
            >
              {/* Card Header with Grade Color */}
              <Box
                sx={{
                  p: { xs: 1.5, md: 2 }, // Adjusted padding
                  backgroundColor: getGradeLevelColor(foundStudentGrade),
                  color: "primary.contrastText", // Use theme contrast text
                  display: "flex",
                  flexDirection: "column", // Stack info vertically
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ fontWeight: "medium" }}
                >
                  {/* Use ?? for null/undefined check */}
                  {foundStudentDetails.Name ?? "Name Not Available"}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  National ID: {foundStudentDetails[NATIONAL_ID_KEY] ?? "N/A"}
                </Typography>
                {/* Display Grade Level if available */}
                {(foundStudentDetails["Grade Level"] || foundStudentGrade) && (
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                    Grade Level:{" "}
                    {foundStudentDetails["Grade Level"] || foundStudentGrade}
                  </Typography>
                )}
              </Box>

              {/* Card Content - Grades Table */}
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                {" "}
                {/* Less padding */}
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "medium" }}
                >
                  Subject Grades
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {subjectsToDisplay.length > 0 ? (
                  <TableContainer
                    component={Paper}
                    elevation={0} // Use Card's elevation
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  >
                    <Table size="small" aria-label="student grades detail">
                      <TableHead>
                        {/* Use the styled components for consistency */}
                        <StyledTableRow>
                          <StyledTableCell>Subject</StyledTableCell>
                          <StyledTableCell align="right">Mark</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {subjectsToDisplay.map(([subjectKey, subjectValue]) => (
                          <StyledTableRow key={subjectKey}>
                            <StyledTableCell component="th" scope="row">
                              {subjectKey || "(Unknown Subject)"}
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
            // Render an empty Box when fading out or if no student found
            // This prevents layout jumps during the Fade transition
            <Box />
          )}
        </Fade>
      </Box>
    </Box>
  );
}
