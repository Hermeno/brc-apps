'use client';

import { Box, Text, Button, HStack, VStack, Flex, Icon, SimpleGrid } from '@chakra-ui/react';
import { LucideArrowRight, LucideCheckCircle, LucideShield, LucideTrendingUp, LucideStar, LucideMapPin, LucideCalendar, LucideMessageCircle } from 'lucide-react';
import NextLink from 'next/link';
import Image from 'next/image';

/* Stripe-derived tokens (blue kept as #0A80DB per brand) */
const C = {
  heading:   '#0A2540',   // Stripe's darkest heading color
  body:      '#425466',   // Stripe's body text
  muted:     '#697386',   // Stripe's secondary / caption text
  border:    '#E3E8EE',   // Stripe's card border
  sectionBg: '#F6F9FC',   // Stripe's "Black Squeeze" section bg
  cardShadow: '0 1px 3px rgba(60,66,87,0.04)',
  blue:      '#0A80DB',
  blueHover: '#0870C2',
  dark:      '#0B1120',
};

const CARD: React.CSSProperties = {
  borderRadius: 8,
  boxShadow: C.cardShadow,
};

export default function HomePage() {
  return (
    <Box bg="white" minH="100vh">

      {/* ── Navbar ── */}
      <Box
        position="fixed" top={0} left={0} right={0} zIndex={100} h="64px"
        style={{ background: 'rgba(11,17,32,0.93)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Flex align="center" h="full" px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto" justify="space-between">
          <HStack gap={2.5}>
            <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="white" fontFamily="heading">
              Brazilian<Text as="span" color={C.blue}>Clean</Text>
            </Text>
          </HStack>

          <HStack gap={2}>
            <NextLink href="/auth/register?role=cleaner">
              <Button
                size="sm" variant="outline" borderColor="rgba(255,255,255,0.18)" color="white"
                style={{ borderRadius: 4 }} fontWeight="600" fontSize="13px" fontFamily="heading"
                _hover={{ bg: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.35)' }}
                h="34px" px={4}
              >
                Become a cleaner
              </Button>
            </NextLink>
            <NextLink href="/auth/login">
              <Button
                size="sm" bg={C.blue} color="white"
                style={{ borderRadius: 4 }} fontWeight="600" fontSize="13px" fontFamily="heading"
                _hover={{ bg: C.blueHover }} h="34px" px={4}
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
            // backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1800&q=80')",
            backgroundImage: "url('/abc.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <Box position="absolute" inset={0} style={{
          background: 'linear-gradient(180deg, rgba(10,16,30,0.84) 0%, rgba(10,16,30,0.64) 50%, rgba(10,16,30,0.80) 100%)',
        }} />

        <Box position="relative" w="full" px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto" pt="120px" pb="96px">
          <Box maxW="640px">

            <Text
              display="inline-block" mb={5}
              fontSize="10.5px" fontWeight="700" letterSpacing="0.14em"
              color={C.blue} textTransform="uppercase" fontFamily="heading"
              style={{ borderLeft: `2px solid ${C.blue}`, paddingLeft: 10 }}
            >
              The trusted cleaning platform
            </Text>

            <Text
              as="h1"
              fontSize={{ base: '38px', md: '52px', lg: '60px' }}
              fontWeight="800" lineHeight="1.07" letterSpacing="-0.03em"
              color="white" fontFamily="heading" mb={6}
            >
              A spotless home,{' '}
              <Text as="span" color={C.blue}>on your schedule</Text>
            </Text>

            <Text
              fontSize={{ base: '16px', md: '18px' }} color="rgba(255,255,255,0.68)"
              lineHeight="1.68" fontWeight="300" mb={10} maxW="500px" fontFamily="heading"
            >
              Connect with background-checked cleaners near you.
              Book in minutes, relax all day.
            </Text>

            <HStack gap={3} flexWrap="wrap" mb={14}>
              <NextLink href="/request">
                <Button
                  bg={C.blue} color="white" h="48px" px={7}
                  style={{ borderRadius: 4 }} fontWeight="600" fontSize="14px" fontFamily="heading"
                  _hover={{ bg: C.blueHover }} transition="background 0.15s"
                >
                  Book a cleaning
                  <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
                </Button>
              </NextLink>
            </HStack>

            <HStack gap={0} divideX="1px" divideColor="rgba(255,255,255,0.14)" flexWrap="wrap">
              {[
                { icon: LucideStar,        text: '4.9 average rating' },
                { icon: LucideCheckCircle, text: 'Vetted cleaners' },
                { icon: LucideShield,      text: 'Secure payment' },
              ].map(item => (
                <HStack key={item.text} gap={1.5} px={4} py={1} _first={{ pl: 0 }}>
                  <Icon as={item.icon} w="13px" h="13px" color={C.blue} />
                  <Text fontSize="12.5px" color="rgba(255,255,255,0.60)" fontFamily="heading">{item.text}</Text>
                </HStack>
              ))}
            </HStack>

          </Box>
        </Box>
      </Box>

      {/* ── How it works ── */}
      <Box bg={C.sectionBg}>
        <Box px={{ base: 5, md: 10, lg: 16 }} py={24} maxW="1440px" mx="auto">

          <Box mb={14} maxW="560px">
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color={C.blue}
              textTransform="uppercase" fontFamily="heading" mb={3}>
              How it works
            </Text>
            <Text fontSize={{ base: '26px', md: '34px' }} fontWeight="700" color={C.heading}
              fontFamily="heading" letterSpacing="-0.025em" lineHeight="1.2" mb={3}>
              Book a cleaner in under 2 minutes
            </Text>
            <Text fontSize="16px" color={C.body} lineHeight="1.7" fontWeight="400" fontFamily="heading">
              No calls, no hassle. Tell us what you need and we handle the rest.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {[
              {
                n: '01', icon: LucideCalendar,
                title: 'Book in minutes',
                desc: 'Choose your cleaning type, enter your address, and pick a date. Takes less than 2 minutes.',
              },
              {
                n: '02', icon: LucideMessageCircle,
                title: 'Get matched',
                desc: 'Background-checked cleaners in your area respond. You review, choose, and confirm.',
              },
              {
                n: '03', icon: LucideCheckCircle,
                title: 'Enjoy your clean home',
                desc: 'Your cleaner handles everything. Rate the job and rebook with one tap.',
              },
            ].map((step) => (
              <Box
                key={step.n}
                bg="white"
                border={`1px solid ${C.border}`}
                p={8}
                style={CARD}
              >
                <Text
                  fontSize="40px" fontWeight="800" fontFamily="heading"
                  letterSpacing="-0.05em" color="#E3E8EE" lineHeight={1} mb={5}
                  style={{ userSelect: 'none' }}
                >
                  {step.n}
                </Text>
                <Box
                  w="40px" h="40px" mb={4}
                  display="flex" alignItems="center" justifyContent="center"
                  style={{ background: C.sectionBg, borderRadius: 8 }}
                >
                  <Icon as={step.icon} w="18px" h="18px" color={C.blue} />
                </Box>
                <Text fontSize="14px" fontWeight="600" color={C.heading} fontFamily="heading" mb={2}>{step.title}</Text>
                <Text fontSize="13.5px" color={C.body} lineHeight="1.7" fontFamily="heading" fontWeight="400">{step.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Why BrazilianClean ── */}
      <Box bg="white">
        <Box px={{ base: 5, md: 10, lg: 16 }} py={24} maxW="1440px" mx="auto">

          <Box mb={14} maxW="560px">
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color={C.blue}
              textTransform="uppercase" fontFamily="heading" mb={3}>
              Why homeowners love us
            </Text>
            <Text fontSize={{ base: '26px', md: '34px' }} fontWeight="700" color={C.heading}
              fontFamily="heading" letterSpacing="-0.025em" lineHeight="1.2" mb={3}>
              Built for trust. Built for results.
            </Text>
            <Text fontSize="16px" color={C.body} lineHeight="1.7" fontWeight="400" fontFamily="heading">
              Every cleaner on our platform is vetted, rated, and ready to deliver.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {[
              {
                icon: LucideTrendingUp,
                title: 'Smart Matching',
                desc: 'Our system connects you with top-rated cleaners first — based on proximity, ratings, and availability.',
              },
              {
                icon: LucideShield,
                title: 'Background Checks',
                desc: 'Every cleaner is ID-verified and background-checked before they can accept bookings on BrazilianClean.',
              },
              {
                icon: LucideMapPin,
                title: 'Local Cleaners',
                desc: "You're matched with cleaners in your zip code — faster response times and better local knowledge.",
              },
            ].map((item) => (
              <Box
                key={item.title}
                bg="white"
                border={`1px solid ${C.border}`}
                p={8}
                style={CARD}
              >
                <Box
                  w="44px" h="44px" mb={5}
                  display="flex" alignItems="center" justifyContent="center"
                  style={{ background: C.sectionBg, borderRadius: 8 }}
                >
                  <Icon as={item.icon} w="20px" h="20px" color={C.blue} />
                </Box>
                <Text fontSize="14px" fontWeight="600" color={C.heading} fontFamily="heading" mb={2.5}>{item.title}</Text>
                <Text fontSize="13.5px" color={C.body} lineHeight="1.7" fontFamily="heading" fontWeight="400">{item.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Testimonials ── */}
      <Box bg={C.sectionBg}>
        <Box px={{ base: 5, md: 10, lg: 16 }} py={24} maxW="1440px" mx="auto">

          <Box mb={14} maxW="560px">
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color={C.blue}
              textTransform="uppercase" fontFamily="heading" mb={3}>
              Client reviews
            </Text>
            <Text fontSize={{ base: '26px', md: '34px' }} fontWeight="700" color={C.heading}
              fontFamily="heading" letterSpacing="-0.025em" lineHeight="1.2" mb={3}>
              Thousands of happy homes
            </Text>
            <Text fontSize="16px" color={C.body} lineHeight="1.7" fontWeight="400" fontFamily="heading">
              Homeowners across the US trust BrazilianClean to keep their homes spotless.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
            {[
              {
                name: 'Sarah M.',
                location: 'Miami, FL',
                service: 'Standard Cleaning',
                text: "I've been using BrazilianClean for 6 months and it's completely changed my routine. The cleaner is always on time, professional, and my home looks spotless every single time.",
                initials: 'SM',
              },
              {
                name: 'Michael R.',
                location: 'Hartford, CT',
                service: 'Deep Cleaning',
                text: 'Booked a deep clean before hosting a family gathering. They exceeded every expectation — areas I forgot existed were cleaned. Booking took 2 minutes. Highly recommend.',
                initials: 'MR',
              },
              {
                name: 'Jennifer K.',
                location: 'Boston, MA',
                service: 'Move-Out Cleaning',
                text: 'Used BrazilianClean for a move-out clean. Got my full security deposit back. The platform makes everything so simple — booking, communication, payment. No stress at all.',
                initials: 'JK',
              },
              {
                name: 'David L.',
                location: 'New York, NY',
                service: 'Weekly Cleaning',
                text: 'I work from home and having a reliable cleaner every week is non-negotiable. BrazilianClean matched me with an amazing professional in less than 24 hours.',
                initials: 'DL',
              },
              {
                name: 'Amanda T.',
                location: 'Orlando, FL',
                service: 'Deep Cleaning',
                text: 'The matching system is impressive — my cleaner arrived knowing exactly what I needed, was thorough, and friendly. I already referred three neighbors.',
                initials: 'AT',
              },
              {
                name: 'Carlos & Lisa B.',
                location: 'Stamford, CT',
                service: 'Bi-weekly Cleaning',
                text: "We've had the same cleaner for 4 months now through BrazilianClean. Consistent quality, always communicates if there's a schedule change. Exactly what we needed.",
                initials: 'CB',
              },
            ].map((t) => (
              <Box
                key={t.name}
                bg="white"
                border={`1px solid ${C.border}`}
                p={7}
                style={CARD}
              >
                <HStack gap={0.5} mb={4}>
                  {[1,2,3,4,5].map(s => (
                    <Text key={s} color={C.blue} fontSize="13px">★</Text>
                  ))}
                </HStack>

                <Text fontSize="13.5px" color={C.body} lineHeight="1.75" fontFamily="heading"
                  fontWeight="400" mb={5}>
                  "{t.text}"
                </Text>

                <HStack gap={3}>
                  <Box
                    w="36px" h="36px" flexShrink={0}
                    display="flex" alignItems="center" justifyContent="center"
                    style={{ background: `${C.blue}18`, borderRadius: 6 }}
                  >
                    <Text fontSize="11px" fontWeight="700" color={C.blue} fontFamily="heading">{t.initials}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color={C.heading} fontFamily="heading">{t.name}</Text>
                    <Text fontSize="11.5px" color={C.muted} fontFamily="heading">{t.location} · {t.service}</Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>

          {/* Rating bar */}
          <Box mt={6} p={7} bg="white" border={`1px solid ${C.border}`} style={CARD}>
            <Flex align="center" justify="space-between" flexWrap="wrap" gap={6}>
              <HStack gap={6}>
                <Box textAlign="center">
                  <Text fontSize="44px" fontWeight="700" color={C.heading} fontFamily="heading"
                    letterSpacing="-0.04em" lineHeight={1}>4.9</Text>
                  <HStack gap={0.5} justify="center" mt={1.5}>
                    {[1,2,3,4,5].map(s => <Text key={s} color={C.blue} fontSize="13px">★</Text>)}
                  </HStack>
                  <Text fontSize="11px" color={C.muted} fontFamily="heading" mt={1}>Average rating</Text>
                </Box>
                <Box w="1px" h="60px" bg={C.border} display={{ base: 'none', md: 'block' }} />
                <SimpleGrid columns={3} gap={8} display={{ base: 'none', md: 'grid' }}>
                  {[
                    { label: 'Bookings completed', value: '2,400+' },
                    { label: 'Active cleaners',    value: '500+' },
                    { label: 'Cities covered',     value: '12' },
                  ].map(stat => (
                    <Box key={stat.label} textAlign="center">
                      <Text fontSize="24px" fontWeight="700" color={C.heading} fontFamily="heading"
                        letterSpacing="-0.03em">{stat.value}</Text>
                      <Text fontSize="11px" color={C.muted} fontFamily="heading" mt={0.5}>{stat.label}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </HStack>
              <NextLink href="/request">
                <Button
                  bg={C.blue} color="white" h="44px" px={6}
                  style={{ borderRadius: 4 }} fontWeight="600" fontSize="13px" fontFamily="heading"
                  _hover={{ bg: C.blueHover }} transition="background 0.15s"
                >
                  Join them — book now
                  <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
                </Button>
              </NextLink>
            </Flex>
          </Box>

        </Box>
      </Box>

      {/* ── CTA band ── */}
      <Box bg={C.dark} borderTop="1px solid rgba(255,255,255,0.06)">
        <Flex
          px={{ base: 5, md: 10, lg: 16 }} py={16} maxW="1440px" mx="auto"
          align="center" justify="space-between" gap={8} flexWrap="wrap"
        >
          <Box>
            <Text fontSize={{ base: '22px', md: '30px' }} fontWeight="700" color="white"
              fontFamily="heading" letterSpacing="-0.025em" mb={2}>
              Ready for a spotless home?
            </Text>
            <Text fontSize="15px" color="rgba(255,255,255,0.48)" fontFamily="heading" fontWeight="400">
              Join thousands of happy homeowners. Book your first cleaning today.
            </Text>
          </Box>
          <NextLink href="/request">
            <Button
              bg={C.blue} color="white" h="46px" px={7}
              style={{ borderRadius: 4 }} fontWeight="600" fontSize="14px" fontFamily="heading"
              _hover={{ bg: C.blueHover }} transition="background 0.15s" flexShrink={0}
            >
              Book a cleaning
              <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
            </Button>
          </NextLink>
        </Flex>
      </Box>

      {/* ── Footer ── */}
      <Box bg={C.dark} borderTop="1px solid rgba(255,255,255,0.06)" py={10}>
        <Box px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto">
          <Flex justify="space-between" align="start" flexWrap="wrap" gap={8} mb={8}>

            <Box maxW="260px">
              <HStack gap={2.5} mb={3}>
                <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <Text fontWeight="700" fontSize="14px" letterSpacing="-0.02em" color="white" fontFamily="heading">
                  Brazilian<Text as="span" color={C.blue}>Clean</Text>
                </Text>
              </HStack>
              <Text fontSize="12px" color="rgba(255,255,255,0.32)" fontFamily="heading"
                lineHeight="1.7" fontWeight="400">
                The trusted cleaning marketplace connecting homeowners with vetted Brazilian cleaning professionals across the US.
              </Text>
            </Box>

            <Flex gap={12} flexWrap="wrap">
              <Box>
                <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="rgba(255,255,255,0.22)"
                  textTransform="uppercase" fontFamily="heading" mb={3}>
                  Company
                </Text>
                <VStack gap={2} align="start">
                  {[
                    { label: 'About Us',     href: '/about' },
                    { label: 'How it works', href: '/#how-it-works' },
                  ].map(l => (
                    <NextLink key={l.label} href={l.href}>
                      <Text fontSize="12.5px" color="rgba(255,255,255,0.38)" fontFamily="heading" fontWeight="400"
                        _hover={{ color: 'rgba(255,255,255,0.72)' }} transition="color 0.15s" cursor="pointer">
                        {l.label}
                      </Text>
                    </NextLink>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="rgba(255,255,255,0.22)"
                  textTransform="uppercase" fontFamily="heading" mb={3}>
                  Platform
                </Text>
                <VStack gap={2} align="start">
                  {[
                    { label: 'Book a cleaning',    href: '/request' },
                    { label: 'Become a cleaner',   href: '/auth/register?role=cleaner' },
                    { label: 'Sign in',            href: '/auth/login' },
                  ].map(l => (
                    <NextLink key={l.label} href={l.href}>
                      <Text fontSize="12.5px" color="rgba(255,255,255,0.38)" fontFamily="heading" fontWeight="400"
                        _hover={{ color: 'rgba(255,255,255,0.72)' }} transition="color 0.15s" cursor="pointer">
                        {l.label}
                      </Text>
                    </NextLink>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="rgba(255,255,255,0.22)"
                  textTransform="uppercase" fontFamily="heading" mb={3}>
                  Legal & support
                </Text>
                <VStack gap={2} align="start">
                  {[
                    { label: 'Privacy Policy',   href: '/privacy' },
                    { label: 'Terms of Service', href: '/terms' },
                  ].map(l => (
                    <NextLink key={l.label} href={l.href}>
                      <Text fontSize="12.5px" color="rgba(255,255,255,0.38)" fontFamily="heading" fontWeight="400"
                        _hover={{ color: 'rgba(255,255,255,0.72)' }} transition="color 0.15s" cursor="pointer">
                        {l.label}
                      </Text>
                    </NextLink>
                  ))}
                  <a href="mailto:support@brazilianclean.com"
                    style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.38)', transition: 'color 0.15s', textDecoration: 'none', fontWeight: 400 }}>
                    support@brazilianclean.com
                  </a>
                </VStack>
              </Box>
            </Flex>
          </Flex>

          <Box borderTop="1px solid rgba(255,255,255,0.06)" pt={6}>
            <Text fontSize="11.5px" color="rgba(255,255,255,0.22)" fontFamily="heading" fontWeight="400">
              © 2026 BrazilianClean. All rights reserved. Background checks provided by third-party partners.
            </Text>
          </Box>
        </Box>
      </Box>

    </Box>
  );
}
