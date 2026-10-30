<?php
/**
 * Plugin Name: Nadlanistim Auth
 * Description: Login and membership for the Next.js site: WordPress users, a signed session token, paid membership read from WooCommerce orders, and members editing their own nadlanist profile.
 *
 * Lives in wp-content/mu-plugins on nadlanistim-cms.bold-move.co.il. Source of truth: wordpress/ in the site repo.
 *
 * Routes (all under /wp-json/nadlanistim/v1/auth/):
 *   POST register  {email, password, name}            -> {token, expires}
 *   POST login     {email, password}                  -> {token, expires}
 *   GET  me        Authorization: Bearer <token>      -> the user, membership and owned nadlanist
 *   POST profile   Authorization: Bearer <token> + profile fields -> {ok, nadlanist}
 *   POST forgot    {email}                            -> {ok: true}, always
 *   GET  verify    ?u=<id>&k=<key>                    -> 302 to the site's /login?verified=1|0 (the link in the sign-up email)
 *
 * A new account proves it owns its email before it gets anything tied to that email (membership from orders
 * billed to it, the nadlanist post that carries it). Accounts made before this plugin count as verified.
 *
 * The site calls these from its server. It sends the visitor's IP in X-Nadlanistim-Client-IP together with
 * X-Nadlanistim-Secret (NADLANISTIM_REVALIDATE_SECRET), so rate limits count visitors, not the site's server.
 */

const NADLANISTIM_AUTH_TTL      = 30 * DAY_IN_SECONDS;
const NADLANISTIM_MEMBERSHIP_CAT = 'membership';

/* ─── Token ─────────────────────────────────────────────────────────────── */

/**
 * The signature covers a slice of the password hash, as WordPress's own auth cookies do,
 * so changing or resetting the password ends every open session.
 */
function nadlanistim_auth_sign( $user_id, $expires, $pass_hash ) {
	return hash_hmac( 'sha256', $user_id . '|' . $expires . '|' . substr( $pass_hash, 8, 4 ), wp_salt( 'auth' ) . 'nadlanistim-auth' );
}

function nadlanistim_auth_issue( WP_User $user ) {
	$expires = time() + NADLANISTIM_AUTH_TTL;
	return array(
		'token'   => $user->ID . '.' . $expires . '.' . nadlanistim_auth_sign( $user->ID, $expires, $user->user_pass ),
		'expires' => $expires,
	);
}

/** The user the request's token belongs to, or null. */
function nadlanistim_auth_user( WP_REST_Request $req ) {
	$header = (string) $req->get_header( 'authorization' );
	$token  = 0 === stripos( $header, 'Bearer ' ) ? trim( substr( $header, 7 ) ) : '';
	// Some servers drop the Authorization header before PHP sees it; the site sends this copy too.
	if ( '' === $token ) {
		$token = trim( (string) $req->get_header( 'x_nadlanistim_token' ) );
	}
	if ( ! preg_match( '/^(\d{1,20})\.(\d{1,12})\.([a-f0-9]{64})$/', $token, $m ) ) {
		return null;
	}
	$expires = (int) $m[2];
	if ( $expires < time() ) {
		return null;
	}
	$user = get_user_by( 'id', (int) $m[1] );
	if ( ! $user ) {
		return null;
	}
	if ( ! hash_equals( nadlanistim_auth_sign( $user->ID, $expires, $user->user_pass ), $m[3] ) ) {
		return null;
	}
	return nadlanistim_auth_blocked( $user ) ? null : $user;
}

/**
 * Why a member may not sign in yet, or null when they may. Two conditions, both needed: the managers
 * approved the application ("✓ אישור חבר" in Users clears nad_pending; nad_status "cancelled" shuts the
 * account) and the membership is paid (a completed order, see nadlanistim_auth_member_until).
 * Staff (anyone who can edit posts) are never blocked.
 */
