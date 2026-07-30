/**
 * Streaming smoke test — runs against the live dev server.
 *
 * Checks that:
 *   1. POST /api/auth/login succeeds and returns a session cookie
 *   2. POST /api/chat returns proper SSE tokens: data: {"content":"..."}
 *   3. The stream terminates with data: {"done":true}  (not the old "[DONE]" format)
 *   4. No { error: "..." } event is emitted during a normal response
 *
 * Exit 0 = all checks passed.  Exit 1 = at least one check failed.
 *
 * Usage:  npx tsx scripts/test-streaming.ts
 * Requires the dev server to be running on port 5000.
 */

const BASE = "http://localhost:5000";
const EMAIL = "zvt_6pbj@test.com";
const PASS = "Test1234!";

let passed = 0;
let failed = 0;

function ok(label: string) {
  console.log(`  ✓ ${label}`);
  passed++;
}

function fail(label: string, detail?: string) {
  console.error(`  ✗ ${label}${detail ? ": " + detail : ""}`);
  failed++;
}

// ─── Step 1: login ────────────────────────────────────────────────────────────
console.log("\n[1] Login");
const loginRes = await fetch(`${BASE}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
  redirect: "manual",
});

if (loginRes.status >= 200 && loginRes.status < 400) {
  ok(`POST /api/auth/login → ${loginRes.status}`);
} else {
  fail(`POST /api/auth/login → ${loginRes.status}`);
  console.error("Login failed — cannot proceed. Is the server running?");
  process.exit(1);
}

const setCookie = loginRes.headers.get("set-cookie") ?? "";
const sessionCookie = setCookie.split(";")[0]; // "connect.sid=..."

// ─── Step 2: streaming chat ───────────────────────────────────────────────────
console.log("\n[2] Streaming /api/chat");
const chatRes = await fetch(`${BASE}/api/chat`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: sessionCookie,
  },
  body: JSON.stringify({ message: "Satu kata saja" }),
});

if (chatRes.status === 200) {
  ok(`POST /api/chat → 200`);
} else {
  fail(`POST /api/chat → ${chatRes.status}`);
  process.exit(1);
}

const contentType = chatRes.headers.get("content-type") ?? "";
if (contentType.includes("text/event-stream")) {
  ok(`Content-Type: text/event-stream`);
} else {
  fail(`Content-Type`, `expected text/event-stream, got "${contentType}"`);
}

// ─── Step 3: parse SSE frames ─────────────────────────────────────────────────
console.log("\n[3] SSE frame validation");
const reader = chatRes.body!.getReader();
const decoder = new TextDecoder();
let buffer = "";
let tokenCount = 0;
let sawDone = false;
let sawLegacyDone = false; // the old `[DONE]` format
let sawError = false;

const MAX_WAIT_MS = 30_000;
const deadline = Date.now() + MAX_WAIT_MS;

outer: while (Date.now() < deadline) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const raw = line.slice(6).trim();

    // Old format — should never appear after Task #23 fix
    if (raw === "[DONE]") {
      sawLegacyDone = true;
      break outer;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Malformed frame — skip (stream-sse.ts also skips these)
      continue;
    }

    if (parsed.error) {
      sawError = true;
      fail(`Unexpected SSE error frame`, String(parsed.error));
      break outer;
    }

    if (parsed.content !== undefined) {
      tokenCount++;
    }

    if (parsed.done === true) {
      sawDone = true;
      break outer;
    }
  }
}

reader.releaseLock();

if (tokenCount > 0) {
  ok(`Received ${tokenCount} content token(s)`);
} else {
  fail(`No content tokens received`);
}

if (sawDone) {
  ok(`Stream terminated with {"done":true}`);
} else {
  fail(`Stream did not send {"done":true} terminator`);
}

if (sawLegacyDone) {
  fail(`Stream sent legacy [DONE] terminator — guide-chat fix may be missing`);
} else {
  ok(`No legacy [DONE] terminator`);
}

if (!sawError) {
  ok(`No SSE error frames`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n── Result: ${passed} passed, ${failed} failed ──\n`);
process.exit(failed > 0 ? 1 : 0);
