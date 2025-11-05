import React from "react";
import Navbar from "../components/studentmodule/Navbar";

function FacultyDashboard() {
  return (
    <div>
      <Navbar role="faculty" />
      <h2>Faculty Dashboard</h2>
      <p>Pending approvals (mock data)</p>
    </div>
  );
}

export default FacultyDashboard;
