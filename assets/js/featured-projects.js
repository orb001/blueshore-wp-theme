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

			// Arrow-key navigation within the tablist
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

		// ── Dot navigator click ────────────────────────
		var dotEls = Array.from( document.querySelectorAll( '.fp-nav__dot' ) );
		dotEls.forEach( function ( dot ) {
			dot.addEventListener( 'click', function () {
				var targetIndex = parseInt( dot.dataset.index, 10 );
				if ( targetIndex === currentIndex || isAnimating ) return;
				clearInterval( timer );
				switchTo( targetIndex );
				startAutoRotate();
			} );

			dot.addEventListener( 'keydown', function ( e ) {
				if ( e.key === 'Enter' || e.key === ' ' ) {
					e.preventDefault();
					dot.click();
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

		// ── Touch / swipe ──────────────────────────────
		var touchStartX = 0;
		var touchStartY = 0;

		if ( fpPanelsEl ) {
			fpPanelsEl.addEventListener( 'touchstart', function ( e ) {
				touchStartX = e.changedTouches[ 0 ].clientX;
				touchStartY = e.changedTouches[ 0 ].clientY;
			}, { passive: true } );

			fpPanelsEl.addEventListener( 'touchend', function ( e ) {
				var deltaX = e.changedTouches[ 0 ].clientX - touchStartX;
				var deltaY = e.changedTouches[ 0 ].clientY - touchStartY;

				if ( Math.abs( deltaX ) < 50 || Math.abs( deltaX ) <= Math.abs( deltaY ) ) return;

				clearInterval( timer );
				if ( deltaX < 0 ) {
					switchTo( ( currentIndex + 1 ) % total, true );
				} else {
					switchTo( ( currentIndex - 1 + total ) % total, true );
				}
				startAutoRotate();
			}, { passive: true } );
		}

		// ── Core switch ────────────────────────────────
		function switchTo( targetIndex, instant ) {
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

			if ( instant ) {
				leavingPanel.style.transition  = 'none';
				arrivingPanel.style.transition = 'none';
			}

			leavingPanel.classList.add( 'is-leaving' );
			leavingPanel.classList.remove( 'is-active' );
			leavingPanel.setAttribute( 'aria-hidden', 'true' );

			arrivingPanel.classList.add( 'is-active' );
			arrivingPanel.setAttribute( 'aria-hidden', 'false' );

			var duration = instant ? 0 : CROSSFADE_DURATION;
			setTimeout( function () {
				leavingPanel.classList.remove( 'is-leaving' );
				if ( instant ) {
					leavingPanel.style.transition  = '';
					arrivingPanel.style.transition = '';
				}
				isAnimating = false;
			}, duration );
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
