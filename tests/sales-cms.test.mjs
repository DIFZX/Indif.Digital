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
const salesTwoId = "44444444-4444-4444-8444-444444444444";
let db;
const migration = (name) => readFile(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), "utf8");

before(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz);
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
  await db.exec(await migration("20261108120000_add_private_share_message"));
  await db.exec(await migration("20261102120000_sales_cms_and_login_protection"));
  await db.exec(await migration("20261102133000_support_multiple_sales_admins"));
  await db.exec("insert into templates(slug,name,is_active) values ('java-vibes','Java Vibes',false),('blue-garden','Blue Garden',false)");
  await db.exec(await migration("20261102143000_add_catalog_prices_and_categories"));
  await db.exec(`
    insert into auth.users(id,email,email_confirmed_at) values
      ('${salesId}','sales@example.invalid',now()), ('${ownerId}','owner@example.invalid',now()),
      ('${strangerId}','stranger@example.invalid',now()), ('${salesTwoId}','sales-two@example.invalid',now());
    insert into admin_profiles(id,username,role) values ('${salesId}','sales','sales'), ('${ownerId}','owner','owner'), ('${salesTwoId}','SalesTwo','sales');
    insert into rsvps(invitation_id,guest_name,attendance) select id,'Private RSVP','attending' from invitations limit 1;
    insert into greetings(invitation_id,guest_name,message) select id,'Private greeting','Private message' from invitations limit 1;
    insert into invitation_views(invitation_id,visitor_id) select id,'${salesId}' from invitations limit 1;
    insert into templates(slug,name,is_active) values ('draft-only','Draft only',false);
    insert into invitations(template_id,slug,status,bride_name,bride_short_name,groom_name,groom_short_name,event_date,ceremony_time,reception_time,venue_name,venue_address,opening_text,cover_path)
    values ((select id from templates where slug='draft-only'),'private-draft','draft','A','A','B','B','2027-01-01','08:00','10:00','Venue','Address','Hello','/media/test.webp');
  `);
});

test("private username resolution supports multiple sales admins and case-insensitive login", async () => {
  for (const [username,id] of [[" SALES ",salesId],["salestwo",salesTwoId],["SALESTWO",salesTwoId]]) {
    const result = await asRole("service_role", null, `select user_id from resolve_sales_admin_login('${username}')`);
    assert.equal(result.rows[0].user_id,id);
  }
  for (const role of ["anon","authenticated"]) {
    await assert.rejects(asRole(role,salesId,"select * from resolve_sales_admin_login('sales')"),/permission denied/);
  }
});

test("owner, unknown and unconfirmed accounts cannot resolve as sales logins", async () => {
  for (const username of ["owner","stranger","not-existing"]) {
    assert.equal((await asRole("service_role",null,`select * from resolve_sales_admin_login('${username}')`)).rows.length,0);
  }
  await db.exec(`update auth.users set email_confirmed_at=null where id='${salesTwoId}'`);
  assert.equal((await asRole("service_role",null,"select * from resolve_sales_admin_login('SalesTwo')")).rows.length,0);
  await db.exec(`update auth.users set email_confirmed_at=now() where id='${salesTwoId}'`);
});

test("administrator usernames cannot differ only by letter case", async () => {
  await assert.rejects(db.exec(`insert into admin_profiles(id,username,role) values ('${strangerId}','SALES','sales')`),/unique constraint/);
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

async function loadDashboardAccessRoute(createClient) {
  const access = await loadTs("lib/client-dashboard-access.ts", {
    "server-only": {},
    "next/headers": {},
    "next/navigation": {},
    "@/lib/invitations": {},
    "@/lib/supabase/server": {},
  });
  return loadTs("app/[slug]/dashboard/access/route.ts", {
    "@/lib/client-dashboard-access": access,
    "@/lib/supabase/server": { createClient },
  });
}

test("dashboard links are reusable, set a scoped Lax cookie, and reject a different invitation's key", async () => {
  const { NextRequest } = require("next/server");
  const access = (await db.query("select i.slug,a.access_token from invitations i join invitation_dashboard_access a on a.invitation_id=i.id where i.status='published' limit 1")).rows[0];
  const route = await loadDashboardAccessRoute(async () => ({
    async rpc(name, args) {
      assert.equal(name, "verify_invitation_dashboard_access");
      await db.exec("set role anon");
      try {
        const result = await db.query("select verify_invitation_dashboard_access($1,$2) as valid", [args.target_slug, args.dashboard_token]);
        return { data: result.rows[0].valid, error: null };
      } finally { await db.exec("reset role"); }
    },
  }));
  const base = "https://inv.example.invalid";
  for (let visit = 0; visit < 2; visit++) {
    const response = await route.GET(new NextRequest(`${base}/${access.slug}/dashboard/access?key=${access.access_token}`), { params: Promise.resolve({ slug: access.slug }) });
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), `${base}/${access.slug}/dashboard`);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    const cookie = response.cookies.get(`indif-dashboard-${access.slug}`);
    assert.equal(cookie.value, access.access_token);
    assert.equal(cookie.path, `/${access.slug}/dashboard`);
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, process.env.NODE_ENV === "production");
    assert.equal(cookie.sameSite, "lax", "External top-level links must retain access during the redirect");
    assert.equal(cookie.maxAge, 60 * 60 * 24 * 180);
    assert.match(response.headers.get("set-cookie"), /SameSite=lax/i);
  }
  const denied = await route.GET(new NextRequest(`${base}/private-draft/dashboard/access?key=${access.access_token}`), { params: Promise.resolve({ slug: "private-draft" }) });
  assert.equal(denied.headers.get("location"), `${base}/private-draft/dashboard/access-required?error=invalid`);
  assert.equal(denied.headers.get("set-cookie"), null);
});

