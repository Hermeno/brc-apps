'use client';

import { Box, Flex, HStack, Text, Icon, Button } from '@chakra-ui/react';
import {
  LucideLayoutDashboard, LucideCompass, LucideCalendar,
  LucideWallet, LucideCrown, LucideLogOut, LucideMenu,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from '@/components/notification-bell';
import LanguageSwitcher from '@/components/language-switcher';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useT } from '@/lib/i18n';

const NAV_BG = '#ffffff';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useT();
  const firstName = session?.user?.name?.split(' ')[0] ?? t('common.role_client');
  const initial = firstName[0]?.toUpperCase() ?? 'U';

  const NAV_ITEMS = [
    { key: 'dashboard',   icon: LucideLayoutDashboard, href: '/dashboard' },
    { key: 'marketplace', icon: LucideCompass,          href: '/dashboard/marketplace' },
    { key: 'schedule',    icon: LucideCalendar,         href: '/dashboard/schedule' },
    { key: 'finances',    icon: LucideWallet,           href: '/dashboard/finances' },
    { key: 'plan',        icon: LucideCrown,            href: '/dashboard/plan' },
  ];

  return (
    <Box
      as="nav"
      bg={NAV_BG}
      borderBottom="1px solid #E2E8F0"
      position="sticky"
      top={0}
      zIndex={50}
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
    >
      <Flex
        align="center"
        h="60px"
        px={{ base: 4, md: 6, lg: 8 }}
        maxW="1440px"
        mx="auto"
        gap={2}
      >
        {/* Logo */}
        <NextLink href="/dashboard" style={{ flexShrink: 0, textDecoration: 'none' }}>
          <HStack gap={2}>
            <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <Text fontWeight="700" fontSize={{ base: '13px', md: '15px' }} letterSpacing="-0.02em" color="#0A3D7A" fontFamily="heading">
              Brazilian<Text as="span" color="#0A80DB">Clean</Text>
            </Text>
          </HStack>
        </NextLink>

        <Box w="1px" h="22px" bg="#E2E8F0" flexShrink={0} mx={2} display={{ base: 'none', md: 'block' }} />

        {/* Desktop nav */}
        <HStack h="60px" gap={0} flex={1} display={{ base: 'none', md: 'flex' }} align="center">
          {NAV_ITEMS.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <NextLink
                key={item.key}
                href={item.href}
                style={{ display: 'flex', height: '60px', alignItems: 'center', textDecoration: 'none' }}
              >
                <Box position="relative" h="full" px={3} display="flex" alignItems="center" cursor="pointer">
                  <HStack
                    gap={1.5}
                    color={isActive ? '#0A3D7A' : '#64748B'}
                    fontWeight={isActive ? '600' : '400'}
                    fontSize="13.5px"
                    fontFamily="heading"
                    letterSpacing="-0.01em"
                    transition="color 0.15s"
                    _hover={{ color: '#0A3D7A' }}
                  >
                    <Icon as={item.icon} w="14px" h="14px" />
                    <Text>{t(`nav.client.${item.key}`)}</Text>
                  </HStack>
                  {isActive && (
                    <Box
                      position="absolute" bottom={0} left={2} right={2}
                      h="2px" bg="brand.500" borderRadius="2px 2px 0 0"
                    />
                  )}
                </Box>
              </NextLink>
            );
          })}
        </HStack>

        {/* Right */}
        <HStack gap={1.5} flexShrink={0} ml={{ base: 'auto', md: 0 }}>
          <HStack
            gap={2} display={{ base: 'none', lg: 'flex' }}
            bg="#F8FAFC" border="1px solid" borderColor="#E2E8F0"
            borderRadius="full" px={3} py={1.5}
          >
            <Box
              w="22px" h="22px" bg="brand.500" borderRadius="full"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="9px" fontWeight="700" color="white" flexShrink={0}
            >
              {initial}
            </Box>
            <Text fontSize="13px" fontWeight="500" color="#0A3D7A" fontFamily="heading" letterSpacing="-0.01em">
              {firstName}
            </Text>
          </HStack>

          <LanguageSwitcher />
          <NotificationBell />

          <Button
            size="sm" variant="ghost" color="#64748B" px={2} h="34px" borderRadius="lg"
            _hover={{ color: '#F43F5E', bg: 'rgba(244,63,94,0.08)' }} transition="all 0.15s"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            title={t('common.signOut')}
            display={{ base: 'none', sm: 'flex' }}
          >
            <Icon as={LucideLogOut} w={4} h={4} />
          </Button>

          <Button
            size="sm" variant="ghost" color="#64748B" px={2} h="34px" borderRadius="lg"
            _hover={{ bg: '#F1F5F9' }}
            display={{ base: 'flex', md: 'none' }}
            onClick={() => setMobileOpen(v => !v)}
          >
            <Icon as={LucideMenu} w={4.5} h={4.5} />
          </Button>
        </HStack>
      </Flex>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <Box borderTop="1px solid #E2E8F0" bg={NAV_BG} px={4} py={3}>
              {NAV_ITEMS.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <NextLink key={item.key} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                    <HStack
                      gap={3} px={3} py={2.5} borderRadius="4px" mb={0.5}
                      bg={isActive ? '#EFF6FF' : 'transparent'}
                      color={isActive ? '#0A3D7A' : '#64748B'}
                      fontWeight={isActive ? '600' : '400'}
                      fontSize="14px" fontFamily="heading"
                      border="1px solid"
                      borderColor={isActive ? '#BFDBFE' : 'transparent'}
                      transition="all 0.15s"
                      _hover={{ bg: '#F8FAFC', color: '#0A3D7A' }}
                    >
                      <Icon as={item.icon} w={4} h={4} />
                      <Text>{t(`nav.client.${item.key}`)}</Text>
                    </HStack>
                  </NextLink>
                );
              })}
              <HStack justify="space-between" px={3} pt={3} mt={1} borderTop="1px solid #E2E8F0">
                <HStack gap={2}>
                  <Box
                    w="28px" h="28px" bg="brand.500" borderRadius="full"
                    display="flex" alignItems="center" justifyContent="center"
                    fontSize="11px" fontWeight="700" color="white"
                  >
                    {initial}
                  </Box>
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#0A3D7A" fontFamily="heading">{firstName}</Text>
                    <Text fontSize="11px" color="#64748B">{t('common.role_client')}</Text>
                  </Box>
                </HStack>
                <HStack gap={2}>
                  <LanguageSwitcher />
                  <Button size="sm" variant="ghost" color="#64748B" px={2}
                    _hover={{ color: '#F43F5E', bg: 'rgba(244,63,94,0.08)' }}
                    onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                    <Icon as={LucideLogOut} w={4} h={4} />
                  </Button>
                </HStack>
              </HStack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
