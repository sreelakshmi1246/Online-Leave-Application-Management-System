import React from "react";
import { Link } from "react-router-dom";

function Navbar({ role }) {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      backgroundColor: "#1976d2",
      color: "white",
    }}>
      <h3>OLAMS</h3>
      <div>
        {role === "student" && (
          <>
            <Link to="/student" style={{ color: "white", marginRight: "20px" }}>Dashboard</Link>
            <Link to="/" style={{ color: "white" }}>Logout</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
