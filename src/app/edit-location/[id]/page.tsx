'use client';

import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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

function LocationSelector({ onSelect }: { onSelect: (latlng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

export default function EditLocationPage() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams();
  const id = params.id as string;

  const [location, setLocation] = useState<Location | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Konumu localStorage'tan bul
  useEffect(() => {
    if (!id) return;

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;

    const parsed: Location[] = JSON.parse(raw);
    const found = parsed.find((loc) => loc.id === id);
    if (found) {
      setLocation(found);
      setName(found.name);
      setColor(found.color);
      setPosition({ lat: found.lat, lng: found.lng });
    }
  }, [id]);

  // Güncelle
  const handleSave = () => {
    if (!location || !position) return;

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;

    const parsed: Location[] = JSON.parse(raw);
    const updated = parsed.map((loc) =>
      loc.id === location.id
        ? { ...loc, name, color, lat: position.lat, lng: position.lng }
        : loc
    );

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    toast({
      title: 'Konum güncellendi.',
      status: 'success',
      duration: 1500,
    });

    router.push('/locations');
  };

  if (!location || !position) {
    return (
      <Box p={6}>
        <Text>Konum bulunamadı.</Text>
      </Box>
    );
  }

  return (
    <VStack p={6} spacing={4} align="stretch">
      <Heading size="md">🛠 Konum Düzenle</Heading>

      <Input
        placeholder="Konum Adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />

      <Box h="300px" w="100%" border="1px solid #ccc" borderRadius="md" overflow="hidden">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          />
          <LocationSelector onSelect={(latlng) => setPosition(latlng)} />
          <Marker position={position} icon={createColoredIcon(color)} />
        </MapContainer>
      </Box>

      <Button colorScheme="green" onClick={handleSave}>
        Kaydet
      </Button>
    </VStack>
  );
}
