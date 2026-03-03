function updateEventTimeNode( node ) {
	const textNode = node.querySelector( '.teb-dynamic-text' );
	if ( ! textNode ) {
		return;
	}

	const startTs = parseInt( node.dataset.startTs || '', 10 );
	if ( Number.isNaN( startTs ) ) {
		return;
	}

	const durationMinutes = parseInt( node.dataset.durationMinutes || '60', 10 );
	const safeDurationMinutes = Number.isNaN( durationMinutes ) || durationMinutes < 1 ? 60 : durationMinutes;
	const endTs = startTs + safeDurationMinutes * 60;
	const nowTs = Math.floor( Date.now() / 1000 );

	const scheduledLabel = node.dataset.scheduledLabel || '';
	const activeLabel = node.dataset.activeLabel || 'Active';
	const endedLabel = node.dataset.endedLabel || 'Ended';
	const activeColor = node.dataset.activeColor || '';
	const endedColor = node.dataset.endedColor || '';

	if ( nowTs < startTs ) {
		textNode.textContent = scheduledLabel;
		textNode.style.color = '';
		return;
	}

	if ( nowTs < endTs ) {
		textNode.textContent = activeLabel;
		textNode.style.color = activeColor;
		return;
	}

	textNode.textContent = endedLabel;
	textNode.style.color = endedColor;
}

function mountEventTimeBlocks() {
	const nodes = document.querySelectorAll( '.teb-event-time[data-start-ts]' );
	if ( ! nodes.length ) {
		return;
	}

	nodes.forEach( updateEventTimeNode );
	setInterval( () => nodes.forEach( updateEventTimeNode ), 1000 );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', mountEventTimeBlocks );
} else {
	mountEventTimeBlocks();
}
