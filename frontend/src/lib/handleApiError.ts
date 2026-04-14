import { AxiosError } from 'axios';

/**
 * API hatalarını tutarlı bir şekilde işler.
 * Axios hata response'undan mesajı çıkarır, yoksa fallback mesajı döndürür.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Bir hata oluştu'): string {
    if (error instanceof AxiosError) {
        return error.response?.data?.error || fallback;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return fallback;
}
