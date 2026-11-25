'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { Box, Button, Flex, Heading, HStack, Icon, Input, Text, VStack } from '@chakra-ui/react';
import {
  LucideChevronLeft, LucideChevronRight, LucideClock, LucideMapPin, LucideMessageSquare,
  LucidePlus, LucideRepeat, LucideStar, LucideTrash2, LucideUser,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import Glyph from '@/components/glyph';
import { useLocale } from '@/lib/i18n';
import { serviceLabel } from '@/lib/estimate';
import { isRecurring, repeatVisits } from '@/lib/recurrence';
import { toaster } from '@/lib/toaster';

type Job = {
  id: string; serviceType: string; address: string; addressIsApproximate?: boolean; dateTime: string;
  status: 'IN_REVIEW' | 'ACCEPTED' | 'COMPLETED'; frequency: string; recurring: boolean; conversationId: string | null;
  bedrooms?: number; bathrooms?: number; squareMeters?: number; estimatedHours?: number | null;
  estimatedMinPrice?: number | null; estimatedMaxPrice?: number | null;
  client?: { name: string | null } | null; review?: { rating: number; comment?: string | null } | null;
};
type Block = { id: string; startTime: string; endTime: string; reason: string | null };
type Entry =
  | { kind: 'job' | 'visit'; at: Date; job: Job }
  | { kind: 'block'; at: Date; block: Block };
type BlockForm = { from: string; to: string; allDay: boolean; start: string; end: string; reason: string };

// One look per kind of entry, from the platform palette.
const TONES = {
  confirmed: { bg: '#185FC6', color: '#FFFFFF', border: '1px solid #185FC6',  dot: '#185FC6' },
  recurring: { bg: '#EDF3F5', color: '#134A9A', border: '1px dashed #185FC6', dot: '#134A9A' },
  pending:   { bg: '#FFFFFF', color: '#111418', border: '1px solid #555C66',  dot: '#555C66' },
  done:      { bg: '#F8F8F4', color: '#555C66', border: '1px solid #DDE5E9',  dot: '#B9C5CC' },
  off:       { bg: '#DDE5E9', color: '#111418', border: '1px solid #DDE5E9',  dot: '#111418' },
} as const;
type Tone = keyof typeof TONES;

const addDays   = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dayStart  = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayKey    = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const inputDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function toneOf(e: Entry, now: Date): Tone {
  if (e.kind === 'block') return 'off';
  if (e.kind === 'visit') return 'recurring';
  if (e.job.status === 'COMPLETED') return 'done';
  return e.job.status === 'IN_REVIEW' || e.at < now ? 'pending' : 'confirmed';
}

function statusKey(e: Entry, now: Date): string {
  if (e.kind === 'block') return 'statusOff';
  if (e.kind === 'visit') return 'statusRecurring';
  if (e.job.status === 'COMPLETED') return 'statusCompleted';
  if (e.job.status === 'IN_REVIEW') return 'statusAwaitingClient';
  return e.at < now ? 'statusAwaitingCompletion' : 'statusConfirmed';
}

export default function SchedulePage() {
  const { locale, t } = useLocale();
  const tt = (key: string, vars?: Record<string, string | number>) => t(`cleaner.schedule.${key}`, vars);
  const dl = locale === 'pt' ? 'pt-BR' : 'en-US';

  const [now] = useState(() => new Date());
  const [jobs, setJobs]         = useState<Job[]>([]);
  const [blocks, setBlocks]     = useState<Block[]>([]);
  const [loading, setLoading]   = useState(true);
  const [month, setMonth]       = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(() => dayStart(now));
  const [form, setForm]         = useState<BlockForm | null>(null);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, b] = await Promise.all([fetch('/api/schedule'), fetch('/api/schedule/block')]);
      if (s.ok) setJobs((await s.json()).jobs);
      if (b.ok) setBlocks((await b.json()).blocks);
    } catch {
      // network error: keep what is on screen
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // A reminder links here with ?at=<visit time>: open the calendar on that day.
  useEffect(() => {
    const at = Number(new URLSearchParams(window.location.search).get('at'));
    if (!at) return;
    const d = new Date(at);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(dayStart(d));
  }, []);

  const gridStart = addDays(month, -month.getDay());
  const weeks     = addDays(gridStart, 35).getMonth() === month.getMonth() ? 6 : 5;
  const gridEnd   = addDays(gridStart, weeks * 7);
  const days      = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));

  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>();
    const add = (e: Entry) => map.set(dayKey(e.at), [...(map.get(dayKey(e.at)) ?? []), e]);
    const today = dayStart(now);
    for (const job of jobs) {
      const first = new Date(job.dateTime);
      add({ kind: 'job', at: first, job });
      // A recurring client's next visits, from today on: past ones were never booked.
      if (job.recurring) {
        for (const at of repeatVisits(first, job.frequency, today > gridStart ? today : gridStart, gridEnd)) add({ kind: 'visit', at, job });
      }
    }
    for (const block of blocks) {
      const start = new Date(block.startTime), end = new Date(block.endTime);
      for (let d = dayStart(start); d < end && d < gridEnd; d = addDays(d, 1)) add({ kind: 'block', at: d < start ? start : d, block });
    }
    for (const list of map.values()) list.sort((a, b) => a.at.getTime() - b.at.getTime());
    return map;
  }, [jobs, blocks, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const t0 = dayStart(now), t1 = addDays(t0, 1), week = addDays(t0, 7);
    const visits: Date[] = [];
    for (const job of jobs) {
      if (job.status !== 'COMPLETED') visits.push(new Date(job.dateTime));
      if (job.recurring) visits.push(...repeatVisits(new Date(job.dateTime), job.frequency, t0, week));
    }
    return [
      { label: tt('statToday'),     value: visits.filter(d => d >= t0 && d < t1).length },
      { label: tt('statWeek'),      value: visits.filter(d => d >= t0 && d < week).length },
      { label: tt('statRecurring'), value: jobs.filter(j => j.recurring).length },
      { label: tt('statCompleted'), value: jobs.filter(j => j.status === 'COMPLETED').length },
    ];
  }, [jobs, now, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmtTime  = (d: Date) => d.toLocaleTimeString(dl, { hour: 'numeric', minute: '2-digit' });
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2026, 10, 1 + i).toLocaleDateString(dl, { weekday: 'short' })); // Nov 1, 2026 is a Sunday
  const entries  = byDay.get(dayKey(selected)) ?? [];

  const go = (delta: number) => {
    const m = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setMonth(m);
    setSelected(m.getMonth() === now.getMonth() && m.getFullYear() === now.getFullYear() ? dayStart(now) : m);
  };

  const openForm = (day: Date) => setForm({ from: inputDate(day), to: inputDate(day), allDay: true, start: '09:00', end: '17:00', reason: '' });

  const saveBlock = async () => {
    if (!form) return;
    const start = new Date(`${form.from}T${form.allDay ? '00:00' : form.start}`);
    const end   = new Date(`${form.to}T${form.allDay ? '23:59:59' : form.end}`);
    if (!(end > start)) { toaster.create({ title: tt('toastEndBeforeStart'), type: 'error' }); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/schedule/block', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: start.toISOString(), endTime: end.toISOString(), reason: form.reason.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      toaster.create({ title: tt('toastSaved'), type: 'success' });
      setForm(null);
      load();
    } catch {
      toaster.create({ title: tt('toastError'), type: 'error' });
    } finally { setSaving(false); }
  };

  const removeBlock = async (id: string) => {
    const res = await fetch(`/api/schedule/block/${id}`, { method: 'DELETE' }).catch(() => null);
    toaster.create(res?.ok ? { title: tt('toastRemoved'), type: 'success' } : { title: tt('toastError'), type: 'error' });
    if (res?.ok) load();
  };

  const field = { bg: 'white', borderRadius: '6px', h: '10', border: '1px solid', borderColor: '#DDE5E9', fontSize: 'sm' } as const;
  const label = (text: string) => (
    <Text fontSize="10.5px" fontWeight={700} color="#555C66" textTransform="uppercase" letterSpacing="0.07em" fontFamily="heading" mb={1}>{text}</Text>
  );
  const legendKey = { confirmed: 'statusConfirmed', recurring: 'statusRecurring', pending: 'statusAwaitingClient', done: 'statusCompleted', off: 'statusOff' } as const;

  return (
    <Box minH="100vh" bg="white">
      <CleanerNav />
      <Box p={6} maxW="1200px" mx="auto">

        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
          <Box>
            <Heading fontWeight="300" fontSize={{ base: '24px', md: '28px' }} letterSpacing="-0.01em" color="slate.900" fontFamily="heading">{tt('title')}</Heading>
            <Text color="slate.500" fontSize="sm" mt={1}>{tt('subtitle')}</Text>
          </Box>
          <Button bg="#185FC6" color="white" borderRadius="6px" fontWeight="bold" _hover={{ bg: '#111418' }} onClick={() => openForm(selected)}>
            <Icon as={LucidePlus} w={4} h={4} mr={2} />{tt('blockTime')}
          </Button>
        </Flex>

        <VStack gap={6} align="stretch">
          {/* Stat strip */}
          <Box boxShadow="sm" border="1px solid #DDE5E9" bg="white" style={{ borderRadius: 6 }}>
            <Flex wrap="wrap">
              {stats.map((s, i) => (
                <Box key={s.label} flex={{ base: '1 1 50%', md: 1 }} px={5} py={4} textAlign="center"
                  borderRight={i < stats.length - 1 ? '1px solid #DDE5E9' : undefined}>
                  <Text fontSize="22px" fontWeight={700} fontFamily="heading" color="#111418" letterSpacing="-0.03em" lineHeight={1}>{loading ? '—' : s.value}</Text>
                  <Text fontSize="11px" color="#555C66" textTransform="uppercase" fontFamily="heading" letterSpacing="0.07em" mt={1}>{s.label}</Text>
                </Box>
              ))}
            </Flex>
          </Box>

          {/* Block-time form, inline like the other forms of the dashboards */}
          {form && (
            <Box border="1px solid #DDE5E9" bg="#EDF3F5" p={5} style={{ borderRadius: 6 }}>
              <Text fontSize="sm" fontWeight="bold" color="#111418" mb={4}>{tt('blockTime')}</Text>
              <Flex gap={3} wrap="wrap" align="end">
                <Box flex="1 1 150px">{label(tt('formFrom'))}
                  <Input type="date" value={form.from} onChange={e => setForm({ ...form, from: e.target.value, to: form.to < e.target.value ? e.target.value : form.to })} {...field} />
                </Box>
                <Box flex="1 1 150px">{label(tt('formTo'))}
                  <Input type="date" value={form.to} min={form.from} onChange={e => setForm({ ...form, to: e.target.value })} {...field} />
                </Box>
                {!form.allDay && <>
                  <Box flex="1 1 110px">{label(tt('formStart'))}<Input type="time" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} {...field} /></Box>
                  <Box flex="1 1 110px">{label(tt('formEnd'))}<Input type="time" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} {...field} /></Box>
                </>}
                <Box as="label" display="flex" alignItems="center" gap={2} h="10" fontSize="sm" color="#111418" cursor="pointer">
                  <input type="checkbox" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} />
                  {tt('allDay')}
                </Box>
              </Flex>
              <Box mt={3}>{label(tt('formReason'))}
                <Input value={form.reason} maxLength={120} placeholder={tt('formReasonPlaceholder')} onChange={e => setForm({ ...form, reason: e.target.value })} {...field} />
              </Box>
              <HStack gap={3} justify="flex-end" mt={4}>
                <Button size="sm" variant="ghost" color="slate.500" onClick={() => setForm(null)}>{tt('formCancel')}</Button>
                <Button size="sm" bg="#185FC6" color="white" borderRadius="6px" fontWeight="bold" _hover={{ bg: '#111418' }} loading={saving} onClick={saveBlock}>{tt('formSave')}</Button>
              </HStack>
            </Box>
          )}

          <Flex gap={6} direction={{ base: 'column', lg: 'row' }} align="start">
            {/* Month grid */}
            <Box flex="2" w="100%" border="1px solid #DDE5E9" style={{ borderRadius: 6 }} overflow="hidden">
              <Flex align="center" justify="space-between" px={3} py={2.5} bg="#F8F8F4" borderBottom="1px solid #DDE5E9">
                <HStack gap={1}>
                  <Button size="sm" variant="ghost" aria-label={tt('prevMonth')} onClick={() => go(-1)}><Icon as={LucideChevronLeft} w={4} h={4} /></Button>
                  <Text fontFamily="heading" fontWeight={600} color="#111418" minW="150px" textAlign="center" textTransform="capitalize">
                    {month.toLocaleDateString(dl, { month: 'long', year: 'numeric' })}
                  </Text>
                  <Button size="sm" variant="ghost" aria-label={tt('nextMonth')} onClick={() => go(1)}><Icon as={LucideChevronRight} w={4} h={4} /></Button>
                </HStack>
                <Button size="sm" variant="outline" borderColor="#DDE5E9" borderRadius="6px" color="#111418"
                  onClick={() => { setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(dayStart(now)); }}>
                  {tt('today')}
                </Button>
              </Flex>
              <Box display="grid" gridTemplateColumns="repeat(7, minmax(0, 1fr))">
                {weekdays.map(w => (
                  <Text key={w} py={2} textAlign="center" fontSize="10.5px" fontWeight={700} color="#555C66" textTransform="uppercase" letterSpacing="0.07em" fontFamily="heading">{w}</Text>
                ))}
                {days.map((d, i) => {
                  const list = byDay.get(dayKey(d)) ?? [];
                  const isToday = dayKey(d) === dayKey(now);
                  const isSelected = dayKey(d) === dayKey(selected);
                  return (
                    <Box as="button" key={dayKey(d)} onClick={() => setSelected(dayStart(d))}
                      aria-pressed={isSelected} aria-label={`${d.toLocaleDateString(dl, { dateStyle: 'full' })}${list.length ? ` · ${list.length}` : ''}`}
                      minH={{ base: '54px', md: '96px' }} p={1.5} display="flex" flexDirection="column" alignItems="stretch" gap="3px" textAlign="left"
                      bg={isSelected ? '#EDF3F5' : 'white'} borderTop="1px solid #DDE5E9" borderRight={i % 7 < 6 ? '1px solid #DDE5E9' : undefined}
                      opacity={d.getMonth() === month.getMonth() ? 1 : 0.45} cursor="pointer" _hover={{ bg: isSelected ? '#EDF3F5' : '#F8F8F4' }}>
                      <Text as="span" fontSize="12px" fontWeight={600} w="22px" h="22px" display="inline-flex" alignItems="center" justifyContent="center"
                        bg={isToday ? '#185FC6' : 'transparent'} color={isToday ? 'white' : '#111418'} style={{ borderRadius: 6 }}>
                        {d.getDate()}
                      </Text>
                      <Box display={{ base: 'none', md: 'flex' }} flexDirection="column" gap="2px">
                        {list.slice(0, 2).map((e, j) => {
                          const tone = TONES[toneOf(e, now)];
                          return (
                            <Text key={j} as="span" fontSize="10.5px" fontWeight={600} px={1} lineClamp={1} bg={tone.bg} color={tone.color} border={tone.border} style={{ borderRadius: 6 }}>
                              {e.kind === 'block' ? tt('statusOff') : `${fmtTime(e.at)} ${serviceLabel(e.job.serviceType, locale)}`}
                            </Text>
                          );
                        })}
                        {list.length > 2 && <Text as="span" fontSize="10px" color="#555C66">{tt('more', { n: list.length - 2 })}</Text>}
                      </Box>
                      <HStack display={{ base: 'flex', md: 'none' }} gap="3px">
                        {list.slice(0, 3).map((e, j) => <Box key={j} w="6px" h="6px" borderRadius="full" bg={TONES[toneOf(e, now)].dot} />)}
                      </HStack>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Selected day */}
            <Box flex="1" w="100%" border="1px solid #DDE5E9" style={{ borderRadius: 6 }} overflow="hidden">
              <Box bg="#F8F8F4" px={5} py={3} borderBottom="1px solid #DDE5E9">
                <Text fontSize="10.5px" fontWeight={700} color="#555C66" textTransform="uppercase" fontFamily="heading" letterSpacing="0.07em">
                  {selected.toLocaleDateString(dl, { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
              </Box>
              {loading ? (
                <Text p={5} color="slate.400" fontSize="sm">{tt('loading')}</Text>
              ) : entries.length === 0 ? (
                <Box p={5}>
                  <Text color="slate.500" fontSize="sm">{tt('emptyDay')}</Text>
                  <Button mt={3} size="sm" variant="outline" borderColor="#DDE5E9" borderRadius="6px" color="#111418" onClick={() => openForm(selected)}>{tt('blockThisDay')}</Button>
                </Box>
              ) : (
                <VStack gap={0} align="stretch">
                  {entries.map((e, i) => {
                    const tone = TONES[toneOf(e, now)];
                    return (
                      <Box key={i} position="relative" px={5} py={4} borderBottom={i < entries.length - 1 ? '1px solid #F1F4F6' : undefined}>
                        <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={tone.dot} />
                        <HStack gap={2} flexWrap="wrap" mb={2}>
                          <Text fontSize="9.5px" fontWeight={700} px="6px" py="2px" bg={tone.bg} color={tone.color} border={tone.border} textTransform="uppercase" letterSpacing="0.05em" style={{ borderRadius: 6 }}>
                            {tt(statusKey(e, now))}
                          </Text>
                          {e.kind !== 'block' && <Text fontWeight="bold" fontSize="sm" color="#111418" fontFamily="heading">{serviceLabel(e.job.serviceType, locale)}</Text>}
                        </HStack>

                        {e.kind === 'block' ? (
                          <BlockDetails entry={e} allDay={tt('allDay')} remove={tt('remove')} fmtTime={fmtTime} onRemove={() => removeBlock(e.block.id)} />
                        ) : (
                          <VStack align="start" gap={1.5}>
                            <HStack gap={1.5} fontSize="sm" color="#555C66">
                              <Icon as={LucideClock} w={4} h={4} color="#185FC6" />
                              <Text fontWeight={600} color="#111418">{fmtTime(e.at)}{e.job.estimatedHours ? ` · ~${e.job.estimatedHours}h` : ''}</Text>
                            </HStack>
                            <HStack gap={1.5} fontSize="sm" color="#555C66" align="start">
                              <Icon as={LucideMapPin} w={4} h={4} color="#185FC6" mt="2px" />
                              <Box>
                                <Text>{e.job.address}</Text>
                                {e.job.addressIsApproximate && <Text fontSize="11px" color="slate.400">{tt('approxArea')}</Text>}
                              </Box>
                            </HStack>
                            {e.job.client?.name && (
                              <HStack gap={1.5} fontSize="sm" color="#555C66"><Icon as={LucideUser} w={4} h={4} /><Text>{e.job.client.name}</Text></HStack>
                            )}
                            {isRecurring(e.job.frequency) && (
                              <HStack gap={1.5} fontSize="sm" color="#111418"><Icon as={LucideRepeat} w={4} h={4} /><Text>{tt(`every_${e.job.frequency}`)}</Text></HStack>
                            )}
                            {e.kind === 'visit' && <Text fontSize="11px" color="slate.500">{tt('recurringHint')}</Text>}
                            <HStack gap={3} flexWrap="wrap" fontSize="xs" color="slate.500">
                              {(e.job.bedrooms ?? 0) > 0 && <Text><Glyph name="bed" />{e.job.bedrooms}bd</Text>}
                              {(e.job.bathrooms ?? 0) > 0 && <Text><Glyph name="bath" />{e.job.bathrooms}ba</Text>}
                              {(e.job.squareMeters ?? 0) > 0 && <Text><Glyph name="area" />{Math.round((e.job.squareMeters ?? 0) * 10.764)} sq ft</Text>}
                              {e.job.estimatedMinPrice != null && <Text fontWeight={700} color="#111418">${e.job.estimatedMinPrice}–${e.job.estimatedMaxPrice}</Text>}
                            </HStack>
                            {e.job.review && (
                              <HStack gap={1}>
                                <Icon as={LucideStar} w={3.5} h={3.5} color="#111418" />
                                <Text fontSize="xs" color="#111418">{'★'.repeat(e.job.review.rating)}{'☆'.repeat(5 - e.job.review.rating)}</Text>
                                {e.job.review.comment && <Text fontSize="xs" color="slate.500" fontStyle="italic">“{e.job.review.comment}”</Text>}
                              </HStack>
                            )}
                            {e.job.conversationId && (
                              <NextLink href={`/dashboard/chat/${e.job.conversationId}`}>
                                <Box as="span" display="inline-flex" alignItems="center" gap={1} mt={1} px={2.5} py={1} fontSize="xs" fontWeight={600}
                                  color="#111418" border="1px solid #DDE5E9" _hover={{ bg: '#F8F8F4' }} style={{ borderRadius: 6 }}>
                                  <Icon as={LucideMessageSquare} w={3.5} h={3.5} />{tt('openChat')}
                                </Box>
                              </NextLink>
                            )}
                          </VStack>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </Box>
          </Flex>

          {/* Legend and the reminder promise */}
          <Flex gap={3} wrap="wrap" align="center" justify="space-between">
            <HStack gap={3} wrap="wrap">
              {(Object.keys(legendKey) as Tone[]).map(key => (
                <HStack key={key} gap={1.5}>
                  <Box w="10px" h="10px" bg={TONES[key].bg} border={TONES[key].border} style={{ borderRadius: 6 }} />
                  <Text fontSize="xs" color="#555C66">{tt(legendKey[key])}</Text>
                </HStack>
              ))}
            </HStack>
            <Text fontSize="xs" color="slate.500">{tt('reminderNote')}</Text>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
}

// A time-off block on one day: all day, or its hours clipped to that day.
function BlockDetails({ entry, allDay, remove, fmtTime, onRemove }: {
  entry: Extract<Entry, { kind: 'block' }>; allDay: string; remove: string; fmtTime: (d: Date) => string; onRemove: () => void;
}) {
  const start = new Date(entry.block.startTime), end = new Date(entry.block.endTime);
  const dayEnd = addDays(dayStart(entry.at), 1);
  const wholeDay = start <= dayStart(entry.at) && end.getTime() >= dayEnd.getTime() - 1000;
  return (
    <VStack align="start" gap={1.5}>
      <HStack gap={1.5} fontSize="sm" color="#555C66">
        <Icon as={LucideClock} w={4} h={4} color="#185FC6" />
        <Text>{wholeDay ? allDay : `${fmtTime(entry.at)} – ${fmtTime(end < dayEnd ? end : dayEnd)}`}</Text>
      </HStack>
      {entry.block.reason && <Text fontSize="xs" color="slate.500">{entry.block.reason}</Text>}
      <Button size="xs" variant="ghost" color="red.500" px={1} onClick={onRemove}>
        <Icon as={LucideTrash2} w={3.5} h={3.5} mr={1} />{remove}
      </Button>
    </VStack>
  );
}
