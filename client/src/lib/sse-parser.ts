/**
 * createSSEParser
 *
 * Returns a stateful parser that processes one Uint8Array chunk at a time and
 * yields every successfully-parsed JSON payload found in `data:` lines.
 *
 * This is the exact algorithm used in all five AI-streaming pages
 * (ai-articles, ai-chat, ai-expert, guide-chatbot, story-telling).
 * Centralising the logic here means:
 *  - The unit tests exercise the same code that runs in production.
 *  - A future refactor only needs to touch one place.
 *
 * Usage inside a streaming fetch loop:
 *
 *   const parser = createSSEParser();
 *   while (true) {
 *     const { done, value } = await reader.read();
 *     if (done) break;
 *     for (const event of parser.processChunk(value)) {
 *       if (event.content) { ... }
 *     }
 *   }
 */
export function createSSEParser() {
  const decoder = new TextDecoder();
  let buffer = "";

  return {
    /**
     * Feed the next raw chunk from the reader.  Returns all fully-received
     * `data:` events (as parsed objects) found in this chunk, accounting for
     * lines that were split across the previous chunk boundary.
     */
    processChunk(value: Uint8Array): Record<string, unknown>[] {
      // { stream: true } keeps the decoder's internal UTF-8 state between
      // calls so multi-byte characters split across chunks decode correctly.
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last (possibly incomplete) line in the buffer.
      buffer = lines.pop() ?? "";

      const results: Record<string, unknown>[] = [];
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            results.push(JSON.parse(line.slice(6)));
          } catch {
            // Silently skip malformed lines – matches original page behaviour.
          }
        }
      }
      return results;
    },

    /**
     * Call after the reader signals `done` to flush any trailing line that
     * arrived without a final newline.
     */
    flush(): Record<string, unknown>[] {
      if (buffer.startsWith("data: ")) {
        try {
          return [JSON.parse(buffer.slice(6))];
        } catch {
          // ignore
        }
      }
      return [];
    },
  };
}

/**
 * parseSSEChunks
 *
 * Convenience wrapper: processes all chunks at once and returns every parsed
 * event.  Useful for tests that supply pre-built chunk arrays.
 */
export function parseSSEChunks(chunks: Uint8Array[]): Record<string, unknown>[] {
  const parser = createSSEParser();
  const results: Record<string, unknown>[] = [];
  for (const chunk of chunks) {
    results.push(...parser.processChunk(chunk));
  }
  results.push(...parser.flush());
  return results;
}

/**
 * Convenience helper: accumulate `content` fields from an SSE stream into a
 * single string, exactly as the page components do.
 */
export function accumulateSSEContent(chunks: Uint8Array[]): string {
  return parseSSEChunks(chunks)
    .map((d) => (typeof d.content === "string" ? d.content : ""))
    .join("");
}
