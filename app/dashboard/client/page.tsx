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
  LucideUsers, LucideRepeat2, LucideBookmark,
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

type ConvEntry = { id: string; cleanerId: string; status: string; feeStatus: string; cleaner: { id: string; name: string; avatarUrl?: string | null; isVerified?: boolean } };
type Lead = {
  id: string; serviceType: string; address: string; dateTime: string;
  status: string; notes?: string; createdAt: string;
  cleanerId?: string | null;
  bedrooms?: number; bathrooms?: number; squareMeters?: number;
  extras?: string[]; frequency?: string; photos?: string[];
  estimatedMinPrice?: number; estimatedMaxPrice?: number; estimatedHours?: number;
  isInstantBook?: boolean;
  cleaner?: { name: string; email: string; avatarUrl?: string | null } | null;
  conversations?: ConvEntry[];
  review?: { rating: number; comment?: string } | null;
};
type ClientProfile = { name: string | null; email: string; phone: string | null; avatarUrl: string | null; createdAt: string };

const emptyForm = {
  serviceType: 'standard', bedrooms: 1, bathrooms: 1, squareMeters: 0,
  extras: [] as string[], frequency: 'once',
  address: '', date: '', time: '', notes: '',
};

const CANCEL_REASONS = [
  'Changed my plans',
  'Found a different cleaner',
  'Wrong date or time',
  'Address issue',
  'Price concerns',
  'Other',
];

