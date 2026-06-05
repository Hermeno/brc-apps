'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Heading, Text, VStack, HStack, Button, Input,
  Flex, Icon, SimpleGrid, Textarea,
} from '@chakra-ui/react';
import {
  LucidePlus, LucideX, LucideMapPin, LucideCalendar,
  LucideMinus, LucideClock, LucideBanknote,
  LucideSparkles, LucideMessageCircle, LucideZap,
  LucidePencil, LucideCheckCircle, LucideStar,
  LucideThumbsDown, LucideChevronDown, LucideChevronUp, LucideExternalLink,
  LucideSettings, LucideRotateCcw, LucideShieldCheck,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import { AnimatePresence, motion } from 'motion/react';
import {
  SERVICE_TYPES, FREQUENCY_OPTIONS, EXTRAS, calculateEstimate,
} from '@/lib/estimate';
import NotificationBell from '@/components/notification-bell';
import { signOut } from 'next-auth/react';
import { LucideLogOut } from 'lucide-react';
import { AddressInput } from '@/components/address-input';
import Image from 'next/image';

/* ─── types ──────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  NEW:       { label: 'Awaiting match',          bg: '#F8FAFC', color: '#64748B', border: '#E3E8EE' },
  WAVE1:     { label: 'Finding cleaners…',       bg: '#F8FAFC', color: '#0A80DB', border: '#E3E8EE' },
  WAVE2:     { label: 'Finding cleaners…',       bg: '#F8FAFC', color: '#0A80DB', border: '#E3E8EE' },
  WAVE3:     { label: 'Finding cleaners…',       bg: '#F8FAFC', color: '#0A80DB', border: '#E3E8EE' },
  IN_REVIEW: { label: 'Cleaners available',      bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  ACCEPTED:  { label: 'Booked ✓',               bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  COMPLETED: { label: 'Completed ✓',            bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  CANCELLED: { label: 'Cancelled',              bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  UNMATCHED: { label: 'No cleaners found',       bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
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
    <HStack gap={0} border="1px solid" borderColor="slate.200" overflow="hidden" w="fit-content">
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
  // form.squareMeters holds sq ft (US input); convert to m² for the estimate engine
  const estimate = useMemo(() => {
    if (form.squareMeters <= 0) return null;
    return calculateEstimate({ serviceType: form.serviceType, bedrooms: form.bedrooms, bathrooms: form.bathrooms, squareMeters: form.squareMeters / 10.764, extras: form.extras, frequency: form.frequency });
  }, [form.serviceType, form.bedrooms, form.bathrooms, form.squareMeters, form.extras, form.frequency]);

  /* ── submit new ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address || !form.date || !form.time) { toaster.create({ title: 'Almost there! Please fill in the address, date, and time.', type: 'error' }); return; }
    setSubmitting(true);
    try {
      const dateTime = new Date(`${form.date}T${form.time}`).toISOString();
      const serviceLabel = SERVICE_TYPES.find(s => s.id === form.serviceType)?.labelEn ?? form.serviceType;
      const res = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: serviceLabel, address: form.address, notes: form.notes, dateTime,
          bedrooms: form.bedrooms, bathrooms: form.bathrooms, squareMeters: form.squareMeters > 0 ? form.squareMeters / 10.764 : 0,
          extras: form.extras, frequency: form.frequency,
          estimatedMinPrice: estimate?.minPrice, estimatedMaxPrice: estimate?.maxPrice, estimatedHours: estimate?.hours }),
      });
      if (res.ok) {
        toaster.create({ title: 'Booking request sent!', description: "We're finding the best cleaner for you.", type: 'success' });
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
      bedrooms: lead.bedrooms ?? 1, bathrooms: lead.bathrooms ?? 1, squareMeters: Math.round((lead.squareMeters ?? 0) * 10.764),
      extras: lead.extras ?? [], frequency: lead.frequency ?? 'once',
      address: lead.address,
      date: dt.toISOString().split('T')[0],
      time: dt.toTimeString().slice(0, 5),
      notes: lead.notes ?? '',
    });
    setEditingId(lead.id);
  };

  const handleSaveEdit = async (leadId: string) => {
    if (!editForm.address || !editForm.date || !editForm.time) { toaster.create({ title: 'Please fill in the address, date, and time before saving.', type: 'error' }); return; }
    setSaving(true);
    try {
      const dateTime = new Date(`${editForm.date}T${editForm.time}`).toISOString();
      const serviceLabel = SERVICE_TYPES.find(s => s.id === editForm.serviceType)?.labelEn ?? editForm.serviceType;
      const sqftToM2 = editForm.squareMeters > 0 ? editForm.squareMeters / 10.764 : 0;
      const est = sqftToM2 > 0 ? calculateEstimate({ serviceType: editForm.serviceType, bedrooms: editForm.bedrooms, bathrooms: editForm.bathrooms, squareMeters: sqftToM2, extras: editForm.extras, frequency: editForm.frequency }) : null;
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: serviceLabel, address: editForm.address, dateTime, notes: editForm.notes,
          bedrooms: editForm.bedrooms, bathrooms: editForm.bathrooms, squareMeters: sqftToM2,
          extras: editForm.extras, frequency: editForm.frequency,
          estimatedMinPrice: est?.minPrice, estimatedMaxPrice: est?.maxPrice, estimatedHours: est?.hours }),
      });
      if (res.ok) { toaster.create({ title: 'Booking updated successfully!', type: 'success' }); setEditingId(null); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setSaving(false); }
  };

  /* ── cancel ── */
  const handleCancel = async (leadId: string) => {
    setCancelling(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/cancel`, { method: 'POST' });
      if (res.ok) { toaster.create({ title: 'Booking cancelled', description: "Your booking has been cancelled. No worries — you can book again anytime.", type: 'success' }); setConfirmCancel(null); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setCancelling(null); }
  };

  /* ── complete ── */
  const handleComplete = async (leadId: string) => {
    setCompleting(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/complete`, { method: 'POST' });
      if (res.ok) { toaster.create({ title: "Job marked as complete!", description: "Nice! Don't forget to leave a rating for your cleaner.", type: 'success' }); setConfirmComplete(null); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setCompleting(null); }
  };

  /* ── decline ── */
  const handleDecline = async (convId: string) => {
    setDeclining(convId);
    try {
      const res = await fetch(`/api/conversations/${convId}/decline`, { method: 'POST' });
      if (res.ok) { toaster.create({ title: 'Cleaner declined', description: "No problem — we'll keep looking for the right fit.", type: 'success' }); fetchLeads(); }
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
        toaster.create({ title: "Cleaner confirmed! You're all set.", description: "Opening your chat now.", type: 'success' });
        fetchLeads();
        router.push(`/dashboard/chat/${convId}`);
      } else { throw new Error(data.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setAccepting(null); }
  };

  /* ── reactivate ── */
  const handleReactivate = async (leadId: string) => {
    if (!reactivateDate || !reactivateTime) {
      toaster.create({ title: 'Please choose a new date and time to reactivate.', type: 'error' }); return;
    }
    const dateTime = new Date(`${reactivateDate}T${reactivateTime}`);
    if (dateTime <= new Date()) {
      toaster.create({ title: 'The date and time must be in the future.', type: 'error' }); return;
    }
    setReactivating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/reactivate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTime: dateTime.toISOString() }),
      });
      if (res.ok) {
        toaster.create({ title: "Booking reactivated!", description: "We're finding available cleaners for your new date.", type: 'success' });
        setReactivateId(null); fetchLeads();
      } else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setReactivating(false); }
  };

  /* ── review ── */
  const handleSubmitRating = async () => {
    if (!ratingLead || starValue === 0) { toaster.create({ title: 'Please tap a star to rate your experience.', type: 'error' }); return; }
    setSendingRating(true);
    try {
      const res = await fetch(`/api/leads/${ratingLead.id}/review`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: starValue, comment: ratingComment }),
      });
      if (res.ok) { toaster.create({ title: 'Thanks for the review!', description: 'Your feedback helps our whole community.', type: 'success' }); setRatingLead(null); setStarValue(0); setRatingComment(''); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setSendingRating(false); }
  };

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';

  return (
    <Box minH="100vh" bg="white">
      {/* ── Client header ── */}
      <Box
        bg="#0B1120" borderBottom="1px solid rgba(255,255,255,0.06)"
        position="sticky" top={0} zIndex={50}
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
      >
        <Flex align="center" h="60px" px={{ base: 4, md: 6, lg: 8 }} maxW="1440px" mx="auto" justify="space-between">
          {/* Logo */}
          <HStack gap={2}>
            <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <Text fontWeight="700" fontSize={{ base: '13px', sm: '15px' }} letterSpacing="-0.02em" color="white" fontFamily="heading">
              Brazilian<Text as="span" color="brand.400">Clean</Text>
            </Text>
          </HStack>

          {/* Right side */}
          <HStack gap={1.5}>
            <HStack gap={2} display={{ base: 'none', lg: 'flex' }}
              bg="rgba(255,255,255,0.06)" border="1px solid" borderColor="rgba(255,255,255,0.1)"
              borderRadius="full" px={3} py={1.5}>
              <Box w="22px" h="22px" bg="brand.500" borderRadius="full"
                display="flex" alignItems="center" justifyContent="center"
                fontSize="9px" fontWeight="700" color="white">
                {firstName[0]?.toUpperCase() ?? 'C'}
              </Box>
              <Text fontSize="13px" fontWeight="500" color="#CBD5E1" fontFamily="heading" letterSpacing="-0.01em">
                {firstName}
              </Text>
            </HStack>
            <NotificationBell dark />
            <Button size="sm" variant="ghost" color="#6B7280" px={2} h="34px" borderRadius="lg"
              _hover={{ color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' }} transition="all 0.15s"
              onClick={() => signOut({ callbackUrl: '/auth/login' })} title="Sign out">
              <Icon as={LucideLogOut} w={4} h={4} />
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Box maxW="900px" mx="auto" py={8} px={6}>
        <VStack gap={6} align="stretch">

          {/* ── Profile Card ── */}
          <Box bg="white" border="1px solid #E3E8EE">
            <Box px={5} py={4}>
              <Flex justify="space-between" align="center" mb={3}>
                <Box w="44px" h="44px" borderRadius="full" overflow="hidden"
                  bg={profile?.avatarUrl ? 'white' : 'brand.500'}
                  display="flex" alignItems="center" justifyContent="center"
                  border="2px solid" borderColor="slate.100" flexShrink={0}>
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Text color="white" fontWeight="black" fontSize="lg">
                      {(profile?.name ?? session?.user?.name ?? 'C')[0].toUpperCase()}
                    </Text>
                  )}
                </Box>
                <Button size="sm" variant="outline" borderColor="slate.200" color="slate.500"
                  borderRadius="4px" fontWeight="semibold" fontSize="xs"
                  _hover={{ bg: 'brand.50', borderColor: 'brand.300', color: 'brand.600' }}
                  transition="all 0.15s"
                  onClick={() => router.push('/dashboard/client/profile')}>
                  <Icon as={LucideSettings} w={3.5} h={3.5} mr={1.5} />
                  Edit profile
                </Button>
              </Flex>

              <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                <Box minW={0}>
                  <Text fontWeight="black" fontSize="md" color="slate.900" lineClamp={1} fontFamily="heading">
                    {profile?.name ?? session?.user?.name ?? 'Customer'}
                  </Text>
                  <Text fontSize="xs" color="slate.400" mt={0.5}>{profile?.email ?? session?.user?.email}</Text>
                  {profile?.phone && (
                    <Text fontSize="xs" color="slate.500" mt={0.5}>📱 {profile.phone}</Text>
                  )}
                </Box>
                <HStack gap={0} borderLeft="1px solid #E3E8EE" flexShrink={0}>
                  <Box textAlign="center" px={4}>
                    <Text fontWeight="black" fontSize="lg" color="brand.600" fontFamily="heading">{leads.length}</Text>
                    <Text fontSize="10px" color="slate.400" fontWeight="700" textTransform="uppercase" letterSpacing="wider" fontFamily="heading">total bookings</Text>
                  </Box>
                  <Box textAlign="center" px={4} borderLeft="1px solid #E3E8EE">
                    <Text fontWeight="black" fontSize="lg" color="#0A80DB" fontFamily="heading">
                      {leads.filter(l => l.status === 'COMPLETED').length}
                    </Text>
                    <Text fontSize="10px" color="slate.400" fontWeight="700" textTransform="uppercase" letterSpacing="wider" fontFamily="heading">completed</Text>
                  </Box>
                </HStack>
              </Flex>
            </Box>
          </Box>

          {/* ── Title Row ── */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg" fontWeight="black" color="slate.900" fontFamily="heading">My Bookings</Heading>
              <Text color="slate.500" fontSize="sm" mt={1}>
                {leads.filter(l => !['COMPLETED', 'CANCELLED'].includes(l.status)).length === 1
                  ? '1 active booking'
                  : `${leads.filter(l => !['COMPLETED', 'CANCELLED'].includes(l.status)).length} active bookings`}
              </Text>
            </Box>
            <Button
              bg={showForm ? 'slate.100' : 'brand.500'} color={showForm ? 'slate.700' : 'white'}
              borderRadius="4px" fontWeight="bold" fontSize="sm" px={5}
              _hover={{ bg: showForm ? 'slate.200' : 'brand.600' }}
              transition="background 0.15s"
              onClick={() => { setShowForm(v => !v); if (showForm) setForm(emptyForm); }}>
              <Icon as={showForm ? LucideX : LucidePlus} w={4} h={4} mr={2} />
              {showForm ? 'Discard request' : 'Book a cleaning'}
            </Button>
          </Flex>

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
                  <Box border="1px solid #E3E8EE" p={16} textAlign="center" bg="white">
                    <Text fontSize="4xl" mb={3}>🧹</Text>
                    <Text color="slate.600" fontWeight="bold" fontSize="lg">No active bookings yet</Text>
                    <Text color="slate.400" fontSize="sm" mt={1}>
                      {historyLeads.length > 0
                        ? "All your bookings are wrapped up. Check your history below."
                        : 'Ready for a sparkling home? Hit "Book a cleaning" to get started.'}
                    </Text>
                  </Box>
                ) : (
                  <VStack gap={3} align="stretch">
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
                      const accentColor = lead.status === 'COMPLETED' ? '#10B981' : lead.status === 'CANCELLED' ? '#EF4444' : lead.status === 'ACCEPTED' ? '#0A80DB' : '#F59E0B';

                      return (
                          <Box
                            key={lead.id}
                            position="relative"
                            bg="white" border="1px solid #E3E8EE"
                            overflow="hidden"
                            transition="background 0.15s">
                            {/* Left accent strip */}
                            <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accentColor} />

                            {/* Card body */}
                            <Box p={5}>
                              <Flex justify="space-between" align="start" gap={4}>
                                <VStack align="start" gap={2.5} flex={1} minW={0}>

                                  <HStack gap={2} flexWrap="wrap">
                                    <Text style={{ borderRadius: 2, background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '2px 8px', fontSize: '10px', fontWeight: 700, display: 'inline-block' }}>
                                      {s.label}
                                    </Text>
                                    <Text fontWeight="bold" fontSize="sm" color="slate.800" fontFamily="heading">{lead.serviceType}</Text>
                                    {lead.isInstantBook && (
                                      <Text style={{ borderRadius: 2, background: '#FEF9C3', color: '#854D0E', border: '1px solid #FDE68A', padding: '2px 6px', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        ⚡ Instant
                                      </Text>
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
                                    <HStack gap={3} flexWrap="wrap">
                                      {lead.bedrooms && <Text fontSize="xs" color="slate.600">🛏 {lead.bedrooms}bd</Text>}
                                      {lead.bathrooms && <Text fontSize="xs" color="slate.600">🚿 {lead.bathrooms}ba</Text>}
                                      {(lead.squareMeters ?? 0) > 0 && <Text fontSize="xs" color="slate.600">📐 {Math.round((lead.squareMeters ?? 0) * 10.764)} sq ft</Text>}
                                      {freqLabel && freqLabel !== 'One-time' && (
                                        <Text style={{ borderRadius: 2, background: '#F6F9FC', padding: '2px 6px', fontSize: '9.5px', fontWeight: 700, color: '#0A80DB' }}>
                                          🔄 {freqLabel}
                                        </Text>
                                      )}
                                    </HStack>
                                  )}

                                  {lead.estimatedMinPrice && (
                                    <HStack gap={4}>
                                      <HStack gap={1} color="#0A80DB" fontSize="sm">
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
                                        <HStack gap={1.5} fontSize="sm" bg="#F6F9FC" px={3} py={1}
                                          border="1px solid #E3E8EE" color="#0A80DB">
                                          <Icon as={LucideCheckCircle} w={4} h={4} />
                                          <Text fontWeight="semibold">{lead.cleaner.name}</Text>
                                        </HStack>
                                        <Button size="xs" variant="outline" borderColor="slate.200" color="slate.600"
                                          borderRadius="4px" fontWeight="semibold"
                                          _hover={{ bg: 'brand.50', borderColor: 'brand.200', color: 'brand.600' }}
                                          onClick={() => router.push(`/dashboard/profile/${lead.cleanerId}`)}>
                                          <Icon as={LucideExternalLink} w={3} h={3} mr={1} />
                                          View profile
                                        </Button>
                                        {acceptedConv && (
                                          <Button size="xs" bg="brand.500" color="white" borderRadius="4px" fontWeight="bold"
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
                                          ? '1 cleaner is ready — accept or decline below:'
                                          : `${activeConvs.length} cleaners are ready — choose the one you prefer:`}
                                      </Text>
                                      <VStack align="start" gap={2}>
                                        {activeConvs.map(conv => (
                                          <HStack key={conv.id} gap={2} bg="#F6F9FC" px={3} py={2}
                                            border="1px solid #E3E8EE">
                                            <Box w="28px" h="28px" borderRadius="full" flexShrink={0}
                                              overflow="hidden" bg="brand.500"
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
                                                <Icon as={LucideShieldCheck} w={4} h={4} color="#0A80DB" aria-label="Verified" />
                                              )}
                                            </HStack>
                                            <Button size="xs" variant="outline" borderColor="slate.200" color="slate.600"
                                              borderRadius="4px" fontWeight="semibold"
                                              _hover={{ bg: 'brand.50', borderColor: 'brand.200', color: 'brand.600' }}
                                              onClick={() => router.push(`/dashboard/profile/${conv.cleaner.id}`)}>
                                              <Icon as={LucideExternalLink} w={3} h={3} mr={1} />
                                              View profile
                                            </Button>
                                            <Button size="xs" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                                              _hover={{ bg: '#0870C2' }}
                                              loading={accepting === conv.id}
                                              onClick={() => handleAccept(conv.id)}>
                                              <Icon as={LucideCheckCircle} w={3} h={3} mr={1} />
                                              Accept this cleaner
                                            </Button>
                                            <Button size="xs" variant="outline" color="red.500" borderColor="red.200"
                                              borderRadius="4px" fontWeight="bold"
                                              _hover={{ bg: 'red.50' }}
                                              loading={declining === conv.id}
                                              onClick={() => handleDecline(conv.id)}>
                                              <Icon as={LucideThumbsDown} w={3} h={3} mr={1} />
                                              Not a fit
                                            </Button>
                                          </HStack>
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
                                    <HStack gap={1.5} bg="#F6F9FC" px={3} py={1.5}
                                      border="1px solid #FDE68A">
                                      {[1,2,3,4,5].map(st => (
                                        <Icon key={st} as={LucideStar} w={4} h={4}
                                          color={lead.review!.rating >= st ? '#F59E0B' : '#E5E7EB'}
                                          fill={lead.review!.rating >= st ? '#F59E0B' : 'none'} />
                                      ))}
                                      <Text fontSize="xs" color="#0A80DB" fontWeight="semibold">Rated</Text>
                                    </HStack>
                                  )}

                                </VStack>

                                <Text fontSize="xs" color="slate.400" whiteSpace="nowrap">
                                  {new Date(lead.createdAt).toLocaleDateString('en-US')}
                                </Text>
                              </Flex>
                            </Box>

                            {/* ── Action Bar ── */}
                            {(canCancel || canTerminate || canRate || canReactivate || (isActive && !timeHasPassed)) && (
                              <Box borderTop="1px solid #F1F5F9" px={5} py={3}>
                                <Flex gap={2} align="center" flexWrap="wrap">

                                  {/* Edit */}
                                  {isActive && !timeHasPassed && ['NEW','WAVE1','WAVE2','WAVE3','UNMATCHED'].includes(lead.status) && (
                                    <Button size="sm" variant="outline" borderColor="slate.200" color="slate.600"
                                      borderRadius="4px" fontWeight="semibold"
                                      _hover={{ bg: 'slate.50', borderColor: 'brand.300', color: 'brand.600' }}
                                      transition="background 0.15s"
                                      disabled={saving}
                                      onClick={() => editingId === lead.id ? setEditingId(null) : openEdit(lead)}>
                                      <Icon as={editingId === lead.id ? LucideChevronUp : LucidePencil} w={4} h={4} mr={1.5} />
                                      {editingId === lead.id ? 'Close editor' : 'Edit booking'}
                                    </Button>
                                  )}

                                  {/* Cancel */}
                                  {canCancel && confirmCancel !== lead.id && (
                                    <Button size="sm" variant="outline" borderColor="red.200" color="red.500"
                                      borderRadius="4px" fontWeight="semibold"
                                      _hover={{ bg: 'red.50' }} transition="background 0.15s"
                                      onClick={() => setConfirmCancel(lead.id)}>
                                      ✕ Cancel this booking
                                    </Button>
                                  )}

                                  {/* Cancel confirmation */}
                                  {confirmCancel === lead.id && (
                                    <HStack gap={2} bg="#FEF2F2" px={3} py={2} border="1px solid #FECACA">
                                      <Text fontSize="sm" color="red.600" fontWeight="semibold">Cancel this booking?</Text>
                                      <Button size="xs" bg="red.500" color="white" borderRadius="4px"
                                        loading={cancelling === lead.id}
                                        onClick={() => handleCancel(lead.id)}>Yes, cancel</Button>
                                      <Button size="xs" variant="ghost" color="slate.500"
                                        onClick={() => setConfirmCancel(null)}>Keep it</Button>
                                    </HStack>
                                  )}

                                  {/* Reactivate */}
                                  {canReactivate && (
                                    <Button size="sm" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                                      _hover={{ bg: '#0870C2' }} transition="background 0.15s"
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
                                      {reactivateId === lead.id ? 'Close' : 'Reschedule and reactivate'}
                                    </Button>
                                  )}

                                  {/* Terminate */}
                                  {canTerminate && confirmComplete !== lead.id && (
                                    <Button size="sm" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                                      _hover={{ bg: '#0870C2' }}
                                      transition="background 0.15s"
                                      onClick={() => setConfirmComplete(lead.id)}>
                                      <Icon as={LucideCheckCircle} w={4} h={4} mr={1.5} />
                                      Mark as complete
                                    </Button>
                                  )}

                                  {/* Terminate confirmation */}
                                  {confirmComplete === lead.id && (
                                    <HStack gap={2} bg="#F6F9FC" px={3} py={2} border="1px solid #E3E8EE">
                                      <Text fontSize="sm" color="#0A80DB" fontWeight="semibold">All done with this cleaning?</Text>
                                      <Button size="xs" bg="#0A80DB" color="white" borderRadius="4px"
                                        loading={completing === lead.id}
                                        onClick={() => handleComplete(lead.id)}>Yes, mark complete</Button>
                                      <Button size="xs" variant="ghost" color="slate.500"
                                        onClick={() => setConfirmComplete(null)}>Not yet</Button>
                                    </HStack>
                                  )}

                                  {/* Rate */}
                                  {canRate && (
                                    <Button size="sm" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                                      _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                                      onClick={() => setRatingLead(lead)}>
                                      <Icon as={LucideStar} w={4} h={4} mr={1.5} />
                                      Rate professional
                                    </Button>
                                  )}

                                </Flex>
                              </Box>
                            )}

                            {/* ── Reactivate Form (inline) ── */}
                            {reactivateId === lead.id && (
                              <Box borderTop="1px solid #FED7AA" bg="#FFF7ED" p={5}>
                                <Text fontSize="sm" fontWeight="bold" color="#0A80DB" mb={4}>🔄 Pick a new date and time</Text>
                                <VStack gap={3} align="stretch">
                                  <HStack gap={3}>
                                    <Input type="date" value={reactivateDate}
                                      onChange={e => setReactivateDate(e.target.value)}
                                      bg="white" borderRadius="4px" h="11" flex={1}
                                      border="1px solid" borderColor="#E3E8EE"
                                      min={new Date().toISOString().split('T')[0]} />
                                    <Input type="time" value={reactivateTime}
                                      onChange={e => setReactivateTime(e.target.value)}
                                      bg="white" borderRadius="4px" h="11" flex={1}
                                      border="1px solid" borderColor="#E3E8EE" />
                                  </HStack>
                                  <HStack gap={3} justify="flex-end">
                                    <Button size="sm" variant="ghost" color="slate.500" onClick={() => setReactivateId(null)}>Discard</Button>
                                    <Button size="sm" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                                      _hover={{ bg: '#0870C2' }} loading={reactivating} loadingText="Reactivating…"
                                      onClick={() => handleReactivate(lead.id)}>
                                      <Icon as={LucideRotateCcw} w={4} h={4} mr={1.5} />
                                      Confirm new date
                                    </Button>
                                  </HStack>
                                </VStack>
                              </Box>
                            )}

                            {/* ── Edit Form (inline) ── */}
                            {editingId === lead.id && (
                              <Box borderTop="1px solid #E3E8EE" bg="#F6F9FC" p={5}>
                                <Text fontSize="sm" fontWeight="bold" color="brand.700" mb={4}>✏️ Update your booking details</Text>
                                <VStack gap={4} align="stretch">
                                  <SimpleGrid columns={2} gap={3}>
                                    {SERVICE_TYPES.map(sv => (
                                      <Box key={sv.id} as="button" p={3}
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
                                  <AddressInput
                                    value={editForm.address}
                                    onChange={v => setEditField('address', v)}
                                    placeholder="123 Main St, City, ST 00000"
                                    inputProps={{ bg: 'white', borderRadius: '4px', h: '11', border: '1px solid', borderColor: 'slate.200' }}
                                  />
                                  <HStack gap={3}>
                                    <Input type="date" value={editForm.date}
                                      onChange={e => setEditField('date', e.target.value)}
                                      bg="white" borderRadius="4px" h="11" flex={1} border="1px solid" borderColor="slate.200" />
                                    <Input type="time" value={editForm.time}
                                      onChange={e => setEditField('time', e.target.value)}
                                      bg="white" borderRadius="4px" h="11" flex={1} border="1px solid" borderColor="slate.200" />
                                  </HStack>
                                  <HStack gap={3} justify="flex-end">
                                    <Button size="sm" variant="ghost" color="slate.500" onClick={() => setEditingId(null)}>Discard changes</Button>
                                    <Button size="sm" bg="brand.500" color="white" borderRadius="4px" fontWeight="bold"
                                      _hover={{ bg: 'brand.600' }} loading={saving} loadingText="Saving…"
                                      onClick={() => handleSaveEdit(lead.id)}>
                                      Save booking changes
                                    </Button>
                                  </HStack>
                                </VStack>
                              </Box>
                            )}

                          </Box>
                      );
                    })}
                  </VStack>
                )}

                {/* ── History Section ── */}
                {historyLeads.length > 0 && (
                  <Box border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
                    {/* Section header / toggle */}
                    <Box
                      as="button" w="full" bg="#F6F9FC" px={5} py={3}
                      borderBottom={showHistory ? '1px solid #E3E8EE' : undefined}
                      onClick={() => setShowHistory(v => !v)}
                      display="flex" alignItems="center" justifyContent="space-between"
                      cursor="pointer" _hover={{ bg: '#F1F5F9' }} transition="background 0.12s">
                      <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase"
                        fontFamily="heading" letterSpacing="0.07em">
                        HISTORY ({historyLeads.length})
                      </Text>
                      <Icon as={showHistory ? LucideChevronUp : LucideChevronDown} w={4} h={4} color="#697386" />
                    </Box>

                    {showHistory && (
                      <VStack gap={0} align="stretch">
                        {historyLeads.map((lead, i) => {
                          const s = STATUS_MAP[lead.status] ?? { label: lead.status, bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
                          const scheduledTime = new Date(lead.dateTime);
                          const freqLabel = FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.labelEn;
                          const canRate = lead.status === 'COMPLETED' && lead.cleanerId && !lead.review;
                          const isLast = i === historyLeads.length - 1;
                          const histAccent = lead.status === 'COMPLETED' ? '#10B981' : '#EF4444';
                          return (
                            <Box key={lead.id} position="relative" bg="white"
                              borderBottom={isLast ? undefined : '1px solid #F1F5F9'}>
                              <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={histAccent} />
                              <Box pl={6} pr={5} py={4}>
                                <Flex justify="space-between" align="start" gap={4}>
                                  <VStack align="start" gap={1.5} flex={1} minW={0}>
                                    <HStack gap={2} flexWrap="wrap">
                                      <Text style={{ borderRadius: 2, background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>
                                        {s.label}
                                      </Text>
                                      <Text fontWeight="bold" fontSize="sm" color="slate.700" fontFamily="heading">{lead.serviceType}</Text>
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
                                      <HStack gap={3} flexWrap="wrap">
                                        {lead.bedrooms && <Text fontSize="xs" color="slate.500">🛏 {lead.bedrooms}bd</Text>}
                                        {lead.bathrooms && <Text fontSize="xs" color="slate.500">🚿 {lead.bathrooms}ba</Text>}
                                        {(lead.squareMeters ?? 0) > 0 && <Text fontSize="xs" color="slate.500">📐 {Math.round((lead.squareMeters ?? 0) * 10.764)} sq ft</Text>}
                                        {freqLabel && freqLabel !== 'One-time' && <Text style={{ borderRadius: 2, background: '#F6F9FC', padding: '2px 6px', fontSize: '9.5px', fontWeight: 700, color: '#0A80DB' }}>🔄 {freqLabel}</Text>}
                                      </HStack>
                                    )}
                                    {lead.estimatedMinPrice && (
                                      <HStack gap={1} color="slate.400" fontSize="xs">
                                        <Icon as={LucideBanknote} w={3.5} h={3.5} />
                                        <Text>${lead.estimatedMinPrice} – ${lead.estimatedMaxPrice}</Text>
                                      </HStack>
                                    )}
                                    {lead.review && (
                                      <HStack gap={1} bg="#F6F9FC" px={2.5} py={1} border="1px solid #FDE68A">
                                        {[1,2,3,4,5].map(st => (
                                          <Icon key={st} as={LucideStar} w={3} h={3}
                                            color={lead.review!.rating >= st ? '#F59E0B' : '#E5E7EB'}
                                            fill={lead.review!.rating >= st ? '#F59E0B' : 'none'} />
                                        ))}
                                        <Text fontSize="xs" color="#0A80DB" fontWeight="semibold" ml={0.5}>Rated</Text>
                                      </HStack>
                                    )}
                                    {canRate && (
                                      <Button size="xs" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                                        _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                                        onClick={() => setRatingLead(lead)}>
                                        <Icon as={LucideStar} w={3} h={3} mr={1} />
                                        Rate professional
                                      </Button>
                                    )}
                                  </VStack>
                                  <Text fontSize="xs" color="slate.400" whiteSpace="nowrap">
                                    {new Date(lead.createdAt).toLocaleDateString('en-US')}
                                  </Text>
                                </Flex>
                              </Box>
                            </Box>
                          );
                        })}
                      </VStack>
                    )}
                  </Box>
                )}
              </>
            );
          })()}

        </VStack>
      </Box>

      {/* ── Rating Modal ── */}
      <AnimatePresence>
        {ratingLead && (
          <motion.div key="rating-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={() => setRatingLead(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px', margin: '0 16px' }}>
              <Box bg="white" border="1px solid #E3E8EE" p={8}
                style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.14)' }}>
                <VStack gap={5} align="center" textAlign="center">
                  <Box w="48px" h="48px" bg="#F6F9FC" border="1px solid #FDE68A"
                    display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="2xl">⭐</Text>
                  </Box>
                  <Box>
                    <Heading size="md" fontWeight="black" color="slate.900" fontFamily="heading">How did it go?</Heading>
                    <Text color="slate.500" fontSize="sm" mt={1}>
                      Share your experience with {ratingLead.cleaner?.name ?? 'your cleaner'}
                    </Text>
                  </Box>
                  <StarRating value={starValue} onChange={setStarValue} />
                  <Text fontSize="xs" color="slate.400">
                    {starValue === 0 ? 'Tap a star to share your rating' : ['','Poor','Fair','Good','Great','Excellent!'][starValue]}
                  </Text>
                  <Textarea
                    placeholder="Leave a comment — e.g. punctual, thorough, very friendly"
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    bg="slate.50" border="1px solid" borderColor="slate.200"
                    borderRadius="4px" rows={3} fontSize="sm"
                    _focus={{ borderColor: 'brand.300', bg: 'white' }}
                    resize="none"
                  />
                  <HStack gap={3} w="full">
                    <Button flex={1} variant="outline" borderColor="slate.200" color="slate.500"
                      borderRadius="4px" onClick={() => setRatingLead(null)}>
                      Maybe later
                    </Button>
                    <Button flex={1} bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                      _hover={{ bg: '#0870C2' }}
                      loading={sendingRating} loadingText="Submitting…"
                      onClick={handleSubmitRating} disabled={starValue === 0}>
                      Submit my review
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
    <Box bg="white" border="1px solid #E3E8EE">
      {/* Form header */}
      <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
        <Flex justify="space-between" align="center">
          <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase"
            letterSpacing="0.07em" fontFamily="heading">
            NEW BOOKING REQUEST
          </Text>
          <Button size="sm" variant="ghost" color="slate.400" onClick={onCancel} borderRadius="4px" minW={0} px={1.5}>
            <Icon as={LucideX} w={4} h={4} />
          </Button>
        </Flex>
      </Box>

      <Box p={6}>
        {/* Progress */}
        <Box mb={6}>
          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="bold" color="slate.700">
              {progress < 100 ? `${progress}% complete` : (
                <HStack gap={1.5} as="span"><Icon as={LucideSparkles} w={4} h={4} color="#0A80DB" /><Text as="span" color="#0A80DB">Ready!</Text></HStack>
              )}
            </Text>
            <Text fontSize="sm" fontWeight="black" color='#0A80DB'>{progress}%</Text>
          </Flex>
          <Box bg="slate.100" h="6px" overflow="hidden">
            <motion.div style={{ height: '100%', background: progress === 100 ? '#22C55E' : '#0A80DB' }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
          </Box>
        </Box>

        <form onSubmit={onSubmit}>
          <VStack gap={6} align="stretch">
            {/* Service type */}
            <Box>
              <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase" mb={3}
                letterSpacing="0.07em" fontFamily="heading">Service type</Text>
              <SimpleGrid columns={2} gap={3}>
                {SERVICE_TYPES.map(s => (
                  <Box key={s.id} as="button" w="full" p={3.5} textAlign="left"
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
                ))}
              </SimpleGrid>
            </Box>

            {/* Property size */}
            <Box>
              <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase" mb={4}
                letterSpacing="0.07em" fontFamily="heading">Property size</Text>
              <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
                <Box><Text fontSize="sm" color="slate.600" mb={2} fontWeight="medium">🛏 Bedrooms</Text><Stepper value={form.bedrooms} onChange={v => setField('bedrooms', v)} /></Box>
                <Box><Text fontSize="sm" color="slate.600" mb={2} fontWeight="medium">🚿 Bathrooms</Text><Stepper value={form.bathrooms} onChange={v => setField('bathrooms', v)} /></Box>
                <Box>
                  <Text fontSize="sm" color="slate.600" mb={2} fontWeight="medium">📐 Area (sq ft)</Text>
                  <Input type="number" placeholder="e.g. 900" value={form.squareMeters || ''}
                    onChange={e => setField('squareMeters', Number(e.target.value))}
                    bg="slate.50" border="1px solid" borderColor={form.squareMeters > 0 ? 'brand.300' : 'slate.200'}
                    h="10" borderRadius="4px" fontSize="sm"
                    _focus={{ bg: 'white', borderColor: 'brand.400' }} transition="all 0.15s" />
                </Box>
              </SimpleGrid>
            </Box>

            {/* Add-ons */}
            <Box>
              <HStack gap={2} mb={3}>
                <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase"
                  letterSpacing="0.07em" fontFamily="heading">Add-ons</Text>
                <Text fontSize="xs" color="slate.400">(optional)</Text>
              </HStack>
              <SimpleGrid columns={2} gap={3}>
                {EXTRAS.map(ex => {
                  const sel = form.extras.includes(ex.id);
                  return (
                    <Box key={ex.id} as="button" w="full" p={3} textAlign="left"
                      border="2px solid" borderColor={sel ? 'slate.300' : 'slate.200'}
                      bg={sel ? 'slate.50' : 'white'} cursor="pointer"
                      onClick={() => toggleExtra(ex.id)} transition="all 0.15s">
                      <Flex justify="space-between" align="center">
                        <HStack gap={2}><Text fontSize="lg">{ex.icon}</Text><Box><Text fontSize="xs" fontWeight="bold" color={sel ? 'slate.700' : 'slate.700'}>{ex.labelEn}</Text><Text fontSize="xs" color="slate.400">+${ex.price}</Text></Box></HStack>
                        <Box w="16px" h="16px" bg={sel ? 'slate.300' : 'slate.200'} display="flex" alignItems="center" justifyContent="center" transition="all 0.15s">
                          {sel && <Text fontSize="9px" color="white" fontWeight="black">✓</Text>}
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>

            {/* Frequency */}
            <Box>
              <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase" mb={3}
                letterSpacing="0.07em" fontFamily="heading">Frequency</Text>
              <SimpleGrid columns={3} gap={3}>
                {FREQUENCY_OPTIONS.map(f => (
                  <Box key={f.id} as="button" w="full" p={3} textAlign="center"
                    border="2px solid" borderColor={form.frequency === f.id ? '#0A80DB' : 'slate.200'}
                    bg={form.frequency === f.id ? '#F8FAFC' : 'white'} cursor="pointer"
                    onClick={() => setField('frequency', f.id)} transition="all 0.15s">
                    <Text fontSize="sm" fontWeight="bold" color={form.frequency === f.id ? '#0A80DB' : 'slate.700'}>{f.labelEn}</Text>
                    {f.tag && <Text fontSize="10px" color="#0A80DB" fontWeight="bold">{f.tag}</Text>}
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            {/* Location & date */}
            <Box>
              <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase" mb={4}
                letterSpacing="0.07em" fontFamily="heading">Location & date</Text>
              <VStack gap={4} align="stretch">
                <AddressInput
                  value={form.address}
                  onChange={v => setField('address', v)}
                  placeholder="123 Main St, Miami, FL 33101"
                  inputProps={{
                    bg: 'slate.50', border: '1px solid',
                    borderColor: form.address ? 'brand.300' : 'slate.200',
                    h: '12', borderRadius: '4px', fontSize: 'sm',
                    _focus: { bg: 'white', borderColor: 'brand.400' }, transition: 'all 0.15s',
                  }}
                />
                <HStack gap={4}>
                  <Input type="date" value={form.date} onChange={e => setField('date', e.target.value)}
                    bg="slate.50" border="1px solid" borderColor={form.date ? 'brand.300' : 'slate.200'} h="12" borderRadius="4px" fontSize="sm" flex={1}
                    _focus={{ bg: 'white', borderColor: 'brand.400' }} transition="all 0.15s" required />
                  <Input type="time" value={form.time} onChange={e => setField('time', e.target.value)}
                    bg="slate.50" border="1px solid" borderColor={form.time ? 'brand.300' : 'slate.200'} h="12" borderRadius="4px" fontSize="sm" flex={1}
                    _focus={{ bg: 'white', borderColor: 'brand.400' }} transition="all 0.15s" required />
                </HStack>
                <textarea value={form.notes} onChange={e => setField('notes', e.target.value)}
                  placeholder="Any special instructions or notes for the cleaner (optional)" rows={2}
                  style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '12px 16px',
                    width: '100%', fontSize: '14px', color: '#1F2937', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
              </VStack>
            </Box>

            {/* Estimate */}
            {estimate && (
              <Box bg="#F6F9FC" border="1px solid #E3E8EE" p={5} style={{ borderRadius: 8 }}>
                <HStack gap={2} mb={3}>
                  <Icon as={LucideSparkles} w={4} h={4} color="brand.500" />
                  <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase"
                    letterSpacing="0.07em" fontFamily="heading">
                    Estimate — {serviceLabel}
                  </Text>
                  {estimate.discountPct > 0 && (
                    <Text style={{ borderRadius: 2, background: '#F6F9FC', padding: '2px 6px', fontSize: '9.5px', fontWeight: 700, color: '#0A80DB' }}>
                      -{estimate.discountPct}%
                    </Text>
                  )}
                </HStack>
                <Flex gap={6} align="center" flexWrap="wrap">
                  <HStack gap={2}>
                    <Icon as={LucideBanknote} w={5} h={5} color="#0A80DB" />
                    <Box><Text fontSize="xs" color="slate.500">Price</Text><Text fontSize="xl" fontWeight="black" color="#0A80DB" fontFamily="heading">${estimate.minPrice} – ${estimate.maxPrice}</Text></Box>
                  </HStack>
                  <HStack gap={2}>
                    <Icon as={LucideClock} w={5} h={5} color="brand.500" />
                    <Box><Text fontSize="xs" color="slate.500">Duration</Text><Text fontSize="xl" fontWeight="black" color="brand.700" fontFamily="heading">~{estimate.hours}h</Text></Box>
                  </HStack>
                </Flex>
                <Text fontSize="xs" color="slate.400" mt={3}>* This is an estimate to help your cleaner prepare. The final price may vary slightly.</Text>
              </Box>
            )}

            <Button type="submit" bg='#0A80DB' color="white"
              h="12" borderRadius="4px" fontWeight="bold" fontSize="md"
              _hover={{ bg: '#0870C2' }}
              transition="background 0.15s" loading={submitting} loadingText="Submitting…">
              {progress === 100 ? '✓ Submit booking request' : 'Submit booking request'}
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
