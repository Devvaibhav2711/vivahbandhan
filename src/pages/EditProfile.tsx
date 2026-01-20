import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, User, Briefcase, MapPin, Users, Info, Upload, Trash2, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
// Layout removed
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/utils/imageCompression';
import ImageCropper from '@/components/ImageCropper';

const EditProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useLanguage();
    const { user, isAdmin } = useAuth(); // Logged in user (Admin)
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Cropper State
    const [showCropper, setShowCropper] = useState(false);
    const [cropperImgSrc, setCropperImgSrc] = useState<string | null>(null);

    // Full form data state (Initial state matched AdminUserForm for consistency)
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        gender: '',
        firstName: '',
        middleName: '',
        lastName: '',
        dob: '',
        height: '',

        religion: '',
        caste: '',
        rashi: '',
        birthTime: '',
        birthPlace: '',
        educationLevel: '',
        college: '',
        profession: '',
        company: '',
        country: 'India', // Default to India as per Register context usually, though Register doesn't show Country input
        state: '',
        city: '',
        fullAddress: '',
        fatherName: '',
        fatherContact: '',
        motherName: '',
        fatherOccupation: '',
        motherOccupation: '',

        siblings: '0',
        siblingNames: [] as string[],
        about: ''
    });

    // Helper to calculate age
    const calculateAge = (dob: string) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
    };

    // Helper to parse Name
    const parseName = (fullName: string) => {
        const parts = fullName.split(' ');
        if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
        if (parts.length === 2) return { first: parts[0], middle: '', last: parts[1] };
        return { first: parts[0], middle: parts.slice(1, -1).join(' '), last: parts[parts.length - 1] };
    };

    // Helper to parse Family Background
    const parseFamily = (str: string) => {
        if (!str) return {};

        // 1. Father (Format: "Father: Name (Occupation)" OR Old: "Father: Occupation")
        let fatherName = '';
        let fatherOccupation = '';
        const fatherFullMatch = str.match(/Father: (.*?) \((.*?)\)/);
        if (fatherFullMatch) {
            fatherName = fatherFullMatch[1];
            fatherOccupation = fatherFullMatch[2];
        } else {
            // Fallback (careful not to match "Father Contact")
            // Regex lookahead or just assume comma separated?
            // Old format doesn't have parens usually.
            // "Father: Teacher, Mother: ..."
            const oldFather = str.match(/Father: ([^,]*)/)?.[1]?.trim();
            if (oldFather && !oldFather.includes('Contact')) {
                fatherOccupation = oldFather;
            }
        }

        const fatherContact = str.match(/Father Contact: ([^,]*)/)?.[1]?.trim() || '';

        // 2. Mother
        let motherName = '';
        let motherOccupation = '';
        const motherFullMatch = str.match(/Mother: (.*?) \((.*?)\)/);
        if (motherFullMatch) {
            motherName = motherFullMatch[1];
            motherOccupation = motherFullMatch[2];
        } else {
            const oldMother = str.match(/Mother: ([^,]*)/)?.[1]?.trim();
            if (oldMother) motherOccupation = oldMother;
        }

        // Extract Sibling Info
        let siblingsCount = '0';
        let siblingNames: string[] = [];

        // Check for new format "Siblings: A, B (Total: 2)"
        const newFormatMatch = str.match(/Siblings: (.*?) \(Total: (\d+)\)/);
        if (newFormatMatch) {
            siblingsCount = newFormatMatch[2];
            const namesStr = newFormatMatch[1];
            if (namesStr && namesStr !== 'None') {
                siblingNames = namesStr.split(',').map(s => s.trim());
            }
        } else {
            // Fallback parsing
            const simpleMatch = str.match(/Siblings: (\d+)/);
            if (simpleMatch) {
                siblingsCount = simpleMatch[1];
            }
            const oldRegisterMatch = str.match(/Total Siblings: (\d+)/);
            if (oldRegisterMatch) {
                siblingsCount = oldRegisterMatch[1];
            }
        }

        // Ensure array size matches count
        const countInt = parseInt(siblingsCount) || 0;
        if (siblingNames.length < countInt) {
            const diff = countInt - siblingNames.length;
            siblingNames = [...siblingNames, ...Array(diff).fill('')];
        }

        return { fatherName, fatherOccupation, fatherContact, motherName, motherOccupation, siblings: siblingsCount, siblingNames };
    };

    // Helper to parse Education
    const parseEducation = (str: string) => {
        if (!str) return {};
        const parts = str.split(' - ');
        return { level: parts[0] || '', college: parts[1] || '' };
    };

    // Helper to parse Profession
    const parseProfession = (str: string) => {
        if (!str) return {};
        const parts = str.split(' at ');
        return { prof: parts[0] || '', comp: parts[1] || '' };
    };

    // Helper to parse Location
    const parseLocation = (str: string) => {
        if (!str) return { fullAddress: '', city: '', state: '', country: '' };

        // Format: "Full Address | City, State"
        if (str.includes('|')) {
            const [addr, rest] = str.split('|').map(s => s.trim());
            const parts = rest ? rest.split(',').map(s => s.trim()) : [];
            return {
                fullAddress: addr || '',
                city: parts[0] || '',
                state: parts[1] || '',
                country: ''
            };
        }

        // Old Format: "City, State, Country"
        const parts = str.split(', ').map(s => s.trim());
        return { fullAddress: '', city: parts[0] || '', state: parts[1] || '', country: parts[2] || '' };
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) return;
            try {
                // 1. Fetch Profile
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // 2. Fetch User Email/Phone using user_id from profile
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('email, phone')
                    .eq('id', profile.user_id)
                    .single();

                if (userError) console.warn("Could not fetch user email/phone", userError);

                // 3. Parse and Set Data
                const { first, middle, last } = parseName(profile.full_name || '');
                const family = parseFamily(profile.family_background || '');
                const edu = parseEducation(profile.education || '');
                const job = parseProfession(profile.profession || '');
                const loc = parseLocation(profile.location || '');

                // Parse Lifestyle for Rashi and Birth Time
                const ls = profile.lifestyle || '';
                const rashiVal = ls.match(/Rashi: ([^|]*)/)?.[1]?.trim() || '';
                const btVal = ls.match(/Birth Time: ([^|]*)/)?.[1]?.trim() || '';
                const bpVal = ls.match(/Birth Place: ([^|]*)/)?.[1]?.trim() || '';

                // Determine DOB from Age? No, we can't reverse Age to DOB. 
                // We leave DOB blank if not stored, OR strictly we should store DOB in profiles.
                // Assuming profiles table DOES NOT have dob column based on Register.tsx only using it to calc age.
                // Wait, Register.tsx inserts DOB? 
                // Register.tsx: "age: calculatedAge". It does NOT insert DOB into profiles table.
                // This means DOB is LOST after registration.
                // We can't pre-fill DOB. We can only show Age.
                // BUT the form requires DOB.
                // I will leave DOB blank and ask user to re-enter if updating age.

                setFormData({
                    email: userData?.email || '',
                    phone: userData?.phone || '',
                    gender: profile.gender || '',
                    firstName: first,
                    middleName: middle,
                    lastName: last,
                    dob: '', // Cannot retrieve
                    height: profile.height || '',

                    religion: profile.religion || '',
                    caste: profile.caste || '',
                    rashi: rashiVal,
                    birthTime: btVal,
                    educationLevel: edu.level || '',
                    college: edu.college || '',
                    profession: job.prof || '',
                    company: job.comp || '',
                    country: loc.country || 'India',
                    birthPlace: bpVal,
                    state: loc.state || '',
                    city: loc.city || '',
                    fullAddress: loc.fullAddress || '',
                    fatherName: family.fatherName || '',
                    fatherContact: family.fatherContact || '',
                    motherName: family.motherName || '',
                    fatherOccupation: family.fatherOccupation || '',
                    motherOccupation: family.motherOccupation || '',

                    siblings: family.siblings || '0',
                    siblingNames: family.siblingNames || [],
                    about: profile.about || ''
                });

                if (profile.profile_photo) {
                    setPhotoPreview(profile.profile_photo);
                }

            } catch (error: any) {
                console.error('Error loading profile:', error);
                toast({ title: t('common.error'), description: t('toast.profileLoadError'), variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [id]);


    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropperImgSrc(reader.result as string);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        try {
            setShowCropper(false);
            const croppedFile = new File([croppedBlob], "profile_photo.jpg", { type: "image/jpeg" });
            setPhotoPreview(URL.createObjectURL(croppedBlob));

            // Compress
            const compressedFile = await compressImage(croppedFile);
            setPhotoFile(compressedFile);
        } catch (error: any) {
            console.error("Processing failed", error);
            toast({ title: t('common.error'), description: "Failed to process image", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) return;
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
            toast({ title: t('common.deleted'), description: t('toast.profileDeleted') });
            navigate('/dashboard'); // or /admin
        } catch (error: any) {
            console.error('Error deleting:', error);
            toast({ title: t('common.error'), description: t('toast.profileDeleteError'), variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Validate required fields
            if (!formData.firstName || !formData.lastName || !formData.middleName || !formData.height || !formData.caste) {
                toast({ title: t('common.error'), description: t('common.required'), variant: 'destructive' });
                setSaving(false);
                return;
            }

            // 1. Upload Photo if changed
            let photoUrl = photoPreview;
            if (photoFile) {
                // Get user_id again? use existing profile photo path?
                // We'll generate a new one to be safe
                // Need user_id from somewhere. We fetch it first? 
                // Wait, we need the stored PROFILE's user_id, not current admin execution user.
                // We can't access `profile.user_id` inside submit easily without state.
                // But we can query it or assume it's stable.
                // Let's just use a timestamp based name.
                const fileName = `updated-${Date.now()}.${photoFile.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage
                    .from('profile-photos')
                    .upload(fileName, photoFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
                photoUrl = data.publicUrl;
            }

            // 2. Update Profile
            const profileData = {
                full_name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim(),
                gender: formData.gender,
                height: formData.height,
                education: `${formData.educationLevel} - ${formData.college}`,
                profession: `${formData.profession} at ${formData.company}`,
                income: '',
                religion: formData.religion,
                caste: formData.caste,
                location: `${formData.fullAddress} | ${formData.city}, ${formData.state}`,
                family_background: `Father: ${formData.fatherName} (${formData.fatherOccupation}), Father Contact: ${formData.fatherContact}, Mother: ${formData.motherName} (${formData.motherOccupation}), Siblings: ${formData.siblingNames?.filter(n => n).join(', ') || 'None'} (Total: ${formData.siblings})`,
                about: formData.about,
                lifestyle: `Rashi: ${formData.rashi} | Birth Time: ${formData.birthTime} | Birth Place: ${formData.birthPlace}`,
                profile_photo: photoUrl
            };

            // Only update Age if DOB is provided
            if (formData.dob) {
                Object.assign(profileData, { age: calculateAge(formData.dob) });
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', id);

            if (updateError) throw updateError;

            // 3. Update User Phone (Email is complex)
            // We need to know the user_id for the profile to update the user table.
            // We can fetch it again or store in a ref/state.
            // We'll skip this optimization and just fetch-update.
            const { data: p } = await supabase.from('profiles').select('user_id').eq('id', id).single();
            if (p && p.user_id) {
                await supabase.from('users').update({ phone: formData.phone }).eq('id', p.user_id);
            }

            toast({ title: t('common.success'), description: t('toast.profileUpdated') });

            if (isAdmin) {
                setTimeout(() => navigate('/admin'), 1000);
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center py-20">Loading...</div>;

    return (
        <>
            <section className="py-12 md:py-16 bg-gradient-to-b from-background to-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative mb-8 text-center">
                            <h1 className="font-serif text-3xl font-bold text-primary">Edit Profile</h1>
                            {isAdmin && (
                                <div className="absolute right-0 top-0 hidden md:block">
                                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="card-elegant p-6 md:p-10 bg-white/80 backdrop-blur-sm">
                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* Account Information */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <Mail className="w-5 h-5" /> {t('register.accountInfo')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>{t('register.email')}</Label>
                                            <Input value={formData.email} disabled className="bg-gray-100 cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.phone')}</Label>
                                            <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <User className="w-5 h-5" /> {t('register.basicInfo')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>{t('register.gender')}</Label>
                                            <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                                                <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">{t('gender.male')}</SelectItem>
                                                    <SelectItem value="female">{t('gender.female')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.firstName')}</Label>
                                            <Input value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.middleName')} *</Label>
                                            <Input value={formData.middleName} onChange={(e) => handleChange('middleName', e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.lastName')}</Label>
                                            <Input value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.dob')}</Label>
                                            <Input type="date" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.height')} *</Label>
                                            <Select value={formData.height} onValueChange={(v) => handleChange('height', v)}>
                                                <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="4'0&quot;">4'0"</SelectItem>
                                                    <SelectItem value="4'1&quot;">4'1"</SelectItem>
                                                    <SelectItem value="4'2&quot;">4'2"</SelectItem>
                                                    <SelectItem value="4'3&quot;">4'3"</SelectItem>
                                                    <SelectItem value="4'4&quot;">4'4"</SelectItem>
                                                    <SelectItem value="4'5&quot;">4'5"</SelectItem>
                                                    <SelectItem value="4'6&quot;">4'6"</SelectItem>
                                                    <SelectItem value="4'7&quot;">4'7"</SelectItem>
                                                    <SelectItem value="4'8&quot;">4'8"</SelectItem>
                                                    <SelectItem value="4'9&quot;">4'9"</SelectItem>
                                                    <SelectItem value="4'10&quot;">4'10"</SelectItem>
                                                    <SelectItem value="4'11&quot;">4'11"</SelectItem>
                                                    <SelectItem value="5'0&quot;">5'0"</SelectItem>
                                                    <SelectItem value="5'1&quot;">5'1"</SelectItem>
                                                    <SelectItem value="5'2&quot;">5'2"</SelectItem>
                                                    <SelectItem value="5'3&quot;">5'3"</SelectItem>
                                                    <SelectItem value="5'4&quot;">5'4"</SelectItem>
                                                    <SelectItem value="5'5&quot;">5'5"</SelectItem>
                                                    <SelectItem value="5'6&quot;">5'6"</SelectItem>
                                                    <SelectItem value="5'7&quot;">5'7"</SelectItem>
                                                    <SelectItem value="5'8&quot;">5'8"</SelectItem>
                                                    <SelectItem value="5'9&quot;">5'9"</SelectItem>
                                                    <SelectItem value="5'10&quot;">5'10"</SelectItem>
                                                    <SelectItem value="5'11&quot;">5'11"</SelectItem>
                                                    <SelectItem value="6'0&quot;">6'0"</SelectItem>
                                                    <SelectItem value="6'1&quot;">6'1"</SelectItem>
                                                    <SelectItem value="6'2&quot;">6'2"</SelectItem>
                                                    <SelectItem value="6'3&quot;">6'3"</SelectItem>
                                                    <SelectItem value="6'4&quot;">6'4"</SelectItem>
                                                    <SelectItem value="6'5&quot;">6'5"</SelectItem>
                                                    <SelectItem value="6'6&quot;">6'6"</SelectItem>
                                                    <SelectItem value="6'7&quot;">6'7"</SelectItem>
                                                    <SelectItem value="6'8&quot;">6'8"</SelectItem>
                                                    <SelectItem value="6'9&quot;">6'9"</SelectItem>
                                                    <SelectItem value="6'10&quot;">6'10"</SelectItem>
                                                    <SelectItem value="6'11&quot;">6'11"</SelectItem>
                                                    <SelectItem value="7'0&quot;">7'0"</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.birthTime')}</Label>
                                            <Input type="time" value={formData.birthTime} onChange={(e) => handleChange('birthTime', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('profile.birthPlace')}</Label>
                                            <Input value={formData.birthPlace} onChange={(e) => handleChange('birthPlace', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.caste')} *</Label>
                                            <Select value={formData.caste} onValueChange={(v) => handleChange('caste', v)}>
                                                <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="kumbhar">{t('caste.kumbhar')}</SelectItem>
                                                    <SelectItem value="other">{t('caste.other')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.rashi')}</Label>
                                            <Select value={formData.rashi} onValueChange={(v) => handleChange('rashi', v)}>
                                                <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mesh">{t('rashi.mesh')}</SelectItem>
                                                    <SelectItem value="vrishabh">{t('rashi.vrishabh')}</SelectItem>
                                                    <SelectItem value="mithun">{t('rashi.mithun')}</SelectItem>
                                                    <SelectItem value="kark">{t('rashi.kark')}</SelectItem>
                                                    <SelectItem value="simha">{t('rashi.simha')}</SelectItem>
                                                    <SelectItem value="kanya">{t('rashi.kanya')}</SelectItem>
                                                    <SelectItem value="tula">{t('rashi.tula')}</SelectItem>
                                                    <SelectItem value="vrishchik">{t('rashi.vrishchik')}</SelectItem>
                                                    <SelectItem value="dhanu">{t('rashi.dhanu')}</SelectItem>
                                                    <SelectItem value="makar">{t('rashi.makar')}</SelectItem>
                                                    <SelectItem value="kumbh">{t('rashi.kumbh')}</SelectItem>
                                                    <SelectItem value="meen">{t('rashi.meen')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                    </div>
                                </div>

                                {/* Education & Career */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <Briefcase className="w-5 h-5" /> {t('register.eduCareer')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>{t('register.eduLevel')}</Label>
                                            <Select value={formData.educationLevel} onValueChange={(v) => handleChange('educationLevel', v)}>
                                                <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="highschool">{t('edu.highschool')}</SelectItem>
                                                    <SelectItem value="bachelors">{t('edu.bachelors')}</SelectItem>
                                                    <SelectItem value="masters">{t('edu.masters')}</SelectItem>
                                                    <SelectItem value="doctorate">{t('edu.doctorate')}</SelectItem>
                                                    <SelectItem value="other">{t('edu.other')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.college')}</Label>
                                            <Input value={formData.college} onChange={(e) => handleChange('college', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>{t('register.profession')}</Label>
                                            <Select value={formData.profession} onValueChange={(v) => handleChange('profession', v)}>
                                                <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="private">{t('prof.private')}</SelectItem>
                                                    <SelectItem value="government">{t('prof.government')}</SelectItem>
                                                    <SelectItem value="business">{t('prof.business')}</SelectItem>
                                                    <SelectItem value="defence">{t('prof.defence')}</SelectItem>
                                                    <SelectItem value="farming">{t('prof.farming')}</SelectItem>
                                                    <SelectItem value="other">{t('prof.other')}</SelectItem>
                                                    <SelectItem value="not_working">{t('prof.notWorking')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.company')}</Label>
                                            <Input value={formData.company} onChange={(e) => handleChange('company', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Location (Separate Section) */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <MapPin className="w-5 h-5" /> {t('register.location')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>{t('register.state')}</Label>
                                            <Select value={formData.state} onValueChange={(v) => handleChange('state', v)}>
                                                <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mh">{t('state.mh')}</SelectItem>
                                                    <SelectItem value="ka">{t('state.ka')}</SelectItem>
                                                    <SelectItem value="ga">{t('state.ga')}</SelectItem>
                                                    <SelectItem value="gj">{t('state.gj')}</SelectItem>
                                                    <SelectItem value="mp">{t('state.mp')}</SelectItem>
                                                    <SelectItem value="tg">{t('state.tg')}</SelectItem>
                                                    <SelectItem value="other">{t('state.other')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.city')}</Label>
                                            {formData.state === 'mh' ? (
                                                <Select value={formData.city} onValueChange={(v) => handleChange('city', v)}>
                                                    <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ahmednagar">{t('city.ahmednagar')}</SelectItem>
                                                        <SelectItem value="akola">{t('city.akola')}</SelectItem>
                                                        <SelectItem value="amravati">{t('city.amravati')}</SelectItem>
                                                        <SelectItem value="aurangabad">{t('city.aurangabad')}</SelectItem>
                                                        <SelectItem value="beed">{t('city.beed')}</SelectItem>
                                                        <SelectItem value="bhandara">{t('city.bhandara')}</SelectItem>
                                                        <SelectItem value="buldhana">{t('city.buldhana')}</SelectItem>
                                                        <SelectItem value="chandrapur">{t('city.chandrapur')}</SelectItem>
                                                        <SelectItem value="dhule">{t('city.dhule')}</SelectItem>
                                                        <SelectItem value="gadchiroli">{t('city.gadchiroli')}</SelectItem>
                                                        <SelectItem value="gondia">{t('city.gondia')}</SelectItem>
                                                        <SelectItem value="hingoli">{t('city.hingoli')}</SelectItem>
                                                        <SelectItem value="jalgaon">{t('city.jalgaon')}</SelectItem>
                                                        <SelectItem value="jalna">{t('city.jalna')}</SelectItem>
                                                        <SelectItem value="kolhapur">{t('city.kolhapur')}</SelectItem>
                                                        <SelectItem value="latur">{t('city.latur')}</SelectItem>
                                                        <SelectItem value="mumbai">{t('city.mumbai')}</SelectItem>
                                                        <SelectItem value="nagpur">{t('city.nagpur')}</SelectItem>
                                                        <SelectItem value="nanded">{t('city.nanded')}</SelectItem>
                                                        <SelectItem value="nandurbar">{t('city.nandurbar')}</SelectItem>
                                                        <SelectItem value="nashik">{t('city.nashik')}</SelectItem>
                                                        <SelectItem value="osmanabad">{t('city.osmanabad')}</SelectItem>
                                                        <SelectItem value="palghar">{t('city.palghar')}</SelectItem>
                                                        <SelectItem value="parbhani">{t('city.parbhani')}</SelectItem>
                                                        <SelectItem value="pune">{t('city.pune')}</SelectItem>
                                                        <SelectItem value="raigad">{t('city.raigad')}</SelectItem>
                                                        <SelectItem value="ratnagiri">{t('city.ratnagiri')}</SelectItem>
                                                        <SelectItem value="sangli">{t('city.sangli')}</SelectItem>
                                                        <SelectItem value="satara">{t('city.satara')}</SelectItem>
                                                        <SelectItem value="sindhudurg">{t('city.sindhudurg')}</SelectItem>
                                                        <SelectItem value="solapur">{t('city.solapur')}</SelectItem>
                                                        <SelectItem value="thane">{t('city.thane')}</SelectItem>
                                                        <SelectItem value="wardha">{t('city.wardha')}</SelectItem>
                                                        <SelectItem value="washim">{t('city.washim')}</SelectItem>
                                                        <SelectItem value="yavatmal">{t('city.yavatmal')}</SelectItem>
                                                        <SelectItem value="other">{t('city.other')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input value={formData.city} onChange={(e) => handleChange('city', e.target.value)} placeholder={t('register.city')} />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Family Details */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <Users className="w-5 h-5" /> {t('register.familyDetails')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>{t('register.fullAddress')}</Label>
                                            <Textarea value={formData.fullAddress} onChange={(e) => handleChange('fullAddress', e.target.value)} className="min-h-[80px]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>{t('register.fatherName')}</Label>
                                            <Input value={formData.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.fatherOcc')}</Label>
                                            <Select value={formData.fatherOccupation} onValueChange={(v) => handleChange('fatherOccupation', v)}>
                                                <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="teacher">{t('prof.teacher')}</SelectItem>
                                                    <SelectItem value="government">{t('prof.govServant')}</SelectItem>
                                                    <SelectItem value="farmer">{t('prof.farmer')}</SelectItem>
                                                    <SelectItem value="business">{t('prof.business')}</SelectItem>
                                                    <SelectItem value="other">{t('prof.other')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t('register.fatherContact')}</Label>
                                        <Input value={formData.fatherContact} onChange={(e) => handleChange('fatherContact', e.target.value)} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>{t('register.motherName')}</Label>
                                            <Input value={formData.motherName} onChange={(e) => handleChange('motherName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('register.motherOcc')}</Label>
                                            <Select value={formData.motherOccupation} onValueChange={(v) => handleChange('motherOccupation', v)}>
                                                <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="housewife">{t('prof.housewife')}</SelectItem>
                                                    <SelectItem value="teacher">{t('prof.teacher')}</SelectItem>
                                                    <SelectItem value="government">{t('prof.govServant')}</SelectItem>
                                                    <SelectItem value="business">{t('prof.business')}</SelectItem>
                                                    <SelectItem value="other">{t('prof.other')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label>{t('register.siblings')}</Label>
                                        <Select
                                            value={formData.siblings}
                                            onValueChange={(v) => {
                                                const count = parseInt(v);
                                                const currentNames = formData.siblingNames || [];
                                                const newNames = Array(count).fill('').map((_, i) => currentNames[i] || '');
                                                setFormData(prev => ({ ...prev, siblings: v, siblingNames: newNames }));
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder={t('common.select') || "Select"} /></SelectTrigger>
                                            <SelectContent>
                                                {[0, 1, 2, 3, 4, 5].map(num => (
                                                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Dynamic Inputs */}
                                        {parseInt(formData.siblings) > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Array.from({ length: parseInt(formData.siblings) }).map((_, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <Label>{t('register.siblingLabel')} {index + 1}</Label>
                                                        <Input
                                                            value={formData.siblingNames?.[index] || ''}
                                                            onChange={(e) => {
                                                                const newNames = [...(formData.siblingNames || [])];
                                                                newNames[index] = e.target.value;
                                                                setFormData(prev => ({ ...prev, siblingNames: newNames }));
                                                            }}
                                                            placeholder={`${t('register.siblingPlaceholder')} ${index + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* About */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <Info className="w-5 h-5" /> {t('register.about')}
                                    </h2>
                                    <Textarea value={formData.about} onChange={(e) => handleChange('about', e.target.value)} className="min-h-[100px]" />
                                </div>

                                {/* Profile Photo (Bottom position as per request) */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <Upload className="w-5 h-5" /> {t('profile.photo')}
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-muted-foreground/50" />
                                            )}
                                        </div>
                                        <div>
                                            <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="max-w-xs" />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full btn-gold h-12 text-lg" disabled={saving}>
                                    {saving ? t('common.processing') : t('common.save')}
                                </Button>

                            </form>
                        </div>
                    </div>
                </div>
            </section >

            {/* Image Cropper Modal */}
            {cropperImgSrc && (
                <ImageCropper
                    open={showCropper}
                    imageSrc={cropperImgSrc}
                    onClose={() => setShowCropper(false)}
                    onCropComplete={handleCropComplete}
                />
            )}
        </>
    );
};

export default EditProfile;
