'use client';

import { Box, Text, Button, HStack, VStack, Flex, Icon, SimpleGrid } from '@chakra-ui/react';
import { LucideArrowRight, LucideCheckCircle, LucideShield, LucideTrendingUp, LucideStar, LucideMapPin, LucideCalendar, LucideMessageCircle } from 'lucide-react';
import NextLink from 'next/link';

export default function HomePage() {
  return (
    <Box bg="white" minH="100vh">

      {/* ── Navbar ── */}
      <Box
        position="fixed" top={0} left={0} right={0} zIndex={100} h="64px"
        style={{ background: 'rgba(11,17,32,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Flex align="center" h="full" px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto" justify="space-between">
          <HStack gap={2.5}>
            <Box w="32px" h="32px" bg="#1A7FA0" style={{ borderRadius: 6 }}
              display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="800" fontSize="11px" letterSpacing="-0.02em" fontFamily="heading">BC</Text>
            </Box>
            <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="white" fontFamily="heading">
              Brazilian<Text as="span" color="#1A7FA0">Clean</Text>
            </Text>
          </HStack>

          <HStack gap={2}>
            <NextLink href="/auth/register?role=cleaner">
              <Button
                size="sm" variant="outline" borderColor="rgba(255,255,255,0.18)" color="white"
                borderRadius="4px" fontWeight="600" fontSize="13px" fontFamily="heading"
                _hover={{ bg: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.35)' }}
                h="34px" px={4}
              >
                Become a cleaner
              </Button>
            </NextLink>
            <NextLink href="/auth/login">
              <Button
                size="sm" bg="#1A7FA0" color="white"
                borderRadius="4px" fontWeight="600" fontSize="13px" fontFamily="heading"
                _hover={{ bg: '#15698A' }} h="34px" px={4}
              >
                Sign in
              </Button>
            </NextLink>
          </HStack>
        </Flex>
      </Box>

      {/* ── Hero ── */}
      <Box position="relative" minH="100vh" display="flex" alignItems="center">
        <Box
          position="absolute" inset={0}
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1800&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <Box position="absolute" inset={0} style={{
          background: 'linear-gradient(180deg, rgba(11,17,32,0.82) 0%, rgba(11,17,32,0.65) 50%, rgba(11,17,32,0.78) 100%)',
        }} />

        <Box position="relative" w="full" px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto" pt="120px" pb="80px">
          <Box maxW="640px">

            <Text
              display="inline-block" mb={5}
              fontSize="10.5px" fontWeight="700" letterSpacing="0.14em"
              color="#1A7FA0" textTransform="uppercase" fontFamily="heading"
              style={{ borderLeft: '2px solid #1A7FA0', paddingLeft: 10 }}
            >
              The trusted cleaning platform
            </Text>

            <Text
              as="h1"
              fontSize={{ base: '38px', md: '52px', lg: '60px' }}
              fontWeight="800" lineHeight="1.08" letterSpacing="-0.03em"
              color="white" fontFamily="heading" mb={6}
            >
              A spotless home,{' '}
              <Text as="span" color="#1A7FA0">on your schedule</Text>
            </Text>

            <Text
              fontSize={{ base: '16px', md: '18px' }} color="rgba(255,255,255,0.72)"
              lineHeight="1.65" mb={10} maxW="520px" fontFamily="heading"
            >
              Connect with background-checked cleaners near you.
              Book in minutes, relax all day.
            </Text>

            <HStack gap={3} flexWrap="wrap" mb={14}>
              <NextLink href="/request">
                <Button
                  bg="#1A7FA0" color="white" h="48px" px={7}
                  borderRadius="4px" fontWeight="700" fontSize="14px" fontFamily="heading"
                  _hover={{ bg: '#15698A' }} transition="background 0.15s"
                >
                  Book a cleaning
                  <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
                </Button>
              </NextLink>
            </HStack>

            <HStack gap={0} divideX="1px" divideColor="rgba(255,255,255,0.15)" flexWrap="wrap">
              {[
                { icon: LucideStar,        color: '#FCD34D', text: '4.9 average rating' },
                { icon: LucideCheckCircle, color: '#34D399', text: 'Vetted cleaners' },
                { icon: LucideShield,      color: '#60A5FA', text: 'Secure payment' },
              ].map(item => (
                <HStack key={item.text} gap={1.5} px={4} py={1} _first={{ pl: 0 }}>
                  <Icon as={item.icon} w="13px" h="13px" color={item.color} />
                  <Text fontSize="12.5px" color="rgba(255,255,255,0.65)" fontFamily="heading">{item.text}</Text>
                </HStack>
              ))}
            </HStack>

          </Box>
        </Box>
      </Box>

      {/* ── How it works ── */}
      <Box bg="#F8FAFC" borderTop="1px solid #E2E8F0" borderBottom="1px solid #E2E8F0">
        <Box px={{ base: 5, md: 10, lg: 16 }} py={20} maxW="1440px" mx="auto">

          <Box mb={12}>
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="#1A7FA0"
              textTransform="uppercase" fontFamily="heading" mb={2}>
              How it works
            </Text>
            <Text fontSize={{ base: '26px', md: '32px' }} fontWeight="800" color="#0B1120"
              fontFamily="heading" letterSpacing="-0.025em">
              Book a cleaner in under 2 minutes
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={0}>
            {[
              {
                n: '01', icon: LucideCalendar, color: '#1A7FA0',
                title: 'Book in minutes',
                desc: 'Choose your cleaning type, enter your address, and pick a date. Takes less than 2 minutes.',
              },
              {
                n: '02', icon: LucideMessageCircle, color: '#7C3AED',
                title: 'Get matched',
                desc: 'Background-checked cleaners in your area respond. You review, choose, and confirm.',
              },
              {
                n: '03', icon: LucideCheckCircle, color: '#059669',
                title: 'Enjoy your clean home',
                desc: 'Your cleaner handles everything. Rate the job and rebook with one tap.',
              },
            ].map((step, i) => (
              <Box
                key={step.n}
                px={8} py={8}
                borderRight={{ md: i < 2 ? '1px solid #E2E8F0' : 'none' }}
                borderBottom={{ base: i < 2 ? '1px solid #E2E8F0' : 'none', md: 'none' }}
                position="relative"
              >
                <Box position="absolute" left={0} top={0} bottom={0} w="2px" bg={step.color}
                  display={{ base: 'none', md: 'block' }} />
                <Text
                  fontSize="42px" fontWeight="800" fontFamily="heading"
                  letterSpacing="-0.05em" color="#E2E8F0" lineHeight={1} mb={4}
                  style={{ userSelect: 'none' }}
                >
                  {step.n}
                </Text>
                <HStack gap={2} mb={3}>
                  <Icon as={step.icon} w="16px" h="16px" color={step.color} />
                  <Text fontSize="14px" fontWeight="700" color="#0B1120" fontFamily="heading">{step.title}</Text>
                </HStack>
                <Text fontSize="13.5px" color="#64748B" lineHeight="1.65" fontFamily="heading">{step.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Why BrazilianClean ── */}
      <Box bg="white">
        <Box px={{ base: 5, md: 10, lg: 16 }} py={20} maxW="1440px" mx="auto">
          <Box mb={12}>
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="#1A7FA0"
              textTransform="uppercase" fontFamily="heading" mb={2}>
              Why homeowners love us
            </Text>
            <Text fontSize={{ base: '26px', md: '32px' }} fontWeight="800" color="#0B1120"
              fontFamily="heading" letterSpacing="-0.025em">
              Built for trust. Built for results.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={0} border="1px solid #E2E8F0">
            {[
              {
                icon: LucideTrendingUp, color: '#1A7FA0',
                title: 'Smart Matching',
                desc: 'Our system connects you with top-rated cleaners first — based on proximity, ratings, and availability.',
              },
              {
                icon: LucideShield, color: '#7C3AED',
                title: 'Background Checks',
                desc: 'Every cleaner is ID-verified and background-checked before they can accept bookings on BrazilianClean.',
              },
              {
                icon: LucideMapPin, color: '#059669',
                title: 'Local Cleaners',
                desc: "You're matched with cleaners in your zip code — faster response times and better local knowledge.",
              },
            ].map((item, i) => (
              <Box
                key={item.title}
                p={8}
                borderRight={{ md: i < 2 ? '1px solid #E2E8F0' : 'none' }}
                borderBottom={{ base: i < 2 ? '1px solid #E2E8F0' : 'none', md: 'none' }}
                position="relative" overflow="hidden"
              >
                <Box position="absolute" top={0} left={0} right={0} h="2px" bg={item.color} />
                <Box
                  w="40px" h="40px" mb={4}
                  display="flex" alignItems="center" justifyContent="center"
                  style={{ background: `${item.color}14`, borderRadius: 4 }}
                >
                  <Icon as={item.icon} w="18px" h="18px" color={item.color} />
                </Box>
                <Text fontSize="14px" fontWeight="700" color="#0B1120" fontFamily="heading" mb={2.5}>{item.title}</Text>
                <Text fontSize="13px" color="#64748B" lineHeight="1.7" fontFamily="heading">{item.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── CTA band ── */}
      <Box bg="#0B1120" borderTop="1px solid rgba(255,255,255,0.06)">
        <Flex
          px={{ base: 5, md: 10, lg: 16 }} py={16} maxW="1440px" mx="auto"
          align="center" justify="space-between" gap={8} flexWrap="wrap"
        >
          <Box>
            <Text fontSize={{ base: '22px', md: '28px' }} fontWeight="800" color="white"
              fontFamily="heading" letterSpacing="-0.025em" mb={1.5}>
              Ready for a spotless home?
            </Text>
            <Text fontSize="14px" color="rgba(255,255,255,0.5)" fontFamily="heading">
              Join thousands of happy homeowners. Book your first cleaning today.
            </Text>
          </Box>
          <NextLink href="/request">
            <Button
              bg="#1A7FA0" color="white" h="46px" px={7}
              borderRadius="4px" fontWeight="700" fontSize="14px" fontFamily="heading"
              _hover={{ bg: '#15698A' }} transition="background 0.15s" flexShrink={0}
            >
              Book a cleaning
              <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
            </Button>
          </NextLink>
        </Flex>
      </Box>

      {/* ── Footer ── */}
      <Box bg="#0B1120" borderTop="1px solid rgba(255,255,255,0.06)" py={8}>
        <Flex
          px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto"
          align="center" justify="space-between" flexWrap="wrap" gap={4}
        >
          <HStack gap={2}>
            <Box w="24px" h="24px" bg="#1A7FA0" style={{ borderRadius: 4 }}
              display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="800" fontSize="9px" fontFamily="heading">BC</Text>
            </Box>
            <Text fontSize="12px" color="rgba(255,255,255,0.35)" fontFamily="heading">
              © 2026 BrazilianClean. All rights reserved.
            </Text>
          </HStack>
          <HStack gap={6}>
            <Text fontSize="12px" color="rgba(255,255,255,0.35)" cursor="pointer" fontFamily="heading"
              _hover={{ color: 'rgba(255,255,255,0.7)' }} transition="color 0.15s">Terms</Text>
            <Text fontSize="12px" color="rgba(255,255,255,0.35)" cursor="pointer" fontFamily="heading"
              _hover={{ color: 'rgba(255,255,255,0.7)' }} transition="color 0.15s">Privacy</Text>
          </HStack>
        </Flex>
      </Box>

    </Box>
  );
}
