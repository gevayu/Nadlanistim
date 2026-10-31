<?php
/**
 * Data steps from the plan-A handoff (31.10.2026), safe to run again: each step checks before it writes.
 *   wp eval-file handoff-data.php <commit>
 * <commit> is the repo commit the sample banner images are taken from (wordpress/assets/).
 * Nothing is deleted.
 */

$commit = isset( $args[0] ) ? preg_replace( '/[^a-f0-9]/', '', $args[0] ) : '';

// #62: a marked sample banner in the bottom sponsor strip ("חסות 2: פס תחתון"), desktop and mobile.
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
foreach ( array( 'desktop', 'mobile' ) as $size ) {
	$found = get_posts( array( 'post_type' => 'attachment', 'post_status' => 'inherit', 'meta_key' => '_nad_sample_banner', 'meta_value' => $size, 'fields' => 'ids', 'numberposts' => 1 ) );
	$id    = $found ? (int) $found[0] : 0;
	if ( ! $id ) {
		if ( ! $commit ) {
			WP_CLI::error( 'pass the commit that holds wordpress/assets/' );
		}
		$tmp = download_url( "https://raw.githubusercontent.com/gevayu/Nadlanistim/{$commit}/wordpress/assets/sponsor-sample-{$size}.jpg" );
		if ( is_wp_error( $tmp ) ) {
			WP_CLI::error( $tmp->get_error_message() );
		}
		$id = media_handle_sideload( array( 'name' => "sponsor-sample-{$size}.jpg", 'tmp_name' => $tmp ), 0, 'באנר לדוגמה' );
		if ( is_wp_error( $id ) ) {
			WP_CLI::error( $id->get_error_message() );
		}
		update_post_meta( $id, '_nad_sample_banner', $size );
		update_post_meta( $id, '_wp_attachment_image_alt', 'באנר לדוגמה' );
	}
	// A sub field of the slot's group, stored the way ACF stores it: value and field key under the group's prefix.
	// (update_sub_field() wrote nothing from wp-cli on this site.)
	update_option( 'options_sponsor_strip_events_banner_' . $size, $id );
	update_option( '_options_sponsor_strip_events_banner_' . $size, 'field_nad_sp_events_banner_' . $size );
	WP_CLI::log( "banner {$size}: attachment {$id} " . wp_get_attachment_url( $id ) );
}

// Decision 13: "מרחוק" next to "שרון" in the regions. No post gets it.
$remote = term_exists( 'remote', 'nad_region' );
if ( ! $remote ) {
	$remote = wp_insert_term( 'מרחוק', 'nad_region', array( 'slug' => 'remote' ) );
}
WP_CLI::log( 'region remote: ' . ( is_wp_error( $remote ) ? $remote->get_error_message() : 'term ' . $remote['term_id'] ) );

// Decision 20: the junk listing "כדגכדגכדגד" (job 465) leaves the live site as a draft, kept in WordPress.
$junk = get_post( 465 );
if ( $junk && 'nad_job' === $junk->post_type && 'כדגכדגכדגד' === $junk->post_title && 'publish' === $junk->post_status ) {
	wp_update_post( array( 'ID' => 465, 'post_status' => 'draft' ) );
}
WP_CLI::log( 'job 465: ' . ( $junk ? get_post_status( 465 ) . ' "' . $junk->post_title . '"' : 'not found' ) );

// The site refreshes on a post save; an options write does not. Ask it directly, and wait for the answer.
if ( defined( 'NADLANISTIM_REVALIDATE_SECRET' ) && function_exists( 'NadlanistimHeadless\frontend_url' ) ) {
	$res = wp_remote_post( \NadlanistimHeadless\frontend_url() . '/api/revalidate', array( 'headers' => array( 'x-revalidate-secret' => NADLANISTIM_REVALIDATE_SECRET ), 'timeout' => 15 ) );
	WP_CLI::log( 'revalidate: ' . ( is_wp_error( $res ) ? $res->get_error_message() : wp_remote_retrieve_response_code( $res ) ) );
}
