<?php

namespace Drupal\bm_darklight\Element;

use Drupal\Core\Render\Element\RenderElementBase;

/**
 * @RenderElement("bm_darklight_switcher")
 */
final class DarkLightSwitcher extends RenderElementBase {

  public function getInfo(): array {
    return [
      '#theme' => 'bm_darklight_switcher',
      '#pre_render' => [
        [static::class, 'preRenderThemeSwitcher'],
      ],
      '#attached' => [
        'library' => [
          'bm_darklight/darklight_switcher',
        ],
      ],
    ];
  }

  public static function preRenderThemeSwitcher(array $element): array {
    $element['#attributes']['data-bm-darklight-switcher'] = TRUE;
    $element['#attributes']['class'][] = 'bm-darklight-switcher';
    return $element;
  }

}
