import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdherenceProvider } from './context/AdherenceContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import MedicineSidebar from './components/MedicineSidebar';
import AlertsSidebar from './components/AlertsSidebar';
import './styles/index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

/* Dashboard layout — sidebars only shown on /dashboard */
function DashboardLayout() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', height: '100vh', overflow: 'hidden' }}>
      <MedicineSidebar />
      <main style={{ overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        <Navbar />
        <div style={{ padding: '2rem' }}>
          <Dashboard />
        </div>
      </main>
      <AlertsSidebar />
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public pages — full-screen, no sidebars */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

      {/* Dashboard — wrapped in sidebar layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdherenceProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AdherenceProvider>
    </AuthProvider>
  );
}
