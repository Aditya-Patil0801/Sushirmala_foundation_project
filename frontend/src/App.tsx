import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import PrivateRoute from '@/components/PrivateRoute';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import Schemes from '@/pages/Schemes';
import EnquiryPage from '@/pages/Enquiry';
import NotFound from '@/pages/NotFound';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gradient-trust">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/enquiry" element={<EnquiryPage />} />
                <Route path="/enquiry/:id" element={<EnquiryPage />} />
                <Route 
                  path="/schemes" 
                  element={
                    <PrivateRoute>
                      <Schemes />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <Admin />
                    </PrivateRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;