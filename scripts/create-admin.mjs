import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadLocalEnvironment() {
  return Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1).replace(/^['"]|['"]$/g, "")];
      }),
  );
}

const username = process.env.ADMIN_SETUP_USERNAME;
const email = process.env.ADMIN_SETUP_EMAIL;
const password = process.env.ADMIN_SETUP_PASSWORD;

if (!username || !email || !password) {
  throw new Error("ADMIN_SETUP_USERNAME, ADMIN_SETUP_EMAIL, dan ADMIN_SETUP_PASSWORD wajib diisi.");
}

const localEnvironment = loadLocalEnvironment();
const supabase = createClient(
  localEnvironment.NEXT_PUBLIC_SUPABASE_URL,
  localEnvironment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { username } },
});

if (error) throw error;
console.log(JSON.stringify({ id: data.user?.id, email: data.user?.email, sessionCreated: Boolean(data.session) }));
