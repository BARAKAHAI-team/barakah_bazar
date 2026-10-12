'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Dynamic import of Leaflet components without SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

interface AddressMapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export const AddressMapPicker: React.FC<AddressMapPickerProps> = ({
  latitude,
  longitude,
  onChange,
}) => {
  const [mounted, setMounted] = useState(false);
  const [leafletIcon, setLeafletIcon] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Fix leaflet default marker issue in bundlers
    import('leaflet').then((L) => {
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setLeafletIcon(icon);
    });
  }, []);

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onChange(
            parseFloat(pos.coords.latitude.toFixed(6)),
            parseFloat(pos.coords.longitude.toFixed(6))
          );
        },
        () => {
          // Gracefully handle denial
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--ink-muted)] flex items-center gap-1 font-medium">
          <MapPin size={14} /> Pin Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleUseCurrentLocation}
          className="text-xs"
        >
          <Navigation size={12} className="mr-1" /> Use My Current Location
        </Button>
      </div>

      <div className="w-full h-56 bg-[var(--bg)] border border-[var(--line)] rounded-[2px] overflow-hidden relative">
        {mounted && (
          <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {leafletIcon && (
              <Marker
                position={[latitude, longitude]}
                icon={leafletIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e: any) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    onChange(
                      parseFloat(position.lat.toFixed(6)),
                      parseFloat(position.lng.toFixed(6))
                    );
                  },
                }}
              />
            )}
          </MapContainer>
        )}
      </div>
      <p className="text-[11px] text-[var(--ink-muted)] m-0">
        Drag the pin to adjust your precise doorstep coordinates for delivery partners.
      </p>
    </div>
  );
};
