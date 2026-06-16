'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Text, VStack, HStack, Button, Flex, Icon } from '@chakra-ui/react';
import {
  LucideMapPin, LucideCalendar, LucideUser, LucideCheckCircle2,
  LucideRefreshCw, LucideBriefcase, LucideBanknote,
  LucideClock, LucideMessageCircle, LucideShield, LucideAlertCircle,
  LucideChevronDown, LucideChevronUp, LucidePhone,
  LucideCreditCard, LucideCheckCircle, LucideAlertTriangle,
} from 'lucide-react';
import { EXTRAS, FREQUENCY_OPTIONS } from '@/lib/estimate';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n';

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
  lead: Lead & { clientPhone?: string | null; client: { name: string; phone?: string | null } | null };
};

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
            <Text fontSize="10.5px" fontWeight="700" color="#697386" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">
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

export default function CleanerDashboard() {
  const router = useRouter();
  const t = useT();
  const [available, setAvailable]         = useState<Lead[]>([]);
  const [accepted, setAccepted]           = useState<Lead[]>([]);
  const [verifyStatus, setVerifyStatus]   = useState<string | null>(null);
  const [conversations, setConversations] = useState<MyConversation[]>([]);
  const [responding, setResponding]       = useState<string | null>(null);
  const [loading, setLoading]             = useState(true);
  const [showHistory, setShowHistory]     = useState(false);
  const [hasCard, setHasCard]             = useState<boolean | null>(null);

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
    } catch {
      // network error — keep current state
    } finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetch('/api/cleaner/verification')
      .then(r => r.json())
      .then(d => setVerifyStatus(d.verification?.status ?? 'NONE'));
    fetch('/api/stripe/payment-methods')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setHasCard(Array.isArray(d.paymentMethods) && d.paymentMethods.length > 0))
      .catch(() => setHasCard(false));

    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('lead_paid') === '1') {
        toaster.create({
          title: t('cleaner.dashboard.paidToastTitle'),
          description: t('cleaner.dashboard.paidToastDesc'),
          type: 'success',
        });
        window.history.replaceState({}, '', window.location.pathname);
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
      if (res.ok && data.conversationId) {
        router.push(`/dashboard/chat/${data.conversationId}`);
        return;
      } else if (!res.ok) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toaster.create({ title: error.message, type: 'error' });
    }
    setResponding(null);
  };

  const activeJobs    = accepted.filter(l => l.status !== 'COMPLETED');
  const completedJobs = accepted.filter(l => l.status === 'COMPLETED');
  const pendingConversations = conversations.filter(c => c.lead.status === 'IN_REVIEW');
  const activeAcceptedConvMap = new Map(
    conversations.filter(c => c.lead.status === 'ACCEPTED').map(c => [c.lead.id, c])
  );

  return (
    <Box minH="100vh" bg="white">
      <CleanerNav />

      <Box maxW="1080px" mx="auto" px={{ base: 4, md: 6 }} py={5}>

        {/* ── Account setup checklist ── */}
        {((hasCard === false) || (verifyStatus !== null && verifyStatus !== 'APPROVED')) && (
          <Box mb={5} border="2px solid #F59E0B" bg="white" style={{ borderRadius: 8 }} overflow="hidden">
            <Box px={5} py={3} bg="#FFFBEB" borderBottom="1px solid #FDE68A">
              <HStack gap={2}>
                <Icon as={LucideAlertTriangle} w={4} h={4} color="#D97706" />
                <Text fontSize="12px" fontWeight="700" color="#92400E" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">
                  {t('cleaner.dashboard.setupTitle')}
                </Text>
              </HStack>
            </Box>

            <VStack gap={0} align="stretch">
              {/* Payment card */}
              {hasCard !== null && (
                <Flex px={5} py={4} align="center" justify="space-between" gap={3} flexWrap="wrap"
                  borderBottom="1px solid #F1F5F9">
                  <HStack gap={3}>
                    {hasCard
                      ? <Icon as={LucideCheckCircle} w={5} h={5} color="#10B981" flexShrink={0} />
                      : <Icon as={LucideCreditCard} w={5} h={5} color="#D97706" flexShrink={0} />
                    }
                    <Box>
                      <Text fontSize="13px" fontWeight="700" color={hasCard ? '#047857' : '#0F172A'} fontFamily="heading">
                        {hasCard ? t('cleaner.dashboard.cardSaved') : t('cleaner.dashboard.cardAdd')}
                      </Text>
                      <Text fontSize="11.5px" color={hasCard ? '#059669' : '#697386'} mt={0.5}>
                        {hasCard ? t('cleaner.dashboard.cardSavedDesc') : t('cleaner.dashboard.cardAddDesc')}
                      </Text>
                    </Box>
                  </HStack>
                  {!hasCard && (
                    <Button
                      size="sm" bg="#D97706" color="white" borderRadius="4px"
                      fontWeight="700" fontFamily="heading" flexShrink={0}
                      _hover={{ bg: '#B45309' }}
                      onClick={() => router.push('/dashboard/payment-methods')}
                    >
                      <Icon as={LucideCreditCard} w={3.5} h={3.5} mr={1.5} />{t('cleaner.dashboard.addCardBtn')}
                    </Button>
                  )}
                </Flex>
              )}

              {/* Identity verification */}
              <Flex px={5} py={4} align="center" justify="space-between" gap={3} flexWrap="wrap">
                <HStack gap={3}>
                  {verifyStatus === 'APPROVED'
                    ? <Icon as={LucideCheckCircle} w={5} h={5} color="#10B981" flexShrink={0} />
                    : verifyStatus === 'PENDING'
                    ? <Icon as={LucideClock} w={5} h={5} color="#3B82F6" flexShrink={0} />
                    : verifyStatus === 'REJECTED'
                    ? <Icon as={LucideAlertCircle} w={5} h={5} color="#E11D48" flexShrink={0} />
                    : <Icon as={LucideShield} w={5} h={5} color="#D97706" flexShrink={0} />
                  }
                  <Box>
                    <Text
                      fontSize="13px" fontWeight="700" fontFamily="heading"
                      color={
                        verifyStatus === 'APPROVED' ? '#047857'
                        : verifyStatus === 'PENDING' ? '#1D4ED8'
                        : verifyStatus === 'REJECTED' ? '#9F1239'
                        : '#0F172A'
                      }
                    >
                      {verifyStatus === 'APPROVED' ? t('cleaner.dashboard.identityVerified')
                       : verifyStatus === 'PENDING' ? t('cleaner.dashboard.identityReview')
                       : verifyStatus === 'REJECTED' ? t('cleaner.dashboard.identityDeclined')
                       : t('cleaner.dashboard.identityNone')}
                    </Text>
                    <Text fontSize="11.5px" color="#697386" mt={0.5}>
                      {verifyStatus === 'APPROVED' ? t('cleaner.dashboard.identityVerifiedDesc')
                       : verifyStatus === 'PENDING' ? t('cleaner.dashboard.identityReviewDesc')
                       : verifyStatus === 'REJECTED' ? t('cleaner.dashboard.identityDeclinedDesc')
                       : t('cleaner.dashboard.identityNoneDesc')}
                    </Text>
                  </Box>
                </HStack>
                {(verifyStatus === 'NONE' || verifyStatus === 'REJECTED') && (
                  <Button
                    size="sm"
                    bg={verifyStatus === 'REJECTED' ? '#E11D48' : '#D97706'}
                    color="white" borderRadius="4px"
                    fontWeight="700" fontFamily="heading" flexShrink={0}
                    _hover={{ bg: verifyStatus === 'REJECTED' ? '#BE123C' : '#B45309' }}
                    onClick={() => router.push('/dashboard/cleaner/verify')}
                  >
                    <Icon as={LucideShield} w={3.5} h={3.5} mr={1.5} />
                    {verifyStatus === 'REJECTED' ? t('cleaner.dashboard.resubmit') : t('cleaner.dashboard.verifyNow')}
                  </Button>
                )}
              </Flex>
            </VStack>
          </Box>
        )}

        {/* ── Available Leads ── */}
        <SectionPanel
          title={t('cleaner.dashboard.sectionAvailable')}
          count={available.length}
          accentColor="#F59E0B"
          extra={
            <Button
              size="xs" variant="ghost" color="#697386" borderRadius="4px" fontFamily="heading"
              _hover={{ color: '#0A80DB', bg: 'rgba(26,127,160,0.06)' }}
              onClick={() => fetchLeads()} loading={loading}
            >
              <Icon as={LucideRefreshCw} w={3} h={3} mr={1.5} />{t('cleaner.dashboard.refresh')}
            </Button>
          }
        >
          {loading ? (
            <Box px={6} py={8} textAlign="center">
              <Text fontSize="13px" color="#697386" fontFamily="heading">{t('common.loading')}</Text>
            </Box>
          ) : available.length === 0 ? (
            <Box px={6} py={10} textAlign="center">
              <Text fontSize="13px" color="#CBD5E1" fontFamily="heading" fontWeight="500">
                {t('cleaner.dashboard.noLeadsNow')}
              </Text>
              <Text fontSize="12px" color="#697386" mt={1}>
                {t('cleaner.dashboard.noLeadsHintNow')}
              </Text>
            </Box>
          ) : (
            available.map((lead, i) => {
              const freqLabel = lead.frequency && lead.frequency !== 'once'
                ? FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.label
                : null;
              return (
                <Box
                  key={lead.id} bg="white"
                  borderBottom={i < available.length - 1 ? '1px solid #F1F5F9' : 'none'}
                  position="relative"
                >
                  <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#F59E0B" />
                  <Flex px={6} pl={8} py={4} gap={6} align="flex-start" justify="space-between">
                    <Box flex={1} minW={0}>
                      <HStack gap={2.5} mb={1.5} flexWrap="wrap">
                        <Text fontSize="14px" fontWeight="700" color="#0F172A" fontFamily="heading" letterSpacing="-0.01em">
                          {t(`services.${lead.serviceType}`) || lead.serviceType}
                        </Text>
                        <Chip label={t('cleaner.dashboard.chipNew')} bg="#FEF3C7" color="#92400E" />
                        {lead.client?.name && (
                          <HStack gap={1}>
                            <Icon as={LucideUser} w="10px" h="10px" color="#697386" />
                            <Text fontSize="11.5px" color="#425466" fontFamily="heading">{lead.client.name}</Text>
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
                          {freqLabel && (
                            <Text fontSize="12px" color="#0A80DB" fontWeight="600" fontFamily="heading">↻ {freqLabel}</Text>
                          )}
                        </HStack>
                      )}

                      {lead.extras && lead.extras.length > 0 && (
                        <HStack gap={3} mb={1.5} flexWrap="wrap">
                          {lead.extras.map(exId => {
                            const ex = EXTRAS.find(e => e.id === exId);
                            return ex ? <Text key={exId} fontSize="12px" color="#425466">{ex.icon} {ex.labelEn}</Text> : null;
                          })}
                        </HStack>
                      )}

                      {lead.estimatedMinPrice && (
                        <HStack gap={4} mt={2}>
                          <HStack gap={1.5}>
                            <Icon as={LucideBanknote} w="13px" h="13px" color="#0A80DB" />
                            <Text fontSize="15px" fontWeight="800" color="#047857" fontFamily="heading" letterSpacing="-0.02em">
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
                        <Text color="#697386" fontSize="11.5px" fontStyle="italic" mt={1.5}>{lead.notes}</Text>
                      )}
                    </Box>

                    <Button
                      bg="#0A80DB" color="white" px={4} h="36px"
                      borderRadius="4px" fontWeight="600" fontSize="13px" fontFamily="heading"
                      flexShrink={0} alignSelf="center"
                      _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                      onClick={() => handleRespond(lead.id)}
                      loading={responding === lead.id} loadingText="…"
                    >
                      {t('cleaner.dashboard.accept')}
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
            title={t('cleaner.dashboard.sectionAwaiting')}
            count={pendingConversations.length}
            accentColor="#60A5FA"
          >
            {pendingConversations.map((conv, i) => (
              <Box
                key={conv.id} bg="white"
                borderBottom={i < pendingConversations.length - 1 ? '1px solid #F1F5F9' : 'none'}
                position="relative" cursor="pointer"
                onClick={() => router.push(`/dashboard/chat/${conv.id}`)}
                _hover={{ bg: '#FAFBFD' }} transition="background 0.12s"
              >
                <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#60A5FA" />
                <Flex px={6} pl={8} py={3.5} gap={6} align="center" justify="space-between">
                  <Box>
                    <HStack gap={2.5} mb={1} flexWrap="wrap">
                      <Chip label={t('cleaner.dashboard.chipWaiting')} bg="#F6F9FC" color="#0A80DB" />
                      <Text fontSize="14px" fontWeight="700" color="#0F172A" fontFamily="heading" letterSpacing="-0.01em">
                        {t(`services.${conv.lead.serviceType}`) || conv.lead.serviceType}
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
                    {t('cleaner.dashboard.openChat')}
                  </Button>
                </Flex>
              </Box>
            ))}
          </SectionPanel>
        )}

        {/* ── Accepted Jobs ── */}
        {activeJobs.length > 0 && (
          <SectionPanel
            title={t('cleaner.dashboard.sectionActive')}
            count={activeJobs.length}
            accentColor="#10B981"
          >
            {activeJobs.map((lead, i) => {
              const conv = activeAcceptedConvMap.get(lead.id);
              const feePaid = conv && (conv.feeStatus === 'charged' || conv.feeStatus === 'waived');
              const contactPhone = conv && (conv.lead.clientPhone || conv.lead.client?.phone);
              return (
                <Box
                  key={lead.id} bg="white"
                  borderBottom={i < activeJobs.length - 1 ? '1px solid #F1F5F9' : 'none'}
                  position="relative"
                >
                  <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#10B981" />
                  <Box px={6} pl={8} py={3.5}>
                    <Flex gap={6} align="flex-start">
                      <Box flex={1}>
                        <HStack gap={2.5} mb={1} flexWrap="wrap">
                          <Chip label={t('cleaner.dashboard.chipAccepted')} bg="#F0FDF4" color="#047857" />
                          <Text fontSize="14px" fontWeight="700" color="#0F172A" fontFamily="heading" letterSpacing="-0.01em">
                            {t(`services.${lead.serviceType}`) || lead.serviceType}
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
                                <Text as="span" fontWeight="600" color="#475569">{lead.client.name}</Text>
                              </Text>
                            </HStack>
                          )}
                        </HStack>
                        {lead.notes && (
                          <Text color="#697386" fontSize="11.5px" fontStyle="italic" mt={1.5}>{lead.notes}</Text>
                        )}
                      </Box>
                      {conv && (
                        <Button
                          size="sm" bg="#0A80DB" color="white" borderRadius="4px"
                          fontWeight="600" fontFamily="heading" flexShrink={0}
                          _hover={{ bg: '#0870C2' }}
                          onClick={() => router.push(`/dashboard/chat/${conv.id}`)}
                        >
                          <Icon as={LucideMessageCircle} w={3.5} h={3.5} mr={1.5} />
                          {t('cleaner.dashboard.chat')}
                        </Button>
                      )}
                    </Flex>

                    {feePaid && contactPhone ? (
                      <Box mt={3} px={4} py={3} bg="#F0FDF4" border="1px solid #BBF7D0" style={{ borderRadius: 6 }}>
                        <HStack gap={2}>
                          <Icon as={LucidePhone} w={4} h={4} color="#059669" flexShrink={0} />
                          <Text fontSize="11px" fontWeight="700" color="#047857" fontFamily="heading" textTransform="uppercase" letterSpacing="0.06em">
                            {t('cleaner.dashboard.clientContact')}
                          </Text>
                          <Text fontSize="15px" fontWeight="800" color="#065F46" fontFamily="heading" letterSpacing="-0.01em">
                            {contactPhone}
                          </Text>
                        </HStack>
                      </Box>
                    ) : conv && !feePaid ? (
                      <Box mt={3} px={4} py={3} bg="#FFFBEB" border="1px solid #FDE68A" style={{ borderRadius: 6 }}>
                        <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
                          <HStack gap={2}>
                            <Icon as={LucidePhone} w={4} h={4} color="#D97706" flexShrink={0} />
                            <Text fontSize="12px" color="#92400E" fontWeight="600" fontFamily="heading">
                              {t('cleaner.dashboard.payToUnlock')}
                            </Text>
                          </HStack>
                          <Button
                            size="xs" bg="#D97706" color="white" borderRadius="4px"
                            fontWeight="700" fontFamily="heading"
                            _hover={{ bg: '#B45309' }}
                            onClick={() => router.push(`/dashboard/chat/${conv.id}`)}
                          >
                            {t('cleaner.dashboard.payBtn', { fee: String(conv.leadFee) })}
                          </Button>
                        </Flex>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              );
            })}
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
              _hover={{ bg: '#F8FAFC' }} transition="background 0.12s"
              style={{ textAlign: 'left' }}
            >
              <Flex align="center" justify="space-between">
                <HStack gap={2.5}>
                  <Icon as={LucideBriefcase} w="12px" h="12px" color="#697386" />
                  <Text fontSize="10.5px" fontWeight="700" color="#697386" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">
                    {t('cleaner.dashboard.pastJobs')}
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
                      key={lead.id} bg="white"
                      borderBottom={i < completedJobs.length - 1 ? '1px solid #F1F5F9' : 'none'}
                      position="relative" opacity={0.7}
                    >
                      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#CBD5E1" />
                      <Flex px={6} pl={8} py={3.5} gap={6} align="flex-start">
                        <Box flex={1}>
                          <HStack gap={2.5} mb={1} flexWrap="wrap">
                            <Chip label={t('cleaner.dashboard.chipCompleted')} bg="#F1F5F9" color="#475569" />
                            <Text fontSize="14px" fontWeight="600" color="#475569" fontFamily="heading" letterSpacing="-0.01em">
                              {t(`services.${lead.serviceType}`) || lead.serviceType}
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
