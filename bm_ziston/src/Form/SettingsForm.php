<?php

/*
 Copyright (c) Mondial-IT BV - Blue Marloc 2024
   Created on 2024-11-21 at 11:32:16
 */

namespace Drupal\bm_ziston\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure bm_ziston settings for this site.
 */
class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'bm_ziston_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['bm_ziston.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['markup'] = [
      '#type' => 'markup',
      '#markup' => '<p>Content</p><div class="grid-fr-fr">
      <div class="panel">
        <b>Twig</b>
        <ul>
        <li>gva_webform</li>
        <li>hubspot-contact-form-html</li>
        <li>hubspot-order-leads--form</li>
        </ul>
        <b>JS</b>
        <ul><li>ziston_tippy_pagebuilder_support manages enable/disable of rows in gva settings</li></ul>
        <b>Code</b>
        <ul>
        <li>
            <div class="summary">_preprocess_node: language override (todo better explanation needed)
            <p class="details"> * set $language variable for twig to /en,/nl,/fr
             *
             * implements override of english node over french and dutch
             * When gva_pagebuilder_content contains [en:text]..
             * then the french and dutch nodes will override the english version
             * in the override node the [en:...] text will be replaced with
             * the appropriate text from the [fr:...] or [nl:...] content
             </p>
           </div>
         </li>
         <li><div class="summary">bm_ziston_element_info_alter: repair smart crop
            <p class="details">
            helper om input hidden in input text te veranderen op smart crop velden zodat width en height getoond worden
            </br />bm_ziston/smartCropVisibleWHInputjs
            </p>
         </div></li>
          <li>bm_ziston_get_url_arguments</li>
          <li>bm_ziston_parse_string_arguments</li>
         </ul>
      </div>
      <div class="panel">
        <b>Code should move</b>
        <ul>
        <li>bm_ziston_get_node_paragraphs_terms_field</li>
        <li>bm_ziston_get_node_paragraphs_terms</li>
        <li>bm_ziston_get_node_paragraphs</li>
        <li>bm_ziston_get_paragraph_field</li>
        <li>bm_ziston_get_paragraph_id</li>
        <li>bm_ziston_get_paragraph_type</li>
        <li>bm_ziston_get_paragraph_terms_name</li>
        <li>bm_ziston_get_paragraph_datefield_locale: returns date in locale theme</li>
        <li>bm_ziston_get_paragraph_created_timestamp</li>
        <li>bm_ziston_get_paragraph_created_locale</li>

        </ul>
     </div></div>'
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    if ($form_state->getValue('example') != 'example') {
      $form_state->setErrorByName('example', $this->t('The value is not correct.'));
    }
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('bm_ziston.settings')
      ->set('example', $form_state->getValue('example'))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
