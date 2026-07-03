import { prisma } from '@/lib/prisma';

type Level = 'error' | 'warn' | 'info';

async function persist(level: Level, context: string, message: string, meta?: object, userId?: string) {
  try {
    await prisma.appLog.create({
      data: { level, context, message, meta: meta ? JSON.stringify(meta) : undefined, userId },
    });
  } catch { /* never let logging crash the app */ }
}

export function logError(context: string, err: unknown, userId?: string): void {
  const message = err instanceof Error ? err.message : String(err);
  const code    = (err as any)?.code;
  console.error(`${context}${code ? ` [${code}]` : ''}: ${message}`);
  persist('error', context, message, code ? { code } : undefined, userId);
}

export function logWarn(context: string, message: string, meta?: object, userId?: string): void {
  console.warn(`${context}: ${message}`);
  persist('warn', context, message, meta, userId);
}

export function logInfo(context: string, message: string, meta?: object, userId?: string): void {
  console.info(`${context}: ${message}`);
  persist('info', context, message, meta, userId);
}