test("dashboard entry never sets access cookies for missing, malformed, rejected or unverifiable keys", async () => {
  const { NextRequest } = require("next/server");
  let verifications = 0, result = { data: false, error: null };
  const route = await loadDashboardAccessRoute(async () => ({
    async rpc() { verifications++; return result; },
  }));
  const base = "https://inv.example.invalid/netflix/dashboard";
  async function expectDenied(query) {
    const response = await route.GET(new NextRequest(`${base}/access${query}`), { params: Promise.resolve({ slug: "netflix" }) });
    assert.equal(response.headers.get("location"), `${base}/access-required?error=invalid`);
    assert.equal(response.headers.get("set-cookie"), null);
  }
  for (const query of ["", "?key=", "?key=not-a-private-key"]) await expectDenied(query);
  assert.equal(verifications, 0);
  await expectDenied(`?key=${strangerId}`);
  result = { data: true, error: { message: "Verification unavailable" } };
  await expectDenied(`?key=${strangerId}`);
  assert.equal(verifications, 2);
});

test("login never sends real credentials without rate limit and CAPTCHA enforcement", async () => {
  let attempt = "allowed", captcha = true, signIns = 0;
  let identity = { status: "found", userId: salesId, email: "sales@example.invalid" };
  const redirects = [];
  const actions = await loadTs("app/admin/login/actions.ts", {
    "next/navigation": { redirect: (url) => { redirects.push(url); throw new Error(`redirect:${url}`); } },
    "@/lib/admin-security": {
      getAdminLoginConfiguration: () => ({ username: "sales", email: "sales@example.invalid" }),
      consumeAdminLoginAttempt: async () => attempt,
      isAuthCaptchaEnforced: async () => captcha,
      resolveAdminLogin: async () => identity,
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
  identity = { status: "unavailable" };
  await assert.rejects(actions.loginAdmin(form), /error=unavailable/);
  assert.equal(signIns,0);
  identity = { status: "found", userId: salesId, email: "sales@example.invalid" };
  await assert.rejects(actions.loginAdmin(form), /error=invalid/);
  assert.equal(signIns, 1);
  assert.equal(redirects.length, 6);
});

test("login authenticates both registered usernames with the corresponding provider identity", async () => {
  const identities = {
    firstadmin: { userId: salesId, username: "FirstAdmin", email: "first@example.invalid" },
    secondadmin: { userId: salesTwoId, username: "SecondAdmin", email: "second@example.invalid" },
  };
  let active;
  const sessions = [], signIns = [];
  const query = { select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: { id: active.userId, username: active.username, role: "sales" } }; } };
  const actions = await loadTs("app/admin/login/actions.ts", {
    "next/navigation": { redirect: (url) => { throw new Error(`redirect:${url}`); } },
    "@/lib/admin-security": {
      getAdminLoginConfiguration: () => ({}), consumeAdminLoginAttempt: async () => "allowed", isAuthCaptchaEnforced: async () => true,
      resolveAdminLogin: async (username) => ({ status: "found", ...identities[username.toLowerCase()] }),
      startAdminSession: async (id) => sessions.push(id),
    },
    "@/lib/supabase/server": { createClient: async () => ({
      auth: { signInWithPassword: async (credentials) => { signIns.push(credentials); active = Object.values(identities).find(identity => identity.email===credentials.email); return { data: { user: { id: active.userId } }, error: null }; } },
      from: () => query,
    }) },
  });
  for (const username of ["firstadmin","SECONDADMIN"]) {
    const form = new FormData(); form.set("username",username); form.set("password","test-password-only"); form.set("captchaToken","verified-test-token");
    await assert.rejects(actions.loginAdmin(form),/redirect:\/admin$/);
  }
  assert.deepEqual(sessions,[salesId,salesTwoId]);
  assert.deepEqual(signIns.map(credentials=>credentials.email),["first@example.invalid","second@example.invalid"]);
  assert.ok(signIns.every(credentials=>credentials.options.captchaToken==="verified-test-token"));
});

test("a resolved username cannot sign in as a different provider user", async () => {
  let signedOut = false, sessionIssued = false;
  const query = { select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: { username: "sales", role: "sales" } }; } };
  const actions = await loadTs("app/admin/login/actions.ts", {
    "next/navigation": { redirect: (url) => { throw new Error(url); } },
    "@/lib/admin-security": {
      getAdminLoginConfiguration: () => ({}), consumeAdminLoginAttempt: async () => "allowed", isAuthCaptchaEnforced: async () => true,
      resolveAdminLogin: async () => ({ status: "found", userId: salesId, email: "sales@example.invalid" }),
      startAdminSession: async () => { sessionIssued=true; },
    },
    "@/lib/supabase/server": { createClient: async () => ({
      auth: { signInWithPassword: async () => ({ data: { user: { id: salesTwoId } } }), signOut: async () => { signedOut=true; } }, from: () => query,
    }) },
  });
  const form = new FormData(); form.set("username","sales"); form.set("password","test-password-only"); form.set("captchaToken","test-token");
  await assert.rejects(actions.loginAdmin(form),/error=invalid/);
  assert.equal(signedOut,true); assert.equal(sessionIssued,false);
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
    "@/lib/template-status": { TEMPLATE_STATUSES: ["available", "maintenance", "in_progress"] },
    "@/lib/catalog-settings": { MAX_TEMPLATE_PRICE: 1_000_000_000, TEMPLATE_CATEGORY_IDS: ["spesial", "animasi", "minimalis"] },
  });
  await assert.rejects(actions.saveTemplateSettings({},new FormData()), /Unauthorized/);
  assert.equal(calls,1);
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

