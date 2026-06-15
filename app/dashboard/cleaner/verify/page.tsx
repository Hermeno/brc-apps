'use client';

import {
  Box, VStack, HStack, Text, Button, Input, Container,
  Icon, Flex, Badge,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import { motion } from 'motion/react';
import {
  LucideUpload, LucideCheckCircle, LucideXCircle, LucideClock,
  LucideUser, LucideIdCard, LucideMapPin, LucideCamera, LucideArrowLeft,
} from 'lucide-react';
import { useT } from '@/lib/i18n';

type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

interface VerificationData {
  status: VerificationStatus;
  adminNote?: string;
  fullName: string;
  idNumber: string;
  address: string;
  frontDocUrl: string;
  backDocUrl: string;
  selfieUrl: string;
}

function UploadBox({
  label, hint, value, onChange, uploadedLabel,
}: {
  label: string; hint: string; value: string; onChange: (url: string) => void; uploadedLabel: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'verification');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload error');
      const { url } = await res.json();
      onChange(url);
    } catch {
      toaster.create({ title: label, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      border="2px dashed" borderColor={value ? '#0A80DB' : 'slate.200'}
      borderRadius="4px" p={4} bg={value ? '#F8FAFC' : 'slate.50'}
      cursor="pointer" onClick={() => ref.current?.click()}
      transition="all 0.2s" _hover={{ borderColor: 'brand.300', bg: 'brand.50' }}
    >
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <VStack gap={2}>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 4 }} />
            <HStack gap={1}>
              <Icon as={LucideCheckCircle} w={4} h={4} color="#0A80DB" />
              <Text fontSize="xs" color="#0A80DB" fontWeight="bold">{uploadedLabel}</Text>
            </HStack>
          </>
        ) : (
          <>
            <Icon as={LucideUpload} w={6} h={6} color={uploading ? 'brand.400' : 'slate.400'} />
            <Text fontSize="sm" fontWeight="bold" color="slate.600">{uploading ? '…' : label}</Text>
            <Text fontSize="xs" color="slate.400" textAlign="center">{hint}</Text>
          </>
        )}
      </VStack>
    </Box>
  );
}

