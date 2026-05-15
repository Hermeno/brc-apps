'use client';

import {
  Box, VStack, HStack, Text, Button, Container, Icon, Flex, Badge,
  Textarea, SimpleGrid, Input,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { toaster } from '@/lib/toaster';
import { motion } from 'motion/react';
import {
  LucideShield, LucideUsers, LucideCheckCircle, LucideXCircle,
  LucideClock, LucideEye, LucideTrash2, LucideLogOut, LucideUser,
  LucideBan, LucideUnlock, LucidePencil, LucideSave, LucideX,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserRow {
  id: string; name: string | null; email: string; role: string;
  phone: string | null; address: string | null;
  isVerified: boolean; suspendedUntil: string | null;
  createdAt: string; plan: string;
  verification?: { status: string } | null;
}

interface Verification {
  id: string; status: string; fullName: string; idNumber: string;
  address: string; frontDocUrl: string; backDocUrl: string; selfieUrl: string;
  adminNote: string | null; createdAt: string;
  cleaner: { id: string; name: string | null; email: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isSuspended = (u: UserRow) => !!u.suspendedUntil && new Date(u.suspendedUntil) > new Date();

function StatusBadge({ user }: { user: UserRow }) {
  if (isSuspended(user)) return <Badge colorScheme="red" borderRadius="full" px={2} fontSize="xs">Suspenso</Badge>;
  if (user.isVerified)   return <Badge colorScheme="green" borderRadius="full" px={2} fontSize="xs">Ativo</Badge>;
  return <Badge colorScheme="yellow" borderRadius="full" px={2} fontSize="xs">Pendente</Badge>;
}

// ─── Inline edit row ─────────────────────────────────────────────────────────

function UserTableRow({ user, onRefresh }: { user: UserRow; onRefresh: () => void }) {
  const [editing, setEditing]       = useState(false);
  const [name, setName]             = useState(user.name ?? '');
  const [email, setEmail]           = useState(user.email);
  const [phone, setPhone]           = useState(user.phone ?? '');
  const [suspendDays, setSuspDays]  = useState(7);
  const [loading, setLoading]       = useState(false);

  const call = async (body: object) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Erro');
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
      if (!res.ok) throw new Error('Erro');
      toaster.create({ title: 'Usuário deletado', type: 'success' });
      onRefresh();
    } catch { toaster.create({ title: 'Erro ao deletar', type: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '12px 10px' }}>
        {editing ? (
          <VStack gap={1} align="stretch">
            <Input size="sm" value={name}  onChange={e => setName(e.target.value)}  placeholder="Nome"  borderRadius="lg" />
            <Input size="sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" borderRadius="lg" />
            <Input size="sm" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Tel"   borderRadius="lg" />
          </VStack>
        ) : (
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="slate.900">{user.name || '—'}</Text>
            <Text fontSize="xs" color="slate.500">{user.email}</Text>
            {user.phone && <Text fontSize="xs" color="slate.400">{user.phone}</Text>}
          </Box>
        )}
      </td>
      <td style={{ padding: '12px 10px' }}>
        <Badge colorScheme={user.role === 'CLEANER' ? 'green' : 'blue'} borderRadius="full" px={2} fontSize="xs">
          {user.role === 'CLEANER' ? 'Profissional' : 'Cliente'}
        </Badge>
      </td>
      <td style={{ padding: '12px 10px' }}>
        <StatusBadge user={user} />
        {isSuspended(user) && (
          <Text fontSize="10px" color="red.400" mt={0.5}>
            até {new Date(user.suspendedUntil!).toLocaleDateString('pt-BR')}
          </Text>
        )}
      </td>
      <td style={{ padding: '12px 10px' }}>
        <Text fontSize="xs" color="slate.400">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</Text>
      </td>
      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
        <HStack gap={1} justify="flex-end">
          {editing ? (
            <>
              <Button size="xs" bg="brand.500" color="white" borderRadius="lg" loading={loading}
                onClick={() => { call({ name, email, phone }); setEditing(false); }}>
                <Icon as={LucideSave} w={3} h={3} />
              </Button>
              <Button size="xs" variant="ghost" borderRadius="lg" onClick={() => setEditing(false)}>
                <Icon as={LucideX} w={3} h={3} />
              </Button>
            </>
          ) : (
            <Button size="xs" variant="ghost" borderRadius="lg" onClick={() => setEditing(true)}>
              <Icon as={LucidePencil} w={3} h={3} color="slate.500" />
            </Button>
          )}

          {isSuspended(user) ? (
            <Button size="xs" variant="ghost" borderRadius="lg" loading={loading}
              onClick={() => call({ action: 'unsuspend' })}>
              <Icon as={LucideUnlock} w={3} h={3} color="green.500" />
            </Button>
          ) : (
            <HStack gap={1}>
              <Input
                size="xs" type="number" value={suspendDays} min={1} max={365}
                onChange={e => setSuspDays(Number(e.target.value))}
                w="44px" borderRadius="lg" textAlign="center"
              />
              <Text fontSize="10px" color="slate.400">dias</Text>
              <Button size="xs" variant="ghost" borderRadius="lg" loading={loading}
                onClick={() => call({ action: 'suspend', suspendDays })}>
                <Icon as={LucideBan} w={3} h={3} color="orange.500" />
              </Button>
            </HStack>
          )}

          <Button size="xs" variant="ghost" borderRadius="lg" loading={loading} onClick={handleDelete}>
            <Icon as={LucideTrash2} w={3} h={3} color="red.500" />
          </Button>
        </HStack>
      </td>
    </tr>
  );
}

// ─── Verification card ────────────────────────────────────────────────────────

function VerifCard({ v, onAction }: { v: Verification; onAction: () => void }) {
  const [open, setOpen]   = useState(false);
  const [note, setNote]   = useState('');
  const [load, setLoad]   = useState(false);

  const act = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !note.trim()) {
      toaster.create({ title: 'Informe o motivo da recusa', type: 'error' }); return;
    }
    setLoad(true);
    try {
      const res = await fetch(`/api/admin/verifications/${v.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      });
      if (!res.ok) throw new Error();
      toaster.create({ title: action === 'approve' ? 'Aprovado!' : 'Recusado', type: 'success' });
      onAction();
    } catch { toaster.create({ title: 'Erro', type: 'error' }); }
    finally { setLoad(false); }
  };

  const colorMap: Record<string, string> = { PENDING: 'yellow', APPROVED: 'green', REJECTED: 'red' };
  const labelMap: Record<string, string> = { PENDING: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Recusado' };

  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '12px 10px' }}>
        <Text fontWeight="bold" fontSize="sm">{v.cleaner.name || '—'}</Text>
        <Text fontSize="xs" color="slate.500">{v.cleaner.email}</Text>
      </td>
      <td style={{ padding: '12px 10px' }}>
        <Text fontSize="sm">{v.fullName}</Text>
        <Text fontSize="xs" color="slate.400" fontFamily="mono">{v.idNumber}</Text>
      </td>
      <td style={{ padding: '12px 10px' }}>
        <Badge colorScheme={colorMap[v.status]} borderRadius="full" px={2} fontSize="xs">
          {labelMap[v.status]}
        </Badge>
      </td>
      <td style={{ padding: '12px 10px' }}>
        <Text fontSize="xs" color="slate.400">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</Text>
      </td>
      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
        <HStack gap={1} justify="flex-end">
          <Button size="xs" variant="ghost" borderRadius="lg" onClick={() => setOpen(o => !o)}>
            <Icon as={LucideEye} w={3.5} h={3.5} color="slate.500" />
          </Button>
          {v.status === 'PENDING' && (
            <>
              <Button size="xs" bg="green.500" color="white" borderRadius="lg" loading={load}
                onClick={() => act('approve')}>
                <Icon as={LucideCheckCircle} w={3} h={3} />
              </Button>
              <Button size="xs" bg="red.500" color="white" borderRadius="lg" loading={load}
                onClick={() => act('reject')}>
                <Icon as={LucideXCircle} w={3} h={3} />
              </Button>
            </>
          )}
        </HStack>
      </td>

      {/* Expanded docs row */}
      {open && (
        <td colSpan={5} style={{ padding: 0 }}>
          <Box p={4} bg="slate.50">
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mb={3}>
              {[
                { label: 'Frente', url: v.frontDocUrl },
                { label: 'Verso',  url: v.backDocUrl },
                { label: 'Selfie', url: v.selfieUrl },
              ].map(img => (
                <Box key={img.label}>
                  <Text fontSize="xs" color="slate.500" mb={1}>{img.label}</Text>
                  <a href={img.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.label}
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  </a>
                </Box>
              ))}
            </SimpleGrid>
            <Text fontSize="xs" color="slate.500" mb={1}>Endereço: {v.address}</Text>
            {v.status === 'PENDING' && (
              <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Nota de recusa (obrigatória)"
                size="sm" borderRadius="lg" bg="white" mt={2} />
            )}
          </Box>
        </td>
      )}
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'users' | 'verifications';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab]                       = useState<Tab>('verifications');
  const [users, setUsers]                   = useState<UserRow[]>([]);
  const [verifications, setVerifications]   = useState<Verification[]>([]);
  const [loading, setLoading]               = useState(true);
  const [roleFilter, setRoleFilter]         = useState<'ALL' | 'CLIENT' | 'CLEANER'>('ALL');
  const [verifFilter, setVerifFilter]       = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch]                 = useState('');

  const loadData = async () => {
    setLoading(true);
    const [uRes, vRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/verifications'),
    ]);
    const [uData, vData] = await Promise.all([uRes.json(), vRes.json()]);
    setUsers(uData.users ?? []);
    setVerifications(vData.verifications ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'ADMIN') router.replace('/dashboard');
      else loadData();
    }
  }, [status, session, router]);

  const filteredUsers = users
    .filter(u => roleFilter === 'ALL' || u.role === roleFilter)
    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const filteredVerifs = verifications
    .filter(v => verifFilter === 'ALL' || v.status === verifFilter);

  const pendingCount = verifications.filter(v => v.status === 'PENDING').length;

  const thStyle: React.CSSProperties = {
    padding: '10px', textAlign: 'left', fontSize: '11px',
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
    color: '#64748b', borderBottom: '2px solid #f1f5f9', background: '#f9fafb',
  };

  if (status === 'loading') return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Text color="slate.400">Carregando…</Text>
    </Box>
  );

  return (
    <Box minH="100vh" bg="slate.50">

      {/* ── Header ── */}
      <Box bg="white" borderBottom="1px solid" borderColor="slate.100" position="sticky" top={0} zIndex={50}>
        <Container maxW="6xl" py={3}>
          <Flex align="center" justify="space-between">
            <HStack gap={3}>
              <Box w="36px" h="36px" bg="brand.500" borderRadius="xl"
                display="flex" alignItems="center" justifyContent="center">
                <Icon as={LucideShield} w={5} h={5} color="white" />
              </Box>
              <Box>
                <Text fontWeight="black" color="slate.900" lineHeight="short">BrazilianClean</Text>
                <Text fontSize="10px" color="brand.500" fontWeight="bold" letterSpacing="wider">ADMIN PANEL</Text>
              </Box>
            </HStack>

            <HStack gap={2}>
              <Button size="sm" variant="ghost" borderRadius="xl"
                onClick={() => router.push('/dashboard/admin/profile')}>
                <Icon as={LucideUser} w={4} h={4} mr={1} /> Meu perfil
              </Button>
              <Button size="sm" bg="red.50" color="red.600" borderRadius="xl"
                _hover={{ bg: 'red.100' }}
                onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                <Icon as={LucideLogOut} w={4} h={4} mr={1} /> Sair
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="6xl" py={6}>
        <VStack gap={5} align="stretch">

          {/* Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            {[
              { label: 'Usuários', value: users.length, color: 'brand' },
              { label: 'Clientes', value: users.filter(u => u.role === 'CLIENT').length, color: 'blue' },
              { label: 'Profissionais', value: users.filter(u => u.role === 'CLEANER').length, color: 'green' },
              { label: 'Verificações pendentes', value: pendingCount, color: 'yellow' },
            ].map(s => (
              <Box key={s.label} bg="white" borderRadius="2xl" border="1px solid" borderColor="slate.200" p={4}>
                <Text fontSize="2xl" fontWeight="black" color={`${s.color}.500`}>{s.value}</Text>
                <Text fontSize="xs" color="slate.500" fontWeight="bold">{s.label}</Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* Tab buttons */}
          <HStack gap={2}>
            <Button onClick={() => setTab('verifications')}
              bg={tab === 'verifications' ? 'brand.500' : 'white'}
              color={tab === 'verifications' ? 'white' : 'slate.600'}
              border="1px solid" borderColor={tab === 'verifications' ? 'brand.500' : 'slate.200'}
              borderRadius="xl" size="sm" fontWeight="bold">
              <Icon as={LucideCheckCircle} w={4} h={4} mr={1} />
              Verificações
              {pendingCount > 0 && (
                <Badge ml={2} bg="red.500" color="white" borderRadius="full" fontSize="10px">{pendingCount}</Badge>
              )}
            </Button>
            <Button onClick={() => setTab('users')}
              bg={tab === 'users' ? 'brand.500' : 'white'}
              color={tab === 'users' ? 'white' : 'slate.600'}
              border="1px solid" borderColor={tab === 'users' ? 'brand.500' : 'slate.200'}
              borderRadius="xl" size="sm" fontWeight="bold">
              <Icon as={LucideUsers} w={4} h={4} mr={1} />
              Usuários ({users.length})
            </Button>
            <Button size="sm" variant="ghost" ml="auto" onClick={loadData} borderRadius="xl">Atualizar</Button>
          </HStack>

          {/* ── VERIFICATIONS TAB ── */}
          {tab === 'verifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="slate.200" overflow="hidden">
                {/* Filter */}
                <Flex p={4} gap={2} borderBottom="1px solid" borderColor="slate.100" flexWrap="wrap">
                  {(['ALL','PENDING','APPROVED','REJECTED'] as const).map(f => (
                    <Button key={f} size="xs" onClick={() => setVerifFilter(f)}
                      bg={verifFilter === f ? 'brand.500' : 'slate.100'}
                      color={verifFilter === f ? 'white' : 'slate.600'}
                      borderRadius="full" fontWeight="bold">
                      {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Pendentes' : f === 'APPROVED' ? 'Aprovadas' : 'Recusadas'}
                      <Badge ml={1} bg={verifFilter === f ? 'brand.600' : 'slate.200'}
                        color={verifFilter === f ? 'white' : 'slate.500'} borderRadius="full" fontSize="9px">
                        {f === 'ALL' ? verifications.length : verifications.filter(v => v.status === f).length}
                      </Badge>
                    </Button>
                  ))}
                </Flex>

                {loading ? (
                  <Box p={10} textAlign="center"><Text color="slate.400">Carregando…</Text></Box>
                ) : filteredVerifs.length === 0 ? (
                  <Box p={10} textAlign="center"><Text color="slate.400">Nenhuma verificação encontrada</Text></Box>
                ) : (
                  <Box overflowX="auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Profissional</th>
                          <th style={thStyle}>Documento</th>
                          <th style={thStyle}>Status</th>
                          <th style={thStyle}>Data</th>
                          <th style={{ ...thStyle, textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVerifs.map(v => <VerifCard key={v.id} v={v} onAction={loadData} />)}
                      </tbody>
                    </table>
                  </Box>
                )}
              </Box>
            </motion.div>
          )}

          {/* ── USERS TAB ── */}
          {tab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="slate.200" overflow="hidden">
                {/* Filters */}
                <Flex p={4} gap={3} borderBottom="1px solid" borderColor="slate.100" flexWrap="wrap" align="center">
                  <HStack gap={2}>
                    {(['ALL','CLIENT','CLEANER'] as const).map(r => (
                      <Button key={r} size="xs" onClick={() => setRoleFilter(r)}
                        bg={roleFilter === r ? 'brand.500' : 'slate.100'}
                        color={roleFilter === r ? 'white' : 'slate.600'}
                        borderRadius="full" fontWeight="bold">
                        {r === 'ALL' ? 'Todos' : r === 'CLIENT' ? 'Clientes' : 'Profissionais'}
                      </Button>
                    ))}
                  </HStack>
                  <Input placeholder="Buscar por nome ou email…" value={search}
                    onChange={e => setSearch(e.target.value)}
                    size="sm" borderRadius="xl" maxW="240px" ml="auto" />
                </Flex>

                {loading ? (
                  <Box p={10} textAlign="center"><Text color="slate.400">Carregando…</Text></Box>
                ) : filteredUsers.length === 0 ? (
                  <Box p={10} textAlign="center"><Text color="slate.400">Nenhum usuário encontrado</Text></Box>
                ) : (
                  <Box overflowX="auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Usuário</th>
                          <th style={thStyle}>Tipo</th>
                          <th style={thStyle}>Status</th>
                          <th style={thStyle}>Cadastro</th>
                          <th style={{ ...thStyle, textAlign: 'right' }}>
                            Ações &nbsp;
                            <span style={{ fontSize: 9, fontWeight: 400, color: '#94a3b8' }}>
                              [editar] [N dias + 🚫] [🗑]
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => <UserTableRow key={u.id} user={u} onRefresh={loadData} />)}
                      </tbody>
                    </table>
                  </Box>
                )}
              </Box>
            </motion.div>
          )}

        </VStack>
      </Container>
    </Box>
  );
}
