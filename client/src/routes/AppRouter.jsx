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
      <Route path="reports" element={<ReportsPage />} />
      <Route path="audits" element={<AuditManagementPage />} />
        <Route path="organization-setup" element={<OrganizationSetupPage />} />
        <Route path="assets" element={<AssetRegistrationPage />} />
        <Route path="allocations" element={<AssetAllocationPage />} />
        <Route path="bookings" element={<ResourceBookingPage />} />
        <Route path="maintenance" element={<MaintenanceModulePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
