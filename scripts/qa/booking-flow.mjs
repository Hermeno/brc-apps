// End-to-end check of the booking flow: request → the 2 nearest free cleaners →
// answer → decline (notice + re-offer) → accept (fee or free credit, chat) →
// failed charge (manual payment, contact hidden) → next round, exactly once.
//
// Runs against a LOCAL production build and a LOCAL Postgres only — never .env:
//   1. Postgres with ssl=on on 127.0.0.1:55432, database verliks_test, schema from
//      `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`.
//   2. Export DATABASE_URL/DIRECT_URL to it, TZ=UTC, MAIL_MAILER=log, a dummy
//      NEXTAUTH_SECRET, NEXTAUTH_URL=http://localhost:3100 and an invalid
//      sk_test_ key (so the auto-charge fails), then `npx next build` and
//      `npx next start -p 3100` (a second instance on 3101 mirrors production).
//   3. node scripts/qa/booking-flow.mjs   (about 4 minutes: it waits out a round)
import assert from 'node:assert/strict';
if (process.env.TZ !== 'UTC') throw new Error('run with TZ=UTC: timestamp columns hold UTC');

import pg from 'pg';
import bcrypt from 'bcryptjs';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:3100';
const URL_DB = process.env.DATABASE_URL ?? '';
if (!URL_DB.includes('127.0.0.1:55432')) throw new Error('refusing: not the local QA database');
const db = new pg.Client({ connectionString: URL_DB.replace(/\?.*$/, ''), ssl: { rejectUnauthorized: false } });
await db.connect();
const q = async (sql, params = []) => (await db.query(sql, params)).rows;

let pass = 0, fail = 0;
const results = [];
function check(label, fn) {
  try { fn(); pass++; results.push(`  ok    ${label}`); }
  catch (e) { fail++; results.push(`  FAIL  ${label}: ${e.message.split('\n')[0]}`); }
}
const log = s => results.push(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, timeoutMs, stepMs = 500) {
  const t0 = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return { value: v, ms: Date.now() - t0 };
    if (Date.now() - t0 > timeoutMs) return { value: null, ms: Date.now() - t0 };
    await wait(stepMs);
  }
}

// ── Fixtures ────────────────────────────────────────────────────────────────
const PASS = 'Qa-Pass-2026!';
const hash = bcrypt.hashSync(PASS, 10);
const ZIP = { lat: 41.5507, lng: -73.0682 }; // Waterbury, CT 06708
// offsets in miles north of the ZIP centroid (1° lat ≈ 69 mi)
const at = mi => ({ lat: ZIP.lat + mi / 69, lng: ZIP.lng });
const cleaners = {
  A: { mi: 0.6 }, B: { mi: 1.1 }, G: { mi: 2.0 }, C: { mi: 2.9, credits: 1 }, D: { mi: 5.1 },
  E: { mi: 0.2, blocked: true }, F: { mi: 0.3, booked: true },
};
const id = k => `qa-cl-${k.toLowerCase()}`;
const email = k => `qa-cl-${k.toLowerCase()}@example.com`;

await q(`DELETE FROM "Notification" WHERE "userId" LIKE 'qa-%'`);
await q(`DELETE FROM "Message" WHERE "conversationId" IN (SELECT id FROM "Conversation" WHERE "clientId" LIKE 'qa-%')`);
await q(`DELETE FROM "Conversation" WHERE "clientId" LIKE 'qa-%'`);
await q(`DELETE FROM "LeadDistribution" WHERE "leadId" IN (SELECT id FROM "Lead" WHERE "clientId" LIKE 'qa-%')`);
await q(`DELETE FROM "Lead" WHERE "clientId" LIKE 'qa-%'`);
await q(`DELETE FROM "ScheduleBlock" WHERE "cleanerId" LIKE 'qa-%'`);
await q(`DELETE FROM "CleanerVerification" WHERE "cleanerId" LIKE 'qa-%'`);
await q(`DELETE FROM "CleanerStats" WHERE "cleanerId" LIKE 'qa-%'`);
await q(`DELETE FROM "User" WHERE id LIKE 'qa-%'`);

