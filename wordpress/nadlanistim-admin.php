<?php
/**
 * Plugin Name: Nadlanistim Admin
 * Description: A Hebrew admin for the Nadlanistim team: a home screen with the approval queue, a grouped menu, useful list columns, tabbed event fields and the site's look. Off unless switched on.
 *
 * Lives in wp-content/mu-plugins on nadlanistim-cms.bold-move.co.il. Source of truth: wordpress/ in the site repo.
 * Design notes: wordpress/ADMIN-UX.md.
 *
 * Switch (nothing else in this file runs while it is off):
 *   everyone:        wp option update nadlanistim_admin_ui 1   (0 turns it off)
 *   one admin only:  any admin URL with ?nad_admin_preview=1    (=0 turns it off; needs manage_options)
 *
 * Optional assets, used when present:
 *   wp-content/languages/he_IL.mo                         the admin loads in Hebrew for users who have the new UI
 *   wp-content/uploads/nadlanistim-admin/GoogleSans-*.woff2   Google Sans, self-hosted (the site's own files; Hebrew included)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Content types the team edits, in menu order. Label, icon, singular "add" label. */
function nad_admin_types() {
	return array(
		'nad_event'     => array( 'אירועים', 'dashicons-calendar-alt', 'אירוע' ),
		'nad_article'   => array( 'כתבות', 'dashicons-media-document', 'כתבה' ),
		'nad_podcast'   => array( 'פודקאסט', 'dashicons-microphone', 'פרק' ),
		'nad_nadlanist' => array( 'נדלניסטים', 'dashicons-id', 'נדלניסט/ית' ),
		'nad_community' => array( 'קהילות', 'dashicons-groups', 'קהילה' ),
		'nad_job'       => array( 'דרושים', 'dashicons-businessperson', 'משרה' ),
		'nad_collab'    => array( 'שיתופי פעולה', 'dashicons-networking', 'שיתוף פעולה' ),
		'nad_deal'      => array( 'חדר העסקאות', 'dashicons-portfolio', 'עסקה' ),
		'nad_sponsor'   => array( 'שותפים ונותני חסות', 'dashicons-awards', 'שותף' ),
	);
}

function nad_admin_is_type( $type ) {
	return is_string( $type ) && array_key_exists( $type, nad_admin_types() );
}

/** Types whose items arrive from the site's forms and wait for approval. */
const NAD_ADMIN_QUEUE_TYPES = array( 'nad_nadlanist', 'nad_job', 'nad_collab' );

/**
 * Is the new admin on for this request? Admin screens only (REST, GraphQL and the front end never see it).
 * Also applies the per-user preview switch, which only administrators may flip.
 */
