<?php
/*
Plugin Name: Nadlanistim Headless
Description: Turns this WordPress into an API-only backend for the Next.js front end: CORS for the app origins, preview plumbing, and a front end that points visitors at the real site.
Version:     1.31.0
Author:      Nadlanistim
Text Domain: nadlanistim-headless
*/

/**
 * Companion to nadlanistim-importer, which owns the content model (post types, taxonomies,
 * ACF field groups) and their GraphQL exposure. This plugin owns only the headless plumbing,
 * so the content model stays usable by the Elementor build if the client goes back to it.
 *
 * @package nadlanistim-headless
 */

namespace NadlanistimHeadless;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NADLANISTIM_HEADLESS_VERSION', '1.31.0' );

/**
 * JWT secret for headless member login (the WPGraphQL JWT Authentication plugin).
 *
 * That plugin normally reads a GRAPHQL_JWT_AUTH_SECRET_KEY constant from wp-config.php, but the
 * managed host gives no wp-config access — so the key is supplied through the plugin's own
 * filter instead. It is generated once and stored in an option, so it stays stable (issued
 * tokens keep validating) without ever living in source control. A wp-config constant, if it is
 * ever set, still wins (the plugin only falls through to this filter when the constant is empty).
 */
add_filter(
	'graphql_jwt_auth_secret_key',
	function ( $secret ) {
		if ( $secret ) {
			return $secret;
		}
		$stored = get_option( 'nad_jwt_secret' );
		if ( ! $stored ) {
			$stored = wp_generate_password( 64, true, true );
			update_option( 'nad_jwt_secret', $stored, false );
		}
		return $stored;
	}
);

/**
 * Extend the JWT auth-token lifetime to 7 days.
 *
 * The default is 5 minutes, which assumes the client refreshes with the refresh token on every
 * call. The front end stores the auth token in a single httpOnly cookie and resolves the member
 * with one `viewer` query per request, so a short token would force a refresh round-trip each
 * time (and we just spent effort cutting latency). A week-long token keeps the member logged in
 * without that hop; when it expires they simply log in again.
 */
add_filter(
	'graphql_jwt_auth_expire',
	function () {
		// The filter value is a DURATION in seconds (the library does exp = time() + this), NOT an
		// absolute timestamp — returning time()+X yields a ~56-year token.
		return 7 * DAY_IN_SECONDS;
	}
);

/**
 * Origins allowed to call the API from a browser.
 *
 * Server-side rendering in Next.js does NOT go through CORS — this list only matters for
 * client-side queries (search, filters, previews). Keep it explicit: a wildcard would let
 * any site read draft content through an authenticated visitor's cookies.
 *
 * Override in wp-config.php:
 *   define( 'NADLANISTIM_ALLOWED_ORIGINS', 'https://foo.vercel.app,https://nadlanistim.co.il' );
 */
function allowed_origins() {
	$origins = array(
		'http://localhost:3000',
		'http://127.0.0.1:3000',
	);

	if ( defined( 'NADLANISTIM_ALLOWED_ORIGINS' ) ) {
		foreach ( explode( ',', NADLANISTIM_ALLOWED_ORIGINS ) as $o ) {
			$o = trim( $o );
			if ( '' !== $o ) {
				$origins[] = untrailingslashit( $o );
			}
		}
	}

	// Any *.vercel.app preview deployment for this project. Vercel mints a new hostname per
	// commit, so pinning exact preview URLs is unworkable; the suffix check keeps it scoped.
	return apply_filters( 'nadlanistim_allowed_origins', $origins );
}

function origin_is_allowed( $origin ) {
	$origin = untrailingslashit( $origin );
	if ( in_array( $origin, allowed_origins(), true ) ) {
		return true;
	}
	$host = wp_parse_url( $origin, PHP_URL_HOST );
	return is_string( $host ) && substr( $host, -11 ) === '.vercel.app';
}

/**
 * Send CORS headers for GraphQL and REST responses.
 *
 * Credentials are allowed so preview/draft queries can ride the logged-in cookie; that is
 * exactly why the origin list above must stay explicit rather than '*' (browsers reject
 * wildcard + credentials anyway).
 */
function send_cors_headers() {
	$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';
	if ( '' === $origin || ! origin_is_allowed( $origin ) ) {
		return;
	}
	header( 'Access-Control-Allow-Origin: ' . $origin );
	header( 'Access-Control-Allow-Credentials: true' );
	header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
	header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce' );
	header( 'Vary: Origin' );
}

// WPGraphQL sends its own permissive headers; replacing them keeps one policy in force.
add_filter(
	'graphql_response_headers_to_send',
	function ( $headers ) {
		$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';
		if ( '' !== $origin && origin_is_allowed( $origin ) ) {
			$headers['Access-Control-Allow-Origin']      = $origin;
			$headers['Access-Control-Allow-Credentials'] = 'true';
			$headers['Vary']                             = 'Origin';
		} else {
			unset( $headers['Access-Control-Allow-Origin'] );
		}
		return $headers;
	},
	20
);

add_action( 'rest_api_init', __NAMESPACE__ . '\\send_cors_headers', 15 );

// Preflight: answer and stop before WordPress does any real work.
add_action(
	'init',
	function () {
		if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
			send_cors_headers();
			status_header( 204 );
			exit;
		}
	},
	1
);

/**
 * The public front-end URL, or '' when the redirect should stay off.
 *
 * Two sources, constant first: a managed host often gives the client no way to edit
 * wp-config.php, so the settings field is the one they can actually reach — but an explicit
 * constant should still win, since that is the lever available when the admin is broken.
 *
 *   define( 'NADLANISTIM_FRONTEND_URL', 'https://nadlanistim.vercel.app' );   // wins
 *   הגדרות אתר → זהות האתר → כתובת האתר הציבורי                                // fallback
 */
function frontend_url() {
	if ( defined( 'NADLANISTIM_FRONTEND_URL' ) && NADLANISTIM_FRONTEND_URL ) {
		return untrailingslashit( NADLANISTIM_FRONTEND_URL );
	}
	if ( function_exists( 'get_field' ) ) {
		$url = get_field( 'frontend_url', 'option' );
		if ( is_string( $url ) && '' !== trim( $url ) ) {
			return untrailingslashit( trim( $url ) );
		}
	}
	return '';
}

/**
 * Point front-end visitors at the Next.js site.
 *
 * Only redirects real page views — never admin, REST, GraphQL, cron, logins or uploads, or
 * we would cut off the very endpoints the front end depends on. Off unless the front-end
 * URL is configured, so a fresh install stays reachable.
 */
add_action(
	'template_redirect',
	function () {
		if ( ! frontend_url() ) {
			return;
		}
		if ( is_admin() || is_feed() || is_robots() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}
		if ( is_user_logged_in() ) {
			return; // editors previewing content should still see WP.
		}
		// A single article has a real front-end route (/article/<slug>) that differs from its
		// WordPress path (/nadlanistim-article/<slug>). Send it there explicitly — the generic
		// "front-end URL + same path" redirect below would land on a Vercel path that does not
		// exist. See the post_type_link filter, which fixes the same mismatch for View/share links.
		if ( is_singular( 'nad_article' ) ) {
			$obj = get_queried_object();
			if ( $obj && ! empty( $obj->post_name ) ) {
				wp_safe_redirect( frontend_url() . '/article/' . $obj->post_name, 302 );
				exit;
			}
		}
		// Same mismatch for a job: WP path is /nad_job/<slug>, the front-end route is /jobs/<slug>.
		if ( is_singular( 'nad_job' ) ) {
			$obj = get_queried_object();
			if ( $obj && ! empty( $obj->post_name ) ) {
				wp_safe_redirect( frontend_url() . '/jobs/' . $obj->post_name, 302 );
				exit;
			}
		}
		// And a collaboration: WP path /nad_collab/<slug> → front-end /collaboration/<slug>.
		if ( is_singular( 'nad_collab' ) ) {
			$obj = get_queried_object();
			if ( $obj && ! empty( $obj->post_name ) ) {
				wp_safe_redirect( frontend_url() . '/collaboration/' . $obj->post_name, 302 );
				exit;
			}
		}
		// And a nadlanist profile: the CMS "View" link opens the OWNED profile template (/profile),
		// keyed to this member. The PUBLIC single (/nadlanist/<slug>) is reached from the directory
		// archive instead — the two are separate templates with separate entry points.
		if ( is_singular( 'nad_nadlanist' ) ) {
			$obj = get_queried_object();
			if ( $obj && ! empty( $obj->post_name ) ) {
				wp_safe_redirect( frontend_url() . '/profile?as=' . $obj->post_name, 302 );
				exit;
			}
		}
		// An event: the single templates are three FIXED routes (there is no /event/<slug>), so the
		// View link opens the one that would display this event — party / recap / standard.
		if ( is_singular( 'nad_event' ) ) {
			$obj = get_queried_object();
			if ( $obj ) {
				wp_safe_redirect( frontend_url() . nad_event_front_path( $obj->ID ), 302 );
				exit;
			}
		}
		// A sub-community: WP path → front-end /community/<slug>.
		if ( is_singular( 'nad_community' ) ) {
			$obj = get_queried_object();
			if ( $obj && ! empty( $obj->post_name ) ) {
				wp_safe_redirect( frontend_url() . '/community/' . $obj->post_name, 302 );
				exit;
			}
		}
		// Article category / tag term archives map to the filtered article archive, by term
		// NAME (matching how the archive and the single article's pills filter — ?cat= / ?tag=).
		if ( is_tax( 'nad_article_cat' ) || is_tax( 'nad_article_tag' ) ) {
			$term = get_queried_object();
			if ( $term && ! empty( $term->name ) ) {
				$param = is_tax( 'nad_article_tag' ) ? 'tag' : 'cat';
				wp_safe_redirect( frontend_url() . '/post-archive?' . $param . '=' . rawurlencode( $term->name ), 302 );
				exit;
			}
		}
		wp_safe_redirect( frontend_url() . add_query_arg( array() ), 302 );
		exit;
	}
);

