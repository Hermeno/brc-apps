export function logError(context: string, err: unknown): void {
  if (err instanceof Error) {
    const code = (err as any).code ? ` [${(err as any).code}]` : '';
    console.error(`${context}${code}: ${err.message}`);
  } else {
    console.error(`${context}:`, err);
  }
}