test("price migration preserves public prices and categories, including archived templates", async () => {
  const rows = (await db.query("select slug,category,price,promo_price from templates where slug in ('java-vibes','blue-garden','greeny-flowers') order by slug")).rows;
  assert.deepEqual(rows, [
    { slug: "blue-garden", category: "animasi", price: 100000, promo_price: 50000 },
    { slug: "greeny-flowers", category: "minimalis", price: 70000, promo_price: 35000 },
    { slug: "java-vibes", category: "spesial", price: 120000, promo_price: 80000 },
  ]);
});

test("sales can save prices and move categories; audit includes actor and full before/after settings", async () => {
  const before = (await db.query("select category,price,promo_price from templates where slug='greeny-flowers'")).rows[0];
  await asRole("authenticated", salesId, "update templates set category='spesial',price=155000,promo_price=95000 where slug='greeny-flowers'");
  const audit = (await db.query("select actor_id,previous_state,next_state from template_catalog_events order by id desc limit 1")).rows[0];
  assert.equal(audit.actor_id, salesId);
  for (const key of ["category","price","promo_price"]) assert.equal(audit.previous_state[key],before[key]);
  assert.equal(audit.next_state.category,"spesial");
  assert.equal(audit.next_state.price,155000);
  assert.equal(audit.next_state.promo_price,95000);
  const customerBefore = (await db.query("select (select jsonb_agg(i) from invitations i) as invitations,(select jsonb_agg(r) from rsvps r) as rsvps,(select jsonb_agg(a) from invitation_dashboard_access a) as access")).rows[0];
  await asRole("authenticated", salesTwoId, "update templates set category='minimalis' where slug='greeny-flowers'");
  const publicRow = (await asRole("anon",null,"select category,price,promo_price from templates where slug='greeny-flowers' and is_active")).rows[0];
  assert.deepEqual(publicRow,{category:"minimalis",price:155000,promo_price:95000});
  const customerAfter = (await db.query("select (select jsonb_agg(i) from invitations i) as invitations,(select jsonb_agg(r) from rsvps r) as rsvps,(select jsonb_agg(a) from invitation_dashboard_access a) as access")).rows[0];
  assert.deepEqual(customerAfter,customerBefore);
});

test("new catalog fields enforce sales-only writes and database price constraints", async () => {
  await assert.rejects(asRole("anon",null,"update templates set category='spesial',price=90000,promo_price=null"),/permission denied/);
  const stranger = await asRole("authenticated",strangerId,"update templates set category='spesial',price=90000,promo_price=null returning id");
  assert.equal(stranger.rows.length,0);
  for (const patch of ["category='other'","price=-1,promo_price=null","price=1000000001,promo_price=null","price=50000,promo_price=60000","promo_price=-1"]) {
    await assert.rejects(asRole("authenticated",salesId,`update templates set ${patch} where slug='greeny-flowers'`),/check constraint/,patch);
  }
  await asRole("authenticated",salesId,"update templates set promo_price=null where slug='greeny-flowers'");
  assert.equal((await asRole("anon",null,"select promo_price from templates where slug='greeny-flowers'")).rows[0].promo_price,null);
});

test("versioned writes prevent one sales admin overwriting another admin's newer settings", async () => {
  const current = (await db.query("select id,updated_at::text as version from templates where slug='greeny-flowers'")).rows[0];
  await asRole("authenticated",salesTwoId,"update templates set price=160000 where slug='greeny-flowers'");
  const stale = await asRole("authenticated",salesId,`update templates set price=1 where id='${current.id}' and updated_at='${current.version}' returning id`);
  assert.equal(stale.rows.length,0);
  assert.equal((await db.query("select price from templates where slug='greeny-flowers'")).rows[0].price,160000);
});

test("settings action validates untrusted form fields, uses a version guard and only saves allowed fields", async () => {
  let writes = 0, patch, result = { data: {id:salesId},error:null };
  const filters = [], paths = [];
  const query = { update(value) { writes++; patch=value; return this; }, eq(key,value) { filters.push([key,value]); return this; }, select() { return this; }, async maybeSingle() { return result; } };
  const actions = await loadTs("app/admin/actions.ts", {
    "next/navigation": { redirect: () => {} }, "next/cache": { revalidatePath: (path) => paths.push(path) },
    "@/lib/admin-auth": { requireAdmin: async () => ({supabase:{from:() => query}}) },
    "@/lib/supabase/server": {}, "@/lib/admin-security": {},
    "@/lib/template-status": { TEMPLATE_STATUSES: ["available","maintenance","in_progress"] },
    "@/lib/catalog-settings": { MAX_TEMPLATE_PRICE:1_000_000_000,TEMPLATE_CATEGORY_IDS:["spesial","animasi","minimalis","interactive"] },
  });
  const valid = { templateId:salesId,updatedAt:"2026-11-02T01:00:00.123456+00:00",category:"minimalis",price:"150000",promoPrice:"90000",catalogStatus:"maintenance",intent:"save" };
  const form = (overrides={}) => { const data = new FormData(); for(const [key,value] of Object.entries({...valid,...overrides})) data.set(key,value); return data; };
  for (const invalid of [{price:"-1"},{price:"12.5"},{price:"1e5"},{price:"1000000001"},{price:""},{promoPrice:"150001"},{promoPrice:"-1"},{category:"admin"},{catalogStatus:"other"},{intent:"delete"},{templateId:"invalid"},{updatedAt:"invalid"}]) {
    assert.ok((await actions.saveTemplateSettings({},form(invalid))).error,JSON.stringify(invalid));
  }
  assert.equal(writes,0);
  const extra = form(); extra.set("name","Unauthorized rename"); extra.set("is_active","false");
  assert.equal((await actions.saveTemplateSettings({},extra)).success,true);
  assert.deepEqual(patch,{category:"minimalis",price:150000,promo_price:90000,catalog_status:"maintenance"});
  assert.deepEqual(filters,[["id",salesId],["updated_at",valid.updatedAt]]);
  assert.deepEqual(paths,["/admin","/"]);
  await actions.saveTemplateSettings({},form({intent:"archive",promoPrice:""}));
  assert.equal(patch.is_active,false); assert.equal(patch.promo_price,null);
  await actions.saveTemplateSettings({},form({intent:"restore"})); assert.equal(patch.is_active,true);
  assert.equal((await actions.saveTemplateSettings({},form({category:"interactive"}))).success,true);
  assert.equal(patch.category,"interactive");
  result = {data:null,error:null}; assert.match((await actions.saveTemplateSettings({},form())).error,/admin lain/);
  result = {data:null,error:{message:"sensitive database detail"}};
  const failure = await actions.saveTemplateSettings({},form()); assert.match(failure.error,/belum berhasil/); assert.ok(!failure.error.includes("sensitive"));
});

