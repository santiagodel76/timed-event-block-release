import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { InspectorControls, useBlockProps, useSettings } from '@wordpress/block-editor';
import { BaseControl, ColorPalette, PanelBody, SelectControl, TextControl, ToggleControl } from '@wordpress/components';
import metadata from './block.json';
import brand from '../../brand';

function formatCountdown( totalSeconds, showDays, separator, labels ) {
	const safeSeconds = Math.max( 0, totalSeconds );
	const days = Math.floor( safeSeconds / 86400 );
	const hours = Math.floor( ( safeSeconds % 86400 ) / 3600 );
	const minutes = Math.floor( ( safeSeconds % 3600 ) / 60 );
	const seconds = safeSeconds % 60;
	const raw = ( value ) => String( value );
	const dayLabel = labels?.day || 'd';
	const dayLabelSingular = labels?.daySingular || dayLabel;
	const hourLabel = labels?.hour || 'h';
	const hourLabelSingular = labels?.hourSingular || hourLabel;
	const minuteLabel = labels?.minute || 'm';
	const minuteLabelSingular = labels?.minuteSingular || minuteLabel;
	const secondLabel = labels?.second || 's';
	const secondLabelSingular = labels?.secondSingular || secondLabel;
	const unitLabel = ( value, plural, singular ) => ( value === 1 ? singular : plural );

	if ( showDays && days > 0 ) {
		return `${ days } ${ unitLabel( days, dayLabel, dayLabelSingular ) }${ separator }${ raw( hours ) } ${ unitLabel( hours, hourLabel, hourLabelSingular ) }${ separator }${ raw( minutes ) } ${ unitLabel( minutes, minuteLabel, minuteLabelSingular ) }${ separator }${ raw( seconds ) } ${ unitLabel( seconds, secondLabel, secondLabelSingular ) }`;
	}

	if ( hours > 0 ) {
		return `${ raw( hours ) } ${ unitLabel( hours, hourLabel, hourLabelSingular ) }${ separator }${ raw( minutes ) } ${ unitLabel( minutes, minuteLabel, minuteLabelSingular ) }${ separator }${ raw( seconds ) } ${ unitLabel( seconds, secondLabel, secondLabelSingular ) }`;
	}

	if ( minutes > 0 ) {
		return `${ raw( minutes ) } ${ unitLabel( minutes, minuteLabel, minuteLabelSingular ) }${ separator }${ raw( seconds ) } ${ unitLabel( seconds, secondLabel, secondLabelSingular ) }`;
	}

	return `${ raw( seconds ) } ${ unitLabel( seconds, secondLabel, secondLabelSingular ) }`;
}

