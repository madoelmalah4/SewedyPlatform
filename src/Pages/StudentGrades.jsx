"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Grid,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  alpha,
  TextField,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { read, utils, write } from "xlsx";
import {
  CloudUpload,
  DeleteForever,
  CloudDone,
  CloudOff,
  WarningAmber,
  FileDownload,
  Search,
} from "@mui/icons-material";
import { useGradesStore } from "../store"; // Adjust path if necessary
import { db } from "../firebaseConfig"; // Adjust path if necessary
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import Btns from "../Components/Btns"; // Adjust path if necessary

// --- Configuration ---
const COLLECTION_NAME = "gradeData";
const gradesConfig = [
  { id: "Junior", label: "Junior", color: "#4CAF50", hover: "#3d8b40" },
  { id: "Wheeler", label: "Wheeler", color: "#E6B325", hover: "#c99a1e" },
  { id: "Senior", label: "Senior", color: "#F44336", hover: "#d32f2f" },
];
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

// --- Helper Functions ---
const generateColumns = (dataArray) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
  const firstRow = dataArray[0];
  if (typeof firstRow !== "object" || firstRow === null) return [];
  const keysToInclude = Object.keys(firstRow).filter((key) => key !== "id");
  return keysToInclude.map((key) => ({
    field: key,
    headerName: key,
    flex: 1,
    minWidth: 130,
  }));
};

const ensureRowId = (row, index) => {
  const potentialId = row.id ?? row.ID ?? row.StudentID ?? index;
  // Ensure id is a string or number for DataGrid compatibility
  const finalId =
    typeof potentialId === "string" || typeof potentialId === "number"
      ? potentialId
      : String(potentialId);
  return { ...row, id: finalId };
};