for (const c of ['qa-client', 'qa-client2']) {
  await q(`INSERT INTO "User" (id, email, password, name, role, "isVerified", phone, "updatedAt")
           VALUES ($1, $2, $3, $4, 'CLIENT', true, '+1 203 555 0100', now())`, [c, `${c}@example.com`, hash, c === 'qa-client' ? 'Quinn Client' : 'Other Client']);
}
for (const [k, c] of Object.entries(cleaners)) {
  const p = at(c.mi);
  await q(`INSERT INTO "User" (id, email, password, name, role, "isVerified", latitude, longitude, "zipCode",
             plan, "serviceRadiusMiles", "hasPaymentMethod", "isAvailable", "freeLeadCredits", "updatedAt")
           VALUES ($1, $2, $3, $4, 'CLEANER', true, $5, $6, '06708', 'FREE', 25, true, true, $7, now())`,
    [id(k), email(k), hash, `Cleaner ${k}`, p.lat, p.lng, c.credits ?? 0]);
  await q(`INSERT INTO "CleanerVerification" (id, "cleanerId", "fullName", "idNumber", address, "frontDocUrl", "backDocUrl", "selfieUrl", status, "updatedAt")
           VALUES ($1, $2, $3, '000', 'x', 'x', 'x', 'x', 'APPROVED', now())`, [`qa-ver-${k}`, id(k), `Cleaner ${k}`]);
}
const JOB = new Date(Date.now() + 26 * 3600e3); JOB.setUTCMinutes(0, 0, 0);
await q(`INSERT INTO "ScheduleBlock" (id, "cleanerId", "startTime", "endTime", reason)
         VALUES ('qa-block-e', $1, $2, $3, 'day off')`, [id('E'), new Date(JOB.getTime() - 4 * 3600e3), new Date(JOB.getTime() + 4 * 3600e3)]);
await q(`INSERT INTO "Lead" (id, "clientId", "cleanerId", status, address, latitude, longitude, "serviceType", "dateTime", "zipCode", "updatedAt")
         VALUES ('qa-lead-busy', 'qa-client2', $1, 'ACCEPTED', '1 Other St, Waterbury, CT 06708', $2, $3, 'standard', $4, '06708', now())`,
  [id('F'), ZIP.lat, ZIP.lng, new Date(JOB.getTime() + 3600e3)]);

