'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, VStack, HStack, Icon, Badge, Flex } from '@chakra-ui/react';
import { LucideBell, LucideCheck, LucideTrash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n';

type Notification = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

const TYPE_ICONS: Record<string, string> = {
  lead_received:     '🔔',
  cleaner_responded: '👷',
  client_accepted:   '✅',
  message_received:  '💬',
  job_completed:     '🎉',
  review_received:   '⭐',
  lead_unmatched:    '😔',
};

export default function NotificationBell({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const t = useT();

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return t('notifications.justNow');
    if (mins < 60) return t('notifications.minutesAgo', { n: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return t('notifications.hoursAgo', { n: hrs });
    return t('notifications.daysAgo', { n: Math.floor(hrs / 24) });
  }
  const [open, setOpen]            = useState(false);
  const [unread, setUnread]        = useState(0);
  const [notifications, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading]      = useState(false);
  const [pulse, setPulse]          = useState(false);
  const panelRef                   = useRef<HTMLDivElement>(null);
  const prevUnread                 = useRef(0);

  useEffect(() => {
    let es: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;
    const connect = () => {
      es = new EventSource('/api/notifications/stream');
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (typeof data.unreadCount === 'number') {
            if (data.unreadCount > prevUnread.current) {
              setPulse(true);
              setTimeout(() => setPulse(false), 1000);
            }
            prevUnread.current = data.unreadCount;
            setUnread(data.unreadCount);
          }
        } catch {}
      };
      es.onerror = () => { es.close(); retryTimeout = setTimeout(connect, 10000); };
    };
    connect();
    return () => { es?.close(); clearTimeout(retryTimeout); };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications ?? []);
        setUnread(data.unreadCount ?? 0);
        prevUnread.current = data.unreadCount ?? 0;
      }
    } finally { setLoading(false); }
  }, []);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0); prevUnread.current = 0;
  };

  const clearAll = async () => {
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifs([]); setUnread(0); prevUnread.current = 0;
  };

  const handleClick = (n: Notification) => {
    if (!n.read) {
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
      fetch('/api/notifications', { method: 'PATCH' });
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <Box position="relative" ref={panelRef}>
      {/* Bell button */}
      <Box
        as="button"
        position="relative"
        w="34px" h="34px"
        display="flex" alignItems="center" justifyContent="center"
        borderRadius="lg"
        color={open ? (dark ? 'white' : 'brand.600') : (dark ? '#94A3B8' : 'slate.500')}
        bg={open ? (dark ? 'rgba(26,127,160,0.15)' : 'brand.50') : 'transparent'}
        border="1px solid"
        borderColor={open ? (dark ? 'rgba(26,127,160,0.3)' : 'brand.200') : 'transparent'}
        _hover={dark
          ? { bg: 'rgba(255,255,255,0.08)', color: '#E2E8F0', borderColor: 'rgba(255,255,255,0.12)' }
          : { bg: 'slate.100', color: 'slate.700', borderColor: 'slate.200' }
        }
        transition="all 0.15s"
        cursor="pointer"
        onClick={handleOpen}
      >
        <motion.div
          animate={pulse ? { rotate: [0, -18, 18, -12, 12, 0] } : {}}
          transition={{ duration: 0.45 }}
        >
          <Icon as={LucideBell} w="15px" h="15px" />
        </motion.div>

        <AnimatePresence>
          {unread > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              style={{ position: 'absolute', top: 3, right: 3 }}
            >
              <Box
                minW="14px" h="14px" bg="red.500" borderRadius="full"
                display="flex" alignItems="center" justifyContent="center"
                style={{ border: `2px solid ${dark ? '#0B1120' : 'white'}` }}
              >
                <Text color="white" fontSize="7px" fontWeight="800" lineHeight={1} fontFamily="heading">
                  {unread > 9 ? '9+' : unread}
                </Text>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              zIndex: 9999,
              width: '360px',
            }}
          >
            <Box
              bg="white"
              borderRadius="16px"
              border="1px solid"
              borderColor="slate.200"
              overflow="hidden"
              style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06)' }}
            >
              {/* Header */}
              <Flex
                justify="space-between" align="center"
                px={4} py={3}
                borderBottom="1px solid" borderColor="slate.100"
              >
                <HStack gap={2}>
                  <Text
                    fontWeight="700" fontSize="13.5px" color="slate.900"
                    fontFamily="heading" letterSpacing="-0.01em"
                  >
                    {t('notifications.title')}
                  </Text>
                  {unread > 0 && (
                    <Badge
                      bg="brand.500" color="white"
                      borderRadius="full" px={2} fontSize="9px" fontWeight="700"
                      fontFamily="heading"
                    >
                      {unread} {unread === 1 ? 'new' : 'new'}
                    </Badge>
                  )}
                </HStack>

                <HStack gap={1}>
                  {unread > 0 && (
                    <Box
                      as="button" onClick={markAllRead}
                      display="flex" alignItems="center" gap={1}
                      fontSize="11px" color="brand.600" fontWeight="600"
                      fontFamily="heading"
                      cursor="pointer" px={2} py={1} borderRadius="md"
                      _hover={{ bg: 'brand.50' }} transition="background 0.12s"
                    >
                      <Icon as={LucideCheck} w={3} h={3} />
                      {t('notifications.markAllRead')}
                    </Box>
                  )}
                  {notifications.length > 0 && (
                    <Box
                      as="button" onClick={clearAll}
                      display="flex" alignItems="center"
                      fontSize="11px" color="slate.400" fontWeight="600"
                      cursor="pointer" p={1.5} borderRadius="md"
                      _hover={{ bg: 'red.50', color: 'red.500' }} transition="all 0.12s"
                    >
                      <Icon as={LucideTrash2} w={3} h={3} />
                    </Box>
                  )}
                </HStack>
              </Flex>

              {/* List */}
              <Box maxH="380px" overflowY="auto">
                {loading ? (
                  <VStack py={5} gap={2} px={4}>
                    {[1, 2, 3].map(i => (
                      <Box key={i} h="52px" bg="slate.100" borderRadius="10px" w="full"
                        style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                  </VStack>
                ) : notifications.length === 0 ? (
                  <VStack py={10} gap={2} textAlign="center">
                    <Text fontSize="2xl">🔕</Text>
                    <Text color="slate.400" fontSize="13px" fontFamily="heading" fontWeight="500">
                      {t('notifications.empty')}
                    </Text>
                  </VStack>
                ) : (
                  <VStack gap={0} align="stretch">
                    {notifications.map((n, i) => (
                      <Box
                        key={n.id}
                        px={4} py={3}
                        bg={n.read ? 'white' : 'brand.50'}
                        borderBottom={i < notifications.length - 1 ? '1px solid' : 'none'}
                        borderColor="slate.100"
                        cursor={n.link ? 'pointer' : 'default'}
                        _hover={{ bg: n.read ? 'slate.50' : 'brand.100' }}
                        transition="background 0.12s"
                        onClick={() => handleClick(n)}
                      >
                        <HStack gap={3} align="start">
                          <Text fontSize="16px" flexShrink={0} mt={0.5}>
                            {TYPE_ICONS[n.type] ?? '🔔'}
                          </Text>
                          <Box flex={1} minW={0}>
                            <Text
                              fontSize="13px"
                              fontWeight={n.read ? '400' : '600'}
                              color="slate.900"
                              fontFamily="heading"
                              lineClamp={1}
                              letterSpacing="-0.01em"
                            >
                              {n.title}
                            </Text>
                            {n.body && (
                              <Text fontSize="12px" color="slate.500" mt={0.5} lineClamp={2}>
                                {n.body}
                              </Text>
                            )}
                            <Text fontSize="10px" color="slate.400" mt={1} fontFamily="heading">
                              {timeAgo(n.createdAt)}
                            </Text>
                          </Box>
                          {!n.read && (
                            <Box w="6px" h="6px" bg="brand.500" borderRadius="full" flexShrink={0} mt={1.5} />
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