// --- Component ---
export default function StudentsGrads() {
  // Zustand Store Access
  const { setJuniorGrades, setWheelerGrades, setSeniorGrades } =
    useGradesStore();

  // Component State
  const [activeTab, setActiveTab] = useState(0);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);
  const [searchTerms, setSearchTerms] = useState({
    Junior: "",
    Wheeler: "",
    Senior: "",
  });
  const [gradeDetails, setGradeDetails] = useState(() =>
    gradesConfig.reduce((acc, grade) => {
      acc[grade.id] = {
        data: [],
        columns: [],
        status: { exists: false, fileName: "Checking..." },
      };
      return acc;
    }, {})
  );

  // Memoized Zustand setters
  const gradeSetters = useMemo(
    () => ({
      Junior: setJuniorGrades,
      Wheeler: setWheelerGrades,
      Senior: setSeniorGrades,
    }),
    [setJuniorGrades, setWheelerGrades, setSeniorGrades]
  );

  // --- Data Fetching (Firestore) ---
  const loadCloudData = useCallback(async () => {
    setGlobalLoading(true);
    setError(null);
    setSuccess(null);
    let encounteredError = null;

    const fetchPromises = gradesConfig.map(async ({ id: gradeLevel }) => {
      const docRef = doc(db, COLLECTION_NAME, gradeLevel);
      try {
        const docSnap = await getDoc(docRef);
        let newState = {
          data: [],
          columns: [],
          status: { exists: false, fileName: "No data found" },
        };
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData && Array.isArray(cloudData.data)) {
            const dataWithIds = cloudData.data.map(ensureRowId);
            const columns = generateColumns(dataWithIds);
            newState = {
              data: dataWithIds,
              columns: columns,
              status: {
                exists: true,
                fileName: cloudData.fileName || "Cloud Data (Unknown File)",
              },
            };
            gradeSetters[gradeLevel](dataWithIds);
          } else {
            console.warn(
              `Invalid or missing data array in Firestore for ${gradeLevel}.`
            );
            newState.status.fileName = "Invalid data structure";
            gradeSetters[gradeLevel]([]);
          }
        } else {
          gradeSetters[gradeLevel]([]);
        }
        return { gradeLevel, newState };
      } catch (err) {
        console.error(`Error fetching Firestore data for ${gradeLevel}:`, err);
        encounteredError = `Failed to load data for ${gradeLevel}.`;
        gradeSetters[gradeLevel]([]);
        return {
          gradeLevel,
          newState: {
            data: [],
            columns: [],
            status: { exists: false, fileName: "Load Error" },
          },
        };
      }
    });

    try {
      const results = await Promise.all(fetchPromises);
      setGradeDetails((prev) => {
        const nextState = { ...prev };
        results.forEach(({ gradeLevel, newState }) => {
          nextState[gradeLevel] = newState;
        });
        return nextState;
      });
    } catch (err) {
      console.error("Error processing Firestore fetch results:", err);
      encounteredError =
        "An unexpected error occurred while processing loaded data.";
    } finally {
      if (encounteredError) setError(encounteredError);
      setGlobalLoading(false);
    }
  }, [gradeSetters]);

  useEffect(() => {
    loadCloudData();
  }, [loadCloudData]);

  // --- UI Handlers ---
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  }, []);

  const handleSearchChange = useCallback((event, gradeLevel) => {
    const { value } = event.target;
    setSearchTerms((prev) => ({ ...prev, [gradeLevel]: value }));
  }, []);

  const setActionLoadingState = useCallback((gradeLevel, isLoading) => {
    setActionLoading((prev) => ({ ...prev, [gradeLevel]: isLoading }));
  }, []);

  const openDeleteDialog = useCallback((grade) => {
    setGradeToDelete(grade);
    setDeleteDialogOpen(true);
    setError(null);
    setSuccess(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setTimeout(() => setGradeToDelete(null), 150);
  }, []);

  // --- Core Logic (Upload, Delete, Download) ---
  const processAndUploadExcel = useCallback(
    async (file, gradeLevel) => {
      setActionLoadingState(gradeLevel, true);
      setError(null);
      setSuccess(null);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = read(arrayBuffer, { type: "array" });
        const worksheetName = workbook.SheetNames[0];
        if (!worksheetName) throw new Error("Excel file contains no sheets.");
        const worksheet = workbook.Sheets[worksheetName];
        let jsonData = utils.sheet_to_json(worksheet, { defval: "" });
        if (!Array.isArray(jsonData) || jsonData.length === 0)
          throw new Error("Excel sheet is empty or has no data rows.");

        jsonData = jsonData.map((row, index) => {
          const baseRow = typeof row === "object" && row !== null ? row : {};
          const rowWithId = ensureRowId(baseRow, index);
          if (!Object.prototype.hasOwnProperty.call(rowWithId, "Grade Level")) {
            rowWithId["Grade Level"] = gradeLevel;
          }
          return rowWithId;
        });

        const gridColumns = generateColumns(jsonData);
        const payload = {
          data: jsonData,
          fileName: file.name,
          lastUpdated: new Date().toISOString(),
        };
        const docRef = doc(db, COLLECTION_NAME, gradeLevel);
        await setDoc(docRef, payload);

        setGradeDetails((prev) => ({
          ...prev,
          [gradeLevel]: {
            data: jsonData,
            columns: gridColumns,
            status: { exists: true, fileName: file.name },
          },
        }));
        gradeSetters[gradeLevel](jsonData);
        setSuccess(
          `${gradeLevel} data from "${file.name}" uploaded successfully.`
        );
      } catch (err) {
        console.error(`Error processing/uploading ${gradeLevel} Excel:`, err);
        setError(`Upload failed for ${gradeLevel}: ${err.message}.`);
      } finally {
        setActionLoadingState(gradeLevel, false);
      }
    },
    [gradeSetters, setActionLoadingState]
  );

  const handleExcelUpload = useCallback(
    (event, gradeLevel) => {
      const file = event.target.files?.[0];
      event.target.value = null;
      if (file) processAndUploadExcel(file, gradeLevel);
    },
    [processAndUploadExcel]
  );

  const handleDeleteConfirmed = useCallback(async () => {
    if (!gradeToDelete) return;
    const gradeLevel = gradeToDelete;
    setActionLoadingState(gradeLevel, true);
    closeDeleteDialog();
    setError(null);
    setSuccess(null);
    try {
      const docRef = doc(db, COLLECTION_NAME, gradeLevel);
      await deleteDoc(docRef);
      setGradeDetails((prev) => ({
        ...prev,
        [gradeLevel]: {
          data: [],
          columns: [],
          status: { exists: false, fileName: "No data found" },
        },
      }));
      gradeSetters[gradeLevel]([]);
      setSuccess(`${gradeLevel} data deleted successfully.`);
    } catch (err) {
      console.error(`Error deleting ${gradeLevel} data:`, err);
      setError(`Failed to delete ${gradeLevel} data: ${err.message}.`);
    } finally {
      setActionLoadingState(gradeLevel, false);
    }
  }, [gradeToDelete, gradeSetters, closeDeleteDialog, setActionLoadingState]);

  const handleDownloadExcel = useCallback(
    (gradeLevel) => {
      setError(null);
      setSuccess(null);
      const details = gradeDetails[gradeLevel];
      if (
        !details ||
        !Array.isArray(details.data) ||
        details.data.length === 0
      ) {
        setError(`No ${gradeLevel} data available to download.`);
        return;
      }
      try {
        const dataToExport = details.data.map(({ id, ...rest }) => rest);
        const worksheet = utils.json_to_sheet(dataToExport);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, `${gradeLevel} Grades`);
        const dateStamp = new Date().toISOString().split("T")[0];
        const excelFileName = `${gradeLevel}_Grades_${dateStamp}.xlsx`;
        // Use xlsx's writeFile helper for direct download
        write(
          workbook,
          {
            bookType: "xlsx",
            bookSST: true,
            type: "file",
            Props: { Author: "Admin Panel" },
            compression: true,
          },
          excelFileName
        );

        setSuccess(
          `${gradeLevel} data download initiated as ${excelFileName}.`
        );
      } catch (err) {
        console.error(`Error generating ${gradeLevel} Excel file:`, err);
        setError(
          `Failed to generate Excel download for ${gradeLevel}: ${err.message}`
        );
      }
    },
    [gradeDetails]
  );

  // *** <<< FIX: Moved useMemo outside the map loop >>> ***
  // Calculate filtered data for all grades here, outside the render map
  const allFilteredData = useMemo(() => {
    const result = {};
    gradesConfig.forEach(({ id: gradeLevel }) => {
      const details = gradeDetails[gradeLevel];
      const searchTerm = searchTerms[gradeLevel] || ""; // Ensure searchTerm is defined
      const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

      if (!lowerCaseSearchTerm || !Array.isArray(details?.data)) {
        result[gradeLevel] = details?.data || []; // Return original or empty array
      } else {
        try {
          result[gradeLevel] = details.data.filter((row) =>
            Object.values(row).some((value) =>
              String(value ?? "") // Coerce to string, handle null/undefined
                .toLowerCase()
                .includes(lowerCaseSearchTerm)
            )
          );
        } catch (filterError) {
          console.error(`Error filtering data for ${gradeLevel}:`, filterError);
          // In case of error during filtering, return unfiltered data for this grade
          result[gradeLevel] = details.data || [];
          // Optionally set an error state here if needed, but avoid setting state inside useMemo directly
          // setError(`Error filtering ${gradeLevel} data.`); // Don't do this here
        }
      }
    });
    return result;
  }, [gradeDetails, searchTerms]); // Depends on the complete data and all search terms

  // --- JSX Rendering ---
  return (
    <Box sx={{ maxWidth: 1300, margin: "0 auto", p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Admin Panel (Cloud Sync)
        </Typography>
        {globalLoading && <CircularProgress size={24} />}
      </Stack>

      {/* Main Content Area */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden", mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label="Manage Cloud Data"
            sx={{ textTransform: "none", fontWeight: "medium" }}
          />
          <Tab
            label="Preview Data"
            sx={{ textTransform: "none", fontWeight: "medium" }}
          />
        </Tabs>

        {/* Global Messages */}
        <Box sx={{ p: 2 }}>
          {" "}
          {/* Consistent padding for messages */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}
        </Box>

        {/* Tab 0: Manage Cloud Data */}
        {activeTab === 0 && (
          <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
            {" "}
            {/* Adjust padding */}
            {/* ... (Manage Cloud Data content remains largely the same) ... */}
            <Typography variant="h6" gutterBottom>
              Manage Student Data in Cloud
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload/Replace or Download data using Excel (.xlsx) files. Changes
              sync to the cloud.
            </Typography>
            <Grid container spacing={3}>
              {gradesConfig.map(({ id: gradeLevel, label, color, hover }) => {
                const details = gradeDetails[gradeLevel];
                const isActionLoading = actionLoading[gradeLevel];
                // Show loading if action in progress OR globally loading initial state AND no data yet exists
                const isLoading =
                  isActionLoading ||
                  (globalLoading && !details?.status?.exists);
                const hasData =
                  details?.status?.exists && details?.data?.length > 0;
                const statusFileName =
                  details?.status?.fileName || "Status unknown";

                return (
                  <Grid item xs={12} md={4} key={gradeLevel}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: color, mb: 1, fontWeight: "medium" }}
                        >
                          {label} Students
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 2, minHeight: "24px" }}
                        >
                          {isLoading && !isActionLoading ? (
                            <CircularProgress
                              size={20}
                              thickness={4}
                              sx={{ color: "text.secondary" }}
                            />
                          ) : details?.status?.exists ? (
                            <CloudDone color="success" fontSize="small" />
                          ) : statusFileName === "Load Error" ? (
                            <WarningAmber color="error" fontSize="small" />
                          ) : (
                            <CloudOff color="disabled" fontSize="small" />
                          )}
                          <Tooltip title={statusFileName} placement="top">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ fontStyle: "italic", flexGrow: 1 }}
                            >
                              {isLoading && !isActionLoading
                                ? "Checking..."
                                : statusFileName}
                            </Typography>
                          </Tooltip>
                          {isActionLoading && (
                            <CircularProgress size={20} thickness={4} />
                          )}
                        </Stack>
                        <Stack spacing={1.5} sx={{ mt: "auto" }}>
                          <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUpload />}
                            size="small"
                            fullWidth
                            disabled={isActionLoading || globalLoading}
                            sx={{
                              backgroundColor: color,
                              "&:hover": { backgroundColor: hover },
                            }}
                          >
                            {hasData
                              ? "Replace Data (.xlsx)"
                              : "Upload Data (.xlsx)"}
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              hidden
                              onChange={(e) => handleExcelUpload(e, gradeLevel)}
                            />
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<FileDownload />}
                            size="small"
                            fullWidth
                            disabled={
                              !hasData || isActionLoading || globalLoading
                            }
                            onClick={() => handleDownloadExcel(gradeLevel)}
                            sx={{
                              color: color,
                              borderColor: alpha(color, 0.5),
                              "&:hover": {
                                borderColor: color,
                                backgroundColor: alpha(color, 0.05),
                              },
                            }}
                          >
                            Download Data (.xlsx)
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteForever />}
                            size="small"
                            fullWidth
                            disabled={
                              !details?.status?.exists ||
                              isActionLoading ||
                              globalLoading
                            }
                            onClick={() => openDeleteDialog(gradeLevel)}
                          >
                            Delete Cloud Data
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Tab 1: Preview Data Grids */}
        {activeTab === 1 && (
          <Box sx={{ p: { xs: 1, sm: 2 } }}>
            {" "}
            {/* Adjust padding */}
            {gradesConfig.map(({ id: gradeLevel, label, color }) => {
              const details = gradeDetails[gradeLevel];
              const gridIsLoading = actionLoading[gradeLevel] || globalLoading;
              const searchTerm = searchTerms[gradeLevel];
              // *** <<< FIX: Use pre-calculated filtered data >>> ***
              const filteredData = allFilteredData[gradeLevel] || []; // Access the memoized data

              return (
                <Box sx={{ mb: 4 }} key={gradeLevel}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                    sx={{ mb: 1.5 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: color, fontWeight: "medium" }}
                    >
                      {label} Students Preview
                    </Typography>
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Search table..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e, gradeLevel)}
                      disabled={!details?.data?.length || gridIsLoading}
                      sx={{ width: { xs: "100%", sm: 250, md: 300 } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                  <Paper
                    elevation={0}
                    sx={{
                      height: 450,
                      width: "100%",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    {/* Check if original data exists before rendering grid, even if filtered is empty */}
                    {details?.data?.length > 0 ? (
                      <DataGrid
                        rows={filteredData} // Use the correctly filtered data
                        columns={details.columns || []} // Ensure columns is an array
                        loading={gridIsLoading}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: DEFAULT_PAGE_SIZE },
                          },
                        }}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        density="compact"
                        disableRowSelectionOnClick
                        localeText={{
                          noRowsLabel: "No data available for this grade",
                          noResultsOverlayLabel: "No matching records found",
                          MuiTablePagination: { labelRowsPerPage: "Rows:" },
                        }}
                        sx={{
                          border: "none",
                          "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: alpha(color, 0.1),
                          },
                          "& .MuiDataGrid-overlay": {
                            backgroundColor: alpha("#ffffff", 0.7),
                          },
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          p: 3,
                          backgroundColor: alpha(color, 0.03),
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {gridIsLoading
                            ? "Loading data..."
                            : `No ${label} data found.`}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the cloud data for{" "}
            <strong>{gradeToDelete}</strong> students? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Optional Footer Buttons/Navigation */}
      <Box sx={{ mt: 3 }}>
        <Btns />
      </Box>
    </Box>
  );
}
