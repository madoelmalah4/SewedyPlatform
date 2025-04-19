// src/pages/Admin/UserManagementPage.jsx (Example Path)
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
  Divider,
  Link,
  Chip,
  Snackbar, // Added Snackbar back for feedback
} from "@mui/material";
// --- Import hooks ---
import {
 useGetUsersQuery, // Still assuming endpoint needs correction
  useDeleteUserMutation,
} from "../Slices/AuthSlice/AuthInjection.js"; // Adjust path
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled, useTheme } from "@mui/material/styles";

import AddAdminForm from "./AddAdminForm"; // Adjust path

// --- Styled Components ---
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  /* ... as before ... */
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[700]
      : theme.palette.grey[200],
  "& .MuiTableCell-head": {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  /* ... as before ... */
  "&:nth-of-type(odd)": { backgroundColor: theme.palette.action.hover },
  "&:last-child td, &:last-child th": { border: 0 },
  "&:hover": { backgroundColor: theme.palette.action.selected },
  "& .MuiTableCell-root": { padding: "8px 12px", fontSize: "0.875rem" },
}));
// --- End Styled Components ---

function UserManagementPage() {
  const theme = useTheme();

  // --- State ---
  const [userData, setUserData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // For delete feedback
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [deletingUserId, setDeletingUserId] = useState(null);

  // --- RTK Hooks ---
  const {
    data: rawUserData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    isError: isUserListError,
    error: userListError,
    refetch: refetchUsers,
  } = useGetUsersQuery(undefined, {});
  const [deleteUser, { isLoading: isDeletingUser, error: deleteError }] =
    useDeleteUserMutation();

  // --- Effects ---
  useEffect(() => {
    // Process fetched data
    if (rawUserData?.data && Array.isArray(rawUserData.data)) {
      const usersWithTempIds = rawUserData.data.map((user, i) => ({
        ...user,
        tempId: i,
      }));
      setUserData(usersWithTempIds);
    } else if (Array.isArray(rawUserData)) {
      const usersWithTempIds = rawUserData.map((user, i) => ({
        ...user,
        tempId: i,
      }));
      setUserData(usersWithTempIds);
    } else if (!isLoadingUsers && !isFetchingUsers) {
      setUserData([]);
    }
  }, [rawUserData, isLoadingUsers, isFetchingUsers]);

  useEffect(() => {
    // Filtering
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const dataToFilter = Array.isArray(userData) ? userData : [];
    const filtered = dataToFilter.filter(
      (user) =>
        user &&
        (user.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
          user.name_own?.toLowerCase().includes(lowerCaseSearchTerm) ||
          user.role?.toLowerCase().includes(lowerCaseSearchTerm) ||
          user.email_own?.toLowerCase().includes(lowerCaseSearchTerm))
    );
    setFilteredUsers(filtered);
    setPage(0);
  }, [searchTerm, userData]);

  // --- Handlers ---
  const handleUserSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleUserRefresh = () => {
    setSearchTerm("");
    refetchUsers();
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

 const handleDeleteUser = async (userId, userName) => {
   const idToDelete = userId;

   if (!idToDelete && idToDelete !== 0) {
     setSnackbarMessage("Error: Cannot delete user without a valid ID.");
     setSnackbarSeverity("error");
     setSnackbarOpen(true);
     return;
   }

   if (
     window.confirm(
       `Are you sure you want to delete user "${userName || "this user"}"?`
     )
   ) {
     setDeletingUserId(idToDelete);

     try {
       // 🛠️ Make sure you pass the correct structure expected by your API
       await deleteUser(userName).unwrap();

       setSnackbarMessage(`User "${userName || "User"}" deleted successfully!`);
       setSnackbarSeverity("success");
     } catch (err) {
       console.error("Failed to delete user:", err);
       const message =
         err?.data?.message || err?.error || "Failed to delete user.";
       setSnackbarMessage(`Error: ${message}`);
       setSnackbarSeverity("error");
     } finally {
       setDeletingUserId(null);
       setSnackbarOpen(true);
     }
   }
 };

  // --- End Handlers ---

  // Paginated data calculation (unchanged)
  const currentUsers = Array.isArray(filteredUsers) ? filteredUsers : [];
  const paginatedUsers = currentUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // getRoleChipColor function (unchanged)
  const getRoleChipColor = (role) => {
    /* ... */
  };

  // --- Render Logic for User List ---
  const renderUserList = () => {
    // Loading/Error/Empty checks (unchanged)
    if (isLoadingUsers)
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );
    if (isUserListError)
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {userListError?.data?.message ||
            userListError?.error ||
            "Failed to load users."}
        </Alert>
      );
    if (!userData.length && !isFetchingUsers)
      return (
        <Typography sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          No users found.
        </Typography>
      );
    if (!filteredUsers.length && searchTerm)
      return (
        <Typography sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          No users match search term "{searchTerm}".
        </Typography>
      );
    if (isFetchingUsers && !isLoadingUsers)
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );

    return (
      <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mt: 4 }}>
        {/* Search and Refresh Toolbar (Unchanged) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            px: 1,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h6">Existing Users</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleUserSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: "250px" } }}
            />
            <Tooltip title="Refresh User List">
              <IconButton
                onClick={handleUserRefresh}
                color="primary"
                disabled={isLoadingUsers || isFetchingUsers}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* --- User Table with Password Column --- */}
        <TableContainer>
          <Table stickyHeader size="small" aria-label="users table">
            <StyledTableHead>
              <TableRow>
                {/* Adjust columns based on actual user data fields */}
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Password</TableCell> {/* <-- ADDED Header */}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {paginatedUsers.map((user) => {
                const userId = user.id ?? user.tempId;
                const userName = user?.name || user?.name_own || "User";
                const isCurrentlyDeleting = deletingUserId === userId;

                return (
                  <StyledTableRow key={userId}>
                    {/* Data Cells */}
                    <TableCell sx={{ fontWeight: 500 }}>{userName}</TableCell>
                    <TableCell>
                      <Chip
                        label={user?.role || "N/A"}
                        color={getRoleChipColor(user?.role)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                  

                    {/* --- Password Cell --- */}
                    {/* WARNING: Displaying passwords/hashes directly is a security concern. */}
                    {/* This assumes your API returns a 'password' field. Ideally, it shouldn't for list views. */}
                    <TableCell
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        wordBreak: "break-all",
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user?.password ? user?.password : "N/A"}{" "}
                      {/* Display asterisks instead of actual value */}
                      {/* Or display actual hash: user?.password || 'N/A' */}
                    </TableCell>
                    {/* --- End Password Cell --- */}

                    {/* Actions Cell */}
                    <TableCell align="right">
                      <Tooltip title="Delete User">
                        <span>
                          <IconButton
                            onClick={() => handleDeleteUser(userId, userName)}
                            color="error"
                            disabled={isCurrentlyDeleting || isDeletingUser}
                            size="small"
                          >
                            {isCurrentlyDeleting ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination (Unchanged) */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    );
  };
  // --- End Render Logic ---

  // --- Main Page Return ---
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AddAdminForm />
      <Divider sx={{ my: 4 }} />
      {renderUserList()}

      {/* Snackbar for Delete Feedback */}
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
    </Container>
  );
  // --- End Main Page Return ---
}

export default UserManagementPage;
