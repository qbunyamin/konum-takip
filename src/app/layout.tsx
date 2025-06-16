// app/layout.tsx
'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
