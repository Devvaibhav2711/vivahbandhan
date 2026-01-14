import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Mail, User, Briefcase, MapPin, Users, Info, ArrowLeft, Phone, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const ViewProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useLanguage();
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [profileUser, setProfileUser] = useState<any>(null); // Owner of profile
    const profileRef = useRef<HTMLDivElement>(null);

    const handleDownloadImage = async () => {
        if (!profileRef.current) return;

        try {
            setLoading(true);
            const canvas = await html2canvas(profileRef.current, {
                useCORS: true, // Important for external images like Cloudinary
                scale: 2, // Better quality
                backgroundColor: '#ffffff',
                logging: false,
                scrollY: -window.scrollY, // Hande scroll offset
                windowHeight: document.documentElement.scrollHeight, // Capture full height
            });

            const image = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement('a');
            link.href = image;
            link.download = `VivahBandhan-Profile-${profile.full_name || 'Match'}.jpg`;
            link.click();
        } catch (error) {
            console.error("Error generating image:", error);
            toast({ title: 'Error', description: 'Failed to generate image for download.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) return;
            try {
                // 1. Fetch Profile
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setProfile(profileData);

                // 2. Fetch User Email/Phone (Only if Admin or specific logic allows, but we fetch to check)
                // We always fetch, but we HIDE in render if needed.
                // RLS might block this fetch if not Admin/Owner.
                // If RLS blocks, we just get null, which is fine (safe fail).
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('email, phone')
                    .eq('id', profileData.user_id)
                    .single();

                setProfileUser(userData);

            } catch (error: any) {
                console.error('Error loading profile:', error);

                // Fallback: Try fetching via Public RPC if direct access failed (e.g. for "Public Profiles")
                try {
                    const { data: rpcData, error: rpcError } = await supabase.rpc('get_public_profile_by_id', { profile_id: id });
                    if (!rpcError && rpcData && rpcData.length > 0) {
                        setProfile(rpcData[0]);
                        return; // Successfully recovered
                    }
                } catch (rpcErr) {
                    console.error("RPC fallback failed:", rpcErr);

                    // LAST RESORT: Try fetching ALL public profiles and finding the one we need.
                    // This is inefficient but works if the user hasn't updated the SQL for 'get_public_profile_by_id'
                    try {
                        const { data: allProfiles, error: listError } = await supabase.rpc('get_public_profiles');
                        if (!listError && allProfiles) {
                            const found = allProfiles.find((p: any) => p.id === id);
                            if (found) {
                                setProfile(found);
                                return;
                            }
                        }
                    } catch (listErr) {
                        console.error("List RPC fallback failed:", listErr);
                    }
                }

                toast({
                    title: t('common.error'),
                    description: `${t('error.loadProfile')}: ${error.message || error.details || 'Unknown error'}`,
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, user, navigate, toast]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Loading profile...</p>
                </div>
            </Layout>
        );
    }
    // Public access allowed. Contact info is hidden by 'canViewContact' logic.
    // if (!user) { ... } removed.

    if (!profile) return <Layout><div className="text-center py-20">Profile not found</div></Layout>;

    const isOwner = user?.id === profile.user_id;
    const canViewContact = isAdmin || isOwner;

    // Strict Contact Privacy:
    // If not authorized, hide value completely or show "Restricted"
    // Also, if restricted, we might want to hide the entire row or show a placeholder.
    const InfoItem = ({ icon: Icon, label, value, restricted = false }: any) => {
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
        return (
            <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    {Icon && <Icon className="w-3 h-3" />} {label}
                </Label>
                <p className="font-medium">{value || '-'}</p>
            </div>
        );
    };

    return (
        <Layout>
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
                                <span className="text-4xl text-[#D4AF37]">V</span>ivah<span className="text-[#D4AF37]">B</span>andhan
                            </h2>
                            <p className="text-lg font-medium text-primary/80 mt-2 font-serif italic">
                                "विवाह बंधन - जिथे नाती जुळतात विश्वासाने"
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
                                    <h1 className="text-3xl font-serif font-bold text-gray-900">{profile.full_name}</h1>
                                    <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {canViewContact
                                            ? (profile.location || t('common.locationNotSpecified') || 'Location not specified')
                                            : t('common.locationRestricted') || 'Location Restricted'}
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
                                            <InfoItem label={t('profile.gender')} value={t(`gender.${profile.gender}`) || profile.gender} />
                                            <InfoItem label={t('profile.height')} value={profile.height} />
                                            <InfoItem label={t('profile.maritalStatus')} value={t(`marital.${profile.marital_status}`) || profile.marital_status} />
                                            <InfoItem label={t('profile.religion')} value={t(`religion.${profile.religion}`) || profile.religion} />
                                            <InfoItem label={t('profile.caste')} value={profile.caste} />

                                            <InfoItem label={t('register.rashi')} value={(() => {
                                                const raw = profile.lifestyle ? profile.lifestyle.replace('Rashi: ', '').trim() : '';
                                                if (!raw) return '-';
                                                const key = `rashi.${raw.toLowerCase()}`;
                                                return t(key) === key ? raw : t(key);
                                            })()} />

                                            <InfoItem label={t('register.familyType')} value={t(`family.${profile.family_type}`) || profile.family_type} />
                                            <InfoItem label={t('profile.income')} value={(() => {
                                                if (!profile.income) return '-';
                                                // Try to match key by removing "LPA" and spaces
                                                // e.g., "5 - 10 LPA" -> "5-10"
                                                const raw = profile.income.replace(/LPA/i, '').replace(/\s/g, '');
                                                const key = `income.${raw}`;
                                                return t(key) === key ? profile.income : t(key);
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
                                                    <InfoItem icon={Mail} label="Email" value={profileUser?.email} />
                                                    <InfoItem icon={Phone} label="Phone" value={profileUser?.phone} />
                                                    <InfoItem icon={Phone} label={t('register.fatherContact')} value={(() => {
                                                        const fcPart = profile.family_background?.split(',').find((p: string) => p.trim().toLowerCase().startsWith('father contact:'));
                                                        return fcPart ? fcPart.split(':')[1].trim() : '-';
                                                    })()} />
                                                    <InfoItem icon={MapPin} label={t('register.fullAddress')} value={profile.full_address} />
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

                                                    if (company && company !== 'NA') {
                                                        return `${displayJob} ${t('common.at')} ${company}`;
                                                    }
                                                    return displayJob;
                                                })()
                                            } />
                                            <InfoItem label={t('profile.income')} value={t(`income.${profile.income}`) || profile.income} />
                                        </div>
                                    </div>

                                    {/* Family Details */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-serif font-bold text-primary border-b pb-2">{t('profile.familyBackground')}</h2>
                                        <div className="bg-muted/30 p-4 rounded-lg text-sm space-y-2">
                                            {profile.family_background ? (
                                                profile.family_background.split(/[.,]/).map((part: string, i: number) => {
                                                    const cleanPart = part.trim();
                                                    if (!cleanPart) return null;

                                                    // Handle Type
                                                    if (cleanPart.toLowerCase().startsWith('type:')) {
                                                        const typeVal = cleanPart.split(':')[1]?.trim().toLowerCase();
                                                        return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.type_label')}:</span> {t(`family.${typeVal}`) || typeVal}</p>;
                                                    }
                                                    // Handle Father
                                                    if (cleanPart.toLowerCase().startsWith('father:')) {
                                                        const val = cleanPart.split(':')[1]?.trim();
                                                        // Attempt to translate occupation if simple, else show value
                                                        // For better results we'd parse occupation separately, but here we just label "Father"
                                                        return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.father')}:</span> {t(`prof.${val}`) === `prof.${val}` ? val : t(`prof.${val}`)}</p>;
                                                    }
                                                    // Handle Father Contact (HIDE HERE)
                                                    if (cleanPart.toLowerCase().startsWith('father contact:')) {
                                                        return null;
                                                    }
                                                    // Handle Mother
                                                    if (cleanPart.toLowerCase().startsWith('mother:')) {
                                                        const val = cleanPart.split(':')[1]?.trim();
                                                        return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.mother')}:</span> {t(`prof.${val}`) === `prof.${val}` ? val : t(`prof.${val}`)}</p>;
                                                    }
                                                    // Handle Siblings
                                                    if (cleanPart.toLowerCase().startsWith('siblings:')) {
                                                        const val = cleanPart.split(':')[1]?.trim();
                                                        return <p key={i} className="text-gray-700"><span className="font-semibold">{t('family.siblings')}:</span> {val}</p>;
                                                    }

                                                    // Fallback
                                                    return <p key={i} className="text-gray-700">{cleanPart}</p>;
                                                })
                                            ) : (
                                                <p className="text-muted-foreground">No family details added.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* About */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-serif font-bold text-primary border-b pb-2">{t('register.about')}</h2>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {profile.about || 'No bio available.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ViewProfile;
