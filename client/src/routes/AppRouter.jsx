import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { AuditManagementPage } from '../pages/audit/AuditManagementPage';
import { AssetRegistrationPage } from '../pages/assets/AssetRegistrationPage';
import { AssetAllocationPage } from '../pages/allocations/AssetAllocationPage';
import { ResourceBookingPage } from '../pages/bookings/ResourceBookingPage';
import { MaintenanceModulePage } from '../pages/maintenance/MaintenanceModulePage';
import { OrganizationSetupPage } from '../pages/setup/OrganizationSetupPage';
import { ActivityLogsPage } from '../pages/ActivityLogsPage';
import { TransferRequestsPage } from '../pages/transfers/TransferRequestsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-white">
        <div className="glass-panel rounded-3xl px-6 py-4 text-sm text-slate-300">
          Loading AssetFlow...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="reports" element={<RoleRoute roles={['Admin', 'Asset Manager', 'Department Head']}><ReportsPage /></RoleRoute>} />
        <Route path="audits" element={<RoleRoute roles={['Admin', 'Asset Manager']}><AuditManagementPage /></RoleRoute>} />
        <Route path="organization-setup" element={<RoleRoute roles={['Admin']}><OrganizationSetupPage /></RoleRoute>} />
        <Route path="assets" element={<AssetRegistrationPage />} />
        <Route path="allocations" element={<AssetAllocationPage />} />
        <Route path="bookings" element={<ResourceBookingPage />} />
        <Route path="maintenance" element={<MaintenanceModulePage />} />
        <Route path="activity-logs" element={<RoleRoute roles={['Admin']}><ActivityLogsPage /></RoleRoute>} />
        <Route path="transfers" element={<TransferRequestsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
