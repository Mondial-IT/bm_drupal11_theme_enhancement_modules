/*
 * Copyright (c) Mondial-IT BV - Blue Marloc 2024
 *   Created on 2024-11-21 at 11:32:16
 * <!-- FEATURES PROVIDED BY THIS SCRIPT 1)
 * Drupal behavior bootstrap - Registers `Drupal.behaviors.bm_ziston` to run on page attach and logs status.
 * 2) Image URL auto-repair - Scans for `<img src="//...">` and fixes to a single leading slash (`/...`).
 * 3) Page builder support initializer - Orchestrates several editor/UX helpers via `ziston_tippy_pagebuilder_support()` and a DOM `MutationObserver`.
 * 4) Description-to-tooltip (Tippy) conversion - When a `.form-group` with a `.desc` element is inserted,
 * it replaces the inline description with a Tippy tooltip (HTML-enabled, delayed show, inertia).
 * 5) Example image injection (`_example`) - If an added node has class `_example`,
 * reads the `placeholder` of its first `<input>` as an image URL and inserts a preview image before the element.
 * 6) Hierarchical select kick-off (`_hierarchical_select`) - Dispatches a bubbling custom event `domInsert_hierarchical_select`
 * to let other components lazily initialize hierarchical selectors.
 * 7) Centralized enable/disable toggling (`_enable`) - On body `change`, when a control inside `.form-group._enable`
 * toggles: • Adds/removes a class (the control’s `id`) on the surrounding `<form>` to globally show/hide related fields. •
 * Applies a simple fade-in for affected elements when enabling. -
 * On initial insert of an `_enable` group:
 * • Injects CSS so `form.<id> .<id> { display:none; }` hides all fields tied to that enable key when the select value is `'0'`. 8)
 * Lightweight CSS injector - `injectCSS(css)` helper appends a `<style>` tag to `<head>` for per-form dynamic rules.
 * 9) Safe HTML restoration in descriptions - Converts escaped HTML entities back to real tags for tooltip content (`&lt;`→`<`, `&gt;`→`>`).
 * NOTES - Uses plain JavaScript DOM APIs (no jQuery calls despite the IIFE signature).
 * - Requires `tippy` to be globally available for tooltip behavior.
 * - Designed for admin/editor forms where fields are added dynamically (e.g., page builders).
 */

(function ($, Drupal) {
  'use strict';

  // Console styles for branded logs.
  const color1 = 'background-color: #ad1ab9;color:white;';
  const color2 = 'background-color:#1e8fff;color:white;';
  const textColor = 'color:#1e8fff;'; // reserved (unused here)

  // Initial heartbeat log on script load.
  console.log('%cbm-ziston - v240322 - %c is running OK', color1, color2);

  // Drupal behavior to hook into page attach lifecycle.
  Drupal.behaviors.bm_ziston = {
    attach: function (context, settings) {
      console.log('%c Ziston: bm-ziston %c running ok               ', color1, color2);

      // FEATURE: Repair image URLs that accidentally start with '//' (protocol-relative)
      // and should be single-root '/'. This prevents broken images in some contexts.
      let imgSrcErrors = document.querySelectorAll('img[src^="//"]');
      imgSrcErrors.forEach(function (e) {
        let link = e.getAttribute('src').replace('//', '/');
        e.setAttribute('src', link);
        console.log('repaired image link', link);
      });
    }
  };

  /**
   * Initialize page-builder/editor helpers.
   * - Converts .desc help blocks into Tippy tooltips.
   * - Wires up centralized enable/disable toggling for grouped fields.
   * - Injects example images.
   * - Signals hierarchical select initializations.
   */
  function ziston_tippy_pagebuilder_support() {
    // --- Centralized enable/disable on body change events --------------------
    document.querySelector('body').addEventListener('change', function (el) {

      // Only react when the changed control lives in a '.form-group._enable'
      if (el.target.closest('.form-group') && el.target.closest('.form-group').classList.contains('_enable')) {
        if (el.target.value === '1') {
          // Enabled: remove the toggle class from <form> so related fields show.
          el.target.closest('form').classList.remove(el.target.id);
        } else {
          // Disabled: add a soft fade-in for currently affected elements,
          // then add the toggle class to <form> to hide related fields via CSS.
          let elements = document.querySelectorAll("." + el.target.id);
          let opacity = 0;
          let fadeIn = setInterval(() => {
            elements.forEach((e) => {
              e.style.opacity = opacity;
            });
            opacity += 0.01;
            if (opacity > 1) {
              clearTimeout(fadeIn);
            }
          }, 30);

          el.target.closest('form').classList.add(el.target.id);
        }
      }
    });

    // Helper to append ad-hoc CSS rules.
    const injectCSS = css => {
      let el = document.createElement('style');
      el.innerText = css;
      document.head.appendChild(el);
      return el;
    };

    // Counter used to give each tooltip scope a unique class.
    let id = 1;

    // --- Observe dynamic DOM insertions (page builders often inject nodes) ---
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            const addedNode = mutation.addedNodes[0];

            if (addedNode && addedNode.classList) {

              // FEATURE: Description-to-Tooltip (Tippy) for form groups.
              if (addedNode.classList.contains('form-group')) {
                // Look for a `.desc` element to move into a tooltip.
                let $desc = addedNode.querySelector('.desc');
                if ($desc) {
                  // Recover real HTML from escaped content, then remove inline desc.
                  let cleanDesc = $desc.innerHTML;
                  cleanDesc = cleanDesc.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('< ', '<');
                  $desc.remove();

                  // Scope the tooltip to this specific group instance.
                  addedNode.classList.add('ziston-tippy-' + id);

                  // Initialize Tippy with HTML content and gentle timing.
                  // NOTE: requires tippy to be loaded globally.
                  tippy('.ziston-tippy-' + id, {
                    content: cleanDesc,
                    inertia: true,
                    allowHTML: true,
                    delay: [1000, 200], // show after 1s hover, hide after 200ms
                  });

                  id++;
                }
              }

              // FEATURE: Example image injection for previewing placeholders.
              // If the node is marked `_example`, read the first input's placeholder
              // as an image URL and show a preview before the node.
              if (addedNode.classList.contains('_example')) {
                let imgSrc = addedNode.querySelector('input');
                let img = imgSrc && imgSrc.placeholder;
                if (img) {
                  addedNode.insertAdjacentHTML('beforebegin', '<img src="' + img + '" class="example-image" alt="">');
                }
              }

              // FEATURE: Hierarchical select boot signal.
              // Consumers can listen for 'domInsert_hierarchical_select' to lazy-init.
              if (addedNode.classList.contains('_hierarchical_select')) {
                let customEvent = new CustomEvent('domInsert_hierarchical_select', {bubbles: true});
                addedNode.dispatchEvent(customEvent);
              }

              // FEATURE: _enable bootstrapping on initial insert.
              // Applies default hidden state via injected CSS if the select is "off".
              if (addedNode.classList.contains('_enable')) {
                let id = addedNode.querySelector('select').id;
                let on = addedNode.querySelector('select').value;

                // If off, mark the form with the toggle class so related controls hide.
                if (on === '0') {
                  addedNode.closest('form').classList.add(id);
                }

                // Hide all fields tagged with the same class when the form bears that class.
                injectCSS('form.' + id + ' .' + id + '{ display:none; ');
              }

            }
          }
        }
      }
    });

    // Start watching for dynamic content across the document.
    observer.observe(document, {childList: true, subtree: true});
  }

  // Kick off the page-builder support helpers immediately.
  ziston_tippy_pagebuilder_support();

})(jQuery, Drupal);
