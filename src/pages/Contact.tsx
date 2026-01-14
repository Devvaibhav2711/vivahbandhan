import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to send a message.' });
      navigate('/login');
    }
  }, [user, authLoading, navigate, toast]);

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
    } catch (error: any) {
      console.error("Contact Error:", error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
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
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.email')} *</Label>
                  <Input id="email" name="email" type="email" required />
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
    </Layout>
  );
};

export default Contact;
