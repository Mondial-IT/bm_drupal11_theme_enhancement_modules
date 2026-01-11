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

## Example:
<img width="188" height="489" alt="image" src="https://github.com/user-attachments/assets/11f7ecc9-cea7-41c9-ba16-9782dd57cc09" />

#### module.links.menu.yml
```
# bm_main provides the menu
bm_icon_reports.icons_page:
  title: 'Icon catalogue2'
  description: 'Preview the icon fonts provided by the site.'
  parent: bm_main.bluemarloc_enhancements
  route_name: bm_icon_report.icons
  weight: 20
  options:
    icon:
      pack_id: bm_main
      icon_id: bluemarloc
    _admin_route: TRUE
#

```

#### icons:
icons defined in: `bm_main/assets/` example `bm_main/assets/bluemarloc.svg` becomes `icon_id: bluemarloc`

#### bm_main.icons.yml
```
bm_main:
  enabled: true
  label: 'Blue Marloc Icons'
  description: 'Icon set for Blue Marloc navigation items.'
  version: 1.x
  license:
    name: Proprietary
    url: https://bluemarloc.com
    gpl-compatible: false
  extractor: svg
  config:
    sources:
      - assets/icons/*.svg
  settings:
    size:
      title: 'Size'
      description: 'Set a size for this icon.'
      type: 'integer'
      default: 20
    class:
      title: 'Class'
      description: 'Set a class for this icon.'
      type: 'string'
      default: ''
  template: >
    <svg
      {{ attributes
          .setAttribute('viewBox', attributes.viewBox|default('0 0 24 24'))
          .setAttribute('class', class)
          .setAttribute('width', size|default('20'))
          .setAttribute('height', size|default('20'))
          .setAttribute('aria-hidden', 'true')
      }}
    >
      {{ content }}
    </svg>


```
