import { describe, it, expect } from "vitest";
import { createSSEParser, parseSSEChunks, accumulateSSEContent } from "../sse-parser";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Encode a string to Uint8Array (UTF-8), mirroring what the Fetch API returns. */
function enc(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/**
 * Split a string at arbitrary byte positions and return each piece as its own
 * Uint8Array chunk.  This simulates how a real network stream can deliver data
 * in fragments that have nothing to do with line or JSON boundaries.
 */
function splitAt(s: string, ...positions: number[]): Uint8Array[] {
  const full = enc(s);
  const chunks: Uint8Array[] = [];
  let prev = 0;
  for (const pos of [...positions, full.length]) {
    chunks.push(full.slice(prev, pos));
    prev = pos;
  }
  return chunks.filter((c) => c.length > 0);
}

// ---------------------------------------------------------------------------
// Fixtures: well-formed SSE payloads
// ---------------------------------------------------------------------------

const singleEvent = 'data: {"content":"hello"}\n\n';
const twoEvents =
  'data: {"content":"foo"}\n\ndata: {"content":"bar"}\n\n';
const titleAndContent =
  'data: {"title":"My Article"}\ndata: {"content":"First sentence."}\n\n';
const multiWordEvent =
  'data: {"content":"The quick brown fox"}\n\n';
const nonDataLine =
  ': keep-alive\nevent: message\ndata: {"content":"ok"}\n\n';

// ---------------------------------------------------------------------------
// 0. createSSEParser – the function used directly by all five page components
// ---------------------------------------------------------------------------

describe("createSSEParser – stateful streaming parser (used by all page components)", () => {
  it("processes a single chunk and returns parsed events", () => {
    const parser = createSSEParser();
    const events = parser.processChunk(enc('data: {"content":"hello"}\n\n'));
    expect(events).toEqual([{ content: "hello" }]);
  });

  it("buffers a line split across two processChunk calls and emits it only when complete", () => {
    const parser = createSSEParser();
    // First chunk ends mid-JSON – no complete line yet
    const first = parser.processChunk(enc('data: {"content":"hel'));
    expect(first).toHaveLength(0); // incomplete – must not emit anything

    // Second chunk completes the line
    const second = parser.processChunk(enc('lo"}\n\n'));
    expect(second).toEqual([{ content: "hello" }]);
  });

  it("processes multiple events across several processChunk calls and accumulates content correctly", () => {
    const parser = createSSEParser();
    const words = ["The ", "quick ", "brown ", "fox"];
    let accumulated = "";

    for (const word of words) {
      const events = parser.processChunk(enc(`data: {"content":"${word}"}\n`));
      for (const e of events) {
        if (typeof e.content === "string") accumulated += e.content;
      }
    }

    expect(accumulated).toBe("The quick brown fox");
  });

  it("flushes a trailing line with no final newline via flush()", () => {
    const parser = createSSEParser();
    parser.processChunk(enc('data: {"content":"partial"}'));
    // No newline – chunk sits in buffer until flush
    expect(parser.flush()).toEqual([{ content: "partial" }]);
  });

  it("each parser instance has independent state", () => {
    const p1 = createSSEParser();
    const p2 = createSSEParser();

    p1.processChunk(enc('data: {"content":"from p1"}\n\n'));
    const p2Events = p2.processChunk(enc('data: {"content":"from p2"}\n\n'));

    expect(p2Events).toEqual([{ content: "from p2" }]);
  });
});

// ---------------------------------------------------------------------------
// 1. Basic parsing – single chunk, no split
// ---------------------------------------------------------------------------

describe("parseSSEChunks – single chunk", () => {
  it("parses a single data event", () => {
    const result = parseSSEChunks([enc(singleEvent)]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ content: "hello" });
  });

  it("parses two consecutive events", () => {
    const result = parseSSEChunks([enc(twoEvents)]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ content: "foo" });
    expect(result[1]).toEqual({ content: "bar" });
  });

  it("parses title and content events", () => {
    const result = parseSSEChunks([enc(titleAndContent)]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ title: "My Article" });
    expect(result[1]).toEqual({ content: "First sentence." });
  });

  it("ignores non-data lines (comments, event: lines)", () => {
    const result = parseSSEChunks([enc(nonDataLine)]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ content: "ok" });
  });
});

// ---------------------------------------------------------------------------
// 2. The critical failure scenario: a `data:` line split across two chunks
// ---------------------------------------------------------------------------

