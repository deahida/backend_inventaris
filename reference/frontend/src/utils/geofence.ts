/**
 * Geofence utility for Pro.com attendance system.
 *
 * Menggunakan rumus Haversine untuk menghitung jarak
 * antara lokasi user dan lokasi Pro.com.
 */

// ============================================================
// LOKASI TOKO PRO.COM
// ============================================================

export const STORE_LOCATION = {
  latitude: -6.802766454110481,
  longitude: 110.84381260861629,
  address:
    'Jl. Sunan Muria No. 27A, Glantengan, Kec. Kota Kudus, Kabupaten Kudus, Jawa Tengah 59313',
};

/**
 * Radius maksimum absensi.
 *
 * User dianggap berada di area absensi
 * jika jaraknya <= 200 meter dari lokasi toko.
 */
export const ATTENDANCE_RADIUS_METERS = 200;

// ============================================================
// EARTH
// ============================================================

const EARTH_RADIUS_METERS = 6_371_000;

// ============================================================
// HELPER
// ============================================================

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ============================================================
// HAVERSINE
// ============================================================

/**
 * Menghitung jarak antara dua koordinat GPS
 * dalam satuan meter.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return EARTH_RADIUS_METERS * c;
}

// ============================================================
// CHECK GEOFENCE
// ============================================================

/**
 * Mengecek apakah lokasi user berada
 * dalam radius absensi Pro.com.
 */
export function isWithinAttendanceRadius(
  userLat: number,
  userLon: number,
  radiusMeters: number = ATTENDANCE_RADIUS_METERS
): {
  distance: number;
  withinRadius: boolean;
} {
  const distance = calculateDistance(
    userLat,
    userLon,
    STORE_LOCATION.latitude,
    STORE_LOCATION.longitude
  );

  return {
    distance: Math.round(distance),
    withinRadius:
      distance <= radiusMeters,
  };
}

// ============================================================
// GET DISTANCE
// ============================================================

/**
 * Mendapatkan jarak user dari lokasi toko.
 */
export function getDistanceFromStore(
  userLat: number,
  userLon: number
): number {
  return Math.round(
    calculateDistance(
      userLat,
      userLon,
      STORE_LOCATION.latitude,
      STORE_LOCATION.longitude
    )
  );
}