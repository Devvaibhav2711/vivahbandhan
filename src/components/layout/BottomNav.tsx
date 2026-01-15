import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, UserPlus, User, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

const BottomNav: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const [profileId, setProfileId] = useState<string | null>(null);
    const [showPublicProfiles, setShowPublicProfiles] = useState(false);

    useEffect(() => {
        if (!user) {
            setProfileId(null);
            return;
        }
        const fetchProfile = async () => {
            const { data } = await supabase.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
            if (data) setProfileId(data.id);
        };
        fetchProfile();

        const checkPublicSetting = async () => {
            const { data } = await supabase.from('app_settings').select('value').eq('key', 'enable_public_profiles').maybeSingle();
            setShowPublicProfiles(data?.value === 'true');
        };
        checkPublicSetting();
    }, [user]);

    // Only show if user is logged in
    if (!user) return null;

    const navLinks = [
        { path: '/', icon: Home, label: t('nav.home') },
        { path: '/all-profiles', icon: Search, label: t('nav.allProfiles') || 'All Profiles' },
        { path: '/my-matches', icon: Heart, label: t('nav.myMatches') },
        { path: '/request-match', icon: UserPlus, label: t('nav.requestMatch') },
        { path: profileId ? `/profile/view/${profileId}` : '/register', icon: User, label: t('nav.viewProfile') },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden pb-safe">
            <div className="flex items-center justify-around min-h-[4rem] h-auto py-2">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} />
                            {/* <span className="text-[10px] font-medium">{link.label}</span> */}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
