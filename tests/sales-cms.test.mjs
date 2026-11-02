import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { PGlite } from "@electric-sql/pglite";
import ts from "typescript";

const require = createRequire(import.meta.url);
const salesId = "11111111-1111-4111-8111-111111111111";
const ownerId = "22222222-2222-4222-8222-222222222222";
const strangerId = "33333333-3333-4333-8333-333333333333";
let db;
const migration = (name) => readFile(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), "utf8");

before(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  `);
  await db.exec((await migration("202608180001_initial")).replace("create extension if not exists pgcrypto;", ""));
  for (const name of ["20260820175546_add_admin_dashboard_access", "20260820182350_separate_admin_read_policies", "20260820235221_add_template_catalog_management", "20260822071249_allow_admin_invitation_creation", "20260822073419_restrict_invitation_insert_to_authenticated"]) {
    await db.exec(await migration(name));
  }
  await db.exec(await migration("20260820172612_add_greeting_attendance"));
  await db.exec(await migration("20261019190000_secure_dashboard_and_add_views"));
  await db.exec(await migration("20261019210000_add_client_dashboard_magic_links"));
  await db.exec(await migration("20261102120000_sales_cms_and_login_protection"));
  await db.exec(`
    insert into auth.users values ('${salesId}'), ('${ownerId}'), ('${strangerId}');
    insert into admin_profiles(id,username,role) values ('${salesId}','sales','sales'), ('${ownerId}','owner','owner');
    insert into rsvps(invitation_id,guest_name,attendance) select id,'Private RSVP','attending' from invitations limit 1;
    insert into greetings(invitation_id,guest_name,message) select id,'Private greeting','Private message' from invitations limit 1;
    insert into invitation_views(invitation_id,visitor_id) select id,'${salesId}' from invitations limit 1;
    insert into templates(slug,name,is_active) values ('draft-only','Draft only',false);
    insert into invitations(template_id,slug,status,bride_name,bride_short_name,groom_name,groom_short_name,event_date,ceremony_time,reception_time,venue_name,venue_address,opening_text,cover_path)
    values ((select id from templates where slug='draft-only'),'private-draft','draft','A','A','B','B','2027-01-01','08:00','10:00','Venue','Address','Hello','/media/test.webp');
  `);
});

after(async () => { await db?.close(); });

async function asRole(role, userId, sql) {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${userId || ""}', false);`);
  try { return await db.query(sql); } finally { await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false);"); }
}

test("sales can change only catalog fields; the audit records the actor", async () => {
  const result = await asRole("authenticated", salesId, "update templates set catalog_status='maintenance' where slug='greeny-flowers' returning id");
  assert.equal(result.rows.length, 1);
  const audit = await db.query("select actor_id, next_state->>'catalog_status' as status from template_catalog_events order by id desc limit 1");
  assert.equal(audit.rows[0].actor_id, salesId);
  assert.equal(audit.rows[0].status, "maintenance");
  for (const sql of ["update templates set name='Hacked'", "delete from templates", "update admin_profiles set role='owner'", "select * from template_catalog_events", "select * from admin_login_limits"]) {
    await assert.rejects(asRole("authenticated", salesId, sql), /permission denied/);
  }
});

test("anonymous and non-admin sessions cannot change templates", async () => {
  await assert.rejects(asRole("anon", null, "update templates set is_active=false"), /permission denied/);
  const result = await asRole("authenticated", strangerId, "update templates set is_active=false returning id");
  assert.equal(result.rows.length, 0);
});

test("sales cannot read private RSVP, drafts, views or dashboard magic links", async () => {
  for (const table of ["rsvps", "greetings", "invitation_views", "invitation_dashboard_access"]) {
    assert.equal((await asRole("authenticated", salesId, `select * from ${table}`)).rows.length, 0, table);
    assert.ok((await asRole("authenticated", ownerId, `select * from ${table}`)).rows.length > 0, `owner: ${table}`);
  }
  assert.equal((await asRole("authenticated", salesId, "select * from invitations where status='draft'")).rows.length, 0);
  const existing = await db.query("select count(*)::int as count from invitations");
  await assert.rejects(asRole("authenticated", salesId, `insert into invitations select gen_random_uuid(),template_id,'sales-cannot-create',status,bride_name,bride_short_name,bride_parents,groom_name,groom_short_name,groom_parents,event_date,ceremony_time,reception_time,venue_name,venue_address,maps_url,opening_text,story,cover_path,gallery_paths,music_path,gift_info,theme_overrides,created_at,updated_at from invitations limit 1`), /row-level security/);
  assert.equal((await db.query("select count(*)::int as count from invitations")).rows[0].count, existing.rows[0].count);
});