/**
 * Allow the redirect above to leave this host.
 *
 * wp_safe_redirect() silently rewrites any off-host target back to the home page, so without
 * this the front-end redirect would look like it simply does not work. Only the configured
 * front end is added — the point of wp_safe_redirect is to reject arbitrary destinations, and
 * that protection stays in place for everything else.
 */
add_filter(
	'allowed_redirect_hosts',
	function ( $hosts ) {
		$host = wp_parse_url( frontend_url(), PHP_URL_HOST );
		if ( $host ) {
			$hosts[] = $host;
		}
		return $hosts;
	}
);

/**
 * Send "Add New Job" to the front-end form instead of the WordPress ACF editor.
 *
 * Jobs are created through the Next.js /job-new form, never the ACF panel — so any entry to the
 * new-job screen (the list-table "Add New" button, the admin-menu "Add New", the admin-bar
 * "+ New → Job", or a direct URL) redirects to the form. Fires on the screen's early load hook,
 * before any output. Only the new-job screen is touched; editing an existing job stays native.
 * Inert until the front-end URL is configured.
 */
add_action(
	'load-post-new.php',
	function () {
		$type   = isset( $_GET['post_type'] ) ? sanitize_key( wp_unslash( $_GET['post_type'] ) ) : 'post';
		$routes = nad_front_routes( $type );
		if ( ! $routes ) {
			return;
		}
		$front = frontend_url();
		if ( ! $front ) {
			return;
		}
		wp_safe_redirect( $front . $routes[1], 302 );
		exit;
	}
);

/**
 * Send "Edit Job" to the front-end form, pre-filled, instead of the WordPress ACF editor.
 *
 * The Edit row action / title-editor for a job redirects to /job-new with a token minted for that
 * job; the form fetches the existing values through the admin REST route (any status, incl.
 * pending) and renders them ready to edit. Quick Edit and Trash stay native — only the full editor
 * is bypassed, since jobs are meant to be edited on the form, not the ACF panel. Inert until the
 * front-end URL is configured.
 */
add_action(
	'load-post.php',
	function () {
		$action = isset( $_GET['action'] ) ? sanitize_key( wp_unslash( $_GET['action'] ) ) : '';
		if ( 'edit' !== $action ) {
			return;
		}
		$post_id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0;
		$routes  = $post_id ? nad_front_routes( get_post_type( $post_id ) ) : null;
		if ( ! $routes ) {
			return;
		}
		$front = frontend_url();
		if ( ! $front || ! function_exists( __NAMESPACE__ . '\\admin_action_token' ) ) {
			return;
		}
		$post = get_post( $post_id );
		$slug = $post->post_name;
		if ( '' === $slug ) {
			$slug = sanitize_title( get_the_title( $post ) );
		}
		if ( '' === $slug ) {
			$slug = (string) $post_id;
		}
		wp_safe_redirect( $front . $routes[1] . '?edit=' . rawurlencode( $slug ) . '&token=' . admin_action_token( $post_id ), 302 );
		exit;
	}
);

/**
 * Point the admin-bar "Visit Site" link at the Next.js front end.
 *
 * The toolbar's site link normally goes to home_url() — the bare WordPress site, which a logged-in
 * admin sees un-redirected (template_redirect skips logged-in users). Repoint the site-name node
 * and its "Visit Site" child at the configured front end so the toolbar lands on the real Vercel
 * site. Inert until the front-end URL is configured.
 */
add_action(
	'admin_bar_menu',
	function ( $bar ) {
		$front = frontend_url();
		if ( ! $front ) {
			return;
		}
		foreach ( array( 'site-name', 'view-site' ) as $id ) {
			$node = $bar->get_node( $id );
			if ( $node ) {
				$node->href = $front;
				$bar->add_node( (array) $node );
			}
		}
	},
	999
);

/**
 * Front-end routes for a headless post type: [ single-page prefix, new-form path ]. Null for a
 * post type that has no headless page. One place both jobs and collaborations key off, so the
 * Preview / Add-New / Edit redirects below stay identical for every module.
 */
function nad_front_routes( $post_type ) {
	$map = array(
		'nad_job'       => array( '/jobs/', '/job-new' ),
		'nad_collab'    => array( '/collaboration/', '/collaboration-new' ),
		'nad_nadlanist' => array( '/nadlanist/', '/nadlanist-new' ),
	);
	return isset( $map[ $post_type ] ) ? $map[ $post_type ] : null;
}

/**
 * Let the front end resolve preview links to its own routes.
 */
add_filter(
	'preview_post_link',
	function ( $link, $post ) {
		$front = frontend_url();
		if ( ! $front ) {
			return $link;
		}
		// A job previews as its real front-end single page — the SAME clean-preview URL the wp-admin
		// title link uses: the actual post design, no publish/unpublish bar. The token lets a
		// not-yet-public pending/draft job render; `view=1` suppresses the admin bar. Editing stays
		// on native Edit/Quick Edit — this only fixes where the Preview action points.
		$routes = $post ? nad_front_routes( $post->post_type ) : null;
		if ( $routes && function_exists( __NAMESPACE__ . '\\admin_action_token' ) ) {
			$slug = $post->post_name;
			if ( '' === $slug ) {
				$slug = sanitize_title( get_the_title( $post ) );
			}
			if ( '' === $slug ) {
				$slug = (string) $post->ID;
			}
			return $front . $routes[0] . $slug . '?token=' . admin_action_token( $post->ID ) . '&view=1';
		}
		return add_query_arg(
			array(
				'preview' => 'true',
				'id'      => $post->ID,
				'type'    => $post->post_type,
			),
			$front . '/api/preview'
		);
	},
	10,
	2
);

/**
 * Point the article permalink at the Next.js single-page layout.
 *
 * A nad_article has no WordPress-rendered design — the single-page layout lives on the front
 * end at /article/<slug>. Without this, the admin "View" link and get_permalink() point at the
 * bare WordPress permalink (…/nadlanistim-article/<slug>), which shows unstyled WP output to a
 * logged-in editor and, to a logged-out visitor, redirects to a Vercel path that does not
 * exist. Rewriting the permalink here makes View, published-post shares and get_permalink() all
 * resolve to the real design. The Next.js queries read `slug`, not `link`/`uri`, so exposing
 * the front-end URL through those GraphQL fields changes nothing the app relies on. Inert until
 * the front-end URL is configured.
 */
