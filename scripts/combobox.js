const closeCombobox = (combobox) => {
  const input = combobox.querySelector('[data-combobox-input]');
  const list = combobox.querySelector('[data-combobox-list]');
  if (!(input instanceof HTMLInputElement) || !(list instanceof HTMLElement)) {
    return;
  }

  input.setAttribute('aria-expanded', 'false');
  list.hidden = true;
};

const normalizedComboboxValue = (value) => String(value || '').trim().toLowerCase();

const isComboboxMultiple = (combobox) => combobox.dataset.comboboxMultiple === 'true';
const isComboboxGrouped = (combobox) => combobox.dataset.comboboxGrouped === 'true';

const getComboboxSelectedValues = (combobox) => {
  return (combobox.dataset.comboboxSelectedValues || '')
    .split('|')
    .map((value) => value.trim())
    .filter(Boolean);
};

const syncComboboxClear = (combobox) => {
  const input = combobox.querySelector('[data-combobox-input]');
  const clearButton = combobox.querySelector('[data-combobox-clear]');
  if (!(clearButton instanceof HTMLButtonElement) || !(input instanceof HTMLInputElement)) {
    return;
  }

  const hasValue = isComboboxMultiple(combobox)
    ? getComboboxSelectedValues(combobox).length > 0
    : Boolean(input.value.trim());

  clearButton.classList.toggle('is-visible', hasValue);
};

const createComboboxXIcon = () => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 16 16');
  icon.setAttribute('focusable', 'false');
  icon.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M4.5 4.5l7 7M11.5 4.5l-7 7');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-linecap', 'round');
  icon.appendChild(path);

  return icon;
};

const createComboboxCheckIcon = () => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('class', 'combobox-option-check');
  icon.setAttribute('viewBox', '0 0 16 16');
  icon.setAttribute('focusable', 'false');
  icon.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M13 4.5 6.75 11 3 7.25');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  icon.appendChild(path);

  return icon;
};

const renderComboboxSelectedValues = (combobox) => {
  const input = combobox.querySelector('[data-combobox-input]');
  const valuesContainer = combobox.querySelector('[data-combobox-values]');
  if (!(input instanceof HTMLInputElement) || !(valuesContainer instanceof HTMLElement)) {
    return;
  }

  const selectedValues = getComboboxSelectedValues(combobox);
  valuesContainer.innerHTML = '';

  selectedValues.forEach((value) => {
    const chip = document.createElement('span');
    chip.className = 'combobox-chip';

    const chipLabel = document.createElement('span');
    chipLabel.className = 'combobox-chip-label';
    chipLabel.textContent = value;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'combobox-chip-remove';
    removeButton.dataset.comboboxChipRemove = value;
    removeButton.setAttribute('aria-label', `Remove ${value}`);
    removeButton.appendChild(createComboboxXIcon());

    chip.append(chipLabel, removeButton);
    valuesContainer.appendChild(chip);
  });

  input.placeholder = selectedValues.length ? '' : 'Select accommodations';
};

const setComboboxSelectedValues = (combobox, values) => {
  const input = combobox.querySelector('[data-combobox-input]');
  const uniqueValues = [];
  const seenValues = new Set();

  values.forEach((value) => {
    const normalizedValue = normalizedComboboxValue(value);
    if (!normalizedValue || seenValues.has(normalizedValue)) {
      return;
    }

    seenValues.add(normalizedValue);
    uniqueValues.push(value);
  });

  combobox.dataset.comboboxSelectedValues = uniqueValues.join('|');
  combobox.classList.toggle('has-values', uniqueValues.length > 0);

  if (input instanceof HTMLInputElement) {
    input.value = isComboboxMultiple(combobox) ? '' : uniqueValues.join(', ');
  }

  renderComboboxSelectedValues(combobox);
  syncComboboxClear(combobox);
};