test("catalog discounts reflect actual prices and omit misleading discounts for no-promo or equal prices", async () => {
  const {getCatalogPriceInfo} = await loadTs("lib/catalog-settings.ts", {"@/lib/media":{resolveMediaUrl:value=>value}});
  assert.deepEqual(getCatalogPriceInfo(150000,null),{currentPrice:"Rp 150.000",originalPrice:null,discountBadge:null});
  assert.deepEqual(getCatalogPriceInfo(150000,150000),{currentPrice:"Rp 150.000",originalPrice:null,discountBadge:null});
  assert.deepEqual(getCatalogPriceInfo(0,null),{currentPrice:"Rp 0",originalPrice:null,discountBadge:null});
  assert.deepEqual(getCatalogPriceInfo(0,0),{currentPrice:"Rp 0",originalPrice:null,discountBadge:null});
  assert.deepEqual(getCatalogPriceInfo(100000,75000),{currentPrice:"Rp 75.000",originalPrice:"Rp 100.000",discountBadge:"DISC. 25%"});
});

test("Sunda registration creates an isolated RSVP dashboard and preserves existing data, catalog settings and shared keys on reapplication", async () => {
  // Bring this deliberately small fixture up to the existing invitation-content schema.
  await db.exec(await migration("20260819145200_add_invitation_profile_path"));
  await db.exec("alter table invitations add column bride_photo_path text, add column groom_photo_path text");
  await db.exec(await migration("20260819172828_add_invitation_story_image_path"));
  await db.exec(await migration("20260820103657_add_invitation_custom_texts"));
  const snapshot=async()=> (await db.query("select (select jsonb_agg(t order by id) from templates t) as templates,(select jsonb_agg(i order by id) from invitations i where slug<>'sunda-vibes') as invitations,(select jsonb_agg(r order by id) from rsvps r) as rsvps,(select jsonb_agg(g order by id) from greetings g) as greetings,(select jsonb_agg(a order by invitation_id) from invitation_dashboard_access a) as access")).rows[0];
  const before=await snapshot();
  const registration=await migration("20261103090000_register_sunda_vibes_invitation");
  await db.exec(registration);
  const invitation=(await db.query("select * from invitations where slug='sunda-vibes'")).rows[0];
  const access=(await db.query(`select access_token from invitation_dashboard_access where invitation_id='${invitation.id}'`)).rows[0];
  assert.equal(invitation.id,"00000000-0000-0000-0000-000000000107");
  assert.equal(invitation.status,"published");
  assert.equal(invitation.bride_short_name,"Dita");
  assert.equal(invitation.groom_short_name,"Fajar");
  assert.equal(invitation.bride_photo_path,"/media/sunda-vibes/The Bride.jpg");
  assert.equal(invitation.music_path,"/media/sunda-vibes/audio.mp3");
  assert.ok(access.access_token);
  const after=await snapshot();
  assert.deepEqual({...after,access:before.access},{...before});
  const originalKeys=(await db.query("select jsonb_agg(a order by invitation_id) as access from invitation_dashboard_access a where invitation_id<>(select id from invitations where slug='sunda-vibes')")).rows[0].access;
  assert.deepEqual(originalKeys,before.access);
  assert.equal((await asRole("anon",null,`select verify_invitation_dashboard_access('sunda-vibes','${access.access_token}') as valid`)).rows[0].valid,true);
  const dashboard=(await asRole("anon",null,`select get_invitation_dashboard_data('${invitation.id}','${access.access_token}') as data`)).rows[0].data;
  assert.deepEqual(dashboard.rsvps,[]);
  assert.deepEqual(dashboard.greetings,[]);
  assert.equal((await asRole("anon",null,`select get_invitation_dashboard_data('${invitation.id}','invalid-token') as data`)).rows[0].data,null);
  await asRole("anon",null,`insert into rsvps(invitation_id,guest_name,attendance,guest_count) values ('${invitation.id}','Sunda test guest','attending',2)`);
  await assert.rejects(asRole("anon",null,"select * from rsvps"),/permission denied/);
  const privateData=(await asRole("anon",null,`select get_invitation_dashboard_data('${invitation.id}','${access.access_token}') as data`)).rows[0].data;
  assert.equal(privateData.rsvps.length,1);assert.equal(privateData.rsvps[0].guest_count,2);
  await db.exec("update invitations set venue_name='Owner updated venue' where slug='sunda-vibes'");
  await db.exec(registration);
  assert.equal((await db.query("select venue_name from invitations where slug='sunda-vibes'")).rows[0].venue_name,"Owner updated venue");
  assert.equal((await db.query(`select access_token from invitation_dashboard_access where invitation_id='${invitation.id}'`)).rows[0].access_token,access.access_token);
  assert.equal((await db.query(`select count(*)::int as count from rsvps where invitation_id='${invitation.id}'`)).rows[0].count,1);
  assert.deepEqual((await snapshot()).templates,before.templates);
});