add_filter(
	'post_type_link',
	function ( $link, $post ) {
		if ( ! $post ) {
			return $link;
		}
		$front = frontend_url();
		if ( ! $front || empty( $post->post_name ) ) {
			return $link;
		}
		// Article → /article/<slug>; job → /jobs/<slug>. Points the admin "View" link, share links
		// and get_permalink() at the real front-end single page. A published job is public, so no
		// token is needed — this is its live, shareable page (the same clean design Preview shows).
		if ( 'nad_article' === $post->post_type ) {
			return $front . '/article/' . $post->post_name;
		}
		if ( 'nad_job' === $post->post_type ) {
			return $front . '/jobs/' . $post->post_name;
		}
		if ( 'nad_collab' === $post->post_type ) {
			return $front . '/collaboration/' . $post->post_name;
		}
		// A member's CMS "View" link opens the OWNED profile template (/profile), keyed to this
		// member; the public single (/nadlanist/<slug>) is reached from the directory archive.
		if ( 'nad_nadlanist' === $post->post_type ) {
			return $front . '/profile?as=' . $post->post_name;
		}
		// An event View link opens the fixed single template that would display it (party/recap/standard).
		if ( 'nad_event' === $post->post_type ) {
			return $front . nad_event_front_path( $post->ID );
		}
		if ( 'nad_community' === $post->post_type ) {
			return $front . '/community/' . $post->post_name;
		}
		return $link;
	},
	10,
	2
);

/**
 * The front-end single template for an event. The three event designs live at FIXED routes, so an
 * event maps to one by its kind: a gala/party event → /event-party, a past event → /event-recap,
 * otherwise the standard /event. Mirrors getEventSingle()'s selectors on the front end.
 */
function nad_event_front_path( $post_id ) {
	$party = array( 'מסיבה', 'גאלה', 'ערב גאלה' );
	$types = wp_get_object_terms( $post_id, 'nad_event_type', array( 'fields' => 'names' ) );
	if ( is_array( $types ) && array_intersect( $party, $types ) ) {
		return '/event-party';
	}
	$is_past = function_exists( 'get_field' ) ? get_field( 'is_past', $post_id ) : get_post_meta( $post_id, 'is_past', true );
	return $is_past ? '/event-recap' : '/event';
}

/**
 * Point article category/tag term links at the filtered archive.
 *
 * A term archive has no WordPress-rendered design either — the front end shows it as the
 * article archive filtered by that term (/post-archive?cat=<name> or ?tag=<name>). Without
 * this, the term admin "View" link and get_term_link() point at the bare WP term archive
 * (…/nad_article_cat/<slug>), which 404s on the front end. Filtered by term NAME to match the
 * archive and the single article's pills. Inert until the front-end URL is configured.
 */
add_filter(
	'term_link',
	function ( $link, $term, $taxonomy ) {
		$front = frontend_url();
		if ( ! $front ) {
			return $link;
		}
		if ( 'nad_article_cat' === $taxonomy ) {
			return $front . '/post-archive?cat=' . rawurlencode( $term->name );
		}
		if ( 'nad_article_tag' === $taxonomy ) {
			return $front . '/post-archive?tag=' . rawurlencode( $term->name );
		}
		return $link;
	},
	10,
	3
);

/**
 * Add `imageUrl` to every Nadlanistim type.
 *
 * The front end wants one string per card and should not care where it came from. Real
 * content uses a featured image; the demo seeder stores a remote URL in `nad_seed_img`
 * instead (sideloading 37 images into the media library on every seed is slow and leaves
 * junk behind). Resolving both here means the Next.js mappers stay free of that history,
 * and swapping demo content for real uploads needs no front-end change.
 *
 * Returns null when neither exists, so the front end can decide on a placeholder.
 */
add_action(
	'graphql_register_types',
	function () {
		if ( ! function_exists( 'register_graphql_field' ) || ! class_exists( '\\NadlanistimImporter\\Post_Types' ) ) {
			return;
		}

		foreach ( \NadlanistimImporter\Post_Types::TYPES as $key => $_ ) {
			if ( empty( \NadlanistimImporter\Post_Types::GRAPHQL[ $key ] ) ) {
				continue;
			}
			$type = ucfirst( \NadlanistimImporter\Post_Types::GRAPHQL[ $key ][0] );

			register_graphql_field(
				$type,
				'imageUrl',
				array(
					'type'        => 'String',
					'description' => __( 'Card image: the featured image if set, else the seeded demo URL.', 'nadlanistim-headless' ),
					'resolve'     => function ( $post ) {
						$id = $post->databaseId ?? 0;
						if ( ! $id ) {
							return null;
						}
						$thumb = get_the_post_thumbnail_url( $id, 'large' );
						if ( $thumb ) {
							return $thumb;
						}
						$seed = get_post_meta( $id, 'nad_seed_img', true );
						return $seed ? $seed : null;
					},
				)
			);
		}
	}
);

/**
 * Cropped image sizes.
 *
 * The design places images in fixed frames — circular avatars, a 16:9 cover — so an upload of
 * any shape has to be cropped, not letterboxed. The `true` third argument is a HARD crop:
 * WordPress generates a file at exactly these dimensions, centred, rather than scaling to fit
 * and leaving the aspect ratio to CSS. That keeps the crop consistent between the meta row,
 * the author box and the archive cards, which all read the same file.
 *
 * Dimensions are 2× the largest rendered size so they stay sharp on retina displays: the
 * avatar renders at 64px and 120px, the cover at up to 960px wide.
 */
add_action(
	'after_setup_theme',
	function () {
		add_image_size( 'nad_avatar', 240, 240, true );
		add_image_size( 'nad_cover', 1920, 1080, true );
	}
);

/**
 * ACF image fields exposed as flat URL strings.
 *
 * GraphQL type => [ ACF field name => GraphQL field name ].
 *
 * WPGraphQL for ACF renders an image field as a media connection edge regardless of the
 * field's return_format, so reading one costs `logo { node { sourceUrl } }` and a nullable
 * hop at every level. The front end only ever wants one URL, and every mapper already
 * expects a string (see lib/wp/index.ts), so we flatten here instead — the same contract
 * `imageUrl` above establishes.
 *
 * Keep in sync with the image() fields in nadlanistim-importer's Fields::groups().
 */
const IMAGE_FIELDS = array(
	'Community' => array( 'logo' => 'logoUrl' ),
	'Sponsor'   => array( 'logo' => 'logoUrl' ),
	'Event'     => array( 'speaker_photo' => 'speakerPhotoUrl', 'video_thumb' => 'videoThumbUrl' ),
);

/**
 * ACF gallery fields flattened to a plain [String] of URLs — the list analogue of IMAGE_FIELDS.
 * Keep in sync with the gallery() fields in nadlanistim-importer's Fields::groups().
 */
const GALLERY_FIELDS = array(
	'Event'     => array(
		'lineup_photos'  => 'lineupPhotosUrls',
		'party_gallery'  => 'partyGalleryUrls',
		'recap_gallery'  => 'recapGalleryUrls',
		'recap_avatars'  => 'recapAvatarsUrls',
	),
	'Community' => array( 'gallery' => 'galleryUrls' ),
);

add_action(
	'graphql_register_types',
	function () {
		if ( ! function_exists( 'register_graphql_field' ) || ! function_exists( 'get_field' ) ) {
			return;
		}

		foreach ( IMAGE_FIELDS as $type => $fields ) {
			foreach ( $fields as $acf_name => $gql_name ) {
				register_graphql_field(
					$type,
					$gql_name,
					array(
						'type'        => 'String',
						'description' => __( 'ACF image field flattened to a plain URL.', 'nadlanistim-headless' ),
						'resolve'     => function ( $post ) use ( $acf_name ) {
							$id = $post->databaseId ?? 0;
							if ( ! $id ) {
								return null;
							}
							// return_format is 'url', so this is already a string — but a field
							// saved before that was set can still hand back an ID or array.
							$val = get_field( $acf_name, $id );
							if ( is_array( $val ) ) {
								return $val['url'] ?? null;
							}
							if ( is_numeric( $val ) ) {
								return wp_get_attachment_url( (int) $val ) ?: null;
							}
							return is_string( $val ) && '' !== $val ? $val : null;
						},
					)
				);
			}
		}
	}
);

/**
 * Register the flat [String] URL list for each ACF gallery field (GALLERY_FIELDS). get_field
 * returns attachment IDs (return_format 'id'); we map them to URLs so the Next mappers get a
 * plain array of strings — the list analogue of the IMAGE_FIELDS flattening above.
 */
