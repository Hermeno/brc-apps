'use client';

import {
  Box, VStack, HStack, Text, Heading, Button, Input, Container, Icon, Flex,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toaster } from '@/lib/toaster';
import { LucideArrowLeft, LucideUser, LucideMail, LucidePhone, LucideLock, LucideSave } from 'lucide-react';

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [newPassword, setNewPass] = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '');
      setEmail(session.user.email ?? '');
    }
  }, [session]);

  const handleSave = async () => {
    if (newPassword && newPassword !== confirm) {
      toaster.create({ title: 'Passwords do not match.', type: 'error' }); return;
    }
    if (newPassword && newPassword.length < 6) {
      toaster.create({ title: 'Password must be at least 6 characters.', type: 'error' }); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, newPassword: newPassword || undefined }),
      });
      if (!res.ok) throw new Error('Error saving');
      toaster.create({ title: 'Profile updated successfully.', type: 'success' });
      setNewPass(''); setConfirm('');
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="slate.50">
      <Box bg="white" borderBottom="1px solid" borderColor="slate.100" position="sticky" top={0} zIndex={50}>
        <Container maxW="2xl" py={4}>
          <Flex align="center" gap={3}>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')} borderRadius="4px">
              <Icon as={LucideArrowLeft} w={4} h={4} mr={1} /> Admin panel
            </Button>
            <Text fontWeight="black" color="slate.900">My profile</Text>
          </Flex>
        </Container>
      </Box>

      <Container maxW="2xl" py={10}>
        <Box bg="white" border="1px solid" borderColor="slate.200" p={8}>
          <VStack gap={6} align="stretch">
            <Heading size="md" fontWeight="black" color="slate.900">Personal information</Heading>

            <Box>
              <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" mb={2}>Name</Text>
              <HStack><Icon as={LucideUser} w={4} h={4} color="slate.400" />
                <Input value={name} onChange={e => setName(e.target.value)} bg="slate.50"
                  border="1px solid" borderColor="slate.200" h="11" borderRadius="4px"
                  _focus={{ bg: 'white', borderColor: 'brand.300' }} />
              </HStack>
            </Box>

            <Box>
              <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" mb={2}>Email</Text>
              <HStack><Icon as={LucideMail} w={4} h={4} color="slate.400" />
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" bg="slate.50"
                  border="1px solid" borderColor="slate.200" h="11" borderRadius="4px"
                  _focus={{ bg: 'white', borderColor: 'brand.300' }} />
              </HStack>
            </Box>

            <Box>
              <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" mb={2}>Phone</Text>
              <HStack><Icon as={LucidePhone} w={4} h={4} color="slate.400" />
                <Input value={phone} onChange={e => setPhone(e.target.value)} bg="slate.50"
                  border="1px solid" borderColor="slate.200" h="11" borderRadius="4px"
                  _focus={{ bg: 'white', borderColor: 'brand.300' }} />
              </HStack>
            </Box>

            <Box borderTop="1px solid" borderColor="slate.100" pt={5}>
              <Heading size="sm" fontWeight="black" color="slate.900" mb={4}>Change password</Heading>
              <VStack gap={3} align="stretch">
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" mb={2}>New password</Text>
                  <HStack><Icon as={LucideLock} w={4} h={4} color="slate.400" />
                    <Input type="password" value={newPassword} onChange={e => setNewPass(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="4px"
                      _focus={{ bg: 'white', borderColor: 'brand.300' }} />
                  </HStack>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" mb={2}>Confirm password</Text>
                  <HStack><Icon as={LucideLock} w={4} h={4} color="slate.400" />
                    <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="4px"
                      _focus={{ bg: 'white', borderColor: 'brand.300' }} />
                  </HStack>
                </Box>
              </VStack>
            </Box>

            <Button onClick={handleSave} loading={loading} loadingText="Saving changes..."
              bg="brand.500" color="white" h="11" borderRadius="4px" fontWeight="bold"
              _hover={{ bg: 'brand.600' }}>
              <Icon as={LucideSave} mr={2} /> Save changes
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
