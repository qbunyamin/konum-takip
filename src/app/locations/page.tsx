'use client';

import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FiEdit } from 'react-icons/fi';
import { useEffect, useState } from 'react';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

const LOCAL_STORAGE_KEY = 'myMapLocations';

export default function LocationListPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      setLocations(JSON.parse(raw));
    }
  }, []);

  return (
    <VStack p={6} align="stretch" spacing={4}>
      <HStack justify="space-between">
        <Heading size="md">Konum Listesi (Konum bilgisi için satıra tıkla!)</Heading>
        <Button colorScheme="blue" onClick={() => router.push('/route')}>
          Rota Göster
        </Button>
      </HStack>

      {locations.length === 0 ? (
        <Text>Hiç konum eklenmemiş.</Text>
      ) : (
        locations.map((loc) => (
          <HStack
            key={loc.id}
            p={3}
            border="1px solid #ccc"
            borderRadius="md"
            justify="space-between"
            align="center"
            onClick={() =>
              setSelectedId((prev) => (prev === loc.id ? null : loc.id))
            }
            cursor="pointer"
            _hover={{ bg: 'gray.50' }}
          >
            <HStack spacing={3}>
              <Box
                w="20px"
                h="20px"
                bg={loc.color}
                borderRadius="full"
                border="1px solid #000"
              />
              <Text fontWeight="medium">{loc.name}</Text>
              {selectedId === loc.id && (
                <Text fontSize="sm" color="gray.600">
                  ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
                </Text>
              )}
            </HStack>
            <IconButton
              aria-label="Düzenle"
              icon={<FiEdit />}
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation(); // üstteki HStack onClick'i tetiklemesin
                router.push(`/edit-location/${loc.id}`);
              }}
            />
          </HStack>
        ))
      )}
    </VStack>
  );
}
