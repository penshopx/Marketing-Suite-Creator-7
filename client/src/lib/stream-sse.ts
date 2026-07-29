/**
 * Streams a Server-Sent Events response from a POST endpoint.
 *
 * Handles chunked TCP delivery by buffering incomplete lines across reads,
 * so `data:` lines split across network chunks are never lost or mis-parsed.
 *
 * @param url     - Endpoint to POST to
 * @param body    - JSON-serialisable request body
 * @param onChunk - Called for every successfully parsed SSE data payload
 */
export async function streamSSE(
  url: string,
  body: unknown,
  onChunk: (data: Record<string, unknown>) => void,
): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Accumulate into buffer to handle lines split across TCP chunks
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last (possibly incomplete) line for the next iteration
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            onChunk(JSON.parse(line.slice(6)));
          } catch {
            // Skip malformed JSON frames
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
