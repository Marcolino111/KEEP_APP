// Supabase Client Init
const SUPABASE_URL = 'https://gperkuxphskdejzkepuw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-d_vWXbjmEc_OEf6BAw0sg_qkcyEsZY';
const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ AUTH FUNCTIONS ============
async function signUp(email, password, fullName) {
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

async function getSession() {
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

async function getProfile(userId) {
  const { data } = await sb.from('profiles').select('*').eq('id', userId).single();
  return data;
}

// ============ NOTES CRUD ============
async function fetchNotes(archived = false) {
  const { data, error } = await sb
    .from('notes')
    .select('*')
    .eq('is_archived', archived)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function fetchNote(id) {
  const { data, error } = await sb.from('notes').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function createNote(note) {
  const session = await getSession();
  const { data, error } = await sb.from('notes').insert({
    ...note, user_id: session.user.id
  }).select().single();
  if (error) throw error;
  return data;
}

async function updateNote(id, updates) {
  const { data, error } = await sb.from('notes').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function deleteNote(id) {
  const { error } = await sb.from('notes').delete().eq('id', id);
  if (error) throw error;
}

async function searchNotes(query) {
  const { data, error } = await sb
    .from('notes')
    .select('*')
    .eq('is_archived', false)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