add_action(
	'graphql_register_types',
	function () {
		if ( ! function_exists( 'register_graphql_field' ) || ! function_exists( 'get_field' ) ) {
			return;
		}
		foreach ( GALLERY_FIELDS as $type => $fields ) {
			foreach ( $fields as $acf_name => $gql_name ) {
				register_graphql_field(
					$type,
					$gql_name,
					array(
						'type'        => array( 'list_of' => 'String' ),
						'description' => __( 'ACF gallery field flattened to a plain list of URLs.', 'nadlanistim-headless' ),
						'resolve'     => function ( $post ) use ( $acf_name ) {
							$id = $post->databaseId ?? 0;
							if ( ! $id ) {
								return array();
							}
							$val = get_field( $acf_name, $id );
							if ( ! is_array( $val ) ) {
								return array();
							}
							$urls = array();
							foreach ( $val as $item ) {
								if ( is_numeric( $item ) ) {
									$url = wp_get_attachment_url( (int) $item );
								} elseif ( is_array( $item ) ) {
									$url = $item['url'] ?? null;
								} else {
									$url = is_string( $item ) ? $item : null;
								}
								if ( $url ) {
									$urls[] = $url;
								}
							}
							return $urls;
						},
					)
				);
			}
		}
	}
);

/**
 * Words per minute used to estimate article reading time.
 *
 * Hebrew prose sits around 200wpm for most readers. A constant rather than a literal because
 * it is a guess that may want tuning, and it must produce the same number everywhere the
 * estimate appears — the article page and the archive card would otherwise disagree.
 */
const READING_WPM = 200;

/**
 * Article fields the front end needs, flattened.
 *
 * Three things are resolved here rather than in the Next.js mappers:
 *
 * 1. The AUTHOR. The design shows the writer in two places and the intent is that this comes
 *    from the account of the member who wrote the piece. No membership system exists yet, so
 *    the article carries temporary ACF fields — but the WordPress post author is preferred
 *    whenever that user has actually filled in a profile. The day members become users, real
 *    data starts winning on its own and neither the query nor the template changes.
 *
 * 2. READING TIME, counted from the body rather than typed. A stored number goes stale the
 *    moment the article is edited, and the client should not have to maintain it. The ACF
 *    field is an override for the cases the word count reads wrong, e.g. image-heavy pieces.
 *
 * 3. The BODY, as a flat list of blocks. WPGraphQL renders Flexible Content as a union of
 *    per-layout types, which makes the query verbose and couples it to ACF's naming. A single
 *    block type with nullable fields is far easier to consume and to keep stable.
 */

/** True when a WordPress user has enough profile filled in to be worth preferring. */
function user_profile_is_filled( $user_id ) {
	if ( ! $user_id ) {
		return false;
	}
	$user = get_userdata( $user_id );
	// The bio is the signal: WordPress always has a display name (it defaults to the login),
	// so that alone would make every article prefer an empty profile over the real fields.
	return $user && '' !== trim( (string) $user->description );
}

/**
 * The נדלניסט post an article credits, or 0.
 *
 * The client picks the writer from the נדלניסטים index (the author_nadlanist relationship),
 * which is the source of truth for the stripe. Only honoured when the id really points at a
 * nad_nadlanist, so a stale id from a deleted post falls through to the older author paths
 * rather than resolving the stripe to nothing.
 */
function linked_nadlanist( $post_id ) {
	if ( ! function_exists( 'get_field' ) ) {
		return 0;
	}
	// Unformatted so the return-format setting cannot change the shape from under us: post_object
	// hands back an id, an array, or a WP_Post depending on config and how it was saved.
	$val = get_field( 'author_nadlanist', $post_id, false );
	if ( is_array( $val ) ) {
		$val = $val['ID'] ?? ( $val[0] ?? 0 );
	} elseif ( $val instanceof \WP_Post ) {
		$val = $val->ID;
	}
	$id = (int) $val;
	return ( $id && 'nad_nadlanist' === get_post_type( $id ) ) ? $id : 0;
}

/** One author property, read from the linked נדלניסט's own record. */
function nadlanist_author_value( $nad_id, $key ) {
	switch ( $key ) {
		case 'name':
			return get_the_title( $nad_id );
		case 'slug':
			// The stripe links to /nadlanist/<slug>; this is the נדלניסט post's own slug.
			return get_post_field( 'post_name', $nad_id );
		case 'avatar':
			// Featured image first, then the seed-image meta the נדלניסט cards already use, so
			// both real uploads and demo-seeded people resolve to a picture.
			$img = get_the_post_thumbnail_url( $nad_id, 'nad_avatar' );
			if ( $img ) {
				return $img;
			}
			$seed = get_post_meta( $nad_id, 'nad_seed_img', true );
			return $seed ?: null;
		case 'specialty':
			// The נדלניסט carries a single role line; it takes the specialty slot so the stripe
			// reads "<role>" rather than an empty "firm · specialty".
			$role = get_field( 'role', $nad_id );
			return ( is_string( $role ) && '' !== trim( $role ) ) ? trim( $role ) : null;
		case 'firm':
			return null;
		case 'bio':
			// The card shows one paragraph. The profile bio is a lines textarea — take its first
			// line; fall back to the personal quote when no bio is filled.
			$bio = get_field( 'bio', $nad_id );
			if ( is_string( $bio ) && '' !== trim( $bio ) ) {
				$first = preg_split( '/\r\n|\r|\n/', trim( $bio ) )[0] ?? '';
				if ( '' !== $first ) {
					return $first;
				}
			}
			$quote = get_field( 'quote', $nad_id );
			return ( is_string( $quote ) && '' !== trim( $quote ) ) ? trim( $quote ) : null;
		case 'linkedin':
		case 'instagram':
			return null; // No socials on the נדלניסט record yet.
	}
	return null;
}

/** Resolve one author property: linked נדלניסט first, then WordPress user, then ACF fallback. */
function author_value( $post_id, $key ) {
	$nad_id = linked_nadlanist( $post_id );
	if ( $nad_id ) {
		return nadlanist_author_value( $nad_id, $key );
	}

	$user_id = (int) get_post_field( 'post_author', $post_id );

	if ( user_profile_is_filled( $user_id ) ) {
		$user = get_userdata( $user_id );
		switch ( $key ) {
			case 'name':
				return $user->display_name;
			case 'bio':
				return $user->description;
			case 'avatar':
				return get_avatar_url( $user_id, array( 'size' => 240 ) );
			// Firm, specialty and socials have no WordPress equivalent. They live in user meta
			// so a member panel can populate them later without another schema change.
			case 'firm':
				return get_user_meta( $user_id, 'nad_firm', true );
			case 'specialty':
				return get_user_meta( $user_id, 'nad_specialty', true );
			case 'linkedin':
				return get_user_meta( $user_id, 'nad_linkedin', true );
			case 'instagram':
				return get_user_meta( $user_id, 'nad_instagram', true );
		}
	}

	if ( ! function_exists( 'get_field' ) ) {
		return null;
	}

	$map = array(
		'name'      => 'author_name',
		'bio'       => 'author_bio',
		'avatar'    => 'author_avatar',
		'firm'      => 'author_firm',
		'specialty' => 'author_specialty',
		'linkedin'  => 'author_linkedin',
		'instagram' => 'author_instagram',
	);
	if ( empty( $map[ $key ] ) ) {
		return null;
	}

	$val = get_field( $map[ $key ], $post_id );

	if ( 'avatar' === $key ) {
		// Serve the square hard-cropped file rather than the original, so an off-square upload
		// still fills the circular frame instead of being squashed by CSS.
		$id = is_array( $val ) ? ( $val['ID'] ?? 0 ) : ( is_numeric( $val ) ? (int) $val : attachment_url_to_postid( (string) $val ) );
		if ( $id ) {
			$sized = wp_get_attachment_image_url( $id, 'nad_avatar' );
			if ( $sized ) {
				return $sized;
			}
		}
		if ( is_array( $val ) ) {
			return $val['url'] ?? null;
		}
	}

	$val = is_string( $val ) ? trim( $val ) : $val;
	return ( is_string( $val ) && '' !== $val ) ? $val : null;
}

