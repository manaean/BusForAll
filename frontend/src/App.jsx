import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import DriverLayout from './components/DriverLayout';
import CommuterLayout from './components/CommuterLayout';

import Login from './auth/Login';
import Register from './auth/Register';
import Landing from './pages/Landing';

// Commuter
import Home from './pages/commuter/Home';
import Routes_ from './pages/commuter/Routes';
import Schedule from './pages/commuter/Schedule';
import Tracker from './pages/commuter/Tracker';
import Favourites from './pages/commuter/Favourites';
import Alerts from './pages/commuter/Alerts';
import Profile from './pages/commuter/Profile';

// Admin
import Dashboard from './pages/admin/Dashboard';
import ManageRoutes from './pages/admin/ManageRoutes';
import ManageStops from './pages/admin/ManageStops';
import ManageSchedules from './pages/admin/ManageSchedules';
import ManageBuses from './pages/admin/ManageBuses';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAlerts from './pages/admin/ManageAlerts';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageAssignments from './pages/admin/ManageAssignments';
import ManageDelays from './pages/admin/ManageDelays';
import ManageTracking from './pages/admin/ManageTracking';

// Driver
import DriverHome from './pages/driver/DriverHome';
import DriverSchedule from './pages/driver/DriverSchedule';
import DriverBus from './pages/driver/DriverBus';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'driver') return <Navigate to="/driver" />;
  return <Landing />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Commuter routes */}
        <Route element={<CommuterLayout />}>
          <Route path="/home" element={<ProtectedRoute roles={['commuter', 'admin']}><Home /></ProtectedRoute>} />
          <Route path="/routes" element={<Routes_ />} />
          <Route path="/schedule/:routeId" element={<Schedule />} />
          <Route path="/tracker/:routeId" element={<Tracker />} />
          <Route path="/favourites" element={<ProtectedRoute roles={['commuter', 'admin']}><Favourites /></ProtectedRoute>} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/profile" element={<ProtectedRoute roles={['commuter', 'admin', 'driver']}><Profile /></ProtectedRoute>} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/routes" element={<ManageRoutes />} />
          <Route path="/admin/stops" element={<ManageStops />} />
          <Route path="/admin/schedules" element={<ManageSchedules />} />
          <Route path="/admin/buses" element={<ManageBuses />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/alerts" element={<ManageAlerts />} />
          <Route path="/admin/drivers" element={<ManageDrivers />} />
          <Route path="/admin/assignments" element={<ManageAssignments />} />
          <Route path="/admin/delays" element={<ManageDelays />} />
          <Route path="/admin/tracking" element={<ManageTracking />} />
        </Route>

        {/* Driver routes */}
        <Route element={<ProtectedRoute roles={['driver']}><DriverLayout /></ProtectedRoute>}>
          <Route path="/driver" element={<DriverHome />} />
          <Route path="/driver/schedule" element={<DriverSchedule />} />
          <Route path="/driver/bus" element={<DriverBus />} />
          <Route path="/driver/bus/:routeId" element={<DriverBus />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
