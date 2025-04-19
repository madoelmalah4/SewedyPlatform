// src/Layouts/AdminNavbarLayOut.jsx
"use client"; // If using Next.js App Router

import React, { useMemo } from "react"; // Import useMemo
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Toolbar } from "@mui/material"; // Import Box and Toolbar

// --- Import shared Admin Navbar ---
import AdminNavbar from "../Navbars/AdminNavbar"; // Adjust path to the reusable navbar

// --- Import Selectors ---
import { selectUserRole } from "../Slices/AuthSlice/Authslice"; // Adjust path

// --- Import Icons ---
// Import ALL icons needed for ANY role's navbar here
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BuildIcon from "@mui/icons-material/Build";
import StorageIcon from "@mui/icons-material/Storage";
import BugReportIcon from "@mui/icons-material/BugReport";

// --- Define Navigation Items for Each Role ---
// Make sure paths match your <Route> definitions in App.jsx

const superAdminNavItems = [
  // { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" }, // Optional main dashboard link
  { text: "Orders", icon: <AssignmentIcon />, path: "/admin/orders" },
  {
    text: "Achievements",
    icon: <EmojiEventsIcon />,
    path: "/admin/acheivments",
  },
  { text: "Student Grades", icon: <SchoolIcon />, path: "/admin/studentsgrad" },
  { text: "Hiring Coders Data", icon: <BusinessIcon />, path: "/admin/empdata" },
  { text: "Manage Users", icon: <PersonAddIcon />, path: "/admin/users" }, // Contains add form
  // { text: "Settings", icon: <SettingsIcon />, path: "/admin/settings" },
];

const techAdminNavItems = [
  // { text: "Tech Dashboard", icon: <BuildIcon />, path: "/tech" }, // Optional main dashboard link
  { text: "Orders", icon: <AssignmentIcon />, path: "/tech/orders" },
  { text: "Hiring Coders Data", icon: <BusinessIcon />, path: "/tech/empdata" },
  // { text: "Logs", icon: <BugReportIcon />, path: "/tech/logs" },
  // { text: "Configuration", icon: <SettingsIcon />, path: "/tech/settings" },
];

const gradAdminNavItems = [
  // { text: "Grad Dashboard", icon: <SchoolIcon />, path: "/grad" }, // Optional main dashboard link
  { text: "Student Grades", icon: <SchoolIcon />, path: "/grad/studentsgrad" },
  {
    text: "Achievements",
    icon: <EmojiEventsIcon />,
    path: "/grad/acheivments",
  },
  // { text: "Placement", icon: <BusinessCenterIcon />, path: "/grad/placement" },
  // { text: "Reports", icon: <AssessmentIcon />, path: "/grad/reports" },
];
// --- End Navigation Item Definitions ---

const AdminNavbarLayOut = () => {
  // Get the user's role from Redux store
  const userRole = useSelector(selectUserRole);

  

  // Determine which nav items and title to use based on the role
  const { navItems, pageTitle } = useMemo(() => {
    switch (
      userRole?.toLowerCase() // Use optional chaining and lowercase
    ) {
      case "super admin":
        return {
          navItems: superAdminNavItems,
          pageTitle: "Super Admin Dashboard",
        };
      case "tech admin":
        return { navItems: techAdminNavItems, pageTitle: "Tech Admin Area" };
      case "grad admin":
        return {
          navItems: gradAdminNavItems,
          pageTitle: "Graduate Admin Area",
        };
      default:
        // Fallback for unknown roles or if role is not yet loaded
        // Return empty array or maybe a single link to a generic dashboard/home
        return { navItems: [], pageTitle: "Admin Area" };
    }
  }, [userRole]); // Recalculate only when userRole changes

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Pass the determined navItems and title to the reusable AdminNavbar */}
      <AdminNavbar navItems={navItems} pageTitle={pageTitle} />
      {/* Add the Toolbar spacer here to prevent content overlap */}
      <Toolbar sx={{ minHeight: { xs: 64, md: 70 } }} />{" "}
      {/* Match AdminNavbar's Toolbar height */}
      {/* Main content area where nested routes will render */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        {" "}
        {/* Add padding */}
        <Outlet />
      </Box>
      {/* Optional: Shared Footer for all admin roles */}
      {/* <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'text.secondary', borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
                <Typography variant="body2">Admin Panel Footer</Typography>
            </Box> */}
    </Box>
  );
};

export default AdminNavbarLayOut;
