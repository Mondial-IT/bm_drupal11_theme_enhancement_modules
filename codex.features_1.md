# Feature development

* [x] Feature 1.0. the bm_core module provides a theme switcher function, replicate this function in its own drupal module.
- bm_core has a feature which adds to html the attribute data-theme="light", data-theme="dark" or removes the attribute to follow the system setting.
  It offers a demo form, and it documents the feature.
  Create a module bm_darklight and refactor the features from bm_core into that module.

codex: Implemented bm_darklight module with theme switcher element, JS, CSS, Twig, demo route/form, help topic, README, and wiki entry; mirrors bm_core switcher behavior. (Mondial-IT BV, 2026-01-06)

* [x] Feature 2.0 Refactor bm_main icon display page, to a simple module bm_theme_enhancement_modules/bm_icon_report
- bm_main module provides controller IconCalleryController.php with purpose to find all available icons to developers and display them on a page.
- create a simple module, and add a similar controller display of icons to it.
- route the icons page to be under the reports menu option. Name it 'Icon report'
- enable the module.

codex: Added bm_icon_report module with IconReportController + IconDiscovery service, twig theme hook + template, CSS, menu/link under Reports, and routing to /admin/reports/icon-report. (Mondial-IT BV, 2026-01-08)
