import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Users,
  CreditCard,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import LanguageSelector from '@/components/LanguageSelector';

const Navbar = () => {
  const authContext = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle case where context is not available during hot reload
  if (!authContext) {
    return null;
  }

  const { user, logout } = authContext;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if user has admin privileges (special case)
  const isAdmin = user && (user as any).isAdmin;

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.jpg" 
                alt="Sushrimala Logo" 
                className="h-10 w-10 rounded-full object-contain"
              />
              <span className="text-xl font-bold text-prosperity hidden sm:block">
                Sushirmala
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            
            {user ? (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    {t('navbar.home')}
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    {t('navbar.dashboard')}
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      {t('navbar.admin')}
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('navbar.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t('navbar.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="prosperity" size="sm">
                    {t('navbar.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {user ? (
              <div className="space-y-2">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="h-4 w-4 mr-2" />
                    {t('navbar.home')}
                  </Button>
                </Link>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    {t('navbar.dashboard')}
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      {t('navbar.admin')}
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('navbar.logout')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    {t('navbar.login')}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="prosperity" className="w-full">
                    {t('navbar.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;