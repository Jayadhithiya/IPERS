import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { TpcDashboard } from './pages/tpc/TpcDashboard';
import { GraduationCap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 bg-dot-light flex flex-col justify-center items-center p-6">
        <div className="bg-white border border-slate-200/80 shadow-saas-md rounded-3xl px-10 py-8 flex flex-col items-center">
          <div className="relative mb-5">
            <div className="w-16 h-16 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-indigo-600" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 tracking-tight font-display">IPERS Portal</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Verifying your academic session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Login />;
  }

  // Role based routing
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'tpc':
      return <TpcDashboard />;
    default:
      return <Login />;
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
