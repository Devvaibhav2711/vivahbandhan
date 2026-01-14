
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            setIsSuccess(true);
            toast({
                title: "Email Sent",
                description: t('forgotPassword.success'),
            });
        } catch (error: any) {
            console.error('Reset password error:', error);
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
                            {t('forgotPassword.title')}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {t('forgotPassword.subtitle')}
                        </p>
                    </div>

                    {!isSuccess ? (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="group relative">
                                    <Label htmlFor="email" className="text-gray-700 font-medium ml-1">
                                        {t('forgotPassword.emailLabel')}
                                    </Label>
                                    <div className="relative mt-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
                                            placeholder="name@example.com"
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
                                    {isLoading ? 'Sending...' : t('forgotPassword.submitBtn')}
                                </Button>
                            </div>

                            <div className="text-center">
                                <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> {t('forgotPassword.backToLogin')}
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-8 space-y-6 text-center">
                            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                <Mail className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <p className="text-green-800 font-medium">{t('forgotPassword.success')}</p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl"
                                onClick={() => navigate('/login')}
                            >
                                {t('forgotPassword.backToLogin')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ForgotPassword;
