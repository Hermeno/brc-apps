'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Heading, Text, VStack, HStack, Button, Input,
  Badge, Flex, Container, Icon, SimpleGrid, Textarea,
} from '@chakra-ui/react';
import {
  LucidePlus, LucideX, LucideMapPin, LucideCalendar, LucideUser,
  LucideLogOut, LucideMinus, LucideClock, LucideBanknote,
  LucideSparkles, LucideTag, LucideMessageCircle, LucideZap,
  LucidePencil, LucideTrash2, LucideCheckCircle, LucideStar,
  LucideThumbsDown, LucideChevronDown, LucideChevronUp, LucideExternalLink,
  LucideSettings, LucideRotateCcw, LucideShieldCheck,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import { motion, AnimatePresence } from 'motion/react';
import {
  SERVICE_TYPES, FREQUENCY_OPTIONS, EXTRAS, calculateEstimate,
} from '@/lib/estimate';
import NotificationBell from '@/components/notification-bell';

/* ─── types ──────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  NEW:       { label: 'Pending',                bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  WAVE1:     { label: 'Searching…',             bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  WAVE2:     { label: 'Searching…',             bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  WAVE3:     { label: 'Searching…',             bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  IN_REVIEW: { label: 'Pros responded',         bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  ACCEPTED:  { label: 'Confirmed ✓',            bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  COMPLETED: { label: 'Completed ✓',            bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
  CANCELLED: { label: 'Cancelled',              bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  UNMATCHED: { label: 'No match found',         bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
};

type ConvEntry = { id: string; cleanerId: string; status: string; cleaner: { id: string; name: string; avatarUrl?: string | null; isVerified?: boolean } };
type Lead = {
  id: string; serviceType: string; address: string; dateTime: string;
  status: string; notes?: string; createdAt: string;
  cleanerId?: string | null;
  bedrooms?: number; bathrooms?: number; squareMeters?: number;
  extras?: string[]; frequency?: string; photos?: string[];
  estimatedMinPrice?: number; estimatedMaxPrice?: number; estimatedHours?: number;
  isInstantBook?: boolean;
  cleaner?: { name: string; email: string } | null;
  conversations?: ConvEntry[];
  review?: { rating: number; comment?: string } | null;
};
type ClientProfile = { name: string | null; email: string; phone: string | null; avatarUrl: string | null; createdAt: string };

const emptyForm = {
  serviceType: 'standard', bedrooms: 1, bathrooms: 1, squareMeters: 0,
  extras: [] as string[], frequency: 'once',
  address: '', date: '', time: '', notes: '',
};

/* ─── Stepper ─────────────────────────────────────────────────── */
function Stepper({ value, onChange, min = 1, max = 10 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <HStack gap={0} border="1px solid" borderColor="slate.200" borderRadius="xl" overflow="hidden" w="fit-content">
      <Button size="sm" variant="ghost" px={3} h="10" borderRadius="none"
        onClick={() => onChange(Math.max(min, value - 1))} _hover={{ bg: 'slate.100' }} disabled={value <= min}>
        <Icon as={LucideMinus} w={3} h={3} />
      </Button>
      <Box px={4} py={2} minW="10" textAlign="center" fontSize="sm" fontWeight="bold" color="slate.800">{value}</Box>
      <Button size="sm" variant="ghost" px={3} h="10" borderRadius="none"
        onClick={() => onChange(Math.min(max, value + 1))} _hover={{ bg: 'slate.100' }} disabled={value >= max}>
        <Icon as={LucidePlus} w={3} h={3} />
      </Button>
    </HStack>
  );
}

/* ─── Star Rating ─────────────────────────────────────────────── */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <HStack gap={1}>
      {[1, 2, 3, 4, 5].map(s => (
        <motion.button key={s} type="button" whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.15 }}
          onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
          <Icon as={LucideStar} w={8} h={8}
            color={(hover || value) >= s ? '#F59E0B' : '#E5E7EB'}
            fill={(hover || value) >= s ? '#F59E0B' : 'none'}
            transition="all 0.15s" style={{ cursor: 'pointer' }} />
        </motion.button>
      ))}
    </HStack>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function ClientPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [profile, setProfile]       = useState<ClientProfile | null>(null);
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState(emptyForm);

  // Edit state
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editForm, setEditForm]     = useState(emptyForm);

  // Actions in flight
  const [cancelling, setCancelling]   = useState<string | null>(null);
  const [completing, setCompleting]   = useState<string | null>(null);
  const [declining, setDeclining]     = useState<string | null>(null);
  const [accepting, setAccepting]     = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);

  // Rating modal
  const [ratingLead, setRatingLead]       = useState<Lead | null>(null);
  const [starValue, setStarValue]         = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [sendingRating, setSendingRating] = useState(false);

  // Confirm dialogs
  const [confirmCancel, setConfirmCancel]     = useState<string | null>(null);
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);

  // History toggle
  const [showHistory, setShowHistory] = useState(false);

  // Reactivation
  const [reactivateId, setReactivateId]     = useState<string | null>(null);
  const [reactivateDate, setReactivateDate] = useState('');
  const [reactivateTime, setReactivateTime] = useState('');
  const [reactivating, setReactivating]     = useState(false);

  const fetchLeads = useCallback(async () => {
    const res = await fetch('/api/leads');
    if (res.ok) setLeads((await res.json()).leads);
  }, []);

  useEffect(() => {
    fetchLeads();
    fetch('/api/client/profile')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user) setProfile(d.user); })
      .catch(() => {});
  }, [fetchLeads]);

  useEffect(() => {
    const id = setInterval(fetchLeads, 20000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm(f => ({ ...f, [key]: value }));
  const setEditField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setEditForm(f => ({ ...f, [key]: value }));

  const toggleExtra = (id: string) =>
    setForm(f => ({ ...f, extras: f.extras.includes(id) ? f.extras.filter(e => e !== id) : [...f.extras, id] }));
  const toggleEditExtra = (id: string) =>
    setEditForm(f => ({ ...f, extras: f.extras.includes(id) ? f.extras.filter(e => e !== id) : [...f.extras, id] }));

  /* ── progress ─── */
  const progress = useMemo(() => {
    const fields = [!!form.address.trim(), !!form.date, !!form.time, form.bedrooms > 0, form.bathrooms > 0, form.squareMeters > 0];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form.address, form.date, form.time, form.bedrooms, form.bathrooms, form.squareMeters]);

  /* ── estimate ─── */
  const estimate = useMemo(() => {
    if (form.squareMeters <= 0) return null;
    return calculateEstimate({ serviceType: form.serviceType, bedrooms: form.bedrooms, bathrooms: form.bathrooms, squareMeters: form.squareMeters, extras: form.extras, frequency: form.frequency });
  }, [form.serviceType, form.bedrooms, form.bathrooms, form.squareMeters, form.extras, form.frequency]);

  /* ── submit new ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address || !form.date || !form.time) { toaster.create({ title: 'Please fill in address, date and time', type: 'error' }); return; }
    setSubmitting(true);
    try {
      const dateTime = new Date(`${form.date}T${form.time}`).toISOString();
      const serviceLabel = SERVICE_TYPES.find(s => s.id === form.serviceType)?.labelEn ?? form.serviceType;
      const res = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: serviceLabel, address: form.address, notes: form.notes, dateTime,
          bedrooms: form.bedrooms, bathrooms: form.bathrooms, squareMeters: form.squareMeters,
          extras: form.extras, frequency: form.frequency,
          estimatedMinPrice: estimate?.minPrice, estimatedMaxPrice: estimate?.maxPrice, estimatedHours: estimate?.hours }),
      });
      if (res.ok) {
        toaster.create({ title: 'Booking submitted!', description: 'Searching for professionals…', type: 'success' });
        setShowForm(false); setForm(emptyForm); fetchLeads();
      } else { const err = await res.json(); throw new Error(err.error); }
    } catch (error: any) {
      toaster.create({ title: 'Error', description: error.message, type: 'error' });
    } finally { setSubmitting(false); }
  };

  /* ── edit ── */
  const openEdit = (lead: Lead) => {
    const sId = SERVICE_TYPES.find(s => s.label === lead.serviceType || s.labelEn === lead.serviceType)?.id ?? 'standard';
    const dt = new Date(lead.dateTime);
    setEditForm({
      serviceType: sId,
      bedrooms: lead.bedrooms ?? 1, bathrooms: lead.bathrooms ?? 1, squareMeters: lead.squareMeters ?? 0,
      extras: lead.extras ?? [], frequency: lead.frequency ?? 'once',
      address: lead.address,
      date: dt.toISOString().split('T')[0],
      time: dt.toTimeString().slice(0, 5),
      notes: lead.notes ?? '',
    });
    setEditingId(lead.id);
  };

  const handleSaveEdit = async (leadId: string) => {
    if (!editForm.address || !editForm.date || !editForm.time) { toaster.create({ title: 'Please fill in address, date and time', type: 'error' }); return; }
    setSaving(true);
    try {
      const dateTime = new Date(`${editForm.date}T${editForm.time}`).toISOString();
      const serviceLabel = SERVICE_TYPES.find(s => s.id === editForm.serviceType)?.labelEn ?? editForm.serviceType;
      const est = editForm.squareMeters > 0 ? calculateEstimate({ serviceType: editForm.serviceType, bedrooms: editForm.bedrooms, bathrooms: editForm.bathrooms, squareMeters: editForm.squareMeters, extras: editForm.extras, frequency: editForm.frequency }) : null;
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: serviceLabel, address: editForm.address, dateTime, notes: editForm.notes,
          bedrooms: editForm.bedrooms, bathrooms: editForm.bathrooms, squareMeters: editForm.squareMeters,
          extras: editForm.extras, frequency: editForm.frequency,
          estimatedMinPrice: est?.minPrice, estimatedMaxPrice: est?.maxPrice, estimatedHours: est?.hours }),
      });
      if (res.ok) { toaster.create({ title: 'Booking updated!', type: 'success' }); setEditingId(null); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setSaving(false); }
  };

  /* ── cancel ── */
  const handleCancel = async (leadId: string) => {
    setCancelling(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/cancel`, { method: 'POST' });
      if (res.ok) { toaster.create({ title: 'Booking cancelled', type: 'success' }); setConfirmCancel(null); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setCancelling(null); }
  };

  /* ── complete ── */
  const handleComplete = async (leadId: string) => {
    setCompleting(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/complete`, { method: 'POST' });
      if (res.ok) { toaster.create({ title: 'Job completed! 🎉', description: 'How about rating the professional?', type: 'success' }); setConfirmComplete(null); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setCompleting(null); }
  };

  /* ── decline ── */
  const handleDecline = async (convId: string) => {
    setDeclining(convId);
    try {
      const res = await fetch(`/api/conversations/${convId}/decline`, { method: 'POST' });
      if (res.ok) { toaster.create({ title: 'Professional declined', type: 'success' }); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setDeclining(null); }
  };

  /* ── accept cleaner ── */
  const handleAccept = async (convId: string) => {
    setAccepting(convId);
    try {
      const res = await fetch(`/api/conversations/${convId}/confirm`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toaster.create({ title: 'Professional accepted!', description: 'Opening chat…', type: 'success' });
        fetchLeads();
        router.push(`/dashboard/chat/${convId}`);
      } else { throw new Error(data.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setAccepting(null); }
  };

  /* ── reactivate ── */
  const handleReactivate = async (leadId: string) => {
    if (!reactivateDate || !reactivateTime) {
      toaster.create({ title: 'Please select a new date and time', type: 'error' }); return;
    }
    const dateTime = new Date(`${reactivateDate}T${reactivateTime}`);
    if (dateTime <= new Date()) {
      toaster.create({ title: 'Please choose a future date and time', type: 'error' }); return;
    }
    setReactivating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/reactivate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTime: dateTime.toISOString() }),
      });
      if (res.ok) {
        toaster.create({ title: 'Booking reactivated!', description: 'Searching for professionals…', type: 'success' });
        setReactivateId(null); fetchLeads();
      } else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setReactivating(false); }
  };

  /* ── review ── */
  const handleSubmitRating = async () => {
    if (!ratingLead || starValue === 0) { toaster.create({ title: 'Please select a rating from 1 to 5', type: 'error' }); return; }
    setSendingRating(true);
    try {
      const res = await fetch(`/api/leads/${ratingLead.id}/review`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: starValue, comment: ratingComment }),
      });
      if (res.ok) { toaster.create({ title: 'Rating submitted! ⭐', type: 'success' }); setRatingLead(null); setStarValue(0); setRatingComment(''); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setSendingRating(false); }
  };

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';

  return (
    <Box minH="100vh" bg="slate.50">

      {/* ── Header ── */}
      <Box bg="white" borderBottom="1px solid" borderColor="slate.100" px={6} py={4}
        position="sticky" top={0} zIndex={50}>
        <Flex justify="space-between" align="center" maxW="900px" mx="auto">
          <HStack gap={3}>
            <Box w="34px" h="34px" bgGradient="to-br" gradientFrom="brand.500" gradientTo="brand.700"
              borderRadius="lg" display="flex" alignItems="center" justifyContent="center"
              boxShadow="0 3px 10px rgba(37,99,235,0.3)">
              <Text color="white" fontWeight="black" fontSize="xs">BC</Text>
            </Box>
            <Text fontWeight="black" fontSize="md" letterSpacing="tight" color="slate.900">
              Brazilian<Text as="span" color="brand.500">Clean</Text>
            </Text>
          </HStack>
          <HStack gap={3}>
            <Text fontSize="sm" color="slate.500">
              Hello, <Text as="span" fontWeight="semibold" color="slate.800">{firstName}</Text>
            </Text>
            <NotificationBell />
            <Button size="sm" variant="ghost" color="slate.400" _hover={{ color: 'red.500', bg: 'red.50' }}
              onClick={() => signOut({ callbackUrl: '/auth/login' })} title="Sign out">
              <Icon as={LucideLogOut} w={4} h={4} />
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Container maxW="900px" py={8} px={6}>
        <VStack gap={6} align="stretch">

          {/* ── Profile Card ── */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl"
              boxShadow="0 2px 16px rgba(37,99,235,0.06)">
              <Box px={5} py={4}>
                <Flex justify="space-between" align="center" mb={3}>
                  <Box w="52px" h="52px" borderRadius="full" overflow="hidden"
                    border="3px solid" borderColor="brand.100"
                    bg={profile?.avatarUrl ? 'white' : 'brand.500'}
                    display="flex" alignItems="center" justifyContent="center"
                    boxShadow="0 4px 12px rgba(0,0,0,0.12)" flexShrink={0}>
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Text color="white" fontWeight="black" fontSize="xl">
                        {(profile?.name ?? session?.user?.name ?? 'C')[0].toUpperCase()}
                      </Text>
                    )}
                  </Box>
                  <Button size="sm" variant="outline" borderColor="slate.200" color="slate.500"
                    borderRadius="xl" fontWeight="semibold" fontSize="xs"
                    _hover={{ bg: 'brand.50', borderColor: 'brand.300', color: 'brand.600' }}
                    transition="all 0.15s"
                    onClick={() => router.push('/dashboard/client/profile')}>
                    <Icon as={LucideSettings} w={3.5} h={3.5} mr={1.5} />
                    Edit profile
                  </Button>
                </Flex>

                <HStack gap={4} flexWrap="wrap" align="start">
                  <Box flex={1} minW={0}>
                    <Text fontWeight="black" fontSize="md" color="slate.900" lineClamp={1}>
                      {profile?.name ?? session?.user?.name ?? 'Customer'}
                    </Text>
                    <Text fontSize="xs" color="slate.400" mt={0.5}>{profile?.email ?? session?.user?.email}</Text>
                    {profile?.phone && (
                      <Text fontSize="xs" color="slate.500" mt={0.5}>📱 {profile.phone}</Text>
                    )}
                  </Box>
                  <HStack gap={4} flexShrink={0}>
                    <Box textAlign="center">
                      <Text fontWeight="black" fontSize="lg" color="brand.600">{leads.length}</Text>
                      <Text fontSize="10px" color="slate.400" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">bookings</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontWeight="black" fontSize="lg" color="green.600">
                        {leads.filter(l => l.status === 'COMPLETED').length}
                      </Text>
                      <Text fontSize="10px" color="slate.400" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">completed</Text>
                    </Box>
                  </HStack>
                </HStack>
              </Box>
            </Box>
          </motion.div>

          {/* ── Title Row ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="lg" fontWeight="black" color="slate.900">My Bookings</Heading>
                <Text color="slate.500" fontSize="sm" mt={1}>
                  {leads.filter(l => !['COMPLETED', 'CANCELLED'].includes(l.status)).length} active booking(s)
                </Text>
              </Box>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  bg={showForm ? 'slate.100' : 'brand.500'} color={showForm ? 'slate.700' : 'white'}
                  borderRadius="xl" fontWeight="bold" fontSize="sm" px={5}
                  _hover={{ bg: showForm ? 'slate.200' : 'brand.600', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  onClick={() => { setShowForm(v => !v); if (showForm) setForm(emptyForm); }}>
                  <Icon as={showForm ? LucideX : LucidePlus} w={4} h={4} mr={2} />
                  {showForm ? 'Cancel' : 'New Booking'}
                </Button>
              </motion.div>
            </Flex>
          </motion.div>

          {/* ── New Order Form ── */}
          <AnimatePresence>
            {showForm && (
              <motion.div key="new-form"
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.3 }}>
                <OrderForm
                  form={form} setField={setField} toggleExtra={toggleExtra}
                  estimate={estimate} progress={progress}
                  onSubmit={handleSubmit} submitting={submitting}
                  onCancel={() => { setShowForm(false); setForm(emptyForm); }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Leads List ── */}
          {(() => {
            const activeLeads = leads.filter(l => !['COMPLETED', 'CANCELLED'].includes(l.status));
            const historyLeads = leads.filter(l => ['COMPLETED', 'CANCELLED'].includes(l.status));
            return (
              <>
                {activeLeads.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <Box borderColor="slate.200" borderRadius="2xl" p={16} textAlign="center">
                      <Text fontSize="4xl" mb={3}>🧹</Text>
                      <Text color="slate.600" fontWeight="bold" fontSize="lg">No active bookings</Text>
                      <Text color="slate.400" fontSize="sm" mt={1}>
                        {historyLeads.length > 0
                          ? 'All your bookings are finalized. View your history below.'
                          : 'Click "New Booking" to request a cleaning professional.'}
                      </Text>
                    </Box>
                  </motion.div>
                ) : (
                  <VStack gap={4} align="stretch">
                    {activeLeads.map((lead, i) => {
                      const s = STATUS_MAP[lead.status] ?? { label: lead.status, bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
                      const now = new Date();
                      const scheduledTime = new Date(lead.dateTime);
                      const timeHasPassed = scheduledTime < now;
                      const isActive = !['COMPLETED', 'CANCELLED'].includes(lead.status);
                      const canCancel = isActive && !timeHasPassed;
                      const canTerminate = isActive && timeHasPassed && lead.status === 'ACCEPTED';
                      const canReactivate = isActive && timeHasPassed && ['NEW', 'WAVE1', 'WAVE2', 'WAVE3', 'UNMATCHED'].includes(lead.status);
                      const canRate = lead.status === 'COMPLETED' && lead.cleanerId && !lead.review;
                      const freqLabel = FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.labelEn;
                      const activeConvs = lead.status === 'IN_REVIEW'
                        ? (lead.conversations ?? []).filter(c => c.status === 'active')
                        : [];

                      return (
                        <motion.div key={lead.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: i * 0.06 }}
                          layout>
                          <Box
                            bg="white" border="1px solid"
                            borderColor={lead.status === 'COMPLETED' ? 'green.200' : lead.status === 'CANCELLED' ? 'red.200' : 'slate.200'}
                            borderRadius="2xl" overflow="hidden"
                            boxShadow="0 1px 8px rgba(0,0,0,0.04)"
                            _hover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                            transition="all 0.2s">

                            {/* Card body */}
                            <Box p={5}>
                              <Flex justify="space-between" align="start" gap={4}>
                                <VStack align="start" gap={2.5} flex={1} minW={0}>

                                  <HStack gap={2} flexWrap="wrap">
                                    <Badge bg={s.bg} color={s.color} borderRadius="full" px={3} py={0.5}
                                      fontSize="xs" fontWeight="bold" border="1px solid" borderColor={s.border}>
                                      {s.label}
                                    </Badge>
                                    <Text fontWeight="bold" fontSize="sm" color="slate.800">{lead.serviceType}</Text>
                                    {lead.isInstantBook && (
                                      <Badge bg="yellow.100" color="yellow.700" borderRadius="full" px={2} fontSize="xs"
                                        border="1px solid" borderColor="yellow.300">
                                        <Icon as={LucideZap} w={3} h={3} mr={1} />Instant
                                      </Badge>
                                    )}
                                  </HStack>

                                  <HStack gap={4} flexWrap="wrap">
                                    <HStack gap={1} color="slate.500" fontSize="sm">
                                      <Icon as={LucideMapPin} w={4} h={4} />
                                      <Text lineClamp={1}>{lead.address}</Text>
                                    </HStack>
                                    <HStack gap={1} color="slate.500" fontSize="sm">
                                      <Icon as={LucideCalendar} w={4} h={4} />
                                      <Text>{scheduledTime.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</Text>
                                    </HStack>
                                  </HStack>

                                  {(lead.bedrooms || lead.squareMeters) && (
                                    <HStack gap={2} flexWrap="wrap">
                                      {lead.bedrooms && <Badge bg="slate.50" color="slate.600" borderRadius="full" px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="slate.200">🛏 {lead.bedrooms}bd</Badge>}
                                      {lead.bathrooms && <Badge bg="slate.50" color="slate.600" borderRadius="full" px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="slate.200">🚿 {lead.bathrooms}ba</Badge>}
                                      {(lead.squareMeters ?? 0) > 0 && <Badge bg="slate.50" color="slate.600" borderRadius="full" px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="slate.200">📐 {lead.squareMeters}m²</Badge>}
                                      {freqLabel && freqLabel !== 'One-time' && <Badge bg="green.50" color="green.700" borderRadius="full" px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="green.200"><Icon as={LucideTag} w={3} h={3} mr={1} />{freqLabel}</Badge>}
                                    </HStack>
                                  )}

                                  {lead.estimatedMinPrice && (
                                    <HStack gap={4}>
                                      <HStack gap={1} color="green.600" fontSize="sm">
                                        <Icon as={LucideBanknote} w={4} h={4} />
                                        <Text fontWeight="bold">${lead.estimatedMinPrice} – ${lead.estimatedMaxPrice}</Text>
                                      </HStack>
                                      {lead.estimatedHours && (
                                        <HStack gap={1} color="brand.500" fontSize="sm">
                                          <Icon as={LucideClock} w={4} h={4} />
                                          <Text fontWeight="semibold">~{lead.estimatedHours}h</Text>
                                        </HStack>
                                      )}
                                    </HStack>
                                  )}

                                  {/* Confirmed cleaner (ACCEPTED state) */}
                                  {lead.cleaner && lead.cleanerId && lead.status === 'ACCEPTED' && (() => {
                                    const acceptedConv = (lead.conversations ?? []).find(c => c.cleanerId === lead.cleanerId && c.status === 'active');
                                    return (
                                      <HStack gap={2} flexWrap="wrap">
                                        <HStack gap={1.5} fontSize="sm" bg="green.50" px={3} py={1}
                                          borderRadius="full" color="green.700" border="1px solid" borderColor="green.200">
                                          <Icon as={LucideCheckCircle} w={4} h={4} />
                                          <Text fontWeight="semibold">{lead.cleaner.name}</Text>
                                        </HStack>
                                        <Button size="xs" variant="outline" borderColor="slate.200" color="slate.600"
                                          borderRadius="full" fontWeight="semibold"
                                          _hover={{ bg: 'brand.50', borderColor: 'brand.200', color: 'brand.600' }}
                                          onClick={() => router.push(`/dashboard/profile/${lead.cleanerId}`)}>
                                          <Icon as={LucideExternalLink} w={3} h={3} mr={1} />
                                          View profile
                                        </Button>
                                        {acceptedConv && (
                                          <Button size="xs" bg="brand.500" color="white" borderRadius="full" fontWeight="bold"
                                            _hover={{ bg: 'brand.600' }}
                                            onClick={() => router.push(`/dashboard/chat/${acceptedConv.id}`)}>
                                            <Icon as={LucideMessageCircle} w={3} h={3} mr={1} />
                                            Chat
                                          </Button>
                                        )}
                                      </HStack>
                                    );
                                  })()}

                                  {/* Active conversations — respond / decline */}
                                  {activeConvs.length > 0 && (
                                    <Box w="full">
                                      <Text fontSize="xs" color="brand.600" fontWeight="bold" mb={2}>
                                        {activeConvs.length === 1
                                          ? '1 professional available — accept or decline:'
                                          : `${activeConvs.length} professionals available — choose one:`}
                                      </Text>
                                      <VStack align="start" gap={2}>
                                        {activeConvs.map(conv => (
                                          <motion.div key={conv.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                                            <motion.div
                                              animate={{ boxShadow: ['0 0 0 0 rgba(37,99,235,0)', '0 0 0 6px rgba(37,99,235,0.18)', '0 0 0 0 rgba(37,99,235,0)'] }}
                                              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                                              style={{ borderRadius: '12px' }}>
                                              <HStack gap={2} bg="blue.50" px={3} py={2} borderRadius="xl"
                                                border="1px solid" borderColor="blue.200">
                                                <Box w="28px" h="28px" borderRadius="full" flexShrink={0}
                                                  overflow="hidden" border="2px solid" borderColor="brand.100"
                                                  bg="brand.500"
                                                  display="flex" alignItems="center" justifyContent="center"
                                                  color="white" fontSize="xs" fontWeight="black">
                                                  {conv.cleaner.avatarUrl ? (
                                                    <img src={conv.cleaner.avatarUrl} alt={conv.cleaner.name}
                                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                  ) : conv.cleaner.name[0]}
                                                </Box>
                                                <HStack gap={1.5} flex={1}>
                                                  <Text fontSize="sm" fontWeight="semibold" color="slate.700">
                                                    {conv.cleaner.name}
                                                  </Text>
                                                  {conv.cleaner.isVerified && (
                                                    <Icon as={LucideShieldCheck} w={4} h={4} color="green.500" title="Verificado" />
                                                  )}
                                                </HStack>
                                                <Button size="xs" variant="outline" borderColor="slate.200" color="slate.600"
                                                  borderRadius="lg" fontWeight="semibold"
                                                  _hover={{ bg: 'brand.50', borderColor: 'brand.200', color: 'brand.600' }}
                                                  onClick={() => router.push(`/dashboard/profile/${conv.cleaner.id}`)}>
                                                  <Icon as={LucideExternalLink} w={3} h={3} mr={1} />
                                                  View profile
                                                </Button>
                                                <Button size="xs" bg="green.500" color="white" borderRadius="lg" fontWeight="bold"
                                                  _hover={{ bg: 'green.600' }}
                                                  loading={accepting === conv.id}
                                                  onClick={() => handleAccept(conv.id)}>
                                                  <Icon as={LucideCheckCircle} w={3} h={3} mr={1} />
                                                  Accept
                                                </Button>
                                                <motion.div whileTap={{ scale: 0.9 }}>
                                                  <Button size="xs" variant="outline" color="red.500" borderColor="red.200"
                                                    borderRadius="lg" fontWeight="bold"
                                                    _hover={{ bg: 'red.50' }}
                                                    loading={declining === conv.id}
                                                    onClick={() => handleDecline(conv.id)}>
                                                    <Icon as={LucideThumbsDown} w={3} h={3} mr={1} />
                                                    Decline
                                                  </Button>
                                                </motion.div>
                                              </HStack>
                                            </motion.div>
                                          </motion.div>
                                        ))}
                                      </VStack>
                                    </Box>
                                  )}

                                  {/* Lead photos */}
                                  {(lead.photos ?? []).length > 0 && (
                                    <HStack gap={2} flexWrap="wrap">
                                      {(lead.photos ?? []).map((url, pi) => (
                                        <Box key={pi} w="48px" h="48px" borderRadius="lg" overflow="hidden"
                                          border="1px solid" borderColor="slate.200" flexShrink={0}>
                                          <img src={url} alt={`Photo ${pi + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Box>
                                      ))}
                                      <Text fontSize="xs" color="slate.400" alignSelf="center">
                                        {(lead.photos ?? []).length} photo{(lead.photos ?? []).length !== 1 ? 's' : ''}
                                      </Text>
                                    </HStack>
                                  )}

                                  {/* Rating already submitted */}
                                  {lead.review && (
                                    <HStack gap={1.5} bg="yellow.50" px={3} py={1.5} borderRadius="xl"
                                      border="1px solid" borderColor="yellow.200">
                                      {[1,2,3,4,5].map(st => (
                                        <Icon key={st} as={LucideStar} w={4} h={4}
                                          color={lead.review!.rating >= st ? '#F59E0B' : '#E5E7EB'}
                                          fill={lead.review!.rating >= st ? '#F59E0B' : 'none'} />
                                      ))}
                                      <Text fontSize="xs" color="yellow.700" fontWeight="semibold">Rated</Text>
                                    </HStack>
                                  )}

                                </VStack>

                                <Text fontSize="xs" color="slate.400" whiteSpace="nowrap">
                                  {new Date(lead.createdAt).toLocaleDateString('en-US')}
                                </Text>
                              </Flex>
                            </Box>

                            {/* ── Action Bar ── */}
                            <AnimatePresence>
                              {(canCancel || canTerminate || canRate || canReactivate || (isActive && !timeHasPassed)) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25 }}>
                                  <Box borderTop="1px solid" borderColor="slate.100" px={5} py={3}>
                                    <Flex gap={2} align="center" flexWrap="wrap">

                                      {/* Edit */}
                                      {isActive && !timeHasPassed && ['NEW','WAVE1','WAVE2','WAVE3','UNMATCHED'].includes(lead.status) && (
                                        <motion.div whileTap={{ scale: 0.95 }}>
                                          <Button size="sm" variant="outline" borderColor="slate.200" color="slate.600"
                                            borderRadius="lg" fontWeight="semibold"
                                            _hover={{ bg: 'slate.50', borderColor: 'brand.300', color: 'brand.600' }}
                                            transition="all 0.2s"
                                            onClick={() => editingId === lead.id ? setEditingId(null) : openEdit(lead)}>
                                            <Icon as={editingId === lead.id ? LucideChevronUp : LucidePencil} w={4} h={4} mr={1.5} />
                                            {editingId === lead.id ? 'Close edit' : 'Edit'}
                                          </Button>
                                        </motion.div>
                                      )}

                                      {/* Cancel */}
                                      {canCancel && confirmCancel !== lead.id && (
                                        <motion.div whileTap={{ scale: 0.95 }}>
                                          <Button size="sm" variant="outline" borderColor="red.200" color="red.500"
                                            borderRadius="lg" fontWeight="semibold"
                                            _hover={{ bg: 'red.50' }} transition="all 0.2s"
                                            onClick={() => setConfirmCancel(lead.id)}>
                                            <Icon as={LucideTrash2} w={4} h={4} mr={1.5} />
                                            Cancel booking
                                          </Button>
                                        </motion.div>
                                      )}

                                      {/* Cancel confirmation */}
                                      <AnimatePresence>
                                        {confirmCancel === lead.id && (
                                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                            <HStack gap={2} bg="red.50" px={3} py={2} borderRadius="xl" border="1px solid" borderColor="red.200">
                                              <Text fontSize="sm" color="red.600" fontWeight="semibold">Confirm cancellation?</Text>
                                              <Button size="xs" bg="red.500" color="white" borderRadius="lg"
                                                loading={cancelling === lead.id}
                                                onClick={() => handleCancel(lead.id)}>Yes, cancel</Button>
                                              <Button size="xs" variant="ghost" color="slate.500" borderRadius="lg"
                                                onClick={() => setConfirmCancel(null)}>No</Button>
                                            </HStack>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>

                                      {/* Reactivate */}
                                      {canReactivate && (
                                        <motion.div whileTap={{ scale: 0.95 }}>
                                          <Button size="sm" bg="orange.500" color="white" borderRadius="lg" fontWeight="bold"
                                            _hover={{ bg: 'orange.600' }} transition="all 0.2s"
                                            onClick={() => {
                                              if (reactivateId === lead.id) {
                                                setReactivateId(null);
                                              } else {
                                                setReactivateId(lead.id);
                                                const dt = new Date(lead.dateTime);
                                                setReactivateDate(dt.toISOString().split('T')[0]);
                                                setReactivateTime(dt.toTimeString().slice(0, 5));
                                              }
                                            }}>
                                            <Icon as={LucideRotateCcw} w={4} h={4} mr={1.5} />
                                            {reactivateId === lead.id ? 'Close' : 'Reschedule & Reactivate'}
                                          </Button>
                                        </motion.div>
                                      )}

                                      {/* Terminate */}
                                      {canTerminate && confirmComplete !== lead.id && (
                                        <motion.div whileTap={{ scale: 0.97 }}
                                          animate={{ boxShadow: ['0 0 0 0 rgba(34,197,94,0)', '0 0 0 6px rgba(34,197,94,0.15)', '0 0 0 0 rgba(34,197,94,0)'] }}
                                          transition={{ repeat: Infinity, duration: 2.5 }}>
                                          <Button size="sm" bg="green.500" color="white" borderRadius="lg" fontWeight="bold"
                                            _hover={{ bg: 'green.600', transform: 'translateY(-1px)' }}
                                            transition="all 0.2s"
                                            onClick={() => setConfirmComplete(lead.id)}>
                                            <Icon as={LucideCheckCircle} w={4} h={4} mr={1.5} />
                                            Mark as complete
                                          </Button>
                                        </motion.div>
                                      )}

                                      {/* Terminate confirmation */}
                                      <AnimatePresence>
                                        {confirmComplete === lead.id && (
                                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                            <HStack gap={2} bg="green.50" px={3} py={2} borderRadius="xl" border="1px solid" borderColor="green.200">
                                              <Text fontSize="sm" color="green.700" fontWeight="semibold">Job completed?</Text>
                                              <Button size="xs" bg="green.500" color="white" borderRadius="lg"
                                                loading={completing === lead.id}
                                                onClick={() => handleComplete(lead.id)}>Yes, completed</Button>
                                              <Button size="xs" variant="ghost" color="slate.500" borderRadius="lg"
                                                onClick={() => setConfirmComplete(null)}>No</Button>
                                            </HStack>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>

                                      {/* Rate */}
                                      {canRate && (
                                        <motion.div whileTap={{ scale: 0.95 }}
                                          animate={{ y: [0, -2, 0] }}
                                          transition={{ repeat: Infinity, duration: 2 }}>
                                          <Button size="sm" bg="yellow.400" color="white" borderRadius="lg" fontWeight="bold"
                                            _hover={{ bg: 'yellow.500' }} transition="all 0.2s"
                                            onClick={() => setRatingLead(lead)}>
                                            <Icon as={LucideStar} w={4} h={4} mr={1.5} />
                                            Rate professional
                                          </Button>
                                        </motion.div>
                                      )}

                                    </Flex>
                                  </Box>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* ── Reactivate Form (inline) ── */}
                            <AnimatePresence>
                              {reactivateId === lead.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}>
                                  <Box borderTop="1px solid" borderColor="orange.100" bg="orange.50" p={5}>
                                    <Text fontSize="sm" fontWeight="bold" color="orange.700" mb={4}>🔄 Choose a new date & time</Text>
                                    <VStack gap={3} align="stretch">
                                      <HStack gap={3}>
                                        <Input type="date" value={reactivateDate}
                                          onChange={e => setReactivateDate(e.target.value)}
                                          bg="white" borderRadius="xl" h="11" flex={1}
                                          border="1px solid" borderColor="orange.200"
                                          min={new Date().toISOString().split('T')[0]} />
                                        <Input type="time" value={reactivateTime}
                                          onChange={e => setReactivateTime(e.target.value)}
                                          bg="white" borderRadius="xl" h="11" flex={1}
                                          border="1px solid" borderColor="orange.200" />
                                      </HStack>
                                      <HStack gap={3} justify="flex-end">
                                        <Button size="sm" variant="ghost" color="slate.500" onClick={() => setReactivateId(null)}>Cancel</Button>
                                        <Button size="sm" bg="orange.500" color="white" borderRadius="xl" fontWeight="bold"
                                          _hover={{ bg: 'orange.600' }} loading={reactivating} loadingText="Reactivating…"
                                          onClick={() => handleReactivate(lead.id)}>
                                          <Icon as={LucideRotateCcw} w={4} h={4} mr={1.5} />
                                          Reactivate Booking
                                        </Button>
                                      </HStack>
                                    </VStack>
                                  </Box>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* ── Edit Form (inline) ── */}
                            <AnimatePresence>
                              {editingId === lead.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}>
                                  <Box borderTop="1px solid" borderColor="brand.100" bg="brand.50" p={5}>
                                    <Text fontSize="sm" fontWeight="bold" color="brand.700" mb={4}>✏️ Edit booking</Text>
                                    <VStack gap={4} align="stretch">
                                      <SimpleGrid columns={2} gap={3}>
                                        {SERVICE_TYPES.map(sv => (
                                          <Box key={sv.id} as="button" p={3} borderRadius="xl"
                                            border="2px solid"
                                            borderColor={editForm.serviceType === sv.id ? 'brand.400' : 'slate.200'}
                                            bg="white" cursor="pointer" textAlign="left"
                                            onClick={() => setEditField('serviceType', sv.id)}
                                            transition="all 0.15s">
                                            <HStack gap={2}>
                                              <Text>{sv.icon}</Text>
                                              <Text fontSize="xs" fontWeight="bold"
                                                color={editForm.serviceType === sv.id ? 'brand.700' : 'slate.700'}>{sv.labelEn}</Text>
                                            </HStack>
                                          </Box>
                                        ))}
                                      </SimpleGrid>
                                      <Input placeholder="Address" value={editForm.address}
                                        onChange={e => setEditField('address', e.target.value)}
                                        bg="white" borderRadius="xl" h="11" border="1px solid" borderColor="slate.200" />
                                      <HStack gap={3}>
                                        <Input type="date" value={editForm.date}
                                          onChange={e => setEditField('date', e.target.value)}
                                          bg="white" borderRadius="xl" h="11" flex={1} border="1px solid" borderColor="slate.200" />
                                        <Input type="time" value={editForm.time}
                                          onChange={e => setEditField('time', e.target.value)}
                                          bg="white" borderRadius="xl" h="11" flex={1} border="1px solid" borderColor="slate.200" />
                                      </HStack>
                                      <HStack gap={3} justify="flex-end">
                                        <Button size="sm" variant="ghost" color="slate.500" onClick={() => setEditingId(null)}>Cancel</Button>
                                        <Button size="sm" bg="brand.500" color="white" borderRadius="xl" fontWeight="bold"
                                          _hover={{ bg: 'brand.600' }} loading={saving} loadingText="Saving…"
                                          onClick={() => handleSaveEdit(lead.id)}>
                                          Save changes
                                        </Button>
                                      </HStack>
                                    </VStack>
                                  </Box>
                                </motion.div>
                              )}
                            </AnimatePresence>

                          </Box>
                        </motion.div>
                      );
                    })}
                  </VStack>
                )}

                {/* ── History Section ── */}
                {historyLeads.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }}>
                    <Box>
                      <Button
                        w="full" variant="outline" borderColor="slate.200" color="slate.500"
                        borderRadius="xl" fontWeight="semibold" fontSize="sm" py={5}
                        bg={showHistory ? 'slate.50' : 'white'}
                        _hover={{ bg: 'slate.50', borderColor: 'slate.300', color: 'slate.700' }}
                        transition="all 0.2s"
                        onClick={() => setShowHistory(v => !v)}>
                        <Icon as={showHistory ? LucideChevronUp : LucideChevronDown} w={4} h={4} mr={2} />
                        {showHistory
                          ? 'Hide history'
                          : `View history (${historyLeads.length} booking${historyLeads.length !== 1 ? 's' : ''})`}
                      </Button>

                      <AnimatePresence>
                        {showHistory && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}>
                            <VStack gap={3} align="stretch" mt={3}>
                              <Text fontSize="xs" fontWeight="bold" color="slate.400" textTransform="uppercase" letterSpacing="wider" px={1}>
                                Completed & cancelled bookings
                              </Text>
                              {historyLeads.map((lead, i) => {
                                const s = STATUS_MAP[lead.status] ?? { label: lead.status, bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
                                const scheduledTime = new Date(lead.dateTime);
                                const freqLabel = FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.labelEn;
                                const canRate = lead.status === 'COMPLETED' && lead.cleanerId && !lead.review;
                                return (
                                  <motion.div key={lead.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: i * 0.04 }}>
                                    <Box
                                      bg="white" border="1px solid"
                                      borderColor={lead.status === 'COMPLETED' ? 'green.200' : 'red.200'}
                                      borderRadius="2xl" overflow="hidden" opacity={0.85}
                                      boxShadow="0 1px 4px rgba(0,0,0,0.03)"
                                      _hover={{ opacity: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
                                      transition="all 0.2s">
                                      <Box p={4}>
                                        <Flex justify="space-between" align="start" gap={4}>
                                          <VStack align="start" gap={2} flex={1} minW={0}>
                                            <HStack gap={2} flexWrap="wrap">
                                              <Badge bg={s.bg} color={s.color} borderRadius="full" px={3} py={0.5}
                                                fontSize="xs" fontWeight="bold" border="1px solid" borderColor={s.border}>
                                                {s.label}
                                              </Badge>
                                              <Text fontWeight="bold" fontSize="sm" color="slate.700">{lead.serviceType}</Text>
                                            </HStack>
                                            <HStack gap={4} flexWrap="wrap">
                                              <HStack gap={1} color="slate.400" fontSize="xs">
                                                <Icon as={LucideMapPin} w={3.5} h={3.5} />
                                                <Text lineClamp={1}>{lead.address}</Text>
                                              </HStack>
                                              <HStack gap={1} color="slate.400" fontSize="xs">
                                                <Icon as={LucideCalendar} w={3.5} h={3.5} />
                                                <Text>{scheduledTime.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</Text>
                                              </HStack>
                                            </HStack>
                                            {(lead.bedrooms || lead.squareMeters) && (
                                              <HStack gap={2} flexWrap="wrap">
                                                {lead.bedrooms && <Badge bg="slate.50" color="slate.500" borderRadius="full" px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="slate.200">🛏 {lead.bedrooms}bd</Badge>}
                                                {lead.bathrooms && <Badge bg="slate.50" color="slate.500" borderRadius="full" px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="slate.200">🚿 {lead.bathrooms}ba</Badge>}
                                                {(lead.squareMeters ?? 0) > 0 && <Badge bg="slate.50" color="slate.500" borderRadius="full" px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="slate.200">📐 {lead.squareMeters}m²</Badge>}
                                                {freqLabel && freqLabel !== 'One-time' && <Badge bg="green.50" color="green.600" borderRadius="full" px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="green.200">{freqLabel}</Badge>}
                                              </HStack>
                                            )}
                                            {lead.estimatedMinPrice && (
                                              <HStack gap={1} color="slate.400" fontSize="xs">
                                                <Icon as={LucideBanknote} w={3.5} h={3.5} />
                                                <Text>${lead.estimatedMinPrice} – ${lead.estimatedMaxPrice}</Text>
                                              </HStack>
                                            )}
                                            {lead.review && (
                                              <HStack gap={1} bg="yellow.50" px={2.5} py={1} borderRadius="full"
                                                border="1px solid" borderColor="yellow.200">
                                                {[1,2,3,4,5].map(st => (
                                                  <Icon key={st} as={LucideStar} w={3} h={3}
                                                    color={lead.review!.rating >= st ? '#F59E0B' : '#E5E7EB'}
                                                    fill={lead.review!.rating >= st ? '#F59E0B' : 'none'} />
                                                ))}
                                                <Text fontSize="xs" color="yellow.700" fontWeight="semibold" ml={0.5}>Rated</Text>
                                              </HStack>
                                            )}
                                            {canRate && (
                                              <motion.div whileTap={{ scale: 0.95 }}>
                                                <Button size="xs" bg="yellow.400" color="white" borderRadius="lg" fontWeight="bold"
                                                  _hover={{ bg: 'yellow.500' }} transition="all 0.2s"
                                                  onClick={() => setRatingLead(lead)}>
                                                  <Icon as={LucideStar} w={3} h={3} mr={1} />
                                                  Rate professional
                                                </Button>
                                              </motion.div>
                                            )}
                                          </VStack>
                                          <Text fontSize="xs" color="slate.400" whiteSpace="nowrap">
                                            {new Date(lead.createdAt).toLocaleDateString('en-US')}
                                          </Text>
                                        </Flex>
                                      </Box>
                                    </Box>
                                  </motion.div>
                                );
                              })}
                            </VStack>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Box>
                  </motion.div>
                )}
              </>
            );
          })()}

        </VStack>
      </Container>

      {/* ── Rating Modal ── */}
      <AnimatePresence>
        {ratingLead && (
          <motion.div key="rating-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={() => setRatingLead(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px', margin: '0 16px' }}>
              <Box bg="white" borderRadius="3xl" p={8} boxShadow="0 20px 60px rgba(0,0,0,0.18)">
                <VStack gap={5} align="center" textAlign="center">
                  <Box w="56px" h="56px" bg="yellow.100" borderRadius="2xl"
                    display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="2xl">⭐</Text>
                  </Box>
                  <Box>
                    <Heading size="md" fontWeight="black" color="slate.900">Rate professional</Heading>
                    <Text color="slate.500" fontSize="sm" mt={1}>
                      {ratingLead.cleaner?.name ?? 'Professional'}
                    </Text>
                  </Box>
                  <StarRating value={starValue} onChange={setStarValue} />
                  <Text fontSize="xs" color="slate.400">
                    {starValue === 0 ? 'Tap a star to rate' : ['','Poor','Fair','Good','Great','Excellent!'][starValue]}
                  </Text>
                  <Textarea
                    placeholder="Optional comment (e.g. super attentive and fast!)"
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    bg="slate.50" border="1px solid" borderColor="slate.200"
                    borderRadius="xl" rows={3} fontSize="sm"
                    _focus={{ borderColor: 'brand.300', bg: 'white' }}
                    resize="none"
                  />
                  <HStack gap={3} w="full">
                    <Button flex={1} variant="outline" borderColor="slate.200" color="slate.500"
                      borderRadius="xl" onClick={() => setRatingLead(null)}>
                      Not now
                    </Button>
                    <Button flex={1} bg="yellow.400" color="white" borderRadius="xl" fontWeight="bold"
                      _hover={{ bg: 'yellow.500' }}
                      loading={sendingRating} loadingText="Submitting…"
                      onClick={handleSubmitRating} disabled={starValue === 0}>
                      Submit rating
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </Box>
  );
}

/* ─── OrderForm component ─── */
function OrderForm({ form, setField, toggleExtra, estimate, progress, onSubmit, submitting, onCancel }: any) {
  const serviceLabel = SERVICE_TYPES.find(s => s.id === form.serviceType)?.labelEn ?? '';
  return (
    <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl" p={7}
      boxShadow="0 4px 24px rgba(0,0,0,0.06)">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="sm" color="slate.800">Request cleaning service</Heading>
        <Button size="sm" variant="ghost" color="slate.400" onClick={onCancel} borderRadius="lg">
          <Icon as={LucideX} w={4} h={4} />
        </Button>
      </Flex>

      {/* Progress */}
      <Box mb={6}>
        <Flex justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="bold" color="slate.700">
            {progress < 100 ? `${progress}% complete` : (
              <HStack gap={1.5} as="span"><Icon as={LucideSparkles} w={4} h={4} color="green.500" /><Text as="span" color="green.600">Ready!</Text></HStack>
            )}
          </Text>
          <Text fontSize="sm" fontWeight="black" color={progress === 100 ? 'green.600' : 'brand.500'}>{progress}%</Text>
        </Flex>
        <Box bg="slate.100" borderRadius="full" h="8px" overflow="hidden">
          <motion.div style={{ height: '100%', borderRadius: 9999,
            background: progress === 100 ? 'linear-gradient(to right, #22C55E, #16A34A)' : 'linear-gradient(to right, #2563EB, #60A5FA)' }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
        </Box>
      </Box>

      <form onSubmit={onSubmit}>
        <VStack gap={6} align="stretch">
          {/* Service type */}
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" mb={3} letterSpacing="wider">Service type</Text>
            <SimpleGrid columns={2} gap={3}>
              {SERVICE_TYPES.map(s => (
                <motion.div key={s.id} whileTap={{ scale: 0.97 }}>
                  <Box as="button" w="full" p={3.5} borderRadius="xl" textAlign="left"
                    border="2px solid" borderColor={form.serviceType === s.id ? 'brand.400' : 'slate.200'}
                    bg={form.serviceType === s.id ? 'brand.50' : 'white'}
                    cursor="pointer" onClick={() => setField('serviceType', s.id)} transition="all 0.15s">
                    <HStack gap={2.5}>
                      <Text fontSize="xl">{s.icon}</Text>
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color={form.serviceType === s.id ? 'brand.700' : 'slate.800'}>{s.labelEn}</Text>
                        <Text fontSize="xs" color="slate.400">{s.descEn}</Text>
                      </Box>
                    </HStack>
                  </Box>
                </motion.div>
              ))}
            </SimpleGrid>
          </Box>

          {/* Property size */}
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" mb={4} letterSpacing="wider">Property size</Text>
            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
              <Box><Text fontSize="sm" color="slate.600" mb={2} fontWeight="medium">🛏 Bedrooms</Text><Stepper value={form.bedrooms} onChange={v => setField('bedrooms', v)} /></Box>
              <Box><Text fontSize="sm" color="slate.600" mb={2} fontWeight="medium">🚿 Bathrooms</Text><Stepper value={form.bathrooms} onChange={v => setField('bathrooms', v)} /></Box>
              <Box>
                <Text fontSize="sm" color="slate.600" mb={2} fontWeight="medium">📐 Area (m²)</Text>
                <Input type="number" placeholder="e.g. 80" value={form.squareMeters || ''}
                  onChange={e => setField('squareMeters', Number(e.target.value))}
                  bg="slate.50" border="1px solid" borderColor={form.squareMeters > 0 ? 'brand.300' : 'slate.200'}
                  h="10" borderRadius="xl" fontSize="sm"
                  _focus={{ bg: 'white', borderColor: 'brand.400' }} transition="all 0.2s" />
              </Box>
            </SimpleGrid>
          </Box>

          {/* Add-ons */}
          <Box>
            <HStack gap={2} mb={3}><Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" letterSpacing="wider">Add-ons</Text><Text fontSize="xs" color="slate.400">(optional)</Text></HStack>
            <SimpleGrid columns={2} gap={3}>
              {EXTRAS.map(ex => {
                const sel = form.extras.includes(ex.id);
                return (
                  <motion.div key={ex.id} whileTap={{ scale: 0.97 }}>
                    <Box as="button" w="full" p={3} borderRadius="xl" textAlign="left"
                      border="2px solid" borderColor={sel ? 'yellow.400' : 'slate.200'}
                      bg={sel ? 'yellow.50' : 'white'} cursor="pointer"
                      onClick={() => toggleExtra(ex.id)} transition="all 0.15s">
                      <Flex justify="space-between" align="center">
                        <HStack gap={2}><Text fontSize="lg">{ex.icon}</Text><Box><Text fontSize="xs" fontWeight="bold" color={sel ? 'yellow.700' : 'slate.700'}>{ex.labelEn}</Text><Text fontSize="xs" color="slate.400">+${ex.price}</Text></Box></HStack>
                        <Box w="18px" h="18px" borderRadius="full" bg={sel ? 'yellow.400' : 'slate.200'} display="flex" alignItems="center" justifyContent="center" transition="all 0.15s">
                          {sel && <Text fontSize="10px" color="white" fontWeight="black">✓</Text>}
                        </Box>
                      </Flex>
                    </Box>
                  </motion.div>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* Frequency */}
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" mb={3} letterSpacing="wider">Frequency</Text>
            <SimpleGrid columns={3} gap={3}>
              {FREQUENCY_OPTIONS.map(f => (
                <motion.div key={f.id} whileTap={{ scale: 0.97 }}>
                  <Box as="button" w="full" p={3} borderRadius="xl" textAlign="center"
                    border="2px solid" borderColor={form.frequency === f.id ? 'green.400' : 'slate.200'}
                    bg={form.frequency === f.id ? 'green.50' : 'white'} cursor="pointer"
                    onClick={() => setField('frequency', f.id)} transition="all 0.15s">
                    <Text fontSize="sm" fontWeight="bold" color={form.frequency === f.id ? 'green.700' : 'slate.700'}>{f.labelEn}</Text>
                    {f.tag && <Text fontSize="10px" color="green.500" fontWeight="bold">{f.tag}</Text>}
                  </Box>
                </motion.div>
              ))}
            </SimpleGrid>
          </Box>

          {/* Location & date */}
          <Box>
            <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" mb={4} letterSpacing="wider">Location & date</Text>
            <VStack gap={4} align="stretch">
              <Input placeholder="Full address" value={form.address} onChange={e => setField('address', e.target.value)}
                bg="slate.50" border="1px solid" borderColor={form.address ? 'brand.300' : 'slate.200'} h="12" borderRadius="xl" fontSize="sm"
                _focus={{ bg: 'white', borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }} transition="all 0.2s" required />
              <HStack gap={4}>
                <Input type="date" value={form.date} onChange={e => setField('date', e.target.value)}
                  bg="slate.50" border="1px solid" borderColor={form.date ? 'brand.300' : 'slate.200'} h="12" borderRadius="xl" fontSize="sm" flex={1}
                  _focus={{ bg: 'white', borderColor: 'brand.400' }} transition="all 0.2s" required />
                <Input type="time" value={form.time} onChange={e => setField('time', e.target.value)}
                  bg="slate.50" border="1px solid" borderColor={form.time ? 'brand.300' : 'slate.200'} h="12" borderRadius="xl" fontSize="sm" flex={1}
                  _focus={{ bg: 'white', borderColor: 'brand.400' }} transition="all 0.2s" required />
              </HStack>
              <textarea value={form.notes} onChange={e => setField('notes', e.target.value)}
                placeholder="Notes (optional)..." rows={2}
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 16px',
                  width: '100%', fontSize: '14px', color: '#1F2937', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
            </VStack>
          </Box>

          {/* Estimate */}
          <AnimatePresence>
            {estimate && (
              <motion.div key="est" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Box bg="linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)" border="1px solid" borderColor="brand.100" borderRadius="2xl" p={5}>
                  <HStack gap={2} mb={3}>
                    <Icon as={LucideSparkles} w={4} h={4} color="brand.500" />
                    <Text fontSize="xs" fontWeight="bold" color="brand.600" textTransform="uppercase" letterSpacing="wider">
                      Estimate — {serviceLabel}
                    </Text>
                    {estimate.discountPct > 0 && <Badge bg="green.100" color="green.700" fontSize="xs" borderRadius="full" px={2}>-{estimate.discountPct}%</Badge>}
                  </HStack>
                  <Flex gap={6} align="center" flexWrap="wrap">
                    <HStack gap={2}>
                      <Icon as={LucideBanknote} w={5} h={5} color="green.600" />
                      <Box><Text fontSize="xs" color="slate.500">Price</Text><Text fontSize="xl" fontWeight="black" color="green.700">${estimate.minPrice} – ${estimate.maxPrice}</Text></Box>
                    </HStack>
                    <HStack gap={2}>
                      <Icon as={LucideClock} w={5} h={5} color="brand.500" />
                      <Box><Text fontSize="xs" color="slate.500">Duration</Text><Text fontSize="xl" fontWeight="black" color="brand.700">~{estimate.hours}h</Text></Box>
                    </HStack>
                  </Flex>
                  <Text fontSize="xs" color="slate.400" mt={3}>* Estimate to guide the professional. Final price may vary.</Text>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>


          <Button type="submit" bg={progress === 100 ? 'green.500' : 'brand.500'} color="white"
            h="13" borderRadius="xl" fontWeight="bold" fontSize="md"
            _hover={{ bg: progress === 100 ? 'green.600' : 'brand.600', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
            transition="all 0.2s" loading={submitting} loadingText="Submitting…">
            {progress === 100 ? '✓ Submit Request' : 'Submit Request'}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
