// ============ VIEW TEMPLATES ============

function registerView() {
  return `
<main class="flex-grow flex flex-col items-center justify-center px-margin-mobile py-xl md:py-0 min-h-screen">
<div class="w-full max-w-[440px] space-y-xl page-enter">
  <header class="space-y-md text-center md:text-left">
    <div class="inline-flex items-center justify-center md:justify-start gap-sm">
      <div class="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,64,224,0.1)]">
        <span class="material-symbols-outlined text-on-primary-container">edit_note</span>
      </div>
      <span class="font-headline-md text-headline-md tracking-tighter">Notes</span>
    </div>
    <div class="space-y-xs">
      <h1 class="font-display-lg text-display-lg text-on-surface leading-tight">Cattura le tue<br/><span class="digital-highlighter">idee più brillanti.</span></h1>
      <p class="font-body-lg text-body-lg text-outline">Unisciti alla community di menti creative.</p>
    </div>
  </header>
  <div class="bg-white rounded-[32px] p-8 md:p-10 border border-surface-variant shadow-[0_20px_50px_rgba(0,64,224,0.05)] relative overflow-hidden">
    <div class="absolute top-0 right-0 w-24 h-24 bg-tertiary-container/20 rounded-bl-full -mr-8 -mt-8"></div>
    <form id="register-form" class="space-y-lg relative z-10">
      <div class="space-y-xs">
        <label class="font-label-sm text-label-sm text-outline uppercase ml-1">Nome Completo</label>
        <input id="reg-name" class="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all duration-200 outline-none px-xs py-md font-body-md text-on-surface placeholder:text-outline-variant rounded-t" placeholder="Il tuo nome" type="text" required/>
      </div>
      <div class="space-y-xs">
        <label class="font-label-sm text-label-sm text-outline uppercase ml-1">Indirizzo Email</label>
        <input id="reg-email" class="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all duration-200 outline-none px-xs py-md font-body-md text-on-surface placeholder:text-outline-variant rounded-t" placeholder="hello@creative.com" type="email" required/>
      </div>
      <div class="space-y-xs">
        <label class="font-label-sm text-label-sm text-outline uppercase ml-1">Password</label>
        <div class="relative">
          <input id="reg-password" class="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all duration-200 outline-none px-xs py-md font-body-md text-on-surface placeholder:text-outline-variant rounded-t pr-10" placeholder="••••••••" type="password" required minlength="6"/>
          <button type="button" onclick="togglePassword('reg-password',this)" class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface">visibility</button>
        </div>
      </div>
      <div id="reg-error" class="hidden text-error text-label-sm font-label-sm bg-error-container/50 p-3 rounded-lg"></div>
      <div class="pt-md">
        <button id="reg-btn" type="submit" class="w-full bg-primary-container text-on-primary-container font-headline-md text-headline-md py-lg rounded-2xl shadow-[0_4px_0_0_#736c00] active:shadow-none active:translate-y-[4px] transition-all duration-75 flex items-center justify-center gap-md">
          Registrati <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      <p class="text-center font-label-sm text-label-sm text-outline pt-sm">Hai già un account? <a class="text-secondary font-bold hover:underline cursor-pointer" onclick="navigateTo('login')">Accedi</a></p>
    </form>
  </div>
  <div class="grid grid-cols-3 gap-gutter-mobile">
    <div class="bg-surface-container rounded-2xl p-md flex flex-col items-center justify-center space-y-sm">
      <span class="material-symbols-outlined text-secondary">bolt</span>
      <span class="font-label-sm text-label-sm text-on-surface text-center">Sincronizzazione Rapida</span>
    </div>
    <div class="bg-surface-container rounded-2xl p-md flex flex-col items-center justify-center space-y-sm">
      <span class="material-symbols-outlined text-tertiary">palette</span>
      <span class="font-label-sm text-label-sm text-on-surface text-center">Temi Personalizzati</span>
    </div>
    <div class="bg-surface-container rounded-2xl p-md flex flex-col items-center justify-center space-y-sm">
      <span class="material-symbols-outlined text-primary">lock_open</span>
      <span class="font-label-sm text-label-sm text-on-surface text-center">Archiviazione Sicura</span>
    </div>
  </div>
</div>
</main>
<footer class="py-lg px-margin-mobile flex justify-center border-t border-surface-variant bg-white">
  <div class="flex items-center gap-xl text-outline font-label-sm text-label-sm">
    <a class="hover:text-on-surface transition-colors" href="#">Privacy</a>
    <a class="hover:text-on-surface transition-colors" href="#">Termini</a>
    <a class="hover:text-on-surface transition-colors" href="#">Supporto</a>
  </div>
</footer>`;
}

