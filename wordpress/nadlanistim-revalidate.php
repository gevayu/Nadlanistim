<?php
/**
 * Plugin Name: Nadlanistim Revalidate
 * Description: Tells the Next.js site to drop its cached WordPress content whenever a nad_* post is saved, trashed or deleted.
 *
 * Lives in wp-content/mu-plugins on nadlanistim-cms.bold-move.co.il. Source of truth: wordpress/ in the site repo.
 * Needs NADLANISTIM_REVALIDATE_SECRET in wp-config (same value as REVALIDATE_SECRET on Vercel).
 * The site address comes from the "הגדרות אתר" option via the Nadlanistim Headless plugin.
 */

function nadlanistim_revalidate_frontend( $post_id ) {
	$type = get_post_type( $post_id );
	if ( ! $type || 0 !== strpos( $type, 'nad_' ) || wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}
	if ( ! defined( 'NADLANISTIM_REVALIDATE_SECRET' ) || ! function_exists( 'NadlanistimHeadless\frontend_url' ) ) {
		return;
	}
	$front = \NadlanistimHeadless\frontend_url();
	if ( ! $front ) {
		return;
	}
	// Fire and forget: the editor should not wait on the site.
	wp_remote_post(
		$front . '/api/revalidate',
		array(
			'headers'  => array( 'x-revalidate-secret' => NADLANISTIM_REVALIDATE_SECRET ),
			'timeout'  => 3,
			'blocking' => false,
		)
	);
}

// Priority 20: after ACF has written the post's fields.
add_action( 'save_post', 'nadlanistim_revalidate_frontend', 20 );
// Before, not after: once the post is gone its type can no longer be read.
add_action( 'before_delete_post', 'nadlanistim_revalidate_frontend' );
