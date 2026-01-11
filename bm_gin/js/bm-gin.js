(function (Drupal) {
  /**
   * Sync Gin dark mode with bm_core theme switcher.
   *
   * Mondial-IT BV, 2026-01-06: Watch html[data-theme] and toggle
   * gin--dark-mode so Gin follows the switcher (light/dark/system).
   */
  function applyGinTheme(root) {
    const theme = root.dataset.theme;
    const darkClass = 'gin--dark-mode';

    if (theme === 'dark') {
      root.classList.add(darkClass);
    }
    else if (theme === 'light') {
      root.classList.remove(darkClass);
    }
    else {
      // No explicit theme: defer to Gin’s own darkmode or system preference.
      // Do not change class in this case.
    }
  }

  Drupal.behaviors.bmGinThemeSync = {
    attach() {
      const root = document.documentElement;
      applyGinTheme(root);

      // Observe changes to data-theme (e.g., bm_core switcher toggles).
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            applyGinTheme(root);
          }
        }
      });

      observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    },
  };
})(Drupal);
