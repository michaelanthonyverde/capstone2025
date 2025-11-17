// Learn page script: data fetch + filters + paging
(function(){
  const DATA_URL = './Data/words_difficulty.json';

  const tabsEl = document.getElementById('learn-tabs');
  const listEl = document.getElementById('learn-list');
  const rangeEl = document.getElementById('learn-range');
  const liveEl = document.getElementById('learn-live');
  const searchEl = document.getElementById('learn-search');
  const pageSizeEl = document.getElementById('learn-pageSize');
  const prevEl = document.getElementById('learn-prev');
  const nextEl = document.getElementById('learn-next');

  const savedTab = localStorage.getItem('gre.learn.tab') || 'all';
  const savedQuery = localStorage.getItem('gre.learn.query') || '';
  const savedPageSize = parseInt(localStorage.getItem('gre.learn.pageSize') || '25', 10);

  let all = [];
  let counts = { all: 0, high_frequency: 0, basic: 0, common: 0, advanced: 0 };
  const state = { tab: savedTab, q: savedQuery.toLowerCase(), pageSize: savedPageSize, page: 1 };

  if (searchEl) searchEl.value = savedQuery;
  if (pageSizeEl) pageSizeEl.value = String(savedPageSize);
  if (rangeEl) rangeEl.classList.add('range-indicator');

  function labelDifficulty(key){
    const map = {
      high_frequency: 'High Frequency',
      basic: 'Basic',
      common: 'Common',
      advanced: 'Advanced',
      all: 'All'
    };
    return map[key] || (key ? key[0].toUpperCase() + key.slice(1) : '—');
  }

  function pulse(el){
    if (!el) return;
    el.classList.add('is-updating');
    void el.offsetHeight;
    el.classList.remove('is-updating');
  }

  function speak(text){
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } catch(e){}
  }

  function norm(item){
    const definition = (item.definition || '').split(/\n{2,}/)[0].trim();
    return {
      term: item.term || '',
      difficulty: (item.difficulty || '').toLowerCase(),
      definition,
      example: item.example || '',
      partOfSpeech: (item.linguistics && (item.linguistics.part_of_speech || item.linguistics.partOfSpeech)) || ''
    };
  }

  function renderTabs(){
    if (!tabsEl) return;
    tabsEl.innerHTML = '';
    const keys = ['all', 'high_frequency', 'basic', 'common', 'advanced'];

    keys.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-ghost pill ' + (key === 'all' ? '' : key);
      btn.dataset.tab = key;
      btn.setAttribute('role', 'tab');

      const labelSpan = document.createElement('span');
      labelSpan.className = 'tab-label';
      labelSpan.textContent = labelDifficulty(key);

      const countSpan = document.createElement('span');
      countSpan.className = 'tab-count';
      countSpan.textContent = ` (${counts[key] || 0})`;

      btn.append(labelSpan, countSpan);
      btn.classList.toggle('is-active', state.tab === key);
      btn.setAttribute('aria-selected', state.tab === key ? 'true' : 'false');

      btn.addEventListener('click', () => {
        state.tab = key;
        state.page = 1;
        persist();
        syncActiveTab();
        apply();
      });

      tabsEl.append(btn);
      pulse(countSpan);
    });
  }

  function syncActiveTab(){
    if (!tabsEl) return;
    const buttons = tabsEl.querySelectorAll('button');
    buttons.forEach(btn => {
      const isActive = btn.dataset.tab === state.tab;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function persist(){
    localStorage.setItem('gre.learn.tab', state.tab);
    localStorage.setItem('gre.learn.query', (searchEl && searchEl.value) || '');
    localStorage.setItem('gre.learn.pageSize', String(state.pageSize));
  }

  function apply(){
    if (!listEl) return;
    syncActiveTab();

    let filtered = all.slice();
    if (state.tab !== 'all') filtered = filtered.filter(item => item.difficulty === state.tab);
    if (state.q) filtered = filtered.filter(item => (item.term || '').toLowerCase().includes(state.q));

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > pages) state.page = pages;

    const startIndex = (state.page - 1) * state.pageSize;
    const endIndex = Math.min(total, startIndex + state.pageSize);
    const pageItems = filtered.slice(startIndex, endIndex);

    if (liveEl) liveEl.textContent =
      `Showing ${total} results for ${labelDifficulty(state.tab)}${state.q ? ` with '${(searchEl && searchEl.value) || ''}'` : ''}`;
    if (rangeEl){
      rangeEl.textContent = `${total ? startIndex + 1 : 0}–${endIndex} of ${total}`;
      pulse(rangeEl);
    }

    listEl.innerHTML = '';
    pageItems.forEach(item => {
      const row = document.createElement('div');
      row.className = 'learn-row word-card fade-slide';

      const left = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'term';
      title.textContent = item.term;

      const pos = document.createElement('span');
      pos.className = 'part-of-speech';
      pos.textContent = item.partOfSpeech || '—';

      const pill = document.createElement('span');
      pill.className = 'pill ' + item.difficulty;
      pill.style.marginLeft = '8px';
      pill.textContent = labelDifficulty(item.difficulty);

      const head = document.createElement('div');
      head.className = 'row';
      head.append(title, pos, pill);

      const def = document.createElement('div');
      def.className = 'definition';
      def.textContent = item.definition;
      def.title = item.definition;

      left.append(head, def);

      if (item.example){
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'Show example';
        const example = document.createElement('div');
        example.className = 'muted';
        example.textContent = item.example;
        details.append(summary, example);
        left.append(details);
      }

      const actions = document.createElement('div');
      actions.className = 'learn-actions';
      const speakBtn = document.createElement('button');
      speakBtn.className = 'btn btn-ghost';
      speakBtn.textContent = '🔊 Speak';
      speakBtn.addEventListener('click', () => speak(item.term));
      actions.append(speakBtn);

      row.append(left, actions);
      listEl.append(row);
    });

    if (prevEl) prevEl.disabled = state.page <= 1;
    if (nextEl) nextEl.disabled = state.page >= Math.ceil(total / state.pageSize);

    const activeCount = tabsEl && tabsEl.querySelector('.is-active .tab-count');
    pulse(activeCount);
  }

  if (pageSizeEl){
    pageSizeEl.addEventListener('change', () => {
      state.pageSize = parseInt(pageSizeEl.value, 10) || 25;
      state.page = 1;
      persist();
      apply();
    });
  }

  if (prevEl){
    prevEl.addEventListener('click', () => {
      if (state.page > 1){
        state.page -= 1;
        apply();
      }
    });
  }

  if (nextEl){
    nextEl.addEventListener('click', () => {
      state.page += 1;
      apply();
    });
  }

  if (searchEl){
    let debounceId = null;
    searchEl.addEventListener('input', () => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        state.q = (searchEl.value || '').toLowerCase();
        state.page = 1;
        persist();
        apply();
      }, 250);
    });
  }

  fetch(DATA_URL, { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error('fetch failed');
      return res.json();
    })
    .then(data => {
      all = (data || []).filter(item => item && item.term && item.definition).map(norm);
      counts = { all: all.length, high_frequency:0, basic:0, common:0, advanced:0 };
      all.forEach(item => {
        if (counts[item.difficulty] !== undefined){
          counts[item.difficulty] += 1;
        }
      });
      renderTabs();
      syncActiveTab();
      apply();
    })
    .catch(() => {
      if (!listEl) return;
      const card = document.createElement('div');
      card.className = 'card';
      const heading = document.createElement('h2');
      heading.textContent = 'Unable to load vocabulary data.';
      const desc = document.createElement('p');
      desc.className = 'muted';
      desc.textContent = 'Please check your local server and try again.';
      card.append(heading, desc);
      listEl.append(card);
    });
})();

