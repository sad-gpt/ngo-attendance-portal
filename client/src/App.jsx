import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import Volunteers from "./pages/Volunteers";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/children" element={<Children />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
