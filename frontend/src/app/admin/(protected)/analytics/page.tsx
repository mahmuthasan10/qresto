'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui';
import {
    ClipboardList,
    DollarSign,
    TrendingUp,
    Users,
    ShoppingBag,
    XCircle,
    CheckCircle,
    BarChart3
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

type Period = 7 | 30;

interface Summary {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    activeTables: number;
    cancelledOrders: number;
    completionRate: number;
}

interface DailyData {
    date: string;
    orders: number;
    revenue: number;
}

interface TopItem {
    rank: number;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
}

interface StatusItem {
    status: string;
    label: string;
    count: number;
    color: string;
}

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<Period>(7);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [dailyTrend, setDailyTrend] = useState<DailyData[]>([]);
    const [topItems, setTopItems] = useState<TopItem[]>([]);
    const [statusDist, setStatusDist] = useState<StatusItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        const endpoints = [
            { label: 'summary',   url: `/analytics/summary?period=${period}` },
            { label: 'daily',     url: `/analytics/daily?period=${period}` },
            { label: 'top-items', url: `/analytics/top-items?period=${period}&limit=5` },
            { label: 'status',    url: `/analytics/status-distribution?period=${period}` },
        ];

        try {
            setIsLoading(true);
            const results = await Promise.allSettled(
                endpoints.map(ep => api.get(ep.url))
            );

            if (results[0].status === 'fulfilled') setSummary(results[0].value.data.summary);
            if (results[1].status === 'fulfilled') setDailyTrend(results[1].value.data.dailyTrend);
            if (results[2].status === 'fulfilled') setTopItems(results[2].value.data.topItems);
            if (results[3].status === 'fulfilled') setStatusDist(results[3].value.data.statusDistribution);

            // Detaylı hata logları: hangi endpoint, hangi URL, HTTP kodu ve mesaj
            const failures = results
                .map((r, i) => ({ result: r, ...endpoints[i] }))
                .filter(r => r.result.status === 'rejected');

            if (failures.length > 0) {
                failures.forEach(({ label, url, result }) => {
                    const reason = (result as PromiseRejectedResult).reason;
                    const status = reason?.response?.status ?? 'N/A';
                    const serverMsg = reason?.response?.data?.error ?? reason?.message ?? 'Unknown';
                    console.error(
                        `[Analytics] "${label}" FAILED | URL: ${url} | HTTP ${status} | ${serverMsg}`
                    );
                });
                if (failures.length === results.length) {
                    toast.error('Analitik verileri yüklenirken hata oluştu');
                }
            }
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.error('[Analytics] Unexpected error during fetch:', err?.message ?? error);
            toast.error('Analitik verileri yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatShortDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-52 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Toplam Sipariş',
            value: summary?.totalOrders || 0,
            icon: ClipboardList,
            color: 'orange',
            subtitle: `${summary?.cancelledOrders || 0} iptal`
        },
        {
            title: 'Toplam Gelir',
            value: formatCurrency(summary?.totalRevenue || 0),
            icon: DollarSign,
            color: 'green',
            subtitle: `%${summary?.completionRate || 0} tamamlanma`
        },
        {
            title: 'Ort. Sipariş Tutarı',
            value: formatCurrency(summary?.averageOrderValue || 0),
            icon: TrendingUp,
            color: 'purple',
            subtitle: 'sipariş başına'
        },
        {
            title: 'Aktif Masa',
            value: summary?.activeTables || 0,
            icon: Users,
            color: 'blue',
            subtitle: 'şu an'
        },
    ];

    const colorClasses: Record<string, string> = {
        orange: 'bg-orange-100 text-orange-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    // Chart data with formatted dates
    const chartData = dailyTrend.map(d => ({
        ...d,
        label: formatShortDate(d.date)
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-7 h-7 text-orange-500" />
                    <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
                </div>

                {/* Period Selector */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setPeriod(7)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === 7
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Son 7 Gün
                    </button>
                    <button
                        onClick={() => setPeriod(30)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === 30
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Son 30 Gün
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} variant="stat">
                            <CardBody className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[stat.color]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xl font-bold text-gray-900 truncate">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                    <p className="text-xs text-gray-400">{stat.subtitle}</p>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Orders Bar Chart */}
                <Card>
                    <CardHeader>
                        <h2 className="font-semibold text-gray-900">Günlük Siparişler</h2>
                    </CardHeader>
                    <CardBody>
                        {chartData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-400">
                                <p>Bu dönemde sipariş verisi yok</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        formatter={(value) => [Number(value), 'Sipariş']}
                                        labelFormatter={(label) => String(label)}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="orders"
                                        fill="#f97316"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardBody>
                </Card>

                {/* Daily Revenue Bar Chart */}
                <Card>
                    <CardHeader>
                        <h2 className="font-semibold text-gray-900">Günlük Gelir</h2>
                    </CardHeader>
                    <CardBody>
                        {chartData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-400">
                                <p>Bu dönemde gelir verisi yok</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `₺${v}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [formatCurrency(Number(value)), 'Gelir']}
                                        labelFormatter={(label) => String(label)}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Bottom Row: Top Items + Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Items */}
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">En Çok Satan Ürünler</h2>
                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </CardHeader>
                    <CardBody className="p-0">
                        {topItems.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p>Bu dönemde satış verisi yok</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {topItems.map((item) => (
                                    <div key={item.rank} className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${item.rank <= 3
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {item.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.totalQuantity} adet satıldı</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-semibold text-gray-900">{formatCurrency(item.totalRevenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Status Distribution Pie Chart */}
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Sipariş Durum Dağılımı</h2>
                        <CheckCircle className="w-5 h-5 text-gray-400" />
                    </CardHeader>
                    <CardBody>
                        {statusDist.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <XCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p>Bu dönemde sipariş verisi yok</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={statusDist}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="count"
                                        nameKey="label"
                                    >
                                        {statusDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [
                                            `${Number(value)} sipariş`,
                                            String(name)
                                        ]}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        formatter={(value) => (
                                            <span className="text-sm text-gray-600">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
