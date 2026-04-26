// ============ HOME & NOTE VIEWS ============

function homeView(notes, activeTab = 'home') {
  const pinnedNotes = notes.filter(n => n.is_pinned);
  const otherNotes = notes.filter(n => !n.is_pinned);

  return `
${headerBar('Note', true)}
<main class="pt-24 pb-32 px-margin-mobile max-w-7xl mx-auto page-enter">
  <div class="mb-8">
    <div class="relative group">
      <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <span class="material-symbols-outlined text-outline">search</span>
      </div>
      <input id="search-input" oninput="handleSearch(this.value)" class="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary focus:ring-0 rounded-t-xl px-12 py-4 font-body-lg transition-all outline-none" placeholder="Cerca tra le tue note..." type="text"/>
    </div>
  </div>
  <div id="notes-container">
    ${renderNotesGrid(pinnedNotes, otherNotes)}
  </div>
</main>
${fab()}
${bottomNav(activeTab)}`;
}

function renderNotesGrid(pinnedNotes, otherNotes) {
  if (pinnedNotes.length === 0 && otherNotes.length === 0) {
    return `<div class="flex flex-col items-center justify-center py-20 text-center">
      <span class="material-symbols-outlined empty-state-icon mb-4">note_add</span>
      <h2 class="font-headline-md text-headline-md text-outline mb-2">Nessuna nota</h2>
      <p class="font-body-md text-outline">Tocca + per creare la tua prima nota!</p>
    </div>`;
  }

  let html = '';
  if (pinnedNotes.length > 0) {
    html += `<p class="font-label-sm text-label-sm text-outline uppercase mb-3 flex items-center gap-1"><span class="material-symbols-outlined text-sm">push_pin</span> Fissate</p>`;
    html += `<div class="masonry-grid mb-8">${pinnedNotes.map((n,i) => noteCard(n,i)).join('')}</div>`;
  }
  if (otherNotes.length > 0) {
    if (pinnedNotes.length > 0) html += `<p class="font-label-sm text-label-sm text-outline uppercase mb-3">Altre</p>`;
    html += `<div class="masonry-grid">${otherNotes.map((n,i) => noteCard(n, i + pinnedNotes.length)).join('')}</div>`;
  }
  return html;
}

function noteCard(note, index) {
  const colorClass = `note-color-${note.color || 'default'}`;
  const labels = (note.labels || []).map(l => {
    const colors = {'SPESA':'bg-primary-container text-on-primary-container','LAVORO':'bg-secondary-container text-on-secondary-container','URGENTE':'bg-tertiary-container text-on-tertiary-container','LIBRI':'bg-surface-variant text-on-surface-variant','PERSONALE':'bg-error-container text-on-error-container'};
    return `<span class="label-tag ${colors[l]||'bg-surface-variant text-on-surface-variant'} px-3 py-1 rounded-full text-label-sm font-label-sm">${l}</span>`;
  }).join('');
  
  const checklist = note.has_checklist && note.checklist ? JSON.parse(typeof note.checklist === 'string' ? note.checklist : JSON.stringify(note.checklist)) : [];
  let checklistHtml = '';
  if (checklist.length > 0) {
    checklistHtml = `<div class="space-y-1 mt-2">${checklist.slice(0,3).map(item => `
      <div class="flex items-center gap-2 ${item.done ? 'checklist-item-done' : ''}">
        <span class="material-symbols-outlined text-sm ${item.done ? 'text-secondary filled' : 'text-stone-300'}">${item.done ? 'check_box' : 'check_box_outline_blank'}</span>
        <span class="font-body-md text-sm">${escapeHtml(item.text)}</span>
      </div>`).join('')}${checklist.length > 3 ? `<p class="text-label-sm text-outline">+${checklist.length - 3} altri</p>` : ''}</div>`;
  }

  return `
  <div class="note-card ${colorClass} border-2 border-stone-100 rounded-2xl p-lg shadow-sm hover:shadow-md hover:border-secondary cursor-pointer flex flex-col gap-sm note-card-enter" style="animation-delay:${index * 60}ms" onclick="navigateTo('note/${note.id}')">
    <div class="flex justify-between items-start">
      <h3 class="font-headline-md text-stone-900 leading-tight text-base">${escapeHtml(note.title || 'Senza titolo')}</h3>
      ${note.is_pinned ? '<span class="material-symbols-outlined text-stone-400 text-sm filled">push_pin</span>' : ''}
    </div>
    ${note.content ? `<p class="text-on-surface-variant font-body-md text-sm line-clamp-4">${escapeHtml(note.content)}</p>` : ''}
    ${checklistHtml}
    ${labels ? `<div class="mt-2 flex flex-wrap gap-xs">${labels}</div>` : ''}
  </div>`;
}