/* ─── Helpers ─────────────────────────────────────────────────── */
function formatPhone(raw: string | null): string {
  if (!raw) return '';
  const d = raw.replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length === 11 && d[0] === '1') return `+1 (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  return raw;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// YYYY-MM-DD → MM/DD/YYYY for overlay display
function isoDateToUs(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

function getStatusStep(status: string): number {
  if (['NEW'].includes(status))                            return 0;
  if (['WAVE1', 'WAVE2', 'WAVE3', 'UNMATCHED'].includes(status)) return 1;
  if (status === 'IN_REVIEW')                              return 2;
  if (status === 'ACCEPTED')                               return 3;
  if (status === 'COMPLETED')                              return 4;
  return 0;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Now';
  const totalMinutes = Math.floor(ms / 60000);
  const days  = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins  = totalMinutes % 60;
  if (days > 0)  return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function getNextCycleDate(dateTime: string, frequency: string): Date | null {
  const dt  = new Date(dateTime);
  const now = new Date();
  if (frequency === 'once' || dt > now) return null;
  const ms: Record<string, number> = { weekly: 7*864e5, biweekly: 14*864e5, monthly: 30*864e5 };
  const interval = ms[frequency];
  if (!interval) return null;
  let next = new Date(dt);
  while (next <= now) next = new Date(next.getTime() + interval);
  return next;
}

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

/* ─── Status Timeline ─────────────────────────────────────────── */
function StatusTimeline({ status }: { status: string }) {
  const step   = getStatusStep(status);
  const labels = ['Requested', 'Matching', 'Ready', 'Confirmed'];
  return (
    <Box w="full" pt={1} pb={3}>
      <Flex align="center" w="full" gap={0}>
        {labels.map((label, i) => (
          <Box key={i} flex={1} position="relative">
            <Flex align="center">
              <Box
                w="8px" h="8px" borderRadius="full" flexShrink={0}
                bg={i <= step ? '#0A80DB' : '#E3E8EE'}
                style={{ outline: `2px solid ${i <= step ? 'rgba(10,128,219,0.18)' : 'transparent'}`, outlineOffset: 1 }}
              />
              {i < labels.length - 1 && (
                <Box flex={1} h="1.5px" bg={i < step ? '#0A80DB' : '#E3E8EE'} />
              )}
            </Flex>
            <Text
              position="absolute" top="12px" left="-6px"
              fontSize="8.5px" fontWeight={i === step ? 700 : 400}
              color={i <= step ? '#0A80DB' : '#94A3B8'}
              whiteSpace="nowrap" userSelect="none">
              {label}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

/* ─── Avatar ──────────────────────────────────────────────────── */
function Avatar({ name, src, size = 28 }: { name: string; src?: string | null; size?: number }) {
  return (
    <Box
      w={`${size}px`} h={`${size}px`} borderRadius="full" flexShrink={0}
      overflow="hidden" bg="brand.500"
      display="flex" alignItems="center" justifyContent="center"
      color="white" fontSize={`${Math.round(size * 0.38)}px`} fontWeight="black">
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : name[0]?.toUpperCase()}
    </Box>
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

  /* Edit state */
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editForm, setEditForm]     = useState(emptyForm);

  /* Actions in flight */
  const [cancelling, setCancelling]   = useState<string | null>(null);
  const [completing, setCompleting]   = useState<string | null>(null);
  const [declining, setDeclining]     = useState<string | null>(null);
  const [accepting, setAccepting]     = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [rebooking, setRebooking]     = useState<string | null>(null);

  /* Rating modal */
  const [ratingLead, setRatingLead]       = useState<Lead | null>(null);
  const [starValue, setStarValue]         = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [sendingRating, setSendingRating] = useState(false);

  /* Cancel reason modal */
  const [cancelReasonModal, setCancelReasonModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason]           = useState('');

  /* Confirm complete */
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);

  /* History toggle */
  const [showHistory, setShowHistory] = useState(false);

  /* Reactivation */
  const [reactivateId, setReactivateId]     = useState<string | null>(null);
  const [reactivateDate, setReactivateDate] = useState('');
  const [reactivateTime, setReactivateTime] = useState('');
  const [reactivating, setReactivating]     = useState(false);

  /* Address book (localStorage) */
  const [addressBook, setAddressBook] = useState<string[]>([]);

  /* ── data fetching ── */
  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) setLeads((await res.json()).leads ?? []);
    } catch { /* keep current state on network error */ }
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

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bc_address_book') ?? '[]');
      if (Array.isArray(saved)) setAddressBook(saved);
    } catch {}
  }, []);

  /* ── computed ── */
  const setField     = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm(f => ({ ...f, [key]: value }));
  const setEditField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setEditForm(f => ({ ...f, [key]: value }));

  const toggleExtra     = (id: string) =>
    setForm(f => ({ ...f, extras: f.extras.includes(id) ? f.extras.filter(e => e !== id) : [...f.extras, id] }));
  const toggleEditExtra = (id: string) =>
    setEditForm(f => ({ ...f, extras: f.extras.includes(id) ? f.extras.filter(e => e !== id) : [...f.extras, id] }));

  const progress = useMemo(() => {
    const fields = [!!form.address.trim(), !!form.date, !!form.time, form.bedrooms > 0, form.bathrooms > 0, form.squareMeters > 0];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form.address, form.date, form.time, form.bedrooms, form.bathrooms, form.squareMeters]);

  const estimate = useMemo(() => {
    if (form.squareMeters <= 0) return null;
    return calculateEstimate({ serviceType: form.serviceType, bedrooms: form.bedrooms, bathrooms: form.bathrooms, squareMeters: form.squareMeters / 10.764, extras: form.extras, frequency: form.frequency });
  }, [form.serviceType, form.bedrooms, form.bathrooms, form.squareMeters, form.extras, form.frequency]);

  const nextCleaning = useMemo(() => {
    const now = new Date();
    return leads
      .filter(l => l.status === 'ACCEPTED' && new Date(l.dateTime) > now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0] ?? null;
  }, [leads]);

  const totalSpent = useMemo(() =>
    leads.filter(l => l.status === 'COMPLETED').reduce((s, l) => s + (l.estimatedMinPrice ?? 0), 0),
  [leads]);

  const avgRating = useMemo(() => {
    const rated = leads.filter(l => l.review?.rating);
    if (!rated.length) return null;
    return +(rated.reduce((s, l) => s + l.review!.rating, 0) / rated.length).toFixed(1);
  }, [leads]);

  const myCleaners = useMemo(() => {
    const seen = new Set<string>();
    return leads
      .filter(l => l.status === 'COMPLETED' && l.cleanerId && l.cleaner)
      .filter(l => { if (seen.has(l.cleanerId!)) return false; seen.add(l.cleanerId!); return true; })
      .map(l => ({
        id:        l.cleanerId!,
        name:      l.cleaner!.name,
        avatarUrl: l.cleaner!.avatarUrl ?? null,
        convId:    (l.conversations ?? []).find(c => c.cleanerId === l.cleanerId)?.id ?? null,
      }));
  }, [leads]);

  /* ── save address ── */
  const saveAddress = useCallback((addr: string) => {
    if (!addr?.trim() || addressBook.includes(addr)) return;
    const updated = [addr, ...addressBook].slice(0, 3);
    setAddressBook(updated);
    try { localStorage.setItem('bc_address_book', JSON.stringify(updated)); } catch {}
  }, [addressBook]);

  /* ── submit new ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address || !form.date || !form.time) {
      toaster.create({ title: 'Please fill in the address, date, and time.', type: 'error' }); return;
    }
    setSubmitting(true);
    try {
      const dateTime     = new Date(`${form.date}T${form.time}`).toISOString();
      const serviceLabel = SERVICE_TYPES.find(s => s.id === form.serviceType)?.labelEn ?? form.serviceType;
      const res = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: serviceLabel, address: form.address, notes: form.notes, dateTime,
          bedrooms: form.bedrooms, bathrooms: form.bathrooms,
          squareMeters: form.squareMeters > 0 ? form.squareMeters / 10.764 : 0,
          extras: form.extras, frequency: form.frequency,
          estimatedMinPrice: estimate?.minPrice, estimatedMaxPrice: estimate?.maxPrice, estimatedHours: estimate?.hours }),
      });
      if (res.ok) {
        saveAddress(form.address);
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
    const dt  = new Date(lead.dateTime);
    setEditForm({
      serviceType:  sId,
      bedrooms:     lead.bedrooms ?? 1, bathrooms: lead.bathrooms ?? 1,
      squareMeters: Math.round((lead.squareMeters ?? 0) * 10.764),
      extras:       lead.extras ?? [], frequency: lead.frequency ?? 'once',
      address:      lead.address,
      date:         dt.toISOString().split('T')[0],
      time:         dt.toTimeString().slice(0, 5),
      notes:        lead.notes ?? '',
    });
    setEditingId(lead.id);
  };

  const handleSaveEdit = async (leadId: string) => {
    if (!editForm.address || !editForm.date || !editForm.time) {
      toaster.create({ title: 'Please fill in the address, date, and time.', type: 'error' }); return;
    }
    setSaving(true);
    try {
      const dateTime     = new Date(`${editForm.date}T${editForm.time}`).toISOString();
      const serviceLabel = SERVICE_TYPES.find(s => s.id === editForm.serviceType)?.labelEn ?? editForm.serviceType;
      const sqftToM2     = editForm.squareMeters > 0 ? editForm.squareMeters / 10.764 : 0;
      const est          = sqftToM2 > 0 ? calculateEstimate({ serviceType: editForm.serviceType, bedrooms: editForm.bedrooms, bathrooms: editForm.bathrooms, squareMeters: sqftToM2, extras: editForm.extras, frequency: editForm.frequency }) : null;
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: serviceLabel, address: editForm.address, dateTime, notes: editForm.notes,
          bedrooms: editForm.bedrooms, bathrooms: editForm.bathrooms, squareMeters: sqftToM2,
          extras: editForm.extras, frequency: editForm.frequency,
          estimatedMinPrice: est?.minPrice, estimatedMaxPrice: est?.maxPrice, estimatedHours: est?.hours }),
      });
      if (res.ok) { toaster.create({ title: 'Booking updated!', type: 'success' }); setEditingId(null); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setSaving(false); }
  };

  /* ── cancel with reason ── */
  const handleCancelWithReason = async (leadId: string) => {
    setCancelling(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/cancel`, { method: 'POST' });
      if (res.ok) {
        toaster.create({ title: 'Booking cancelled', description: "You can book again anytime.", type: 'success' });
        setCancelReasonModal(null); setCancelReason(''); fetchLeads();
      } else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setCancelling(null); }
  };

  /* ── complete ── */
  const handleComplete = async (leadId: string) => {
    setCompleting(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/complete`, { method: 'POST' });
      if (res.ok) {
        toaster.create({ title: "Job marked as complete!", description: "Don't forget to leave a rating.", type: 'success' });
        setConfirmComplete(null); fetchLeads();
      } else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setCompleting(null); }
  };

  /* ── decline ── */
  const handleDecline = async (convId: string) => {
    setDeclining(convId);
    try {
      const res = await fetch(`/api/conversations/${convId}/decline`, { method: 'POST' });
      if (res.ok) { toaster.create({ title: "Cleaner declined", description: "We'll keep looking.", type: 'success' }); fetchLeads(); }
      else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setDeclining(null); }
  };

  /* ── accept cleaner ── */
  const handleAccept = async (convId: string) => {
    setAccepting(convId);
    try {
      const res  = await fetch(`/api/conversations/${convId}/confirm`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toaster.create({ title: "Cleaner confirmed!", description: "Opening your chat now.", type: 'success' });
        fetchLeads(); router.push(`/dashboard/chat/${convId}`);
      } else { throw new Error(data.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setAccepting(null); }
  };

  /* ── reactivate ── */
  const handleReactivate = async (leadId: string) => {
    if (!reactivateDate || !reactivateTime) {
      toaster.create({ title: 'Choose a new date and time.', type: 'error' }); return;
    }
    const dateTime = new Date(`${reactivateDate}T${reactivateTime}`);
    if (dateTime <= new Date()) {
      toaster.create({ title: 'The date must be in the future.', type: 'error' }); return;
    }
    setReactivating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/reactivate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTime: dateTime.toISOString() }),
      });
      if (res.ok) {
        toaster.create({ title: "Booking reactivated!", description: "Finding available cleaners.", type: 'success' });
        setReactivateId(null); fetchLeads();
      } else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setReactivating(false); }
  };

  /* ── rebook (same service, no cleaner) ── */
  const handleRebook = async (lead: Lead) => {
    setRebooking(lead.id);
    const nextWeek = new Date(Date.now() + 7 * 864e5).toISOString();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType:       lead.serviceType,
          address:           lead.address,
          notes:             lead.notes ?? '',
          dateTime:          nextWeek,
          bedrooms:          lead.bedrooms,
          bathrooms:         lead.bathrooms,
          squareMeters:      lead.squareMeters,
          extras:            lead.extras ?? [],
          frequency:         lead.frequency ?? 'once',
          estimatedMinPrice: lead.estimatedMinPrice,
          estimatedMaxPrice: lead.estimatedMaxPrice,
          estimatedHours:    lead.estimatedHours,
        }),
      });
      if (res.ok) {
        toaster.create({ title: 'New booking created!', description: "Same service, fresh start — date set to next week.", type: 'success' });
        fetchLeads(); setShowHistory(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else { const err = await res.json(); throw new Error(err.error); }
    } catch (e: any) { toaster.create({ title: e.message, type: 'error' }); }
    finally { setRebooking(null); }
  };

  /* ── review ── */
  const handleSubmitRating = async () => {
    if (!ratingLead || starValue === 0) {
      toaster.create({ title: 'Tap a star to rate your experience.', type: 'error' }); return;
    }
    setSendingRating(true);
    try {
      const res = await fetch(`/api/leads/${ratingLead.id}/review`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: starValue, comment: ratingComment }),
      });
      if (res.ok) {
        toaster.create({ title: 'Thanks for the review!', description: 'Your feedback helps the community.', type: 'success' });
        setRatingLead(null); setStarValue(0); setRatingComment(''); fetchLeads();
      } else { const err = await res.json(); throw new Error(err.error); }
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
          <HStack gap={2}>
            <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <Text fontWeight="700" fontSize={{ base: '13px', sm: '15px' }} letterSpacing="-0.02em" color="white" fontFamily="heading">
              Brazilian<Text as="span" color="brand.400">Clean</Text>
            </Text>
          </HStack>
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
                    <Text fontSize="xs" color="slate.500" mt={0.5}>📱 {formatPhone(profile.phone)}</Text>
                  )}
                </Box>

                {/* Stats */}
                <HStack gap={0} borderLeft="1px solid #E3E8EE" flexShrink={0} flexWrap="wrap">
                  <Box textAlign="center" px={4}>
                    <Text fontWeight="black" fontSize="lg" color="brand.600" fontFamily="heading">{leads.length}</Text>
                    <Text fontSize="10px" color="slate.400" fontWeight="700" textTransform="uppercase" letterSpacing="wider" fontFamily="heading">bookings</Text>
                  </Box>
                  <Box textAlign="center" px={4} borderLeft="1px solid #E3E8EE">
                    <Text fontWeight="black" fontSize="lg" color="#0A80DB" fontFamily="heading">
                      {leads.filter(l => l.status === 'COMPLETED').length}
                    </Text>
                    <Text fontSize="10px" color="slate.400" fontWeight="700" textTransform="uppercase" letterSpacing="wider" fontFamily="heading">completed</Text>
                  </Box>
                  {totalSpent > 0 && (
                    <Box textAlign="center" px={4} borderLeft="1px solid #E3E8EE">
                      <Text fontWeight="black" fontSize="lg" color="slate.800" fontFamily="heading">${totalSpent}</Text>
                      <Text fontSize="10px" color="slate.400" fontWeight="700" textTransform="uppercase" letterSpacing="wider" fontFamily="heading">invested</Text>
                    </Box>
                  )}
                  {avgRating !== null && (
                    <Box textAlign="center" px={4} borderLeft="1px solid #E3E8EE">
                      <Text fontWeight="black" fontSize="lg" color="#F59E0B" fontFamily="heading">{avgRating}★</Text>
                      <Text fontSize="10px" color="slate.400" fontWeight="700" textTransform="uppercase" letterSpacing="wider" fontFamily="heading">avg given</Text>
                    </Box>
                  )}
                </HStack>
              </Flex>
            </Box>
          </Box>

          {/* ── Next Cleaning Countdown ── */}
          {nextCleaning && (() => {
            const diff = new Date(nextCleaning.dateTime).getTime() - Date.now();
            const cleanerConv = (nextCleaning.conversations ?? []).find(c => c.cleanerId === nextCleaning.cleanerId);
            return (
              <Box border="1px solid #E3E8EE" bg="#F8FAFC" px={5} py={4} position="relative" overflow="hidden">
                <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#0A80DB" />
                <Flex justify="space-between" align="center" gap={4} pl={1}>
                  <Box>
                    <Text fontSize="9.5px" fontWeight="700" color="#697386" textTransform="uppercase"
                      letterSpacing="0.1em" fontFamily="heading" mb={1}>
                      Next cleaning
                    </Text>
                    <HStack gap={2} mb={0.5}>
                      {cleanerConv && (
                        <Avatar name={cleanerConv.cleaner.name} src={cleanerConv.cleaner.avatarUrl} size={22} />
                      )}
                      <Text fontWeight="bold" color="slate.900" fontSize="sm" fontFamily="heading">
                        {nextCleaning.serviceType}
                        {nextCleaning.cleaner && (
                          <Text as="span" fontWeight="400" color="slate.500"> with {nextCleaning.cleaner.name}</Text>
                        )}
                      </Text>
                    </HStack>
                    <HStack gap={3} color="slate.500" fontSize="xs">
                      <HStack gap={1}>
                        <Icon as={LucideCalendar} w={3} h={3} />
                        <Text>{fmtDate(nextCleaning.dateTime)}</Text>
                      </HStack>
                      <HStack gap={1}>
                        <Icon as={LucideMapPin} w={3} h={3} />
                        <Text lineClamp={1}>{nextCleaning.address}</Text>
                      </HStack>
                    </HStack>
                  </Box>
                  <Box textAlign="right" flexShrink={0}>
                    <Text fontSize="10px" color="slate.400" fontWeight="600" mb={0.5}>Starts in</Text>
                    <Text fontWeight="black" fontSize="2xl" color="#0A80DB" fontFamily="heading" lineHeight={1}>
                      {formatCountdown(diff)}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            );
          })()}

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
                  addressBook={addressBook}
                  onSelectAddress={(addr: string) => setField('address', addr)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Leads List ── */}
          {(() => {
            const activeLeads  = leads.filter(l => !['COMPLETED', 'CANCELLED'].includes(l.status));
            const historyLeads = leads.filter(l => ['COMPLETED', 'CANCELLED'].includes(l.status));
            return (
              <>
                {/* ── Active leads / empty state ── */}
                {activeLeads.length === 0 ? (
                  <Box border="1px solid #E3E8EE" p={12} textAlign="center" bg="white">
                    <Box fontSize="4xl" mb={4} lineHeight={1}>🧹</Box>
                    <Text fontWeight="black" fontSize="xl" color="slate.900" fontFamily="heading" mb={2}>
                      {historyLeads.length > 0 ? 'All caught up' : 'Your home is waiting'}
                    </Text>
                    <Text color="slate.500" fontSize="sm" maxW="340px" mx="auto" lineHeight="1.6" mb={6}>
                      {historyLeads.length > 0
                        ? "All your bookings are wrapped up. Check your history below, or book again for a fresh clean."
                        : 'Ready for a sparkling home? Book your first cleaning in under 2 minutes.'}
                    </Text>
                    <Button bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold" px={6}
                      _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                      onClick={() => setShowForm(true)}>
                      <Icon as={LucidePlus} w={4} h={4} mr={2} />
                      Book a cleaning
                    </Button>
                    {historyLeads.length > 0 && (
                      <Button variant="ghost" color="slate.500" ml={3} borderRadius="4px" fontWeight="semibold"
                        onClick={() => setShowHistory(v => !v)}>
                        View history
                      </Button>
                    )}
                  </Box>
                ) : (
                  <VStack gap={3} align="stretch">
                    {activeLeads.map((lead) => {
                      const s              = STATUS_MAP[lead.status] ?? { label: lead.status, bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
                      const now            = new Date();
                      const scheduledTime  = new Date(lead.dateTime);
                      const timeHasPassed  = scheduledTime < now;
                      const isActive       = !['COMPLETED', 'CANCELLED'].includes(lead.status);
                      const canCancel      = isActive && !timeHasPassed;
                      const acceptedConv   = (lead.conversations ?? []).find(c => c.cleanerId === lead.cleanerId && c.status === 'active');
                      const feePaid        = acceptedConv?.feeStatus === 'charged' || acceptedConv?.feeStatus === 'waived';
                      const canTerminate   = isActive && timeHasPassed && lead.status === 'ACCEPTED' && feePaid;
                      const canReactivate  = isActive && timeHasPassed && ['NEW', 'WAVE1', 'WAVE2', 'WAVE3', 'UNMATCHED'].includes(lead.status);
                      const canRate        = lead.status === 'COMPLETED' && lead.cleanerId && !lead.review;
                      const freqLabel      = FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.labelEn;
                      const activeConvs    = lead.status === 'IN_REVIEW'
                        ? (lead.conversations ?? []).filter(c => c.status === 'active')
                        : [];
                      const accentColor    = lead.status === 'ACCEPTED' ? '#0A80DB'
                        : lead.status === 'IN_REVIEW' ? '#10B981'
                        : lead.status === 'COMPLETED' ? '#10B981'
                        : lead.status === 'CANCELLED' ? '#EF4444' : '#F59E0B';
                      const cleanerAvatar  = (lead.conversations ?? []).find(c => c.cleanerId === lead.cleanerId)?.cleaner;
                      const nextCycle      = lead.frequency && lead.frequency !== 'once'
                        ? getNextCycleDate(lead.dateTime, lead.frequency)
                        : null;

                      return (
                        <Box
                          key={lead.id}
                          position="relative"
                          bg="white" border="1px solid #E3E8EE"
                          overflow="hidden"
                          transition="background 0.15s">
                          <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accentColor} />

                          {/* Card body */}
                          <Box p={5}>
                            <Flex justify="space-between" align="start" gap={4}>
                              <VStack align="start" gap={2.5} flex={1} minW={0}>

                                {/* Status + service */}
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

                                {/* Status timeline (only for non-terminal active statuses) */}
                                {isActive && !['ACCEPTED', 'IN_REVIEW'].includes(lead.status) && (
                                  <StatusTimeline status={lead.status} />
                                )}

                                {/* Address + date */}
                                <HStack gap={4} flexWrap="wrap">
                                  <HStack gap={1} color="slate.500" fontSize="sm">
                                    <Icon as={LucideMapPin} w={4} h={4} flexShrink={0} />
                                    <Text lineClamp={1}>{lead.address}</Text>
                                    <a
                                      href={`https://maps.google.com/?q=${encodeURIComponent(lead.address)}`}
                                      target="_blank" rel="noopener noreferrer"
                                      style={{ flexShrink: 0 }}>
                                      <Text fontSize="10px" color="#0A80DB" fontWeight="700" _hover={{ textDecoration: 'underline' }}>map ↗</Text>
                                    </a>
                                  </HStack>
                                  <HStack gap={1} color="slate.500" fontSize="sm">
                                    <Icon as={LucideCalendar} w={4} h={4} />
                                    <Text>{fmtDate(lead.dateTime)}</Text>
                                  </HStack>
                                </HStack>

                                {/* Property details */}
                                {(lead.bedrooms || lead.squareMeters) && (
                                  <HStack gap={3} flexWrap="wrap">
                                    {lead.bedrooms && <Text fontSize="xs" color="slate.600">🛏 {lead.bedrooms}bd</Text>}
                                    {lead.bathrooms && <Text fontSize="xs" color="slate.600">🚿 {lead.bathrooms}ba</Text>}
                                    {(lead.squareMeters ?? 0) > 0 && <Text fontSize="xs" color="slate.600">📐 {Math.round((lead.squareMeters ?? 0) * 10.764)} sq ft</Text>}
                                    {freqLabel && freqLabel !== 'One-time' && (
                                      <HStack gap={1}>
                                        <Text style={{ borderRadius: 2, background: '#F6F9FC', padding: '2px 6px', fontSize: '9.5px', fontWeight: 700, color: '#0A80DB' }}>
                                          🔄 {freqLabel}
                                        </Text>
                                        {nextCycle && (
                                          <Text fontSize="9.5px" color="slate.400" fontWeight="600">
                                            · next cycle {nextCycle.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                          </Text>
                                        )}
                                      </HStack>
                                    )}
                                  </HStack>
                                )}

                                {/* Price + hours */}
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

                                {/* Notes */}
                                {lead.notes && (
                                  <Text fontSize="xs" color="slate.500" fontStyle="italic" lineClamp={2}>
                                    "{lead.notes}"
                                  </Text>
                                )}

                                {/* Confirmed cleaner (ACCEPTED) — with avatar */}
                                {lead.cleaner && lead.cleanerId && lead.status === 'ACCEPTED' && (() => {
                                  const acceptedConv = (lead.conversations ?? []).find(c => c.cleanerId === lead.cleanerId && c.status === 'active');
                                  const convCleaner  = cleanerAvatar;
                                  return (
                                    <HStack gap={2} flexWrap="wrap">
                                      <HStack gap={2} bg="#F6F9FC" px={3} py={1.5}
                                        border="1px solid #E3E8EE">
                                        <Avatar
                                          name={lead.cleaner.name}
                                          src={convCleaner?.avatarUrl ?? lead.cleaner.avatarUrl}
                                          size={24}
                                        />
                                        <HStack gap={1}>
                                          <Icon as={LucideCheckCircle} w={3.5} h={3.5} color="#0A80DB" />
                                          <Text fontSize="sm" fontWeight="semibold" color="#0A80DB">{lead.cleaner.name}</Text>
                                        </HStack>
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
                                          border="1px solid #E3E8EE" flexWrap="wrap">
                                          <Avatar name={conv.cleaner.name} src={conv.cleaner.avatarUrl} size={28} />
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
                                            Accept
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

                                {/* Photos */}
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
                                {fmtShortDate(lead.createdAt)}
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

                                {/* Cancel — opens reason modal */}
                                {canCancel && (
                                  <Button size="sm" variant="outline" borderColor="red.200" color="red.500"
                                    borderRadius="4px" fontWeight="semibold"
                                    _hover={{ bg: 'red.50' }} transition="background 0.15s"
                                    onClick={() => { setCancelReasonModal(lead.id); setCancelReason(''); }}>
                                    ✕ Cancel booking
                                  </Button>
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
                                    {reactivateId === lead.id ? 'Close' : 'Reschedule & reactivate'}
                                  </Button>
                                )}

                                {/* Mark complete */}
                                {canTerminate && confirmComplete !== lead.id && (
                                  <Button size="sm" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                                    _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                                    onClick={() => setConfirmComplete(lead.id)}>
                                    <Icon as={LucideCheckCircle} w={4} h={4} mr={1.5} />
                                    Mark as complete
                                  </Button>
                                )}

                                {confirmComplete === lead.id && (
                                  <HStack gap={2} bg="#F6F9FC" px={3} py={2} border="1px solid #E3E8EE">
                                    <Text fontSize="sm" color="#0A80DB" fontWeight="semibold">All done with this cleaning?</Text>
                                    <Button size="xs" bg="#0A80DB" color="white" borderRadius="4px"
                                      loading={completing === lead.id}
                                      onClick={() => handleComplete(lead.id)}>Yes, complete</Button>
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
                              <Text fontSize="sm" fontWeight="bold" color="#0A80DB" mb={4}>Pick a new date and time</Text>
                              <VStack gap={3} align="stretch">
                                <HStack gap={3}>
                                  <Box position="relative" flex={1}>
                                    <Box h="11" bg="white" border="1px solid" borderColor="#E3E8EE"
                                      borderRadius="4px" px={3} display="flex" alignItems="center"
                                      style={{ pointerEvents:'none' }}>
                                      <Text fontSize="sm" color={reactivateDate ? '#0B1120' : '#A0AEC0'}>
                                        {reactivateDate ? isoDateToUs(reactivateDate) : 'MM/DD/YYYY'}
                                      </Text>
                                    </Box>
                                    <input type="date" value={reactivateDate}
                                      onChange={e => setReactivateDate(e.target.value)}
                                      min={new Date().toISOString().split('T')[0]}
                                      style={{ position:'absolute', top:0, left:0, right:0, bottom:0,
                                               opacity:0.01, cursor:'pointer', zIndex:1,
                                               width:'100%', height:'100%' }} />
                                  </Box>
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
                              <Text fontSize="sm" fontWeight="bold" color="brand.700" mb={4}>Update booking details</Text>
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
                                  <Box position="relative" flex={1}>
                                    <Box h="11" bg="white" border="1px solid" borderColor="slate.200"
                                      borderRadius="4px" px={3} display="flex" alignItems="center"
                                      style={{ pointerEvents:'none' }}>
                                      <Text fontSize="sm" color={editForm.date ? '#0B1120' : '#A0AEC0'}>
                                        {editForm.date ? isoDateToUs(editForm.date) : 'MM/DD/YYYY'}
                                      </Text>
                                    </Box>
                                    <input type="date" value={editForm.date}
                                      onChange={e => setEditField('date', e.target.value)}
                                      min={new Date().toISOString().split('T')[0]}
                                      style={{ position:'absolute', top:0, left:0, right:0, bottom:0,
                                               opacity:0.01, cursor:'pointer', zIndex:1,
                                               width:'100%', height:'100%' }} />
                                  </Box>
                                  <Input type="time" value={editForm.time}
                                    onChange={e => setEditField('time', e.target.value)}
                                    bg="white" borderRadius="4px" h="11" flex={1}
                                    border="1px solid" borderColor="slate.200" />
                                </HStack>
                                <HStack gap={3} justify="flex-end">
                                  <Button size="sm" variant="ghost" color="slate.500" onClick={() => setEditingId(null)}>Discard</Button>
                                  <Button size="sm" bg="brand.500" color="white" borderRadius="4px" fontWeight="bold"
                                    _hover={{ bg: 'brand.600' }} loading={saving} loadingText="Saving…"
                                    onClick={() => handleSaveEdit(lead.id)}>
                                    Save changes
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
                  <Box border="1px solid #E3E8EE" overflow="hidden">
                    <Box
                      as="button" w="full" bg="#F6F9FC" px={5} py={3}
                      borderBottom={showHistory ? '1px solid #E3E8EE' : undefined}
                      onClick={() => setShowHistory(v => !v)}
                      display="flex" alignItems="center" justifyContent="space-between"
                      cursor="pointer" _hover={{ bg: '#F1F5F9' }} transition="background 0.12s">
                      <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase"
                        fontFamily="heading" letterSpacing="0.07em">
                        History ({historyLeads.length})
                      </Text>
                      <Icon as={showHistory ? LucideChevronUp : LucideChevronDown} w={4} h={4} color="#697386" />
                    </Box>

                    {showHistory && (
                      <VStack gap={0} align="stretch">
                        {historyLeads.map((lead, i) => {
                          const s            = STATUS_MAP[lead.status] ?? { label: lead.status, bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
                          const scheduledTime = new Date(lead.dateTime);
                          const freqLabel    = FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.labelEn;
                          const canRate      = lead.status === 'COMPLETED' && lead.cleanerId && !lead.review;
                          const isLast       = i === historyLeads.length - 1;
                          const histAccent   = lead.status === 'COMPLETED' ? '#10B981' : '#EF4444';
                          const convCleaner  = (lead.conversations ?? []).find(c => c.cleanerId === lead.cleanerId)?.cleaner;
                          return (
                            <Box key={lead.id} position="relative" bg="white"
                              borderBottom={isLast ? undefined : '1px solid #F1F5F9'}>
                              <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={histAccent} />
                              <Box pl={6} pr={5} py={4}>
                                <Flex justify="space-between" align="start" gap={4}>
                                  <VStack align="start" gap={1.5} flex={1} minW={0}>

                                    {/* Status + service */}
                                    <HStack gap={2} flexWrap="wrap">
                                      <Text style={{ borderRadius: 2, background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>
                                        {s.label}
                                      </Text>
                                      <Text fontWeight="bold" fontSize="sm" color="slate.700" fontFamily="heading">{lead.serviceType}</Text>
                                    </HStack>

                                    {/* Cleaner */}
                                    {lead.cleaner && convCleaner && (
                                      <HStack gap={1.5}>
                                        <Avatar name={lead.cleaner.name} src={convCleaner.avatarUrl} size={20} />
                                        <Text fontSize="xs" color="slate.500" fontWeight="600">{lead.cleaner.name}</Text>
                                      </HStack>
                                    )}

                                    {/* Address + date */}
                                    <HStack gap={4} flexWrap="wrap">
                                      <HStack gap={1} color="slate.400" fontSize="xs">
                                        <Icon as={LucideMapPin} w={3.5} h={3.5} />
                                        <Text lineClamp={1}>{lead.address}</Text>
                                      </HStack>
                                      <HStack gap={1} color="slate.400" fontSize="xs">
                                        <Icon as={LucideCalendar} w={3.5} h={3.5} />
                                        <Text>{fmtDate(lead.dateTime)}</Text>
                                      </HStack>
                                    </HStack>

                                    {/* Details */}
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

                                    {/* Review */}
                                    {lead.review && (
                                      <HStack gap={1} bg="#F6F9FC" px={2.5} py={1} border="1px solid #FDE68A">
                                        {[1,2,3,4,5].map(st => (
                                          <Icon key={st} as={LucideStar} w={3} h={3}
                                            color={lead.review!.rating >= st ? '#F59E0B' : '#E5E7EB'}
                                            fill={lead.review!.rating >= st ? '#F59E0B' : 'none'} />
                                        ))}
                                        <Text fontSize="xs" color="#0A80DB" fontWeight="semibold" ml={0.5}>Your rating</Text>
                                      </HStack>
                                    )}

                                    {/* Actions */}
                                    <HStack gap={2} mt={0.5} flexWrap="wrap">
                                      {canRate && (
                                        <Button size="xs" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                                          _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                                          onClick={() => setRatingLead(lead)}>
                                          <Icon as={LucideStar} w={3} h={3} mr={1} />
                                          Rate professional
                                        </Button>
                                      )}
                                      {lead.status === 'COMPLETED' && (
                                        <Button size="xs" variant="outline" borderColor="slate.200" color="slate.600"
                                          borderRadius="4px" fontWeight="semibold"
                                          _hover={{ bg: 'brand.50', borderColor: 'brand.300', color: 'brand.600' }}
                                          loading={rebooking === lead.id}
                                          onClick={() => handleRebook(lead)}>
                                          <Icon as={LucideRepeat2} w={3} h={3} mr={1} />
                                          Book again
                                        </Button>
                                      )}
                                      {lead.status === 'CANCELLED' && (
                                        <Button size="xs" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
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
                                          <Icon as={LucideRotateCcw} w={3} h={3} mr={1} />
                                          {reactivateId === lead.id ? 'Close' : 'Reactivate'}
                                        </Button>
                                      )}
                                    </HStack>

                                    {/* Reactivate picker — inline under the actions */}
                                    {reactivateId === lead.id && lead.status === 'CANCELLED' && (
                                      <Box bg="#F6F9FC" border="1px solid #E3E8EE" p={3} mt={1}>
                                        <Text fontSize="xs" fontWeight="bold" color="#0A80DB" mb={2}>
                                          Pick a new date and time to reactivate
                                        </Text>
                                        <HStack gap={2} mb={2}>
                                          <Box position="relative" flex={1}>
                                            <Box h="9" bg="white" border="1px solid" borderColor="#E3E8EE"
                                              borderRadius="4px" px={3} display="flex" alignItems="center"
                                              style={{ pointerEvents:'none' }}>
                                              <Text fontSize="xs" color={reactivateDate ? '#0B1120' : '#A0AEC0'}>
                                                {reactivateDate ? isoDateToUs(reactivateDate) : 'MM/DD/YYYY'}
                                              </Text>
                                            </Box>
                                            <input type="date" value={reactivateDate}
                                              onChange={e => setReactivateDate(e.target.value)}
                                              min={new Date().toISOString().split('T')[0]}
                                              style={{ position:'absolute', inset:0, opacity:0.01,
                                                       cursor:'pointer', width:'100%', height:'100%' }} />
                                          </Box>
                                          <Input type="time" value={reactivateTime}
                                            onChange={e => setReactivateTime(e.target.value)}
                                            bg="white" borderRadius="4px" h="9" flex={1}
                                            border="1px solid" borderColor="#E3E8EE" fontSize="xs" />
                                        </HStack>
                                        <HStack gap={2} justify="flex-end">
                                          <Button size="xs" variant="ghost" color="slate.500"
                                            onClick={() => setReactivateId(null)}>Cancel</Button>
                                          <Button size="xs" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                                            _hover={{ bg: '#0870C2' }} loading={reactivating} loadingText="Reactivating…"
                                            onClick={() => handleReactivate(lead.id)}>
                                            Confirm date
                                          </Button>
                                        </HStack>
                                      </Box>
                                    )}
                                  </VStack>
                                  <Text fontSize="xs" color="slate.400" whiteSpace="nowrap">
                                    {fmtShortDate(lead.createdAt)}
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

                {/* ── Your Cleaners ── */}
                {myCleaners.length > 0 && (
                  <Box border="1px solid #E3E8EE" bg="white" px={5} py={4}>
                    <HStack gap={2} mb={4}>
                      <Icon as={LucideUsers} w={4} h={4} color="slate.400" />
                      <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase"
                        fontFamily="heading" letterSpacing="0.07em">
                        Your cleaners ({myCleaners.length})
                      </Text>
                    </HStack>
                    <HStack gap={3} flexWrap="wrap">
                      {myCleaners.map(c => (
                        <HStack
                          key={c.id} gap={2.5} px={3} py={2}
                          border="1px solid #E3E8EE" bg="#F8FAFC"
                          as="button" cursor="pointer" transition="all 0.15s"
                          _hover={{ borderColor: '#0A80DB', bg: 'white' }}
                          onClick={() => router.push(`/dashboard/profile/${c.id}`)}>
                          <Avatar name={c.name} src={c.avatarUrl} size={28} />
                          <Text fontSize="sm" fontWeight="semibold" color="slate.700">{c.name}</Text>
                          <Icon as={LucideExternalLink} w={3} h={3} color="slate.300" />
                        </HStack>
                      ))}
                    </HStack>
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
                      Submit review
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cancel Reason Modal ── */}
      <AnimatePresence>
        {cancelReasonModal && (
          <motion.div key="cancel-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={() => setCancelReasonModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px', margin: '0 16px' }}>
              <Box bg="white" border="1px solid #E3E8EE" p={7}
                style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.14)' }}>
                <Flex justify="space-between" align="center" mb={5}>
                  <Heading size="sm" fontWeight="black" color="slate.900" fontFamily="heading">
                    Cancel booking
                  </Heading>
                  <Button size="sm" variant="ghost" color="slate.400" borderRadius="4px" px={1.5}
                    onClick={() => setCancelReasonModal(null)}>
                    <Icon as={LucideX} w={4} h={4} />
                  </Button>
                </Flex>
                <Text fontSize="sm" color="slate.600" mb={4}>
                  Help us improve — what's the reason for cancelling?
                </Text>
                <VStack gap={2} align="stretch" mb={6}>
                  {CANCEL_REASONS.map(reason => (
                    <Box
                      key={reason} as="button" textAlign="left" px={3} py={2.5}
                      border="1.5px solid"
                      borderColor={cancelReason === reason ? '#0A80DB' : '#E3E8EE'}
                      bg={cancelReason === reason ? '#F0F7FF' : 'white'}
                      transition="all 0.12s" cursor="pointer"
                      onClick={() => setCancelReason(reason)}>
                      <HStack gap={2} justify="space-between">
                        <Text fontSize="sm" color={cancelReason === reason ? '#0A80DB' : 'slate.700'}
                          fontWeight={cancelReason === reason ? 600 : 400}>
                          {reason}
                        </Text>
                        {cancelReason === reason && (
                          <Box w="16px" h="16px" bg="#0A80DB" borderRadius="full"
                            display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                            <Text fontSize="8px" color="white" fontWeight="black">✓</Text>
                          </Box>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
                <HStack gap={3}>
                  <Button flex={1} variant="outline" borderColor="slate.200" color="slate.500"
                    borderRadius="4px" onClick={() => setCancelReasonModal(null)}>
                    Keep booking
                  </Button>
                  <Button flex={1} bg="red.500" color="white" borderRadius="4px" fontWeight="bold"
                    _hover={{ bg: 'red.600' }}
                    loading={cancelling === cancelReasonModal}
                    loadingText="Cancelling…"
                    disabled={!cancelReason}
                    onClick={() => handleCancelWithReason(cancelReasonModal!)}>
                    Confirm cancel
                  </Button>
                </HStack>
              </Box>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </Box>
  );
}

/* ─── OrderForm component ──────────────────────────────────────── */
function OrderForm({ form, setField, toggleExtra, estimate, progress, onSubmit, submitting, onCancel, addressBook, onSelectAddress }: any) {
  const serviceLabel = SERVICE_TYPES.find(s => s.id === form.serviceType)?.labelEn ?? '';
  return (
    <Box bg="white" border="1px solid #E3E8EE">
      {/* Form header */}
      <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
        <Flex justify="space-between" align="center">
          <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase"
            letterSpacing="0.07em" fontFamily="heading">
            New Booking Request
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
                        <HStack gap={2}><Text fontSize="lg">{ex.icon}</Text><Box><Text fontSize="xs" fontWeight="bold" color="slate.700">{ex.labelEn}</Text><Text fontSize="xs" color="slate.400">+${ex.price}</Text></Box></HStack>
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
                {/* Address book */}
                {addressBook.length > 0 && (
                  <Box>
                    <HStack gap={1.5} mb={2}>
                      <Icon as={LucideBookmark} w={3} h={3} color="slate.400" />
                      <Text fontSize="10px" color="slate.400" fontWeight="600" textTransform="uppercase" letterSpacing="0.06em">Saved addresses</Text>
                    </HStack>
                    <HStack gap={2} flexWrap="wrap">
                      {(addressBook as string[]).map((addr: string, i: number) => (
                        <Box
                          key={i} as="button"
                          px={3} py={1.5}
                          border="1px solid #E3E8EE"
                          bg={form.address === addr ? '#F0F7FF' : '#F8FAFC'}
                          borderColor={form.address === addr ? '#0A80DB' : '#E3E8EE'}
                          onClick={() => onSelectAddress(addr)}
                          transition="all 0.12s" cursor="pointer" maxW="240px">
                          <HStack gap={1}>
                            <Icon as={LucideMapPin} w={3} h={3} color={form.address === addr ? '#0A80DB' : 'slate.400'} flexShrink={0} />
                            <Text fontSize="11.5px" color={form.address === addr ? '#0A80DB' : 'slate.600'}
                              fontWeight={form.address === addr ? 600 : 400} lineClamp={1}>
                              {addr}
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </HStack>
                  </Box>
                )}
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
                  <Box position="relative" flex={1}>
                    <Box h="12" bg="slate.50" border="1px solid"
                      borderColor={form.date ? 'brand.300' : 'slate.200'}
                      borderRadius="4px" px={3} display="flex" alignItems="center"
                      style={{ pointerEvents:'none' }}>
                      <Text fontSize="sm" color={form.date ? '#0B1120' : '#A0AEC0'}>
                        {form.date ? isoDateToUs(form.date) : 'MM/DD/YYYY'}
                      </Text>
                    </Box>
                    <input type="date" value={form.date}
                      onChange={e => setField('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ position:'absolute', inset:0, opacity:0.01,
                               cursor:'pointer', width:'100%', height:'100%' }} />
                  </Box>
                  <Input type="time" value={form.time} onChange={e => setField('time', e.target.value)}
                    bg="slate.50" border="1px solid" borderColor={form.time ? 'brand.300' : 'slate.200'}
                    h="12" borderRadius="4px" fontSize="sm" flex={1}
                    _focus={{ bg: 'white', borderColor: 'brand.400' }} transition="all 0.15s" />
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
                <Text fontSize="xs" color="slate.400" mt={3}>* Estimate only — final price may vary slightly.</Text>
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
