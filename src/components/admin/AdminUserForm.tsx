import React, { useState, useRef } from 'react';
import { Mail, User, Briefcase, MapPin, Users, Info, Upload } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminUserForm: React.FC = () => {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Full state matching Register.tsx
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        gender: '',
        firstName: '',
        middleName: '',
        lastName: '',
        dob: '',
        birthTime: '',
        birthPlace: '',
        height: '',
        religion: '',
        caste: '',
        rashi: '',
        educationLevel: '',
        college: '',
        profession: '',
        company: '',
        country: '',
        state: '',
        city: '',
        fullAddress: '',
        fatherName: '',
        fatherOccupation: '',
        fatherContact: '',
        motherName: '',
        motherOccupation: '',
        brotherName: '',
        sisterName: '',
        siblings: '',
        about: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.phone.length !== 10) {
            toast({
                title: "Invalid Phone Number",
                description: "Phone number must be exactly 10 digits.",
                variant: 'destructive'
            });
            return;
        }

        if (formData.fatherContact.length !== 10) {
            toast({
                title: "Invalid Father's Contact",
                description: "Father's contact number must be exactly 10 digits.",
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);

        try {
            // Create a temporary client to register the user without logging out the Admin
            // This is essential to create a new Auth User while keeping Admin session active.
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL || '',
                import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                { auth: { persistSession: false } }
            );

            // 1. Sign up user
            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { phone: formData.phone }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("User creation failed.");

            const userId = authData.user.id;

            // 2. Upload Photo
            let photoUrl = '';
            if (photoFile) {
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `${userId}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Use tempClient for upload as it is logged in as the new user (who owns the object)
                const { error: uploadError } = await tempClient.storage
                    .from('profile-photos')
                    .upload(filePath, photoFile);

                if (!uploadError) {
                    const { data: { publicUrl } } = tempClient.storage
                        .from('profile-photos')
                        .getPublicUrl(filePath);
                    photoUrl = publicUrl;
                } else {
                    console.error("Photo upload failed", uploadError);
                    toast({ title: 'Photo Upload Failed', description: 'User created but photo upload failed.', variant: 'destructive' });
                }
            }

            // 3. Create Profile
            const profileData = {
                user_id: userId,
                full_name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim(),
                age: calculateAge(formData.dob).toString(),
                gender: formData.gender,
                height: formData.height,
                education: `${formData.educationLevel} - ${formData.college}`,
                profession: `${formData.profession} at ${formData.company}`,
                income: '',
                religion: formData.religion,
                caste: formData.caste,
                location: `${formData.fullAddress} | ${formData.city}, ${formData.state}`,
                family_background: `Father: ${formData.fatherName} (${formData.fatherOccupation}), Father Contact: ${formData.fatherContact}, Mother: ${formData.motherName} (${formData.motherOccupation}), Brothers: ${formData.brotherName || 'None'}, Sisters: ${formData.sisterName || 'None'}, Total Siblings: ${formData.siblings}`,
                about: formData.about,
                lifestyle: `Rashi: ${formData.rashi} | Birth Time: ${formData.birthTime} | Birth Place: ${formData.birthPlace}`,
                status: 'pending',
                profile_photo: photoUrl
            };

            const { error: profileError } = await tempClient
                .from('profiles')
                .insert(profileData);

            if (profileError) throw profileError;

            // Update User Role to 'user' explicitly if needed? 
            // Default is usually 'user'. We can set to 'active' if Admin wants immediate activation?
            // For now, consistent with Register logic.

            toast({ title: 'User Created', description: `User ${formData.email} added successfully.` });

            // Reset form
            setFormData({
                email: '', password: '', phone: '', gender: '', firstName: '', middleName: '', lastName: '',
                dob: '', birthTime: '', birthPlace: '', height: '', religion: '', caste: '', rashi: '',
                educationLevel: '', college: '', profession: '', company: '',
                country: '', state: '', city: '', fullAddress: '',
                fatherName: '', fatherOccupation: '', fatherContact: '', motherName: '', motherOccupation: '',
                brotherName: '', sisterName: '', siblings: '', about: ''
            });
            setPhotoFile(null);
            setPhotoPreview(null);

        } catch (error: any) {
            console.error("User creation error:", error);
            toast({ title: 'Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card-elegant p-6 md:p-10 bg-white/80 backdrop-blur-sm">
            <h2 className="text-2xl font-serif font-bold mb-6 text-primary">{t('admin.addUser')}</h2>
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Account Information */}
                <div className="space-y-4">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                        <Mail className="w-5 h-5" /> {t('register.accountInfo')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>{t('register.email')} *</Label>
                            <Input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.password')} *</Label>
                            <Input type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required minLength={6} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.phone')} *</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    handleChange('phone', val);
                                }}
                                maxLength={10}
                                pattern="[0-9]{10}"
                                required
                            />
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
                            <Label>{t('register.gender')} *</Label>
                            <Select onValueChange={(v) => handleChange('gender', v)} value={formData.gender}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">{t('gender.male')}</SelectItem>
                                    <SelectItem value="female">{t('gender.female')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.firstName')} *</Label>
                            <Input value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.middleName')}</Label>
                            <Input value={formData.middleName} onChange={(e) => handleChange('middleName', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.lastName')} *</Label>
                            <Input value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.dob')} *</Label>
                            <Input type="date" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.birthTime')} *</Label>
                            <Input
                                type="time"
                                value={formData.birthTime}
                                onChange={(e) => handleChange('birthTime', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('profile.birthPlace')} *</Label>
                            <Input
                                value={formData.birthPlace}
                                onChange={(e) => handleChange('birthPlace', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.height')}</Label>
                            <Select onValueChange={(v) => handleChange('height', v)} value={formData.height}>
                                <SelectTrigger><SelectValue placeholder="Select Height" /></SelectTrigger>
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
                            <Label>{t('register.caste')}</Label>
                            <Select onValueChange={(v) => handleChange('caste', v)} value={formData.caste}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kumbhar">{t('caste.kumbhar')}</SelectItem>
                                    <SelectItem value="other">{t('caste.other')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.rashi')} *</Label>
                            <Select onValueChange={(v) => handleChange('rashi', v)} value={formData.rashi}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
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
                            <Select onValueChange={(v) => handleChange('educationLevel', v)} value={formData.educationLevel}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
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
                            <Select onValueChange={(v) => handleChange('profession', v)} value={formData.profession}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="private">{t('prof.private')}</SelectItem>
                                    <SelectItem value="government">{t('prof.government')}</SelectItem>
                                    <SelectItem value="business">{t('prof.business')}</SelectItem>
                                    <SelectItem value="defence">{t('prof.defence')}</SelectItem>
                                    <SelectItem value="not_working">{t('prof.not_working')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.company')}</Label>
                            <Input value={formData.company} onChange={(e) => handleChange('company', e.target.value)} />
                        </div>

                    </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                        <MapPin className="w-5 h-5" /> {t('register.location')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="space-y-2">
                            <Label>{t('register.state')}</Label>
                            <Input value={formData.state} onChange={(e) => handleChange('state', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.city')}</Label>
                            <Input value={formData.city} onChange={(e) => handleChange('city', e.target.value)} />
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
                            <Label>{t('register.fullAddress')} *</Label>
                            <Textarea
                                value={formData.fullAddress}
                                onChange={(e) => handleChange('fullAddress', e.target.value)}
                                required
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>{t('register.fatherName')} *</Label>
                            <Input value={formData.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.fatherOcc')} *</Label>
                            <Input value={formData.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('register.fatherContact')} *</Label>
                        <Input
                            value={formData.fatherContact}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                handleChange('fatherContact', val);
                            }}
                            required
                            type="tel"
                            maxLength={10}
                            pattern="[0-9]{10}"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>{t('register.motherName')} *</Label>
                            <Input value={formData.motherName} onChange={(e) => handleChange('motherName', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.motherOcc')} *</Label>
                            <Input value={formData.motherOccupation} onChange={(e) => handleChange('motherOccupation', e.target.value)} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>{t('register.brotherName')}</Label>
                            <Input value={formData.brotherName} onChange={(e) => handleChange('brotherName', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('register.sisterName')}</Label>
                            <Input value={formData.sisterName} onChange={(e) => handleChange('sisterName', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('register.siblings')} *</Label>
                        <Input value={formData.siblings} onChange={(e) => handleChange('siblings', e.target.value)} required />
                    </div>
                </div>

                {/* About */}
                <div className="space-y-4">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                        <Info className="w-5 h-5" /> {t('register.about')}
                    </h2>
                    <div className="space-y-2">
                        <Label>{t('register.bio')}</Label>
                        <Textarea value={formData.about} onChange={(e) => handleChange('about', e.target.value)} className="min-h-[100px]" />
                    </div>
                </div>

                {/* Profile Photo */}
                <div className="space-y-4">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                        <Upload className="w-5 h-5" /> {t('register.photo')}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-muted-foreground/50" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                            />
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-secondary/10 hover:bg-secondary/20 border-primary/20"
                                >
                                    {t('admin.chooseFile')}
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {fileInputRef.current?.files?.[0]?.name || t('admin.noFile')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-full btn-gold h-12 text-lg" disabled={isLoading}>
                    {isLoading ? t('admin.creatingUser') : t('admin.createUser')}
                </Button>
            </form>
        </div>
    );
};

export default AdminUserForm;
