import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // go up two folders

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useContext(AuthContext);

  // If not logged in
  if (!user) return <Navigate to="/" replace />;

  // If role not allowed
  if (allowedRoles.length && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;

  // If allowed
  return children;
}
