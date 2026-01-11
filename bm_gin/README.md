## Enhancements to Gin administration theme

### Cosmetic
- Adds CSS tweaks for Gin admin UI.

### Support for Dark mode buttons switcher
- Adds JS behavior to sync Gin dark mode with the bm_core theme switcher:
  - Watches `html[data-theme]` and toggles `gin--dark-mode` for `dark` or removes it for `light`.
  - When no `data-theme` is present, Gin’s native setting/system preference still applies.

### Support for custom menu options using Drupal icon pack method.
- Bridges Drupal icon packs to Gin toolbar icons (Toolbar-based):
  - Reads admin menu link `options.icon` (pack_id/icon_id) from the toolbar menu tree.
  - Resolves the icon pack source to an absolute URL and injects a per-class `--icon` CSS rule for `toolbar-icon-{plugin_id}` so custom SVGs appear in Gin navigation.
  - Logs which providers contributed icons for visibility while debugging.
  - Uses `MenuLinkTree` with enabled links only (no current-route filter) to ensure admin menu items are discovered even outside admin routes.
