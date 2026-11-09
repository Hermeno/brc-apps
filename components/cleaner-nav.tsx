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

const NAV_BG = '#FFFFFF';

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
      borderBottom="1px solid #DDE5E9"
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
      >
        {/* Logo */}
        <NextLink href="/dashboard/cleaner" style={{ flexShrink: 0, textDecoration: 'none' }}>
          <HStack gap={0} align="center">
            <Image src="/images/brand/verliks-logo-600.png" alt="Verliks" width={177} height={38} style={{ objectFit: 'contain' }} />
          </HStack>
        </NextLink>

        <Box w="1px" h="22px" bg="#DDE5E9" flexShrink={0} mx={2} display={{ base: 'none', xl: 'block' }} />

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
                {/* As in the public header: uppercase links, the current page a filled rectangle. */}
                <Box
                  px={3} h="36px" display="flex" alignItems="center"
                  bg={isActive ? '#185FC6' : 'transparent'} color={isActive ? 'white' : '#18314E'}
                  fontSize="12.5px" fontWeight="600" letterSpacing="0.06em" textTransform="uppercase"
                  whiteSpace="nowrap" transition="background 0.15s, color 0.15s"
                  _hover={{ color: isActive ? 'white' : '#185FC6' }}
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
            bg="#F8F8F4" border="1px solid" borderColor="#DDE5E9"
            borderRadius="2px" px={3} py={1.5}
          >
            <Box
              w="22px" h="22px" bg="brand.500" borderRadius="full"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="9px" fontWeight="700" color="white" flexShrink={0}
            >
              {initial}
            </Box>
            <Text fontSize="13px" fontWeight="500" color="#185FC6" fontFamily="heading" letterSpacing="-0.01em">
              {firstName}
            </Text>
          </HStack>

          <LanguageSwitcher />
          <NotificationBell />

          <Button
            size="sm" variant="ghost" color="#455B70" px={2} h="34px" borderRadius="2px"
            _hover={{ color: '#18314E', bg: 'rgba(14, 52, 104, 0.08)' }} transition="all 0.15s"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            title={t('common.signOut')} aria-label={t('common.signOut')}
            display={{ base: 'none', sm: 'flex' }}
          >
            <Icon as={LucideLogOut} w={4} h={4} />
          </Button>

          <Button
            size="sm" variant="ghost" color="#455B70" px={2} h="34px" borderRadius="2px"
            _hover={{ bg: '#F8F8F4' }}
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
            <Box borderTop="1px solid #DDE5E9" bg={NAV_BG} px={4} py={3}>
              {NAV_ITEMS.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard/cleaner' && pathname.startsWith(item.href));
                return (
                  <NextLink key={item.key} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                    <HStack
                      gap={3} px={3} py={2.5} borderRadius="2px" mb={0.5}
                      bg={isActive ? '#EDF3F5' : 'transparent'}
                      color={isActive ? '#185FC6' : '#455B70'}
                      fontWeight={isActive ? '600' : '400'}
                      fontSize="14px" fontFamily="heading"
                      border="1px solid"
                      borderColor={isActive ? '#455B70' : 'transparent'}
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
                    <Text fontSize="13px" fontWeight="600" color="#185FC6" fontFamily="heading">{firstName}</Text>
                    <Text fontSize="11px" color="#455B70">{t('common.role_cleaner')}</Text>
                  </Box>
                </HStack>
                <HStack gap={2}>
                  <LanguageSwitcher />
                  <Button size="sm" variant="ghost" color="#455B70" px={2}
                    _hover={{ color: '#18314E', bg: 'rgba(14, 52, 104, 0.08)' }}
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
