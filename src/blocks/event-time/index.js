import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { dateI18n } from '@wordpress/date';
import { InspectorControls, useBlockProps, useSettings } from '@wordpress/block-editor';
import { BaseControl, ColorPalette, PanelBody, SelectControl, TextControl } from '@wordpress/components';
import metadata from './block.json';
import brand from '../../brand';

registerBlockType( metadata.name, {
	...metadata,
	icon: brand.primary,
	edit( { attributes, setAttributes, context } ) {
		const {
			formatMode = 'site',
			customFormat = '',
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
			className: 'teb-event-time-editor',
		} );

		const start = context?.['timed-event-block/start'] || '';
		const durationRaw = context?.['timed-event-block/durationMinutes'];
		const duration = Number.isFinite( durationRaw ) ? durationRaw : parseInt( durationRaw, 10 ) || 60;

		let previewText = __( 'Event Time', 'timed-event-block' );
		let previewState = 'scheduled';

		if ( start ) {
			const startDate = new Date( start );

			if ( ! Number.isNaN( startDate.getTime() ) ) {
				const safeDuration = duration > 0 ? duration : 60;
				const endDate = new Date( startDate.getTime() + safeDuration * 60 * 1000 );
				const now = new Date();

				if ( now < startDate ) {
					previewState = 'scheduled';
					const timestamp = startDate.getTime();
					previewText =
						formatMode === 'custom' && customFormat
							? dateI18n( customFormat, timestamp )
							: startDate.toLocaleTimeString( [], { hour: '2-digit', minute: '2-digit' } );
				} else if ( now < endDate ) {
					previewState = 'active';
					previewText = activeLabel;
				} else {
					previewState = 'ended';
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
					<PanelBody title={ __( 'Time Settings', 'timed-event-block' ) } initialOpen={ true }>
						<SelectControl
							label={ __( 'Format', 'timed-event-block' ) }
							value={ formatMode }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							options={ [
								{ label: __( 'Site default', 'timed-event-block' ), value: 'site' },
								{ label: __( 'Custom', 'timed-event-block' ), value: 'custom' },
							] }
							onChange={ ( value ) => setAttributes( { formatMode: value } ) }
						/>
						{ formatMode === 'custom' && (
							<TextControl
								label={ __( 'Custom format', 'timed-event-block' ) }
								value={ customFormat }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								onChange={ ( value ) => setAttributes( { customFormat: value } ) }
								help={ __( 'Example: H:i or g:i a', 'timed-event-block' ) }
							/>
						) }
						<TextControl
							label={ __( 'Active label', 'timed-event-block' ) }
							value={ activeLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { activeLabel: value } ) }
						/>
						<TextControl
							label={ __( 'Ended label', 'timed-event-block' ) }
							value={ endedLabel }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { endedLabel: value } ) }
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
