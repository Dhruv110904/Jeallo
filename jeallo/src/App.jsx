import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/Tasks/TaskList';
import Kanban from './pages/Kanban';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import AppLayout from './components/layout/AppLayout';
import { useSocket } from './hooks/useSocket';

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
}

function RoleRoute({ children, roles }) {
  const { role } = useAuthStore();
  return roles.includes(role) ? children : <Navigate to="/" />;
}

function App() {
  useSocket();

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<Profile />} />
          
          <Route path="reports" element={
            <RoleRoute roles={['manager', 'super_admin']}><Reports /></RoleRoute>
          } />
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
