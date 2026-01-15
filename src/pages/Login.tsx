import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast({ title: t('auth.welcome'), description: t('auth.loginSuccess') });
      navigate('/my-matches');
    } else {
      let errorMessage = result.error || t('auth.errorGeneric');
      if (errorMessage === 'Invalid login credentials') {
        errorMessage = t('auth.invalidCredentials');
      }
      toast({ title: t('auth.loginFailed'), description: errorMessage, variant: 'destructive' });
    }

    setIsLoading(false);
  };

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{t('auth.login')}</h1>
              <div className="section-divider mb-4" />
              <div className="space-y-2 mt-4">
                <p className="text-lg font-medium text-primary">{t('auth.loginMessage1')}</p>
                <p className="text-sm text-muted-foreground">{t('auth.loginMessage2')}</p>
              </div>
            </div>

            <div className="card-elegant p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                <Button type="submit" className="w-full btn-gold" disabled={isLoading}>
                  {isLoading ? t('common.loading') : t('auth.login')}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  {t('auth.noAccount')}{' '}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    {t('auth.register')}
                  </Link>
                </p>
              </div>


            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
