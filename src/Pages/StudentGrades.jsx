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
import { read, utils, writeFile } from "xlsx"; // Correct imports
import {
  CloudUpload,
  DeleteForever,
  CloudDone,
  CloudOff,
  WarningAmber,
  FileDownload,
  Search,
  Security, // Added Security Icon for Emphasis
} from "@mui/icons-material";
import { useGradesStore } from "../store"; // Adjust path
import { db } from "../firebaseConfig"; // Adjust path
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import Btns from "../Components/Btns"; // Adjust path

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
  const keysToInclude = Object.keys(firstRow).filter((key) => key !== "id"); // Exclude internal 'id'
  return keysToInclude.map((key) => ({
    field: key,
    headerName: key,
    flex: 1,
    minWidth: 130,
    // Optional: Add basic type inference or configuration here if needed
    // type: typeof firstRow[key] === 'number' ? 'number' : 'string',
  }));
};

const ensureRowId = (row, index) => {
  const safeRow = typeof row === "object" && row !== null ? row : {};
  // Prioritize common ID keys, fallback to index
  const potentialId =
    safeRow.id ??
    safeRow.ID ??
    safeRow.StudentID ??
    safeRow["National ID"] ??
    index;
  const finalId =
    typeof potentialId === "string" || typeof potentialId === "number"
      ? potentialId
      : String(potentialId);
  return { ...safeRow, id: finalId }; // Ensure 'id' field exists for DataGrid
};