test("deleting from catalog preserves sold invitations, template joins and RSVP rows", async () => {
  const before = await db.query("select count(*)::int as count from rsvps");
  await asRole("authenticated", salesId, "update templates set is_active=false where slug='greeny-flowers'");
  assert.equal((await asRole("anon", null, "select * from templates where is_active")).rows.length, 0);
  const published = await asRole("anon", null, "select i.slug,t.slug as template_slug from invitations i join templates t on t.id=i.template_id where i.status='published'");
  assert.ok(published.rows.length > 0);
  assert.equal(published.rows[0].template_slug, "greeny-flowers");
  assert.equal((await asRole("anon", null, "select * from templates where slug='draft-only'")).rows.length, 0);
  assert.equal((await db.query("select count(*)::int as count from rsvps")).rows[0].count, before.rows[0].count);
  const access = (await db.query("select a.* from invitation_dashboard_access a join invitations i on i.id=a.invitation_id where i.status='published' limit 1")).rows[0];
  const dashboard = await asRole("anon", null, `select get_invitation_dashboard_data('${access.invitation_id}', '${access.access_token}') as data`);
  assert.ok(dashboard.rows[0].data.rsvps.length > 0, "customer dashboard still works after catalog removal");
  await asRole("authenticated", salesId, "update templates set is_active=true, catalog_status='available' where slug='greeny-flowers'");
  assert.equal((await asRole("anon", null, "select * from templates where is_active")).rows.length, 1);
});

test("sales login alone cannot bypass the customer dashboard token", async () => {
  const invitation = (await db.query("select id from invitations where status='published' limit 1")).rows[0];
  const data = await asRole("authenticated", salesId, `select get_invitation_dashboard_data('${invitation.id}', 'invalid-token') as dashboard`);
  assert.equal(data.rows[0].dashboard, null);
});

test("invalid catalog status is rejected at the database boundary", async () => {
  await assert.rejects(asRole("authenticated", salesId, "update templates set catalog_status='anything'"), /check constraint/);
});

test("rate limit is service-only, persists across calls, and resets after the window", async () => {
  const hash = "a".repeat(64);
  for (const role of ["anon", "authenticated"]) await assert.rejects(asRole(role, salesId, `select consume_admin_login_attempt('${hash}')`), /permission denied/);
  const attempts = [];
  for (let i = 0; i < 7; i++) attempts.push((await asRole("service_role", null, `select consume_admin_login_attempt('${hash}') as allowed`)).rows[0].allowed);
  assert.deepEqual(attempts, [true, true, true, true, true, false, false]);
  assert.equal((await db.query("select attempts from admin_login_limits where bucket='global'")).rows[0].attempts, 5);
  await db.exec("update admin_login_limits set window_started_at=now()-interval '16 minutes'");
  assert.equal((await asRole("service_role", null, `select consume_admin_login_attempt('${hash}') as allowed`)).rows[0].allowed, true);
});

test("global throttle also stops attempts distributed across IP addresses", async () => {
  await db.exec("truncate admin_login_limits");
  const decisions = [];
  for (let i = 0; i < 32; i++) decisions.push((await asRole("service_role", null, `select consume_admin_login_attempt('${i.toString(16).padStart(64, "0")}') as allowed`)).rows[0].allowed);
  assert.equal(decisions.filter(Boolean).length, 30);
  assert.deepEqual(decisions.slice(-2), [false, false]);
});

async function loadTs(file, replacements) {
  const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const testModule = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => name in replacements ? replacements[name] : require(name), testModule, testModule.exports);
  return testModule.exports;
}

