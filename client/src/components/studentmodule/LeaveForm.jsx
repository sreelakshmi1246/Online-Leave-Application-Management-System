import React, { useState } from "react";

function LeaveForm({ onSubmit }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newLeave = {
      id: Date.now(),
      fromDate,
      toDate,
      reason,
      status: "Pending",
    };

    onSubmit(newLeave); // send leave data to parent component
    setFromDate("");
    setToDate("");
    setReason("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#f5f5f5",
        padding: "20px",
        borderRadius: "10px",
        margin: "20px auto",
        maxWidth: "500px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3>Apply for Leave</h3>
      <div style={{ marginBottom: "10px" }}>
        <label>From Date: </label><br />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>To Date: </label><br />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Reason: </label><br />
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter your reason"
          required
          style={{ width: "100%", height: "70px" }}
        ></textarea>
      </div>

      <button
        type="submit"
        style={{
          backgroundColor: "#1976d2",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Submit Leave
      </button>
    </form>
  );
}

export default LeaveForm;