const isComboboxValueSelected = (combobox, value) => {
  if (!isComboboxMultiple(combobox)) {
    const input = combobox.querySelector('[data-combobox-input]');
    return input instanceof HTMLInputElement && normalizedComboboxValue(input.value) === normalizedComboboxValue(value);
  }

  return getComboboxSelectedValues(combobox).some((selectedValue) => {
    return normalizedComboboxValue(selectedValue) === normalizedComboboxValue(value);
  });
};

const parseComboboxOption = (option, group = '') => {
  const [value, ...metaParts] = option.split('::');

  return {
    value: value.trim(),
    meta: metaParts.join('::').trim(),
    group,
  };
};

const getComboboxBaseOptions = (combobox) => {
  if (combobox.dataset.comboboxGroups) {
    return combobox.dataset.comboboxGroups
      .split(';')
      .flatMap((groupEntry) => {
        const [groupLabel, optionsText = ''] = groupEntry.split('=>');
        const group = groupLabel.trim();

        return optionsText
          .split('|')
          .map((option) => parseComboboxOption(option, group))
          .filter((option) => option.value);
      });
  }

  return (combobox.dataset.comboboxOptions || '')
    .split('|')
    .map((option) => parseComboboxOption(option))
    .filter((option) => option.value);
};

const getComboboxAddedOptions = (combobox) => {
  return (combobox.dataset.comboboxAddedOptions || '')
    .split('|')
    .map((option) => parseComboboxOption(option))
    .filter((option) => option.value)
    .map((option) => ({
      ...option,
      group: isComboboxGrouped(combobox) ? 'Added' : '',
    }));
};

const setComboboxAddedOptions = (combobox, options) => {
  combobox.dataset.comboboxAddedOptions = options.map((option) => option.value).join('|');
};

const getComboboxOptions = (combobox) => {
  const baseOptions = getComboboxBaseOptions(combobox);
  const addedOptions = getComboboxAddedOptions(combobox);
  const seenOptions = new Set();

  return [...baseOptions, ...addedOptions].filter((option) => {
    const normalizedOption = normalizedComboboxValue(option.value);
    if (seenOptions.has(normalizedOption)) {
      return false;
    }

    seenOptions.add(normalizedOption);
    return true;
  });
};

const isComboboxAddedOption = (combobox, value) => {
  return getComboboxAddedOptions(combobox).some((option) => {
    return normalizedComboboxValue(option.value) === normalizedComboboxValue(value);
  });
};

const getComboboxKeyboardTargets = (list) => {
  return Array.from(list.querySelectorAll('[data-combobox-action="select"], [data-combobox-action="add"]'))
    .filter((target) => target instanceof HTMLButtonElement);
};

const focusComboboxTarget = (target) => {
  target.focus();
  target.scrollIntoView({ block: 'nearest' });
};

