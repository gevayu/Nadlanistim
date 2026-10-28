<?php
/**
 * Plugin Name: Nadlanistim Store
 * Description: WooCommerce behind the Next.js site: payment pages stay on WordPress, buyers return to the site's thank-you page.
 *
 * Lives in wp-content/mu-plugins on nadlanistim-cms.bold-move.co.il. Source of truth: wordpress/ in the site repo.
 * The site's /checkout creates the order through the Store API and sends the buyer to iCount; iCount sends them
 * back to the order's return URL, which points at the site's /thank-you.
 */

/** The site's address, read straight from the "הגדרות אתר" option (the ACF value is blanked on store pages below). */
function nadlanistim_store_front() {
	return untrailingslashit( (string) get_option( 'options_frontend_url' ) );
}

// The Nadlanistim Headless plugin sends every front-end visit to the Next.js site, and skips that redirect
// when its front-end URL setting is empty. So on WooCommerce's own pages the setting reads as empty.
add_filter(
	'acf/load_value/name=frontend_url',
	function ( $value ) {
		if ( is_admin() || ! function_exists( 'is_checkout' ) || ! did_action( 'wp' ) ) {
			return $value;
		}
		return ( is_cart() || is_checkout() || is_account_page() ) ? '' : $value;
	}
);

// After payment the buyer lands on the site's thank-you page; the key lets it read the order (see order-summary).
add_filter(
	'woocommerce_get_return_url',
	function ( $url, $order ) {
		$front = nadlanistim_store_front();
		if ( ! $front || ! $order ) {
			return $url;
		}
		return add_query_arg( array( 'order' => $order->get_id(), 'key' => $order->get_order_key() ), $front . '/thank-you' );
	},
	10,
	2
);

// Safety net for any gateway that links WordPress's own "order received" page directly.
add_action(
	'template_redirect',
	function () {
		if ( function_exists( 'is_order_received_page' ) && is_order_received_page() && nadlanistim_store_front() ) {
			$order = wc_get_order( absint( get_query_var( 'order-received' ) ) );
			if ( $order ) {
				wp_safe_redirect( apply_filters( 'woocommerce_get_return_url', '', $order ) );
				exit;
			}
		}
	},
	5
);

// Tickets and membership ship nothing, so a buyer gives name, email and phone only.
add_filter(
	'woocommerce_default_address_fields',
	function ( $fields ) {
		foreach ( array( 'address_1', 'city', 'postcode', 'state' ) as $key ) {
			if ( isset( $fields[ $key ] ) ) {
				$fields[ $key ]['required'] = false;
			}
		}
		return $fields;
	}
);

// GET /wp-json/nadlanistim/v1/order-summary?order=<id>&key=<order key> - what the thank-you page shows.
// The order key is the secret WooCommerce itself uses for guest order links.
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'nadlanistim/v1',
			'/order-summary',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => function ( WP_REST_Request $req ) {
					$order = wc_get_order( absint( $req['order'] ) );
					if ( ! $order || ! hash_equals( $order->get_order_key(), (string) $req['key'] ) ) {
						return new WP_Error( 'not_found', 'Order not found', array( 'status' => 404 ) );
					}
					$items = array();
					foreach ( $order->get_items() as $item ) {
						$items[] = array( 'name' => $item->get_name(), 'qty' => $item->get_quantity(), 'total' => (float) $item->get_total() );
					}
					return array(
						'number'     => $order->get_order_number(),
						'status'     => $order->get_status(),
						'paid'       => $order->is_paid(),
						'total'      => (float) $order->get_total(),
						'first_name' => $order->get_billing_first_name(),
						'email'      => $order->get_billing_email(),
						'items'      => $items,
					);
				},
			)
		);
	}
);
