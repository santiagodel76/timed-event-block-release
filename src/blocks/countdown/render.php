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

	$target_mode = isset( $attributes['targetMode'] ) && is_string( $attributes['targetMode'] ) ? $attributes['targetMode'] : 'to_start';
	$show_days = array_key_exists( 'showDays', $attributes ) ? (bool) $attributes['showDays'] : true;
	$separator = isset( $attributes['separator'] ) && is_string( $attributes['separator'] ) ? $attributes['separator'] : ':';
	$day_label = isset( $attributes['dayLabel'] ) && is_string( $attributes['dayLabel'] ) ? trim( $attributes['dayLabel'] ) : 'd';
	$day_label_singular = isset( $attributes['dayLabelSingular'] ) && is_string( $attributes['dayLabelSingular'] ) ? trim( $attributes['dayLabelSingular'] ) : '';
	$hour_label = isset( $attributes['hourLabel'] ) && is_string( $attributes['hourLabel'] ) ? trim( $attributes['hourLabel'] ) : 'h';
	$hour_label_singular = isset( $attributes['hourLabelSingular'] ) && is_string( $attributes['hourLabelSingular'] ) ? trim( $attributes['hourLabelSingular'] ) : '';
	$minute_label = isset( $attributes['minuteLabel'] ) && is_string( $attributes['minuteLabel'] ) ? trim( $attributes['minuteLabel'] ) : 'm';
	$minute_label_singular = isset( $attributes['minuteLabelSingular'] ) && is_string( $attributes['minuteLabelSingular'] ) ? trim( $attributes['minuteLabelSingular'] ) : '';
	$second_label = isset( $attributes['secondLabel'] ) && is_string( $attributes['secondLabel'] ) ? trim( $attributes['secondLabel'] ) : 's';
	$second_label_singular = isset( $attributes['secondLabelSingular'] ) && is_string( $attributes['secondLabelSingular'] ) ? trim( $attributes['secondLabelSingular'] ) : '';
	$prefix_label = isset( $attributes['prefixLabel'] ) && is_string( $attributes['prefixLabel'] ) ? trim( $attributes['prefixLabel'] ) : '';
	$suffix_label = isset( $attributes['suffixLabel'] ) && is_string( $attributes['suffixLabel'] ) ? trim( $attributes['suffixLabel'] ) : '';
	$active_label = isset( $attributes['activeLabel'] ) && is_string( $attributes['activeLabel'] ) ? $attributes['activeLabel'] : 'Active';
	$ended_label = isset( $attributes['endedLabel'] ) && is_string( $attributes['endedLabel'] ) ? $attributes['endedLabel'] : 'Ended';
	$active_color = $sanitize_color( $attributes['activeColor'] ?? '' );
	$ended_color = $sanitize_color( $attributes['endedColor'] ?? '' );
	$timezone = wp_timezone();

	try {
		$start_dt = new DateTimeImmutable( $start, $timezone );
	} catch ( Exception $e ) {
		return '';
	}

	$start_ts = $start_dt->getTimestamp();
	$end_ts = $start_ts + ( $duration * MINUTE_IN_SECONDS );
	$target_ts = 'to_end' === $target_mode ? $end_ts : $start_ts;
	$now_ts = time();
	$remaining = $target_ts - $now_ts;

	if ( $now_ts < $start_ts ) {
		$state = 'scheduled';
	} elseif ( $now_ts < $end_ts ) {
		$state = 'active';
	} else {
		$state = 'ended';
	}

	$format_countdown = static function( $seconds, $days_enabled, $sep, $labels ) {
		$safe_seconds = max( 0, (int) $seconds );
		$days = (int) floor( $safe_seconds / DAY_IN_SECONDS );
		$hours = (int) floor( ( $safe_seconds % DAY_IN_SECONDS ) / HOUR_IN_SECONDS );
		$minutes = (int) floor( ( $safe_seconds % HOUR_IN_SECONDS ) / MINUTE_IN_SECONDS );
		$secs = (int) ( $safe_seconds % MINUTE_IN_SECONDS );
		$day_unit = isset( $labels['day'] ) && '' !== $labels['day'] ? $labels['day'] : 'd';
		$day_unit_singular = isset( $labels['daySingular'] ) && '' !== $labels['daySingular'] ? $labels['daySingular'] : $day_unit;
		$hour_unit = isset( $labels['hour'] ) && '' !== $labels['hour'] ? $labels['hour'] : 'h';
		$hour_unit_singular = isset( $labels['hourSingular'] ) && '' !== $labels['hourSingular'] ? $labels['hourSingular'] : $hour_unit;
		$minute_unit = isset( $labels['minute'] ) && '' !== $labels['minute'] ? $labels['minute'] : 'm';
		$minute_unit_singular = isset( $labels['minuteSingular'] ) && '' !== $labels['minuteSingular'] ? $labels['minuteSingular'] : $minute_unit;
		$second_unit = isset( $labels['second'] ) && '' !== $labels['second'] ? $labels['second'] : 's';
		$second_unit_singular = isset( $labels['secondSingular'] ) && '' !== $labels['secondSingular'] ? $labels['secondSingular'] : $second_unit;
		$resolve_unit = static function( $value, $plural, $singular ) {
			return 1 === (int) $value ? $singular : $plural;
		};

		if ( $days_enabled && $days > 0 ) {
			return sprintf( '%d %s%s%d %s%s%d %s%s%d %s', $days, $resolve_unit( $days, $day_unit, $day_unit_singular ), $sep, $hours, $resolve_unit( $hours, $hour_unit, $hour_unit_singular ), $sep, $minutes, $resolve_unit( $minutes, $minute_unit, $minute_unit_singular ), $sep, $secs, $resolve_unit( $secs, $second_unit, $second_unit_singular ) );
		}

		if ( $hours > 0 ) {
			return sprintf( '%d %s%s%d %s%s%d %s', $hours, $resolve_unit( $hours, $hour_unit, $hour_unit_singular ), $sep, $minutes, $resolve_unit( $minutes, $minute_unit, $minute_unit_singular ), $sep, $secs, $resolve_unit( $secs, $second_unit, $second_unit_singular ) );
		}

		if ( $minutes > 0 ) {
			return sprintf( '%d %s%s%d %s', $minutes, $resolve_unit( $minutes, $minute_unit, $minute_unit_singular ), $sep, $secs, $resolve_unit( $secs, $second_unit, $second_unit_singular ) );
		}

		return sprintf( '%d %s', $secs, $resolve_unit( $secs, $second_unit, $second_unit_singular ) );
	};

	if ( $remaining > 0 ) {
		$countdown_text = $format_countdown(
			$remaining,
			$show_days,
			$separator,
			array(
				'day' => $day_label,
				'daySingular' => $day_label_singular,
				'hour' => $hour_label,
				'hourSingular' => $hour_label_singular,
				'minute' => $minute_label,
				'minuteSingular' => $minute_label_singular,
				'second' => $second_label,
				'secondSingular' => $second_label_singular,
			)
		);
		$text = trim( $prefix_label . ' ' . $countdown_text . ' ' . $suffix_label );
	} elseif ( 'active' === $state ) {
		$text = $active_label;
	} else {
		$text = $ended_label;
	}

	$style = '';
	if ( 'active' === $state && $remaining <= 0 && '' !== $active_color ) {
		$style = 'color:' . $active_color . ';';
	} elseif ( 'ended' === $state && '' !== $ended_color ) {
		$style = 'color:' . $ended_color . ';';
	}
	$aria_label = $remaining > 0
		? sprintf(
			/* translators: %s: Event countdown text. */
			__( 'Event countdown: %s', 'timed-event-block' ),
			$text
		)
		: sprintf(
			/* translators: %s: Event countdown status text. */
			__( 'Event countdown status: %s', 'timed-event-block' ),
			$text
		);

	$wrapper_args = array(
		'class' => 'teb-countdown',
		'role' => 'timer',
		'aria-live' => 'off',
		'aria-atomic' => 'true',
		'aria-label' => $aria_label,
		'data-target-mode' => $target_mode,
		'data-start-ts' => (string) $start_ts,
		'data-end-ts' => (string) $end_ts,
		'data-show-days' => $show_days ? '1' : '0',
		'data-separator' => $separator,
		'data-day-label' => $day_label,
		'data-day-label-singular' => $day_label_singular,
		'data-hour-label' => $hour_label,
		'data-hour-label-singular' => $hour_label_singular,
		'data-minute-label' => $minute_label,
		'data-minute-label-singular' => $minute_label_singular,
		'data-second-label' => $second_label,
		'data-second-label-singular' => $second_label_singular,
		'data-prefix-label' => $prefix_label,
		'data-suffix-label' => $suffix_label,
		'data-active-label' => $active_label,
		'data-ended-label' => $ended_label,
		'data-active-color' => $active_color,
		'data-ended-color' => $ended_color,
	);
	if ( '' !== $style ) {
		$wrapper_args['style'] = $style;
	}

	$wrapper_attributes = get_block_wrapper_attributes( $wrapper_args );

	return sprintf(
		'<p %1$s><span class="teb-dynamic-text">%2$s</span></p>',
		$wrapper_attributes,
		esc_html( $text )
	);
};

