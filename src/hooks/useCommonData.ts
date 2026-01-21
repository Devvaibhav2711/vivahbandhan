
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useProfileId = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('id, profile_photo')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Real-time subscription for profile updates
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`profile-updates-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    // Invalidate query to refetch
                    queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, queryClient]);

    return query;
};

export const usePublicProfilesSetting = () => {
    return useQuery({
        queryKey: ['app_settings', 'enable_public_profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'enable_public_profiles')
                .maybeSingle();

            if (error) throw error;
            return data?.value === 'true';
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
};
