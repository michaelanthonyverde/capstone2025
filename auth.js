(function () {
  const path = (window.location.pathname.split('/').pop() || '').toLowerCase();
  const loggedInUser = localStorage.getItem('loggedInUser');

  if ((path === 'login.html' || path === 'signup.html') && loggedInUser) {
    window.location.replace('index.html');
    return;
  }

  if (path === 'profile.html' && !loggedInUser) {
    window.location.replace('login.html');
    return;
  }

  function formatWordsLearned(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed.toString() : '0';
  }

  function handleLogout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('loggedInUser');
    const loginLink = document.getElementById('navLogin');
    const logoutButton = document.getElementById('navLogout');
    const profileLogout = document.getElementById('profileLogout');
    const headerUser = document.getElementById('siteUser');
    const profileName = document.getElementById('profileName');
    const wordsLearnedEl = document.getElementById('wordsLearned');

    if (user) {
      if (loginLink) loginLink.hidden = true;
      if (logoutButton) logoutButton.hidden = false;
      if (headerUser) headerUser.textContent = `Welcome, ${user}!`;
      if (profileName) profileName.textContent = user;
      if (wordsLearnedEl) {
        const stored = localStorage.getItem('gre.wordsLearned') || localStorage.getItem('wordsLearned') || '0';
        wordsLearnedEl.textContent = formatWordsLearned(stored);
      }
    } else {
      if (loginLink) loginLink.hidden = false;
      if (logoutButton) logoutButton.hidden = true;
      if (headerUser) headerUser.textContent = '';
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }
    if (profileLogout) {
      profileLogout.addEventListener('click', handleLogout);
    }
  });
})();