// ── Sessions (Auth.js credentials, exactly what the login form posts) ──────────
async function login(mail) {
  const jar = new Map();
  const keep = res => { for (const c of res.headers.getSetCookie()) { const [kv] = c.split(';'); const i = kv.indexOf('='); jar.set(kv.slice(0, i), kv.slice(i + 1)); } };
  const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
  const r1 = await fetch(`${BASE}/api/auth/csrf`); keep(r1);
  const { csrfToken } = await r1.json();
  const r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST', redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookie() },
    body: new URLSearchParams({ csrfToken, email: mail, password: PASS, callbackUrl: `${BASE}/dashboard` }),
  });
  keep(r2);
  if (![...jar.keys()].some(k => k.includes('session-token'))) throw new Error(`login failed for ${mail} (${r2.status})`);
  return async (path, init = {}) => {
    const res = await fetch(`${BASE}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(init.headers ?? {}), cookie: cookie() } });
    let body = null; try { body = await res.json(); } catch {}
    return { status: res.status, body };
  };
}
const client = await login('qa-client@example.com');
const as = {}; for (const k of Object.keys(cleaners)) as[k] = await login(email(k));
const keyOf = cid => Object.keys(cleaners).find(k => id(k) === cid);

const haversine = (a, b) => {
  const R = 3958.8, toR = x => x * Math.PI / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
// Same ranking the engine uses for FREE plans that accept every service, rating 0.
function expectedBatch(lead, exclude) {
  return Object.entries(cleaners)
    .filter(([k, c]) => !c.blocked && !c.booked && !exclude.includes(k))
    .map(([k, c]) => { const d = haversine({ lat: lead.latitude, lng: lead.longitude }, at(c.mi)); return { k, d, score: 20 + Math.max(0, Math.round(10 - d / 5)) }; })
    .sort((a, b) => b.score - a.score || a.d - b.d)
    .slice(0, 2).map(x => x.k).sort();
}
const invited = async leadId => (await q(`SELECT "cleanerId" FROM "LeadDistribution" WHERE "leadId" = $1 AND status = 'INVITED'`, [leadId])).map(r => keyOf(r.cleanerId)).sort();
const notes = async (who, type, since) => q(`SELECT title, body, link FROM "Notification" WHERE "userId" = $1 AND type = $2 AND "createdAt" >= $3 ORDER BY "createdAt"`, [who, type, since]);

const ADDRESS = '16 Main St, Waterbury, CT 06708';
const STREET = '16 Main St';
const booking = (over = {}) => ({
  serviceType: 'standard', address: ADDRESS, dateTime: JOB.toISOString(), bedrooms: 2, bathrooms: 1, squareMeters: 80,
  extras: [], frequency: 'biweekly', notes: 'Gate code 1234', clientPhone: '+1 203 555 0100', ...over,
});

// ── 1. Who may book, and when ───────────────────────────────────────────────
log('1. validation');
const byCleaner = await as.A('/api/leads', { method: 'POST', body: JSON.stringify(booking()) });
check('a cleaner cannot create a booking (403)', () => assert.equal(byCleaner.status, 403));
const past = await client('/api/leads', { method: 'POST', body: JSON.stringify(booking({ dateTime: new Date(Date.now() - 3600e3).toISOString() })) });
check('a booking in the past is refused (400)', () => assert.equal(past.status, 400));

// ── 2. Request → the two nearest free cleaners, fast ──────────────────────────
log('2. dispatch');
const t0 = new Date();
const created = await client('/api/leads', { method: 'POST', body: JSON.stringify(booking()) });
check('client creates the booking (201)', () => assert.equal(created.status, 201));
const L1 = created.body?.lead?.id;
const first = await until(async () => { const v = await invited(L1); return v.length === 2 ? v : null; }, 30000);
const [lead1] = await q(`SELECT * FROM "Lead" WHERE id = $1`, [L1]);
log(`        dispatch took ${first.ms} ms`);
check('the request reaches 2 cleaners within 10 s', () => { assert.ok(first.value, 'nobody invited'); assert.ok(first.ms < 10000, `${first.ms} ms`); });
check('those 2 are the nearest free ones (score, then distance)', () => assert.deepEqual(first.value, expectedBatch(lead1, [])));
check('the cleaner on a day off and the one already booked are not invited', () => { assert.ok(!first.value?.includes('E')); assert.ok(!first.value?.includes('F')); });
check('lead fee: standard $15 × 1.5 biweekly = $23', () => assert.equal(lead1.leadPrice, 23));
const [X1, X2] = first.value ?? [];
for (const k of [X1, X2]) {
  const n = await notes(id(k), 'lead_received', t0);
  check(`cleaner ${k} is notified once, with the area and no street`, () => {
    assert.equal(n.length, 1, `${n.length} notifications`);
    assert.ok(/waterbury/i.test(n[0].body), n[0].body);
    assert.ok(!n[0].body.includes(STREET), n[0].body);
  });
}

// ── 3. The cleaner sees it and answers ──────────────────────────────────────
log('3. answer');
const feed = await as[X1]('/api/leads/available');
const offered = feed.body?.available?.find(l => l.id === L1);
check(`cleaner ${X1} sees the request, address hidden`, () => { assert.ok(offered); assert.ok(!offered.address.includes(STREET)); assert.equal(offered.notes, null); assert.equal(offered.clientPhone, null); });
await q(`UPDATE "User" SET "freeLeadCredits" = 1 WHERE id = $1`, [id(X1)]);
const resp = await as[X1](`/api/leads/${L1}/respond`, { method: 'POST', body: '{}' });
check(`cleaner ${X1} answers (200, chat created)`, () => { assert.equal(resp.status, 200, JSON.stringify(resp.body)); assert.ok(resp.body?.conversationId); });
const C1 = resp.body?.conversationId;
const lateResp = await as[X2](`/api/leads/${L1}/respond`, { method: 'POST', body: '{}' });
check(`the other invited cleaner (${X2}) can no longer take it (409)`, () => assert.equal(lateResp.status, 409));
const toldClient = await notes('qa-client', 'cleaner_responded', t0);
check('the client is told a cleaner answered (notification)', () => assert.equal(toldClient.length, 1));
const sched1 = await as[X1]('/api/schedule');
const s1 = sched1.body?.jobs?.find(j => j.id === L1);
check('waiting job: schedule shows it without the street, even with a free credit', () => { assert.ok(s1, 'missing'); assert.equal(s1.status, 'IN_REVIEW'); assert.ok(!s1.address.includes(STREET), s1.address); assert.equal(s1.clientPhone, null); });
const chat1 = await as[X1](`/api/conversations/${C1}/messages`);
check('waiting job: the chat keeps the contact hidden until the client accepts', () => { assert.equal(chat1.body.paymentRequired, true); assert.ok(!chat1.body.conversation.lead.address.includes(STREET)); });

// ── 4. Client declines → cleaner told, request offered again ───────────────────
log('4. decline');
const t1 = new Date();
const dec = await client(`/api/conversations/${C1}/decline`, { method: 'POST' });
check('client declines (200)', () => assert.equal(dec.status, 200));
const declinedNote = await until(async () => (await notes(id(X1), 'lead_declined', t1))[0], 5000);
check(`cleaner ${X1} is notified of the decline`, () => { assert.ok(declinedNote.value); assert.ok(/no lead fee was charged/i.test(declinedNote.value.body), declinedNote.value?.body); });
const [keep] = await q(`SELECT "freeLeadCredits" FROM "User" WHERE id = $1`, [id(X1)]);
check(`cleaner ${X1} keeps the free credit after being declined`, () => assert.equal(keep.freeLeadCredits, 1));
const second = await until(async () => { const v = await invited(L1); const [l] = await q(`SELECT status FROM "Lead" WHERE id = $1`, [L1]); return v.length === 2 && l.status === 'WAVE2' ? v : null; }, 30000);
log(`        re-offer took ${second.ms} ms`);
check('the request is open again and offered to 2 new cleaners within 10 s', () => { assert.ok(second.value); assert.ok(second.ms < 10000, `${second.ms} ms`); });
check('the new pair is the next nearest, never the declined or the earlier one', () => assert.deepEqual(second.value, expectedBatch(lead1, [X1, X2])));
for (const k of second.value ?? []) {
  const n = await notes(id(k), 'lead_received', t1);
  check(`cleaner ${k} is notified of the re-offer once`, () => assert.equal(n.length, 1));
}

// ── 5. Accept → fee settled at once, both in the chat ─────────────────────────
log('5. accept');
const Y = second.value?.[0];
await q(`UPDATE "User" SET "freeLeadCredits" = 1 WHERE id = $1`, [id(Y)]);
const resp2 = await as[Y](`/api/leads/${L1}/respond`, { method: 'POST', body: '{}' });
const C2 = resp2.body?.conversationId;
check(`cleaner ${Y} answers`, () => assert.equal(resp2.status, 200, JSON.stringify(resp2.body)));
const t2 = new Date();
const conf = await client(`/api/conversations/${C2}/confirm`, { method: 'POST' });
check('client accepts (200)', () => assert.equal(conf.status, 200, JSON.stringify(conf.body)));
const [conv2] = await q(`SELECT "feeStatus", "leadFee", status FROM "Conversation" WHERE id = $1`, [C2]);
const [lead1b] = await q(`SELECT status, "cleanerId" FROM "Lead" WHERE id = $1`, [L1]);
check('booking accepted for that cleaner', () => { assert.equal(lead1b.status, 'ACCEPTED'); assert.equal(lead1b.cleanerId, id(Y)); });
check('fee settled at acceptance (free-lead credit → waived)', () => assert.equal(conv2.feeStatus, 'waived'));
const [spent] = await q(`SELECT "freeLeadCredits" FROM "User" WHERE id = $1`, [id(Y)]);
check('the credit is spent exactly once, at acceptance', () => assert.equal(spent.freeLeadCredits, 0));
const accNote = await until(async () => (await notes(id(Y), 'client_accepted', t2))[0], 5000);
check(`cleaner ${Y} is notified, with the chat link`, () => { assert.ok(accNote.value); assert.equal(accNote.value.link, `/dashboard/chat/${C2}`); });
check('a settled (free-credit) fee is not announced as owed', () => { assert.ok(!/pay the lead fee/i.test(accNote.value?.body ?? ''), accNote.value?.body); assert.ok(/free lead credit/i.test(accNote.value?.body ?? '')); });
const chatY = await as[Y](`/api/conversations/${C2}/messages`);
check('the chat is open for the cleaner with the full contact', () => { assert.equal(chatY.status, 200); assert.equal(chatY.body.paymentRequired, false); assert.ok(chatY.body.conversation.lead.address.includes(STREET)); });
const chatClient = await client(`/api/conversations/${C2}/messages`);
check('the chat is open for the client', () => assert.equal(chatClient.status, 200));
const sendY = await as[Y](`/api/conversations/${C2}/messages`, { method: 'POST', body: JSON.stringify({ content: 'Hi! Confirming tomorrow.' }) });
check('the cleaner can write in the chat', () => assert.equal(sendY.status, 200, JSON.stringify(sendY.body)));
const schedY = await as[Y]('/api/schedule');
const sY = schedY.body?.jobs?.find(j => j.id === L1);
check('paid job: schedule shows the full address and marks it recurring', () => { assert.ok(sY?.address.includes(STREET)); assert.equal(sY.recurring, true); });

// ── 6. Charge fails → manual payment, contact stays hidden ────────────────────
log('6. failed charge');
const JOB2 = new Date(JOB.getTime() + 24 * 3600e3);
const created2 = await client('/api/leads', { method: 'POST', body: JSON.stringify(booking({ serviceType: 'deep', frequency: 'once', dateTime: JOB2.toISOString() })) });
const L2 = created2.body?.lead?.id;
const b2 = await until(async () => { const v = await invited(L2); return v.length === 2 ? v : null; }, 30000);
const Z = (b2.value ?? []).find(k => k !== Y) ?? b2.value?.[0];
await q(`UPDATE "User" SET "freeLeadCredits" = 0 WHERE id = $1`, [id(Z)]); // this path is the card, not a credit
const resp3 = await as[Z](`/api/leads/${L2}/respond`, { method: 'POST', body: '{}' });
const C3 = resp3.body?.conversationId;
check(`cleaner ${Z} answers the deep clean ($25 fee, no credit)`, () => assert.equal(resp3.status, 200, JSON.stringify(resp3.body)));
const t3 = new Date();
const conf3 = await client(`/api/conversations/${C3}/confirm`, { method: 'POST' });
const [conv3] = await q(`SELECT "feeStatus", "leadFee", "feeDeadline" FROM "Conversation" WHERE id = $1`, [C3]);
check('client accepts; the card charge fails and a 24 h payment deadline starts', () => {
  assert.equal(conf3.status, 200); assert.equal(conf3.body.autoCharged, false);
  assert.equal(conv3.feeStatus, 'pending'); assert.equal(conv3.leadFee, 25);
  const h = (conv3.feeDeadline - Date.now()) / 3600e3; assert.ok(h > 23 && h <= 24.1, `${h} h`);
});
const payNote = await until(async () => (await notes(id(Z), 'client_accepted', t3))[0], 5000);
check(`cleaner ${Z} is told to pay within 24 h`, () => assert.ok(/24h/.test(payNote.value?.body ?? ''), payNote.value?.body));
const chatZ = await as[Z](`/api/conversations/${C3}/messages`);
check('unpaid: the chat keeps the contact hidden', () => { assert.equal(chatZ.body.paymentRequired, true); assert.ok(!chatZ.body.conversation.lead.address.includes(STREET)); });
const schedZ = await as[Z]('/api/schedule');
const sZ = schedZ.body?.jobs?.find(j => j.id === L2);
check('unpaid ACCEPTED job: the schedule does not leak the street, phone or notes', () => { assert.ok(sZ); assert.equal(sZ.status, 'ACCEPTED'); assert.ok(!sZ.address.includes(STREET), sZ.address); assert.equal(sZ.clientPhone, null); assert.equal(sZ.notes, null); });

// ── 7. One instance per minute runs the rounds ───────────────────────────────
log('7. minute loop');
const { value: lease } = await until(async () => { const [r] = await q(`SELECT EXTRACT(EPOCH FROM (now() AT TIME ZONE 'UTC' - "updatedAt")) AS age FROM "LeadPlatformConfig" WHERE id = 'waves_lease'`); return r && Number(r.age) < 75 ? r : null; }, 90000, 2000); // the first tick runs 60 s after boot
check('the running server holds the minute lease', () => { assert.ok(lease); assert.ok(Number(lease.age) < 75, `${lease?.age} s old`); });
await q(`UPDATE "LeadPlatformConfig" SET "updatedAt" = now() - interval '5 minutes' WHERE id = 'waves_lease'`);
const racers = await Promise.all(Array.from({ length: 8 }, async () => {
  const c = new pg.Client({ connectionString: URL_DB.replace(/\?.*$/, ''), ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`INSERT INTO "LeadPlatformConfig" ("id", "value", "updatedAt") VALUES ('waves_lease', '', NOW())
    ON CONFLICT ("id") DO UPDATE SET "updatedAt" = NOW() WHERE "LeadPlatformConfig"."updatedAt" < NOW() - INTERVAL '45 seconds'`);
  await c.end();
  return r.rowCount;
}));
check('8 instances racing for the same minute: exactly one wins', () => assert.equal(racers.reduce((a, b) => a + b, 0), 1));

// ── 8. Nobody answers → the next pair, on time ─────────────────────────────────
log('8. next round');
await q(`UPDATE "LeadPlatformConfig" SET "updatedAt" = now() - interval '5 minutes' WHERE id = 'waves_lease'`);
const JOB3 = new Date(JOB.getTime() + 48 * 3600e3);
const created3 = await client('/api/leads', { method: 'POST', body: JSON.stringify(booking({ dateTime: JOB3.toISOString(), frequency: 'once' })) });
const L3 = created3.body?.lead?.id;
const r1 = await until(async () => { const v = await invited(L3); return v.length === 2 ? v : null; }, 30000);
const t4 = new Date();
const r2 = await until(async () => {
  const [l] = await q(`SELECT status FROM "Lead" WHERE id = $1`, [L3]);
  const v = await invited(L3);
  return l.status === 'WAVE3' && v.length > 0 ? v : null;
}, 200000, 2000);
log(`        next round after ${Math.round(r2.ms / 1000)} s (window 90 s + up to 60 s tick)`);
check('after 90 s without an answer the request goes to the next pair', () => { assert.ok(r2.value); assert.ok(r2.ms < 160000, `${r2.ms} ms`); });
check('the next pair excludes the first one', () => { for (const k of r2.value ?? []) assert.ok(!(r1.value ?? []).includes(k), k); });
for (const k of r2.value ?? []) {
  const n = await notes(id(k), 'lead_received', t4);
  check(`cleaner ${k} gets exactly one notice for the next round`, () => assert.equal(n.length, 1, `${n.length}`));
}

await db.end();
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