/** Count words across the body blocks — the basis for the reading estimate. */
function body_word_count( $post_id ) {
	if ( ! function_exists( 'have_rows' ) ) {
		return 0;
	}
	$text = '';
	if ( have_rows( 'body', $post_id ) ) {
		while ( have_rows( 'body', $post_id ) ) {
			the_row();
			foreach ( array( 'text', 'accent', 'items', 'caption' ) as $f ) {
				$v = get_sub_field( $f );
				if ( is_string( $v ) ) {
					$text .= ' ' . $v;
				}
			}
		}
	}
	// str_word_count is Latin-only and returns 0 for Hebrew; splitting on whitespace is
	// script-agnostic and accurate enough for a reading estimate.
	$words = preg_split( '/\s+/u', trim( wp_strip_all_tags( $text ) ), -1, PREG_SPLIT_NO_EMPTY );
	return is_array( $words ) ? count( $words ) : 0;
}

add_action(
	'graphql_register_types',
	function () {
		if ( ! function_exists( 'register_graphql_field' ) || ! function_exists( 'get_field' ) ) {
			return;
		}

		// One shape for every body block. Fields not relevant to a block's type are null —
		// far simpler for the front end than a union of per-layout types.
		register_graphql_object_type(
			'NadBodyBlock',
			array(
				'description' => __( 'One block of article body content.', 'nadlanistim-headless' ),
				'fields'      => array(
					'type'     => array( 'type' => 'String', 'description' => 'paragraph | heading | list | quote | image' ),
					'text'     => array( 'type' => 'String' ),
					'accent'   => array( 'type' => 'String', 'description' => 'Gradient continuation, headings only.' ),
					'level'    => array( 'type' => 'String', 'description' => 'h2 | h3 | h4, headings only.' ),
					'ordered'  => array( 'type' => 'Boolean', 'description' => 'Numbered rather than bulleted, lists only.' ),
					'items'    => array( 'type' => array( 'list_of' => 'String' ), 'description' => 'List items, lists only.' ),
					'imageUrl' => array( 'type' => 'String' ),
					'caption'  => array( 'type' => 'String' ),
				),
			)
		);

		register_graphql_field(
			'Article',
			'bodyBlocks',
			array(
				'type'        => array( 'list_of' => 'NadBodyBlock' ),
				'description' => __( 'Article body, flattened from ACF Flexible Content.', 'nadlanistim-headless' ),
				'resolve'     => function ( $post ) {
					$id = $post->databaseId ?? 0;
					if ( ! $id || ! function_exists( 'have_rows' ) ) {
						return array();
					}
					$out = array();
					if ( have_rows( 'body', $id ) ) {
						while ( have_rows( 'body', $id ) ) {
							the_row();
							$layout = get_row_layout();
							$block  = array( 'type' => $layout );

							if ( 'list' === $layout ) {
								$raw              = (string) get_sub_field( 'items' );
								$block['items']   = array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', $raw ) ), 'strlen' ) );
								$block['ordered'] = '1' === (string) get_sub_field( 'ordered' );
							} elseif ( 'image' === $layout ) {
								$img              = get_sub_field( 'image' );
								$block['imageUrl'] = is_array( $img ) ? ( $img['url'] ?? null ) : ( is_string( $img ) ? $img : null );
								$block['caption']  = get_sub_field( 'caption' ) ?: null;
							} else {
								$block['text'] = get_sub_field( 'text' ) ?: null;
								if ( 'heading' === $layout ) {
									$block['level']  = get_sub_field( 'level' ) ?: 'h2';
									$block['accent'] = get_sub_field( 'accent' ) ?: null;
								}
							}
							$out[] = $block;
						}
					}
					return $out;
				},
			)
		);

		register_graphql_field(
			'Article',
			'readMinutes',
			array(
				'type'        => 'Int',
				'description' => __( 'Reading estimate: the ACF override if set, else computed from the body.', 'nadlanistim-headless' ),
				'resolve'     => function ( $post ) {
					$id = $post->databaseId ?? 0;
					if ( ! $id ) {
						return null;
					}
					$override = (int) get_field( 'read_minutes', $id );
					if ( $override > 0 ) {
						return $override;
					}
					$words = body_word_count( $id );
					return $words ? max( 1, (int) ceil( $words / READING_WPM ) ) : null;
				},
			)
		);

		register_graphql_field(
			'Article',
			'coverUrl',
			array(
				'type'        => 'String',
				'description' => __( 'Featured image, hard-cropped to the 16:9 cover frame.', 'nadlanistim-headless' ),
				'resolve'     => function ( $post ) {
					$id = $post->databaseId ?? 0;
					return $id ? ( get_the_post_thumbnail_url( $id, 'nad_cover' ) ?: null ) : null;
				},
			)
		);

		foreach ( array( 'name', 'avatar', 'firm', 'specialty', 'bio', 'linkedin', 'instagram', 'slug' ) as $key ) {
			register_graphql_field(
				'Article',
				'author' . ucfirst( $key ),
				array(
					'type'        => 'String',
					'description' => __( 'Author detail: the linked נדלניסט if set, else the WordPress user profile, else the article override. authorSlug links the stripe to /nadlanist/<slug> and is null unless a נדלניסט is linked.', 'nadlanistim-headless' ),
					'resolve'     => function ( $post ) use ( $key ) {
						$id = $post->databaseId ?? 0;
						return $id ? author_value( $id, $key ) : null;
					},
				)
			);
		}
	}
);

/**
 * Admin notice if the stack is incomplete — the failure mode otherwise is a schema that is
 * silently missing every custom field, which is slow to diagnose from the front end.
 */
add_action(
	'admin_notices',
	function () {
		$missing = array();
		if ( ! class_exists( '\\WPGraphQL' ) ) {
			$missing[] = 'WPGraphQL';
		}
		// WPGraphQL for ACF changed its bootstrap between major versions, so probe several
		// markers. Checking only the v1 names reported the plugin missing on a working v2
		// install — a false alarm that sends you looking for a problem that is not there.
		if (
			! defined( 'WPGRAPHQL_FOR_ACF_VERSION' )
			&& ! class_exists( '\\WPGraphQL\\Acf\\Acf' )
			&& ! class_exists( '\\WPGraphQL\\ACF\\ACF' )
			&& ! function_exists( 'wpgraphql_acf_init' )
		) {
			$missing[] = 'WPGraphQL for ACF';
		}
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			$missing[] = 'Advanced Custom Fields';
		}
		if ( ! $missing ) {
			return;
		}
		printf(
			'<div class="notice notice-warning"><p><strong>Nadlanistim Headless:</strong> %s</p></div>',
			esc_html( 'inactive plugin(s) required by the front end: ' . implode( ', ', $missing ) )
		);
	}
);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Job status actions — admin publish / unpublish from the front-end single page
 *
 * A real WordPress administrator (the client and us — native WP accounts, no mock) can flip a
 * job between "pending review" and "published" straight from the Vercel single-job page. That
 * page lives on another host and never receives WordPress's auth cookie, so authority travels in
 * a short-lived HMAC token that wp-admin mints into the status-pill link (see the importer's
 * jobs Status column). The token means "an admin, authenticated in wp-admin, authorised actions
 * on this job" — it is the interim bridge until the login module issues real per-user JWTs, at
 * which point the same routes swap the token check for a JWT role check and nothing else moves.
 *
 * The Next.js server calls these routes server-side (never the browser), so CORS does not apply.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Shared secret for signing job-action tokens. Self-generating, stored, stable. */
function action_secret() {
	$s = get_option( 'nad_action_secret' );
	if ( ! $s ) {
		$s = wp_generate_password( 64, true, true );
		update_option( 'nad_action_secret', $s, false );
	}
	return $s;
}

/** Mint a token authorising status actions on one job, valid for 12h. */
function admin_action_token( $post_id ) {
	$post_id = (int) $post_id;
	$exp     = time() + 12 * HOUR_IN_SECONDS;
	$sig     = hash_hmac( 'sha256', $post_id . '.' . $exp, action_secret() );
	$raw     = $post_id . '.' . $exp . '.' . $sig;
	return rtrim( strtr( base64_encode( $raw ), '+/', '-_' ), '=' );
}

/**
 * Validate a token and return the job ID it authorises, or 0 if invalid/expired.
 *
 * The token carries the post ID, so the job is resolved from the token itself — never from the
 * slug. That sidesteps every Hebrew-slug encoding pitfall (a slug round-trips differently through
 * a URL path than through a JSON body), and means the token both identifies AND authorises.
 */
