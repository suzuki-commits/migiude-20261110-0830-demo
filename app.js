(() => {
  'use strict';

  // This preview has no network, analytics, persistence, or form submission.
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('site-nav');
  const mobileQuery = window.matchMedia('(max-width: 1120px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const groups = new Map();

  function closeMenu(restoreFocus = false) {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'メニューを開く');
    if (restoreFocus) menuButton.focus();
  }

  menuButton.hidden = false;
  menuButton.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-open', opening);
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'メニューを閉じる' : 'メニューを開く');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (mobileQuery.matches && !event.target.closest('.site-header')) closeMenu();
  });
  mobileQuery.addEventListener('change', () => {
    const focusedLink = navigation.contains(document.activeElement);
    closeMenu(mobileQuery.matches && focusedLink);
  });
  closeMenu();
  document.documentElement.classList.add('js-ready');

  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
    const select = (value, focus = false) => {
      const selected = tabs.find((tab) => tab.dataset.value === value);
      if (!selected) return;
      tabs.forEach((tab) => {
        const active = tab === selected;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      });
      if (focus) selected.focus();
    };
    groups.set(group.dataset.tabs, select);
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.value));
      tab.addEventListener('keydown', (event) => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        select(tabs[next].dataset.value, true);
      });
    });
  });

  function revealHash() {
    const hash = window.location.hash.slice(1);
    if (hash === 'career' || hash === 'recruit') groups.get('services')(hash);
    if (hash === 'contact-career' || hash === 'contact-recruit') groups.get('contact')(hash.slice(8));
    return document.getElementById(hash);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (link.dataset.track) groups.get('services')(link.dataset.track);
      if (link.dataset.contact) groups.get('contact')(link.dataset.contact);
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      event.preventDefault();
      closeMenu();
      // Native hash navigation supports Back/Forward and opening local files.
      if (window.location.hash !== link.getAttribute('href')) window.location.hash = link.getAttribute('href');
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) {
        target.tabIndex = -1;
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });
    });
  });
  window.addEventListener('hashchange', () => {
    const target = revealHash();
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  const initialTarget = revealHash();
  if (initialTarget) window.requestAnimationFrame(() => initialTarget.scrollIntoView({ behavior: 'instant', block: 'start' }));

  document.querySelectorAll('[data-preview-form]').forEach((form) => {
    const status = form.querySelector('.form-status');
    // Register the non-submitting handler before enabling the preview button.
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      status.textContent = '入力項目の確認が完了しました。これは提案プレビューのため、お問い合わせは送信されていません。入力内容の保存も行っていません。';
    });
    form.addEventListener('input', () => { status.textContent = ''; });
    form.querySelector('button[type="submit"]').disabled = false;
  });
})();
