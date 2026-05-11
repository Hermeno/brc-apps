'use client';

import {
  Box,
  Flex,
  Text,
  Icon,
  VStack,
  HStack,
  Circle,
} from '@chakra-ui/react';
import {
  LucideLayoutDashboard,
  LucideCompass,
  LucideCalendar,
  LucideWallet,
  LucideCrown,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

const NAV_ITEMS = [
  { name: 'Dashboard',   icon: LucideLayoutDashboard, href: '/dashboard' },
  { name: 'Marketplace', icon: LucideCompass,          href: '/dashboard/marketplace' },
  { name: 'Agenda',      icon: LucideCalendar,         href: '/dashboard/schedule' },
  { name: 'Finanças',    icon: LucideWallet,            href: '/dashboard/finances' },
  { name: 'Plano',       icon: LucideCrown,             href: '/dashboard/plan' },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ display: 'flex', flexShrink: 0 }}
    >
      <Box
        w="240px"
        bg="white"
        borderRight="1px solid"
        borderColor="slate.100"
        display="flex"
        flexDirection="column"
        h="100vh"
      >
        {/* Brand */}
        <Box px={6} py={6} borderBottom="1px solid" borderColor="slate.100">
          <HStack gap={3}>
            <Box
              w="36px" h="36px"
              bgGradient="to-br"
              gradientFrom="brand.500"
              gradientTo="brand.700"
              borderRadius="xl"
              display="flex" alignItems="center" justifyContent="center"
              boxShadow="0 4px 12px rgba(37,99,235,0.3)"
            >
              <Text color="white" fontWeight="black" fontSize="sm">BC</Text>
            </Box>
            <Text fontWeight="black" fontSize="md" letterSpacing="tight" color="slate.900">
              Brazilian<Text as="span" color="brand.500">Clean</Text>
            </Text>
          </HStack>
        </Box>

        {/* Nav */}
        <Box px={3} flex={1} py={4}>
          <VStack align="stretch" gap={1}>
            {NAV_ITEMS.map((item, i) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <NextLink href={item.href}>
                    <Flex
                      alignItems="center"
                      gap={3}
                      px={4}
                      py="2.5"
                      bg={isActive ? 'brand.50' : 'transparent'}
                      color={isActive ? 'brand.600' : 'slate.500'}
                      _hover={{
                        bg: isActive ? 'brand.50' : 'slate.50',
                        color: isActive ? 'brand.600' : 'slate.700',
                        textDecoration: 'none',
                      }}
                      borderRadius="xl"
                      fontWeight={isActive ? 'semibold' : 'normal'}
                      transition="all 0.15s"
                      borderLeft="3px solid"
                      borderLeftColor={isActive ? 'brand.500' : 'transparent'}
                      cursor="pointer"
                    >
                      <Icon as={item.icon} w={5} h={5} />
                      <Text fontSize="sm">{item.name}</Text>
                    </Flex>
                  </NextLink>
                </motion.div>
              );
            })}
          </VStack>
        </Box>

        {/* Profile Footer */}
        <Box p={4} borderTop="1px solid" borderColor="slate.100">
          <Flex align="center" gap={3} p={3} bg="slate.50" borderRadius="xl">
            <Circle
              size="38px"
              bgGradient="to-br"
              gradientFrom="brand.400"
              gradientTo="brand.600"
              fontSize="sm"
              fontWeight="bold"
              color="white"
              flexShrink={0}
            >
              {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
            </Circle>
            <Box overflow="hidden" flex={1}>
              <Text fontSize="sm" fontWeight="bold" color="slate.800" lineClamp={1}>
                {session?.user?.name ?? 'Usuário'}
              </Text>
              <Text fontSize="xs" color="brand.500" fontWeight="semibold" lineClamp={1}>
                {(session?.user as any)?.role === 'CLEANER' ? 'Profissional' : 'Cliente'}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>
    </motion.div>
  );
}