function nadlanistim_auth_blocked( WP_User $user ) {
	if ( user_can( $user, 'edit_posts' ) ) {
		return null;
	}
	if ( 'cancelled' === get_user_meta( $user->ID, 'nad_status', true ) ) {
		return nadlanistim_auth_error( 'cancelled', 'החשבון הזה אינו פעיל. לפרטים כתבו לנו בעמוד צור קשר.', 403 );
	}
	if ( get_user_meta( $user->ID, 'nad_pending', true ) ) {
		return nadlanistim_auth_error( 'pending', 'הבקשה שלכם ממתינה לאישור מנהלי הקהילה. כשהיא תאושר, נשלח לכם מייל.', 403 );
	}
	if ( nadlanistim_auth_member_until( $user->user_email ) <= time() ) {
		return nadlanistim_auth_error( 'unpaid', 'הכניסה פתוחה לחברים עם חברות בתוקף. אחרי התשלום על החברות אפשר יהיה להיכנס.', 403 );
	}
	return null;
}

/* ─── Email verification ────────────────────────────────────────────────── */

const NADLANISTIM_AUTH_VERIFIED = 'nadlanistim_email_verified';

/** Only accounts made by /auth/register start unverified ("0"); no meta means an older account. */
function nadlanistim_auth_verified( WP_User $user ) {
	return '0' !== get_user_meta( $user->ID, NADLANISTIM_AUTH_VERIFIED, true );
}

/** Bound to the email, so the link dies if the address ever changes. */
function nadlanistim_auth_verify_key( WP_User $user ) {
	return hash_hmac( 'sha256', 'verify|' . $user->ID . '|' . strtolower( $user->user_email ), wp_salt( 'auth' ) . 'nadlanistim-auth' );
}

function nadlanistim_auth_front() {
	return untrailingslashit( (string) get_option( 'options_frontend_url' ) );
}

/** At most one email per 10 minutes per account. */
function nadlanistim_auth_send_verify( WP_User $user ) {
	$key = 'nad_verify_sent_' . $user->ID;
	if ( get_transient( $key ) ) {
		return;
	}
	set_transient( $key, 1, 10 * MINUTE_IN_SECONDS );
	$link = add_query_arg(
		array( 'u' => $user->ID, 'k' => nadlanistim_auth_verify_key( $user ) ),
		rest_url( 'nadlanistim/v1/auth/verify' )
	);
	wp_mail(
		$user->user_email,
		'אישור האימייל באתר הנדלניסטים',
		"שלום {$user->display_name},\n\nכדי להשלים את ההרשמה ולקבל גישה לתוכן החברים, לחצו על הקישור:\n{$link}\n\nלא נרשמתם? אפשר להתעלם מהמייל הזה."
	);
}

// A reset through WordPress's own email also proves the address.
add_action(
	'after_password_reset',
	function ( $user ) {
		update_user_meta( $user->ID, NADLANISTIM_AUTH_VERIFIED, '1' );
	}
);

/* ─── Rate limit ────────────────────────────────────────────────────────── */

function nadlanistim_auth_client_ip( WP_REST_Request $req ) {
	$ip     = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : '';
	$secret = (string) $req->get_header( 'x_nadlanistim_secret' );
	if ( defined( 'NADLANISTIM_REVALIDATE_SECRET' ) && '' !== $secret && hash_equals( (string) NADLANISTIM_REVALIDATE_SECRET, $secret ) ) {
		$forwarded = trim( (string) $req->get_header( 'x_nadlanistim_client_ip' ) );
		if ( filter_var( $forwarded, FILTER_VALIDATE_IP ) ) {
			$ip = $forwarded;
		}
	}
	return $ip;
}

