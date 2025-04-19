// src/components/AdminEmploymentDashboard.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  TablePagination,
  TextField,
  InputAdornment,
  Link,
  Button, // Keep Button for the toggle action
  Snackbar,
} from "@mui/material";
import {
  useGetEmploymentQuery,
  useEditEmploymentMutation, // Still using this hook, but its target is likely wrong
} from "../Slices/AuthSlice/AuthInjection.js"; // Adjust path if needed
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { styled, useTheme } from "@mui/material/styles";

// Styled components (no changes)
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  /* ... */
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  /* ... */
}));

const STATUS_MEETED = "Is Meeted";
const STATUS_NOT_MEETED = "Not Meeted";

// #########################################################################
// ## IMPORTANT WARNING:                                                  ##
// ## The status toggle button below now calls an API endpoint            ##
// ## (PUT /api/Employment) that requires fields 'z' and 'email'.        ##
// ## This component sends the required payload, BUT this endpoint is     ##
// ## almost certainly NOT designed to update the employment status.      ##
// ## The button click will likely NOT change the status displayed.       ##
// ##                                                                     ##
// ## Awaiting correction of the API endpoint details for status updates. ##
// #########################################################################

function AdminEmploymentDashboard() {
  // Hooks (no changes)
  const {
    data: rawData,
    isLoading,
    isFetching: isFetchingList,
    isError,
    error,
    refetch,
  } = useGetEmploymentQuery(undefined, {});
  const [editEmployment, { isLoading: isUpdatingStatus, error: updateError }] =
    useEditEmploymentMutation();
  const theme = useTheme();

  // State (no changes)
  const [employmentData, setEmploymentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Effects (no changes)
  useEffect(() => {
    if (rawData && rawData.data && Array.isArray(rawData.data)) {
      const dataWithTempIds = rawData.data.map((item, index) => ({
        ...item,
        tempId: index,
      }));
      setEmploymentData(dataWithTempIds);
    } else if (!isLoading && !isFetchingList) {
      setEmploymentData([]);
    }
  }, [rawData, isLoading, isFetchingList]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const dataToFilter = Array.isArray(employmentData) ? employmentData : [];
    const filtered = dataToFilter.filter((item) => {
      return (
        item &&
        (item.company_Name?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.name_own?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.email_own?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.email_company?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.specialization?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.type_of_Employment
            ?.toLowerCase()
            .includes(lowerCaseSearchTerm) ||
          item.status?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.address?.toLowerCase().includes(lowerCaseSearchTerm))
      );
    });
    setFilteredData(filtered);
    setPage(0);
  }, [searchTerm, employmentData]);

  // Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleRefresh = () => {
    setSearchTerm("");
    setUpdatingRowId(null);
    refetch();
  };

  // *** Handler modified to send { email, z } payload ***
  const handleToggleStatus = async (record) => {
    const rowId = record.tempId; // Or record.id
    setUpdatingRowId(rowId);

    const currentStatus = record.status;
    const nextStatus = currentStatus;

    // Create the payload with ONLY z and email, using email_company for email field
    const updatedRecordPayload = {
      email: record.email_own, // Use the COMPANY email for the 'email' field
      z: nextStatus, // Use the calculated nextStatus for the 'z' field
    };
    

    try {
      await editEmployment(updatedRecordPayload).unwrap();
      // Success message is likely misleading
      setSnackbarMessage(
        `API call successful for ${record.email_company} (Status may not be updated!)`
      );
      setSnackbarSeverity("success");
    } catch (err) {
      console.error("API call failed:", err); // Keep console log for errors
      let errorMessage = "API call failed.";
      if (err?.data?.errors) {
        errorMessage = `Validation failed: ${Object.entries(err.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ")}`;
      } else if (err?.data?.title) {
        errorMessage = err.data.title;
      } else if (err?.error) {
        errorMessage = err.error;
      }
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarSeverity("error");
    } finally {
      setUpdatingRowId(null);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Render Logic
  const renderContent = () => {
    // Loading/Error/Empty checks (no changes)
    if (isLoading)
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );
    if (isError)
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error?.data?.message || error?.error || "Failed to load records."}
        </Alert>
      );
    if (!employmentData.length && !isFetchingList)
      return (
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            p: 4,
            color: theme.palette.text.secondary,
          }}
        >
          No records found.
        </Typography>
      );
    if (!filteredData.length && searchTerm)
      return (
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            p: 4,
            color: theme.palette.text.secondary,
          }}
        >
          No records match search term "{searchTerm}".
        </Typography>
      );
    if (isFetchingList && !isLoading)
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );

    // Calculate paginated data
    const currentData = Array.isArray(filteredData) ? filteredData : [];
    const paginatedData = currentData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    return (
      <>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="employment records table">
            <StyledTableHead>
              <TableRow>
                {/* Columns */}
                <TableCell sx={{ minWidth: 150 }}>Company Name</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Submitter</TableCell>
                <TableCell sx={{ minWidth: 170 }}>Submitter Email</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Submitter Phone</TableCell>
                <TableCell sx={{ minWidth: 170 }}>Company Email</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Company Phone</TableCell>
                <TableCell sx={{ minWidth: 150 }}>LinkedIn</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Address</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Specialization</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Amount/Size</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Employment Type</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Status & Action</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {paginatedData.map((record) => {
                const uniqueRowKey = record?.tempId;
                const isCurrentlyUpdating = updatingRowId === uniqueRowKey;
                const currentStatus = record?.status || STATUS_NOT_MEETED;
                const isMeeted = currentStatus === STATUS_MEETED ? "Communication Success" :"Awaiting Response";

                return (
                  <StyledTableRow key={uniqueRowKey}>
                    {/* Data Cells */}
                    <TableCell>{record?.company_Name || "N/A"}</TableCell>
                    <TableCell>{record?.name_own || "N/A"}</TableCell>
                    <TableCell>
                      {record?.email_own ? (
                        <Link
                          href={`mailto:${record.email_own}`}
                          sx={{ textDecoration: "none" }}
                        >
                          {record.email_own}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{record?.phone_own || "N/A"}</TableCell>
                    <TableCell>
                      {record?.email_company ? (
                        <Link
                          href={`mailto:${record.email_company}`}
                          sx={{ textDecoration: "none" }}
                        >
                          {record.email_company}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{record?.phone_company || "N/A"}</TableCell>
                    <TableCell>
                      {record?.linkedin ? (
                        <Link
                          href={
                            record.linkedin.startsWith("http")
                              ? record.linkedin
                              : `https://${record.linkedin}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textDecoration: "none" }}
                        >
                          Link
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{record?.address || "N/A"}</TableCell>
                    <TableCell>{record?.specialization || "N/A"}</TableCell>
                    <TableCell>{record?.amount || "N/A"}</TableCell>
                    <TableCell>{record?.type_of_Employment || "N/A"}</TableCell>

                    {/* Status Cell with Toggle Button (still technically active but calls wrong endpoint) */}
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: "#FFFFFF",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor:
                              isMeeted === "Communication Success"
                                ? theme.palette.success.light
                                : theme.palette.error.light,
                            display: "inline-block",
                            minWidth: "80px",
                          }}
                        >
                          {isMeeted}
                        </Typography>
                        <Tooltip
                          title={
                            isMeeted
                              ? `Try setting ${STATUS_NOT_MEETED} (API Mismatch)`
                              : `Try setting ${STATUS_MEETED} (API Mismatch)`
                          }
                        >
                          <span>
                            <Button
                              variant="outlined"
                              size="small"
                              color={isMeeted ? "error" : "success"}
                              startIcon={
                                isCurrentlyUpdating ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : isMeeted === "Communication Success" ? (
                                  <HighlightOffIcon />
                                ) : (
                                  <CheckCircleOutlineIcon />
                                )
                              }
                              onClick={() => handleToggleStatus(record)}
                              disabled={isCurrentlyUpdating || isUpdatingStatus}
                              sx={{
                                textTransform: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {isCurrentlyUpdating
                                ? "Saving..."
                                : isMeeted === "Communication Success"
                                  ? `Mark Awaiting Response`
                                  : `Mark  Communication Success`}
                            </Button>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
        />
      </>
    );
  };

  // Main JSX Return
  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: theme.palette.text.primary }}
            >
              Employment Records
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.action.active }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", sm: "300px" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: theme.palette.divider },
                    "&:hover fieldset": {
                      borderColor: theme.palette.text.primary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                }}
              />
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={handleRefresh}
                  color="primary"
                  disabled={isLoading || isFetchingList}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          {renderContent()}
        </Paper>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminEmploymentDashboard;
