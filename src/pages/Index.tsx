import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, UserCheck, Heart, Users, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';

const Index: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileId(null);
      return;
    }
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
      if (data) setProfileId(data.id);
    };
    fetchProfile();
  }, [user]);

  const whyChooseUs = [
    { icon: Shield, text: t('why.privacy') },
    { icon: Eye, text: t('why.noBrowsing') },
    { icon: UserCheck, text: t('why.verified') },
    { icon: Users, text: t('why.trusted') },
    { icon: Heart, text: t('why.personal') },
  ];

  const steps = [
    t('how.step1'),
    t('how.step2'),
    t('how.step3'),
    t('how.step4'),
    t('how.step5'),
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-12 md:py-32 overflow-hidden">
        <div className="absolute inset-0 maroon-gradient opacity-95" />
        <div className="absolute inset-0 pattern-mandala opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in leading-tight whitespace-pre-line">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-2xl font-medium mb-6 gold-text">
              {t('hero.subtitle')}
            </p>
            <p className="text-base md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-gold text-lg px-8">
                {user ? (
                  <Link to={profileId ? `/profile/edit/${profileId}` : '/register'}>
                    {profileId ? t('hero.myProfile') : t('hero.submitProfile')}
                  </Link>
                ) : (
                  <Link to="/register">{t('hero.submitProfile')}</Link>
                )}
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg px-8">
                <Link to="/request-match">{t('hero.requestMatch')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">{t('why.title')}</h2>
          <div className="section-divider mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="card-elegant p-6 text-center hover:scale-105 transition-transform">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full gold-gradient flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="font-medium text-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-4">{t('how.title')}</h2>
          <div className="section-divider mb-12" />
          <div className="max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 mb-6 last:mb-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold">{index + 1}</span>
                </div>
                <div className="card-elegant p-4 flex-1">
                  <p className="font-medium">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Promise */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center card-elegant p-8 md:p-12">
            <Shield className="w-16 h-16 mx-auto mb-6 text-accent" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">{t('privacy.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('privacy.description')}</p>
          </div>
        </div>
      </section>

      {/* Success Stories CTA */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-primary fill-current" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">{t('success.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t('success.subtitle')}</p>
          <Button asChild size="lg" className="btn-gold">
            <Link to="/success-stories">{t('success.viewAll')}</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
