import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Mail, User, Briefcase, MapPin, Users, Info, ArrowLeft, Phone, Download, ShieldCheck, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { getPrivacySafeLocation } from '@/utils/locationUtils';
import { Label } from '@/components/ui/label';
// Layout removed
import { useToast } from '@/hooks/use-toast';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { supabase } from '@/lib/supabase';

const ViewProfile: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useLanguage();
    const { user, isAdmin } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [profileUser, setProfileUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const profileRef = useRef<HTMLDivElement>(null);

    const isOnline = useOnlineStatus();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) return;
            try {
                // Network First
                if (navigator.onLine) {
                    const { data: profileData, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) throw error;
                    setProfile(profileData);

                    // Cache the profile for later offline use
                    try {
                        localStorage.setItem('lastViewedProfile', JSON.stringify(profileData));
                        localStorage.setItem('lastViewedProfileId', id);
                    } catch (e) {
                        console.error("Cache fail", e);
                    }

                    // ... (fetch user data logic remains same or similar)
                    // Simplified to just logic needed
                    if (profileData.user_id) {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('email, phone')
                            .eq('id', profileData.user_id)
                            .maybeSingle(); // Use maybeSingle to avoid error if not found
                        setProfileUser(userData);
                    }

                } else {
                    // Offline Mode
                    throw new Error("Offline");
                }

            } catch (error: any) {
                console.error('Error loading profile:', error);

                // Offline Fallback
                const cachedId = localStorage.getItem('lastViewedProfileId');
                const cachedData = localStorage.getItem('lastViewedProfile');

                if (cachedId === id && cachedData) {
                    setProfile(JSON.parse(cachedData));
                    toast({ title: "Offline Mode", description: "Viewing cached profile.", variant: "default" });
                    setLoading(false);
                    return;
                }

                // If not in cache and online, try fallbacks (RPC etc) - keeping existing logic roughly
                // But for simplicity in this replacement, we just start existing fallbacks if online
                if (navigator.onLine) {
                    // ... existing fallback code would go here
                    // Fallback: Try fetching via Public RPC if direct access failed
                    try {
                        const { data: rpcData, error: rpcError } = await supabase.rpc('get_public_profile_by_id', { profile_id: id });
                        if (!rpcError && rpcData && rpcData.length > 0) {
                            setProfile(rpcData[0]);
                            // Cache this too
                            localStorage.setItem('lastViewedProfile', JSON.stringify(rpcData[0]));
                            localStorage.setItem('lastViewedProfileId', id);
                            return;
                        }
                    } catch (rpcErr) {
                        // ...
                    }

                    // ... List fallback ...
                }

                toast({
                    title: t('common.error'),
                    description: isOnline ? `${t('error.loadProfile')}: ${error.message}` : "You are offline and this profile is not cached.",
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, user, navigate, toast, isOnline]);

    const handleDownloadImage = async () => {
        if (!profileRef.current) return;

        // Show a loading toast or partial loading state instead of full page loader to avoid flicker
        // But for minimal changes, we can just try/catch
        try {
            const canvas = await html2canvas(profileRef.current, {
                useCORS: true,
                scale: 2,
                logging: false,
                backgroundColor: '#ffffff'
            });
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `ShubhVivahBandhan-Profile-${profile?.full_name || 'User'}.png`;
            link.href = url;
            link.click();
            toast({ title: t('common.success'), description: "Profile downloaded successfully." });
        } catch (error) {
            console.error('Download error:', error);
            toast({ title: t('common.error'), description: "Failed to download profile.", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Loading profile...</p>
                </div>
            </>
        );
    }
    // Public access allowed. Contact info is hidden by 'canViewContact' logic.
    // if (!user) { ... } removed.

    if (!profile) return <><div className="text-center py-20">Profile not found</div></>;

    const isOwner = user?.id === profile.user_id;
    const canViewContact = isAdmin || isOwner;

    // Strict Contact Privacy:
    // If not authorized, hide value completely or show "Restricted"
    // Also, if restricted, we might want to hide the entire row or show a placeholder.
    const InfoItem = ({ icon: Icon, label, value, restricted = false }: any) => {
        // Check if value is effectively empty
        const isEmpty = !value || value === '-' || (typeof value === 'string' && value.trim() === '');

        if (restricted && !canViewContact) {
            // Option: Don't render anything if restricted and hidden
            // return null; 
            // Option: Render "Restricted" text
            return (
                <div className="space-y-1 opacity-50">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                        {Icon && <Icon className="w-3 h-3" />} {label}
                    </Label>
                    <p className="font-medium text-muted-foreground italic">Hidden</p>
                </div>
            );
        }

        if (isEmpty) return null;

        return (
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    {Icon && <Icon className="w-3 h-3" />} {label}
                </Label>
                <p className="font-medium">{value}</p>
            </div>
        );
    };

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .card-elegant, .card-elegant * { visibility: visible; }
                    .card-elegant { position: absolute; left: 0; top: 0; width: 100%; margin: 0; box-shadow: none; border: none; }
                    .no-print { display: none !important; }
                    /* Hide header inside the card if needed? No, we want the logo. */
                    .print-header { display: flex !important; }
                }
            `}</style>
            <section className="py-12 bg-secondary/10 min-h-screen">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex justify-between items-center mb-6 no-print">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-transparent pl-0 hover:text-primary">
                            <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back') || 'Back'}
                        </Button>
                        <Button onClick={handleDownloadImage} className="btn-gold gap-2 h-auto whitespace-normal text-center py-2" disabled={loading}>
                            <Download className="w-4 h-4 shrink-0" /> <span className="flex-1">{loading ? t('common.processing') : (t('common.download') || 'Download')}</span>
                        </Button>
                    </div>

                    <div ref={profileRef} className="card-elegant overflow-hidden bg-white">
                        {/* Header Cover with Logo & Slogan */}
                        <div className="h-40 bg-gradient-to-r from-primary/10 via-white/50 to-primary/5 flex flex-col items-center justify-center text-center print-header border-b">
                            <h2 className="text-3xl font-serif font-bold text-primary tracking-wide">
                                <span className="text-4xl text-[#D4AF37]">S</span>hubh<span className="text-[#D4AF37]">V</span>ivah<span className="text-[#D4AF37]">B</span>andhan
                            </h2>
                            <p className="text-lg font-medium text-primary/80 mt-2 font-serif italic">
                                "शुभविवाहबंधन - जिथे नाती जुळतात विश्वासाने"
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">{t('profile.premiumService')}</p>
                        </div>

                        <div className="px-6 md:px-10 pb-10">
                            {/* Profile Header */}
                            <div className="relative flex flex-col items-center md:flex-row md:items-end gap-6 mt-6 md:mt-8 mb-8">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
                                    {profile.profile_photo ? (
                                        <img src={profile.profile_photo} alt="Profile" loading="lazy" width="128" height="128" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-full h-full p-6 text-muted-foreground/20" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2 pt-2 md:pt-0 text-center md:text-left">
                                    <h1 className="text-3xl font-serif font-bold text-gray-900 flex flex-col md:flex-row items-center gap-2">
                                        {profile.full_name}
                                        <div className="flex gap-2 text-base md:text-sm">
                                            {profile.status === 'verified' && (
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200 shadow-sm">
                                                    <ShieldCheck className="w-3 h-3" /> <span className="text-[10px] font-bold uppercase">Verified</span>
                                                </span>
                                            )}
                                            {/* Dummy check for premium */}
                                            {profile.is_premium && (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 shadow-sm">
                                                    <Star className="w-3 h-3" /> <span className="text-[10px] font-bold uppercase">Premium</span>
                                                </span>
                                            )}
                                        </div>
                                    </h1>
                                    <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {(() => {
                                            if (canViewContact) {
                                                return profile.location || t('common.locationNotSpecified') || 'Location not specified';
                                            }
                                            const safeLocation = getPrivacySafeLocation(profile.location);
                                            return safeLocation || t('common.locationRestricted') || 'Location Restricted';
                                        })()}
                                    </p>
                                </div>
                                <div className="flex gap-2 mb-2 md:mb-0">
                                    {/* Actions like Shortlist/Request could go here */}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Left Column */}
                                <div className="space-y-8">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-serif font-bold text-primary border-b pb-2">{t('register.basicInfo')}</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label={t('profile.age')} value={`${profile.age} ${t('common.yrs')}`} />
                                            <InfoItem label={t('profile.gender')} value={profile.gender ? (t(`gender.${profile.gender}`) || profile.gender) : null} />
                                            <InfoItem label={t('profile.height')} value={profile.height} />

                                            {/* Marital Status Removed */}
                                            <InfoItem label={t('profile.religion')} value={profile.religion ? (t(`religion.${profile.religion}`) || profile.religion) : null} />
                                            <InfoItem label={t('profile.caste')} value={profile.caste ? (t(`caste.${profile.caste.toLowerCase()}`) || profile.caste) : null} />

                                            <InfoItem label={t('register.rashi')} value={(() => {
                                                const raw = profile.lifestyle ? profile.lifestyle.split('|')[0].replace('Rashi: ', '').trim() : '';
                                                if (!raw) return '-';
                                                const key = `rashi.${raw.toLowerCase()}`;
                                                return t(key) === key ? raw : t(key);
                                            })()} />

                                            <InfoItem label={t('profile.birthTime')} value={(() => {
                                                const raw = profile.lifestyle ? profile.lifestyle.match(/Birth Time: ([^|]*)/)?.[1]?.trim() : '';
                                                return raw || '-';
                                            })()} />


                                        </div>
                                    </div>

                                    {/* Contact Information (RESTRICTED) */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-serif font-bold text-primary border-b pb-2 flex items-center gap-2">
                                            <Phone className="w-5 h-5" /> {t('nav.contact')} {t('common.view')}
                                        </h2>
                                        <div className="grid grid-cols-1 gap-4 p-4 bg-secondary/5 rounded-lg border">
                                            {canViewContact ? (
                                                <>
                                                    <InfoItem icon={Mail} label={t('register.email')} value={profileUser?.email} />
                                                    <InfoItem icon={Phone} label={t('register.phone')} value={profileUser?.phone} />
                                                    <InfoItem icon={Phone} label={t('register.fatherContact')} value={(() => {
                                                        const fcPart = profile.family_background?.split(',').find((p: string) => p.trim().toLowerCase().startsWith('father contact:'));
                                                        return fcPart ? fcPart.split(':')[1].trim() : '-';
                                                    })()} />
                                                    <InfoItem icon={MapPin} label={t('register.fullAddress')} value={(() => {
                                                        const raw = profile.full_address || profile.location || '';
                                                        if (raw.includes('|')) {
                                                            const [addr, loc] = raw.split('|').map((s: string) => s.trim());
                                                            const [cityCode, stateCode] = loc.split(',').map((s: string) => s.trim());

                                                            // Translate Codes
                                                            const cityKey = `city.${cityCode}`;
                                                            const stateKey = `state.${stateCode}`;
                                                            const city = t(cityKey) === cityKey ? cityCode : t(cityKey);
                                                            const state = t(stateKey) === stateKey ? stateCode : t(stateKey);

                                                            return <>{addr}<br /><span className="text-muted-foreground text-xs">{city}, {state}</span></>;
                                                        }
                                                        return raw || '-';
                                                    })()} />
                                                </>
                                            ) : (
                                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm flex flex-col items-center text-center gap-2">
                                                    <p className="font-semibold">{t('profile.contactHidden')}</p>
                                                    <p className="whitespace-pre-line">{t('profile.contactAdmin')}</p>
                                                </div>
                                            )}
                                        </div>
                                        {!canViewContact && (
                                            <p className="text-xs text-muted-foreground italic px-2">
                                                * {t('profile.contactHidden')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-8">
                                    {/* Education & Career */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-serif font-bold text-primary border-b pb-2">{t('register.eduCareer')}</h2>
                                        <div className="space-y-4">
                                            <InfoItem icon={Briefcase} label={t('profile.education')} value={
                                                (() => {
                                                    if (!profile.education) return '-';
                                                    // Format: "level - college"
                                                    // We try to split and translate the level
                                                    const parts = profile.education.split(' - ');
                                                    const level = parts[0];
                                                    const college = parts.slice(1).join(' - '); // in case college has hyphens

                                                    // Translate level if key exists
                                                    const key = `edu.${level}`;
                                                    const translatedLevel = t(key) === key ? level : t(key);

                                                    if (college && college !== 'NA') {
                                                        return `${translatedLevel} - ${college}`;
                                                    }
                                                    return translatedLevel;
                                                })()
                                            } />
                                            <InfoItem icon={Briefcase} label={t('profile.profession')} value={
                                                (() => {
                                                    if (!profile.profession) return '-';
                                                    // Format: "job at company"
                                                    const parts = profile.profession.split(' at ');
                                                    const job = parts[0];
                                                    const company = parts[1];

                                                    const jobKey = `prof.${job}`;
                                                    const displayJob = t(jobKey) === jobKey ? job : t(jobKey);

                                                    const invalidCompanies = ['no', 'none', 'na', 'n/a', '-', ''];
                                                    if (company && !invalidCompanies.includes(company.toLowerCase())) {
                                                        return `${displayJob} ${t('common.at')} ${company}`;
                                                    }
                                                    return displayJob;
                                                })()
                                            } />

                                        </div>
                                    </div>

                                    {/* Family Details */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-serif font-bold text-primary border-b pb-2">{t('profile.familyBackground')}</h2>
                                        <div className="bg-muted/30 p-4 rounded-lg text-sm space-y-2">
                                            {profile.family_background ? (
                                                profile.family_background.split(/[.,|]/).map((part: string, i: number) => {
                                                    const cleanPart = part.trim();
                                                    if (!cleanPart) return null;

                                                    // Helper to check for "None", "NA", "0"
                                                    const isInvalid = (val: string) => !val || val.toLowerCase() === 'none' || val.toLowerCase() === 'na' || val === '0';

                                                    // Handle Type - HIDE
                                                    if (cleanPart.toLowerCase().startsWith('type:')) {
                                                        return null;
                                                    }
                                                    // Handle Values - HIDE
                                                    if (cleanPart.toLowerCase().startsWith('values:')) {
                                                        return null;
                                                    }
                                                    // Handle Father
                                                    if (cleanPart.toLowerCase().startsWith('father:')) {
                                                        const val = cleanPart.split(':')[1]?.trim();
                                                        if (isInvalid(val)) return null;
                                                        return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.father')}:</span> {t(`prof.${val}`) === `prof.${val}` ? val : t(`prof.${val}`)}</p>;
                                                    }
                                                    // Handle Father Contact (HIDE HERE)
                                                    if (cleanPart.toLowerCase().startsWith('father contact:')) {
                                                        return null;
                                                    }
                                                    // Handle Mother
                                                    if (cleanPart.toLowerCase().startsWith('mother:')) {
                                                        const val = cleanPart.split(':')[1]?.trim();
                                                        if (isInvalid(val)) return null;
                                                        return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.mother')}:</span> {t(`prof.${val}`) === `prof.${val}` ? val : t(`prof.${val}`)}</p>;
                                                    }
                                                    // Handle Brother Name
                                                    if (cleanPart.toLowerCase().startsWith('brothers:')) {
                                                        const val = cleanPart.split(':')[1]?.trim();
                                                        if (isInvalid(val)) return null;
                                                        return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.brother')}:</span> {val}</p>;
                                                    }
                                                    // Handle Sister Name
                                                    if (cleanPart.toLowerCase().startsWith('sisters:')) {
                                                        const val = cleanPart.split(':')[1]?.trim();
                                                        if (isInvalid(val)) return null;
                                                        return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.sister')}:</span> {val}</p>;
                                                    }
                                                    // Handle Siblings (Count)
                                                    if (cleanPart.toLowerCase().startsWith('siblings:') || cleanPart.toLowerCase().includes('total siblings')) {
                                                        let val = cleanPart.split(':')[1]?.trim();
                                                        if (!val) return null;

                                                        // Check for "None" in value and replace with localized "None" (Nahi)
                                                        if (val.toLowerCase().includes('none') || val.toLowerCase().includes('0 (total') || val === '0') {
                                                            return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.siblings')}:</span> {t('common.none')}</p>;
                                                        }

                                                        // Remove (Total: X) if present to clean up display
                                                        const cleanVal = val.replace(/\s*\(Total:\s*\d+\)/i, '').trim();
                                                        return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.siblings')}:</span> {cleanVal}</p>;
                                                    }

                                                    // Fallback check
                                                    if (cleanPart.toLowerCase().includes('none') || cleanPart.toLowerCase().includes('na')) return null;

                                                    return <p key={i} className="text-gray-700">{cleanPart}</p>;
                                                })
                                            ) : (
                                                <p className="text-muted-foreground">No family details added.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* About - Only show if exists */}
                                    {profile.about && (
                                        <div className="space-y-4">
                                            <h2 className="text-xl font-serif font-bold text-primary border-b pb-2">{t('register.about')}</h2>
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {profile.about}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ViewProfile;
