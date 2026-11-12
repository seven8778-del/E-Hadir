export interface Member {
  staffId: string; // Trimmed, uppercase, e.g., 'LGM1024'
  fullName: string;
  department: string;
  hasAttended: boolean;
  attendedAt: string | null; // Formatted string: "12/11/2026 09:14:22"
  selfieUrl: string | null; // Data URI (<150KB JPEG) or Cloud Storage URL
}

export interface SessionSettings {
  meetingTitle: string;
  meetingDate: string; // YYYY-MM-DD
  quorumTargetPercent: number; // e.g. 50
  isRegistrationOpen: boolean;
  totalEligibleMembers: number;
  adminPin: string; // default "123456"
  updatedAt: string;
  // Manual text-based Venue & Address setup (settings/eventInfo)
  venueName: string; // e.g. "Dewan Utama"
  venueAddress: string; // e.g. "Wisma Getah Asli, 148 Jalan Ampang, 50450 Kuala Lumpur"
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
