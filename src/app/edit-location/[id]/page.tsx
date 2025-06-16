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
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

const LOCAL_STORAGE_KEY = 'myMapLocations';

export default function EditLocationPage() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const id = params.get('id');

  const [location, setLocation] = useState<Location | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');

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
    } 
  }, [id]);

  // Güncelle
  const handleSave = () => {
    if (!location) return;

    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return;

    const parsed: Location[] = JSON.parse(raw);
    const updated = parsed.map((loc) =>
      loc.id === location.id ? { ...loc, name, color } : loc
    );

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    toast({
      title: 'Konum güncellendi.',
      status: 'success',
      duration: 1500,
    });

    router.push('/locations');
  };

  if (!location) {
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

      <Button colorScheme="green" onClick={handleSave}>
        Kaydet
      </Button>
    </VStack>
  );
}
