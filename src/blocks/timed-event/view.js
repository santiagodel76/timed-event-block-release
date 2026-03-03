function isHiddenEnabled( node ) {
	return node.dataset.hideWhenEnded === '1';
}

function parseTimestamp( value ) {
	const ts = parseInt( value || '', 10 );
	return Number.isNaN( ts ) ? 0 : ts;
}

function setNodeHiddenState( node, shouldHide ) {
	node.hidden = shouldHide;
	node.style.display = shouldHide ? 'none' : '';
	node.setAttribute( 'aria-hidden', shouldHide ? 'true' : 'false' );
}

function updateTimedEventNode( node, nowTs ) {
	if ( ! isHiddenEnabled( node ) ) {
		setNodeHiddenState( node, false );
		return;
	}

	const startTs = parseTimestamp( node.dataset.startTs );
	const endTs = parseTimestamp( node.dataset.endTs );
	const state = node.dataset.state || '';

	if ( endTs > 0 ) {
		setNodeHiddenState( node, nowTs >= endTs );
		return;
	}

	if ( startTs > 0 ) {
		setNodeHiddenState( node, false );
		return;
	}

	setNodeHiddenState( node, state === 'ended' );
}

function tickNodes( nodes ) {
	const nowTs = Math.floor( Date.now() / 1000 );
	nodes.forEach( ( node ) => updateTimedEventNode( node, nowTs ) );
}

function mountTimedEventBlocks() {
	const nodes = document.querySelectorAll( '.teb-timed-event[data-hide-when-ended]' );
	if ( ! nodes.length ) {
		return;
	}

	tickNodes( nodes );

	setInterval( () => {
		tickNodes( nodes );
	}, 1000 );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', mountTimedEventBlocks );
} else {
	mountTimedEventBlocks();
}
