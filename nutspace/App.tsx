import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNavBar from './components/BottomNavBar';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import AllCreations from './pages/AllCreations';
import NutshelStudios from './pages/NutshelStudios';
import AiCanvas from './pages/AiCanvas';
import ProductPhotoshoots from './pages/ProductPhotoshoots';
import CreativeSuite from './pages/CreativeSuite';
import ProfileSettings from './pages/ProfileSettings';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext';
import ProjectPage from './pages/ProjectPage';
import { ProjectProvider } from './contexts/ProjectContext';

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  const ProtectedLayout: React.FC = () => (
    <ProjectProvider>
      <div className="flex h-screen bg-nutshel-gray-dark text-white font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/creations" element={<AllCreations />} />
            <Route path="/studios" element={<NutshelStudios />} />
            <Route path="/canvas" element={<AiCanvas />} />
            <Route path="/product-photoshoots" element={<ProductPhotoshoots />} />
            <Route path="/suite" element={<CreativeSuite />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            {/* Redirect any other nested routes to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <BottomNavBar />
      </div>
    </ProjectProvider>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-nutshel-gray-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/*" element={isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;