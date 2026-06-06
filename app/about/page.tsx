'use client';

import { Box, Text, Flex, HStack, VStack, SimpleGrid, Icon } from '@chakra-ui/react';
import { LucideHeart, LucideShield, LucideUsers, LucideStar, LucideArrowRight, LucideMapPin, LucideArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { Button } from '@chakra-ui/react';
import Image from 'next/image';
const CITIES = [
  'Miami, FL', 'Orlando, FL', 'Fort Lauderdale, FL', 'Tampa, FL',
  'Hartford, CT', 'Stamford, CT', 'New York, NY',
  'Boston, MA', 'Newark, NJ', 'Providence, RI',
  'New Haven, CT', 'Bridgeport, CT',
];

export default function AboutPage() {
  return (
    <Box bg="white" minH="100vh">

      {/* Navbar */}
      <Box
        position="fixed" top={0} left={0} right={0} zIndex={100} h="64px"
        style={{ background: 'rgba(11,17,32,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Flex align="center" h="full" px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto" justify="space-between">
          <HStack gap={4}>
            <NextLink href="/" style={{ textDecoration: 'none' }}>
              <HStack gap={1.5}
                color="rgba(255,255,255,0.5)" fontSize="13px" fontFamily="heading" fontWeight="500"
                px={2} h="34px" borderRadius="4px"
                border="1px solid transparent"
                transition="all 0.15s"
                _hover={{ color: 'white', borderColor: 'rgba(255,255,255,0.12)', bg: 'rgba(255,255,255,0.05)' }}
                style={{ cursor: 'pointer' }}
              >
                <Icon as={LucideArrowLeft} w="13px" h="13px" />
                <Text>Home</Text>
              </HStack>
            </NextLink>
            <Box w="1px" h="18px" bg="rgba(255,255,255,0.08)" />
            <NextLink href="/" style={{ textDecoration: 'none' }}>
              <HStack gap={2.5}>
                <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="white" fontFamily="heading">
                  Brazilian<Text as="span" color="#0A80DB">Clean</Text>
                </Text>
              </HStack>
            </NextLink>
          </HStack>
          <HStack gap={2}>
            <NextLink href="/auth/login">
              <Button size="sm" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="600" fontSize="13px"
                fontFamily="heading" _hover={{ bg: '#0870C2' }} h="34px" px={4}>
                Sign in
              </Button>
            </NextLink>
          </HStack>
        </Flex>
      </Box>

      {/* Hero */}
      <Box bg="#0B1120" pt="120px" pb={20} px={{ base: 5, md: 10, lg: 16 }}>
        <Box maxW="760px" mx="auto" textAlign="center">
          <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.14em" color="#0A80DB"
            textTransform="uppercase" fontFamily="heading" mb={4}>
            Our story
          </Text>
          <Text as="h1" fontSize={{ base: '36px', md: '50px' }} fontWeight="800" lineHeight="1.1"
            letterSpacing="-0.03em" color="white" fontFamily="heading" mb={6}>
            Built on trust,{' '}
            <Text as="span" color="#0A80DB">driven by community</Text>
          </Text>
          <Text fontSize={{ base: '15px', md: '17px' }} color="rgba(255,255,255,0.65)"
            lineHeight="1.7" maxW="600px" mx="auto" fontFamily="heading">
            BrazilianClean was born from a simple belief: skilled, hardworking cleaning professionals
            deserve a platform that treats them fairly — and homeowners deserve service they can trust.
          </Text>
        </Box>
      </Box>

      {/* Story section */}
      <Box bg="white" px={{ base: 5, md: 10, lg: 16 }} py={20}>
        <Box maxW="860px" mx="auto">
          <Flex gap={16} flexDir={{ base: 'column', md: 'row' }} align="start">
            <Box flex={1}>
              <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="#0A80DB"
                textTransform="uppercase" fontFamily="heading" mb={3}>
                How it started
              </Text>
              <Text fontSize={{ base: '22px', md: '28px' }} fontWeight="800" color="#0A2540"
                fontFamily="heading" letterSpacing="-0.025em" mb={5} lineHeight={1.2}>
                A bridge between two worlds
              </Text>
              <VStack gap={4} align="stretch">
                <Text fontSize="14.5px" color="#475569" lineHeight="1.8" fontFamily="heading">
                  The Brazilian community in the United States has always been known for its
                  exceptional work ethic, attention to detail, and genuine care for the people they
                  serve. For decades, Brazilian cleaning professionals built their businesses word
                  of mouth — quietly becoming one of the most trusted presences in American homes.
                </Text>
                <Text fontSize="14.5px" color="#475569" lineHeight="1.8" fontFamily="heading">
                  BrazilianClean was created to give these professionals a modern platform that
                  matches their talent. A place where reputation is built transparently, payments
                  are protected, and clients can book with real confidence.
                </Text>
                <Text fontSize="14.5px" color="#475569" lineHeight="1.8" fontFamily="heading">
                  We started in Florida and Connecticut — two states with strong Brazilian communities —
                  and have since grown to serve homeowners across 12 cities on the East Coast.
                  Every booking connects a real family with a real professional who cares about the outcome.
                </Text>
              </VStack>
            </Box>

            <Box w={{ base: 'full', md: '280px' }} flexShrink={0}>
              <Box border="1px solid #E3E8EE" p={6} mb={4}>
                <Text fontSize="36px" fontWeight="800" color="#0A2540" fontFamily="heading"
                  letterSpacing="-0.04em" lineHeight={1}>500+</Text>
                <Text fontSize="12px" color="#697386" fontFamily="heading" mt={1}>Verified cleaners</Text>
              </Box>
              <Box border="1px solid #E3E8EE" p={6} mb={4}>
                <Text fontSize="36px" fontWeight="800" color="#0A2540" fontFamily="heading"
                  letterSpacing="-0.04em" lineHeight={1}>2,400+</Text>
                <Text fontSize="12px" color="#697386" fontFamily="heading" mt={1}>Bookings completed</Text>
              </Box>
              <Box border="1px solid #E3E8EE" p={6} mb={4}>
                <Text fontSize="36px" fontWeight="800" color="#0A2540" fontFamily="heading"
                  letterSpacing="-0.04em" lineHeight={1}>4.9★</Text>
                <Text fontSize="12px" color="#697386" fontFamily="heading" mt={1}>Average client rating</Text>
              </Box>
              <Box border="1px solid #E3E8EE" p={6}>
                <Text fontSize="36px" fontWeight="800" color="#0A2540" fontFamily="heading"
                  letterSpacing="-0.04em" lineHeight={1}>12</Text>
                <Text fontSize="12px" color="#697386" fontFamily="heading" mt={1}>Cities covered</Text>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Mission & Values */}
      <Box bg="#F6F9FC" borderTop="1px solid #E3E8EE" borderBottom="1px solid #E3E8EE"
        px={{ base: 5, md: 10, lg: 16 }} py={20}>
        <Box maxW="1100px" mx="auto">
          <Box mb={12} textAlign="center">
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="#0A80DB"
              textTransform="uppercase" fontFamily="heading" mb={2}>
              Our values
            </Text>
            <Text fontSize={{ base: '26px', md: '32px' }} fontWeight="800" color="#0A2540"
              fontFamily="heading" letterSpacing="-0.025em">
              What we stand for
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={0} border="1px solid #E3E8EE">
            {[
              {
                icon: LucideShield,
                title: 'Trust',
                desc: 'Every cleaner on our platform goes through ID verification and a background check. We never cut corners on safety — for clients or for our professionals. Trust is not a feature. It\'s the foundation.',
              },
              {
                icon: LucideHeart,
                title: 'Transparency',
                desc: 'No hidden fees. No surprises. Clients see exactly what they\'re paying and why. Cleaners see exactly what leads cost before they accept. Our pricing is clear, fair, and published.',
              },
              {
                icon: LucideUsers,
                title: 'Community',
                desc: 'We are proud of our roots. BrazilianClean celebrates the Brazilian professionals who built their reputation through hard work and dedication. This platform exists to amplify that reputation, not replace it.',
              },
              {
                icon: LucideStar,
                title: 'Excellence',
                desc: 'We hold ourselves and our cleaners to a high standard. Ratings are real. Reviews are verified. Our matching system rewards quality — the best professionals rise to the top naturally.',
              },
            ].map((v, i) => (
              <Box key={v.title} p={8} bg="white"
                borderRight={{ md: i % 2 === 0 ? '1px solid #E3E8EE' : 'none' }}
                borderBottom={{ base: i < 3 ? '1px solid #E3E8EE' : 'none', md: i < 2 ? '1px solid #E3E8EE' : 'none' }}
                position="relative">
                <Box w="40px" h="40px" mb={4} display="flex" alignItems="center" justifyContent="center"
                  style={{ background: '#F1F5F9', borderRadius: 4 }}>
                  <Icon as={v.icon} w="18px" h="18px" color="#0A80DB" />
                </Box>
                <Text fontSize="15px" fontWeight="700" color="#0A2540" fontFamily="heading" mb={2.5}>{v.title}</Text>
                <Text fontSize="13.5px" color="#425466" lineHeight="1.75" fontFamily="heading">{v.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Mission statement */}
      <Box bg="white" px={{ base: 5, md: 10, lg: 16 }} py={20}>
        <Box maxW="760px" mx="auto" textAlign="center">
          <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="#0A80DB"
            textTransform="uppercase" fontFamily="heading" mb={4}>
            Our mission
          </Text>
          <Text fontSize={{ base: '22px', md: '30px' }} fontWeight="800" color="#0A2540"
            fontFamily="heading" letterSpacing="-0.025em" lineHeight={1.25} mb={6}>
            "To create the most trusted cleaning marketplace in the United States — where skilled professionals thrive and every homeowner feels genuinely cared for."
          </Text>
          <Text fontSize="14.5px" color="#425466" lineHeight="1.8" fontFamily="heading" maxW="580px" mx="auto">
            We measure our success not just by bookings or revenue, but by whether the people on both sides of our platform
            feel respected, protected, and proud to be part of BrazilianClean.
          </Text>
        </Box>
      </Box>

      {/* How we verify */}
      <Box bg="#F6F9FC" borderTop="1px solid #E3E8EE" borderBottom="1px solid #E3E8EE"
        px={{ base: 5, md: 10, lg: 16 }} py={20}>
        <Box maxW="1100px" mx="auto">
          <Box mb={12}>
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="#0A80DB"
              textTransform="uppercase" fontFamily="heading" mb={2}>
              How we verify cleaners
            </Text>
            <Text fontSize={{ base: '24px', md: '30px' }} fontWeight="800" color="#0A2540"
              fontFamily="heading" letterSpacing="-0.025em">
              Safety is non-negotiable
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={0}>
            {[
              {
                n: '01',
                title: 'Identity Verification',
                desc: 'Every cleaner submits government-issued ID. We verify name, address, and identity before activation.',
              },
              {
                n: '02',
                title: 'Background Check',
                desc: 'National criminal background check on every cleaner. Any history of violent or property crimes results in immediate disqualification.',
              },
              {
                n: '03',
                title: 'Ongoing Ratings',
                desc: 'After every booking, clients rate the service. Cleaners with consistently low ratings are reviewed and can be suspended.',
              },
            ].map((s, i) => (
              <Box key={s.n} px={8} py={8}
                borderRight={{ md: i < 2 ? '1px solid #E3E8EE' : 'none' }}
                borderBottom={{ base: i < 2 ? '1px solid #E3E8EE' : 'none', md: 'none' }}
                position="relative">
                <Text fontSize="42px" fontWeight="800" fontFamily="heading" letterSpacing="-0.05em"
                  color="#E3E8EE" lineHeight={1} mb={4} style={{ userSelect: 'none' }}>
                  {s.n}
                </Text>
                <Text fontSize="14px" fontWeight="700" color="#0A2540" fontFamily="heading" mb={2}>{s.title}</Text>
                <Text fontSize="13.5px" color="#425466" lineHeight="1.65" fontFamily="heading">{s.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Coverage */}
      <Box bg="white" px={{ base: 5, md: 10, lg: 16 }} py={20}>
        <Box maxW="860px" mx="auto">
          <Box mb={8}>
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="#0A80DB"
              textTransform="uppercase" fontFamily="heading" mb={2}>
              Where we operate
            </Text>
            <Text fontSize={{ base: '24px', md: '30px' }} fontWeight="800" color="#0A2540"
              fontFamily="heading" letterSpacing="-0.025em" mb={4}>
              East Coast — and growing
            </Text>
            <Text fontSize="14px" color="#425466" lineHeight="1.7" fontFamily="heading">
              We're actively expanding across the United States. If your city isn't listed, enter your ZIP when booking — we likely have cleaners nearby already.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 2, md: 4 }} gap={2}>
            {CITIES.map(city => (
              <HStack key={city} gap={2} px={3} py={2.5} border="1px solid #E3E8EE">
                <Icon as={LucideMapPin} w="11px" h="11px" color="#94A3B8" flexShrink={0} />
                <Text fontSize="12.5px" color="#475569" fontFamily="heading" fontWeight="600">{city}</Text>
              </HStack>
            ))}

            {/* Non-interactive tile — signals there are more cities not listed */}
            <HStack gap={2} px={3} py={2.5} border="1px dashed #CBD5E1">
              <Text fontSize="12.5px" color="#94A3B8" fontFamily="heading" fontWeight="600">+ more</Text>
            </HStack>
          </SimpleGrid>
        </Box>
      </Box>

      {/* CTA */}
      <Box bg="#0B1120" borderTop="1px solid rgba(255,255,255,0.06)">
        <Flex px={{ base: 5, md: 10, lg: 16 }} py={16} maxW="1440px" mx="auto"
          align="center" justify="space-between" gap={8} flexWrap="wrap">
          <Box>
            <Text fontSize={{ base: '20px', md: '26px' }} fontWeight="800" color="white"
              fontFamily="heading" letterSpacing="-0.025em" mb={1.5}>
              Ready to experience the difference?
            </Text>
            <Text fontSize="14px" color="rgba(255,255,255,0.5)" fontFamily="heading">
              Book a cleaning today or join our network as a professional.
            </Text>
          </Box>
          <HStack gap={3} flexWrap="wrap">
            <NextLink href="/request">
              <Button bg="#0A80DB" color="white" h="44px" px={6} borderRadius="4px"
                fontWeight="700" fontSize="13px" fontFamily="heading"
                _hover={{ bg: '#0870C2' }} transition="background 0.15s" flexShrink={0}>
                Book a cleaning
                <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
              </Button>
            </NextLink>
            <NextLink href="/auth/register?role=cleaner">
              <Button variant="outline" borderColor="rgba(255,255,255,0.2)" color="white" h="44px" px={6}
                borderRadius="4px" fontWeight="700" fontSize="13px" fontFamily="heading"
                _hover={{ bg: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.4)' }}
                transition="all 0.15s" flexShrink={0}>
                Become a cleaner
              </Button>
            </NextLink>
          </HStack>
        </Flex>
      </Box>

      {/* Footer */}
      <Box bg="#0B1120" borderTop="1px solid rgba(255,255,255,0.06)" py={8}>
        <Flex px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto"
          align="center" justify="space-between" flexWrap="wrap" gap={4}>
          <HStack gap={2}>
            <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <Text fontSize="12px" color="rgba(255,255,255,0.35)" fontFamily="heading">
              © 2026 BrazilianClean. All rights reserved.
            </Text>
          </HStack>
          <HStack gap={6} flexWrap="wrap">
            {[
              { label: 'About', href: '/about' },
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
            ].map(l => (
              <NextLink key={l.label} href={l.href}>
                <Text fontSize="12px" color="rgba(255,255,255,0.35)" cursor="pointer" fontFamily="heading"
                  _hover={{ color: 'rgba(255,255,255,0.7)' }} transition="color 0.15s">{l.label}</Text>
              </NextLink>
            ))}
            <a href="mailto:support@brazilianclean.com"
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', transition: 'color 0.15s', textDecoration: 'none' }}>
              support@brazilianclean.com
            </a>
          </HStack>
        </Flex>
      </Box>

    </Box>
  );
}
