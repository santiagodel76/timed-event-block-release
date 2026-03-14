<?php
/**
 * Plugin Name: Timed Event Block
 * Plugin URI: https://wordpress.org/plugins/timed-event-block/
 * Description: Gutenberg block to schedule event content visibility, display contextual date/time/countdown child blocks, and build schedule listings.
 * Version: 0.1.2
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * Author: Santiago Betancor
 * Author URI: https://santiagodel76.github.io
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: timed-event-block
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// SETUP.
define( 'SANTIAGODEL76_TEB_PATH', plugin_dir_path( __FILE__ ) );
define( 'SANTIAGODEL76_TEB_URL', plugin_dir_url( __FILE__ ) );

// INCLUDES.
require_once SANTIAGODEL76_TEB_PATH . 'includes/register-blocks.php';

// HOOKS.
add_action( 'init', 'santiagodel76_teb_register_blocks' );
