    // Custom stepper behavior
    document.querySelectorAll('.number-stepper').forEach(wrapper => {
      const input = wrapper.querySelector('input[type="number"]');
      const up = wrapper.querySelector('.step-up');
      const down = wrapper.querySelector('.step-down');
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

    // Phone number live formatting
    function formatPhone(value) {
      const d = value.replace(/\D/g, "").slice(0, 11);
      const clean = (d.length > 0 && d[0] === "1") ? d.slice(1) : d;
      const match = clean.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (!match) return value;
      return "+1" + (match[1] ? ` (${match[1]}` : "") + (match[1].length === 3 ? ")" : "") + (match[2] ? ` ${match[2]}` : "") + (match[3] ? `-${match[3]}` : "");
    }

    const phoneInput = document.getElementById("home-phone");
    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => {
        const target = e.target;
        target.value = formatPhone(target.value);
      });
    }

    // Interactive required field validation
    const interactiveInput = document.getElementById('state-interactive');
    const interactiveError = document.getElementById('state-interactive-error');

    if (interactiveInput && interactiveError) {
      const validate = () => {
        const isValid = interactiveInput.value.trim().length > 0;
        interactiveError.textContent = isValid ? '' : 'This field is required.';
        isValid ? interactiveInput.removeAttribute('aria-invalid') : interactiveInput.setAttribute('aria-invalid', 'true');
      };
      
      interactiveInput.addEventListener('blur', validate);
      interactiveInput.addEventListener('input', () => {
        if (interactiveInput.getAttribute('aria-invalid') === 'true') validate();
      });
    }
