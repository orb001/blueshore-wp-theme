<?php

// ─────────────────────────────────────────────
// Custom Post Type: Featured Project
// ─────────────────────────────────────────────
add_action( 'init', 'blueshore_register_featured_project_cpt' );

function blueshore_register_featured_project_cpt() {
	register_post_type( 'fp_project', array(
		'labels' => array(
			'name'               => 'Featured Projects',
			'singular_name'      => 'Featured Project',
			'add_new'            => 'Add New',
			'add_new_item'       => 'Add New Featured Project',
			'edit_item'          => 'Edit Featured Project',
			'new_item'           => 'New Featured Project',
			'view_item'          => 'View Featured Project',
			'search_items'       => 'Search Featured Projects',
			'not_found'          => 'No featured projects found.',
			'not_found_in_trash' => 'No featured projects found in Trash.',
			'menu_name'          => 'Featured Projects',
		),
		'public'       => false,
		'show_ui'      => true,
		'show_in_menu' => true,
		'menu_icon'    => 'dashicons-building',
		'menu_position'=> 25,
		'supports'     => array( 'title', 'page-attributes' ),
		'has_archive'  => false,
	) );
}

// ─────────────────────────────────────────────
// ACF Field Group (free ACF compatible)
// ─────────────────────────────────────────────
add_action( 'acf/init', 'blueshore_register_featured_projects_fields' );

function blueshore_register_featured_projects_fields() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

	acf_add_local_field_group( array(
		'key'    => 'group_featured_projects',
		'title'  => 'Project Details',
		'fields' => array(
			array(
				'key'          => 'field_fp_tab_title',
				'label'        => 'Tab Title',
				'name'         => 'tab_title',
				'type'         => 'text',
				'instructions' => 'Short category name shown in the tab carousel (e.g. Hillside, Groundwork, Subdivision).',
				'required'     => 1,
				'maxlength'    => 30,
			),
			array(
				'key'          => 'field_fp_description',
				'label'        => 'Description',
				'name'         => 'description',
				'type'         => 'textarea',
				'instructions' => 'Two to four sentence project summary. Plain text only.',
				'required'     => 1,
				'rows'         => 3,
				'new_lines'    => 'br',
			),
			array(
				'key'          => 'field_fp_client_label',
				'label'        => 'Client Label',
				'name'         => 'client_label',
				'type'         => 'text',
				'instructions' => 'Role label shown above the client name (e.g. BUILDER, DEVELOPER, OWNER).',
				'required'     => 1,
				'maxlength'    => 20,
				'wrapper'      => array( 'width' => '33' ),
			),
			array(
				'key'          => 'field_fp_client_name',
				'label'        => 'Client Name',
				'name'         => 'client_name',
				'type'         => 'text',
				'instructions' => 'Client company or individual name.',
				'required'     => 1,
				'wrapper'      => array( 'width' => '67' ),
			),
			array(
				'key'          => 'field_fp_button_url',
				'label'        => 'Button URL',
				'name'         => 'button_url',
				'type'         => 'url',
				'instructions' => 'URL for the "See Our Projects" button. Leave empty to hide the button.',
				'required'     => 0,
			),
			array(
				'key'           => 'field_fp_project_image',
				'label'         => 'Project Image',
				'name'          => 'project_image',
				'type'          => 'image',
				'instructions'  => 'Landscape orientation recommended. Minimum 1200x800px.',
				'required'      => 1,
				'return_format' => 'array',
				'preview_size'  => 'medium',
			),
		),
		'location' => array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'fp_project',
				),
			),
		),
		'menu_order'      => 0,
		'position'        => 'normal',
		'style'           => 'default',
		'label_placement' => 'top',
	) );
}

// ─────────────────────────────────────────────
// Helper: fetch projects ordered by menu_order
// ─────────────────────────────────────────────
function blueshore_get_featured_projects() {
	return get_posts( array(
		'post_type'      => 'fp_project',
		'post_status'    => 'publish',
		'posts_per_page' => 8,
		'orderby'        => 'menu_order',
		'order'          => 'ASC',
	) );
}

// ─────────────────────────────────────────────
// Shortcode 1: [featured_project_titles]
// Renders the tab carousel (top-right)
// ─────────────────────────────────────────────
add_shortcode( 'featured_project_titles', 'blueshore_featured_project_titles_shortcode' );

