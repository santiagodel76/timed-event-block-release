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
	const pad = ( value ) => String( value ).padStart( 2, '0' );
	const dayLabel = labels?.day || 'd';
	const hourLabel = labels?.hour || 'h';
	const minuteLabel = labels?.minute || 'm';
	const secondLabel = labels?.second || 's';

	if ( showDays ) {
		return `${ days } ${ dayLabel }${ separator }${ pad( hours ) } ${ hourLabel }${ separator }${ pad( minutes ) } ${ minuteLabel }${ separator }${ pad( seconds ) } ${ secondLabel }`;
	}

	const totalHours = Math.floor( safeSeconds / 3600 );
	return `${ pad( totalHours ) } ${ hourLabel }${ separator }${ pad( minutes ) } ${ minuteLabel }${ separator }${ pad( seconds ) } ${ secondLabel }`;
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
			hourLabel = 'h',
			minuteLabel = 'm',
			secondLabel = 's',
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
					previewText = formatCountdown( remaining, showDays, separator, {
						day: dayLabel,
						hour: hourLabel,
						minute: minuteLabel,
						second: secondLabel,
					} );
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
							label={ __( 'Day label', 'timed-event-block' ) }
							value={ dayLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { dayLabel: value || 'd' } ) }
						/>
						<TextControl
							label={ __( 'Hour label', 'timed-event-block' ) }
							value={ hourLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { hourLabel: value || 'h' } ) }
						/>
						<TextControl
							label={ __( 'Minute label', 'timed-event-block' ) }
							value={ minuteLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { minuteLabel: value || 'm' } ) }
						/>
						<TextControl
							label={ __( 'Second label', 'timed-event-block' ) }
							value={ secondLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { secondLabel: value || 's' } ) }
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
