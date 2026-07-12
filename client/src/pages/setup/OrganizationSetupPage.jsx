import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { DepartmentManagementPage as DepartmentsTab } from '../departments/DepartmentManagementPage';
import { AssetCategoryManagementPage as CategoriesTab } from '../categories/AssetCategoryManagementPage';
import { EmployeeDirectoryTab } from './EmployeeDirectoryTab';

const tabs = [
  { key: 'departments', label: 'Departments' },
  { key: 'categories', label: 'Asset Categories' },
  { key: 'employees', label: 'Employee Directory' },
];

export function OrganizationSetupPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('departments');

  if (user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'departments':
        return <DepartmentsTab />;
      case 'categories':
        return <CategoriesTab />;
      case 'employees':
        return <EmployeeDirectoryTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="subtle-label">Administration</p>
        <h2 className="section-title mt-2">Organization Setup</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Manage master data for departments, asset categories, and assign roles to employees.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
}
