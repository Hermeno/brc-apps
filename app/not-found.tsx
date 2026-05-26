import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';

export default function NotFound() {
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
            404
          </Text>
          <Text fontSize="20px" fontWeight="700" color="#0A2540" fontFamily="heading" mt={3} letterSpacing="-0.02em">
            Page not found
          </Text>
          <Text fontSize="14px" color="#697386" fontFamily="heading" mt={2} lineHeight="1.6">
            The page you're looking for doesn't exist or has been moved.
          </Text>
        </Box>

        <NextLink href="/">
          <Box
            as="button"
            bg="#0A80DB" color="white" h="44px" px={8}
            borderRadius="4px" fontWeight="700" fontSize="14px" fontFamily="heading"
            display="inline-flex" alignItems="center" justifyContent="center"
            style={{ transition: 'background 0.15s', cursor: 'pointer' }}
            _hover={{ bg: '#0870C2' }}
          >
            Back to home
          </Box>
        </NextLink>

      </VStack>
    </Box>
  );
}