// --- Component ---
export default function StudentsGrads() {
  // Zustand Store Access
  const { setJuniorGrades, setWheelerGrades, setSeniorGrades } =
    useGradesStore();

  // Component State
  const [activeTab, setActiveTab] = useState(0);
  const [globalLoading, setGlobalLoading] = useState(true); // Initial data load
  const [actionLoading, setActionLoading] = useState({}); // Specific grade actions (upload/delete)
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);
  const [searchTerms, setSearchTerms] = useState(
    gradesConfig.reduce((acc, grade) => ({ ...acc, [grade.id]: "" }), {})
  );
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
    console.log(
      "Loading cloud data... Ensure Firestore rules restrict access!"
    ); // Security Reminder
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
            // Process valid data
            const dataWithIds = cloudData.data.map(ensureRowId); // Ensure 'id' for DataGrid
            const columns = generateColumns(dataWithIds);
            newState = {
              data: dataWithIds,
              columns: columns,
              status: {
                exists: true,
                fileName: cloudData.fileName || "Cloud Data",
              },
            };
            gradeSetters[gradeLevel](dataWithIds);
          } else {
            // Handle invalid data structure in Firestore doc
            console.warn(
              `Invalid 'data' array in Firestore for ${gradeLevel}.`
            );
            newState.status.fileName = "Invalid data structure";
            gradeSetters[gradeLevel]([]);
          }
        } else {
          // Document doesn't exist
          console.log(`No document found for ${gradeLevel}.`);
          gradeSetters[gradeLevel]([]);
        }
        return { gradeLevel, newState };
      } catch (err) {
        console.error(`Error fetching Firestore data for ${gradeLevel}:`, err);
        encounteredError = `Failed to load data for ${gradeLevel}. Check permissions and connection.`;
        gradeSetters[gradeLevel]([]); // Clear store on error
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
      console.error("Error processing fetch results:", err);
      encounteredError = "An unexpected error occurred processing loaded data.";
    } finally {
      if (encounteredError) setError(encounteredError);
      setGlobalLoading(false);
      console.log("Cloud data loading finished.");
    }
  }, [gradeSetters]);

  // Load data on mount
  useEffect(() => {
    loadCloudData();
  }, [loadCloudData]);

  // --- UI Handlers ---
  const handleTabChange = useCallback((_, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  }, []);

  const handleSearchChange = useCallback((event, gradeLevel) => {
    setSearchTerms((prev) => ({ ...prev, [gradeLevel]: event.target.value }));
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
    setTimeout(() => setGradeToDelete(null), 300);
  }, []);

  // --- === CORE LOGIC (Incorporates Upload Fix) === ---

  const processAndUploadExcel = useCallback(
    async (file, gradeLevel) => {
      if (!file) return;
      setActionLoadingState(gradeLevel, true);
      setError(null);
      setSuccess(null);
      console.log(`Processing ${file.name} for ${gradeLevel}...`);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = read(arrayBuffer, { type: "array" });
        const worksheetName = workbook.SheetNames[0];
        if (!worksheetName) throw new Error("Excel file contains no sheets.");

        const worksheet = workbook.Sheets[worksheetName];
        // Read sheet, defaulting empty cells to empty string
        let jsonData = utils.sheet_to_json(worksheet, { defval: "" });

        if (!Array.isArray(jsonData))
          throw new Error("Could not parse sheet data into an array.");

        console.log(
          `Read ${jsonData.length} raw rows from Excel for ${gradeLevel}.`
        );

        // *** === FIX: Sanitize data, ensure IDs, filter empty rows === ***
        let processedData = jsonData
          .map((row, index) => {
            // 1. Ensure row is a valid object
            const baseRow = typeof row === "object" && row !== null ? row : {};

            // 2. Sanitize: Replace undefined with null (Firestore doesn't allow undefined)
            const sanitizedRow = {};
            for (const key in baseRow) {
              if (Object.prototype.hasOwnProperty.call(baseRow, key)) {
                // IMPORTANT: Replace only undefined, keep other falsy values like "", 0, false
                sanitizedRow[key] =
                  baseRow[key] === undefined ? null : baseRow[key];
              }
            }

            // 3. Ensure ID using the sanitized row
            const rowWithId = ensureRowId(sanitizedRow, index);

            // 4. Add Grade Level if missing
            if (
              !Object.prototype.hasOwnProperty.call(rowWithId, "Grade Level")
            ) {
              rowWithId["Grade Level"] = gradeLevel;
            }
            return rowWithId;
          })
          // 5. Filter out potentially empty rows (e.g., from blank lines in Excel)
          // Keep rows if they have more than one key OR the only key isn't 'id'
          .filter(
            (row) =>
              Object.keys(row).length > 1 ||
              (Object.keys(row).length === 1 && !row.hasOwnProperty("id"))
          );

        console.log(
          `Processed ${processedData.length} valid rows for ${gradeLevel} after sanitization/filtering.`
        );

        if (processedData.length === 0 && jsonData.length > 0) {
          // Warn if all rows were filtered out, but allow upload of empty array if intended
          console.warn(
            `Warning: All rows from ${file.name} were filtered out or empty after processing. Uploading empty data array for ${gradeLevel}.`
          );
        } else if (processedData.length === 0) {
          console.warn(
            `Warning: Excel sheet for ${gradeLevel} seems empty. Uploading empty data array.`
          );
        }

        // Generate columns based on the *final* processed data
        const gridColumns = generateColumns(processedData);

        const payload = {
          data: processedData, // Use the sanitized and filtered data
          fileName: file.name,
          lastUpdated: new Date().toISOString(),
        };

        // Basic check before sending to Firestore
        if (!payload.data || !Array.isArray(payload.data)) {
          throw new Error(
            "Internal error: Processed data is not a valid array."
          );
        }

        const docRef = doc(db, COLLECTION_NAME, gradeLevel);
        // *** Firestore Operation: Requires correct security rules ***
        await setDoc(docRef, payload);

        // Update local state and Zustand store
        setGradeDetails((prev) => ({
          ...prev,
          [gradeLevel]: {
            data: processedData,
            columns: gridColumns,
            status: { exists: true, fileName: file.name },
          },
        }));
        gradeSetters[gradeLevel](processedData);

        setSuccess(
          `${gradeLevel} data from "${file.name}" uploaded successfully (${processedData.length} rows).`
        );
      } catch (err) {
        console.error(`Error processing/uploading ${gradeLevel} Excel:`, err);
        let message = `Upload failed for ${gradeLevel}: ${err.message}.`;
        // Add specific hints based on common errors
        if (
          err.message.includes("invalid data") ||
          err.message.includes("undefined")
        ) {
          message +=
            " Possible issue with empty cells or data format in Excel. Ensure file is clean.";
        } else if (
          err.message.includes("Missing or insufficient permissions")
        ) {
          message += " Check Firestore security rules and user authentication.";
        } else {
          message += " Check file format, console logs, and Firestore rules.";
        }
        setError(message);
      } finally {
        setActionLoadingState(gradeLevel, false);
      }
    },
    [gradeSetters, setActionLoadingState] // Dependencies
  );

  const handleExcelUpload = useCallback(
    (event, gradeLevel) => {
      const file = event.target.files?.[0];
      event.target.value = null; // Reset input
      if (file) {
        processAndUploadExcel(file, gradeLevel);
      } else {
        console.log("No file selected.");
      }
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
    console.log(`Attempting to delete data for ${gradeLevel}...`);
    try {
      const docRef = doc(db, COLLECTION_NAME, gradeLevel);
      // *** Firestore Operation: Requires correct security rules ***
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
      setSuccess(`${gradeLevel} data deleted successfully from the cloud.`);
      console.log(`${gradeLevel} data deleted.`);
    } catch (err) {
      console.error(`Error deleting ${gradeLevel} data:`, err);
      let message = `Failed to delete ${gradeLevel} data: ${err.message}.`;
      if (err.message.includes("Missing or insufficient permissions")) {
        message += " Check Firestore security rules.";
      }
      setError(message);
    } finally {
      setActionLoadingState(gradeLevel, false);
    }
  }, [gradeToDelete, gradeSetters, closeDeleteDialog, setActionLoadingState]);

  const handleDownloadExcel = useCallback(
    (gradeLevel) => {
      setError(null);
      setSuccess(null);
      const details = gradeDetails[gradeLevel];

      if (!details?.data?.length) {
        // Simplified check
        setError(`No ${gradeLevel} data available to download.`);
        return;
      }

      console.log(`Preparing download for ${gradeLevel}...`);
      try {
        // Prepare data: Remove the internal 'id' added for DataGrid
        const dataToExport = details.data.map(({ id, ...rest }) => rest);

        const worksheet = utils.json_to_sheet(dataToExport);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, `${gradeLevel} Grades`);

        const dateStamp = new Date().toISOString().split("T")[0];
        const excelFileName = `${gradeLevel}_Grades_${dateStamp}.xlsx`;

        // Use writeFile for client-side download trigger
        writeFile(workbook, excelFileName, { bookType: "xlsx", bookSST: true });

        setSuccess(`Download initiated for ${excelFileName}.`);
        console.log(`Download started for ${gradeLevel}.`);
      } catch (err) {
        console.error(`Error generating ${gradeLevel} Excel file:`, err);
        setError(
          `Failed to generate Excel download for ${gradeLevel}: ${err.message}`
        );
      }
    },
    [gradeDetails]
  );

  // --- Memoized Filtered Data (Client-Side Filtering) ---
  // Efficiently recalculates only when source data or search terms change.
  const allFilteredData = useMemo(() => {
    const result = {};
    gradesConfig.forEach(({ id: gradeLevel }) => {
      const details = gradeDetails[gradeLevel];
      const searchTerm = searchTerms[gradeLevel]?.toLowerCase().trim() || "";

      if (!searchTerm || !details?.data?.length) {
        result[gradeLevel] = details?.data || []; // No search or no data
      } else {
        try {
          result[gradeLevel] = details.data.filter((row) =>
            // Search across all stringified values in the row
            Object.values(row).some((value) =>
              String(value ?? "")
                .toLowerCase()
                .includes(searchTerm)
            )
          );
        } catch (filterError) {
          console.error(`Error filtering data for ${gradeLevel}:`, filterError);
          result[gradeLevel] = details?.data || []; // Fallback on error
        }
      }
    });
    // console.log("Filtered data recalculated:", result); // Debug log
    return result;
  }, [gradeDetails, searchTerms]);

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
        {globalLoading && !Object.values(actionLoading).some(Boolean) && (
          <CircularProgress size={24} titleAccess="Loading initial data..." />
        )}
      </Stack>

      {/* Security Warning Box */}
      <Alert
        severity="warning"
        icon={<Security fontSize="inherit" />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          Security Notice:
        </Typography>
        <Typography variant="caption">
          This panel loads grade data into the browser. Ensure **strict
          Firestore Security Rules** are configured to restrict access ONLY to
          authorized admins. For enhanced security in production, consider
          implementing server-side operations (e.g., using Cloud Functions) for
          data fetching and modification.
        </Typography>
      </Alert>

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

        {/* Global Messages Container */}
        <Box
          sx={{
            p: 2,
            minHeight: "60px",
            display: error || success ? "block" : "none",
          }}
        >
          {" "}
          {/* Ensure space even when empty */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: success ? 1 : 0 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
        </Box>

        {/* Tab 0: Manage Cloud Data */}
        {activeTab === 0 && (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Manage Student Data in Cloud
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload, replace, download, or delete grade data. Changes sync to
              Firestore. Ensure your Excel files are clean.
            </Typography>
            <Grid container spacing={3}>
              {gradesConfig.map(({ id: gradeLevel, label, color, hover }) => {
                const details = gradeDetails[gradeLevel];
                const isActionInProgress = actionLoading[gradeLevel];
                const isInitialLoading =
                  globalLoading && details?.status?.fileName === "Checking...";
                const isLoading = isActionInProgress || isInitialLoading;
                const hasData =
                  details?.status?.exists && !!details?.data?.length;
                const statusFileName =
                  details?.status?.fileName || "Status unknown";
                const isErrorState =
                  statusFileName === "Load Error" ||
                  statusFileName === "Invalid data structure" ||
                  statusFileName.includes("Error");

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
                          pt: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: color, mb: 1, fontWeight: "medium" }}
                        >
                          {label} Students
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {/* Status Indicator */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: 2, minHeight: "24px" }}
                        >
                          {isLoading ? (
                            <CircularProgress
                              size={20}
                              thickness={4}
                              sx={{ color: "text.secondary" }}
                            />
                          ) : details?.status?.exists ? (
                            <CloudDone color="success" fontSize="small" />
                          ) : isErrorState ? (
                            <WarningAmber color="error" fontSize="small" />
                          ) : (
                            <CloudOff color="disabled" fontSize="small" />
                          )}
                          <Tooltip title={statusFileName} placement="top" arrow>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{
                                fontStyle: "italic",
                                flexGrow: 1,
                                cursor: "default",
                              }}
                            >
                              {isLoading ? "Processing..." : statusFileName}
                            </Typography>
                          </Tooltip>
                          {isActionInProgress && (
                            <CircularProgress size={20} thickness={4} />
                          )}
                        </Stack>

                        {/* Action Buttons */}
                        <Stack spacing={1.5} sx={{ mt: "auto" }}>
                          <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUpload />}
                            size="small"
                            fullWidth
                            disabled={isLoading || globalLoading}
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
                              accept=".xlsx"
                              hidden
                              onChange={(e) => handleExcelUpload(e, gradeLevel)}
                            />
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<FileDownload />}
                            size="small"
                            fullWidth
                            disabled={!hasData || isLoading || globalLoading}
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
                              isLoading ||
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
            {gradesConfig.map(({ id: gradeLevel, label, color }) => {
              const details = gradeDetails[gradeLevel];
              const gridIsLoading =
                actionLoading[gradeLevel] ||
                (globalLoading &&
                  !details?.status?.exists &&
                  details?.status?.fileName !== "No data found");
              const searchTerm = searchTerms[gradeLevel];
              const filteredData = allFilteredData[gradeLevel] || []; // Use memoized data

              return (
                <Box sx={{ mb: 4 }} key={gradeLevel}>
                  {/* Grid Header & Search */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                    sx={{ mb: 1.5, px: 1 }}
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
                      aria-label={`Search ${label} students table`}
                    />
                  </Stack>

                  {/* DataGrid Container */}
                  <Paper
                    elevation={0}
                    sx={{
                      height: 450,
                      width: "100%",
                      border: 1,
                      borderColor: "divider",
                      position: "relative",
                    }}
                  >
                    {/* Render Grid only if columns exist */}
                    {details?.columns?.length > 0 ? (
                      <DataGrid
                        rows={filteredData}
                        columns={details.columns}
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
                          noRowsLabel: `No ${label} data found`,
                          noResultsOverlayLabel: "No matching records found",
                          MuiTablePagination: { labelRowsPerPage: "Rows:" },
                          // Add more descriptive text if needed
                          footerRowSelected: (count) =>
                            `${count.toLocaleString()} row(s) selected`,
                        }}
                        sx={{
                          border: "none",
                          "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: alpha(color, 0.1),
                            fontWeight: "bold",
                          },
                          "& .MuiDataGrid-overlay": {
                            backgroundColor: alpha("#ffffff", 0.7),
                          },
                          "& .MuiDataGrid-virtualScroller + .MuiDataGrid-overlay":
                            { backgroundColor: alpha(color, 0.03) },
                          "& .MuiDataGrid-cell": {
                            borderColor: alpha(color, 0.1),
                          }, // Subtle cell borders
                          "& .MuiDataGrid-footerContainer": {
                            borderTop: `1px solid ${alpha(color, 0.2)}`,
                          }, // Themed footer border
                        }}
                        // Consider adding getRowClassName for conditional row styling
                        // getRowClassName={(params) => params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'}
                      />
                    ) : (
                      // Placeholder when no columns/data or during initial load phase
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
                        {gridIsLoading ? (
                          <Stack spacing={1} alignItems="center">
                            <CircularProgress size={30} sx={{ color: color }} />
                            <Typography variant="body2" color="text.secondary">
                              Loading data...
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                          >
                            {details?.status?.fileName?.includes("Error")
                              ? `Error loading ${label} data.`
                              : `No ${label} data found or uploaded yet.`}
                          </Typography>
                        )}
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
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to permanently delete the cloud data for{" "}
            <strong>{gradeToDelete}</strong> students? This action cannot be
            undone and requires appropriate permissions.
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
            startIcon={<DeleteForever />}
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
