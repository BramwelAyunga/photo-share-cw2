import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './pages/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MediaUploadPage from './pages/MediaUploadPage';
import MediaDetailPage from './pages/MediaDetailPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Routes with the new MainLayout */}
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/media/:id" element={<MainLayout><MediaDetailPage /></MainLayout>} />
            <Route path="/profile/:userId" element={<MainLayout><ProfilePage /></MainLayout>} />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute roles={['creator']}>
                  <MainLayout><MediaUploadPage /></MainLayout>
                </ProtectedRoute>
              } 
            />

            {/* Standalone routes without the layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
