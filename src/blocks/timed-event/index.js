import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	InnerBlocks,
	useBlockProps,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	Notice,
} from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './main.css';
import brand from '../../brand';

const TEMPLATE = [
	[
		'core/columns',
		{},
		[
			[
				'core/column',
				{ width: '33.33%' },
				[
					[
						'core/group',
						{
							style: {
								spacing: {
									padding: {
										top: 'var:preset|spacing|md',
										right: 'var:preset|spacing|md',
										bottom: 'var:preset|spacing|md',
										left: 'var:preset|spacing|md',
									},
									margin: { top: '0', bottom: '0' },
									blockGap: '0',
								},
								typography: { textTransform: 'capitalize' },
								border: {
									style: 'solid',
									width: '1px',
									color: '#d1d5db',
									radius: {
										topLeft: '0.5rem',
										topRight: '0.5rem',
										bottomLeft: '0.5rem',
										bottomRight: '0.5rem',
									},
								},
							},
							layout: { type: 'constrained' },
						},
						[
							[
								'timed-event-block/date',
								{
									formatMode: 'custom',
									customFormat: 'F',
									fontSize: 'large',
									style: {
										typography: { textAlign: 'center' },
										spacing: {
											padding: { top: '0', right: '0', bottom: '0', left: '0' },
											margin: { top: '0', right: '0', bottom: '0', left: '0' },
										},
									},
								},
							],
							[
								'timed-event-block/date',
								{
									formatMode: 'custom',
									customFormat: 'j',
									fontSize: 'x-large',
									style: {
										typography: { textAlign: 'center' },
										spacing: {
											padding: { top: '0', right: '0', bottom: '0', left: '0' },
											margin: { top: '0', right: '0', bottom: '0', left: '0' },
										},
									},
								},
							],
						],
					],
				],
			],
			[
				'core/column',
				{ width: '66.66%' },
				[
					[
						'core/group',
						{
							style: {
								color: { background: '#e5e7eb', text: '#374151' },
								elements: { link: { color: { text: '#374151' } } },
							},
							layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between' },
						},
						[
							[
								'core/paragraph',
								{ content: `<strong>${ __( 'Event Time:', 'timed-event-block' ) }</strong>` },
							],
							[
								'timed-event-block/event-time',
								{
									activeLabel: __( 'Happening now', 'timed-event-block' ),
									endedLabel: __( 'Event ended', 'timed-event-block' ),
									style: { typography: { textAlign: 'right' } },
								},
							],
						],
					],
					[
						'core/group',
						{
							style: {
								color: { text: '#dc3545' },
								elements: { link: { color: { text: '#dc3545' } } },
								spacing: {
									blockGap: '0',
									padding: {
										top: 'var:preset|spacing|xs',
										right: 'var:preset|spacing|md',
										bottom: 'var:preset|spacing|xs',
										left: 'var:preset|spacing|md',
									},
								},
							},
							fontSize: 'large',
							layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'center' },
						},
						[
							[
								'core/paragraph',
								{
									content: __( 'Starts in:', 'timed-event-block' ),
									style: {
										color: { text: '#374151' },
										elements: { link: { color: { text: '#374151' } } },
									},
								},
							],
							[
								'timed-event-block/countdown',
								{
									separator: ' : ',
									activeLabel: __( 'Happening now', 'timed-event-block' ),
									endedLabel: __( 'Event ended', 'timed-event-block' ),
									style: {
										spacing: {
											margin: { top: '0', right: '0', bottom: '0', left: '0' },
											padding: {
												right: 'var:preset|spacing|md',
												left: 'var:preset|spacing|md',
											},
										},
									},
								},
							],
						],
					],
				],
			],
		],
	],
	[
		'core/paragraph',
		{ content: __( 'Start creating content here...', 'timed-event-block' ) },
	],
];

