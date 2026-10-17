import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

const tableNames = {
  Provider: "providers",
  Booking: "bookings",
  QuoteRequest: "quote_requests",
  Review: "reviews",
};

const normalizeRecord = (record) => ({
  ...record,
  created_date: record.created_date || record.created_at,
});

const entity = (name) => {
  const table = tableNames[name];
  return {
    async filter(filters = {}, options = {}) {
      let query = supabase.from(table).select("*");
      Object.entries(filters).forEach(([field, value]) => {
        query = query.eq(field, value);
      });
      if (options.sort) {
        const field = options.sort.replace(/^-/, "");
        query = query.order(field, { ascending: !options.sort.startsWith("-") });
      }
      if (options.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) throw error;
      return { items: (data || []).map(normalizeRecord) };
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
      if (error) throw error;
      return normalizeRecord(data);
    },
    async create(values) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = ["bookings", "quote_requests", "reviews"].includes(table)
        ? { ...values, customer_id: user?.id }
        : values;
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw error;
      return normalizeRecord(data);
    },
    async update(id, values) {
      const { data, error } = await supabase.from(table).update(values).eq("id", id).select().single();
      if (error) throw error;
      return normalizeRecord(data);
    },
  };
};

export const base44 = {
  entities: Object.fromEntries(Object.keys(tableNames).map((name) => [name, entity(name)])),
  auth: {
    async me() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    async loginViaEmailPassword(email, password) {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      return result.data;
    },
    async register({ email, password }) {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (result.error) throw result.error;
      return result.data;
    },
    async loginWithProvider(provider, returnTo = "/") {
      const result = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}${returnTo}` },
      });
      if (result.error) throw result.error;
    },
    async resetPasswordRequest(email) {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result.error) throw result.error;
    },
    async resetPassword({ newPassword }) {
      const result = await supabase.auth.updateUser({ password: newPassword });
      if (result.error) throw result.error;
    },
    async logout() {
      const result = await supabase.auth.signOut();
      if (result.error) throw result.error;
    },
    redirectToLogin(returnTo = "/") {
      window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
    },
  },
};
