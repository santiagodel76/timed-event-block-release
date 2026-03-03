<?php
/**
 * Server-side render for Timed Event block.
 *
 * @package timed-event-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'santiagodel76_teb_get_allowed_html_for_inner_blocks' ) ) {
	/**
	 * Returns allowed HTML for Timed Event inner block content.
	 *
	 * @return array<string, array<string, bool>>
	 */
	function santiagodel76_teb_get_allowed_html_for_inner_blocks() {
		$allowed_html = wp_kses_allowed_html( 'post' );

		$global_attributes = array(
			'class'            => true,
			'data-*'           => true,
			'hidden'           => true,
			'id'               => true,
			'role'             => true,
			'style'            => true,
			'title'            => true,
			'aria-controls'    => true,
			'aria-current'     => true,
			'aria-describedby' => true,
			'aria-details'     => true,
			'aria-expanded'    => true,
			'aria-hidden'      => true,
			'aria-label'       => true,
			'aria-labelledby'  => true,
			'aria-live'        => true,
		);

		$allowed_html['iframe'] = array_merge(
			$global_attributes,
			array(
				'allow'          => true,
				'allowfullscreen'=> true,
				'frameborder'    => true,
				'height'         => true,
				'loading'        => true,
				'name'           => true,
				'referrerpolicy' => true,
				'sandbox'        => true,
				'src'            => true,
				'srcdoc'         => true,
				'width'          => true,
			)
		);

		$allowed_html['source'] = array_merge(
			$global_attributes,
			array(
				'height' => true,
				'media'  => true,
				'sizes'  => true,
				'src'    => true,
				'srcset' => true,
				'type'   => true,
				'width'  => true,
			)
		);

		$allowed_html['video'] = array_merge(
			isset( $allowed_html['video'] ) && is_array( $allowed_html['video'] ) ? $allowed_html['video'] : array(),
			$global_attributes,
			array(
				'controlslist'         => true,
				'crossorigin'          => true,
				'disablepictureinpicture' => true,
				'disableremoteplayback'   => true,
				'playsinline'          => true,
			)
		);

		$allowed_html['audio'] = array_merge(
			isset( $allowed_html['audio'] ) && is_array( $allowed_html['audio'] ) ? $allowed_html['audio'] : array(),
			$global_attributes,
			array(
				'controlslist'         => true,
				'crossorigin'          => true,
				'disableremoteplayback'   => true,
				'preload'              => true,
				'src'                  => true,
			)
		);

		return $allowed_html;
	}
}

return function( $attributes, $content ) {
	if ( ! is_array( $attributes ) ) {
		$attributes = array();
	}

	$start = isset( $attributes['start'] ) && is_string( $attributes['start'] ) ? $attributes['start'] : '';
	$duration_minutes = isset( $attributes['durationMinutes'] ) ? (int) $attributes['durationMinutes'] : 60;
	$hide_when_ended = array_key_exists( 'hideWhenEnded', $attributes ) ? (bool) $attributes['hideWhenEnded'] : true;

	if ( $duration_minutes < 1 ) {
		$duration_minutes = 60;
	}

	$timezone = wp_timezone();
	$now = current_datetime();
	$start_dt = null;
	$start_ts = 0;
	$end_ts = 0;

	if ( '' !== trim( $start ) ) {
		try {
			$start_dt = new DateTimeImmutable( $start, $timezone );
		} catch ( Exception $e ) {
			$start_dt = null;
		}
	}

	$state = 'scheduled';
	if ( $start_dt instanceof DateTimeImmutable ) {
		$end_dt = $start_dt->modify( '+' . $duration_minutes . ' minutes' );
		$start_ts = $start_dt->getTimestamp();
		$end_ts = $end_dt->getTimestamp();

		if ( $now < $start_dt ) {
			$state = 'scheduled';
		} elseif ( $now >= $start_dt && $now < $end_dt ) {
			$state = 'active';
		} else {
			$state = 'ended';
		}
	}

	$should_hide_initial = $hide_when_ended && 'ended' === $state;

	$wrapper_attributes = get_block_wrapper_attributes(
		array(
			'class' => 'teb-timed-event',
			'data-start-ts' => $start_ts > 0 ? (string) $start_ts : '',
			'data-end-ts' => $end_ts > 0 ? (string) $end_ts : '',
			'data-hide-when-ended' => $hide_when_ended ? '1' : '0',
			'data-state' => $state,
			'aria-hidden' => $should_hide_initial ? 'true' : 'false',
		)
	);

	ob_start();
	?>
	<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?php echo $should_hide_initial ? ' hidden' : ''; ?>>
		<div class="teb-body">
			<?php echo wp_kses( $content, santiagodel76_teb_get_allowed_html_for_inner_blocks() ); ?>
		</div>
	</div>
	<?php
	return ob_get_clean();
};