function toLocalDateTimeInputValue(isoString) {
	if (!isoString) {
		return '';
	}

	const date = new Date(isoString);

	if (Number.isNaN(date.getTime())) {
		return '';
	}

	const pad = (value) => String(value).padStart(2, '0');

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoString(localValue) {
	if (!localValue) {
		return '';
	}

	const date = new Date(localValue);

	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return date.toISOString();
}

function getEditorState(start, durationMinutes) {
	if (!start) {
		return { state: 'scheduled', label: __( 'Scheduled', 'timed-event-block' ), metaType: 'warning', meta: __('Select start date and time in sidebar', 'timed-event-block') };
	}

	const startDate = new Date(start);

	if (Number.isNaN(startDate.getTime())) {
		return { state: 'scheduled', label: __( 'Scheduled', 'timed-event-block' ), metaType: 'warning', meta: __('Select start date and time in sidebar', 'timed-event-block') };
	}

	const safeDuration = Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : 60;
	const endDate = new Date(startDate.getTime() + safeDuration * 60 * 1000);
	const now = new Date();

	if (now < startDate) {
		return {
			state: 'scheduled',
			label: __( 'Scheduled', 'timed-event-block' ),
			metaType: 'datetime',
			meta: startDate.toLocaleString(),
		};
	}

	if (now >= startDate && now < endDate) {
		return {
			state: 'active',
			label: __( 'Active', 'timed-event-block' ),
			metaType: 'label',
		};
	}

	return {
		state: 'ended',
		label: __( 'Ended', 'timed-event-block' ),
		metaType: 'label',
	};
}

function getStateVariant(state) {
	if (state === 'active') {
		return 'success';
	}

	if (state === 'ended') {
		return 'danger';
	}

	return 'info';
}

function getPreviewDateTime(start) {
	if (!start) {
		return null;
	}

	const date = new Date(start);

	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return {
		date: date.toLocaleDateString(),
		time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
	};
}

registerBlockType( metadata.name, {
	...metadata,
	icon: brand.primary,
	edit( { attributes, setAttributes } ) {
		const {
			start,
			durationMinutes = 60,
			hideWhenEnded = true,
		} = attributes;

		const blockProps = useBlockProps( { className: 'teb-editor-card' } );
		const allowedBlocks = useSelect(
			( select ) =>
				select( 'core/blocks' )
					.getBlockTypes()
					.map( ( blockType ) => blockType.name )
					.filter( ( name ) => name !== 'timed-event-block/timed-event' ),
			[]
		);
		const preview = getEditorState( start, durationMinutes );
		const previewDateTime = getPreviewDateTime( start );
		const stateVariant = getStateVariant( preview.state );

		const scheduledText = previewDateTime
			? `${ previewDateTime.date }, ${ previewDateTime.time }`
			: '';

		const stateBadgeText = preview.state === 'scheduled' && scheduledText
			? `${ preview.label } | ${ scheduledText }`
			: preview.label;

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Event Settings', 'timed-event-block' ) } initialOpen={ true }>
						<TextControl
							label={ __( 'Start date and time', 'timed-event-block' ) }
							type="datetime-local"
							value={ toLocalDateTimeInputValue( start ) }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { start: toIsoString( value ) } ) }
						/>
						<TextControl
							label={ __( 'Duration (minutes)', 'timed-event-block' ) }
							type="number"
							min={ 1 }
							value={ durationMinutes }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							onChange={ ( value ) => {
								const parsed = parseInt( value, 10 );
								setAttributes( { durationMinutes: Number.isNaN( parsed ) ? 60 : Math.max( 1, parsed ) } );
							} }
						/>
						<ToggleControl
							label={ __( 'Hide when ended', 'timed-event-block' ) }
							checked={ hideWhenEnded }
							__nextHasNoMarginBottom
							onChange={ ( value ) => setAttributes( { hideWhenEnded: value } ) }
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...blockProps }>
					<div className="teb-header">
						<p className={ `teb-state teb-state--${ stateVariant }` }>{ stateBadgeText }</p>
					</div>

					{ preview.metaType === 'warning' && (
						<Notice status="warning" isDismissible={ false }>
							{ preview.meta }
						</Notice>
					) }

					<div className="teb-body">
						<InnerBlocks
							allowedBlocks={ allowedBlocks }
							template={ TEMPLATE }
							templateLock={ false }
						/>
					</div>
				</div>
			</>
		);
	},
	save() {
		return <InnerBlocks.Content />;
	},
});
