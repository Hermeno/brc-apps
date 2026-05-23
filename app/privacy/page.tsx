'use client';

import { Box, Text, Flex, HStack, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import Image from 'next/image';

const SECTIONS = [
  {
    title: '1. Introduction',
    content: `BrazilianClean ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile platform (collectively, the "Service").

By accessing or using our Service, you agree to this Privacy Policy. If you do not agree with its terms, please discontinue use of our Service.`,
  },
  {
    title: '2. Information We Collect',
    content: `We collect information you provide directly, information collected automatically, and information from third parties.

**Information you provide:**
- Account registration: name, email address, phone number, password
- Profile information: home address, service area (for cleaners), profile photo
- Booking details: service type, date, time, address, special instructions
- Payment information: processed securely via our payment processor; we do not store full card numbers
- Communications: messages sent through our platform between clients and cleaners
- Reviews and ratings: feedback submitted after completed bookings

**Information collected automatically:**
- Device information: IP address, browser type, operating system, device identifiers
- Usage data: pages visited, features used, time spent, clicks, searches
- Location data: approximate location derived from IP address; precise GPS location only when you explicitly use our "Detect my location" feature
- Cookies and similar technologies: session cookies, preference cookies, analytics cookies

**Information from third parties:**
- Authentication providers (if you sign in via Google or similar)
- Background check providers (for cleaner verification)
- Payment processors (transaction confirmation)`,
  },
  {
    title: '3. How We Use Your Information',
    content: `We use the information we collect to:

- Create and manage your account
- Connect clients with available cleaners in their area
- Process bookings and facilitate payments
- Send booking confirmations, reminders, and receipts
- Enable in-platform messaging between clients and cleaners
- Conduct identity verification and background checks on cleaning professionals
- Calculate and display ratings and reviews
- Improve and optimize our platform, features, and matching algorithms
- Detect and prevent fraud, abuse, and security incidents
- Comply with legal obligations
- Send marketing communications (you may opt out at any time)
- Respond to customer support inquiries`,
  },
  {
    title: '4. How We Share Your Information',
    content: `We do not sell your personal information. We share information only as described below:

**With other users:**
- Clients see a cleaner's public profile (name, photo, rating, service area) when reviewing matches
- Cleaners see the client's first name, service address, and booking details when a lead is assigned
- After booking confirmation, contact details may be shared to facilitate coordination

**With service providers:**
We use trusted third-party vendors who process data on our behalf, including:
- Cloud infrastructure and database hosting (Neon/PostgreSQL, Vercel)
- Payment processing
- Background check services
- Email delivery
- Analytics

All service providers are contractually bound to protect your data and may not use it for their own purposes.

**For legal reasons:**
We may disclose information if required by law, subpoena, or court order, or if we believe disclosure is necessary to protect the safety of any person or to address fraud or security issues.

**Business transfers:**
If BrazilianClean is involved in a merger, acquisition, or asset sale, your information may be transferred. We will notify you before your data is transferred and becomes subject to a different privacy policy.`,
  },
  {
    title: '5. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide you services. Specifically:

- Active accounts: data retained for the duration of the account
- Deleted accounts: most personal data deleted within 30 days; anonymized transaction records may be retained longer for legal and financial compliance
- Booking records: retained for 7 years for tax and legal compliance
- Background check records: retained per applicable law and the policies of our background check provider
- Support communications: retained for 3 years

You may request deletion of your account and associated data at any time by contacting support@brazilianclean.com.`,
  },
  {
    title: '6. Cookies and Tracking',
    content: `We use cookies and similar technologies to:

- Keep you logged in between sessions (session cookies)
- Remember your preferences
- Analyze platform usage and performance (analytics)
- Detect security anomalies

**Types of cookies we use:**
- Essential cookies: necessary for the platform to function; cannot be disabled
- Preference cookies: remember your settings and choices
- Analytics cookies: help us understand how users interact with the platform

You can control cookies through your browser settings. Disabling certain cookies may affect platform functionality. We do not currently respond to Do Not Track browser signals, as no industry standard has been established.`,
  },
  {
    title: '7. Your Rights and Choices',
    content: `Depending on your location, you may have the following rights regarding your personal data:

- **Access:** Request a copy of the personal data we hold about you
- **Correction:** Request correction of inaccurate or incomplete data
- **Deletion:** Request deletion of your personal data (subject to legal retention requirements)
- **Portability:** Request your data in a portable, machine-readable format
- **Restriction:** Request that we limit processing of your data in certain circumstances
- **Objection:** Object to our processing of your data for marketing purposes

**California residents (CCPA):** You have the right to know what personal information we collect, request deletion, and opt out of sale (we do not sell personal information).

**EEA/UK residents (GDPR):** You have the rights listed above plus the right to lodge a complaint with your local supervisory authority.

To exercise any of these rights, contact us at support@brazilianclean.com. We will respond within 30 days.`,
  },
  {
    title: '8. Data Security',
    content: `We implement industry-standard security measures to protect your information:

- All data in transit is encrypted via TLS/HTTPS
- Passwords are hashed using bcrypt with per-user salts; plaintext passwords are never stored
- Database access is restricted to authorized systems via private networking
- Payment card data is processed by our payment provider and never passes through or is stored on our servers
- Administrative access requires multi-factor authentication
- Security vulnerabilities are promptly investigated and remediated

No system is 100% secure. If you believe your account has been compromised, contact us immediately at support@brazilianclean.com.`,
  },
  {
    title: '9. Children\'s Privacy',
    content: `Our Service is not directed to children under the age of 18. We do not knowingly collect personal information from anyone under 18. If we learn that we have collected personal information from a child under 18, we will delete that information promptly.

If you believe a child has provided us with personal information, please contact us at support@brazilianclean.com.`,
  },
  {
    title: '10. Third-Party Links',
    content: `Our platform may contain links to third-party websites or services. This Privacy Policy does not apply to those third-party sites, and we are not responsible for their privacy practices. We encourage you to review the privacy policy of any third-party site you visit.`,
  },
  {
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by:
- Email to the address associated with your account
- A prominent notice on our platform

The "Last updated" date at the top of this policy will reflect when changes took effect. Continued use of the Service after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '12. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

**BrazilianClean**
Email: support@brazilianclean.com

We are committed to working with you to resolve any privacy concerns.`,
  },
];

export default function PrivacyPage() {
  return (
    <Box bg="white" minH="100vh">

      {/* Navbar */}
      <Box
        position="fixed" top={0} left={0} right={0} zIndex={100} h="64px"
        style={{ background: 'rgba(11,17,32,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Flex align="center" h="full" px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto" justify="space-between">
          <NextLink href="/">
            <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
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
            Privacy Policy
          </Text>
          <Text fontSize="13px" color="rgba(255,255,255,0.4)" fontFamily="heading">
            Last updated: May 20, 2026
          </Text>
        </Box>
      </Box>

      {/* Content */}
      <Box px={{ base: 5, md: 10, lg: 16 }} py={16}>
        <Flex maxW="1100px" mx="auto" gap={12} align="start" flexDir={{ base: 'column', lg: 'row' }}>

          {/* Table of contents — sticky on desktop */}
          <Box
            w={{ base: 'full', lg: '220px' }}
            flexShrink={0}
            position={{ base: 'static', lg: 'sticky' }}
            top="84px"
          >
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.12em" color="#697386"
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
                  <Text fontSize="17px" fontWeight="700" color="#0A2540" fontFamily="heading"
                    mb={4} borderBottom="2px solid #E3E8EE" pb={2}>
                    {s.title}
                  </Text>
                  <Box>
                    {s.content.split('\n\n').map((para, pi) => {
                      if (para.startsWith('**') && para.endsWith('**')) {
                        return (
                          <Text key={pi} fontSize="13.5px" fontWeight="700" color="#0A2540"
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
            <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <Text fontSize="12px" color="rgba(255,255,255,0.35)" fontFamily="heading">
              © 2026 BrazilianClean. All rights reserved.
            </Text>
          </HStack>
          <HStack gap={6} flexWrap="wrap">
            {[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
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