function archiveView(notes) {
  const html = notes.length === 0
    ? `<div class="flex flex-col items-center justify-center py-20 text-center">
        <span class="material-symbols-outlined empty-state-icon mb-4">archive</span>
        <h2 class="font-headline-md text-headline-md text-outline mb-2">Archivio vuoto</h2>
        <p class="font-body-md text-outline">Le note archiviate appariranno qui.</p>
      </div>`
    : `<div class="masonry-grid">${notes.map((n,i) => noteCard(n,i)).join('')}</div>`;

  return `
${headerBar('Archivio', true)}
<main class="pt-24 pb-32 px-margin-mobile max-w-7xl mx-auto page-enter">${html}</main>
${bottomNav('archive')}`;
}

function labelsView(notes) {
  const allLabels = {};
  notes.forEach(n => (n.labels||[]).forEach(l => { allLabels[l] = (allLabels[l]||0) + 1; }));
  
  const labelEntries = Object.entries(allLabels);
  const html = labelEntries.length === 0
    ? `<div class="flex flex-col items-center justify-center py-20 text-center">
        <span class="material-symbols-outlined empty-state-icon mb-4">label</span>
        <h2 class="font-headline-md text-headline-md text-outline mb-2">Nessuna etichetta</h2>
        <p class="font-body-md text-outline">Aggiungi etichette alle tue note per organizzarle.</p>
      </div>`
    : `<div class="space-y-3">${labelEntries.map(([label, count]) => `
        <button onclick="filterByLabel('${label}')" class="w-full flex items-center justify-between bg-white border-2 border-stone-100 rounded-2xl p-lg hover:border-secondary transition-all">
          <div class="flex items-center gap-md">
            <span class="material-symbols-outlined text-secondary">label</span>
            <span class="font-headline-md text-base">${label}</span>
          </div>
          <span class="bg-surface-container rounded-full px-3 py-1 text-label-sm font-label-sm">${count}</span>
        </button>`).join('')}</div>`;

  return `
${headerBar('Etichette', true)}
<main class="pt-24 pb-32 px-margin-mobile max-w-7xl mx-auto page-enter">${html}</main>
${bottomNav('labels')}`;
}

