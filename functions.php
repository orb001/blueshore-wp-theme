<?php

// Enqueue parent (Divi) styles
add_action('wp_enqueue_scripts', 'blueshore_child_enqueue_styles');
function blueshore_child_enqueue_styles()
{
	wp_enqueue_style(
		'divi-style',
		get_template_directory_uri() . '/style.css'
	);
	wp_enqueue_style(
		'blueshore-child-style',
		get_stylesheet_uri(),
		array('divi-style'),
		wp_get_theme()->get('Version')
	);
	wp_enqueue_script(
		'blueshore-featured-projects',
		get_stylesheet_directory_uri() . '/assets/js/featured-projects.js',
		array(),
		'1.0.0',
		true
	);
	wp_enqueue_script(
		'blueshore-custom-select',
		get_stylesheet_directory_uri() . '/assets/js/custom-select.js',
		array(),
		'1.0.0',
		true
	);
	wp_enqueue_script(
		'blueshore-nav',
		get_stylesheet_directory_uri() . '/assets/js/nav.js',
		array( 'jquery' ),
		'1.0.0',
		true
	);
}

function blueshore_preload_nav_icons() {
	echo '<link rel="preload" href="/wp-content/uploads/mobile-open.svg" as="image" type="image/svg+xml">' . "\n";
	echo '<link rel="preload" href="/wp-content/uploads/mobile-close.svg" as="image" type="image/svg+xml">' . "\n";
}
add_action( 'wp_head', 'blueshore_preload_nav_icons' );

require_once get_stylesheet_directory() . '/inc/featured-projects.php';
