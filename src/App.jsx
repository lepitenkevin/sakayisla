import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Home from './components/Home'; 
import Register from './components/Register';
import Login from './components/Login';
import PassengerDashboard from './components/PassengerDashboard';
import RiderDashboard from './components/RiderDashboard';
import SuperAdmin from './components/SuperAdmin';
import ContactUs from './components/ContactUs';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import HelpCenter from './components/HelpCenter';

// --- ROUTE GUARD COMPONENT ---
const ProtectedRoute = ({ children, allowedRole }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        if (user.role === 'superadmin') return <Navigate to="/admin" replace />;
        if (user.role === 'rider') return <Navigate to="/rider" replace />;
        if (user.role === 'passenger') return <Navigate to="/passenger" replace />;
    }

    return children;
};

const Navigation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // --- CENTRALIZED API HEADERS ---
  const apiHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_API_ACCESS_KEY,
      'x-api-secret': import.meta.env.VITE_API_SECRET_KEY
  };

  // Global Online Status Heartbeat
  useEffect(() => {
      if (!user) return;
      
      const pingStatus = () => {
          fetch(`${import.meta.env.VITE_API_BASE_URL}update_online_status.php`, {
              method: 'POST',
              body: JSON.stringify({ user_id: user.id, status: 1 }),
              headers: apiHeaders // FIXED: Added security keys
          }).catch(err => console.error("Heartbeat failed:", err));
      };
      
      pingStatus();
      const interval = setInterval(pingStatus, 10000); // Ping every 10 seconds

      // Set offline when closing tab
      const handleUnload = () => {
          // FIXED: Swapped sendBeacon for a keepalive fetch so we can send our API keys!
          fetch(`${import.meta.env.VITE_API_BASE_URL}update_online_status.php`, {
              method: 'POST',
              body: JSON.stringify({ user_id: user.id, status: 0 }),
              headers: apiHeaders,
              keepalive: true 
          });
      };
      
      window.addEventListener('beforeunload', handleUnload);

      return () => {
          clearInterval(interval);
          window.removeEventListener('beforeunload', handleUnload);
      };
  }, [user]);

  const handleLogout = () => {
    // Set offline instantly on logout
    if (user) {
        fetch(`${import.meta.env.VITE_API_BASE_URL}update_online_status.php`, {
            method: 'POST', 
            body: JSON.stringify({ user_id: user.id, status: 0 }),
            headers: apiHeaders // FIXED: Added security keys
        });
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 hover:opacity-80 transition">
            <img src="/favicon.svg" alt="SakayIsla Logo" className="h-8 w-8 drop-shadow-sm" />
            <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight">Sakay<span className="text-brand">Isla</span></h1>
          </Link>
          
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-brand font-medium transition">Login</Link>
                <Link to="/register" className="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-full font-bold transition shadow-sm">Sign Up</Link>
              </>
            ) : (
              <>
                <span className="hidden md:block text-sm text-gray-500 font-medium">
                  Hi, {user.name} <span className="bg-brand-light text-brand-dark px-2 py-1 rounded-md text-xs ml-1 uppercase tracking-wide font-bold">{user.role}</span>
                </span>
                
                {user.role === 'passenger' && <Link to="/passenger" className="text-gray-600 hover:text-brand font-medium">Dashboard</Link>}
                {user.role === 'rider' && <Link to="/rider" className="text-gray-600 hover:text-brand font-medium">Dashboard</Link>}
                {user.role === 'superadmin' && <Link to="/admin" className="text-gray-600 hover:text-brand font-medium">Admin</Link>}
                
                <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-md font-medium transition">Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-brand-light font-sans text-gray-800">
        <Navigation />
        
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/help" element={<HelpCenter />} />

            {/* Protected Routes */}
            <Route 
                path="/passenger" 
                element={<ProtectedRoute allowedRole="passenger"><PassengerDashboard /></ProtectedRoute>} 
            />
            <Route 
                path="/rider" 
                element={<ProtectedRoute allowedRole="rider"><RiderDashboard /></ProtectedRoute>} 
            />
            <Route 
                path="/admin" 
                element={<ProtectedRoute allowedRole="superadmin"><SuperAdmin /></ProtectedRoute>} 
            />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center md:flex md:items-center md:justify-between">
              <div className="flex justify-center mb-4 md:mb-0 gap-4 text-sm font-medium text-gray-500">
                <Link to="/terms" className="hover:text-brand transition">Terms of Service</Link>
                <Link to="/privacy" className="hover:text-brand transition">Privacy Policy</Link>
                <Link to="/help" className="hover:text-brand transition">Help Center</Link>
                <Link to="/contact" className="hover:text-brand transition">Contact Us</Link>
              </div>
              <p className="text-sm text-gray-400 font-medium">&copy; {new Date().getFullYear()} SakayIsla. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;