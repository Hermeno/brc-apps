'use client';

import { Box, Text, Flex, HStack, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By creating an account or using the BrazilianClean platform ("Service"), you agree to these Terms of Service. If you do not agree, do not use the Service.

These terms apply to all users, including clients (homeowners) and cleaning professionals (cleaners). BrazilianClean reserves the right to update these terms at any time with notice.`,
  },
  {
    title: '2. Description of Service',
    content: `BrazilianClean operates an online marketplace that connects homeowners seeking cleaning services ("clients") with independent cleaning professionals ("cleaners"). BrazilianClean is a technology platform — we do not employ cleaners directly. Cleaners are independent contractors who use the platform to find and manage bookings.

BrazilianClean does not guarantee the availability of cleaners, specific response times, or results of any cleaning service.`,
  },
  {
    title: '3. Accounts and Registration',
    content: `To use the Service, you must create an account with accurate information. You are responsible for:

- Maintaining the confidentiality of your password
- All activity that occurs under your account
- Notifying us immediately of any unauthorized account access

You must be at least 18 years old to create an account. BrazilianClean may suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '4. Client Terms',
    content: `As a client, you agree to:

- Provide accurate booking information including address, service type, and access instructions
- Be present or provide access for the scheduled cleaning
- Treat cleaners with respect; harassment or abuse will result in account termination
- Pay for services through the platform; off-platform payments are prohibited
- Not solicit cleaners to work outside the platform for a period of 12 months after your first booking with that cleaner

BrazilianClean is not responsible for property damage claims beyond what is covered by our cleaner policies.`,
  },
  {
    title: '5. Cleaner Terms',
    content: `As a cleaning professional, you agree to:

- Provide accurate information during registration and verification
- Operate as an independent contractor, not an employee of BrazilianClean
- Purchase and maintain any required business licenses or insurance in your jurisdiction
- Arrive on time for accepted bookings or provide timely notice of cancellation
- Deliver services as described in the booking
- Not solicit clients to pay outside the platform

Cleaners pay a lead fee when accepting a booking. Lead fees are non-refundable once a booking is confirmed except in cases of platform error.`,
  },
  {
    title: '6. Payments and Fees',
    content: `All payments for services are processed through our secure payment system. Lead fees vary by service type and booking urgency:

- Standard Cleaning: starting at $10 per lead
- Deep Cleaning: starting at $20 per lead
- Move-Out / Post-Work Cleaning: starting at $32 per lead
- Same-day bookings: 1.5× multiplier applied
- Recurring clients: 1.3× multiplier applied

Prices are subject to change with reasonable notice. Clients are charged at the time of booking confirmation. Refunds for cancellations are subject to our cancellation policy.`,
  },
  {
    title: '7. Cancellations and Refunds',
    content: `**Client cancellations:**
- More than 24 hours before service: full refund
- 12–24 hours before service: 50% refund
- Less than 12 hours before service: no refund

**Cleaner cancellations:**
Cleaners who cancel accepted bookings without sufficient notice may receive a warning or account suspension. Repeated cancellations may result in permanent removal.

**Disputes:**
If you have a dispute about a completed service, contact support@brazilianclean.com within 72 hours of the service date. We will investigate and may offer partial refunds or credits at our discretion.`,
  },
  {
    title: '8. Prohibited Conduct',
    content: `You may not use BrazilianClean to:

- Submit false information or impersonate another person
- Harass, threaten, or abuse other users
- Circumvent the platform to arrange off-platform payments
- Scrape, copy, or redistribute platform content
- Use automated tools to access the Service without permission
- Engage in fraudulent bookings or fake reviews
- Violate any applicable law

Violation of these prohibitions may result in immediate account termination and legal action where applicable.`,
  },
  {
    title: '9. Reviews and Ratings',
    content: `Reviews and ratings must be honest and based on genuine experiences. You may not:

- Post fake reviews for services not performed
- Offer compensation in exchange for positive reviews
- Post reviews that contain defamatory, harassing, or illegal content

BrazilianClean reserves the right to remove reviews that violate these policies.`,
  },
  {
    title: '10. Intellectual Property',
    content: `All content on the BrazilianClean platform — including the name, logo, interface design, and text — is owned by BrazilianClean or its licensors. You may not copy, reproduce, or distribute any platform content without written permission.

You retain ownership of any content you submit (photos, reviews, profile information) but grant BrazilianClean a non-exclusive license to display and use that content in connection with the Service.`,
  },
  {
    title: '11. Disclaimer of Warranties',
    content: `The Service is provided "as is" without warranties of any kind, express or implied. BrazilianClean does not warrant that:

- The Service will be uninterrupted or error-free
- Cleaners will be available in all areas or at all times
- Results of any cleaning service will meet your specific expectations

Use of the Service is at your own risk.`,
  },
  {
    title: '12. Limitation of Liability',
    content: `To the fullest extent permitted by law, BrazilianClean shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to property damage, personal injury, or lost revenue, arising from your use of the Service.

Our total liability to any user for any claim arising from these terms shall not exceed the total fees paid to BrazilianClean in the 3 months preceding the claim.`,
  },
  {
    title: '13. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Miami-Dade County, Florida, unless otherwise required by applicable law.`,
  },
  {
    title: '14. Contact',
    content: `For questions about these Terms of Service, contact us at:

BrazilianClean
Email: support@brazilianclean.com`,
  },
];