export default function CleanerVerifyPage() {
  const router = useRouter();
  const t = useT();
  const [existing, setExisting] = useState<VerificationData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep]         = useState(1);

  const [fullName,    setFullName]    = useState('');
  const [idNumber,    setIdNumber]    = useState('');
  const [address,     setAddress]     = useState('');
  const [frontDocUrl, setFrontDoc]    = useState('');
  const [backDocUrl,  setBackDoc]     = useState('');
  const [selfieUrl,   setSelfie]      = useState('');

  useEffect(() => {
    fetch('/api/cleaner/verification')
      .then(r => r.json())
      .then(d => {
        if (d.verification) {
          setExisting(d.verification);
          setFullName(d.verification.fullName);
          setIdNumber(d.verification.idNumber);
          setAddress(d.verification.address);
          setFrontDoc(d.verification.frontDocUrl);
          setBackDoc(d.verification.backDocUrl);
          setSelfie(d.verification.selfieUrl);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!fullName.trim() || !idNumber.trim() || !address.trim()) {
      toaster.create({ title: t('cleaner.verify.fillAll'), type: 'error' }); return;
    }
    if (!frontDocUrl || !backDocUrl || !selfieUrl) {
      toaster.create({ title: t('cleaner.verify.uploadAll'), type: 'error' }); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/cleaner/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, idNumber, address, frontDocUrl, backDocUrl, selfieUrl }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Submission failed');
      }
      toaster.create({ title: t('cleaner.verify.statusPending_title'), description: t('cleaner.verify.statusPending_desc'), type: 'success' });
      router.push('/dashboard/cleaner');
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Text color="slate.400">{t('common.loading')}</Text>
    </Box>
  );

  const statusBanner = existing?.status === 'APPROVED' ? (
    <Box bg="#ECFDF5" border="1px solid" borderColor="#A7F3D0" borderRadius="4px" p={6}>
      <HStack gap={3}>
        <Icon as={LucideCheckCircle} w={7} h={7} color="#059669" />
        <Box>
          <Text fontWeight="black" color="#047857" fontSize="lg">{t('cleaner.verify.statusApproved_title')}</Text>
          <Text color="#059669" fontSize="sm">{t('cleaner.verify.statusApproved_desc')}</Text>
        </Box>
      </HStack>
    </Box>
  ) : existing?.status === 'PENDING' ? (
    <Box bg="#F6F9FC" border="1px solid" borderColor="#E3E8EE" borderRadius="4px" p={6}>
      <HStack gap={3}>
        <Icon as={LucideClock} w={7} h={7} color="#0A80DB" />
        <Box>
          <Text fontWeight="black" color="#0A80DB" fontSize="lg">{t('cleaner.verify.statusPending_title')}</Text>
          <Text color="#0A80DB" fontSize="sm">{t('cleaner.verify.statusPending_desc')}</Text>
        </Box>
      </HStack>
    </Box>
  ) : existing?.status === 'REJECTED' ? (
    <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="4px" p={6}>
      <HStack gap={3}>
        <Icon as={LucideXCircle} w={7} h={7} color="red.500" />
        <Box>
          <Text fontWeight="black" color="red.700" fontSize="lg">{t('cleaner.verify.statusRejected_title')}</Text>
          {existing.adminNote && (
            <Text color="red.600" fontSize="sm">{t('cleaner.verify.statusRejected_reason')} {existing.adminNote}</Text>
          )}
          <Text color="red.500" fontSize="xs" mt={1}>{t('cleaner.verify.statusRejected_hint')}</Text>
        </Box>
      </HStack>
    </Box>
  ) : null;

  const canEdit = !existing || existing.status === 'REJECTED';

  return (
    <Box minH="100vh" bg="slate.50">
      <Box bg="white" borderBottom="1px solid" borderColor="slate.100" position="sticky" top={0} zIndex={50}>
        <Container maxW="2xl" py={4}>
          <Flex align="center" gap={3}>
            <Button variant="ghost" size="sm" onClick={() => router.back()} borderRadius="4px">
              <Icon as={LucideArrowLeft} w={4} h={4} mr={1} /> {t('common.back')}
            </Button>
            <Text fontWeight="black" fontSize="md" color="slate.900">{t('cleaner.verify.title')}</Text>
          </Flex>
        </Container>
      </Box>

      <Container maxW="2xl" py={10}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <VStack gap={6} align="stretch">

            <VStack gap={2} textAlign="center">
              <Text fontSize="2xl" fontWeight="black" color="slate.900">{t('cleaner.verify.title')}</Text>
              <Text color="slate.500" fontSize="sm">{t('cleaner.verify.subtitle')}</Text>
            </VStack>

            {statusBanner}

            {canEdit && (
              <HStack gap={0} justify="center">
                {[1, 2].map(s => (
                  <Flex key={s} align="center">
                    <Box
                      w="32px" h="32px" borderRadius="4px"
                      bg={step >= s ? 'brand.500' : 'slate.200'}
                      display="flex" alignItems="center" justifyContent="center"
                      cursor="pointer" onClick={() => s < step && setStep(s)}
                    >
                      <Text color={step >= s ? 'white' : 'slate.500'} fontSize="sm" fontWeight="bold">{s}</Text>
                    </Box>
                    {s < 2 && <Box w="60px" h="2px" bg={step > s ? 'brand.500' : 'slate.200'} />}
                  </Flex>
                ))}
              </HStack>
            )}

            <Box bg="white" borderRadius="4px" border="1px solid" borderColor="slate.200" p={8}>
              {step === 1 && (
                <VStack gap={5} align="stretch">
                  <Text fontWeight="black" color="slate.900" fontSize="lg">{t('cleaner.verify.step1Title')}</Text>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>{t('cleaner.verify.fullName')}</Text>
                    <HStack>
                      <Icon as={LucideUser} w={4} h={4} color="slate.400" />
                      <Input value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder={t('cleaner.verify.fullNamePlaceholder')}
                        bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="4px"
                        _focus={{ bg: 'white', borderColor: 'brand.300' }}
                        disabled={!canEdit} />
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>{t('cleaner.verify.idNumber')}</Text>
                    <HStack>
                      <Icon as={LucideIdCard} w={4} h={4} color="slate.400" />
                      <Input value={idNumber} onChange={e => setIdNumber(e.target.value)}
                        placeholder={t('cleaner.verify.idPlaceholder')}
                        bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="4px"
                        _focus={{ bg: 'white', borderColor: 'brand.300' }}
                        disabled={!canEdit} />
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>{t('cleaner.verify.address')}</Text>
                    <HStack>
                      <Icon as={LucideMapPin} w={4} h={4} color="slate.400" />
                      <Input value={address} onChange={e => setAddress(e.target.value)}
                        placeholder={t('cleaner.verify.addressPlaceholder')}
                        bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="4px"
                        _focus={{ bg: 'white', borderColor: 'brand.300' }}
                        disabled={!canEdit} />
                    </HStack>
                  </Box>

                  {canEdit && (
                    <Button onClick={() => {
                      if (!fullName.trim() || !idNumber.trim() || !address.trim()) {
                        toaster.create({ title: t('cleaner.verify.fillAll'), type: 'error' }); return;
                      }
                      setStep(2);
                    }}
                      bg="brand.500" color="white" h="11" borderRadius="4px" fontWeight="bold"
                      _hover={{ bg: 'brand.600' }}>
                      {t('cleaner.verify.continueBtn')}
                    </Button>
                  )}
                </VStack>
              )}

              {step === 2 && (
                <VStack gap={5} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="black" color="slate.900" fontSize="lg">{t('cleaner.verify.step2Title')}</Text>
                    <Badge bg="#F6F9FC" color="#0A80DB" borderRadius="4px" px={3}>
                      <Icon as={LucideCamera} w={3} h={3} mr={1} />All required
                    </Badge>
                  </HStack>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>{t('cleaner.verify.frontLabel')}</Text>
                    <UploadBox
                      label={t('cleaner.verify.frontLabel')}
                      hint={t('cleaner.verify.frontHint')}
                      value={frontDocUrl}
                      onChange={setFrontDoc}
                      uploadedLabel={t('cleaner.verify.uploaded')}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>{t('cleaner.verify.backLabel')}</Text>
                    <UploadBox
                      label={t('cleaner.verify.backLabel')}
                      hint={t('cleaner.verify.backHint')}
                      value={backDocUrl}
                      onChange={setBackDoc}
                      uploadedLabel={t('cleaner.verify.uploaded')}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>{t('cleaner.verify.selfieLabel')}</Text>
                    <UploadBox
                      label={t('cleaner.verify.selfieLabel')}
                      hint={t('cleaner.verify.selfieHint')}
                      value={selfieUrl}
                      onChange={setSelfie}
                      uploadedLabel={t('cleaner.verify.uploaded')}
                    />
                  </Box>

                  <HStack gap={3}>
                    <Button onClick={() => setStep(1)} variant="outline" h="11" borderRadius="4px"
                      flex={1} fontWeight="bold">{t('cleaner.verify.backBtn')}</Button>
                    {canEdit && (
                      <Button onClick={handleSubmit}
                        bg="brand.500" color="white" h="11" borderRadius="4px" fontWeight="bold"
                        loading={submitting} loadingText={t('cleaner.verify.submitting')}
                        flex={2} _hover={{ bg: 'brand.600' }}>
                        {t('cleaner.verify.submitBtn')}
                      </Button>
                    )}
                  </HStack>
                </VStack>
              )}
            </Box>

            <Box bg="slate.100" borderRadius="4px" p={4}>
              <Text fontSize="xs" color="slate.500" textAlign="center">
                {t('cleaner.verify.privacy')}
              </Text>
            </Box>
          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
}
