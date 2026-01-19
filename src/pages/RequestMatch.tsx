import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Layout removed
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const RequestMatch: React.FC = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [hasMatches, setHasMatches] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<string>('free'); // Default free
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);
  const [showSubmittedData, setShowSubmittedData] = useState(false);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ageMin: '',
    ageMax: '',
    heightMin: '',
    heightMax: '',
    educationPref: '',
    locationPref: '',
    additionalReq: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast({ title: t('common.required'), description: t('auth.loginToRequest') });
      navigate('/login');
      return;
    }

    const checkStatus = async () => {
      try {
        // 1. Check Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, subscription_type')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.subscription_type) {
          setSubscriptionType(profile.subscription_type);
        }

        if (!profile) {
          toast({ title: t('profile.required'), description: t('profile.requiredDesc') });
          navigate('/register');
          return;
        }

        // 2. Check Requests
        const { data: reqs } = await supabase
          .from('match_requests')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);

        const requestExists = reqs && reqs.length > 0;
        if (requestExists) {
          setSubmittedRequest(reqs[0]);
          setHasPendingRequest(true);
        }

        // 3. Check Matches
        const { count } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setHasMatches((count || 0) > 0);

      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    checkStatus();
  }, [user, authLoading, navigate, t, toast]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) throw new Error('You must be logged in');

      // Paywall Check
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'enable_payment_wall')
        .maybeSingle();

      const isPaywallEnabled = settings?.value === 'true';

      if (isPaywallEnabled && subscriptionType !== 'premium') {
        toast({ title: t('payment.alert.title'), description: t('payment.alert.desc') });
        navigate('/payment-info');
        return;
      }

      let error;

      if (submittedRequest) {
        if (!window.confirm(t('match.confirmUpdate') || 'You already have a pending request. Do you want to update it?')) {
          setIsSubmitting(false);
          return;
        }

        const { error: updateError } = await supabase
          .from('match_requests')
          .update({
            age_min: formData.ageMin,
            age_max: formData.ageMax,
            height_min: formData.heightMin,
            height_max: formData.heightMax,
            education_pref: formData.educationPref,
            location_pref: formData.locationPref,
            additional_req: formData.additionalReq,
            status: 'pending', // Reset status on update
            updated_at: new Date().toISOString()
          })
          .eq('id', submittedRequest.id);

        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('match_requests')
          .insert({
            user_id: user.id,
            age_min: formData.ageMin,
            age_max: formData.ageMax,
            height_min: formData.heightMin,
            height_max: formData.heightMax,
            education_pref: formData.educationPref,
            location_pref: formData.locationPref,
            additional_req: formData.additionalReq,
            status: 'pending'
          });
        error = insertError;
      }

      if (error) throw error;

      toast({ title: t('match.success.title') || 'Request Sent!', description: t('match.success.desc') || 'Your match request has been submitted successfully.' });

      // Refresh local state
      const { data: updatedReq } = await supabase.from('match_requests').select('*').eq('user_id', user.id).maybeSingle();
      if (updatedReq) {
        setSubmittedRequest(updatedReq);
      }

      setHasPendingRequest(true);
      // navigate('/dashboard'); // DONT Redirect, show status here or allow them to go to dashboard.
      // User asked for specific message "you have submitted...".
      // I'll reload state or just setPending.
    } catch (error: any) {
      console.error('Error request match:', error);
      toast({ title: 'Error', description: error.message || 'Failed to submit request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData || authLoading) {
    return (
      <>
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading status...</p>
        </div>
      </>
    );
  }

  // View: Matches Found
  if (hasMatches) {
    return (
      <>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="card-elegant p-10">
              <h2 className="text-3xl font-serif font-bold mb-4 text-primary">{t('match.status.found.title')}</h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('match.status.found.desc')}
              </p>
              <Button asChild size="lg" className="btn-gold">
                <a href="/my-matches">{t('common.viewMatches')}</a>
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // View: Request Pending
  if (hasPendingRequest) {
    return (
      <>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="card-elegant p-10 bg-secondary/10">
              <h2 className="text-2xl font-serif font-bold mb-4">{t('match.status.submitted.title')}</h2>
              <div className="w-16 h-1 w-full bg-primary/20 mx-auto rounded mb-6 max-w-[100px]" />
              <p className="text-lg text-muted-foreground mb-8">
                {t('match.status.submitted.desc')}
              </p>

              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <Button variant="outline" onClick={() => setShowSubmittedData(!showSubmittedData)}>
                  {showSubmittedData ? t('match.hideSubmitted') : t('match.viewSubmitted')}
                </Button>

                {showSubmittedData && submittedRequest && (
                  <div className="text-left bg-white p-4 rounded-lg border border-border shadow-sm text-sm space-y-2 animate-in fade-in slide-in-from-top-2">
                    <p><span className="font-semibold">{t('match.label.age')}:</span> {submittedRequest.age_min} {submittedRequest.age_max ? `- ${submittedRequest.age_max}` : ''} {t('common.years')}</p>
                    <p><span className="font-semibold">{t('match.label.height')}:</span> {submittedRequest.height_min} {submittedRequest.height_max ? `- ${submittedRequest.height_max}` : ''} {t('common.ft')}</p>
                    <p><span className="font-semibold">{t('match.label.education')}:</span> {submittedRequest.education_pref}</p>
                    <p><span className="font-semibold">{t('match.label.location')}:</span> {submittedRequest.location_pref}</p>
                    {submittedRequest.additional_req && (
                      <p><span className="font-semibold">{t('match.label.note')}:</span> {submittedRequest.additional_req}</p>
                    )}
                  </div>
                )}

                <Button className="btn-gold" onClick={() => {
                  setHasPendingRequest(false);
                  setSubmittedRequest(null);
                  setShowSubmittedData(false);
                  // Optionally clear form data here if needed, or keep it for easy re-submission
                }}>
                  {t('match.sendNewRequest')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{t('match.title')}</h1>
              <div className="section-divider mb-4" />
              <p className="text-muted-foreground">{t('match.description')}</p>
            </div>

            <div className="card-elegant p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="font-serif text-xl font-bold border-b border-border pb-2">{t('match.preferences')}</h2>

                <div className="space-y-2">
                  <Label>{t('match.ageRange')} <span className="text-red-500 ml-1">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min="18" max="80" value={formData.ageMin} onChange={(e) => handleChange('ageMin', e.target.value)} />
                    <span className="text-muted-foreground">{t('common.to')}</span>
                    <Input type="number" min="18" max="80" value={formData.ageMax} onChange={(e) => handleChange('ageMax', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('match.heightRange')} <span className="text-red-500 ml-1">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Input value={formData.heightMin} onChange={(e) => handleChange('heightMin', e.target.value)} />
                    <span className="text-muted-foreground">{t('common.to')}</span>
                    <Input value={formData.heightMax} onChange={(e) => handleChange('heightMax', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="educationPref">{t('match.educationPref')} <span className="text-red-500 ml-1">*</span></Label>
                  <Input id="educationPref" required value={formData.educationPref} onChange={(e) => handleChange('educationPref', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationPref">{t('match.locationPref')} <span className="text-red-500 ml-1">*</span></Label>
                  <Input id="locationPref" required value={formData.locationPref} onChange={(e) => handleChange('locationPref', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalReq">{t('match.additionalReq')}</Label>
                  <Textarea id="additionalReq" rows={4} value={formData.additionalReq} onChange={(e) => handleChange('additionalReq', e.target.value)} />
                </div>

                <Button type="submit" className="w-full btn-gold" disabled={isSubmitting}>
                  {isSubmitting ? t('common.loading') : t('match.sendRequest')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RequestMatch;
