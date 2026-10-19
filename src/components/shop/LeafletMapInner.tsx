'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset paths
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Smoothly fly map to coordinates when lat/lng change
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), {
        animate: true,
        duration: 1.2,
      });
    }
  }, [lat, lng, map]);

  return null;
}

// Allow user to click anywhere on map to drop the pin
function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
}

interface LeafletMapInnerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export default function LeafletMapInner({
  latitude,
  longitude,
  onChange,
}: LeafletMapInnerProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapRecenter lat={latitude} lng={longitude} />
      <MapClickHandler onPick={onChange} />

      <Marker
        position={[latitude, longitude]}
        icon={customIcon}
        draggable={true}
        eventHandlers={{
          dragend: (e: any) => {
            const marker = e.target;
            const pos = marker.getLatLng();
            onChange(
              parseFloat(pos.lat.toFixed(6)),
              parseFloat(pos.lng.toFixed(6))
            );
          },
        }}
      />
    </MapContainer>
  );
}
