import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
// Layout removed

const Terms: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-4 text-center">{t('terms.title')}</h1>
            <div className="section-divider mb-8" />

            <div className="card-elegant p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('terms.serviceNature.title')}</h2>
                <p className="text-muted-foreground">{t('terms.serviceNature.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('terms.profileReg.title')}</h2>
                <p className="text-muted-foreground">{t('terms.profileReg.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('terms.infoSharing.title')}</h2>
                <p className="text-muted-foreground">{t('terms.infoSharing.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('terms.adminRights.title')}</h2>
                <p className="text-muted-foreground">{t('terms.adminRights.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('terms.fees.title')}</h2>
                <p className="text-muted-foreground">{t('terms.fees.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('terms.userResp.title')}</h2>
                <p className="text-muted-foreground">{t('terms.userResp.desc')}</p>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold mb-2">{t('terms.accountClosure.title')}</h2>
                <p className="text-muted-foreground">{t('terms.accountClosure.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Terms;
