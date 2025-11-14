// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/shared/ProtectedRoute";
import { AuthContext } from "./context/AuthContext";

const queryClient = new QueryClient();

function App() {
  const { user } = useContext(AuthContext);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/" element={<LoginPage />} />

            {/* 🧱 Protected Routes — only logged-in users can access */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty/*"
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
