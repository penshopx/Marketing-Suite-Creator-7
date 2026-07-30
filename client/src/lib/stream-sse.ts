/**
 * Streams a Server-Sent Events response from a POST endpoint.
 *
 * Handles chunked TCP delivery by buffering incomplete lines across reads,
 * so `data:` lines split across network chunks are never lost or mis-parsed.
 *
 * @param url           - Endpoint to POST to
 * @param body          - JSON-serialisable request body
 * @param onChunk       - Called for every successfully parsed SSE data payload
 * @param options.idleTimeoutMs   - Max ms of silence before aborting (default 45 000).
 *                                  Set to 0 to disable. (Task #5)
 * @param options.totalTimeoutMs  - Hard cap on total duration (default 300 000 = 5 min).
 *                                  Set to 0 to disable.
 */
export async function streamSSE(
  url: string,
  body: unknown,
  onChunk: (data: Record<string, unknown>) => void,
  {
    idleTimeoutMs = 45_000,
    totalTimeoutMs = 300_000,
  }: { idleTimeoutMs?: number; totalTimeoutMs?: number } = {},
): Promise<void> {
  const controller = new AbortController();

  // Hard total timeout
  const totalTimer =
    totalTimeoutMs > 0
      ? setTimeout(() => controller.abort(), totalTimeoutMs)
      : null;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  if (!response.ok) {
    if (totalTimer) clearTimeout(totalTimer);
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    if (totalTimer) clearTimeout(totalTimer);
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  // Idle timeout: reset on every incoming byte; fires if AI goes silent too long.
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  const resetIdle = () => {
    if (idleTimer) clearTimeout(idleTimer);
    if (idleTimeoutMs > 0) {
      idleTimer = setTimeout(() => controller.abort(), idleTimeoutMs);
    }
  };

  try {
    resetIdle();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      resetIdle(); // received bytes — reset the silence timer

      // Accumulate into buffer to handle lines split across TCP chunks
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last (possibly incomplete) line for the next iteration
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(line.slice(6)) as Record<string, unknown>;
            // Server signals a streaming error — surface it immediately (Task #22)
            if (parsed.error) {
              throw new Error(parsed.error as string);
            }
            onChunk(parsed);
          } catch (e) {
            // Re-throw real errors; skip only JSON parse failures
            if (
              e instanceof SyntaxError &&
              (e as SyntaxError).message.startsWith("Unexpected")
            ) {
              continue;
            }
            throw e;
          }
        }
      }
    }
  } catch (err) {
    // Distinguish abort (timeout) from other errors
    if ((err as Error).name === "AbortError") {
      throw new Error("Koneksi AI terlalu lama — coba lagi.");
    }
    throw err;
  } finally {
    if (idleTimer) clearTimeout(idleTimer);
    if (totalTimer) clearTimeout(totalTimer);
    reader.releaseLock();
  }
}
