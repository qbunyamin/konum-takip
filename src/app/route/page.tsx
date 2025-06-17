'use client';

import { useEffect, useState } from 'react';
import { Box, Heading, VStack, Text } from '@chakra-ui/react';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

const LOCAL_STORAGE_KEY = 'myMapLocations';

const createColoredIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 24 24" fill="${color}" stroke="black" stroke-width="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });

// Haversine Formülü ile iki nokta arası mesafe (km)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const R = 6371;// dünya yarıçap
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Toplam rota mesafesini hesapla (sıralı nokta dizisi üzerinden)
function getTotalRouteDistance(points: [number, number][]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[i + 1];
    total += getDistance(lat1, lng1, lat2, lng2);
  }
  return total;
}

// Konumları en yakın sıraya göre sırala
function sortByDistance(from: { lat: number; lng: number }, points: Location[]) {
  return [...points].sort(
    (a, b) =>
      getDistance(from.lat, from.lng, a.lat, a.lng) -
      getDistance(from.lat, from.lng, b.lat, b.lng)
  );
}

export default function RoutePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
     if (typeof window !== 'undefined'){
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed: Location[] = JSON.parse(raw);
      setLocations(parsed);
    }
     }

  }, []);

  useEffect(() => {
      if (typeof window !== 'undefined'){
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        alert('Konum bilgisi alınamadı.');
      }
    );
  }}, []);

  const sortedLocations =
    userPosition && locations.length > 0
      ? sortByDistance(userPosition, locations)
      : locations;


     let routePoints: [number, number][] = [];

if (userPosition && sortedLocations.length > 0) {
  routePoints = [
    [userPosition.lat, userPosition.lng],
    ...sortedLocations.map((l) => [l.lat, l.lng] as [number, number]),
  ];
}


  const totalDistance = routePoints.length > 1 ? getTotalRouteDistance(routePoints) : 0;

  return (
    <VStack p={6} spacing={4} align="stretch">
      <Heading size="md"> Rota</Heading>
      {!userPosition && <Text>Konumunuz alınıyor...</Text>}

      {routePoints.length > 1 && (
        <Text fontWeight="bold" fontSize="lg">
          Toplam Mesafe: {totalDistance.toFixed(2)} km
        </Text>
      )}

      <Box h="500px" border="1px solid #ccc" borderRadius="md" overflow="hidden">
        <MapContainer
          center={userPosition || [39.9, 32.85]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userPosition && (
            <Marker
              position={userPosition}
              icon={L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                shadowSize: [41, 41],
              })}
            />
          )}

          {sortedLocations.map((loc) => (
            <Marker
              key={loc.id}
              position={{ lat: loc.lat, lng: loc.lng }}
              icon={createColoredIcon(loc.color)}
            >
              <Popup>
                <Text>
                  <b>{loc.name}</b>
                  <br />
                  {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </Text>
              </Popup>
            </Marker>
          ))}

          {routePoints.length > 1 && (
            <Polyline positions={routePoints} color="blue" />
          )}
        </MapContainer>
      </Box>
    </VStack>
  );
}
