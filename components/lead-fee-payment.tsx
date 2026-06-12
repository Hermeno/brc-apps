'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Box, Button, Text, VStack, HStack, Flex, Icon } from '@chakra-ui/react';
import { LucideLoader, LucideCheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/* ── Inner form — rendered inside <Elements> ─────────────────────────────── */
function PayForm({ convId, leadFee, onSuccess }: { convId: string; leadFee: number; onSuccess: () => void }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying,  setPaying]  = useState(false);
  const [errMsg,  setErrMsg]  = useState('');
  const [ready,   setReady]   = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements || paying) return;
    setPaying(true);
    setErrMsg('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrMsg(error.message ?? 'Payment failed. Please try again.');
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // Confirm server-side — saves card as default for future auto-charges
      await fetch(`/api/conversations/${convId}/payment/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      }).catch(() => {});
      onSuccess();
    } else {
      setErrMsg('Payment incomplete. Please try again.');
      setPaying(false);
    }
  };

  return (
    <VStack gap={4} align="stretch">
      <Box
        border="1px solid #E3E8EE"
        borderRadius="8px"
        p={4}
        bg="white"
        opacity={ready ? 1 : 0}
        transition="opacity 0.3s"
      >
        <PaymentElement onReady={() => setReady(true)} />
      </Box>

      {!ready && (
        <Flex justify="center" py={4}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Icon as={LucideLoader} w={5} h={5} color="brand.400" />
          </motion.div>
        </Flex>
      )}

      {errMsg && (
        <Text fontSize="sm" color="red.500" textAlign="center">{errMsg}</Text>
      )}

      <Button
        w="full" bg="#0A80DB" color="white" h="48px" borderRadius="6px"
        fontWeight="700" fontSize="14px"
        _hover={{ bg: '#0870C2' }} _active={{ bg: '#0760A8' }}
        loading={paying} loadingText="Processing…"
        disabled={!ready || paying}
        onClick={handlePay}
      >
        Pay ${leadFee} · Unlock chat
      </Button>

      <Text fontSize="11px" color="#CBD5E1" textAlign="center">
        Secure · Powered by Stripe · USD
      </Text>
    </VStack>
  );
}

/* ── Outer component — fetches client secret, mounts Elements ─────────────── */
export function LeadFeePayment({
  convId,
  leadFee,
  onSuccess,
}: {
  convId: string;
  leadFee: number;
  onSuccess: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [initError,    setInitError]    = useState('');

  useEffect(() => {
    fetch(`/api/conversations/${convId}/payment/intent`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.alreadyPaid) { onSuccess(); return; }
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setInitError(data.error ?? 'Could not initialise payment.');
      })
      .catch(() => setInitError('Network error. Please refresh.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId]);

  if (loading) {
    return (
      <Flex justify="center" py={8}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Icon as={LucideLoader} w={6} h={6} color="brand.400" />
        </motion.div>
      </Flex>
    );
  }

  if (initError) {
    return <Text color="red.500" fontSize="sm" textAlign="center">{initError}</Text>;
  }

  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <PayForm convId={convId} leadFee={leadFee} onSuccess={onSuccess} />
    </Elements>
  );
}
