'use client';

import {
  Box, VStack, HStack, Text, Button, Icon, Flex,
  Textarea, SimpleGrid, Input,
} from '@chakra-ui/react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { toaster } from '@/lib/toaster';
import { AnimatePresence, motion } from 'motion/react';
import {
  LucideShield, LucideUsers, LucideCheckCircle, LucideXCircle,
  LucideEye, LucideTrash2, LucideLogOut, LucideUser,
  LucideBan, LucideUnlock, LucidePencil, LucideSave, LucideX,
  LucideLayoutDashboard, LucideClipboardList, LucideStar,
  LucideRefreshCw, LucideSearch, LucideChevronLeft, LucideChevronRight,
  LucideCheckCircle2, LucideMapPin, LucidePhone,
  LucideSettings, LucideDollarSign, LucideTrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'leads' | 'verifications' | 'users' | 'reviews' | 'pricing' | 'lead-pricing' | 'settings';

interface StatsData {
  users:         { totalClients: number; totalCleaners: number; verifiedCleaners: number; total: number };
  leads:         Record<string, number>;
  verifications: { pending: number };
  reviews:       { total: number; avgRating: number };
  recentLeads:   { id: string; serviceType: string; status: string; createdAt: string; client: { name: string | null }; cleaner: { name: string | null } | null }[];
  topCleaners:   { cleanerId: string; ratingAvg: number; totalLeads: number; cleaner: { name: string | null; email: string; isVerified: boolean } }[];
  leadsTimeSeries:   { date: string; count: number }[];
  revenueTimeSeries: { date: string; revenue: number }[];
  totalRevenue:      number;
}
interface LeadRow {
  id: string; serviceType: string; address: string; dateTime: string;
  status: string; createdAt: string; clientPhone: string | null;
  estimatedMinPrice: number | null; estimatedMaxPrice: number | null;
  client:  { id: string; name: string | null; email: string; phone: string | null };
  cleaner: { id: string; name: string | null; email: string; isVerified: boolean } | null;
  conversations: { id: string; status: string; feeStatus: string; leadFee: number; cleaner: { id: string; name: string | null } }[];
  review: { rating: number; comment: string | null } | null;
}
interface UserRow {
  id: string; name: string | null; email: string; role: string;
  phone: string | null; address: string | null;
  zipCode: string | null; latitude: number | null; longitude: number | null;
  isVerified: boolean; suspendedUntil: string | null;
  createdAt: string; plan: string; isAvailable: boolean;
}
interface Verification {
  id: string; status: string; fullName: string; idNumber: string;
  address: string; frontDocUrl: string; backDocUrl: string; selfieUrl: string;
  adminNote: string | null; createdAt: string;
  cleaner: { id: string; name: string | null; email: string };
}
interface ReviewRow {
  id: string; rating: number; comment: string | null; createdAt: string;
  client:  { id: string; name: string | null; email: string };
  cleaner: { id: string; name: string | null; email: string; isVerified: boolean };
  lead:    { serviceType: string; address: string; dateTime: string };
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const SIDEBAR_BG   = '#0B1120';
const SIDEBAR_W    = '216px';

const LEAD_STATUS: Record<string, { label: string; color: string; dot: string }> = {
  NEW:       { label: 'New',            color: '#92400E', dot: '#F59E0B' },
  WAVE1:     { label: 'Matching',       color: '#0A80DB', dot: '#60A5FA' },
  WAVE2:     { label: 'Matching',       color: '#0A80DB', dot: '#60A5FA' },
  WAVE3:     { label: 'Last wave',      color: '#0A80DB', dot: '#60A5FA' },
  IN_REVIEW: { label: 'Pending',        color: '#0369A1', dot: '#38BDF8' },
  ACCEPTED:  { label: 'Accepted',       color: '#0F4F67', dot: '#0A80DB' },
  COMPLETED: { label: 'Completed',      color: '#047857', dot: '#10B981' },
  CANCELLED: { label: 'Cancelled',      color: '#BE123C', dot: '#F43F5E' },
  UNMATCHED: { label: 'No cleaner',     color: '#475569', dot: '#94A3B8' },
};

const TH: React.CSSProperties = {
  padding: '9px 16px',
  textAlign: 'left',
  fontSize: '10.5px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#94A3B8',
  borderBottom: '1px solid #E3E8EE',
  background: '#F6F9FC',
  fontFamily: 'var(--font-dm-sans, sans-serif)',
  whiteSpace: 'nowrap',
};
const TD: React.CSSProperties = {
  padding: '11px 16px',
  borderBottom: '1px solid #F1F5F9',
  verticalAlign: 'middle',
};

// ─── Micro components ─────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const s = LEAD_STATUS[status] ?? LEAD_STATUS.NEW;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: s.color, fontWeight: 600, fontFamily: 'var(--font-dm-sans,sans-serif)' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function Stars({ n }: { n: number }) {
  return <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? '#F59E0B' : '#E3E8EE', fontSize: 13 }}>★</span>)}</span>;
}

function isSuspended(u: UserRow) { return !!u.suspendedUntil && new Date(u.suspendedUntil) > new Date(); }

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV: { id: Tab; label: string; icon: any; section?: string }[] = [
  { id: 'overview',      label: 'Overview',     icon: LucideLayoutDashboard, section: 'PLATFORM' },
  { id: 'leads',         label: 'Bookings',     icon: LucideClipboardList },
  { id: 'verifications', label: 'Verifications', icon: LucideShield,          section: 'ACCOUNTS' },
  { id: 'users',         label: 'Users',         icon: LucideUsers },
  { id: 'reviews',       label: 'Reviews',       icon: LucideStar },
  { id: 'pricing',       label: 'Plan Pricing',  icon: LucideDollarSign,      section: 'FINANCIAL' },
  { id: 'lead-pricing',  label: 'Lead Prices',   icon: LucideDollarSign },
];

