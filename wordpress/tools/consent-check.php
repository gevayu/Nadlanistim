<?php
/**
 * Checks the consent records end to end and removes the two records it writes:
 *   wp eval-file consent-check.php
 */

$email = 'consent-check-' . time() . '@example.com';
$ok    = fn( $cond, $why ) => $cond || WP_CLI::error( $why );
$mine  = fn() => get_posts( array( 'post_type' => 'nad_consent', 'post_status' => 'private', 'numberposts' => 5, 'fields' => 'ids', 'meta_key' => 'email', 'meta_value' => $email ) );

$ok( ! nadlanistim_consent_allows_marketing( $email ), 'an unknown address counts as consent' );
nadlanistim_consent_record( $email, 'בדיקה', 'home', '203.0.113.7' );
$ok( nadlanistim_consent_allows_marketing( $email ), 'the home sign-up did not count as newsletter consent' );
$rec = $mine();
$ok( 1 === count( $rec ) && '203.0.113.7' === get_post_meta( $rec[0], 'ip', true ) && false !== strpos( get_post_meta( $rec[0], 'text', true ), 'דיוורים' ), 'the record lacks IP or wording' );

$url = nadlanistim_consent_unsubscribe_url( $email );
parse_str( (string) wp_parse_url( $url, PHP_URL_QUERY ), $q );
$ok( hash_equals( nadlanistim_consent_unsub_key( $email ), $q['k'] ) && ! hash_equals( nadlanistim_consent_unsub_key( 'other@example.com' ), $q['k'] ), 'the unsubscribe link is not tied to its address' );

sleep( 1 ); // the withdrawal must be the newer record
nadlanistim_consent_record( $email, '', 'withdraw', '203.0.113.7' );
$ok( ! nadlanistim_consent_allows_marketing( $email ), 'the withdrawal did not stop newsletters' );

foreach ( $mine() as $id ) {
	wp_delete_post( $id, true );
}
$ok( ! $mine(), 'test records left behind' );
WP_CLI::success( 'consent: record with IP and wording, signed opt-out link, withdrawal wins, test records removed' );
