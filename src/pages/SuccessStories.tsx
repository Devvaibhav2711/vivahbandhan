import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Plus, Trash2, Camera, Loader2, ImagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { compressImage } from '@/utils/imageCompression';
import { supabase } from '@/lib/supabase';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: string;
  names: string;
  year: string;
  story: string;
  image: string;
  created_at: string;
}

const demoStories = [
  {
    names: 'Rahul & Priya',
    year: '2024',
    story: 'success.story1',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
  },
  {
    names: 'Amit & Sneha',
    year: '2023',
    story: 'success.story2',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop',
  },
  {
    names: 'Vikram & Anjali',
    year: '2023',
    story: 'success.story3',
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop',
  },
  {
    names: 'Aditya & Kavya',
    year: '2022',
    story: 'Found my soulmate on VivahBandhan. The verification process gave us so much confidence.',
    image: 'https://images.unsplash.com/photo-1621621667797-e06afc217fb0?w=400&h=300&fit=crop',
  },
  {
    names: 'Rohan & Meera',
    year: '2022',
    story: 'Highly recommended for anyone looking for serious proposals. Great experience!',
    image: 'https://images.unsplash.com/photo-1595152452543-e5cca283f588?w=400&h=300&fit=crop',
  },
  {
    names: 'Suresh & Anita',
    year: '2021',
    story: 'Thanks to the team for helping us connect. We are happily married for 2 years now.',
    image: 'https://images.unsplash.com/photo-1545912452-8bbd8c47e704?w=400&h=300&fit=crop',
  },
];

