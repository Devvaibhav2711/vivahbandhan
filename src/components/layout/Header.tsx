import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LanguageSwitch from './LanguageSwitch';
import { supabase } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPublicProfiles, setShowPublicProfiles] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfileId(null);
      return;
    }
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('id, profile_photo').eq('user_id', user.id).maybeSingle();
      if (data) {
        setProfileId(data.id);
        setProfilePhoto(data.profile_photo);
      }
    };
    fetchProfile();

    // Check for Public Profiles Setting
    const checkPublicSetting = async () => {
      const { data } = await supabase.from('app_settings').select('value').eq('key', 'enable_public_profiles').maybeSingle();
      setShowPublicProfiles(data?.value === 'true');
    };
    checkPublicSetting();
  }, [user]);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    ...(user ? [
      { path: '/my-matches', label: t('nav.myMatches') },
      { path: '/request-match', label: t('nav.requestMatch') },
    ] : []),
    ...(showPublicProfiles ? [{ path: '/all-profiles', label: t('nav.allProfiles') || 'All Profiles' }] : []),
    ...(user ? [{ path: '/success-stories', label: t('nav.successStories') }] : []),
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {user && profilePhoto ? (
              <Link to={`/profile/view/${profileId}`} className="block">
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden shadow-sm">
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </Link>
            ) : (
              <Link to="/" className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shadow-sm">
                  <span className="font-serif text-xl font-bold text-primary">व</span>
                </div>
              </Link>
            )}
            <Link to="/">
              <span className="font-serif text-lg md:text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
                VivahBandhan
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitch />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden md:flex items-center gap-2 pl-2">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="User" className="w-6 h-6 rounded-full object-cover border border-border" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="max-w-24 truncate">{user.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full cursor-pointer">
                          {t('admin.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {profileId && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={`/profile/view/${profileId}`} className="w-full cursor-pointer">
                          {t('nav.viewProfile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/profile/edit/${profileId}`} className="w-full cursor-pointer">
                          {t('nav.editProfile')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/my-matches" className="w-full cursor-pointer">
                      {t('nav.myMatches')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild className="btn-gold">
                  <Link to="/register">{t('nav.register')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            {user && (
              <div className="px-4 py-2 mb-2 text-sm text-muted-foreground border-b border-border/40">
                Logged in as <span className="font-medium text-foreground block truncate">{user.email}</span>
              </div>
            )}
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-border my-2" />

              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted text-foreground block"
                    >
                      {t('admin.dashboard')}
                    </Link>
                  )}
                  {profileId && (
                    <>
                      <Link
                        to={`/profile/view/${profileId}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted"
                      >
                        {t('nav.viewProfile')}
                      </Link>
                      <Link
                        to={`/profile/edit/${profileId}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted"
                      >
                        {t('nav.editProfile')}
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-muted text-left flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('nav.login')}
                    </Link>
                  </Button>
                  <Button asChild className="w-full btn-gold">
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('nav.register')}
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
