import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Settings,
  FileSpreadsheet,
  AlertTriangle,
  Eye,
  Trash2,
  ExternalLink,
  Power,
  ShieldCheck,
  Cloud,
  Check,
  X,
  ChevronRight,
  MapPin,
  Navigation,
  Crosshair,
  QrCode,
} from 'lucide-react';
import { Member, SessionSettings, AttendanceFilter } from '../types';
import { storageService } from '../services/storage';
import { exportAttendanceCSV, parseMasterListCSV, generateSampleCsvTemplate } from '../utils/csv';
import { VENUE_PRESETS, VenuePreset, getCurrentBrowserLocation } from '../utils/geolocation';
import { SelfieModal } from './SelfieModal';
import { LiveAttendanceMap } from './LiveAttendanceMap';

interface AdminDashboardProps {
  settings: SessionSettings;
  members: Member[];
  onOpenHallScreen: () => void;
  onOpenFirebaseConfig: () => void;
  onSwitchToKiosk: () => void;
  onOpenQrModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  members,
  onOpenHallScreen,
  onOpenFirebaseConfig,
  onSwitchToKiosk,
  onOpenQrModal,
}) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'map' | 'settings'>('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<AttendanceFilter>('ALL');
  const [inspectMember, setInspectMember] = useState<Member | null>(null);

  // Form settings state
  const [editTitle, setEditTitle] = useState(settings.meetingTitle);
  const [editDate, setEditDate] = useState(settings.meetingDate);
  const [editQuorum, setEditQuorum] = useState(settings.quorumTargetPercent);
  const [editPin, setEditPin] = useState(settings.adminPin);

  // Venue & Geofencing settings state
  const [editVenueName, setEditVenueName] = useState(
    settings.venueName || 'Pusat Konvensyen Kuala Lumpur (KLCC) - Dewan Perdana'
  );
  const [editVenueLat, setEditVenueLat] = useState(settings.venueLat || 3.1531);
  const [editVenueLng, setEditVenueLng] = useState(settings.venueLng || 101.7144);
  const [editGeofenceRadius, setEditGeofenceRadius] = useState(
    settings.geofenceRadiusMeters || 500
  );
  const [editEnableGeofence, setEditEnableGeofence] = useState(
    settings.enableGeofence !== undefined ? settings.enableGeofence : true
  );
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [isLocatingSettings, setIsLocatingSettings] = useState(false);
  const [locationDetectNotice, setLocationDetectNotice] = useState<string | null>(null);

  const handleUseCurrentLocationInSettings = async () => {
    setIsLocatingSettings(true);
    setLocationDetectNotice(null);
    try {
      const res = await getCurrentBrowserLocation();
      if (res.location) {
        setEditVenueLat(res.location.latitude);
        setEditVenueLng(res.location.longitude);
        setLocationDetectNotice('✓ Koordinat berjaya dikesan daripada peranti anda!');
        setTimeout(() => setLocationDetectNotice(null), 3500);
      } else {
        alert(res.error || 'Gagal mengesan lokasi GPS peranti.');
      }
    } catch (e) {
      alert('Ralat semasa meminta lokasi GPS peranti.');
    } finally {
      setIsLocatingSettings(false);
    }
  };

  // CSV upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingUploadData, setPendingUploadData] = useState<Array<{ staffId: string; fullName: string; department: string }> | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadModeModal, setUploadModeModal] = useState(false);

  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Calculate Metrics
  const totalEligible = members.length;
  const attendedCount = members.filter((m) => m.hasAttended).length;
  const attendancePercent = totalEligible > 0 ? Math.round((attendedCount / totalEligible) * 1000) / 10 : 0;
  const isQuorumReached = attendancePercent >= settings.quorumTargetPercent;

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.department) set.add(m.department);
    });
    return Array.from(set).sort();
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchId = m.staffId.toLowerCase().includes(query);
        const matchName = m.fullName.toLowerCase().includes(query);
        if (!matchId && !matchName) return false;
      }

      if (departmentFilter !== 'ALL' && m.department !== departmentFilter) {
        return false;
      }

      if (statusFilter === 'ATTENDED' && !m.hasAttended) return false;
      if (statusFilter === 'NOT_ATTENDED' && m.hasAttended) return false;

      return true;
    });
  }, [members, searchQuery, departmentFilter, statusFilter]);

  const handleToggleRegistration = () => {
    storageService.updateSettings({
      isRegistrationOpen: !settings.isRegistrationOpen,
    });
  };

  const handleApplyVenuePreset = (preset: VenuePreset) => {
    setEditVenueName(preset.name);
    setEditVenueLat(preset.lat);
    setEditVenueLng(preset.lng);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateSettings({
      meetingTitle: editTitle.trim() || settings.meetingTitle,
      meetingDate: editDate || settings.meetingDate,
      quorumTargetPercent: Number(editQuorum) || 50,
      adminPin: editPin.trim() || '123456',
      venueName: editVenueName.trim() || settings.venueName,
      venueLat: Number(editVenueLat) || settings.venueLat,
      venueLng: Number(editVenueLng) || settings.venueLng,
      geofenceRadiusMeters: Number(editGeofenceRadius) || 500,
      enableGeofence: editEnableGeofence,
    });
    setSettingsSavedNotice(true);
    setTimeout(() => setSettingsSavedNotice(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseMasterListCSV(text);
      setUploadErrors(parsed.errors);

      if (parsed.members.length > 0) {
        setPendingUploadData(parsed.members);
        if (attendedCount > 0) {
          setUploadModeModal(true);
        } else {
          storageService.uploadMasterList(parsed.members, 'replace');
          setPendingUploadData(null);
          alert(`Berjaya memuat naik ${parsed.members.length} rekod senarai induk ahli.`);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmUpload = (mode: 'merge' | 'replace') => {
    if (!pendingUploadData) return;
    const res = storageService.uploadMasterList(pendingUploadData, mode);
    setUploadModeModal(false);
    setPendingUploadData(null);
    alert(
      `Muat naik selesai. Ditambah: ${res.addedCount}, Dikemas kini: ${res.updatedCount}. Jumlah: ${res.totalCount} ahli.`
    );
  };

  const handleResetConfirmed = () => {
    if (resetConfirmText.toUpperCase() !== 'PADAM') {
      alert('Sila taip perkataan PADAM dengan betul untuk mengesahkan.');
      return;
    }
    storageService.resetSessionData(false);
    setShowResetModal(false);
    setResetConfirmText('');
    alert('Sesi telah berjaya ditetapkan semula ke konfigurasi asal.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Administrative Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1">
            <span>Papan Pemuka Urus Setia</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Dewan Utama</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {settings.meetingTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Tarikh Sesi: <strong className="text-slate-800">{settings.meetingDate}</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Sasaran Kuorum: <strong className="text-slate-800">{settings.quorumTargetPercent}%</strong></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenQrModal && (
            <button
              onClick={onOpenQrModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 transition-colors shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-800" />
              <span>Papar Kod QR Dewan</span>
            </button>
          )}

          <button
            onClick={handleToggleRegistration}
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              settings.isRegistrationOpen
                ? 'bg-rose-700 hover:bg-rose-800 text-white'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {settings.isRegistrationOpen ? 'Tutup Pendaftaran Sesi' : 'Buka Pendaftaran Sesi'}
            </span>
          </button>

          <button
            onClick={() => exportAttendanceCSV(members, settings.meetingDate)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Eksport CSV</span>
          </button>

          <button
            onClick={onSwitchToKiosk}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Paparan Ahli / Kiosk</span>
          </button>
        </div>
      </div>

      {/* Unified Quorum Stat Strip (Deliberate Institutional Ledger) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {/* Col 1: Jumlah Hadir */}
          <div className="p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Jumlah Kehadiran Fizikal
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-black text-emerald-950 tabular-nums">
                {attendedCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">ahli sah di dewan</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Padanan selfie & No. Gaji tepat</p>
          </div>

          {/* Col 2: Jumlah Ahli Layak */}
          <div className="p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Jumlah Ahli Layak
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-black text-slate-900 tabular-nums">
                {totalEligible}
              </span>
              <span className="text-xs text-slate-500 font-medium">dalam senarai induk</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{totalEligible - attendedCount} belum hadir</p>
          </div>

          {/* Col 3: Peratusan Semasa */}
          <div className="p-5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Peratusan Kehadiran Semasa
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-black text-slate-900 tabular-nums">
                {attendancePercent}%
              </span>
              <span className="text-xs text-slate-500 font-medium">kehadiran</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Sasaran rasmi: {settings.quorumTargetPercent}%</p>
          </div>

          {/* Col 4: Status Kuorum */}
          <div className={`p-5 ${isQuorumReached ? 'bg-emerald-950 text-white' : 'bg-slate-50'}`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider block ${
              isQuorumReached ? 'text-emerald-300' : 'text-slate-500'
            }`}>
              Status Kuorum Mesyuarat
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-2xl font-black tracking-tight ${
                isQuorumReached ? 'text-white' : 'text-amber-800'
              }`}>
                {isQuorumReached ? 'Kuorum Tercapai' : 'Belum Mencapai'}
              </span>
            </div>
            <p className={`mt-1 text-[11px] leading-tight ${
              isQuorumReached ? 'text-emerald-200' : 'text-slate-500'
            }`}>
              {isQuorumReached
                ? 'Mesyuarat sah diteruskan mengikut fasal.'
                : `Perlu ${Math.max(0, Math.ceil((settings.quorumTargetPercent / 100) * totalEligible) - attendedCount)} ahli lagi untuk kuorum.`}
            </p>
          </div>
        </div>

        {/* Integrated Quorum Progress Line */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>Kemajuan Kuorum:</span>
            <span className="font-mono text-emerald-950 font-bold">{attendancePercent}% / {settings.quorumTargetPercent}%</span>
          </div>

          <div className="relative flex-1 max-w-md h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isQuorumReached ? 'bg-emerald-700' : 'bg-amber-600'
              }`}
              style={{ width: `${Math.min(100, attendancePercent)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
              style={{ left: `${settings.quorumTargetPercent}%` }}
              title={`Sasaran: ${settings.quorumTargetPercent}%`}
            />
          </div>
        </div>
      </div>

      {/* Tab Controls (Segmented, Institutional Clarity) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('monitoring')}
          type="button"
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
            activeTab === 'monitoring'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Senarai Semak Ahli & Kehadiran ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('map')}
          type="button"
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
            activeTab === 'map'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-300" />
          <span>Peta Geofens Dewan</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          type="button"
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
            activeTab === 'settings'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Tetapan Sesi & Pangkalan Data Induk
        </button>
      </div>

      {/* TAB: Live Attendance Map */}
      {activeTab === 'map' && (
        <LiveAttendanceMap
          settings={settings}
          members={members}
          onInspectMember={(m) => setInspectMember(m)}
        />
      )}

      {/* TAB 1: Live Attendance Ledger */}
      {activeTab === 'monitoring' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          {/* Filter & Search Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Gaji atau Nama Ahli..."
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden"
              />
            </div>

            {/* Department Dropdown & Segmented Status Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
                >
                  <option value="ALL">Semua Bahagian / Cawangan</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Segmented Buttons */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  type="button"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({members.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ATTENDED')}
                  type="button"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    statusFilter === 'ATTENDED'
                      ? 'bg-white text-emerald-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sudah Hadir ({attendedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('NOT_ATTENDED')}
                  type="button"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    statusFilter === 'NOT_ATTENDED'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum Hadir ({totalEligible - attendedCount})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Bil</th>
                  <th className="py-3 px-4">No. Gaji</th>
                  <th className="py-3 px-4">Nama Penuh Ahli</th>
                  <th className="py-3 px-4">Bahagian / Cawangan</th>
                  <th className="py-3 px-4">Status Kehadiran</th>
                  <th className="py-3 px-4">Lokasi & Geofens</th>
                  <th className="py-3 px-4">Cap Masa</th>
                  <th className="py-3 px-4 text-center">Foto Selfie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Tiada rekod ahli berpadanan dengan carian ini.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, idx) => (
                    <tr
                      key={member.staffId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                        {member.staffId}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {member.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {member.department}
                      </td>
                      <td className="py-3 px-4">
                        {member.hasAttended ? (
                          <span className="text-emerald-800 font-bold inline-flex items-center gap-1">
                            <span>✓</span>
                            <span>Hadir Fizikal</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">
                            Belum Hadir
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {member.location ? (
                          <span
                            className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${
                              member.location.isWithinGeofence
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                            title={`Ketepatan: ~${member.location.accuracy}m`}
                          >
                            <span>{member.location.isWithinGeofence ? '✓ Sah' : '⚠ Luar'}</span>
                            <span>(~{member.location.distanceFromVenueMeters || 0}m)</span>
                          </span>
                        ) : member.hasAttended ? (
                          <span className="text-slate-400 text-[11px]">Manual / Kiosk</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {member.attendedAt || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {member.selfieUrl ? (
                          <button
                            onClick={() => setInspectMember(member)}
                            type="button"
                            className="inline-flex items-center gap-1.5 p-1 rounded-md hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                            title="Lihat Gambar Penuh & Audit Lokasi"
                          >
                            <img
                              src={member.selfieUrl}
                              alt={member.fullName}
                              className="w-7 h-7 rounded-sm object-cover border border-slate-300"
                            />
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Settings & Master Data */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Session Settings (FR-007) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div>
              <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block">
                Konfigurasi Acara
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Tetapan Sesi & Had Kuorum
              </h2>
            </div>

            {settingsSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Tetapan mesyuarat berjaya disimpan!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tajuk Rasmi Mesyuarat
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tarikh Mesyuarat
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sasaran Kuorum (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editQuorum}
                    onChange={(e) => setEditQuorum(Number(e.target.value))}
                    required
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kod PIN Pentadbir (6-Digit)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  required
                  className="w-full text-xs font-mono font-bold tracking-widest px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden"
                />
              </div>

              {/* Geofencing & Venue Configuration Section */}
              <div className="pt-4 border-t border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-emerald-800" />
                    <span>Lokasi Dewan & Geofens Fizikal</span>
                  </div>

                  {/* 1-Click Current Location Detection Button */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocationInSettings}
                    disabled={isLocatingSettings}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-900 hover:bg-emerald-950 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    title="Gunakan koordinat peranti anda sekarang tanpa perlu menaip nombor"
                  >
                    <Crosshair className={`w-3 h-3 ${isLocatingSettings ? 'animate-spin' : ''}`} />
                    <span>{isLocatingSettings ? 'Mengesan GPS...' : '📍 Guna Lokasi Semasa'}</span>
                  </button>
                </div>

                {locationDetectNotice && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{locationDetectNotice}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Pusat / Dewan Mesyuarat
                  </label>
                  <input
                    type="text"
                    value={editVenueName}
                    onChange={(e) => setEditVenueName(e.target.value)}
                    required
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-800 focus:outline-hidden"
                  />
                </div>

                {/* Preset Venue Buttons - 1 Click without typing latitude */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
                    Pilihan Lokasi Dewan Popular (1-Klik Tanpa Perlu Taip):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {VENUE_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleApplyVenuePreset(p)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                          editVenueName === p.name
                            ? 'bg-emerald-900 text-white border-emerald-900'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {p.name.split(' - ')[0].replace('Pusat Konvensyen ', '').replace('Pusat Dagangan Dunia ', '')} ({p.city})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Map Pinning Tip */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <p className="leading-snug">
                    <strong>📍 Cara Mudah Menukar Lokasi:</strong> Tekan butang <strong>"Guna Lokasi Semasa"</strong> di atas jika anda berada di dewan, atau buka tab <strong>"Peta Geofens Dewan"</strong> dan <strong>klik pada mana-mana titik di atas peta</strong> untuk mengalihkan pin dewan secara visual.
                  </p>
                </div>

                {/* Collapsible Manual Coordinates for Advanced Users Only */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowManualCoords(!showManualCoords)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    {showManualCoords
                      ? '▼ Sembunyikan Input Nombor Koordinat'
                      : '▶ Masukkan Koordinat Latitud/Longitud Manual (Lanjutan)'}
                  </button>

                  {showManualCoords && (
                    <div className="grid grid-cols-2 gap-3 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Latitud Dewan
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={editVenueLat}
                          onChange={(e) => setEditVenueLat(Number(e.target.value))}
                          required
                          className="w-full text-xs font-mono font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Longitud Dewan
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={editVenueLng}
                          onChange={(e) => setEditVenueLng(Number(e.target.value))}
                          required
                          className="w-full text-xs font-mono font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Radius Geofens: <span className="text-emerald-950 font-black font-mono">{editGeofenceRadius} meter</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {[100, 250, 500, 1000].map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setEditGeofenceRadius(radius)}
                        className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                          editGeofenceRadius === radius
                            ? 'bg-emerald-950 text-white border-emerald-950'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {radius}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-emerald-900 hover:bg-emerald-950 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Simpan Perubahan Tetapan
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onOpenFirebaseConfig}
                className="text-xs font-semibold text-emerald-900 hover:text-emerald-950 flex items-center gap-1.5"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-800" />
                <span>Pangkalan Data Firebase</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Sesi</span>
              </button>
            </div>
          </div>

          {/* Right: Master List CSV Management (FR-007, BR-05) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div>
              <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block">
                Pangkalan Data Induk
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Muat Naik Senarai Ahli Layak (CSV)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pengepala kolum yang sah:{' '}
                <code className="text-emerald-950 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded">
                  No_Gaji, Nama_Penuh, Bahagian_Cawangan
                </code>
              </p>
            </div>

            <div className="p-6 rounded-xl border border-dashed border-slate-300 hover:border-emerald-800 bg-slate-50/70 text-center space-y-3 transition-colors">
              <FileSpreadsheet className="w-9 h-9 text-emerald-800 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Pilih fail senarai induk CSV dari peranti anda
                </p>
                <p className="text-[11px] text-slate-500">Format .csv disokong secara piawai</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csvFileInput"
              />

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <label
                  htmlFor="csvFileInput"
                  className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih & Muat Naik CSV</span>
                </label>

                <button
                  type="button"
                  onClick={generateSampleCsvTemplate}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Muat Turun Templat CSV</span>
                </button>
              </div>
            </div>

            {uploadErrors.length > 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold">Makluman Pemprosesan CSV:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  {uploadErrors.slice(0, 4).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {uploadErrors.length > 4 && <li>...dan {uploadErrors.length - 4} lagi.</li>}
                </ul>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Statistik Pangkalan Data Semasa
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Jumlah Ahli Layak:</span>
                  <p className="font-mono font-bold text-slate-900 text-sm">{totalEligible} Ahli</p>
                </div>
                <div>
                  <span className="text-slate-500">Jumlah Cawangan / Bahagian:</span>
                  <p className="font-bold text-slate-900 text-sm">{departments.length} Bahagian</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Merge vs Replace on CSV Upload (BR-05) */}
      {uploadModeModal && pendingUploadData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Rekod Kehadiran Telah Wujud
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Sesi semasa sudah mempunyai <strong className="text-emerald-950 font-bold">{attendedCount} ahli hadir</strong>. Sila pilih kaedah menyelaraskan fail CSV baharu ({pendingUploadData.length} rekod):
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmUpload('merge')}
                className="w-full p-3.5 rounded-xl border border-emerald-700 bg-emerald-50 text-emerald-950 text-left hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>1. Selaras Ahli Baharu Sahaja (Merge)</span>
                  <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded font-semibold">
                    Disyorkan
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Mengekalkan rekod dan foto kehadiran yang sedia ada. Hanya menambah ahli baharu.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmUpload('replace')}
                className="w-full p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-950 text-left hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <div className="font-bold text-xs text-rose-900">
                  2. Gantikan Keseluruhan Senarai (Replace)
                </div>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Amaran: Ini akan memadam rekod kehadiran sesi semasa dan memulakan senarai dari awal.
                </p>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setUploadModeModal(false);
                  setPendingUploadData(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reset Session 2-Step Confirmation (FR-007) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengesahan Reset Sesi Mesyuarat
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tindakan ini akan mengosongkan rekod kehadiran untuk persediaan mesyuarat tahun hadapan.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Taip perkataan <span className="text-rose-600 font-mono">PADAM</span> untuk sahkan:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="PADAM"
                className="w-full text-xs font-mono font-bold px-3 py-2 border-2 border-rose-300 rounded-xl focus:border-rose-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetConfirmed}
                disabled={resetConfirmText.toUpperCase() !== 'PADAM'}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Sahkan Padam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selfie Inspection Modal */}
      <SelfieModal
        member={inspectMember}
        onClose={() => setInspectMember(null)}
      />
    </div>
  );
};
