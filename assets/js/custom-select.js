(function () {
  function buildSelect(wrapper) {
    var select = wrapper.querySelector('select');
    if (!select) return;

    wrapper.classList.add('custom-select');
    select.setAttribute('tabindex', '-1');

    var trigger = document.createElement('div');
    trigger.className = 'custom-select__trigger';
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-expanded', 'false');

    var textSpan = document.createElement('span');
    textSpan.className = 'custom-select__text';

    var arrow = document.createElement('span');
    arrow.className = 'custom-select__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '▼';

    trigger.appendChild(textSpan);
    trigger.appendChild(arrow);

    var panel = document.createElement('div');
    panel.className = 'custom-select__panel';
    panel.setAttribute('role', 'listbox');

    var placeholder = '';

    Array.from(select.options).forEach(function (opt) {
      if (opt.classList.contains('gf_placeholder') || opt.value === '') {
        placeholder = opt.text;
        return;
      }
      var item = document.createElement('div');
      item.className = 'custom-select__option';
      item.setAttribute('role', 'option');
      item.textContent = opt.text;
      item.dataset.value = opt.value;
      if (opt.selected && opt.value !== '') {
        item.classList.add('is-selected');
        item.setAttribute('aria-selected', 'true');
      }
      panel.appendChild(item);
    });

    var currentOpt = select.options[select.selectedIndex];
    if (currentOpt && currentOpt.value !== '') {
      textSpan.textContent = currentOpt.text;
      trigger.classList.add('has-value');
    } else {
      textSpan.textContent = placeholder;
    }

    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);

    function open() {
      wrapper.classList.add('is-open');
      arrow.textContent = '▲';
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      wrapper.classList.remove('is-open');
      arrow.textContent = '▼';
      trigger.setAttribute('aria-expanded', 'false');
      panel.querySelectorAll('.custom-select__option.is-focused').forEach(function (el) {
        el.classList.remove('is-focused');
      });
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      wrapper.classList.contains('is-open') ? close() : open();
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.classList.contains('is-open') ? close() : open();
      }
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var opts = Array.from(panel.querySelectorAll('.custom-select__option'));
        var focused = panel.querySelector('.custom-select__option.is-focused');
        var idx = focused ? opts.indexOf(focused) : -1;
        var next = e.key === 'ArrowDown'
          ? opts[Math.min(idx + 1, opts.length - 1)]
          : opts[Math.max(idx - 1, 0)];
        if (focused) focused.classList.remove('is-focused');
        if (next) {
          next.classList.add('is-focused');
          if (!wrapper.classList.contains('is-open')) open();
        }
      }
    });

    panel.addEventListener('click', function (e) {
      var option = e.target.closest('.custom-select__option');
      if (!option) return;

      select.value = option.dataset.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));

      panel.querySelectorAll('.custom-select__option').forEach(function (el) {
        el.classList.remove('is-selected', 'is-focused');
        el.removeAttribute('aria-selected');
      });
      option.classList.add('is-selected');
      option.setAttribute('aria-selected', 'true');
      textSpan.textContent = option.textContent;
      trigger.classList.add('has-value');

      close();
      trigger.focus();
    });
  }

  function initCustomSelects() {
    document.querySelectorAll('.ginput_container_select').forEach(function (wrapper) {
      if (!wrapper.classList.contains('custom-select')) {
        buildSelect(wrapper);
      }
    });
  }

  // Close all open panels on outside click
  document.addEventListener('click', function () {
    document.querySelectorAll('.custom-select.is-open').forEach(function (wrapper) {
      wrapper.classList.remove('is-open');
      var arrow = wrapper.querySelector('.custom-select__arrow');
      var trigger = wrapper.querySelector('.custom-select__trigger');
      if (arrow) arrow.textContent = '▼';
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomSelects);
  } else {
    initCustomSelects();
  }

  // Re-init after Gravity Forms AJAX re-renders the form
  if (typeof jQuery !== 'undefined') {
    jQuery(document).on('gform_post_render', initCustomSelects);
  }
})();
