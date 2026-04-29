import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import EmployeesPage from './pages/EmployeesPage'
import JobHistoryPage from './pages/JobHistoryPage'
import JobsPage from './pages/JobsPage'
import DepartmentsPage from './pages/DepartmentsPage'
import AdminPage from './pages/AdminPage'
import DeletedItemsPage from './pages/DeletedItemsPage'
import DashboardLayout from './components/DashboardLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/jobhistory" element={<JobHistoryPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/deleted-items" element={<DeletedItemsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}