const focusOutsideCombobox = (combobox, backwards = false) => {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  const focusableElements = Array.from(document.querySelectorAll(focusableSelector))
    .filter((element) => {
      return element instanceof HTMLElement
        && !combobox.contains(element)
        && !element.closest('[hidden]')
        && element.offsetParent !== null;
    });

  const nextElement = backwards
    ? focusableElements.reverse().find((element) => {
      return Boolean(element.compareDocumentPosition(combobox) & Node.DOCUMENT_POSITION_FOLLOWING);
    })
    : focusableElements.find((element) => {
      return Boolean(combobox.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
    });

  if (nextElement instanceof HTMLElement) {
    nextElement.focus();
  }
};

const closeComboboxAndFocusInput = (combobox) => {
  const input = combobox.querySelector('[data-combobox-input]');
  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  combobox.dataset.comboboxSuppressOpen = 'true';
  closeCombobox(combobox);
  input.focus();
};

const renderComboboxOptions = (combobox, showAll = false, focusSearch = false, preservedScrollTop = 0) => {
  const input = combobox.querySelector('[data-combobox-input]');
  const list = combobox.querySelector('[data-combobox-list]');
  if (!(input instanceof HTMLInputElement) || !(list instanceof HTMLElement)) {
    return;
  }

  const rawValue = combobox.dataset.comboboxSearchValue || '';
  const trimmedValue = rawValue.trim();
  const query = normalizedComboboxValue(rawValue);
  const isGrouped = isComboboxGrouped(combobox);
  const isMultiple = isComboboxMultiple(combobox);
  const options = getComboboxOptions(combobox);
  const matches = options.filter((option) => {
    return showAll || !query || normalizedComboboxValue(`${option.value} ${option.meta} ${option.group}`).includes(query);
  });
  const hasExactMatch = options.some((option) => normalizedComboboxValue(option.value) === query);
  list.innerHTML = '';

  const searchRow = document.createElement('div');
  searchRow.className = 'combobox-search';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'combobox-search-input';
  searchInput.value = rawValue;
  searchInput.placeholder = combobox.dataset.comboboxSearchPlaceholder || 'Search staff';
  searchInput.setAttribute('aria-label', combobox.dataset.comboboxSearchPlaceholder || 'Search staff options');
  searchInput.dataset.comboboxSearch = '';

  searchRow.appendChild(searchInput);
  list.appendChild(searchRow);

  const optionsWrap = document.createElement('div');
  optionsWrap.className = 'combobox-options';
  optionsWrap.classList.toggle('combobox-list--grouped', isGrouped);
  list.appendChild(optionsWrap);

  let previousGroup = '';

  matches.forEach((option) => {
    if (option.group && option.group !== previousGroup) {
      const groupLabel = document.createElement('div');
      groupLabel.className = 'combobox-group';
      groupLabel.textContent = option.group;
      optionsWrap.appendChild(groupLabel);
      previousGroup = option.group;
    }

    const isSelected = isComboboxValueSelected(combobox, option.value);
    const optionRow = document.createElement('div');
    optionRow.className = 'combobox-option';
    optionRow.setAttribute('role', 'option');
    optionRow.setAttribute('aria-selected', isSelected ? 'true' : 'false');

    const optionButton = document.createElement('button');
    optionButton.type = 'button';
    optionButton.className = 'combobox-option-select';
    optionButton.dataset.comboboxAction = 'select';
    optionButton.dataset.comboboxValue = option.value;
    optionButton.setAttribute('aria-pressed', isMultiple ? String(isSelected) : 'false');

    const optionMain = document.createElement('span');
    optionMain.className = 'combobox-option-main';
    optionMain.textContent = option.value;
    if (option.meta) {
      optionMain.classList.add('combobox-option-main--with-meta');
    }
    optionButton.appendChild(optionMain);

    if (option.meta) {
      const optionMeta = document.createElement('span');
      optionMeta.className = 'combobox-option-meta';
      optionMeta.textContent = option.meta;
      optionButton.appendChild(optionMeta);
    }

    optionRow.appendChild(optionButton);
    optionRow.appendChild(createComboboxCheckIcon());

    if (isComboboxAddedOption(combobox, option.value)) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'combobox-option-remove';
      removeButton.dataset.comboboxAction = 'remove';
      removeButton.dataset.comboboxValue = option.value;
      removeButton.setAttribute('aria-label', `Remove ${option.value}`);
      removeButton.appendChild(createComboboxXIcon());
      optionRow.appendChild(removeButton);
    }

    optionsWrap.appendChild(optionRow);
  });

  if (!isMultiple && trimmedValue && !hasExactMatch) {
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'combobox-option combobox-option--add';
    addButton.setAttribute('role', 'option');
    addButton.dataset.comboboxAction = 'add';
    addButton.dataset.comboboxValue = trimmedValue;
    addButton.textContent = `+ Add "${trimmedValue}"`;
    optionsWrap.appendChild(addButton);
  }

  if (!matches.length) {
    const empty = document.createElement('div');
    empty.className = 'combobox-empty';
    empty.textContent = trimmedValue ? 'No existing matches' : 'No matches';
    optionsWrap.insertBefore(empty, optionsWrap.firstChild);
  }

  if (focusSearch) {
    requestAnimationFrame(() => {
      optionsWrap.scrollTop = preservedScrollTop;
      searchInput.focus();
      searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    });
  }
};

