<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return function( $attributes, $content, $block ) {
	$start = isset( $block->context['timed-event-block/start'] ) && is_string( $block->context['timed-event-block/start'] ) ? $block->context['timed-event-block/start'] : '';

	if ( '' === trim( $start ) ) {
		return '';
	}

	$format_mode = isset( $attributes['formatMode'] ) && is_string( $attributes['formatMode'] ) ? $attributes['formatMode'] : 'site';
	$custom_format = isset( $attributes['customFormat'] ) && is_string( $attributes['customFormat'] ) ? trim( $attributes['customFormat'] ) : '';
	$format = get_option( 'date_format' );

	if ( 'custom' === $format_mode && '' !== $custom_format ) {
		$format = $custom_format;
	}

	$timezone = wp_timezone();
	try {
		$start_dt = new DateTimeImmutable( $start, $timezone );
	} catch ( Exception $e ) {
		return '';
	}
	$datetime_attr = $start_dt->format( DateTimeInterface::ATOM );

	$wrapper_attributes = get_block_wrapper_attributes(
		array(
			'class' => 'teb-event-date',
		)
	);

	return sprintf(
		'<p %1$s><time datetime="%2$s">%3$s</time></p>',
		$wrapper_attributes,
		esc_attr( $datetime_attr ),
		esc_html( wp_date( $format, $start_dt->getTimestamp(), $timezone ) )
	);
};
