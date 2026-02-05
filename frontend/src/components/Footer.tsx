import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-prosperity text-prosperity-foreground border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.jpg" 
                alt="Sushrimala Logo" 
                className="h-10 w-10 rounded-full object-contain"
              />
              <span className="text-xl font-bold">Sushirmala</span>
            </div>
            <p className="text-prosperity-foreground/90 text-sm">
              Empowering women through community savings and financial inclusion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quicklinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-prosperity-foreground/90 hover:text-white text-sm">
                  {t('navbar.home')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-prosperity-foreground/90 hover:text-white text-sm">
                  {t('navbar.dashboard')}
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="text-prosperity-foreground/90 hover:text-white text-sm">
                  {t('navbar.schemes')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-prosperity-foreground/90 text-sm">
                  {t('footer.address')}<br />
                  Achole , Palghar<br />
                  State - Maharashtra - 401208
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5" />
                <span className="text-prosperity-foreground/90 text-sm">
                  {t('footer.email')}<br />
                  info@sushirmala.org
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5" />
                <span className="text-prosperity-foreground/90 text-sm">
                  {t('footer.phone')}<br />
                  +91 8483041355
                </span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <p className="text-prosperity-foreground/90 text-sm">
              Follow us on social media for updates and community news.
            </p>
          </div>
        </div>

        <div className="border-t border-prosperity/20 mt-8 pt-8 text-center">
          <p className="text-prosperity-foreground/80 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;