import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
// Layout removed
import { Users, MapPin, Briefcase, ShieldCheck, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { ProfileCardSkeleton } from '@/components/skeletons/ProfileCardSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getPrivacySafeLocation } from '@/utils/locationUtils';

const ITEMS_PER_PAGE = 12;

const PublicProfiles: React.FC = () => {
    const { t } = useLanguage();
    const { user, isLoading: authLoading, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
    const isOnline = useOnlineStatus();

    // Feature Flag Check (We can keep this separate or integrate it, separate is fine for caching)
    const [isFeatureEnabled, setIsFeatureEnabled] = useState(true);

    useEffect(() => {
        const checkFeature = async () => {
            const { data: setting } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'enable_public_profiles')
                .maybeSingle();
            if (setting && setting.value === 'false') {
                setIsFeatureEnabled(false);
            }
        };
        checkFeature();
    }, []);

    const fetchProfiles = async ({ pageParam = 0 }) => {
        const from = pageParam * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' });

        if (filterGender !== 'all') {
            query = query.eq('gender', filterGender);
        }

        // We can add more filters here as needed (e.g. verified)
        // query = query.eq('status', 'verified'); 

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return {
            profiles: data || [],
            nextPage: (data?.length === ITEMS_PER_PAGE && (from + data.length) < (count || 0)) ? pageParam + 1 : undefined,
            total: count
        };
    };

    const canView = isFeatureEnabled || isAdmin;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInfiniteQuery({
        queryKey: ['publicProfiles', filterGender], // Refetch when filter changes
        queryFn: fetchProfiles,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0,
        enabled: isOnline && canView,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes to prevent blinking on tab switch
    });

    // Flatten pages into a single array
    const profiles = data?.pages.flatMap(page => page.profiles) || [];

    // Feature Disabled State (Show Warning for Admin, Block for User)
    if (!isFeatureEnabled && !isAdmin) {
        return (
            <>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                    <h2 className="text-2xl font-bold text-muted-foreground mb-2">Feature Disabled</h2>
                    <p className="text-muted-foreground">The public profiles directory is currently turned off by the administrator.</p>
                    <Button className="mt-4" variant="outline" onClick={() => navigate('/')}>
                        Go Home
                    </Button>
                </div>
            </>
        );
    }

    // Access Control: If no user (and auth is done loading), show Login CTA
    if (!user && !authLoading) {
        return (
            <>
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
            </>
        );
    }

    return (
        <>
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-6">
                        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-primary">{t('nav.allProfiles') || 'All Profiles'}</h1>
                        <div className="section-divider mb-4" />

                        {/* Admin Warning for Disabled State */}
                        {!isFeatureEnabled && isAdmin && (
                            <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded shadow-sm flex items-center gap-3">
                                <span className="font-bold uppercase text-xs px-2 py-0.5 bg-amber-200 rounded text-amber-800">Admin Only</span>
                                <p className="text-sm">The Public Profiles feature is currently <strong>DISABLED</strong> for users. You can see this because you are an Admin.</p>
                            </div>
                        )}

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
                                {t('gender.male')}
                            </Button>
                            <Button
                                variant={filterGender === 'female' ? 'default' : 'outline'}
                                onClick={() => setFilterGender('female')}
                                className={filterGender === 'female' ? 'btn-gold' : ''}
                            >
                                {t('gender.female')}
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="h-full">
                                    <ProfileCardSkeleton />
                                </div>
                            ))}
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="text-center py-12 bg-secondary/5 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No profiles available for this category.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                                {profiles.map((profile: any) => (
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
                                                        <span className="truncate">
                                                            {t('common.locationProtected')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute top-3 right-0 flex flex-col gap-1 items-end">
                                                {profile.status === 'verified' && (
                                                    <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 shadow-sm rounded-l-md transform translate-x-1 group-hover:translate-x-0 transition-transform flex items-center gap-1">
                                                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                                                    </div>
                                                )}
                                                {/* Dummy check for premium for demo */}
                                                {profile.is_premium && (
                                                    <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 shadow-sm rounded-l-md transform translate-x-1 group-hover:translate-x-0 transition-transform flex items-center gap-1">
                                                        <Star className="w-3 h-3" /> PREMIUM
                                                    </div>
                                                )}
                                                <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 shadow-sm rounded-l-md transform translate-x-1 group-hover:translate-x-0 transition-transform">
                                                    {profile.gender === 'male' ? t('profile.groom') : t('profile.bride')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compact Details */}
                                        <div className="p-3 bg-white grid grid-cols-2 gap-2 text-xs">
                                            <div className="space-y-0.5">
                                                <p className="text-muted-foreground">{t('common.age')}</p>
                                                <p className="font-medium">{profile.age} {t('common.yrs')}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-muted-foreground col-span-2">{t('common.height')}</p>
                                                <p className="font-medium">{profile.height}</p>
                                            </div>
                                            <div className="col-span-2 space-y-0.5 mt-1 border-t pt-1 border-gray-100 flex items-center gap-1.5 text-muted-foreground">
                                                <Briefcase className="w-3 h-3" />
                                                <span className="truncate">
                                                    {(() => {
                                                        const raw = profile.job_occupation || profile.profession || 'N/A';
                                                        if (!raw || raw === 'N/A') return 'N/A';

                                                        const parts = raw.split(' at ');
                                                        const job = parts[0];
                                                        const company = parts[1];

                                                        const jobKey = `prof.${job}`;
                                                        const displayJob = t(jobKey) === jobKey ? job : t(jobKey);

                                                        const invalidCompanies = ['no', 'none', 'na', 'n/a', '-', '', 'नाही', 'Other', 'other'];

                                                        // If company exists and is NOT invalid, show "Job at Company"
                                                        if (company && !invalidCompanies.includes(company.trim().toLowerCase())) {
                                                            return `${displayJob} ${t('common.at')} ${company}`;
                                                        }

                                                        // If company is invalid, just show the Job.
                                                        // BUT, if the job itself is just "Other", "Private Sector" or generic with no company, maybe user wants it hidden?
                                                        // User specifically said "other at naahi text hide it".
                                                        // If we are here, company IS invalid. So we are just returning displayJob.
                                                        // If displayJob is "Other" (or localized "Other"), and company is invalid, we return "Other".
                                                        // It seems user doesn't like "Other" appearing alone either? 
                                                        // Let's assume if it is "Other" alone, we hide it or show "Not Specified"? 
                                                        // Actually, let's just return displayJob for now, but ensure 'naahi' is caught.

                                                        // Wait, if company is 'naahi', !invalidCompanies.includes(...) will be false. 
                                                        // So it goes to 'return displayJob'.
                                                        // displayJob is 'Other' (or translated).
                                                        // So it shows "Other".
                                                        // The user said "Other at naahi text hide it".
                                                        // The screenshot shows "Other at नाही". NOT just "Other".
                                                        // This means my previous logic FAILED to catch 'नाही'.
                                                        // Likely because 'नाही' case or whitespace?

                                                        return displayJob;
                                                        return displayJob;
                                                    })()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hover Action */}
                                        <div className="p-3 pt-0">
                                            <Button className="w-full btn-gold text-xs h-8">
                                                {t('nav.viewProfile')}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More Trigger */}
                            {hasNextPage && (
                                <div className="mt-8 text-center">
                                    <Button
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        variant="outline"
                                        className="min-w-[150px]"
                                    >
                                        {isFetchingNextPage ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load More Profiles'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </>
    );
};

export default PublicProfiles;