describe("parseSSEChunks – data line split across chunks (the original bug)", () => {
  it("reassembles a data line split right after 'data: '", () => {
    // Split exactly at the boundary between "data: " and the JSON
    const chunks = splitAt(singleEvent, 6); // "data: " | '{"content":"hello"}\n\n'
    const result = parseSSEChunks(chunks);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ content: "hello" });
  });

  it("reassembles a data line split in the middle of the JSON value", () => {
    // 'data: {"content":"hel' | 'lo"}\n\n'
    const chunks = splitAt(singleEvent, 20);
    const result = parseSSEChunks(chunks);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ content: "hello" });
  });

  it("reassembles a data line split just before the closing brace", () => {
    // 'data: {"content":"hello"' | '}\n\n'
    const chunks = splitAt(singleEvent, singleEvent.length - 3);
    const result = parseSSEChunks(chunks);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ content: "hello" });
  });

  it("reassembles when split immediately after the newline separator", () => {
    // 'data: {"content":"foo"}\n' | '\ndata: {"content":"bar"}\n\n'
    const splitPos = twoEvents.indexOf("\n\n") + 1;
    const chunks = splitAt(twoEvents, splitPos);
    const result = parseSSEChunks(chunks);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ content: "foo" });
    expect(result[1]).toEqual({ content: "bar" });
  });

  it("handles each byte arriving in its own chunk (worst case)", () => {
    // Every single byte is its own chunk
    const bytes = enc(singleEvent);
    const chunks = Array.from(bytes, (b) => new Uint8Array([b]));
    const result = parseSSEChunks(chunks);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ content: "hello" });
  });
});

// ---------------------------------------------------------------------------
// 3. Multiple events split across many chunks
// ---------------------------------------------------------------------------

describe("parseSSEChunks – multi-event streams split at various positions", () => {
  it("collects all events when stream is split into many small chunks", () => {
    // Deliver two events in 5-byte chunks
    const chunks = splitAt(twoEvents, 5, 10, 15, 20, 25, 30);
    const result = parseSSEChunks(chunks);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.content)).toEqual(["foo", "bar"]);
  });

  it("accumulates content across many events into a full string", () => {
    const stream =
      'data: {"content":"The "}\ndata: {"content":"quick "}\ndata: {"content":"brown fox"}\n\n';
    // Split every 8 bytes
    const positions: number[] = [];
    for (let i = 8; i < enc(stream).length; i += 8) positions.push(i);
    const chunks = splitAt(stream, ...positions);

    const content = accumulateSSEContent(chunks);
    expect(content).toBe("The quick brown fox");
  });
});

// ---------------------------------------------------------------------------
// 4. Partial / malformed JSON must not drop surrounding valid events
// ---------------------------------------------------------------------------

describe("parseSSEChunks – malformed JSON resilience", () => {
  it("skips a malformed JSON line and still parses the surrounding valid lines", () => {
    const stream =
      'data: {"content":"before"}\ndata: not-valid-json\ndata: {"content":"after"}\n\n';
    const result = parseSSEChunks([enc(stream)]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ content: "before" });
    expect(result[1]).toEqual({ content: "after" });
  });

  it("handles an empty data line gracefully", () => {
    const stream = 'data: {"content":"ok"}\ndata: \ndata: {"content":"done"}\n\n';
    // "data: " with nothing after it is invalid JSON – should be skipped
    const result = parseSSEChunks([enc(stream)]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ content: "ok" });
    expect(result[1]).toEqual({ content: "done" });
  });
});

// ---------------------------------------------------------------------------
// 5. Edge cases
// ---------------------------------------------------------------------------

describe("parseSSEChunks – edge cases", () => {
  it("returns an empty array for an empty stream", () => {
    expect(parseSSEChunks([])).toEqual([]);
  });

  it("returns an empty array for a stream with no data lines", () => {
    expect(parseSSEChunks([enc(": keep-alive\n\n")])).toEqual([]);
  });

  it("handles a stream that ends without a trailing newline", () => {
    // Some servers omit the final \n – the last line stays in the buffer
    // and should still be flushed.
    const noTrailingNewline = 'data: {"content":"last"}';
    const result = parseSSEChunks([enc(noTrailingNewline)]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ content: "last" });
  });

  it("handles large payloads arriving in one chunk", () => {
    const longContent = "A".repeat(5000);
    const stream = `data: {"content":"${longContent}"}\n\n`;
    const result = parseSSEChunks([enc(stream)]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ content: longContent });
  });
});

// ---------------------------------------------------------------------------
// 6. accumulateSSEContent helper
// ---------------------------------------------------------------------------

describe("accumulateSSEContent", () => {
  it("concatenates all content fields in order", () => {
    const stream =
      'data: {"content":"Hello"}\ndata: {"content":", "}\ndata: {"content":"world!"}\n\n';
    expect(accumulateSSEContent([enc(stream)])).toBe("Hello, world!");
  });

  it("ignores events that have no content field", () => {
    const stream =
      'data: {"title":"T"}\ndata: {"content":"body"}\n\n';
    expect(accumulateSSEContent([enc(stream)])).toBe("body");
  });

  it("returns empty string for a stream with no content events", () => {
    expect(accumulateSSEContent([enc(": ping\n\n")])).toBe("");
  });
});
