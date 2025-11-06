import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import BottomNavBar from './components/BottomNavBar';
import { useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import ExplorePage from './pages/ExplorePage';
import AICanvasPage from './pages/AICanvasPage';
import PricingPage from './pages/PricingPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import NutshelStudiosPage from './pages/NutshelStudiosPage';
import EditImagesPage from './pages/EditImagesPage';
import WorkspaceDashboard from './pages/WorkspaceDashboard';
import WorkspaceExplore from './pages/WorkspaceExplore';
import WorkspaceAllCreations from './pages/WorkspaceAllCreations';
import WorkspaceNutshelStudios from './pages/WorkspaceNutshelStudios';
import WorkspaceProductPhotoshoots from './pages/WorkspaceProductPhotoshoots';
import WorkspaceModelShoots from './pages/WorkspaceModelShoots';
import WorkspaceCloneShoots from './pages/WorkspaceCloneShoots';
import WorkspaceImageComposer from './pages/WorkspaceImageComposer';
import WorkspaceAiCanvas from './pages/WorkspaceAiCanvas';
import WorkspaceCreativeSuite from './pages/WorkspaceCreativeSuite';
import WorkspaceProfileSettings from './pages/WorkspaceProfileSettings';
import WorkspaceProjectPage from './pages/WorkspaceProjectPage';

// This component scrolls the window to the top on every route change.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Workspace Layout
const WorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProjectProvider>
      <div className="flex h-screen bg-nutshel-gray-dark text-white font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </ProjectProvider>
  );
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        // Only navigate to dashboard on SIGNED_IN if user is explicitly on login/signup page
        // This prevents unwanted redirects when switching tabs or when session is revalidated
        if (event === 'SIGNED_IN') {
            const currentPath = location.pathname;
            // Only navigate if user is on login/signup page, not if already on any workspace route
            if (currentPath === '/login' || currentPath === '/signup') {
                navigate('/workspace/dashboard');
            }
        }
        // When signed out, redirect to landing page if user is on workspace routes
        if (event === 'SIGNED_OUT') {
            const currentPath = location.pathname;
            if (currentPath.startsWith('/workspace') || currentPath === '/profile') {
                navigate('/', { replace: true });
            }
        }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const isHomePage = location.pathname === '/';

  if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-nutshel-gray-dark">
      <ScrollToTop />
      <Routes>
        {/* Public landing page routes */}
        <Route path="/" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <HomePage />
            </main>
          </>
        } />
        <Route path="/features" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <FeaturesPage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/explore" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <ExplorePage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/ai-canvas" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <AICanvasPage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/nutshel-studios" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <NutshelStudiosPage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/edit-images" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <EditImagesPage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/pricing" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <PricingPage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/login" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <AuthPage isLogin={true} />
            </main>
            <Footer />
          </>
        } />
        <Route path="/signup" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <AuthPage isLogin={false} />
            </main>
            <Footer />
          </>
        } />
        <Route path="/profile" element={
          <>
            <Header session={session} />
            <main className="flex-grow pt-20">
              <ProfilePage />
            </main>
            <Footer />
          </>
        } />
        
        {/* Workspace routes with protected layout */}
        <Route path="/workspace" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <Navigate to="/workspace/dashboard" replace />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/dashboard" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceDashboard />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/explore" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceExplore />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/creations" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceAllCreations />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/studios" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceNutshelStudios />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/product-photoshoots" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceProductPhotoshoots />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/model-shoots" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceModelShoots />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/clone-shoots" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceCloneShoots />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/image-composer" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceImageComposer />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/canvas" element={
          <ProtectedRoute>
            <ProjectProvider>
              <WorkspaceAiCanvas />
            </ProjectProvider>
          </ProtectedRoute>
        } />
        <Route path="/workspace/suite" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceCreativeSuite />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/settings" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceProfileSettings />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/project/:id" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <WorkspaceProjectPage />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
        <Route path="/workspace/*" element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <Navigate to="/workspace/dashboard" replace />
            </WorkspaceLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;