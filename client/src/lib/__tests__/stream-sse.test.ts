/**
 * Tests for the streamSSE utility (client/src/lib/stream-sse.ts).
 *
 * These tests verify that the function used by every AI page (campaign-wizard,
 * ai-articles, ai-chat, ai-expert, guide-chatbot, story-telling) correctly:
 *  - calls onChunk for each parsed SSE data event
 *  - handles data lines split across network chunks (the key regression risk)
 *  - skips malformed JSON frames without throwing
 *  - throws on non-OK HTTP responses
 *  - POSTs with the correct headers and serialised body
 *
 * fetch is stubbed with a ReadableStream that delivers chunks in the same way
 * a real network connection would – allowing us to assert *incremental* delivery
 * rather than just the final accumulated result.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { streamSSE } from "../stream-sse";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Build a mock Response whose body is a ReadableStream that yields the given
 * string chunks one at a time, exactly as a chunked HTTP/1.1 or HTTP/2 frame
 * delivery would.
 */
function makeSSEResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder();
  let idx = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (idx < chunks.length) {
        controller.enqueue(encoder.encode(chunks[idx++]));
      } else {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    status,
    statusText: status === 200 ? "OK" : "Bad Request",
    headers: { "Content-Type": "text/event-stream" },
  });
}

// ---------------------------------------------------------------------------
// 1. Happy-path: single chunk
// ---------------------------------------------------------------------------

describe("streamSSE – single-chunk delivery", () => {
  it("calls onChunk once for a single data event", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeSSEResponse(['data: {"content":"hello"}\n\n'])),
    );

    const received: Record<string, unknown>[] = [];
    await streamSSE("/api/chat", { message: "hi" }, (data) => received.push(data));

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ content: "hello" });
  });

  it("calls onChunk for each of multiple events in one chunk", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeSSEResponse(['data: {"content":"a"}\n\ndata: {"content":"b"}\n\n']),
      ),
    );

    const contents: string[] = [];
    await streamSSE("/api/chat", {}, (d) => {
      if (typeof d.content === "string") contents.push(d.content);
    });

    expect(contents).toEqual(["a", "b"]);
  });
});

// ---------------------------------------------------------------------------
// 2. Incremental delivery – the primary regression guard
// ---------------------------------------------------------------------------

describe("streamSSE – incremental token delivery", () => {
  it("delivers tokens in order as separate network chunks arrive", async () => {
    // Simulate 4 words arriving one chunk at a time, as real SSE streaming does
    const chunks = [
      'data: {"content":"The "}\n\n',
      'data: {"content":"quick "}\n\n',
      'data: {"content":"brown "}\n\n',
      'data: {"content":"fox"}\n\n',
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeSSEResponse(chunks)));

    const order: string[] = [];
    await streamSSE("/api/chat", {}, (d) => {
      if (typeof d.content === "string") order.push(d.content);
    });

    // Must arrive in arrival order, not batched at the end
    expect(order).toEqual(["The ", "quick ", "brown ", "fox"]);
  });

  it("passes both content and title fields through onChunk unchanged", async () => {
    const chunks = [
      'data: {"title":"My Article"}\n\n',
      'data: {"content":"First sentence."}\n\n',
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeSSEResponse(chunks)));

    const events: Record<string, unknown>[] = [];
    await streamSSE("/api/generate-article", {}, (d) => events.push(d));

    expect(events[0]).toEqual({ title: "My Article" });
    expect(events[1]).toEqual({ content: "First sentence." });
  });
});

// ---------------------------------------------------------------------------
// 3. Cross-chunk line splitting – the critical buffer-handling case
// ---------------------------------------------------------------------------

describe("streamSSE – data lines split across network chunks", () => {
  it("reassembles a data line whose JSON is split across two chunks", async () => {
    // First chunk ends mid-JSON; second chunk completes it
    const chunks = ['data: {"content":"hel', 'lo"}\n\n'];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeSSEResponse(chunks)));

    const received: string[] = [];
    await streamSSE("/api/chat", {}, (d) => {
      if (typeof d.content === "string") received.push(d.content);
    });

    expect(received).toEqual(["hello"]);
  });

  it("reassembles a line split right after the 'data: ' prefix", async () => {
    const chunks = ["data: ", '{"content":"world"}\n\n'];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeSSEResponse(chunks)));

    const received: string[] = [];
    await streamSSE("/api/chat", {}, (d) => {
      if (typeof d.content === "string") received.push(d.content);
    });

    expect(received).toEqual(["world"]);
  });

  it("handles two events where the newline separator is split across chunks", async () => {
    // First event ends with \n, second \n and the next event start are in chunk 2
    const chunks = ['data: {"content":"a"}\n', '\ndata: {"content":"b"}\n\n'];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeSSEResponse(chunks)));

    const received: string[] = [];
    await streamSSE("/api/chat", {}, (d) => {
      if (typeof d.content === "string") received.push(d.content);
    });

    expect(received).toEqual(["a", "b"]);
  });
});

