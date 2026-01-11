<?php

declare(strict_types=1);

namespace Drupal\bm_icon_report\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Builds the icon catalogue page.
 */
class IconGalleryController extends ControllerBase {

  public function __construct(
    protected RequestStack $requestStack,
  ) {}

  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('request_stack'),
    );
  }

  /**
   * Renders the icon overview.
   */
  public function index(): array {
    $discovery = $this->discoverIconSets();

    $icon_sets = $discovery['sets'];

    $request = $this->requestStack->getCurrentRequest();
    if ($request->query->has('refresh')) {
      $this->messenger()->addStatus($this->t('Icon catalogue refreshed.'));
    }

    $build = [
      // override to use twig bm-icon-report-gallery
      '#theme' => 'bm_icon_report_gallery',
      '#title' => $this->t('Icon catalogue'),
      '#icon_sets' => $icon_sets,
      '#empty_message' => $this->t('No icon sources were detected in the current codebase.'),
      '#refresh_url' => Url::fromRoute(
        'bm_icon_report.icons',
        [],
        ['query' => ['refresh' => \Drupal::time()->getRequestTime()],]
          )->toString(),
      '#attached' => [
        'library' => [
          'bm_icon_report/bm_icon_report.icons',
        ],
      ],
    ];

    foreach ($discovery['css'] as $relative_path) {
      // load the icon css files in the <head>
      $build['#attached']['html_head'][] = [
        [
          '#tag' => 'link',
          '#attributes' => [
            'rel' => 'stylesheet',
            'href' => $this->buildRelativeUrl($relative_path),
            'data-bm-icon-report-source' => $relative_path,
          ],
        ],
        'bm_icon_report_css_' . md5($relative_path),
      ];
    }

    return $build;
  }

  /**
   * Locates icon font CSS files and extracts classes for display.
   *
   * @return array
   *   Associative array with 'sets' and 'css' keys.
   */
  protected function discoverIconSets(): array {
    $files = $this->findIconFiles();
    $sets = [];
    $css_attachments = [];

    foreach ($files as $absolute_path) {
      $icons = $this->parseIconDefinitions($absolute_path);
      if (!$icons) {
        continue;
      }
      $relative = $this->toRelativePath($absolute_path);
      $sets[] = [
        'label' => $this->buildLabel($relative),
        'source' => $relative,
        'count' => count($icons),
        'icons' => $icons,
      ];
      $css_attachments[] = $relative;
    }

    return [
      'sets' => $sets,
      'css' => array_values(array_unique($css_attachments)),
    ];
  }

  /**
   * Recursively finds CSS files that likely contain icon definitions.
   *
   * @return string[]
   *   Absolute filesystem paths.
   */
  protected function findIconFiles(): array {
    $results = [];
    $theme_root = DRUPAL_ROOT . '/themes/custom';
    if (is_dir($theme_root)) {
      $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($theme_root, \FilesystemIterator::SKIP_DOTS));
      foreach ($iterator as $item) {
        if (!$item->isFile()) {
          continue;
        }
        if (strtolower($item->getExtension()) !== 'css') {
          continue;
        }
        $path = $item->getPathname();
        $filename = $item->getFilename();
        if (!(str_contains($filename, 'icon') || str_contains($path, '/icon/'))) {
          continue;
        }
        if (str_contains($path, '/node_modules/')) {
          continue;
        }
        $results[$path] = $path;
      }
    }

    $bm_main_css = DRUPAL_ROOT . '/modules/custom/bm_main/css/bm-main.css';
    if (file_exists($bm_main_css)) {
      $results[$bm_main_css] = $bm_main_css;
    }

    ksort($results);
    return array_values($results);
  }

  /**
   * Extracts icon classes from a CSS file.
   *
   * @param string $absolute_path
   *   CSS filesystem path.
   *
   * @return array
   *   Icon definition arrays.
   */
  protected function parseIconDefinitions(string $absolute_path): array {
    $contents = @file_get_contents($absolute_path);
    if ($contents === FALSE) {
      return [];
    }

    $pattern = '/\.([A-Za-z0-9_-]+)\s*:(?:before|after)\s*\{[^}]*content\s*:\s*["\']([^"\']+)["\']/i';
    preg_match_all($pattern, $contents, $matches, PREG_SET_ORDER);

    if (!$matches) {
      return [];
    }

    $icons = [];
    foreach ($matches as $match) {
      $class = $match[1];
      if (!$this->looksLikeIconClass($class)) {
        continue;
      }
      $icons[$class] = [
        'class' => $class,
        'code' => $match[2],
        'character' => $this->decodeIconCharacter($match[2]),
      ];
    }

    ksort($icons);
    return array_values($icons);
  }

  /**
   * Determines if a CSS selector is icon-related.
   */
  protected function looksLikeIconClass(string $class): bool {
    $needles = ['icon', 'gv-icon', 'flaticon', 'bm-'];
    foreach ($needles as $needle) {
      if (str_contains($class, $needle)) {
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * Converts an absolute path into a docroot-relative string.
   */
  protected function toRelativePath(string $absolute_path): string {
    $root = DRUPAL_ROOT . DIRECTORY_SEPARATOR;
    if (str_starts_with($absolute_path, $root)) {
      return str_replace('\\', '/', substr($absolute_path, strlen($root)));
    }
    return str_replace('\\', '/', $absolute_path);
  }

  /**
   * Builds a friendly label for an icon file.
   */
  protected function buildLabel(string $relative_path): TranslatableMarkup {
    if (preg_match('#themes/custom/([^/]+)/([^/]+)/#', $relative_path, $matches)) {
      $project = $matches[1];
      $subset = $matches[2];
      return $this->t('@project – @subset icons', [
        '@project' => $project,
        '@subset' => $subset,
      ]);
    }
    if (preg_match('#themes/custom/([^/]+)/#', $relative_path, $matches)) {
      return $this->t('@project icons', ['@project' => $matches[1]]);
    }
    if (str_contains($relative_path, 'bm_main')) {
      return $this->t('BM Main icons');
    }
    return $this->t('Icons from @file', ['@file' => $relative_path]);
  }

  /**
   * Converts CSS content declarations into UTF-8 characters.
   */
  protected function decodeIconCharacter(string $code): string {
    $trimmed = trim($code, "\"' \t\n\r\0\x0B");
    if (str_starts_with($trimmed, '\\')) {
      $hex = ltrim($trimmed, '\\');
      if (ctype_xdigit($hex)) {
        return html_entity_decode('&#x' . $hex . ';', ENT_QUOTES, 'UTF-8');
      }
    }
    if (str_starts_with($trimmed, '0x')) {
      $hex = substr($trimmed, 2);
      if (ctype_xdigit($hex)) {
        return html_entity_decode('&#x' . $hex . ';', ENT_QUOTES, 'UTF-8');
      }
    }
    return $trimmed;
  }

  /**
   * Builds a relative URL pointing to the requested asset.
   */
  protected function buildRelativeUrl(string $relative_path): string {
    $base = $this->requestStack->getCurrentRequest()->getBasePath();
    return $base . '/' . ltrim($relative_path, '/');
  }

}
