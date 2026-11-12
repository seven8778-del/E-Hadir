import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MemberLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  distanceFromVenueMeters?: number;
  isWithinGeofence?: boolean;
}

interface Member {
  staffId: string;
  fullName: string;
  department: string;
  hasAttended: boolean;
  attendedAt: string | null;
  selfieUrl: string | null;
  location?: MemberLocation | null;
}

interface SessionSettings {
  meetingTitle: string;
  meetingDate: string;
  quorumTargetPercent: number;
  isRegistrationOpen: boolean;
  totalEligibleMembers: number;
  adminPin: string;
  updatedAt: string;
  venueName: string;
  venueLat: number;
  venueLng: number;
  geofenceRadiusMeters: number;
  enableGeofence: boolean;
}

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

// Persistence storage path
const DATA_DIR = path.resolve(__dirname, '.ehadir_data');
const DATA_FILE = path.join(DATA_DIR, 'session.json');

class ServerStore {
  private members: Member[] = [...INITIAL_MEMBERS];
  private settings: SessionSettings = { ...INITIAL_SETTINGS };

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.members && Array.isArray(data.members)) {
          this.members = data.members;
        }
        if (data.settings) {
          this.settings = { ...INITIAL_SETTINGS, ...data.settings };
        }
      }
    } catch (err) {
      console.warn('Could not read persistent session file, using initial memory defaults.');
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify({ members: this.members, settings: this.settings }), 'utf-8');
    } catch (err) {
      console.warn('Failed to save session data to disk:', err);
    }
  }

  public getSession() {
    const attendedCount = this.members.filter((m) => m.hasAttended).length;
    return {
      settings: this.settings,
      members: this.members,
      totalCount: this.members.length,
      attendedCount,
    };
  }

  public updateSettings(partial: Partial<SessionSettings>) {
    this.settings = {
      ...this.settings,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.settings;
  }

  public recordAttendance(staffId: string, selfieUrl: string, location?: MemberLocation | null) {
    const normalized = staffId.trim().toUpperCase();

    if (!this.settings.isRegistrationOpen) {
      return { success: false, error: 'Pendaftaran kehadiran telah ditutup oleh urus setia.' };
    }

    const index = this.members.findIndex((m) => m.staffId === normalized);
    if (index === -1) {
      return { success: false, error: 'No. Gaji tidak ditemui dalam senarai induk ahli dewan.' };
    }

    const member = this.members[index];
    if (member.hasAttended) {
      return { success: false, member, error: 'Kehadiran telah pun direkodkan sebelum ini.' };
    }

    const now = new Date();
    const formattedTime = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const updated: Member = {
      ...member,
      hasAttended: true,
      attendedAt: formattedTime,
      selfieUrl,
      location: location || null,
    };

    this.members[index] = updated;
    this.saveToDisk();

    return { success: true, member: updated };
  }

  public uploadMasterList(rows: Array<{ staffId: string; fullName: string; department: string }>, mode: 'merge' | 'replace') {
    if (mode === 'replace') {
      this.members = rows.map((r) => ({
        staffId: r.staffId.trim().toUpperCase(),
        fullName: r.fullName,
        department: r.department,
        hasAttended: false,
        attendedAt: null,
        selfieUrl: null,
        location: null,
      }));
    } else {
      const map = new Map<string, Member>();
      this.members.forEach((m) => map.set(m.staffId, m));
      rows.forEach((r) => {
        const id = r.staffId.trim().toUpperCase();
        if (map.has(id)) {
          const ex = map.get(id)!;
          map.set(id, { ...ex, fullName: r.fullName, department: r.department });
        } else {
          map.set(id, {
            staffId: id,
            fullName: r.fullName,
            department: r.department,
            hasAttended: false,
            attendedAt: null,
            selfieUrl: null,
            location: null,
          });
        }
      });
      this.members = Array.from(map.values());
    }

    this.settings.totalEligibleMembers = this.members.length;
    this.saveToDisk();
    return this.getSession();
  }

  public resetSession(keepMasterList = false) {
    if (keepMasterList) {
      this.members = this.members.map((m) => ({
        ...m,
        hasAttended: false,
        attendedAt: null,
        selfieUrl: null,
        location: null,
      }));
    } else {
      this.members = [...INITIAL_MEMBERS];
      this.settings = { ...INITIAL_SETTINGS, updatedAt: new Date().toISOString() };
    }
    this.saveToDisk();
    return this.getSession();
  }
}

const store = new ServerStore();

// SSE Clients for instant live sync across devices
const sseClients = new Set<Response>();

function broadcastSSE(type: string, payload: any) {
  const message = `data: ${JSON.stringify({ type, payload, timestamp: Date.now() })}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  });
}

// Keepalive heartbeat
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.write(': heartbeat\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  });
}, 20000);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parser for JSON with photo payloads
  app.use(express.json({ limit: '15mb' }));

  // --- REST & SSE API ROUTES ---

  // 1. Live SSE Stream endpoint
  app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial snapshot
    res.write(`data: ${JSON.stringify({ type: 'INITIAL_SYNC', payload: store.getSession() })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // 2. Full session data
  app.get('/api/session', (req: Request, res: Response) => {
    res.json(store.getSession());
  });

  // 3. Register attendance (from any device scanning the QR code)
  app.post('/api/attendance', (req: Request, res: Response) => {
    const { staffId, selfieUrl, location } = req.body;
    if (!staffId) {
      return res.status(400).json({ success: false, error: 'No. Gaji diperlukan.' });
    }

    const result = store.recordAttendance(staffId, selfieUrl, location);
    if (result.success && result.member) {
      // Broadcast live to all phones, laptops, and hall projectors immediately
      broadcastSSE('ATTENDANCE_RECORDED', {
        member: result.member,
        session: store.getSession(),
      });
      return res.json(result);
    }

    return res.status(400).json(result);
  });

  // 4. Update settings
  app.put('/api/settings', (req: Request, res: Response) => {
    const updated = store.updateSettings(req.body);
    broadcastSSE('SETTINGS_UPDATED', updated);
    res.json({ success: true, settings: updated });
  });

  // 5. Upload master list CSV
  app.post('/api/members/upload', (req: Request, res: Response) => {
    const { rows, mode } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: 'Data baris tidak sah.' });
    }
    const session = store.uploadMasterList(rows, mode || 'merge');
    broadcastSSE('MASTER_LIST_UPDATED', session);
    res.json({ success: true, session });
  });

  // 6. Reset session
  app.post('/api/reset', (req: Request, res: Response) => {
    const { keepMasterList } = req.body;
    const session = store.resetSession(!!keepMasterList);
    broadcastSSE('SESSION_RESET', session);
    res.json({ success: true, session });
  });

  // --- Static or Vite Middlewares ---
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`e-Hadir live sync server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
