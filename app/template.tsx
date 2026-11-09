'use client';

import { motion, useReducedMotion } from 'motion/react';

/* A 200 ms fade between pages, as the brief asks. Nothing longer: a page
   transition that makes the reader wait is worse than no transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  // Same element on server and client (the server cannot know the preference); only the duration changes.
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.2, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
