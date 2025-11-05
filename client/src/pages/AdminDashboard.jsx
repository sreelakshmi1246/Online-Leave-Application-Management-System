// src/pages/AdminDashboard.jsx
import { Routes, Route } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import Dashboard from "./Dashboard";
import Students from "./Students";
import Faculty from "./Faculty";
import Mappings from "./Mappings";
import CSVImport from "./CSVImport";
import NotFound from "./NotFound";

function AdminDashboard() {
  return (
    <Routes>
      {/* Admin layout wraps all admin pages */}
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} /> {/* /admin */}
        <Route path="students" element={<Students />} /> {/* /admin/students */}
        <Route path="faculty" element={<Faculty />} /> {/* /admin/faculty */}
        <Route path="mappings" element={<Mappings />} /> {/* /admin/mappings */}
        <Route path="import" element={<CSVImport />} /> {/* /admin/import */}
      </Route>

      {/* If route not found inside /admin */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AdminDashboard;
