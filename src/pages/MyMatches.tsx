import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Search, UserCheck, ArrowRight, Clock, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MyMatches: React.FC = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [hasRequest, setHasRequest] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // 1. Check for Requests
                const { data: reqs, error: reqError } = await supabase
                    .from('match_requests')
                    .select('id')
                    .eq('user_id', user.id);

                if (reqError) throw reqError;
                setHasRequest(reqs && reqs.length > 0);

                // 2. Fetch Shared Matches
                const { data: shared, error: matchError } = await supabase
                    .from('matches')
                    .select(`
                        id,
                        status,
                        created_at,
                        profile:profiles (*)
                    `)
                    .eq('user_id', user.id);

                if (matchError) throw matchError;

                // Configure matches list (flatten structure)
                const formattedMatches = shared?.map(item => ({
                    ...item.profile,
                    match_id: item.id,
                    match_status: item.status,
                    shared_at: item.created_at
                })) || [];

                setMatches(formattedMatches);

            } catch (error) {
                console.error("Error fetching matches:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading, navigate]);

    if (loading || authLoading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Loading your matches...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <section className="py-12 md:py-20 bg-gradient-to-b from-secondary/10 to-background min-h-[80vh]">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">
                                {t('nav.myMatches')}
                            </h1>
                            <p className="text-muted-foreground whitespace-pre-line">
                                {t('myMatches.subtitle')}
                            </p>
                        </div>

                        {/* CASE 1: No Request Sent */}
                        {!hasRequest && (
                            <Card className="border-dashed border-2 p-8 text-center bg-white/50 backdrop-blur">
                                <CardContent className="flex flex-col items-center pt-6">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold mb-2">{t('common.noRequest.title')}</h2>
                                    <p className="text-muted-foreground mb-6 max-w-md">
                                        {t('common.noRequest.desc')}
                                    </p>
                                    <Link to="/request-match">
                                        <Button size="lg" className="btn-gold gap-2">
                                            {t('common.findPartner')} <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* CASE 2: Request Sent BUT No Matches */}
                        {hasRequest && matches.length === 0 && (
                            <Card className="p-8 text-center bg-white shadow-sm border-secondary/20">
                                <CardContent className="flex flex-col items-center pt-6">
                                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4 animate-pulse">
                                        <Clock className="w-8 h-8 text-yellow-600" />
                                    </div>
                                    <h2 className="text-xl font-bold mb-2">{t('common.requestReceived.title')}</h2>
                                    <p className="text-muted-foreground mb-6 max-w-lg">
                                        {t('common.requestReceived.desc')}
                                    </p>
                                    <div className="flex flex-col gap-4 w-full items-center justify-center">
                                        <Button variant="outline" disabled className="w-full md:w-auto h-auto min-h-[44px] py-2 px-4 whitespace-normal text-center leading-tight">{t('common.processing')}</Button>
                                        <Link to="/request-match" className="w-full md:w-auto">
                                            <Button variant="ghost" className="text-primary w-full md:w-auto">{t('common.updatePreferences')}</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* CASE 3: Matches Found */}
                        {hasRequest && matches.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-medium">{matches.length} {t('common.profilesForYou')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {matches.map(profile => (
                                        <Link key={profile.id} to={`/profile/view/${profile.id}`}>
                                            <div className="group bg-white rounded-xl shadow-sm border hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
                                                {/* Header Gradient */}
                                                <div className="h-20 bg-gradient-to-r from-primary/10 to-secondary/10 relative">
                                                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary">
                                                        {t('common.matched')}
                                                    </div>
                                                </div>

                                                <div className="p-5 pt-0 flex-1 flex flex-col items-center text-center -mt-10">
                                                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden bg-muted mb-3 group-hover:scale-105 transition-transform">
                                                        {profile.profile_photo ? (
                                                            <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users className="w-full h-full p-4 text-muted-foreground/30" />
                                                        )}
                                                    </div>

                                                    <h3 className="font-serif font-bold text-lg mb-1">{profile.full_name || t('common.nameHidden')}</h3>
                                                    <p className="text-xs text-muted-foreground mb-4">
                                                        {[
                                                            `${profile.age} ${t('common.yrs')}`,
                                                            profile.religion,
                                                            profile.location && profile.location !== 'NA' ? profile.location : null
                                                        ].filter(Boolean).join(' • ')}
                                                    </p>

                                                    <div className="w-full grid grid-cols-2 gap-2 text-xs text-left bg-secondary/5 p-3 rounded-lg mb-4">
                                                        <div>
                                                            <span className="text-muted-foreground">{t('profile.education')}:</span>
                                                            <div className="font-medium truncate">
                                                                {profile.education ? profile.education.replace(/\s*-\s*NA\s*$/, '').replace(/\s*-\s*$/, '') : '-'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">{t('profile.profession')}:</span>
                                                            <div className="font-medium truncate">
                                                                {profile.profession ? (() => {
                                                                    const parts = profile.profession.split(' at ');
                                                                    const job = parts[0];
                                                                    const company = parts[1];
                                                                    const displayJob = t(`prof.${job}`) === `prof.${job}` ? job : t(`prof.${job}`);

                                                                    if (company && company !== 'NA') {
                                                                        return `${displayJob} ${t('common.at')} ${company}`;
                                                                    }
                                                                    return displayJob.replace(/\s+at\s+(NA|N\/A|null|undefined)\s*$/i, '').replace(' at ', '');
                                                                })() : '-'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button className="w-full mt-auto btn-gold">
                                                        {t('common.viewFullProfile')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default MyMatches;
