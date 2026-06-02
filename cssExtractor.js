/**
 * Script 1: Collect CSS rules actually matched on the page.
 *
 * What you get:
 * - List of CSSStyleRules whose selectorText matches at least one element.
 * - Count of how many elements each selector matched.
 *
 * Limitations:
 * - Doesn't include pseudo-classes like :hover reliably (because not active).
 * - Some selectors with dynamic states may show as unused.
 * - Cross-origin stylesheets may be blocked from reading rules.
 *
 * How to use:
 * 1) Open the page
 * 2) Paste into DevTools console
 * 3) Run: collectUsedSelectors()
 * 4) Copy the printed JSON
 */
(function () {
  function isReadableSheet(sheet) {
    try {
      // Accessing cssRules throws SecurityError for cross-origin sheets without CORS.
      void sheet.cssRules;
      return true;
    } catch (e) {
      return false;
    }
  }

  function getAllElements() {
    // Get all elements including html/body.
    return Array.from(document.querySelectorAll('*'));
  }

  function collectUsedSelectors() {
    const elements = getAllElements();
    const used = new Map(); // key: selectorText, value: count
    const errors = [];

    const sheets = Array.from(document.styleSheets);

    for (const sheet of sheets) {
      if (!isReadableSheet(sheet)) {
        errors.push({
          href: sheet.href || '(inline)',
          reason: 'Stylesheet not readable (likely cross-origin without CORS).'
        });
        continue;
      }

      for (const rule of Array.from(sheet.cssRules || [])) {
        // Only plain CSS rules (ignore @media blocks here; we process them below).
        if (rule.type === CSSRule.STYLE_RULE) {
          const selector = rule.selectorText;
          try {
            // Use querySelectorAll to test selector match.
            const matchCount = document.querySelectorAll(selector).length;
            if (matchCount > 0) {
              used.set(selector, (used.get(selector) || 0) + matchCount);
            }
          } catch (e) {
            // Some selectors can throw (e.g. invalid in querySelectorAll).
            errors.push({
              selector,
              reason: 'Selector not supported by querySelectorAll() in this context.'
            });
          }
        }

        // Handle @media rules: include only rules where media matches current viewport.
        if (rule.type === CSSRule.MEDIA_RULE) {
          const mediaText = rule.media && rule.media.mediaText ? rule.media.mediaText : '';
          if (mediaText && window.matchMedia(mediaText).matches) {
            for (const innerRule of Array.from(rule.cssRules || [])) {
              if (innerRule.type !== CSSRule.STYLE_RULE) continue;

              const selector = innerRule.selectorText;
              try {
                const matchCount = document.querySelectorAll(selector).length;
                if (matchCount > 0) {
                  used.set(selector, (used.get(selector) || 0) + matchCount);
                }
              } catch (e) {
                errors.push({
                  selector,
                  reason: 'Selector not supported by querySelectorAll() inside @media.'
                });
              }
            }
          }
        }
      }
    }

    const result = {
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      usedSelectors: Array.from(used.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([selector, count]) => ({ selector, count })),
      unreadableStylesheetsOrSelectorErrors: errors
    };

    console.log('Used selectors (JSON):', result);
    return result;
  }

  // Expose function globally for easy re-run.
  window.collectUsedSelectors = collectUsedSelectors;
})();
/**
 * Script 2: For each element, collect the rules that actually apply (matched rules),
 * plus the computed styles snapshot (optional).
 *
 * What you get:
 * - For each element (limited sample to avoid huge output):
 *   - CSS selector path
 *   - list of matched rules (selectorText + stylesheet href)
 * - Optionally: computed styles (VERY LARGE; use sparingly)
 *
 * Notes:
 * - This uses getMatchedCSSRules() if available (deprecated; not in all browsers).
 * - If not available, we fall back to the selector matching approach.
 *
 * How to use:
 * 1) Run: collectElementRuleMap({ limit: 200, includeComputed: false })
 * 2) Increase limit carefully.
 */
