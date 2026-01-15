import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Heart, MessageSquare, FileText, Send, Eye, Trash2, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import AdminUserForm from '@/components/admin/AdminUserForm';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [sharedMatches, setSharedMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('profiles');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [shareUserIds, setShareUserIds] = useState<string[]>([]);
  const [requestToShare, setRequestToShare] = useState<any>(null); // Request being responded to
  const [selectedShareIds, setSelectedShareIds] = useState<string[]>([]);
  const [shareFilterRole, setShareFilterRole] = useState('');
  const [previousShares, setPreviousShares] = useState<any[]>([]); // Track existing shares for selected user
  const [selectedProfileShares, setSelectedProfileShares] = useState<any[]>([]); // Track existing shares for selected profile
  const [isPaymentWallEnabled, setIsPaymentWallEnabled] = useState(false);
  const [isPublicProfilesEnabled, setIsPublicProfilesEnabled] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'premium'>('all');

  const fetchRequests = async () => {
    // Fetch users to get valid IDs for filtering
    const { data: usersData } = await supabase
      .from('users')
      .select('id')
      .neq('role', 'admin');

    const validUserIds = new Set((usersData || []).map(u => u.id));

    const { data: requestsData, error } = await supabase
      .from('match_requests')
      .select('*');

    if (error) {
      console.error('Error fetching requests:', error);
    }

    // Filter requests by valid users
    const filteredRequests = (requestsData || []).filter(r => validUserIds.has(r.user_id));
    setRequests(filteredRequests);
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Users first (excluding admins)
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'admin'); // Hide admins

      const safeUsers = usersData || [];
      setUsers(safeUsers);
      const validUserIds = new Set(safeUsers.map(u => u.id));

      // 2. Fetch Profiles (and filter by validUserIds)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');

      const filteredProfiles = (profilesData || []).filter(p => validUserIds.has(p.user_id));
      setProfiles(filteredProfiles);

      // 3. Fetch Requests (and filter by validUserIds)
      const { data: requestsData, error } = await supabase
        .from('match_requests')
        .select('*');

      if (error) console.error('Error fetching requests:', error);

      const filteredRequests = (requestsData || []).filter(r => validUserIds.has(r.user_id));
      setRequests(filteredRequests);

      // 4. Fetch messages
      const { data: messagesData } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      setMessages(messagesData || []);

      // 5. Fetch Shared Matches
      const { data: sharedData } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'shared')
        .order('created_at', { ascending: false });
      setSharedMatches(sharedData || []);

      // 5. Fetch Settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'enable_payment_wall')
        .maybeSingle();

      setIsPaymentWallEnabled(settingsData?.value === 'true');

      // 6. Fetch Public Profiles Setting
      const { data: publicSetting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'enable_public_profiles')
        .maybeSingle();

      setIsPublicProfilesEnabled(publicSetting?.value === 'true');
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Poll for new requests only - Profiles and Users are relatively static or don't need real-time
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (requestToShare) {
      const fetchShares = async () => {
        const { data } = await supabase
          .from('matches')
          .select('profile_id, created_at')
          .eq('user_id', requestToShare.user_id)
          .in('status', ['shared', 'shortlisted', 'liked']);

        if (data) setPreviousShares(data);
      };
      fetchShares();
    } else {
      setPreviousShares([]);
    }
  }, [requestToShare]);

  // Fetch existing shares when a PROFILE is selected for sharing
  useEffect(() => {
    if (selectedProfile) {
      const fetchProfileShares = async () => {
        const { data } = await supabase
          .from('matches')
          .select('user_id, created_at')
          .eq('profile_id', selectedProfile.id)
          .in('status', ['shared', 'shortlisted', 'liked']);

        if (data) setSelectedProfileShares(data);
      };
      fetchProfileShares();
    } else {
      setSelectedProfileShares([]);
      setShareUserIds([]);
    }
  }, [selectedProfile]);

  const handleShareProfile = async () => {
    if (!selectedProfile || shareUserIds.length === 0) return;

    try {
      // Use RPC for atomic and reliable sharing
      // Use Upsert for Direct Sharing
      const { error } = await supabase
        .from('matches')
        .upsert(
          shareUserIds.map(uid => ({
            user_id: uid,
            profile_id: selectedProfile.id,
            status: 'shared'
          })),
          { onConflict: 'user_id, profile_id' }
        );

      if (error) throw error;

      toast({ title: 'Profile Shared', description: `Profile shared with ${shareUserIds.length} users successfully.` });
    } catch (error: any) {
      console.error('Error sharing profile:', error);
      toast({ title: 'Error', description: error.message || 'Failed to share profile', variant: 'destructive' });
    }

    setSelectedProfile(null);
    setShareUserIds([]);
  };

  const handleDeleteUser = async (userId: string, profileId?: string, photoUrl?: string) => {
    if (!window.confirm("Are you sure? This will permanently delete the user's account, profile, and data. This action cannot be undone.")) {
      return;
    }

    try {
      // 1. Delete Photo from Storage if exists
      if (photoUrl) {
        try {
          // Extract file path from URL
          // URL format: .../profile-photos/user_id-timestamp.ext
          const urlObj = new URL(photoUrl);
          const pathParts = urlObj.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1]; // e.g. "uuid-timestamp.jpg"

          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from('profile-photos')
              .remove([fileName]);

            if (storageError) {
              console.warn('Could not delete photo from storage:', storageError);
              // Continue anyway to delete the account
            }
          }
        } catch (e) {
          console.warn('Error parsing photo URL for deletion:', e);
        }
      }

      // 2. Call RPC to delete Auth User (cascades to Profile)
      const { error: rpcError } = await supabase.rpc('delete_user_full', { user_id_input: userId });

      if (rpcError) throw rpcError;

      // 3. Update UI
      setUsers(prev => prev.filter(u => u.id !== userId));
      setProfiles(prev => prev.filter(p => p.user_id !== userId));
      setSharedMatches(prev => prev.filter(m => m.user_id !== userId)); // Also remove shared entries for this user
      setRequests(prev => prev.filter(r => r.user_id !== userId)); // Also remove requests

      toast({ title: 'Account Deleted', description: 'User account and data permanently removed.' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete user', variant: 'destructive' });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to delete this match request?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('match_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast({ title: 'Request Deleted', description: 'Match request removed successfully.' });
    } catch (error: any) {
      console.error('Error deleting request:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete request', variant: 'destructive' });
    }
  };

  const handleDeleteSharedProfile = async (matchId: string) => {
    if (!window.confirm("Are you sure you want to remove this shared profile entry?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      setSharedMatches(prev => prev.filter(m => m.id !== matchId));
      toast({ title: 'Shared Profile Removed', description: 'Shared entry deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting shared profile:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete shared profile', variant: 'destructive' });
    }
  };

  const handleTogglePublicProfiles = async (newValue: boolean) => {
    if (!window.confirm(`Are you sure you want to ${newValue ? 'ENABLE' : 'DISABLE'} the "All Profiles" public tab?`)) {
      return;
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'enable_public_profiles', value: String(newValue) }, { onConflict: 'key' });

    if (error) {
      console.error('Error updating public profiles setting:', error);
      toast({ title: 'Error', description: 'Failed to update setting', variant: 'destructive' });
    } else {
      setIsPublicProfilesEnabled(newValue);
      toast({ title: 'Success', description: `Public Profiles ${newValue ? 'Enabled' : 'Disabled'}` });
    }
  };

  const handleTogglePaymentWall = async (newValue: boolean) => {
    if (!window.confirm(`Are you sure you want to ${newValue ? 'ENABLE' : 'DISABLE'} the Payment Requirement for requests?`)) {
      return;
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'enable_payment_wall', value: String(newValue) });

    if (error) {
      console.error('Error updating setting:', error);
      toast({ title: 'Error', description: 'Failed to update setting', variant: 'destructive' });
    } else {
      setIsPaymentWallEnabled(newValue);
      toast({ title: 'Success', description: `Payment Requirement ${newValue ? 'Enabled' : 'Disabled'}` });
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">Admin access required.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl font-bold mb-6">{t('admin.dashboard')}</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div
              className={`card-elegant p-4 text-center cursor-pointer transition-all hover:scale-105 ${activeTab === 'users' && userFilter === 'premium' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onClick={() => { setActiveTab('users'); setUserFilter('premium'); }}
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold text-amber-700">{profiles.filter(p => p.subscription_type === 'premium').length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('admin.stats.premium')}</p>
            </div>

            <div
              className={`card-elegant p-4 text-center cursor-pointer transition-all hover:scale-105 ${activeTab === 'requests' ? 'ring-2 ring-accent bg-accent/5' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <Heart className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">{requests.length}</p>
              <p className="text-xs text-muted-foreground">{t('admin.stats.requests')}</p>
            </div>

            <div
              className={`card-elegant p-4 text-center cursor-pointer transition-all hover:scale-105 ${activeTab === 'users' && userFilter === 'all' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onClick={() => { setActiveTab('users'); setUserFilter('all'); }}
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">{t('admin.stats.totalUsers')}</p>
            </div>

            <div
              className={`card-elegant p-4 text-center cursor-pointer transition-all hover:scale-105 ${activeTab === 'messages' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{messages.length}</p>
              <p className="text-xs text-muted-foreground">{t('admin.stats.messages')}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border pb-2 overflow-x-auto">
            {[
              { id: 'profiles', label: t('admin.tab.profiles') },
              { id: 'requests', label: t('admin.tab.requests') },
              { id: 'users', label: t('admin.tab.users') },
              { id: 'messages', label: t('admin.tab.messages') },
              { id: 'add-user', label: t('admin.tab.addUser') },
              { id: 'shared', label: t('admin.tab.shared') },
              { id: 'settings', label: t('admin.tab.settings') }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'users') setUserFilter('all'); // Reset filter when clicking tab
                }}
                className="capitalize"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'profiles' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {profiles.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-secondary/5 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No profiles submitted yet.</p>
                </div>
              ) : (
                profiles.map(profile => (
                  <div key={profile.id} className="card-elegant bg-white relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-secondary/20">
                    <div className="h-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 relative">
                      <div className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider text-primary bg-white/50 backdrop-blur px-2 py-1 rounded-full shadow-sm">
                        {profile.gender === 'male' ? 'Groom' : 'Bride'}
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-0 flex flex-col items-center -mt-12 text-center relative z-10 w-full">
                      <div className="w-24 h-24 rounded-xl bg-white p-1.5 shadow-md mb-4 group-hover:rotate-1 transition-transform duration-300">
                        <div className="w-full h-full bg-muted rounded-lg overflow-hidden relative">
                          {profile.profile_photo ? (
                            <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-full h-full p-6 text-muted-foreground/30 bg-secondary/10" />
                          )}
                        </div>
                      </div>

                      <div className="w-full space-y-1 mb-4">
                        <h3 className="font-serif font-bold text-lg text-gray-900 truncate px-2" title={profile.full_name || profile.fullName}>{profile.full_name || profile.fullName}</h3>
                        <p className="text-xs text-muted-foreground truncate w-full">{profile.userEmail}</p>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-2 text-xs text-left bg-secondary/5 p-3 rounded-lg mb-4 border border-secondary/10">
                        <div className="space-y-1 text-center sm:text-left"><p className="text-muted-foreground">{t('common.age')}</p><p className="font-medium text-gray-700">{profile.age} {t('common.yrs')}</p></div>
                        <div className="space-y-1 text-center sm:text-left"><p className="text-muted-foreground">{t('profile.location')}</p><p className="font-medium text-gray-700 truncate" title={profile.location}>{profile.location}</p></div>
                        <div className="space-y-1 text-center sm:text-left"><p className="text-muted-foreground">{t('profile.education')}</p><p className="font-medium text-gray-700 truncate" title={profile.education}>{profile.education}</p></div>

                      </div>

                      <div className="w-full flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedProfile(profile)} className="flex-1 border-primary/20 hover:border-primary hover:text-primary transition-colors">
                              <Send className="w-3 h-3 mr-2" /> Share
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('admin.shareProfile')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <p className="text-sm">Sharing: <strong>{profile.fullName || profile.full_name}</strong></p>
                              <div className="border rounded-md p-2 max-h-60 overflow-y-auto space-y-2">
                                {users.filter(u => {
                                  // 1. Prevent sharing with self
                                  if (u.id === profile.user_id) return false;

                                  const uProfile = profiles.find(p => p.user_id === u.id);

                                  // 2. Gender Check (Opposite Gender Only)
                                  if (uProfile && uProfile.gender && profile.gender) {
                                    if (uProfile.gender.toLowerCase() === profile.gender.toLowerCase()) return false;
                                  }

                                  // 3. Premium Check (Only share with Premium Users)
                                  if (uProfile?.subscription_type !== 'premium') return false;

                                  return true;
                                }).length === 0 ? <p className="text-sm text-muted-foreground p-2">No eligible Premium users found.</p> : (
                                  users.filter(u => {
                                    if (u.id === profile.user_id) return false;
                                    const uProfile = profiles.find(p => p.user_id === u.id);

                                    // Gender Check
                                    if (uProfile && uProfile.gender && profile.gender) {
                                      if (uProfile.gender.toLowerCase() === profile.gender.toLowerCase()) return false;
                                    }

                                    // Premium Check
                                    if (uProfile?.subscription_type !== 'premium') return false;

                                    return true;
                                  }).map(u => {
                                    const shareRecord = selectedProfileShares.find(s => s.user_id === u.id);
                                    let isAlreadyShared = false;
                                    let isModified = false;

                                    if (shareRecord) {
                                      isAlreadyShared = true;
                                      const lastModified = selectedProfile.updated_at ? new Date(selectedProfile.updated_at) : (selectedProfile.created_at ? new Date(selectedProfile.created_at) : new Date());
                                      const lastShared = new Date(shareRecord.created_at);
                                      // If modified since last share, allow strictly 'reshare'
                                      if (lastModified > lastShared) {
                                        isModified = true;
                                      }
                                    }

                                    const isDisabled = isAlreadyShared && !isModified;

                                    return (
                                      <div key={u.id} className={`flex items-center space-x-2 p-1 rounded ${isDisabled ? 'bg-muted/50 cursor-not-allowed opacity-75' : 'hover:bg-muted'}`}>
                                        <input
                                          type="checkbox"
                                          id={`share-${u.id}`}
                                          className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                          checked={shareUserIds.includes(u.id)}
                                          disabled={isDisabled}
                                          onChange={(e) => {
                                            if (isDisabled) return;
                                            if (e.target.checked) {
                                              setShareUserIds([...shareUserIds, u.id]);
                                            } else {
                                              setShareUserIds(shareUserIds.filter(id => id !== u.id));
                                            }
                                          }}
                                        />
                                        <label htmlFor={`share-${u.id}`} className={`text-sm flex-1 flex items-center gap-2 ${isDisabled ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}>
                                          {u.email}
                                          {isAlreadyShared && !isModified && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border">Shared</span>}
                                          {isAlreadyShared && isModified && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200">Modified</span>}
                                        </label>
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                              <Button onClick={handleShareProfile} className="w-full btn-gold" disabled={shareUserIds.length === 0}>
                                Share Profile ({shareUserIds.length})
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(profile.user_id, profile.id, profile.profile_photo)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {requests.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-secondary/5 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No match requests yet.</p>
                </div>
              ) : (
                requests.filter(req => users.find(u => u.id === req.user_id)).map(req => {
                  const reqUser = users.find(u => u.id === req.user_id);
                  const reqProfile = profiles.find(p => p.user_id === req.user_id);

                  // Try to determine role if possible from profile, else fallback
                  return (
                    <div key={req.id} className="card-elegant bg-white relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-secondary/20 flex flex-col items-center">

                      <div className="h-24 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/10 relative w-full">
                        <div className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider text-primary bg-white/50 backdrop-blur px-2 py-1 rounded-full shadow-sm">
                          Request
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-0 flex flex-col items-center -mt-12 text-center relative z-10 w-full">
                        <div className="w-24 h-24 rounded-xl bg-white p-1.5 shadow-md mb-4 group-hover:rotate-1 transition-transform duration-300">
                          <div className="w-full h-full bg-muted rounded-lg overflow-hidden relative">
                            {reqProfile?.profile_photo ? (
                              <img src={reqProfile.profile_photo} alt="Requester" className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-full h-full p-6 text-muted-foreground/30 bg-secondary/10" />
                            )}
                          </div>
                        </div>

                        <div className="w-full space-y-1 mb-4">
                          <h3 className="font-serif font-bold text-lg text-gray-900 truncate px-2" title={reqUser?.email || 'Unknown'}>{reqUser?.email?.split('@')[0] || 'Unknown User'}</h3>
                          <p className="text-xs text-muted-foreground truncate w-full">{reqUser?.email}</p>
                        </div>

                        <div className="w-full bg-secondary/5 p-3 rounded-lg mb-4 text-xs text-left grid grid-cols-2 gap-y-2 gap-x-1 border border-secondary/10">


                          <div><span className="text-muted-foreground">{t('common.age')}:</span> <span className="font-medium">{req.age_min || req.ageMin}-{req.age_max || req.ageMax}</span></div>
                          <div><span className="text-muted-foreground">{t('common.height')}:</span> <span className="font-medium truncate">{req.height_min || req.heightMin || ''}-{req.height_max || req.heightMax || ''}</span></div>
                          <div className="col-span-2"><span className="text-muted-foreground">{t('common.loc')}:</span> <span className="font-medium truncate" title={req.location_pref || req.locationPref}>{req.location_pref || req.locationPref || 'Any'}</span></div>
                          {(req.additional_req || req.additionalReq) && <div className="col-span-2 mt-2 pt-2 border-t border-border/50 text-muted-foreground italic line-clamp-2">"{req.additional_req || req.additionalReq}"</div>}
                        </div>

                        <Button size="sm" onClick={() => setRequestToShare(req)} className="w-full btn-gold shadow-md flex-1">
                          <Send className="w-4 h-4 mr-2" /> Share
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRequest(req.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive px-2"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {users.filter(u => {
                if (userFilter === 'all') return true;
                if (userFilter === 'premium') {
                  const p = profiles.find(prof => prof.user_id === u.id);
                  return p?.subscription_type === 'premium';
                }
                return true;
              }).length === 0 ? (
                <div className="col-span-full text-center py-12 bg-secondary/5 rounded-lg border border-dashed">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No {userFilter === 'premium' ? 'Premium' : ''} users found.</p>
                </div>
              ) : (
                users
                  .filter(u => {
                    if (userFilter === 'all') return true;
                    if (userFilter === 'premium') {
                      const p = profiles.find(prof => prof.user_id === u.id);
                      return p?.subscription_type === 'premium';
                    }
                    return true;
                  })
                  .map(u => {
                    const userProfile = profiles.find(p => p.user_id === u.id);
                    return (
                      <div
                        key={u.id}
                        className={`card-elegant bg-white relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-secondary/20 ${userProfile ? 'cursor-pointer' : ''}`}
                        onClick={() => {
                          if (userProfile) navigate(`/profile/edit/${userProfile.id}`);
                          else toast({ title: "No Profile", description: "This user has not created a profile yet." });
                        }}
                      >
                        {/* Top Decorative Bar */}
                        <div className="h-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 relative">
                          <div className="absolute top-3 right-3 z-10 w-full px-3 flex justify-between items-start" onClick={(e) => e.stopPropagation()}>

                            {/* Premium Status Toggle */}
                            <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm gap-2">
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${userProfile?.subscription_type === 'premium' ? 'text-amber-600' : 'text-gray-500'}`}>
                                {userProfile?.subscription_type === 'premium' ? 'Premium' : 'Free'}
                              </span>
                              <Switch
                                className={`scale-75 origin-right ${userProfile?.subscription_type === 'premium' ? 'data-[state=checked]:bg-amber-500' : ''}`}
                                checked={userProfile?.subscription_type === 'premium'}
                                disabled={!userProfile} // Can't mark premium if no profile exists
                                onCheckedChange={async (checked) => {
                                  if (!userProfile) return;
                                  try {
                                    const { error } = await supabase
                                      .from('profiles')
                                      .update({ subscription_type: checked ? 'premium' : 'free' })
                                      .eq('id', userProfile.id);

                                    if (error) throw error;

                                    // Update local state
                                    setProfiles(profiles.map(p =>
                                      p.id === userProfile.id
                                        ? { ...p, subscription_type: checked ? 'premium' : 'free' }
                                        : p
                                    ));

                                    toast({
                                      title: 'Membership Updated',
                                      description: `User marked as ${checked ? 'Premium' : 'Free'} member.`
                                    });

                                  } catch (error: any) {
                                    console.error('Error updating subscription:', error);
                                    toast({ title: 'Error', description: 'Failed to update subscription', variant: 'destructive' });
                                  }
                                }}
                              />
                            </div>

                            {/* Account Active Toggle */}
                            <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm gap-2">
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${u.role === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                                {u.role === 'active' ? 'Active' : 'Pending'}
                              </span>
                              <Switch
                                className="scale-75 origin-right"
                                checked={u.role === 'active'}
                                onCheckedChange={async (checked) => {
                                  try {
                                    const { error } = await supabase
                                      .from('users')
                                      .update({ role: checked ? 'active' : 'user' })
                                      .eq('id', u.id);

                                    if (error) throw error;
                                    setUsers(users.map(user => user.id === u.id ? { ...user, role: checked ? 'active' : 'user' } : user))
                                    toast({ title: 'Status Updated', description: `User status updated successfully.` });

                                  } catch (error: any) {
                                    console.error('Error updating user status:', error);
                                    toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Profile Content */}
                        <div className="px-6 pb-6 pt-0 flex flex-col items-center -mt-12 text-center relative z-0">

                          {/* Profile Photo */}
                          <div className="w-24 h-24 rounded-xl bg-white p-1.5 shadow-md mb-4 rotate-0 group-hover:rotate-1 transition-transform duration-300">
                            <div className="w-full h-full bg-muted rounded-lg overflow-hidden relative">
                              {userProfile?.profile_photo ? (
                                <img src={userProfile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-full h-full p-6 text-muted-foreground/30 bg-secondary/10" />
                              )}
                            </div>
                          </div>

                          {/* Name & Basic Info */}
                          <div className="w-full space-y-1 mb-4">
                            <h3 className="font-serif font-bold text-lg text-gray-900 truncate px-2" title={userProfile?.full_name || u.email}>
                              {userProfile?.full_name || u.email.split('@')[0]}
                            </h3>
                            {userProfile && userProfile.full_name && <p className="text-xs text-muted-foreground truncate">{u.email}</p>}
                          </div>

                          {/* Details Grid */}
                          <div className="w-full grid grid-cols-2 gap-2 text-xs text-left bg-secondary/5 p-3 rounded-lg mb-4 border border-secondary/10">
                            <div className="space-y-1">
                              <p className="text-muted-foreground">{t('common.joined')}</p>
                              <p className="font-medium text-gray-700">{new Date(u.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground">{t('profile.location')}</p>
                              <p className="font-medium text-gray-700 truncate" title={userProfile?.location}>{userProfile?.location || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground">{t('common.age')}</p>
                              <p className="font-medium text-gray-700">{userProfile?.age ? `${userProfile.age} ${t('common.yrs')}` : 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground">{t('common.status')}</p>
                              <p className={`font-medium ${userProfile ? 'text-green-600' : 'text-red-500'}`}>
                                {userProfile ? 'Complete' : 'No Profile'}
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="w-full flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {userProfile ? (
                              <Button variant="outline" className="flex-1 border-primary/20 hover:bg-primary hover:text-white transition-colors group-hover:border-primary" onClick={() => navigate(`/profile/edit/${userProfile.id}`)}>
                                Edit Profile
                              </Button>
                            ) : (
                              <Button variant="ghost" disabled className="flex-1 text-muted-foreground bg-muted/50">
                                Profile Missing
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                              onClick={() => handleDeleteUser(u.id, userProfile?.id, userProfile?.profile_photo)}
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {messages.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-secondary/5 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No messages found.</p>
                </div>
              ) : (
                messages.map(msg => {
                  const senderProfile = profiles.find(p => p.user_id === msg.user_id);
                  const displayName = msg.name || senderProfile?.full_name || senderProfile?.fullName || 'Unknown';
                  const replyBody = encodeURIComponent(`\n\n\n--- Original Message ---\nFrom: ${displayName}\nSent: ${new Date(msg.created_at).toLocaleString()}\n\n${msg.message}`);
                  const replySubject = encodeURIComponent(`Re: ${msg.subject || 'Your Inquiry'}`);

                  return (
                    <div key={msg.id} className="card-elegant bg-white p-6 relative group border border-secondary/20 hover:shadow-lg transition-all flex flex-col h-full">
                      {/* Header: Sender Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full border bg-muted overflow-hidden shrink-0">
                          {senderProfile && senderProfile.profile_photo ? (
                            <img src={senderProfile.profile_photo} className="w-full h-full object-cover" alt="Sender" />
                          ) : (
                            <Users className="w-full h-full p-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold truncate" title={displayName}>{displayName}</h3>
                          <p className="text-xs text-muted-foreground truncate" title={msg.email}>{msg.email}</p>
                          <p className="text-[10px] text-muted-foreground/70">{new Date(msg.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="bg-secondary/5 p-3 rounded-lg flex-1 mb-4 text-sm overflow-hidden">
                        <p className="font-medium mb-2 text-primary/80 border-b border-secondary/10 pb-1">{msg.subject || 'General Inquiry'}</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
                      </div>

                      <div className="flex gap-2 w-full mt-auto">
                        <Button asChild className="flex-1 btn-gold" size="sm">
                          <a href={`mailto:${msg.email}?subject=${replySubject}&body=${replyBody}`}>
                            <Send className="w-3 h-3 mr-2" /> Reply
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                          onClick={async () => {
                            if (!window.confirm("Are you sure you want to delete this message?")) return;
                            try {
                              const { error } = await supabase.from('contact_messages').delete().eq('id', msg.id);
                              if (error) throw error;
                              setMessages(prev => prev.filter(m => m.id !== msg.id));
                              toast({ title: 'Message Deleted', description: 'Message removed successfully.' });
                            } catch (e: any) {
                              console.error(e);
                              toast({ title: 'Error', description: 'Failed to delete message', variant: 'destructive' });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'shared' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {sharedMatches.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-secondary/5 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No shared profiles found.</p>
                </div>
              ) : (
                sharedMatches.map(match => {
                  const sharedProfile = profiles.find(p => p.id === match.profile_id);
                  const sharedToUser = users.find(u => u.id === match.user_id);

                  return (
                    <div key={match.id} className="card-elegant bg-white p-6 relative group border border-secondary/20 hover:shadow-lg transition-all">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteSharedProfile(match.id)}
                          title="Remove Shared Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full border bg-muted overflow-hidden shrink-0">
                          {sharedProfile && sharedProfile.profile_photo ? (
                            <img src={sharedProfile.profile_photo} className="w-full h-full object-cover" alt="Profile" />
                          ) : (
                            <Users className="w-full h-full p-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold truncate" title={sharedProfile?.full_name}>{sharedProfile?.full_name || 'Unknown Profile'}</h3>
                          <p className="text-xs text-muted-foreground" title={sharedToUser?.email}>Shared to: {sharedToUser?.email || 'Unknown User'}</p>
                        </div>
                      </div>

                      <div className="bg-secondary/5 p-3 rounded-lg mb-4 text-sm border border-secondary/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-muted-foreground font-medium">Shared On:</span>
                          <Badge variant="outline" className="bg-white">{new Date(match.created_at).toLocaleDateString()}</Badge>
                        </div>
                        <div className="text-xs text-right text-muted-foreground">
                          {new Date(match.created_at).toLocaleTimeString()}
                        </div>
                      </div>

                      <Button asChild className="w-full btn-gold" onClick={() => navigate(`/profile/view/${match.profile_id}`)}>
                        <span className="flex items-center justify-center gap-2 cursor-pointer">
                          <Eye className="w-4 h-4" /> View & Download
                        </span>
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'add-user' && (
            <AdminUserForm />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className="card-elegant bg-white p-8 border border-secondary/20">
                <div className="flex items-center gap-4 mb-6 text-primary">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Settings className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold">{t('admin.settings.title')}</h2>
                    <p className="text-muted-foreground">{t('admin.settings.desc')} </p>
                  </div>
                </div>


                <div className="space-y-6">
                  <div className="flex items-start justify-between p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                    <div className="space-y-1">
                      <Label htmlFor="payment-wall" className="text-base font-semibold">{t('admin.settings.paymentWall')}</Label>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {t('admin.settings.paymentWallDesc')}
                      </p>
                    </div>
                    <Switch
                      id="payment-wall"
                      checked={isPaymentWallEnabled}
                      onCheckedChange={handleTogglePaymentWall}
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                    <div className="space-y-1">
                      <Label htmlFor="public-profiles" className="text-base font-semibold">{t('admin.settings.publicProfiles')}</Label>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {t('admin.settings.publicProfilesDesc')}
                      </p>
                    </div>
                    <Switch
                      id="public-profiles"
                      checked={isPublicProfilesEnabled}
                      onCheckedChange={handleTogglePublicProfiles}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full"><Eye className="w-4 h-4" /></div>
                    <div>
                      <strong>{t('admin.settings.preview')}:</strong> {t('admin.settings.previewText')} <Link to="/payment-info" className="underline font-bold">Payment Info Page</Link>.
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}


          {/* Dialog for Sharing Profile in Response to Request */}
          <Dialog open={!!requestToShare} onOpenChange={(open) => !open && (setRequestToShare(null), setSelectedShareIds([]), setShareFilterRole(''))}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col">
              <DialogHeader>
                <DialogTitle>Select Profiles to Share with {users.find(u => u.id === requestToShare?.user_id)?.email}</DialogTitle>
              </DialogHeader>

              {/* Controls */}
              <div className="flex gap-4 items-end pb-2">
                <div className="flex-1 space-y-2">
                  <Label>Filter by Profession</Label>
                  <Input
                    placeholder="e.g. Doctor, Engineer..."
                    value={shareFilterRole}
                    onChange={(e) => setShareFilterRole(e.target.value)}
                  />
                </div>
                <div className="flex-none">
                  <p className="text-sm font-medium mb-2">{selectedShareIds.length} Selected</p>
                </div>
              </div>

              {(() => {
                const reqProfile = profiles.find(p => p.user_id === requestToShare?.user_id);
                const reqGender = reqProfile?.gender?.toLowerCase();
                const targetGender = reqGender === 'male' ? 'female' : (reqGender === 'female' ? 'male' : null);

                const filteredProfiles = profiles.filter(p => {
                  // Gender Filter
                  if (targetGender && p.gender?.toLowerCase() !== targetGender) return false;
                  // Profession Filter
                  if (shareFilterRole && !p.profession?.toLowerCase().includes(shareFilterRole.toLowerCase()) && !p.about?.toLowerCase().includes(shareFilterRole.toLowerCase())) return false;
                  return true;
                });

                const handleToggle = (pid: string) => {
                  const profile = filteredProfiles.find(p => p.id === pid);
                  const shareRecord = previousShares.find(s => s.profile_id === pid);

                  if (shareRecord) {
                    const lastModified = profile?.updated_at ? new Date(profile.updated_at) : (profile?.created_at ? new Date(profile.created_at) : new Date());
                    const lastShared = new Date(shareRecord.created_at);

                    // If not modified since last share, block it
                    if (lastModified <= lastShared) {
                      toast({ title: 'Already Shared', description: 'This profile has already been shared and has not been updated since.', variant: 'destructive' }); // Using destructive/warning
                      return;
                    }
                  }

                  if (selectedShareIds.includes(pid)) {
                    setSelectedShareIds(prev => prev.filter(id => id !== pid));
                  } else {
                    setSelectedShareIds(prev => [...prev, pid]);
                  }
                };

                const handleBulkShare = async () => {
                  if (!requestToShare || selectedShareIds.length === 0) return;
                  try {
                    // Use RPC for atomic sharing
                    // Use Upsert for Bulk Response
                    const { error } = await supabase
                      .from('matches')
                      .upsert(
                        selectedShareIds.map(pid => ({
                          user_id: requestToShare.user_id,
                          profile_id: pid,
                          status: 'shared'
                        })),
                        { onConflict: 'user_id, profile_id' }
                      );
                    if (error) throw error;

                    toast({ title: 'Shared', description: `Shared ${selectedShareIds.length} profiles successfully.` });
                    setRequestToShare(null);
                    setSelectedShareIds([]);
                    setShareFilterRole('');
                  } catch (e: any) {
                    toast({ title: 'Error', description: e.message, variant: 'destructive' });
                  }
                };

                return (
                  <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
                    {targetGender ? (
                      <p className="text-xs text-green-600 bg-green-50 p-2 rounded inline-block">
                        Auto-Suggestion: Showing <b>{targetGender}</b> profiles
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Showing all profiles</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-16">
                      {filteredProfiles.map(profile => {
                        const isSelected = selectedShareIds.includes(profile.id);
                        const shareRecord = previousShares.find(s => s.profile_id === profile.id);

                        const handleUnshare = async (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (!requestToShare) return;
                          if (!window.confirm("Are you sure you want to unshare this profile? The user will no longer see it.")) return;

                          try {
                            const { error } = await supabase
                              .from('matches')
                              .delete()
                              .match({ user_id: requestToShare.user_id, profile_id: profile.id });

                            if (error) throw error;

                            toast({ title: 'Unshared', description: 'Profile removed from user\'s matches.' });
                            // Update local state
                            setPreviousShares(prev => prev.filter(s => s.profile_id !== profile.id));
                          } catch (error: any) {
                            console.error('Error unsharing:', error);
                            toast({ title: 'Error', description: 'Failed to unshare profile', variant: 'destructive' });
                          }
                        };
                        return (
                          <div
                            key={profile.id}
                            onClick={() => handleToggle(profile.id)}
                            className={`border rounded-lg p-3 flex flex-col gap-3 cursor-pointer transition-all relative group
                                ${isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/50 hover:bg-muted/30'}
                            `}
                          >
                            {isSelected && <div className="absolute top-2 right-2 text-primary bg-white rounded-full"><div className="w-4 h-4 bg-primary rounded-full" /></div>}

                            {/* Shared Status Indicator */}
                            {(() => {
                              const shareRecord = previousShares.find(s => s.profile_id === profile.id);
                              if (shareRecord) {
                                const lastModified = profile.updated_at ? new Date(profile.updated_at) : new Date(profile.created_at);
                                const lastShared = new Date(shareRecord.created_at);
                                if (lastModified <= lastShared) {
                                  return <div className="absolute top-2 right-2 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">Shared</div>;
                                } else {
                                  return <div className="absolute top-2 right-8 bg-amber-50 text-amber-600 text-[10px] px-2 py-0.5 rounded-full border border-amber-200 shadow-sm">Modified</div>;
                                }
                              }
                              return null;
                            })()}

                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
                                {profile.profile_photo ? <img src={profile.profile_photo} alt={profile.full_name} className="w-full h-full object-cover" /> : <Users className="w-6 h-6 m-3" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate text-sm" title={profile.full_name}>{profile.full_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{profile.age} yrs • {profile.profession}</p>
                                <p className="text-xs text-muted-foreground truncate">{profile.location}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-between mt-auto pt-2 border-t border-dashed border-border/50" onClick={(e) => e.stopPropagation()}>
                              {profile.profile_photo && (
                                <a href={profile.profile_photo} download target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center">
                                  <Eye className="w-3 h-3 mr-1" /> Photo
                                </a>
                              )}
                              {shareRecord && (
                                <button
                                  onClick={handleUnshare}
                                  className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded flex items-center transition-colors"
                                  title="Unshare / Delete Match"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" /> Unshare
                                </button>
                              )}
                            </div>
                            <div className={`text-xs ${isSelected ? 'md:hidden' : 'text-muted-foreground'}`}>
                              {isSelected ? 'Selected' : 'Click to select'}
                            </div>
                          </div>
                        );
                      })}
                      {filteredProfiles.length === 0 && <p className="text-muted-foreground col-span-full py-10 text-center">No matching profiles found.</p>}
                    </div>

                    {/* Footer Button */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-border mt-auto flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setRequestToShare(null)}>Cancel</Button>
                      <Button onClick={handleBulkShare} className="btn-gold" disabled={selectedShareIds.length === 0}>
                        Share {selectedShareIds.length} Profiles
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>

        </div >
      </section >
    </Layout >
  );
};

export default Admin;
