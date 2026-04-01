const tabs = Array.from(document.querySelectorAll('[data-tab-target]'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

const activateTab = (button) => {
  const targetId = button.getAttribute('data-tab-target');
  if (!targetId) return;

  tabs.forEach((tab) => {
    const isActive = tab === button;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    panel.hidden = panel.id !== targetId;
  });
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab));
});

const noticeToggles = Array.from(document.querySelectorAll('[data-notice-toggle]'));

noticeToggles.forEach((toggle) => {
  const details = toggle.parentElement?.querySelector('[data-notice-details]');
  const label = toggle.querySelector('span');
  if (!details || !label) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    const nextOpen = !isOpen;
    toggle.setAttribute('aria-expanded', String(nextOpen));
    label.textContent = nextOpen ? 'Hide details' : 'Show details';
    details.classList.toggle('is-open', nextOpen);
  });
});