function blueshore_featured_project_titles_shortcode() {
	$projects = blueshore_get_featured_projects();

	if ( empty( $projects ) ) return '';

	ob_start();
	?>
	<div class="fp-tabs" role="tablist" aria-label="Featured project categories">
		<?php foreach ( $projects as $index => $project ) :
			$is_active = ( $index === 0 );
			$tab_title = get_field( 'tab_title', $project->ID ) ?: get_the_title( $project->ID );
		?>
		<button
			class="fp-tab<?php echo $is_active ? ' is-active' : ''; ?>"
			data-index="<?php echo esc_attr( $index ); ?>"
			role="tab"
			aria-selected="<?php echo $is_active ? 'true' : 'false'; ?>"
			aria-controls="fp-panel-<?php echo esc_attr( $index ); ?>"
			id="fp-tab-<?php echo esc_attr( $index ); ?>"
			style="order: <?php echo esc_attr( $index ); ?>;"
		>
			<?php echo esc_html( $tab_title ); ?>
		</button>
		<?php endforeach; ?>
	</div>
	<?php
	return ob_get_clean();
}

// ─────────────────────────────────────────────
// Shortcode 2: [featured_projects]
// Renders the content panels (bottom row)
// ─────────────────────────────────────────────
add_shortcode( 'featured_projects', 'blueshore_featured_projects_shortcode' );

function blueshore_featured_projects_shortcode() {
	$projects = blueshore_get_featured_projects();

	if ( empty( $projects ) ) {
		return '<p class="fp-empty">No featured projects found. Add projects under Featured Projects in the admin menu.</p>';
	}

	$total = count( $projects );

	ob_start();
	?>
	<div class="fp-panels">
		<?php foreach ( $projects as $index => $project ) :
			$is_active   = ( $index === 0 );
			$id          = $project->ID;
			$image       = get_field( 'project_image', $id );
			$button_url  = get_field( 'button_url', $id );
			$tab_title   = get_field( 'tab_title', $id ) ?: get_the_title( $id );
		?>
		<div
			class="fp-panel<?php echo $is_active ? ' is-active' : ''; ?>"
			id="fp-panel-<?php echo esc_attr( $index ); ?>"
			role="tabpanel"
			aria-labelledby="fp-tab-<?php echo esc_attr( $index ); ?>"
			aria-hidden="<?php echo $is_active ? 'false' : 'true'; ?>"
		>
			<div class="fp-panel__content">
				<h3 class="fp-project-title">
					<?php echo esc_html( get_the_title( $id ) ); ?>
				</h3>
				<p class="fp-description">
					<?php echo wp_kses( get_field( 'description', $id ), array( 'br' => array() ) ); ?>
				</p>
				<div class="fp-client">
					<span class="fp-client__label">
						<?php echo esc_html( get_field( 'client_label', $id ) ); ?>
					</span>
					<span class="fp-client__name">
						<?php echo esc_html( get_field( 'client_name', $id ) ); ?>
					</span>
				</div>
				<div class="fp-panel__bottom">
					<div class="fp-nav" aria-hidden="true">
						<?php for ( $d = 0; $d < $total; $d++ ) : ?>
						<span
							class="fp-nav__dot<?php echo ( $d === $index ) ? ' is-active' : ''; ?>"
							data-index="<?php echo esc_attr( $d ); ?>"
							role="button"
							tabindex="0"
							aria-label="Go to project <?php echo esc_attr( $d + 1 ); ?>"
						></span>
						<?php endfor; ?>
					</div>
					<?php if ( $button_url ) : ?>
					<a
						href="<?php echo esc_url( $button_url ); ?>"
						class="btn-primary fp-cta"
						aria-label="See our <?php echo esc_attr( $tab_title ); ?> projects"
					>
						See Our Projects
					</a>
					<?php endif; ?>
				</div>
			</div>

			<div class="fp-panel__image">
				<?php if ( $image ) : ?>
				<img
					src="<?php echo esc_url( $image['url'] ); ?>"
					alt="<?php echo esc_attr( $image['alt'] ?: get_the_title( $id ) ); ?>"
					width="<?php echo esc_attr( $image['width'] ); ?>"
					height="<?php echo esc_attr( $image['height'] ); ?>"
					<?php echo ( $index === 0 ) ? 'loading="eager"' : 'loading="lazy"'; ?>
				>
				<?php endif; ?>
			</div>
		</div>
		<?php endforeach; ?>
	</div>
	<?php
	return ob_get_clean();
}
