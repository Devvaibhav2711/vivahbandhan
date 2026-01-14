import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/layout/Layout';
import { Users, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const PublicProfiles: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth(); // Get user
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userGender, setUserGender] = useState<string | null>(null);
    const [isFeatureEnabled, setIsFeatureEnabled] = useState(true); // Default true while loading to prevent flicker, checked below
    const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');

    useEffect(() => {
        const checkFeatureAndFetch = async () => {
            try {
                // 1. Check Feature Flag
                const { data: setting } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'enable_public_profiles')
                    .maybeSingle();

                // If explicitly disabled (exists and is 'false'), block access
                if (setting && setting.value === 'false') {
                    setIsFeatureEnabled(false);
                    setLoading(false);
                    return; // Stop execution
                }

                // 2. If User Logged In, Fetch Gender & Profiles
                // If not logged in, we don't need to fetch yet (or we fetch but don't show, but better to safeguard)
                // However, we handle the "Not Logged In" state in render.
                // But for Gender Filter, we need the CURRENT USER'S gender.



                // 2. Fetch Profiles using Secure RPC
                // This function checks the 'enable_public_profiles' setting on the server.
                // It also bypasses RLS safely because it is a "Security Definer" function.

                const { data, error } = await supabase.rpc('get_public_profiles');

                if (error) {
                    // Fallback to direct query if RPC doesn't exist yet (for smooth transition)
                    // This ensures the app doesn't break if the user hasn't run the SQL yet
                    console.log('RPC not found, falling back to direct query');
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('profiles')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (fallbackError) throw fallbackError;
                    setProfiles(fallbackData || []);
                } else {
                    setProfiles(data || []);
                }
            } catch (error) {
                console.error('Error fetching public profiles:', error);
            } finally {
                setLoading(false);
            }
        };

        checkFeatureAndFetch();
    }, [user]);

    if (loading) {
        return (
            <Layout>
                <div className="flex h-[60vh] items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Loading profiles...</p>
                </div>
            </Layout>
        );
    }

    // Feature Disabled State
    if (!isFeatureEnabled) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                    <h2 className="text-2xl font-bold text-muted-foreground mb-2">Feature Disabled</h2>
                    <p className="text-muted-foreground">The public profiles directory is currently turned off by the administrator.</p>
                    <Button className="mt-4" variant="outline" onClick={() => navigate('/')}>
                        Go Home
                    </Button>
                </div>
            </Layout>
        );
    }

    // Access Control: If no user, show Login CTA
    if (!user) {
        return (
            <Layout>
                <section className="py-20 md:py-32 bg-secondary/10 min-h-[70vh] flex items-center justify-center">
                    <div className="container px-4 text-center">
                        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-secondary/20">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">{t('public.loginRequired')}</h2>
                            <p className="text-muted-foreground mb-8">
                                {t('public.loginRequiredDesc')}
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button className="w-full btn-gold" onClick={() => navigate('/login')}>
                                    {t('nav.login')}
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                                    {t('nav.register')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        );
    }

    const filteredProfiles = profiles.filter(profile => {
        if (filterGender === 'all') return true;
        return profile.gender === filterGender;
    });

    return (
        <Layout>
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-6">
                        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-primary">{t('nav.allProfiles') || 'All Profiles'}</h1>
                        <div className="section-divider mb-4" />


                        {/* Gender Filter Buttons */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in-up">
                            <Button
                                variant={filterGender === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilterGender('all')}
                                className={filterGender === 'all' ? 'btn-gold' : ''}
                            >
                                {t('nav.allProfiles')}
                            </Button>
                            <Button
                                variant={filterGender === 'male' ? 'default' : 'outline'}
                                onClick={() => setFilterGender('male')}
                                className={filterGender === 'male' ? 'btn-gold' : ''}
                            >
                                {t('profile.male')}
                            </Button>
                            <Button
                                variant={filterGender === 'female' ? 'default' : 'outline'}
                                onClick={() => setFilterGender('female')}
                                className={filterGender === 'female' ? 'btn-gold' : ''}
                            >
                                {t('profile.female')}
                            </Button>
                        </div>
                    </div>

                    {filteredProfiles.length === 0 ? (
                        <div className="text-center py-12 bg-secondary/5 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No profiles available for this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                            {filteredProfiles.map(profile => (
                                <div key={profile.id} className="card-elegant bg-white relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-secondary/20 block cursor-pointer" onClick={() => navigate(`/profile/view/${profile.id}`)}>

                                    {/* Image Section */}
                                    <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                                        {profile.profile_photo ? (
                                            <img
                                                src={profile.profile_photo}
                                                alt={profile.full_name}
                                                loading="lazy"
                                                width="400"
                                                height="500"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                                                <Users className="w-16 h-16 text-muted-foreground/30" />
                                            </div>
                                        )}

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                                            <div className="text-white">
                                                <h3 className="font-bold text-lg truncate mb-1 shadow-sm">{profile.full_name}</h3>
                                                <div className="flex items-center text-xs text-white/90 gap-1 h-5 overflow-hidden">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{profile.location || 'Location N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ribbon Badge */}
                                        <div className="absolute top-3 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 shadow-sm rounded-l-md transform translate-x-1 group-hover:translate-x-0 transition-transform">
                                            {profile.gender === 'male' ? 'GROOM' : 'BRIDE'}
                                        </div>
                                    </div>

                                    {/* Compact Details */}
                                    <div className="p-3 bg-white grid grid-cols-2 gap-2 text-xs">
                                        <div className="space-y-0.5">
                                            <p className="text-muted-foreground">{t('common.age')}</p>
                                            <p className="font-medium">{profile.age} Yrs</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-muted-foreground col-span-2">Height</p>
                                            <p className="font-medium">{profile.height}</p>
                                        </div>
                                        <div className="col-span-2 space-y-0.5 mt-1 border-t pt-1 border-gray-100 flex items-center gap-1.5 text-muted-foreground">
                                            <Briefcase className="w-3 h-3" />
                                            <span className="truncate">
                                                {(() => {
                                                    const text = profile.job_occupation || profile.profession || 'N/A';
                                                    return text.replace(/\s+at\s+(NA|N\/A|null|undefined)\s*$/i, '');
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hover Action */}
                                    <div className="p-3 pt-0">
                                        <Button className="w-full btn-gold text-xs h-8">
                                            View Profile
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default PublicProfiles;
