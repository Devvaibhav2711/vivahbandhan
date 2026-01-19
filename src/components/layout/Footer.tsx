import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                <span className="font-serif text-xl font-bold text-primary">शु</span>
              </div>
              <span className="font-serif text-2xl font-bold text-accent">
                ShubhVivahBandhan
              </span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-1 text-accent">
              <Heart className="w-4 h-4 fill-current" />
              <Heart className="w-4 h-4 fill-current" />
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-accent">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  {t('nav.submitProfile')}
                </Link>
              </li>
              <li>
                <Link to="/request-match" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  {t('nav.requestMatch')}
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  {t('nav.successStories')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-accent">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-accent">
              {t('nav.contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail className="w-4 h-4 text-accent" />
                vnimbalkar79@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="w-4 h-4 text-accent" />
                +91 8010246840
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="w-4 h-4 text-accent mt-0.5" />
                <span>{t('contact.addressValue')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
