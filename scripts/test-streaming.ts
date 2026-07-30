/**
 * Streaming smoke test — runs against the live dev server.
 *
 * Covers three SSE endpoints that all use pipeStreamToSSE():
 *   • POST /api/chat        → tokens as {"content":"..."}, terminates with {"done":true}
 *   • POST /api/expert-chat → same format
 *   • POST /api/guide-chat  → tokens as {"content":"..."}, terminates with {"done":true}
 *                             (was broken: key was "text" instead of "content" — fixed)
 *
 * Checks per endpoint:
 *   1. HTTP 200 with Content-Type: text/event-stream
 *   2. At least one content/text token received
 *   3. Stream ends with {"done":true}  (never the legacy "[DONE]" string)
 *   4. No {"error":"..."} event emitted during a normal response
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

// ─── Wait for server ─────────────────────────────────────────────────────────
async function waitForServer(maxMs = 30_000): Promise<void> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/api/auth/user`);
      if (r.status < 500) return; // server is up (401 is fine)
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  console.error("Server did not become ready within 30s — aborting.");
  process.exit(1);
}
await waitForServer();

// ─── Login ────────────────────────────────────────────────────────────────────
console.log("\n[0] Login");
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

const sessionCookie = (loginRes.headers.get("set-cookie") ?? "").split(";")[0];

// ─── SSE helper ───────────────────────────────────────────────────────────────
async function testSSEEndpoint(opts: {
  label: string;
  url: string;
  body: unknown;
  tokenKey: string;   // "content" or "text"
}): Promise<void> {
  console.log(`\n[${opts.label}] ${opts.url}`);

  const res = await fetch(`${BASE}${opts.url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify(opts.body),
  });

  if (res.status === 200) {
    ok(`HTTP 200`);
  } else {
    fail(`HTTP status`, `expected 200, got ${res.status}`);
    return;
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/event-stream")) {
    ok(`Content-Type: text/event-stream`);
  } else {
    fail(`Content-Type`, `expected text/event-stream, got "${ct}"`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let tokenCount = 0;
  let sawDone = false;
  let sawLegacyDone = false;
  let sawError = false;
  const deadline = Date.now() + 30_000;

  outer: while (Date.now() < deadline) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();

      if (raw === "[DONE]") { sawLegacyDone = true; break outer; }

      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(raw); } catch { continue; }

      if (parsed.error) { sawError = true; fail(`SSE error frame`, String(parsed.error)); break outer; }
      if (parsed[opts.tokenKey] !== undefined) tokenCount++;
      if (parsed.done === true) { sawDone = true; break outer; }
    }
  }

  reader.releaseLock();

  tokenCount > 0
    ? ok(`Received ${tokenCount} "${opts.tokenKey}" token(s)`)
    : fail(`No "${opts.tokenKey}" tokens received`);

  sawDone
    ? ok(`Terminated with {"done":true}`)
    : fail(`Missing {"done":true} terminator`);

  sawLegacyDone
    ? fail(`Legacy [DONE] terminator detected — pipeStreamToSSE fix missing`)
    : ok(`No legacy [DONE] terminator`);

  if (!sawError) ok(`No SSE error frames`);
}

// ─── Run all four endpoints ────────────────────────────────────────────────────
await testSSEEndpoint({
  label: "1: chat",
  url: "/api/chat",
  body: { message: "Satu kata saja" },
  tokenKey: "content",
});

await testSSEEndpoint({
  label: "2: expert-chat",
  url: "/api/expert-chat",
  body: { message: "Satu kata saja", expertType: "marketing" },
  tokenKey: "content",
});

await testSSEEndpoint({
  label: "3: guide-chat (key fixed: content)",
  url: "/api/guide-chat",
  body: { message: "Halo", history: [], context: { isAuthenticated: true, userName: "Test" } },
  tokenKey: "content",
});

await testSSEEndpoint({
  label: "4: generate-story",
  url: "/api/generate-story",
  body: {
    storyType: "before_after",
    emotion: "inspired",
    productName: "Kopi Premium",
    productBenefit: "Meningkatkan fokus kerja",
  },
  tokenKey: "content",
});

// ─── [5] bpCtx field-name regression check ───────────────────────────────────
// Catches someone renaming business_profile columns back to wrong names
// (productCategory, usp, mainPlatforms) which break AI context injection.
console.log("\n[5] GET /api/business-profile — bpCtx field-name regression");
const bpRes = await fetch(`${BASE}/api/business-profile`, {
  headers: { Cookie: sessionCookie },
});
if (bpRes.status === 200) {
  const bp = await bpRes.json();
  if (bp === null) {
    ok("Business profile endpoint healthy (no profile set for test user)");
  } else {
    const keys = Object.keys(bp);
    const CORRECT = ["businessType", "industry", "productsServices", "valueProposition", "tone"];
    const LEGACY   = ["productCategory", "usp", "mainPlatforms"];
    CORRECT.some(f => keys.includes(f))
      ? ok(`Correct column names present (businessType/valueProposition/…)`)
      : fail(`Missing expected bpCtx columns`, `keys: ${keys.join(", ")}`);
    const foundLegacy = LEGACY.filter(k => keys.includes(k));
    foundLegacy.length === 0
      ? ok(`No legacy column names in business profile response`)
      : fail(`Legacy bpCtx column names detected — regression!`, foundLegacy.join(", "));
  }
} else {
  fail(`GET /api/business-profile → unexpected ${bpRes.status}`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n── Result: ${passed} passed, ${failed} failed ──\n`);
process.exit(failed > 0 ? 1 : 0);
