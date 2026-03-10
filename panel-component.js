document.querySelectorAll('[data-collapsible-panel]').forEach((panel) => {
  const toggle = panel.querySelector('.panel-toggle');
  const content = panel.querySelector('.panel-content');

  if (!toggle || !content) return;

  const setExpanded = (expanded) => {
    toggle.setAttribute('aria-expanded', String(expanded));
    content.hidden = !expanded;

    const srText = toggle.querySelector('.sr-only');
    if (srText) {
      srText.textContent = expanded ? 'Collapse section' : 'Expand section';
    }
  };

  setExpanded(toggle.getAttribute('aria-expanded') !== 'false');

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'false';
    setExpanded(!expanded);
  });
});
