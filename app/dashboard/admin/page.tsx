'use client';

import {
  Box, VStack, HStack, Text, Button, Icon, Flex,
  Textarea, SimpleGrid, Input,
} from '@chakra-ui/react';
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
  LucideCheckCircle2, LucideMapPin, LucidePhone, LucideCalendar,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'leads' | 'verifications' | 'users' | 'reviews';

interface StatsData {
  users:         { totalClients: number; totalCleaners: number; verifiedCleaners: number; total: number };
  leads:         Record<string, number>;
  verifications: { pending: number };
  reviews:       { total: number; avgRating: number };
  recentLeads:   { id: string; serviceType: string; status: string; createdAt: string; client: { name: string | null }; cleaner: { name: string | null } | null }[];
  topCleaners:   { cleanerId: string; ratingAvg: number; totalLeads: number; cleaner: { name: string | null; email: string; isVerified: boolean } }[];
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
  isVerified: boolean; suspendedUntil: string | null;
  createdAt: string; plan: string;
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
  NEW:       { label: 'Novo',              color: '#92400E', dot: '#F59E0B' },
  WAVE1:     { label: 'Buscando',          color: '#1E40AF', dot: '#60A5FA' },
  WAVE2:     { label: 'Buscando',          color: '#1E40AF', dot: '#60A5FA' },
  WAVE3:     { label: 'Última onda',       color: '#1E40AF', dot: '#60A5FA' },
  IN_REVIEW: { label: 'Aguardando',        color: '#0369A1', dot: '#38BDF8' },
  ACCEPTED:  { label: 'Aceito',           color: '#0F4F67', dot: '#1A7FA0' },
  COMPLETED: { label: 'Concluído',        color: '#047857', dot: '#10B981' },
  CANCELLED: { label: 'Cancelado',        color: '#BE123C', dot: '#F43F5E' },
  UNMATCHED: { label: 'Sem profissional', color: '#475569', dot: '#94A3B8' },
};

const TH: React.CSSProperties = {
  padding: '9px 16px',
  textAlign: 'left',
  fontSize: '10.5px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#94A3B8',
  borderBottom: '1px solid #E2E8F0',
  background: '#F8FAFC',
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
  return <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? '#F59E0B' : '#E2E8F0', fontSize: 13 }}>★</span>)}</span>;
}

function isSuspended(u: UserRow) { return !!u.suspendedUntil && new Date(u.suspendedUntil) > new Date(); }

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV: { id: Tab; label: string; icon: any; section?: string }[] = [
  { id: 'overview',      label: 'Visão Geral',   icon: LucideLayoutDashboard, section: 'PLATAFORMA' },
  { id: 'leads',         label: 'Pedidos',        icon: LucideClipboardList },
  { id: 'verifications', label: 'Verificações',   icon: LucideShield,          section: 'CADASTROS' },
  { id: 'users',         label: 'Usuários',       icon: LucideUsers },
  { id: 'reviews',       label: 'Avaliações',     icon: LucideStar },
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
          <Box
            w="30px" h="30px" borderRadius="6px"
            bg="brand.500"
            display="flex" alignItems="center" justifyContent="center"
            flexShrink={0}
          >
            <Icon as={LucideShield} w={3.5} h={3.5} color="white" />
          </Box>
          <Box>
            <Text fontWeight="700" fontSize="13.5px" color="white" fontFamily="heading" letterSpacing="-0.02em">
              BrazilianClean
            </Text>
            <Text fontSize="9.5px" fontWeight="700" color="brand.400" letterSpacing="0.12em" fontFamily="heading">
              ADMIN
            </Text>
          </Box>
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
                _hover={{ color: '#E2E8F0', bg: 'rgba(255,255,255,0.04)' }}
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
            <Text fontSize="10px" color="#475569" fontFamily="heading">Administrador</Text>
          </Box>
        </HStack>
        <HStack gap={1} mt={1}>
          <Box
            as="button" w="full" display="flex" alignItems="center" gap={2}
            px={3} py={2} cursor="pointer" color="#6B7280" fontSize="12px"
            fontFamily="heading" fontWeight="500" borderRadius="0"
            transition="color 0.12s"
            _hover={{ color: '#E2E8F0' }}
            onClick={onRefresh}
          >
            <Icon as={LucideRefreshCw} w={3} h={3} />
            Atualizar dados
          </Box>
        </HStack>
        <Box
          as="button" w="full" display="flex" alignItems="center" gap={2}
          px={3} py={2} cursor="pointer" color="#6B7280" fontSize="12px"
          fontFamily="heading" fontWeight="500" borderRadius="0"
          transition="color 0.12s"
          _hover={{ color: '#F43F5E' }}
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
        >
          <Icon as={LucideLogOut} w={3} h={3} />
          Sair da conta
        </Box>
      </Box>
    </Box>
  );
}

