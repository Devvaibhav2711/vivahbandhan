// Layout removed
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const PaymentInfo = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <>
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">

                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Shield className="w-10 h-10 text-amber-600" />
                </div>

                <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                    {t('payment.title')}
                </h1>

                <p className="text-lg text-muted-foreground max-w-xl mb-8">
                    {t('payment.desc').split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                </p>

                <div className="bg-white p-8 rounded-2xl shadow-lg border border-secondary/20 max-w-lg w-full mb-8">
                    <h2 className="text-xl font-bold mb-6 text-primary border-b border-border pb-2">{t('payment.howTo')}</h2>

                    <div className="space-y-6 text-left">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-full mt-1">
                                <Phone className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('payment.step1.title')}</h3>
                                <p className="text-sm text-gray-600">{t('payment.step1.desc')}</p>
                                <div className="mt-3 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <p className="font-medium text-gray-800 flex flex-col gap-1">
                                        <span>📞 Call: <span className="font-bold">8010246840</span></span>
                                        <span className="text-green-600 font-bold">WhatsApp: 8432246840</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-amber-100 p-2 rounded-full mt-1">
                                <Shield className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('payment.step2.title')}</h3>
                                <p className="text-sm text-gray-600">{t('payment.step2.desc')}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-2 rounded-full mt-1">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('payment.step3.title')}</h3>
                                <p className="text-sm text-gray-600">{t('payment.step3.desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <Button variant="outline" onClick={() => navigate(-1)} className="w-full md:w-auto">
                        {t('payment.goBack')}
                    </Button>
                    <Button className="btn-gold w-full md:w-auto" onClick={() => navigate('/contact')}>
                        {t('payment.contactNow')}
                    </Button>
                </div>

            </div>
        </>
    );
};

export default PaymentInfo;
