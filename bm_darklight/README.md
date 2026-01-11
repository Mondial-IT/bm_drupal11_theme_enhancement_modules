## BM Darklight

Standalone light/dark/system theme switcher component for admin UI.

- Adds a Twig component `bm_darklight_switcher` with a three-position radio-style switcher (Light, Dark, System).
- JS toggles `data-theme` on `<html>` and persists the choice in `localStorage` (`bm-darklight-theme`).
- CSS keeps the buttons aligned; no styling beyond that—your CSS consumes `data-theme` as needed.
- Demo form at `/admin/config/user-interface/bm-darklight/theme-switcher-demo`.

Usage:
```php
$form['theme_switcher'] = [
  '#theme' => 'bm_darklight_switcher',
];
$form['#attached']['library'][] = 'bm_darklight/theme_switcher';
```
