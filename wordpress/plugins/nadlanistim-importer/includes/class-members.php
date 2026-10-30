<?php
/**
 * Member approval — the wp-admin side of the /join application flow.
 *
 * The front-end /join form posts to the headless /join-apply endpoint, which creates a WordPress
 * subscriber flagged `nad_pending` (with the application details as user meta). This class is where
 * an admin reviews and acts on those applications, in the native Users screen where members already
 * live: a "חברות" (Membership) column, a "ממתינים לאישור" filter view, and Approve / Reject row
 * actions.
 *
 * Approve → clears the pending flag and sends the member WordPress's own "set your password" email
 * (the join form has no password field, so the account has only a random password until then; the
 * link lets them choose one and log in — the JWT gate reads real WP credentials). Reject → deletes
 * the pending user. Admins only (the Users screen requires `list_users`; the actions re-check
 * `edit_users` + a nonce).
 *
 * @package nadlanistim-importer
 */

namespace NadlanistimImporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Members {

	const META = 'nad_pending';

	public static function init() {
		add_filter( 'manage_users_columns', array( __CLASS__, 'column' ) );
		add_filter( 'manage_users_custom_column', array( __CLASS__, 'column_content' ), 10, 3 );
		add_filter( 'user_row_actions', array( __CLASS__, 'row_actions' ), 10, 2 );
		add_filter( 'views_users', array( __CLASS__, 'pending_view' ) );
		add_action( 'pre_get_users', array( __CLASS__, 'filter_pending' ) );
		add_action( 'admin_action_nad_approve_member', array( __CLASS__, 'handle_approve' ) );
		add_action( 'admin_action_nad_reject_member', array( __CLASS__, 'handle_reject' ) );
		add_action( 'admin_notices', array( __CLASS__, 'notices' ) );
		add_action( 'admin_head-users.php', array( __CLASS__, 'css' ) );
	}

	/** True for a subscriber still awaiting approval. */
	private static function is_pending( $user_id ) {
		return (bool) get_user_meta( $user_id, self::META, true );
	}

	/** How many applications are waiting — drives the "ממתינים לאישור (N)" filter view. */
	private static function pending_count() {
		$q = new \WP_User_Query( array(
			'meta_key'    => self::META, // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => '1',        // phpcs:ignore WordPress.DB.SlowDBQuery
			'fields'      => 'ID',
			'number'      => 200,
		) );
		return count( $q->get_results() );
	}

	public static function column( $cols ) {
		$cols['nad_membership'] = 'חברות';
		return $cols;
	}

	public static function column_content( $out, $column, $user_id ) {
		if ( 'nad_membership' !== $column ) {
			return $out;
		}
		if ( self::is_pending( $user_id ) ) {
			$field = get_user_meta( $user_id, 'nad_field', true );
			$track = get_user_meta( $user_id, 'nad_track', true );
			$phone = get_user_meta( $user_id, 'nad_phone', true );
			$meta  = array_filter( array( $field, $track, $phone ) );
			$out   = '<span class="nad-badge nad-badge--pending">ממתין לאישור</span>';
			if ( $meta ) {
				$out .= '<div class="nad-appmeta">' . esc_html( implode( ' · ', $meta ) ) . '</div>';
			}
			return $out;
		}
		// Non-pending subscribers are approved members; other roles are staff — leave them blank.
		$user = get_userdata( $user_id );
		if ( $user && in_array( 'subscriber', (array) $user->roles, true ) ) {
			return '<span class="nad-badge nad-badge--publish">חבר פעיל</span>';
		}
		return $out;
	}

	public static function row_actions( $actions, $user ) {
		if ( ! self::is_pending( $user->ID ) || ! current_user_can( 'edit_users' ) ) {
			return $actions;
		}
		$approve = wp_nonce_url(
			admin_url( 'admin.php?action=nad_approve_member&user=' . $user->ID ),
			'nad_approve_member_' . $user->ID
		);
		$reject = wp_nonce_url(
			admin_url( 'admin.php?action=nad_reject_member&user=' . $user->ID ),
			'nad_reject_member_' . $user->ID
		);
		$fresh = array(
			'nad_approve' => sprintf( '<a href="%s" style="color:#16a34a">✓ אישור חבר</a>', esc_url( $approve ) ),
			'nad_reject'  => sprintf(
				'<a href="%s" class="submitdelete" onclick="return confirm(\'למחוק את הבקשה? הפעולה בלתי הפיכה.\')">✗ דחייה</a>',
				esc_url( $reject )
			),
		);
		// Surface the two membership actions first.
		return $fresh + $actions;
	}

