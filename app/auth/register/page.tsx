'use client';

import {
  Box, Heading, Text, VStack, HStack, Input, Button, Container, SimpleGrid, Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { motion } from 'motion/react';
import { LucideUser, LucideBrush } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'CLIENT' | 'CLEANER'>('CLIENT');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (res.ok) {
        toaster.create({ title: 'Account created!', description: 'Check your email to activate your account.', type: 'success' });
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      toaster.create({ title: 'Error', description: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center"
      px={4} position="relative" overflow="hidden">
      <Box position="fixed" top="-100px" right="-100px" w="450px" h="450px"
        bg="brand.50" borderRadius="full" filter="blur(80px)" opacity={0.7} zIndex={0} />
      <Box position="fixed" bottom="-80px" left="-80px" w="400px" h="400px"
        bg="yellow.50" borderRadius="full" filter="blur(80px)" opacity={0.7} zIndex={0} />
      <Box position="fixed" top="40%" right="10%" w="300px" h="300px"
        bg="green.50" borderRadius="full" filter="blur(80px)" opacity={0.5} zIndex={0} />

      <Container maxW="md" position="relative" zIndex={1}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}>
          <VStack gap={8} align="stretch">

            <VStack gap={3} textAlign="center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}>
                <HStack justify="center" gap={3}>
                  <Box w="44px" h="44px" bgGradient="to-br" gradientFrom="brand.500" gradientTo="brand.700"
                    borderRadius="xl" display="flex" alignItems="center" justifyContent="center"
                    boxShadow="0 6px 20px rgba(37,99,235,0.35)">
                    <Text color="white" fontWeight="black" fontSize="md">BC</Text>
                  </Box>
                  <Text fontWeight="black" fontSize="xl" letterSpacing="tight" color="slate.900">
                    Brazilian<Text as="span" color="brand.500">Clean</Text>
                  </Text>
                </HStack>
              </motion.div>
              <Heading size="xl" fontWeight="black" letterSpacing="tight" color="slate.900">
                Create free account
              </Heading>
              <Text color="slate.500">Join the #1 Brazilian cleaning platform in the US.</Text>
            </VStack>

            <Box bg="white" p={8} borderRadius="3xl"
              boxShadow="0 4px 40px rgba(0,0,0,0.08)" border="1px solid" borderColor="slate.100">
              <form onSubmit={handleRegister}>
                <VStack gap={5} align="stretch">

                  {/* Role selector */}
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" mb={3} letterSpacing="wider">I am a…</Text>
                    <SimpleGrid columns={2} gap={3}>
                      <motion.div whileTap={{ scale: 0.97 }}>
                        <Button onClick={() => setRole('CLIENT')}
                          bg={role === 'CLIENT' ? 'brand.500' : 'slate.50'}
                          color={role === 'CLIENT' ? 'white' : 'slate.600'}
                          borderRadius="xl" h="14" fontWeight="bold" fontSize="sm"
                          border="2px solid" borderColor={role === 'CLIENT' ? 'brand.500' : 'slate.200'}
                          _hover={{ bg: role === 'CLIENT' ? 'brand.600' : 'slate.100' }}
                          transition="all 0.2s" w="full" flexDirection="column" gap={1}>
                          <Icon as={LucideUser} w={5} h={5} />
                          <Text fontSize="xs">Customer</Text>
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.97 }}>
                        <Button onClick={() => setRole('CLEANER')}
                          bg={role === 'CLEANER' ? 'green.500' : 'slate.50'}
                          color={role === 'CLEANER' ? 'white' : 'slate.600'}
                          borderRadius="xl" h="14" fontWeight="bold" fontSize="sm"
                          border="2px solid" borderColor={role === 'CLEANER' ? 'green.500' : 'slate.200'}
                          _hover={{ bg: role === 'CLEANER' ? 'green.600' : 'slate.100' }}
                          transition="all 0.2s" w="full" flexDirection="column" gap={1}>
                          <Icon as={LucideBrush} w={5} h={5} />
                          <Text fontSize="xs">Profissional</Text>
                        </Button>
                      </motion.div>
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" mb={2} letterSpacing="wider">Full name</Text>
                    <Input placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)}
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="12" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
                      transition="all 0.2s" required />
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" mb={2} letterSpacing="wider">Email</Text>
                    <Input placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)}
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="12" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
                      transition="all 0.2s" required />
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" mb={2} letterSpacing="wider">Password</Text>
                    <Input type="password" placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)}
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="12" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
                      transition="all 0.2s" required />
                  </Box>

                  <Button type="submit" bg={role === 'CLEANER' ? 'green.500' : 'brand.500'} color="white"
                    h="12" borderRadius="xl" fontWeight="bold"
                    _hover={{ bg: role === 'CLEANER' ? 'green.600' : 'brand.600', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }}
                    transition="all 0.2s" loading={loading} loadingText="Creating account…">
                    {role === 'CLEANER' ? 'Criar conta no BrazilianClean' : 'Create account on BrazilianClean'}
                  </Button>

                </VStack>
              </form>
            </Box>

            <Text textAlign="center" fontSize="sm" color="slate.500">
              Already have an account?{' '}
              <NextLink href="/auth/login">
                <Text as="span" color="brand.500" fontWeight="bold" cursor="pointer"
                  _hover={{ color: 'brand.600' }}>Sign in</Text>
              </NextLink>
            </Text>

          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
}
