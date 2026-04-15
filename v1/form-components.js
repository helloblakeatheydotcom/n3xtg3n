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

document.querySelectorAll('.number-stepper').forEach((wrapper) => {
  const input = wrapper.querySelector('input[type="number"]');
  const up = wrapper.querySelector('.step-up');
  const down = wrapper.querySelector('.step-down');

  if (!input || !up || !down) return;

  const getStep = () => parseFloat(input.step) || 1;

  up.addEventListener('click', () => {
    input.value = (parseFloat(input.value) || 0) + getStep();
    input.dispatchEvent(new Event('change'));
  });

  down.addEventListener('click', () => {
    input.value = (parseFloat(input.value) || 0) - getStep();
    input.dispatchEvent(new Event('change'));
  });
});

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const clean = digits.length > 0 && digits[0] === '1' ? digits.slice(1) : digits;
  const match = clean.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (!match) return value;

  return (
    '+1' +
    (match[1] ? ` (${match[1]}` : '') +
    (match[1].length === 3 ? ')' : '') +
    (match[2] ? ` ${match[2]}` : '') +
    (match[3] ? `-${match[3]}` : '')
  );
};

const phoneInput = document.getElementById('home-phone');
if (phoneInput) {
  phoneInput.addEventListener('input', (event) => {
    const target = event.target;
    target.value = formatPhone(target.value);
  });
}

const interactiveInput = document.getElementById('state-interactive');
const interactiveError = document.getElementById('state-interactive-error');

if (interactiveInput && interactiveError) {
  const validate = () => {
    const isValid = interactiveInput.value.trim().length > 0;
    interactiveError.textContent = isValid ? '' : 'This field is required.';

    if (isValid) {
      interactiveInput.removeAttribute('aria-invalid');
    } else {
      interactiveInput.setAttribute('aria-invalid', 'true');
    }
  };

  interactiveInput.addEventListener('blur', validate);
  interactiveInput.addEventListener('input', () => {
    if (interactiveInput.getAttribute('aria-invalid') === 'true') validate();
  });
}
