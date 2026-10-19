'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Dynamically import map canvas without SSR to prevent window undefined in Next.js
const LeafletMapInner = dynamic(
  () => import('./LeafletMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF7F0] text-[#736B5E] text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-[#B98725] mb-2" />
        <span>Loading interactive map...</span>
      </div>
    ),
  }
);

export interface GeoLocationResult {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  pincode?: string;
  line1?: string;
  displayName?: string;
}

interface AddressMapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  onLocationFound?: (location: GeoLocationResult) => void;
}

export const AddressMapPicker: React.FC<AddressMapPickerProps> = ({
  latitude,
  longitude,
  onChange,
  onLocationFound,
}) => {
  const [locating, setLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setStatusMessage({
        text: 'Geolocation is not supported by your browser.',
        type: 'error',
      });
      return;
    }

    setLocating(true);
    setStatusMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));

        // 1. Update map coordinates (this triggers map.flyTo recentering)
        onChange(lat, lng);

        // 2. Reverse geocode to auto-fill City, State, and Pincode
        try {
          const res = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.ok && data.address) {
              const { city, state, pincode, line1, displayName } = data.address;

              // Pass auto-filled values to parent form
              onLocationFound?.({
                lat,
                lng,
                city,
                state,
                pincode,
                line1,
                displayName,
              });

              const locationLabel = [city, state, pincode].filter(Boolean).join(', ');
              setStatusMessage({
                text: locationLabel ? `Located: ${locationLabel}` : 'Location detected!',
                type: 'success',
              });
            }
          } else {
            setStatusMessage({
              text: 'Coordinates updated! Please confirm city and pincode.',
              type: 'success',
            });
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
          setStatusMessage({
            text: 'Coordinates updated!',
            type: 'success',
          });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err);
        let msg = 'Could not get your location. Please check location permissions.';
        if (err.code === 1) msg = 'Location permission was denied in your browser.';
        setStatusMessage({ text: msg, type: 'error' });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Top Bar with coordinates and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <span className="text-[var(--ink-muted)] flex items-center gap-1 font-mono">
          <MapPin size={13} className="text-[#B98725]" />
          <span>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </span>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={locating}
          onClick={handleUseCurrentLocation}
          className="text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          {locating ? (
            <>
              <Loader2 size={13} className="animate-spin text-[#B98725]" />
              <span>Locating & Auto-Filling...</span>
            </>
          ) : (
            <>
              <Navigation size={13} className="text-[#0F3E2E]" />
              <span>Use My Current Location</span>
            </>
          )}
        </Button>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`px-3 py-1.5 rounded text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle size={13} className="text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Map Canvas Container */}
      <div className="w-full h-64 bg-[#FAF7F0] border border-[var(--line)] rounded-lg overflow-hidden relative shadow-xs">
        <LeafletMapInner
          latitude={latitude}
          longitude={longitude}
          onChange={(newLat, newLng) => {
            onChange(newLat, newLng);
            // Also trigger reverse geocode on marker drag or click
            fetch(`/api/geo/reverse?lat=${newLat}&lng=${newLng}`)
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => {
                if (data?.ok && data?.address) {
                  const { city, state, pincode, line1, displayName } = data.address;
                  onLocationFound?.({
                    lat: newLat,
                    lng: newLng,
                    city,
                    state,
                    pincode,
                    line1,
                    displayName,
                  });
                  const locationLabel = [city, state, pincode].filter(Boolean).join(', ');
                  if (locationLabel) {
                    setStatusMessage({
                      text: `Pin moved to: ${locationLabel}`,
                      type: 'success',
                    });
                  }
                }
              })
              .catch(() => {});
          }}
        />
      </div>

      <p className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1.5 m-0">
        <span>💡 Click anywhere on the map or drag the pin to adjust your exact doorstep delivery spot.</span>
      </p>
    </div>
  );
};
