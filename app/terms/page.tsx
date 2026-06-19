'use client';

import { useState } from 'react';
import { Box, Text, Flex, HStack, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/lib/i18n';
import { termsContent } from '@/messages/terms';
import type { Locale } from '@/lib/i18n';

export default function TermsPage() {
  const { locale, setLocale } = useLocale();
  const [activeId, setActiveId] = useState<string | null>(null);
  const content = termsContent[locale as Locale] ?? termsContent.en;

  return (
    <Box bg="white" minH="100vh">

      {/* ── Navbar ── */}
      <Box
        position="fixed" top={0} left={0} right={0} zIndex={100} h="64px"
        style={{ background: 'rgba(11,17,32,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Flex align="center" h="full" px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto" justify="space-between">
          <NextLink href="/" style={{ textDecoration: 'none' }}>
            <HStack gap={2.5}>
              <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} />
              <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="white" fontFamily="heading">
                Brazilian<Text as="span" color="#1F6FEA">Clean</Text>
              </Text>
            </HStack>
          </NextLink>
          <HStack gap={3}>
            <NextLink href="/privacy" style={{ textDecoration: 'none' }}>
              <Text fontSize="12px" color="rgba(255,255,255,0.45)" fontFamily="heading"
                _hover={{ color: 'rgba(255,255,255,0.8)' }} transition="color 0.15s" cursor="pointer">
                Privacy Policy
              </Text>
            </NextLink>
            {/* Language Toggle */}
            <HStack gap={0} border="1px solid rgba(255,255,255,0.18)" borderRadius="4px" overflow="hidden">
              {(['en', 'pt'] as Locale[]).map((lang) => (
                <Box
                  key={lang}
                  as="button"
                  onClick={() => setLocale(lang)}
                  px={3} py={1}
                  fontSize="11px" fontWeight="700" fontFamily="heading"
                  textTransform="uppercase" letterSpacing="0.06em"
                  bg={locale === lang ? '#1F6FEA' : 'transparent'}
                  color={locale === lang ? 'white' : 'rgba(255,255,255,0.45)'}
                  transition="all 0.15s"
                  cursor="pointer"
                  border="none"
                  _hover={{ color: locale === lang ? 'white' : 'rgba(255,255,255,0.8)' }}
                >
                  {lang.toUpperCase()}
                </Box>
              ))}
            </HStack>
          </HStack>
        </Flex>
      </Box>

      {/* ── Header ── */}
      <Box bg="#0B1E3D" pt="100px" pb={14} px={{ base: 5, md: 10, lg: 16 }}>
        <Box maxW="860px" mx="auto">
          <Text fontSize="10px" fontWeight="700" letterSpacing="0.16em" color="#1F6FEA"
            textTransform="uppercase" fontFamily="heading" mb={3}>
            Legal
          </Text>
          <Text as="h1" fontSize={{ base: '30px', md: '44px' }} fontWeight="800"
            letterSpacing="-0.03em" color="white" fontFamily="heading" mb={3}>
            {content.pageTitle}
          </Text>
          <HStack gap={4} flexWrap="wrap">
            <Text fontSize="12px" color="rgba(255,255,255,0.38)" fontFamily="heading">
              {content.lastUpdated}
            </Text>
            <Text fontSize="12px" color="rgba(255,255,255,0.22)" fontFamily="heading">·</Text>
            <Text fontSize="12px" color="rgba(255,255,255,0.38)" fontFamily="heading">
              {content.effectiveDate}
            </Text>
          </HStack>
          <Box mt={5} p={4} borderRadius="4px" style={{ background: 'rgba(31,111,234,0.12)', borderLeft: '3px solid #1F6FEA' }}>
            <Text fontSize="13px" color="rgba(255,255,255,0.65)" lineHeight="1.7" fontFamily="heading">
              {content.intro}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box px={{ base: 4, md: 10, lg: 16 }} py={14}>
        <Flex maxW="1100px" mx="auto" gap={10} align="start" flexDir={{ base: 'column', lg: 'row' }}>

          {/* ── Table of Contents ── */}
          <Box
            w={{ base: 'full', lg: '240px' }}
            flexShrink={0}
            position={{ base: 'static', lg: 'sticky' }}
            top="80px"
            maxH={{ lg: 'calc(100vh - 100px)' }}
            overflowY={{ lg: 'auto' }}
            pb={4}
            style={{ scrollbarWidth: 'thin' }}
          >
            <Text fontSize="9.5px" fontWeight="800" letterSpacing="0.14em" color="#8A9BB0"
              textTransform="uppercase" fontFamily="heading" mb={3}>
              {locale === 'pt' ? 'Índice' : 'Contents'}
            </Text>
            <VStack gap={0} align="stretch">
              {content.sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveId(s.id)}
                  style={{
                    fontSize: '11.5px',
                    color: activeId === s.id ? '#1F6FEA' : '#94A3B8',
                    lineHeight: '1.5',
                    padding: '5px 8px',
                    display: 'block',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                    borderLeft: `2px solid ${activeId === s.id ? '#1F6FEA' : 'transparent'}`,
                    borderRadius: '0 2px 2px 0',
                  }}
                >
                  {s.title}
                </a>
              ))}
            </VStack>
          </Box>

          {/* ── Sections ── */}
          <Box flex={1} minW={0}>
            <VStack gap={10} align="stretch">
              {content.sections.map((s) => (
                <Box
                  key={s.id}
                  id={s.id}
                  scrollMarginTop="84px"
                  borderBottom="1px solid #E3E8EE"
                  pb={10}
                  _last={{ borderBottom: 'none' }}
                >
                  <Text
                    fontSize={{ base: '15px', md: '17px' }}
                    fontWeight="700"
                    color="#0B1E3D"
                    fontFamily="heading"
                    mb={5}
                    pb={3}
                    borderBottom="2px solid #1F6FEA"
                    display="inline-block"
                  >
                    {s.title}
                  </Text>

                  <VStack gap={3} align="stretch">
                    {s.content.map((para, pi) => {
                      /* Contact block with line breaks */
                      if (para.includes('\n')) {
                        return (
                          <Box
                            key={pi}
                            p={4}
                            borderRadius="4px"
                            style={{ background: '#F4F7FB', borderLeft: '3px solid #1F6FEA' }}
                          >
                            {para.split('\n').map((line, li) => (
                              <Text key={li} fontSize="13px" color="#4A5568" lineHeight="1.8" fontFamily="heading">
                                {line}
                              </Text>
                            ))}
                          </Box>
                        );
                      }
                      /* CAPS paragraphs (disclaimers) */
                      if (para === para.toUpperCase() && para.length > 60) {
                        return (
                          <Box
                            key={pi}
                            p={4}
                            borderRadius="4px"
                            style={{ background: '#FFF8F0', border: '1px solid #F6AD55' }}
                          >
                            <Text fontSize="11.5px" color="#744210" lineHeight="1.75" fontFamily="heading"
                              fontWeight="500" letterSpacing="0.01em">
                              {para}
                            </Text>
                          </Box>
                        );
                      }
                      /* Normal paragraph */
                      return (
                        <Text key={pi} fontSize="13.5px" color="#4A5568" lineHeight="1.85"
                          fontFamily="heading">
                          {para}
                        </Text>
                      );
                    })}
                  </VStack>
                </Box>
              ))}
            </VStack>

            {/* ── Contact CTA ── */}
            <Box mt={12} p={6} borderRadius="6px"
              style={{ background: '#F4F7FB', border: '1px solid #D8E2EE' }}>
              <Text fontSize="14px" fontWeight="700" color="#0B1E3D" fontFamily="heading" mb={1}>
                {locale === 'pt' ? 'Alguma dúvida?' : 'Have questions?'}
              </Text>
              <Text fontSize="13px" color="#4A5568" fontFamily="heading" mb={3}>
                {locale === 'pt'
                  ? 'Nossa equipe de suporte está pronta para ajudar.'
                  : 'Our support team is ready to help.'}
              </Text>
              <a href="mailto:support@brazilianclean.com"
                style={{
                  display: 'inline-block', fontSize: '12.5px', fontWeight: '600',
                  color: '#1F6FEA', fontFamily: 'heading', textDecoration: 'none',
                  padding: '8px 20px', border: '1px solid #1F6FEA',
                  borderRadius: '4px', transition: 'all 0.15s',
                }}>
                support@brazilianclean.com
              </a>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* ── Footer ── */}
      <Box bg="#0B1E3D" borderTop="1px solid rgba(255,255,255,0.06)" py={8}>
        <Flex px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto"
          align="center" justify="space-between" flexWrap="wrap" gap={4}>
          <HStack gap={2.5}>
            <Image src="/2.png" alt="BrazilianClean" width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <Text fontSize="12px" color="rgba(255,255,255,0.3)" fontFamily="heading">
              © 2026 BrazilianClean. {locale === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
            </Text>
          </HStack>
          <HStack gap={5} flexWrap="wrap">
            {[
              { label: locale === 'pt' ? 'Início' : 'Home', href: '/' },
              { label: 'Privacy Policy', href: '/privacy' },
            ].map((l) => (
              <NextLink key={l.href} href={l.href}>
                <Text fontSize="12px" color="rgba(255,255,255,0.3)" cursor="pointer" fontFamily="heading"
                  _hover={{ color: 'rgba(255,255,255,0.65)' }} transition="color 0.15s">
                  {l.label}
                </Text>
              </NextLink>
            ))}
            <a href="mailto:support@brazilianclean.com"
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
              support@brazilianclean.com
            </a>
          </HStack>
        </Flex>
      </Box>

    </Box>
  );
}