test("Adventure Wedding Pixel copies Sunda content, isolates RSVP, and keeps catalog activation and shared keys intact", async () => {
  const registration = await migration("20261107090000_add_adventure_wedding_pixel");
  const source = (await db.query("select * from invitations where slug='sunda-vibes'")).rows[0];
  const existing = (await db.query("select jsonb_agg(a order by invitation_id) as keys from invitation_dashboard_access a")).rows[0].keys;
  await db.exec(registration);
  const invitation = (await db.query("select * from invitations where slug='adventure-wedding-pixel'")).rows[0];
  const template = (await db.query("select * from templates where slug='adventure-wedding-pixel'")).rows[0];
  const key = (await db.query("select access_token from invitation_dashboard_access where invitation_id=$1", [invitation.id])).rows[0].access_token;
  assert.equal(invitation.id, "00000000-0000-0000-0000-000000000110");
  assert.equal(invitation.template_id, template.id);
  assert.equal(template.is_active, true);
  assert.equal(template.catalog_status, "available");
  for (const field of ["bride_name", "bride_short_name", "bride_parents", "bride_photo_path", "groom_name", "groom_short_name", "groom_parents", "groom_photo_path", "event_date", "ceremony_time", "reception_time", "venue_name", "venue_address", "maps_url", "opening_text", "quote_text", "quote_source", "story", "story_image_path", "cover_path", "profile_path", "gallery_paths", "music_path", "gift_info", "closing_text", "closing_greeting"]) {
    assert.deepEqual(invitation[field], source[field], field);
  }
  assert.deepEqual((await db.query("select jsonb_agg(a order by invitation_id) as keys from invitation_dashboard_access a where invitation_id<>$1", [invitation.id])).rows[0].keys, existing);
  assert.equal((await asRole("anon", null, "select t.slug from templates t join invitations i on t.id=i.template_id where i.slug='adventure-wedding-pixel'")).rows.length, 1);
  assert.equal((await asRole("anon", null, `select verify_invitation_dashboard_access('adventure-wedding-pixel','${key}') as valid`)).rows[0].valid, true);
  await db.query("update invitations set bride_short_name='Owner edit' where id=$1", [invitation.id]);
  await db.exec(registration);
  assert.equal((await db.query("select bride_short_name from invitations where id=$1", [invitation.id])).rows[0].bride_short_name, "Owner edit");
  assert.equal((await db.query("select access_token from invitation_dashboard_access where invitation_id=$1", [invitation.id])).rows[0].access_token, key);
  await db.query("update invitations set bride_short_name=$1 where id=$2", [source.bride_short_name, invitation.id]);
});

test("Interactive migration publishes the category without changing other catalog entries or dashboard keys", async () => {
  const snapshot = async () => (await db.query("select slug,category,is_active,catalog_status,price,promo_price from templates where slug<>'adventure-wedding-pixel' order by slug")).rows;
  const before = await snapshot();
  const access = (await db.query("select jsonb_agg(a order by invitation_id) as keys from invitation_dashboard_access a")).rows[0].keys;
  const sql = await migration("20261108090000_add_interactive_catalog_category");
  await db.exec(sql);
  await db.exec(sql);
  const theme = (await asRole("anon",null,"select category,is_active,catalog_status from templates where slug='adventure-wedding-pixel'")).rows[0];
  assert.deepEqual(theme,{category:"interactive",is_active:true,catalog_status:"available"});
  assert.deepEqual(await snapshot(), before);
  assert.deepEqual((await db.query("select jsonb_agg(a order by invitation_id) as keys from invitation_dashboard_access a")).rows[0].keys,access);
  await assert.rejects(asRole("anon",null,"update templates set category='interactive' where slug='adventure-wedding-pixel'"),/permission denied/);
  await asRole("authenticated",salesId,"update templates set category='minimalis' where slug='adventure-wedding-pixel'");
  await asRole("authenticated",salesId,"update templates set category='interactive' where slug='adventure-wedding-pixel'");
  const audit=(await db.query("select actor_id from template_catalog_events where template_id='00000000-0000-0000-0000-000000000010' order by id desc limit 1")).rows[0];
  assert.equal(audit.actor_id,salesId);
  const {isTemplateCategory,TEMPLATE_CATEGORY_LABELS}=await loadTs("lib/catalog-settings.ts",{"@/lib/media":{resolveMediaUrl:value=>value}});
  assert.equal(isTemplateCategory("interactive"),true);
  assert.equal(TEMPLATE_CATEGORY_LABELS.interactive,"Interactive");
});

