import { MemberLocation } from '../types';

export interface GeolocationResult {
  location: MemberLocation | null;
  error?: string;
  isPermissionDenied?: boolean;
}

export interface VenuePreset {
  name: string;
  lat: number;
  lng: number;
  city: string;
}

export const VENUE_PRESETS: VenuePreset[] = [
  {
    name: 'Pusat Konvensyen Kuala Lumpur (KLCC) - Dewan Perdana',
    lat: 3.1531,
    lng: 101.7144,
    city: 'Kuala Lumpur',
  },
  {
    name: 'Pusat Dagangan Dunia Kuala Lumpur (WTCKL) - Dewan Merdeka',
    lat: 3.1698,
    lng: 101.6917,
    city: 'Kuala Lumpur',
  },
  {
    name: 'Pusat Konvensyen Antarabangsa Putrajaya (PICC)',
    lat: 2.8941,
    lng: 101.6775,
    city: 'Putrajaya',
  },
  {
    name: 'Pusat Perdagangan & Pameran Antarabangsa Malaysia (MITEC)',
    lat: 3.1783,
    lng: 101.6669,
    city: 'Kuala Lumpur',
  },
  {
    name: 'Setia SPICE Convention Centre',
    lat: 5.3283,
    lng: 100.2825,
    city: 'Bayan Lepas, Pulau Pinang',
  },
];

/**
 * Calculates distance between two latitude/longitude points in meters using Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats distance into human-readable string (e.g. "45 m", "1.2 km").
 */
export function formatDistance(meters?: number): string {
  if (meters === undefined || meters === null) return '-';
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formats coordinates for display (e.g. "3.1531° N, 101.7144° E").
 */
export function formatCoordinates(lat?: number, lng?: number): string {
  if (lat === undefined || lng === undefined) return '-';
  const latDir = lat >= 0 ? 'U' : 'S';
  const lngDir = lng >= 0 ? 'T' : 'B';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Safely requests current GPS position from the browser.
 */
export async function getCurrentBrowserLocation(
  venueLat?: number,
  venueLng?: number,
  geofenceRadius = 500
): Promise<GeolocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      location: null,
      error: 'Pelayar peranti tidak menyokong fungsi Geolocation.',
    };
  }

  return new Promise((resolve) => {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);
        const timestamp = new Date().toISOString();

        let distanceFromVenueMeters: number | undefined;
        let isWithinGeofence: boolean | undefined;

        if (venueLat !== undefined && venueLng !== undefined) {
          distanceFromVenueMeters = calculateDistanceMeters(lat, lng, venueLat, venueLng);
          isWithinGeofence = distanceFromVenueMeters <= geofenceRadius;
        }

        const loc: MemberLocation = {
          latitude: lat,
          longitude: lng,
          accuracy,
          timestamp,
          distanceFromVenueMeters,
          isWithinGeofence,
        };

        resolve({ location: loc });
      },
      (error) => {
        let msg = 'Gagal mengesan lokasi peranti.';
        let isDenied = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Kebenaran GPS tidak dibenarkan oleh pengguna / pelayar.';
            isDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Maklumat koordinat GPS tidak tersedia buat masa ini.';
            break;
          case error.TIMEOUT:
            msg = 'Masa mengesan lokasi GPS tamat. Sila pastikan isyarat lokasi aktif.';
            break;
        }
        resolve({
          location: null,
          error: msg,
          isPermissionDenied: isDenied,
        });
      },
      options
    );
  });
}
