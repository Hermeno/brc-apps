'use client';

import { useState, useEffect } from 'react';
import {
  Box, Flex, HStack, VStack, Text, Heading, Badge, Icon,
  SimpleGrid, Container,
} from '@chakra-ui/react';
import {
  LucideStar, LucideMapPin, LucideBriefcase, LucideAward,
  LucideCamera, LucideArrowLeft, LucideUser, LucideCalendar,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { motion } from 'motion/react';

/* ─── types ──────────────────────────────────────────────────── */
type Photo = { id: string; url: string; caption?: string | null; createdAt: string };
type Review = {
  id: string; rating: number; comment?: string | null; createdAt: string;
  client: { name: string | null };
  lead: { serviceType: string };
};
type Cleaner = {
  id: string; name: string | null; bio: string | null; plan: string;
  serviceTypes: string[]; createdAt: string; avatarUrl: string | null;
  phone?: string | null; canSeeContact?: boolean;
  stats: { ratingAvg: number; totalLeads: number } | null;
  workPhotos: Photo[];
  cleanerReviews: Review[];
  completedJobs: number;
};

const PLAN_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  FREE:    { bg: '#F3F4F6', color: '#6B7280', label: 'Free' },
  BASIC:   { bg: '#EBF5FE', color: '#0A80DB', label: 'Basic' },
  PRO:     { bg: '#FFFBEB', color: '#D97706', label: 'Pro ⭐' },
  PREMIUM: { bg: '#FFFBEB', color: '#D97706', label: 'Pro ⭐' }, // legacy alias
};

