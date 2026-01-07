## Mondial-IT Ziston Enhancements

### Overview
Custom Drupal 11 module that patches Gavias Ziston admin/editor UX: language-aware page builder content, tooltipified field descriptions, smart-crop visibility, and helper utilities for Ziston-specific forms.

### Features
- Admin library (`bm_ziston/bm_ziston`) auto-loaded on admin routes for Ziston fixes.
- Page builder language override: replace `[en|fr|nl:...]` snippets in the canonical English node per active language.
- Tippy-driven tooltips for `.desc` form hints; hierarchical select bootstrapper; `_enable` toggles to show/hide related fields with CSS injection.
- Image helpers: repair `//` img URLs to `/`, reveal smart-crop width/height fields.
- Procedural utilities for URL parsing, paragraphs traversal, and localized date formatting.
- Grid layout tooling: ships GridStack assets; see demo at https://gridstackjs.com/demo/ and docs at https://github.com/gridstack/gridstack.js.

### Technical Stack
- Drupal 11 / PHP 8.3
- Plain JS behaviors (no jQuery), Tippy for tooltips

### Installation
1. Start DDEV stack: `ddev start`
2. Enable module: `ddev exec drush en bm_ziston -y`
3. Clear caches: `ddev exec drush cr`
4. (If assets touched) restore perms: `ddev exec composer apply-permissions`

### Configuration
- Settings form: `/admin/config/system/bm-ziston` (`bm_ziston.settings_form`, permission `administer bm_ziston configuration`).
- Language override relies on English node content containing `[en|fr|nl:...]` blocks inside `gva_pagebuilder_content`.

### Usage
- Keep English node as canonical; wrap language-specific strings: `[en:Text in EN][fr:Texte FR][nl:Tekst NL]`.
- Admin forms: tooltip conversion and `_enable` class toggling run automatically when the library is attached.
- Smart-crop widgets show width/height via `bm_ziston_element_info_alter()`.

### Code Examples
```php
// Parse and sanitize URL args.
$args = bm_ziston_get_url_arguments(['id'], ['numeric']); // ['id' => 123]

// Localized date from paragraph field.
$date = bm_ziston_get_paragraph_datefield_locale($paragraph, 'field_event_date');
```

### File Structure
- `bm_ziston.module` — hooks, language override, helpers.
- `templates/` — `gva_webform.html.twig`, `hubspot-contact-form-html.twig`, `hubspot-order-leads-form.html.twig`.
- `js/` — `ziston_tippy_pagebuilder_support.js`, smart-crop helper.
- `bm_ziston.libraries.yml` — library definitions.
- `bm_ziston.routing.yml` / `bm_ziston.links.menu.yml` — settings route/menu.

### Testing
- Functional smoke (cache rebuild): `ddev exec drush cr`
- Coding standards: `ddev exec phpcs web/modules/custom/bm_ziston --standard=Drupal,DrupalPractice`

### Coding Standards
- PSR-12 + Drupal coding standards; no jQuery unless required.
- Keep behavior code in Drupal behaviors; limit global variables.

### Security Considerations
- URL helpers sanitize inputs via `Html::escape`/regex; avoid reintroducing raw `$_GET` usage.
- Only admin routes load the admin library; ensure permissions on settings route remain `administer bm_ziston configuration`.

### Versioning
- Internal module shipped with the LAM Drupal 11 distribution; versioning follows repository releases.

### Contributing Guidelines
- Use feature branches; follow coding standards above; add/update help topics when altering behaviors.

### License
- Internal use by Mondial-IT / Blue Marloc (no public license declared).

### Maintainers / Contact
- Blue Marloc / Mondial-IT engineering team. For issues, open a ticket in the project tracker. 
