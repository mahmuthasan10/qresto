'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { publicApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
    confirmPassword: z.string().min(6, 'Şifre tekrarı en az 6 karakter olmalı'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    // No token = invalid link
    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Geçersiz Bağlantı</h2>
                <p className="text-gray-400 text-sm">
                    Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.
                </p>
                <div className="pt-4">
                    <Link href="/admin/forgot-password">
                        <Button variant="primary" className="w-full">
                            Yeni Bağlantı İste
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        try {
            await publicApi.post('/auth/reset-password', {
                token,
                newPassword: data.newPassword,
            });
            setIsSuccess(true);
            toast.success('Şifreniz başarıyla değiştirildi!');
            // Redirect to login after 3 seconds
            setTimeout(() => router.push('/admin/login'), 3000);
        } catch (err: any) {
            const message = err.response?.data?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Şifre Değiştirildi</h2>
                <p className="text-gray-400 text-sm">
                    Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
                </p>
                <div className="pt-4">
                    <Link href="/admin/login">
                        <Button variant="primary" className="w-full">
                            Giriş Yap
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Yeni Şifre Belirle</h2>
                <p className="text-gray-400 text-sm mt-2">
                    Yeni şifrenizi girin. En az 6 karakter olmalıdır.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="relative">
                    <Input
                        label="Yeni Şifre"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        error={errors.newPassword?.message}
                        {...register('newPassword')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                <Input
                    label="Şifre Tekrar"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                >
                    Şifreyi Değiştir
                </Button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
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
                    <Suspense fallback={
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-gray-400 mt-4 text-sm">Yükleniyor...</p>
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