	public static function handle_approve() {
		$user_id = isset( $_GET['user'] ) ? (int) $_GET['user'] : 0;
		if ( ! $user_id || ! current_user_can( 'edit_users' ) ) {
			wp_die( 'לא מורשה.' );
		}
		check_admin_referer( 'nad_approve_member_' . $user_id );
		if ( self::is_pending( $user_id ) ) {
			delete_user_meta( $user_id, self::META );
			// WordPress's own "set your password" email — a reset link the member uses to choose a
			// password and log in (the join form set only a random one). Sent via wp_mail, the same
			// transport the contact form uses.
			wp_new_user_notification( $user_id, null, 'user' );
		}
		wp_safe_redirect( self::redirect_back( 'approved' ) );
		exit;
	}

	public static function handle_reject() {
		$user_id = isset( $_GET['user'] ) ? (int) $_GET['user'] : 0;
		if ( ! $user_id || ! current_user_can( 'delete_users' ) ) {
			wp_die( 'לא מורשה.' );
		}
		check_admin_referer( 'nad_reject_member_' . $user_id );
		$ok = false;
		if ( self::is_pending( $user_id ) ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
			$ok = wp_delete_user( $user_id );
		}
		wp_safe_redirect( self::redirect_back( $ok ? 'rejected' : 'error' ) );
		exit;
	}

	/** Back to the Users list, carrying a one-shot status flag for the notice. */
	private static function redirect_back( $status ) {
		$ref = wp_get_referer();
		$to  = $ref ? $ref : admin_url( 'users.php' );
		return add_query_arg( 'nad_member', $status, remove_query_arg( array( '_wpnonce', 'action', 'user', 'nad_member' ), $to ) );
	}

	public static function notices() {
		if ( empty( $_GET['nad_member'] ) ) {
			return;
		}
		$map = array(
			'approved' => array( 'success', 'החבר אושר. נשלח אליו מייל להגדרת סיסמה.' ),
			'rejected' => array( 'success', 'הבקשה נדחתה והמשתמש נמחק.' ),
			'error'    => array( 'error', 'הפעולה נכשלה.' ),
		);
		$key = sanitize_key( wp_unslash( $_GET['nad_member'] ) );
		if ( isset( $map[ $key ] ) ) {
			printf(
				'<div class="notice notice-%s is-dismissible"><p>%s</p></div>',
				esc_attr( $map[ $key ][0] ),
				esc_html( $map[ $key ][1] )
			);
		}
	}

	/** A "ממתינים לאישור (N)" link alongside All / Administrators / … above the Users table. */
	public static function pending_view( $views ) {
		$count = self::pending_count();
		if ( ! $count ) {
			return $views;
		}
		$current = isset( $_GET['nad_pending'] ) ? ' class="current"' : '';
		$url     = add_query_arg( 'nad_pending', '1', admin_url( 'users.php' ) );
		$views['nad_pending'] = sprintf(
			'<a href="%s"%s>ממתינים לאישור <span class="count">(%d)</span></a>',
			esc_url( $url ),
			$current, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- literal attribute above.
			(int) $count
		);
		return $views;
	}

	/** Restrict the Users list to pending applications when the filter view is active. */
	public static function filter_pending( $query ) {
		if ( ! is_admin() || empty( $_GET['nad_pending'] ) ) {
			return;
		}
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( $screen && 'users' !== $screen->id ) {
			return;
		}
		$query->set( 'meta_key', self::META );
		$query->set( 'meta_value', '1' );
	}

	public static function css() {
		echo '<style>
			.column-nad_membership{width:180px}
			.column-nad_membership .nad-badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;color:#fff}
			.column-nad_membership .nad-badge--pending{background:#d97706}
			.column-nad_membership .nad-badge--publish{background:#16a34a}
			.column-nad_membership .nad-appmeta{margin-top:4px;font-size:12px;color:#646970}
		</style>';
	}
}
