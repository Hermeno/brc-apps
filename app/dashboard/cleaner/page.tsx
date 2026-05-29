'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Text, VStack, HStack, Button, Flex, Icon } from '@chakra-ui/react';
import {
  LucideMapPin, LucideCalendar, LucideUser, LucideCheckCircle2,
  LucideRefreshCw, LucideBriefcase, LucideBanknote,
  LucideClock, LucideMessageCircle, LucideShield, LucideAlertCircle,
  LucideChevronDown, LucideChevronUp,
} from 'lucide-react';
import { EXTRAS, FREQUENCY_OPTIONS } from '@/lib/estimate';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

type Lead = {
  id: string;
  serviceType: string;
  address: string;
  dateTime: string;
  status: string;
  notes?: string;
  client?: { name: string } | null;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  extras?: string[];
  frequency?: string;
  estimatedMinPrice?: number;
  estimatedMaxPrice?: number;
  estimatedHours?: number;
  leadPrice?: number;
};

type MyConversation = {
  id: string;
  status: string;
  feeStatus: string;
  leadFee: number;
  lead: Lead & { client: { name: string } | null };
};

// ─── Section panel ────────────────────────────────────────────────────────────

function SectionPanel({ title, count, accentColor, extra, children }: {
  title: string;
  count?: number;
  accentColor?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box border="1px solid #E3E8EE" mb={4} bg="white" style={{ borderRadius: 8 }} overflow="hidden">
      <Box px={5} py={3} bg="#F6F9FC" borderBottom="1px solid #E3E8EE">
        <Flex align="center" justify="space-between">
          <HStack gap={2.5}>
            <Text
              fontSize="10.5px" fontWeight="700" color="#697386"
              fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em"
            >
              {title}
            </Text>
            {!!count && count > 0 && (
              <Box
                bg={accentColor ?? '#0B1120'} color="white"
                px={2} h="16px" minW="16px"
                display="inline-flex" alignItems="center" justifyContent="center"
                fontSize="9px" fontWeight="700" fontFamily="heading"
                style={{ borderRadius: 2 }}
              >
                {count}
              </Box>
            )}
          </HStack>
          {extra}
        </Flex>
      </Box>
      {children}
    </Box>
  );
}

// ─── Chip label ───────────────────────────────────────────────────────────────