function loginView() {
  return `
<main class="flex-grow flex flex-col items-center justify-center px-margin-mobile py-xl md:py-0 min-h-screen">
<div class="w-full max-w-[440px] space-y-xl page-enter">
  <header class="space-y-md text-center md:text-left">
    <div class="inline-flex items-center justify-center md:justify-start gap-sm">
      <div class="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,64,224,0.1)]">
        <span class="material-symbols-outlined text-on-primary-container">edit_note</span>
      </div>
      <span class="font-headline-md text-headline-md tracking-tighter">Notes</span>
    </div>
    <div class="space-y-xs">
      <h1 class="font-display-lg text-display-lg text-on-surface leading-tight">Bear Notes</h1>
      <p class="font-body-lg text-body-lg text-outline">Accedi per continuare a catturare le tue idee.</p>
    </div>
  </header>
  <div class="bg-white rounded-[32px] p-8 md:p-10 border border-surface-variant shadow-[0_20px_50px_rgba(0,64,224,0.05)] relative overflow-hidden">
    <div class="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-bl-full -mr-8 -mt-8"></div>
    <form id="login-form" class="space-y-lg relative z-10">
      <div class="space-y-xs">
        <label class="font-label-sm text-label-sm text-outline uppercase ml-1">Indirizzo Email</label>
        <input id="login-email" class="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all duration-200 outline-none px-xs py-md font-body-md text-on-surface placeholder:text-outline-variant rounded-t" placeholder="hello@creative.com" type="email" required/>
      </div>
      <div class="space-y-xs">
        <label class="font-label-sm text-label-sm text-outline uppercase ml-1">Password</label>
        <div class="relative">
          <input id="login-password" class="w-full bg-surface-container-low border-b-2 border-transparent focus:border-secondary transition-all duration-200 outline-none px-xs py-md font-body-md text-on-surface placeholder:text-outline-variant rounded-t pr-10" placeholder="••••••••" type="password" required/>
          <button type="button" onclick="togglePassword('login-password',this)" class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface">visibility</button>
        </div>
      </div>
      <div id="login-error" class="hidden text-error text-label-sm font-label-sm bg-error-container/50 p-3 rounded-lg"></div>
      <div class="pt-md">
        <button id="login-btn" type="submit" class="w-full bg-secondary text-on-secondary font-headline-md text-headline-md py-lg rounded-2xl shadow-[0_4px_0_0_#0035be] active:shadow-none active:translate-y-[4px] transition-all duration-75 flex items-center justify-center gap-md">
          Accedi <span class="material-symbols-outlined">login</span>
        </button>
      </div>
      <p class="text-center font-label-sm text-label-sm text-outline pt-sm">Non hai un account? <a class="text-secondary font-bold hover:underline cursor-pointer" onclick="navigateTo('register')">Registrati</a></p>
    </form>
  </div>
</div>
</main>`;
}

function confirmEmailView() {
  return `
<main class="flex-grow flex flex-col items-center justify-center px-margin-mobile py-xl min-h-screen">
<div class="w-full max-w-[440px] space-y-xl page-enter text-center">
  <div class="w-20 h-20 bg-tertiary-container rounded-full flex items-center justify-center mx-auto shadow-lg">
    <span class="material-symbols-outlined text-on-tertiary-container text-4xl">mark_email_read</span>
  </div>
  <h1 class="font-display-lg text-display-lg text-on-surface">Controlla la tua <span class="digital-highlighter">email!</span></h1>
  <p class="font-body-lg text-body-lg text-outline">Ti abbiamo inviato un link di conferma. Clicca il link nell'email per attivare il tuo account.</p>
  <button onclick="navigateTo('login')" class="bg-secondary text-on-secondary font-headline-md py-md px-xl rounded-2xl shadow-[0_4px_0_0_#0035be] active:shadow-none active:translate-y-[4px] transition-all">Vai al Login</button>
</div>
</main>`;
}