export default function TermsPage() {
  return (
    <Box bg="white" minH="100vh">

      {/* Navbar */}
      <Box
        position="fixed" top={0} left={0} right={0} zIndex={100} h="64px"
        style={{ background: 'rgba(11,17,32,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Flex align="center" h="full" px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto" justify="space-between">
          <NextLink href="/">
            <HStack gap={2.5} cursor="pointer">
              <Box w="32px" h="32px" bg="#0A80DB" style={{ borderRadius: 6 }}
                display="flex" alignItems="center" justifyContent="center">
                <Text color="white" fontWeight="800" fontSize="11px" letterSpacing="-0.02em" fontFamily="heading">BC</Text>
              </Box>
              <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="white" fontFamily="heading">
                Brazilian<Text as="span" color="#0A80DB">Clean</Text>
              </Text>
            </HStack>
          </NextLink>
        </Flex>
      </Box>

      {/* Header */}
      <Box bg="#0B1120" pt="100px" pb={12} px={{ base: 5, md: 10, lg: 16 }}>
        <Box maxW="760px" mx="auto">
          <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.14em" color="#0A80DB"
            textTransform="uppercase" fontFamily="heading" mb={3}>
            Legal
          </Text>
          <Text as="h1" fontSize={{ base: '32px', md: '44px' }} fontWeight="800"
            letterSpacing="-0.03em" color="white" fontFamily="heading" mb={3}>
            Terms of Service
          </Text>
          <Text fontSize="13px" color="rgba(255,255,255,0.4)" fontFamily="heading">
            Last updated: May 20, 2026
          </Text>
        </Box>
      </Box>

      {/* Content */}
      <Box px={{ base: 5, md: 10, lg: 16 }} py={16}>
        <Flex maxW="1100px" mx="auto" gap={12} align="start" flexDir={{ base: 'column', lg: 'row' }}>

          {/* Table of contents */}
          <Box
            w={{ base: 'full', lg: '220px' }}
            flexShrink={0}
            position={{ base: 'static', lg: 'sticky' }}
            top="84px"
          >
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="#94A3B8"
              textTransform="uppercase" fontFamily="heading" mb={3}>
              Contents
            </Text>
            <VStack gap={1} align="stretch">
              {SECTIONS.map(s => (
                <a
                  key={s.title}
                  href={`#${s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: '1.5', padding: '2px 0', display: 'block', textDecoration: 'none', transition: 'color 0.15s' }}
                >
                  {s.title}
                </a>
              ))}
            </VStack>
          </Box>

          {/* Sections */}
          <Box flex={1} maxW="680px">
            <VStack gap={10} align="stretch">
              {SECTIONS.map(s => (
                <Box key={s.title} id={s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
                  <Text fontSize="17px" fontWeight="700" color="#0B1120" fontFamily="heading"
                    mb={4} borderBottom="2px solid #E2E8F0" pb={2}>
                    {s.title}
                  </Text>
                  <Box>
                    {s.content.split('\n\n').map((para, pi) => {
                      if (para.startsWith('**') && para.endsWith('**')) {
                        return (
                          <Text key={pi} fontSize="13.5px" fontWeight="700" color="#0B1120"
                            fontFamily="heading" mt={4} mb={1}>
                            {para.replace(/\*\*/g, '')}
                          </Text>
                        );
                      }
                      if (para.startsWith('- ')) {
                        return (
                          <VStack key={pi} gap={1} align="stretch" my={2}>
                            {para.split('\n').map((line, li) => (
                              <HStack key={li} gap={2} align="start">
                                <Text fontSize="13.5px" color="#0A80DB" mt="1px" flexShrink={0}>•</Text>
                                <Text fontSize="13.5px" color="#475569" lineHeight="1.75" fontFamily="heading">
                                  {line.replace(/^- /, '').replace(/\*\*([^*]+)\*\*/g, '$1')}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        );
                      }
                      return (
                        <Text key={pi} fontSize="13.5px" color="#475569" lineHeight="1.8"
                          fontFamily="heading" mb={3}>
                          {para.replace(/\*\*([^*]+)\*\*/g, '$1')}
                        </Text>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </VStack>
          </Box>

        </Flex>
      </Box>

      {/* Footer */}
      <Box bg="#0B1120" borderTop="1px solid rgba(255,255,255,0.06)" py={8}>
        <Flex px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto"
          align="center" justify="space-between" flexWrap="wrap" gap={4}>
          <HStack gap={2}>
            <Box w="24px" h="24px" bg="#0A80DB" style={{ borderRadius: 4 }}
              display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="800" fontSize="9px" fontFamily="heading">BC</Text>
            </Box>
            <Text fontSize="12px" color="rgba(255,255,255,0.35)" fontFamily="heading">
              © 2026 BrazilianClean. All rights reserved.
            </Text>
          </HStack>
          <HStack gap={6} flexWrap="wrap">
            {[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
              { label: 'Privacy', href: '/privacy' },
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
