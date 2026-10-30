<?php
/**
 * Nadlanistim content model — custom post types + taxonomies.
 *
 * Registered in PHP (guarded) so the content model exists with or without ACF. On staging
 * the same post types are also imported into ACF → Post Types (via the Admin tool) so the
 * client can see/manage them next to the field groups. Keys are exact and STABLE — the
 * widgets and field groups key off them.
 *
 * @package nadlanistim-importer
 */

namespace NadlanistimImporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Types {

	/** post type key => [singular, plural, menu icon] */
	const TYPES = array(
		'nad_event'     => array( 'אירוע', 'אירועים', 'dashicons-calendar-alt' ),
		'nad_podcast'   => array( 'פרק', 'פודקאסט', 'dashicons-microphone' ),
		'nad_job'       => array( 'משרה', 'דרושים', 'dashicons-businessperson' ),
		'nad_deal'      => array( 'עסקה', 'עסקאות', 'dashicons-portfolio' ),
		'nad_community' => array( 'קהילה', 'קהילות', 'dashicons-groups' ),
		'nad_nadlanist' => array( 'נדלניסט', 'נדלניסטים', 'dashicons-admin-users' ),
		'nad_article'   => array( 'כתבה', 'כתבות', 'dashicons-media-document' ),
		'nad_collab'    => array( 'שיתוף פעולה', 'שיתופי פעולה', 'dashicons-networking' ),
		'nad_sponsor'   => array( 'שותף', 'שותפים ומממנים', 'dashicons-awards' ),
	);

	/**
	 * taxonomy key => [post type(s), singular, plural, hierarchical]
	 *
	 * The first element accepts a string or an array of post type keys. Several of these back
	 * the listing-page filters in the front end (field / region / collaboration type), which
	 * is the whole reason they are taxonomies rather than plain text fields: the client can
	 * add a new filter option without a developer, and the front end derives its filter bar
	 * from the terms rather than a hardcoded list.
	 */
	const TAXONOMIES = array(
		'nad_article_cat' => array( 'nad_article', 'קטגוריה', 'קטגוריות', false ),
		'nad_event_type'  => array( 'nad_event', 'סוג אירוע', 'סוגי אירועים', false ),

		// People. `cohort` is what merges the two former datasets (app/nadlanistim/data.ts and
		// app/youth/data.ts) into one post type — the youth page is the "צעירים" term, nothing
		// more. Modelling it as a second post type would have duplicated every field.
		'nad_cohort'      => array( 'nad_nadlanist', 'שיוך', 'שיוכים', false ),
		'nad_field'       => array( 'nad_nadlanist', 'תחום', 'תחומים', false ),
		'nad_focus'       => array( 'nad_nadlanist', 'התמחות', 'התמחויות', false ),

		// Shared by people and collaborations — both listing pages filter by area.
		'nad_region'      => array( array( 'nad_nadlanist', 'nad_collab' ), 'אזור', 'אזורים', false ),

		'nad_collab_type' => array( 'nad_collab', 'סוג שיתוף פעולה', 'סוגי שיתופי פעולה', false ),

		// Article tags. A taxonomy rather than a text field because the design's tag chips are
		// clickable and lead to a filtered archive — the same behaviour as categories, so the
		// same mechanism. Categories stay single-select (one main category per article); tags
		// are many per article.
		'nad_article_tag' => array( 'nad_article', 'תגית', 'תגיות', false ),
	);

	/**
	 * Post types that need the WordPress author column.
	 *
	 * Articles display their writer's name, photo, role and bio. The intent is that this comes
	 * from the account of the member who wrote it, so the post has to actually record an author
	 * — `supports` omitted it, which meant WordPress tracked no author at all and the admin
	 * offered no way to set one. Without this there is nothing for a member panel to attach to
	 * later, and the temporary ACF author fields would be the only source forever.
	 */
	const AUTHOR_SUPPORT = array( 'nad_article' );

