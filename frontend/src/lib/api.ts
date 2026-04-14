import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/admin/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// Public API (no auth) — müşteri istekleri için
export const publicApi = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: cart session token'ı her isteğe ekle
publicApi.interceptors.request.use(
    (config) => {
        try {
            const cartRaw = localStorage.getItem('cart-storage');
            if (cartRaw) {
                const cartData = JSON.parse(cartRaw) as { state?: { sessionToken?: string } };
                const token = cartData?.state?.sessionToken;
                if (token) {
                    config.headers['x-session-token'] = token;
                }
            }
        } catch {
            // localStorage erişim hatası — sessizce geç
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: backend session uzattıysa localStorage'ı güncelle
publicApi.interceptors.response.use(
    (response) => {
        const newExpiry = response.headers['x-session-expires-at'];
        if (newExpiry) {
            try {
                const cartRaw = localStorage.getItem('cart-storage');
                if (cartRaw) {
                    const cartData = JSON.parse(cartRaw) as { state?: { expiresAt?: string } };
                    if (cartData?.state) {
                        cartData.state.expiresAt = newExpiry;
                        localStorage.setItem('cart-storage', JSON.stringify(cartData));
                    }
                }
            } catch {
                // Güncelleme hatası kritik değil
            }
        }
        return response;
    },
    (error) => Promise.reject(error)
);
