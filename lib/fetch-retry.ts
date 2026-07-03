type FetchOptions = RequestInit & { retries?: number; retryDelayMs?: number };

export async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { retries = 3, retryDelayMs = 800, ...fetchOpts } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, fetchOpts);
      // Retry on 5xx server errors and 429 rate limit, not on 4xx client errors
      if (res.status >= 500 || res.status === 429) {
        if (attempt < retries) {
          await delay(retryDelayMs * Math.pow(2, attempt)); // exponential back-off
          continue;
        }
      }
      return res;
    } catch (err) {
      // Network failure (offline, DNS, etc.)
      if (attempt < retries) {
        await delay(retryDelayMs * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }
  // Unreachable, but satisfies TS
  throw new Error('fetch failed after retries');
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
