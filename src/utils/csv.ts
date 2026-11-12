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
/**
 * Exports members list to CSV with UTF-8 BOM, compliant with Microsoft Excel and Google Sheets.
 * Includes official venueName and venueAddress metadata and columns.
 */
export function exportAttendanceCSV(
  members: Member[],
  meetingTitle: string,
  meetingDate: string,
  venueName: string,
  venueAddress: string
): void {
  const attendedCount = members.filter((m) => m.hasAttended).length;
  const cleanDate = meetingDate || new Date().toISOString().split('T')[0];

  // Official Institutional Metadata Block
  const metadataBlock = [
    ['"REKOD KEHADIRAN RASMI MESYUARAT — e-Hadir"'],
    [`"Tajuk Mesyuarat:",${escapeCsvField(meetingTitle)}`],
    [`"Tarikh Sesi:",${escapeCsvField(cleanDate)}`],
    [`"Nama Dewan / Lokasi:",${escapeCsvField(venueName || 'Dewan Utama')}`],
    [`"Alamat Penuh:",${escapeCsvField(venueAddress || '-')}`],
    [`"Jumlah Ahli Layak:",${members.length}`],
    [`"Jumlah Kehadiran Sah:",${attendedCount}`],
    [`"Peratusan Kehadiran:",${members.length > 0 ? Math.round((attendedCount / members.length) * 1000) / 10 : 0}%`],
    [`"Tarikh Laporan Dijana:",${escapeCsvField(new Date().toLocaleString('ms-MY'))}`],
    [''], // blank line before table
  ].map((row) => row.join(','));

  const headers = [
    'Bil',
    'No_Gaji',
    'Nama_Penuh',
    'Bahagian_Cawangan',
    'Status_Kehadiran',
    'Masa_Daftar',
    'Lokasi_Dewan',
    'Alamat_Dewan',
    'Pengesahan_Swafoto',
  ];

  const rows = members.map((m, index) => {
    const status = m.hasAttended ? 'Hadir Sah' : 'Tidak Hadir';
    const time = m.attendedAt || '-';

    // If selfie is present, label clearly for audit
    let selfieDisplay = '-';
    if (m.selfieUrl) {
      if (m.selfieUrl.startsWith('http')) {
        selfieDisplay = m.selfieUrl;
      } else {
        selfieDisplay = `[Swafoto Sah Wajah - ${m.staffId}]`;
      }
    }

    return [
      (index + 1).toString(),
      escapeCsvField(m.staffId),
      escapeCsvField(m.fullName),
      escapeCsvField(m.department),
      escapeCsvField(status),
      escapeCsvField(time),
      escapeCsvField(venueName || 'Dewan Utama'),
      escapeCsvField(venueAddress || '-'),
      escapeCsvField(selfieDisplay),
    ].join(',');
  });

  const csvContent =
    '\uFEFF' +
    [...metadataBlock, headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Kehadiran_${cleanDate}.csv`);
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
