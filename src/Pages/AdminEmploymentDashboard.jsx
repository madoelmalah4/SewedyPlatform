// src/components/AdminEmploymentDashboard.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Button,
  Snackbar,
} from "@mui/material";
import {
  useLazyGetEmploymentQuery,
  useEditEmploymentMutation,
} from "../Slices/AuthSlice/AuthInjection.js"; // Adjust path if needed
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { styled, useTheme } from "@mui/material/styles";

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.focus,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const STATUS_MEETED = "Is Meeted";
const STATUS_NOT_MEETED = "Not Meeted";

function AdminEmploymentDashboard() {
  const [
    triggerGetEmployment,
    { data: rawData, isLoading, isFetching, isError, error: fetchError },
  ] = useLazyGetEmploymentQuery();

  const [editEmployment, { isLoading: isUpdatingStatus, error: updateError }] =
    useEditEmploymentMutation();
  const theme = useTheme();

  const [employmentData, setEmploymentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    triggerGetEmployment();
  }, [triggerGetEmployment]);

  useEffect(() => {
    if (rawData?.data && Array.isArray(rawData.data)) {
      const dataWithTempIds = rawData.data.map((item, index) => ({
        ...item,
        tempId: item.id || `temp-${index}`,
      }));
      setEmploymentData(dataWithTempIds);
    } else if (!isLoading && !isFetching) {
      setEmploymentData([]);
    }
  }, [rawData, isLoading, isFetching]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const dataToFilter = Array.isArray(employmentData) ? employmentData : [];

    const filtered = dataToFilter.filter((item) => {
      if (!item) return false;
      return (
        item.company_Name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.name_own?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.email_own?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.email_company?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.specialization?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.type_of_Employment?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.status?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.address?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });

    setFilteredData(filtered);
    setPage(0);
  }, [searchTerm, employmentData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = useCallback(() => {
    setSearchTerm("");
    setUpdatingRowId(null);
    triggerGetEmployment();
  }, [triggerGetEmployment]);

  const handleToggleStatus = async (record) => {
    const rowId = record.tempId;
    if (!rowId || !record.email_own) {
      console.error(
        "Missing required data (id or email_own) for status toggle",
        record
      );
      setSnackbarMessage("Cannot update status: Missing required data.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setUpdatingRowId(rowId);

    const currentStatus = record.status || STATUS_NOT_MEETED;
    const nextStatus =
      currentStatus === STATUS_MEETED ? STATUS_MEETED : STATUS_NOT_MEETED;

    const updatedRecordPayload = {
      email: record.email_own,
      z: nextStatus, // Send the *target* status in the 'z' field
    };

    try {
      await editEmployment(updatedRecordPayload).unwrap();

      setSnackbarMessage(
        `API call to change status for ${record.company_Name || record.email_own} successful. Refreshing data...`
      );
      setSnackbarSeverity("success");
      // Trigger a refetch after successful update attempt to get latest data
      triggerGetEmployment();
    } catch (err) {
      console.error("API call failed:", err);
      let errorMessage = "API call failed.";
      if (err?.data?.errors) {
        errorMessage = `Validation failed: ${Object.entries(err.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ")}`;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (isError && !isFetching) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {fetchError?.data?.message ||
            fetchError?.error ||
            "Failed to load records."}
        </Alert>
      );
    }

    if (!employmentData.length && !isFetching) {
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
    }

    if (employmentData.length > 0 && !filteredData.length && searchTerm) {
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
    }

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
                <TableCell sx={{ minWidth: 280 }}>Status & Action</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {paginatedData.map((record) => {
                const uniqueRowKey = record?.tempId;
                const isCurrentlyUpdating = updatingRowId === uniqueRowKey;
                const currentStatus = record?.status;
                const isCommunicationSuccess = currentStatus === STATUS_MEETED;
                const displayStatusText = isCommunicationSuccess
                  ? "Communication Success"
                  : "Awaiting Response";

                return (
                  <StyledTableRow key={uniqueRowKey}>
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
                          View Profile
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{record?.address || "N/A"}</TableCell>
                    <TableCell>{record?.specialization || "N/A"}</TableCell>
                    <TableCell>{record?.amount || "N/A"}</TableCell>
                    <TableCell>{record?.type_of_Employment || "N/A"}</TableCell>

                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            fontWeight: 500,
                            color: "#FFFFFF",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: isCommunicationSuccess
                              ? theme.palette.success.main
                              : theme.palette.warning.main,
                            display: "inline-block",
                            minWidth: "130px",
                            textAlign: "center",
                          }}
                        >
                          {displayStatusText}
                        </Typography>
                        <Tooltip
                          title={`Submit request to change status to ${isCommunicationSuccess ? STATUS_NOT_MEETED : STATUS_MEETED} for ${record.company_Name || record.email_own}`}
                        >
                          <span>
                            <Button
                              variant="outlined"
                              size="small"
                              color={
                                isCommunicationSuccess ? "warning" : "success"
                              }
                              onClick={() => handleToggleStatus(record)}
                              disabled={
                                isCurrentlyUpdating ||
                                isUpdatingStatus ||
                                isFetching
                              }
                              sx={{
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                minWidth: "180px", // Adjusted width for longer text
                                ml: 1,
                              }}
                            >
                              {isCurrentlyUpdating
                                ? "Saving..."
                                : isCommunicationSuccess
                                  ? `Change to Awaiting Response`
                                  : `Change to Communication Success`}
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
              sx={{ color: theme.palette.text.primary, flexGrow: 1 }}
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
                  width: { xs: "calc(100% - 60px)", sm: "300px" },
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
                <span>
                  <IconButton
                    onClick={handleRefresh}
                    color="primary"
                    disabled={isLoading || isFetching}
                  >
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>

          {renderContent()}
        </Paper>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
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
