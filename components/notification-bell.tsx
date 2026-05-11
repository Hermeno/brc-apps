'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, VStack, HStack, Icon, Badge, Flex } from '@chakra-ui/react';
import { LucideBell, LucideX, LucideCheck, LucideTrash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'agora';
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen]             = useState(false);
  const [unread, setUnread]         = useState(0);
  const [notifications, setNotifs]  = useState<Notification[]>([]);
  const [loading, setLoading]       = useState(false);
  const [pulse, setPulse]           = useState(false);
  const panelRef                    = useRef<HTMLDivElement>(null);
  const prevUnread                  = useRef(0);

  // SSE connection for real-time unread count
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
      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 10000);
      };
    };

    connect();
    return () => { es?.close(); clearTimeout(retryTimeout); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    setUnread(0);
    prevUnread.current = 0;
  };

  const clearAll = async () => {
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifs([]);
    setUnread(0);
    prevUnread.current = 0;
  };

  const handleClick = (n: Notification) => {
    if (!n.read) {
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
      fetch(`/api/notifications`, { method: 'PATCH' }); // mark all for simplicity
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
        w="36px" h="36px"
        display="flex" alignItems="center" justifyContent="center"
        borderRadius="lg"
        color={open ? 'brand.600' : 'slate.400'}
        bg={open ? 'brand.50' : 'transparent'}
        _hover={{ bg: 'slate.100', color: 'slate.700' }}
        transition="all 0.15s"
        cursor="pointer"
        onClick={handleOpen}
      >
        <motion.div
          animate={pulse ? { rotate: [0, -20, 20, -15, 15, 0] } : {}}
          transition={{ duration: 0.5 }}>
          <Icon as={LucideBell} w={4.5} h={4.5} />
        </motion.div>

        {/* Badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{ position: 'absolute', top: 2, right: 2 }}>
              <Box
                minW="16px" h="16px" bg="red.500" borderRadius="full"
                display="flex" alignItems="center" justifyContent="center"
                border="2px solid white">
                <Text color="white" fontSize="8px" fontWeight="black" lineHeight={1}>
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
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              zIndex: 9999,
              width: '340px',
            }}>
            <Box
              bg="white" borderRadius="2xl"
              border="1px solid" borderColor="slate.200"
              boxShadow="0 8px 32px rgba(0,0,0,0.12)"
              overflow="hidden">

              {/* Header */}
              <Flex justify="space-between" align="center" px={4} py={3}
                borderBottom="1px solid" borderColor="slate.100">
                <HStack gap={2}>
                  <Text fontWeight="black" fontSize="sm" color="slate.900">Notificações</Text>
                  {unread > 0 && (
                    <Badge bg="red.500" color="white" borderRadius="full" px={2} fontSize="10px" fontWeight="bold">
                      {unread} novas
                    </Badge>
                  )}
                </HStack>
                <HStack gap={1}>
                  {unread > 0 && (
                    <Box as="button" onClick={markAllRead}
                      display="flex" alignItems="center" gap={1}
                      fontSize="xs" color="brand.500" fontWeight="semibold"
                      cursor="pointer" px={2} py={1} borderRadius="md"
                      _hover={{ bg: 'brand.50' }}>
                      <Icon as={LucideCheck} w={3} h={3} />
                      Marcar lidas
                    </Box>
                  )}
                  {notifications.length > 0 && (
                    <Box as="button" onClick={clearAll}
                      display="flex" alignItems="center"
                      fontSize="xs" color="slate.400" fontWeight="semibold"
                      cursor="pointer" p={1.5} borderRadius="md"
                      _hover={{ bg: 'red.50', color: 'red.500' }}>
                      <Icon as={LucideTrash2} w={3} h={3} />
                    </Box>
                  )}
                </HStack>
              </Flex>

              {/* List */}
              <Box maxH="400px" overflowY="auto">
                {loading ? (
                  <VStack py={6} gap={3} px={4}>
                    {[1, 2, 3].map(i => (
                      <Box key={i} h="52px" bg="slate.100" borderRadius="xl" w="full"
                        style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                  </VStack>
                ) : notifications.length === 0 ? (
                  <VStack py={10} gap={2} textAlign="center">
                    <Text fontSize="2xl">🔕</Text>
                    <Text color="slate.500" fontSize="sm">Nenhuma notificação</Text>
                  </VStack>
                ) : (
                  <VStack gap={0} align="stretch">
                    {notifications.map((n, i) => (
                      <Box key={n.id}
                        px={4} py={3}
                        bg={n.read ? 'white' : 'brand.50'}
                        borderBottom={i < notifications.length - 1 ? '1px solid' : 'none'}
                        borderColor="slate.100"
                        cursor={n.link ? 'pointer' : 'default'}
                        _hover={{ bg: n.read ? 'slate.50' : 'brand.100' }}
                        transition="background 0.1s"
                        onClick={() => handleClick(n)}>
                        <HStack gap={3} align="start">
                          <Text fontSize="lg" flexShrink={0} mt={0.5}>
                            {TYPE_ICONS[n.type] ?? '🔔'}
                          </Text>
                          <Box flex={1} minW={0}>
                            <Text fontSize="sm" fontWeight={n.read ? 'normal' : 'bold'}
                              color="slate.900" lineClamp={1}>
                              {n.title}
                            </Text>
                            {n.body && (
                              <Text fontSize="xs" color="slate.500" mt={0.5} lineClamp={2}>
                                {n.body}
                              </Text>
                            )}
                            <Text fontSize="10px" color="slate.400" mt={1}>
                              {timeAgo(n.createdAt)}
                            </Text>
                          </Box>
                          {!n.read && (
                            <Box w="7px" h="7px" bg="brand.500" borderRadius="full" flexShrink={0} mt={1.5} />
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
