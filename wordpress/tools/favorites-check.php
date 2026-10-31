<?php
/**
 * Checks the favorites route end to end on the admin account, and leaves the list as it was:
 *   wp eval-file favorites-check.php
 */

$token = nadlanistim_auth_issue( get_user_by( 'id', 1 ) )['token'];
$call  = function ( $method, array $params = array() ) use ( $token ) {
	$req = new WP_REST_Request( $method, '/nadlanistim/v1/auth/favorites' );
	$req->set_header( 'x-nadlanistim-token', $token );
	foreach ( $params as $k => $v ) {
		$req->set_param( $k, $v );
	}
	$res = rest_do_request( $req );
	return array( $res->get_status(), $res->get_data() );
};
$paths = fn( $data ) => array_column( isset( $data['items'] ) ? $data['items'] : array(), 'path' );
$probe = '/favorites-check-' . time();
// Not assert(): production PHP skips assertions, and the check would always pass.
$ok = fn( $cond, $why ) => $cond || WP_CLI::error( $why );

list( $s, $d ) = $call( 'POST', array( 'path' => $probe, 'title' => 'בדיקה', 'on' => true ) );
$ok( 200 === $s && $probe === $paths( $d )[0], 'add failed: ' . wp_json_encode( $d ) );
list( $s, $d ) = $call( 'GET' );
$ok( in_array( $probe, $paths( $d ), true ), 'not listed after add' );
list( $s, $d ) = $call( 'POST', array( 'path' => $probe, 'on' => false ) );
$ok( 200 === $s && ! in_array( $probe, $paths( $d ), true ), 'remove failed' );
list( $s ) = $call( 'POST', array( 'path' => '//evil.example', 'on' => true ) );
$ok( 400 === $s, 'an outside address was accepted' );

$req = new WP_REST_Request( 'GET', '/nadlanistim/v1/auth/favorites' );
$ok( 401 === rest_do_request( $req )->get_status(), 'answered without a token' );

WP_CLI::success( 'favorites: add, list, remove, outside address refused, no token refused' );
