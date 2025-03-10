import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Typography, Box, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useLazyGetAllWorkQuery } from "../Slices/AuthSlice/AuthInjection";

const Orders = () => {
  const navigate = useNavigate();
  const [triggerGetOrders, { data: orders, isLoading, isError }] =
    useLazyGetAllWorkQuery();
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch orders on component mount
  useEffect(() => {
    triggerGetOrders();
  }, [triggerGetOrders]);

  // Update local data when API call succeeds
  useEffect(() => {
    if (orders) {
      setFilteredData(orders);
    }
  }, [orders]);

  // Handle search filtering
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value) {
      setFilteredData(
        orders.filter((order) =>
          Object.values(order).some((field) =>
            String(field).toLowerCase().includes(value)
          )
        )
      );
    } else {
      setFilteredData(orders);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography variant="h6" color="error" align="center" mt={4}>
        Error loading orders. Please try again.
      </Typography>
    );
  }

  const columns = [
    { field: "company_name", headerName: "Company Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "f_name", headerName: "First Name", flex: 1 },
    { field: "l_name", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "project_information",
      headerName: "Project Info",
      flex: 1,
      sortable: false,
    },
    { field: "massege", headerName: "Message", flex: 1, sortable: false },
  ];

  // Generate a unique ID if one isn't provided
  const getRowId = (row) => row.id || `${row.email}-${row.phone}`;

  return (
    <Box p={4}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
      >
        Total Orders
      </Typography>

      <TextField
        label="Search Orders"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 3 }}
      />

      <Box height={600}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={getRowId} // Fix for missing `id`
          sortingOrder={["asc", "desc"]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default Orders;
