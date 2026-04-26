// ============ KEEP - Vivid Note - Main App Logic ============

// --- State ---
let currentUser = null;
let currentProfile = null;
let currentNote = null;
let currentNotes = [];
let searchTimeout = null;

// --- Helpers ---
function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Adesso';
  if (mins < 60) return `${mins}m fa`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h fa`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}g fa`;
  return new Date(dateStr).toLocaleDateString('it-IT');
}

function togglePassword(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = 'visibility_off'; }
  else { inp.type = 'password'; btn.textContent = 'visibility'; }
}

// --- Toast ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const colors = { success: 'bg-tertiary-container text-on-tertiary-container', error: 'bg-error-container text-on-error-container', info: 'bg-secondary-container text-on-secondary-container' };
  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  const toast = document.createElement('div');
  toast.className = `toast-enter flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg ${colors[type]} font-body-md`;
  toast.innerHTML = `<span class="material-symbols-outlined">${icons[type]}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.replace('toast-enter', 'toast-exit'); setTimeout(() => toast.remove(), 300); }, 3500);
}

// --- Router ---
function navigateTo(route) {
  window.location.hash = route;
}

function getRoute() {
  const hash = window.location.hash.replace('#', '') || '';
  if (hash.startsWith('note/')) return { page: 'note', param: hash.replace('note/', '') };
  return { page: hash || 'home', param: null };
}

async function router() {
  const { page, param } = getRoute();
  const app = document.getElementById('app');
  const authBg = document.getElementById('auth-bg-decor');

  // Auth check
  const session = await getSession();
  currentUser = session?.user || null;

  if (!currentUser && !['login', 'register', 'confirm-email'].includes(page)) {
    navigateTo('login');
    return;
  }

  if (currentUser && ['login', 'register'].includes(page)) {
    navigateTo('home');
    return;
  }

  // Show/hide auth bg
  authBg?.classList.toggle('hidden', !['login', 'register', 'confirm-email'].includes(page));

  try {
    switch (page) {
      case 'register':
        app.innerHTML = registerView();
        setupRegisterForm();
        break;
      case 'login':
        app.innerHTML = loginView();
        setupLoginForm();
        break;
      case 'confirm-email':
        app.innerHTML = confirmEmailView();
        break;
      case 'home':
        currentNotes = await fetchNotes(false);
        app.innerHTML = homeView(currentNotes, 'home');
        setAvatarInitial();
        break;
      case 'archive':
        const archivedNotes = await fetchNotes(true);
        app.innerHTML = archiveView(archivedNotes);
        setAvatarInitial();
        break;
      case 'labels':
        const allNotes = await fetchNotes(false);
        app.innerHTML = labelsView(allNotes);
        setAvatarInitial();
        break;
      case 'note':
        if (param === 'new') {
          currentNote = { title: '', content: '', color: 'default', is_pinned: false, is_archived: false, labels: [], has_checklist: false, checklist: [] };
        } else {
          currentNote = await fetchNote(param);
          if (currentNote.checklist && typeof currentNote.checklist === 'string') {
            currentNote.checklist = JSON.parse(currentNote.checklist);
          }
        }
        app.innerHTML = noteDetailView(currentNote);
        break;
      default:
        navigateTo('home');
    }
  } catch (err) {
    console.error('Router error:', err);
    showToast('Errore nel caricamento. Riprova più tardi.', 'error');
  }

  // Hide loading screen
  const loading = document.getElementById('loading-screen');
  if (loading) loading.style.display = 'none';
}

// --- Auth Handlers ---
function setupRegisterForm() {
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('reg-btn');
    const errDiv = document.getElementById('reg-error');
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner border-on-primary-container"></span>';
    errDiv.classList.add('hidden');

    try {
      await signUp(email, password, name);
      showToast('Registrazione completata! Controlla la tua email.', 'success');
      navigateTo('confirm-email');
    } catch (err) {
      errDiv.textContent = translateError(err.message);
      errDiv.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Registrati <span class="material-symbols-outlined">arrow_forward</span>';
    }
  });
}

function setupLoginForm() {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const errDiv = document.getElementById('login-error');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner border-on-secondary"></span>';
    errDiv.classList.add('hidden');

    try {
      await signIn(email, password);
      showToast('Benvenuto!', 'success');
      navigateTo('home');
    } catch (err) {
      errDiv.textContent = translateError(err.message);
      errDiv.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Accedi <span class="material-symbols-outlined">login</span>';
    }
  });
}

function translateError(msg) {
  const translations = {
    'Invalid login credentials': 'Credenziali non valide. Controlla email e password.',
    'User already registered': 'Email già registrata. Prova ad accedere.',
    'Email not confirmed': 'Email non confermata. Controlla la tua casella.',
    'Password should be at least 6 characters': 'La password deve avere almeno 6 caratteri.',
    'Unable to validate email address: invalid format': 'Formato email non valido.',
    'Email signups are disabled': 'La registrazione via email non è abilitata.',
    'Email rate limit exceeded': 'Troppi tentativi. Riprova tra qualche minuto.',
  };
  return translations[msg] || 'Si è verificato un errore. Riprova.';
}

async function handleLogout() {
  try {
    await signOut();
    showToast('Disconnesso con successo', 'info');
    navigateTo('login');
  } catch (err) {
    showToast('Errore durante la disconnessione. Riprova.', 'error');
  }
}

// --- Note Actions ---
function getNoteFormData() {
  return {
    title: document.getElementById('note-title')?.value || '',
    content: document.getElementById('note-content')?.value || '',
    color: currentNote?.color || 'default',
    is_pinned: currentNote?.is_pinned || false,
    is_archived: currentNote?.is_archived || false,
    labels: currentNote?.labels || [],
    has_checklist: currentNote?.has_checklist || false,
    checklist: JSON.stringify(currentNote?.checklist || []),
  };
}

async function saveNote() {
  const data = getNoteFormData();
  if (!data.title && !data.content && (!currentNote?.checklist || currentNote.checklist.length === 0)) {
    showToast('Scrivi qualcosa prima di salvare!', 'info');
    return;
  }

  try {
    if (currentNote?.id) {
      await updateNote(currentNote.id, data);
      showToast('Nota aggiornata!', 'success');
    } else {
      const created = await createNote(data);
      currentNote = created;
      showToast('Nota creata!', 'success');
    }
    navigateTo('home');
  } catch (err) {
    showToast('Errore nel salvataggio. Riprova.', 'error');
  }
}

async function saveAndGoBack() {
  const data = getNoteFormData();
  if (data.title || data.content || (currentNote?.checklist && currentNote.checklist.length > 0)) {
    try {
      if (currentNote?.id) {
        await updateNote(currentNote.id, data);
      } else {
        await createNote(data);
      }
    } catch (err) {
      console.error('Auto-save error:', err);
    }
  }
  navigateTo('home');
}

function togglePin() {
  currentNote.is_pinned = !currentNote.is_pinned;
  const btn = document.getElementById('pin-btn');
  btn.classList.toggle('text-primary', currentNote.is_pinned);
  btn.classList.toggle('filled', currentNote.is_pinned);
  btn.classList.toggle('text-stone-500', !currentNote.is_pinned);
}

async function toggleArchive() {
  currentNote.is_archived = !currentNote.is_archived;
  if (currentNote.id) {
    const data = getNoteFormData();
    data.is_archived = currentNote.is_archived;
    await updateNote(currentNote.id, data);
    showToast(currentNote.is_archived ? 'Nota archiviata' : 'Nota ripristinata', 'success');
    navigateTo('home');
  }
}

function showDeleteDialog() {
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-6';
  overlay.innerHTML = `
    <div class="dialog-content bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-lg">
      <div class="flex items-center gap-md">
        <div class="w-12 h-12 bg-error-container rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-error">delete_forever</span>
        </div>
        <h2 class="font-headline-md text-headline-md">Eliminare la nota?</h2>
      </div>
      <p class="font-body-md text-outline">Questa azione non può essere annullata.</p>
      <div class="flex gap-3 justify-end">
        <button onclick="this.closest('.dialog-overlay').remove()" class="px-6 py-3 rounded-xl font-label-sm text-label-sm uppercase hover:bg-surface-container transition-colors">Annulla</button>
        <button onclick="confirmDelete()" class="px-6 py-3 bg-error text-on-error rounded-xl font-label-sm text-label-sm uppercase shadow-[0_2px_0_0_#93000a] active:shadow-none active:translate-y-[2px] transition-all">Elimina</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

