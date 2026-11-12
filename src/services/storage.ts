import { Member, MemberLocation, SessionSettings, FirebaseConfig } from '../types';
import { getCurrentTimestamp, normalizeStaffId } from '../utils/formatters';

const STORAGE_KEY_SETTINGS = 'ehadir_session_settings_v1';
const STORAGE_KEY_MEMBERS = 'ehadir_members_v1';
const STORAGE_KEY_FIREBASE = 'ehadir_firebase_config_v1';
const SYNC_CHANNEL_NAME = 'ehadir_realtime_sync_channel';

// Initial realistic default master list (Malaysian Cooperative / Organizational setting)
const INITIAL_MEMBERS: Member[] = [
  { staffId: 'LGM1001', fullName: 'Ahmad Razali bin Ismail', department: 'Bahagian Kewangan & Akaun', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1002', fullName: 'Siti Nurhaliza binti Mahfuz', department: 'Bahagian Sumber Manusia', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1003', fullName: 'Tan Wei Ming', department: 'Bahagian Teknologi Maklumat', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1004', fullName: 'Muthusamy a/l Arumugam', department: 'Bahagian Operasi & Logistik', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1005', fullName: 'Nurul Ain binti Zulkifli', department: 'Cawangan Zon Utara', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  {
    staffId: 'LGM1006',
    fullName: 'Mohd Hafiz bin Sulaiman',
    department: 'Bahagian Komunikasi Korporat',
    hasAttended: true,
    attendedAt: '12/11/2026 08:45:12',
    selfieUrl: null,
    location: {
      latitude: 3.1534,
      longitude: 101.7146,
      accuracy: 12,
      timestamp: '2026-11-12T08:45:12.000Z',
      distanceFromVenueMeters: 42,
      isWithinGeofence: true,
    },
  },
  {
    staffId: 'LGM1007',
    fullName: 'Fatimah Azzahra binti Daud',
    department: 'Bahagian Tadbir Urus',
    hasAttended: true,
    attendedAt: '12/11/2026 08:52:30',
    selfieUrl: null,
    location: {
      latitude: 3.1528,
      longitude: 101.7141,
      accuracy: 15,
      timestamp: '2026-11-12T08:52:30.000Z',
      distanceFromVenueMeters: 55,
      isWithinGeofence: true,
    },
  },
  {
    staffId: 'LGM1008',
    fullName: 'Lee Chong Wei',
    department: 'Cawangan Zon Selatan',
    hasAttended: true,
    attendedAt: '12/11/2026 09:02:15',
    selfieUrl: null,
    location: {
      latitude: 3.1595,
      longitude: 101.718,
      accuracy: 20,
      timestamp: '2026-11-12T09:02:15.000Z',
      distanceFromVenueMeters: 820,
      isWithinGeofence: false,
    },
  },
  { staffId: 'LGM1009', fullName: 'Kavitha a/p Subramaniam', department: 'Bahagian Kewangan & Akaun', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1010', fullName: 'Zulkarnain bin Shamsudin', department: 'Bahagian Operasi & Logistik', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1011', fullName: 'Noraini binti Abdul Rahman', department: 'Bahagian Sumber Manusia', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1012', fullName: 'Chong Kah Yee', department: 'Bahagian Audit & Integriti', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1013', fullName: 'Azlan bin Kamaruddin', department: 'Bahagian Keselamatan', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1014', fullName: 'Dayangku Intan binti Awang', department: 'Cawangan Zon Timur', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1015', fullName: 'Raj Kumar a/l Ganesan', department: 'Bahagian Khidmat Korporat', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1016', fullName: 'Hajah Maznah binti Kassim', department: 'Bahagian Pentadbiran Am', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1017', fullName: 'Khairul Anuar bin Osman', department: 'Bahagian Teknologi Maklumat', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1018', fullName: 'Wendy Lim Siew Fern', department: 'Bahagian Hal Ehwal Ahli', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1019', fullName: 'Muhamad Syahril bin Hamdan', department: 'Bahagian Penyelidikan', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
  { staffId: 'LGM1020', fullName: 'Sharifah Nadia binti Syed Omar', department: 'Bahagian Hal Ehwal Ahli', hasAttended: false, attendedAt: null, selfieUrl: null, location: null },
];

const INITIAL_SETTINGS: SessionSettings = {
  meetingTitle: 'Mesyuarat Agung Tahunan Ke-34 Sesi 2026/2027',
  meetingDate: new Date().toISOString().split('T')[0],
  quorumTargetPercent: 50,
  isRegistrationOpen: true,
  totalEligibleMembers: INITIAL_MEMBERS.length,
  adminPin: '123456',
  updatedAt: new Date().toISOString(),
  venueName: 'Pusat Konvensyen Kuala Lumpur (KLCC) - Dewan Perdana',
  venueLat: 3.1531,
  venueLng: 101.7144,
  geofenceRadiusMeters: 500,
  enableGeofence: true,
};

type Listener = () => void;

class StorageService {
  private listeners: Set<Listener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.initDefaults();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'DATA_UPDATED') {
            this.notifyLocal();
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or blocked:', err);
      }
    }
    // Also listen to storage events across separate browser tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.notifyLocal();
      });
    }
  }

  private initDefaults(): void {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEY_SETTINGS)) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS)!);
        if (!existing.venueLat || !existing.venueName) {
          localStorage.setItem(
            STORAGE_KEY_SETTINGS,
            JSON.stringify({ ...INITIAL_SETTINGS, ...existing })
          );
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      }
    }
    if (!localStorage.getItem(STORAGE_KEY_MEMBERS)) {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(INITIAL_MEMBERS));
    }
  }

  private notifyAll(): void {
    this.notifyLocal();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
      } catch (e) {
        // BroadcastChannel failed silently
      }
    }
  }

  private notifyLocal(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- Session Settings ---

  public getSettings(): SessionSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
        };
      }
    } catch (e) {
      console.error('Failed to get settings:', e);
    }
    return INITIAL_SETTINGS;
  }

  public updateSettings(partial: Partial<SessionSettings>): SessionSettings {
    const current = this.getSettings();
    const updated: SessionSettings = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    this.notifyAll();
    return updated;
  }

  // --- Members ---

  public getAllMembers(): Member[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (data) {
        return JSON.parse(data) as Member[];
      }
    } catch (e) {
      console.error('Failed to get members:', e);
    }
    return [];
  }

  public findMemberByStaffId(rawStaffId: string): Member | null {
    const normalized = normalizeStaffId(rawStaffId);
    if (!normalized) return null;
    const members = this.getAllMembers();
    return members.find((m) => m.staffId === normalized) || null;
  }

  /**
   * Registers attendance for a member with duplicate protection (BR-02) and optional geolocation.
   */
  public recordAttendance(
    staffId: string,
    selfieDataUrl: string,
    location?: MemberLocation | null
  ): { success: boolean; member?: Member; error?: string } {
    const normalized = normalizeStaffId(staffId);
    const settings = this.getSettings();

    // Check if registration is open
    if (!settings.isRegistrationOpen) {
      return {
        success: false,
        error: 'Pendaftaran kehadiran telah ditutup. Sila rujuk meja urus setia.',
      };
    }

    const members = this.getAllMembers();
    const index = members.findIndex((m) => m.staffId === normalized);

    if (index === -1) {
      return {
        success: false,
        error: 'No. Gaji tidak ditemui dalam senarai ahli layak. Sila semak semula atau rujuk meja urus setia.',
      };
    }

    const currentMember = members[index];

    // BR-02 / FR-003: Check if already attended
    if (currentMember.hasAttended) {
      return {
        success: false,
        member: currentMember,
        error: 'Kehadiran anda telah pun direkodkan sebelum ini.',
      };
    }

    // Atomically mark attendance
    const timestamp = getCurrentTimestamp();
    const updatedMember: Member = {
      ...currentMember,
      hasAttended: true,
      attendedAt: timestamp,
      selfieUrl: selfieDataUrl,
      location: location || null,
    };

    members[index] = updatedMember;
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));

    // Update total eligible count in settings
    this.updateSettings({
      totalEligibleMembers: members.length,
    });

    this.notifyAll();

    return {
      success: true,
      member: updatedMember,
    };
  }

  /**
   * Uploads master list from CSV with either 'merge' or 'replace' mode (BR-05).
   */
  public uploadMasterList(
    incomingRows: Array<{ staffId: string; fullName: string; department: string }>,
    mode: 'merge' | 'replace'
  ): { addedCount: number; updatedCount: number; totalCount: number } {
    const currentMembers = this.getAllMembers();
    let addedCount = 0;
    let updatedCount = 0;

    let finalMembers: Member[] = [];

    if (mode === 'replace') {
      finalMembers = incomingRows.map((row) => ({
        staffId: row.staffId,
        fullName: row.fullName,
        department: row.department,
        hasAttended: false,
        attendedAt: null,
        selfieUrl: null,
        location: null,
      }));
      addedCount = finalMembers.length;
    } else {
      // Merge mode: preserve existing attendance records if matching
      const memberMap = new Map<string, Member>();
      currentMembers.forEach((m) => memberMap.set(m.staffId, m));

      incomingRows.forEach((row) => {
        if (memberMap.has(row.staffId)) {
          const existing = memberMap.get(row.staffId)!;
          memberMap.set(row.staffId, {
            ...existing,
            fullName: row.fullName,
            department: row.department,
          });
          updatedCount++;
        } else {
          memberMap.set(row.staffId, {
            staffId: row.staffId,
            fullName: row.fullName,
            department: row.department,
            hasAttended: false,
            attendedAt: null,
            selfieUrl: null,
            location: null,
          });
          addedCount++;
        }
      });

      finalMembers = Array.from(memberMap.values());
    }

    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(finalMembers));
    this.updateSettings({
      totalEligibleMembers: finalMembers.length,
    });

    this.notifyAll();

    return {
      addedCount,
      updatedCount,
      totalCount: finalMembers.length,
    };
  }

  /**
   * Resets all session data or clears attendance records.
   */
  public resetSessionData(keepMasterList = false): void {
    if (keepMasterList) {
      const current = this.getAllMembers();
      const resetList = current.map((m) => ({
        ...m,
        hasAttended: false,
        attendedAt: null,
        selfieUrl: null,
        location: null,
      }));
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(resetList));
    } else {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(INITIAL_MEMBERS));
      localStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify({
          ...INITIAL_SETTINGS,
          updatedAt: new Date().toISOString(),
        })
      );
    }
    this.notifyAll();
  }

  // --- Firebase Configuration ---

  public getFirebaseConfig(): FirebaseConfig | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FIREBASE);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading Firebase config:', e);
    }
    return null;
  }

  public saveFirebaseConfig(config: FirebaseConfig | null): void {
    if (config) {
      localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
    } else {
      localStorage.removeItem(STORAGE_KEY_FIREBASE);
    }
    this.notifyAll();
  }

  public isFirebaseConnected(): boolean {
    const config = this.getFirebaseConfig();
    return !!(config && config.apiKey && config.projectId);
  }
}

export const storageService = new StorageService();
