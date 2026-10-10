// GUL Wolf Assistant — a free, scripted FAQ widget (NOT a real AI model; answers are
// pre-written and pulled live from content.json so prices/dates never go stale).
// Include with: <script src="assets/wolf-chat.js" defer></script>
(function () {
  const css = `
  .wolfBtn{position:fixed;right:20px;bottom:20px;width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#1459c7,#0d2d63);border:2px solid rgba(245,181,27,.6);box-shadow:0 10px 30px rgba(0,0,0,.4);cursor:pointer;z-index:200;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .25s ease}
  .wolfBtn:hover{transform:scale(1.08)}
  .wolfBtn img{width:44px;height:44px;object-fit:contain}
  @media (prefers-reduced-motion: no-preference){.wolfBtn{animation:wolfBob 2.6s ease-in-out infinite}}
  @keyframes wolfBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .wolfPanel{position:fixed;right:20px;bottom:92px;width:min(340px,88vw);max-height:min(480px,70vh);background:#0d1f40;border:1px solid rgba(255,255,255,.14);border-radius:18px;box-shadow:0 25px 60px rgba(0,0,0,.5);z-index:200;display:none;flex-direction:column;overflow:hidden;font-family:Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif}
  .wolfPanel.open{display:flex}
  .wolfHead{background:linear-gradient(120deg,#123b83,#0b2149);padding:14px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,.1)}
  .wolfHead img{width:34px;height:34px;object-fit:contain;flex-shrink:0}
  .wolfHead div{flex:1}
  .wolfHead b{color:#fff;font-size:14px;display:block}
  .wolfHead span{color:#a9b6cf;font-size:10.5px}
  .wolfClose{background:none;border:0;color:#a9b6cf;cursor:pointer;font-size:18px;line-height:1;padding:4px}
  .wolfBody{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
  .wolfMsg{background:#07172f;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 12px;color:#e4eaff;font-size:13px;line-height:1.5;white-space:pre-line}
  .wolfMsg.bot{align-self:flex-start;max-width:90%}
  .wolfMsg.me{align-self:flex-end;background:#1459c7;color:#fff;max-width:85%}
  .wolfQ{background:rgba(245,181,27,.1);border:1px solid rgba(245,181,27,.35);color:#ffe6ab;border-radius:10px;padding:9px 11px;font-size:12.5px;text-align:left;cursor:pointer;transition:background .2s ease}
  .wolfQ:hover{background:rgba(245,181,27,.2)}
  .wolfFoot{padding:10px 16px;border-top:1px solid rgba(255,255,255,.08);font-size:10.5px;color:#7c8aad;text-align:center}
  `;
  const styleTag = document.createElement('style');
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  const assetsBase = document.currentScript.src.replace(/assets\/wolf-chat\.js.*$/, '');

  const btn = document.createElement('button');
  btn.className = 'wolfBtn';
  btn.setAttribute('aria-label', 'Open GUL assistant');
  btn.innerHTML = `<img src="${assetsBase}assets/gul-mascot.png" alt="">`;
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.className = 'wolfPanel';
  panel.innerHTML = `
    <div class="wolfHead">
      <img src="${assetsBase}assets/gul-mascot.png" alt="">
      <div><b>GUL Assistant</b><span>Quick answers · not live chat</span></div>
      <button class="wolfClose" aria-label="Close">×</button>
    </div>
    <div class="wolfBody" id="wolfBody"></div>
    <div class="wolfFoot">Answers are pre-written, not AI-generated. For anything else, use Contact below.</div>
  `;
  document.body.appendChild(panel);

  const body = panel.querySelector('#wolfBody');

  function addMsg(kind, html) {
    const el = document.createElement('div');
    el.className = 'wolfMsg ' + kind;
    el.innerHTML = html;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function addQuestions(list) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '7px';
    list.forEach(([label, handler]) => {
      const q = document.createElement('button');
      q.className = 'wolfQ';
      q.textContent = label;
      q.onclick = () => { wrap.remove(); addMsg('me', label); handler(); };
      wrap.appendChild(q);
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  let contentCache = null;
  async function getContent() {
    if (contentCache) return contentCache;
    try {
      const res = await fetch(assetsBase + 'content.json?v=' + Date.now(), { cache: 'no-store' });
      contentCache = await res.json();
    } catch (e) { contentCache = null; }
    return contentCache;
  }

  function showMainMenu() {
    addQuestions([
      ['💰 How much does it cost to register?', async () => {
        const c = await getContent();
        if (!c) { addMsg('bot', 'Could not load live pricing right now — please check the Register page directly.'); showMainMenu(); return; }
        const offer = c.registration[c.registration.activeOffer];
        const teamFee = c.teamRegistration ? c.teamRegistration.fee.toLocaleString('en-IN') : '11,000';
        addMsg('bot', `Right now it's <b>${offer.label}</b> pricing:\n₹${offer.price.toLocaleString('en-IN')} per player${offer.window ? ' (' + offer.window + ')' : ''}.\n\nTeam entry is ₹${teamFee}.`);
        showMainMenu();
      }],
      ['📅 When does Season 2 start?', async () => {
        const c = await getContent();
        addMsg('bot', c ? `Season 2 — RE-LOADED runs ${c.season2.pillDates}, every Saturday.\n\n${c.season2.registrationWindow || ''}` : 'Season 2 — RE-LOADED: 16 Jan – 13 Mar 2027, every Saturday.');
        showMainMenu();
      }],
      ['📝 How do I register?', () => {
        addMsg('bot', 'Tap "Register" in the menu, or go to the Register page directly. Fill in your details, and you\'ll see the current price before submitting.\n\n<a href="register.html" style="color:#f5b51b;font-weight:700">Go to Registration →</a>');
        showMainMenu();
      }],
      ['📍 Where is Game Up Turf?', () => {
        addMsg('bot', 'Game Up Turf is our home ground for matches, practice and events, located in Vasai West, Bhuigaon. For exact directions, please contact us directly.');
        showMainMenu();
      }],
      ['📞 Contact GUL', async () => {
        const c = await getContent();
        if (c) addMsg('bot', `📧 ${c.contact.email}\n📞 ${c.contact.phoneDisplay}\n📸 ${c.contact.instagramHandle}`);
        else addMsg('bot', 'Please see the Contact section on our homepage.');
        showMainMenu();
      }]
    ]);
  }

  let opened = false;
  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (!opened) {
      opened = true;
      addMsg('bot', "Hey! 🐺 I'm the GUL Assistant. I can answer a few common questions — pick one below:");
      showMainMenu();
    }
  });
  panel.querySelector('.wolfClose').addEventListener('click', () => panel.classList.remove('open'));
})();