test("Pixel RSVP uses the real API handler, persists both attendance states, and is read only through its private dashboard token", async () => {
  await db.exec(await migration("20260820171050_enable_auto_approve_greetings"));
  const invitationId = "00000000-0000-0000-0000-000000000110";
  const sourceCount = (await db.query("select count(*)::int as count from rsvps where invitation_id<>$1", [invitationId])).rows[0].count;
  async function anonymousQuery(sql, params) {
    await db.exec("set role anon");
    try { return await db.query(sql, params); } finally { await db.exec("reset role"); }
  }
  const client = {
    from(table) {
      assert.ok(["invitations", "rsvps", "greetings"].includes(table));
      let record = null, filter = null, columns = "*";
      const run = async () => {
        try {
          let rows;
          if (record) {
            const entries = Object.entries(record);
            const returning = table === "greetings" ? ` returning ${columns}` : "";
            rows = (await anonymousQuery(`insert into ${table}(${entries.map(([name]) => name).join(",")}) values(${entries.map((_, index) => `$${index + 1}`).join(",")})${returning}`, entries.map(([, value]) => value))).rows;
          } else rows = (await anonymousQuery(`select ${columns} from ${table} where ${filter[0]}=$1`, [filter[1]])).rows;
          return { data: rows[0] ?? null, error: null };
        } catch (error) { return { data: null, error }; }
      };
      return { select(value) { columns = value; return this; }, eq(column, value) { filter = [column, value]; return this; }, insert(value) { record = value; return this; }, maybeSingle: run, single: run, then(resolve, reject) { return run().then(resolve, reject); } };
    },
    async rpc(name, args) {
      assert.equal(name, "get_invitation_dashboard_data");
      return { data: (await anonymousQuery("select get_invitation_dashboard_data($1,$2) as payload", [args.target_invitation_id, args.dashboard_token])).rows[0].payload, error: null };
    },
  };
  const api = await loadTs("app/api/guest-response/route.ts", { "@/lib/supabase": { getSupabase: () => client } });
  for (const [name, attendance, guestCount] of [["Pixel guest attending", "attending", 3], ["Pixel guest absent", "not_attending", 7]]) {
    const response = await api.POST(new Request("http://localhost/api/guest-response", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId, guestName: name, attendance, guestCount, message: `A real local SQL test for ${name}.` }) }));
    assert.equal(response.status, 201);
    assert.equal((await response.json()).greeting.guest_name, name);
  }
  const key = (await db.query("select access_token from invitation_dashboard_access where invitation_id=$1", [invitationId])).rows[0].access_token;
  const loader = await loadTs("lib/invitations.ts", { "@/lib/demo": { demoInvitations: [], demoGreetings: [], javaVibesDemoGreetings: [] }, "@/lib/supabase": { getSupabase: () => client } });
  const dashboard = await loader.getInvitationDashboardData(invitationId, key, client);
  assert.equal(dashboard.initialRSVPs.length, 2);
  assert.equal(dashboard.initialRSVPs.find(row => row.attendance === "attending").guest_count, 3);
  assert.equal(dashboard.initialRSVPs.find(row => row.attendance === "not_attending").guest_count, 0);
  assert.ok(dashboard.initialRSVPs.every(row => row.invitation_id === invitationId && row.message.includes("real local SQL")));
  assert.equal(await loader.getInvitationDashboardData(invitationId, "invalid", client), null);
  const sundaKey = (await db.query("select access_token from invitation_dashboard_access where invitation_id='00000000-0000-0000-0000-000000000107'")).rows[0].access_token;
  assert.equal(await loader.getInvitationDashboardData(invitationId, sundaKey, client), null);
  await assert.rejects(anonymousQuery("select * from rsvps", []), /permission denied/);
  assert.equal((await db.query("select count(*)::int as count from rsvps where invitation_id<>$1", [invitationId])).rows[0].count, sourceCount);
});

test("Pixel movement normalizes diagonals, rejects obstacles, and exposes nearby destinations", async () => {
  const { advancePlayer, canWalk, nearestLocation, SPAWN } = await loadTs("components/templates/adventure-wedding-pixel/world.ts", {});
  const straight = advancePlayer(SPAWN, { x: 1, y: 0 }, .02);
  const diagonal = advancePlayer(SPAWN, { x: 1, y: 1 }, .02);
  assert.ok(Math.abs(Math.hypot(straight.x - SPAWN.x, straight.y - SPAWN.y) - Math.hypot(diagonal.x - SPAWN.x, diagonal.y - SPAWN.y)) < .00001);
  assert.equal(canWalk(384, 528), false);
  assert.equal(canWalk(650, 350), false);
  assert.equal(canWalk(650, 430), true);
  assert.equal(canWalk(-1, 500), false);
  assert.equal(nearestLocation(SPAWN).id, "events");
  assert.equal(nearestLocation({ x: 166, y: 760 }).id, "rsvp");
  assert.deepEqual(advancePlayer(SPAWN, { x: 0, y: 0 }, 99), SPAWN);
  assert.ok(advancePlayer(SPAWN, { x: 1, y: 0 }, 99).x - SPAWN.x < 6);
});

