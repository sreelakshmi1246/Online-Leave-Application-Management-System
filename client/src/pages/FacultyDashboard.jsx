// src/pages/FacultyDashboard.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../components/studentmodule/Navbar";
import FacultyPage from "./FacultyPage";


function FacultyDashboard() {
  return (
    <div>
      <Navbar role="faculty" />
      <Routes>
        <Route index element={<FacultyPage />} />
        {/* later you can add more nested routes like leave details, reports etc. */}
      </Routes>
    </div>
  );
}

export default FacultyDashboard;
