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
  TableFooter,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Search,
  InfoOutlined,
  ErrorOutline,
  WarningAmber,
  Block,
  WrongLocation,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";

import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// --- Configuration ---
const COLLECTION_NAME = "gradeData";
const ALLOWED_GRADES = ["Junior", "Wheeler", "Senior"];
const NATIONAL_ID_KEY = "National ID";
const GRADE_LEVEL_KEY = "Grade Level";
const METADATA_KEYS = new Set([
  NATIONAL_ID_KEY,
  GRADE_LEVEL_KEY,
  "Name",
  "Student ID",
  "ID",
  "id",
]);

const capitalize = (s) =>
  s && typeof s === "string"
    ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    : "";

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
  [`&.${tableCellClasses.footer}`]: {
    fontSize: 14,
    fontWeight: "bold",
    borderTop: `2px solid ${theme.palette.divider}`,
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

export default function StudentsForm() {
  const { grade: rawGradeParam } = useParams();

  const [currentGrade, setCurrentGrade] = useState(null);
  const [nationalId, setNationalId] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [gradeData, setGradeData] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFeedback, setSearchFeedback] = useState(null);
  const [searched, setSearched] = useState(false);

  // All other functions are correct and remain unchanged.
  useEffect(() => {
    const gradeParamNormalized = capitalize(rawGradeParam);
    if (ALLOWED_GRADES.includes(gradeParamNormalized)) {
      setCurrentGrade(gradeParamNormalized);
      setError(null);
      setSearchFeedback(null);
    } else {
      setCurrentGrade(null);
      setFetchLoading(false);
      setError(`Invalid grade in URL. Allowed: ${ALLOWED_GRADES.join(", ")}.`);
      setGradeData([]);
      setStudentData(null);
      setSearchFeedback(null);
    }
    setSearched(false);
    setNationalId("");
    setStudentData(null);
  }, [rawGradeParam]);

  const fetchGradeData = useCallback(async (gradeToFetch) => {
    if (!gradeToFetch) return;
    setFetchLoading(true);
    setError(null);
    setSearchFeedback(null);
    setStudentData(null);
    setSearched(false);
    setGradeData([]);
    const docRef = doc(db, COLLECTION_NAME, gradeToFetch);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (cloudData && Array.isArray(cloudData.data)) {
          const validData = cloudData.data.filter(
            (row) =>
              row && typeof row === "object" && Object.keys(row).length > 0
          );
          setGradeData(validData);
        } else {
          setGradeData([]);
          setError(
            `Data structure issue for ${gradeToFetch}. Check Firestore.`
          );
        }
      } else {
        setGradeData([]);
        setError(
          `No data document found for ${gradeToFetch} grade in Firestore.`
        );
      }
    } catch (err) {
      setError(
        `Failed to load data for ${gradeToFetch}. Check connection or permissions.`
      );
      setGradeData([]);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentGrade) {
      fetchGradeData(currentGrade);
    }
  }, [currentGrade, fetchGradeData]);

  const getGradeLevelColor = useCallback(
    (gradeLevel) => {
      const g = gradeLevel || currentGrade;
      switch (g) {
        case "Junior":
          return "#4CAF50";
        case "Wheeler":
          return "#E6B325";
        case "Senior":
          return "#F44336";
        default:
          return "#9E9E9E";
      }
    },
    [currentGrade]
  );

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

  const handleSearch = useCallback(() => {
    const trimmedId = nationalId.trim();
    setSearchLoading(true);
    setError(null);
    setSearchFeedback(null);
    setStudentData(null);
    setSearched(true);
    if (!currentGrade) {
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
      setSearchFeedback({
        type: "warning",
        message: "Student data is loading, please wait.",
      });
      setSearchLoading(false);
      return;
    }
    if (gradeData.length === 0 && !fetchLoading) {
      setSearchFeedback({
        type: "info",
        message: `No student data available to search within the ${currentGrade} grade document.`,
      });
      setSearchLoading(false);
      return;
    }
    setTimeout(() => {
      let foundStudentRaw = null;
      let finalStudentData = null;
      let feedback = null;
      try {
        foundStudentRaw = gradeData.find((student) =>
          compareNationalIds(student?.[NATIONAL_ID_KEY], trimmedId)
        );
        if (foundStudentRaw) {
          const studentActualGradeNormalized = capitalize(
            foundStudentRaw[GRADE_LEVEL_KEY]
          );
          if (studentActualGradeNormalized === currentGrade) {
            finalStudentData = {
              data: foundStudentRaw,
              foundInGrade: currentGrade,
            };
          } else {
            feedback = {
              type: "warning",
              message: `Student with ID '${trimmedId}' found, but belongs to the '${studentActualGradeNormalized || "Unknown"}' grade, not '${currentGrade}'.`,
            };
          }
        } else {
          feedback = {
            type: "info",
            message: `No student found with National ID '${trimmedId}' in the ${currentGrade} grade. Please verify the ID.`,
          };
        }
      } catch (searchErr) {
        feedback = {
          type: "error",
          message: `An error occurred during the search.`,
        };
        finalStudentData = null;
      } finally {
        setStudentData(finalStudentData);
        setSearchFeedback(feedback);
        setSearchLoading(false);
      }
    }, 150);
  }, [nationalId, gradeData, currentGrade, fetchLoading]);

  const handleKeyPress = useCallback(
    (e) => {
      if (
        e.key === "Enter" &&
        !searchLoading &&
        !fetchLoading &&
        nationalId.trim() &&
        currentGrade
      ) {
        handleSearch();
      }
    },
    [handleSearch, searchLoading, fetchLoading, nationalId, currentGrade]
  );

  const renderFeedback = () => {
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
    if (error && !searchLoading && !searchFeedback) {
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
    if (searched && searchFeedback && !searchLoading) {
      let icon = <InfoOutlined fontSize="inherit" />;
      if (searchFeedback.type === "error")
        icon = <ErrorOutline fontSize="inherit" />;
      if (searchFeedback.type === "warning")
        icon = <WrongLocation fontSize="inherit" />;
      return (
        <Alert
          severity={searchFeedback.type}
          sx={{ mb: 2 }}
          variant="outlined"
          icon={icon}
        >
          {searchFeedback.message}
        </Alert>
      );
    }
    if (
      !searched &&
      !studentData &&
      !fetchLoading &&
      !error &&
      !searchFeedback &&
      currentGrade
    ) {
      return (
        <Typography
          sx={{ textAlign: "center", color: "text.secondary", mt: 4, mb: 2 }}
        >
          Enter a student's National ID to search within the {currentGrade}{" "}
          grade.
        </Typography>
      );
    }
    return null;
  };

  // --- *** MODIFICATION 1 of 2: Update the processing logic *** ---
  const processedStudentGrades = useMemo(() => {
    const details = studentData?.data;
    if (!details) {
      return { subjects: [], total: null };
    }

    const subjectEntries = Object.entries(details).filter(
      ([key]) => !METADATA_KEYS.has(key)
    );

    let totalAchieved = 0;
    let totalPossible = 0;
    const subjectsForDisplay = [];

    for (const [key, value] of subjectEntries) {
      const achievedScore = parseFloat(value);
      if (!isNaN(achievedScore)) {
        totalAchieved += achievedScore;
      }

      let displayName = key;
      let possibleScore = null; // Default to null

      if (key.includes("/")) {
        const keyParts = key.split("/");
        displayName = keyParts[0].trim();
        const parsedPossible = parseFloat(keyParts[1].trim());
        if (!isNaN(parsedPossible)) {
          possibleScore = parsedPossible; // Store the number
          totalPossible += parsedPossible;
        }
      }

      // Store all the parts we need for rendering each row
      subjectsForDisplay.push({
        uniqueKey: key, // Use original key for React's key prop
        displayName: displayName,
        achieved: value, // Keep original value for display (e.g., '9.5')
        possible: possibleScore,
      });
    }

    return {
      subjects: subjectsForDisplay,
      total: {
        achieved: totalAchieved,
        possible: totalPossible,
      },
    };
  }, [studentData]);

  const foundStudentDetails = studentData?.data;

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 }, maxWidth: "800px", margin: "auto" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: "center", mb: 3, mt: 2, fontWeight: "medium" }}
      >
        {currentGrade ? `${currentGrade} Grade Lookup` : "Student Grade Lookup"}
      </Typography>

      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          gap: 1.5,
          mb: 3,
          flexWrap: "nowrap",
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
              backgroundColor:
                fetchLoading || searchLoading || !currentGrade
                  ? "action.disabledBackground"
                  : "rgba(0, 0, 0, 0.04)",
              "& fieldset": { border: "none" },
              "& input::placeholder": {
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
          <span>
            <Button
              variant="contained"
              onClick={handleSearch}
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
                backgroundColor: "#1976d2",
                color: "white",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#115293" },
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

      <Box sx={{ mt: 2, minHeight: "150px" }}>
        {renderFeedback()}
        <Fade
          in={
            !fetchLoading &&
            !searchLoading &&
            !!foundStudentDetails &&
            !!currentGrade
          }
          timeout={400}
        >
          {foundStudentDetails && currentGrade ? (
            <Card
              elevation={3}
              sx={{ borderRadius: 2, overflow: "hidden", mt: 2 }}
            >
              <Box
                sx={{
                  p: { xs: 1.5, md: 2 },
                  backgroundColor: getGradeLevelColor(currentGrade),
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
                  {foundStudentDetails.Name ?? "Name Not Available"}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  National ID: {foundStudentDetails[NATIONAL_ID_KEY] ?? "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                  Grade Level: {currentGrade}
                </Typography>
              </Box>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "medium" }}
                >
                  Subject Grades
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {processedStudentGrades.subjects.length > 0 ? (
                  <TableContainer
                    component={Paper}
                    elevation={0}
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
                        {/* --- *** MODIFICATION 2 of 2: Update the table rendering *** --- */}
                        {processedStudentGrades.subjects.map((subject) => (
                          <StyledTableRow key={subject.uniqueKey}>
                            {/* Display the cleaned subject name */}
                            <StyledTableCell component="th" scope="row">
                              {subject.displayName}
                            </StyledTableCell>
                            {/* Display the mark and the possible score */}
                            <StyledTableCell align="right">
                              {subject.possible
                                ? `${subject.achieved} / ${subject.possible}`
                                : (subject.achieved ?? "N/A")}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                      {processedStudentGrades.total &&
                        processedStudentGrades.total.possible > 0 && (
                          <TableFooter>
                            <StyledTableRow
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  borderTop: `2px solid #ccc`,
                                },
                              }}
                            >
                              <StyledTableCell
                                component="th"
                                scope="row"
                                sx={{ fontWeight: "bold" }}
                              >
                                Total
                              </StyledTableCell>
                              <StyledTableCell
                                align="right"
                                sx={{ fontWeight: "bold" }}
                              >{`${processedStudentGrades.total.achieved} / ${processedStudentGrades.total.possible}`}</StyledTableCell>
                            </StyledTableRow>
                          </TableFooter>
                        )}
                    </Table>
                  </TableContainer>
                ) : (
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
            <Box />
          )}
        </Fade>
      </Box>
    </Box>
  );
}
