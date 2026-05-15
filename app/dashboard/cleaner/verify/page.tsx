'use client';

import {
  Box, VStack, HStack, Text, Heading, Button, Input, Container,
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
  label, hint, value, onChange,
}: {
  label: string; hint: string; value: string; onChange: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Erro no upload');
      const { url } = await res.json();
      onChange(url);
    } catch {
      toaster.create({ title: 'Erro ao enviar foto', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      border="2px dashed"
      borderColor={value ? 'green.400' : 'slate.200'}
      borderRadius="xl"
      p={4}
      bg={value ? 'green.50' : 'slate.50'}
      cursor="pointer"
      onClick={() => ref.current?.click()}
      transition="all 0.2s"
      _hover={{ borderColor: 'brand.300', bg: 'brand.50' }}
    >
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <VStack gap={2}>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8 }} />
            <HStack gap={1}>
              <Icon as={LucideCheckCircle} w={4} h={4} color="green.500" />
              <Text fontSize="xs" color="green.600" fontWeight="bold">Enviado</Text>
            </HStack>
          </>
        ) : (
          <>
            <Icon as={LucideUpload} w={6} h={6} color={uploading ? 'brand.400' : 'slate.400'} />
            <Text fontSize="sm" fontWeight="bold" color="slate.600">{uploading ? 'Enviando…' : label}</Text>
            <Text fontSize="xs" color="slate.400" textAlign="center">{hint}</Text>
          </>
        )}
      </VStack>
    </Box>
  );
}

