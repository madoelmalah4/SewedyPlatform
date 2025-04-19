import React from "react";
import { Route, Routes } from "react-router-dom";

// Layouts & Guards
import NavbarLayOut from "./Layouts/NavbarLayOut";
import IsAuthLayOut from "./Layouts/IsAuthLayOut";
import TechAdminProtectedLayout from "./Layouts/TechAdminProtectedLayout";
import GradAdminProtectedLayout from "./Layouts/GradAdminProtectedLayout";

// Page Components
import Landing from "./Pages/Landing";
import About from "./Pages/About";
import Work from "./Pages/Work";
import Login from "./Pages/Login";
import Apply from "./Pages/Apply";
import EmploymentForm from "./Pages/EmploymentForm";
import StudentsForm from "./Pages/StudentsForm";
import NoMatchRoute from "./Pages/NoMatchRoute";

// Admin Page Components
import Orders from "./Pages/Orders";
import AchievementList from "./Pages/AchievmentList";
import StudentGrades from "./Pages/StudentGrades";
import UserManagementPage from "./Pages/UserManagementPage";

// Utilities
import AdminEmploymentDashboard from "./Pages/AdminEmploymentDashboard";
import ScrollToTop from "./Components/ScrollToTop";
import SuperAdminRouteGuard from "./Layouts/SuperAdminRouteGuard";
import AdminNavbarLayOut from "./Layouts/AdminNavbarLayOut";

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<NavbarLayOut />}>
          <Route path="/" index element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/Work" element={<Work />} />
          <Route path="/login/admin" element={<Login />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/emp" element={<EmploymentForm />} />
          <Route path="/students/:grade" element={<StudentsForm />} />
        </Route>

        {/* Authenticated Routes Wrapper */}
        <Route element={<IsAuthLayOut />}>
          <Route element={<AdminNavbarLayOut />}>
            {/* Super Admin Routes */}
            <Route element={<SuperAdminRouteGuard />}>
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/acheivments" element={<AchievementList />} />
              <Route path="/admin/studentsgrad" element={<StudentGrades />} />
              <Route
                path="/admin/empdata"
                element={<AdminEmploymentDashboard />}
              />
              <Route path="/admin/users" element={<UserManagementPage />} />
              {/* Add other super admin routes like /admin/settings etc. */}
            </Route>

            {/* Tech Admin Routes */}
            <Route element={<TechAdminProtectedLayout />}>
              <Route path="/tech/orders" element={<Orders />} />
              <Route
                path="/tech/empdata"
                element={<AdminEmploymentDashboard />}
              />
              {/* Add other tech admin routes */}
            </Route>

            {/* Grad Admin Routes */}
            <Route element={<GradAdminProtectedLayout />}>
              <Route path="/grad/studentsgrad" element={<StudentGrades />} />
              <Route path="/grad/acheivments" element={<AchievementList />} />
              {/* Add other grad admin routes */}
            </Route>
          </Route>
        </Route>
        {/* Final Catch-All 404 Route */}
        <Route path="*" element={<NoMatchRoute />} />
      </Routes>
    </>
  );
};

export default App;
