'use client';

import { Box, Text, Button, HStack, VStack } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center" px={5}>
      <VStack gap={8} textAlign="center" maxW="420px">

        <HStack gap={2.5}>
          <Image
            src="/2.png" alt="BrazilianClean" width={32} height={32}
            style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="#0A2540" fontFamily="heading">
            Brazilian<Text as="span" color="#0A80DB">Clean</Text>
          </Text>
        </HStack>

        <Box>
          <Text fontSize="56px" fontWeight="800" color="#0A2540" fontFamily="heading" letterSpacing="-0.04em" lineHeight="1">
            500
          </Text>
          <Text fontSize="20px" fontWeight="700" color="#0A2540" fontFamily="heading" mt={3} letterSpacing="-0.02em">
            Something went wrong
          </Text>
          <Text fontSize="14px" color="#697386" fontFamily="heading" mt={2} lineHeight="1.6">
            An unexpected error occurred. Please try again or reach out to support if the problem persists.
          </Text>
          {error.digest && (
            <Text fontSize="11px" color="#CBD5E1" fontFamily="mono" mt={3}>
              Error ID: {error.digest}
            </Text>
          )}
        </Box>

        <HStack gap={3}>
          <Button
            onClick={reset}
            bg="#0A80DB" color="white" h="44px" px={6}
            borderRadius="4px" fontWeight="700" fontSize="14px" fontFamily="heading"
            _hover={{ bg: '#0870C2' }} transition="background 0.15s"
          >
            Try again
          </Button>
          <NextLink href="/">
            <Button
              variant="outline" h="44px" px={6} borderRadius="4px"
              fontWeight="700" fontSize="14px" fontFamily="heading"
              borderColor="#E3E8EE" color="#425466"
              _hover={{ bg: '#F6F9FC', borderColor: '#CBD5E1' }}
              transition="all 0.15s"
            >
              Go home
            </Button>
          </NextLink>
        </HStack>

      </VStack>
    </Box>
  );
}