function Sidebar({ tab, setTab, pendingVerifs, onRefresh, user }: {
  tab: Tab; setTab: (t: Tab) => void;
  pendingVerifs: number; onRefresh: () => void;
  user: string;
}) {
  return (
    <Box
      w={SIDEBAR_W} flexShrink={0} bg={SIDEBAR_BG}
      display="flex" flexDirection="column" h="100vh" overflow="auto"
    >
      {/* Logo */}
      <Box px={5} pt={6} pb={5} borderBottom="1px solid rgba(255,255,255,0.06)">
        <HStack gap={2.5}>
          <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          <Text fontWeight="700" fontSize="14px" letterSpacing="-0.02em" color="white" fontFamily="heading">
            Brazilian<Text as="span" color="#60A5FA">Clean</Text>
          </Text>
        </HStack>
      </Box>

      {/* Nav */}
      <Box flex={1} py={4} px={2}>
        {NAV.map((item) => {
          const isActive = tab === item.id;
          return (
            <Box key={item.id}>
              {item.section && (
                <Text
                  fontSize="9px" fontWeight="700" color="#334155"
                  letterSpacing="0.12em" fontFamily="heading"
                  px={3} pt={4} pb={1.5} textTransform="uppercase"
                >
                  {item.section}
                </Text>
              )}
              <Box
                as="button"
                w="full"
                display="flex" alignItems="center" gap={2.5}
                px={3} py={2.5}
                cursor="pointer"
                borderLeft="2px solid"
                borderLeftColor={isActive ? 'brand.500' : 'transparent'}
                bg={isActive ? 'rgba(26,127,160,0.12)' : 'transparent'}
                color={isActive ? 'white' : '#94A3B8'}
                fontWeight={isActive ? '600' : '400'}
                fontSize="13px"
                fontFamily="heading"
                letterSpacing="-0.01em"
                transition="all 0.12s"
                textAlign="left"
                borderRadius="0"
                _hover={{ color: '#E3E8EE', bg: 'rgba(255,255,255,0.04)' }}
                onClick={() => setTab(item.id)}
              >
                <Icon as={item.icon} w="14px" h="14px" flexShrink={0} />
                <Text flex={1}>{item.label}</Text>
                {item.id === 'verifications' && pendingVerifs > 0 && (
                  <Box
                    w="18px" h="18px" bg="red.500" borderRadius="full"
                    display="flex" alignItems="center" justifyContent="center"
                    fontSize="9px" fontWeight="700" color="white" fontFamily="heading"
                  >
                    {pendingVerifs}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Bottom */}
      <Box px={3} pb={5} pt={3} borderTop="1px solid rgba(255,255,255,0.06)">
        <HStack gap={2} px={2} py={2} mb={1}>
          <Box
            w="28px" h="28px" bg="brand.500" borderRadius="full"
            display="flex" alignItems="center" justifyContent="center"
            fontSize="11px" fontWeight="700" color="white" flexShrink={0}
          >
            {user[0]?.toUpperCase() ?? 'A'}
          </Box>
          <Box flex={1} minW={0}>
            <Text fontSize="12px" fontWeight="600" color="white" fontFamily="heading" lineClamp={1}>{user}</Text>
            <Text fontSize="10px" color="#475569" fontFamily="heading">Administrator</Text>
          </Box>
        </HStack>
        <Box
          as="button" w="full" display="flex" alignItems="center" gap={2}
          px={3} py={2} cursor="pointer" fontSize="12px"
          fontFamily="heading" fontWeight="500" borderRadius="0"
          transition="all 0.12s"
          color={tab === 'settings' ? 'white' : '#6B7280'}
          bg={tab === 'settings' ? 'rgba(26,127,160,0.15)' : 'transparent'}
          _hover={{ color: '#E3E8EE', bg: 'rgba(255,255,255,0.04)' }}
          onClick={() => setTab('settings')}
        >
          <Icon as={LucideSettings} w={3} h={3} />
          My settings
        </Box>
        <Box
          as="button" w="full" display="flex" alignItems="center" gap={2}
          px={3} py={2} cursor="pointer" color="#6B7280" fontSize="12px"
          fontFamily="heading" fontWeight="500" borderRadius="0"
          transition="color 0.12s"
          _hover={{ color: '#E3E8EE' }}
          onClick={onRefresh}
        >
          <Icon as={LucideRefreshCw} w={3} h={3} />
          Refresh data
        </Box>
        <Box
          as="button" w="full" display="flex" alignItems="center" gap={2}
          px={3} py={2} cursor="pointer" color="#6B7280" fontSize="12px"
          fontFamily="heading" fontWeight="500" borderRadius="0"
          transition="color 0.12s"
          _hover={{ color: '#F43F5E' }}
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
        >
          <Icon as={LucideLogOut} w={3} h={3} />
          Sign out
        </Box>
      </Box>
    </Box>
  );
}

// ─── DeleteConfirmModal ───────────────────────────────────────────────────────

function DeleteConfirmModal({ user, onConfirm, onCancel, loading }: {
  user: UserRow; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <Box
      position="fixed" inset={0} zIndex={9999}
      display="flex" alignItems="center" justifyContent="center"
      style={{ background: 'rgba(11,17,32,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onCancel}
    >
      <Box
        bg="white" border="1px solid #E3E8EE" w="400px" mx={4}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <Flex align="center" justify="space-between" px={5} py={4}
          borderBottom="1px solid #F1F5F9">
          <HStack gap={2.5}>
            <Box w="28px" h="28px" bg="red.50" border="1px solid #FCA5A5"
              display="flex" alignItems="center" justifyContent="center">
              <Icon as={LucideTrash2} w="13px" h="13px" color="red.500" />
            </Box>
            <Text fontSize="14px" fontWeight="700" color="slate.900" fontFamily="heading">
              Delete account
            </Text>
          </HStack>
          <Box as="button" onClick={onCancel} p={1} color="slate.400"
            _hover={{ color: 'slate.600' }} cursor="pointer">
            <Icon as={LucideX} w="14px" h="14px" />
          </Box>
        </Flex>

        {/* Body */}
        <Box px={5} py={5}>
          <Text fontSize="13.5px" color="slate.700" fontFamily="heading" lineHeight={1.6} mb={4}>
            You are about to permanently delete this account. This action{' '}
            <strong>cannot be undone</strong> and will remove all leads, conversations,
            and data associated with this user.
          </Text>
          <Box bg="#FEF2F2" border="1px solid #FECACA" p={3} mb={1}>
            <Text fontSize="13px" fontWeight="600" color="slate.900" fontFamily="heading">
              {user.name || '(no name)'}
            </Text>
            <Text fontSize="12px" color="slate.500" fontFamily="heading">{user.email}</Text>
            <Text fontSize="11px" color="slate.400" fontFamily="heading" mt={0.5}>
              {user.role === 'CLEANER' ? 'Cleaner' : 'Client'} · joined {new Date(user.createdAt).toLocaleDateString('en-US')}
            </Text>
          </Box>
        </Box>

        {/* Footer */}
        <Flex gap={2} px={5} pb={5} justify="flex-end">
          <Button size="sm" variant="ghost" borderRadius="4px" color="slate.500"
            fontFamily="heading" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" bg="red.500" color="white" borderRadius="4px"
            fontFamily="heading" fontWeight="600"
            loading={loading} loadingText="Deleting…"
            _hover={{ bg: 'red.600' }} onClick={onConfirm}>
            <Icon as={LucideTrash2} w={3.5} h={3.5} mr={1.5} />
            Delete permanently
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

// ─── UserTableRow ─────────────────────────────────────────────────────────────

function UserTableRow({ user, onRefresh }: { user: UserRow; onRefresh: () => void }) {
  const [editing, setEditing]       = useState(false);
  const [name, setName]             = useState(user.name ?? '');
  const [email, setEmail]           = useState(user.email);
  const [phone, setPhone]           = useState(user.phone ?? '');
  const [zipCode, setZipCode]       = useState(user.zipCode ?? '');
  const [suspendDays, setSuspDays]  = useState(7);
  const [loading, setLoading]       = useState(false);
  const [showDeleteModal, setShowDelete] = useState(false);
  const suspended = isSuspended(user);

  const call = async (body: object) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toaster.create({ title: 'Updated', type: 'success' });
      onRefresh();
    } catch { toaster.create({ title: 'Error', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Error');
      }
      toaster.create({ title: 'Account deleted', type: 'success' });
      setShowDelete(false);
      onRefresh();
    } catch (e: any) {
      toaster.create({ title: e.message ?? 'Error deleting account', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmModal
          user={user}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={loading}
        />
      )}
      <tr>
        <td style={TD}>
          {editing ? (
            <VStack gap={1.5} align="stretch">
              <Input size="sm" value={name}  onChange={e => setName(e.target.value)}  placeholder="Name"  borderRadius="4px" />
              <Input size="sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" borderRadius="4px" />
              <Input size="sm" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" borderRadius="4px" />
              <Input size="sm" value={zipCode} onChange={e => setZipCode(e.target.value)}
                placeholder="ZIP code (e.g. 33101)" borderRadius="4px" maxLength={10} />
            </VStack>
          ) : (
            <Box>
              <Text fontSize="13px" fontWeight="600" color="slate.900" fontFamily="heading">{user.name || '—'}</Text>
              <Text fontSize="11.5px" color="slate.500">{user.email}</Text>
              {user.phone && <Text fontSize="11px" color="slate.400">{user.phone}</Text>}
            </Box>
          )}
        </td>
        <td style={TD}>
          <Text fontSize="12px" fontWeight="500" color="slate.600" fontFamily="heading">
            {user.role === 'CLEANER' ? 'Cleaner' : 'Client'}
          </Text>
        </td>
        <td style={TD}>
          <Box>
            {user.zipCode ? (
              <HStack gap={1}>
                <Icon as={LucideMapPin} w="11px" h="11px" color="slate.400" flexShrink={0} />
                <Text fontSize="12px" fontWeight="600" color="slate.700" fontFamily="heading">{user.zipCode}</Text>
              </HStack>
            ) : user.address ? (
              <HStack gap={1}>
                <Icon as={LucideMapPin} w="11px" h="11px" color="slate.400" flexShrink={0} />
                <Text fontSize="11px" color="slate.600" fontFamily="heading" maxW="160px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{user.address}</Text>
              </HStack>
            ) : (
              <Text fontSize="11px" color="slate.300" fontFamily="heading">—</Text>
            )}
            {(user.latitude != null && user.longitude != null && user.latitude !== 0 && user.longitude !== 0) && (
              <Text fontSize="10px" color="slate.400" fontFamily="heading">
                {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
              </Text>
            )}
          </Box>
        </td>
        <td style={TD}>
          {suspended
            ? <span style={{ fontSize: 12, fontWeight: 600, color: '#BE123C', fontFamily: 'var(--font-dm-sans,sans-serif)' }}>Suspended until {new Date(user.suspendedUntil!).toLocaleDateString('en-US')}</span>
            : user.isVerified
            ? <span style={{ fontSize: 12, fontWeight: 600, color: '#047857', fontFamily: 'var(--font-dm-sans,sans-serif)' }}>Active</span>
            : (
              <HStack gap={1.5}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#92400E', fontFamily: 'var(--font-dm-sans,sans-serif)' }}>Unverified</span>
                {user.role === 'CLEANER' && (
                  <Button size="xs" h="18px" px={1.5} fontSize="10px" bg="#0A80DB" color="white"
                    borderRadius="3px" fontFamily="heading" loading={loading}
                    onClick={() => call({ action: 'verify' })}>
                    Verify
                  </Button>
                )}
              </HStack>
            )
          }
        </td>
        <td style={TD}>
          <Text fontSize="12px" color="slate.400" fontFamily="heading">{new Date(user.createdAt).toLocaleDateString('en-US')}</Text>
        </td>
        <td style={{ ...TD, textAlign: 'right' }}>
          <HStack gap={1} justify="flex-end">
            {editing ? (
              <>
                <Button size="xs" bg="brand.500" color="white" borderRadius="4px" loading={loading}
                  onClick={() => { call({ name, email, phone, zipCode: zipCode.trim() || null }); setEditing(false); }}>
                  <Icon as={LucideSave} w={3} h={3} />
                </Button>
                <Button size="xs" variant="ghost" borderRadius="4px" onClick={() => setEditing(false)}>
                  <Icon as={LucideX} w={3} h={3} />
                </Button>
              </>
            ) : (
              <Button size="xs" variant="ghost" borderRadius="4px" onClick={() => setEditing(true)}>
                <Icon as={LucidePencil} w={3} h={3} color="slate.400" />
              </Button>
            )}
            {suspended ? (
              <Button size="xs" variant="ghost" borderRadius="4px" loading={loading} onClick={() => call({ action: 'unsuspend' })}>
                <Icon as={LucideUnlock} w={3} h={3} color="#0A80DB" />
              </Button>
            ) : (
              <HStack gap={1}>
                <Input size="xs" type="number" value={suspendDays} min={1} max={365}
                  onChange={e => setSuspDays(Number(e.target.value))}
                  w="40px" borderRadius="4px" textAlign="center" fontSize="11px" />
                <Text fontSize="10px" color="slate.400">d</Text>
                <Button size="xs" variant="ghost" borderRadius="4px" loading={loading}
                  onClick={() => call({ action: 'suspend', suspendDays })}>
                  <Icon as={LucideBan} w={3} h={3} color="#0A80DB" />
                </Button>
              </HStack>
            )}
            <Button size="xs" variant="ghost" borderRadius="4px"
              onClick={() => setShowDelete(true)}
              title="Delete account">
              <Icon as={LucideTrash2} w={3} h={3} color="red.400" />
            </Button>
          </HStack>
        </td>
      </tr>
    </>
  );
}

// ─── VerifRow ─────────────────────────────────────────────────────────────────

function VerifRow({ v, onAction }: { v: Verification; onAction: () => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [load, setLoad] = useState(false);

  const act = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !note.trim()) {
      toaster.create({ title: 'Please provide a reason', type: 'error' }); return;
    }
    setLoad(true);
    try {
      const res = await fetch(`/api/admin/verifications/${v.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      });
      if (!res.ok) throw new Error();
      toaster.create({ title: action === 'approve' ? 'Approved' : 'Rejected', type: 'success' });
      onAction();
    } catch { toaster.create({ title: 'Error', type: 'error' }); }
    finally { setLoad(false); }
  };

  const statusColor = v.status === 'APPROVED' ? '#047857' : v.status === 'REJECTED' ? '#BE123C' : '#92400E';
  const statusLabel = v.status === 'APPROVED' ? 'Approved' : v.status === 'REJECTED' ? 'Rejected' : 'Pending';

  return (
    <>
      <tr>
        <td style={TD}>
          <Text fontSize="13px" fontWeight="600" color="slate.900" fontFamily="heading">{v.cleaner.name || '—'}</Text>
          <Text fontSize="11.5px" color="slate.500">{v.cleaner.email}</Text>
        </td>
        <td style={TD}>
          <Text fontSize="13px" color="slate.700">{v.fullName}</Text>
          <Text fontSize="11px" color="slate.400" fontFamily="mono">{v.idNumber}</Text>
        </td>
        <td style={TD}>
          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor, fontFamily: 'var(--font-dm-sans,sans-serif)' }}>{statusLabel}</span>
        </td>
        <td style={TD}>
          <Text fontSize="12px" color="slate.400" fontFamily="heading">{new Date(v.createdAt).toLocaleDateString('en-US')}</Text>
        </td>
        <td style={{ ...TD, textAlign: 'right' }}>
          <HStack gap={2} justify="flex-end">
            <Button size="xs" variant="ghost" borderRadius="4px" color="slate.400" onClick={() => setOpen(o => !o)}>
              <Icon as={LucideEye} w={3.5} h={3.5} />
            </Button>
            {v.status === 'PENDING' && (
              <>
                <Button size="xs" bg="#059669" color="white" borderRadius="4px" loading={load} onClick={() => act('approve')}>
                  <Icon as={LucideCheckCircle} w={3} h={3} mr={1} />Approve
                </Button>
                <Button size="xs" bg="red.500" color="white" borderRadius="4px" loading={load} onClick={() => act('reject')}>
                  <Icon as={LucideXCircle} w={3} h={3} mr={1} />Reject
                </Button>
              </>
            )}
          </HStack>
        </td>
      </tr>
      <AnimatePresence>
        {open && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={5} style={{ padding: 0 }}>
              <Box p={5} bg="slate.50" borderBottom="1px solid #E3E8EE">
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mb={4}>
                  {[{ label: 'ID front', url: v.frontDocUrl }, { label: 'ID back', url: v.backDocUrl }, { label: 'Selfie with ID', url: v.selfieUrl }].map(img => (
                    <Box key={img.label}>
                      <Text fontSize="10.5px" fontWeight="700" color="slate.400" fontFamily="heading" mb={1.5} textTransform="uppercase" letterSpacing="0.06em">{img.label}</Text>
                      <a href={img.url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.label} style={{ width: '100%', height: 130, objectFit: 'cover', border: '1px solid #E3E8EE' }} />
                      </a>
                    </Box>
                  ))}
                </SimpleGrid>
                <Text fontSize="12px" color="slate.500" mb={3}><strong>Address:</strong> {v.address}</Text>
                {v.status === 'PENDING' && (
                  <Box>
                    <Text fontSize="10.5px" fontWeight="700" color="slate.400" fontFamily="heading" textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>Nota de recusa</Text>
                    <Textarea value={note} onChange={e => setNote(e.target.value)}
                      placeholder="Describe the reason for rejection…"
                      size="sm" borderRadius="4px" bg="white" rows={2} />
                  </Box>
                )}
              </Box>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── LeadRow ──────────────────────────────────────────────────────────────────

function LeadDetailRow({ lead }: { lead: LeadRow }) {
  const [open, setOpen] = useState(false);
  const convs = lead.conversations ?? [];
  return (
    <>
      <tr>
        <td style={TD}>
          <Text fontSize="11px" color="slate.400" fontFamily="mono">{lead.id.slice(-8)}</Text>
        </td>
        <td style={TD}>
          <Text fontSize="13px" fontWeight="600" color="slate.800" fontFamily="heading">{lead.serviceType}</Text>
          <HStack gap={1} mt={0.5}>
            <Icon as={LucideMapPin} w="11px" h="11px" color="slate.400" />
            <Text fontSize="11px" color="slate.400" lineClamp={1}>{lead.address}</Text>
          </HStack>
        </td>
        <td style={TD}>
          <Text fontSize="13px" color="slate.700">{lead.client.name || '—'}</Text>
          <Text fontSize="11px" color="slate.400">{lead.client.email}</Text>
          {(lead.client.phone || lead.clientPhone) && (
            <HStack gap={1}>
              <Icon as={LucidePhone} w="10px" h="10px" color="slate.400" />
              <Text fontSize="11px" color="slate.400">{lead.client.phone || lead.clientPhone}</Text>
            </HStack>
          )}
        </td>
        <td style={TD}>
          {lead.cleaner ? (
            <HStack gap={1.5}>
              <Text fontSize="13px" color="slate.700">{lead.cleaner.name || '—'}</Text>
              {lead.cleaner.isVerified && <Icon as={LucideCheckCircle2} w="13px" h="13px" color="#059669" />}
            </HStack>
          ) : <Text fontSize="12px" color="slate.300">—</Text>}
        </td>
        <td style={TD}><StatusDot status={lead.status} /></td>
        <td style={TD}>
          <Text fontSize="12px" color="slate.400" fontFamily="heading">{new Date(lead.createdAt).toLocaleDateString('en-US')}</Text>
        </td>
        <td style={TD}>
          {lead.estimatedMinPrice
            ? <Text fontSize="12px" fontWeight="600" color="#0A80DB">${lead.estimatedMinPrice}–{lead.estimatedMaxPrice}</Text>
            : <Text fontSize="12px" color="slate.300">—</Text>}
        </td>
        <td style={{ ...TD, textAlign: 'center' }}>
          <HStack gap={2} justify="center">
            <Text fontSize="12px" fontWeight="600" color="slate.600">{convs.length}</Text>
            {lead.review && <Stars n={lead.review.rating} />}
            {convs.length > 0 && (
              <Box as="button" onClick={() => setOpen(o => !o)} cursor="pointer" color="#697386" _hover={{ color: '#475569' }}>
                <Icon as={LucideEye} w="13px" h="13px" />
              </Box>
            )}
          </HStack>
        </td>
      </tr>
      <AnimatePresence>
        {open && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={8} style={{ padding: 0 }}>
              <Box p={5} bg="#F6F9FC" borderBottom="1px solid #E3E8EE">
                <Text fontSize="10.5px" fontWeight="700" color="slate.400" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em" mb={2}>Conversas ({convs.length})</Text>
                <VStack gap={1} align="stretch">
                  {convs.map(c => (
                    <HStack key={c.id} gap={4} px={3} py={2} bg="white" border="1px solid #E3E8EE">
                      <Text fontSize="12.5px" fontWeight="600" color="slate.800" fontFamily="heading" flex={1}>{c.cleaner.name || '—'}</Text>
                      <Text fontSize="12px" color="slate.500" fontFamily="heading">{c.status === 'active' ? 'Active' : 'Closed'}</Text>
                      <Text fontSize="11px" color="slate.400">Lead fee $${c.leadFee}</Text>
                      <Text fontSize="11px" fontWeight="600" color={c.feeStatus === 'charged' ? '#059669' : '#94A3B8'}>
                        {c.feeStatus === 'charged' ? 'Charged' : 'Pending'}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
                {lead.review && (
                  <HStack gap={3} mt={3} p={3} bg="white" border="1px solid #FDE68A">
                    <Stars n={lead.review.rating} />
                    <Text fontSize="12px" color="slate.600">{lead.review.comment || 'No comment'}</Text>
                  </HStack>
                )}
              </Box>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <Box px={8} pt={7} pb={5} borderBottom="1px solid #E3E8EE" bg="white">
      <Flex align="flex-end" justify="space-between">
        <Box>
          <Text fontSize="20px" fontWeight="800" color="slate.900" fontFamily="heading" letterSpacing="-0.025em">{title}</Text>
          {sub && <Text fontSize="13px" color="slate.400" fontFamily="heading" mt={0.5}>{sub}</Text>}
        </Box>
        {children}
      </Flex>
    </Box>
  );
}

// ─── Stat strip ───────────────────────────────────────────────────────────────

function StatStrip({ items }: { items: { label: string; value: string | number; accent?: boolean; onClick?: () => void }[] }) {
  return (
    <Box bg="white" borderBottom="1px solid #E3E8EE" px={8} py={0}>
      <HStack gap={0} divideX="1px" divideColor="slate.200" align="stretch">
        {items.map((item, i) => (
          <Box
            key={i}
            px={6} py={4}
            cursor={item.onClick ? 'pointer' : 'default'}
            onClick={item.onClick}
            transition="background 0.12s"
            _hover={item.onClick ? { bg: 'slate.50' } : {}}
            flexShrink={0}
          >
            <Text
              fontSize="22px"
              fontWeight="800"
              fontFamily="heading"
              letterSpacing="-0.03em"
              lineHeight={1}
              color={item.accent ? 'brand.500' : 'slate.900'}
            >
              {item.value}
            </Text>
            <Text fontSize="11px" fontWeight="600" color="slate.400" fontFamily="heading" mt={0.5} whiteSpace="nowrap">
              {item.label}
            </Text>
          </Box>
        ))}
      </HStack>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 30;

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('overview');

  const [stats, setStats]           = useState<StatsData | null>(null);
  const [leads, setLeads]           = useState<LeadRow[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [verifications, setVerifs]  = useState<Verification[]>([]);
  const [reviews, setReviews]       = useState<ReviewRow[]>([]);

  const [loadingStats, setLS]  = useState(false);
  const [loadingLeads, setLL]  = useState(false);
  const [loadingUsers, setLU]  = useState(false);
  const [loadingVerifs, setLV] = useState(false);
  const [loadingRevs, setLR]   = useState(false);

  const [leadStatus, setLeadStatus] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadPage, setLeadPage]     = useState(0);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CLIENT' | 'CLEANER'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [verifFilter, setVF]        = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [revFilter, setRevFilter]   = useState(0);

  const fetchStats = useCallback(async () => {
    setLS(true);
    try { const r = await fetch('/api/admin/stats'); if (r.ok) setStats(await r.json()); }
    finally { setLS(false); }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLL(true);
    try {
      const p = new URLSearchParams({ take: String(PAGE_SIZE), skip: String(leadPage * PAGE_SIZE), ...(leadStatus ? { status: leadStatus } : {}), ...(leadSearch ? { search: leadSearch } : {}) });
      const r = await fetch(`/api/admin/leads?${p}`);
      if (r.ok) { const d = await r.json(); setLeads(d.leads); setLeadsTotal(d.total); }
    } finally { setLL(false); }
  }, [leadStatus, leadSearch, leadPage]);

  const fetchUsers  = useCallback(async () => { setLU(true); try { const r = await fetch('/api/admin/users');         if (r.ok) setUsers((await r.json()).users ?? []); } finally { setLU(false); } }, []);
  const fetchVerifs = useCallback(async () => { setLV(true); try { const r = await fetch('/api/admin/verifications'); if (r.ok) setVerifs((await r.json()).verifications ?? []); } finally { setLV(false); } }, []);
  const fetchRevs   = useCallback(async () => { setLR(true); try { const r = await fetch('/api/admin/reviews');       if (r.ok) setReviews((await r.json()).reviews ?? []); } finally { setLR(false); } }, []);

  const refreshAll = useCallback(() => {
    fetchStats();
    if (tab === 'leads') fetchLeads();
    if (tab === 'users') fetchUsers();
    if (tab === 'verifications') fetchVerifs();
    if (tab === 'reviews') fetchRevs();
  }, [tab, fetchStats, fetchLeads, fetchUsers, fetchVerifs, fetchRevs]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      if ((session?.user as any)?.role !== 'ADMIN') router.replace('/dashboard');
      else fetchStats();
    }
  }, [authStatus, session, router, fetchStats]);

  useEffect(() => {
    if (tab === 'leads') fetchLeads();
    if (tab === 'users') fetchUsers();
    if (tab === 'verifications') fetchVerifs();
    if (tab === 'reviews') fetchRevs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => { if (tab === 'leads') fetchLeads(); }, [leadStatus, leadSearch, leadPage, tab, fetchLeads]);

  const filteredUsers  = users.filter(u => (roleFilter === 'ALL' || u.role === roleFilter) && (!userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())));
  const filteredVerifs = verifications.filter(v => verifFilter === 'ALL' || v.status === verifFilter);
  const filteredRevs   = reviews.filter(r => revFilter === 0 || r.rating === revFilter);
  const pendingVerifs  = verifications.filter(v => v.status === 'PENDING').length;
  const totalLeads     = stats ? Object.values(stats.leads).reduce((a, b) => a + b, 0) : 0;
  const userName       = session?.user?.name ?? 'Admin';

  if (authStatus === 'loading') return (
    <Flex h="100vh" align="center" justify="center" bg="slate.50">
      <Text color="slate.400" fontFamily="heading">Loading…</Text>
    </Flex>
  );

  return (
    <Flex h="100vh" overflow="hidden">

      {/* ── Sidebar ── */}
      <Sidebar
        tab={tab} setTab={setTab}
        pendingVerifs={pendingVerifs}
        onRefresh={refreshAll}
        user={userName}
      />

      {/* ── Main ── */}
      <Box flex={1} overflowY="auto" bg="#F6F9FC">

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader title="Overview" sub="Platform operational summary" />

            {/* KPI strip */}
            <StatStrip items={[
              { label: 'Total users',    value: loadingStats ? '…' : stats?.users.total ?? 0 },
              { label: 'Clients',        value: loadingStats ? '…' : stats?.users.totalClients ?? 0 },
              { label: 'Cleaners',       value: loadingStats ? '…' : stats?.users.totalCleaners ?? 0 },
              { label: 'Verified',       value: loadingStats ? '…' : stats?.users.verifiedCleaners ?? 0, accent: true },
              { label: 'Total bookings', value: loadingStats ? '…' : totalLeads, onClick: () => setTab('leads') },
              { label: 'Completed',      value: loadingStats ? '…' : stats?.leads?.COMPLETED ?? 0, accent: true, onClick: () => { setTab('leads'); setLeadStatus('COMPLETED'); } },
              { label: 'Revenue',        value: loadingStats ? '…' : `$${((stats?.totalRevenue ?? 0)).toFixed(0)}`, accent: true },
              { label: 'Avg. rating',    value: loadingStats ? '…' : `${(stats?.reviews.avgRating ?? 0).toFixed(1)}★` },
              { label: 'Pending verifs', value: loadingStats ? '…' : stats?.verifications.pending ?? 0, onClick: () => setTab('verifications') },
            ]} />

            <Box px={8} py={6}>

              {/* Row 1 — Bookings & Revenue over 30 days */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4} mb={4}>

                {/* Bookings per day */}
                <Box bg="white" border="1px solid #E3E8EE" p={5}>
                  <HStack justify="space-between" mb={4}>
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="#94A3B8" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">New Bookings</Text>
                      <Text fontSize="13px" color="#475569" fontFamily="heading" mt={0.5}>Last 30 days</Text>
                    </Box>
                    <Icon as={LucideClipboardList} w="18px" h="18px" color="#CBD5E1" />
                  </HStack>
                  {loadingStats ? (
                    <Box h="180px" display="flex" alignItems="center" justifyContent="center">
                      <Text color="#CBD5E1" fontSize="13px" fontFamily="heading">Loading…</Text>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={stats?.leadsTimeSeries ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#0A80DB" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#0A80DB" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-dm-sans,sans-serif)' }}
                          tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-dm-sans,sans-serif)' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ border: '1px solid #E3E8EE', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-dm-sans,sans-serif)' }}
                          labelStyle={{ color: '#0A2540', fontWeight: 700 }}
                          formatter={(v: any) => [v, 'Bookings']}
                        />
                        <Area type="monotone" dataKey="count" stroke="#0A80DB" strokeWidth={2} fill="url(#colorLeads)" dot={false} activeDot={{ r: 4 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>

                {/* Revenue per day */}
                <Box bg="white" border="1px solid #E3E8EE" p={5}>
                  <HStack justify="space-between" mb={4}>
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="#94A3B8" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">Revenue</Text>
                      <Text fontSize="13px" color="#475569" fontFamily="heading" mt={0.5}>Last 30 days · lead fees</Text>
                    </Box>
                    <Icon as={LucideDollarSign} w="18px" h="18px" color="#CBD5E1" />
                  </HStack>
                  {loadingStats ? (
                    <Box h="180px" display="flex" alignItems="center" justifyContent="center">
                      <Text color="#CBD5E1" fontSize="13px" fontFamily="heading">Loading…</Text>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={stats?.revenueTimeSeries ?? []} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-dm-sans,sans-serif)' }}
                          tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-dm-sans,sans-serif)' }}
                          tickFormatter={v => `$${v}`} />
                        <Tooltip
                          contentStyle={{ border: '1px solid #E3E8EE', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-dm-sans,sans-serif)' }}
                          labelStyle={{ color: '#0A2540', fontWeight: 700 }}
                          formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#colorRev)" dot={false} activeDot={{ r: 4 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </SimpleGrid>

              {/* Row 2 — Bookings by status + User breakdown */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4} mb={4}>

                {/* Bar chart: bookings by status */}
                <Box bg="white" border="1px solid #E3E8EE" p={5}>
                  <HStack justify="space-between" mb={4}>
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="#94A3B8" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">Bookings by status</Text>
                      <Text fontSize="13px" color="#475569" fontFamily="heading" mt={0.5}>{totalLeads} total</Text>
                    </Box>
                    <Icon as={LucideTrendingUp} w="18px" h="18px" color="#CBD5E1" />
                  </HStack>
                  {loadingStats ? (
                    <Box h="180px" display="flex" alignItems="center" justifyContent="center">
                      <Text color="#CBD5E1" fontSize="13px" fontFamily="heading">Loading…</Text>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart
                        data={Object.entries(LEAD_STATUS).map(([key, cfg]) => ({
                          name: cfg.label, count: stats?.leads?.[key] ?? 0, fill: cfg.dot, key,
                        }))}
                        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                        barSize={20}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'var(--font-dm-sans,sans-serif)' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'var(--font-dm-sans,sans-serif)' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ border: '1px solid #E3E8EE', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-dm-sans,sans-serif)' }}
                          cursor={{ fill: '#F6F9FC' }}
                          formatter={(v: any) => [v, 'Bookings']}
                        />
                        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                          {Object.entries(LEAD_STATUS).map(([key, cfg]) => (
                            <Cell key={key} fill={cfg.dot} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>

                {/* Pie chart: users */}
                <Box bg="white" border="1px solid #E3E8EE" p={5}>
                  <HStack justify="space-between" mb={4}>
                    <Box>
                      <Text fontSize="11px" fontWeight="700" color="#94A3B8" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">User breakdown</Text>
                      <Text fontSize="13px" color="#475569" fontFamily="heading" mt={0.5}>{stats?.users.total ?? 0} registered</Text>
                    </Box>
                    <Icon as={LucideUsers} w="18px" h="18px" color="#CBD5E1" />
                  </HStack>
                  {loadingStats ? (
                    <Box h="180px" display="flex" alignItems="center" justifyContent="center">
                      <Text color="#CBD5E1" fontSize="13px" fontFamily="heading">Loading…</Text>
                    </Box>
                  ) : (
                    <Flex align="center" justify="center" gap={8} h="180px">
                      <PieChart width={140} height={140}>
                        <Pie
                          data={[
                            { name: 'Clients',          value: stats?.users.totalClients ?? 0 },
                            { name: 'Cleaners',         value: stats?.users.totalCleaners ?? 0 },
                            { name: 'Unverified',       value: (stats?.users.totalCleaners ?? 0) - (stats?.users.verifiedCleaners ?? 0) },
                          ].filter(d => d.value > 0)}
                          cx={65} cy={65} innerRadius={40} outerRadius={60}
                          dataKey="value" paddingAngle={3}
                        >
                          <Cell fill="#0A80DB" />
                          <Cell fill="#10B981" />
                          <Cell fill="#F59E0B" />
                        </Pie>
                        <Tooltip
                          contentStyle={{ border: '1px solid #E3E8EE', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-dm-sans,sans-serif)' }}
                        />
                      </PieChart>
                      <VStack gap={2} align="flex-start">
                        {[
                          { color: '#0A80DB', label: 'Clients',    value: stats?.users.totalClients ?? 0 },
                          { color: '#10B981', label: 'Verified cleaners',  value: stats?.users.verifiedCleaners ?? 0 },
                          { color: '#F59E0B', label: 'Unverified', value: (stats?.users.totalCleaners ?? 0) - (stats?.users.verifiedCleaners ?? 0) },
                        ].map(item => (
                          <HStack key={item.label} gap={2}>
                            <Box w="8px" h="8px" borderRadius="full" bg={item.color} flexShrink={0} />
                            <Text fontSize="12px" color="#475569" fontFamily="heading">{item.label}</Text>
                            <Text fontSize="12px" fontWeight="700" color="#0A2540" fontFamily="heading">{item.value}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Flex>
                  )}
                </Box>
              </SimpleGrid>

              {/* Row 3 — Recent activity + Top cleaners */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>

                {/* Recent leads */}
                <Box bg="white" border="1px solid #E3E8EE">
                  <Box px={5} py={3} borderBottom="1px solid #E3E8EE">
                    <Text fontSize="11px" fontWeight="700" color="#94A3B8" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">Recent activity</Text>
                  </Box>
                  {(stats?.recentLeads ?? []).map((l, i) => (
                    <HStack
                      key={l.id} px={5} py={3}
                      borderBottom={i < (stats?.recentLeads.length ?? 1) - 1 ? '1px solid #F1F5F9' : 'none'}
                      gap={3}
                    >
                      <Box w="6px" h="6px" borderRadius="full" flexShrink={0}
                        bg={l.status === 'COMPLETED' ? '#10B981' : l.status === 'ACCEPTED' ? '#0A80DB' : l.status === 'CANCELLED' ? '#F43F5E' : '#F59E0B'} />
                      <Box flex={1} minW={0}>
                        <Text fontSize="13px" fontWeight="500" color="#0A2540" fontFamily="heading" lineClamp={1}>
                          {l.serviceType} — {l.client.name || '?'}
                        </Text>
                        <Text fontSize="11px" color="#697386">
                          {l.cleaner ? `Handled by ${l.cleaner.name}` : 'Awaiting a cleaner'}
                        </Text>
                      </Box>
                      <StatusDot status={l.status} />
                    </HStack>
                  ))}
                  {!stats?.recentLeads?.length && (
                    <Box px={5} py={6}><Text fontSize="13px" color="#CBD5E1" fontFamily="heading">No data</Text></Box>
                  )}
                </Box>

                {/* Top cleaners */}
                <Box bg="white" border="1px solid #E3E8EE">
                  <Box px={5} py={3} borderBottom="1px solid #E3E8EE">
                    <Text fontSize="11px" fontWeight="700" color="#94A3B8" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">Top cleaners</Text>
                  </Box>
                  {(stats?.topCleaners ?? []).map((c, i) => (
                    <HStack
                      key={c.cleanerId} px={5} py={3}
                      borderBottom={i < (stats?.topCleaners.length ?? 1) - 1 ? '1px solid #F1F5F9' : 'none'}
                      gap={3}
                    >
                      <Text fontSize="11px" fontWeight="700" color="#CBD5E1" fontFamily="heading" w="16px">{i + 1}</Text>
                      <Box w="28px" h="28px" bg={SIDEBAR_BG} borderRadius="full" flexShrink={0}
                        display="flex" alignItems="center" justifyContent="center" fontSize="10px" fontWeight="700" color="white">
                        {c.cleaner.name?.[0]?.toUpperCase() ?? 'P'}
                      </Box>
                      <Box flex={1} minW={0}>
                        <HStack gap={1.5}>
                          <Text fontSize="13px" fontWeight="500" color="#0A2540" fontFamily="heading" lineClamp={1}>{c.cleaner.name || '—'}</Text>
                          {c.cleaner.isVerified && <Icon as={LucideCheckCircle2} w="12px" h="12px" color="#059669" />}
                        </HStack>
                        <Text fontSize="11px" color="#697386">{c.totalLeads} bookings</Text>
                      </Box>
                      <HStack gap={1}>
                        <Text fontSize="13px" fontWeight="700" color="#F59E0B">★</Text>
                        <Text fontSize="13px" fontWeight="700" color="#0A2540" fontFamily="heading">{c.ratingAvg.toFixed(1)}</Text>
                      </HStack>
                    </HStack>
                  ))}
                  {!stats?.topCleaners?.length && (
                    <Box px={5} py={6}><Text fontSize="13px" color="#CBD5E1" fontFamily="heading">No data</Text></Box>
                  )}
                </Box>

              </SimpleGrid>
            </Box>
          </motion.div>
        )}

        {/* ══ PEDIDOS ══ */}
        {tab === 'leads' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader title="Bookings" sub={`${leadsTotal} bookings total`}>
              <HStack gap={3}>
                <Box position="relative">
                  <Icon as={LucideSearch} w="13px" h="13px" color="slate.400"
                    position="absolute" left="10px" top="50%" style={{ transform: 'translateY(-50%)' }} />
                  <Input value={leadSearch} onChange={e => { setLeadSearch(e.target.value); setLeadPage(0); }}
                    placeholder="Search…" size="sm" pl="30px" borderRadius="4px" w="220px" fontSize="13px" fontFamily="heading" />
                </Box>
              </HStack>
            </PageHeader>

            {/* Status filter bar */}
            <Box bg="white" borderBottom="1px solid #E3E8EE" px={8} py={0}>
              <HStack gap={0} overflowX="auto">
                {[{ key: '', label: 'All', count: totalLeads }, ...Object.entries(LEAD_STATUS).map(([k, v]) => ({ key: k, label: v.label, count: stats?.leads?.[k] ?? 0, dot: v.dot }))].map(item => (
                  <Box
                    key={item.key}
                    as="button"
                    px={4} py={3} cursor="pointer" flexShrink={0}
                    borderBottom="2px solid"
                    borderBottomColor={leadStatus === item.key ? 'brand.500' : 'transparent'}
                    color={leadStatus === item.key ? 'brand.600' : 'slate.500'}
                    fontWeight={leadStatus === item.key ? '600' : '400'}
                    fontSize="13px" fontFamily="heading"
                    transition="all 0.12s"
                    _hover={{ color: 'slate.800' }}
                    onClick={() => { setLeadStatus(item.key); setLeadPage(0); }}
                  >
                    <HStack gap={1.5}>
                      {'dot' in item && <Box w="6px" h="6px" bg={(item as any).dot} borderRadius="full" />}
                      <Text>{item.label}</Text>
                      <Text fontSize="11px" color="slate.400">({item.count})</Text>
                    </HStack>
                  </Box>
                ))}
              </HStack>
            </Box>

            <Box>
              {loadingLeads ? (
                <Box p={12} textAlign="center"><Text color="slate.400" fontFamily="heading">Loading…</Text></Box>
              ) : leads.length === 0 ? (
                <Box p={12} textAlign="center"><Text color="slate.300" fontFamily="heading">No bookings found</Text></Box>
              ) : (
                <Box overflowX="auto" bg="white">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={TH}>ID</th>
                      <th style={TH}>Service</th>
                      <th style={TH}>Client</th>
                      <th style={TH}>Cleaner</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Date</th>
                      <th style={TH}>Amount</th>
                      <th style={{ ...TH, textAlign: 'center' }}>Convs.</th>
                    </tr></thead>
                    <tbody>{leads.map(l => <LeadDetailRow key={l.id} lead={l} />)}</tbody>
                  </table>
                </Box>
              )}

              {leadsTotal > PAGE_SIZE && (
                <Flex align="center" justify="space-between" px={6} py={3} bg="white" borderTop="1px solid #E3E8EE">
                  <Text fontSize="12px" color="slate.400" fontFamily="heading">
                    {leadPage * PAGE_SIZE + 1}–{Math.min((leadPage + 1) * PAGE_SIZE, leadsTotal)} of {leadsTotal}
                  </Text>
                  <HStack gap={2}>
                    <Button size="xs" variant="ghost" borderRadius="4px" disabled={leadPage === 0} onClick={() => setLeadPage(p => p - 1)}>
                      <Icon as={LucideChevronLeft} w={3.5} h={3.5} />
                    </Button>
                    <Text fontSize="12px" fontFamily="heading" color="slate.600" fontWeight="600">Page {leadPage + 1} of {Math.ceil(leadsTotal / PAGE_SIZE)}</Text>
                    <Button size="xs" variant="ghost" borderRadius="4px" disabled={(leadPage + 1) * PAGE_SIZE >= leadsTotal} onClick={() => setLeadPage(p => p + 1)}>
                      <Icon as={LucideChevronRight} w={3.5} h={3.5} />
                    </Button>
                  </HStack>
                </Flex>
              )}
            </Box>
          </motion.div>
        )}

        {/* ══ VERIFICAÇÕES ══ */}
        {tab === 'verifications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader title="Verifications" sub="Documents submitted by cleaners" />

            <Box bg="white" borderBottom="1px solid #E3E8EE" px={8} py={0}>
              <HStack gap={0}>
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => {
                  const count = f === 'ALL' ? verifications.length : verifications.filter(v => v.status === f).length;
                  return (
                    <Box key={f} as="button" px={4} py={3} cursor="pointer" flexShrink={0}
                      borderBottom="2px solid" borderBottomColor={verifFilter === f ? 'brand.500' : 'transparent'}
                      color={verifFilter === f ? 'brand.600' : 'slate.500'}
                      fontWeight={verifFilter === f ? '600' : '400'}
                      fontSize="13px" fontFamily="heading" transition="all 0.12s" _hover={{ color: 'slate.800' }}
                      onClick={() => setVF(f)}>
                      {f === 'ALL' ? `All (${count})` : f === 'PENDING' ? `Pending (${count})` : f === 'APPROVED' ? `Approved (${count})` : `Rejected (${count})`}
                    </Box>
                  );
                })}
              </HStack>
            </Box>

            <Box bg="white">
              {loadingVerifs ? (
                <Box p={12} textAlign="center"><Text color="slate.400" fontFamily="heading">Loading…</Text></Box>
              ) : filteredVerifs.length === 0 ? (
                <Box p={12} textAlign="center"><Text color="slate.300" fontFamily="heading">No verifications found</Text></Box>
              ) : (
                <Box overflowX="auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={TH}>Cleaner</th>
                      <th style={TH}>Document</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Date</th>
                      <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
                    </tr></thead>
                    <tbody>{filteredVerifs.map(v => <VerifRow key={v.id} v={v} onAction={fetchVerifs} />)}</tbody>
                  </table>
                </Box>
              )}
            </Box>
          </motion.div>
        )}

        {/* ══ USUÁRIOS ══ */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader title="Users" sub={`${users.length} accounts`}>
              <Box position="relative">
                <Icon as={LucideSearch} w="13px" h="13px" color="slate.400"
                  position="absolute" left="10px" top="50%" style={{ transform: 'translateY(-50%)' }} />
                <Input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search…" size="sm" pl="30px" borderRadius="4px" w="220px" fontSize="13px" fontFamily="heading" />
              </Box>
            </PageHeader>

            <Box bg="white" borderBottom="1px solid #E3E8EE" px={8} py={0}>
              <HStack gap={0}>
                {(['ALL', 'CLIENT', 'CLEANER'] as const).map(r => (
                  <Box key={r} as="button" px={4} py={3} cursor="pointer" flexShrink={0}
                    borderBottom="2px solid" borderBottomColor={roleFilter === r ? 'brand.500' : 'transparent'}
                    color={roleFilter === r ? 'brand.600' : 'slate.500'}
                    fontWeight={roleFilter === r ? '600' : '400'}
                    fontSize="13px" fontFamily="heading" transition="all 0.12s" _hover={{ color: 'slate.800' }}
                    onClick={() => setRoleFilter(r)}>
                    {r === 'ALL' ? `All (${users.length})` : r === 'CLIENT' ? `Clients (${users.filter(u => u.role === 'CLIENT').length})` : `Cleaners (${users.filter(u => u.role === 'CLEANER').length})`}
                  </Box>
                ))}
              </HStack>
            </Box>

            <Box bg="white">
              {loadingUsers ? (
                <Box p={12} textAlign="center"><Text color="slate.400" fontFamily="heading">Loading…</Text></Box>
              ) : filteredUsers.length === 0 ? (
                <Box p={12} textAlign="center"><Text color="slate.300" fontFamily="heading">No users found</Text></Box>
              ) : (
                <Box overflowX="auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={TH}>User</th>
                      <th style={TH}>Type</th>
                      <th style={TH}>Location</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Joined</th>
                      <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
                    </tr></thead>
                    <tbody>{filteredUsers.map(u => <UserTableRow key={u.id} user={u} onRefresh={fetchUsers} />)}</tbody>
                  </table>
                </Box>
              )}
            </Box>
          </motion.div>
        )}

        {/* ══ AVALIAÇÕES ══ */}
        {tab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader
              title="Reviews"
              sub={`${reviews.length} reviews · avg ${(reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0).toFixed(1)}★`}
            />

            <Box bg="white" borderBottom="1px solid #E3E8EE" px={8} py={0}>
              <HStack gap={0}>
                <Box as="button" px={4} py={3} cursor="pointer"
                  borderBottom="2px solid" borderBottomColor={revFilter === 0 ? 'brand.500' : 'transparent'}
                  color={revFilter === 0 ? 'brand.600' : 'slate.500'} fontWeight={revFilter === 0 ? '600' : '400'}
                  fontSize="13px" fontFamily="heading" transition="all 0.12s" _hover={{ color: 'slate.800' }}
                  onClick={() => setRevFilter(0)}>
                  All ({reviews.length})
                </Box>
                {[5, 4, 3, 2, 1].map(star => (
                  <Box key={star} as="button" px={4} py={3} cursor="pointer"
                    borderBottom="2px solid" borderBottomColor={revFilter === star ? 'brand.500' : 'transparent'}
                    color={revFilter === star ? 'brand.600' : 'slate.500'} fontWeight={revFilter === star ? '600' : '400'}
                    fontSize="13px" fontFamily="heading" transition="all 0.12s" _hover={{ color: 'slate.800' }}
                    onClick={() => setRevFilter(star)}>
                    {star}★ ({reviews.filter(r => r.rating === star).length})
                  </Box>
                ))}
              </HStack>
            </Box>

            <Box bg="white">
              {loadingRevs ? (
                <Box p={12} textAlign="center"><Text color="slate.400" fontFamily="heading">Loading…</Text></Box>
              ) : filteredRevs.length === 0 ? (
                <Box p={12} textAlign="center"><Text color="slate.300" fontFamily="heading">No reviews found</Text></Box>
              ) : (
                <Box overflowX="auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={TH}>Client</th>
                      <th style={TH}>Cleaner</th>
                      <th style={TH}>Service</th>
                      <th style={TH}>Rating</th>
                      <th style={TH}>Comment</th>
                      <th style={TH}>Date</th>
                    </tr></thead>
                    <tbody>
                      {filteredRevs.map(r => (
                        <tr key={r.id}>
                          <td style={TD}>
                            <Text fontSize="13px" fontWeight="500" color="slate.800" fontFamily="heading">{r.client.name || '—'}</Text>
                            <Text fontSize="11px" color="slate.400">{r.client.email}</Text>
                          </td>
                          <td style={TD}>
                            <HStack gap={1.5}>
                              <Text fontSize="13px" fontWeight="500" color="slate.800" fontFamily="heading">{r.cleaner.name || '—'}</Text>
                              {r.cleaner.isVerified && <Icon as={LucideCheckCircle2} w="12px" h="12px" color="#059669" />}
                            </HStack>
                          </td>
                          <td style={TD}>
                            <Text fontSize="13px" color="slate.600" fontFamily="heading">{r.lead.serviceType}</Text>
                            <Text fontSize="11px" color="slate.400" lineClamp={1}>{r.lead.address}</Text>
                          </td>
                          <td style={TD}>
                            <Stars n={r.rating} />
                            <Text fontSize="11px" fontWeight="700" color="#92400E" fontFamily="heading">{r.rating}/5</Text>
                          </td>
                          <td style={{ ...TD, maxWidth: 240 }}>
                            <Text fontSize="12px" color="slate.600" lineClamp={2}>{r.comment || '—'}</Text>
                          </td>
                          <td style={TD}>
                            <Text fontSize="12px" color="slate.400" fontFamily="heading" whiteSpace="nowrap">
                              {new Date(r.createdAt).toLocaleDateString('en-US')}
                            </Text>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </Box>
          </motion.div>
        )}

        {/* ══ PREÇOS DOS PLANOS ══ */}
        {tab === 'pricing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader title="Plan Pricing" sub="View and update monthly subscription prices" />
            <Box px={8} py={6} maxW="720px">
              <PlanPricingPanel />
            </Box>
          </motion.div>
        )}

        {/* ══ LEAD PRICES ══ */}
        {tab === 'lead-pricing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader title="Lead Prices" sub="Configure base lead fees and dynamic multipliers" />
            <Box px={8} py={6} maxW="760px">
              <LeadPricingPanel />
            </Box>
          </motion.div>
        )}

        {/* ══ MEUS DADOS ══ */}
        {tab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader title="My Settings" sub="Update your administrator information" />
            <Box px={8} py={6} maxW="600px">
              <AdminSettingsForm />
            </Box>
          </motion.div>
        )}

      </Box>
    </Flex>
  );
}

// ─── AdminSettingsForm ────────────────────────────────────────────────────────

function AdminSettingsForm() {
  const { data: session, update } = useSession();
  const [name,     setName]     = useState(session?.user?.name ?? '');
  const [email,    setEmail]    = useState(session?.user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [saving,   setSaving]   = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirm) {
      toaster.create({ title: 'Passwords do not match', type: 'error' }); return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = { name, email };
      if (password) body.newPassword = password;
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Error saving');
      }
      await update({ name, email });
      setPassword(''); setConfirm('');
      toaster.create({ title: 'Profile updated!', type: 'success' });
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally { setSaving(false); }
  };

  return (
    <Box bg="white" border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
      {/* Section header */}
      <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
        <HStack gap={2}>
          <Icon as={LucideUser} w={4} h={4} color="brand.500" />
          <Text fontSize="10.5px" fontWeight={700} color="#697386"
            textTransform="uppercase" letterSpacing="0.07em" fontFamily="heading">
            Personal information
          </Text>
        </HStack>
      </Box>

      <Box as="form" p={6} onSubmit={handleSave}>
        <VStack gap={5} align="stretch">

          {/* Name */}
          <Box>
            <Text fontSize="xs" fontWeight="700" color="slate.500" mb={2}
              textTransform="uppercase" letterSpacing="wider">Name</Text>
            <Input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name"
              bg="slate.50" border="1px solid" borderColor="slate.200"
              borderRadius="4px" h="11" fontSize="sm"
              _focus={{ bg: 'white', borderColor: 'brand.300' }} required
            />
          </Box>

          {/* Email */}
          <Box>
            <Text fontSize="xs" fontWeight="700" color="slate.500" mb={2}
              textTransform="uppercase" letterSpacing="wider">Email</Text>
            <Input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@email.com"
              bg="slate.50" border="1px solid" borderColor="slate.200"
              borderRadius="4px" h="11" fontSize="sm"
              _focus={{ bg: 'white', borderColor: 'brand.300' }} required
            />
          </Box>

          {/* Divider */}
          <Box borderTop="1px solid #E3E8EE" pt={4}>
            <Text fontSize="10.5px" fontWeight={700} color="#697386"
              textTransform="uppercase" letterSpacing="0.07em" fontFamily="heading" mb={4}>
              CHANGE PASSWORD (optional)
            </Text>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="700" color="slate.500" mb={2}
                  textTransform="uppercase" letterSpacing="wider">New password</Text>
                <Input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  bg="slate.50" border="1px solid" borderColor="slate.200"
                  borderRadius="4px" h="11" fontSize="sm"
                  _focus={{ bg: 'white', borderColor: 'brand.300' }}
                />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="700" color="slate.500" mb={2}
                  textTransform="uppercase" letterSpacing="wider">Confirm password</Text>
                <Input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  bg="slate.50" border="1px solid" borderColor="slate.200"
                  borderRadius="4px" h="11" fontSize="sm"
                  _focus={{ bg: 'white', borderColor: 'brand.300' }}
                  disabled={!password}
                />
              </Box>
            </VStack>
          </Box>

          <Button
            type="submit"
            bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
            _hover={{ bg: '#0870C2' }} transition="background 0.15s"
            loading={saving} loadingText="Saving…"
            alignSelf="flex-start" px={6}>
            <Icon as={LucideSave} w={4} h={4} mr={2} />
            Save changes
          </Button>

        </VStack>
      </Box>
    </Box>
  );
}

// ─── PlanPricingPanel ─────────────────────────────────────────────────────────

interface PlanConfigRow { id: string; price: number; updatedAt?: string }

const PLAN_META: Record<string, { name: string; color: string; badge: string; perks: string[] }> = {
  BASIC: {
    name: 'Basic', color: '#0A80DB', badge: 'Popular',
    perks: ['Wave 1 + Wave 2', '+15 CFS ranking points', '60 mi radius', 'Verified profile badge'],
  },
  PRO: {
    name: 'Pro', color: '#D97706', badge: 'Max',
    perks: ['Top of CFS ranking', '+30 guaranteed points', 'Instant Book eligible', '110 mi radius', 'Top Cleaner badge'],
  },
};

function PlanPricingPanel() {
  const [configs,  setConfigs]  = useState<PlanConfigRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<string | null>(null);
  const [draft,    setDraft]    = useState('');
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/plan-config');
      if (r.ok) { const data = await r.json(); if (Array.isArray(data)) setConfigs(data); }
      else toaster.create({ title: 'Error loading prices', type: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (row: PlanConfigRow) => { setEditing(row.id); setDraft(String(row.price)); };
  const cancelEdit = () => { setEditing(null); setDraft(''); };

  const save = async (id: string) => {
    const price = parseFloat(draft);
    if (!price || price < 1 || isNaN(price)) {
      toaster.create({ title: 'Enter a valid amount (minimum $1)', type: 'error' }); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/plan-config', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, price }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error');
      const updated: PlanConfigRow = await res.json();
      setConfigs(prev => prev.map(c => c.id === id ? updated : c));
      setEditing(null);
      toaster.create({ title: `${PLAN_META[id]?.name ?? id} plan price updated`, type: 'success' });
    } catch (e: any) {
      toaster.create({ title: e.message ?? 'Error saving', type: 'error' });
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <Box bg="white" border="1px solid #E3E8EE" p={12} textAlign="center">
        <Text fontSize="13px" color="slate.400" fontFamily="heading">Loading prices…</Text>
      </Box>
    );
  }

  return (
    <VStack gap={4} align="stretch">

      {/* Plan cards */}
      {(['BASIC', 'PRO'] as const).map(planId => {
        const meta = PLAN_META[planId];
        const row  = configs.find(c => c.id === planId);
        const isEdit = editing === planId;

        return (
          <Box key={planId} bg="white" border="1px solid #E3E8EE" overflow="hidden" position="relative">
            {/* Left accent */}
            <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={meta.color} />

            {/* Header row */}
            <Flex px={6} pl={8} py={4} align="center" justify="space-between" gap={4} borderBottom="1px solid #F1F5F9">
              <Box>
                <HStack gap={2} mb={0.5}>
                  <Text fontSize="15px" fontWeight="800" color="slate.900" fontFamily="heading" letterSpacing="-0.02em">
                    {meta.name}
                  </Text>
                  <Text style={{
                    fontSize: '9.5px', fontWeight: 700, padding: '2px 6px',
                    background: `${meta.color}18`, color: meta.color,
                    borderRadius: 2, fontFamily: 'var(--font-dm-sans,sans-serif)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {meta.badge}
                  </Text>
                </HStack>
                <Text fontSize="11px" color="slate.400" fontFamily="heading">
                  Billed monthly via Stripe
                  {row?.updatedAt && ` · updated ${new Date(row.updatedAt).toLocaleDateString('en-US')}`}
                </Text>
              </Box>

              {/* Price / edit */}
              {isEdit ? (
                <HStack gap={2} flexShrink={0}>
                  <Text fontSize="14px" color="slate.500" fontWeight="700" fontFamily="heading">$</Text>
                  <Input
                    type="number" value={draft} min={1} step={1}
                    onChange={e => setDraft(e.target.value)}
                    w="90px" size="sm" borderRadius="4px" fontFamily="heading" fontWeight="700"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') save(planId);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <Text fontSize="12px" color="slate.400" fontFamily="heading">/mo</Text>
                  <Button size="sm" bg="brand.500" color="white" borderRadius="4px"
                    loading={saving} loadingText="…" onClick={() => save(planId)}
                    fontFamily="heading" fontWeight="600" fontSize="12px" px={3}>
                    <Icon as={LucideSave} w={3.5} h={3.5} mr={1.5} />Save
                  </Button>
                  <Button size="sm" variant="ghost" borderRadius="4px" color="slate.400"
                    onClick={cancelEdit} px={2}>
                    <Icon as={LucideX} w={3.5} h={3.5} />
                  </Button>
                </HStack>
              ) : (
                <HStack gap={3} flexShrink={0}>
                  <Box textAlign="right">
                    <Text fontSize="26px" fontWeight="800" fontFamily="heading"
                      letterSpacing="-0.04em" color="slate.900" lineHeight={1}>
                      ${row?.price ?? '—'}
                      <Text as="span" fontSize="13px" fontWeight="500" color="slate.400">/mo</Text>
                    </Text>
                  </Box>
                  <Button size="sm" variant="outline" borderColor="slate.200" color="slate.500"
                    borderRadius="4px" fontWeight="600" fontSize="12px" fontFamily="heading"
                    _hover={{ borderColor: 'brand.300', color: 'brand.600', bg: 'brand.50' }}
                    onClick={() => startEdit({ id: planId, price: row?.price ?? 0 })}>
                    <Icon as={LucidePencil} w={3.5} h={3.5} mr={1.5} />Edit
                  </Button>
                </HStack>
              )}
            </Flex>

            {/* Perks */}
            <Box px={8} py={3} bg="#FAFAFA">
              <HStack gap={5} flexWrap="wrap">
                {meta.perks.map(perk => (
                  <HStack key={perk} gap={1.5}>
                    <Box w="5px" h="5px" borderRadius="full" bg={meta.color} flexShrink={0} />
                    <Text fontSize="12px" color="slate.600" fontFamily="heading">{perk}</Text>
                  </HStack>
                ))}
              </HStack>
            </Box>
          </Box>
        );
      })}

      {/* Info callout */}
      <Box p={4} bg="#F6F9FC" border="1px solid #E3E8EE">
        <HStack gap={3} align="start">
          <Text fontSize="16px" flexShrink={0}>✅</Text>
          <VStack gap={1} align="start">
            <Text fontSize="12.5px" fontWeight="700" color="#0A80DB" fontFamily="heading">
              Edit prices here only — Stripe uses this price automatically
            </Text>
            <Text fontSize="12px" color="#0A80DB" fontFamily="heading" lineHeight={1.6}>
              New subscribers always pay the current price on this page. No changes needed in Stripe.
              <strong>Active subscriptions</strong> keep their original price (standard subscription behavior).
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Refresh button */}
      <Flex justify="flex-end">
        <Button size="sm" variant="ghost" color="slate.400" borderRadius="4px" fontFamily="heading"
          _hover={{ color: '#0A80DB', bg: 'rgba(26,127,160,0.06)' }}
          onClick={load}>
          <Icon as={LucideRefreshCw} w={3.5} h={3.5} mr={1.5} />Refresh
        </Button>
      </Flex>

    </VStack>
  );
}

// ─── LeadPricingPanel ─────────────────────────────────────────────────────────

const SERVICE_META: { id: string; label: string; range: string }[] = [
  { id: 'standard',           label: 'Standard Clean',            range: '$8–$12' },
  { id: 'deep',               label: 'Deep Clean',                range: '$15–$25' },
  { id: 'post-work',          label: 'Post-Construction',         range: '$25–$40' },
  { id: 'moving',             label: 'Move In / Move Out',        range: '$25–$40' },
  { id: 'deck-cleaning',      label: 'Deck Cleaning',             range: '$10–$18' },
  { id: 'pressure-washing',   label: 'Pressure Washing',          range: '$12–$20' },
  { id: 'gutter-cleaning',    label: 'Gutter Cleaning',           range: '$15–$25' },
  { id: 'flashing-cleaning',  label: 'Flashing Cleaning',         range: '$10–$18' },
  { id: 'tile-grout',         label: 'Tile & Grout Cleaning',     range: '$12–$20' },
  { id: 'home-organizing',    label: 'Home Organizing',           range: '$15–$25' },
  { id: 'garage-attic',       label: 'Garage / Basement / Attic', range: '$15–$25' },
  { id: 'commercial',         label: 'Commercial Cleaning',       range: '$25–$40' },
];


type LeadPriceRow      = { id: string; price: number };
type LeadPlatformRow   = { id: string; value: string };

function LeadPricingPanel() {
  const [prices,    setPrices]    = useState<LeadPriceRow[]>([]);
  const [platform,  setPlatform]  = useState<LeadPlatformRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [draft,     setDraft]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [zipsEdit,  setZipsEdit]  = useState(false);
  const [zipsDraft, setZipsDraft] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lead-config');
      if (res.ok) {
        const data = await res.json();
        setPrices(data.prices ?? []);
        setPlatform(data.platform ?? []);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const savePrice = async (id: string) => {
    const price = parseFloat(draft);
    if (isNaN(price) || price < 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/lead-config', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'price', id, price }),
      });
      if (!res.ok) throw new Error();
      toaster.create({ title: 'Price updated', type: 'success' });
      await load();
      setEditId(null);
    } catch { toaster.create({ title: 'Error saving price', type: 'error' }); }
    finally { setSaving(false); }
  };

  const savePlatform = async (id: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/lead-config', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'platform', id, value }),
      });
      if (!res.ok) throw new Error();
      toaster.create({ title: 'Saved', type: 'success' });
      await load();
      setEditId(null);
      setZipsEdit(false);
    } catch { toaster.create({ title: 'Error saving', type: 'error' }); }
    finally { setSaving(false); }
  };

  const getPlatformValue = (id: string) => platform.find(p => p.id === id)?.value ?? '';

  if (loading) {
    return (
      <VStack gap={3} align="stretch">
        {[1, 2, 3].map(i => <Box key={i} h="56px" bg="slate.100" borderRadius="4px" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />)}
      </VStack>
    );
  }

  const coverageRaw = getPlatformValue('coverage_zips');
  const coverageZips: string[] = (() => { try { return JSON.parse(coverageRaw); } catch { return []; } })();

  return (
    <VStack gap={6} align="stretch">

      {/* ── Base Lead Fees ── */}
      <Box>
        <Text fontSize="13px" fontWeight="700" color="slate.500" fontFamily="heading"
          letterSpacing="0.08em" textTransform="uppercase" mb={3}>
          Base Lead Fees
        </Text>
        <VStack gap={0} align="stretch" border="1px solid" borderColor="slate.200">
          {SERVICE_META.map((svc, i) => {
            const row = prices.find(p => p.id === svc.id);
            const isEditing = editId === svc.id;
            return (
              <Flex
                key={svc.id}
                align="center" justify="space-between"
                px={5} py={4}
                bg="white"
                borderBottom={i < SERVICE_META.length - 1 ? '1px solid' : 'none'}
                borderColor="slate.100"
              >
                <Box>
                  <Text fontSize="14px" fontWeight="600" color="slate.900" fontFamily="heading">{svc.label}</Text>
                  <Text fontSize="11px" color="slate.400" fontFamily="heading">Suggested range: {svc.range}</Text>
                </Box>
                {isEditing ? (
                  <HStack gap={2}>
                    <Text fontSize="14px" color="slate.400" fontFamily="heading">$</Text>
                    <Input
                      type="number" value={draft}
                      onChange={e => setDraft(e.target.value)}
                      w="80px" size="sm" borderRadius="4px" fontFamily="heading" fontWeight="700"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') savePrice(svc.id);
                        if (e.key === 'Escape') setEditId(null);
                      }}
                    />
                    <Button size="sm" bg="brand.500" color="white" borderRadius="4px"
                      loading={saving} loadingText="…" onClick={() => savePrice(svc.id)}
                      fontFamily="heading" fontWeight="600" fontSize="12px" px={3}>
                      <Icon as={LucideSave} w={3.5} h={3.5} mr={1.5} />Save
                    </Button>
                    <Button size="sm" variant="ghost" borderRadius="4px" color="slate.400"
                      onClick={() => setEditId(null)} px={2}>
                      <Icon as={LucideX} w={3.5} h={3.5} />
                    </Button>
                  </HStack>
                ) : (
                  <HStack gap={3}>
                    <Text fontSize="24px" fontWeight="800" fontFamily="heading"
                      letterSpacing="-0.04em" color="slate.900">
                      ${row?.price ?? '—'}
                    </Text>
                    <Button size="sm" variant="outline" borderColor="slate.200" color="slate.500"
                      borderRadius="4px" fontWeight="600" fontSize="12px" fontFamily="heading"
                      _hover={{ borderColor: 'brand.300', color: 'brand.600', bg: 'brand.50' }}
                      onClick={() => { setEditId(svc.id); setDraft(String(row?.price ?? '')); }}>
                      <Icon as={LucidePencil} w={3.5} h={3.5} mr={1.5} />Edit
                    </Button>
                  </HStack>
                )}
              </Flex>
            );
          })}
        </VStack>
      </Box>

      {/* ── Coverage ZIPs ── */}
      <Box>
        <Flex justify="space-between" align="center" mb={3}>
          <Box>
            <Text fontSize="13px" fontWeight="700" color="slate.500" fontFamily="heading"
              letterSpacing="0.08em" textTransform="uppercase">
              Coverage ZIP Codes
            </Text>
            <Text fontSize="11px" color="slate.400" fontFamily="heading" mt={0.5}>
              {coverageZips.length === 0
                ? 'Empty = all ZIP codes accepted'
                : `${coverageZips.length} ZIP${coverageZips.length === 1 ? '' : 's'} configured`}
            </Text>
          </Box>
          {!zipsEdit && (
            <Button size="sm" variant="outline" borderColor="slate.200" color="slate.500"
              borderRadius="4px" fontWeight="600" fontSize="12px" fontFamily="heading"
              _hover={{ borderColor: 'brand.300', color: 'brand.600', bg: 'brand.50' }}
              onClick={() => {
                setZipsEdit(true);
                setZipsDraft(coverageZips.join('\n'));
              }}>
              <Icon as={LucidePencil} w={3.5} h={3.5} mr={1.5} />Edit
            </Button>
          )}
        </Flex>

        {zipsEdit ? (
          <VStack gap={2} align="stretch">
            <Textarea
              value={zipsDraft}
              onChange={e => setZipsDraft(e.target.value)}
              placeholder={"Enter one ZIP code per line, e.g.:\n33101\n33102\n10001"}
              rows={6}
              borderRadius="4px"
              fontFamily="heading"
              fontSize="13px"
              bg="#F6F9FC"
            />
            <Text fontSize="11px" color="slate.400" fontFamily="heading">
              One ZIP code per line. Leave empty to accept all areas.
            </Text>
            <HStack gap={2}>
              <Button size="sm" bg="brand.500" color="white" borderRadius="4px"
                loading={saving} loadingText="Saving…"
                fontFamily="heading" fontWeight="600" fontSize="12px" px={4}
                onClick={() => {
                  const zips = zipsDraft
                    .split(/[\n,\s]+/)
                    .map(z => z.trim())
                    .filter(z => /^\d{5}$/.test(z));
                  savePlatform('coverage_zips', JSON.stringify(zips));
                }}>
                <Icon as={LucideSave} w={3.5} h={3.5} mr={1.5} />Save Coverage
              </Button>
              <Button size="sm" variant="ghost" borderRadius="4px" color="slate.400"
                onClick={() => setZipsEdit(false)} px={3}>
                Cancel
              </Button>
            </HStack>
          </VStack>
        ) : (
          <Box border="1px solid" borderColor="slate.200" bg="white" p={4} minH="48px">
            {coverageZips.length === 0 ? (
              <Text fontSize="13px" color="slate.400" fontFamily="heading" fontStyle="italic">
                All areas accepted (no restriction)
              </Text>
            ) : (
              <Flex gap={2} flexWrap="wrap">
                {coverageZips.map(z => (
                  <Box key={z} px={2} py={0.5} bg="brand.50" border="1px solid" borderColor="brand.200">
                    <Text fontSize="12px" fontWeight="600" color="brand.700" fontFamily="heading">{z}</Text>
                  </Box>
                ))}
              </Flex>
            )}
          </Box>
        )}
      </Box>

      {/* Info callout */}
      <Box p={4} bg="#F6F9FC" border="1px solid #E3E8EE">
        <HStack gap={3} align="start">
          <Text fontSize="16px" flexShrink={0}>💡</Text>
          <VStack gap={1} align="start">
            <Text fontSize="12.5px" fontWeight="700" color="#0A80DB" fontFamily="heading">
              How lead pricing works
            </Text>
            <Text fontSize="12px" color="#0A80DB" fontFamily="heading" lineHeight={1.6}>
              The base price is charged to the cleaner who accepts the lead.
              Prices are randomly picked within each service range at lead creation.
              ZIP coverage, when configured, restricts which areas can submit leads.
            </Text>
          </VStack>
        </HStack>
      </Box>

      <Flex justify="flex-end">
        <Button size="sm" variant="ghost" color="slate.400" borderRadius="4px" fontFamily="heading"
          _hover={{ color: '#0A80DB', bg: 'rgba(26,127,160,0.06)' }}
          onClick={load}>
          <Icon as={LucideRefreshCw} w={3.5} h={3.5} mr={1.5} />Refresh
        </Button>
      </Flex>

    </VStack>
  );
}
