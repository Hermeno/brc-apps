'use client';

import { useState, useEffect } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Button, Input, Icon,
} from '@chakra-ui/react';
import {
  LucideArrowLeft, LucideSave, LucideUser, LucidePhone, LucideMapPin,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import { motion } from 'motion/react';
import { ImageUpload } from '@/components/image-upload';

export default function ClientProfilePage() {
  const router = useRouter();

  const [name,      setName]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [address,   setAddress]   = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/client/profile')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user) {
          setName(d.user.name ?? '');
          setPhone(d.user.phone ?? '');
          setAddress(d.user.address ?? '');
          setAvatarUrl(d.user.avatarUrl ?? '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address, avatarUrl }),
      });
      if (res.ok) {
        toaster.create({ title: 'Profile saved!', type: 'success' });
        router.push('/dashboard/client');
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally { setSaving(false); }
  };

  return (
    <Box minH="100vh" bg="slate.50">

      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="slate.100"
        px={6} py={4} position="sticky" top={0} zIndex={50}>
        <Flex align="center" gap={3} maxW="560px" mx="auto">
          <Box as="button" onClick={() => router.back()}
            display="flex" alignItems="center" gap={1.5}
            color="slate.500" cursor="pointer" _hover={{ color: 'brand.600' }}
            fontSize="sm" fontWeight="semibold" transition="color 0.15s">
            <Icon as={LucideArrowLeft} w={4} h={4} />
            Back
          </Box>
          <Box w="1px" h="20px" bg="slate.200" />
          <HStack gap={2.5}>
            <Box w="28px" h="28px" bg="#1A7FA0" style={{ borderRadius: 4 }}
              display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="800" fontSize="10px" fontFamily="heading">BC</Text>
            </Box>
            <Text fontWeight="black" fontSize="sm" color="slate.900">
              Brazilian<Text as="span" color="brand.500">Clean</Text>
            </Text>
          </HStack>
        </Flex>
      </Box>

      <Box maxW="560px" mx="auto" px={6} py={8}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <VStack gap={6} align="stretch">

            <Box>
              <Heading size="lg" fontWeight="black" color="slate.900">Edit profile</Heading>
              <Text color="slate.500" fontSize="sm" mt={1}>Your personal information</Text>
            </Box>

            {/* Avatar upload */}
            <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="4px" p={6}
              >
              <Flex align="center" gap={5}>
                <ImageUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  shape="circle"
                  size={80}
                  placeholder="Profile photo"
                />
                <Box flex={1}>
                  <Text fontWeight="bold" color="slate.800" fontSize="sm">{name || 'Your name'}</Text>
                  <Text fontSize="xs" color="slate.400" mt={0.5}>
                    Click the circle to choose a photo
                  </Text>
                  <Text fontSize="xs" color="slate.300" mt={0.5}>JPG, PNG or WEBP · max 8 MB</Text>
                </Box>
              </Flex>
            </Box>

            {/* Profile fields */}
            <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="4px" p={6}
              >
              <VStack gap={4} align="stretch">

                <Box>
                  <HStack gap={2} mb={1.5}>
                    <Icon as={LucideUser} w={4} h={4} color="brand.500" />
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" letterSpacing="wider">Full name</Text>
                  </HStack>
                  <Input
                    placeholder="Your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    bg="slate.50" border="1px solid" borderColor="slate.200"
                    h="11" borderRadius="4px" fontSize="sm"
                    _focus={{ bg: 'white', borderColor: 'brand.300' }}
                  />
                </Box>

                <Box>
                  <HStack gap={2} mb={1.5}>
                    <Icon as={LucidePhone} w={4} h={4} color="brand.500" />
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" letterSpacing="wider">Phone / WhatsApp</Text>
                  </HStack>
                  <Input
                    placeholder="(555) 555-5555"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    bg="slate.50" border="1px solid" borderColor="slate.200"
                    h="11" borderRadius="4px" fontSize="sm"
                    _focus={{ bg: 'white', borderColor: 'brand.300' }}
                  />
                </Box>

                <Box>
                  <HStack gap={2} mb={1.5}>
                    <Icon as={LucideMapPin} w={4} h={4} color="brand.500" />
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" letterSpacing="wider">Home address</Text>
                  </HStack>
                  <Input
                    placeholder="Street, number — e.g. Miami, FL"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    bg="slate.50" border="1px solid" borderColor="slate.200"
                    h="11" borderRadius="4px" fontSize="sm"
                    _focus={{ bg: 'white', borderColor: 'brand.300' }}
                  />
                </Box>
              </VStack>
            </Box>

            <Button
              bg="brand.500" color="white" h="44px" borderRadius="4px" fontWeight="bold" fontSize="md"
              _hover={{ bg: 'brand.600' }}
              transition="background 0.15s"
              loading={saving} loadingText="Saving..."
              onClick={handleSave}
              disabled={loading}>
              <Icon as={LucideSave} w={4} h={4} mr={2} />
              Save changes
            </Button>

          </VStack>
        </motion.div>
      </Box>
    </Box>
  );
}
