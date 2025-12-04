(function () {
  const DATA_URL = './Data/words_difficulty.json';
  const STORAGE_KEY = 'wordStats';

  const labelDifficulty = (key) => {
    const map = {
      high_frequency: 'High Frequency',
      basic: 'Basic',
      common: 'Common',
      advanced: 'Advanced'
    };
    if (!key) return '';
    return map[key] || key[0].toUpperCase() + key.slice(1);
  };

  const normalizeWords = (data = []) =>
    data
      .filter((item) => item && item.term)
      .map((item, idx) => {
        const definition = (item.definition || '').split(/\n{2,}/)[0].trim();
        return {
          id: item.term || `word-${idx}`,
          term: item.term || '',
          definition,
          example: item.example || '',
          difficulty: (item.difficulty || '').toLowerCase(),
          partOfSpeech:
            (item.linguistics && (item.linguistics.part_of_speech || item.linguistics.partOfSpeech)) ||
            ''
        };
      });

  const loadStats = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  };

  const saveStats = (stats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const wordEl = document.getElementById('learnWord');
    const posEl = document.getElementById('learnPOS');
    const diffEl = document.getElementById('learnDifficulty');
    const defEl = document.getElementById('learnDefinition');
    const exEl = document.getElementById('learnExample');
    const liveEl = document.getElementById('learn-live');

    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnShuffle = document.getElementById('btnShuffle');
    const btnReveal = document.getElementById('btnReveal');
    const filterButtons = document.querySelectorAll('#learnTabs button');

    if (!wordEl || !posEl || !diffEl || !defEl || !exEl || !liveEl) {
      return;
    }

    let allWords = [];
    let words = [];
    let currentFilter = 'all';
    let currentIndex = 0;
    let isRevealed = false;
    let lastRenderedId = null;
    const wordStats = loadStats();

    const bumpSeen = (word) => {
      const existing = wordStats[word.id] || { seen: 0, correct: 0, incorrect: 0, learned: false };
      existing.seen = (existing.seen || 0) + 1;
      wordStats[word.id] = existing;
      saveStats(wordStats);
    };

    const renderCard = () => {
      if (!words.length) {
        liveEl.textContent = 'No words available for this filter.';
        wordEl.textContent = '';
        posEl.textContent = '';
        diffEl.textContent = '';
        defEl.textContent = '';
        exEl.textContent = '';
        return;
      }

      const word = words[currentIndex];
      if (word.id !== lastRenderedId) {
        bumpSeen(word);
        lastRenderedId = word.id;
      }

      wordEl.textContent = word.term;
      posEl.textContent = word.partOfSpeech || '';
      diffEl.textContent = labelDifficulty(word.difficulty);
      defEl.textContent = isRevealed ? word.definition : '';
      exEl.textContent = isRevealed ? word.example : '';

      const statusDifficulty = labelDifficulty(word.difficulty) || 'N/A';
      liveEl.textContent = `Viewing word ${currentIndex + 1} of ${words.length} (difficulty: ${statusDifficulty})`;
    };

    const shuffleIndex = () => {
      if (!words.length) return 0;
      return Math.floor(Math.random() * words.length);
    };

    const goPrev = () => {
      if (!words.length) return;
      currentIndex = (currentIndex - 1 + words.length) % words.length;
      isRevealed = false;
      renderCard();
    };

    const goNext = () => {
      if (!words.length) return;
      currentIndex = (currentIndex + 1) % words.length;
      isRevealed = false;
      renderCard();
    };

    const goShuffle = () => {
      if (!words.length) return;
      currentIndex = shuffleIndex();
      isRevealed = false;
      renderCard();
    };

    const toggleReveal = () => {
      if (!words.length) return;
      isRevealed = !isRevealed;
      renderCard();
    };

    const applyFilter = () => {
      if (currentFilter === 'all') {
        words = allWords.slice();
      } else {
        words = allWords.filter((w) => w.difficulty === currentFilter);
      }

      if (!words.length) {
        currentIndex = 0;
        isRevealed = false;
        lastRenderedId = null;
        renderCard();
        return;
      }

      if (currentIndex >= words.length) {
        currentIndex = words.length - 1;
      }
      isRevealed = false;
      lastRenderedId = null;
      renderCard();
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter || 'all';
        currentFilter = filter;
        filterButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
        applyFilter();
      });
    });

    btnPrev && btnPrev.addEventListener('click', goPrev);
    btnNext && btnNext.addEventListener('click', goNext);
    btnShuffle && btnShuffle.addEventListener('click', goShuffle);
    btnReveal && btnReveal.addEventListener('click', toggleReveal);

    fetch(DATA_URL, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load data');
        return res.json();
      })
      .then((data) => {
        allWords = normalizeWords(data);
        if (!allWords.length) {
          liveEl.textContent = 'No words available.';
          return;
        }
        currentIndex = 0;
        isRevealed = false;
        applyFilter();
      })
      .catch(() => {
        liveEl.textContent = 'Unable to load vocabulary data. Please try again later.';
      });
  });
})();