function noteDetailView(note) {
  const isNew = !note.id;
  const checklist = note.has_checklist && note.checklist ? (typeof note.checklist === 'string' ? JSON.parse(note.checklist) : note.checklist) : [];
  const labels = note.labels || [];
  const timeAgo = note.updated_at ? getTimeAgo(note.updated_at) : 'Adesso';

  return `
<header class="fixed top-0 w-full z-50 bg-white border-b-2 border-stone-100 shadow-[0_4px_20px_rgba(0,119,255,0.1)] flex justify-between items-center px-5 py-4">
  <div class="flex items-center gap-4">
    <button onclick="saveAndGoBack()" class="active:translate-y-0.5 transition-all hover:bg-stone-50 p-2 rounded-full">
      <span class="material-symbols-outlined text-stone-900">arrow_back</span>
    </button>
    <h1 class="text-2xl font-black tracking-tighter text-stone-900 font-['Spline_Sans']">Note</h1>
  </div>
  <div class="flex items-center gap-2">
    <button onclick="togglePin()" id="pin-btn" class="material-symbols-outlined p-2 rounded-full hover:bg-stone-50 transition-colors ${note.is_pinned ? 'text-primary filled' : 'text-stone-500'}">push_pin</button>
    ${!isNew ? `<button onclick="showDeleteDialog()" class="material-symbols-outlined text-stone-500 hover:bg-stone-50 p-2 rounded-full transition-colors">delete</button>` : ''}
  </div>
</header>

<main class="pt-24 pb-32 px-margin-mobile max-w-2xl mx-auto page-enter bg-primary-container/10 min-h-screen">
  <div class="mb-sm flex flex-wrap gap-2" id="labels-container">
    ${labels.map(l => { const safe = escapeHtml(l).replace(/'/g, '&#39;'); return `<span class="bg-secondary text-white font-label-sm text-label-sm px-4 py-1 rounded-full uppercase tracking-widest shadow-[0_2px_10px_rgba(0,64,224,0.3)] cursor-pointer" onclick="removeLabel('${safe}')">${escapeHtml(l)} ×</span>`; }).join('')}
    <button onclick="showAddLabelDialog()" class="bg-surface-container text-outline font-label-sm text-label-sm px-3 py-1 rounded-full hover:bg-surface-container-high transition-colors">+ Etichetta</button>
  </div>

  <div class="mb-lg">
    <input id="note-title" class="w-full bg-transparent border-none focus:ring-0 font-display-lg text-display-lg text-on-background placeholder:text-stone-400 p-0" placeholder="Titolo" type="text" value="${escapeAttr(note.title || '')}"/>
    <div class="h-1 w-24 bg-secondary mt-xs rounded-full"></div>
  </div>

  <div class="flex items-center gap-md mb-xl text-stone-500 font-label-sm text-label-sm">
    <div class="flex items-center gap-1">
      <span class="material-symbols-outlined text-[18px]">schedule</span>
      <span>${timeAgo}</span>
    </div>
  </div>

  <div class="space-y-lg">
    <textarea id="note-content" class="w-full bg-transparent border-none focus:ring-0 font-body-lg text-body-lg text-on-background placeholder:text-stone-400 min-h-[200px] resize-none p-0 leading-relaxed" placeholder="Inizia a scrivere le tue idee brillanti...">${escapeHtml(note.content || '')}</textarea>
    
    <div id="checklist-container" class="${checklist.length === 0 && !note.has_checklist ? 'hidden' : ''}">
      <div class="space-y-sm bg-white/50 p-md rounded-xl border border-white/80">
        <div id="checklist-items">
          ${checklist.map((item, i) => checklistItemHtml(item, i)).join('')}
        </div>
        <button onclick="addChecklistItem()" class="flex items-center gap-2 text-secondary font-label-sm text-label-sm hover:underline">
          <span class="material-symbols-outlined text-sm">add</span> Aggiungi elemento
        </button>
      </div>
    </div>
  </div>
</main>

<nav class="fixed bottom-0 left-0 w-full bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-stone-100 flex justify-around items-center px-4 py-4 pb-safe z-40">
  <button onclick="showColorPicker()" class="flex flex-col items-center gap-1 text-stone-500 hover:text-secondary transition-colors">
    <span class="material-symbols-outlined">palette</span>
    <span class="font-label-sm text-label-sm uppercase">Colore</span>
  </button>
  <button onclick="toggleChecklist()" class="flex flex-col items-center gap-1 text-stone-500 hover:text-secondary transition-colors">
    <span class="material-symbols-outlined">checklist</span>
    <span class="font-label-sm text-label-sm uppercase">Attività</span>
  </button>
  <button onclick="showAddLabelDialog()" class="flex flex-col items-center gap-1 text-stone-500 hover:text-secondary transition-colors">
    <span class="material-symbols-outlined">label</span>
    <span class="font-label-sm text-label-sm uppercase">Etichetta</span>
  </button>
  <button onclick="duplicateNote()" class="flex flex-col items-center gap-1 text-stone-500 hover:text-secondary transition-colors">
    <span class="material-symbols-outlined">content_copy</span>
    <span class="font-label-sm text-label-sm uppercase">Duplica</span>
  </button>
</nav>

<button onclick="saveNote()" class="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed shadow-[0_8px_25px_rgba(0,186,0,0.2)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 fab-pulse">
  <span class="material-symbols-outlined font-bold">check</span>
</button>`;
}

// ============ SHARED COMPONENTS ============

function headerBar(title, showMenu = false) {
  return `
<header class="fixed top-0 w-full z-50 bg-white border-b-2 border-stone-100 shadow-[0_4px_20px_rgba(0,119,255,0.1)] flex justify-between items-center px-5 py-4">
  <div class="flex items-center gap-4">
    ${showMenu ? `<button onclick="openSideMenu()" class="material-symbols-outlined text-stone-900 hover:bg-stone-50 p-2 rounded-full transition-colors active:translate-y-0.5">menu</button>` : ''}
    <h1 class="text-2xl font-black tracking-tighter text-stone-900 font-['Spline_Sans']">${title}</h1>
  </div>
  <div class="flex items-center gap-3">
    <div id="user-avatar" class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm bg-secondary flex items-center justify-center cursor-pointer" onclick="showProfileMenu()">
      <span class="text-white font-bold text-sm" id="avatar-initial"></span>
    </div>
  </div>
</header>`;
}