function token_post_id( $token ) {
	$raw = base64_decode( strtr( (string) $token, '-_', '+/' ) );
	if ( ! $raw || substr_count( $raw, '.' ) < 2 ) {
		return 0;
	}
	list( $id, $exp, $sig ) = explode( '.', $raw, 3 );
	if ( (int) $exp < time() ) {
		return 0;
	}
	$expected = hash_hmac( 'sha256', (int) $id . '.' . $exp, action_secret() );
	return hash_equals( $expected, (string) $sig ) ? (int) $id : 0;
}

/** The nad_job the token authorises, regardless of status, or null. */
function job_from_token( $token ) {
	$id = token_post_id( $token );
	if ( ! $id ) {
		return null;
	}
	$post = get_post( $id );
	return ( $post && 'nad_job' === $post->post_type ) ? $post : null;
}

/** Build the single-job JSON in the same shape WPGraphQL returns, so the front end reuses one mapper. */
function job_payload( $post ) {
	$id    = $post->ID;
	$thumb = get_the_post_thumbnail_url( $id, 'large' );
	$img   = $thumb ? $thumb : get_post_meta( $id, 'nad_seed_img', true );
	$get   = function ( $name ) use ( $id ) {
		if ( function_exists( 'get_field' ) ) {
			return (string) get_field( $name, $id );
		}
		return (string) get_post_meta( $id, $name, true );
	};
	return array(
		'slug'      => $post->post_name,
		'title'     => get_the_title( $id ),
		'date'      => get_post_time( 'c', true, $id ),
		'imageUrl'  => $img ? $img : null,
		'status'    => $post->post_status,
		'jobFields' => array(
			'publisher'    => $get( 'publisher' ),
			'company'      => $get( 'company' ),
			'location'     => $get( 'location' ),
			'employment'   => $get( 'employment' ),
			'field'        => $get( 'field' ),
			'description'  => $get( 'description' ),
			'requirements' => $get( 'requirements' ),
			'tags'         => $get( 'tags' ),
			'contactEmail' => $get( 'contact_email' ),
			'contactPhone' => $get( 'contact_phone' ),
		),
	);
}

add_action(
	'rest_api_init',
	function () {
		// Membership application (/join). Creates a PENDING WordPress subscriber user (the member),
		// with the application details as user meta, flagged nad_pending so the admin approves it in
		// Users before it becomes an active login. Public (a join form), with basic validation +
		// email de-dupe; there is no instant login — the join form has no password field.
		register_rest_route(
			'nadlanistim/v1',
			'/join-apply',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$email = sanitize_email( (string) $req->get_param( 'email' ) );
					$name  = trim( sanitize_text_field( (string) $req->get_param( 'name' ) ) );
					if ( ! $email || ! is_email( $email ) || '' === $name ) {
						return new \WP_Error( 'bad_request', 'שם ואימייל תקין הם שדות חובה.', array( 'status' => 400 ) );
					}
					if ( email_exists( $email ) ) {
						return new \WP_Error( 'exists', 'כתובת האימייל כבר רשומה במערכת.', array( 'status' => 409 ) );
					}
					$base = sanitize_user( current( explode( '@', $email ) ), true );
					$login = $base ? $base : 'member';
					$i = 1;
					while ( username_exists( $login ) ) {
						$login = $base . $i;
						$i++;
					}
					$uid = wp_insert_user( array(
						'user_login'   => $login,
						'user_email'   => $email,
						'user_pass'    => wp_generate_password( 24, true, true ),
						'display_name' => $name,
						'first_name'   => $name,
						'role'         => 'subscriber',
					) );
					if ( is_wp_error( $uid ) ) {
						return new \WP_Error( 'failed', 'ההרשמה נכשלה. נסו שוב.', array( 'status' => 500 ) );
					}
					update_user_meta( $uid, 'nad_pending', 1 );
					update_user_meta( $uid, 'nad_phone', sanitize_text_field( (string) $req->get_param( 'phone' ) ) );
					update_user_meta( $uid, 'nad_field', sanitize_text_field( (string) $req->get_param( 'field' ) ) );
					update_user_meta( $uid, 'nad_track', sanitize_text_field( (string) $req->get_param( 'track' ) ) );
					update_user_meta( $uid, 'nad_about', sanitize_textarea_field( (string) $req->get_param( 'about' ) ) );
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		// Contact form (/contact) — emails the message to the site admin via wp_mail (delivered by
		// FluentSMTP). Nothing is stored; the client asked for contact forms to be emailed, not saved.
		register_rest_route(
			'nadlanistim/v1',
			'/contact',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					// Honeypot: bots fill a hidden field humans never see — drop silently as "sent".
					if ( '' !== trim( (string) $req->get_param( 'company' ) ) ) {
						return rest_ensure_response( array( 'ok' => true ) );
					}
					$name    = trim( sanitize_text_field( (string) $req->get_param( 'name' ) ) );
					$email   = sanitize_email( (string) $req->get_param( 'email' ) );
					$message = trim( sanitize_textarea_field( (string) $req->get_param( 'message' ) ) );
					if ( '' === $name || ! $email || ! is_email( $email ) || '' === $message ) {
						return new \WP_Error( 'bad_request', 'נא למלא שם, אימייל תקין והודעה.', array( 'status' => 400 ) );
					}
					$to      = get_option( 'admin_email' );
					$subject = 'פנייה חדשה מהאתר — ' . $name;
					$body    = "שם: {$name}\nאימייל: {$email}\n\nהודעה:\n{$message}";
					// Force UTF-8 so the Hebrew subject + body arrive readable (otherwise the mailer
					// downgrades the charset and Hebrew shows as "?????"). The Content-Type header sets
					// PHPMailer's CharSet (used for both subject and body); the filter is a belt-and-
					// suspenders for transports (e.g. FluentSMTP) that ignore the header.
					$headers    = array(
						'Content-Type: text/plain; charset=UTF-8',
						'Reply-To: ' . $name . ' <' . $email . '>',
					);
					$force_utf8 = function () {
						return 'UTF-8';
					};
					add_filter( 'wp_mail_charset', $force_utf8 );
					$sent = wp_mail( $to, $subject, $body, $headers );
					remove_filter( 'wp_mail_charset', $force_utf8 );
					if ( ! $sent ) {
						return new \WP_Error( 'failed', 'שליחת ההודעה נכשלה. נסו שוב.', array( 'status' => 500 ) );
					}
					return rest_ensure_response( array( 'ok' => true ) );
				},
			)
		);

		// Admin preview fetch — returns a single job (any status, incl. pending) for a valid token.
		register_rest_route(
			'nadlanistim/v1',
			'/job',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$post = job_from_token( $req->get_param( 'token' ) );
					if ( ! $post ) {
						return new \WP_Error( 'forbidden', 'Invalid or expired token', array( 'status' => 403 ) );
					}
					return rest_ensure_response( job_payload( $post ) );
				},
			)
		);

		// Flip a job between published and pending review. publish|unpublish; unpublish → pending.
		register_rest_route(
			'nadlanistim/v1',
			'/job-status',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$post = job_from_token( $req->get_param( 'token' ) );
					if ( ! $post ) {
						return new \WP_Error( 'forbidden', 'Invalid or expired token', array( 'status' => 403 ) );
					}
					$new = ( 'publish' === $req->get_param( 'action' ) ) ? 'publish' : 'pending';
					// WordPress clears a pending/draft post's slug and regenerates it from the
					// (Hebrew) title on republish. Remember the slug before unpublishing, then
					// restore it on publish, so a clean English slug survives the publish ⇄
					// unpublish cycle.
					if ( $post->post_name ) {
						update_post_meta( $post->ID, '_nad_slug', $post->post_name );
					}
					wp_update_post( array( 'ID' => $post->ID, 'post_status' => $new ) );
					if ( 'publish' === $new ) {
						$saved = get_post_meta( $post->ID, '_nad_slug', true );
						if ( $saved ) {
							wp_update_post( array( 'ID' => $post->ID, 'post_name' => $saved ) );
						}
					}
					return rest_ensure_response( array( 'slug' => get_post_field( 'post_name', $post->ID ), 'status' => $new ) );
				},
			)
		);

		// Nadlanist (member profile) — admin preview fetch + publish/unpublish, mirror of the above.
		register_rest_route(
			'nadlanistim/v1',
			'/nadlanist',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$post = nadlanist_from_token( $req->get_param( 'token' ) );
					if ( ! $post ) {
						return new \WP_Error( 'forbidden', 'Invalid or expired token', array( 'status' => 403 ) );
					}
					return rest_ensure_response( nadlanist_payload( $post ) );
				},
			)
		);
		register_rest_route(
			'nadlanistim/v1',
			'/nadlanist-status',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$post = nadlanist_from_token( $req->get_param( 'token' ) );
					if ( ! $post ) {
						return new \WP_Error( 'forbidden', 'Invalid or expired token', array( 'status' => 403 ) );
					}
					$new = ( 'publish' === $req->get_param( 'action' ) ) ? 'publish' : 'pending';
					// WordPress clears a pending/draft post's slug and regenerates it from the
					// (Hebrew) title on republish. Remember the slug before unpublishing, then
					// restore it on publish, so a clean English slug survives the publish ⇄
					// unpublish cycle.
					if ( $post->post_name ) {
						update_post_meta( $post->ID, '_nad_slug', $post->post_name );
					}
					wp_update_post( array( 'ID' => $post->ID, 'post_status' => $new ) );
					if ( 'publish' === $new ) {
						$saved = get_post_meta( $post->ID, '_nad_slug', true );
						if ( $saved ) {
							wp_update_post( array( 'ID' => $post->ID, 'post_name' => $saved ) );
						}
					}
					return rest_ensure_response( array( 'slug' => get_post_field( 'post_name', $post->ID ), 'status' => $new ) );
				},
			)
		);
	}
);

