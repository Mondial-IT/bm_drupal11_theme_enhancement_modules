<?php

namespace Drupal\bm_icon_report\Service;

use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Messenger\MessengerInterface;

/**
 * Discovers icon classes from CSS files.
 */
final class IconDiscovery {

  public function __construct(
    private readonly FileSystemInterface $fileSystem,
    private readonly MessengerInterface $messenger,
  ) {}

  /**
   * Discover icon sets.
   *
   * @return array
   *   ['sets' => [...], 'css' => [...]]
   */
  public function discover(): array {
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
  private function findIconFiles(): array {
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
   */
  private function parseIconDefinitions(string $absolute_path): array {
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

  private function looksLikeIconClass(string $class): bool {
    $needles = ['icon', 'gv-icon', 'flaticon', 'bm-'];
    foreach ($needles as $needle) {
      if (str_contains($class, $needle)) {
        return TRUE;
      }
    }
    return FALSE;
  }

  private function toRelativePath(string $absolute_path): string {
    $root = DRUPAL_ROOT . DIRECTORY_SEPARATOR;
    if (str_starts_with($absolute_path, $root)) {
      return substr($absolute_path, strlen($root));
    }
    return $absolute_path;
  }

  private function buildLabel(string $relative): string {
    // Simple label from path.
    $parts = explode('/', $relative);
    return end($parts);
  }

  private function decodeIconCharacter(string $code): string {
    if (str_starts_with($code, '\\')) {
      $hex = ltrim($code, '\\');
      $dec = hexdec($hex);
      if ($dec) {
        return mb_convert_encoding('&#' . intval($dec) . ';', 'UTF-8', 'HTML-ENTITIES');
      }
    }
    return $code;
  }

}
