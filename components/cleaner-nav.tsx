'use client';

import { Box, Flex, HStack, Text, Icon, Button } from '@chakra-ui/react';
import {
  LucideLayoutDashboard, LucideCalendar,
  LucideWallet, LucideCrown, LucideLogOut, LucideUser, LucideCreditCard,
  LucideMenu, LucideGift,
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

// Near-black, so the bar stands apart from the white page under it; blue stays for highlights.
const NAV_BG = '#111418';
const ON_NAV = '#D4D8DE'; // text and icons on the bar (12.9:1)

export default function CleanerNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useT();
  const firstName = session?.user?.name?.split(' ')[0] ?? t('common.role_cleaner');
  const initial = firstName[0]?.toUpperCase() ?? 'P';

  const NAV_ITEMS = [
    { key: 'dashboard', icon: LucideLayoutDashboard, href: '/dashboard/cleaner' },
    { key: 'schedule',  icon: LucideCalendar,         href: '/dashboard/schedule' },
    { key: 'finances',  icon: LucideWallet,           href: '/dashboard/finances' },
    { key: 'plan',      icon: LucideCrown,            href: '/dashboard/plan' },
    { key: 'referrals', icon: LucideGift,             href: '/dashboard/referrals' },
    { key: 'profile',   icon: LucideUser,             href: '/dashboard/profile' },
    { key: 'payments',  icon: LucideCreditCard,       href: '/dashboard/payment-methods' },
  ];

  return (
    <Box
      as="nav"
      bg={NAV_BG}
      position="sticky"
      top={0}
      zIndex={50}
      style={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        h="60px"
        px={{ base: 4, md: 6, lg: 8 }}
        maxW="1440px"
        mx="auto"
        gap={2}
        // White focus ring for what sits on the dark bar; the notification panel keeps its own.
        css={{ '& > a:focus-visible, & > div > a:focus-visible, & > div > button:focus-visible, & > div > div > button:focus-visible': { outline: '2px solid white', outlineOffset: '2px' } }}
      >
        {/* Logo */}
        <NextLink href="/dashboard/cleaner" style={{ flexShrink: 0, textDecoration: 'none' }}>
          <HStack gap={0} align="center">
            <Image src="/images/brand/verliks-logo-white-600.png" alt="Verliks" width={112} height={24} style={{ objectFit: 'contain' }} />
          </HStack>
        </NextLink>

        <Box w="1px" h="22px" bg="rgba(255, 255, 255, 0.2)" flexShrink={0} mx={2} display={{ base: 'none', xl: 'block' }} />

        {/* Desktop nav */}
        <HStack h="60px" gap={1} flex={1} display={{ base: 'none', xl: 'flex' }} align="center">
          {NAV_ITEMS.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard/cleaner' && pathname.startsWith(item.href));
            return (
              <NextLink
                key={item.key}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                {/* Links in normal case; the current page is a white rectangle on the dark bar. */}
                <Box
                  px={3} h="36px" display="flex" alignItems="center" borderRadius="6px"
                  bg={isActive ? 'white' : 'transparent'} color={isActive ? NAV_BG : ON_NAV}
                  fontSize="14px" fontWeight="500"
                  whiteSpace="nowrap" transition="background 0.15s, color 0.15s"
                  _hover={isActive ? undefined : { color: 'white', bg: 'rgba(255, 255, 255, 0.08)' }}
                >
                  {t(`nav.cleaner.${item.key}`)}
                </Box>
              </NextLink>
            );
          })}
        </HStack>

        {/* Right */}
        <HStack gap={1.5} flexShrink={0} ml={{ base: 'auto', md: 0 }}>
          <HStack
            gap={2} display={{ base: 'none', lg: 'flex' }}
            bg="rgba(255, 255, 255, 0.08)" border="1px solid" borderColor="rgba(255, 255, 255, 0.16)"
            borderRadius="6px" px={3} py={1.5}
          >
            <Box
              w="22px" h="22px" bg="brand.500" borderRadius="full"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="9px" fontWeight="700" color="white" flexShrink={0}
            >
              {initial}
            </Box>
            <Text fontSize="13px" fontWeight="500" color="white" fontFamily="heading" letterSpacing="-0.01em">
              {firstName}
            </Text>
          </HStack>

          <LanguageSwitcher dark />
          <NotificationBell dark />

          <Button data-btn="ghost"
            size="sm" variant="ghost" color={ON_NAV} px={2} h="34px" borderRadius="6px"
            _hover={{ color: 'white', bg: 'rgba(255, 255, 255, 0.1)' }} transition="all 0.15s"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            title={t('common.signOut')} aria-label={t('common.signOut')}
            display={{ base: 'none', sm: 'flex' }}
          >
            <Icon as={LucideLogOut} w={4} h={4} />
          </Button>

          <Button data-btn="ghost"
            size="sm" variant="ghost" color={ON_NAV} px={2} h="34px" borderRadius="6px"
            _hover={{ color: 'white', bg: 'rgba(255, 255, 255, 0.1)' }}
            display={{ base: 'flex', xl: 'none' }}
            aria-label="Menu" aria-expanded={mobileOpen}
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
            <Box borderTop="1px solid #DDE5E9" bg="white" px={4} py={3}>
              {NAV_ITEMS.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard/cleaner' && pathname.startsWith(item.href));
                return (
                  <NextLink key={item.key} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                    <HStack
                      gap={3} px={3} py={2.5} borderRadius="6px" mb={0.5}
                      bg={isActive ? '#EDF3F5' : 'transparent'}
                      color={isActive ? '#185FC6' : '#555C66'}
                      fontWeight={isActive ? '600' : '400'}
                      fontSize="14px" fontFamily="heading"
                      border="1px solid"
                      borderColor={isActive ? '#555C66' : 'transparent'}
                      transition="all 0.15s"
                      _hover={{ bg: '#F8F8F4', color: '#185FC6' }}
                    >
                      <Icon as={item.icon} w={4} h={4} />
                      <Text>{t(`nav.cleaner.${item.key}`)}</Text>
                    </HStack>
                  </NextLink>
                );
              })}
              <HStack justify="space-between" px={3} pt={3} mt={1} borderTop="1px solid #DDE5E9">
                <HStack gap={2}>
                  <Box
                    w="28px" h="28px" bg="brand.500" borderRadius="full"
                    display="flex" alignItems="center" justifyContent="center"
                    fontSize="11px" fontWeight="700" color="white"
                  >
                    {initial}
                  </Box>
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="#111418" fontFamily="heading">{firstName}</Text>
                    <Text fontSize="11px" color="#555C66">{t('common.role_cleaner')}</Text>
                  </Box>
                </HStack>
                <HStack gap={2}>
                  <LanguageSwitcher />
                  <Button data-btn="ghost" size="sm" variant="ghost" color="#555C66" px={2}
                    _hover={{ color: '#111418', bg: 'rgba(17, 20, 24, 0.08)' }}
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