async function confirmDelete() {
  document.querySelector('.dialog-overlay')?.remove();
  if (currentNote?.id) {
    try {
      await deleteNote(currentNote.id);
      showToast('Nota eliminata', 'success');
      navigateTo('home');
    } catch (err) {
      showToast('Errore durante l\'eliminazione. Riprova.', 'error');
    }
  }
}

async function duplicateNote() {
  const data = getNoteFormData();
  data.title = (data.title || 'Senza titolo') + ' (copia)';
  try {
    await createNote(data);
    showToast('Nota duplicata!', 'success');
    navigateTo('home');
  } catch (err) {
    showToast('Errore durante la duplicazione. Riprova.', 'error');
  }
}

// --- Checklist ---
function toggleChecklist() {
  currentNote.has_checklist = !currentNote.has_checklist;
  if (currentNote.has_checklist && (!currentNote.checklist || currentNote.checklist.length === 0)) {
    currentNote.checklist = [{ text: '', done: false }];
  }
  const container = document.getElementById('checklist-container');
  container.classList.toggle('hidden', !currentNote.has_checklist);
  if (currentNote.has_checklist) renderChecklist();
}

function renderChecklist() {
  const container = document.getElementById('checklist-items');
  if (!container) return;
  container.innerHTML = (currentNote.checklist || []).map((item, i) => checklistItemHtml(item, i)).join('');
}

