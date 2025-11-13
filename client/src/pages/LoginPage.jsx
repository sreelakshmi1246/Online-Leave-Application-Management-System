// src/pages/LoginPage.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Loginpage.css";
import { AuthContext } from "../context/AuthContext";
import { loginRequest } from "../services/auth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !role) {
      setError("Please fill in all fields, including role.");
      return;
    }

    if (!email.toLowerCase().endsWith("@nitc.ac.in")) {
      setError("Only NITC email addresses (@nitc.ac.in) are allowed.");
      return;
    }

    try {
      setIsLoading(true);
      // 🔹 Call backend API (POST /api/auth/login)
      const res = await loginRequest(email, password);

      const { token, user } = res.data;

      // (Optional sanity check: make sure selected role matches backend)
      if (user.role !== role) {
        setError(
          `Selected role (${role}) does not match your assigned role (${user.role}).`
        );
        setIsLoading(false);
        return;
      }

      // 🔹 Store in context (and localStorage automatically)
      login(token, user);

      // 🔹 Redirect by role
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "faculty") navigate("/faculty");
      else navigate("/student");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          NITC ONLINE LEAVE APPLICATION MANAGEMENT SYSTEM
        </h2>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email (NITC ID)</label>
            <input
              type="email"
              placeholder="e.g., student@nitc.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="input-group">
            <label>Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="login-input"
              required
            >
              <option value="">-- Select Role --</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty Advisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