function Chip({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <Text
      fontSize="9.5px" fontWeight="700" color={color} fontFamily="heading"
      textTransform="uppercase" letterSpacing="0.08em"
      px={2} py="2px" style={{ background: bg, borderRadius: 2, display: 'inline-block' }}
    >
      {label}
    </Text>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CleanerDashboard() {
  const router = useRouter();
  const [available, setAvailable]         = useState<Lead[]>([]);
  const [accepted, setAccepted]           = useState<Lead[]>([]);
  const [verifyStatus, setVerifyStatus]   = useState<string | null>(null);
  const [conversations, setConversations] = useState<MyConversation[]>([]);
  const [responding, setResponding]       = useState<string | null>(null);
  const [loading, setLoading]             = useState(true);
  const [showHistory, setShowHistory]     = useState(false);

  const fetchLeads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/leads/available');
      if (res.ok) {
        const data = await res.json();
        setAvailable(data.available);
        setAccepted(data.accepted);
        setConversations(data.conversations ?? []);
      }
    } finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetch('/api/cleaner/verification')
      .then(r => r.json())
      .then(d => setVerifyStatus(d.verification?.status ?? 'NONE'));

    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('lead_paid') === '1') {
        toaster.create({
          title: 'Payment confirmed!',
          description: 'Lead unlocked. You can now message this client below.',
          type: 'success',
        });
        window.history.replaceState({}, '', window.location.pathname);
        // Poll silently until the Stripe webhook creates the conversation (up to ~10 s)
        let tries = 0;
        const poll = setInterval(() => {
          tries++;
          fetchLeads(true);
          if (tries >= 5) clearInterval(poll);
        }, 2000);
      }
    }
  }, [fetchLeads]);

  const handleRespond = async (leadId: string) => {
    setResponding(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/respond`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        if (data.alreadyResponded) {
          router.push(`/dashboard/chat/${data.conversationId}`);
        } else if (data.checkoutUrl) {
          // Thumbtack model: pay first, then get access
          window.location.href = data.checkoutUrl;
          return; // keep button in loading state while navigating
        }
      } else throw new Error(data.error);
    } catch (error: any) {
      toaster.create({ title: error.message, type: 'error' });
    }
    setResponding(null);
  };

  const activeJobs    = accepted.filter(l => l.status !== 'COMPLETED');
  const completedJobs = accepted.filter(l => l.status === 'COMPLETED');
  // Conversations waiting for client response (lead IN_REVIEW)
  const pendingConversations = conversations.filter(c => c.lead.status === 'IN_REVIEW');
  // Conversations for accepted leads (client already accepted — show chat in Accepted Jobs)
  const activeAcceptedConvMap = new Map(
    conversations.filter(c => c.lead.status === 'ACCEPTED').map(c => [c.lead.id, c.id])
  );

  return (
    <Box minH="100vh" bg="white">
      <CleanerNav />

      <Box maxW="1080px" mx="auto" px={{ base: 4, md: 6 }} py={5}>

        {/* ── Verification banners ── */}
        {verifyStatus === 'NONE' && (
          <Box mb={4} bg="#F6F9FC" border="1px solid #FDE68A" p={4}>
            <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
              <HStack gap={3}>
                <Icon as={LucideAlertCircle} w={4} h={4} color="#0A80DB" flexShrink={0} />
                <Box>
                  <Text fontWeight="700" color="#92400E" fontSize="13px" fontFamily="heading">
                    Get verified and stand out to clients
                  </Text>
                  <Text fontSize="11.5px" color="#0870C2" mt={0.5}>
                    Verified cleaners appear higher in results and earn a trusted badge.
                  </Text>
                </Box>
              </HStack>
              <Button
                size="sm" bg="#0A80DB" color="white" borderRadius="4px"
                fontWeight="600" fontFamily="heading"
                _hover={{ bg: '#0870C2' }}
                onClick={() => router.push('/dashboard/cleaner/verify')}
              >
                <Icon as={LucideShield} w={3.5} h={3.5} mr={1.5} />Get verified
              </Button>
            </Flex>
          </Box>
        )}
        {verifyStatus === 'PENDING' && (
          <Box mb={4} bg="#F6F9FC" border="1px solid #E3E8EE" p={4}>
            <HStack gap={3}>
              <Icon as={LucideClock} w={4} h={4} color="#3B82F6" flexShrink={0} />
              <Text fontSize="13px" color="#0A80DB" fontWeight="600" fontFamily="heading">
                Your verification is being reviewed — we'll get back to you within 48 hours.
              </Text>
            </HStack>
          </Box>
        )}
        {verifyStatus === 'APPROVED' && (
          <Box mb={4} bg="#F0FDF4" border="1px solid #BBF7D0" p={4}>
            <HStack gap={3}>
              <Icon as={LucideCheckCircle2} w={4} h={4} color="#0A80DB" flexShrink={0} />
              <Text fontSize="13px" color="#0A80DB" fontWeight="600" fontFamily="heading">
                Account verified
              </Text>
            </HStack>
          </Box>
        )}
        {verifyStatus === 'REJECTED' && (
          <Box mb={4} bg="#FFF1F2" border="1px solid #FECDD3" p={4}>
            <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
              <HStack gap={3}>
                <Icon as={LucideAlertCircle} w={4} h={4} color="#E11D48" flexShrink={0} />
                <Text fontSize="13px" color="#9F1239" fontWeight="600" fontFamily="heading">
                  Verification declined — please review your documents and try again.
                </Text>
              </HStack>
              <Button
                size="sm" bg="#E11D48" color="white" borderRadius="4px"
                fontWeight="600" fontFamily="heading"
                _hover={{ bg: '#BE123C' }}
                onClick={() => router.push('/dashboard/cleaner/verify')}
              >
                Resubmit for review
              </Button>
            </Flex>
          </Box>
        )}

        {/* ── Available Leads ── */}
        <SectionPanel
          title="Available Leads"
          count={available.length}
          accentColor="#F59E0B"
          extra={
            <Button
              size="xs" variant="ghost" color="#697386" borderRadius="4px" fontFamily="heading"
              _hover={{ color: '#0A80DB', bg: 'rgba(26,127,160,0.06)' }}
              onClick={() => fetchLeads()} loading={loading}
            >
              <Icon as={LucideRefreshCw} w={3} h={3} mr={1.5} />Refresh
            </Button>
          }
        >
          {loading ? (
            <Box px={6} py={8} textAlign="center">
              <Text fontSize="13px" color="#697386" fontFamily="heading">Loading…</Text>
            </Box>
          ) : available.length === 0 ? (
            <Box px={6} py={10} textAlign="center">
              <Text fontSize="13px" color="#CBD5E1" fontFamily="heading" fontWeight="500">
                No new leads right now
              </Text>
              <Text fontSize="12px" color="#697386" mt={1}>
                We'll notify you as soon as a client in your area posts a request.
              </Text>
            </Box>
          ) : (
            available.map((lead, i) => {
              const freqLabel = lead.frequency && lead.frequency !== 'once'
                ? FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.label
                : null;
              return (
                <Box
                  key={lead.id}
                  bg="white"
                  borderBottom={i < available.length - 1 ? '1px solid #F1F5F9' : 'none'}
                  position="relative"
                >
                  <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#F59E0B" />
                  <Flex px={6} pl={8} py={4} gap={6} align="flex-start" justify="space-between">
                    <Box flex={1} minW={0}>
                      <HStack gap={2.5} mb={1.5} flexWrap="wrap">
                        <Text
                          fontSize="14px" fontWeight="700" color="#0F172A"
                          fontFamily="heading" letterSpacing="-0.01em"
                        >
                          {lead.serviceType}
                        </Text>
                        <Chip label="NEW" bg="#FEF3C7" color="#92400E" />
                        {lead.client?.name && (
                          <HStack gap={1}>
                            <Icon as={LucideUser} w="10px" h="10px" color="#697386" />
                            <Text fontSize="11.5px" color="#425466" fontFamily="heading">
                              {lead.client.name}
                            </Text>
                          </HStack>
                        )}
                      </HStack>

                      <HStack gap={4} mb={1.5} flexWrap="wrap">
                        <HStack gap={1}>
                          <Icon as={LucideMapPin} w="11px" h="11px" color="#697386" />
                          <Text fontSize="12px" color="#425466">{lead.address}</Text>
                        </HStack>
                        <HStack gap={1}>
                          <Icon as={LucideCalendar} w="11px" h="11px" color="#697386" />
                          <Text fontSize="12px" color="#425466">
                            {new Date(lead.dateTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                          </Text>
                        </HStack>
                      </HStack>

                      {(lead.bedrooms || lead.squareMeters || freqLabel) && (
                        <HStack gap={4} mb={1.5} flexWrap="wrap">
                          {lead.bedrooms   && <Text fontSize="12px" color="#475569">🛏 {lead.bedrooms}bd</Text>}
                          {lead.bathrooms  && <Text fontSize="12px" color="#475569">🚿 {lead.bathrooms}ba</Text>}
                          {(lead.squareMeters ?? 0) > 0 && <Text fontSize="12px" color="#475569">📐 {lead.squareMeters}m²</Text>}
                          {freqLabel       && (
                            <Text fontSize="12px" color="#0A80DB" fontWeight="600" fontFamily="heading">↻ {freqLabel}</Text>
                          )}
                        </HStack>
                      )}

                      {lead.extras && lead.extras.length > 0 && (
                        <HStack gap={3} mb={1.5} flexWrap="wrap">
                          {lead.extras.map(exId => {
                            const ex = EXTRAS.find(e => e.id === exId);
                            return ex
                              ? <Text key={exId} fontSize="12px" color="#425466">{ex.icon} {ex.labelEn}</Text>
                              : null;
                          })}
                        </HStack>
                      )}

                      {lead.estimatedMinPrice && (
                        <HStack gap={4} mt={2}>
                          <HStack gap={1.5}>
                            <Icon as={LucideBanknote} w="13px" h="13px" color="#0A80DB" />
                            <Text
                              fontSize="15px" fontWeight="800" color="#047857"
                              fontFamily="heading" letterSpacing="-0.02em"
                            >
                              ${lead.estimatedMinPrice}–${lead.estimatedMaxPrice}
                            </Text>
                          </HStack>
                          {lead.estimatedHours && (
                            <HStack gap={1}>
                              <Icon as={LucideClock} w="11px" h="11px" color="#0A80DB" />
                              <Text fontSize="13px" fontWeight="600" color="#0A80DB" fontFamily="heading">
                                ~{lead.estimatedHours}h
                              </Text>
                            </HStack>
                          )}
                        </HStack>
                      )}

                      {lead.notes && (
                        <Text color="#697386" fontSize="11.5px" fontStyle="italic" mt={1.5}>
                          {lead.notes}
                        </Text>
                      )}
                    </Box>

                    <Button
                      bg="#0A80DB" color="white" px={4} h="36px"
                      borderRadius="4px" fontWeight="600" fontSize="13px" fontFamily="heading"
                      flexShrink={0} alignSelf="center"
                      _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                      onClick={() => handleRespond(lead.id)}
                      loading={responding === lead.id}
                      loadingText="…"
                    >
                      <Icon as={LucideBanknote} w={3.5} h={3.5} mr={1.5} />
                      Accept &amp; Pay{lead.leadPrice ? ` $${lead.leadPrice}` : ''}
                    </Button>
                  </Flex>
                </Box>
              );
            })
          )}
        </SectionPanel>

        {/* ── Awaiting Client Response ── */}
        {pendingConversations.length > 0 && (
          <SectionPanel
            title="Awaiting Client Response"
            count={pendingConversations.length}
            accentColor="#60A5FA"
          >
            {pendingConversations.map((conv, i) => (
              <Box
                key={conv.id}
                bg="white"
                borderBottom={i < pendingConversations.length - 1 ? '1px solid #F1F5F9' : 'none'}
                position="relative"
                cursor="pointer"
                onClick={() => router.push(`/dashboard/chat/${conv.id}`)}
                _hover={{ bg: '#FAFBFD' }}
                transition="background 0.12s"
              >
                <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#60A5FA" />
                <Flex px={6} pl={8} py={3.5} gap={6} align="center" justify="space-between">
                  <Box>
                    <HStack gap={2.5} mb={1} flexWrap="wrap">
                      <Chip label="Waiting for client" bg="#F6F9FC" color="#0A80DB" />
                      <Text fontSize="14px" fontWeight="700" color="#0F172A" fontFamily="heading" letterSpacing="-0.01em">
                        {conv.lead.serviceType}
                      </Text>
                    </HStack>
                    <HStack gap={4} flexWrap="wrap">
                      <HStack gap={1}>
                        <Icon as={LucideMapPin} w="11px" h="11px" color="#697386" />
                        <Text fontSize="12px" color="#425466">{conv.lead.address}</Text>
                      </HStack>
                      <HStack gap={1}>
                        <Icon as={LucideCalendar} w="11px" h="11px" color="#697386" />
                        <Text fontSize="12px" color="#425466">
                          {new Date(conv.lead.dateTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                        </Text>
                      </HStack>
                      {conv.lead.client && (
                        <HStack gap={1}>
                          <Icon as={LucideUser} w="11px" h="11px" color="#697386" />
                          <Text fontSize="12px" color="#425466">{conv.lead.client.name}</Text>
                        </HStack>
                      )}
                    </HStack>
                  </Box>
                  <Button
                    size="sm" bg="#0A80DB" color="white" borderRadius="4px"
                    fontWeight="600" fontFamily="heading" flexShrink={0}
                    _hover={{ bg: '#0870C2' }}
                    onClick={e => { e.stopPropagation(); router.push(`/dashboard/chat/${conv.id}`); }}
                  >
                    <Icon as={LucideMessageCircle} w={3.5} h={3.5} mr={1.5} />
                    Open chat
                  </Button>
                </Flex>
              </Box>
            ))}
          </SectionPanel>
        )}

        {/* ── Accepted Jobs ── */}
        {activeJobs.length > 0 && (
          <SectionPanel
            title="Accepted Jobs"
            count={activeJobs.length}
            accentColor="#10B981"
          >
            {activeJobs.map((lead, i) => (
              <Box
                key={lead.id}
                bg="white"
                borderBottom={i < activeJobs.length - 1 ? '1px solid #F1F5F9' : 'none'}
                position="relative"
              >
                <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#10B981" />
                <Flex px={6} pl={8} py={3.5} gap={6} align="flex-start">
                  <Box flex={1}>
                    <HStack gap={2.5} mb={1} flexWrap="wrap">
                      <Chip label="Accepted" bg="#F0FDF4" color="#047857" />
                      <Text fontSize="14px" fontWeight="700" color="#0F172A" fontFamily="heading" letterSpacing="-0.01em">
                        {lead.serviceType}
                      </Text>
                    </HStack>
                    <HStack gap={4} flexWrap="wrap">
                      <HStack gap={1}>
                        <Icon as={LucideMapPin} w="11px" h="11px" color="#697386" />
                        <Text fontSize="12px" color="#425466">{lead.address}</Text>
                      </HStack>
                      <HStack gap={1}>
                        <Icon as={LucideCalendar} w="11px" h="11px" color="#697386" />
                        <Text fontSize="12px" color="#425466">
                          {new Date(lead.dateTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                        </Text>
                      </HStack>
                      {lead.client && (
                        <HStack gap={1}>
                          <Icon as={LucideUser} w="11px" h="11px" color="#697386" />
                          <Text fontSize="12px" color="#425466">
                            Booked by:{' '}
                            <Text as="span" fontWeight="600" color="#475569">{lead.client.name}</Text>
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                    {lead.notes && (
                      <Text color="#697386" fontSize="11.5px" fontStyle="italic" mt={1.5}>{lead.notes}</Text>
                    )}
                  </Box>
                  {(() => {
                    const convId = activeAcceptedConvMap.get(lead.id);
                    return convId ? (
                      <Button
                        size="sm" bg="#0A80DB" color="white" borderRadius="4px"
                        fontWeight="600" fontFamily="heading" flexShrink={0}
                        _hover={{ bg: '#0870C2' }}
                        onClick={() => router.push(`/dashboard/chat/${convId}`)}
                      >
                        <Icon as={LucideMessageCircle} w={3.5} h={3.5} mr={1.5} />
                        Chat
                      </Button>
                    ) : null;
                  })()}
                </Flex>
              </Box>
            ))}
          </SectionPanel>
        )}

        {/* ── Completed Jobs History ── */}
        {completedJobs.length > 0 && (
          <Box border="1px solid #E3E8EE" mb={4} style={{ borderRadius: 8 }} overflow="hidden">
            <Box
              as="button" w="full" bg="white" px={5} py={3}
              borderBottom={showHistory ? '1px solid #E3E8EE' : 'none'}
              cursor="pointer"
              onClick={() => setShowHistory(h => !h)}
              _hover={{ bg: '#F8FAFC' }}
              transition="background 0.12s"
              style={{ textAlign: 'left' }}
            >
              <Flex align="center" justify="space-between">
                <HStack gap={2.5}>
                  <Icon as={LucideBriefcase} w="12px" h="12px" color="#697386" />
                  <Text
                    fontSize="10.5px" fontWeight="700" color="#697386"
                    fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em"
                  >
                    Past jobs
                  </Text>
                  <Box
                    bg="#475569" color="white" px={2} h="16px" minW="16px"
                    display="inline-flex" alignItems="center" justifyContent="center"
                    fontSize="9px" fontWeight="700" fontFamily="heading"
                    style={{ borderRadius: 2 }}
                  >
                    {completedJobs.length}
                  </Box>
                </HStack>
                <Icon as={showHistory ? LucideChevronUp : LucideChevronDown} w="13px" h="13px" color="#697386" />
              </Flex>
            </Box>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  {completedJobs.map((lead, i) => (
                    <Box
                      key={lead.id}
                      bg="white"
                      borderBottom={i < completedJobs.length - 1 ? '1px solid #F1F5F9' : 'none'}
                      position="relative"
                      opacity={0.7}
                    >
                      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#CBD5E1" />
                      <Flex px={6} pl={8} py={3.5} gap={6} align="flex-start">
                        <Box flex={1}>
                          <HStack gap={2.5} mb={1} flexWrap="wrap">
                            <Chip label="Completed" bg="#F1F5F9" color="#475569" />
                            <Text fontSize="14px" fontWeight="600" color="#475569" fontFamily="heading" letterSpacing="-0.01em">
                              {lead.serviceType}
                            </Text>
                          </HStack>
                          <HStack gap={4} flexWrap="wrap">
                            <HStack gap={1}>
                              <Icon as={LucideMapPin} w="11px" h="11px" color="#CBD5E1" />
                              <Text fontSize="12px" color="#697386">{lead.address}</Text>
                            </HStack>
                            <HStack gap={1}>
                              <Icon as={LucideCalendar} w="11px" h="11px" color="#CBD5E1" />
                              <Text fontSize="12px" color="#697386">
                                {new Date(lead.dateTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                              </Text>
                            </HStack>
                            {lead.client && (
                              <HStack gap={1}>
                                <Icon as={LucideUser} w="11px" h="11px" color="#CBD5E1" />
                                <Text fontSize="12px" color="#697386">{lead.client.name}</Text>
                              </HStack>
                            )}
                          </HStack>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        )}

      </Box>
    </Box>
  );
}