test("login never sends real credentials without rate limit and CAPTCHA enforcement", async () => {
  let attempt = "allowed", captcha = true, signIns = 0;
  const redirects = [];
  const actions = await loadTs("app/admin/login/actions.ts", {
    "next/navigation": { redirect: (url) => { redirects.push(url); throw new Error(`redirect:${url}`); } },
    "@/lib/admin-security": {
      getAdminLoginConfiguration: () => ({ username: "sales", email: "sales@example.invalid" }),
      consumeAdminLoginAttempt: async () => attempt,
      isAuthCaptchaEnforced: async () => captcha,
    },
    "@/lib/supabase/server": { createClient: async () => ({ auth: { signInWithPassword: async () => { signIns++; return { error: { code: "invalid_credentials" }, data: {} }; } } }) },
  });
  const form = new FormData();
  form.set("username", "sales"); form.set("password", "some-password"); form.set("captchaToken", "test-token");
  for (const limit of ["rate-limited", "unavailable"]) {
    attempt = limit;
    await assert.rejects(actions.loginAdmin(form), new RegExp(`error=${limit}`));
  }
  attempt = "allowed"; captcha = false;
  await assert.rejects(actions.loginAdmin(form), /error=unavailable/);
  captcha = true; form.delete("captchaToken");
  await assert.rejects(actions.loginAdmin(form), /error=invalid/);
  assert.equal(signIns, 0);
  form.set("captchaToken", "test-token");
  await assert.rejects(actions.loginAdmin(form), /error=invalid/);
  assert.equal(signIns, 1);
  assert.equal(redirects.length, 5);
});

test("admin guard rejects missing, expired and owner sessions", async () => {
  let user = { id: salesId, last_sign_in_at: new Date().toISOString() };
  let role = "sales";
  let fresh = true;
  const query = { select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: { id: salesId, username: "sales", role } }; } };
  const guard = await loadTs("lib/admin-auth.ts", {
    "server-only": {},
    "next/navigation": { redirect: (url) => { throw new Error(`redirect:${url}`); } },
    "@/lib/admin-security": { hasFreshAdminSession: async () => fresh, getAdminLoginConfiguration: () => ({}) },
    "@/lib/supabase/server": { createClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) }, from: () => query }) },
  });
  assert.ok(await guard.getAdmin());
  role = "owner"; assert.equal(await guard.getAdmin(), null);
  role = "sales"; fresh = false;
  assert.equal(await guard.getAdmin(), null);
  user = null;
  await assert.rejects(guard.requireAdmin(), /redirect:\/admin\/login/);
});

test("catalog server actions reauthorize direct requests before touching the database", async () => {
  let calls = 0;
  const actions = await loadTs("app/admin/actions.ts", {
    "next/navigation": { redirect: (url) => { throw new Error(url); } },
    "next/cache": { revalidatePath: () => {} },
    "@/lib/admin-auth": { requireAdmin: async () => { calls++; throw new Error("Unauthorized"); } },
    "@/lib/supabase/server": { createClient: () => { throw new Error("Database should not be reached"); } },
    "@/lib/admin-security": { clearAdminSession: async () => {} },
    "@/lib/template-status": { isTemplateStatus: () => true },
  });
  for (const action of [actions.setTemplateStatus, actions.setTemplateVisibility]) await assert.rejects(action({},new FormData()), /Unauthorized/);
  assert.equal(calls,2);
});