registerBlockType( metadata.name, {
	...metadata,
	icon: brand.primary,
	edit( { attributes, setAttributes, context } ) {
		const {
			targetMode = 'to_start',
			showDays = true,
			separator = ':',
			dayLabel = 'd',
			dayLabelSingular = '',
			hourLabel = 'h',
			hourLabelSingular = '',
			minuteLabel = 'm',
			minuteLabelSingular = '',
			secondLabel = 's',
			secondLabelSingular = '',
			prefixLabel = '',
			suffixLabel = '',
			activeLabel = __( 'Active', 'timed-event-block' ),
			endedLabel = __( 'Ended', 'timed-event-block' ),
			activeColor = '#166534',
			endedColor = '#991b1b',
		} = attributes;
		const [ rawThemePalette ] = useSettings( 'color.palette' );
		const themePalette = Array.isArray( rawThemePalette )
			? rawThemePalette
			: [
					...( rawThemePalette?.theme || [] ),
					...( rawThemePalette?.default || [] ),
					...( rawThemePalette?.custom || [] ),
			  ];

		const blockProps = useBlockProps( {
			className: 'teb-countdown-editor',
		} );

		const start = context?.['timed-event-block/start'] || '';
		const durationRaw = context?.['timed-event-block/durationMinutes'];
		const duration = Number.isFinite( durationRaw ) ? durationRaw : parseInt( durationRaw, 10 ) || 60;
		const [ now, setNow ] = useState( Date.now() );

		useEffect( () => {
			const timer = setInterval( () => setNow( Date.now() ), 1000 );
			return () => clearInterval( timer );
		}, [] );

		let previewText = __( 'Countdown', 'timed-event-block' );
		let previewState = 'scheduled';

		if ( start ) {
			const startDate = new Date( start );
			if ( ! Number.isNaN( startDate.getTime() ) ) {
				const safeDuration = duration > 0 ? duration : 60;
				const endDate = new Date( startDate.getTime() + safeDuration * 60 * 1000 );
				const targetDate = targetMode === 'to_end' ? endDate : startDate;
				const remaining = Math.floor( ( targetDate.getTime() - now ) / 1000 );

				if ( now < startDate.getTime() ) {
					previewState = 'scheduled';
				} else if ( now < endDate.getTime() ) {
					previewState = 'active';
				} else {
					previewState = 'ended';
				}

				if ( remaining > 0 ) {
					const countdownText = formatCountdown( remaining, showDays, separator, {
						day: dayLabel,
						daySingular: dayLabelSingular,
						hour: hourLabel,
						hourSingular: hourLabelSingular,
						minute: minuteLabel,
						minuteSingular: minuteLabelSingular,
						second: secondLabel,
						secondSingular: secondLabelSingular,
					} );
					const prefixText = prefixLabel ? `${ prefixLabel } ` : '';
					const suffixText = suffixLabel ? ` ${ suffixLabel }` : '';
					previewText = `${ prefixText }${ countdownText }${ suffixText }`;
				} else if ( previewState === 'active' ) {
					previewText = activeLabel;
				} else {
					previewText = endedLabel;
				}
			}
		}

		const previewTextStyle = {};
		if ( previewState === 'active' ) {
			previewTextStyle.color = activeColor;
		} else if ( previewState === 'ended' ) {
			previewTextStyle.color = endedColor;
		}

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Countdown Settings', 'timed-event-block' ) } initialOpen={ true }>
						<SelectControl
							label={ __( 'Target mode', 'timed-event-block' ) }
							value={ targetMode }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							options={ [
								{ label: __( 'Countdown to start', 'timed-event-block' ), value: 'to_start' },
								{ label: __( 'Countdown to end', 'timed-event-block' ), value: 'to_end' },
							] }
							onChange={ ( value ) => setAttributes( { targetMode: value } ) }
						/>
						<ToggleControl
							label={ __( 'Show days', 'timed-event-block' ) }
							checked={ showDays }
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { showDays: value } ) }
						/>
						<TextControl
							label={ __( 'Separator', 'timed-event-block' ) }
							value={ separator }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { separator: value || ':' } ) }
							help={ __( 'Example: : or |', 'timed-event-block' ) }
						/>
						<TextControl
							label={ __( 'Day label (plural)', 'timed-event-block' ) }
							value={ dayLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { dayLabel: value || 'd' } ) }
						/>
						<TextControl
							label={ __( 'Day label (singular)', 'timed-event-block' ) }
							value={ dayLabelSingular }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { dayLabelSingular: value || '' } ) }
						/>
						<TextControl
							label={ __( 'Hour label (plural)', 'timed-event-block' ) }
							value={ hourLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { hourLabel: value || 'h' } ) }
						/>
						<TextControl
							label={ __( 'Hour label (singular)', 'timed-event-block' ) }
							value={ hourLabelSingular }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { hourLabelSingular: value || '' } ) }
						/>
						<TextControl
							label={ __( 'Minute label (plural)', 'timed-event-block' ) }
							value={ minuteLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { minuteLabel: value || 'm' } ) }
						/>
						<TextControl
							label={ __( 'Minute label (singular)', 'timed-event-block' ) }
							value={ minuteLabelSingular }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { minuteLabelSingular: value || '' } ) }
						/>
						<TextControl
							label={ __( 'Second label (plural)', 'timed-event-block' ) }
							value={ secondLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { secondLabel: value || 's' } ) }
						/>
						<TextControl
							label={ __( 'Second label (singular)', 'timed-event-block' ) }
							value={ secondLabelSingular }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { secondLabelSingular: value || '' } ) }
						/>
						<TextControl
							label={ __( 'Prefix label', 'timed-event-block' ) }
							value={ prefixLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { prefixLabel: value || '' } ) }
						/>
						<TextControl
							label={ __( 'Suffix label', 'timed-event-block' ) }
							value={ suffixLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { suffixLabel: value || '' } ) }
						/>
						<TextControl
							label={ __( 'Active label', 'timed-event-block' ) }
							value={ activeLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { activeLabel: value || 'Active' } ) }
						/>
						<TextControl
							label={ __( 'Ended label', 'timed-event-block' ) }
							value={ endedLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { endedLabel: value || 'Ended' } ) }
						/>
						<BaseControl
							label={ __( 'Active color', 'timed-event-block' ) }
							__nextHasNoMarginBottom
						>
							<ColorPalette
								colors={ themePalette.length ? themePalette : undefined }
								value={ activeColor }
								onChange={ ( value ) => setAttributes( { activeColor: value || '#166534' } ) }
								enableAlpha={ false }
							/>
						</BaseControl>
						<BaseControl
							label={ __( 'Ended color', 'timed-event-block' ) }
							__nextHasNoMarginBottom
						>
							<ColorPalette
								colors={ themePalette.length ? themePalette : undefined }
								value={ endedColor }
								onChange={ ( value ) => setAttributes( { endedColor: value || '#991b1b' } ) }
								enableAlpha={ false }
							/>
						</BaseControl>
					</PanelBody>
				</InspectorControls>
				<p { ...blockProps }>
					<span className="teb-dynamic-text" style={ previewTextStyle }>{ previewText }</span>
				</p>
			</>
		);
	},
	save() {
		return null;
	},
} );
