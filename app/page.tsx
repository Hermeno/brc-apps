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
          <HStack gap={2}>
            <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <Text fontWeight="700" fontSize={{ base: '12px', sm: '15px' }} letterSpacing="-0.02em" color="white" fontFamily="heading">
              Brazilian<Text as="span" color={C.blue}>Clean</Text>
            </Text>
          </HStack>

          <HStack gap={3}>
            <NextLink href="/about" style={{ textDecoration: 'none' }}>
              <Box
                as="span"
                display={{ base: 'inline-flex', md: 'inline-flex' }}
                alignItems="center"
                fontSize="13px" fontFamily="heading" fontWeight="500"
                color="rgba(255,255,255,0.55)"
                px={3} h="34px" borderRadius="4px"
                border="1px solid transparent"
                style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                _hover={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.05)',
                }}
              >
                About
              </Box>
            </NextLink>
            <NextLink href="/auth/register?role=cleaner">
              <Button
                size="sm" variant="outline" borderColor="rgba(255,255,255,0.18)" color="white"
                style={{ borderRadius: 4 }} fontWeight="600" fontFamily="heading"
                _hover={{ bg: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.35)' }}
                h={{ base: '30px', sm: '34px' }} px={{ base: 2, sm: 4 }}
                fontSize={{ base: '11px', sm: '13px' }}
              >
                Become a cleaner
              </Button>
            </NextLink>
            <NextLink href="/auth/login">
              <Button
                size="sm" bg={C.blue} color="white"
                style={{ borderRadius: 4 }} fontWeight="600" fontFamily="heading"
                _hover={{ bg: C.blueHover }}
                h={{ base: '30px', sm: '34px' }} px={{ base: 2, sm: 4 }}
                fontSize={{ base: '11px', sm: '13px' }}
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
              Trusted by homeowners across the US
            </Text>

            <Text
              as="h1"
              fontSize={{ base: '38px', md: '52px', lg: '60px' }}
              fontWeight="800" lineHeight="1.07" letterSpacing="-0.03em"
              color="white" fontFamily="heading" mb={6}
            >
              A spotless home,{' '}
              <Text as="span" color={C.blue}>done right every time</Text>
            </Text>

            <Text
              fontSize={{ base: '16px', md: '18px' }} color="rgba(255,255,255,0.68)"
              lineHeight="1.68" fontWeight="300" mb={10} maxW="500px" fontFamily="heading"
            >
              We match you with background-checked, vetted cleaners in your area.
              Book in under 2 minutes — and get back to your day.
            </Text>

            <HStack gap={3} flexWrap="wrap" mb={14}>
              <NextLink href="/request">
                <Button
                  bg={C.blue} color="white" h="48px" px={7}
                  style={{ borderRadius: 4 }} fontWeight="600" fontSize="14px" fontFamily="heading"
                  _hover={{ bg: C.blueHover }} transition="background 0.15s"
                >
                  Book my cleaning
                  <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
                </Button>
              </NextLink>
            </HStack>

            <HStack gap={0} divideX="1px" divideColor="rgba(255,255,255,0.14)" flexWrap="wrap">
              {[
                { icon: LucideStar,        text: '4.9 average rating' },
                { icon: LucideCheckCircle, text: 'Background-checked cleaners' },
                { icon: LucideShield,      text: 'Safe, secure payment' },
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
              Simple from start to finish
            </Text>
            <Text fontSize={{ base: '26px', md: '34px' }} fontWeight="700" color={C.heading}
              fontFamily="heading" letterSpacing="-0.025em" lineHeight="1.2" mb={3}>
              From request to clean home in 3 easy steps
            </Text>
            <Text fontSize="16px" color={C.body} lineHeight="1.7" fontWeight="400" fontFamily="heading">
              No phone calls, no back-and-forth. Tell us what you need and we handle the rest.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {[
              {
                n: '01', icon: LucideCalendar,
                title: 'Tell us what you need',
                desc: 'Pick your cleaning type, enter your address, and choose a date and time. It takes less than 2 minutes.',
              },
              {
                n: '02', icon: LucideMessageCircle,
                title: 'Get matched fast',
                desc: 'Vetted cleaners near you receive your request. Review their profiles, pick your favorite, and confirm.',
              },
              {
                n: '03', icon: LucideCheckCircle,
                title: 'Sit back — it\'s handled',
                desc: 'Your cleaner arrives on time and takes care of everything. Rate the job and rebook in one tap.',
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
              Why homeowners choose us
            </Text>
            <Text fontSize={{ base: '26px', md: '34px' }} fontWeight="700" color={C.heading}
              fontFamily="heading" letterSpacing="-0.025em" lineHeight="1.2" mb={3}>
              Quality you can count on, every single visit
            </Text>
            <Text fontSize="16px" color={C.body} lineHeight="1.7" fontWeight="400" fontFamily="heading">
              Every cleaner on our platform is vetted, rated by real customers, and ready to impress.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {[
              {
                icon: LucideTrendingUp,
                title: 'Smart matching',
                desc: 'We connect you with top-rated cleaners first — ranked by proximity, customer ratings, and real-time availability.',
              },
              {
                icon: LucideShield,
                title: 'Thorough background checks',
                desc: 'Every cleaner is ID-verified and background-checked before their first booking. Your home is in safe hands.',
              },
              {
                icon: LucideMapPin,
                title: 'Cleaners near you',
                desc: "You're matched with cleaners in your zip code — faster response times and someone who knows your neighborhood.",
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
              What our customers say
            </Text>
            <Text fontSize={{ base: '26px', md: '34px' }} fontWeight="700" color={C.heading}
              fontFamily="heading" letterSpacing="-0.025em" lineHeight="1.2" mb={3}>
              Thousands of happy customers
            </Text>
            <Text fontSize="16px" color={C.body} lineHeight="1.7" fontWeight="400" fontFamily="heading">
              Homeowners across the US trust BrazilianClean for consistent, high-quality results — every time.
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
                    { label: 'Cleanings completed', value: '2,400+' },
                    { label: 'Vetted cleaners',    value: '500+' },
                    { label: 'Cities served',      value: '12' },
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
                  Book my cleaning
                  <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
                </Button>
              </NextLink>
            </Flex>
          </Box>

        </Box>
      </Box>

      {/* ── About Us ── */}
      <Box id="about" bg="white" borderTop="1px solid #E3E8EE" px={{ base: 5, md: 10, lg: 16 }} py={20}>
        <Box maxW="1100px" mx="auto">
          <Flex gap={{ base: 12, lg: 20 }} flexDir={{ base: 'column', md: 'row' }} align="start">

            {/* Left: story */}
            <Box flex={1}>
              <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.14em" color={C.blue}
                textTransform="uppercase" fontFamily="heading"
                style={{ borderLeft: `2px solid ${C.blue}`, paddingLeft: 10 }} mb={4}>
                About us
              </Text>
              <Text fontSize={{ base: '26px', md: '32px' }} fontWeight="800" color={C.heading}
                fontFamily="heading" letterSpacing="-0.025em" lineHeight={1.15} mb={5}>
                Built for trust.<br />
                Driven by community.
              </Text>
              <VStack gap={4} align="stretch">
                <Text fontSize="14.5px" color={C.body} lineHeight="1.8" fontFamily="heading">
                  The Brazilian community in the United States has always been known for its
                  exceptional work ethic and genuine care for the homes they serve. For decades,
                  Brazilian cleaning professionals built their reputation word of mouth.
                </Text>
                <Text fontSize="14.5px" color={C.body} lineHeight="1.8" fontFamily="heading">
                  BrazilianClean was created to give these professionals a modern platform that
                  matches their talent — where reputation is built transparently, payments are
                  protected, and clients can book with real confidence.
                </Text>
              </VStack>
              <NextLink href="/about">
                <Button mt={6} variant="outline" borderColor={C.border} color={C.heading}
                  borderRadius="4px" fontWeight="600" fontSize="13px" fontFamily="heading"
                  h="40px" px={5} _hover={{ borderColor: C.blue, color: C.blue }}
                  transition="all 0.15s">
                  Read our full story
                  <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
                </Button>
              </NextLink>
            </Box>

            {/* Right: values */}
            <Box w={{ base: 'full', md: '380px' }} flexShrink={0}>
              <SimpleGrid columns={2} gap={0} border="1px solid #E3E8EE">
                {[
                  { title: 'Trust',         desc: 'Every cleaner is ID-verified with a background check before activation.' },
                  { title: 'Transparency',  desc: 'No hidden fees. Clear pricing for clients and cleaners alike.' },
                  { title: 'Community',     desc: 'We celebrate the Brazilian professionals who built their reputation through dedication.' },
                  { title: 'Excellence',    desc: 'Ratings are real. The best professionals rise to the top naturally.' },
                ].map((v, i) => (
                  <Box key={v.title} p={5} bg="white"
                    borderRight={{ md: i % 2 === 0 ? '1px solid #E3E8EE' : 'none' }}
                    borderBottom={i < 2 ? '1px solid #E3E8EE' : 'none'}>
                    <Text fontSize="13px" fontWeight="700" color={C.heading} fontFamily="heading" mb={1.5}>{v.title}</Text>
                    <Text fontSize="12px" color={C.muted} lineHeight="1.65" fontFamily="heading">{v.desc}</Text>
                  </Box>
                ))}
              </SimpleGrid>
              <SimpleGrid columns={2} gap={0} border="1px solid #E3E8EE" borderTop="none">
                {[
                  { value: '500+',   label: 'Verified cleaners' },
                  { value: '2,400+', label: 'Bookings completed' },
                  { value: '4.9★',   label: 'Average rating' },
                  { value: '12',     label: 'Cities covered' },
                ].map((s, i) => (
                  <Box key={s.label} p={5}
                    borderRight={i % 2 === 0 ? '1px solid #E3E8EE' : 'none'}
                    borderBottom={i < 2 ? '1px solid #E3E8EE' : 'none'}>
                    <Text fontSize="22px" fontWeight="800" color={C.heading} fontFamily="heading"
                      letterSpacing="-0.03em" lineHeight={1}>{s.value}</Text>
                    <Text fontSize="11px" color={C.muted} fontFamily="heading" mt={1}>{s.label}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

          </Flex>
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
              Your cleanest home is one booking away
            </Text>
            <Text fontSize="15px" color="rgba(255,255,255,0.48)" fontFamily="heading" fontWeight="400">
              Join thousands of happy homeowners. Takes 2 minutes — no account required.
            </Text>
          </Box>
          <NextLink href="/request">
            <Button
              bg={C.blue} color="white" h="46px" px={7}
              style={{ borderRadius: 4 }} fontWeight="600" fontSize="14px" fontFamily="heading"
              _hover={{ bg: C.blueHover }} transition="background 0.15s" flexShrink={0}
            >
              Book my cleaning
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
                The cleaning marketplace that connects homeowners with vetted Brazilian cleaning professionals — across the US.
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
                    { label: 'How it works',  href: '/#how-it-works' },
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
                  Legal & Support
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
              © 2026 BrazilianClean. All rights reserved. Background checks are conducted through trusted third-party partners.
            </Text>
          </Box>
        </Box>
      </Box>

    </Box>
  );
}