(function () {
  function cssPath(el) {
    // Simple readable selector path.
    const parts = [];
    while (el && el.nodeType === 1 && parts.length < 6) {
      let part = el.tagName.toLowerCase();
      if (el.id) {
        part += '#' + el.id;
        parts.unshift(part);
        break;
      }
      if (el.classList && el.classList.length) {
        part += '.' + Array.from(el.classList).slice(0, 3).join('.');
      }
      parts.unshift(part);
      el = el.parentElement;
    }
    return parts.join(' > ');
  }

  function safeGetCssRules(sheet) {
    try {
      return Array.from(sheet.cssRules || []);
    } catch (e) {
      return null;
    }
  }

  function collectMatchedRulesFallback(el) {
    // Fallback: brute-check all selectors against this element.
    // This is slower than Coverage and can be heavy.
    const matched = [];
    const sheets = Array.from(document.styleSheets);

    for (const sheet of sheets) {
      const rules = safeGetCssRules(sheet);
      if (!rules) continue;

      for (const rule of rules) {
        if (rule.type === CSSRule.STYLE_RULE) {
          try {
            if (el.matches(rule.selectorText)) {
              matched.push({
                selector: rule.selectorText,
                href: sheet.href || '(inline)'
              });
            }
          } catch (e) {}
        }

        if (rule.type === CSSRule.MEDIA_RULE) {
          const mediaText = rule.media && rule.media.mediaText ? rule.media.mediaText : '';
          if (mediaText && window.matchMedia(mediaText).matches) {
            for (const innerRule of Array.from(rule.cssRules || [])) {
              if (innerRule.type !== CSSRule.STYLE_RULE) continue;
              try {
                if (el.matches(innerRule.selectorText)) {
                  matched.push({
                    selector: innerRule.selectorText,
                    href: sheet.href || '(inline)',
                    media: mediaText
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    }

    return matched;
  }

  function collectElementRuleMap(options) {
    const opt = Object.assign(
      { limit: 150, includeComputed: false, selector: '*' },
      options || {}
    );

    const all = Array.from(document.querySelectorAll(opt.selector));
    const sample = all.slice(0, opt.limit);

    const result = {
      url: location.href,
      sampledElements: sample.length,
      totalElements: all.length,
      elements: []
    };

    for (const el of sample) {
      const entry = { path: cssPath(el), tag: el.tagName.toLowerCase() };

      // Try deprecated API first if browser supports it.
      let matched = null;
      if (typeof window.getMatchedCSSRules === 'function') {
        try {
          const rules = window.getMatchedCSSRules(el);
          matched = rules
            ? Array.from(rules).map(r => ({
              selector: r.selectorText || '(unknown)',
              // ownerNode may not always exist
              href: (r.parentStyleSheet && r.parentStyleSheet.href) || '(inline)'
            }))
            : [];
        } catch (e) {
          matched = null;
        }
      }

      if (!matched) {
        matched = collectMatchedRulesFallback(el);
      }

      entry.matchedRules = matched;

      if (opt.includeComputed) {
        // WARNING: huge output. Only enable when you absolutely need it.
        const cs = window.getComputedStyle(el);
        const computed = {};
        for (let i = 0; i < cs.length; i++) {
          const prop = cs[i];
          computed[prop] = cs.getPropertyValue(prop);
        }
        entry.computed = computed;
      }

      result.elements.push(entry);
    }

    console.log('Element rule map (JSON):', result);
    return result;
  }

  window.collectElementRuleMap = collectElementRuleMap;
})();
/**
 * Script 2: For each element, collect the rules that actually apply (matched rules),
 * plus the computed styles snapshot (optional).
 *
 * What you get:
 * - For each element (limited sample to avoid huge output):
 *   - CSS selector path
 *   - list of matched rules (selectorText + stylesheet href)
 * - Optionally: computed styles (VERY LARGE; use sparingly)
 *
 * Notes:
 * - This uses getMatchedCSSRules() if available (deprecated; not in all browsers).
 * - If not available, we fall back to the selector matching approach.
 *
 * How to use:
 * 1) Run: collectElementRuleMap({ limit: 200, includeComputed: false })
 * 2) Increase limit carefully.
 */
(function () {
  function cssPath(el) {
    // Simple readable selector path.
    const parts = [];
    while (el && el.nodeType === 1 && parts.length < 6) {
      let part = el.tagName.toLowerCase();
      if (el.id) {
        part += '#' + el.id;
        parts.unshift(part);
        break;
      }
      if (el.classList && el.classList.length) {
        part += '.' + Array.from(el.classList).slice(0, 3).join('.');
      }
      parts.unshift(part);
      el = el.parentElement;
    }
    return parts.join(' > ');
  }

  function safeGetCssRules(sheet) {
    try {
      return Array.from(sheet.cssRules || []);
    } catch (e) {
      return null;
    }
  }

  function collectMatchedRulesFallback(el) {
    // Fallback: brute-check all selectors against this element.
    // This is slower than Coverage and can be heavy.
    const matched = [];
    const sheets = Array.from(document.styleSheets);

    for (const sheet of sheets) {
      const rules = safeGetCssRules(sheet);
      if (!rules) continue;

      for (const rule of rules) {
        if (rule.type === CSSRule.STYLE_RULE) {
          try {
            if (el.matches(rule.selectorText)) {
              matched.push({
                selector: rule.selectorText,
                href: sheet.href || '(inline)'
              });
            }
          } catch (e) {}
        }

        if (rule.type === CSSRule.MEDIA_RULE) {
          const mediaText = rule.media && rule.media.mediaText ? rule.media.mediaText : '';
          if (mediaText && window.matchMedia(mediaText).matches) {
            for (const innerRule of Array.from(rule.cssRules || [])) {
              if (innerRule.type !== CSSRule.STYLE_RULE) continue;
              try {
                if (el.matches(innerRule.selectorText)) {
                  matched.push({
                    selector: innerRule.selectorText,
                    href: sheet.href || '(inline)',
                    media: mediaText
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    }

    return matched;
  }

  function collectElementRuleMap(options) {
    const opt = Object.assign(
      { limit: 150, includeComputed: false, selector: '*' },
      options || {}
    );

    const all = Array.from(document.querySelectorAll(opt.selector));
    const sample = all.slice(0, opt.limit);

    const result = {
      url: location.href,
      sampledElements: sample.length,
      totalElements: all.length,
      elements: []
    };

    for (const el of sample) {
      const entry = { path: cssPath(el), tag: el.tagName.toLowerCase() };

      // Try deprecated API first if browser supports it.
      let matched = null;
      if (typeof window.getMatchedCSSRules === 'function') {
        try {
          const rules = window.getMatchedCSSRules(el);
          matched = rules
            ? Array.from(rules).map(r => ({
              selector: r.selectorText || '(unknown)',
              // ownerNode may not always exist
              href: (r.parentStyleSheet && r.parentStyleSheet.href) || '(inline)'
            }))
            : [];
        } catch (e) {
          matched = null;
        }
      }

      if (!matched) {
        matched = collectMatchedRulesFallback(el);
      }

      entry.matchedRules = matched;

      if (opt.includeComputed) {
        // WARNING: huge output. Only enable when you absolutely need it.
        const cs = window.getComputedStyle(el);
        const computed = {};
        for (let i = 0; i < cs.length; i++) {
          const prop = cs[i];
          computed[prop] = cs.getPropertyValue(prop);
        }
        entry.computed = computed;
      }

      result.elements.push(entry);
    }

    console.log('Element rule map (JSON):', result);
    return result;
  }

  window.collectElementRuleMap = collectElementRuleMap;
})();
