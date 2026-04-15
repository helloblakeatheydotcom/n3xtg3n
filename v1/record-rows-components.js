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

document.querySelectorAll('[data-selectable-record-row]').forEach((row) => {
  const checkbox = row.querySelector('.record-row-selection input[type="checkbox"]');
  if (!checkbox) return;

  row.addEventListener('click', (event) => {
    if (event.target.closest('button, a, input, label, textarea, select')) {
      return;
    }

    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  });

  row.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target !== row) return;

    event.preventDefault();
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  });
});
