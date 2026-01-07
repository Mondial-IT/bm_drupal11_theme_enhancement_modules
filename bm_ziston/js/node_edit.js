
/*
 * Copyright (c) Mondial-IT BV - Blue Marloc 2024
 *   Created on 2024-11-21 at 11:32:16
 */

Drupal.behaviors.smartCropVisibleWHInput = {
  attach: function (context, settings) {
    once('smartCropVisibleWHInput', 'html').forEach(function (element) {
      console.log('smartCropVisibleWHInput is running');
      // make visible
      document.querySelectorAll('[data-drupal-iwc-value="width"]')
        .forEach(function(e){ e.type='text'; });

      document.querySelectorAll('[data-drupal-iwc-value="height"]')
        .forEach(function(e){ e.type='text'; });
    })
  }
}
