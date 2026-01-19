import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
// Layout removed

const Privacy: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-4 text-center">{t('privacy.title')}</h1>
            <div className="section-divider mb-8" />

            <div className="card-elegant p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('privacy.dataCollection.title')}</h2>
                <p className="text-muted-foreground">{t('privacy.dataCollection.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('privacy.dataUsage.title')}</h2>
                <p className="text-muted-foreground">{t('privacy.dataUsage.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('privacy.visibility.title')}</h2>
                <p className="text-muted-foreground">{t('privacy.visibility.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('privacy.security.title')}</h2>
                <p className="text-muted-foreground">{t('privacy.security.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('privacy.system.title')}</h2>
                <p className="text-muted-foreground">{t('privacy.system.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('privacy.deletion.title')}</h2>
                <p className="text-muted-foreground">{t('privacy.deletion.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Privacy;
