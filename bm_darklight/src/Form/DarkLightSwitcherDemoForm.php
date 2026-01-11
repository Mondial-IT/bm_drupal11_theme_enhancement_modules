<?php

declare(strict_types=1);

namespace Drupal\bm_darklight\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;

/**
 * Demo form to showcase the bm_darklight_switcher component.
 */
final class DarkLightSwitcherDemoForm extends FormBase {

  public function getFormId(): string {
    return 'bm_darklight_theme_switcher_demo_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state): array {
    // Ensure component assets are available.
    $form['#attached']['library'][] = 'bm_darklight/darklight_switcher';
    $form['#attached']['library'][] = 'bm_darklight/darklight_switcher_demo';

    // Intro / how-to.
    $form['intro'] = [
      '#type' => 'details',
      '#title' => $this->t('How to use Dark/Light switcher'),
      '#open' => TRUE,
      'body' => [
        '#markup' => Markup::create(
          '<p>
                    Minimal configuration:<br />
                    <code>
                      $form[\'#attached\'][\'library\'][] = \'bm_darklight/darklight_switcher\';

                      $form[\'aform\'] =
                        #theme =&gt; \'bm_darklight_switcher\'
                      ];

                    </code>

                    </p>

          <p>Click the buttons to toggle <code>data-theme</code> on <code>&lt;html&gt;</code> (light, dark, system).</p>'
        ),
      ],
    ];

    // Demo rows.
    $form['examples'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Component output'),
    ];

    $form['examples']['form'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['bm-demo-row']],
      'example' => [
        '#theme' => 'bm_darklight_switcher',
      ],
      'code_php' => [
        '#markup' => '
            <code>
            /* Add to the form to insert buttons */
            \'example\' => [
                \'#theme\' => \'bm_darklight_switcher\',
            ],
            </code>',
      ],
    ];


    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    // No submission; demo-only.
  }

}