function addChecklistItem() {
  if (!currentNote.checklist) currentNote.checklist = [];
  currentNote.checklist.push({ text: '', done: false });
  renderChecklist();
  const inputs = document.querySelectorAll('#checklist-items input[type="text"]');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

function toggleChecklistItem(index) {
  if (currentNote.checklist[index]) {
    currentNote.checklist[index].done = !currentNote.checklist[index].done;
    renderChecklist();
  }
}

function updateChecklistText(index, value) {
  if (currentNote.checklist[index]) currentNote.checklist[index].text = value;
}

function removeChecklistItem(index) {
  currentNote.checklist.splice(index, 1);
  renderChecklist();
}

// --- Labels ---
function showAddLabelDialog() {
  const presets = ['SPESA', 'LAVORO', 'URGENTE', 'PERSONALE', 'LIBRI', 'IDEE', 'STUDIO', 'SALUTE'];
  const current = currentNote?.labels || [];

  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay fixed inset-0 bg-black/40 z-[999] flex items-end sm:items-center justify-center';
  overlay.innerHTML = `
    <div class="dialog-content bg-white rounded-t-3xl sm:rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-lg max-h-[70vh] overflow-auto">
      <h2 class="font-headline-md text-headline-md">Aggiungi Etichetta</h2>
      <div class="flex gap-2">
        <input id="custom-label-input" class="flex-1 bg-surface-container-low border-b-2 border-transparent focus:border-secondary px-3 py-2 font-body-md rounded-t outline-none" placeholder="Etichetta personalizzata..." type="text"/>
        <button onclick="addCustomLabel()" class="bg-secondary text-white px-4 py-2 rounded-xl font-label-sm">Aggiungi</button>
      </div>
      <div class="flex flex-wrap gap-2">
        ${presets.map(l => `<button onclick="addPresetLabel('${l}')" class="px-4 py-2 rounded-full font-label-sm text-label-sm border-2 transition-all ${current.includes(l) ? 'bg-secondary text-white border-secondary' : 'border-stone-200 hover:border-secondary'}">${l}</button>`).join('')}
      </div>
      <button onclick="this.closest('.dialog-overlay').remove()" class="w-full py-3 text-center font-label-sm text-outline hover:text-on-surface transition-colors">Chiudi</button>
    </div>`;
  document.body.appendChild(overlay);
}

function addPresetLabel(label) {
  if (!currentNote.labels) currentNote.labels = [];
  const idx = currentNote.labels.indexOf(label);
  if (idx >= 0) currentNote.labels.splice(idx, 1);
  else currentNote.labels.push(label);
  document.querySelector('.dialog-overlay')?.remove();
  showAddLabelDialog();
  updateLabelsUI();
}

function addCustomLabel() {
  const input = document.getElementById('custom-label-input');
  const label = input?.value.trim().toUpperCase();
  if (label && !currentNote.labels.includes(label)) {
    currentNote.labels.push(label);
    document.querySelector('.dialog-overlay')?.remove();
    updateLabelsUI();
  }
}

function removeLabel(label) {
  if (currentNote?.labels) {
    currentNote.labels = currentNote.labels.filter(l => l !== label);
    updateLabelsUI();
  }
}

function updateLabelsUI() {
  const container = document.getElementById('labels-container');
  if (!container) return;
  container.innerHTML = (currentNote?.labels || []).map(l => {
    const safe = escapeHtml(l).replace(/'/g, '&#39;');
    return `<span class="bg-secondary text-white font-label-sm text-label-sm px-4 py-1 rounded-full uppercase tracking-widest shadow-[0_2px_10px_rgba(0,64,224,0.3)] cursor-pointer" onclick="removeLabel('${safe}')">${escapeHtml(l)} ×</span>`;
  }).join('') + `<button onclick="showAddLabelDialog()" class="bg-surface-container text-outline font-label-sm text-label-sm px-3 py-1 rounded-full hover:bg-surface-container-high transition-colors">+ Etichetta</button>`;
}

// --- Color Picker ---
function showColorPicker() {
  const colors = [
    { name: 'default', hex: '#ffffff' }, { name: 'yellow', hex: '#fff9c4' },
    { name: 'green', hex: '#e8f5e9' }, { name: 'blue', hex: '#e3f2fd' },
    { name: 'pink', hex: '#fce4ec' }, { name: 'purple', hex: '#f3e5f5' },
    { name: 'orange', hex: '#fff3e0' }, { name: 'teal', hex: '#e0f2f1' }
  ];
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay fixed inset-0 bg-black/40 z-[999] flex items-end sm:items-center justify-center';
  overlay.innerHTML = `
    <div class="dialog-content bg-white rounded-t-3xl sm:rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-lg">
      <h2 class="font-headline-md text-headline-md">Colore Nota</h2>
      <div class="flex flex-wrap gap-4 justify-center">
        ${colors.map(c => `<button onclick="setNoteColor('${c.name}')" class="color-dot ${currentNote?.color === c.name ? 'selected' : ''}" style="background:${c.hex}; border: 2px solid ${c.name === 'default' ? '#e5e2e1' : c.hex}"></button>`).join('')}
      </div>
      <button onclick="this.closest('.dialog-overlay').remove()" class="w-full py-3 text-center font-label-sm text-outline hover:text-on-surface transition-colors">Chiudi</button>
    </div>`;
  document.body.appendChild(overlay);
}

function setNoteColor(color) {
  if (currentNote) currentNote.color = color;
  document.querySelector('.dialog-overlay')?.remove();
}

// --- Search ---
function handleSearch(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const container = document.getElementById('notes-container');
    if (!container) return;
    if (!query.trim()) {
      const notes = await fetchNotes(false);
      const pinned = notes.filter(n => n.is_pinned);
      const others = notes.filter(n => !n.is_pinned);
      container.innerHTML = renderNotesGrid(pinned, others);
      return;
    }
    try {
      const results = await searchNotes(query);
      container.innerHTML = results.length
        ? `<div class="masonry-grid">${results.map((n, i) => noteCard(n, i)).join('')}</div>`
        : `<div class="text-center py-20"><span class="material-symbols-outlined empty-state-icon mb-4">search_off</span><h2 class="font-headline-md text-outline">Nessun risultato per "${escapeHtml(query)}"</h2></div>`;
    } catch (err) {
      showToast('Errore nella ricerca', 'error');
    }
  }, 300);
}