	/**
	 * GraphQL type names for the headless build — key => [single, plural].
	 *
	 * These MUST be ASCII camelCase: WPGraphQL builds schema type names from them, so the
	 * Hebrew labels above cannot be reused. They are also part of the public API contract —
	 * the Next.js queries key off `events`, `nadlanists`, … so renaming one breaks the
	 * front end. Treat as stable.
	 *
	 * The args are inert when WPGraphQL is not installed (register_post_type ignores
	 * unknown keys), so the Elementor build is unaffected by their presence.
	 */
	const GRAPHQL = array(
		'nad_event'       => array( 'event', 'events' ),
		'nad_podcast'     => array( 'podcast', 'podcasts' ),
		'nad_job'         => array( 'job', 'jobs' ),
		'nad_deal'        => array( 'deal', 'deals' ),
		'nad_community'   => array( 'community', 'communities' ),
		'nad_nadlanist'   => array( 'nadlanist', 'nadlanists' ),
		'nad_article'     => array( 'article', 'articles' ),
		'nad_collab'      => array( 'collab', 'collabs' ),
		'nad_sponsor'     => array( 'sponsor', 'sponsors' ),
		'nad_article_cat' => array( 'articleCategory', 'articleCategories' ),
		'nad_event_type'  => array( 'eventType', 'eventTypes' ),
		'nad_cohort'      => array( 'cohort', 'cohorts' ),
		'nad_field'       => array( 'personField', 'personFields' ),
		'nad_focus'       => array( 'focus', 'focuses' ),
		'nad_region'      => array( 'region', 'regions' ),
		'nad_collab_type' => array( 'collabType', 'collabTypes' ),
		'nad_article_tag' => array( 'articleTag', 'articleTags' ),
	);

