'use client';

import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Container,
  SimpleGrid,
  Icon,
  Circle,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { LucideArrowRight, LucideCheckCircle, LucideShield, LucideTrendingUp, LucideStar } from 'lucide-react';
import NextLink from 'next/link';
import { motion } from 'motion/react';

const MotionBox  = motion.div;
const MotionSpan = motion.span;

export default function HomePage() {
  return (
    <Box bg="white" minH="100vh" overflow="hidden">

      {/* ── Header ── */}
      <Box
        borderBottom="1px solid"
        borderColor="slate.100"
        position="sticky"
        top={0}
        zIndex={50}
        bg="white"
        backdropFilter="blur(12px)"
      >
        <Container maxW="7xl" py={4}>
          <Flex justify="space-between" align="center">
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HStack gap={3}>
                <Box
                  w="36px" h="36px"
                  bgGradient="to-br"
                  gradientFrom="brand.500"
                  gradientTo="brand.700"
                  borderRadius="xl"
                  display="flex" alignItems="center" justifyContent="center"
                  boxShadow="0 4px 12px rgba(37,99,235,0.35)"
                >
                  <Text color="white" fontWeight="black" fontSize="sm">BC</Text>
                </Box>
                <Text fontWeight="black" fontSize="lg" letterSpacing="tight" color="slate.900">
                  Brazilian<Text as="span" color="brand.500">Clean</Text>
                </Text>
              </HStack>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HStack gap={4}>
                <NextLink href="/auth/login">
                  <Text fontSize="sm" fontWeight="semibold" color="slate.600" cursor="pointer" _hover={{ color: 'brand.500' }} transition="color 0.2s">
                    Entrar
                  </Text>
                </NextLink>
                <NextLink href="/auth/register">
                  <Button
                    bg="brand.500" color="white" size="sm" px={5} borderRadius="full"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}
                    transition="all 0.2s"
                  >
                    Criar conta grátis
                  </Button>
                </NextLink>
              </HStack>
            </MotionBox>
          </Flex>
        </Container>
      </Box>

      {/* ── Hero ── */}
      <Box position="relative" overflow="hidden">
        {/* background blobs */}
        <Box position="absolute" top="-100px" left="-100px" w="500px" h="500px"
          bg="brand.50" borderRadius="full" filter="blur(80px)" opacity={0.7} />
        <Box position="absolute" top="50px" right="-80px" w="400px" h="400px"
          bg="yellow.50" borderRadius="full" filter="blur(80px)" opacity={0.8} />

        <Container maxW="7xl" pt={28} pb={36} position="relative">
          <VStack gap={8} align="center" textAlign="center" maxW="3xl" mx="auto">

            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge
                bg="brand.50" color="brand.600"
                px={4} py={1.5} borderRadius="full"
                fontSize="xs" fontWeight="bold" letterSpacing="widest"
                border="1px solid" borderColor="brand.100"
              >
               PLATAFORMA #1 DE LIMPEZA DO BRASIL
              </Badge>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Heading
                size="5xl" fontWeight="black"
                letterSpacing="tight" lineHeight="1.1"
                color="slate.900"
              >
                Limpeza profissional{' '}
                <Text as="span"
                  bgGradient="to-r"
                  gradientFrom="brand.500"
                  gradientTo="brand.700"
                  bgClip="text"
                >
                  na sua porta
                </Text>
              </Heading>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Text fontSize="xl" color="slate.500" maxW="2xl" lineHeight="tall">
                Conectamos você aos melhores profissionais de limpeza verificados da sua região. Rápido, seguro e garantido.
              </Text>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <HStack gap={4} mt={2} flexWrap="wrap" justify="center">
                <NextLink href="/auth/register">
                  <Button
                    bg="brand.500" color="white" size="xl"
                    px={10} h="14" borderRadius="full"
                    fontSize="md" fontWeight="bold"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}
                    transition="all 0.25s"
                  >
                    Solicitar limpeza agora
                    <Icon as={LucideArrowRight} ml={2} />
                  </Button>
                </NextLink>
                <NextLink href="/auth/register">
                  <Button
                    variant="outline"
                    borderColor="yellow.400" color="yellow.600"
                    size="xl" px={10} h="14" borderRadius="full"
                    fontSize="md" fontWeight="bold"
                    _hover={{ bg: 'yellow.50', transform: 'translateY(-2px)' }}
                    transition="all 0.25s"
                  >
                    Sou profissional
                  </Button>
                </NextLink>
              </HStack>
            </MotionBox>

            {/* Trust badges */}
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <HStack gap={6} color="slate.400" fontSize="sm" flexWrap="wrap" justify="center">
                <HStack gap={1.5}>
                  <Icon as={LucideStar} w={4} h={4} color="yellow.500" />
                  <Text>4.9/5 avaliação média</Text>
                </HStack>
                <Text color="slate.200">|</Text>
                <HStack gap={1.5}>
                  <Icon as={LucideCheckCircle} w={4} h={4} color="green.500" />
                  <Text>Profissionais verificados</Text>
                </HStack>
                <Text color="slate.200">|</Text>
                <HStack gap={1.5}>
                  <Icon as={LucideShield} w={4} h={4} color="brand.400" />
                  <Text>100% garantido</Text>
                </HStack>
              </HStack>
            </MotionBox>

          </VStack>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box bg="slate.50" py={24} borderTop="1px solid" borderColor="slate.100">
        <Container maxW="7xl">
          <VStack gap={12}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <VStack gap={3} textAlign="center">
                <Heading size="2xl" fontWeight="black" color="slate.900">
                  Por que escolher a BrazilianClean?
                </Heading>
                <Text color="slate.500" fontSize="lg">Tecnologia e cuidado para a sua casa</Text>
              </VStack>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} w="full">
              {[
                {
                  icon: LucideTrendingUp,
                  iconBg: 'brand.50',
                  iconColor: 'brand.500',
                  title: 'Distribuição por Ondas',
                  desc: 'Nosso sistema garante que os melhores profissionais recebam os pedidos primeiro.',
                },
                {
                  icon: LucideCheckCircle,
                  iconBg: 'green.50',
                  iconColor: 'green.500',
                  title: 'Profissionais Verificados',
                  desc: 'Todos os profissionais passam por verificação e são avaliados pela comunidade.',
                },
                {
                  icon: LucideShield,
                  iconBg: 'yellow.50',
                  iconColor: 'yellow.500',
                  title: 'Pagamento Seguro',
                  desc: 'Processamento integrado com Stripe. Pague com segurança pelo serviço.',
                },
              ].map((item, i) => (
                <MotionBox
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  <Box
                    bg="white" p={8} borderRadius="2xl"
                    border="1px solid" borderColor="slate.100"
                    boxShadow="sm"
                    _hover={{ boxShadow: 'md', transform: 'translateY(-4px)', borderColor: 'brand.100' }}
                    transition="all 0.25s"
                    h="full"
                  >
                    <VStack align="start" gap={4}>
                      <Circle size="52px" bg={item.iconBg}>
                        <Icon as={item.icon} w={6} h={6} color={item.iconColor} />
                      </Circle>
                      <Heading size="md" color="slate.900">{item.title}</Heading>
                      <Text color="slate.500" lineHeight="relaxed">{item.desc}</Text>
                    </VStack>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box py={20}>
        <Container maxW="3xl">
          <MotionBox
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Box
              bgGradient="to-br"
              gradientFrom="brand.500"
              gradientTo="brand.700"
              borderRadius="3xl"
              p={12}
              textAlign="center"
              color="white"
              position="relative"
              overflow="hidden"
            >
              <Box position="absolute" top="-60px" right="-60px" w="200px" h="200px"
                bg="white" opacity={0.05} borderRadius="full" />
              <Box position="absolute" bottom="-40px" left="-40px" w="160px" h="160px"
                bg="yellow.400" opacity={0.15} borderRadius="full" filter="blur(40px)" />
              <VStack gap={5} position="relative">
                <Heading size="2xl" fontWeight="black">Pronto para começar?</Heading>
                <Text color="brand.100" fontSize="lg">
                  Crie sua conta grátis e receba seu primeiro profissional em minutos.
                </Text>
                <NextLink href="/auth/register">
                  <Button
                    bg="white" color="brand.600"
                    size="xl" px={10} h="14"
                    borderRadius="full" fontWeight="bold"
                    _hover={{ bg: 'brand.50', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    Começar agora — é grátis
                  </Button>
                </NextLink>
              </VStack>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box py={10} borderTop="1px solid" borderColor="slate.100">
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <HStack gap={2}>
              <Box w="24px" h="24px" bg="brand.500" borderRadius="md"
                display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontWeight="black" fontSize="9px">BC</Text>
              </Box>
              <Text fontSize="sm" color="slate.400">© 2026 BrazilianClean. Todos os direitos reservados.</Text>
            </HStack>
            <HStack gap={6}>
              <Text fontSize="sm" color="slate.400" cursor="pointer" _hover={{ color: 'brand.500' }}>Termos</Text>
              <Text fontSize="sm" color="slate.400" cursor="pointer" _hover={{ color: 'brand.500' }}>Privacidade</Text>
            </HStack>
          </Flex>
        </Container>
      </Box>

    </Box>
  );
}
