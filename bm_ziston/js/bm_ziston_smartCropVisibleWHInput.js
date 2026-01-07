
/*
 * Copyright (c) Mondial-IT BV - Blue Marloc 2024
 *   Created on 2024-11-21 at 11:32:16
 */

Drupal.behaviors.smartCropVisibleWHInput = {
  attach: function (context, settings) {
    // set input type=hidden to input type=text voor w en h
    once('bm_ziston_smartCropVisibleWHInput', '[data-drupal-iwc-value="width"],[data-drupal-iwc-value="height"]')
      .forEach(function (element) {
   //   console.log('smartCropVisibleWHInput W en H is running',element);
      // make visible
      element.type='text';

    });
  }
}