function fab() {
  return `<button onclick="navigateTo('note/new')" class="fixed bottom-24 right-lg w-16 h-16 bg-tertiary-fixed text-on-tertiary-fixed rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,64,224,0.15)] hover:scale-110 active:scale-95 active:shadow-none transition-all z-50 fab-pulse">
    <span class="material-symbols-outlined text-4xl">add</span>
  </button>`;
}

function bottomNav(active) {
  const items = [
    { id: 'home', icon: 'grid_view', label: 'Note', route: 'home' },
    { id: 'search', icon: 'search', label: 'Cerca', route: 'home' },
    { id: 'labels', icon: 'label', label: 'Etichette', route: 'labels' },
  ];
  return `
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-safe bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,119,255,0.1)] z-50">
  ${items.map(item => `
    <button onclick="navigateTo('${item.route}')" class="flex flex-col items-center justify-center px-4 py-1 active:scale-95 transition-transform duration-150 ${active === item.id ? 'nav-btn-active' : 'text-stone-400 hover:text-stone-900'}">
      <span class="material-symbols-outlined ${active === item.id ? 'filled' : ''}">${item.icon}</span>
      <span class="font-['Spline_Sans'] text-[11px] font-semibold uppercase tracking-wider mt-1">${item.label}</span>
    </button>`).join('')}
</nav>`;
}

function checklistItemHtml(item, index) {
  return `
  <div class="flex items-center gap-md group ${item.done ? 'checklist-item-done' : ''}" data-index="${index}">
    <button onclick="toggleChecklistItem(${index})" class="w-6 h-6 rounded border-2 ${item.done ? 'border-secondary bg-white' : 'border-stone-300 bg-white hover:border-secondary'} flex items-center justify-center transition-colors">
      ${item.done ? '<span class="material-symbols-outlined text-secondary text-lg filled">check</span>' : ''}
    </button>
    <input type="text" value="${escapeAttr(item.text)}" onchange="updateChecklistText(${index}, this.value)" class="flex-1 bg-transparent border-none font-body-md text-body-md ${item.done ? 'text-stone-400 line-through' : 'text-on-background'} p-0 focus:ring-0"/>
    <button onclick="removeChecklistItem(${index})" class="material-symbols-outlined text-stone-300 hover:text-error text-sm opacity-0 group-hover:opacity-100 transition-opacity">close</button>
  </div>`;
}

function sideMenuHtml(profile) {
  const name = profile?.full_name || 'Utente';
  return `
<div class="side-menu-overlay fixed inset-0 bg-black/40 z-[999]" onclick="closeSideMenu()">
  <div class="side-menu-panel w-[300px] h-full bg-white shadow-2xl flex flex-col" onclick="event.stopPropagation()">
    <div class="bg-primary-container p-8 pt-12">
      <div class="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4 shadow-lg">
        <span class="text-white font-bold text-xl">${name.charAt(0).toUpperCase()}</span>
      </div>
      <h2 class="font-headline-md text-headline-md text-on-primary-container">${escapeHtml(name)}</h2>
    </div>
    <div class="flex-1 py-4">
      <button onclick="closeSideMenu();navigateTo('home')" class="w-full flex items-center gap-md px-6 py-4 hover:bg-surface-container-low transition-colors">
        <span class="material-symbols-outlined text-secondary">grid_view</span>
        <span class="font-body-md">Le mie Note</span>
      </button>

      <button onclick="closeSideMenu();navigateTo('labels')" class="w-full flex items-center gap-md px-6 py-4 hover:bg-surface-container-low transition-colors">
        <span class="material-symbols-outlined text-outline">label</span>
        <span class="font-body-md">Etichette</span>
      </button>
      <hr class="my-4 border-surface-variant"/>
      <button onclick="handleLogout()" class="w-full flex items-center gap-md px-6 py-4 hover:bg-error-container/30 transition-colors text-error">
        <span class="material-symbols-outlined">logout</span>
        <span class="font-body-md">Esci</span>
      </button>
    </div>
  </div>
</div>`;
}
