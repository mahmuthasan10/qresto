/**
 * Haversine formula ile iki GPS koordinatı arasındaki mesafeyi hesaplar (metre cinsinden).
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Lokasyon doğrulaması yapar. Müşteri konumu ile restoran konumu arasındaki
 * mesafeyi hesaplar ve izin verilen yarıçap içinde olup olmadığını döndürür.
 *
 * @param {number} customerLat - Müşteri enlemi
 * @param {number} customerLon - Müşteri boylamı
 * @param {number} restaurantLat - Restoran enlemi
 * @param {number} restaurantLon - Restoran boylamı
 * @param {number} baseRadius - Restoranın ayarladığı yarıçap (metre)
 * @param {number} accuracy - Cihazdan gelen GPS doğruluk değeri (metre)
 * @returns {{ distance: number, effectiveRadius: number, isWithinRange: boolean }}
 */
const verifyLocationDistance = (customerLat, customerLon, restaurantLat, restaurantLon, baseRadius, accuracy) => {
    const distance = calculateDistance(
        parseFloat(customerLat),
        parseFloat(customerLon),
        parseFloat(restaurantLat),
        parseFloat(restaurantLon)
    );

    // accuracy toleransı: sunucu tarafında max 100m ile sınırlı
    const accuracyTolerance = Math.min(Number(accuracy) || 50, 100);
    const effectiveRadius = (Number(baseRadius) || 50) + accuracyTolerance;

    return {
        distance,
        effectiveRadius,
        isWithinRange: distance <= effectiveRadius
    };
};

module.exports = { calculateDistance, verifyLocationDistance };