async function filterByLabel(label) {
  try {
    const notes = await fetchNotes(false);
    const filtered = notes.filter(n => (n.labels || []).includes(label));
    const app = document.getElementById('app');
    app.innerHTML = `
      ${headerBar(`Etichetta: ${label}`, true)}
      <main class="pt-24 pb-32 px-margin-mobile max-w-7xl mx-auto page-enter">
        <button onclick="navigateTo('labels')" class="mb-4 flex items-center gap-2 text-secondary font-label-sm hover:underline">
          <span class="material-symbols-outlined text-sm">arrow_back</span> Tutte le etichette
        </button>
        ${filtered.length ? `<div class="masonry-grid">${filtered.map((n,i) => noteCard(n,i)).join('')}</div>` : '<p class="text-center py-20 text-outline font-body-lg">Nessuna nota con questa etichetta.</p>'}
      </main>
      ${fab()}${bottomNav('labels')}`;
    setAvatarInitial();
  } catch (err) {
    showToast('Errore nel caricamento delle note. Riprova.', 'error');
  }
}

// --- Side Menu ---
function openSideMenu() {
  const menu = document.createElement('div');
  menu.id = 'side-menu';
  menu.innerHTML = sideMenuHtml(currentProfile);
  document.body.appendChild(menu);
}

function closeSideMenu() {
  const menu = document.getElementById('side-menu');
  if (menu) {
    const overlay = menu.querySelector('.side-menu-overlay');
    overlay?.classList.add('side-menu-closing');
    setTimeout(() => menu.remove(), 250);
  }
}

function showProfileMenu() {
  openSideMenu();
}

// --- Avatar ---
async function setAvatarInitial() {
  if (!currentProfile && currentUser) {
    try { currentProfile = await getProfile(currentUser.id); } catch (e) {}
  }
  const el = document.getElementById('avatar-initial');
  if (el) {
    const name = currentProfile?.full_name || currentUser?.user_metadata?.full_name || currentUser?.email || 'U';
    el.textContent = name.charAt(0).toUpperCase();
  }
}

// --- Init ---
window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') navigateTo('login');
  });
  router();
});
