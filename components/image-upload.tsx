'use client';

import { useRef, useState } from 'react';
import { Box, Text, Flex, Icon } from '@chakra-ui/react';
import { LucideCamera, LucideX, LucideUpload } from 'lucide-react';

interface ImageUploadProps {
  value: string;          // current URL (empty = none)
  onChange: (url: string) => void;
  shape?: 'circle' | 'square';
  size?: number;          // px
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  shape = 'square',
  size = 80,
  placeholder = 'Foto',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const borderRadius = shape === 'circle' ? '50%' : '16px';

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro no upload');
      onChange(data.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      <Box
        position="relative"
        w={`${size}px`}
        h={`${size}px`}
        borderRadius={borderRadius}
        overflow="hidden"
        border="2px dashed"
        borderColor={value ? 'brand.200' : 'slate.300'}
        bg={value ? 'white' : 'slate.50'}
        cursor={uploading ? 'wait' : 'pointer'}
        onClick={() => !uploading && inputRef.current?.click()}
        _hover={{ borderColor: 'brand.400', bg: 'brand.50' }}
        transition="all 0.15s"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={placeholder}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Overlay on hover */}
            <Box
              position="absolute" inset={0}
              bg="rgba(0,0,0,0.45)"
              display="flex" alignItems="center" justifyContent="center"
              opacity={0} _groupHover={{ opacity: 1 }}
              transition="opacity 0.15s"
              className="group"
            >
              <Icon as={LucideCamera} color="white" w={5} h={5} />
            </Box>
            {/* Overlay always visible as thin strip at bottom */}
            <Box
              position="absolute" bottom={0} left={0} right={0}
              bg="rgba(0,0,0,0.5)"
              display="flex" alignItems="center" justifyContent="center"
              py="3px"
            >
              <Icon as={LucideCamera} color="white" w={3} h={3} />
            </Box>
          </>
        ) : uploading ? (
          <Box textAlign="center" px={2}>
            <Text fontSize="10px" color="brand.500" fontWeight="bold">Enviando…</Text>
          </Box>
        ) : (
          <Flex direction="column" align="center" gap={1} px={2}>
            <Icon as={LucideUpload} w={5} h={5} color="slate.400" />
            <Text fontSize="9px" color="slate.400" fontWeight="semibold" textAlign="center" lineClamp={2}>{placeholder}</Text>
          </Flex>
        )}
      </Box>
      {error && (
        <Text fontSize="10px" color="red.500" mt={1}>{error}</Text>
      )}
    </Box>
  );
}

/* ── Multi-photo picker (up to N slots) ── */
interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function MultiImageUpload({ values, onChange, max = 4 }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files: FileList) => {
    setError('');
    const remaining = max - values.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (!toUpload.length) return;

    setUploading(true);
    try {
      const urls = await Promise.all(
        toUpload.map(async (file) => {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? 'Erro no upload');
          return data.url as string;
        })
      );
      onChange([...values, ...urls]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
      />
      <Flex gap={2} flexWrap="wrap">
        {values.map((url, i) => (
          <Box key={i} position="relative" w="72px" h="72px" borderRadius="xl" overflow="hidden"
            border="1px solid" borderColor="slate.200" flexShrink={0}>
            <img src={url} alt={`foto ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box
              position="absolute" top="3px" right="3px"
              w="18px" h="18px" borderRadius="full"
              bg="rgba(0,0,0,0.6)"
              display="flex" alignItems="center" justifyContent="center"
              cursor="pointer"
              onClick={() => remove(i)}
              _hover={{ bg: 'red.500' }}
              transition="background 0.15s"
            >
              <Icon as={LucideX} w={2.5} h={2.5} color="white" />
            </Box>
          </Box>
        ))}

        {values.length < max && (
          <Box
            w="72px" h="72px" borderRadius="xl"
            border="2px dashed" borderColor={uploading ? 'brand.300' : 'slate.300'}
            bg="slate.50"
            display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={1}
            cursor={uploading ? 'wait' : 'pointer'}
            onClick={() => !uploading && inputRef.current?.click()}
            _hover={{ borderColor: 'brand.400', bg: 'brand.50' }}
            transition="all 0.15s"
            flexShrink={0}
          >
            {uploading ? (
              <Text fontSize="9px" color="brand.500" fontWeight="bold">Enviando…</Text>
            ) : (
              <>
                <Icon as={LucideCamera} w={5} h={5} color="slate.400" />
                <Text fontSize="9px" color="slate.400" fontWeight="semibold">{values.length}/{max}</Text>
              </>
            )}
          </Box>
        )}
      </Flex>
      {error && <Text fontSize="xs" color="red.500" mt={1}>{error}</Text>}
    </Box>
  );
}
