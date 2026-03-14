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

function updateCountdownNode( node ) {
	const textNode = node.querySelector( '.teb-dynamic-text' );
	if ( ! textNode ) {
		return;
	}

	const targetMode = node.dataset.targetMode || 'to_start';
	const startTs = parseInt( node.dataset.startTs || '', 10 );
	const endTs = parseInt( node.dataset.endTs || '', 10 );
	if ( Number.isNaN( startTs ) || Number.isNaN( endTs ) ) {
		return;
	}

	const targetTs = targetMode === 'to_end' ? endTs : startTs;
	const showDays = node.dataset.showDays === '1';
	const separator = node.dataset.separator || ':';
	const dayLabel = node.dataset.dayLabel || 'd';
	const dayLabelSingular = node.dataset.dayLabelSingular || '';
	const hourLabel = node.dataset.hourLabel || 'h';
	const hourLabelSingular = node.dataset.hourLabelSingular || '';
	const minuteLabel = node.dataset.minuteLabel || 'm';
	const minuteLabelSingular = node.dataset.minuteLabelSingular || '';
	const secondLabel = node.dataset.secondLabel || 's';
	const secondLabelSingular = node.dataset.secondLabelSingular || '';
	const prefixLabel = node.dataset.prefixLabel || '';
	const suffixLabel = node.dataset.suffixLabel || '';
	const activeLabel = node.dataset.activeLabel || 'Active';
	const endedLabel = node.dataset.endedLabel || 'Ended';
	const activeColor = node.dataset.activeColor || '';
	const endedColor = node.dataset.endedColor || '';
	const nowTs = Math.floor( Date.now() / 1000 );
	const remaining = targetTs - nowTs;

	let state = 'scheduled';
	if ( nowTs >= startTs && nowTs < endTs ) {
		state = 'active';
	} else if ( nowTs >= endTs ) {
		state = 'ended';
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
		textNode.textContent = `${ prefixText }${ countdownText }${ suffixText }`;
		textNode.style.color = '';
		return;
	}

	if ( state === 'active' ) {
		textNode.textContent = activeLabel;
		textNode.style.color = activeColor;
		return;
	}

	textNode.textContent = endedLabel;
	textNode.style.color = endedColor;
}

function mountCountdowns() {
	const nodes = document.querySelectorAll( '.teb-countdown[data-start-ts][data-end-ts]' );
	if ( ! nodes.length ) {
		return;
	}

	nodes.forEach( updateCountdownNode );
	setInterval( () => nodes.forEach( updateCountdownNode ), 1000 );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', mountCountdowns );
} else {
	mountCountdowns();
}

