<?php

/**
 * @file
 * Contains \Drupal\bueditor\Entity\BUEditorEditor.
 */

namespace Drupal\bueditor\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBase;
use Drupal\editor\Entity\Editor;

/**
 * Defines the BUEditor Editor entity.
 *
 * @ConfigEntityType(
 *   id = "bueditor_editor",
 *   label = @Translation("BUEditor Editor"),
 *   handlers = {
 *     "list_builder" = "Drupal\bueditor\BUEditorEditorListBuilder",
 *     "form" = {
 *       "add" = "Drupal\bueditor\Form\BUEditorEditorForm",
 *       "edit" = "Drupal\bueditor\Form\BUEditorEditorForm",
 *       "delete" = "Drupal\bueditor\Form\BUEditorEditorDeleteForm",
 *       "duplicate" = "Drupal\bueditor\Form\BUEditorEditorForm"
 *     }
 *   },
 *   admin_permission = "administer bueditor",
 *   config_prefix = "editor",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "label"
 *   },
 *   links = {
 *     "edit-form" = "/admin/config/content/bueditor/{bueditor_editor}",
 *     "delete-form" = "/admin/config/content/bueditor/{bueditor_editor}/delete",
 *     "duplicate-form" = "/admin/config/content/bueditor/{bueditor_editor}/duplicate"
 *   }
 * )
 */
class BUEditorEditor extends ConfigEntityBase {

  /**
   * Editor ID.
   *
   * @var string
   */
  protected $id;

  /**
   * Label.
   *
   * @var string
   */
  protected $label;

  /**
   * Description.
   *
   * @var string
   */
  protected $description;

  /**
   * Settings.
   *
   * @var array
   */
  protected $settings = array();

  /**
   * Javascript data including settings and libraries.
   *
   * @var array
   */
  protected $jsData;

  /**
   * Returns all settings or a specific setting by key.
   */
  public function getSettings($key = NULL, $default = NULL) {
    $settings = $this->settings;
    if (isset($key)) {
      return isset($settings[$key]) ? $settings[$key] : $default;
    }
    return $settings;
  }

  /**
   * Returns the toolbar array.
   */
  public function getToolbar() {
    return $this->getSettings('toolbar', array());
  }

  /**
   * Checks if an item exists in the toolbar.
   */
  public function hasToolbarItem($id) {
    return in_array($id, $this->getToolbar(), TRUE);
  }

  /**
   * Returns JS libraries.
   */
  public function getLibraries(Editor $editor = NULL) {
    $data = $this->getJSData($editor);
    return $data['libraries'];
  }

  /**
   * Returns JS settings.
   */
  public function getJSSettings(Editor $editor = NULL) {
    $data = $this->getJSData($editor);
    return $data['settings'];
  }

  /**
   * Returns JS data including settings and libraries.
   */
  public function getJSData(Editor $editor = NULL) {
    if (!isset($this->jsData)) {
      $this->jsData = array(
        'libraries' => array('bueditor/drupal.bueditor'),
        'settings' => array_filter($this->getSettings()) + array('toolbar' => array()),
      );
      \Drupal::service('plugin.manager.bueditor.plugin')->alterEditorJS($this->jsData, $this, $editor);
    }
    return $this->jsData;
  }

}