export default function CleanerVerifyPage() {
  const router = useRouter();
  const [existing, setExisting] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [fullName, setFullName]     = useState('');
  const [idNumber, setIdNumber]     = useState('');
  const [address, setAddress]       = useState('');
  const [frontDocUrl, setFrontDoc]  = useState('');
  const [backDocUrl, setBackDoc]    = useState('');
  const [selfieUrl, setSelfie]      = useState('');

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
      toaster.create({ title: 'Preencha todos os campos de texto', type: 'error' }); return;
    }
    if (!frontDocUrl || !backDocUrl || !selfieUrl) {
      toaster.create({ title: 'Envie todas as fotos', type: 'error' }); return;
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
        throw new Error(d.error || 'Erro ao enviar');
      }
      toaster.create({ title: 'Solicitação enviada!', description: 'Analisaremos em até 48h.', type: 'success' });
      router.push('/dashboard/cleaner');
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Text color="slate.400">Carregando…</Text>
    </Box>
  );

  const statusBanner = existing?.status === 'APPROVED' ? (
    <Box bg="green.50" border="1px solid" borderColor="green.200" borderRadius="2xl" p={6}>
      <HStack gap={3}>
        <Icon as={LucideCheckCircle} w={7} h={7} color="green.500" />
        <Box>
          <Text fontWeight="black" color="green.700" fontSize="lg">Conta verificada!</Text>
          <Text color="green.600" fontSize="sm">Seu perfil está ativo e verificado na plataforma.</Text>
        </Box>
      </HStack>
    </Box>
  ) : existing?.status === 'PENDING' ? (
    <Box bg="yellow.50" border="1px solid" borderColor="yellow.200" borderRadius="2xl" p={6}>
      <HStack gap={3}>
        <Icon as={LucideClock} w={7} h={7} color="yellow.500" />
        <Box>
          <Text fontWeight="black" color="yellow.700" fontSize="lg">Em análise</Text>
          <Text color="yellow.600" fontSize="sm">Recebemos seus documentos. Responderemos em até 48h.</Text>
        </Box>
      </HStack>
    </Box>
  ) : existing?.status === 'REJECTED' ? (
    <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="2xl" p={6}>
      <HStack gap={3}>
        <Icon as={LucideXCircle} w={7} h={7} color="red.500" />
        <Box>
          <Text fontWeight="black" color="red.700" fontSize="lg">Verificação recusada</Text>
          {existing.adminNote && <Text color="red.600" fontSize="sm">Motivo: {existing.adminNote}</Text>}
          <Text color="red.500" fontSize="xs" mt={1}>Corrija as informações abaixo e reenvie.</Text>
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
            <Button variant="ghost" size="sm" onClick={() => router.back()} borderRadius="xl">
              <Icon as={LucideArrowLeft} w={4} h={4} mr={1} /> Voltar
            </Button>
            <Text fontWeight="black" fontSize="md" color="slate.900">Verificação de identidade</Text>
          </Flex>
        </Container>
      </Box>

      <Container maxW="2xl" py={10}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <VStack gap={6} align="stretch">

            <VStack gap={2} textAlign="center">
              <Heading size="xl" fontWeight="black" color="slate.900">Verificar minha conta</Heading>
              <Text color="slate.500" fontSize="sm">
                Profissionais verificados recebem mais leads e aparecem com destaque.
              </Text>
            </VStack>

            {statusBanner}

            {/* Steps indicator */}
            {canEdit && (
              <HStack gap={0} justify="center">
                {[1, 2].map(s => (
                  <Flex key={s} align="center">
                    <Box
                      w="32px" h="32px" borderRadius="full"
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

            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="slate.200" p={8}>
              {step === 1 && (
                <VStack gap={5} align="stretch">
                  <Text fontWeight="black" color="slate.900" fontSize="lg">Informações pessoais</Text>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>Nome completo</Text>
                    <HStack>
                      <Icon as={LucideUser} w={4} h={4} color="slate.400" />
                      <Input value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder="Seu nome completo como no documento"
                        bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="xl"
                        _focus={{ bg: 'white', borderColor: 'brand.300' }}
                        disabled={!canEdit} />
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>Número do documento (SSN / ITIN / Passaporte)</Text>
                    <HStack>
                      <Icon as={LucideIdCard} w={4} h={4} color="slate.400" />
                      <Input value={idNumber} onChange={e => setIdNumber(e.target.value)}
                        placeholder="Ex: XXX-XX-XXXX"
                        bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="xl"
                        _focus={{ bg: 'white', borderColor: 'brand.300' }}
                        disabled={!canEdit} />
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>Endereço completo</Text>
                    <HStack>
                      <Icon as={LucideMapPin} w={4} h={4} color="slate.400" />
                      <Input value={address} onChange={e => setAddress(e.target.value)}
                        placeholder="Rua, número, cidade, estado, ZIP"
                        bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="xl"
                        _focus={{ bg: 'white', borderColor: 'brand.300' }}
                        disabled={!canEdit} />
                    </HStack>
                  </Box>

                  {canEdit && (
                    <Button onClick={() => {
                      if (!fullName.trim() || !idNumber.trim() || !address.trim()) {
                        toaster.create({ title: 'Preencha todos os campos', type: 'error' }); return;
                      }
                      setStep(2);
                    }}
                      bg="brand.500" color="white" h="11" borderRadius="xl" fontWeight="bold"
                      _hover={{ bg: 'brand.600' }}>
                      Próximo → Fotos dos documentos
                    </Button>
                  )}
                </VStack>
              )}

              {step === 2 && (
                <VStack gap={5} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="black" color="slate.900" fontSize="lg">Fotos dos documentos</Text>
                    <Badge bg="yellow.100" color="yellow.700" borderRadius="full" px={3}>
                      <Icon as={LucideCamera} w={3} h={3} mr={1} />Todos obrigatórios
                    </Badge>
                  </HStack>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>Documento — frente</Text>
                    <UploadBox
                      label="Clique para enviar"
                      hint="Frente do seu documento de identidade"
                      value={frontDocUrl}
                      onChange={setFrontDoc}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>Documento — verso</Text>
                    <UploadBox
                      label="Clique para enviar"
                      hint="Verso do seu documento de identidade"
                      value={backDocUrl}
                      onChange={setBackDoc}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>Selfie segurando o documento</Text>
                    <UploadBox
                      label="Clique para enviar"
                      hint="Foto do seu rosto segurando o documento aberto"
                      value={selfieUrl}
                      onChange={setSelfie}
                    />
                  </Box>

                  <HStack gap={3}>
                    <Button onClick={() => setStep(1)} variant="outline" h="11" borderRadius="xl"
                      flex={1} fontWeight="bold">← Voltar</Button>
                    {canEdit && (
                      <Button onClick={handleSubmit}
                        bg="brand.500" color="white" h="11" borderRadius="xl" fontWeight="bold"
                        loading={submitting} loadingText="Enviando…"
                        flex={2}
                        _hover={{ bg: 'brand.600' }}>
                        Enviar para análise
                      </Button>
                    )}
                  </HStack>
                </VStack>
              )}
            </Box>

            <Box bg="slate.100" borderRadius="xl" p={4}>
              <Text fontSize="xs" color="slate.500" textAlign="center">
                Seus dados são tratados com segurança e usados apenas para verificação de identidade.
                Nunca compartilhamos suas informações com terceiros.
              </Text>
            </Box>
          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
}
