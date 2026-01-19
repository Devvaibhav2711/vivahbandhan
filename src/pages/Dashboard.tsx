import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Heart, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
// Layout removed
import { supabase } from '@/lib/supabase';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [myProfiles, setMyProfiles] = useState<any[]>([]);
  const [sharedProfiles, setSharedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useOnlineStatus(); // Need to import this

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Offline Handling
      if (!isOnline) {
        const cachedProfiles = localStorage.getItem('myProfiles');
        if (cachedProfiles) {
          setMyProfiles(JSON.parse(cachedProfiles));
        }
        setLoading(false);
        return;
      }

      try {
        // Fetch my profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id);

        if (profilesError) console.error('Error fetching profiles:', profilesError);
        else {
          setMyProfiles(profiles || []);
          // Cache my profiles
          localStorage.setItem('myProfiles', JSON.stringify(profiles || []));
        }

        // Fetch shared profiles (matches)
        // We join matches with profiles to get profile details
        // Note: 'profiles' in select refers to the profiles table referenced by profile_id
        const { data: matches, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('user_id', user.id);

        if (matchesError) console.error('Error fetching matches:', matchesError);
        else {
          // Extract profile data from matches
          // matches data structure: [{ ..., profile: { ... } }, ...]
          const profilesFromMatches = matches?.map(m => m.profile).filter(p => p !== null) || [];
          setSharedProfiles(profilesFromMatches);
        }
      } catch (e) {
        console.error('Error in dashboard data fetch:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{t('nav.dashboard')}</h1>
            <p className="text-muted-foreground mb-8">Welcome back, {user?.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card-elegant p-6 text-center">
                <FileText className="w-10 h-10 mx-auto mb-3 text-primary" />
                <p className="text-2xl font-bold">{myProfiles.length}</p>
                <p className="text-sm text-muted-foreground">{t('dashboard.myProfiles')}</p>
              </div>
              <div className="card-elegant p-6 text-center">
                <Heart className="w-10 h-10 mx-auto mb-3 text-accent" />
                <p className="text-2xl font-bold">{sharedProfiles.length}</p>
                <p className="text-sm text-muted-foreground">{t('dashboard.sharedWithMe')}</p>
              </div>
              <div className="card-elegant p-6 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-primary" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">{t('dashboard.matchRequests')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-elegant p-6">
                <h2 className="font-serif text-xl font-bold mb-4">{t('dashboard.quickActions')}</h2>
                <div className="space-y-3">
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/submit-profile">{t('nav.submitProfile')}</Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/request-match">{t('nav.requestMatch')}</Link>
                  </Button>
                </div>
              </div>

              <div className="card-elegant p-6 md:col-span-2">
                <h2 className="font-serif text-xl font-bold mb-4">{t('dashboard.assignedProfiles')}</h2>
                {sharedProfiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sharedProfiles.map((profile: any) => (
                      <Link key={profile.id} to={`/profile/view/${profile.id}`} className="block">
                        <div className="p-4 bg-muted rounded-lg flex items-center gap-4 transition-all hover:bg-muted/80 hover:shadow-sm border border-transparent hover:border-primary/20">
                          <div className="w-12 h-12 rounded-full bg-background overflow-hidden border border-border/50 shrink-0">
                            {profile.profile_photo ? (
                              <img src={profile.profile_photo} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-full h-full p-2 text-muted-foreground/50" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-primary hover:underline">{profile.full_name}</p>
                            <p className="text-sm text-muted-foreground">{profile.age} yrs • {profile.location}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">{t('dashboard.noShared')}</p>
                )}
              </div>

              <div className="card-elegant p-6 md:col-span-2">
                <h2 className="font-serif text-xl font-bold mb-4">{t('dashboard.mySubmitted')}</h2>
                {myProfiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myProfiles.map((profile: any) => (
                      <Link key={profile.id} to={`/profile/edit/${profile.id}`} className="block">
                        <div className="p-4 bg-muted rounded-lg flex items-center gap-4 transition-all hover:bg-muted/80 border hover:border-primary/50">
                          <div className="w-12 h-12 rounded-full bg-background overflow-hidden border border-border/50 shrink-0">
                            {profile.profile_photo ? (
                              <img src={profile.profile_photo} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-full h-full p-2 text-muted-foreground/50" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-primary hover:underline">{profile.full_name}</p>
                            <p className="text-sm text-muted-foreground">{profile.age} {t('common.yrs')} • {profile.status}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.clickEdit')}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">{t('dashboard.noSubmitted')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