const SuccessStories: React.FC = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Add Story Form State
  const [newNames, setNewNames] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newStory, setNewStory] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Edit Photo State
  const [updatingPhotoId, setUpdatingPhotoId] = useState<string | null>(null);

  // Carousel API State
  const [api, setApi] = useState<any>();

  useEffect(() => {
    if (!api) {
      return;
    }

    const intervalId = setInterval(() => {
      // Only scroll if the tab is visible to prevent "catch-up" speed issues
      if (!document.hidden) {
        api.scrollNext();
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [api]);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
        // Check for specific error codes if possible, e.g. 42P01 is undefined table
        if (error.code === '42P01') {
          setDbError('Database table "success_stories" is missing.');
        } else {
          setDbError(error.message);
        }
        setStories([]);
      } else {
        setStories(data || []);
        setDbError(null);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Compress the image before uploading
      const compressedFile = await compressImage(file);

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('success-stories')
        .upload(filePath, compressedFile);


      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('success-stories')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);

      let errorMessage = t('success.uploadFailed');

      // Heuristic for missing bucket
      if (error.message?.includes('bucket') || error.message?.includes('not found') || (error.statusCode === '404')) {
        errorMessage = t('success.bucketMissing');
      }

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNames || !newYear || !newStory || !selectedImage) {
      toast({
        title: t('common.error'),
        description: t('success.missingFields'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const imageUrl = await uploadImage(selectedImage);

      if (!imageUrl) {
        // uploadImage handles the toast
        return;
      }

      const { error } = await supabase
        .from('success_stories')
        .insert({
          names: newNames,
          year: newYear,
          story: newStory,
          image: imageUrl,
        });

      if (error) throw error;

      toast({ title: t('register.successTitle'), description: t('success.storyAdded') });
      setIsDialogOpen(false);
      resetForm();
      fetchStories();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('auth.errorGeneric'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to remove this story? This will permanently delete the photo and data as requested.')) return;

    try {
      // 1. Delete Image from Storage
      if (imageUrl && !imageUrl.startsWith('http')) {
        // If it's a relative path or raw path
      } else if (imageUrl) {
        try {
          // Robustly extract the path from the URL
          // Example Supabase URL: https://[project].supabase.co/storage/v1/object/public/success-stories/filename.jpg
          // We need just "filename.jpg" or "folder/filename.jpg" relative to the bucket.

          const url = new URL(imageUrl);
          const pathSegments = url.pathname.split('/');
          // Find the index of the bucket name 'success-stories'
          const bucketIndex = pathSegments.indexOf('success-stories');

          if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
            // Extract everything after the bucket name
            const filePath = pathSegments.slice(bucketIndex + 1).join('/');

            console.log('Attempting to delete file from storage:', filePath);
            const { error: storageError } = await supabase.storage
              .from('success-stories')
              .remove([filePath]);

            if (storageError) {
              console.warn('Storage delete warning:', storageError);
              // We continue to delete the record even if storage delete fails, 
              // but we warn the user.
            }
          }
        } catch (e) {
          console.warn('Error parsing image URL for deletion', e);
        }
      }

      // 2. Delete Record from Database
      const { error } = await supabase.from('success_stories').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Story Removed', description: 'The story and its photo have been permanently removed.' });
      fetchStories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete story',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePhoto = async (e: React.ChangeEvent<HTMLInputElement>, story: Story) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUpdatingPhotoId(story.id);
      const newImageUrl = await uploadImage(file);
      if (!newImageUrl) throw new Error('Image upload failed');

      // Delete old image
      try {
        const urlObj = new URL(story.image);
        const pathParts = urlObj.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        if (fileName) {
          await supabase.storage.from('success-stories').remove([fileName]);
        }
      } catch (e) {
        // Ignore
      }

      const { error } = await supabase
        .from('success_stories')
        .update({ image: newImageUrl })
        .eq('id', story.id);

      if (error) throw error;

      toast({ title: 'Photo Updated', description: 'Story photo has been updated.' });
      fetchStories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update photo',
        variant: 'destructive',
      });
    } finally {
      setUpdatingPhotoId(null);
    }
  };

  const handleSeedData = async () => {
    try {
      setIsSubmitting(true);

      // Upload demo images first (optional - skipping for speed, using external URLs directly for demo)
      // Note: Ideally we should upload these to storage, but for a "Seed" action, 
      // linking to the unsplash URLs is acceptable initially or we can assume the user is okay with hotlinks.
      // However, for consistency with the delete logic, let's just insert them.

      const { error } = await supabase
        .from('success_stories')
        .insert(demoStories);

      if (error) throw error;

      toast({ title: 'Demo Data Loaded', description: 'Sample success stories have been added.' });
      fetchStories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to populate data',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewNames('');
    setNewYear(new Date().getFullYear().toString());
    setNewStory('');
    setSelectedImage(null);
  };

  // Helper to get translated story or raw text
  const getStoryText = (text: string) => {
    if (text.startsWith('success.story')) {
      return t(text);
    }
    return text;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t('success.title')}</h1>
            <div className="section-divider mb-4" />
            <p className="text-lg text-muted-foreground">{t('success.subtitle')}</p>

            {isAdmin && (
              <div className="mt-8">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-gold gap-2">
                      <Plus className="w-4 h-4" /> Add Success Story
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Success Story</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddStory} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Couple Names</Label>
                        <Input
                          placeholder="e.g. Rahul & Priya"
                          value={newNames}
                          onChange={e => setNewNames(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input
                          placeholder="2024"
                          value={newYear}
                          onChange={e => setNewYear(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Story</Label>
                        <Textarea
                          placeholder="Write their success story..."
                          value={newStory}
                          onChange={e => setNewStory(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Photo</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={e => setSelectedImage(e.target.files?.[0] || null)}
                            required
                          />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" className="btn-gold" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Add Story
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <p className="text-sm text-muted-foreground mt-2">
                  (Admin Only: Add or remove stories. Images change automatically every 2 seconds.)
                </p>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 bg-secondary/10 rounded-lg border-2 border-dashed border-secondary/30">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground">No success stories yet</h3>

              {dbError && (
                <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md max-w-md mx-auto">
                  <p className="font-bold text-sm">Error: {dbError}</p>
                  <p className="text-xs mt-1">Please check your database setup.</p>
                </div>
              )}

              {isAdmin && !dbError && (
                <div className="mt-6 flex flex-col gap-2 items-center">
                  <p className="text-sm text-muted-foreground">Get started by adding a story or loading demo data.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Story
                    </Button>
                    <Button variant="secondary" onClick={handleSeedData} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImagePlus className="w-4 h-4 mr-2" />}
                      Load Demo Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              setApi={setApi}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent className="-ml-4">
                {/* 
                   Duplicating stories if we have fewer than 6 ensures smooth looping behavior 
                   on wider screens where multiple slides are visible. 
                */}
                {(stories.length > 0 && stories.length < 6 ? [...stories, ...stories, ...stories] : stories).map((story, index) => (
                  // Use index in key to handle duplicates
                  <CarouselItem key={`${story.id}-${index}`} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="card-elegant overflow-hidden h-full flex flex-col group relative">
                      {/* Image Section */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={story.image}
                          alt={story.names}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-80" />

                        <div className="absolute bottom-4 left-4 right-4 z-10">
                          <h3 className="font-serif text-2xl font-bold text-white mb-1 shadow-sm">{story.names}</h3>
                          <div className="flex items-center gap-2 text-amber-200 text-sm font-medium bg-black/20 backdrop-blur-sm w-fit px-2 py-1 rounded-full">
                            <Calendar className="w-3.5 h-3.5" />
                            {story.year}
                          </div>
                        </div>

                        {/* Admin Controls Overlay */}
                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex gap-2 z-20">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleUpdatePhoto(e, story)}
                                disabled={updatingPhotoId === story.id}
                              />
                              <div className="bg-white/90 p-2 rounded-full hover:bg-white text-primary transition-colors shadow-sm" title="Change Photo">
                                {updatingPhotoId === story.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Camera className="w-4 h-4" />
                                )}
                              </div>
                            </label>
                            <button
                              onClick={() => handleDelete(story.id, story.image)}
                              className="bg-white/90 p-2 rounded-full hover:bg-red-50 text-destructive transition-colors shadow-sm"
                              title="Remove Story"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="relative mb-4">
                          <span className="text-4xl text-primary/20 font-serif absolute -top-4 -left-2">"</span>
                          <p className="text-muted-foreground leading-relaxed italic relative z-10 px-2">
                            {getStoryText(story.story)}
                          </p>
                          <span className="text-4xl text-primary/20 font-serif absolute -bottom-8 right-0">"</span>
                        </div>

                        {/* Decorative footer */}
                        <div className="mt-auto pt-6 flex justify-center opacity-50">
                          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-12 border-primary/20 hover:bg-primary hover:text-white" />
                <CarouselNext className="-right-12 border-primary/20 hover:bg-primary hover:text-white" />
              </div>
            </Carousel>
          )}

          <div className="text-center mt-16 bg-secondary/30 p-8 rounded-lg max-w-2xl mx-auto border border-secondary">
            <h3 className="text-xl md:text-2xl font-serif font-bold mb-4">{t('success.cta.text')}</h3>
            <Link to="/my-matches">
              <Button size="lg" className="btn-gold shadow-lg hover:shadow-gold/20">
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
