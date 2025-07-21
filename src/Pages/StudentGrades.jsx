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
import { read, utils, writeFile } from "xlsx";
import {
  CloudUpload,
  DeleteForever,
  CloudDone,
  CloudOff,
  WarningAmber,
  FileDownload,
  Search,
  Security,
} from "@mui/icons-material";
import { useGradesStore } from "../store"; // Adjust path
import { db } from "../firebaseConfig"; // Adjust path
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import Btns from "../Components/Btns"; // Adjust path

// --- Configuration ---
const COLLECTION_NAME = "gradeData";
const gradesConfig = [
  { id: "Junior", label: "Junior", color: "#4CAF50", hover: "#3d8b40" },
  { id: "Cs", label: "Cs", color: "#E6B325", hover: "#c99a1e" },
  {
    id: "Information",
    label: "Information",
    color: "#F44336",
    hover: "#d32f2f",
  },
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
  const safeRow = typeof row === "object" && row !== null ? row : {};
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
  return { ...safeRow, id: finalId };
};

// --- Component ---
export default function StudentsGrads() {
  // Zustand Store Access
  const { setJuniorGrades, setCsGrades, setInformationGrades } =
    useGradesStore();

  // Component State
  const [activeTab, setActiveTab] = useState(0);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
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
      Cs: setCsGrades,
      Information: setInformationGrades,
    }),
    [setJuniorGrades, setCsGrades, setInformationGrades]
  );

  // --- DEFENSIVE CHECK HELPER ---
  const callGradeSetter = useCallback(
    (gradeLevel, data) => {
      const setter = gradeSetters[gradeLevel];
      if (typeof setter === "function") {
        setter(data);
      } else {
        const errorMessage = `CRITICAL: No store setter function found for grade level "${gradeLevel}". Check your useGradesStore definition in store.js. Expected to find a function like "set${gradeLevel}Grades".`;
        console.error(errorMessage);
        setError(errorMessage); // Show error to the admin
      }
    },
    [gradeSetters]
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
                fileName: cloudData.fileName || "Cloud Data",
              },
            };
            callGradeSetter(gradeLevel, dataWithIds);
          } else {
            newState.status.fileName = "Invalid data structure";
            callGradeSetter(gradeLevel, []);
          }
        } else {
          callGradeSetter(gradeLevel, []);
        }
        return { gradeLevel, newState };
      } catch (err) {
        encounteredError = `Failed to load data for ${gradeLevel}.`;
        callGradeSetter(gradeLevel, []);
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
      encounteredError = "An unexpected error occurred processing loaded data.";
    } finally {
      if (encounteredError) setError(encounteredError);
      setGlobalLoading(false);
    }
  }, [callGradeSetter]);

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

  // --- CORE LOGIC ---
  const processAndUploadExcel = useCallback(
    async (file, gradeLevel) => {
      if (!file) return;
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

        if (!Array.isArray(jsonData))
          throw new Error("Could not parse sheet data.");

        let processedData = jsonData
          .map((row, index) => {
            const baseRow = typeof row === "object" && row !== null ? row : {};
            const sanitizedRow = {};
            for (const key in baseRow) {
              if (Object.prototype.hasOwnProperty.call(baseRow, key)) {
                sanitizedRow[key] =
                  baseRow[key] === undefined ? null : baseRow[key];
              }
            }
            const rowWithId = ensureRowId(sanitizedRow, index);
            if (
              !Object.prototype.hasOwnProperty.call(rowWithId, "Grade Level")
            ) {
              rowWithId["Grade Level"] = gradeLevel;
            }
            return rowWithId;
          })
          .filter(
            (row) =>
              Object.keys(row).length > 1 ||
              (Object.keys(row).length === 1 && !row.hasOwnProperty("id"))
          );

        const gridColumns = generateColumns(processedData);
        const payload = {
          data: processedData,
          fileName: file.name,
          lastUpdated: new Date().toISOString(),
        };

        const docRef = doc(db, COLLECTION_NAME, gradeLevel);
        await setDoc(docRef, payload);

        setGradeDetails((prev) => ({
          ...prev,
          [gradeLevel]: {
            data: processedData,
            columns: gridColumns,
            status: { exists: true, fileName: file.name },
          },
        }));

        callGradeSetter(gradeLevel, processedData);

        setSuccess(
          `${gradeLevel} data from "${file.name}" uploaded successfully (${processedData.length} rows).`
        );
      } catch (err) {
        let message = `Upload failed for ${gradeLevel}: ${err.message}.`;
        setError(message);
      } finally {
        setActionLoadingState(gradeLevel, false);
      }
    },
    [setActionLoadingState, callGradeSetter]
  );

  const handleExcelUpload = useCallback(
    (event, gradeLevel) => {
      const file = event.target.files?.[0];
      event.target.value = null;
      if (file) {
        processAndUploadExcel(file, gradeLevel);
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
      callGradeSetter(gradeLevel, []);
      setSuccess(`${gradeLevel} data deleted successfully from the cloud.`);
    } catch (err) {
      setError(`Failed to delete ${gradeLevel} data: ${err.message}.`);
    } finally {
      setActionLoadingState(gradeLevel, false);
    }
  }, [
    gradeToDelete,
    closeDeleteDialog,
    setActionLoadingState,
    callGradeSetter,
  ]);

  const handleDownloadExcel = useCallback(
    (gradeLevel) => {
      const details = gradeDetails[gradeLevel];
      if (!details?.data?.length) {
        setError(`No ${gradeLevel} data available to download.`);
        return;
      }
      try {
        const dataToExport = details.data.map(({ id, ...rest }) => rest);
        const worksheet = utils.json_to_sheet(dataToExport);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, `${gradeLevel} Grades`);
        const excelFileName = `${gradeLevel}_Grades_${new Date().toISOString().split("T")[0]}.xlsx`;
        writeFile(workbook, excelFileName);
        setSuccess(`Download initiated for ${excelFileName}.`);
      } catch (err) {
        setError(
          `Failed to generate Excel download for ${gradeLevel}: ${err.message}`
        );
      }
    },
    [gradeDetails]
  );

  const allFilteredData = useMemo(() => {
    const result = {};
    gradesConfig.forEach(({ id: gradeLevel }) => {
      const details = gradeDetails[gradeLevel];
      const searchTerm = searchTerms[gradeLevel]?.toLowerCase().trim() || "";
      if (!searchTerm || !details?.data?.length) {
        result[gradeLevel] = details?.data || [];
      } else {
        result[gradeLevel] = details.data.filter((row) =>
          Object.values(row).some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(searchTerm)
          )
        );
      }
    });
    return result;
  }, [gradeDetails, searchTerms]);

  return (
    <Box sx={{ maxWidth: 1300, margin: "0 auto", p: { xs: 1, sm: 2, md: 3 } }}>
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
          <CircularProgress size={24} />
        )}
      </Stack>

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
          authorized admins.
        </Typography>
      </Alert>

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

        <Box
          sx={{
            p: 2,
            minHeight: "60px",
            display: error || success ? "block" : "none",
          }}
        >
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

        {activeTab === 0 && (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Manage Student Data in Cloud
            </Typography>
            <Grid container spacing={3}>
              {gradesConfig.map(({ id: gradeLevel, label, color, hover }) => {
                const details = gradeDetails[gradeLevel];
                const isLoading =
                  actionLoading[gradeLevel] ||
                  (globalLoading &&
                    details?.status?.fileName === "Checking...");
                const hasData =
                  details?.status?.exists && !!details?.data?.length;

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
                          sx={{ color, mb: 1, fontWeight: "medium" }}
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
                          {isLoading ? (
                            <CircularProgress size={20} />
                          ) : details?.status?.exists ? (
                            <CloudDone color="success" />
                          ) : (
                            <CloudOff color="disabled" />
                          )}
                          <Tooltip
                            title={details?.status?.fileName}
                            placement="top"
                            arrow
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ fontStyle: "italic" }}
                            >
                              {isLoading
                                ? "Processing..."
                                : details?.status?.fileName}
                            </Typography>
                          </Tooltip>
                        </Stack>
                        <Stack spacing={1.5} sx={{ mt: "auto" }}>
                          <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUpload />}
                            disabled={isLoading}
                            sx={{
                              backgroundColor: color,
                              "&:hover": { backgroundColor: hover },
                            }}
                          >
                            {hasData ? "Replace Data" : "Upload Data"}
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
                            disabled={!hasData || isLoading}
                            onClick={() => handleDownloadExcel(gradeLevel)}
                            sx={{
                              color,
                              borderColor: alpha(color, 0.5),
                              "&:hover": {
                                borderColor: color,
                                backgroundColor: alpha(color, 0.05),
                              },
                            }}
                          >
                            Download
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteForever />}
                            disabled={!details?.status?.exists || isLoading}
                            onClick={() => openDeleteDialog(gradeLevel)}
                          >
                            Delete
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

        {activeTab === 1 && (
          <Box sx={{ p: { xs: 1, sm: 2 } }}>
            {gradesConfig.map(({ id: gradeLevel, label, color }) => {
              const details = gradeDetails[gradeLevel];
              const gridIsLoading =
                actionLoading[gradeLevel] ||
                (globalLoading &&
                  !details?.status?.exists &&
                  details?.status?.fileName !== "No data found");
              const filteredData = allFilteredData[gradeLevel] || [];

              return (
                <Box sx={{ mb: 4 }} key={gradeLevel}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1.5, px: 1 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color, fontWeight: "medium" }}
                    >
                      {label} Students Preview
                    </Typography>
                    <TextField
                      size="small"
                      variant="outlined"
                      placeholder="Search table..."
                      value={searchTerms[gradeLevel]}
                      onChange={(e) => handleSearchChange(e, gradeLevel)}
                      disabled={!details?.data?.length || gridIsLoading}
                      sx={{ width: { xs: "100%", sm: 300 } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
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
                        sx={{
                          border: "none",
                          "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: alpha(color, 0.1),
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
                        }}
                      >
                        {gridIsLoading ? (
                          <CircularProgress sx={{ color }} />
                        ) : (
                          <Typography color="text.secondary">{`No ${label} data found.`}</Typography>
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

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the cloud data for{" "}
            <strong>{gradeToDelete}</strong> students?
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
          >
            Delete Data
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ mt: 3 }}>
        <Btns />
      </Box>
    </Box>
  );
}
