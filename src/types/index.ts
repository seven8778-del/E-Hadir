export interface MemberLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: string;
  distanceFromVenueMeters?: number;
  isWithinGeofence?: boolean;
}

export interface Member {
  staffId: string; // Trimmed, uppercase, e.g., 'LGM1024'
  fullName: string;
  department: string;
  hasAttended: boolean;
  attendedAt: string | null; // Formatted or ISO string: "12/11/2026 09:14:22"
  selfieUrl: string | null; // Data URI (<150KB JPEG) or Cloud Storage URL
  location?: MemberLocation | null;
}

export interface SessionSettings {
  meetingTitle: string;
  meetingDate: string; // YYYY-MM-DD
  quorumTargetPercent: number; // e.g. 50
  isRegistrationOpen: boolean;
  totalEligibleMembers: number;
  adminPin: string; // default "123456"
  updatedAt: string;
  // Geolocation & Venue settings
  venueName: string;
  venueLat: number;
  venueLng: number;
  geofenceRadiusMeters: number; // e.g. 500m
  enableGeofence: boolean;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export type RegistrationStep =
  | 'check-id'
  | 'confirm-profile'
  | 'camera'
  | 'submitting'
  | 'success-pass'
  | 'already-attended';

export type AttendanceFilter = 'ALL' | 'ATTENDED' | 'NOT_ATTENDED';
