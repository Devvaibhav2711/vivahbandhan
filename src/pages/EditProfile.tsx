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
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/utils/imageCompression';

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
        maritalStatus: '',
        religion: '',
        caste: '',
        motherTongue: '',
        educationLevel: '',
        college: '',
        profession: '',
        company: '',
        income: '',
        country: '',
        state: '',
        city: '',
        familyType: '',
        familyValues: '',
        fatherOccupation: '',
        motherOccupation: '',
        siblings: '',
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
        // Expected format: "Type: Nuclear, Values: Orthodox. Father: Farmer, Mother: Housewife, Siblings: 1"
        const type = str.match(/Type: ([^,]*)/)?.[1]?.trim() || '';
        const values = str.match(/Values: ([^.]*)/)?.[1]?.trim() || '';
        const father = str.match(/Father: ([^,]*)/)?.[1]?.trim() || '';
        const mother = str.match(/Mother: ([^,]*)/)?.[1]?.trim() || '';
        const siblings = str.match(/Siblings: (.*)/)?.[1]?.trim() || '';
        return { type, values, father, mother, siblings };
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
        if (!str) return {};
        const parts = str.split(', ').map(s => s.trim());
        // City, State, Country
        return { city: parts[0] || '', state: parts[1] || '', country: parts[2] || '' };
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
                const tongue = (profile.lifestyle || '').match(/Mother Tongue: (.*)/)?.[1] || '';

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
                    maritalStatus: profile.marital_status || '',
                    religion: profile.religion || '',
                    caste: profile.caste || '',
                    motherTongue: tongue,
                    educationLevel: edu.level || '',
                    college: edu.college || '',
                    profession: job.prof || '',
                    company: job.comp || '',
                    income: profile.income || '',
                    country: loc.country || '',
                    state: loc.state || '',
                    city: loc.city || '',
                    familyType: family.type || '',
                    familyValues: family.values || '',
                    fatherOccupation: family.father || '',
                    motherOccupation: family.mother || '',
                    siblings: family.siblings || '',
                    about: profile.about || ''
                });

                if (profile.profile_photo) {
                    setPhotoPreview(profile.profile_photo);
                }

            } catch (error: any) {
                console.error('Error loading profile:', error);
                toast({ title: 'Error', description: 'Failed to load profile data', variant: 'destructive' });
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
            const originalFile = e.target.files[0];
            try {
                // Preview original immediately
                setPhotoPreview(URL.createObjectURL(originalFile));

                // Compress
                // Uses default 0.8 quality and 800px width with smart iterative reduction
                const compressedFile = await compressImage(originalFile);
                setPhotoFile(compressedFile);
            } catch (error: any) {
                console.error("Compression failed", error);

                if (error.message && error.message.includes('File size exceeds')) {
                    setPhotoFile(null);
                    toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive"
                    });
                } else {
                    setPhotoFile(originalFile);
                    toast({
                        title: "Warning",
                        description: "Could not compress image. Uploading original size.",
                        variant: "destructive"
                    });
                }
            }
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) return;
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
            toast({ title: 'Deleted', description: 'Profile deleted successfully.' });
            navigate('/dashboard'); // or /admin
        } catch (error: any) {
            console.error('Error deleting:', error);
            toast({ title: 'Error', description: 'Failed to delete profile', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
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
                marital_status: formData.maritalStatus,
                education: `${formData.educationLevel} - ${formData.college}`,
                profession: `${formData.profession} at ${formData.company}`,
                income: formData.income,
                religion: formData.religion,
                caste: formData.caste,
                location: `${formData.city}, ${formData.state}, ${formData.country}`,
                family_background: `Type: ${formData.familyType}, Values: ${formData.familyValues}. Father: ${formData.fatherOccupation}, Mother: ${formData.motherOccupation}, Siblings: ${formData.siblings}`,
                about: formData.about,
                lifestyle: `Mother Tongue: ${formData.motherTongue}`,
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

            toast({ title: 'Success', description: 'Profile updated successfully.' });

            if (isAdmin) {
                setTimeout(() => navigate('/admin'), 1000);
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return <Layout><div className="flex justify-center py-20">Loading...</div></Layout>;

    return (
        <Layout>
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
                                        <Mail className="w-5 h-5" /> Account Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={formData.email} disabled className="bg-gray-100 cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <User className="w-5 h-5" /> Basic Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Gender</Label>
                                            <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>First Name</Label>
                                            <Input value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Middle Name</Label>
                                            <Input value={formData.middleName} onChange={(e) => handleChange('middleName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Name</Label>
                                            <Input value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date of Birth (Set to update Age)</Label>
                                            <Input type="date" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                                            {/* Note: DOB is not stored, so it will be empty initially */}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Height</Label>
                                            <Input value={formData.height} onChange={(e) => handleChange('height', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Marital Status</Label>
                                            <Select value={formData.maritalStatus} onValueChange={(v) => handleChange('maritalStatus', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="never">Never Married</SelectItem>
                                                    <SelectItem value="divorced">Divorced</SelectItem>
                                                    <SelectItem value="widowed">Widowed</SelectItem>
                                                    <SelectItem value="awaiting">Awaiting Divorce</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Religion</Label>
                                            <Select value={formData.religion} onValueChange={(v) => handleChange('religion', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hindu">Hindu</SelectItem>
                                                    <SelectItem value="muslim">Muslim</SelectItem>
                                                    <SelectItem value="christian">Christian</SelectItem>
                                                    <SelectItem value="sikh">Sikh</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Caste</Label>
                                            <Input value={formData.caste} onChange={(e) => handleChange('caste', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mother Tongue</Label>
                                            <Select value={formData.motherTongue} onValueChange={(v) => handleChange('motherTongue', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hindi">Hindi</SelectItem>
                                                    <SelectItem value="marathi">Marathi</SelectItem>
                                                    <SelectItem value="english">English</SelectItem>
                                                    <SelectItem value="gujarati">Gujarati</SelectItem>
                                                    <SelectItem value="punjabi">Punjabi</SelectItem>
                                                    <SelectItem value="bengali">Bengali</SelectItem>
                                                    <SelectItem value="tamil">Tamil</SelectItem>
                                                    <SelectItem value="telugu">Telugu</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Education */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <Briefcase className="w-5 h-5" /> Education & Career
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Education Level</Label>
                                            <Select value={formData.educationLevel} onValueChange={(v) => handleChange('educationLevel', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="highschool">High School</SelectItem>
                                                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                                                    <SelectItem value="masters">Master's Degree</SelectItem>
                                                    <SelectItem value="doctorate">Doctorate</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>College</Label>
                                            <Input value={formData.college} onChange={(e) => handleChange('college', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Profession</Label>
                                            <Select value={formData.profession} onValueChange={(v) => handleChange('profession', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="private">Private Sector</SelectItem>
                                                    <SelectItem value="government">Government/Public Sector</SelectItem>
                                                    <SelectItem value="business">Business/Self Employed</SelectItem>
                                                    <SelectItem value="defence">Defence/Civil Services</SelectItem>
                                                    <SelectItem value="not_working">Not Working</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Company</Label>
                                            <Input value={formData.company} onChange={(e) => handleChange('company', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Income</Label>
                                            <Select value={formData.income} onValueChange={(v) => handleChange('income', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0-5">0 - 5 LPA</SelectItem>
                                                    <SelectItem value="5-10">5 - 10 LPA</SelectItem>
                                                    <SelectItem value="10-15">10 - 15 LPA</SelectItem>
                                                    <SelectItem value="15-20">15 - 20 LPA</SelectItem>
                                                    <SelectItem value="20+">20+ LPA</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <MapPin className="w-5 h-5" /> Location
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Country</Label>
                                            <Input value={formData.country} onChange={(e) => handleChange('country', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State</Label>
                                            <Input value={formData.state} onChange={(e) => handleChange('state', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input value={formData.city} onChange={(e) => handleChange('city', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Family Details */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <Users className="w-5 h-5" /> Family Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Family Type</Label>
                                            <Select value={formData.familyType} onValueChange={(v) => handleChange('familyType', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="nuclear">Nuclear</SelectItem>
                                                    <SelectItem value="joint">Joint</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Family Values</Label>
                                            <Select value={formData.familyValues} onValueChange={(v) => handleChange('familyValues', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="orthodox">Orthodox</SelectItem>
                                                    <SelectItem value="traditional">Traditional</SelectItem>
                                                    <SelectItem value="moderate">Moderate</SelectItem>
                                                    <SelectItem value="liberal">Liberal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Father's Occupation</Label>
                                            <Input value={formData.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mother's Occupation</Label>
                                            <Input value={formData.motherOccupation} onChange={(e) => handleChange('motherOccupation', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Siblings</Label>
                                        <Input value={formData.siblings} onChange={(e) => handleChange('siblings', e.target.value)} />
                                    </div>
                                </div>

                                {/* About */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <Info className="w-5 h-5" /> About
                                    </h2>
                                    <Textarea value={formData.about} onChange={(e) => handleChange('about', e.target.value)} className="min-h-[100px]" />
                                </div>

                                {/* Profile Photo (Bottom position as per request) */}
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                                        <Upload className="w-5 h-5" /> Profile Photo
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
                                    {saving ? 'Saving Changes...' : 'Save Changes'}
                                </Button>

                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default EditProfile;
