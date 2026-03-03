<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return function( $attributes, $content, $block ) {
	$sanitize_color = static function( $value ) {
		if ( ! is_string( $value ) ) {
			return '';
		}

		$sanitized = sanitize_hex_color( trim( $value ) );
		return is_string( $sanitized ) ? $sanitized : '';
	};

	$start = isset( $block->context['timed-event-block/start'] ) && is_string( $block->context['timed-event-block/start'] )
		? $block->context['timed-event-block/start']
		: '';

	$duration = isset( $block->context['timed-event-block/durationMinutes'] )
		? (int) $block->context['timed-event-block/durationMinutes']
		: 60;

	if ( '' === trim( $start ) ) {
		return '';
	}

	if ( $duration < 1 ) {
		$duration = 60;
	}

	$format_mode = isset( $attributes['formatMode'] ) && is_string( $attributes['formatMode'] )
		? $attributes['formatMode']
		: 'site';

	$custom_format = isset( $attributes['customFormat'] ) && is_string( $attributes['customFormat'] )
		? trim( $attributes['customFormat'] )
		: '';

	$active_label = isset( $attributes['activeLabel'] ) && is_string( $attributes['activeLabel'] )
		? $attributes['activeLabel']
		: 'Active';

	$ended_label = isset( $attributes['endedLabel'] ) && is_string( $attributes['endedLabel'] )
		? $attributes['endedLabel']
		: 'Ended';
	$active_color = $sanitize_color( $attributes['activeColor'] ?? '' );
	$ended_color = $sanitize_color( $attributes['endedColor'] ?? '' );

	$timezone = wp_timezone();

	try {
		$start_dt = new DateTimeImmutable( $start, $timezone );
	} catch ( Exception $e ) {
		return '';
	}

	$start_ts = $start_dt->getTimestamp();
	$scheduled_format = ( 'custom' === $format_mode && '' !== $custom_format )
		? $custom_format
		: get_option( 'time_format' );
	$scheduled_text = wp_date( $scheduled_format, $start_ts, $timezone );

	$end_dt = $start_dt->modify( '+' . $duration . ' minutes' );
	$now = current_datetime();
	$state = 'scheduled';

	if ( $now < $start_dt ) {
		$state = 'scheduled';
		$text = $scheduled_text;
	} elseif ( $now < $end_dt ) {
		$state = 'active';
		$text = $active_label;
	} else {
		$state = 'ended';
		$text = $ended_label;
	}

	$style = '';
	if ( 'active' === $state && '' !== $active_color ) {
		$style = 'color:' . $active_color . ';';
	} elseif ( 'ended' === $state && '' !== $ended_color ) {
		$style = 'color:' . $ended_color . ';';
	}

	$wrapper_args = array(
		'class' => 'teb-event-time',
		'role' => 'status',
		'aria-live' => 'polite',
		'aria-atomic' => 'true',
		'aria-label' => sprintf(
			/* translators: %s: Event time status text. */
			__( 'Event time status: %s', 'timed-event-block' ),
			$text
		),
		'data-start-ts' => (string) $start_ts,
		'data-duration-minutes' => (string) $duration,
		'data-scheduled-label' => $scheduled_text,
		'data-active-label' => $active_label,
		'data-ended-label' => $ended_label,
		'data-active-color' => $active_color,
		'data-ended-color' => $ended_color,
	);
	if ( '' !== $style ) {
		$wrapper_args['style'] = $style;
	}

	$wrapper_attributes = get_block_wrapper_attributes(
		$wrapper_args
	);

	return sprintf(
		'<p %1$s><span class="teb-dynamic-text">%2$s</span></p>',
		$wrapper_attributes,
		esc_html( $text )
	);
};
