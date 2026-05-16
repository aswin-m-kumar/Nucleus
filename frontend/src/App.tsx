import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RoleGuard from './components/shared/RoleGuard';
import DashboardLayout from './components/shared/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* All authenticated routes share the Navbar layout */}
        <Route element={<DashboardLayout />}>
          <Route element={<RoleGuard allowedRoles={['employee', 'manager', 'admin']} />}>
            <Route path="/dashboard" element={<EmployeeDashboard />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={['manager', 'admin']} />}>
            <Route path="/manager" element={<ManagerDashboard />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

