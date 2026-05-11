import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AuthCallback from './pages/AuthCallback'
import EmployeesPage from './pages/EmployeesPage'
import JobHistoryPage from './pages/JobHistoryPage'
import JobsPage from './pages/JobsPage'
import EmployeeDetailPage from './pages/EmployeeDetailPage'
import DepartmentsPage from './pages/DepartmentsPage'
import UserManagementPage from './pages/UserManagementPage'
import DeletedItemsPage from './pages/DeletedItemsPage'
import HeadcountByDeptPage from './pages/HeadcountByDeptPage'
import SalaryReportPage from './pages/SalaryReportPage'
import EmployeeHistoryReportPage from './pages/EmployeeHistoryReportPage'
import DashboardLayout from './components/DashboardLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:empno" element={<EmployeeDetailPage />} />
          <Route path="/jobhistory" element={<JobHistoryPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/admin" element={<UserManagementPage />} />
          <Route path="/deleted-items" element={<DeletedItemsPage />} />
          <Route path="/reports/headcount" element={<HeadcountByDeptPage />} />
          <Route path="/reports/salary" element={<SalaryReportPage />} />
          <Route path="/reports/employee-history" element={<EmployeeHistoryReportPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}