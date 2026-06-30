'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, HStack, VStack, Text, Heading, Icon,
  Button, Input, Textarea, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideCamera, LucidePlus, LucideTrash2, LucideSave,
  LucideUser, LucideMapPin, LucideNavigation, LucideX, LucidePhone,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { AnimatePresence } from 'motion/react';
import { ImageUpload } from '@/components/image-upload';
import { useT } from '@/lib/i18n';

function formatUSPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
}

/* ─── types ──────────────────────────────────────────────────── */
type Photo = { id: string; url: string; caption?: string | null; createdAt: string };

const PLAN_MAX: Record<string, number> = { FREE: 60, BASIC: 60, PRO: 110, PREMIUM: 110 };

const SERVICE_LIST = [
  'Standard Cleaning', 'Deep Cleaning', 'Post-Construction', 'Move-In/Out',
  'Office', 'Condo/Apartment', 'Airbnb', 'Window Cleaning',
  'Deck Cleaning', 'Pressure Washing', 'Gutter Cleaning', 'Flashing Cleaning',
  'Tile & Grout Cleaning', 'Home Organizing', 'Garage / Basement / Attic', 'Commercial Cleaning',
];

export default function ProfilePage() {
  const t = useT();
  const [phone,             setPhone]        = useState('');
  const [bio,               setBio]          = useState('');
  const [serviceTypes,      setServiceTypes] = useState<string[]>([]);
  const [avatarUrl,         setAvatarUrl]    = useState('');
  const [latitude,          setLatitude]     = useState<number | null>(null);
  const [longitude,         setLongitude]    = useState<number | null>(null);
  const [locationLabel,     setLocationLabel] = useState('');
  const [geoLoading,        setGeoLoading]   = useState(false);
  const [serviceRadiusMiles, setServiceRadius] = useState<number>(25);
  const [planMaxRadius,      setPlanMaxRadius] = useState<number>(25);
  const [zipCode,            setZipCode]      = useState('');
  const [photos,            setPhotos]       = useState<Photo[]>([]);
  const [saving,            setSaving]       = useState(false);

  // Photo gallery state
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [pendingUrl,    setPendingUrl]    = useState('');
  const [photoCaption,  setPhotoCaption]  = useState('');
  const [uploading,     setUploading]     = useState(false);
  const [addingPhoto,   setAddingPhoto]   = useState(false);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/plan')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const maxR = PLAN_MAX[d.plan ?? 'FREE'] ?? 60;
        setPlanMaxRadius(maxR);
        setZipCode(d.zipCode ?? '');
        if (d.id) fetchProfile(d.id);
      })
      .catch(() => {});
  }, []);

  const fetchProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/${id}`);
      if (!res.ok) return;
      const d = await res.json();
      if (d.cleaner) {
        if (d.cleaner.phone) {
          const digits = d.cleaner.phone.replace(/\D/g, '').slice(-10);
          setPhone(formatUSPhone(digits));
        }
        setBio(d.cleaner.bio ?? '');
        setServiceTypes(d.cleaner.serviceTypes ?? []);
        setAvatarUrl(d.cleaner.avatarUrl ?? '');
        setPhotos(d.cleaner.workPhotos ?? []);
        setServiceRadius(d.cleaner.serviceRadiusMiles ?? 25);
        if (d.cleaner.latitude && d.cleaner.longitude) {
          setLatitude(d.cleaner.latitude);
          setLongitude(d.cleaner.longitude);
          reverseGeocode(d.cleaner.latitude, d.cleaner.longitude);
        }
      }
    } catch {}
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en-US' } }
      );
      const data = await res.json();
      const addr = data.address;
      const label = [
        addr.suburb || addr.neighbourhood || addr.quarter,
        addr.city || addr.town || addr.municipality,
        addr.state,
      ].filter(Boolean).join(', ');
      setLocationLabel(label || data.display_name?.split(',').slice(0, 2).join(',') || '');
    } catch {}
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toaster.create({ title: t('cleaner.profile.toastLocationUnsupported'), type: 'error' });
      return;
    }
    setGeoLoading(true);
    const onSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLatitude(lat);
      setLongitude(lng);
      setGeoLoading(false);
      await reverseGeocode(lat, lng);
      toaster.create({ title: t('cleaner.profile.toastLocationUpdated'), type: 'success' });
    };
    const onError = () => {
      // Retry with low accuracy (IP/WiFi-based) if high accuracy fails
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        () => {
          setGeoLoading(false);
          toaster.create({ title: t('cleaner.profile.toastLocationFailed'), description: t('cleaner.profile.toastLocationFailedDesc'), type: 'error' });
        },
        { enableHighAccuracy: false, timeout: 15000 }
      );
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: false, timeout: 15000 });
  };

  const toggleService = (s: string) =>
    setServiceTypes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio, serviceTypes, avatarUrl, latitude, longitude, serviceRadiusMiles, zipCode,
          phone: phone ? `+1${phone.replace(/\D/g, '')}` : null,
        }),
      });
      if (res.ok) {
        toaster.create({ title: t('cleaner.profile.toastSaved'), type: 'success' });
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /* ── photo upload ── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'gallery');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload error');
      setPendingUrl(data.url);
      setShowPhotoForm(true);
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!pendingUrl) return;
    setAddingPhoto(true);
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pendingUrl, caption: photoCaption.trim() || null }),
      });
      const d = await res.json();
      if (res.ok) {
        setPhotos(prev => [d.photo, ...prev]);
        setPendingUrl(''); setPhotoCaption(''); setShowPhotoForm(false);
        toaster.create({ title: t('cleaner.profile.toastPhotoAdded'), type: 'success' });
      } else {
        throw new Error(d.error);
      }
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally {
      setAddingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    setDeletingId(photoId);
    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
      if (res.ok) {
        setPhotos(prev => prev.filter(p => p.id !== photoId));
        toaster.create({ title: t('cleaner.profile.toastPhotoRemoved'), type: 'success' });
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const mapUrl = latitude && longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.015},${latitude - 0.015},${longitude + 0.015},${latitude + 0.015}&layer=mapnik&marker=${latitude},${longitude}`
    : null;

  return (
    <Box minH="100vh" bg="white">
      <CleanerNav />

      <input ref={fileInputRef} type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }} onChange={handleFileChange} />

      <Box p={6} maxW="800px" mx="auto">
        <VStack gap={6} align="stretch">

          {/* Header */}
          <Box>
            <Heading size="lg" fontWeight="black" color="slate.900" fontFamily="heading">{t('cleaner.profile.title')}</Heading>
            <Text color="slate.500" fontSize="sm" mt={1}>
              {t('cleaner.profile.subtitle')}
            </Text>
          </Box>
          {/* ── Avatar + About card ── */}
          <Box bg="white" border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
            {/* Section header */}
            <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
              <HStack gap={2}>
                <Icon as={LucideUser} w={4} h={4} color="brand.500" />
                <Text
                  fontSize="10.5px" fontWeight={700} color="#697386"
                  textTransform="uppercase" letterSpacing="0.07em" fontFamily="heading">
                  {t('cleaner.profile.sectionAbout')}
                </Text>
              </HStack>
            </Box>

            <Box p={6}>
              {/* Avatar row */}
              <Flex gap={5} align="center" mb={6}
                pb={6} borderBottom="1px solid" borderColor="slate.100">
                <ImageUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  shape="circle"
                  size={88}
                  placeholder={t('cleaner.profile.photoLabel')}
                />
                <Box flex={1}>
                  <Text fontWeight="bold" color="slate.800" fontSize="sm">{t('cleaner.profile.photoLabel')}</Text>
                  <Text fontSize="xs" color="slate.400" mt={0.5}>
                    {t('cleaner.profile.photoHint')}
                  </Text>
                  <Text fontSize="xs" color="slate.300" mt={0.5}>
                    {t('cleaner.profile.photoFormats')}
                  </Text>
                </Box>
              </Flex>

              <VStack gap={5} align="stretch">
                {/* Bio */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" mb={2}
                    textTransform="uppercase" letterSpacing="wider">{t('cleaner.profile.bioLabel')}</Text>
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder={t('cleaner.profile.bioPlaceholder')}
                    bg="slate.50" border="1px solid" borderColor="slate.200"
                    borderRadius="4px" rows={4} fontSize="sm"
                    _focus={{ borderColor: 'brand.300', bg: 'white' }}
                    resize="vertical" maxLength={500}
                  />
                  <Text fontSize="xs" color="slate.400" mt={1} textAlign="right">{bio.length}/500</Text>
                </Box>

                {/* Phone */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" mb={2}
                    textTransform="uppercase" letterSpacing="wider">{t('cleaner.profile.phoneLabel')}</Text>
                  <HStack>
                    <Icon as={LucidePhone} w={4} h={4} color="slate.400" flexShrink={0} />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(formatUSPhone(e.target.value))}
                      placeholder="(555) 123-4567"
                      bg="slate.50" border="1px solid" borderColor="slate.200"
                      borderRadius="4px" fontSize="sm" h="10"
                      _focus={{ borderColor: 'brand.300', bg: 'white' }}
                    />
                  </HStack>
                  <Text fontSize="xs" color="slate.400" mt={1}>
                    {t('cleaner.profile.phoneShared')}
                  </Text>
                </Box>

                {/* Service types */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" mb={3}
                    textTransform="uppercase" letterSpacing="wider">{t('cleaner.profile.servicesLabel')}</Text>
                  <SimpleGrid columns={{ base: 2, sm: 3 }} gap={2}>
                    {SERVICE_LIST.map(s => {
                      const sel = serviceTypes.includes(s);
                      return (
                        <Box key={s} as="button" w="full" p={2.5} borderRadius="4px" textAlign="center"
                          border={sel ? '2px solid #0A80DB' : '1px solid #E3E8EE'}
                          bg={sel ? '#F0F9FF' : 'white'} cursor="pointer"
                          onClick={() => toggleService(s)} transition="all 0.15s">
                          <Text fontSize="xs" fontWeight={sel ? 'bold' : 'medium'}
                            color={sel ? '#0A80DB' : 'slate.600'}>{t(`services.${s}`)}</Text>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Box>

                <Button
                  bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                  _hover={{ bg: '#0870C2' }}
                  transition="all 0.2s"
                  loading={saving} loadingText={t('cleaner.profile.savingProfile')}
                  onClick={handleSave}
                  alignSelf="flex-end">
                  <Icon as={LucideSave} w={4} h={4} mr={2} />
                  {t('cleaner.profile.saveProfile')}
                </Button>
              </VStack>
            </Box>
          </Box>

          {/* ── Location card ── */}
          <Box bg="white" border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
            {/* Section header */}
            <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
              <HStack gap={2}>
                <Icon as={LucideMapPin} w={4} h={4} color="brand.500" />
                <Text
                  fontSize="10.5px" fontWeight={700} color="#697386"
                  textTransform="uppercase" letterSpacing="0.07em" fontFamily="heading">
                  {t('cleaner.profile.sectionLocation')}
                </Text>
                <Text style={{ borderRadius: 2, background: '#F1F5F9', padding: '2px 6px', fontSize: '9.5px', fontWeight: 700, color: '#94A3B8' }}>
                  {t('cleaner.profile.locationOptional')}
                </Text>
              </HStack>
            </Box>

            <Box p={6}>
              <Text fontSize="xs" color="slate.400" mb={5}>
                {t('cleaner.profile.locationHint')}
              </Text>

              <VStack gap={4} align="stretch">
                {/* ZIP code — +10 pts in ranking */}
                <Box>
                  <HStack mb={1.5} gap={2}>
                    <Text fontSize="xs" fontWeight="700" color="slate.500"
                      textTransform="uppercase" letterSpacing="0.07em">
                      {t('cleaner.profile.zipLabel')}
                    </Text>
                    <Text style={{
                      borderRadius: 2, background: '#EFF6FF',
                      padding: '2px 6px', fontSize: '9.5px', fontWeight: 700, color: '#0A80DB',
                    }}>
                      {t('cleaner.profile.zipBonus')}
                    </Text>
                  </HStack>
                  <Input
                    placeholder="e.g., 33101"
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    maxLength={9}
                    bg="slate.50" border="1px solid" borderColor="slate.200"
                    borderRadius="4px" h="10" fontSize="sm"
                    _focus={{ bg: 'white', borderColor: 'brand.300' }}
                  />
                  <Text fontSize="xs" color="slate.400" mt={1}>
                    {t('cleaner.profile.zipHint')}
                  </Text>
                </Box>

                {/* Detect button */}
                <Button
                  variant="outline" borderColor="slate.200" color="slate.600"
                  borderRadius="4px" fontWeight="semibold" fontSize="sm"
                  _hover={{ borderColor: 'brand.300', color: 'brand.600', bg: 'brand.50' }}
                  transition="all 0.15s"
                  loading={geoLoading} loadingText={t('cleaner.profile.detectLoading')}
                  onClick={handleDetectLocation}>
                  <Icon as={LucideNavigation} w={4} h={4} mr={2} />
                  {latitude ? t('cleaner.profile.updateLocation') : t('cleaner.profile.useLocation')}
                </Button>

                {/* Location label */}
                {locationLabel && (
                  <HStack gap={2} bg="#F6F9FC" border="1px solid" borderColor="#E3E8EE"
                    borderRadius="4px" px={4} py={3}>
                    <Icon as={LucideMapPin} w={4} h={4} color="#0A80DB" flexShrink={0} />
                    <Text fontSize="sm" color="#0A80DB" fontWeight="semibold">{locationLabel}</Text>
                    <Button size="xs" variant="ghost" color="slate.400" ml="auto" px={1}
                      onClick={() => { setLatitude(null); setLongitude(null); setLocationLabel(''); }}>
                      <Icon as={LucideX} w={3} h={3} />
                    </Button>
                  </HStack>
                )}

                {/* Map preview */}
                {mapUrl && (
                  <Box>
                    <Box overflow="hidden" border="1px solid" borderColor="slate.200" h="220px">
                      <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 'none', display: 'block' }}
                        title="Location on map"
                        loading="lazy"
                      />
                    </Box>
                    <Text fontSize="xs" color="slate.400" mt={1.5} textAlign="center">
                      {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
                    </Text>
                  </Box>
                )}

                {/* Service radius selector */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight="700" color="slate.500"
                      textTransform="uppercase" letterSpacing="0.07em">
                      {t('cleaner.profile.radiusLabel')}
                    </Text>
                    <Text style={{
                      fontSize: '9.5px', fontWeight: 700, padding: '2px 7px',
                      background: '#EFF6FF', color: '#0A80DB', borderRadius: 2,
                    }}>
                      {t('cleaner.profile.radiusPlan', { max: planMaxRadius })}
                    </Text>
                  </HStack>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {[15, 25, 40, 60, 80, 110].map(miles => {
                      const locked = miles > planMaxRadius;
                      const active = serviceRadiusMiles === miles;
                      return (
                        <Box
                          key={miles}
                          as="button"
                          px={3} py={1.5}
                          fontSize="13px" fontWeight="600" fontFamily="heading"
                          border="1px solid"
                          borderRadius="4px"
                          cursor={locked ? 'not-allowed' : 'pointer'}
                          opacity={locked ? 0.38 : 1}
                          transition="all 0.12s"
                          bg={active ? '#0A80DB' : 'white'}
                          color={active ? 'white' : locked ? 'slate.400' : 'slate.600'}
                          borderColor={active ? '#0A80DB' : '#E3E8EE'}
                          _hover={locked ? {} : { borderColor: '#0A80DB', color: active ? 'white' : '#0A80DB' }}
                          onClick={() => !locked && setServiceRadius(miles)}
                        >
                          {miles} {miles === 1 ? t('cleaner.profile.mile') : t('cleaner.profile.miles')}{locked ? ' 🔒' : ''}
                        </Box>
                      );
                    })}
                  </Box>
                  <Text fontSize="11px" color="slate.400" mt={1.5}>
                    {t('cleaner.profile.radiusHint')}
                    {planMaxRadius < 110 && (
                      <> {t('cleaner.profile.radiusUpgrade')}</>
                    )}
                  </Text>
                </Box>

                {/* Save location button */}
                <Button
                  bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                  _hover={{ bg: '#0870C2' }}
                  transition="all 0.2s"
                  loading={saving} loadingText={t('cleaner.profile.savingLocation')}
                  onClick={handleSave}
                  alignSelf="flex-end">
                  <Icon as={LucideSave} w={4} h={4} mr={2} />
                  {t('cleaner.profile.saveLocation')}
                </Button>
              </VStack>
            </Box>
          </Box>

          {/* ── Photo Gallery card ── */}
          <Box bg="white" border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
            {/* Section header */}
            <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
              <Flex justify="space-between" align="center">
                <HStack gap={2}>
                  <Icon as={LucideCamera} w={4} h={4} color="brand.500" />
                  <Text
                    fontSize="10.5px" fontWeight={700} color="#697386"
                    textTransform="uppercase" letterSpacing="0.07em" fontFamily="heading">
                    {t('cleaner.profile.sectionGallery')}
                  </Text>
                  <Text style={{ borderRadius: 2, background: '#F1F5F9', padding: '2px 6px', fontSize: '9.5px', fontWeight: 700, color: '#94A3B8' }}>
                    {photos.length}/20
                  </Text>
                </HStack>
                {photos.length < 20 && !showPhotoForm && (
                  <Button size="sm" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                    _hover={{ bg: '#0870C2' }}
                    loading={uploading} loadingText={t('cleaner.profile.uploadingPhoto')}
                    onClick={() => fileInputRef.current?.click()}>
                    <Icon as={LucidePlus} w={3.5} h={3.5} mr={1.5} />
                    {t('cleaner.profile.addPhoto')}
                  </Button>
                )}
              </Flex>
            </Box>

            <Box p={6}>
              {/* Caption form after upload */}
              <AnimatePresence>
                {showPhotoForm && pendingUrl && (
                  <Box bg="brand.50" border="1px solid" borderColor="brand.200" borderRadius="4px" p={4} mb={5}>
                    <Text fontSize="sm" fontWeight="bold" color="brand.700" mb={3}>
                      {t('cleaner.profile.captionTitle')}
                    </Text>
                    <Flex gap={3} align="flex-start">
                      <Box w="80px" h="80px" borderRadius="4px" overflow="hidden" flexShrink={0}
                        border="1px solid" borderColor="brand.200">
                        <img src={pendingUrl} alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                      <VStack gap={3} flex={1} align="stretch">
                        <Input
                          placeholder={t('cleaner.profile.captionPlaceholder')}
                          value={photoCaption}
                          onChange={e => setPhotoCaption(e.target.value)}
                          bg="white" borderRadius="4px" h="10" border="1px solid"
                          borderColor="brand.200" fontSize="sm"
                          _focus={{ borderColor: 'brand.400' }}
                        />
                        <HStack gap={2} justify="flex-end">
                          <Button size="sm" variant="ghost" color="slate.500"
                            onClick={() => { setShowPhotoForm(false); setPendingUrl(''); setPhotoCaption(''); }}>
                            {t('common.cancel')}
                          </Button>
                          <Button size="sm" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                            _hover={{ bg: '#0870C2' }}
                            loading={addingPhoto} loadingText={t('cleaner.profile.addingPhoto')}
                            onClick={handleAddPhoto}>
                            {t('cleaner.profile.addToGallery')}
                          </Button>
                        </HStack>
                      </VStack>
                    </Flex>
                  </Box>
                )}
              </AnimatePresence>

              {photos.length === 0 ? (
                <Box textAlign="center" py={10} border="2px dashed" borderColor="slate.200" borderRadius="4px"
                  cursor="pointer" onClick={() => fileInputRef.current?.click()}
                  _hover={{ borderColor: 'brand.300', bg: 'brand.50' }} transition="all 0.15s">
                  <Text fontSize="3xl" mb={2}>📷</Text>
                  <Text color="slate.500" fontSize="sm" fontWeight="semibold">{t('cleaner.profile.galleryEmpty')}</Text>
                  <Text color="slate.400" fontSize="xs" mt={1}>
                    {t('cleaner.profile.galleryEmptyHint')}
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={3}>
                  {photos.map((photo, i) => (
                    <Box key={photo.id}>
                      <Box position="relative" borderRadius="4px" overflow="hidden"
                        border="2px solid" borderColor="slate.100"
                        paddingBottom="100%" bg="slate.100"
                        _hover={{ borderColor: 'red.200' }}
                        transition="border-color 0.15s">
                        <img
                          src={photo.url}
                          alt={photo.caption ?? `Photo ${i + 1}`}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Button
                          size="sm" bg="red.500" color="white" borderRadius="4px"
                          _hover={{ bg: 'red.600' }}
                          loading={deletingId === photo.id}
                          onClick={() => handleDeletePhoto(photo.id)}
                          position="absolute" bottom={2} right={2}
                          minW={0} px={2}>
                          <Icon as={LucideTrash2} w={3.5} h={3.5} />
                        </Button>
                      </Box>
                      {photo.caption && (
                        <Text fontSize="xs" color="slate.500" mt={1} lineClamp={1} px={0.5}>
                          {photo.caption}
                        </Text>
                      )}
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
}
