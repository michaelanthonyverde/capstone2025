(function () {
  const STORAGE_KEY = 'gre.userName';

  function getUserName() {
    return (localStorage.getItem(STORAGE_KEY) || '').trim();
  }

  function setUserName(name) {
    localStorage.setItem(STORAGE_KEY, name);
  }

  function clearUserName() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function updateHeader() {
    const name = getUserName();
    const headerUser = document.getElementById('siteUser');
    const loginLink = document.getElementById('navLogin');
    const logoutButton = document.getElementById('navLogout');

    if (name) {
      if (headerUser) headerUser.textContent = `Signed in as ${name}`;
      if (loginLink) loginLink.hidden = true;
      if (logoutButton) logoutButton.hidden = false;
    } else {
      if (headerUser) headerUser.textContent = 'Not signed in';
      if (loginLink) loginLink.hidden = false;
      if (logoutButton) logoutButton.hidden = true;
    }
  }

  function handleLogout() {
    clearUserName();
    updateHeader();
    window.location.href = 'index.html';
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateHeader();

    const logoutButton = document.getElementById('navLogout');
    const profileLogout = document.getElementById('profileLogout');

    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }
    if (profileLogout) {
      profileLogout.addEventListener('click', handleLogout);
    }
  });

  window.greAuth = {
    getUserName,
    setUserName,
    clearUserName,
    updateHeader,
  };
})();