test("untrusted forwarding headers cannot evade the login bucket", async () => {
  const keys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "ADMIN_USERNAME", "ADMIN_AUTH_EMAIL", "VERCEL"];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    Object.assign(process.env, { NEXT_PUBLIC_SUPABASE_URL: "https://qa.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "qa", SUPABASE_SECRET_KEY: "qa-secret", NEXT_PUBLIC_TURNSTILE_SITE_KEY: "0xQA", ADMIN_USERNAME: "sales", ADMIN_AUTH_EMAIL: "qa@example.invalid" });
    delete process.env.VERCEL;
    let supplied = new Headers({ "x-forwarded-for": "1.2.3.4", "x-vercel-forwarded-for": "2.3.4.5" });
    const hashes = [];
    const security = await loadTs("lib/admin-security.ts", {
      "server-only": {},
      "@/lib/supabase/admin-cookie-options": { adminCookieOptions: {} },
      "next/headers": { headers: async () => supplied },
      "@supabase/supabase-js": { createClient: () => ({ rpc: async (_name, data) => { hashes.push(data.ip_hash); return { data: true }; } }) },
    });
    assert.equal(await security.consumeAdminLoginAttempt(), "allowed");
    supplied = new Headers({ "x-forwarded-for": "9.8.7.6", "x-vercel-forwarded-for": "8.7.6.5" });
    await security.consumeAdminLoginAttempt();
    assert.equal(hashes[0], hashes[1]);
    process.env.VERCEL = "1";
    await security.consumeAdminLoginAttempt();
    assert.notEqual(hashes[1], hashes[2]);
  } finally {
    for (const key of keys) { if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key]; }
  }
});

test("signed session boundary cannot be extended, forged or reused by another user", async () => {
  const previous = process.env.SUPABASE_SECRET_KEY;
  const now = Date.now;
  const values = new Map();
  const savedConfig = {};
  for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "ADMIN_USERNAME", "ADMIN_AUTH_EMAIL"]) savedConfig[key] = process.env[key];
  try {
    Object.assign(process.env, { SUPABASE_SECRET_KEY: "qa-secret", NEXT_PUBLIC_SUPABASE_URL: "https://qa.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "qa", NEXT_PUBLIC_TURNSTILE_SITE_KEY: "0xQA", ADMIN_USERNAME: "sales", ADMIN_AUTH_EMAIL: "qa@example.invalid" });
    const security = await loadTs("lib/admin-security.ts", {
      "server-only": {},
      "@/lib/supabase/admin-cookie-options": { adminCookieOptions: { path: "/admin", httpOnly: true, sameSite: "strict", maxAge: 28800 } },
      "next/headers": { cookies: async () => ({ set: (key, value) => values.set(key,value), get: (key) => ({ value: values.get(key) }) }) },
    });
    assert.equal(await security.hasFreshAdminSession(salesId), false);
    await security.startAdminSession(salesId);
    assert.equal(await security.hasFreshAdminSession(salesId), true);
    assert.equal(await security.hasFreshAdminSession(ownerId), false);
    const original = values.get("indif-sales-session");
    values.set("indif-sales-session", `9999999999999.${original.split(".")[1]}`);
    assert.equal(await security.hasFreshAdminSession(salesId), false);
    values.set("indif-sales-session", original);
    Date.now = () => now() + 9 * 3600_000;
    assert.equal(await security.hasFreshAdminSession(salesId), false);
    Date.now = now;
    await security.clearAdminSession();
    assert.equal(await security.hasFreshAdminSession(salesId), false);
  } finally {
    Date.now = now;
    if (previous === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = previous;
    for (const [key,value] of Object.entries(savedConfig)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test("legacy catalog registration is repeatable and preserves existing archived templates and invitations", async () => {
  const before = (await db.query("select (select count(*) from invitations)::int as invitations, (select count(*) from rsvps)::int as rsvps")).rows[0];
  await db.exec("insert into templates(slug,name,is_active,catalog_status) values ('sunda-vibes','Existing Sunda title',false,'maintenance')");
  const seed = await migration("20261102123000_register_legacy_sales_templates");
  await db.exec(seed);
  await db.exec(seed);
  const registered = await db.query("select slug,name,is_active,catalog_status from templates where slug in ('sunda-vibes','mustard-black') order by slug");
  assert.equal(registered.rows.length,2);
  assert.equal(registered.rows[0].slug,"mustard-black");
  assert.equal(registered.rows[0].is_active,true);
  assert.equal(registered.rows[1].name,"Existing Sunda title");
  assert.equal(registered.rows[1].is_active,false);
  assert.equal(registered.rows[1].catalog_status,"maintenance");
  const after = (await db.query("select (select count(*) from invitations)::int as invitations, (select count(*) from rsvps)::int as rsvps")).rows[0];
  assert.deepEqual(after,before);
});