	/** GraphQL args for a post type / taxonomy key, or [] if it has no mapping. */
	private static function graphql_args( $key ) {
		if ( empty( self::GRAPHQL[ $key ] ) ) {
			return array();
		}
		list( $single, $plural ) = self::GRAPHQL[ $key ];
		return array(
			'show_in_graphql'     => true,
			'graphql_single_name' => $single,
			'graphql_plural_name' => $plural,
		);
	}

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ), 20 );
		add_filter( 'post_date_column_status', array( __CLASS__, 'job_date_status' ), 10, 4 );
		add_filter( 'manage_nad_job_posts_columns', array( __CLASS__, 'job_columns' ) );
		add_action( 'manage_nad_job_posts_custom_column', array( __CLASS__, 'job_column_content' ), 10, 2 );
		add_filter( 'manage_edit-nad_job_sortable_columns', array( __CLASS__, 'job_sortable_columns' ) );
		// Collaborations get the same Status column (the callbacks are post-type-agnostic).
		add_filter( 'manage_nad_collab_posts_columns', array( __CLASS__, 'job_columns' ) );
		add_action( 'manage_nad_collab_posts_custom_column', array( __CLASS__, 'job_column_content' ), 10, 2 );
		add_filter( 'manage_edit-nad_collab_sortable_columns', array( __CLASS__, 'job_sortable_columns' ) );
		// Nadlanist profiles too.
		add_filter( 'manage_nad_nadlanist_posts_columns', array( __CLASS__, 'job_columns' ) );
		add_action( 'manage_nad_nadlanist_posts_custom_column', array( __CLASS__, 'job_column_content' ), 10, 2 );
		add_filter( 'manage_edit-nad_nadlanist_sortable_columns', array( __CLASS__, 'job_sortable_columns' ) );
		add_action( 'pre_get_posts', array( __CLASS__, 'job_sort_status' ) );
		add_filter( 'display_post_states', array( __CLASS__, 'job_post_states' ), 10, 2 );
		add_action( 'admin_head', array( __CLASS__, 'job_badge_css' ) );
		add_action( 'admin_footer-edit.php', array( __CLASS__, 'job_title_links' ) );
		add_action( 'admin_menu', array( __CLASS__, 'hide_native_posts' ), 999 );

		// Force GraphQL exposure onto our keys no matter who registers them. On staging ACF
		// owns the post types, so the guarded register() below bails and never gets to apply
		// its args — these filters run for every registration, including ACF's, so the
		// headless schema is correct either way.
		add_filter( 'register_post_type_args', array( __CLASS__, 'filter_post_type_args' ), 20, 2 );
		add_filter( 'register_taxonomy_args', array( __CLASS__, 'filter_taxonomy_args' ), 20, 2 );
	}

	/**
	 * How long a job shows the "חדש" (New) pill after creation — a TIME flag, NOT a status. It sits
	 * next to the real status pill (ממתין לאישור / פורסם) and disappears once the job is older than
	 * this window. Filterable so the client can tune it.
	 */
	public static function job_new_days() {
		return (int) apply_filters( 'nad_job_new_days', 7 );
	}

	/**
	 * Post types that get the admin Status column + publish/unpublish flow, mapped to their
	 * front-end single-page route. Jobs and collaborations share the identical treatment, so the
	 * column methods below are written against this map rather than a single hard-coded type.
	 */
	public static function status_types() {
		return array(
			'nad_job'       => '/jobs/',
			'nad_collab'    => '/collaboration/',
			'nad_nadlanist' => '/nadlanist/',
		);
	}

	/** Front-end single-page route prefix for a status-managed post type, or '' if not managed. */
	protected static function status_route( $post_type ) {
		$types = self::status_types();
		return isset( $types[ $post_type ] ) ? $types[ $post_type ] : '';
	}

	/** Drop the native "Published" label from the Date column — every row reads "Last Modified". */
	public static function job_date_status( $status, $post, $column_name, $mode ) {
		if ( isset( $post->post_type ) && '' !== self::status_route( $post->post_type ) ) {
			return __( 'Last Modified' );
		}
		return $status;
	}

	/**
	 * Who may see the jobs Status column and its publish/unpublish links: administrators only.
	 *
	 * This is what keeps the publish tokens out of non-admin hands — members (once they are WP
	 * users) never see the column, so a token is never minted for them and can never leak through
	 * this screen. Filterable in case the client later wants a dedicated editor role to manage jobs.
	 */
	public static function can_manage_job_status() {
		return current_user_can( apply_filters( 'nad_job_status_cap', 'manage_options' ) );
	}

	/** A dedicated "Status" column immediately before Date (to its left, tight against it). Admins only. */
	public static function job_columns( $cols ) {
		if ( ! self::can_manage_job_status() ) {
			return $cols;
		}
		$out = array();
		foreach ( $cols as $key => $label ) {
			if ( 'date' === $key ) {
				$out['nad_status'] = 'Status';
			}
			$out[ $key ] = $label;
		}
		if ( ! isset( $out['nad_status'] ) ) {
			$out['nad_status'] = 'Status';
		}
		return $out;
	}

	/** Drop the native "— Pending"/"— Draft" state label next to the title — the Status column owns that now. */
	public static function job_post_states( $states, $post ) {
		if ( isset( $post->post_type ) && '' !== self::status_route( $post->post_type ) ) {
			return array();
		}
		return $states;
	}

	/** Make the Status column sortable, like Title and Date (adds the header sort arrows). */
	public static function job_sortable_columns( $cols ) {
		$cols['nad_status'] = 'nad_status';
		return $cols;
	}

	/** When the jobs list is ordered by Status, sort on post_status (then newest first as a tiebreak). */
	public static function job_sort_status( $query ) {
		if ( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}
		if ( '' === self::status_route( (string) $query->get( 'post_type' ) ) || 'nad_status' !== $query->get( 'orderby' ) ) {
			return;
		}
		add_filter( 'posts_orderby', array( __CLASS__, 'job_status_orderby' ), 10, 2 );
	}

	public static function job_status_orderby( $orderby, $query ) {
		global $wpdb;
		$dir = ( 'asc' === strtolower( (string) $query->get( 'order' ) ) ) ? 'ASC' : 'DESC';
		return "{$wpdb->posts}.post_status {$dir}, {$wpdb->posts}.post_date DESC";
	}

	/**
	 * The status pills for the column: an optional "חדש" pill while the job is within the New
	 * window, then the review-state pill — ממתין לאישור (pending), פורסם (published), טיוטה (draft).
	 */
	public static function job_column_content( $column, $post_id ) {
		if ( 'nad_status' !== $column || ! self::can_manage_job_status() ) {
			return;
		}
		$post = get_post( $post_id );
		if ( ! $post ) {
			return;
		}
		$created = strtotime( ( '0000-00-00 00:00:00' === $post->post_date_gmt ) ? $post->post_date : $post->post_date_gmt . ' UTC' );
		if ( $created && ( time() - $created ) < ( self::job_new_days() * DAY_IN_SECONDS ) ) {
			printf( '<span class="nad-badge nad-badge--new">%s</span> ', esc_html_x( 'חדש', 'job status', 'nadlanistim-importer' ) );
		}
		$labels = array(
			'publish' => array( 'publish', _x( 'פורסם', 'job status', 'nadlanistim-importer' ) ),
			'pending' => array( 'pending', _x( 'ממתין לאישור', 'job status', 'nadlanistim-importer' ) ),
			'draft'   => array( 'draft', _x( 'טיוטה', 'job status', 'nadlanistim-importer' ) ),
		);
		$s = $post->post_status;
		if ( isset( $labels[ $s ] ) ) {
			$pill = sprintf( '<span class="nad-badge nad-badge--%s">%s</span>', esc_attr( $labels[ $s ][0] ), esc_html( $labels[ $s ][1] ) );
			// Both the "pending review" and "published" pills are clickable — they open the
			// front-end single page in admin mode: a pending job to review & publish, a published
			// job to unpublish (back to pending). The token (minted here, in the authenticated
			// admin) carries that authority to the other host. Draft stays a plain indicator.
			$link = self::job_admin_link( $post );
			if ( $link && ( 'pending' === $s || 'publish' === $s ) ) {
				printf(
					'<a class="nad-status-link" href="%s" title="%s">%s</a>',
					esc_url( $link ),
					esc_attr_x( 'פתיחה באתר לפרסום / ביטול פרסום', 'job status link', 'nadlanistim-importer' ),
					$pill
				);
			} else {
				echo $pill; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from esc_* above.
			}
		} else {
			echo esc_html( $s );
		}
	}

	/**
	 * Front-end single-page link for a job, in admin mode: front-end URL + /jobs/<slug> + a signed
	 * admin token. Empty when the headless plugin (which owns the front-end URL and token secret)
	 * is inactive or the front-end URL is unset.
	 */
	protected static function job_admin_link( $post ) {
		if ( ! function_exists( 'NadlanistimHeadless\\frontend_url' ) || ! function_exists( 'NadlanistimHeadless\\admin_action_token' ) ) {
			return '';
		}
		$base  = \NadlanistimHeadless\frontend_url();
		$route = self::status_route( $post->post_type );
		if ( ! $base || '' === $route ) {
			return '';
		}
		// Pending/draft posts have NO post_name yet — WordPress only generates a slug on first
		// publish. Fall back to a title slug (exactly what it will become on publish), then the ID.
		// The single page resolves the post by the TOKEN's post id, so this slug segment only has to
		// satisfy the /<route>/<slug> path — an empty one is why the pending pill had no link at all.
		$slug = $post->post_name;
		if ( '' === $slug ) {
			$slug = sanitize_title( get_the_title( $post ) );
		}
		if ( '' === $slug ) {
			$slug = (string) $post->ID;
		}
		$token = \NadlanistimHeadless\admin_action_token( $post->ID );
		// Raw slug (esc_url encodes it once, matching how the board links to the single page).
		// Pre-encoding here would make esc_url double-encode the Hebrew (%25d7…) and break routing.
		return $base . $route . $slug . '?token=' . $token;
	}

	/**
	 * Repoint the job TITLE link in the list table to the front-end single page as a CLEAN PREVIEW
	 * (the real post design, no publish/unpublish bar) instead of the WordPress ACF editor. Editing
	 * still lives on the native Edit / Quick Edit row actions — only the title changes.
	 *
	 * WordPress hard-codes the title anchor to the edit link with no filter for just that anchor,
	 * so the hrefs are swapped in the footer. `&view=1` tells the single page to render WITHOUT the
	 * action bar — that bar is reserved for the Status-pill link. Admin-only (same gate as the
	 * column), and only when a front-end URL is configured. The token lets a pending job — hidden
	 * from the public schema — still render its design in the preview.
	 */
	public static function job_title_links() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || empty( $screen->post_type ) || '' === self::status_route( $screen->post_type ) || ! self::can_manage_job_status() ) {
			return;
		}
		$map = array();
		foreach ( get_posts( array( 'post_type' => $screen->post_type, 'post_status' => 'any', 'numberposts' => 500, 'suppress_filters' => true ) ) as $p ) {
			$link = self::job_admin_link( $p );
			if ( $link ) {
				$map[ $p->ID ] = $link . '&view=1';
			}
		}
		if ( ! $map ) {
			return;
		}
		?>
		<script>
		( function () {
			var m = <?php echo wp_json_encode( $map ); ?>;
			document.querySelectorAll( '#the-list tr[id^="post-"]' ).forEach( function ( tr ) {
				var url = m[ tr.id.replace( 'post-', '' ) ];
				if ( ! url ) { return; }
				var a = tr.querySelector( '.row-title' );
				if ( a ) { a.setAttribute( 'href', url ); }
			} );
		} )();
		</script>
		<?php
	}

	/** Pill styling, only on a status-managed list screen (jobs, collaborations). */
	public static function job_badge_css() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || empty( $screen->post_type ) || '' === self::status_route( $screen->post_type ) ) {
			return;
		}
		echo '<style>
			.fixed .column-nad_status{width:200px;white-space:nowrap}
			.column-nad_status .nad-badge{display:inline-block;margin:1px 0}
			.column-nad_status .nad-status-link,
			.column-nad_status .nad-status-link:hover,
			.column-nad_status .nad-status-link:focus,
			.column-nad_status .nad-status-link:active{text-decoration:none;box-shadow:none;outline:0;border:0;cursor:pointer}
			.column-nad_status .nad-status-link:hover .nad-badge{filter:brightness(1.08)}
			.nad-badge{display:inline-block;padding:3px 12px;border-radius:999px;font-size:12px;font-weight:600;line-height:1.7;color:#fff;white-space:nowrap}
			.nad-badge--new{background:#2563eb}
			.nad-badge--pending{background:#d97706}
			.nad-badge--publish{background:#16a34a}
			.nad-badge--draft{background:#6b7280}
		</style>';
	}

	/**
	 * Hide WordPress's native Posts menu.
	 *
	 * Articles live in כתבות (nad_article). Leaving "פוסטים" in the sidebar gives the client two
	 * blog-shaped menus and no way to tell which one the site reads — content written in the
	 * wrong one simply never appears, with no error to explain why.
	 *
	 * Only the menu is removed. The post type stays registered and existing content stays
	 * reachable by URL, so this hides a wrong turn rather than deleting anything.
	 */
	public static function hide_native_posts() {
		remove_menu_page( 'edit.php' );
	}

	/**
	 * The `supports` list for a post type. Articles add 'author' (see AUTHOR_SUPPORT); sponsors add
	 * 'page-attributes' so the client gets the Order field and can reorder the home-page logo strips.
	 */
	private static function supports_for( $key ) {
		$supports = array( 'title', 'editor', 'thumbnail', 'excerpt' );
		if ( in_array( $key, self::AUTHOR_SUPPORT, true ) ) {
			$supports[] = 'author';
		}
		if ( 'nad_sponsor' === $key ) {
			$supports[] = 'page-attributes';
		}
		return $supports;
	}

	public static function filter_post_type_args( $args, $key ) {
		return array_merge( $args, self::graphql_args( $key ) );
	}

	public static function filter_taxonomy_args( $args, $key ) {
		return array_merge( $args, self::graphql_args( $key ) );
	}

	/**
	 * Register the post types and taxonomies — guarded, so this never fights an ACF-registered
	 * copy on staging (init priority 20 runs after ACF's own registration).
	 */
	public static function register() {
		foreach ( self::TYPES as $key => $t ) {
			if ( post_type_exists( $key ) ) {
				continue;
			}
			list( $singular, $plural, $icon ) = $t;
			register_post_type(
				$key,
				array(
					'labels'       => array(
						'name'          => $plural,
						'singular_name' => $singular,
						'add_new_item'  => sprintf( '%s חדש/ה', $singular ),
						'edit_item'     => sprintf( 'עריכת %s', $singular ),
						'menu_name'     => $plural,
					),
					'public'       => true,
					'show_in_rest' => true,
					'menu_icon'    => $icon,
					'has_archive'  => true,
					'supports'     => self::supports_for( $key ),
					'rewrite'      => array( 'slug' => str_replace( 'nad_', 'nadlanistim-', $key ) ),
				)
			);
		}

		foreach ( self::TAXONOMIES as $key => $tx ) {
			if ( taxonomy_exists( $key ) ) {
				continue;
			}
			list( $pt, $singular, $plural, $hier ) = $tx;
			register_taxonomy(
				$key,
				(array) $pt,
				array(
					'labels'            => array( 'name' => $plural, 'singular_name' => $singular, 'menu_name' => $plural ),
					'public'            => true,
					'hierarchical'      => (bool) $hier,
					'show_admin_column' => true,
					'show_in_rest'      => true,
				)
			);
		}
	}
}