test("Pixel grass is explorable while solid scenery blocks feet and every destination stays reachable", async () => {
  const { canWalk, advancePlayer, LOCATIONS, ANIMALS, SPAWN } = await loadTs("components/templates/adventure-wedding-pixel/world.ts", {});
  for (const [x, y] of [[384, 528], [138, 417], [155, 690], [596, 693], [345, 920], [620, 880], [650, 350], [318, 1070], [450, 1070], [384, 210], [55, 879], [384, 735], [480, 789]]) {
    assert.equal(canWalk(x, y), false, `Scenery must block feet at ${x},${y}`);
  }
  let player = { ...SPAWN };
  for (let i = 0; i < 120; i++) player = advancePlayer(player, { x: 1, y: 0 }, .04);
  for (const [x, y] of [[330, 660], [440, 660], [270, 665], [500, 385], [457, 814]]) assert.equal(canWalk(x, y), true, `Open lawn is walkable at ${x},${y}`);
  assert.ok(player.x <= 520 && player.x > 450, "Crossing grass stops at the gallery structure");
  const stopped = { ...player };
  for (let i = 0; i < 100; i++) player = advancePlayer(player, { x: 1, y: 0 }, 10);
  assert.deepEqual(player, stopped, "Frame stalls cannot tunnel through the boundary");
  assert.deepEqual(advancePlayer(SPAWN, { x: NaN, y: 0 }, .02), SPAWN);
  assert.deepEqual(advancePlayer(SPAWN, { x: 1, y: 0 }, -1), SPAWN);
  const queue = [{ x: 384, y: 648 }], seen = new Set(["384,648"]);
  for (let i = 0; i < queue.length; i++) {
    const point = queue[i];
    for (const [dx, dy] of [[4, 0], [-4, 0], [0, 4], [0, -4]]) {
      const x = point.x + dx, y = point.y + dy, key = `${x},${y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (canWalk(x, y) && canWalk(x - dx / 2, y - dy / 2)) queue.push({ x, y });
    }
  }
  for (const destination of [...LOCATIONS, ...ANIMALS, { id: "bridge", x: 680, y: 430 }, { id: "entrance", x: 384, y: 1100 }]) {
    assert.ok(queue.some(p => Math.hypot(p.x - destination.x, p.y - destination.y) < 24), `${destination.id} must be reachable on foot`);
  }
  assert.equal(LOCATIONS.length, 5);
});

test("Pixel animal contact triggers once, tolerates edge jitter, and rearms after leaving", async () => {
  const { updateAnimalContacts, ANIMALS } = await loadTs("components/templates/adventure-wedding-pixel/world.ts", {});
  assert.equal(ANIMALS.length, 5);
  assert.equal(ANIMALS.find(a => a.id === "cat").x, 384);
  for (const animal of ANIMALS) {
    const touching = new Set();
    const inside = { x: animal.x + animal.touchRadius - 2, y: animal.y };
    assert.deepEqual(updateAnimalContacts({ x: animal.x + animal.touchRadius + 1, y: animal.y }, touching), []);
    assert.deepEqual(updateAnimalContacts(inside, touching), [animal.id]);
    assert.deepEqual(updateAnimalContacts(inside, touching), []);
    updateAnimalContacts({ x: animal.x + animal.touchRadius + 8, y: animal.y }, touching);
    assert.deepEqual(updateAnimalContacts(inside, touching), []);
    updateAnimalContacts({ x: animal.x + animal.touchRadius + 15, y: animal.y }, touching);
    assert.deepEqual(updateAnimalContacts(inside, touching), [animal.id]);
  }
});

test("Pixel greeting animates raised hand poses, blinks both faces and respects reduced motion", async () => {
  const { greetingFrame } = await loadTs("components/templates/adventure-wedding-pixel/couple-animation.ts", {});
  assert.deepEqual([0, .3, .6].map(t => greetingFrame("groom", t)), [1, 2, 3]);
  assert.equal(greetingFrame("groom", 4.6), 5);
  assert.equal(greetingFrame("bride", 3), 5);
  assert.equal(greetingFrame("bride", 1), 0);
  for (const character of ["groom", "bride"]) assert.equal(greetingFrame(character, 4.6, true), 0);
});

test("Pixel walk cycle alternates both steps and returns to standing", async () => {
  const { walkingFrame } = await loadTs("components/templates/adventure-wedding-pixel/world.ts", {});
  assert.equal(walkingFrame(0), 0);
  assert.deepEqual([1, 10, 19, 28, 37].map(walkingFrame), [1, 0, 2, 0, 1]);
});

test("guest messages replace repeated markers once, preserve custom wording, and always include the personal link", async () => {
  const { renderGuestShareMessage, DEFAULT_SHARE_MESSAGE } = await loadTs("lib/invitation-share-message.ts", {});
  const invitation = { bride_name: "Bride Full", groom_name: "Groom Full", bride_short_name: "Bride", groom_short_name: "Groom", event_date: "2026-09-30", venue_name: "Wedding Venue" };
  const link = "https://inv.example.invalid/wedding?to=Keluarga%20%26%20Sahabat";
  const rendered = renderGuestShareMessage("Halo {nama_tamu}!\n{nama_tamu}, sampai jumpa di {lokasi}.\n{nama_mempelai}\n{nama_panggilan}\n{tanggal}\n{link_undangan}", invitation, "  Keluarga & Sahabat 💛  ", link);
  assert.match(rendered, /Halo Keluarga & Sahabat 💛!/);
  assert.match(rendered, /Bride Full & Groom Full\nBride & Groom\nRabu, 30 September 2026/);
  assert.equal(rendered.split(link).length - 1, 1);
  assert.equal(renderGuestShareMessage("Hai {nama_tamu}", invitation, "{lokasi} $&", link), `Hai {lokasi} $&\n\n${link}`);
  assert.equal(renderGuestShareMessage(" \n\t ", invitation, "", link), "");
  assert.match(renderGuestShareMessage(DEFAULT_SHARE_MESSAGE, invitation, "", link), /\[Nama Tamu\]/);
  assert.equal(renderGuestShareMessage("Teks bebas {penanda_lain}", invitation, "", link), `Teks bebas {penanda_lain}\n\n${link}`);
});

test("private share-message migration is repeatable and preserves invitation keys, RSVP and existing messages", async () => {
  const before = (await db.query("select (select jsonb_agg(a order by invitation_id) from invitation_dashboard_access a) as access,(select jsonb_agg(r order by id) from rsvps r) as rsvps,(select jsonb_agg(g order by id) from greetings g) as greetings")).rows[0];
  const sql = await migration("20261108120000_add_private_share_message");
  await db.exec(sql);
  const after = (await db.query("select (select jsonb_agg(a order by invitation_id) from invitation_dashboard_access a) as access,(select jsonb_agg(r order by id) from rsvps r) as rsvps,(select jsonb_agg(g order by id) from greetings g) as greetings")).rows[0];
  assert.deepEqual(after, before);
});

test("share-message writes require the correct invitation key, stay private, and reject blank or oversized text", async () => {
  const invitation = (await db.query("select i.id,i.slug,a.access_token from invitations i join invitation_dashboard_access a on a.invitation_id=i.id where i.slug='adventure-wedding-pixel'")).rows[0];
  const wrongKey = (await db.query("select access_token from invitation_dashboard_access where invitation_id='00000000-0000-0000-0000-000000000107'")).rows[0].access_token;
  async function save(slug, token, message, role = "anon", userId = null) {
    await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub','${userId || ""}',false)`);
    try { return (await db.query("select save_invitation_share_message($1,$2,$3) as saved", [slug, token, message])).rows[0].saved; }
    finally { await db.exec("reset role; select set_config('request.jwt.claim.sub','',false)"); }
  }
  const text = "Halo {nama_tamu}!\nKami menunggu kehadiranmu 💛\n{link_undangan}";
  assert.equal(await save(invitation.slug, invitation.access_token, text), true);
  for (const message of [null, "", " \n\t ", "x".repeat(6001)]) assert.equal(await save(invitation.slug, invitation.access_token, message), false);
  for (const token of ["invalid", strangerId, wrongKey]) assert.equal(await save(invitation.slug, token, "Cannot overwrite"), false);
  assert.equal(await save("sunda-vibes", invitation.access_token, "Cross-invitation"), false);
  assert.equal(await save("private-draft", invitation.access_token, "Draft"), false);
  assert.equal(await save(invitation.slug, wrongKey, "Sales role is insufficient", "authenticated", salesId), false);
  assert.equal((await asRole("anon", null, `select get_invitation_dashboard_data('${invitation.id}','invalid') as payload`)).rows[0].payload, null);
  const authorized = (await asRole("anon", null, `select get_invitation_dashboard_data('${invitation.id}','${invitation.access_token}') as payload`)).rows[0].payload;
  assert.equal(authorized.share_message_template, text);
  assert.ok(Array.isArray(authorized.rsvps) && Array.isArray(authorized.greetings));
  assert.ok(Number.isInteger(authorized.view_count));
  await assert.rejects(asRole("anon", null, "select share_message_template from invitation_dashboard_access"), /permission denied/);
  assert.equal((await asRole("authenticated", salesId, "select share_message_template from invitation_dashboard_access")).rows.length, 0);
  await assert.rejects(asRole("anon", null, "update invitation_dashboard_access set share_message_template='Bypass'"), /permission denied/);
  await assert.rejects(asRole("authenticated", salesId, "update invitation_dashboard_access set share_message_template='Bypass'"), /permission denied/);
});

