'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QrCode, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { publicApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const forgotPasswordSchema = z.object({
    email: z.string().email('Geçerli bir email adresi girin'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await publicApi.post('/auth/forgot-password', { email: data.email });
            setIsSubmitted(true);
            toast.success('Şifre sıfırlama bağlantısı gönderildi');
        } catch {
            toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">QResto</span>
                    </Link>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8">
                    {isSubmitted ? (
                        /* Success State */
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Email Gönderildi</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Eğer bu email adresi sistemde kayıtlıysa, şifre sıfırlama
                                bağlantısı gönderilmiştir. Lütfen gelen kutunuzu kontrol edin.
                            </p>
                            <p className="text-gray-500 text-xs">
                                Email gelmediyse spam klasörünü de kontrol edin.
                            </p>
                            <div className="pt-4 space-y-3">
                                <Link href="/admin/login">
                                    <Button variant="primary" className="w-full">
                                        Giriş Sayfasına Dön
                                    </Button>
                                </Link>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    Farklı email ile dene
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-7 h-7 text-orange-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Şifremi Unuttum</h2>
                                <p className="text-gray-400 text-sm mt-2">
                                    Kayıtlı email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="ornek@restoran.com"
                                    error={errors.email?.message}
                                    {...register('email')}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    isLoading={isLoading}
                                >
                                    Sıfırlama Bağlantısı Gönder
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    href="/admin/login"
                                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Giriş sayfasına dön
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
