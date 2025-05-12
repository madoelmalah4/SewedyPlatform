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
} from "@mui/icons-material";

import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "gradeData";
const GRADES_TO_FETCH = ["Junior", "Wheeler", "Senior"];

const NATIONAL_ID_KEY = "National ID";

const METADATA_KEYS = new Set([
  NATIONAL_ID_KEY,
  "Name",
  "Grade Level",
  "Student ID",
  "ID",
  "id",
]);

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

export default function StudentsForm() {
  const [nationalId, setNationalId] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [allGradesData, setAllGradesData] = useState(
    GRADES_TO_FETCH.reduce((acc, grade) => ({ ...acc, [grade]: [] }), {})
  );

  const fetchAllGradesData = useCallback(async () => {
    setFetchLoading(true);
    setError(null);
    setStudentData(null);
    setSearched(false);
    const fetchedData = {};
    let encounteredError = null;

    const fetchPromises = GRADES_TO_FETCH.map(async (gradeLevel) => {
      const docRef = doc(db, COLLECTION_NAME, gradeLevel);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData && Array.isArray(cloudData.data)) {
            fetchedData[gradeLevel] = cloudData.data.filter(
              (row) =>
                row && typeof row === "object" && Object.keys(row).length > 0
            );
          } else {
            fetchedData[gradeLevel] = [];
          }
        } else {
          fetchedData[gradeLevel] = [];
        }
      } catch (err) {
        encounteredError = `Failed to load data for ${gradeLevel}.`;
        fetchedData[gradeLevel] = [];
      }
    });

    try {
      await Promise.all(fetchPromises);
      setAllGradesData(fetchedData);
      if (encounteredError) {
        setError(encounteredError + " Some data may be unavailable.");
      }
    } catch (err) {
      setError("An critical error occurred while fetching data.");
      setAllGradesData(
        GRADES_TO_FETCH.reduce((acc, grade) => ({ ...acc, [grade]: [] }), {})
      );
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllGradesData();
  }, [fetchAllGradesData]);

  const getGradeLevelColor = useCallback(
    (gradeLevel) => {
      const g = gradeLevel || studentData?.foundInGrade;
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
    [studentData]
  );

  const compareNationalIds = (storedIdValue, inputIdTrimmed) => {
    if (
      storedIdValue === null ||
      storedIdValue === undefined ||
      storedIdValue === ""
    ) {
      return false;
    }
    if (!inputIdTrimmed) {
      return false;
    }
    const storedIdStr = String(storedIdValue).trim();
    if (storedIdStr.length === 0) {
      return false;
    }
    return storedIdStr === inputIdTrimmed;
  };

  const handleSearch = useCallback(() => {
    const trimmedId = nationalId.trim();
    setSearchLoading(true);
    setError(null);
    setStudentData(null);
    setSearched(true);

    if (!trimmedId) {
      setError("Please enter a National ID.");
      setSearchLoading(false);
      return;
    }

    if (fetchLoading) {
      setError("Student data is still loading, please wait.");
      setSearchLoading(false);
      return;
    }

    setTimeout(() => {
      let foundStudent = null;
      let foundInGrade = null;

      for (const gradeLevel of GRADES_TO_FETCH) {
        const gradeData = allGradesData[gradeLevel];
        if (Array.isArray(gradeData) && gradeData.length > 0) {
          try {
            foundStudent = gradeData.find((student) => {
              const studentNatId = student?.[NATIONAL_ID_KEY];
              return compareNationalIds(studentNatId, trimmedId);
            });

            if (foundStudent) {
              foundInGrade = gradeLevel;
              break;
            }
          } catch (searchErr) {
            setError(
              `An error occurred searching ${gradeLevel}. Results may be incomplete.`
            );
          }
        }
      }

      if (foundStudent) {
        setStudentData({ data: foundStudent, foundInGrade: foundInGrade });
      }
      setSearchLoading(false);
    }, 150);
  }, [nationalId, allGradesData, fetchLoading]);

  const handleKeyPress = useCallback(
    (e) => {
      if (
        e.key === "Enter" &&
        !searchLoading &&
        !fetchLoading &&
        nationalId.trim()
      ) {
        handleSearch();
      }
    },
    [handleSearch, searchLoading, fetchLoading, nationalId]
  );

  const renderFeedback = () => {
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
          {error}
        </Alert>
      );
    }
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
    if (!searched && !studentData && !fetchLoading) {
      return (
        <Typography
          sx={{ textAlign: "center", color: "text.secondary", mt: 4, mb: 2 }}
        >
          Enter a student's National ID above and click Search.
        </Typography>
      );
    }
    return null;
  };

  const { subjectsForDisplay, totalObtainedMarks, totalFullMarks } =
    useMemo(() => {
      const details = studentData?.data;
      if (!details) {
        return {
          subjectsForDisplay: [],
          totalObtainedMarks: 0,
          totalFullMarks: 0,
        };
      }

      let currentTotalObtained = 0;
      let currentTotalFull = 0;
      const displayItems = [];

      Object.entries(details).forEach(([key, studentMarkValue]) => {
        if (METADATA_KEYS.has(key)) {
          return;
        }

        const keyParts = key.split("/");
        if (keyParts.length > 1) {
          const subjectName = keyParts.slice(0, -1).join("/").trim(); // Handle cases like "Subject A/B/50"
          const potentialFullMarkStr = keyParts[keyParts.length - 1].trim();
          const parsedFullMark = parseFloat(potentialFullMarkStr);

          if (!isNaN(parsedFullMark) && subjectName) {
            // Ensure subjectName is also present
            currentTotalFull += parsedFullMark;

            let obtainedMarkForDisplay = "N/A";
            const parsedStudentMark = parseFloat(
              String(studentMarkValue).trim()
            );

            if (!isNaN(parsedStudentMark)) {
              currentTotalObtained += parsedStudentMark;
              obtainedMarkForDisplay = parsedStudentMark;
            }

            displayItems.push({
              originalKey: key, // Keep original key for React's key prop
              subjectName: subjectName,
              obtainedMark: obtainedMarkForDisplay,
              fullMark: parsedFullMark,
            });
          }
        }
      });

      return {
        subjectsForDisplay: displayItems,
        totalObtainedMarks: currentTotalObtained,
        totalFullMarks: currentTotalFull,
      };
    }, [studentData]);

  const foundStudentDetails = studentData?.data;
  const foundStudentGrade = studentData?.foundInGrade;

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 }, maxWidth: "800px", margin: "auto" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ textAlign: "center", mb: 3, mt: 2, fontWeight: "medium" }}
      >
        Student Grade Lookup
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
          disabled={fetchLoading || searchLoading}
          aria-label="Student National ID Input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  color={fetchLoading || searchLoading ? "disabled" : "action"}
                />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "8px",
              backgroundColor:
                fetchLoading || searchLoading
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
        <Tooltip title="Search across all grade levels" placement="top">
          <span>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={fetchLoading || searchLoading || !nationalId.trim()}
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
              aria-label="Search for student grades"
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
          in={!fetchLoading && !searchLoading && !!foundStudentDetails}
          timeout={400}
        >
          {foundStudentDetails ? (
            <Card
              elevation={3}
              sx={{ borderRadius: 2, overflow: "hidden", mt: 2 }}
            >
              <Box
                sx={{
                  p: { xs: 1.5, md: 2 },
                  backgroundColor: getGradeLevelColor(foundStudentGrade),
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
                {(foundStudentDetails["Grade Level"] || foundStudentGrade) && (
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                    Grade Level:{" "}
                    {foundStudentDetails["Grade Level"] || foundStudentGrade}
                  </Typography>
                )}
              </Box>

              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "medium" }}
                >
                  Subject Grades
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {subjectsForDisplay.length > 0 ? (
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
                        {subjectsForDisplay.map((subjectItem) => (
                          <StyledTableRow key={subjectItem.originalKey}>
                            <StyledTableCell component="th" scope="row">
                              {subjectItem.subjectName}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {`${subjectItem.obtainedMark} / ${subjectItem.fullMark}`}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                        <StyledTableRow
                          sx={(theme) => ({
                            "& > td": {
                              fontWeight: "bold",
                              borderTop: `2px solid ${theme.palette.divider}`,
                            },
                          })}
                        >
                          <StyledTableCell component="th" scope="row">
                            Total Grade
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {`${totalObtainedMarks} / ${totalFullMarks}`}
                          </StyledTableCell>
                        </StyledTableRow>
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
                    No specific subject grades following the 'Subject/FullMark'
                    format are available for display.
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
