'use client';

import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

//Konum tipi
interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

const LOCAL_STORAGE_KEY = 'myMapLocations';

//Harita tıklama componenti
function LocationSelector({
  onSelect,
}: {
  onSelect: (latlng: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}


// chart.googleapis.com üzerinden de yapabilrdim ancak ikon sorunu vardı bu yüzden svg yaptım
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


// Sayfa
export default function AddLocationPage() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ff0000');
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locations, setLocations] = useState<LocationData[]>([]);

  //localStorage'tan yükle
useEffect(() => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) setLocations(JSON.parse(raw));
  }
}, []);

  //localStorage'a yaz
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(locations));
  }
}, [locations]);


  // Kaydet
  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Konum adı boş olamaz.',
        status: 'warning',
        duration: 2000,
      });
      return;
    }
    if (!position) {
      toast({
        title: 'Haritadan konum seçmelisiniz.',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    const newLocation: LocationData = {
      id: crypto.randomUUID(),
      name: name.trim(),
      lat: position.lat,
      lng: position.lng,
      color,
    };

    setLocations([...locations, newLocation]);
    setName('');
    setColor('#ff0000');
    setPosition(null);

    toast({
      title: 'Konum kaydedildi.',
      status: 'success',
      duration: 1500,
    });
  };

  return (
    <VStack spacing={4} p={6} align="stretch">
      <Heading fontSize="2xl"> Konum Ekle</Heading>

      <Input
        placeholder="Konum Adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <InputGroup maxW="250px">
        <InputLeftElement pointerEvents="none">
          <Text fontSize="sm" px={2}>
            Renk
          </Text>
        </InputLeftElement>
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          pl="40px"
        />
      </InputGroup>

      <Box h="400px" border="1px solid #ccc" borderRadius="md" overflow="hidden">
        <MapContainer
          center={[39.925533, 32.866287]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector
            onSelect={(latlng) => {
              setPosition(latlng);
            }}
          />
          {position && (
            <Marker position={position} icon={createColoredIcon(color)}>
              <Popup>{name || 'Yeni Konum'}</Popup>
            </Marker>
          )}
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={{ lat: loc.lat, lng: loc.lng }}
              icon={createColoredIcon(loc.color)}
            >
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      <Button colorScheme="blue" onClick={handleSave}>
        Kaydet
      </Button>

      <Box>
        <Heading size="md" mt={6} mb={2}>
           Kaydedilen Konumlar
        </Heading>
        {locations.length === 0 ? (
          <Text>Henüz konum eklenmedi.</Text>
        ) : (
          <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
            {locations.map((loc) => (
              <HStack
                key={loc.id}
                border="1px solid #ccc"
                borderRadius="md"
                p={2}
                justify="space-between"
              >
                <Box>
                  <Text fontWeight="bold">{loc.name}</Text>
                  <Text fontSize="sm">
                    {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </Text>
                </Box>
                <Box
                  w="20px"
                  h="20px"
                  bg={loc.color}
                  borderRadius="sm"
                  border="1px solid #000"
                />
              </HStack>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
