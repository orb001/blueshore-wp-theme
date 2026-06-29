( function () {
	'use strict';

	var SCROLL_THRESHOLD = 60;

	document.addEventListener( 'DOMContentLoaded', function () {
		var header = document.querySelector( '.et_pb_section_0_tb_header' );

		if ( ! header ) return;

		function onScroll() {
			if ( window.scrollY > SCROLL_THRESHOLD ) {
				header.classList.add( 'nav-scrolled' );
			} else {
				header.classList.remove( 'nav-scrolled' );
			}
		}

		window.addEventListener( 'scroll', onScroll, { passive: true } );
		onScroll();
	} );
} )();
