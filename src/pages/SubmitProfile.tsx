import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

const SubmitProfile: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    height: '',
    maritalStatus: '',
    education: '',
    profession: '',
    income: '',
    religion: '',
    caste: '',
    location: '',
    familyBackground: '',
    lifestyle: '',
    about: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];

      try {
        setPhotoPreview(URL.createObjectURL(originalFile));
        const compressedFile = await compressImage(originalFile);
        setPhotoFile(compressedFile);
      } catch (error: any) {
        console.error("Compression failed", error);
        // Using existing toast structure for now, ideally strictly typed but this works
        toast({ title: t('common.warning'), description: t('register.photoCompressionFailed'), variant: "destructive" });
        setPhotoFile(originalFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      toast({ title: 'Consent Required', description: 'Please agree to the consent checkbox.', variant: 'destructive' });
      return;
    }

    if (!photoFile) {
      toast({ title: t('validation.errorTitle'), description: t('register.photoRequired'), variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to submit a profile.');
      }

      // Upload Photo
      let photoUrl = '';
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, photoFile);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          toast({ title: t('register.failedTitle'), description: t('register.photoUploadFailed'), variant: 'destructive' });
          // Proceeding without photo update if it failed? Or fail? Register continues. We will continue but url will be empty.
          // Actually Register continues.
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);
          photoUrl = publicUrl;
        }
      }

      const updates = {
        user_id: user.id,
        full_name: formData.fullName,
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        marital_status: formData.maritalStatus,
        education: formData.education,
        profession: formData.profession,
        income: formData.income,
        religion: formData.religion,
        caste: formData.caste,
        location: formData.location,
        family_background: formData.familyBackground,
        lifestyle: formData.lifestyle,
        about: formData.about,
        status: 'pending',
        profile_photo: photoUrl
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      toast({ title: t('register.successTitle'), description: t('register.successDesc') });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting profile:', error);
      toast({ title: t('register.failedTitle'), description: error.message || 'Failed to submit profile', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{t('nav.submitProfile')}</h1>
              <div className="section-divider mb-4" />
              <p className="text-muted-foreground">{t('register.submissionFree') || 'Profile submission is completely free.'}</p>
            </div>

            <div className="card-elegant p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload Section - Added */}
                <div className="space-y-4 border-b border-border pb-6">
                  <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                    <Upload className="w-5 h-5" /> {t('register.photo')} *
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground/50" />
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

                <h2 className="font-serif text-xl font-bold border-b border-border pb-2">{t('profile.personalDetails')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('profile.fullName')} *</Label>
                    <Input id="fullName" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">{t('profile.age')} *</Label>
                    <Input id="age" type="number" min="18" max="80" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('profile.gender')} *</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)} required>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('profile.male')}</SelectItem>
                        <SelectItem value="female">{t('profile.female')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">{t('profile.height')}</Label>
                    <Input id="height" placeholder="e.g., 5'6&quot;" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('profile.maritalStatus')} *</Label>
                    <Select value={formData.maritalStatus} onValueChange={(v) => handleChange('maritalStatus', v)} required>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">{t('profile.never')}</SelectItem>
                        <SelectItem value="divorced">{t('profile.divorced')}</SelectItem>
                        <SelectItem value="widowed">{t('profile.widowed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">{t('profile.education')} *</Label>
                    <Input id="education" value={formData.education} onChange={(e) => handleChange('education', e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">{t('profile.profession')} *</Label>
                    <Input id="profession" value={formData.profession} onChange={(e) => handleChange('profession', e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income">{t('profile.income')}</Label>
                    <Input id="income" placeholder="e.g., 5-10 LPA" value={formData.income} onChange={(e) => handleChange('income', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion">{t('profile.religion')}</Label>
                    <Input id="religion" value={formData.religion} onChange={(e) => handleChange('religion', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caste">{t('profile.caste')}</Label>
                    <Input id="caste" value={formData.caste} onChange={(e) => handleChange('caste', e.target.value)} />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="location">{t('profile.location')} *</Label>
                    <Input id="location" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familyBackground">{t('profile.familyBackground')}</Label>
                  <Textarea id="familyBackground" rows={3} value={formData.familyBackground} onChange={(e) => handleChange('familyBackground', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lifestyle">{t('profile.lifestyle')}</Label>
                  <Textarea id="lifestyle" rows={2} value={formData.lifestyle} onChange={(e) => handleChange('lifestyle', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about">{t('profile.about')}</Label>
                  <Textarea id="about" rows={3} value={formData.about} onChange={(e) => handleChange('about', e.target.value)} />
                </div>

                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(c as boolean)} />
                  <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">{t('profile.consent')}</Label>
                </div>

                <Button type="submit" className="w-full btn-gold" disabled={isSubmitting}>
                  {isSubmitting ? t('common.loading') : t('profile.submit')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SubmitProfile;
