'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, HStack, VStack, Text, Heading, Badge, Icon,
  Button, Input, Textarea, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideCamera, LucidePlus, LucideTrash2, LucideSave,
  LucideUser, LucideMapPin, LucideNavigation, LucideX,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { motion, AnimatePresence } from 'motion/react';
import { ImageUpload } from '@/components/image-upload';

/* ─── types ──────────────────────────────────────────────────── */
type Photo = { id: string; url: string; caption?: string | null; createdAt: string };

const SERVICE_LIST = [
  'Limpeza Padrão', 'Limpeza Profunda', 'Pós-Obra', 'Mudança',
  'Escritório', 'Condomínio', 'Airbnb', 'Janelas',
];

export default function ProfilePage() {
  const [bio,          setBio]          = useState('');
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [avatarUrl,    setAvatarUrl]    = useState('');
  const [latitude,     setLatitude]     = useState<number | null>(null);
  const [longitude,    setLongitude]    = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [geoLoading,   setGeoLoading]   = useState(false);
  const [photos,       setPhotos]       = useState<Photo[]>([]);
  const [saving,       setSaving]       = useState(false);

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
      .then(d => { if (d?.id) fetchProfile(d.id); })
      .catch(() => {});
  }, []);

  const fetchProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/${id}`);
      if (!res.ok) return;
      const d = await res.json();
      if (d.cleaner) {
        setBio(d.cleaner.bio ?? '');
        setServiceTypes(d.cleaner.serviceTypes ?? []);
        setAvatarUrl(d.cleaner.avatarUrl ?? '');
        setPhotos(d.cleaner.workPhotos ?? []);
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
        { headers: { 'Accept-Language': 'pt-BR' } }
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
      toaster.create({ title: 'Geolocalização não suportada neste browser', type: 'error' });
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setGeoLoading(false);
        await reverseGeocode(lat, lng);
        toaster.create({ title: 'Localização detectada!', type: 'success' });
      },
      err => {
        setGeoLoading(false);
        toaster.create({ title: 'Não foi possível detectar a localização', description: err.message, type: 'error' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleService = (s: string) =>
    setServiceTypes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, serviceTypes, avatarUrl, latitude, longitude }),
      });
      if (res.ok) {
        toaster.create({ title: 'Perfil salvo!', type: 'success' });
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
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro no upload');
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
        toaster.create({ title: 'Foto adicionada!', type: 'success' });
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
        toaster.create({ title: 'Foto removida', type: 'success' });
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
    <Box minH="100vh" bg="slate.50">
      <CleanerNav />

      <input ref={fileInputRef} type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }} onChange={handleFileChange} />

      <Box p={6} maxW="800px" mx="auto">
        <VStack gap={6} align="stretch">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Heading size="lg" fontWeight="black" color="slate.900">Meu Perfil</Heading>
            <Text color="slate.500" fontSize="sm" mt={1}>
              Personalize seu perfil público e galeria de trabalhos
            </Text>
          </motion.div>

          {/* ── Avatar + About card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl"
              p={6} boxShadow="0 2px 12px rgba(0,0,0,0.04)">
              <HStack gap={2} mb={5}>
                <Icon as={LucideUser} w={5} h={5} color="brand.500" />
                <Heading size="sm" fontWeight="bold" color="slate.800">Sobre você</Heading>
              </HStack>

              {/* Avatar row */}
              <Flex gap={5} align="center" mb={6}
                pb={6} borderBottom="1px solid" borderColor="slate.100">
                <ImageUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  shape="circle"
                  size={88}
                  placeholder="Foto de perfil"
                />
                <Box flex={1}>
                  <Text fontWeight="bold" color="slate.800" fontSize="sm">Foto de perfil</Text>
                  <Text fontSize="xs" color="slate.400" mt={0.5}>
                    Clique no círculo para fazer upload
                  </Text>
                  <Text fontSize="xs" color="slate.300" mt={0.5}>
                    JPG, PNG ou WEBP · máx. 8 MB
                  </Text>
                </Box>
              </Flex>

              <VStack gap={5} align="stretch">
                {/* Bio */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" mb={2}
                    textTransform="uppercase" letterSpacing="wider">Biografia</Text>
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Conte sobre sua experiência, especialidades, diferencial…"
                    bg="slate.50" border="1px solid" borderColor="slate.200"
                    borderRadius="xl" rows={4} fontSize="sm"
                    _focus={{ borderColor: 'brand.300', bg: 'white' }}
                    resize="vertical" maxLength={500}
                  />
                  <Text fontSize="xs" color="slate.400" mt={1} textAlign="right">{bio.length}/500</Text>
                </Box>

                {/* Service types */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" mb={3}
                    textTransform="uppercase" letterSpacing="wider">Tipos de serviço</Text>
                  <SimpleGrid columns={{ base: 2, sm: 3 }} gap={2}>
                    {SERVICE_LIST.map(s => {
                      const sel = serviceTypes.includes(s);
                      return (
                        <Box key={s} as="button" w="full" p={2.5} borderRadius="xl" textAlign="center"
                          border="2px solid" borderColor={sel ? 'brand.400' : 'slate.200'}
                          bg={sel ? 'brand.50' : 'white'} cursor="pointer"
                          onClick={() => toggleService(s)} transition="all 0.15s">
                          <Text fontSize="xs" fontWeight={sel ? 'bold' : 'medium'}
                            color={sel ? 'brand.700' : 'slate.600'}>{s}</Text>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Box>

                <Button
                  bg="brand.500" color="white" borderRadius="xl" fontWeight="bold"
                  _hover={{ bg: 'brand.600', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  loading={saving} loadingText="Salvando..."
                  onClick={handleSave}
                  alignSelf="flex-end">
                  <Icon as={LucideSave} w={4} h={4} mr={2} />
                  Salvar perfil
                </Button>
              </VStack>
            </Box>
          </motion.div>

          {/* ── Location card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl"
              p={6} boxShadow="0 2px 12px rgba(0,0,0,0.04)">
              <HStack gap={2} mb={2}>
                <Icon as={LucideMapPin} w={5} h={5} color="brand.500" />
                <Heading size="sm" fontWeight="bold" color="slate.800">Localização</Heading>
                <Badge bg="slate.100" color="slate.500" borderRadius="full" px={2} fontSize="xs">
                  opcional
                </Badge>
              </HStack>
              <Text fontSize="xs" color="slate.400" mb={5}>
                Usada para mostrar distância ao cliente e melhorar o matching de leads.
              </Text>

              <VStack gap={4} align="stretch">
                {/* Detect button */}
                <Button
                  variant="outline" borderColor="slate.200" color="slate.600"
                  borderRadius="xl" fontWeight="semibold" fontSize="sm"
                  _hover={{ borderColor: 'brand.300', color: 'brand.600', bg: 'brand.50' }}
                  transition="all 0.15s"
                  loading={geoLoading} loadingText="Detectando…"
                  onClick={handleDetectLocation}>
                  <Icon as={LucideNavigation} w={4} h={4} mr={2} />
                  {latitude ? 'Atualizar minha localização' : 'Detectar minha localização'}
                </Button>

                {/* Location label */}
                {locationLabel && (
                  <HStack gap={2} bg="green.50" border="1px solid" borderColor="green.200"
                    borderRadius="xl" px={4} py={3}>
                    <Icon as={LucideMapPin} w={4} h={4} color="green.600" flexShrink={0} />
                    <Text fontSize="sm" color="green.800" fontWeight="semibold">{locationLabel}</Text>
                    <Button size="xs" variant="ghost" color="slate.400" ml="auto" px={1}
                      onClick={() => { setLatitude(null); setLongitude(null); setLocationLabel(''); }}>
                      <Icon as={LucideX} w={3} h={3} />
                    </Button>
                  </HStack>
                )}

                {/* Map preview */}
                {mapUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}>
                    <Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor="slate.200" h="220px">
                      <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 'none', display: 'block' }}
                        title="Localização no mapa"
                        loading="lazy"
                      />
                    </Box>
                    <Text fontSize="xs" color="slate.400" mt={1.5} textAlign="center">
                      {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
                    </Text>
                  </motion.div>
                )}

                {/* Save location button */}
                {latitude && longitude && (
                  <Button
                    bg="brand.500" color="white" borderRadius="xl" fontWeight="bold"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-1px)' }}
                    transition="all 0.2s"
                    loading={saving} loadingText="Salvando..."
                    onClick={handleSave}
                    alignSelf="flex-end">
                    <Icon as={LucideSave} w={4} h={4} mr={2} />
                    Salvar localização
                  </Button>
                )}
              </VStack>
            </Box>
          </motion.div>

          {/* ── Photo Gallery card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl"
              p={6} boxShadow="0 2px 12px rgba(0,0,0,0.04)">
              <Flex justify="space-between" align="center" mb={5}>
                <HStack gap={2}>
                  <Icon as={LucideCamera} w={5} h={5} color="brand.500" />
                  <Heading size="sm" fontWeight="bold" color="slate.800">Galeria de trabalhos</Heading>
                  <Badge bg="slate.100" color="slate.500" borderRadius="full" px={2} fontSize="xs">
                    {photos.length}/20
                  </Badge>
                </HStack>
                {photos.length < 20 && !showPhotoForm && (
                  <Button size="sm" bg="brand.500" color="white" borderRadius="xl" fontWeight="bold"
                    _hover={{ bg: 'brand.600' }}
                    loading={uploading} loadingText="Enviando…"
                    onClick={() => fileInputRef.current?.click()}>
                    <Icon as={LucidePlus} w={3.5} h={3.5} mr={1.5} />
                    Adicionar foto
                  </Button>
                )}
              </Flex>

              {/* Caption form after upload */}
              <AnimatePresence>
                {showPhotoForm && pendingUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}>
                    <Box bg="brand.50" border="1px solid" borderColor="brand.200" borderRadius="xl" p={4} mb={5}>
                      <Text fontSize="sm" fontWeight="bold" color="brand.700" mb={3}>
                        Foto enviada — adicione uma legenda (opcional)
                      </Text>
                      <Flex gap={3} align="flex-start">
                        <Box w="80px" h="80px" borderRadius="xl" overflow="hidden" flexShrink={0}
                          border="1px solid" borderColor="brand.200">
                          <img src={pendingUrl} alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <VStack gap={3} flex={1} align="stretch">
                          <Input
                            placeholder="Legenda (ex: Sala de estar pós-limpeza)"
                            value={photoCaption}
                            onChange={e => setPhotoCaption(e.target.value)}
                            bg="white" borderRadius="xl" h="10" border="1px solid"
                            borderColor="brand.200" fontSize="sm"
                            _focus={{ borderColor: 'brand.400' }}
                          />
                          <HStack gap={2} justify="flex-end">
                            <Button size="sm" variant="ghost" color="slate.500"
                              onClick={() => { setShowPhotoForm(false); setPendingUrl(''); setPhotoCaption(''); }}>
                              Cancelar
                            </Button>
                            <Button size="sm" bg="brand.500" color="white" borderRadius="xl" fontWeight="bold"
                              _hover={{ bg: 'brand.600' }}
                              loading={addingPhoto} loadingText="Salvando..."
                              onClick={handleAddPhoto}>
                              Salvar foto
                            </Button>
                          </HStack>
                        </VStack>
                      </Flex>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {photos.length === 0 ? (
                <Box textAlign="center" py={10} border="2px dashed" borderColor="slate.200" borderRadius="xl"
                  cursor="pointer" onClick={() => fileInputRef.current?.click()}
                  _hover={{ borderColor: 'brand.300', bg: 'brand.50' }} transition="all 0.15s">
                  <Text fontSize="3xl" mb={2}>📷</Text>
                  <Text color="slate.500" fontSize="sm" fontWeight="semibold">Nenhuma foto ainda</Text>
                  <Text color="slate.400" fontSize="xs" mt={1}>
                    Clique aqui para adicionar fotos dos seus trabalhos
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={3}>
                  {photos.map((photo, i) => (
                    <motion.div key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      layout>
                      <Box position="relative" borderRadius="xl" overflow="hidden"
                        border="2px solid" borderColor="slate.100"
                        paddingBottom="100%" bg="slate.100"
                        _hover={{ borderColor: 'red.200' }}
                        transition="border-color 0.15s">
                        <img
                          src={photo.url}
                          alt={photo.caption ?? `Foto ${i + 1}`}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Button
                          size="sm" bg="red.500" color="white" borderRadius="xl"
                          _hover={{ bg: 'red.600' }}
                          loading={deletingId === photo.id}
                          onClick={() => handleDeletePhoto(photo.id)}
                          position="absolute" bottom={2} right={2}
                          boxShadow="md" minW={0} px={2}>
                          <Icon as={LucideTrash2} w={3.5} h={3.5} />
                        </Button>
                      </Box>
                      {photo.caption && (
                        <Text fontSize="xs" color="slate.500" mt={1} lineClamp={1} px={0.5}>
                          {photo.caption}
                        </Text>
                      )}
                    </motion.div>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </motion.div>

        </VStack>
      </Box>
    </Box>
  );
}
