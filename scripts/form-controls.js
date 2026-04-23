document.querySelectorAll('[data-required-demo]').forEach((input) => {
  const describedByIds = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  const error = describedByIds
    .map((id) => document.getElementById(id))
    .find((element) => element && element.classList.contains('field-error'));

  const validate = () => {
    const isValid = input.value.trim().length > 0;
    if (isValid) {
      input.removeAttribute('aria-invalid');
    } else {
      input.setAttribute('aria-invalid', 'true');
    }
    if (error) error.textContent = isValid ? '' : 'This field is required.';
  };

  input.addEventListener('blur', validate);
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') validate();
  });
});

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  const parts = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!parts) return value;
  return [
    parts[1] ? `(${parts[1]}` : '',
    parts[1] && parts[1].length === 3 ? ')' : '',
    parts[2] ? ` ${parts[2]}` : '',
    parts[3] ? `-${parts[3]}` : '',
  ].join('');
};

document.querySelectorAll('[data-phone-format]').forEach((input) => {
  input.addEventListener('input', () => {
    input.value = formatPhone(input.value);
  });
});

document.querySelectorAll('.number-stepper').forEach((wrapper) => {
  const input = wrapper.querySelector('input[type="number"]');
  const up = wrapper.querySelector('.step-up');
  const down = wrapper.querySelector('.step-down');
  if (!input || !up || !down) return;
  const getStep = () => parseFloat(input.step) || 1;
  up.addEventListener('click', () => { input.value = (parseFloat(input.value) || 0) + getStep(); });
  down.addEventListener('click', () => { input.value = (parseFloat(input.value) || 0) - getStep(); });
});

document.querySelectorAll('.segmented-control').forEach((group) => {
  group.querySelectorAll('.segmented-option').forEach((button) => {
    button.addEventListener('click', () => {
      group.querySelectorAll('.segmented-option').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
});

document.querySelectorAll('.toggle-switch').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const next = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', String(next));
  });
});
