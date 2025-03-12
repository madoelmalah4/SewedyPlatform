"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  Box,
  TextField,
  Button,
  ButtonGroup,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import {
  useEditAcheivmentStatusMutation,
  useLazyGetAllWorkQuery,
} from "../Slices/AuthSlice/AuthInjection";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingIcon from "@mui/icons-material/Pending";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

// Status options for the orders
const STATUS_OPTIONS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

// Custom toolbar component
function CustomToolbar(props) {
  const { onRefresh, onExport } = props;

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport csvOptions={{ fileName: "orders-export" }} />
      <Tooltip title="Refresh data">
        <IconButton onClick={onRefresh}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </GridToolbarContainer>
  );
}

const Orders = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [triggerGetOrders, { data: orders, isLoading, isError }] =
    useLazyGetAllWorkQuery();
  const [editStatus, { isLoading: isUpdating }] =
    useEditAcheivmentStatusMutation();

  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders function
  const fetchOrders = useCallback(() => {
    triggerGetOrders();
  }, [triggerGetOrders]);

  // Update local data when API call succeeds
  useEffect(() => {
    if (orders) {
      setFilteredData(orders);
    }
  }, [orders]);

  // Apply all filters
  useEffect(() => {
    if (!orders) return;

    let result = [...orders];

    // Apply search term filter
    if (searchTerm) {
      result = result.filter((order) =>
        Object.entries(order).some(([key, fieldValue]) => {
          // Only search through string fields
          if (typeof fieldValue === "string" || fieldValue instanceof String) {
            return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        })
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Apply date filter (assuming there's a created_at field)
    if (dateFilter !== "all" && orders[0]?.created_at) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateFilter) {
        case "today":
          result = result.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= today;
          });
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          result = result.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= weekAgo;
          });
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          result = result.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= monthAgo;
          });
          break;
      }
    }

    setFilteredData(result);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Handle search input change
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  // Handle date filter change
  const handleDateFilterChange = useCallback((e) => {
    setDateFilter(e.target.value);
  }, []);

  // Handle status change
  const handleStatusChange = useCallback(
    async (email, status) => {
      try {
        await editStatus({ email, status }).unwrap();

        // Update local state to reflect the change
        setFilteredData((prevData) =>
          prevData.map((order) =>
            order.email === email ? { ...order, status } : order
          )
        );

        setNotification({
          open: true,
          message: `Status updated to ${status}`,
          severity: "success",
        });

        // Refresh data after status change
        fetchOrders();
      } catch (error) {
        console.error("Failed to update status:", error);
        setNotification({
          open: true,
          message: `Failed to update status: ${error.message || "Unknown error"}`,
          severity: "error",
        });
      }
    },
    [editStatus, fetchOrders]
  );

  // Open confirmation dialog
  const openStatusDialog = useCallback((order, status) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setOpenDialog(true);
  }, []);

  // Confirm status change
  const confirmStatusChange = useCallback(() => {
    if (selectedOrder && newStatus) {
      handleStatusChange(selectedOrder.email, newStatus);
      setOpenDialog(false);
    }
  }, [selectedOrder, newStatus, handleStatusChange]);

  // Close notification
  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  // Menu handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!orders)
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      };

    return {
      total: orders.length,
      pending: orders.filter(
        (order) => order.status === STATUS_OPTIONS.PENDING || !order.status
      ).length,
      inProgress: orders.filter(
        (order) => order.status === STATUS_OPTIONS.IN_PROGRESS
      ).length,
      completed: orders.filter(
        (order) => order.status === STATUS_OPTIONS.COMPLETED
      ).length,
    };
  }, [orders]);

  // Loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (isError) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading orders
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            There was a problem fetching the order data. Please try again.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchOrders}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  // Status cell renderer
  const renderStatusCell = (params) => {
    const status = params.value || STATUS_OPTIONS.PENDING;
    let color = "default";
    let icon = null;

    switch (status) {
      case STATUS_OPTIONS.PENDING:
        color = "warning";
        icon = <PendingIcon fontSize="small" />;
        break;
      case STATUS_OPTIONS.IN_PROGRESS:
        color = "info";
        icon = <HourglassTopIcon fontSize="small" />;
        break;
      case STATUS_OPTIONS.COMPLETED:
        color = "success";
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      default:
        color = "default";
    }

    return (
      <Chip
        icon={icon}
        label={status}
        color={color}
        size="small"
        sx={{ minWidth: 120 }}
      />
    );
  };

  // Action buttons renderer
  const renderActionButtons = (params) => {
   const statusButtons = [
     ["success", "Completed", "Completed"],
     ["warning", "Pending", "PENDING"],
     ["info", "In Progress", "IN PROGRESS"],
   ];

    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        {statusButtons.map(([color, status, label]) => (
          <Button
            key={status}
            variant={params.row.status === status ? "contained" : "outlined"}
            color={color}
            size="small"
            sx={{ fontSize: "0.75rem", padding: "2px 6px" , p:1 }}
            onClick={() =>
              openStatusDialog(params.row, status)
            }
          >
            {label}
          </Button>
        ))}
      </Box>
    );
  };

  // DataGrid columns
  const columns = [
    {
      field: "company_name",
      headerName: "Company Name",
      flex: 1,
      minWidth: 150,
    },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 130 },
    { field: "f_name", headerName: "First Name", flex: 1, minWidth: 120 },
    { field: "l_name", headerName: "Last Name", flex: 1, minWidth: 120 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    {
      field: "project_information",
      headerName: "Project Info",
      flex: 1.5,
      minWidth: 200,
      sortable: false,
    },
    {
      field: "massege",
      headerName: "Message",
      flex: 1.5,
      minWidth: 200,
      sortable: false,
      // Fixed the typo from "massege" to "message"
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      renderCell: renderStatusCell,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      minWidth: 250,
      sortable: false,
      renderCell: renderActionButtons,
    },
  ];

  // Generate a unique ID if one isn't provided
  const getRowId = (row) => row.id || `${row.email}-${row.phone}`;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Orders Dashboard
        </Typography>

        <Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                fetchOrders();
              }}
            >
              <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
              Refresh Data
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              backgroundColor: theme.palette.primary.main,
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    Total Orders
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: "bold", mt: 1 }}>
                    {statistics.total}
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              backgroundColor: theme.palette.warning.main,
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    Pending
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: "bold", mt: 1 }}>
                    {statistics.pending}
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              backgroundColor: theme.palette.info.main,
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    In Progress
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: "bold", mt: 1 }}>
                    {statistics.inProgress}
                  </Typography>
                </Box>
                <HourglassTopIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              backgroundColor: theme.palette.success.main,
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                    Completed
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: "bold", mt: 1 }}>
                    {statistics.completed}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Filter Orders
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Search Orders"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name, email, company..."
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value={STATUS_OPTIONS.PENDING}>Pending</MenuItem>
                <MenuItem value={STATUS_OPTIONS.IN_PROGRESS}>
                  In Progress
                </MenuItem>
                <MenuItem value={STATUS_OPTIONS.COMPLETED}>Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                onChange={handleDateFilterChange}
                label="Date Range"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid> */}
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 25, 50, 100]}
          getRowId={getRowId}
          sortingOrder={["asc", "desc"]}
          disableSelectionOnClick
          loading={isUpdating}
          density="standard"
          components={{
            Toolbar: CustomToolbar,
            NoRowsOverlay: () => (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Typography variant="body2" color="text.secondary">
                  No orders found matching your filters
                </Typography>
              </Box>
            ),
          }}
          componentsProps={{
            toolbar: {
              onRefresh: fetchOrders,
            },
          }}
          sx={{
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f0f0f0",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f9f9f9",
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: "#fff",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: "#f9f9f9",
            },
            "& .MuiDataGrid-toolbarContainer": {
              padding: 2,
            },
          }}
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status of order from{" "}
            {selectedOrder?.company_name} to "{newStatus}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmStatusChange}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders;