/**
 * Create or update a nadlanist profile from the front-end join/edit form. A valid token (from
 * wp-admin Edit) updates that profile; without one it creates a new one. Always saved as PENDING
 * (needs admin approval). The photo arrives as a base64 data URL and is stored in the media library
 * + set as the featured image (which the imageUrl resolver then prefers over the seed image). The
 * public create is intentional (a join form) — it only ever produces pending posts an admin approves.
 */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'nadlanistim/v1',
			'/nadlanist-save',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$post = nadlanist_from_token( $req->get_param( 'token' ) );
					$name = sanitize_text_field( (string) $req->get_param( 'name' ) );
					if ( '' === $name ) {
						return new \WP_Error( 'bad_request', 'שם חסר', array( 'status' => 400 ) );
					}
					$arr = array(
						'post_type'   => 'nad_nadlanist',
						'post_status' => 'pending',
						'post_title'  => $name,
					);
					if ( $post ) {
						$arr['ID'] = $post->ID;
						if ( $post->post_name ) {
							update_post_meta( $post->ID, '_nad_slug', $post->post_name );
						}
						$id = wp_update_post( $arr, true );
					} else {
						$id = wp_insert_post( $arr, true );
					}
					if ( is_wp_error( $id ) || ! $id ) {
						return new \WP_Error( 'save_failed', 'שמירה נכשלה', array( 'status' => 500 ) );
					}

					if ( function_exists( 'update_field' ) ) {
						update_field( 'role', sanitize_text_field( (string) $req->get_param( 'role' ) ), $id );
						update_field( 'field', sanitize_text_field( (string) $req->get_param( 'field' ) ), $id );
						update_field( 'place', sanitize_text_field( (string) $req->get_param( 'area' ) ), $id );
						update_field( 'quote', sanitize_textarea_field( (string) $req->get_param( 'quote' ) ), $id );
						update_field( 'bio', sanitize_textarea_field( (string) $req->get_param( 'bio' ) ), $id );
						update_field( 'email', sanitize_email( (string) $req->get_param( 'email' ) ), $id );
					}

					$photo = (string) $req->get_param( 'photo' );
					if ( $photo && preg_match( '#^data:image/(\w+);base64,#', $photo, $m ) ) {
						$data = base64_decode( substr( $photo, strpos( $photo, ',' ) + 1 ) );
						if ( $data ) {
							require_once ABSPATH . 'wp-admin/includes/file.php';
							require_once ABSPATH . 'wp-admin/includes/media.php';
							require_once ABSPATH . 'wp-admin/includes/image.php';
							$ext    = ( 'jpeg' === $m[1] ) ? 'jpg' : $m[1];
							$upload = wp_upload_bits( 'nadlanist-' . $id . '-' . time() . '.' . $ext, null, $data );
							if ( empty( $upload['error'] ) ) {
								$filetype = wp_check_filetype( $upload['file'] );
								$att_id   = wp_insert_attachment(
									array(
										'post_mime_type' => $filetype['type'],
										'post_title'     => $name,
										'post_status'    => 'inherit',
									),
									$upload['file'],
									$id
								);
								if ( ! is_wp_error( $att_id ) ) {
									wp_update_attachment_metadata( $att_id, wp_generate_attachment_metadata( $att_id, $upload['file'] ) );
									set_post_thumbnail( $id, $att_id );
								}
							}
						}
					}

					return rest_ensure_response( array( 'id' => $id, 'slug' => get_post_field( 'post_name', $id ), 'status' => 'pending' ) );
				},
			)
		);
	}
);

