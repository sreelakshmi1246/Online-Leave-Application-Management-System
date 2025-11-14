// client/src/pages/StudentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { myLeaves as apiMyLeaves, applyLeave as apiApplyLeave, cancelLeave as apiCancelLeave } from "@/services/leave";
import API from "@/services/api";
import { toast } from "@/hooks/use-toast";

// Gemini API Constants (kept as in your old UI)
const apiKey = ""; // supply in env if you want
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// Helper Component: Leave ProgressBar
const LeaveProgressBar = ({ used, total }) => {
  const percentage = Math.min(100, (used / total) * 100);
  const color = percentage > 80 ? "var(--destructive)" : "var(--primary)";
  return (
    <div className="progress-card">
      <h3 className="text-sm font-semibold mb-2">Leave Balance</h3>
      <div className="flex justify-between items-end mb-1">
        <p className="text-2xl font-extrabold" style={{ color: color }}>
          {total - used}
        </p>
        <p className="text-sm text-muted-foreground">Remaining of {total} Days</p>
      </div>
      <div className="progress-bar">
        <div
          className="progress-filled"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

function StudentDashboard() {
  // current user from localStorage (AuthContext populates this on login)
  const rawUser = typeof window !== "undefined" && localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  // UI state (kept same as your old UI)
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // form fields (we only expose casual & medical)
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);

  // AI & error states
  const [errorMessage, setErrorMessage] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // leaves and faculty
  const [leaves, setLeaves] = useState([]);
  const [facultyAdvisor, setFacultyAdvisor] = useState(null);
  const [loading, setLoading] = useState(false);

  // rules
  const CASUAL_LIMIT = 8;
  const MEDICAL_LIMIT = 7;
  const TOTAL_ANNUAL_LEAVES = 15; // kept for the progress bar if you want overall

  // fetch leaves & mapping on mount
  useEffect(() => {
    fetchLeaves();
    fetchMyMapping();
  }, []);

  async function fetchLeaves() {
    try {
      setLoading(true);
      const res = await apiMyLeaves();
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load leaves:", err);
      toast({ title: "Error", description: "Failed to load leaves", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // get student's faculty mapping (your backend route /mapping/my)
  async function fetchMyMapping() {
    try {
      const res = await API.get("/mapping/my"); // expects mapping or faculty in response
      const data = res.data || {};
      // Try common shapes: { faculty: { ... } } or { mapping: { faculty: {...} } } or just { mapping }
      setFacultyAdvisor(data.faculty || data.mapping?.faculty || data.mapping || null);
    } catch (err) {
      // not critical; mapping may not exist
      setFacultyAdvisor(null);
    }
  }

  // AI drafting (kept as in your previous UI)
  const handleAiDrafting = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMessage("Please enter at least 5 characters for the reason before using the AI assistant.");
      return;
    }

    setIsDrafting(true);
    setErrorMessage("");

    const systemPrompt =
      "You are a professional assistant for a student leave management system. Your task is to rewrite the user's provided reason for leave into a concise, formal, and clearly understandable statement suitable for a university or school administration. Ensure the tone is respectful and the purpose is clear. Do not add salutations or sign-offs. Only provide the drafted sentence/paragraph.";
    const userQuery = `Draft a formal leave reason based on the following: "${reason}"`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
      let response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // one simple retry
        await new Promise((r) => setTimeout(r, 1000));
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`AI service failed: ${response.status}`);
      }

      const result = await response.json();
      const draftedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (draftedText) setReason(draftedText.trim());
      else setErrorMessage("AI drafting failed. Please try again.");
    } catch (err) {
      console.error("AI drafting error:", err);
      setErrorMessage("AI drafting failed. Check console.");
    } finally {
      setIsDrafting(false);
    }
  };

  // compute used days (approved) for progress and validation
  const approvedCasualUsed = useMemo(
    () =>
      leaves
        .filter((l) => (l.type === "casual" || l.type === "Causal Leave" || (l.type && l.type.toLowerCase().includes("casual"))) && l.status === "approved")
        .reduce((s, l) => s + (l.days ?? l.totalDays ?? 0), 0),
    [leaves]
  );

  const approvedMedicalUsed = useMemo(
    () =>
      leaves
        .filter((l) => (l.type === "medical" || l.type === "Medical Leave" || (l.type && l.type.toLowerCase().includes("medical"))) && l.status === "approved")
        .reduce((s, l) => s + (l.days ?? l.totalDays ?? 0), 0),
    [leaves]
  );

  const usedLeavesForProgress = useMemo(
    () => leaves.reduce((s, l) => s + (l.days ?? l.totalDays ?? 0), 0),
    [leaves]
  );

  // validate before submit (client-side); backend will re-check
  function validateSubmit() {
    if (!leaveType || !fromDate || !reason.trim()) return "Please fill in required fields (type, from date, reason).";
    if (!toDate) return "Please select a To Date.";
    const s = new Date(fromDate);
    const t = new Date(toDate);
    if (s > t) return "From Date cannot be after To Date.";

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.round((t - s) / msPerDay) + 1;

    if (leaveType === "casual") {
      if (approvedCasualUsed + days > CASUAL_LIMIT) return `Applying ${days} days exceeds casual limit (${CASUAL_LIMIT}). Approved used: ${approvedCasualUsed}.`;
    } else if (leaveType === "medical") {
      if (approvedMedicalUsed + days > MEDICAL_LIMIT) return `Applying ${days} days exceeds medical limit (${MEDICAL_LIMIT}). Approved used: ${approvedMedicalUsed}.`;
    }
    return null;
  }

  // handle file input
  const onFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  // submit leave
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const validation = validateSubmit();
    if (validation) {
      setErrorMessage(validation);
      return;
    }

    const fd = new FormData();
    fd.append("type", leaveType); // 'casual' or 'medical'
    fd.append("fromDate", fromDate);
    fd.append("toDate", toDate);
    fd.append("reason", reason);
    if (file) fd.append("attachments", file); // backend expects attachments array

    try {
      setLoading(true);
      const res = await apiApplyLeave(fd);
      toast({ title: "Applied", description: res.data?.message || "Leave applied" });
      setShowForm(false);
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
      setFile(null);
      await fetchLeaves();
    } catch (err) {
      console.error("Apply error:", err);
      toast({ title: "Apply failed", description: err?.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // cancel leave
  const confirmCancel = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this leave?")) return;
    try {
      setLoading(true);
      await apiCancelLeave(leaveId);
      toast({ title: "Cancelled" });
      await fetchLeaves();
    } catch (err) {
      console.error("Cancel error:", err);
      toast({ title: "Cancel failed", description: err?.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // editing existing (keeps old UI behavior but backend edit route not implemented here)
  const editLeave = (leave) => {
    setEditMode(true);
    // normalise backend fields -> UI fields if necessary
    setLeaveType(leave.type === "casual" ? "casual" : leave.type === "medical" ? "medical" : leave.type);
    const from = leave.fromDate || leave.from;
    const to = leave.toDate || leave.to;
    setFromDate(from ? new Date(from).toISOString().slice(0, 10) : "");
    setToDate(to ? new Date(to).toISOString().slice(0, 10) : "");
    setReason(leave.reason || "");
    setShowForm(true);
  };

  // view details
  const viewLeave = (leave) => {
    setShowViewModal(leave);
  };

  // remove (old UI uses confirm modal) -> we use confirm & cancel API
  const removeLeave = (id) => setConfirmDeleteId(id);
  const confirmRemoval = () => {
    if (!confirmDeleteId) return;
    confirmCancel(confirmDeleteId);
    setConfirmDeleteId(null);
  };
  const cancelRemoval = () => setConfirmDeleteId(null);

  return (
    <>
      <style>{`
        /* (copied your old CSS block exactly so UI looks the same) */
        :root {
          --primary: #0a3d62;
          --primary-light: #e6ecf3;
          --destructive: #d4183d;
          --success-color: #28a745;
          --warning-color: #f7a007;
          --muted: #e8e8ec;
          --muted-foreground: #717182;
          --card: #fff;
          --border: #ddd;
          --radius: 10px;
          --input-background: #f3f3f5;
        }
        body { background: #f5f6f8; font-family: 'Inter', sans-serif; }
        .dashboard-layout { display: grid; grid-template-columns: 230px 1fr; min-height: 100vh; }
        .sidebar { background: var(--card); border-right: 1px solid var(--border); padding: 20px; }
        .sidebar-logo { font-weight: 700; color: var(--primary); margin-bottom: 1rem; font-size: 1.1rem; }
        .nav-link { display: flex; align-items: center; gap: 10px; padding: 10px 15px; color: #333; text-decoration: none; border-radius: var(--radius); margin-bottom: 8px; transition: 0.2s; }
        .nav-link:hover, .nav-link.active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
        .main-content-area { padding: 20px 40px; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .logout-btn { background: var(--destructive); color: white; border: none; padding: 8px 16px; border-radius: var(--radius); cursor: pointer; font-weight: 600; }
        .summary-section { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
        .progress-card, .apply-card, .leave-card, .notification-section, .faculty-section { background: var(--card); border: 1px solid var(--border); padding: 20px; border-radius: var(--radius); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .progress-card { flex: 1; min-width: 250px; }
        .apply-card { flex: 1; min-width: 250px; text-align: center; background: var(--primary); color: white; display: flex; flex-direction: column; justify-content: center; }
        .apply-card button { background: white; color: var(--primary); border: none; padding: 10px 18px; border-radius: var(--radius); cursor: pointer; font-weight: 600; margin-top: 10px; }
        .progress-bar { height: 8px; background-color: var(--muted); border-radius: 4px; overflow: hidden; }
        .progress-filled { height: 100%; transition: width 0.6s ease; }
        .notification-section { margin-bottom: 20px; }
        .notification { background: var(--primary-light); border-radius: 8px; padding: 10px; margin-bottom: 8px; font-size: 0.9rem; color: var(--primary); }
        .applications-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        .leave-card { display: flex; flex-direction: column; }
        .leave-card h4 { margin-top: 0; color: var(--primary); font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 5px; margin-bottom: 10px; }
        .leave-card p { margin: 4px 0; font-size: 0.9rem; }
        .actions { margin-top: auto; padding-top: 10px; display: flex; gap: 10px; justify-content: flex-end; }
        .actions button { padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; border: 1px solid var(--border); background: var(--muted); }
        .actions button:hover { opacity: 0.9; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
        .modal-content { background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 450px; max-height: 90vh; overflow-y: auto; box-shadow: 0 5px 20px rgba(0,0,0,0.3); }
        .modal-content h3 { margin-top: 0; color: var(--primary); border-bottom: 2px solid var(--primary-light); padding-bottom: 10px; margin-bottom: 20px; }
        .modal-content form { display: flex; flex-direction: column; gap: 10px; }
        .modal-content label { font-weight: 600; margin-bottom: 2px; display: block; font-size: 0.9rem; }
        .modal-content input, .modal-content select, .modal-content textarea { padding: 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--input-background); }
        .modal-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .modal-buttons button { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
        .modal-buttons button[type="submit"], .modal-buttons .btn-primary { background: var(--primary); color: white; }
        .modal-buttons button[type="button"], .modal-buttons .btn-secondary { background: var(--muted); color: var(--muted-foreground); }
        .error-message { background: rgba(212, 24, 61, 0.1); color: var(--destructive); padding: 10px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 15px; border: 1px solid var(--destructive); }
        .reason-group { display: flex; flex-direction: column; }
        .btn-draft { background: var(--warning-color); color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; transition: opacity 0.2s; display: flex; align-items: center; gap: 5px; margin-top: 5px; width: fit-content; }
        .btn-draft:disabled { opacity: 0.5; cursor: not-allowed; }
        .loading-spinner { border: 3px solid rgba(255, 255, 255, 0.3); border-top: 3px solid white; border-radius: 50%; width: 14px; height: 14px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">NITC Leave Portal</div>
          <a href="#" className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Dashboard
          </a>
          <a href="#" className={`nav-link ${activeTab === "notifications" ? "active" : ""}`} onClick={() => setActiveTab("notifications")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.375 22h3.25"/><path d="M12 22c2.073-1.666 2.073-3.333 0-5"/></svg>
            Notifications
          </a>
          <a href="#" className={`nav-link ${activeTab === "faculty" ? "active" : ""}`} onClick={() => setActiveTab("faculty")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Faculty Advisor
          </a>
        </aside>

        {/* Main Content */}
        <main className="main-content-area">
          <div className="dashboard-header">
            <div>
              <h2>{currentUser?.name || "Student"}</h2>
              <p className="text-sm text-muted-foreground">{currentUser?.rollNo || currentUser?.email}</p>
            </div>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}>Logout</button>
          </div>

          {activeTab === "dashboard" && (
            <>
              <section className="summary-section">
                <LeaveProgressBar used={usedLeavesForProgress} total={TOTAL_ANNUAL_LEAVES} />
                <div className="apply-card">
                  <h3>Apply for Leave</h3>
                  <button onClick={() => setShowForm(true)}>+ New Application</button>
                </div>
              </section>

              <h3 className="text-xl font-bold mb-3 mt-5">Recent Applications</h3>
              {leaves.length === 0 ? (
                <p className="p-4 bg-white rounded-lg border">No leave applications yet.</p>
              ) : (
                <div className="applications-grid">
                  {leaves.map((leave) => (
                    <div key={leave._id || leave.id} className="leave-card">
                      <h4>{(leave.type === 'casual' ? 'Casual Leave' : leave.type === 'medical' ? 'Medical Leave' : leave.type)} ({leave.days ?? leave.totalDays} Days)</h4>
                      <p><strong>Period:</strong> {new Date(leave.fromDate || leave.from).toISOString().slice(0,10)} → {new Date(leave.toDate || leave.to).toISOString().slice(0,10)}</p>
                      <p className="text-muted-foreground truncate">{leave.reason}</p>
                      <p className="text-sm">Status:
                          <strong style={{ color: leave.status === 'approved' ? 'var(--success-color)' : leave.status === 'pending' ? 'var(--warning-color)' : 'var(--destructive)' }}>
                            {' '}{leave.status?.charAt(0)?.toUpperCase() + (leave.status?.slice(1) || '')}
                          </strong>
                      </p>
                      <div className="actions">
                        {leave.status === "pending" && (
                          <>
                            <button onClick={() => editLeave(leave)}>Edit</button>
                            <button onClick={() => removeLeave(leave._id || leave.id)} style={{ backgroundColor: 'rgba(212, 24, 61, 0.1)', color: 'var(--destructive)'}}>Cancel</button>
                          </>
                        )}
                        <button onClick={() => viewLeave(leave)} className="bg-primary-light text-primary">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "notifications" && (
            <section className="notification-section">
              <h3>Notifications</h3>
              {/* placeholder: you will wire real notifications later */}
              <div className="notification">No new notifications</div>
            </section>
          )}

          {activeTab === "faculty" && (
            <section className="faculty-section">
              <h3>Faculty Advisor Contact</h3>
              {facultyAdvisor ? (
                <>
                  <p><strong>Name:</strong> {facultyAdvisor.name}</p>
                  <p><strong>Email:</strong> {facultyAdvisor.email}</p>
                  <p><strong>Department:</strong> {facultyAdvisor.department}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No faculty assigned</p>
              )}
            </section>
          )}

          {/* Leave Application Form Modal */}
          {showForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>{editMode ? "Edit Leave Application" : "New Leave Application"}</h3>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <form onSubmit={handleSubmit}>
                  <label>Leave Type</label>
                  <select value={leaveType} onChange={(e) => { setLeaveType(e.target.value); setErrorMessage(""); }} required>
                    <option value="">Select Leave Type</option>
                    <option value="casual">Casual Leave</option>
                    <option value="medical">Medical Leave</option>
                  </select>

                  <label>From Date</label>
                  <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setErrorMessage(""); }} required />

                  <label>To Date</label>
                  <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setErrorMessage(""); }} required />

                  <div className="reason-group">
                    <label>Reason Summary</label>
                    <textarea
                      value={reason}
                      onChange={(e) => { setReason(e.target.value); setErrorMessage(""); }}
                      required
                      rows="3"
                      placeholder="Briefly explain the reason for your leave."
                      disabled={isDrafting}
                    />
                    <div style={{ marginTop: 8 }}>
                      <button type="button" className="btn-draft" onClick={handleAiDrafting} disabled={isDrafting}>
                        {isDrafting ? <span className="loading-spinner" /> : "Draft with AI"}
                      </button>
                    </div>
                  </div>

                  {leaveType === "medical" && (
                    <>
                      <label>Upload Proof (PDF Only)</label>
                      <input type="file" accept="application/pdf" onChange={onFileChange} />
                      <p className="text-xs text-muted-foreground">Required for medical, if available.</p>
                    </>
                  )}

                  <div className="modal-buttons">
                    <button type="button" onClick={() => { setShowForm(false); setEditMode(false); setErrorMessage(""); }} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isDrafting || loading}>{editMode ? "Update" : "Submit"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Modal */}
          {showViewModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Leave Details ({showViewModal._id || showViewModal.id})</h3>
                <p><strong>Type:</strong> {(showViewModal.type === 'casual' ? 'Casual Leave' : showViewModal.type === 'medical' ? 'Medical Leave' : showViewModal.type)}</p>
                <p><strong>Period:</strong> {new Date(showViewModal.fromDate || showViewModal.from).toISOString().slice(0,10)} → {new Date(showViewModal.toDate || showViewModal.to).toISOString().slice(0,10)}</p>
                <p><strong>Total Days:</strong> {showViewModal.days ?? showViewModal.totalDays}</p>
                <p><strong>Reason:</strong> {showViewModal.reason}</p>
                <p><strong>Status:</strong> {showViewModal.status}</p>
                <p><strong>Submitted:</strong> {(showViewModal.createdAt ? new Date(showViewModal.createdAt).toISOString().slice(0,10) : showViewModal.submitted)}</p>
                <div className="modal-buttons">
                  <button type="button" className="btn-primary" onClick={() => setShowViewModal(null)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Cancel Modal (fallback) */}
          {confirmDeleteId && (
            <div className="modal">
              <div className="modal-content">
                <h3>Confirm Cancellation</h3>
                <p>Are you sure you want to cancel this leave request ({confirmDeleteId})? This action cannot be undone.</p>
                <div className="modal-buttons">
                  <button type="button" className="btn-secondary" onClick={cancelRemoval}>No, Keep It</button>
                  <button type="button" style={{ backgroundColor: 'var(--destructive)', color: 'white' }} onClick={confirmRemoval}>Yes, Cancel</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default StudentDashboard;
