# Feature development

* [x] Feature 1.0 make Gin theme respond to theme switcher as defined in bm_core module.
- bm_core adds to html the attribute data-theme="light", data-theme="dark" or removes the attribute to follow the system setting.
  The Gin theme does not respond to this.
  Make the alterations in the bm_gin module, to make gin switch dark and light mode based on that attribute.

codex: Implemented JS behavior to watch `html[data-theme]` and toggle `gin--dark-mode` so Gin follows bm_core switcher (Mondial-IT BV, 2026-01-06). Library updated to include the behavior.

* [x] Feature 2.0 Bridge icon packs to Gin toolbar `--icon` CSS for all menu links.
- Goal: Any menu link that defines `options.icon: { pack_id, icon_id }` should automatically render its icon in Gin’s navigation/toolbar by setting the correct `--icon` mask URL for the generated `toolbar-icon-{plugin_id}` class (Gin ignores `settings.class`).
- Plan:
  1) Add a helper in bm_gin (e.g., service + static) to resolve icon URLs via the icon pack API: use `plugin.manager.icon_pack`, call `getIcon(pack:icon)`, take `getSource()`, and build a web-absolute URL using provider path (module/theme) and `base_path()` when the source is relative.
  2) Implement `hook_navigation_menu_link_tree_alter()` (or an event subscriber) to scan accessible tree items, read `options.icon` from each link, resolve the URL via the helper, and store a map of `{ css_class => url }`, where `css_class` is the sanitized plugin id matching Gin’s `toolbar-icon-{plugin_id}`.
  3) Implement `hook_page_attachments()` to emit a single `<style>` tag in `<head>` that sets `--icon` for each mapped class and applies mask/background defaults, e.g.:
     `.toolbar .toolbar-icon-{class}::before { --icon: url('…'); mask-image: var(--icon); -webkit-mask-image: var(--icon); background-image: var(--icon); background-repeat: no-repeat; background-position: center; background-size: 1.25rem 1.25rem; content: ''; }`
     Use the resolved absolute URL so aggregation/moves are safe.
  4) Keep the existing icon pack definitions in their modules (e.g., `*.icons.yml`); bm_gin just bridges them to Gin’s CSS variable.
  5) Add tests/manual steps: ensure menu links with `options.icon` (e.g., bm_main links) show custom icons in Gin after `drush cr`.

codex: Added navigation tree alter + icon resolver to map `options.icon` (pack_id/icon_id) into Gin toolbar `--icon` CSS via a head `<style>`; resolves pack sources to absolute URLs using provider paths. README updated. (Mondial-IT BV, 2026-01-08)

codex: Revised implementation to work with Toolbar (Navigation module not enabled): builds the admin menu tree via menu.link_tree (enabled links only, no current-route filter), extracts `options.icon`, resolves pack URLs, injects `--icon` CSS, and logs contributing providers on admin routes. (Mondial-IT BV, 2026-01-08)
