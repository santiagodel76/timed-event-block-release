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
	const hourLabel = node.dataset.hourLabel || 'h';
	const minuteLabel = node.dataset.minuteLabel || 'm';
	const secondLabel = node.dataset.secondLabel || 's';
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
		textNode.textContent = formatCountdown( remaining, showDays, separator, {
			day: dayLabel,
			hour: hourLabel,
			minute: minuteLabel,
			second: secondLabel,
		} );
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
