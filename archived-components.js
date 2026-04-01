const archiveButtons = Array.from(document.querySelectorAll('.archive-link'));
const archiveViewerTitle = document.querySelector('#archive-viewer-title');
const archiveViewerCopy = document.querySelector('#archive-viewer-copy');
const archiveViewerNotes = document.querySelector('#archive-viewer-notes');
const archiveOpenLink = document.querySelector('#archive-open-link');

const setActiveArchive = (button) => {
  if (!button || !archiveViewerTitle || !archiveViewerCopy || !archiveViewerNotes || !archiveOpenLink) return;

  archiveButtons.forEach((item) => {
    const isActive = item === button;
    item.classList.toggle('is-active', isActive);
    item.setAttribute('aria-selected', String(isActive));
  });

  const target = button.getAttribute('data-archive-target');
  const title = button.getAttribute('data-archive-title') || 'Archived Component';
  const summary = button.getAttribute('data-archive-summary') || '';
  const notes = button.getAttribute('data-archive-notes') || '';

  archiveViewerTitle.textContent = title;
  archiveViewerCopy.textContent = summary;
  archiveViewerNotes.textContent = notes;
  archiveOpenLink.href = target;
};

archiveButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveArchive(button);
  });
});
