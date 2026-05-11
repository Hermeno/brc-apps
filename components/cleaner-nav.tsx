'use client';

import { Box, Flex, HStack, Text, Icon, Button, Circle } from '@chakra-ui/react';
import {
  LucideLayoutDashboard, LucideCompass, LucideCalendar,
  LucideWallet, LucideCrown, LucideLogOut, LucideUser, LucideCreditCard,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from '@/components/notification-bell';

const NAV_ITEMS = [
  { name: 'Dashboard',   icon: LucideLayoutDashboard, href: '/dashboard/cleaner' },
  { name: 'Marketplace', icon: LucideCompass,          href: '/dashboard/marketplace' },
  { name: 'Agenda',      icon: LucideCalendar,         href: '/dashboard/schedule' },
  { name: 'Finanças',    icon: LucideWallet,            href: '/dashboard/finances' },
  { name: 'Plano',       icon: LucideCrown,             href: '/dashboard/plan' },
  { name: 'Perfil',      icon: LucideUser,              href: '/dashboard/profile' },
  { name: 'Pagamentos',  icon: LucideCreditCard,        href: '/dashboard/payment-methods' },
];

export default function CleanerNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <Box
      bg="white"
      borderBottom="1px solid"
      borderColor="slate.100"
      position="sticky"
      top={0}
      zIndex={50}
    >
      <Flex align="center" justify="space-between" px={6} h="14" maxW="1400px" mx="auto">

        {/* Logo */}
        <NextLink href="/dashboard/cleaner">
          <HStack gap={2.5} cursor="pointer" flexShrink={0}>
            <Box
              w="30px" h="30px"
              bgGradient="to-br"
              gradientFrom="brand.500"
              gradientTo="brand.700"
              borderRadius="lg"
              display="flex" alignItems="center" justifyContent="center"
              boxShadow="0 3px 8px rgba(37,99,235,0.3)"
            >
              <Text color="white" fontWeight="black" fontSize="xs">BC</Text>
            </Box>
            <Text fontWeight="black" fontSize="sm" letterSpacing="tight" color="slate.900">
              Brazilian<Text as="span" color="brand.500">Clean</Text>
            </Text>
          </HStack>
        </NextLink>

        {/* Nav links */}
        <HStack gap={1} display={{ base: 'none', md: 'flex' }}>
          {NAV_ITEMS.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard/cleaner' && pathname.startsWith(item.href));
            return (
              <NextLink key={item.name} href={item.href}>
                <HStack
                  gap={1.5} px={3} py={2} borderRadius="lg" cursor="pointer"
                  bg={isActive ? 'brand.50' : 'transparent'}
                  color={isActive ? 'brand.600' : 'slate.500'}
                  fontWeight={isActive ? 'semibold' : 'normal'}
                  _hover={{ bg: isActive ? 'brand.50' : 'slate.50', color: isActive ? 'brand.600' : 'slate.700' }}
                  transition="all 0.15s"
                  borderBottom="2px solid"
                  borderBottomColor={isActive ? 'brand.500' : 'transparent'}
                >
                  <Icon as={item.icon} w={4} h={4} />
                  <Text fontSize="sm">{item.name}</Text>
                </HStack>
              </NextLink>
            );
          })}
        </HStack>

        {/* Right: bell + user + logout */}
        <HStack gap={2} flexShrink={0}>
          <HStack gap={2} display={{ base: 'none', sm: 'flex' }}>
            <Circle
              size="28px"
              bgGradient="to-br"
              gradientFrom="brand.400"
              gradientTo="brand.600"
              fontSize="xs"
              fontWeight="bold"
              color="white"
            >
              {session?.user?.name?.[0]?.toUpperCase() ?? 'P'}
            </Circle>
            <Text fontSize="sm" fontWeight="semibold" color="slate.700">
              {session?.user?.name?.split(' ')[0] ?? 'Profissional'}
            </Text>
          </HStack>
          <NotificationBell />
          <Button
            size="sm" variant="ghost" color="slate.400" px={2}
            _hover={{ color: 'red.500', bg: 'red.50' }}
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            title="Sair"
          >
            <Icon as={LucideLogOut} w={4} h={4} />
          </Button>
        </HStack>

      </Flex>

      {/* Mobile nav — horizontal scroll */}
      <Box display={{ base: 'flex', md: 'none' }} overflowX="auto" px={4} pb={2} gap={1}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard/cleaner' && pathname.startsWith(item.href));
          return (
            <NextLink key={item.name} href={item.href}>
              <HStack
                gap={1} px={3} py={1.5} borderRadius="lg" cursor="pointer" flexShrink={0}
                bg={isActive ? 'brand.50' : 'transparent'}
                color={isActive ? 'brand.600' : 'slate.500'}
                fontWeight={isActive ? 'semibold' : 'normal'}
                _hover={{ bg: 'slate.50' }}
                transition="all 0.15s"
              >
                <Icon as={item.icon} w={3.5} h={3.5} />
                <Text fontSize="xs">{item.name}</Text>
              </HStack>
            </NextLink>
          );
        })}
      </Box>
    </Box>
  );
}
