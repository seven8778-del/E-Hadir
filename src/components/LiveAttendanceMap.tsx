import React, { useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Building,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Users,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Member, SessionSettings } from '../types';
import { formatCoordinates, formatDistance } from '../utils/geolocation';

interface LiveAttendanceMapProps {
  settings: SessionSettings;
  members: Member[];
  onInspectMember?: (member: Member) => void;
}

export const LiveAttendanceMap: React.FC<LiveAttendanceMapProps> = ({
  settings,
  members,
  onInspectMember,
}) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showVenueInfo, setShowVenueInfo] = useState(false);

  // Retrieve Google Maps API key from Vite environment
  const apiKey =
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
    (typeof process !== 'undefined' ? process.env?.VITE_GOOGLE_MAPS_API_KEY || '' : '') ||
    '';

  // Filter members with valid location data
  const locatedMembers = members.filter(
    (m) => m.hasAttended && m.location && m.location.latitude && m.location.longitude
  );

  const withinGeofenceCount = locatedMembers.filter(
    (m) => m.location?.isWithinGeofence
  ).length;

  const outsideGeofenceCount = locatedMembers.length - withinGeofenceCount;

  // Venue coordinates
  const venueCenter = {
    lat: settings.venueLat || 3.1531,
    lng: settings.venueLng || 101.7144,
  };

  if (!apiKey) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Kunci API Peta Belum Dikonfigurasi</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Kunci Google Maps Platform diperlukan untuk memaparkan visualisasi peta masa nyata. Tetapkan{' '}
          <code className="font-mono font-bold bg-slate-200 px-1 py-0.5 rounded text-[11px]">
            VITE_GOOGLE_MAPS_API_KEY
          </code>{' '}
          dalam persekitaran.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
      {/* Map Control Header */}
      <div className="p-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
            <span>Peta Interaktif Lokasi Dewan & Geofens Masa Nyata</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {settings.venueName || 'Dewan Utama Mesyuarat'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat: {formatCoordinates(venueCenter.lat, venueCenter.lng)} · Radius Geofens:{' '}
            <strong className="text-slate-800">{settings.geofenceRadiusMeters} meter</strong>
          </p>
        </div>

        {/* Legend Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Dalam Zon ({withinGeofenceCount})</span>
          </div>

          {outsideGeofenceCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Luar Zon ({outsideGeofenceCount})</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
            <Building className="w-3.5 h-3.5 text-emerald-900" />
            <span>Dewan Utama</span>
          </div>
        </div>
      </div>

      {/* Google Map Container with explicit height */}
      <div className="px-5">
        <div className="w-full h-96 sm:h-[460px] rounded-xl overflow-hidden border border-slate-200 relative">
          <APIProvider apiKey={apiKey}>
            <GoogleMap
              internalUsageAttributionIds={[
                'gmp_mcp_codeassist_v1_aistudio',
                'gmp_git_agentskills_v1',
              ]}
              defaultCenter={venueCenter}
              defaultZoom={16}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              {/* Central Venue Marker */}
              <AdvancedMarker
                position={venueCenter}
                onClick={() => {
                  setSelectedMember(null);
                  setShowVenueInfo(true);
                }}
                title={settings.venueName}
              >
                <div className="p-2 bg-emerald-950 text-white rounded-xl shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                  <Building className="w-5 h-5 text-emerald-300" />
                </div>
              </AdvancedMarker>

              {/* Venue InfoWindow */}
              {showVenueInfo && (
                <InfoWindow
                  position={venueCenter}
                  onCloseClick={() => setShowVenueInfo(false)}
                >
                  <div className="p-2 max-w-xs space-y-1.5 text-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                      <Building className="w-3.5 h-3.5" />
                      <span>Dewan Acara Rasmi</span>
                    </div>
                    <p className="font-extrabold text-sm text-slate-900 leading-snug">
                      {settings.venueName}
                    </p>
                    <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                      <p>
                        Zon Geofens: <strong>{settings.geofenceRadiusMeters}m</strong>
                      </p>
                      <p className="font-mono text-[11px] text-slate-500">
                        {venueCenter.lat.toFixed(5)}, {venueCenter.lng.toFixed(5)}
                      </p>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* Attendee Live Location Markers */}
              {locatedMembers.map((member) => {
                if (!member.location) return null;
                const pos = {
                  lat: member.location.latitude,
                  lng: member.location.longitude,
                };
                const isWithin = member.location.isWithinGeofence;

                return (
                  <AdvancedMarker
                    key={member.staffId}
                    position={pos}
                    onClick={() => {
                      setShowVenueInfo(false);
                      setSelectedMember(member);
                    }}
                    title={`${member.fullName} (${member.staffId})`}
                  >
                    <Pin
                      background={isWithin ? '#065f46' : '#d97706'}
                      borderColor="#ffffff"
                      glyphColor="#ffffff"
                      scale={1.05}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* Attendee InfoWindow */}
              {selectedMember && selectedMember.location && (
                <InfoWindow
                  position={{
                    lat: selectedMember.location.latitude,
                    lng: selectedMember.location.longitude,
                  }}
                  onCloseClick={() => setSelectedMember(null)}
                >
                  <div className="p-2 max-w-xs space-y-2 text-slate-800">
                    <div className="flex items-center gap-2">
                      {selectedMember.selfieUrl ? (
                        <img
                          src={selectedMember.selfieUrl}
                          alt={selectedMember.fullName}
                          className="w-10 h-10 rounded-md object-cover border border-slate-300 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                          <Users className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-bold text-emerald-950 uppercase block">
                          {selectedMember.staffId}
                        </span>
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {selectedMember.fullName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {selectedMember.department}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Masa Daftar:</span>
                        <span className="font-mono font-semibold">
                          {selectedMember.attendedAt || '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Jarak ke Dewan:</span>
                        <span className="font-bold text-slate-800">
                          ~{formatDistance(selectedMember.location.distanceFromVenueMeters)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Status Geofens:</span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            selectedMember.location.isWithinGeofence
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {selectedMember.location.isWithinGeofence
                            ? 'Dalam Zon Dewan'
                            : 'Luar Zon Dewan'}
                        </span>
                      </div>
                    </div>

                    {onInspectMember && (
                      <button
                        type="button"
                        onClick={() => onInspectMember(selectedMember)}
                        className="w-full mt-1 py-1 text-[11px] font-semibold text-emerald-900 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat Bukti Selfie</span>
                      </button>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </APIProvider>
        </div>
      </div>

      {/* Map Subtext */}
      <div className="p-5 pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <p>
          Tekan mana-mana penanda pin pada peta untuk melihat profil ahli, cap masa kehadiran, jarak dari dewan, dan foto selfie.
        </p>
        <span className="font-mono text-[10px] text-slate-400">
          Enjin: Google Maps Platform JavaScript SDK & vis.gl
        </span>
      </div>
    </div>
  );
};
