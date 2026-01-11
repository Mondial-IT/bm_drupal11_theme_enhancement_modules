# bm_darklight

Provides a standalone light/dark/system theme switcher component:

- Twig component `bm_darklight_switcher` renders three buttons.
- JS toggles `data-theme` on `<html>` and stores choice in `localStorage` (`bm-darklight-theme`).
- CSS for simple layout; your theme can react to `data-theme` (e.g., `:root[data-theme="dark"]`).
- Demo: `/admin/config/user-interface/bm-darklight/theme-switcher-demo`.

Usage snippet:
```php
$form['switcher'] = ['#theme' => 'bm_darklight_switcher'];
$form['#attached']['library'][] = 'bm_darklight/theme_switcher';
```
