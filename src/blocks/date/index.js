import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { dateI18n } from '@wordpress/date';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import metadata from './block.json';
import brand from '../../brand';

registerBlockType( metadata.name, {
	...metadata,
	icon: brand.primary,
	edit( { attributes, setAttributes, context } ) {
		const { formatMode = 'site', customFormat = '' } = attributes;
		const blockProps = useBlockProps( {
			className: 'teb-event-date-editor',
		} );
		const start = context?.['timed-event-block/start'] || '';
		let previewText = __( 'Event Date', 'timed-event-block' );

		if ( start ) {
			const date = new Date( start );

			if ( ! Number.isNaN( date.getTime() ) ) {
				const timestamp = date.getTime();
				previewText =
					formatMode === 'custom' && customFormat
						? dateI18n( customFormat, timestamp )
						: date.toLocaleDateString();
			}
		}

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Date Settings', 'timed-event-block' ) } initialOpen={ true }>
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
								help={ __( 'Example: d/m/Y or Y-m-d', 'timed-event-block' ) }
							/>
						) }
					</PanelBody>
				</InspectorControls>
				<p { ...blockProps }>{ previewText }</p>
			</>
		);
	},
	save() {
		return null;
	},
} );
