import React, { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface Story {
    id: string;
    names: string;
    year: string;
    story: string;
    image: string;
    created_at: string;
}

const SuccessStoriesCarousel: React.FC = () => {
    const { t } = useLanguage();
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // Removed manual api state and useEffect

    useEffect(() => {
        fetchStories();
    }, []);

    // ... (fetchStories function)

    // ... (getStoryText function)

    // ... (loading and empty state checks)

    return (
        <Carousel
            opts={{
                align: 'start',
                loop: true,
            }}
            plugins={[
                Autoplay({
                    delay: 2000,
                    stopOnMouseEnter: true, // Stops on hover
                    stopOnInteraction: false,
                }),
            ]}
            className="w-full max-w-6xl mx-auto"
        >
            <CarouselContent className="-ml-4">
                {/* ... (rest of the component) */}
                {(stories.length > 0 && stories.length < 6 ? [...stories, ...stories, ...stories] : stories).map((story, index) => (
                    // Use index in key to handle duplicates
                    <CarouselItem key={`${story.id}-${index}`} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        {/* ... (card content) */}
                        <div className="card-elegant overflow-hidden h-full flex flex-col group relative">
                            {/* ... (image and content) */}
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
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="relative mb-4">
                                    <span className="text-4xl text-primary/20 font-serif absolute -top-4 -left-2">"</span>
                                    <p className="text-muted-foreground leading-relaxed italic relative z-10 px-2 line-clamp-4">
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
    );
};

export default SuccessStoriesCarousel;
