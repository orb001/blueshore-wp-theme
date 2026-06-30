( function ( $ ) {
	'use strict';

	// Speed up Divi's mobile menu slide animation
	var _down = $.fn.slideDown;
	var _up   = $.fn.slideUp;

	$.fn.slideDown = function ( speed, easing, cb ) {
		if ( this.hasClass( 'et_mobile_menu' ) ) speed = 200;
		return _down.call( this, speed, easing, cb );
	};

	$.fn.slideUp = function ( speed, easing, cb ) {
		if ( this.hasClass( 'et_mobile_menu' ) ) speed = 200;
		return _up.call( this, speed, easing, cb );
	};

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
} )( jQuery );