function Stars({ value, size = 4 }: { value: number; size?: number }) {
  return (
    <HStack gap={0.5}>
      {[1, 2, 3, 4, 5].map(s => (
        <Icon key={s} as={LucideStar} w={size} h={size}
          color={value >= s ? '#F59E0B' : '#E5E7EB'}
          fill={value >= s ? '#F59E0B' : 'none'} />
      ))}
    </HStack>
  );
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cleaner, setCleaner] = useState<Cleaner | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    fetch(`/api/profile/${id}`)
      .then(r => r.json())
      .then(d => {
        console.log('[profile page] response:', d);
        if (d.cleaner) setCleaner(d.cleaner);
      })
      .catch(e => console.error('[profile page] fetch error:', e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box minH="100vh" bg="slate.50" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={3}>
          <Box w="40px" h="40px" border="3px solid" borderColor="brand.500" borderTopColor="transparent"
            borderRadius="full" animation="spin 0.8s linear infinite" />
          <Text color="slate.500" fontSize="sm">Loading profile...</Text>
        </VStack>
      </Box>
    );
  }

  if (!cleaner) {
    return (
      <Box minH="100vh" bg="slate.50" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={4} textAlign="center">
          <Text fontSize="4xl">🔍</Text>
          <Heading size="md" color="slate.700">Cleaner not found</Heading>
          <Box as="button" onClick={() => router.back()}
            color="brand.500" fontWeight="semibold" fontSize="sm" cursor="pointer">
            ← Back
          </Box>
        </VStack>
      </Box>
    );
  }

  const planStyle = PLAN_COLORS[cleaner.plan] ?? PLAN_COLORS.FREE;
  const joinedDate = new Date(cleaner.createdAt);
  const monthsOnPlatform = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const isExperienced = monthsOnPlatform >= 3 || cleaner.completedJobs >= 10;
  const ratingAvg = cleaner.stats?.ratingAvg ?? 0;
  const firstLetter = (cleaner.name ?? 'P')[0].toUpperCase();

  return (
    <Box minH="100vh" bg="slate.50">

      {/* Back button — dark nav consistent with all other pages */}
      <Box bg="#0B1120" px={6} py={3} position="sticky" top={0} zIndex={40}
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.2)' }}>
        <Box maxW="900px" mx="auto">
          <Box as="button" onClick={() => router.back()}
            display="inline-flex" alignItems="center" gap={1.5}
            color="rgba(255,255,255,0.5)" fontWeight="semibold" fontSize="sm" cursor="pointer"
            _hover={{ color: 'white' }} transition="color 0.15s">
            <Icon as={LucideArrowLeft} w={4} h={4} />
            Back
          </Box>
        </Box>
      </Box>

      <Container maxW="900px" py={8} px={6}>
        <VStack gap={6} align="stretch">

          {/* ── Hero card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Box bg="white" border="1px solid" borderColor="slate.200">

              <Box px={6} pt={6} pb={6}>
                {/* Avatar */}
                <Box mb={4}>
                  <Box
                    w="72px" h="72px"
                    borderRadius="full"
                    overflow="hidden"
                    bg="brand.500"
                    display="flex" alignItems="center" justifyContent="center"
                  >
                    {cleaner.avatarUrl ? (
                      <img src={cleaner.avatarUrl} alt={cleaner.name ?? 'Avatar'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Text color="white" fontWeight="black" fontSize="2xl">{firstLetter}</Text>
                    )}
                  </Box>
                </Box>

                <Flex justify="space-between" align="start" flexWrap="wrap" gap={3}>
                  <VStack align="start" gap={1.5}>
                    <Heading size="lg" fontWeight="black" color="slate.900">
                      {cleaner.name ?? 'Professional'}
                    </Heading>
                    <HStack gap={2} flexWrap="wrap">
                      <Badge
                        bg={planStyle.bg} color={planStyle.color}
                        borderRadius="4px" px={3} py={0.5}
                        fontSize="xs" fontWeight="bold">
                        {planStyle.label}
                      </Badge>
                      <Badge
                        bg="#EBF5FE" color="#0A80DB"
                        borderRadius="4px" px={3} py={0.5}
                        fontSize="xs" fontWeight="bold">
                        {isExperienced ? '⭐ Experienced' : '🆕 New on the platform'}
                      </Badge>
                    </HStack>
                  </VStack>

                  {/* Stats */}
                  <HStack gap={5}>
                    <VStack gap={0} align="center">
                      <Stars value={Math.round(ratingAvg)} />
                      <Text fontSize="xs" color="slate.500" mt={0.5}>
                        {ratingAvg > 0 ? ratingAvg.toFixed(1) : '—'} ({cleaner.cleanerReviews.length})
                      </Text>
                    </VStack>
                    <VStack gap={0} align="center">
                      <Text fontWeight="black" fontSize="xl" color="slate.800">{cleaner.completedJobs}</Text>
                      <Text fontSize="xs" color="slate.500">jobs</Text>
                    </VStack>
                  </HStack>
                </Flex>

                {/* Bio */}
                {cleaner.bio && (
                  <Text color="slate.600" fontSize="sm" mt={4} lineHeight="1.7">
                    {cleaner.bio}
                  </Text>
                )}

                {/* Service types */}
                {cleaner.serviceTypes.length > 0 && (
                  <HStack gap={2} mt={4} flexWrap="wrap">
                    <Icon as={LucideBriefcase} w={4} h={4} color="slate.400" />
                    {cleaner.serviceTypes.map(s => (
                      <Badge key={s} bg="slate.100" color="slate.600"
                        borderRadius="4px" px={3} py={0.5} fontSize="xs">
                        {s}
                      </Badge>
                    ))}
                  </HStack>
                )}

                {/* Contact info — only shown after client accepts + cleaner pays */}
                {cleaner.canSeeContact && cleaner.phone && (
                  <HStack gap={2} mt={4} bg="#F6F9FC" border="1px solid" borderColor="#E3E8EE"
                    borderRadius="4px" px={4} py={3}>
                    <Icon as={LucideMapPin} w={4} h={4} color="#0A80DB" />
                    <Text fontSize="sm" fontWeight="semibold" color="#0A80DB">
                      📱 {cleaner.phone}
                    </Text>
                  </HStack>
                )}
                {!cleaner.canSeeContact && (
                  <HStack gap={2} mt={4} bg="slate.50" border="1px dashed" borderColor="slate.200"
                    borderRadius="4px" px={4} py={3}>
                    <Icon as={LucideMapPin} w={4} h={4} color="slate.400" />
                    <Text fontSize="xs" color="slate.400">
                      Contact details are visible after you accept this cleaner.
                    </Text>
                  </HStack>
                )}

                {/* Member since */}
                <HStack gap={1.5} mt={4} color="slate.400" fontSize="xs">
                  <Icon as={LucideCalendar} w={3.5} h={3.5} />
                  <Text>Member since {joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                  {monthsOnPlatform >= 1 && (
                    <Text>· {monthsOnPlatform} {monthsOnPlatform === 1 ? 'month' : 'months'} on the platform</Text>
                  )}
                </HStack>
              </Box>
            </Box>
          </motion.div>

          {/* ── Photo Gallery ── */}
          {cleaner.workPhotos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Box bg="white" border="1px solid" borderColor="slate.200" p={6}>
                <HStack gap={2} mb={5}>
                  <Icon as={LucideCamera} w={5} h={5} color="brand.500" />
                  <Heading size="sm" fontWeight="bold" color="slate.800">Work gallery</Heading>
                  <Badge bg="slate.100" color="slate.500" borderRadius="4px" px={2} fontSize="xs">
                    {cleaner.workPhotos.length} photo{cleaner.workPhotos.length !== 1 ? 's' : ''}
                  </Badge>
                </HStack>
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={3}>
                  {cleaner.workPhotos.map((photo, i) => (
                    <motion.div key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      whileHover={{ scale: 1.02 }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setLightbox(photo)}>
                      <Box
                        overflow="hidden"
                        border="1px solid"
                        borderColor="slate.100"
                        position="relative"
                        paddingBottom="100%"
                        bg="slate.100"
                        _hover={{ borderColor: '#0A80DB' }}
                        transition="border-color 0.15s">
                        <img
                          src={photo.url}
                          alt={photo.caption ?? `Job ${i + 1}`}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      {photo.caption && (
                        <Text fontSize="xs" color="slate.500" mt={1} lineClamp={1} px={0.5}>
                          {photo.caption}
                        </Text>
                      )}
                    </motion.div>
                  ))}
                </SimpleGrid>
              </Box>
            </motion.div>
          )}

          {/* ── Reviews ── */}
          {cleaner.cleanerReviews.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
              <Box bg="white" border="1px solid" borderColor="slate.200" p={6}>
                <HStack gap={2} mb={5}>
                  <Icon as={LucideAward} w={5} h={5} color="#0A80DB" />
                  <Heading size="sm" fontWeight="bold" color="slate.800">Client reviews</Heading>
                  {ratingAvg > 0 && (
                    <HStack gap={1.5}>
                      <Stars value={Math.round(ratingAvg)} size={3.5} />
                      <Text fontSize="xs" color="slate.500" fontWeight="bold">{ratingAvg.toFixed(1)}</Text>
                    </HStack>
                  )}
                </HStack>
                <VStack gap={4} align="stretch">
                  {cleaner.cleanerReviews.map((review, i) => (
                    <motion.div key={review.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}>
                      <Box bg="slate.50" border="1px solid" borderColor="slate.100" p={4}>
                        <Flex justify="space-between" align="start" gap={3}>
                          <HStack gap={2.5} align="start">
                            <Box w="32px" h="32px" bg="brand.500" borderRadius="full" flexShrink={0}
                              display="flex" alignItems="center" justifyContent="center"
                              color="white" fontSize="sm" fontWeight="bold">
                              {(review.client.name ?? 'C')[0].toUpperCase()}
                            </Box>
                            <VStack align="start" gap={1}>
                              <HStack gap={2}>
                                <Text fontSize="sm" fontWeight="bold" color="slate.800">
                                  {review.client.name ?? 'Client'}
                                </Text>
                                <Stars value={review.rating} size={3.5} />
                              </HStack>
                              <Badge bg="slate.100" color="slate.500" fontSize="xs" borderRadius="4px" px={2}>
                                {review.lead.serviceType}
                              </Badge>
                              {review.comment && (
                                <Text fontSize="sm" color="slate.600" mt={1} lineHeight="1.6">
                                  "{review.comment}"
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                          <Text fontSize="xs" color="slate.400" whiteSpace="nowrap">
                            {new Date(review.createdAt).toLocaleDateString('en-US')}
                          </Text>
                        </Flex>
                      </Box>
                    </motion.div>
                  ))}
                </VStack>
              </Box>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Box bg="white" border="1px solid" borderColor="slate.200" p={8} textAlign="center">
                <Text fontSize="2xl" mb={2}>⭐</Text>
                <Text color="slate.500" fontSize="sm">No reviews yet. Be the first to leave one!</Text>
              </Box>
            </motion.div>
          )}

        </VStack>
      </Container>

      {/* ── Lightbox ── */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}>
          <Box position="absolute" inset={0} bg="blackAlpha.800" />
          <Box position="relative" zIndex={1} maxW="90vw" maxH="90vh" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.caption ?? ''}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }}
            />
            {lightbox.caption && (
              <Text color="white" textAlign="center" mt={3} fontSize="sm">{lightbox.caption}</Text>
            )}
            <Box
              position="absolute" top="-12px" right="-12px"
              w="36px" h="36px" bg="white" borderRadius="full"
              display="flex" alignItems="center" justifyContent="center"
              cursor="pointer" onClick={() => setLightbox(null)}
              boxShadow="md" fontWeight="bold" color="slate.600">
              ✕
            </Box>
          </Box>
        </motion.div>
      )}

    </Box>
  );
}
