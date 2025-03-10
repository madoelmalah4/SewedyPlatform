import React from "react";
import { Route, Routes } from "react-router-dom";
import Landing from "./Pages/Landing";
import NavbarLayOut from "./Layouts/NavbarLayOut";
import About from "./Pages/About";
import IsAuthLayOut from "./Layouts/IsAuthLayOut";
import Courses from "./Pages/Courses";
import NoMatchRoute from "./Pages/NoMatchRoute";
import Login from "./Pages/Login";
import Work from "./Pages/Work.jsx";
import AdminNavbarLayOut from "./Layouts/AdminNavbarLayOut.jsx";
import Orders from "./Pages/Orders.jsx";
import Apply from "./Pages/Apply.jsx";
import ScrollToTop from "./Components/ScrollToTop .jsx";
import AchievementList from "./Pages/AchievmentList.jsx";
import AddAchievment from "./Pages/AddAchievment.jsx";

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<NavbarLayOut />}>
          <Route path="/" index element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/Work" element={<Work />} />
          <Route path="/login/admin" element={<Login />} />
          <Route path="/apply" element={<Apply />} />
          <Route element={<IsAuthLayOut />}>
            <Route path="/courses" element={<Courses />} />
          </Route>

          <Route path="*" element={<NoMatchRoute />} />
        </Route>

        <Route element={<AdminNavbarLayOut />}>
          <Route path="/orders" element={<Orders />} />
          <Route path="/acheivments" element={<AchievementList />} />
          <Route path="/addachiev" element={<AddAchievment />} />
          <Route path="/editachiev/:id" element={<AddAchievment />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;





