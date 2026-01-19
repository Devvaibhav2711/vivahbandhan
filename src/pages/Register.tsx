import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, Briefcase, MapPin, Users, Info, Upload } from 'lucide-react';
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
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import ImageCropper from '@/components/ImageCropper';

const Register: React.FC = () => {
  const { t } = useLanguage();
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImgSrc, setCropperImgSrc] = useState<string | null>(null);

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
    familyType: '',
    fullAddress: '', // Replaces familyValues
    fatherName: '',
    fatherOccupation: '',
    fatherContact: '',
    motherName: '',
    motherOccupation: '',
    // brotherName: '', // Legacy
    // sisterName: '', // Legacy
    siblings: '0',
    siblingNames: [] as string[],
    about: ''
  });

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
      // Constructively clear input so same file selection triggers change again if needed
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setShowCropper(false);
      const croppedFile = new File([croppedBlob], "profile_photo.jpg", { type: "image/jpeg" });
      setPhotoPreview(URL.createObjectURL(croppedBlob));

      // Compress the cropped image before setting
      const compressedFile = await compressImage(croppedFile);
      setPhotoFile(compressedFile);
    } catch (error: any) {
      console.error("Processing failed", error);
      toast({ title: t('common.error'), description: "Failed to process image", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      toast({ title: "Offline", description: "Internet required for registration.", variant: "destructive" });
      return;
    }

    // Account validations only if NO user logged in
    if (!user) {
      if (formData.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        return;
      }

      if (formData.phone.length !== 10) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must be exactly 10 digits.",
          variant: "destructive",
        });
        return;
      }
    }

    if (formData.fatherContact.length !== 10) {
      toast({
        title: "Invalid Father's Contact",
        description: "Father's contact number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    if (!photoFile) {
      toast({ title: t('validation.errorTitle'), description: t('register.photoRequired'), variant: 'destructive' });
      const photoSection = document.getElementById('photo-upload');
      if (photoSection) photoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Validate required fields explicitly
    if (!formData.firstName || !formData.lastName || !formData.middleName || !formData.dob || !formData.gender || !formData.height || !formData.birthTime || !formData.birthPlace || !formData.caste || !formData.rashi) {
      toast({
        title: t('validation.errorTitle'),
        description: t('common.required'), // Or more specific message "Please fill all required fields"
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      let targetUserId = user?.id;

      // 1. If NOT logged in, Sign up user
      if (!user) {
        const signUpResult = await register(formData.email, formData.password, formData.phone);
        if (!signUpResult.success) throw new Error(signUpResult.error);

        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (!newUser) throw new Error("User creation failed or session not found.");
        targetUserId = newUser.id;
      }

      if (!targetUserId) throw new Error("User ID could not be determined.");

      // Calculate age
      const birthDate = new Date(formData.dob);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);

      // 3. Upload Photo
      let photoUrl = '';
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${targetUserId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, photoFile);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          toast({ title: t('register.failedTitle'), description: t('register.photoUploadFailed'), variant: 'destructive' });
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);
          photoUrl = publicUrl;
        }
      }

      // 4. Create Profile
      const profileData = {
        user_id: targetUserId,
        full_name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim(),
        age: calculatedAge.toString(),
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
        status: 'pending',
        profile_photo: photoUrl
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) throw profileError;

      toast({ title: t('register.successTitle'), description: t('register.successDesc') });
      navigate('/dashboard');

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({ title: t('register.failedTitle'), description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="py-12 md:py-16 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3 text-primary">
                {user ? 'Complete Your Profile' : t('register.title')}
              </h1>
              <p className="text-muted-foreground">{t('register.subtitle')}</p>
            </div>

            <div className="card-elegant p-6 md:p-10 bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Account Information - Show ONLY if not logged in */}
                {!user && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                      <Mail className="w-5 h-5" /> {t('register.accountInfo')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('register.email')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          required
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">{t('register.password')} *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          required
                          minLength={6}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('register.phone')} *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            handleChange('phone', val);
                          }}
                          maxLength={10}
                          pattern="[0-9]{10}"
                          required
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                    <User className="w-5 h-5" /> {t('register.basicInfo')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2" id="field-gender">
                      <Label>{t('register.gender')} *</Label>
                      <Select onValueChange={(v) => handleChange('gender', v)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t('gender.male')}</SelectItem>
                          <SelectItem value="female">{t('gender.female')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('register.firstName')} *</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('register.middleName')} *</Label>
                      <Input
                        value={formData.middleName}
                        onChange={(e) => handleChange('middleName', e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('register.lastName')} *</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('register.dob')} *</Label>
                      <Input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleChange('dob', e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('register.height')} *</Label>
                      <Select onValueChange={(v) => handleChange('height', v)} value={formData.height}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
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
                      <Label>{t('register.birthTime')} *</Label>
                      <Input
                        type="time"
                        value={formData.birthTime}
                        onChange={(e) => handleChange('birthTime', e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('profile.birthPlace')} *</Label>
                      <Input
                        value={formData.birthPlace}
                        onChange={(e) => handleChange('birthPlace', e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('register.caste')} *</Label>
                      <Select value={formData.caste} onValueChange={(v) => handleChange('caste', v)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={t('common.select') || "Select"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kumbhar">{t('caste.kumbhar')}</SelectItem>
                          <SelectItem value="other">{t('caste.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2" id="field-rashi">
                      <Label>{t('register.rashi')} *</Label>
                      <Select onValueChange={(v) => handleChange('rashi', v)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
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
                    <div className="space-y-2" id="field-education">
                      <Label>{t('register.eduLevel')}</Label>
                      <Select onValueChange={(v) => handleChange('educationLevel', v)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
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
                      <Input
                        value={formData.college}
                        onChange={(e) => handleChange('college', e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2" id="field-profession">
                      <Label>{t('register.profession')}</Label>
                      <Select onValueChange={(v) => handleChange('profession', v)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
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
                      <Input
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="bg-background"
                      />
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
                      <Select
                        value={formData.state}
                        onValueChange={(v) => handleChange('state', v)}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
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
                        <Select
                          value={formData.city}
                          onValueChange={(v) => handleChange('city', v)}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder={t('common.select')} />
                          </SelectTrigger>
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
                        <Input
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          required
                          className="bg-background"
                          placeholder={t('register.city')}
                        />
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
                      <Label>{t('register.fullAddress')} *</Label>
                      <Textarea
                        value={formData.fullAddress}
                        onChange={(e) => handleChange('fullAddress', e.target.value)}
                        required
                        className="bg-background min-h-[80px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{t('register.fatherName')} *</Label>
                      <Input
                        value={formData.fatherName}
                        onChange={(e) => handleChange('fatherName', e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('register.fatherOcc')} *</Label>
                      <Select
                        value={formData.fatherOccupation}
                        onValueChange={(v) => handleChange('fatherOccupation', v)}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
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
                    <Label>{t('register.fatherContact')} *</Label>
                    <Input
                      value={formData.fatherContact}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleChange('fatherContact', val);
                      }}
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{t('register.motherName')} *</Label>
                      <Input
                        value={formData.motherName}
                        onChange={(e) => handleChange('motherName', e.target.value)}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('register.motherOcc')} *</Label>
                      <Select
                        value={formData.motherOccupation}
                        onValueChange={(v) => handleChange('motherOccupation', v)}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
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
                    <Label>{t('register.siblings')} *</Label>
                    <Select
                      value={formData.siblings}
                      onValueChange={(v) => {
                        // Resize siblingNames array when count changes
                        const count = parseInt(v);
                        const currentNames = formData.siblingNames || [];
                        const newNames = Array(count).fill('').map((_, i) => currentNames[i] || '');
                        setFormData(prev => ({ ...prev, siblings: v, siblingNames: newNames }));
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={t('common.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dynamic Sibling Inputs */}
                  {parseInt(formData.siblings) > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                      {Array.from({ length: parseInt(formData.siblings) }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <Label>{t('register.siblingLabel')} {index + 1}</Label>
                          <Input
                            placeholder={`${t('register.siblingPlaceholder')} ${index + 1}`}
                            value={formData.siblingNames?.[index] || ''}
                            onChange={(e) => {
                              const newNames = [...(formData.siblingNames || [])];
                              newNames[index] = e.target.value;
                              setFormData(prev => ({ ...prev, siblingNames: newNames }));
                            }}
                            className="bg-background"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* About */}
                <div className="space-y-4">
                  <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                    <Info className="w-5 h-5" /> {t('register.about')}
                  </h2>
                  <div className="space-y-2">
                    <Label>{t('register.bio')}</Label>
                    <Textarea
                      value={formData.about}
                      onChange={(e) => handleChange('about', e.target.value)}
                      className="bg-background min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="space-y-4">
                  <h2 className="text-xl font-serif font-bold flex items-center gap-2 border-b pb-2 text-primary">
                    <Upload className="w-5 h-5" /> {t('register.photo')}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="photo-upload" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <Upload className="w-4 h-4" /> {t('register.uploadPhoto')}
                          </div>
                        </Label>
                        <Input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('register.photoHint')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full btn-gold h-12 text-lg" disabled={isLoading || !isOnline}>
                  {isLoading ? t('common.loading') : (isOnline ? t('register.submit') : "Offline")}
                </Button>

                {!user && (
                  <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                      {t('register.haveAccount')}{' '}
                      <Link to="/login" className="text-primary font-medium hover:underline">
                        {t('register.loginHere')}
                      </Link>
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

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

export default Register;