function nad_admin_ui() {
	static $on = null;
	if ( null !== $on ) {
		return $on;
	}
	if ( ! is_admin() || ! did_action( 'plugins_loaded' ) ) {
		return false; // Too early to know; ask again later.
	}
	if ( '1' === (string) get_option( 'nadlanistim_admin_ui', '0' ) ) {
		return $on = true;
	}
	$uid = get_current_user_id();
	if ( ! $uid || ! user_can( $uid, 'manage_options' ) ) {
		return $on = false;
	}
	if ( isset( $_GET['nad_admin_preview'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification -- display preference of the viewer only.
		$want = '1' === sanitize_key( wp_unslash( $_GET['nad_admin_preview'] ) ) ? '1' : '0'; // phpcs:ignore WordPress.Security.NonceVerification
		update_user_meta( $uid, 'nad_admin_preview', $want );
		return $on = ( '1' === $want );
	}
	return $on = ( '1' === get_user_meta( $uid, 'nad_admin_preview', true ) );
}

// Hebrew admin for users who have the new UI, when the language pack is installed. Runs before init, so it asks the switch itself.
add_filter(
	'determine_locale',
	function ( $locale ) {
		if ( 'he_IL' !== $locale && is_admin() && file_exists( WP_LANG_DIR . '/he_IL.mo' ) && nad_admin_ui() ) {
			return 'he_IL';
		}
		return $locale;
	}
);

add_action(
	'init',
	function () {
		if ( is_admin() && nad_admin_ui() ) {
			nad_admin_boot();
		}
	},
	0
);

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function nad_admin_front() {
	$front = function_exists( 'NadlanistimHeadless\frontend_url' ) ? \NadlanistimHeadless\frontend_url() : get_option( 'options_frontend_url' );
	return untrailingslashit( (string) $front );
}

/** The live-site page a published post shows on, '' when it has none. */
function nad_admin_front_url( $post ) {
	$post  = get_post( $post );
	$front = nad_admin_front();
	if ( ! $post || ! $front || 'publish' !== $post->post_status ) {
		return '';
	}
	$slug = $post->post_name;
	switch ( $post->post_type ) {
		case 'nad_event':
			return $front . nad_admin_event_path( $post->ID ) . '?e=' . $slug;
		case 'nad_nadlanist':
			return $front . '/nadlanist/' . $slug;
		case 'nad_job':
			return $front . '/job/' . $post->ID;
		case 'nad_collab':
			return $front . '/collaboration/' . $slug;
		case 'nad_community':
			return $front . '/community/' . $slug;
		case 'nad_podcast':
			return $front . '/podcast/' . $slug;
		case 'nad_article':
			return $front . '/article/' . $slug;
	}
	return '';
}

/** Same rule as the site: parties and galas get the party page, then past events the recap. */
function nad_admin_event_path( $post_id ) {
	if ( function_exists( 'NadlanistimHeadless\nad_event_front_path' ) ) {
		return \NadlanistimHeadless\nad_event_front_path( $post_id );
	}
	$types = wp_get_object_terms( $post_id, 'nad_event_type', array( 'fields' => 'names' ) );
	if ( is_array( $types ) && array_intersect( array( 'מסיבה', 'גאלה', 'ערב גאלה' ), $types ) ) {
		return '/event-party';
	}
	return get_post_meta( $post_id, 'is_past', true ) ? '/event-recap' : '/event';
}

function nad_admin_event_page_name( $path ) {
	$names = array(
		'/event'       => 'עמוד אירוע',
		'/event-party' => 'עמוד מסיבה',
		'/event-recap' => 'עמוד סיכום',
	);
	return isset( $names[ $path ] ) ? $names[ $path ] : $path;
}

function nad_admin_state_label( $status ) {
	$labels = array(
		'publish' => 'פורסם',
		'pending' => 'ממתין לאישור',
		'draft'   => 'טיוטה',
		'future'  => 'מתוזמן',
		'private' => 'פרטי',
	);
	return isset( $labels[ $status ] ) ? $labels[ $status ] : $status;
}

function nad_admin_badge( $status ) {
	$tone = 'publish' === $status ? 'ok' : ( in_array( $status, array( 'pending', 'draft' ), true ) ? 'wait' : 'muted' );
	return '<span class="nad-pill nad-pill--' . esc_attr( $tone ) . '">' . esc_html( nad_admin_state_label( $status ) ) . '</span>';
}

/** "לפני 3 שעות" without depending on the admin's language. */
function nad_admin_ago( $time ) {
	$diff = time() - (int) $time;
	if ( $diff < HOUR_IN_SECONDS ) {
		$m = max( 1, (int) floor( $diff / MINUTE_IN_SECONDS ) );
		return 1 === $m ? 'לפני דקה' : 'לפני ' . $m . ' דקות';
	}
	if ( $diff < DAY_IN_SECONDS ) {
		$h = (int) floor( $diff / HOUR_IN_SECONDS );
		return 1 === $h ? 'לפני שעה' : ( 2 === $h ? 'לפני שעתיים' : 'לפני ' . $h . ' שעות' );
	}
	$d = (int) floor( $diff / DAY_IN_SECONDS );
	if ( 1 === $d ) {
		return 'אתמול';
	}
	if ( $d < 14 ) {
		return 'לפני ' . $d . ' ימים';
	}
	return wp_date( 'j.n.Y', (int) $time );
}

/** ACF date (Ymd) as 14.6.2026, '' when empty or malformed. */
function nad_admin_date( $ymd ) {
	$ymd = preg_replace( '/\D/', '', (string) $ymd );
	if ( 8 !== strlen( $ymd ) ) {
		return '';
	}
	return (int) substr( $ymd, 6, 2 ) . '.' . (int) substr( $ymd, 4, 2 ) . '.' . substr( $ymd, 0, 4 );
}

function nad_admin_approve_url( $post_id ) {
	return wp_nonce_url( admin_url( 'admin-post.php?action=nad_approve&post=' . (int) $post_id ), 'nad_approve_' . (int) $post_id );
}

/** Thumbnail HTML for list rows: featured image, else the ACF logo, else the seed image URL. */
function nad_admin_thumb( $post_id ) {
	if ( has_post_thumbnail( $post_id ) ) {
		return get_the_post_thumbnail( $post_id, array( 96, 96 ), array( 'alt' => '', 'loading' => 'lazy' ) );
	}
	$logo = get_post_meta( $post_id, 'logo', true );
	if ( is_numeric( $logo ) && $logo ) {
		$img = wp_get_attachment_image( (int) $logo, array( 96, 96 ), false, array( 'alt' => '', 'loading' => 'lazy' ) );
		if ( $img ) {
			return $img;
		}
	}
	$seed = get_post_meta( $post_id, 'nad_seed_img', true );
	if ( $seed && preg_match( '#^https?://#i', $seed ) ) {
		return '<img src="' . esc_url( $seed ) . '" alt="" loading="lazy" width="48" height="48">';
	}
	return '<span class="nad-thumb-empty dashicons ' . esc_attr( nad_admin_types()[ (string) get_post_type( $post_id ) ][1] ?? '' ) . '" aria-hidden="true"></span>';
}

/** One short line with the field the team looks for first, per type. Plain text. */
function nad_admin_detail( $post ) {
	$id  = $post->ID;
	$get = function ( $key ) use ( $id ) {
		$v = get_post_meta( $id, $key, true );
		return is_scalar( $v ) ? trim( (string) $v ) : '';
	};
	$parts = array();
	switch ( $post->post_type ) {
		case 'nad_event':
			$parts = array( nad_admin_date( $get( 'event_date' ) ), $get( 'place' ) );
			break;
		case 'nad_nadlanist':
			$parts = array( $get( 'role' ), $get( 'place' ) );
			break;
		case 'nad_job':
			$parts = array( $get( 'company' ) ? $get( 'company' ) : $get( 'publisher' ), $get( 'location' ) );
			break;
		case 'nad_collab':
			$parts = array( $get( 'by' ), $get( 'place' ) );
			break;
		case 'nad_podcast':
			$parts = array( $get( 'episode_number' ) ? 'פרק ' . $get( 'episode_number' ) : '', $get( 'air_date' ) );
			break;
		case 'nad_community':
			$parts = array( $get( 'members_count' ) ? $get( 'members_count' ) . ' חברים' : '', $get( 'tagline' ) );
			break;
		case 'nad_deal':
			$parts = array( $get( 'tag' ), $get( 'period' ) );
			break;
		case 'nad_sponsor':
			$parts = array( nad_admin_tier_label( $get( 'tier' ) ) );
			break;
		case 'nad_article':
			$parts = array( $get( 'read_minutes' ) ? $get( 'read_minutes' ) . ' דקות קריאה' : '' );
			break;
	}
	return implode( ' · ', array_filter( $parts, 'strlen' ) );
}

function nad_admin_tier_label( $tier ) {
	if ( '' === $tier || ! function_exists( 'acf_get_field' ) ) {
		return $tier;
	}
	$field = acf_get_field( 'tier' );
	return ( $field && isset( $field['choices'][ $tier ] ) ) ? $field['choices'][ $tier ] : $tier;
}

function nad_admin_waiting_count( $type ) {
	$c = wp_count_posts( $type );
	return (int) ( isset( $c->draft ) ? $c->draft : 0 ) + (int) ( isset( $c->pending ) ? $c->pending : 0 );
}

/* ─── Boot: everything below runs only with the switch on ───────────────── */

function nad_admin_boot() {
	nad_admin_unhook_front_redirects();

	add_action( 'admin_menu', 'nad_admin_add_home', 5 );
	add_action( 'admin_menu', 'nad_admin_build_menu', PHP_INT_MAX - 10 );
	// WooCommerce (and others) reorder the menu after admin_menu; the order built above wins.
	add_filter( 'custom_menu_order', '__return_true', PHP_INT_MAX );
	add_filter( 'menu_order', 'nad_admin_menu_order', PHP_INT_MAX );
	add_action( 'admin_init', 'nad_admin_unhook_importer_title_links' );
	add_filter( 'parent_file', 'nad_admin_parent_file' );
	add_action( 'load-index.php', 'nad_admin_redirect_dashboard' );
	add_action( 'admin_post_nad_approve', 'nad_admin_handle_approve' );
	add_action( 'admin_notices', 'nad_admin_notices' );
	add_action( 'admin_head', 'nad_admin_styles' );
	add_filter( 'admin_body_class', 'nad_admin_body_class' );

	foreach ( array_keys( nad_admin_types() ) as $type ) {
		add_filter( "manage_{$type}_posts_columns", 'nad_admin_columns', 50 );
		add_action( "manage_{$type}_posts_custom_column", 'nad_admin_column_content', 10, 2 );
	}
	add_filter( 'manage_edit-nad_event_sortable_columns', 'nad_admin_event_sortable' );
	add_action( 'pre_get_posts', 'nad_admin_list_query' );
	add_action( 'restrict_manage_posts', 'nad_admin_list_filters' );
	add_filter( 'post_row_actions', 'nad_admin_row_actions', 50, 2 );
	add_filter( 'page_row_actions', 'nad_admin_row_actions', 50, 2 ); // Hierarchical types (sponsors).

	add_action( 'edit_form_top', 'nad_admin_edit_bar' );
	add_action( 'add_meta_boxes', 'nad_admin_meta_boxes', 99, 2 );
	add_filter( 'acf/load_fields', 'nad_admin_event_tabs', 20, 2 );
}

/**
 * The Headless plugin sends "edit" and "add new" of nadlanists, jobs and collaborations to sign-up forms on the
 * site (an older front-end contract). The current site has no edit mode there, so with the new UI the native
 * WordPress screens come back. Matches the Headless closures by file, leaves every other callback alone.
 */
function nad_admin_unhook_front_redirects() {
	global $wp_filter;
	foreach ( array( 'load-post.php', 'load-post-new.php' ) as $hook ) {
		if ( empty( $wp_filter[ $hook ] ) ) {
			continue;
		}
		foreach ( $wp_filter[ $hook ]->callbacks as $priority => $callbacks ) {
			foreach ( $callbacks as $cb ) {
				if ( ! ( $cb['function'] instanceof Closure ) ) {
					continue;
				}
				$file = wp_normalize_path( (string) ( new ReflectionFunction( $cb['function'] ) )->getFileName() );
				if ( false !== strpos( $file, '/nadlanistim-headless' ) ) {
					remove_action( $hook, $cb['function'], $priority );
				}
			}
		}
	}
}

/** The importer rewrites list title links to the same retired front-end pages (administrators only). */
function nad_admin_unhook_importer_title_links() {
	remove_action( 'admin_footer-edit.php', array( 'NadlanistimImporter\Post_Types', 'job_title_links' ) );
}

/* ─── Menu ──────────────────────────────────────────────────────────────── */

function nad_admin_add_home() {
	add_menu_page( 'מרכז הניהול', 'מרכז הניהול', 'edit_posts', 'nad-home', 'nad_admin_render_home', 'dashicons-admin-home', 1 );
}

function nad_admin_build_menu() {
	global $menu;
	if ( ! is_array( $menu ) ) {
		return;
	}
	$by_slug = array();
	foreach ( $menu as $item ) {
		if ( isset( $item[2] ) ) {
			$by_slug[ $item[2] ] = $item;
		}
	}
	$types  = nad_admin_types();
	$groups = array(
		array( '', array( 'nad-home' ) ),
		array( 'תוכן', array( 'nad_event', 'nad_article', 'nad_podcast' ) ),
		array( 'קהילה', array( 'nad_nadlanist', 'nad_community' ) ),
		array( 'לוחות', array( 'nad_job', 'nad_collab', 'nad_deal', 'nad_sponsor' ) ),
		array( 'חנות', array( 'orders', 'edit.php?post_type=product' ) ),
		array( 'אתר', array( 'nadlanistim-settings', 'upload.php' ) ),
	);
	$extra = array(
		'orders'                     => array( 'הזמנות', 'edit_shop_orders', 'admin.php?page=wc-orders', '', 'menu-top', 'nad-menu-orders', 'dashicons-cart' ),
		'edit.php?post_type=product' => array( 'מוצרים וכרטיסים', null, null, null, null, null, 'dashicons-tickets-alt' ),
		'nadlanistim-settings'       => array( 'הגדרות אתר', null, null, null, null, null, 'dashicons-admin-settings' ),
		'upload.php'                 => array( 'מדיה', null, null, null, null, null, 'dashicons-format-gallery' ),
	);

	$new  = array();
	$used = array();
	$n    = 0;
	foreach ( $groups as $g ) {
		list( $title, $slugs ) = $g;
		$items = array();
		foreach ( $slugs as $key ) {
			if ( isset( $types[ $key ] ) ) {
				$slug = 'edit.php?post_type=' . $key;
				if ( ! isset( $by_slug[ $slug ] ) ) {
					continue;
				}
				$item    = $by_slug[ $slug ];
				$label   = $types[ $key ][0];
				$waiting = in_array( $key, NAD_ADMIN_QUEUE_TYPES, true ) ? nad_admin_waiting_count( $key ) : 0;
				if ( $waiting ) {
					$label .= ' <span class="awaiting-mod count-' . $waiting . '"><span class="pending-count" aria-hidden="true">' . $waiting . '</span><span class="screen-reader-text">' . $waiting . ' ממתינים לאישור</span></span>';
				}
				$item[0] = $label;
				$item[6] = $types[ $key ][1];
				$items[] = $item;
				$used[]  = $slug;
			} elseif ( 'orders' === $key ) {
				if ( function_exists( 'wc_get_orders' ) ) {
					$items[] = $extra['orders'];
				}
			} elseif ( isset( $by_slug[ $key ] ) ) {
				$item = $by_slug[ $key ];
				if ( isset( $extra[ $key ] ) ) {
					$item[0] = $extra[ $key ][0];
					$item[6] = $extra[ $key ][6];
				}
				$items[] = $item;
				$used[]  = $key;
			}
		}
		if ( ! $items ) {
			continue;
		}
		if ( '' !== $title ) {
			$new[ ++$n ] = nad_admin_menu_head( $title, $n );
		}
		foreach ( $items as $item ) {
			$new[ ++$n ] = $item;
		}
	}

	// Everything else: administrators keep it under "מערכת"; the team does not see it.
	if ( current_user_can( 'manage_options' ) ) {
		$rest = array();
		foreach ( $menu as $item ) {
			$slug = isset( $item[2] ) ? $item[2] : '';
			if ( in_array( $slug, $used, true ) || 'nad-home' === $slug || ( isset( $item[4] ) && false !== strpos( $item[4], 'wp-menu-separator' ) ) ) {
				continue;
			}
			$rest[] = $item;
		}
		if ( $rest ) {
			$new[ ++$n ] = nad_admin_menu_head( 'מערכת', $n );
			foreach ( $rest as $item ) {
				$new[ ++$n ] = $item;
			}
		}
	} elseif ( isset( $by_slug['profile.php'] ) ) {
		$new[ ++$n ] = $by_slug['profile.php'];
	}
	$menu = $new; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- the point of this function.
	$GLOBALS['nad_admin_menu_order'] = array_values( wp_list_pluck( $new, 2 ) );
}

function nad_admin_menu_order( $order ) {
	if ( empty( $GLOBALS['nad_admin_menu_order'] ) || ! is_array( $order ) ) {
		return $order;
	}
	// Ours first, in our order; anything added after the rebuild keeps its place at the end.
	return array_values( array_unique( array_merge( $GLOBALS['nad_admin_menu_order'], $order ) ) );
}

/** A separator row that carries a group name (drawn by CSS from data in the id). */
function nad_admin_menu_head( $title, $n ) {
	$GLOBALS['nad_admin_menu_heads'][ 'nad-head-' . $n ] = $title;
	return array( '', 'read', 'nad-head-' . $n, '', 'wp-menu-separator nad-head', 'nad-head-' . $n );
}

function nad_admin_parent_file( $parent ) {
	global $plugin_page;
	if ( 'wc-orders' === $plugin_page ) {
		return 'admin.php?page=wc-orders';
	}
	return $parent;
}

function nad_admin_redirect_dashboard() {
	if ( ! current_user_can( 'edit_posts' ) || ( isset( $_GET['nad_classic'] ) && current_user_can( 'manage_options' ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		return;
	}
	wp_safe_redirect( admin_url( 'admin.php?page=nad-home' ) );
	exit;
}

/* ─── Approve ───────────────────────────────────────────────────────────── */

function nad_admin_handle_approve() {
	$post_id = isset( $_REQUEST['post'] ) ? absint( $_REQUEST['post'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification -- checked next line.
	check_admin_referer( 'nad_approve_' . $post_id );
	$post = $post_id ? get_post( $post_id ) : null;
	if ( ! $post || ! nad_admin_is_type( $post->post_type ) ) {
		wp_die( esc_html( 'הפריט לא נמצא. אולי הוא נמחק.' ), '', array( 'response' => 404, 'back_link' => true ) );
	}
	if ( ! current_user_can( 'publish_post', $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) {
		wp_die( esc_html( 'אין לכם הרשאה לפרסם את הפריט הזה.' ), '', array( 'response' => 403, 'back_link' => true ) );
	}
	$done = 'skipped';
	if ( in_array( $post->post_status, array( 'draft', 'pending' ), true ) ) {
		// Fires save_post, so the revalidate plugin refreshes the site.
		$result = wp_update_post( array( 'ID' => $post_id, 'post_status' => 'publish' ), true );
		$done   = is_wp_error( $result ) ? 'failed' : 'published';
	}
	$back = wp_get_referer();
	if ( ! $back ) {
		$back = admin_url( 'admin.php?page=nad-home' );
	}
	$back = remove_query_arg( array( 'nad_done', 'nad_post' ), $back );
	wp_safe_redirect( add_query_arg( array( 'nad_done' => $done, 'nad_post' => $post_id ), $back ) );
	exit;
}

function nad_admin_notices() {
	$done = isset( $_GET['nad_done'] ) ? sanitize_key( wp_unslash( $_GET['nad_done'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	if ( ! $done ) {
		return;
	}
	$post  = get_post( isset( $_GET['nad_post'] ) ? absint( $_GET['nad_post'] ) : 0 ); // phpcs:ignore WordPress.Security.NonceVerification
	$title = $post ? get_the_title( $post ) : '';
	if ( 'published' === $done ) {
		$url  = $post ? nad_admin_front_url( $post ) : '';
		$link = $url ? ' <a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">צפייה באתר<span class="screen-reader-text"> (נפתח בלשונית חדשה)</span></a>' : '';
		echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( 'פורסם: ' . $title . '. האתר יתעדכן תוך דקה.' ) . $link . '</p></div>'; // phpcs:ignore WordPress.Security.EscapeOutput -- $link built from esc_url.
	} elseif ( 'skipped' === $done ) {
		echo '<div class="notice notice-warning is-dismissible"><p>' . esc_html( $title . ' כבר לא טיוטה, אז לא שינינו כלום.' ) . '</p></div>';
	} elseif ( 'failed' === $done ) {
		echo '<div class="notice notice-error is-dismissible"><p>' . esc_html( 'הפרסום של ' . $title . ' נכשל. פתחו את הפריט ופרסמו ממסך העריכה.' ) . '</p></div>';
	}
}

/* ─── Home ──────────────────────────────────────────────────────────────── */

function nad_admin_queue_items() {
	return get_posts(
		array(
			'post_type'        => NAD_ADMIN_QUEUE_TYPES,
			'post_status'      => array( 'draft', 'pending' ),
			'posts_per_page'   => 25,
			'orderby'          => 'date',
			'order'            => 'DESC',
			'suppress_filters' => false,
		)
	);
}

/** Events that need work: [ post, [missing labels] ], soonest first. */
function nad_admin_event_issues() {
	$today  = current_time( 'Ymd' );
	$events = get_posts(
		array(
			'post_type'      => 'nad_event',
			'post_status'    => 'publish',
			'posts_per_page' => 60,
			'meta_key'       => 'event_date',
			'orderby'        => 'meta_value',
			'order'          => 'DESC',
		)
	);
	$out = array();
	foreach ( $events as $e ) {
		$date    = preg_replace( '/\D/', '', (string) get_post_meta( $e->ID, 'event_date', true ) );
		$is_past = (bool) get_post_meta( $e->ID, 'is_past', true );
		$missing = array();
		if ( $date && $date >= $today ) {
			if ( ! has_post_thumbnail( $e->ID ) && ! get_post_meta( $e->ID, 'nad_seed_img', true ) ) {
				$missing[] = 'תמונה ראשית';
			}
			foreach ( array( 'place' => 'מיקום', 'time_label' => 'שעה', 'description' => 'תיאור' ) as $key => $label ) {
				if ( '' === trim( (string) get_post_meta( $e->ID, $key, true ) ) ) {
					$missing[] = $label;
				}
			}
		} elseif ( $date && ! $is_past ) {
			$missing[] = 'האירוע עבר ולא סומן "אירוע שהתקיים"';
		} elseif ( $is_past && ! get_post_meta( $e->ID, 'recap_gallery', true ) ) {
			$missing[] = 'אין גלריית סיכום';
		}
		if ( $missing ) {
			$out[] = array( $e, $missing, $date );
		}
	}
	// Upcoming first (soonest on top), then past (most recent on top).
	usort(
		$out,
		function ( $a, $b ) use ( $today ) {
			$af = $a[2] >= $today;
			$bf = $b[2] >= $today;
			if ( $af !== $bf ) {
				return $af ? -1 : 1;
			}
			return $af ? strcmp( $a[2], $b[2] ) : strcmp( $b[2], $a[2] );
		}
	);
	return array_slice( $out, 0, 8 );
}

function nad_admin_render_home() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( esc_html( 'אין לכם הרשאה לעמוד הזה.' ) );
	}
	$types      = nad_admin_types();
	$queue      = nad_admin_queue_items();
	$events     = nad_admin_event_issues();
	$can_orders = function_exists( 'wc_get_orders' ) && current_user_can( 'edit_shop_orders' );
	$orders     = $can_orders ? wc_get_orders( array( 'limit' => 6, 'orderby' => 'date', 'order' => 'DESC', 'type' => 'shop_order' ) ) : array();
	$week       = $can_orders ? count( wc_get_orders( array( 'limit' => 100, 'return' => 'ids', 'type' => 'shop_order', 'status' => array( 'processing', 'completed', 'on-hold' ), 'date_created' => '>' . ( time() - WEEK_IN_SECONDS ) ) ) ) : 0;
	$front      = nad_admin_front();
	$dir        = is_rtl() ? '' : ' dir="rtl"';
	$user       = wp_get_current_user();
	?>
	<div class="wrap nad-home"<?php echo $dir; // phpcs:ignore WordPress.Security.EscapeOutput -- fixed string. ?>>
		<header class="nad-home__head">
			<div>
				<h1 class="nad-home__title">מרכז הניהול</h1>
				<p class="nad-home__sub"><?php echo esc_html( 'שלום ' . $user->display_name . '. מה שמחכה לכם מופיע ראשון.' ); ?></p>
			</div>
			<?php if ( $front ) : ?>
				<a class="button nad-btn-ghost" href="<?php echo esc_url( $front ); ?>" target="_blank" rel="noopener"><span class="dashicons dashicons-external" aria-hidden="true"></span>לאתר<span class="screen-reader-text"> (נפתח בלשונית חדשה)</span></a>
			<?php endif; ?>
		</header>

		<nav class="nad-chips" aria-label="סיכום">
			<a class="nad-chip<?php echo $queue ? ' is-hot' : ''; ?>" href="#nad-queue"><strong><?php echo (int) count( $queue ); ?></strong> ממתינים לאישור</a>
			<a class="nad-chip<?php echo $events ? ' is-hot' : ''; ?>" href="#nad-events"><strong><?php echo (int) count( $events ); ?></strong> אירועים דורשים השלמה</a>
			<?php if ( $can_orders ) : ?>
				<a class="nad-chip" href="#nad-orders"><strong><?php echo (int) $week; ?></strong> הזמנות השבוע</a>
			<?php endif; ?>
		</nav>

		<div class="nad-home__grid">
			<div class="nad-home__main">

				<section class="nad-panel" id="nad-queue" aria-labelledby="nad-queue-h">
					<div class="nad-panel__head">
						<h2 id="nad-queue-h">ממתינים לאישור</h2>
						<span class="nad-panel__hint">נדלניסטים, משרות ושיתופי פעולה שהגיעו מהטפסים באתר</span>
					</div>
					<?php if ( ! $queue ) : ?>
						<p class="nad-empty">אין כרגע מה לאשר. כשמישהו ממלא טופס הצטרפות למדריך, משרה או שיתוף פעולה באתר, הוא יופיע כאן ותקבלו גם מייל.</p>
					<?php else : ?>
						<ul class="nad-rows">
							<?php
							foreach ( $queue as $p ) :
								$detail   = nad_admin_detail( $p );
								$can_pub  = current_user_can( 'publish_post', $p->ID );
								$can_edit = current_user_can( 'edit_post', $p->ID );
								$title    = '' !== trim( $p->post_title ) ? $p->post_title : 'ללא שם';
								?>
								<li class="nad-row">
									<span class="nad-thumb"><?php echo nad_admin_thumb( $p->ID ); // phpcs:ignore WordPress.Security.EscapeOutput -- core image HTML / esc_url. ?></span>
									<div class="nad-row__body">
										<div class="nad-row__title">
											<span class="nad-type"><?php echo esc_html( $types[ $p->post_type ][2] ); ?></span>
											<?php if ( $can_edit ) : ?>
												<a href="<?php echo esc_url( get_edit_post_link( $p->ID ) ); ?>"><?php echo esc_html( $title ); ?></a>
											<?php else : ?>
												<?php echo esc_html( $title ); ?>
											<?php endif; ?>
										</div>
										<div class="nad-row__meta"><?php echo esc_html( implode( ' · ', array_filter( array( nad_admin_ago( get_post_time( 'U', true, $p ) ), $detail, nad_admin_state_label( $p->post_status ) ), 'strlen' ) ) ); ?></div>
									</div>
									<div class="nad-row__actions">
										<?php if ( $can_pub ) : ?>
											<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
												<input type="hidden" name="action" value="nad_approve">
												<input type="hidden" name="post" value="<?php echo (int) $p->ID; ?>">
												<?php wp_nonce_field( 'nad_approve_' . $p->ID ); ?>
												<button type="submit" class="button button-primary">אישור ופרסום<span class="screen-reader-text">: <?php echo esc_html( $title ); ?></span></button>
											</form>
										<?php endif; ?>
										<?php if ( $can_edit ) : ?>
											<a class="button" href="<?php echo esc_url( get_edit_post_link( $p->ID ) ); ?>">עריכה<span class="screen-reader-text">: <?php echo esc_html( $title ); ?></span></a>
										<?php endif; ?>
									</div>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</section>

				<section class="nad-panel" id="nad-events" aria-labelledby="nad-events-h">
					<div class="nad-panel__head">
						<h2 id="nad-events-h">אירועים שדורשים השלמה</h2>
						<a class="nad-panel__link" href="<?php echo esc_url( admin_url( 'edit.php?post_type=nad_event' ) ); ?>">כל האירועים</a>
					</div>
					<?php if ( ! $events ) : ?>
						<p class="nad-empty">לכל האירועים יש תמונה, מיקום, שעה ותיאור, ואירועים שעברו מסומנים כמו שצריך.</p>
					<?php else : ?>
						<ul class="nad-rows">
							<?php
							foreach ( $events as $row ) :
								list( $e, $missing ) = $row;
								?>
								<li class="nad-row">
									<span class="nad-thumb"><?php echo nad_admin_thumb( $e->ID ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
									<div class="nad-row__body">
										<div class="nad-row__title"><a href="<?php echo esc_url( get_edit_post_link( $e->ID ) ); ?>"><?php echo esc_html( get_the_title( $e ) ); ?></a></div>
										<div class="nad-row__meta"><?php echo esc_html( nad_admin_detail( $e ) ); ?></div>
										<ul class="nad-missing" aria-label="מה חסר">
											<?php foreach ( $missing as $m ) : ?>
												<li><?php echo esc_html( $m ); ?></li>
											<?php endforeach; ?>
										</ul>
									</div>
									<div class="nad-row__actions">
										<a class="button" href="<?php echo esc_url( get_edit_post_link( $e->ID ) ); ?>">השלמה<span class="screen-reader-text">: <?php echo esc_html( get_the_title( $e ) ); ?></span></a>
									</div>
								</li>
							<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				</section>

				<?php if ( $can_orders ) : ?>
					<section class="nad-panel" id="nad-orders" aria-labelledby="nad-orders-h">
						<div class="nad-panel__head">
							<h2 id="nad-orders-h">הזמנות אחרונות</h2>
							<a class="nad-panel__link" href="<?php echo esc_url( admin_url( 'admin.php?page=wc-orders' ) ); ?>">כל ההזמנות</a>
						</div>
						<?php if ( ! $orders ) : ?>
							<p class="nad-empty">עוד אין הזמנות. כרטיסים לאירועים ודמי חברות שנקנים באתר יופיעו כאן.</p>
						<?php else : ?>
							<table class="nad-table">
								<thead><tr><th scope="col">הזמנה</th><th scope="col">לקוח/ה</th><th scope="col">מה נקנה</th><th scope="col">סכום</th><th scope="col">מצב</th></tr></thead>
								<tbody>
									<?php
									foreach ( $orders as $o ) :
										$items = array();
										foreach ( $o->get_items() as $it ) {
											$items[] = $it->get_name();
										}
										$created = $o->get_date_created();
										?>
										<tr>
											<td><a href="<?php echo esc_url( $o->get_edit_order_url() ); ?>">#<?php echo esc_html( $o->get_order_number() ); ?></a><div class="nad-row__meta"><?php echo esc_html( $created ? nad_admin_ago( $created->getTimestamp() ) : '' ); ?></div></td>
											<td><?php echo esc_html( trim( $o->get_billing_first_name() . ' ' . $o->get_billing_last_name() ) ); ?></td>
											<td><?php echo esc_html( implode( ', ', $items ) ); ?></td>
											<td><?php echo wp_kses_post( $o->get_formatted_order_total() ); ?></td>
											<td><span class="nad-pill nad-pill--<?php echo esc_attr( in_array( $o->get_status(), array( 'completed', 'processing' ), true ) ? 'ok' : 'muted' ); ?>"><?php echo esc_html( wc_get_order_status_name( $o->get_status() ) ); ?></span></td>
										</tr>
									<?php endforeach; ?>
								</tbody>
							</table>
						<?php endif; ?>
					</section>
				<?php endif; ?>
			</div>

			<aside class="nad-home__side">
				<section class="nad-panel" aria-labelledby="nad-areas-h">
					<div class="nad-panel__head"><h2 id="nad-areas-h">תוכן האתר</h2></div>
					<ul class="nad-areas">
						<?php
						foreach ( $types as $type => $t ) :
							if ( ! post_type_exists( $type ) || ! current_user_can( get_post_type_object( $type )->cap->edit_posts ) ) {
								continue;
							}
							$c       = wp_count_posts( $type );
							$live    = isset( $c->publish ) ? (int) $c->publish : 0;
							$waiting = nad_admin_waiting_count( $type );
							?>
							<li>
								<span class="dashicons <?php echo esc_attr( $t[1] ); ?>" aria-hidden="true"></span>
								<a class="nad-areas__name" href="<?php echo esc_url( admin_url( 'edit.php?post_type=' . $type ) ); ?>"><?php echo esc_html( $t[0] ); ?></a>
								<span class="nad-areas__count"><?php echo esc_html( $live . ( $waiting ? ' · ' . $waiting . ' בהמתנה' : '' ) ); ?></span>
								<a class="nad-areas__edit" href="<?php echo esc_url( admin_url( 'edit.php?post_type=' . $type ) ); ?>">עריכה<span class="screen-reader-text">: כל ה<?php echo esc_html( $t[0] ); ?></span></a>
								<a class="nad-areas__add" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=' . $type ) ); ?>">הוספה<span class="screen-reader-text">: <?php echo esc_html( $t[2] ); ?></span></a>
							</li>
						<?php endforeach; ?>
					</ul>
				</section>

				<section class="nad-panel" aria-labelledby="nad-settings-h">
					<div class="nad-panel__head"><h2 id="nad-settings-h">הגדרות שמשנים לפעמים</h2></div>
					<ul class="nad-links">
						<li><a href="<?php echo esc_url( admin_url( 'admin.php?page=nadlanistim-settings' ) ); ?>">עמוד הבית: כותרת, מספרים ורצועה נעה</a></li>
						<li><a href="<?php echo esc_url( admin_url( 'admin.php?page=nadlanistim-settings' ) ); ?>">פרטי קשר, רשתות ותפריטים</a></li>
						<?php
						$youth = get_term_by( 'name', 'צעירים', 'nad_cohort' );
						if ( $youth ) :
							?>
							<li><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=nad_nadlanist&nad_cohort=' . $youth->slug ) ); ?>">נבחרת הצעירים: החברים</a></li>
						<?php endif; ?>
						<?php
						$sponsor_page = menu_page_url( 'nadlanistim-sponsorships', false );
						if ( $sponsor_page ) :
							?>
							<li><a href="<?php echo esc_url( $sponsor_page ); ?>">פסי החסות באתר</a></li>
						<?php endif; ?>
					</ul>
				</section>

				<?php if ( $front ) : ?>
					<section class="nad-panel" aria-labelledby="nad-live-h">
						<div class="nad-panel__head"><h2 id="nad-live-h">באתר</h2></div>
						<ul class="nad-links nad-links--ext">
							<?php
							$pages = array(
								'/'              => 'עמוד הבית',
								'/events'        => 'אירועים',
								'/nadlanistim'   => 'מדריך הנדלניסטים',
								'/youth'         => 'נבחרת הצעירים',
								'/jobs'          => 'דרושים',
								'/collaborations' => 'שיתופי פעולה',
								'/podcast'       => 'פודקאסט',
								'/post-archive'  => 'כתבות',
							);
							foreach ( $pages as $path => $label ) :
								?>
								<li><a href="<?php echo esc_url( $front . ( '/' === $path ? '' : $path ) ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $label ); ?><span class="screen-reader-text"> (נפתח בלשונית חדשה)</span></a></li>
							<?php endforeach; ?>
						</ul>
					</section>
				<?php endif; ?>

				<?php if ( current_user_can( 'manage_options' ) ) : ?>
					<p class="nad-home__foot">
						<a href="<?php echo esc_url( admin_url( 'index.php?nad_classic=1' ) ); ?>">לוח הבקרה של WordPress</a>
						<?php if ( '1' !== (string) get_option( 'nadlanistim_admin_ui', '0' ) ) : ?>
							· <a href="<?php echo esc_url( admin_url( 'index.php?nad_admin_preview=0&nad_classic=1' ) ); ?>">כיבוי התצוגה החדשה</a>
						<?php endif; ?>
					</p>
				<?php endif; ?>
			</aside>
		</div>
	</div>
	<?php
}

/* ─── Lists ─────────────────────────────────────────────────────────────── */

function nad_admin_columns( $cols ) {
	unset( $cols['nad_status'], $cols[ 'manage_nad_event_posts_columns' === current_filter() ? 'date' : 0 ] ); // Events show their own date column. The importer's column links to front-end pages that no longer exist.
	$out = array();
	foreach ( $cols as $key => $label ) {
		if ( 'title' === $key ) {
			$out['nad_thumb'] = '<span class="screen-reader-text">תמונה</span>';
		}
		$out[ $key ] = $label;
		if ( 'title' === $key ) {
			$out['nad_detail'] = 'פרטים';
			$out['nad_state']  = 'מצב';
		}
	}
	return $out;
}

function nad_admin_column_content( $column, $post_id ) {
	$post = get_post( $post_id );
	if ( 'nad_thumb' === $column ) {
		echo '<span class="nad-thumb">' . nad_admin_thumb( $post_id ) . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput
	} elseif ( 'nad_detail' === $column ) {
		echo esc_html( nad_admin_detail( $post ) );
		if ( 'nad_event' === $post->post_type ) {
			echo '<div class="nad-row__meta">' . esc_html( nad_admin_event_page_name( nad_admin_event_path( $post_id ) ) ) . '</div>';
		}
	} elseif ( 'nad_state' === $column ) {
		echo nad_admin_badge( $post->post_status ); // phpcs:ignore WordPress.Security.EscapeOutput -- escaped inside.
		if ( in_array( $post->post_status, array( 'draft', 'pending' ), true ) && current_user_can( 'publish_post', $post_id ) ) {
			echo '<a class="nad-approve" href="' . esc_url( nad_admin_approve_url( $post_id ) ) . '">אישור ופרסום<span class="screen-reader-text">: ' . esc_html( get_the_title( $post ) ) . '</span></a>';
		}
	}
}

function nad_admin_event_sortable( $cols ) {
	$cols['nad_detail'] = 'event_date';
	return $cols;
}

function nad_admin_list_query( $q ) {
	if ( ! $q->is_main_query() || 'edit.php' !== $GLOBALS['pagenow'] || 'nad_event' !== $q->get( 'post_type' ) ) {
		return;
	}
	$orderby = $q->get( 'orderby' );
	if ( ! $orderby || 'event_date' === $orderby ) {
		// EXISTS or NOT EXISTS: an event without a date still shows, at the end.
		$q->set(
			'meta_query',
			array(
				'relation' => 'OR',
				'nad_date' => array( 'key' => 'event_date', 'compare' => 'EXISTS' ),
				array( 'key' => 'event_date', 'compare' => 'NOT EXISTS' ),
			)
		);
		$order = 'ASC' === strtoupper( (string) $q->get( 'order' ) ) ? 'ASC' : 'DESC';
		$q->set( 'orderby', array( 'nad_date' => $order ) );
	}
}

function nad_admin_list_filters( $post_type ) {
	$tax = array(
		'nad_nadlanist' => array( 'nad_cohort', 'כל השיוכים' ),
		'nad_event'     => array( 'nad_event_type', 'כל סוגי האירועים' ),
		'nad_collab'    => array( 'nad_collab_type', 'כל הסוגים' ),
	);
	if ( ! isset( $tax[ $post_type ] ) || ! taxonomy_exists( $tax[ $post_type ][0] ) ) {
		return;
	}
	list( $taxonomy, $all ) = $tax[ $post_type ];
	$current = isset( $_GET[ $taxonomy ] ) ? sanitize_title( wp_unslash( $_GET[ $taxonomy ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	echo '<label class="screen-reader-text" for="nad-filter-' . esc_attr( $taxonomy ) . '">' . esc_html( $all ) . '</label>';
	wp_dropdown_categories(
		array(
			'taxonomy'        => $taxonomy,
			'name'            => $taxonomy,
			'id'              => 'nad-filter-' . $taxonomy,
			'value_field'     => 'slug',
			'selected'        => $current,
			'show_option_all' => $all,
			'hide_empty'      => false,
			'hierarchical'    => true,
			'show_count'      => true,
		)
	);
}

function nad_admin_row_actions( $actions, $post ) {
	if ( ! nad_admin_is_type( $post->post_type ) ) {
		return $actions;
	}
	unset( $actions['view'], $actions['preview'] );
	$url = nad_admin_front_url( $post );
	if ( $url ) {
		$actions['view'] = '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">צפייה באתר<span class="screen-reader-text">: ' . esc_html( get_the_title( $post ) ) . ' (נפתח בלשונית חדשה)</span></a>';
	}
	return $actions;
}

/* ─── Edit screens ──────────────────────────────────────────────────────── */

function nad_admin_edit_bar( $post ) {
	if ( ! nad_admin_is_type( $post->post_type ) || 'auto-draft' === $post->post_status ) {
		return;
	}
	$url = nad_admin_front_url( $post );
	echo '<div class="nad-editbar">';
	echo nad_admin_badge( $post->post_status ); // phpcs:ignore WordPress.Security.EscapeOutput
	if ( 'nad_event' === $post->post_type ) {
		$path = nad_admin_event_path( $post->ID );
		echo '<span class="nad-editbar__note">' . esc_html( 'מוצג ב' . nad_admin_event_page_name( $path ) . '. מסיבה או גאלה מקבלות עמוד מסיבה; אירוע שסומן "התקיים" עובר לעמוד סיכום.' ) . '</span>';
	} elseif ( in_array( $post->post_type, NAD_ADMIN_QUEUE_TYPES, true ) && in_array( $post->post_status, array( 'draft', 'pending' ), true ) ) {
		echo '<span class="nad-editbar__note">הגיע מטופס באתר. בדקו את הפרטים ולחצו "פרסום" בתיבה שבצד.</span>';
	}
	if ( $url ) {
		echo '<a class="button nad-editbar__view" href="' . esc_url( $url ) . '" target="_blank" rel="noopener"><span class="dashicons dashicons-external" aria-hidden="true"></span>צפייה באתר<span class="screen-reader-text"> (נפתח בלשונית חדשה)</span></a>';
	}
	echo '</div>';
}

function nad_admin_meta_boxes( $post_type, $post ) {
	if ( ! nad_admin_is_type( $post_type ) ) {
		return;
	}
	// The site reads ACF fields only; the native excerpt is never shown.
	remove_meta_box( 'postexcerpt', $post_type, 'normal' );
	if ( 'nad_sponsor' === $post_type ) {
		remove_meta_box( 'pageparentdiv', $post_type, 'side' );
	}
}

function nad_admin_body_class( $classes ) {
	$classes .= ' nad-ui';
	$screen   = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( $screen && 'post' === $screen->base && nad_admin_is_type( $screen->post_type ) ) {
		$classes .= ' nad-ui-edit';
		$post     = get_post();
		// Hide the empty WordPress editor: these types are filled through their fields. Articles with body text keep it.
		if ( $post && '' === trim( (string) $post->post_content ) ) {
			$classes .= ' nad-ui-noeditor';
		}
	}
	return $classes;
}

/**
 * Event fields in four tabs, by the page they feed. Render only: added on GET of the edit screen, so saves,
 * validation, GraphQL and REST see the Importer's group exactly as defined.
 */
function nad_admin_event_tabs( $fields, $parent ) {
	global $pagenow;
	if ( ! is_array( $parent ) || empty( $parent['key'] ) || 'group_nad_event' !== $parent['key'] ) {
		return $fields;
	}
	if ( ! in_array( $pagenow, array( 'post.php', 'post-new.php' ), true ) || 'GET' !== ( isset( $_SERVER['REQUEST_METHOD'] ) ? $_SERVER['REQUEST_METHOD'] : '' ) || wp_doing_ajax() ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		return $fields;
	}
	$tabs = array(
		'basic'  => array( 'פרטים בסיסיים', 'מופיע בכרטיס האירוע בעמוד האירועים ובראש עמוד האירוע.', array( 'event_date', 'time_label', 'place', 'description', 'cta_url', 'is_accent', 'is_past', 'price', 'audience' ) ),
		'event'  => array( 'עמוד האירוע', 'מוצג בעמוד אירוע רגיל, לפני שהאירוע מתקיים.', array( 'agenda', 'features', 'speaker_name', 'speaker_role', 'speaker_photo', 'speaker_bio', 'speaker_quote', 'speaker_link', 'testimonials', 'faq' ) ),
		'party'  => array( 'עמוד מסיבה', 'מוצג רק באירועים מסוג מסיבה או גאלה.', array( 'dress_code', 'entry', 'vibe', 'timeline', 'lineup', 'lineup_photos', 'party_gallery', 'party_quotes', 'party_faq' ) ),
		'recap'  => array( 'סיכום אחרי האירוע', 'מוצג אחרי שמסמנים "אירוע שהתקיים".', array( 'recap_gallery', 'takeaways', 'video_url', 'video_thumb', 'recap_testimonials', 'recap_avatars', 'downloads' ) ),
	);
	$by_name = array();
	foreach ( $fields as $f ) {
		if ( ! empty( $f['name'] ) ) {
			$by_name[ $f['name'] ] = $f;
		}
	}
	$known = array();
	foreach ( $tabs as $tab ) {
		$known = array_merge( $known, $tab[2] );
	}
	$out = array();
	foreach ( $tabs as $id => $tab ) {
		$group = array();
		foreach ( $tab[2] as $name ) {
			if ( isset( $by_name[ $name ] ) ) {
				$group[] = $by_name[ $name ];
			}
		}
		if ( 'basic' === $id ) {
			foreach ( $fields as $f ) { // Fields added to the group later land in the first tab.
				if ( empty( $f['name'] ) || ! in_array( $f['name'], $known, true ) ) {
					$group[] = $f;
				}
			}
		}
		if ( ! $group ) {
			continue;
		}
		$out[] = nad_admin_ui_field( array( 'key' => 'field_nad_ui_tab_' . $id, 'label' => $tab[0], 'type' => 'tab', 'placement' => 'top', 'endpoint' => 'basic' === $id ? 1 : 0 ), $parent['key'] );
		$out[] = nad_admin_ui_field( array( 'key' => 'field_nad_ui_msg_' . $id, 'label' => '', 'type' => 'message', 'message' => $tab[1], 'new_lines' => '', 'esc_html' => 1, 'wrapper' => array( 'class' => 'nad-tab-note' ) ), $parent['key'] );
		$out   = array_merge( $out, $group );
	}
	return $out;
}

function nad_admin_ui_field( $field, $parent ) {
	$field = array_merge( array( 'name' => '', 'parent' => $parent, 'instructions' => '', 'required' => 0 ), $field );
	return function_exists( 'acf_get_valid_field' ) ? acf_get_valid_field( $field ) : $field;
}

/* ─── Look ──────────────────────────────────────────────────────────────── */

/** The site's font, in the weights the admin uses. The files carry Hebrew too, so nothing falls back. */
function nad_admin_font_faces() {
	$font_dir = WP_CONTENT_DIR . '/uploads/nadlanistim-admin/';
	$font_url = content_url( 'uploads/nadlanistim-admin/' );
	$faces    = '';
	foreach ( array( 400 => 'Regular', 500 => 'Medium', 600 => 'SemiBold', 700 => 'Bold' ) as $weight => $name ) {
		if ( file_exists( $font_dir . 'GoogleSans-' . $name . '.woff2' ) ) {
			$faces .= '@font-face{font-family:"Google Sans";font-style:normal;font-weight:' . $weight . ';font-display:swap;src:url(' . esc_url( $font_url . 'GoogleSans-' . $name . '.woff2' ) . ') format("woff2");}';
		}
	}
	return $faces;
}

function nad_admin_styles() {
	$faces = nad_admin_font_faces();
	$heads = '';
	if ( ! empty( $GLOBALS['nad_admin_menu_heads'] ) ) {
		foreach ( $GLOBALS['nad_admin_menu_heads'] as $id => $title ) {
			$heads .= '#adminmenu #' . sanitize_html_class( $id ) . ' .separator::after{content:"' . esc_attr( $title ) . '";}';
		}
	}
	echo '<style id="nad-admin-ui">' . $faces . $heads . nad_admin_css() . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput -- static CSS plus escaped values.
}

function nad_admin_css() {
	return <<<'CSS'
body.nad-ui{
	--nad-font:"Google Sans",-apple-system,"Segoe UI",Arial,sans-serif;
	--nad-ink:#14162B;--nad-ink-2:#565B73;--nad-line:#E3E5EE;--nad-bg:#F5F6FA;--nad-panel:#FFFFFF;
	--nad-primary:#5B3FD6;--nad-primary-hover:#4C32BD;--nad-primary-soft:#EEEAFD;
	--nad-nav:#0C0E1A;--nad-nav-2:#14172A;--nad-nav-ink:#C4CADC;--nad-nav-muted:#8A91AC;--nad-nav-current:#6D28D9;--nad-cyan:#22D3EE;
	--wp-admin-theme-color:#5B3FD6;--wp-admin-theme-color--rgb:91,63,214;--wp-admin-theme-color-darker-10:#4C32BD;--wp-admin-theme-color-darker-10--rgb:76,50,189;--wp-admin-theme-color-darker-20:#3F2A9E;--wp-admin-theme-color-darker-20--rgb:63,42,158;
	background:var(--nad-bg);color:var(--nad-ink);
}
/* One font everywhere; icon fonts and code keep their own. */
body.nad-ui,body.nad-ui *:not(.dashicons):not([class*="dashicons"]):not(.ab-icon):not([class*="mce-ico"]):not(code):not(pre):not(kbd){font-family:var(--nad-font);}
/* The admin bar sets its own font with #wpadminbar *, so it needs an id-weight rule. */
body.nad-ui #wpadminbar *:not(.dashicons):not([class*="dashicons"]):not(.ab-icon){font-family:var(--nad-font);}
body.nad-ui #wpcontent,body.nad-ui #wpfooter{background:var(--nad-bg);}
body.nad-ui a{color:var(--nad-primary-hover);}
body.nad-ui a:hover{color:#3F2A9E;}

/* Admin bar + side menu in the site's navy */
body.nad-ui #wpadminbar{background:#07080F;}
body.nad-ui #adminmenuback,body.nad-ui #adminmenuwrap,body.nad-ui #adminmenu{background:var(--nad-nav);}
body.nad-ui #adminmenu a{color:var(--nad-nav-ink);}
body.nad-ui #adminmenu div.wp-menu-image:before{color:var(--nad-nav-muted);}
body.nad-ui #adminmenu li.menu-top:hover,body.nad-ui #adminmenu li.opensub>a.menu-top,body.nad-ui #adminmenu li>a.menu-top:focus{background:var(--nad-nav-2);color:#fff;}
body.nad-ui #adminmenu li.menu-top:hover div.wp-menu-image:before,body.nad-ui #adminmenu li>a.menu-top:focus div.wp-menu-image:before{color:#fff;}
body.nad-ui #adminmenu li.wp-has-current-submenu a.wp-has-current-submenu,body.nad-ui #adminmenu li.current a.menu-top,body.nad-ui #adminmenu .wp-has-current-submenu .wp-submenu .wp-submenu-head,body.nad-ui #adminmenu .wp-menu-arrow,body.nad-ui #adminmenu .wp-menu-arrow div{background:var(--nad-nav-current);color:#fff;}
body.nad-ui #adminmenu li.wp-has-current-submenu div.wp-menu-image:before,body.nad-ui #adminmenu li.current div.wp-menu-image:before{color:#fff;}
body.nad-ui #adminmenu .wp-submenu,body.nad-ui #adminmenu .wp-has-current-submenu .wp-submenu,body.nad-ui #adminmenu .wp-has-current-submenu.opensub .wp-submenu,body.nad-ui #adminmenu a.wp-has-current-submenu:focus+.wp-submenu{background:#13152A;}
body.nad-ui #adminmenu .wp-submenu a{color:#B4BAD0;}
body.nad-ui #adminmenu .wp-submenu a:hover,body.nad-ui #adminmenu .wp-submenu a:focus{color:#fff;}
body.nad-ui #adminmenu .wp-submenu li.current a,body.nad-ui #adminmenu .wp-submenu li.current a:hover{color:#fff;font-weight:600;}
body.nad-ui #adminmenu .awaiting-mod,body.nad-ui #adminmenu .update-plugins{background:var(--nad-cyan);color:#07080F;font-weight:600;}
body.nad-ui #adminmenu li.nad-head{height:auto;margin:14px 0 2px;}
body.nad-ui #adminmenu li.nad-head .separator{height:auto;padding:0;}
body.nad-ui #adminmenu li.nad-head .separator::after{display:block;padding:0 14px;font-size:11.5px;font-weight:600;color:var(--nad-nav-muted);line-height:20px;letter-spacing:.02em;}
body.nad-ui.folded #adminmenu li.nad-head .separator::after{content:""!important;border-top:1px solid #23263C;margin:6px 8px 0;padding:0;}
body.nad-ui #collapse-button{color:var(--nad-nav-muted);}
body.nad-ui #adminmenu a:focus,body.nad-ui #adminmenu a:focus-visible,body.nad-ui #collapse-button:focus{outline:2px solid var(--nad-cyan);outline-offset:-2px;box-shadow:none;}

/* Buttons, fields, focus */
body.nad-ui .wp-core-ui .button-primary{background:var(--nad-primary);border-color:var(--nad-primary);color:#fff;border-radius:8px;}
body.nad-ui .wp-core-ui .button-primary:hover,body.nad-ui .wp-core-ui .button-primary:focus{background:var(--nad-primary-hover);border-color:var(--nad-primary-hover);color:#fff;}
body.nad-ui .wp-core-ui .button,body.nad-ui .wp-core-ui .button-secondary{border-radius:8px;}
body.nad-ui .wp-core-ui .button-secondary,body.nad-ui .wp-core-ui .button:not(.button-primary){color:var(--nad-primary-hover);border-color:#B9AEF0;background:#fff;}
body.nad-ui .wp-core-ui .button:not(.button-primary):hover{background:var(--nad-primary-soft);border-color:var(--nad-primary);color:#3F2A9E;}
body.nad-ui a:focus-visible,body.nad-ui .wp-core-ui .button:focus-visible,body.nad-ui input:focus-visible,body.nad-ui select:focus-visible,body.nad-ui textarea:focus-visible,body.nad-ui button:focus-visible{outline:2px solid var(--nad-primary);outline-offset:2px;box-shadow:none;}
body.nad-ui input[type=text]:focus,body.nad-ui input[type=url]:focus,body.nad-ui input[type=email]:focus,body.nad-ui input[type=number]:focus,body.nad-ui input[type=search]:focus,body.nad-ui textarea:focus,body.nad-ui select:focus{border-color:var(--nad-primary);box-shadow:0 0 0 1px var(--nad-primary);}
body.nad-ui .postbox,body.nad-ui .stuffbox,body.nad-ui .wp-list-table{border-color:var(--nad-line);}
body.nad-ui .postbox{border-radius:10px;}
body.nad-ui .postbox .postbox-header{border-bottom-color:var(--nad-line);}
body.nad-ui .postbox .hndle{font-size:14px;font-weight:600;}
body.nad-ui .wrap h1.wp-heading-inline,body.nad-ui .wrap>h1{font-size:22px;font-weight:600;}

/* Lists */
body.nad-ui .wp-list-table .column-nad_thumb{width:52px;}
body.nad-ui .wp-list-table .column-nad_state{width:150px;}
body.nad-ui .wp-list-table .column-nad_detail{width:22%;color:var(--nad-ink-2);}
body.nad-ui .wp-list-table td{vertical-align:middle;}
body.nad-ui .nad-approve{display:inline-block;margin-inline-start:8px;font-weight:600;}

/* Shared bits */
.nad-thumb img,.nad-thumb-empty{display:block;font-size:22px;line-height:44px;text-align:center;color:#8A90A8;width:44px;height:44px;border-radius:8px;object-fit:cover;background:#E9EBF3;}
.nad-pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;line-height:20px;white-space:nowrap;}
.nad-pill--ok{background:#E3F5EA;color:#14532D;}
.nad-pill--wait{background:#FFF1CC;color:#713F12;}
.nad-pill--muted{background:#ECEDF3;color:#3E4357;}
.nad-row__meta{color:var(--nad-ink-2);font-size:13px;margin-top:2px;}

/* Edit screens */
body.nad-ui-noeditor #postdivrich{display:none;}
body.nad-ui-edit #post-preview,body.nad-ui-edit #edit-slug-box{display:none;}
.nad-editbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin:10px 0 14px;padding:10px 14px;background:var(--nad-panel);border:1px solid var(--nad-line);border-radius:10px;}
.nad-editbar__note{color:var(--nad-ink-2);font-size:13px;flex:1 1 320px;}
.nad-editbar__view{margin-inline-start:auto!important;display:inline-flex!important;align-items:center;gap:4px;}
.nad-editbar__view .dashicons{font-size:16px;width:16px;height:16px;}
body.nad-ui .acf-fields>.acf-tab-wrap{background:#F8F8FC;}
body.nad-ui .acf-tab-wrap .acf-tab-group li a{font-size:13.5px;font-weight:600;padding:9px 14px;}
body.nad-ui .acf-tab-wrap .acf-tab-group li.active a{color:var(--nad-ink);}
body.nad-ui .acf-field.nad-tab-note{padding-top:12px;padding-bottom:4px;border-top:0;}
body.nad-ui .acf-field.nad-tab-note .acf-input{color:var(--nad-ink-2);font-size:13px;}
body.nad-ui .acf-field .acf-label label{font-weight:600;}
body.nad-ui .acf-field p.description{color:var(--nad-ink-2);}

/* Home */
.nad-home{max-width:1240px;font-size:14px;}
.nad-home__head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin:18px 0 14px;}
.nad-home__title{font-size:24px!important;font-weight:700!important;margin:0!important;padding:0!important;line-height:1.3!important;}
.nad-home__sub{margin:4px 0 0;color:var(--nad-ink-2);font-size:14px;}
.nad-btn-ghost{display:inline-flex!important;align-items:center;gap:6px;}
.nad-btn-ghost .dashicons{font-size:16px;width:16px;height:16px;}
.nad-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px;}
.nad-chip{display:inline-flex;align-items:baseline;gap:6px;padding:6px 14px;border-radius:999px;background:var(--nad-panel);border:1px solid var(--nad-line);color:var(--nad-ink)!important;text-decoration:none;font-size:13.5px;}
.nad-chip strong{font-size:15px;}
.nad-chip.is-hot{background:var(--nad-primary-soft);border-color:#CFC5F8;}
.nad-chip:hover{border-color:var(--nad-primary);}
.nad-home__grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px;align-items:start;}
.nad-home__main,.nad-home__side{display:flex;flex-direction:column;gap:20px;min-width:0;}
.nad-panel{background:var(--nad-panel);border:1px solid var(--nad-line);border-radius:12px;padding:16px 18px;scroll-margin-top:48px;}
.nad-panel__head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;margin-bottom:6px;}
.nad-panel__head h2{font-size:16px;font-weight:700;margin:0;color:var(--nad-ink);}
.nad-panel__hint{color:var(--nad-ink-2);font-size:13px;}
.nad-panel__link{margin-inline-start:auto;font-size:13px;}
.nad-empty{color:var(--nad-ink-2);margin:6px 0 2px;max-width:62ch;line-height:1.6;}
.nad-rows{margin:0;padding:0;list-style:none;}
.nad-row{display:flex;align-items:center;gap:14px;padding:12px 0;margin:0;border-top:1px solid var(--nad-line);}
.nad-row:first-child{border-top:0;}
.nad-row__body{flex:1 1 auto;min-width:0;}
.nad-row__title{font-size:14.5px;font-weight:600;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}
.nad-row__title a{text-decoration:none;color:var(--nad-ink);}
.nad-row__title a:hover{color:var(--nad-primary-hover);text-decoration:underline;}
.nad-type{font-size:12px;font-weight:600;color:var(--nad-primary-hover);background:var(--nad-primary-soft);padding:1px 8px;border-radius:6px;}
.nad-row__actions{display:flex;gap:8px;flex:0 0 auto;align-items:center;}
.nad-row__actions form{margin:0;}
.nad-missing{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 0;padding:0;list-style:none;}
.nad-missing li{margin:0;font-size:12.5px;padding:1px 8px;border-radius:6px;background:#FFF1CC;color:#713F12;}
.nad-table{width:100%;border-collapse:collapse;}
.nad-table th{font-size:12.5px;font-weight:600;color:var(--nad-ink-2);text-align:start;padding:6px 8px 6px 0;border-bottom:1px solid var(--nad-line);}
.nad-table td{padding:10px 8px 10px 0;border-bottom:1px solid var(--nad-line);vertical-align:top;}
.nad-table tr:last-child td{border-bottom:0;}
.nad-areas,.nad-links{margin:0;padding:0;list-style:none;}
.nad-areas li{display:flex;align-items:center;gap:10px;padding:8px 0;margin:0;border-top:1px solid var(--nad-line);}
.nad-areas li:first-child{border-top:0;}
.nad-areas .dashicons{color:var(--nad-ink-2);font-size:18px;width:18px;height:18px;}
.nad-areas__name{font-weight:600;text-decoration:none;color:var(--nad-ink)!important;}
.nad-areas__name:hover{text-decoration:underline;}
.nad-areas__count{color:var(--nad-ink-2);font-size:13px;font-variant-numeric:tabular-nums;}
.nad-areas__edit{margin-inline-start:auto;font-size:13px;}
.nad-areas__add{font-size:13px;}
.nad-links li{margin:0;padding:7px 0;border-top:1px solid var(--nad-line);}
.nad-links li:first-child{border-top:0;}
.nad-links--ext a::after{content:"\2197";display:inline-block;margin-inline-start:4px;font-size:12px;}
.nad-home__foot{color:var(--nad-ink-2);font-size:13px;margin:0;}
@media (max-width:1100px){.nad-home__grid{grid-template-columns:minmax(0,1fr);}}
@media (max-width:782px){
	.nad-home__head{flex-direction:column;}
	.nad-row{flex-wrap:wrap;}
	.nad-row__actions{width:100%;padding-inline-start:58px;}
	.nad-table thead{display:none;}
	.nad-table tr{display:block;padding:8px 0;border-bottom:1px solid var(--nad-line);}
	.nad-table td{display:inline-block;border:0;padding:2px 10px 2px 0;}
	body.nad-ui .wp-list-table .column-nad_detail{width:auto;}
}
@media (prefers-reduced-motion:reduce){body.nad-ui *{transition:none!important;}}
CSS;
}

/* ─── Login and password screens (wp-login.php) ─────────────────────────── */
// Members reach WordPress's own screens to choose a new password (the link in the reset email), and admins
// log in here: both get the site's look, in Hebrew.

function nad_on_login_screen() {
	return isset( $_SERVER['SCRIPT_NAME'] ) && 'wp-login.php' === basename( sanitize_text_field( wp_unslash( $_SERVER['SCRIPT_NAME'] ) ) );
}

add_filter(
	'determine_locale',
	function ( $locale ) {
		return ( 'he_IL' !== $locale && nad_on_login_screen() && file_exists( WP_LANG_DIR . '/he_IL.mo' ) ) ? 'he_IL' : $locale;
	},
	20
);

// The logo leads to the site, not to WordPress.org.
add_filter(
	'login_headerurl',
	function () {
		return function_exists( 'nadlanistim_auth_front' ) && nadlanistim_auth_front() ? nadlanistim_auth_front() : home_url( '/' );
	}
);
add_filter(
	'login_headertext',
	function () {
		return 'הנדלניסטים';
	}
);

// login_head, late: WordPress prints its own login and RTL stylesheets on login_head, and this has to come after them.
add_action(
	'login_head',
	function () {
		$front = function_exists( 'nadlanistim_auth_front' ) ? nadlanistim_auth_front() : '';
		$logo  = $front ? '#login h1 a{background-image:url(' . esc_url( $front . '/v6-assets/logo.png' ) . ');}' : '';
		echo '<style id="nad-login-ui">' . nad_admin_font_faces() . $logo . nad_login_css() . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput -- static CSS plus escaped values.
	},
	99
);

function nad_login_css() {
	return <<<'CSS'
body.login{
	--ink:#F5F7FB;--ink-2:#C9CDDB;--muted:#8A91AC;--line:rgba(255,255,255,.14);--cyan:#22D3EE;
	min-height:100vh;color:var(--ink);font-family:"Google Sans",-apple-system,"Segoe UI",Arial,sans-serif;
	background:radial-gradient(circle at 12% 18%,rgba(139,92,246,.30),transparent 42%),radial-gradient(circle at 88% 82%,rgba(34,211,238,.18),transparent 45%),radial-gradient(circle at 70% 10%,rgba(79,141,251,.16),transparent 40%),#07080F;
}
body.login *:not(.dashicons):not([class*="dashicons"]){font-family:inherit;}
#login{width:400px;max-width:calc(100vw - 32px);padding:7vh 0 32px;}
#login h1 a{width:220px;height:72px;margin:0 auto 22px;background-size:contain;background-position:center;background-repeat:no-repeat;}
.login form{margin-top:0;padding:28px 26px 30px;border-radius:24px;background:rgba(255,255,255,.045);border:1px solid var(--line);box-shadow:0 24px 64px rgba(0,0,0,.45);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);}
.login label,.login .description,.login .indicator-hint,.login p{color:var(--ink-2);font-size:14px;line-height:1.6;}
.login .description,.login .indicator-hint{color:var(--muted);font-size:13px;}
.login form .input,.login input[type=text],.login input[type=email],.login input[type=password]{
	margin:6px 0 16px;padding:10px 14px;min-height:46px;font-size:16px;color:var(--ink);
	background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.18);border-radius:12px;box-shadow:none;
}
.login form .input:focus,.login input:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(34,211,238,.22);outline:0;}
.login .wp-pwd{margin-bottom:16px;}
.login .wp-pwd input{margin-bottom:0;}
.login .button.wp-hide-pw{color:var(--ink-2);background:transparent;border:0;box-shadow:none;height:46px;}
.login .button.wp-hide-pw:focus{box-shadow:0 0 0 2px var(--cyan);}
.wp-core-ui .button-primary{
	min-height:46px;padding:0 26px;border:0;border-radius:999px;font-size:15px;font-weight:600;color:#fff;text-shadow:none;
	background:linear-gradient(135deg,#8B5CF6 0%,#4F8DFB 60%,#22D3EE 100%);box-shadow:0 10px 26px rgba(79,141,251,.35);
}
.wp-core-ui .button-primary:hover,.wp-core-ui .button-primary:focus{background:linear-gradient(135deg,#7C4DEB 0%,#4380EE 60%,#1FC4DD 100%);color:#fff;box-shadow:0 12px 30px rgba(79,141,251,.5);}
.wp-core-ui .button-primary:focus{outline:2px solid #FACC15;outline-offset:2px;}
.login .button-secondary,.login .button.wp-generate-pw{
	min-height:42px;padding:0 18px;border-radius:999px;font-size:14px;color:var(--ink);
	background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.2);box-shadow:none;
}
.login .reset-pass-submit{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;}
.login .reset-pass-submit .button{float:none;margin:0;}
.login .submit .button-primary{float:none;width:100%;}
.login .forgetmenot label{font-size:13px;}
.login input[type=checkbox]{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.3);border-radius:4px;}
#pass-strength-result{margin:0 0 16px;padding:8px 12px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);font-size:13px;}
#pass-strength-result.short{background:rgba(248,113,113,.18);border-color:rgba(248,113,113,.5);}
#pass-strength-result.bad{background:rgba(251,146,60,.18);border-color:rgba(251,146,60,.5);}
#pass-strength-result.good{background:rgba(250,204,21,.16);border-color:rgba(250,204,21,.45);}
#pass-strength-result.strong{background:rgba(74,222,128,.16);border-color:rgba(74,222,128,.5);}
.login .pw-weak label{color:var(--ink-2);}
.login .message,.login .notice,.login .success,.login #login_error{
	margin:0 0 18px;padding:12px 16px;border-radius:14px;color:var(--ink);
	background:rgba(255,255,255,.06);border:1px solid var(--line);border-inline-start:4px solid var(--cyan);box-shadow:none;
}
.login #login_error,.login .notice-error{border-inline-start-color:#F87171;}
.login .message a,.login .notice a,.login #login_error a{color:var(--cyan);}
.login #nav,.login #backtoblog{padding:0 6px;margin-top:16px;text-align:center;}
.login #nav a,.login #backtoblog a{color:#9AA6C6;font-size:14px;}
.login #nav a:hover,.login #backtoblog a:hover{color:var(--cyan);}
.login .language-switcher,.login .privacy-policy-page-link{display:none;}
.login *:focus-visible{outline:2px solid #FACC15;outline-offset:2px;}
/* Everything in the middle of the screen, the text too; the notices take their accent on top instead of the side. */
body.login{display:flex;flex-direction:column;align-items:center;justify-content:center;}
#login{margin:auto;padding:32px 0;}
.login form label,.login form p,.login .message,.login .notice,.login .success,.login #login_error,.login .forgetmenot{text-align:center;}
.login .forgetmenot{float:none;margin-bottom:14px;}
.login .message,.login .notice,.login .success,.login #login_error{border-inline-start-width:1px;border-top:3px solid var(--cyan);}
.login #login_error,.login .notice-error{border-top-color:#F87171;}
/* The reset and confirmation screens: no "התחבר" link under the form. The sign-in screen keeps "שכחת את הסיסמה?". */
body.login:not(.login-action-login) #nav{display:none;}
CSS;
}
