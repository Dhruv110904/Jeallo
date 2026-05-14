import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/Tasks/TaskList';
import Kanban from './pages/Kanban';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Backlog from './pages/Backlog';
import Timeline from './pages/Timeline';
import Landing from './pages/Landing';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AppLayout from './components/layout/AppLayout';
import ProjectLayout from './components/layout/ProjectLayout';
import { useSocket } from './hooks/useSocket';

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
}

function RoleRoute({ children, roles }) {
  const { role } = useAuthStore();
  const hasRole = roles.some(r => r.toLowerCase() === role?.toLowerCase());
  return hasRole ? children : <Navigate to="/" />;
}

function App() {
  useSocket();

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/verify-email" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/dashboard" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="my-tasks" element={<TaskList />} />
          <Route path="inbox" element={<div className="p-8 text-slate-500">Inbox Feature Coming Soon</div>} />
          
          {/* Project Specific Routes */}
          <Route path="projects/:projectId" element={<ProjectLayout />}>
            <Route index element={<Navigate to="board" replace />} />
            <Route path="summary" element={<div />} />
            <Route path="board" element={<Kanban />} />
            <Route path="backlog" element={<Backlog />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="reports" element={<Reports />} />
            <Route path="docs" element={<div />} />
            <Route path="settings" element={<div />} />
          </Route>

          <Route path="profile" element={<Profile />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="users" element={
            <RoleRoute roles={['manager', 'super_admin']}><Users /></RoleRoute>
          } />
        </Route>
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
