<?php
/**
 * Block Registration Module
 *
 * Handles automatic discovery and registration of Gutenberg blocks.
 * Supports dynamic server-side rendering through two mechanisms:
 * 1. Via the 'santiagodel76_teb_block_render_callbacks' filter hook (external/plugin customization)
 * 2. Via optional render.php file within each block directory (block-specific rendering)
 *
 * @package timed-event-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Discover and register all block.json files found in the build directory.
 *
 * @return void
 */
function santiagodel76_teb_register_blocks() {
	$block_json_files = glob( SANTIAGODEL76_TEB_PATH . 'build/blocks/*/block.json' );

	if ( empty( $block_json_files ) && file_exists( SANTIAGODEL76_TEB_PATH . 'build/block.json' ) ) {
		$block_json_files[] = SANTIAGODEL76_TEB_PATH . 'build/block.json';
	}

	$render_callbacks = apply_filters( 'santiagodel76_teb_block_render_callbacks', [] );

	foreach ( $block_json_files as $block_json ) {
		$args       = [];
		$block_dir  = dirname( $block_json );
		$block_slug = basename( $block_dir );

		if ( isset( $render_callbacks[ $block_slug ] ) && is_callable( $render_callbacks[ $block_slug ] ) ) {
			$args['render_callback'] = $render_callbacks[ $block_slug ];
		} elseif ( file_exists( $block_dir . '/render.php' ) ) {
			$callback = require $block_dir . '/render.php';
			if ( is_callable( $callback ) ) {
				$args['render_callback'] = $callback;
			}
		}

		$registered = register_block_type( $block_json, $args );

		if ( $registered instanceof WP_Block_Type ) {
			$script_handles = array_merge(
				(array) $registered->script_handles,
				(array) $registered->editor_script_handles,
				(array) $registered->view_script_handles
			);

			foreach ( array_unique( array_filter( $script_handles ) ) as $handle ) {
				wp_set_script_translations(
					$handle,
					'timed-event-block',
					SANTIAGODEL76_TEB_PATH . 'languages'
				);
			}
		}
	}
}
