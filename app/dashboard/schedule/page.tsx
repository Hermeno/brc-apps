'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Icon,
} from '@chakra-ui/react';
import {
  LucideMapPin, LucideCalendar, LucideUser, LucideCheckCircle2,
  LucideClock, LucidePhone, LucideStar, LucideCalendarDays,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';

type Job = {
  id: string; serviceType: string; address: string; dateTime: string;
  status: string; notes?: string; frequency?: string;
  bedrooms?: number; bathrooms?: number; squareMeters?: number;
  estimatedMinPrice?: number; estimatedMaxPrice?: number; estimatedHours?: number;
  client?: { name: string; email: string; phone?: string | null } | null;
  review?: { rating: number; comment?: string | null } | null;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <HStack gap={0.5}>
      {[1, 2, 3, 4, 5].map(s => (
        <Text key={s} fontSize="sm" color={rating >= s ? '#F59E0B' : '#E5E7EB'}>★</Text>
      ))}
    </HStack>
  );
}

export default function SchedulePage() {
  const [jobs, setJobs]     = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedule');
      if (res.ok) setJobs((await res.json()).jobs);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const now = new Date();
  const upcoming = jobs.filter(j => j.status === 'ACCEPTED' && new Date(j.dateTime) >= now);
  const today    = jobs.filter(j => j.status === 'ACCEPTED' && new Date(j.dateTime) < now && new Date(j.dateTime).toDateString() === now.toDateString());
  const completed = jobs.filter(j => j.status === 'COMPLETED');

  const accentColor = (job: Job) => {
    if (job.status === 'COMPLETED') return '#22C55E';
    const dt = new Date(job.dateTime);
    if (dt.toDateString() === now.toDateString()) return '#F97316';
    return '#0A80DB';
  };

  const SectionPanel = ({ label, items, accentBg }: { label: string; items: Job[]; accentBg: string }) =>
    items.length === 0 ? null : (
      <Box border="1px solid #E2E8F0">
        {/* Section header */}
        <Box bg="#F8FAFC" px={5} py={3} borderBottom="1px solid #E2E8F0">
          <HStack gap={2}>
            <Text
              fontSize="10.5px"
              fontWeight={700}
              color="#94A3B8"
              textTransform="uppercase"
              fontFamily="heading"
              letterSpacing="0.07em">
              {label}
            </Text>
            <Text
              style={{ borderRadius: 2, background: accentBg, padding: '2px 6px', fontSize: 9.5, fontWeight: 700, color: '#fff' }}>
              {items.length}
            </Text>
          </HStack>
        </Box>

        {/* Job rows */}
        <VStack gap={0} align="stretch">
          {items.map((job, i) => {
            const dt = new Date(job.dateTime);
            const isPast = dt < now;
            const leftColor = accentColor(job);
            const isLast = i === items.length - 1;
            return (
              <Box
                key={job.id}
                position="relative"
                bg="white"
                px={5}
                py={4}
                borderBottom={isLast ? undefined : '1px solid #F1F5F9'}>
                {/* Left accent strip */}
                <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={leftColor} />

                <Flex justify="space-between" align="start" gap={4}>
                  <VStack align="start" gap={2} flex={1}>

                    <HStack gap={2} flexWrap="wrap">
                      <Text
                        style={{
                          borderRadius: 2,
                          background: job.status === 'COMPLETED' ? '#F8FAFC' : '#DBEAFE',
                          padding: '2px 6px',
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: job.status === 'COMPLETED' ? '#0A80DB' : '#0A80DB',
                        }}>
                        {job.status === 'COMPLETED' ? '✓ Completed' : 'Confirmed'}
                      </Text>
                      <Text fontWeight="bold" color="slate.900" fontFamily="heading">{job.serviceType}</Text>
                    </HStack>

                    <HStack gap={4} flexWrap="wrap">
                      <HStack gap={1.5} color="slate.500" fontSize="sm">
                        <Icon as={LucideMapPin} w={4} h={4} color="#0A80DB" />
                        <Text>{job.address}</Text>
                      </HStack>
                      <HStack gap={1.5} color="slate.500" fontSize="sm">
                        <Icon as={LucideCalendar} w={4} h={4} color="#0A80DB" />
                        <Text fontWeight="semibold" color={isPast ? '#94A3B8' : 'slate.700'}>
                          {dt.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                        </Text>
                      </HStack>
                    </HStack>

                    {/* Property details: inline text, no badges */}
                    {(job.bedrooms || job.bathrooms || (job.squareMeters ?? 0) > 0 || job.estimatedHours) && (
                      <HStack gap={3} flexWrap="wrap">
                        {job.bedrooms && (
                          <Text fontSize="xs" color="slate.500">🛏 {job.bedrooms}bd</Text>
                        )}
                        {job.bathrooms && (
                          <Text fontSize="xs" color="slate.500">🚿 {job.bathrooms}ba</Text>
                        )}
                        {(job.squareMeters ?? 0) > 0 && (
                          <Text fontSize="xs" color="slate.500">📐 {job.squareMeters}m²</Text>
                        )}
                        {job.estimatedHours && (
                          <HStack gap={1}>
                            <Icon as={LucideClock} w={3} h={3} color="slate.400" />
                            <Text fontSize="xs" color="slate.500">~{job.estimatedHours}h</Text>
                          </HStack>
                        )}
                      </HStack>
                    )}

                    {/* Client info: flat HStack, no bg box */}
                    {job.client && (
                      <HStack gap={3} flexWrap="wrap">
                        <HStack gap={1.5} color="slate.600" fontSize="sm">
                          <Icon as={LucideUser} w={4} h={4} />
                          <Text fontWeight="semibold">{job.client.name}</Text>
                        </HStack>
                        {job.client.phone && (
                          <HStack gap={1} color="slate.500" fontSize="sm">
                            <Icon as={LucidePhone} w={3} h={3} />
                            <Text>{job.client.phone}</Text>
                          </HStack>
                        )}
                      </HStack>
                    )}

                    {/* Review: flat stars inline */}
                    {job.review && (
                      <HStack gap={2}>
                        <Icon as={LucideStar} w={4} h={4} color="#F59E0B" />
                        <StarRow rating={job.review.rating} />
                        {job.review.comment && (
                          <Text fontSize="xs" color="slate.500" fontStyle="italic">
                            "{job.review.comment}"
                          </Text>
                        )}
                      </HStack>
                    )}

                  </VStack>

                  <Box textAlign="right" flexShrink={0}>
                    {job.estimatedMinPrice && (
                      <Text fontWeight="black" fontSize="lg" color="#0A80DB" fontFamily="heading">
                        ${job.estimatedMinPrice}–${job.estimatedMaxPrice}
                      </Text>
                    )}
                    <Text fontSize="xs" color="slate.400" mt={0.5}>
                      {dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>
    );

  // StatStrip counts
  const statItems = [
    { label: 'TODAY', value: today.length, color: '#F97316' },
    { label: 'UPCOMING', value: upcoming.length, color: '#0A80DB' },
    { label: 'COMPLETED', value: completed.length, color: '#22C55E' },
  ];

  return (
    <Box minH="100vh" bg="#F8FAFC">
      <CleanerNav />
      <Box p={6} maxW="1200px" mx="auto">

        <HStack gap={2.5} mb={6}>
          <Heading size="md" fontWeight="bold" color="slate.900" fontFamily="heading">My Schedule</Heading>
        </HStack>

        <VStack gap={6} align="stretch">

          {/* StatStrip */}
          <Box border="1px solid #E2E8F0" bg="white">
            <Flex>
              {statItems.map((s, i) => (
                <Box
                  key={s.label}
                  flex={1}
                  px={5}
                  py={4}
                  borderRight={i < statItems.length - 1 ? '1px solid #E2E8F0' : undefined}
                  textAlign="center">
                  <Text
                    fontSize="22px"
                    fontWeight={800}
                    fontFamily="heading"
                    color={s.color}
                    letterSpacing="-0.03em"
                    lineHeight={1}>
                    {loading ? '—' : s.value}
                  </Text>
                  <Text
                    fontSize="11px"
                    color="#94A3B8"
                    textTransform="uppercase"
                    fontFamily="heading"
                    letterSpacing="0.07em"
                    mt={1}>
                    {s.label}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>

          {loading ? (
            <Box textAlign="center" py={16}>
              <Text color="slate.400">Loading schedule…</Text>
            </Box>
          ) : jobs.length === 0 ? (
            <Box border="1px solid #E2E8F0" p={16} textAlign="center" bg="white">
              <Icon as={LucideCalendarDays} w={14} h={14} color="slate.300" mb={4} />
              <Text color="slate.600" fontWeight="bold" fontSize="lg" fontFamily="heading">No jobs scheduled</Text>
              <Text color="slate.400" fontSize="sm" mt={1}>
                Accept leads in the Marketplace to see your jobs here.
              </Text>
            </Box>
          ) : (
            <>
              <SectionPanel label="TODAY" items={today} accentBg="#F97316" />
              <SectionPanel label="UPCOMING JOBS" items={upcoming} accentBg="#0A80DB" />
              <SectionPanel label="HISTORY" items={completed} accentBg="#22C55E" />
            </>
          )}

        </VStack>
      </Box>
    </Box>
  );
}