test("share-message action validates input, authorizes every call, and saves the template returned by the private dashboard loader", async () => {
  const { MAX_SHARE_MESSAGE_LENGTH } = await loadTs("lib/invitation-share-message.ts", {});
  const invitation = (await db.query("select i.id,i.slug,a.access_token from invitations i join invitation_dashboard_access a on a.invitation_id=i.id where i.slug='adventure-wedding-pixel'")).rows[0];
  const access = await loadTs("lib/client-dashboard-access.ts", { "server-only": {}, "next/headers": {}, "next/navigation": {}, "@/lib/invitations": {}, "@/lib/supabase/server": {} });
  let cookieValue, calls = 0, verificationError = false;
  const invalidated = [];
  const client = { async rpc(name, args) {
    calls++;
    if (verificationError) return { data: null, error: { message: "Unavailable" } };
    await db.exec("set role anon");
    try {
      const result = name === "save_invitation_share_message"
        ? await db.query("select save_invitation_share_message($1,$2,$3) as payload", [args.target_slug, args.dashboard_token, args.message_template])
        : await db.query("select get_invitation_dashboard_data($1,$2) as payload", [args.target_invitation_id, args.dashboard_token]);
      return { data: result.rows[0].payload, error: null };
    } finally { await db.exec("reset role"); }
  } };
  const actions = await loadTs("app/[slug]/dashboard/actions.ts", {
    "next/headers": { cookies: async () => ({ get: name => { assert.equal(name, `indif-dashboard-${invitation.slug}`); return cookieValue ? { value: cookieValue } : undefined; } }) },
    "next/cache": { revalidatePath: (...args) => invalidated.push(args) },
    "@/lib/client-dashboard-access": access,
    "@/lib/invitation-share-message": { MAX_SHARE_MESSAGE_LENGTH },
    "@/lib/supabase/server": { createClient: async () => client },
  });
  for (const [slug, message] of [["../admin", "Message"], [invitation.slug, " \n "], [invitation.slug, "x".repeat(6001)]]) assert.equal((await actions.saveInvitationShareMessage(slug, message)).success, false);
  for (const token of [undefined, "malformed"]) {
    cookieValue = token;
    assert.equal((await actions.saveInvitationShareMessage(invitation.slug, "Message")).success, false);
  }
  assert.equal(calls, 0);
  cookieValue = strangerId;
  assert.equal((await actions.saveInvitationShareMessage(invitation.slug, "Message")).success, false);
  cookieValue = invitation.access_token;
  verificationError = true;
  assert.equal((await actions.saveInvitationShareMessage(invitation.slug, "Message")).success, false);
  assert.deepEqual(invalidated, []);
  verificationError = false;
  const text = "Salam hangat, {nama_tamu}.\nIni kata-kata pilihan kami.\n{link_undangan}";
  assert.deepEqual(await actions.saveInvitationShareMessage(invitation.slug, text), { success: true, message: text });
  assert.deepEqual(invalidated, [[`/${invitation.slug}/dashboard`, "layout"]]);
  const loader = await loadTs("lib/invitations.ts", { "@/lib/demo": { demoInvitations: [], demoGreetings: [], javaVibesDemoGreetings: [] }, "@/lib/supabase": { getSupabase: () => client } });
  const dashboard = await loader.getInvitationDashboardData(invitation.id, invitation.access_token, client);
  assert.equal(dashboard.shareMessageTemplate, text);
  assert.ok(dashboard.initialRSVPs.every(row => row.invitation_id === invitation.id));
});
