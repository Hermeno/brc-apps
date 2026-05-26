'use client';

import { Box, Flex, HStack, Text, Icon, Button } from '@chakra-ui/react';
import {
  LucideLayoutDashboard, LucideCompass, LucideCalendar,
  LucideWallet, LucideCrown, LucideLogOut, LucideUser, LucideCreditCard,
  LucideMenu,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from '@/components/notification-bell';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';

const NAV_ITEMS = [
  { name: 'Dashboard',  icon: LucideLayoutDashboard, href: '/dashboard/cleaner' },
  { name: 'Marketplace', icon: LucideCompass,         href: '/dashboard/marketplace' },
  { name: 'Schedule',   icon: LucideCalendar,         href: '/dashboard/schedule' },
  { name: 'Finances',   icon: LucideWallet,           href: '/dashboard/finances' },
  { name: 'Plan',       icon: LucideCrown,            href: '/dashboard/plan' },
  { name: 'Profile',    icon: LucideUser,             href: '/dashboard/profile' },
  { name: 'Payments',   icon: LucideCreditCard,       href: '/dashboard/payment-methods' },
];

const NAV_BG = '#0B1120';

export default function CleanerNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Cleaner';
  const initial = firstName[0]?.toUpperCase() ?? 'P';

  return (
    <Box
      as="nav"
      bg={NAV_BG}
      borderBottom="1px solid rgba(255,255,255,0.06)"
      position="sticky"
      top={0}
      zIndex={50}
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
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
          <HStack gap={2}>
            <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <Text fontWeight="700" fontSize={{ base: '13px', md: '15px' }} letterSpacing="-0.02em" color="white" fontFamily="heading">
              Brazilian<Text as="span" color="brand.400">Clean</Text>
            </Text>
          </HStack>
        </NextLink>

        <Box w="1px" h="22px" bg="rgba(255,255,255,0.1)" flexShrink={0} mx={2} display={{ base: 'none', md: 'block' }} />

        {/* Desktop nav */}
        <HStack h="60px" gap={0} flex={1} display={{ base: 'none', md: 'flex' }} align="center">
          {NAV_ITEMS.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard/cleaner' && pathname.startsWith(item.href));
            return (
              <NextLink
                key={item.name}
                href={item.href}
                style={{ display: 'flex', height: '60px', alignItems: 'center', textDecoration: 'none' }}
              >
                <Box position="relative" h="full" px={3} display="flex" alignItems="center" cursor="pointer">
                  <HStack
                    gap={1.5}
                    color={isActive ? 'white' : '#94A3B8'}
                    fontWeight={isActive ? '600' : '400'}
                    fontSize="13.5px"
                    fontFamily="heading"
                    letterSpacing="-0.01em"
                    transition="color 0.15s"
                    _hover={{ color: isActive ? 'white' : '#CBD5E1' }}
                  >
                    <Icon as={item.icon} w="14px" h="14px" />
                    <Text>{item.name}</Text>
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
            bg="rgba(255,255,255,0.06)" border="1px solid" borderColor="rgba(255,255,255,0.1)"
            borderRadius="full" px={3} py={1.5}
          >
            <Box
              w="22px" h="22px" bg="brand.500" borderRadius="full"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="9px" fontWeight="700" color="white" flexShrink={0}
            >
              {initial}
            </Box>
            <Text fontSize="13px" fontWeight="500" color="#CBD5E1" fontFamily="heading" letterSpacing="-0.01em">
              {firstName}
            </Text>
          </HStack>

          <NotificationBell dark />

          <Button
            size="sm" variant="ghost" color="#6B7280" px={2} h="34px" borderRadius="lg"
            _hover={{ color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' }} transition="all 0.15s"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            title="Sair"
            display={{ base: 'none', sm: 'flex' }}
          >
            <Icon as={LucideLogOut} w={4} h={4} />
          </Button>

          <Button
            size="sm" variant="ghost" color="#94A3B8" px={2} h="34px" borderRadius="lg"
            _hover={{ bg: 'rgba(255,255,255,0.08)' }}
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
            <Box borderTop="1px solid rgba(255,255,255,0.06)" bg={NAV_BG} px={4} py={3}>
              {NAV_ITEMS.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard/cleaner' && pathname.startsWith(item.href));
                return (
                  <NextLink key={item.name} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                    <HStack
                      gap={3} px={3} py={2.5} borderRadius="4px" mb={0.5}
                      bg={isActive ? 'rgba(26,127,160,0.15)' : 'transparent'}
                      color={isActive ? 'white' : '#94A3B8'}
                      fontWeight={isActive ? '600' : '400'}
                      fontSize="14px" fontFamily="heading"
                      border="1px solid"
                      borderColor={isActive ? 'rgba(26,127,160,0.25)' : 'transparent'}
                      transition="all 0.15s"
                      _hover={{ bg: 'rgba(255,255,255,0.06)', color: '#CBD5E1' }}
                    >
                      <Icon as={item.icon} w={4} h={4} />
                      <Text>{item.name}</Text>
                    </HStack>
                  </NextLink>
                );
              })}
              <HStack justify="space-between" px={3} pt={3} mt={1} borderTop="1px solid rgba(255,255,255,0.06)">
                <HStack gap={2}>
                  <Box
                    w="28px" h="28px" bg="brand.500" borderRadius="full"
                    display="flex" alignItems="center" justifyContent="center"
                    fontSize="11px" fontWeight="700" color="white"
                  >
                    {initial}
                  </Box>
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="white" fontFamily="heading">{firstName}</Text>
                    <Text fontSize="11px" color="#475569">Cleaner</Text>
                  </Box>
                </HStack>
                <Button size="sm" variant="ghost" color="#6B7280" px={2}
                  _hover={{ color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' }}
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                  <Icon as={LucideLogOut} w={4} h={4} />
                </Button>
              </HStack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
