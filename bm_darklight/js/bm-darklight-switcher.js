// bm_darklight/js/bm-theme-switcher.js
(function (Drupal, once) {
  Drupal.behaviors.bmDarklightSwitcher = {
    attach(context) {
      once('bm-darklight-switcher', '[data-bm-darklight-switcher]', context).forEach(wrapper => {
        const options = wrapper.querySelectorAll('input[type="radio"][data-theme]');

        const setActive = (theme) => {
          options.forEach(option => {
            option.checked = option.dataset.theme === theme;
          });
        };

        const applyTheme = (theme) => {
          if (theme === 'system') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem('bm-darklight-theme');
          }
          else {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('bm-darklight-theme', theme);
          }
        };

        options.forEach(option => {
          option.addEventListener('change', () => {
            const theme = option.dataset.theme;
            applyTheme(theme);
            setActive(theme === 'system' ? 'system' : theme);
          });
          // Also handle clicks on labels (if change doesn’t fire for some reason).
          const label = wrapper.querySelector(`label[for=\"${option.id}\"]`);
          if (label) {
            label.addEventListener('click', () => {
              option.checked = true;
              const theme = option.dataset.theme;
              applyTheme(theme);
              setActive(theme === 'system' ? 'system' : theme);
            });
          }
        });

        // Initialize active state from saved or current attribute.
        const savedTheme = localStorage.getItem('bm-darklight-theme');
        const current = savedTheme || document.documentElement.getAttribute('data-theme') || 'system';
        if (savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
        }
        setActive(current);
      });
    }
  };
})(Drupal, once);