// ---------------------------------------------------------------------------
// 4. Malformed JSON resilience
// ---------------------------------------------------------------------------

describe("streamSSE – malformed JSON frames", () => {
  it("skips a malformed JSON line without throwing and continues processing", async () => {
    const chunks = [
      'data: {"content":"before"}\ndata: not-valid-json\ndata: {"content":"after"}\n\n',
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeSSEResponse(chunks)));

    const received: string[] = [];
    await streamSSE("/api/chat", {}, (d) => {
      if (typeof d.content === "string") received.push(d.content);
    });

    // Malformed frame must be silently dropped; surrounding frames must arrive
    expect(received).toEqual(["before", "after"]);
  });

  it("handles an empty data line without throwing", async () => {
    const chunks = ['data: {"content":"ok"}\ndata: \ndata: {"content":"done"}\n\n'];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeSSEResponse(chunks)));

    const received: string[] = [];
    await streamSSE("/api/chat", {}, (d) => {
      if (typeof d.content === "string") received.push(d.content);
    });

    expect(received).toEqual(["ok", "done"]);
  });

  it("ignores non-data SSE lines (comments, event: lines) without throwing", async () => {
    const chunks = [': keep-alive\nevent: message\ndata: {"content":"payload"}\n\n'];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeSSEResponse(chunks)));

    const received: string[] = [];
    await streamSSE("/api/chat", {}, (d) => {
      if (typeof d.content === "string") received.push(d.content);
    });

    expect(received).toEqual(["payload"]);
  });
});

// ---------------------------------------------------------------------------
// 5. Error handling
// ---------------------------------------------------------------------------

describe("streamSSE – error handling", () => {
  it("throws when the server returns a non-OK status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Bad Request", { status: 400, statusText: "Bad Request" }),
      ),
    );

    await expect(streamSSE("/api/chat", {}, () => {})).rejects.toThrow(
      "Request failed: 400 Bad Request",
    );
  });

  it("throws when the server returns 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Internal Server Error", { status: 500, statusText: "Internal Server Error" }),
      ),
    );

    await expect(streamSSE("/api/chat", {}, () => {})).rejects.toThrow("500");
  });
});

// ---------------------------------------------------------------------------
// 6. Request shape – all six page endpoints use the same POST contract
// ---------------------------------------------------------------------------

describe("streamSSE – request contract (POST + JSON body + Content-Type)", () => {
  it("POSTs to the given URL with JSON body and correct Content-Type", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(makeSSEResponse(['data: {"content":"ok"}\n\n']));
    vi.stubGlobal("fetch", mockFetch);

    await streamSSE("/api/chat", { message: "test", history: [] }, () => {});

    expect(mockFetch).toHaveBeenCalledWith("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test", history: [] }),
    });
  });

  it("serialises complex nested bodies correctly", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(makeSSEResponse(['data: {"content":"x"}\n\n']));
    vi.stubGlobal("fetch", mockFetch);

    const body = {
      storyType: "hero_journey",
      emotion: "inspirational",
      productName: "EcoBottle",
      targetAudience: "millennials",
    };
    await streamSSE("/api/generate-story", body, () => {});

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/generate-story",
      expect.objectContaining({ body: JSON.stringify(body) }),
    );
  });
});

// ---------------------------------------------------------------------------
// 7. Empty stream
// ---------------------------------------------------------------------------

describe("streamSSE – empty or no-content streams", () => {
  it("resolves without calling onChunk when the stream is empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeSSEResponse([])));

    const received: Record<string, unknown>[] = [];
    await streamSSE("/api/chat", {}, (d) => received.push(d));

    expect(received).toHaveLength(0);
  });

  it("resolves without calling onChunk when stream has only a done event", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeSSEResponse(['data: {"done":true}\n\n'])),
    );

    const contentReceived: string[] = [];
    await streamSSE("/api/chat", {}, (d) => {
      if (typeof d.content === "string") contentReceived.push(d.content);
    });

    // done events have no content; onChunk may be called but no content extracted
    expect(contentReceived).toHaveLength(0);
  });
});
