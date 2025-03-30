"use client";

import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  InputAdornment,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Mock data for students - simplified to only include ID and name
const MOCK_STUDENTS = [
  { id: "ID1001", name: "Ethan Blake", gradeLevel: "Junior" },
  { id: "ID1002", name: "Ava Carter", gradeLevel: "Senior" },
  { id: "ID1003", name: "Oliver Davis", gradeLevel: "Wheeler" },
  { id: "ID1004", name: "Sophia Evans", gradeLevel: "Senior" },
  { id: "ID1005", name: "William Foster", gradeLevel: "Wheeler" },
  { id: "ID1006", name: "Isabella Grant", gradeLevel: "Senior" },
  { id: "ID1007", name: "Lucas Hayes", gradeLevel: "Junior" },
  { id: "ID1008", name: "Mia Jenkins", gradeLevel: "Wheeler" },
  { id: "ID1009", name: "Alexander King", gradeLevel: "Junior" },
  { id: "ID1010", name: "Abigail Lane", gradeLevel: "Senior" },
];



// Grade level options
const GRADE_LEVELS = ["All Students", "Junior", "Wheeler", "Senior"];

const StudentGrades = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [filteredStudents, setFilteredStudents] = useState(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  


  const handleDownload = (type) => {
    const data = filteredStudents.map((student) => ({
      "Student ID": student.id,
      Name: student.name,
      "Grade Level": student.gradeLevel,
    }));
  
    if (type === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      FileSaver.saveAs(blob, "students.xlsx");
    } else if (type === "word") {
      const doc = new Document({
        sections: [
          {
            children: data.map(
              (student) =>
                new Paragraph({
                  children: [
                    new TextRun(
                      `Student ID: ${student["Student ID"]}, Name: ${student.Name}, Grade Level: ${student["Grade Level"]}`
                    ),
                  ],
                })
            ),
          },
        ],
      });
  
      Packer.toBlob(doc).then((blob) => {
        FileSaver.saveAs(blob, "students.docx");
      });
    }
  };



  useEffect(() => {
    let result = [...students];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by grade level tab
    if (tabValue > 0) {
      result = result.filter(
        (student) => student.gradeLevel === GRADE_LEVELS[tabValue]
      );
    }

    setFilteredStudents(result);
  }, [searchQuery, tabValue, students]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle menu open
  const handleMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle edit student - navigate to edit page
  const handleEditStudent = () => {
    handleMenuClose();
    // Navigate to edit page with student ID
    navigate(`/edit-student/${selectedStudent.id}`);
  };

  // Handle delete student dialog open
  const handleDeleteDialogOpen = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  // Handle delete student dialog close
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  // Handle confirm delete student
  const handleConfirmDelete = () => {
    setStudents(
      students.filter((student) => student.id !== selectedStudent.id)
    );
    setOpenDeleteDialog(false);
  };

  // Get chip color based on grade level
  const getChipColor = (gradeLevel) => {
    switch (gradeLevel) {
      case "Junior":
        return "success";
      case "Senior":
        return "error";
      case "Wheeler":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: "#e53935", fontWeight: "bold" }}
          >
            Student Grades
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage student grading details across all grade levels.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download data">
            <IconButton onClick={() => handleDownload("excel")}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ bgcolor: "#f5f5f5", color: "#757575" }}>
            <Typography variant="subtitle2">AD</Typography>
          </Avatar>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              {GRADE_LEVELS.map((level, index) => (
                <Tab key={index} label={level} />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ mt: 3, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search students by name or ID"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Advanced filters">
                      <IconButton>
                        <FilterListIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: "#f5f5f5" },
              }}
            />
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: 2 }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Grade Level</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.gradeLevel}
                        color={getChipColor(student.gradeLevel)}
                        sx={{
                          borderRadius: "16px",
                          width: "100px",
                          color: "white",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, student)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredStudents.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No students found matching your search criteria.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Student actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditStudent}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Student
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Student
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedStudent?.name}? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentGrades;
