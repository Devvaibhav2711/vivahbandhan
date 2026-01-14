import React from 'react';
import { Heart, Users, Shield, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('nav.about')}</h1>
            <div className="section-divider mb-8" />
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="card-elegant p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-3">{t('about.mission.title')}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.mission.desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elegant p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-3">{t('about.privacy.title')}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.privacy.desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elegant p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-3">{t('about.community.title')}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.community.desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elegant p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-3">{t('about.verified.title')}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.verified.desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
