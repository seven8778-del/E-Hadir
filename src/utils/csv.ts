import { Member } from '../types';

export interface ParsedMemberRow {
  staffId: string;
  fullName: string;
  department: string;
  isValid: boolean;
  error?: string;
}

/**
 * Parses raw CSV string into member records.
 * Expected headers: No_Gaji, Nama_Penuh, Bahagian_Cawangan
 */
export function parseMasterListCSV(csvText: string): {
  members: Array<{ staffId: string; fullName: string; department: string }>;
  errors: string[];
  totalParsed: number;
} {
  const errors: string[] = [];
  const members: Array<{ staffId: string; fullName: string; department: string }> = [];

  if (!csvText || !csvText.trim()) {
    return { members: [], errors: ['Fail CSV kosong.'], totalParsed: 0 };
  }

  // Remove potential UTF-8 BOM
  let cleaned = csvText;
  if (cleaned.charCodeAt(0) === 0xfeff) {
    cleaned = cleaned.slice(1);
  }

  const lines = splitCsvLines(cleaned);
  if (lines.length < 2) {
    return {
      members: [],
      errors: ['Fail CSV mesti mengandungi baris tajuk (headers) dan sekurang-kurangnya satu baris rekod ahli.'],
      totalParsed: 0,
    };
  }

  // Header line
  const headerRow = parseCsvLine(lines[0]);
  const headers = headerRow.map((h) => h.trim().toLowerCase().replace(/[\s_-]+/g, ''));

  // Find column indices
  const staffIdIndex = headers.findIndex((h) => h.includes('nogaji') || h.includes('staffid') || h.includes('nokakitangan'));
  const nameIndex = headers.findIndex((h) => h.includes('namapenuh') || h.includes('nama') || h.includes('fullname'));
  const deptIndex = headers.findIndex((h) => h.includes('bahagian') || h.includes('cawangan') || h.includes('department') || h.includes('unit'));

  if (staffIdIndex === -1 || nameIndex === -1) {
    return {
      members: [],
      errors: [
        'Pengepala kolum tidak sah. Sila pastikan fail CSV mengandungi kolum: No_Gaji, Nama_Penuh, Bahagian_Cawangan',
      ],
      totalParsed: 0,
    };
  }

  const seenIds = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue; // Skip empty rows

    const row = parseCsvLine(rawLine);
    const rawStaffId = row[staffIdIndex]?.trim();
    const rawName = row[nameIndex]?.trim();
    const rawDept = deptIndex !== -1 ? row[deptIndex]?.trim() : 'Umum';

    if (!rawStaffId || !rawName) {
      errors.push(`Baris ${i + 1}: No. Gaji atau Nama kosong, baris diabaikan.`);
      continue;
    }

    const normalizedStaffId = rawStaffId.toUpperCase();
    if (seenIds.has(normalizedStaffId)) {
      errors.push(`Baris ${i + 1}: No. Gaji pendua "${normalizedStaffId}", rekod pendua diabaikan.`);
      continue;
    }

    seenIds.add(normalizedStaffId);
    members.push({
      staffId: normalizedStaffId,
      fullName: rawName,
      department: rawDept || 'Umum',
    });
  }

  return { members, errors, totalParsed: members.length };
}

/**
 * Splits CSV text by lines while preserving quoted line breaks.
 */
function splitCsvLines(text: string): string[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\r' && nextChar === '\n') || char === '\n') {
      if (inQuotes) {
        currentLine += char;
      } else {
        lines.push(currentLine);
        currentLine = '';
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip the '\n'
        }
      }
    } else {
      currentLine += char;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Parses a single CSV line into an array of string values, accounting for quotes and commas.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField);
  return result;
}

/**
 * Exports members list to CSV with UTF-8 BOM, compliant with Microsoft Excel and Google Sheets.
 */
export function exportAttendanceCSV(members: Member[], meetingDate: string): void {
  const headers = [
    'Bil',
    'No_Gaji',
    'Nama_Penuh',
    'Bahagian_Cawangan',
    'Status_Kehadiran',
    'Masa_Daftar',
    'Koordinat_Lat_Lng',
    'Jarak_Dewan_Meter',
    'Status_Geofens',
    'Pautan_Selfie_URL',
  ];

  const rows = members.map((m, index) => {
    const status = m.hasAttended ? 'Hadir' : 'Tidak Hadir';
    const time = m.attendedAt || '-';
    const coords = m.location ? `${m.location.latitude.toFixed(5)}, ${m.location.longitude.toFixed(5)}` : '-';
    const dist = m.location?.distanceFromVenueMeters !== undefined ? `${m.location.distanceFromVenueMeters}m` : '-';
    const geofence = m.location?.isWithinGeofence !== undefined ? (m.location.isWithinGeofence ? 'Dalam Radius Dewan' : 'Di Luar Radius') : '-';

    // If selfie is a base64 string, label as embedded photo or display URL
    let selfieDisplay = '-';
    if (m.selfieUrl) {
      if (m.selfieUrl.startsWith('http')) {
        selfieDisplay = m.selfieUrl;
      } else {
        selfieDisplay = `[Foto Selfie Tersimpan - ${m.staffId}]`;
      }
    }

    return [
      (index + 1).toString(),
      escapeCsvField(m.staffId),
      escapeCsvField(m.fullName),
      escapeCsvField(m.department),
      escapeCsvField(status),
      escapeCsvField(time),
      escapeCsvField(coords),
      escapeCsvField(dist),
      escapeCsvField(geofence),
      escapeCsvField(selfieDisplay),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanDate = meetingDate || new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Kehadiran_e-Hadir_${cleanDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Generates sample CSV template for initial upload by Admin.
 */
export function generateSampleCsvTemplate(): void {
  const sample = `No_Gaji,Nama_Penuh,Bahagian_Cawangan
LGM1001,Ahmad Razali bin Ismail,Bahagian Kewangan & Akaun
LGM1002,Siti Nurhaliza binti Mahfuz,Bahagian Sumber Manusia
LGM1003,Tan Wei Ming,Bahagian Teknologi Maklumat
LGM1004,Muthusamy a/l Arumugam,Bahagian Operasi & Logistik
LGM1005,Nurul Ain binti Zulkifli,Cawangan Zon Utara
LGM1006,Mohd Hafiz bin Sulaiman,Bahagian Komunikasi Korporat
LGM1007,Fatimah Azzahra binti Daud,Bahagian Tadbir Urus
LGM1008,Lee Chong Wei,Cawangan Zon Selatan
LGM1009,Kavitha a/p Subramaniam,Bahagian Kewangan & Akaun
LGM1010,Zulkarnain bin Shamsudin,Bahagian Operasi & Logistik`;

  const blob = new Blob(['\uFEFF' + sample], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Templat_Senarai_Induk_e-Hadir.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