/**
 * Create/update a job (nad_job) and a collaboration (nad_collab) from their front-end forms —
 * same pattern as /nadlanist-save. Token → update the existing post; no token → create. Always
 * PENDING (admin approves). Select fields arrive as Hebrew labels and are mapped back to their
 * stored ACF values.
 */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'nadlanistim/v1',
			'/job-save',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$post  = job_from_token( $req->get_param( 'token' ) );
					$title = sanitize_text_field( (string) $req->get_param( 'title' ) );
					if ( '' === $title ) {
						return new \WP_Error( 'bad_request', 'כותרת חסרה', array( 'status' => 400 ) );
					}
					$arr = array( 'post_type' => 'nad_job', 'post_status' => 'pending', 'post_title' => $title );
					if ( $post ) {
						$arr['ID'] = $post->ID;
						if ( $post->post_name ) {
							update_post_meta( $post->ID, '_nad_slug', $post->post_name );
						}
						$id = wp_update_post( $arr, true );
					} else {
						$id = wp_insert_post( $arr, true );
					}
					if ( is_wp_error( $id ) || ! $id ) {
						return new \WP_Error( 'save_failed', 'שמירה נכשלה', array( 'status' => 500 ) );
					}
					if ( function_exists( 'update_field' ) ) {
						$emp_map = array( 'משרה מלאה' => 'full', 'משרה חלקית' => 'part', 'פרילנס' => 'freelance', 'התנדבות' => 'volunteering', 'שותפות' => 'partnership' );
						$type    = (string) $req->get_param( 'type' );
						$name    = sanitize_text_field( (string) $req->get_param( 'name' ) );
						update_field( 'publisher', $name, $id );
						update_field( 'company', $name, $id );
						update_field( 'employment', isset( $emp_map[ $type ] ) ? $emp_map[ $type ] : $type, $id );
						update_field( 'location', sanitize_text_field( (string) $req->get_param( 'area' ) ), $id );
						update_field( 'field', sanitize_text_field( (string) $req->get_param( 'field' ) ), $id );
						update_field( 'description', sanitize_textarea_field( (string) $req->get_param( 'desc' ) ), $id );
						update_field( 'requirements', sanitize_textarea_field( (string) $req->get_param( 'req' ) ), $id );
						$tags = preg_split( '/\s*,\s*|\r\n|\r|\n/', (string) $req->get_param( 'tags' ) );
						update_field( 'tags', implode( "\n", array_filter( array_map( 'trim', $tags ) ) ), $id );
						update_field( 'contact_email', sanitize_email( (string) $req->get_param( 'email' ) ), $id );
						update_field( 'contact_phone', sanitize_text_field( (string) $req->get_param( 'phone' ) ), $id );
					}
					return rest_ensure_response( array( 'id' => $id, 'slug' => get_post_field( 'post_name', $id ), 'status' => 'pending' ) );
				},
			)
		);

		register_rest_route(
			'nadlanistim/v1',
			'/collab-save',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$post  = collab_from_token( $req->get_param( 'token' ) );
					$title = sanitize_text_field( (string) $req->get_param( 'title' ) );
					if ( '' === $title ) {
						return new \WP_Error( 'bad_request', 'כותרת חסרה', array( 'status' => 400 ) );
					}
					$arr = array( 'post_type' => 'nad_collab', 'post_status' => 'pending', 'post_title' => $title );
					if ( $post ) {
						$arr['ID'] = $post->ID;
						if ( $post->post_name ) {
							update_post_meta( $post->ID, '_nad_slug', $post->post_name );
						}
						$id = wp_update_post( $arr, true );
					} else {
						$id = wp_insert_post( $arr, true );
					}
					if ( is_wp_error( $id ) || ! $id ) {
						return new \WP_Error( 'save_failed', 'שמירה נכשלה', array( 'status' => 500 ) );
					}
					if ( function_exists( 'update_field' ) ) {
						$look_map  = array( 'שותף פיננסי' => 'financial', 'שותף מקצועי' => 'profession', 'קבלן' => 'contractor', 'יועץ' => 'proptech' );
						$inv_map   = array( 'עד 100K' => '100k', 'עד 500K' => '500k', 'מיליון+' => '1m', 'ללא השקעה כספית' => 'none' );
						$stage_map = array( 'רעיון' => 'idea', 'תכנון' => 'permits', 'ביצוע' => 'exec', 'מתקדם' => 'advanced' );
						$role      = (string) $req->get_param( 'role' );
						$inv       = (string) $req->get_param( 'invest' );
						$stg       = (string) $req->get_param( 'stage' );
						update_field( 'looking', isset( $look_map[ $role ] ) ? $look_map[ $role ] : $role, $id );
						update_field( 'invest', isset( $inv_map[ $inv ] ) ? $inv_map[ $inv ] : $inv, $id );
						update_field( 'stage', isset( $stage_map[ $stg ] ) ? $stage_map[ $stg ] : $stg, $id );
						update_field( 'type', sanitize_text_field( (string) $req->get_param( 'type' ) ), $id );
						update_field( 'place', sanitize_text_field( (string) $req->get_param( 'area' ) ), $id );
						update_field( 'by', sanitize_text_field( (string) $req->get_param( 'name' ) ), $id );
						update_field( 'description', sanitize_textarea_field( (string) $req->get_param( 'desc' ) ), $id );
						update_field( 'email', sanitize_email( (string) $req->get_param( 'email' ) ), $id );
						update_field( 'phone', sanitize_text_field( (string) $req->get_param( 'phone' ) ), $id );
						update_field( 'board_tab', 'looking', $id );
					}
					$photo = (string) $req->get_param( 'photo' );
					if ( $photo && preg_match( '#^data:image/(\w+);base64,#', $photo, $m ) ) {
						$data = base64_decode( substr( $photo, strpos( $photo, ',' ) + 1 ) );
						if ( $data ) {
							require_once ABSPATH . 'wp-admin/includes/file.php';
							require_once ABSPATH . 'wp-admin/includes/media.php';
							require_once ABSPATH . 'wp-admin/includes/image.php';
							$ext    = ( 'jpeg' === $m[1] ) ? 'jpg' : $m[1];
							$upload = wp_upload_bits( 'collab-' . $id . '-' . time() . '.' . $ext, null, $data );
							if ( empty( $upload['error'] ) ) {
								$att_id = wp_insert_attachment( array( 'post_mime_type' => wp_check_filetype( $upload['file'] )['type'], 'post_title' => $title, 'post_status' => 'inherit' ), $upload['file'], $id );
								if ( ! is_wp_error( $att_id ) ) {
									wp_update_attachment_metadata( $att_id, wp_generate_attachment_metadata( $att_id, $upload['file'] ) );
									set_post_thumbnail( $id, $att_id );
								}
							}
						}
					}
					return rest_ensure_response( array( 'id' => $id, 'slug' => get_post_field( 'post_name', $id ), 'status' => 'pending' ) );
				},
			)
		);
	}
);

/** The nad_nadlanist a token authorises, regardless of status, or null. */
function nadlanist_from_token( $token ) {
	$id = token_post_id( $token );
	if ( ! $id ) {
		return null;
	}
	$post = get_post( $id );
	return ( $post && 'nad_nadlanist' === $post->post_type ) ? $post : null;
}

/** Single-nadlanist JSON in the same shape WPGraphQL returns, so the front end reuses one mapper. */
function nadlanist_payload( $post ) {
	$id    = $post->ID;
	$thumb = get_the_post_thumbnail_url( $id, 'large' );
	$img   = $thumb ? $thumb : get_post_meta( $id, 'nad_seed_img', true );
	$get   = function ( $name ) use ( $id ) {
		if ( function_exists( 'get_field' ) ) {
			return (string) get_field( $name, $id );
		}
		return (string) get_post_meta( $id, $name, true );
	};
	return array(
		'slug'            => $post->post_name,
		'title'           => get_the_title( $id ),
		'imageUrl'        => $img ? $img : null,
		'status'          => $post->post_status,
		'nadlanistFields' => array(
			'role'  => $get( 'role' ),
			'field' => $get( 'field' ),
			'place' => $get( 'place' ),
			'quote' => $get( 'quote' ),
			'bio'   => $get( 'bio' ),
			'email' => $get( 'email' ),
		),
	);
}

/** The nad_collab a token authorises, regardless of status, or null. */
function collab_from_token( $token ) {
	$id = token_post_id( $token );
	if ( ! $id ) {
		return null;
	}
	$post = get_post( $id );
	return ( $post && 'nad_collab' === $post->post_type ) ? $post : null;
}

/** Single-collaboration JSON in the same shape WPGraphQL returns, so the front end reuses one mapper. */
function collab_payload( $post ) {
	$id    = $post->ID;
	$thumb = get_the_post_thumbnail_url( $id, 'large' );
	$img   = $thumb ? $thumb : get_post_meta( $id, 'nad_seed_img', true );
	$get   = function ( $name ) use ( $id ) {
		if ( function_exists( 'get_field' ) ) {
			return (string) get_field( $name, $id );
		}
		return (string) get_post_meta( $id, $name, true );
	};
	return array(
		'slug'         => $post->post_name,
		'title'        => get_the_title( $id ),
		'date'         => get_post_time( 'c', true, $id ),
		'imageUrl'     => $img ? $img : null,
		'status'       => $post->post_status,
		'collabFields' => array(
			'looking'     => $get( 'looking' ),
			'type'        => $get( 'type' ),
			'place'       => $get( 'place' ),
			'invest'      => $get( 'invest' ),
			'stage'       => $get( 'stage' ),
			'by'          => $get( 'by' ),
			'byRole'      => $get( 'by_role' ),
			'description' => $get( 'description' ),
			'lookingList' => $get( 'looking_list' ),
			'tags'        => $get( 'tags' ),
			'email'       => $get( 'email' ),
			'phone'       => $get( 'phone' ),
		),
	);
}

add_action(
	'rest_api_init',
	function () {
		// Admin preview fetch — returns a single collaboration (any status) for a valid token.
		register_rest_route(
			'nadlanistim/v1',
			'/collab',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$post = collab_from_token( $req->get_param( 'token' ) );
					if ( ! $post ) {
						return new \WP_Error( 'forbidden', 'Invalid or expired token', array( 'status' => 403 ) );
					}
					return rest_ensure_response( collab_payload( $post ) );
				},
			)
		);

		// Flip a collaboration between published and pending review. publish|unpublish; unpublish → pending.
		register_rest_route(
			'nadlanistim/v1',
			'/collab-status',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => function ( $req ) {
					$post = collab_from_token( $req->get_param( 'token' ) );
					if ( ! $post ) {
						return new \WP_Error( 'forbidden', 'Invalid or expired token', array( 'status' => 403 ) );
					}
					$new = ( 'publish' === $req->get_param( 'action' ) ) ? 'publish' : 'pending';
					// WordPress clears a pending/draft post's slug and regenerates it from the
					// (Hebrew) title on republish. Remember the slug before unpublishing, then
					// restore it on publish, so a clean English slug survives the publish ⇄
					// unpublish cycle.
					if ( $post->post_name ) {
						update_post_meta( $post->ID, '_nad_slug', $post->post_name );
					}
					wp_update_post( array( 'ID' => $post->ID, 'post_status' => $new ) );
					if ( 'publish' === $new ) {
						$saved = get_post_meta( $post->ID, '_nad_slug', true );
						if ( $saved ) {
							wp_update_post( array( 'ID' => $post->ID, 'post_name' => $saved ) );
						}
					}
					return rest_ensure_response( array( 'slug' => get_post_field( 'post_name', $post->ID ), 'status' => $new ) );
				},
			)
		);
	}
);
