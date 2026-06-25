( function () {
	'use strict';

	var AUTO_ROTATE_INTERVAL = 5000;
	var CROSSFADE_DURATION   = 700;

	document.addEventListener( 'DOMContentLoaded', function () {
		var tabs   = Array.from( document.querySelectorAll( '.fp-tab' ) );
		var panels = Array.from( document.querySelectorAll( '.fp-panel' ) );

		if ( tabs.length === 0 || panels.length === 0 ) return;

		initFeaturedProjects( tabs, panels );
	} );

	function initFeaturedProjects( tabs, panels ) {
		var currentIndex = 0;
		var timer        = null;
		var isAnimating  = false;
		var total        = tabs.length;

		// Set initial order so first tab is visually on top
		updateOrder( 0 );

		// ── Tab click ──────────────────────────────────
		tabs.forEach( function ( tab ) {
			tab.addEventListener( 'click', function () {
				var targetIndex = parseInt( tab.dataset.index, 10 );
				if ( targetIndex === currentIndex || isAnimating ) return;

				clearInterval( timer );
				switchTo( targetIndex );
				startAutoRotate();
			} );

			// Arrow key navigation within the tablist
			tab.addEventListener( 'keydown', function ( e ) {
				var newIndex = null;
				if ( e.key === 'ArrowDown' || e.key === 'ArrowRight' ) {
					newIndex = ( currentIndex + 1 ) % total;
				} else if ( e.key === 'ArrowUp' || e.key === 'ArrowLeft' ) {
					newIndex = ( currentIndex - 1 + total ) % total;
				}
				if ( newIndex !== null ) {
					e.preventDefault();
					clearInterval( timer );
					switchTo( newIndex );
					tabs[ newIndex ].focus();
					startAutoRotate();
				}
			} );
		} );

		// ── Auto-rotate ────────────────────────────────
		function startAutoRotate() {
			clearInterval( timer );
			timer = setInterval( function () {
				var nextIndex = ( currentIndex + 1 ) % total;
				switchTo( nextIndex );
			}, AUTO_ROTATE_INTERVAL );
		}

		// ── Pause on hover ─────────────────────────────
		var fpTabsEl   = document.querySelector( '.fp-tabs' );
		var fpPanelsEl = document.querySelector( '.fp-panels' );

		[ fpTabsEl, fpPanelsEl ].forEach( function ( el ) {
			if ( ! el ) return;
			el.addEventListener( 'mouseenter', function () { clearInterval( timer ); } );
			el.addEventListener( 'mouseleave', function () { startAutoRotate(); } );
		} );

		// ── Core switch ────────────────────────────────
		function switchTo( targetIndex ) {
			if ( isAnimating || targetIndex === currentIndex ) return;
			isAnimating = true;

			var leavingIndex  = currentIndex;
			currentIndex      = targetIndex;

			// Update tabs
			tabs.forEach( function ( t, i ) {
				var active = ( i === targetIndex );
				t.classList.toggle( 'is-active', active );
				t.setAttribute( 'aria-selected', active ? 'true' : 'false' );
			} );

			// Reorder tabs so active is visually first
			updateOrder( targetIndex );

			// Crossfade panels
			var leavingPanel  = panels[ leavingIndex ];
			var arrivingPanel = panels[ targetIndex ];

			leavingPanel.classList.add( 'is-leaving' );
			leavingPanel.classList.remove( 'is-active' );
			leavingPanel.setAttribute( 'aria-hidden', 'true' );

			arrivingPanel.classList.add( 'is-active' );
			arrivingPanel.setAttribute( 'aria-hidden', 'false' );

			setTimeout( function () {
				leavingPanel.classList.remove( 'is-leaving' );
				isAnimating = false;
			}, CROSSFADE_DURATION );
		}

		function updateOrder( activeIndex ) {
			// FLIP: record positions before reorder
			var firstRects = tabs.map( function ( t ) { return t.getBoundingClientRect(); } );

			// Apply new order + distance attribute for stepped opacity
			tabs.forEach( function ( t, i ) {
				var dist = ( i - activeIndex + total ) % total;
				t.style.order      = dist;
				t.dataset.distance = dist;
			} );

			// Invert + Play: animate each tab from its old position to the new one
			tabs.forEach( function ( t, i ) {
				var deltaY = firstRects[ i ].top - t.getBoundingClientRect().top;
				if ( deltaY === 0 ) return;

				t.style.transition = 'none';
				t.style.transform  = 'translateY(' + deltaY + 'px)';

				// Force reflow so the browser registers the starting transform
				t.getBoundingClientRect();

				t.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
				t.style.transform  = '';
			} );
		}

		// ── Start ──────────────────────────────────────
		var prefersReduced = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		if ( ! prefersReduced ) {
			startAutoRotate();
		}
	}

} )();
