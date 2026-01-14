
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Lock, ArrowLeft } from 'lucide-react';

const UpdatePassword = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if we have an active session (which happens after clicking email link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const hash = window.location.hash;
            // If there's an access token in the URL, we should wait for Supabase to process it
            // instead of redirecting immediately
            const hasAccessToken = hash.includes('access_token');

            if (!session && !hasAccessToken) {
                // If no session and no incoming token, they might have lost the link context
                toast({
                    title: "Session Expired",
                    description: "Please request a new password reset link.",
                    variant: "destructive",
                });
                navigate('/forgot-password');
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                // If they sign out (or token is invalid), redirect
                navigate('/forgot-password');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast({
                title: "Success",
                description: t('updatePassword.success'),
            });

            // Redirect to login or dashboard
            navigate('/login');
        } catch (error: any) {
            console.error('Update password error:', error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
                <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl -z-10 shadow-2xl border border-white/50" />

                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-serif font-bold text-gray-900 tracking-tight">
                            {t('updatePassword.title')}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {t('updatePassword.subtitle')}
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="group relative">
                                <Label htmlFor="password" className="text-gray-700 font-medium ml-1">
                                    {t('updatePassword.newPassword')}
                                </Label>
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 btn-gold text-white shadow-lg hover:shadow-xl transition-all rounded-xl text-lg font-medium"
                            >
                                {isLoading ? 'Updating...' : t('updatePassword.submitBtn')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default UpdatePassword;
