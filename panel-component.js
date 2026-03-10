const getStoredExpanded = (panelId) => {
  if (!panelId) return null;
  try {
    const raw = localStorage.getItem(`panel-expanded:${panelId}`);
    if (raw === null) return null;
    return raw === 'true';
  } catch (_) {
    return null;
  }
};

const setStoredExpanded = (panelId, expanded) => {
  if (!panelId) return;
  try {
    localStorage.setItem(`panel-expanded:${panelId}`, String(expanded));
  } catch (_) {
    // Ignore storage errors.
  }
};

document.querySelectorAll('[data-collapsible-panel]').forEach((panel) => {
  const toggle = panel.querySelector('.panel-toggle');
  const content = panel.querySelector('.panel-content');
  const panelId = panel.getAttribute('data-panel-id');

  if (!toggle || !content) return;

  const setExpanded = (expanded, persist = true) => {
    toggle.setAttribute('aria-expanded', String(expanded));
    content.hidden = !expanded;

    const srText = toggle.querySelector('.sr-only');
    if (srText) {
      srText.textContent = expanded ? 'Collapse section' : 'Expand section';
    }
    if (persist) setStoredExpanded(panelId, expanded);
  };

  const storedState = getStoredExpanded(panelId);
  const initialExpanded = storedState ?? (toggle.getAttribute('aria-expanded') !== 'false');
  setExpanded(initialExpanded, false);

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'false';
    setExpanded(!expanded, true);
  });
});

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

document
  .querySelectorAll('.panel-form-grid [required][data-error-target]')
  .forEach((field) => {
    const errorTargetId = field.getAttribute('data-error-target');
    const errorNode = errorTargetId ? document.getElementById(errorTargetId) : null;

    if (!errorNode) return;

    const validate = () => {
      const isValid = field.value.trim().length > 0;
      errorNode.textContent = isValid ? '' : 'This field is required.';
      if (isValid) {
        field.removeAttribute('aria-invalid');
      } else {
        field.setAttribute('aria-invalid', 'true');
      }
    };

    field.addEventListener('blur', validate);
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate();
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate();
    });
  });
