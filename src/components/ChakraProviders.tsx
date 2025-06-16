'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ReactNode } from 'react';

const theme = extendTheme({});

export default function ChakraProviders({ children }: { children: ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