/** Counts one attempt; true once this IP has made more than $max attempts of $action within $window seconds. */
function nadlanistim_auth_limited( WP_REST_Request $req, $action, $max, $window ) {
	$key   = 'nad_rl_' . md5( $action . '|' . nadlanistim_auth_client_ip( $req ) );
	$count = (int) get_transient( $key );
	if ( $count >= $max ) {
		return true;
	}
	// ponytail: the window restarts on each attempt (transients can't keep the first expiry). Stricter, never looser.
	set_transient( $key, $count + 1, $window );
	return false;
}

function nadlanistim_auth_error( $code, $message, $status ) {
	return new WP_Error( $code, $message, array( 'status' => $status ) );
}

function nadlanistim_auth_too_many() {
	return nadlanistim_auth_error( 'too_many', 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.', 429 );
}

/** A request field as a trimmed string, capped so nothing huge reaches the database. */
function nadlanistim_auth_str( WP_REST_Request $req, $key, $max = 200 ) {
	$v = $req->get_param( $key );
	return is_scalar( $v ) ? mb_substr( trim( (string) $v ), 0, $max ) : '';
}

/* ─── Membership ────────────────────────────────────────────────────────── */

/**
 * Unix time the paid membership runs until, 0 if never paid.
 * A completed or processing order billed to $email, holding a product in the "membership" category:
 * SKU ending -monthly lasts 31 days from the order date, -yearly 366 days. The latest end wins.
 */
function nadlanistim_auth_member_until( $email ) {
	if ( ! function_exists( 'wc_get_orders' ) || ! $email ) {
		return 0;
	}
	$orders = wc_get_orders(
		array(
			'billing_email' => $email,
			'status'        => array( 'completed', 'processing' ),
			'date_created'  => '>' . ( time() - 366 * DAY_IN_SECONDS ),
			'limit'         => 50,
		)
	);
	$until = 0;
	foreach ( $orders as $order ) {
		$created = $order->get_date_created();
		if ( ! $created ) {
			continue;
		}
		foreach ( $order->get_items() as $item ) {
			$product = is_callable( array( $item, 'get_product' ) ) ? $item->get_product() : null;
			if ( ! $product ) {
				continue;
			}
			$base = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
			if ( ! has_term( NADLANISTIM_MEMBERSHIP_CAT, 'product_cat', $base ) ) {
				continue;
			}
			$sku  = (string) $product->get_sku();
			$days = '-yearly' === substr( $sku, -7 ) ? 366 : ( '-monthly' === substr( $sku, -8 ) ? 31 : 0 );
			if ( $days ) {
				$until = max( $until, $created->getTimestamp() + $days * DAY_IN_SECONDS );
			}
		}
	}
	return $until;
}

/* ─── Owned nadlanist ───────────────────────────────────────────────────── */

/** The nadlanist post whose ACF email is the user's email: a published one first, else any draft. */
function nadlanistim_auth_owned_post( WP_User $user ) {
	$posts = get_posts(
		array(
			'post_type'        => 'nad_nadlanist',
			'post_status'      => array( 'publish', 'pending', 'draft', 'private', 'future' ),
			'meta_key'         => 'email',
			'meta_value'       => $user->user_email,
			'numberposts'      => 5,
			'orderby'          => 'ID',
			'order'            => 'ASC',
			'suppress_filters' => true,
		)
	);
	foreach ( $posts as $p ) {
		if ( 'publish' === $p->post_status ) {
			return $p;
		}
	}
	return $posts ? $posts[0] : null;
}

function nadlanistim_auth_lines( $s ) {
	return array_values( array_filter( array_map( 'trim', explode( "\n", (string) $s ) ), 'strlen' ) );
}

/** What /my-account edits, as stored now. */
function nadlanistim_auth_post_view( WP_Post $p ) {
	// Raw values (third argument false): ACF formatting would turn textarea line breaks into <br>.
	$raw   = function ( $name ) use ( $p ) {
		return get_field( $name, $p->ID, false );
	};
	$field = $raw( 'field' );
	$slugs = array();
	foreach ( (array) $raw( 'communities' ) as $cid ) {
		$slug = absint( $cid ) ? get_post_field( 'post_name', absint( $cid ) ) : '';
		if ( $slug ) {
			$slugs[] = $slug;
		}
	}
	return array(
		'id'          => $p->ID,
		'slug'        => $p->post_name,
		'status'      => $p->post_status,
		'name'        => $p->post_title,
		'role'        => (string) $raw( 'role' ),
		'field'       => is_array( $field ) ? (string) reset( $field ) : (string) $field,
		'place'       => (string) $raw( 'place' ),
		'quote'       => (string) $raw( 'quote' ),
		'bio'         => nadlanistim_auth_lines( $raw( 'bio' ) ),
		'photo'       => (string) get_the_post_thumbnail_url( $p, 'medium_large' ),
		'linkedin'    => (string) $raw( 'linkedin' ),
		'instagram'   => (string) $raw( 'instagram' ),
		'openToWork'  => (bool) $raw( 'open_to_work' ),
		'communities' => $slugs,
	);
}

/** update_field by name, wrapping the value in an array when the field holds several (multi-select, checkbox). */
function nadlanistim_auth_set( $name, $value, $post_id ) {
	$field = function_exists( 'acf_maybe_get_field' ) ? acf_maybe_get_field( $name, $post_id ) : null;
	if ( is_array( $field ) && ! is_array( $value ) && ( 'checkbox' === $field['type'] || ! empty( $field['multiple'] ) ) ) {
		$value = '' === $value ? array() : array( $value );
	}
	update_field( $name, $value, $post_id );
}

/** "https://..." or "", for the social links. */
function nadlanistim_auth_url( $s ) {
	$url = esc_url_raw( $s, array( 'http', 'https' ) );
	return $url && wp_http_validate_url( $url ) ? $url : '';
}

/**
 * A data:image/... URL from /my-account -> attachment id on $post_id, or WP_Error.
 * The browser already shrank it to a 400px JPEG; anything over 3 MB or not a real image is refused.
 */
function nadlanistim_auth_store_photo( $data_url, $post_id ) {
	if ( ! preg_match( '#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=\s]+)$#', $data_url, $m ) ) {
		return nadlanistim_auth_error( 'bad_photo', 'אפשר להעלות תמונה מסוג JPG, PNG או WEBP.', 400 );
	}
	$bin = base64_decode( preg_replace( '/\s+/', '', $m[2] ), true );
	if ( false === $bin || strlen( $bin ) > 3 * MB_IN_BYTES ) {
		return nadlanistim_auth_error( 'bad_photo', 'התמונה גדולה מדי. נסו תמונה קטנה יותר.', 400 );
	}
	$info = @getimagesizefromstring( $bin ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
	$ext  = array( 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp' );
	if ( ! $info || ! isset( $ext[ $info['mime'] ] ) ) {
		return nadlanistim_auth_error( 'bad_photo', 'הקובץ שהועלה אינו תמונה.', 400 );
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$tmp = wp_tempnam( 'nadlanist-photo' );
	if ( ! $tmp || false === file_put_contents( $tmp, $bin ) ) { // phpcs:ignore WordPress.WP.AlternativeFunctions
		return nadlanistim_auth_error( 'upload_failed', 'לא הצלחנו לשמור את התמונה. נסו שוב.', 500 );
	}
	$name = 'nadlanist-' . $post_id . '-' . time() . '.' . $ext[ $info['mime'] ];
	$id   = media_handle_sideload( array( 'name' => $name, 'tmp_name' => $tmp ), $post_id );
	if ( file_exists( $tmp ) ) {
		@unlink( $tmp ); // phpcs:ignore
	}
	return is_wp_error( $id ) ? nadlanistim_auth_error( 'upload_failed', 'לא הצלחנו לשמור את התמונה. נסו שוב.', 500 ) : $id;
}

/* ─── Handlers ──────────────────────────────────────────────────────────── */

function nadlanistim_auth_register( WP_REST_Request $req ) {
	if ( nadlanistim_auth_limited( $req, 'register', 5, HOUR_IN_SECONDS ) ) {
		return nadlanistim_auth_too_many();
	}
	$email    = sanitize_email( nadlanistim_auth_str( $req, 'email', 100 ) );
	$password = is_string( $req->get_param( 'password' ) ) ? (string) $req->get_param( 'password' ) : '';
	$name     = sanitize_text_field( nadlanistim_auth_str( $req, 'name', 100 ) );

	if ( ! is_email( $email ) ) {
		return nadlanistim_auth_error( 'bad_email', 'כתובת האימייל לא תקינה.', 400 );
	}
	if ( '' === $name ) {
		return nadlanistim_auth_error( 'bad_name', 'חסר שם מלא.', 400 );
	}
	if ( strlen( $password ) < 8 || strlen( $password ) > 200 ) {
		return nadlanistim_auth_error( 'bad_password', 'הסיסמה צריכה להיות באורך 8 תווים לפחות.', 400 );
	}
	if ( email_exists( $email ) ) {
		return nadlanistim_auth_error( 'exists', 'כבר יש חשבון עם האימייל הזה. אפשר להתחבר, או לאפס סיסמה אם שכחתם.', 409 );
	}

	$login = sanitize_user( $email, true );
	if ( strlen( $login ) > 60 || username_exists( $login ) ) {
		$login = 'member_' . strtolower( wp_generate_password( 12, false ) );
	}
	$parts   = preg_split( '/\s+/u', $name, 2 );
	$user_id = wp_insert_user(
		array(
			'user_login'   => $login,
			'user_email'   => $email,
			'user_pass'    => $password,
			'display_name' => $name,
			'first_name'   => $parts[0],
			'last_name'    => isset( $parts[1] ) ? $parts[1] : '',
			'role'         => 'subscriber',
		)
	);
	if ( is_wp_error( $user_id ) ) {
		return nadlanistim_auth_error( 'register_failed', 'לא הצלחנו ליצור את החשבון. נסו שוב.', 500 );
	}
	update_user_meta( $user_id, NADLANISTIM_AUTH_VERIFIED, '0' );
	$user = get_user_by( 'id', $user_id );
	nadlanistim_auth_send_verify( $user );
	return rest_ensure_response( nadlanistim_auth_issue( $user ) );
}

function nadlanistim_auth_login( WP_REST_Request $req ) {
	if ( nadlanistim_auth_limited( $req, 'login', 10, 15 * MINUTE_IN_SECONDS ) ) {
		return nadlanistim_auth_too_many();
	}
	$email    = sanitize_email( nadlanistim_auth_str( $req, 'email', 100 ) );
	$password = is_string( $req->get_param( 'password' ) ) ? (string) $req->get_param( 'password' ) : '';
	$user     = ( is_email( $email ) && '' !== $password && strlen( $password ) <= 200 ) ? wp_authenticate( $email, $password ) : null;
	if ( ! $user instanceof WP_User ) {
		return nadlanistim_auth_error( 'bad_login', 'האימייל או הסיסמה לא נכונים.', 401 );
	}
	$blocked = nadlanistim_auth_blocked( $user );
	if ( $blocked ) {
		return $blocked;
	}
	if ( ! nadlanistim_auth_verified( $user ) ) {
		nadlanistim_auth_send_verify( $user );
	}
	return rest_ensure_response( nadlanistim_auth_issue( $user ) );
}

function nadlanistim_auth_me( WP_REST_Request $req ) {
	$user = nadlanistim_auth_user( $req );
	if ( ! $user ) {
		return nadlanistim_auth_error( 'unauthorized', 'צריך להתחבר מחדש.', 401 );
	}
	$verified = nadlanistim_auth_verified( $user );
	$until    = $verified ? nadlanistim_auth_member_until( $user->user_email ) : 0;
	$post     = $verified ? nadlanistim_auth_owned_post( $user ) : null;
	$res   = rest_ensure_response(
		array(
			'id'          => $user->ID,
			'email'       => $user->user_email,
			'name'        => $user->display_name,
			'verified'    => $verified,
			'phone'       => (string) get_user_meta( $user->ID, 'billing_phone', true ),
			'member'      => $until > time(),
			'memberUntil' => $until ? gmdate( 'c', $until ) : null,
			'nadlanist'   => $post ? nadlanistim_auth_post_view( $post ) : null,
		)
	);
	// Personal data: no page cache in front of WordPress may keep it.
	$res->header( 'Cache-Control', 'no-store, private' );
	return $res;
}

function nadlanistim_auth_profile( WP_REST_Request $req ) {
	$user = nadlanistim_auth_user( $req );
	if ( ! $user ) {
		return nadlanistim_auth_error( 'unauthorized', 'צריך להתחבר מחדש.', 401 );
	}
	if ( ! nadlanistim_auth_verified( $user ) ) {
		return nadlanistim_auth_error( 'unverified', 'קודם צריך לאשר את האימייל. שלחנו אליכם קישור.', 403 );
	}
	if ( nadlanistim_auth_limited( $req, 'profile-' . $user->ID, 30, HOUR_IN_SECONDS ) ) {
		return nadlanistim_auth_too_many();
	}

	$name  = sanitize_text_field( nadlanistim_auth_str( $req, 'name', 100 ) );
	$role  = sanitize_text_field( nadlanistim_auth_str( $req, 'role', 150 ) );
	$field = sanitize_text_field( nadlanistim_auth_str( $req, 'field', 60 ) );
	$place = sanitize_text_field( nadlanistim_auth_str( $req, 'place', 60 ) );
	$quote = sanitize_text_field( nadlanistim_auth_str( $req, 'quote', 300 ) );
	$bio   = array();
	foreach ( array_slice( (array) $req->get_param( 'bio' ), 0, 20 ) as $para ) {
		$para = is_scalar( $para ) ? sanitize_text_field( mb_substr( (string) $para, 0, 2000 ) ) : '';
		if ( '' !== $para ) {
			$bio[] = $para;
		}
	}
	if ( '' === $name || '' === $role || '' === $quote || ! $bio ) {
		return nadlanistim_auth_error( 'missing', 'חסרים שם, תפקיד, ציטוט או פסקת פתיחה.', 400 );
	}
	$linkedin  = nadlanistim_auth_url( nadlanistim_auth_str( $req, 'linkedin', 300 ) );
	$instagram = nadlanistim_auth_url( nadlanistim_auth_str( $req, 'instagram', 300 ) );
	$phone     = preg_replace( '/[^0-9+\- ]/', '', nadlanistim_auth_str( $req, 'phone', 30 ) );
	$photo     = nadlanistim_auth_str( $req, 'photo', 4 * MB_IN_BYTES );

	$community_ids = array();
	foreach ( array_slice( (array) $req->get_param( 'communities' ), 0, 50 ) as $slug ) {
		$c = is_string( $slug ) ? get_page_by_path( sanitize_title( $slug ), OBJECT, 'nad_community' ) : null;
		if ( $c && 'publish' === $c->post_status ) {
			$community_ids[] = $c->ID;
		}
	}

	$post    = nadlanistim_auth_owned_post( $user );
	$created = ! $post;
	if ( $created ) {
		// A new profile waits for the site manager: a draft owned by this user.
		$post_id = wp_insert_post(
			array(
				'post_type'   => 'nad_nadlanist',
				'post_status' => 'draft',
				'post_title'  => $name,
				'post_author' => $user->ID,
			),
			true
		);
	} else {
		$post_id = wp_update_post( array( 'ID' => $post->ID, 'post_title' => $name ), true );
	}
	if ( is_wp_error( $post_id ) || ! $post_id ) {
		return nadlanistim_auth_error( 'save_failed', 'לא הצלחנו לשמור. נסו שוב.', 500 );
	}

	if ( 0 === strpos( $photo, 'data:' ) ) {
		$attachment = nadlanistim_auth_store_photo( $photo, $post_id );
		if ( is_wp_error( $attachment ) ) {
			return $attachment;
		}
		set_post_thumbnail( $post_id, $attachment );
	}

	nadlanistim_auth_set( 'role', $role, $post_id );
	nadlanistim_auth_set( 'field', $field, $post_id );
	nadlanistim_auth_set( 'place', $place, $post_id );
	nadlanistim_auth_set( 'quote', $quote, $post_id );
	nadlanistim_auth_set( 'bio', implode( "\n", $bio ), $post_id );
	// Ownership rides on this field, so it is always the account's email, never what the form sent.
	nadlanistim_auth_set( 'email', $user->user_email, $post_id );
	nadlanistim_auth_set( 'linkedin', $linkedin, $post_id );
	nadlanistim_auth_set( 'instagram', $instagram, $post_id );
	nadlanistim_auth_set( 'open_to_work', $req->get_param( 'openToWork' ) ? 1 : 0, $post_id );
	nadlanistim_auth_set( 'communities', $community_ids, $post_id );
	update_user_meta( $user->ID, 'billing_phone', $phone );

	// save_post already pinged the site, but before the fields above were written. Ping again now.
	if ( function_exists( 'nadlanistim_revalidate_send' ) ) {
		nadlanistim_revalidate_send();
	}

	$saved = get_post( $post_id );
	return rest_ensure_response(
		array(
			'ok'        => true,
			'created'   => $created,
			'nadlanist' => array( 'id' => $saved->ID, 'slug' => $saved->post_name, 'status' => $saved->post_status ),
		)
	);
}

function nadlanistim_auth_forgot( WP_REST_Request $req ) {
	$ok = rest_ensure_response( array( 'ok' => true ) );
	if ( nadlanistim_auth_limited( $req, 'forgot', 5, HOUR_IN_SECONDS ) ) {
		return nadlanistim_auth_too_many();
	}
	$email = sanitize_email( nadlanistim_auth_str( $req, 'email', 100 ) );
	if ( is_email( $email ) && email_exists( $email ) ) {
		// WordPress's own reset email and screen. Its result is ignored: the answer never says whether the email exists.
		retrieve_password( $email );
	}
	return $ok;
}

function nadlanistim_auth_verify( WP_REST_Request $req ) {
	$user = get_user_by( 'id', absint( $req['u'] ) );
	$ok   = $user && hash_equals( nadlanistim_auth_verify_key( $user ), (string) $req['k'] );
	if ( $ok ) {
		update_user_meta( $user->ID, NADLANISTIM_AUTH_VERIFIED, '1' );
	}
	$res = new WP_REST_Response( null, 302 );
	$res->header( 'Location', nadlanistim_auth_front() . '/login?verified=' . ( $ok ? '1' : '0' ) );
	return $res;
}

add_action(
	'rest_api_init',
	function () {
		$routes = array(
			'register' => array( 'POST', 'nadlanistim_auth_register' ),
			'login'    => array( 'POST', 'nadlanistim_auth_login' ),
			'me'       => array( 'GET', 'nadlanistim_auth_me' ),
			'profile'  => array( 'POST', 'nadlanistim_auth_profile' ),
			'forgot'   => array( 'POST', 'nadlanistim_auth_forgot' ),
			'verify'   => array( 'GET', 'nadlanistim_auth_verify' ),
		);
		foreach ( $routes as $path => $route ) {
			register_rest_route(
				'nadlanistim/v1',
				'/auth/' . $path,
				array(
					'methods'             => $route[0],
					// Public routes: the token inside the handler is the check.
					'permission_callback' => '__return_true',
					'callback'            => $route[1],
				)
			);
		}
	}
);
