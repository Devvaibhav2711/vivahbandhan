import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Layout removed
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [defaultValues, setDefaultValues] = useState({ name: '', email: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({ title: t('contact.loginRequired'), description: t('contact.loginMsg') });
      navigate('/login');
    } else {
      // Set email immediately
      setDefaultValues(prev => ({ ...prev, email: user.email || '' }));

      // Fetch profile for name
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, fullName') // Support both namings if schema varies
            .eq('user_id', user.id)
            .single();

          if (data) {
            setDefaultValues(prev => ({
              ...prev,
              name: data.full_name || data.fullName || ''
            }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };
      fetchProfile();
    }
  }, [user, authLoading, navigate, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const { error } = await supabase.from('contact_messages').insert({
        user_id: user.id,
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject') || 'General Inquiry',
        message: formData.get('message')
      });

      if (error) throw error;

      toast({
        title: t('contact.success'),
        description: t('contact.successDesc'),
      });

      form.reset();
      // Restore defaults after reset, as reset clears everything
      // But actually, defaultValue only applies on mount/render. 
      // If we want to persist them after reset, we might need controlled inputs or just re-apply manually.
      // For now, let's keep it simple. The user just sent a message, empty form is fine. 
      // Or we can reload the page? No.
      // Let's manually set the values back if we want to keep them, but "reset" usually assumes blank slate.
      // However, usually "Your Name" and "Email" stay filled for logged in users.
      // Let's not overcomplicate, usually reset clears the message body which is what matters.
    } catch (error: any) {
      console.error("Contact Error:", error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('nav.contact')}</h1>
            <div className="section-divider mb-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold">{t('contact.getInTouch')}</h2>
              <p className="text-muted-foreground">{t('contact.desc')}</p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 card-elegant">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('contact.info.email')}</p>
                    <p className="font-medium">vnimbalkar79@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 card-elegant">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('contact.info.phone')}</p>
                    <p className="font-medium">+91 8010246840</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 card-elegant">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('contact.info.address')}</p>
                    <p className="font-medium">{t('contact.addressValue')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card-elegant p-6 md:p-8">
              <h2 className="font-serif text-2xl font-bold mb-6">{t('contact.sendMessage')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('contact.name')} *</Label>
                  {/* Using key to force re-render when defaultValues changes if needed, but defaultValue should update if state changes before mount? 
                      Actually with defaultValue, if it renders empty first, it won't update.
                      We should use key={defaultValues.name} or just use a controlled component?
                      Controlled is safer here to ensure it populates.
                  */}
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={defaultValues.name}
                    key={defaultValues.name ? 'loaded' : 'loading'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.email')} *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={defaultValues.email}
                    key={defaultValues.email ? 'loaded-email' : 'loading-email'}
                    readOnly={!!defaultValues.email}
                    className={defaultValues.email ? "bg-muted/50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t('contact.subject')} *</Label>
                  <Input id="subject" name="subject" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.message')} *</Label>
                  <Textarea id="message" name="message" rows={4} required />
                </div>
                <Button type="submit" className="w-full btn-gold" disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? t('contact.sending') : t('contact.submit')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