const openCombobox = (combobox, showAll = false) => {
  const input = combobox.querySelector('[data-combobox-input]');
  const list = combobox.querySelector('[data-combobox-list]');
  if (!(input instanceof HTMLInputElement) || !(list instanceof HTMLElement)) {
    return;
  }

  document.querySelectorAll('[data-combobox]').forEach((otherCombobox) => {
    if (otherCombobox !== combobox) {
      closeCombobox(otherCombobox);
    }
  });

  renderComboboxOptions(combobox, showAll, true);
  input.setAttribute('aria-expanded', 'true');
  list.hidden = false;
};

document.querySelectorAll('[data-combobox]').forEach((combobox) => {
  const input = combobox.querySelector('[data-combobox-input]');
  const list = combobox.querySelector('[data-combobox-list]');
  const inputWrap = combobox.querySelector('.combobox-input-wrap');
  if (!(input instanceof HTMLInputElement) || !(list instanceof HTMLElement)) {
    return;
  }

  if (isComboboxMultiple(combobox) && getComboboxSelectedValues(combobox).length > 0) {
    combobox.classList.add('has-values');
  }

  syncComboboxClear(combobox);
  renderComboboxSelectedValues(combobox);

  input.addEventListener('focus', () => {
    if (combobox.dataset.comboboxSuppressOpen === 'true') {
      delete combobox.dataset.comboboxSuppressOpen;
      return;
    }

    openCombobox(combobox, true);
  });

  input.addEventListener('click', () => openCombobox(combobox, true));

  inputWrap?.addEventListener('pointerdown', (event) => {
    if (!isComboboxMultiple(combobox)) {
      return;
    }

    if (event.target instanceof Element && event.target.closest('button')) {
      return;
    }

    event.preventDefault();
    openCombobox(combobox, true);
  });

  inputWrap?.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) {
      return;
    }

    openCombobox(combobox, true);
  });

  input.addEventListener('input', () => {
    if (isComboboxMultiple(combobox)) {
      return;
    }

    combobox.dataset.comboboxSearchValue = input.value;
    syncComboboxClear(combobox);
    openCombobox(combobox);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeCombobox(combobox);
      return;
    }

    if (event.key === 'Tab' && input.getAttribute('aria-expanded') === 'true') {
      closeCombobox(combobox);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      event.preventDefault();
      openCombobox(combobox, true);
    }
  });

  combobox.querySelector('[data-combobox-clear]')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isComboboxMultiple(combobox)) {
      setComboboxSelectedValues(combobox, []);
    } else {
      input.value = '';
      syncComboboxClear(combobox);
    }

    combobox.dataset.comboboxSearchValue = '';
    closeCombobox(combobox);
    combobox.dataset.comboboxSuppressOpen = 'true';
    input.focus();
  });

  combobox.querySelector('[data-combobox-values]')?.addEventListener('click', (event) => {
    const removeButton = event.target instanceof Element
      ? event.target.closest('[data-combobox-chip-remove]')
      : null;

    if (!(removeButton instanceof HTMLElement)) {
      input.focus();
      return;
    }

    event.stopPropagation();
    const nextValue = removeButton.dataset.comboboxChipRemove;
    if (!nextValue) {
      return;
    }

    const nextValues = getComboboxSelectedValues(combobox).filter((value) => {
      return normalizedComboboxValue(value) !== normalizedComboboxValue(nextValue);
    });

    setComboboxSelectedValues(combobox, nextValues);

    if (input.getAttribute('aria-expanded') === 'true') {
      const scrollTop = list.querySelector('.combobox-options')?.scrollTop || 0;
      renderComboboxOptions(combobox, false, true, scrollTop);
    } else {
      combobox.dataset.comboboxSuppressOpen = 'true';
      input.focus();
    }
  });

  combobox.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    if (input.getAttribute('aria-expanded') !== 'true') {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    closeComboboxAndFocusInput(combobox);
  });

  list.addEventListener('mousedown', (event) => {
    if (event.target instanceof HTMLElement && event.target.closest('[data-combobox-search]')) {
      return;
    }

    event.preventDefault();
  });

  list.addEventListener('input', (event) => {
    const searchInput = event.target instanceof HTMLElement
      ? event.target.closest('[data-combobox-search]')
      : null;
    if (!(searchInput instanceof HTMLInputElement)) {
      return;
    }

    combobox.dataset.comboboxSearchValue = searchInput.value;
    renderComboboxOptions(combobox, false, true);
  });

  list.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeComboboxAndFocusInput(combobox);
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      closeCombobox(combobox);
      focusOutsideCombobox(combobox, event.shiftKey);
      return;
    }

    const searchInput = list.querySelector('[data-combobox-search]');
    const targets = getComboboxKeyboardTargets(list);
    const activeElement = document.activeElement;
    const activeTargetIndex = targets.findIndex((target) => target === activeElement);

    if (event.key === 'Enter' && activeElement === searchInput && targets.length) {
      event.preventDefault();
      targets[0].click();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!targets.length) {
        return;
      }

      if (activeElement === searchInput || activeTargetIndex === -1) {
        focusComboboxTarget(targets[0]);
        return;
      }

      focusComboboxTarget(targets[Math.min(activeTargetIndex + 1, targets.length - 1)]);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (!targets.length || activeElement === searchInput) {
        return;
      }

      if (activeTargetIndex <= 0) {
        searchInput?.focus();
        return;
      }

      focusComboboxTarget(targets[activeTargetIndex - 1]);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      searchInput?.focus();
      return;
    }

    if (event.key === 'End' && targets.length) {
      event.preventDefault();
      focusComboboxTarget(targets[targets.length - 1]);
    }
  });

  list.addEventListener('click', (event) => {
    event.stopPropagation();

    const target = event.target instanceof Element
      ? event.target.closest('[data-combobox-action]')
      : null;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.dataset.comboboxAction;
    const nextValue = target.dataset.comboboxValue?.trim();
    if (!nextValue) {
      return;
    }

    if (action === 'add') {
      const exists = getComboboxOptions(combobox).some((option) => {
        return normalizedComboboxValue(option.value) === normalizedComboboxValue(nextValue);
      });

      if (!exists) {
        setComboboxAddedOptions(combobox, [...getComboboxAddedOptions(combobox), { value: nextValue, meta: '' }]);
      }
    }

    if (action === 'remove') {
      const nextOptions = getComboboxAddedOptions(combobox).filter((option) => {
        return normalizedComboboxValue(option.value) !== normalizedComboboxValue(nextValue);
      });
      setComboboxAddedOptions(combobox, nextOptions);

      if (normalizedComboboxValue(input.value) === normalizedComboboxValue(nextValue)) {
        input.value = '';
        syncComboboxClear(combobox);
      }

      openCombobox(combobox, true);
      return;
    }

    if (isComboboxMultiple(combobox)) {
      const scrollTop = list.querySelector('.combobox-options')?.scrollTop || 0;
      const selectedValues = getComboboxSelectedValues(combobox);
      const isSelected = selectedValues.some((value) => {
        return normalizedComboboxValue(value) === normalizedComboboxValue(nextValue);
      });
      const nextValues = isSelected
        ? selectedValues.filter((value) => normalizedComboboxValue(value) !== normalizedComboboxValue(nextValue))
        : [...selectedValues, nextValue];

      setComboboxSelectedValues(combobox, nextValues);
      combobox.dataset.comboboxSearchValue = '';
      renderComboboxOptions(combobox, true, true, scrollTop);
      return;
    }

    input.value = nextValue;
    combobox.dataset.comboboxSearchValue = '';
    syncComboboxClear(combobox);
    closeCombobox(combobox);
  });
});

document.addEventListener('click', (event) => {
  document.querySelectorAll('[data-combobox]').forEach((combobox) => {
    if (!combobox.contains(event.target)) {
      closeCombobox(combobox);
    }
  });
});
