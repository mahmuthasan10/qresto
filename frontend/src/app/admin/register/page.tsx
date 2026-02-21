'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Eye, EyeOff, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const registerSchema = z.object({
    name: z.string().min(2, 'Restoran adı en az 2 karakter olmalı').max(255),
    email: z.string().email('Geçerli bir email adresi girin'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
    confirmPassword: z.string().min(6, 'Şifre tekrarı en az 6 karakter olmalı'),
    phone: z.string().max(20).optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    latitude: z.number({ error: 'Enlem gerekli' }).min(-90).max(90),
    longitude: z.number({ error: 'Boylam gerekli' }).min(-180).max(180),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const { register: registerStore, isLoading } = useAuthStore();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            latitude: 0,
            longitude: 0,
        },
    });

    const getLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Tarayıcınız konum özelliğini desteklemiyor');
            return;
        }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setValue('latitude', parseFloat(position.coords.latitude.toFixed(6)));
                setValue('longitude', parseFloat(position.coords.longitude.toFixed(6)));
                setGettingLocation(false);
                toast.success('Konum alındı!');
            },
            (error) => {
                setGettingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error('Konum izni reddedildi');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error('Konum bilgisi alınamadı');
                        break;
                    default:
                        toast.error('Konum alınamadı');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const onSubmit = async (data: RegisterFormData) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword: _, ...registerData } = data;
        const success = await registerStore({
            ...registerData,
            phone: registerData.phone || undefined,
            address: registerData.address || undefined,
        });

        if (success) {
            toast.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
            router.push('/admin/dashboard');
        } else {
            const error = useAuthStore.getState().error;
            toast.error(error || 'Kayıt sırasında bir hata oluştu');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">QResto</span>
                    </Link>
                    <p className="text-gray-400 mt-4">Restoranınızı QResto&apos;ya kaydedin</p>
                </div>

                {/* Register Form */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input
                            label="Restoran Adı *"
                            placeholder="Örnek: Lezzet Durağı"
                            error={errors.name?.message}
                            {...register('name')}
                        />

                        <Input
                            label="Email *"
                            type="email"
                            placeholder="ornek@restoran.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    label="Şifre *"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    error={errors.password?.message}
                                    {...register('password')}
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
                                label="Şifre Tekrar *"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword')}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Telefon"
                                placeholder="0555 555 55 55"
                                error={errors.phone?.message}
                                {...register('phone')}
                            />
                            <Input
                                label="Adres"
                                placeholder="Mahalle, Cadde No"
                                error={errors.address?.message}
                                {...register('address')}
                            />
                        </div>

                        {/* Konum */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-300">
                                    Restoran Konumu *
                                </label>
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    disabled={gettingLocation}
                                    className="inline-flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 disabled:opacity-50"
                                >
                                    <MapPin className="w-4 h-4" />
                                    {gettingLocation ? 'Alınıyor...' : 'Konumumu Kullan'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Enlem"
                                    type="number"
                                    step="any"
                                    placeholder="39.925533"
                                    error={errors.latitude?.message}
                                    {...register('latitude', { valueAsNumber: true })}
                                />
                                <Input
                                    label="Boylam"
                                    type="number"
                                    step="any"
                                    placeholder="32.866287"
                                    error={errors.longitude?.message}
                                    {...register('longitude', { valueAsNumber: true })}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Müşterilerinizin restoranda olup olmadığını doğrulamak için kullanılır (50m yarıçap).
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Ücretsiz Kaydol
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Zaten hesabınız var mı?{' '}
                            <Link href="/admin/login" className="text-orange-400 hover:text-orange-300 font-medium">
                                Giriş yapın
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Alt bilgi */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    Kaydolarak{' '}
                    <Link href="/terms" className="text-gray-400 hover:text-gray-300 underline">Kullanım Koşulları</Link>
                    {' '}ve{' '}
                    <Link href="/privacy" className="text-gray-400 hover:text-gray-300 underline">Gizlilik Politikası</Link>
                    &apos;nı kabul etmiş olursunuz.
                </p>
            </div>
        </div>
    );
}