// ─── UserTableRow ─────────────────────────────────────────────────────────────

function UserTableRow({ user, onRefresh }: { user: UserRow; onRefresh: () => void }) {
  const [editing, setEditing]     = useState(false);
  const [name, setName]           = useState(user.name ?? '');
  const [email, setEmail]         = useState(user.email);
  const [phone, setPhone]         = useState(user.phone ?? '');
  const [suspendDays, setSuspDays] = useState(7);
  const [loading, setLoading]     = useState(false);
  const suspended = isSuspended(user);

  const call = async (body: object) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toaster.create({ title: 'Atualizado', type: 'success' });
      onRefresh();
    } catch { toaster.create({ title: 'Erro', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Deletar ${user.email}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toaster.create({ title: 'Usuário deletado', type: 'success' });
      onRefresh();
    } catch { toaster.create({ title: 'Erro ao deletar', type: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <tr>
      <td style={TD}>
        {editing ? (
          <VStack gap={1.5} align="stretch">
            <Input size="sm" value={name}  onChange={e => setName(e.target.value)}  placeholder="Nome"  borderRadius="4px" />
            <Input size="sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" borderRadius="4px" />
            <Input size="sm" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Tel"   borderRadius="4px" />
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
          {user.role === 'CLEANER' ? 'Profissional' : 'Cliente'}
        </Text>
      </td>
      <td style={TD}>
        {suspended
          ? <span style={{ fontSize: 12, fontWeight: 600, color: '#BE123C', fontFamily: 'var(--font-dm-sans,sans-serif)' }}>Suspenso até {new Date(user.suspendedUntil!).toLocaleDateString('pt-BR')}</span>
          : user.isVerified
          ? <span style={{ fontSize: 12, fontWeight: 600, color: '#047857', fontFamily: 'var(--font-dm-sans,sans-serif)' }}>Ativo</span>
          : <span style={{ fontSize: 12, fontWeight: 600, color: '#92400E', fontFamily: 'var(--font-dm-sans,sans-serif)' }}>Pendente</span>
        }
      </td>
      <td style={TD}>
        <Text fontSize="12px" color="slate.400" fontFamily="heading">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</Text>
      </td>
      <td style={{ ...TD, textAlign: 'right' }}>
        <HStack gap={1} justify="flex-end">
          {editing ? (
            <>
              <Button size="xs" bg="brand.500" color="white" borderRadius="4px" loading={loading}
                onClick={() => { call({ name, email, phone }); setEditing(false); }}>
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
              <Icon as={LucideUnlock} w={3} h={3} color="green.500" />
            </Button>
          ) : (
            <HStack gap={1}>
              <Input size="xs" type="number" value={suspendDays} min={1} max={365}
                onChange={e => setSuspDays(Number(e.target.value))}
                w="40px" borderRadius="4px" textAlign="center" fontSize="11px" />
              <Text fontSize="10px" color="slate.400">d</Text>
              <Button size="xs" variant="ghost" borderRadius="4px" loading={loading}
                onClick={() => call({ action: 'suspend', suspendDays })}>
                <Icon as={LucideBan} w={3} h={3} color="yellow.600" />
              </Button>
            </HStack>
          )}
          <Button size="xs" variant="ghost" borderRadius="4px" loading={loading} onClick={handleDelete}>
            <Icon as={LucideTrash2} w={3} h={3} color="red.400" />
          </Button>
        </HStack>
      </td>
    </tr>
  );
}

// ─── VerifRow ─────────────────────────────────────────────────────────────────

function VerifRow({ v, onAction }: { v: Verification; onAction: () => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [load, setLoad] = useState(false);

  const act = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !note.trim()) {
      toaster.create({ title: 'Informe o motivo', type: 'error' }); return;
    }
    setLoad(true);
    try {
      const res = await fetch(`/api/admin/verifications/${v.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      });
      if (!res.ok) throw new Error();
      toaster.create({ title: action === 'approve' ? 'Aprovado' : 'Recusado', type: 'success' });
      onAction();
    } catch { toaster.create({ title: 'Erro', type: 'error' }); }
    finally { setLoad(false); }
  };

  const statusColor = v.status === 'APPROVED' ? '#047857' : v.status === 'REJECTED' ? '#BE123C' : '#92400E';
  const statusLabel = v.status === 'APPROVED' ? 'Aprovado' : v.status === 'REJECTED' ? 'Recusado' : 'Pendente';

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
          <Text fontSize="12px" color="slate.400" fontFamily="heading">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</Text>
        </td>
        <td style={{ ...TD, textAlign: 'right' }}>
          <HStack gap={2} justify="flex-end">
            <Button size="xs" variant="ghost" borderRadius="4px" color="slate.400" onClick={() => setOpen(o => !o)}>
              <Icon as={LucideEye} w={3.5} h={3.5} />
            </Button>
            {v.status === 'PENDING' && (
              <>
                <Button size="xs" bg="green.500" color="white" borderRadius="4px" loading={load} onClick={() => act('approve')}>
                  <Icon as={LucideCheckCircle} w={3} h={3} mr={1} />Aprovar
                </Button>
                <Button size="xs" bg="red.500" color="white" borderRadius="4px" loading={load} onClick={() => act('reject')}>
                  <Icon as={LucideXCircle} w={3} h={3} mr={1} />Recusar
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
              <Box p={5} bg="slate.50" borderBottom="1px solid #E2E8F0">
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mb={4}>
                  {[{ label: 'Frente do documento', url: v.frontDocUrl }, { label: 'Verso do documento', url: v.backDocUrl }, { label: 'Selfie com documento', url: v.selfieUrl }].map(img => (
                    <Box key={img.label}>
                      <Text fontSize="10.5px" fontWeight="700" color="slate.400" fontFamily="heading" mb={1.5} textTransform="uppercase" letterSpacing="0.06em">{img.label}</Text>
                      <a href={img.url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.label} style={{ width: '100%', height: 130, objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                      </a>
                    </Box>
                  ))}
                </SimpleGrid>
                <Text fontSize="12px" color="slate.500" mb={3}><strong>Endereço:</strong> {v.address}</Text>
                {v.status === 'PENDING' && (
                  <Box>
                    <Text fontSize="10.5px" fontWeight="700" color="slate.400" fontFamily="heading" textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>Nota de recusa</Text>
                    <Textarea value={note} onChange={e => setNote(e.target.value)}
                      placeholder="Descreva o motivo da recusa…"
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
              {lead.cleaner.isVerified && <Icon as={LucideCheckCircle2} w="13px" h="13px" color="green.500" />}
            </HStack>
          ) : <Text fontSize="12px" color="slate.300">—</Text>}
        </td>
        <td style={TD}><StatusDot status={lead.status} /></td>
        <td style={TD}>
          <Text fontSize="12px" color="slate.400" fontFamily="heading">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</Text>
        </td>
        <td style={TD}>
          {lead.estimatedMinPrice
            ? <Text fontSize="12px" fontWeight="600" color="green.700">R${lead.estimatedMinPrice}–{lead.estimatedMaxPrice}</Text>
            : <Text fontSize="12px" color="slate.300">—</Text>}
        </td>
        <td style={{ ...TD, textAlign: 'center' }}>
          <HStack gap={2} justify="center">
            <Text fontSize="12px" fontWeight="600" color="slate.600">{convs.length}</Text>
            {lead.review && <Stars n={lead.review.rating} />}
            {convs.length > 0 && (
              <Box as="button" onClick={() => setOpen(o => !o)} cursor="pointer" color="#94A3B8" _hover={{ color: '#475569' }}>
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
              <Box p={5} bg="#F8FAFC" borderBottom="1px solid #E2E8F0">
                <Text fontSize="10.5px" fontWeight="700" color="slate.400" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em" mb={2}>Conversas ({convs.length})</Text>
                <VStack gap={1} align="stretch">
                  {convs.map(c => (
                    <HStack key={c.id} gap={4} px={3} py={2} bg="white" border="1px solid #E2E8F0">
                      <Text fontSize="12.5px" fontWeight="600" color="slate.800" fontFamily="heading" flex={1}>{c.cleaner.name || '—'}</Text>
                      <Text fontSize="12px" color="slate.500" fontFamily="heading">{c.status === 'active' ? 'Ativo' : 'Encerrado'}</Text>
                      <Text fontSize="11px" color="slate.400">Lead fee R${c.leadFee}</Text>
                      <Text fontSize="11px" fontWeight="600" color={c.feeStatus === 'charged' ? 'green.600' : 'slate.400'}>
                        {c.feeStatus === 'charged' ? 'Cobrado' : 'Pendente'}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
                {lead.review && (
                  <HStack gap={3} mt={3} p={3} bg="white" border="1px solid #FDE68A">
                    <Stars n={lead.review.rating} />
                    <Text fontSize="12px" color="slate.600">{lead.review.comment || 'Sem comentário'}</Text>
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
    <Box px={8} pt={7} pb={5} borderBottom="1px solid #E2E8F0" bg="white">
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
    <Box bg="white" borderBottom="1px solid #E2E8F0" px={8} py={0}>
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
      <Text color="slate.400" fontFamily="heading">Carregando…</Text>
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
      <Box flex={1} overflowY="auto" bg="#F8FAFC">

        {/* ══ VISÃO GERAL ══ */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader title="Visão Geral" sub="Resumo operacional da plataforma" />

            {/* Stats strip */}
            <StatStrip items={[
              { label: 'Total usuários',        value: loadingStats ? '…' : stats?.users.total ?? 0 },
              { label: 'Clientes',              value: loadingStats ? '…' : stats?.users.totalClients ?? 0 },
              { label: 'Profissionais',         value: loadingStats ? '…' : stats?.users.totalCleaners ?? 0 },
              { label: 'Verificados',           value: loadingStats ? '…' : stats?.users.verifiedCleaners ?? 0, accent: true },
              { label: 'Total pedidos',         value: loadingStats ? '…' : totalLeads,                          onClick: () => setTab('leads') },
              { label: 'Concluídos',            value: loadingStats ? '…' : stats?.leads?.COMPLETED ?? 0,        accent: true, onClick: () => { setTab('leads'); setLeadStatus('COMPLETED'); } },
              { label: 'Avaliação média',       value: loadingStats ? '…' : `${(stats?.reviews.avgRating ?? 0).toFixed(1)}★` },
              { label: 'Verif. pendentes',      value: loadingStats ? '…' : stats?.verifications.pending ?? 0,   onClick: () => setTab('verifications') },
            ]} />

            {/* Detail rows */}
            <Box px={8} py={6}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={0} border="1px solid #E2E8F0">

                {/* Recent leads */}
                <Box borderRight={{ lg: '1px solid #E2E8F0' }}>
                  <Box px={5} py={3} borderBottom="1px solid #E2E8F0" bg="white">
                    <Text fontSize="11px" fontWeight="700" color="slate.400" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">
                      Atividade recente
                    </Text>
                  </Box>
                  <Box bg="white">
                    {(stats?.recentLeads ?? []).map((l, i) => (
                      <HStack
                        key={l.id} px={5} py={3}
                        borderBottom={i < (stats?.recentLeads.length ?? 1) - 1 ? '1px solid #F1F5F9' : 'none'}
                        gap={3}
                      >
                        <Box
                          w="6px" h="6px" borderRadius="full" flexShrink={0}
                          bg={l.status === 'COMPLETED' ? '#10B981' : l.status === 'ACCEPTED' ? '#1A7FA0' : l.status === 'CANCELLED' ? '#F43F5E' : '#F59E0B'}
                        />
                        <Box flex={1} minW={0}>
                          <Text fontSize="13px" fontWeight="500" color="slate.800" fontFamily="heading" lineClamp={1}>
                            {l.serviceType} — {l.client.name || '?'}
                          </Text>
                          <Text fontSize="11px" color="slate.400">
                            {l.cleaner ? `Atendido por ${l.cleaner.name}` : 'Aguardando profissional'}
                          </Text>
                        </Box>
                        <StatusDot status={l.status} />
                      </HStack>
                    ))}
                    {!stats?.recentLeads?.length && (
                      <Box px={5} py={6}><Text fontSize="13px" color="slate.300" fontFamily="heading">Sem dados</Text></Box>
                    )}
                  </Box>
                </Box>

                {/* Top cleaners */}
                <Box>
                  <Box px={5} py={3} borderBottom="1px solid #E2E8F0" bg="white">
                    <Text fontSize="11px" fontWeight="700" color="slate.400" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">
                      Top Profissionais
                    </Text>
                  </Box>
                  <Box bg="white">
                    {(stats?.topCleaners ?? []).map((c, i) => (
                      <HStack
                        key={c.cleanerId} px={5} py={3}
                        borderBottom={i < (stats?.topCleaners.length ?? 1) - 1 ? '1px solid #F1F5F9' : 'none'}
                        gap={3}
                      >
                        <Text fontSize="11px" fontWeight="700" color="slate.300" fontFamily="heading" w="16px">{i + 1}</Text>
                        <Box
                          w="28px" h="28px" bg={SIDEBAR_BG} borderRadius="full" flexShrink={0}
                          display="flex" alignItems="center" justifyContent="center"
                          fontSize="10px" fontWeight="700" color="white"
                        >
                          {c.cleaner.name?.[0]?.toUpperCase() ?? 'P'}
                        </Box>
                        <Box flex={1} minW={0}>
                          <HStack gap={1.5}>
                            <Text fontSize="13px" fontWeight="500" color="slate.800" fontFamily="heading" lineClamp={1}>{c.cleaner.name || '—'}</Text>
                            {c.cleaner.isVerified && <Icon as={LucideCheckCircle2} w="12px" h="12px" color="green.500" />}
                          </HStack>
                          <Text fontSize="11px" color="slate.400">{c.totalLeads} pedidos</Text>
                        </Box>
                        <HStack gap={1}>
                          <Text fontSize="13px" fontWeight="700" color="#F59E0B">★</Text>
                          <Text fontSize="13px" fontWeight="700" color="slate.700" fontFamily="heading">{c.ratingAvg.toFixed(1)}</Text>
                        </HStack>
                      </HStack>
                    ))}
                    {!stats?.topCleaners?.length && (
                      <Box px={5} py={6}><Text fontSize="13px" color="slate.300" fontFamily="heading">Sem dados</Text></Box>
                    )}
                  </Box>
                </Box>

              </SimpleGrid>

              {/* Leads by status — horizontal bar */}
              <Box mt={0} border="1px solid #E2E8F0" borderTop="none" bg="white">
                <Box px={5} py={3} borderBottom="1px solid #E2E8F0">
                  <Text fontSize="11px" fontWeight="700" color="slate.400" fontFamily="heading" textTransform="uppercase" letterSpacing="0.07em">
                    Pedidos por status
                  </Text>
                </Box>
                <HStack gap={0} px={5} py={4} flexWrap="wrap">
                  {Object.entries(LEAD_STATUS).map(([key, cfg]) => {
                    const count = stats?.leads?.[key] ?? 0;
                    return (
                      <Box
                        key={key}
                        as="button"
                        px={4} py={3}
                        cursor="pointer"
                        transition="background 0.1s"
                        _hover={{ bg: 'slate.50' }}
                        onClick={() => { setTab('leads'); setLeadStatus(key); }}
                        textAlign="left"
                        borderRight="1px solid #F1F5F9"
                      >
                        <Text fontSize="18px" fontWeight="800" fontFamily="heading" color="slate.900" letterSpacing="-0.02em" lineHeight={1}>{count}</Text>
                        <HStack gap={1.5} mt={1}>
                          <Box w="6px" h="6px" bg={cfg.dot} borderRadius="full" flexShrink={0} />
                          <Text fontSize="11px" fontWeight="500" color="slate.400" fontFamily="heading" whiteSpace="nowrap">{cfg.label}</Text>
                        </HStack>
                      </Box>
                    );
                  })}
                </HStack>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* ══ PEDIDOS ══ */}
        {tab === 'leads' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <PageHeader title="Pedidos" sub={`${leadsTotal} pedidos no total`}>
              <HStack gap={3}>
                <Box position="relative">
                  <Icon as={LucideSearch} w="13px" h="13px" color="slate.400"
                    position="absolute" left="10px" top="50%" style={{ transform: 'translateY(-50%)' }} />
                  <Input value={leadSearch} onChange={e => { setLeadSearch(e.target.value); setLeadPage(0); }}
                    placeholder="Buscar…" size="sm" pl="30px" borderRadius="4px" w="220px" fontSize="13px" fontFamily="heading" />
                </Box>
              </HStack>
            </PageHeader>

            {/* Status filter bar */}
            <Box bg="white" borderBottom="1px solid #E2E8F0" px={8} py={0}>
              <HStack gap={0} overflowX="auto">
                {[{ key: '', label: 'Todos', count: totalLeads }, ...Object.entries(LEAD_STATUS).map(([k, v]) => ({ key: k, label: v.label, count: stats?.leads?.[k] ?? 0, dot: v.dot }))].map(item => (
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
                <Box p={12} textAlign="center"><Text color="slate.400" fontFamily="heading">Carregando…</Text></Box>
              ) : leads.length === 0 ? (
                <Box p={12} textAlign="center"><Text color="slate.300" fontFamily="heading">Nenhum pedido encontrado</Text></Box>
              ) : (
                <Box overflowX="auto" bg="white">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={TH}>ID</th>
                      <th style={TH}>Serviço</th>
                      <th style={TH}>Cliente</th>
                      <th style={TH}>Profissional</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Data</th>
                      <th style={TH}>Valor</th>
                      <th style={{ ...TH, textAlign: 'center' }}>Convs.</th>
                    </tr></thead>
                    <tbody>{leads.map(l => <LeadDetailRow key={l.id} lead={l} />)}</tbody>
                  </table>
                </Box>
              )}

              {leadsTotal > PAGE_SIZE && (
                <Flex align="center" justify="space-between" px={6} py={3} bg="white" borderTop="1px solid #E2E8F0">
                  <Text fontSize="12px" color="slate.400" fontFamily="heading">
                    {leadPage * PAGE_SIZE + 1}–{Math.min((leadPage + 1) * PAGE_SIZE, leadsTotal)} de {leadsTotal}
                  </Text>
                  <HStack gap={2}>
                    <Button size="xs" variant="ghost" borderRadius="4px" disabled={leadPage === 0} onClick={() => setLeadPage(p => p - 1)}>
                      <Icon as={LucideChevronLeft} w={3.5} h={3.5} />
                    </Button>
                    <Text fontSize="12px" fontFamily="heading" color="slate.600" fontWeight="600">Pág. {leadPage + 1} de {Math.ceil(leadsTotal / PAGE_SIZE)}</Text>
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
            <PageHeader title="Verificações" sub="Documentos enviados por profissionais" />

            <Box bg="white" borderBottom="1px solid #E2E8F0" px={8} py={0}>
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
                      {f === 'ALL' ? `Todas (${count})` : f === 'PENDING' ? `Pendentes (${count})` : f === 'APPROVED' ? `Aprovadas (${count})` : `Recusadas (${count})`}
                    </Box>
                  );
                })}
              </HStack>
            </Box>

            <Box bg="white">
              {loadingVerifs ? (
                <Box p={12} textAlign="center"><Text color="slate.400" fontFamily="heading">Carregando…</Text></Box>
              ) : filteredVerifs.length === 0 ? (
                <Box p={12} textAlign="center"><Text color="slate.300" fontFamily="heading">Nenhuma verificação encontrada</Text></Box>
              ) : (
                <Box overflowX="auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={TH}>Profissional</th>
                      <th style={TH}>Documento</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Data</th>
                      <th style={{ ...TH, textAlign: 'right' }}>Ações</th>
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
            <PageHeader title="Usuários" sub={`${users.length} cadastros`}>
              <Box position="relative">
                <Icon as={LucideSearch} w="13px" h="13px" color="slate.400"
                  position="absolute" left="10px" top="50%" style={{ transform: 'translateY(-50%)' }} />
                <Input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Buscar…" size="sm" pl="30px" borderRadius="4px" w="220px" fontSize="13px" fontFamily="heading" />
              </Box>
            </PageHeader>

            <Box bg="white" borderBottom="1px solid #E2E8F0" px={8} py={0}>
              <HStack gap={0}>
                {(['ALL', 'CLIENT', 'CLEANER'] as const).map(r => (
                  <Box key={r} as="button" px={4} py={3} cursor="pointer" flexShrink={0}
                    borderBottom="2px solid" borderBottomColor={roleFilter === r ? 'brand.500' : 'transparent'}
                    color={roleFilter === r ? 'brand.600' : 'slate.500'}
                    fontWeight={roleFilter === r ? '600' : '400'}
                    fontSize="13px" fontFamily="heading" transition="all 0.12s" _hover={{ color: 'slate.800' }}
                    onClick={() => setRoleFilter(r)}>
                    {r === 'ALL' ? `Todos (${users.length})` : r === 'CLIENT' ? `Clientes (${users.filter(u => u.role === 'CLIENT').length})` : `Profissionais (${users.filter(u => u.role === 'CLEANER').length})`}
                  </Box>
                ))}
              </HStack>
            </Box>

            <Box bg="white">
              {loadingUsers ? (
                <Box p={12} textAlign="center"><Text color="slate.400" fontFamily="heading">Carregando…</Text></Box>
              ) : filteredUsers.length === 0 ? (
                <Box p={12} textAlign="center"><Text color="slate.300" fontFamily="heading">Nenhum usuário encontrado</Text></Box>
              ) : (
                <Box overflowX="auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={TH}>Usuário</th>
                      <th style={TH}>Tipo</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Cadastro</th>
                      <th style={{ ...TH, textAlign: 'right' }}>Ações</th>
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
              title="Avaliações"
              sub={`${reviews.length} avaliações · média ${(reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0).toFixed(1)}★`}
            />

            <Box bg="white" borderBottom="1px solid #E2E8F0" px={8} py={0}>
              <HStack gap={0}>
                <Box as="button" px={4} py={3} cursor="pointer"
                  borderBottom="2px solid" borderBottomColor={revFilter === 0 ? 'brand.500' : 'transparent'}
                  color={revFilter === 0 ? 'brand.600' : 'slate.500'} fontWeight={revFilter === 0 ? '600' : '400'}
                  fontSize="13px" fontFamily="heading" transition="all 0.12s" _hover={{ color: 'slate.800' }}
                  onClick={() => setRevFilter(0)}>
                  Todas ({reviews.length})
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
                <Box p={12} textAlign="center"><Text color="slate.400" fontFamily="heading">Carregando…</Text></Box>
              ) : filteredRevs.length === 0 ? (
                <Box p={12} textAlign="center"><Text color="slate.300" fontFamily="heading">Nenhuma avaliação encontrada</Text></Box>
              ) : (
                <Box overflowX="auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={TH}>Cliente</th>
                      <th style={TH}>Profissional</th>
                      <th style={TH}>Serviço</th>
                      <th style={TH}>Nota</th>
                      <th style={TH}>Comentário</th>
                      <th style={TH}>Data</th>
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
                              {r.cleaner.isVerified && <Icon as={LucideCheckCircle2} w="12px" h="12px" color="green.500" />}
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
                              {new Date(r.createdAt).toLocaleDateString('pt-BR')}
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

      </Box>
    </Flex>
  );
}
