import React from 'react';
import { Heart, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const demoStories = [
  {
    id: 1,
    names: 'Rahul & Priya',
    year: '2024',
    story: 'success.story1',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    names: 'Amit & Sneha',
    year: '2023',
    story: 'success.story2',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    names: 'Vikram & Anjali',
    year: '2023',
    story: 'success.story3',
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop',
  },
];

const SuccessStories: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('success.title')}</h1>
            <div className="section-divider mb-4" />
            <p className="text-lg text-muted-foreground">{t('success.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {demoStories.map((story) => (
              <div key={story.id} className="card-elegant overflow-hidden">
                <div className="relative h-48">
                  <img src={story.image} alt={story.names} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif text-xl font-bold text-primary-foreground">{story.names}</h3>
                    <div className="flex items-center gap-1 text-accent text-sm">
                      <Calendar className="w-4 h-4" />
                      {story.year}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground leading-relaxed">{t(story.story)}</p>
                  <div className="flex justify-center mt-4">
                    <Heart className="w-5 h-5 text-primary fill-current" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 bg-secondary/30 p-8 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-xl md:text-2xl font-serif font-bold mb-4">{t('success.cta.text')}</h3>
            <Link to="/my-matches">
              <Button size="lg" className="btn-gold">
                {t('success.cta.button')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SuccessStories;
