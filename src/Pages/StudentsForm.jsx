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
  WrongLocation,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";

import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// --- Configuration ---
const COLLECTION_NAME = "gradeData";
const ALLOWED_GRADES = ["Junior", "Cs", "Information"];
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
const SUPPLEMENTARY_FLAG_VALUE = "ملحق";
const EXCLUDE_FROM_TOTAL_FLAG = "/out";
const SPECIAL_STATUS_VALUE = "جدير";
const ARABIC_REGEX = /[\u0600-\u06FF]/;

const capitalize = (s) =>
  s && typeof s === "string"
    ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    : "";

const formatGradeDisplay = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return value;
  }
  if (Number.isInteger(num)) {
    return num;
  }
  return num.toFixed(1);
};

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
    fontWeight: "bold",
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
        case "Cs":
          return "#E6B325";
        case "Information":
          return "#F44336";
        default:
          return "#9E9E9E";
      }
    },
    [currentGrade]
  );

  const compareIds = (storedIdValue, inputIdTrimmed) => {
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
          compareIds(student?.[NATIONAL_ID_KEY], trimmedId)
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

  const processedStudentGrades = useMemo(() => {
    const details = studentData?.data;
    const initialResult = {
      arabicNormalSubjects: [],
      englishNormalSubjects: [],
      specialStatusSubjects: [],
      excludedSubjects: [],
      total: null,
      hasSupplementary: false,
    };
    if (!details) {
      return initialResult;
    }

    const subjectEntries = Object.entries(details).filter(
      ([key]) => !METADATA_KEYS.has(key)
    );

    const hasSupplementary = subjectEntries.some(
      ([, value]) => String(value).trim() === SUPPLEMENTARY_FLAG_VALUE
    );

    if (hasSupplementary) {
      return { ...initialResult, hasSupplementary: true };
    }

    let totalAchieved = 0;
    let totalPossible = 0;
    const arabicNormalSubjects = [];
    const englishNormalSubjects = [];
    const specialStatusSubjects = [];
    const excludedSubjects = [];

    for (const [key, value] of subjectEntries) {
      let displayName = key;
      let possibleScore = null;
      const isExcludedFromTotal = key.includes(EXCLUDE_FROM_TOTAL_FLAG);

      if (key.includes("/")) {
        const keyParts = key.split("/");
        displayName = keyParts[0].trim();
        const parsedPossible = parseFloat(keyParts[1].trim());
        if (!isNaN(parsedPossible)) {
          possibleScore = parsedPossible;
        }
      }

      const subjectObject = {
        uniqueKey: key,
        displayName: displayName,
        achieved: value,
        possible: possibleScore,
      };

      if (isExcludedFromTotal) {
        excludedSubjects.push(subjectObject);
      } else if (String(value).trim() === SPECIAL_STATUS_VALUE) {
        specialStatusSubjects.push(subjectObject);
      } else {
        const achievedScore = parseFloat(value);
        if (!isNaN(achievedScore)) {
          totalAchieved += achievedScore;
          if (possibleScore !== null) {
            totalPossible += possibleScore;
          }
        }
        if (ARABIC_REGEX.test(displayName)) {
          arabicNormalSubjects.push(subjectObject);
        } else {
          englishNormalSubjects.push(subjectObject);
        }
      }
    }

    return {
      arabicNormalSubjects,
      englishNormalSubjects,
      specialStatusSubjects,
      excludedSubjects,
      total: {
        achieved: totalAchieved,
        possible: totalPossible,
      },
      hasSupplementary: false,
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
          placeholder="ادخل الرقم الجلوس"
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
              aria-label="Search button"
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
                  sx={{ fontWeight: "bold", textAlign: "right" }}
                >
                  {foundStudentDetails.Name ?? "Name Not Available"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ opacity: 0.9, fontWeight: "bold", textAlign: "right" }}
                >
                  رقم الجلوس: {foundStudentDetails[NATIONAL_ID_KEY] ?? "N/A"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    mt: 0.5,
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  Grade Level: {currentGrade}
                </Typography>
              </Box>

              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  Student Result
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {processedStudentGrades.hasSupplementary ? (
                  <Alert
                    severity="warning"
                    variant="outlined"
                    icon={<WarningAmber fontSize="inherit" />}
                    sx={{ mt: 2, mb: 1, fontSize: { md: "40px", xs: "20px" } }}
                  >
                    برجاء مراجعة ادارة المدرسة
                  </Alert>
                ) : processedStudentGrades.arabicNormalSubjects.length > 0 ||
                  processedStudentGrades.englishNormalSubjects.length > 0 ||
                  processedStudentGrades.specialStatusSubjects.length > 0 ||
                  processedStudentGrades.excludedSubjects.length > 0 ? (
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
                        {processedStudentGrades.arabicNormalSubjects.map(
                          (subject) => (
                            <StyledTableRow key={subject.uniqueKey}>
                              <StyledTableCell component="th" scope="row">
                                {subject.displayName}
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                {subject.possible
                                  ? `${formatGradeDisplay(subject.achieved)} / ${subject.possible}`
                                  : (formatGradeDisplay(subject.achieved) ??
                                    "N/A")}
                              </StyledTableCell>
                            </StyledTableRow>
                          )
                        )}
                        {processedStudentGrades.englishNormalSubjects.map(
                          (subject) => (
                            <StyledTableRow key={subject.uniqueKey}>
                              <StyledTableCell component="th" scope="row">
                                {subject.displayName}
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                {subject.possible
                                  ? `${formatGradeDisplay(subject.achieved)} / ${subject.possible}`
                                  : (formatGradeDisplay(subject.achieved) ??
                                    "N/A")}
                              </StyledTableCell>
                            </StyledTableRow>
                          )
                        )}
                        {processedStudentGrades.specialStatusSubjects.map(
                          (subject) => (
                            <StyledTableRow key={subject.uniqueKey}>
                              <StyledTableCell component="th" scope="row">
                                {subject.displayName}
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                {subject.achieved}
                              </StyledTableCell>
                            </StyledTableRow>
                          )
                        )}

                        {processedStudentGrades.total &&
                          processedStudentGrades.total.possible > 0 && (
                            <StyledTableRow>
                              <StyledTableCell
                                component="th"
                                scope="row"
                                sx={{ borderTop: `2px solid #ccc` }}
                              >
                                Total
                              </StyledTableCell>
                              <StyledTableCell
                                align="right"
                                sx={{ borderTop: `2px solid #ccc` }}
                              >
                                {`${formatGradeDisplay(processedStudentGrades.total.achieved)} / ${processedStudentGrades.total.possible}`}
                              </StyledTableCell>
                            </StyledTableRow>
                          )}

                        {/* --- *** FINAL FIX: Render excluded subjects correctly and without italics *** --- */}
                        {processedStudentGrades.excludedSubjects.map(
                          (subject) => (
                            <StyledTableRow key={subject.uniqueKey}>
                              <StyledTableCell component="th" scope="row">
                                {subject.displayName}
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                {subject.possible
                                  ? `${formatGradeDisplay(subject.achieved)} / ${subject.possible}`
                                  : (formatGradeDisplay(subject.achieved) ??
                                    "N/A")}
                              </StyledTableCell>
                            </StyledTableRow>
                          )
                        )}
                      </TableBody>
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
                    No specific grades are available for display for this
                    student.
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
