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

const getNoticeDetails = (toggle) => {
  const controlsId = toggle.getAttribute('aria-controls');
  if (controlsId) {
    const controlledDetails = document.getElementById(controlsId);
    if (controlledDetails) return controlledDetails;
  }

  return toggle.closest('.notice__disclosure')?.querySelector('[data-notice-details]') ?? null;
};

const syncNoticeDisclosure = (toggle, details, label) => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  details.classList.toggle('is-open', isOpen);
  details.setAttribute('aria-hidden', String(!isOpen));

  if (label) {
    label.textContent = isOpen ? 'Hide details' : 'Show details';
  }
};

noticeToggles.forEach((toggle) => {
  const details = getNoticeDetails(toggle);
  const label = toggle.querySelector('[data-notice-toggle-label]') ?? toggle.querySelector('span');
  if (!details || !label) return;

  syncNoticeDisclosure(toggle, details, label);

  toggle.addEventListener('click', () => {
    const nextOpen = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(nextOpen));
    syncNoticeDisclosure(toggle, details, label);
  });
});
