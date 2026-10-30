<?php
/**
 * Admin tool — Tools → Nadlanistim Data.
 *
 * Two actions:
 *   • Seed demo content — inserts the reference posts into the CPTs (idempotent).
 *   • Import field groups to ACF — writes editable DB copies of the code-registered field
 *     groups so they appear under ACF → Field Groups (handy on the Pro staging site).
 *
 * @package nadlanistim-importer
 */

namespace NadlanistimImporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin {

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
	}

	public static function menu() {
		add_management_page( 'Nadlanistim Data', 'Nadlanistim Data', 'manage_options', 'nadlanistim-data', array( __CLASS__, 'render' ) );
	}

	/**
	 * Import the bundled ACF JSON — field groups, post types and taxonomies — into ACF's DB
	 * so they show as editable objects on the (Pro) staging site. The CPTs already exist via
	 * the guarded PHP registration; this just surfaces them in ACF's UI.
	 *
	 * @return array{groups:int,post_types:int,taxonomies:int}
	 */
	private static function import_acf_json() {
		$dir = NADLANISTIM_IMPORTER_PATH . 'acf/';
		$r   = array( 'groups' => 0, 'post_types' => 0, 'taxonomies' => 0 );

		$read = function ( $file ) use ( $dir ) {
			$path = $dir . $file;
			if ( ! file_exists( $path ) ) {
				return array();
			}
			$data = json_decode( file_get_contents( $path ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			return is_array( $data ) ? $data : array();
		};

		foreach ( $read( 'nadlanistim-all-fields.json' ) as $group ) {
			acf_import_field_group( $group );
			$r['groups']++;
		}

		if ( function_exists( 'acf_import_internal_post_type' ) ) {
			foreach ( $read( 'nadlanistim-all-posttypes.json' ) as $pt ) {
				acf_import_internal_post_type( $pt, 'acf-post-type' );
				$r['post_types']++;
			}
			foreach ( $read( 'nadlanistim-all-taxonomies.json' ) as $tx ) {
				acf_import_internal_post_type( $tx, 'acf-taxonomy' );
				$r['taxonomies']++;
			}
		}
		return $r;
	}

	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$notice = '';

		if ( isset( $_POST['nad_action'] ) && check_admin_referer( 'nad_data' ) ) {
			$action = sanitize_text_field( wp_unslash( $_POST['nad_action'] ) );

			if ( 'seed' === $action ) {
				$counts = Seeder::seed();
				$total  = array_sum( $counts );
				$notice = '<div class="notice notice-success"><p><b>Seeded ' . (int) $total . ' posts.</b> ' .
					esc_html( implode( ' · ', array_map( function ( $k, $v ) { return "$k: $v"; }, array_keys( $counts ), $counts ) ) ) . '</p></div>';
			}

			if ( 'import_fields' === $action ) {
				if ( function_exists( 'acf_import_field_group' ) ) {
					$r = self::import_acf_json();
					$notice = '<div class="notice notice-success"><p><b>Imported from JSON:</b> ' .
						(int) $r['groups'] . ' field groups · ' . (int) $r['post_types'] . ' post types · ' . (int) $r['taxonomies'] . ' taxonomies.</p></div>';
				} else {
					$notice = '<div class="notice notice-error"><p>ACF is not active.</p></div>';
				}
			}
		}

		$acf = function_exists( 'get_field' ) ? 'active' : 'NOT active';
		?>
		<div class="wrap" dir="ltr">
			<h1>Nadlanistim Data</h1>
			<?php echo $notice; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

			<p>ACF: <b><?php echo esc_html( $acf ); ?></b> · Post types &amp; field groups are registered by this plugin automatically.</p>

			<h2>Content model</h2>
			<table class="widefat striped" style="max-width:520px"><thead><tr><th>Post type</th><th>Posts</th></tr></thead><tbody>
			<?php foreach ( array_keys( Post_Types::TYPES ) as $pt ) :
				$count = (int) wp_count_posts( $pt )->publish; ?>
				<tr><td><code><?php echo esc_html( $pt ); ?></code></td><td><b><?php echo esc_html( $count ); ?></b></td></tr>
			<?php endforeach; ?>
			</tbody></table>

			<h2 style="margin-top:28px">Actions</h2>
			<form method="post" style="display:inline-block;margin-inline-end:12px">
				<?php wp_nonce_field( 'nad_data' ); ?>
				<input type="hidden" name="nad_action" value="seed">
				<button class="button button-primary button-hero" type="submit">▶ Seed demo content</button>
				<p class="description">Inserts the reference posts (idempotent — re-running updates the same items).</p>
			</form>

			<form method="post" style="display:inline-block">
				<?php wp_nonce_field( 'nad_data' ); ?>
				<input type="hidden" name="nad_action" value="import_fields">
				<button class="button button-hero" type="submit">⤓ Import ACF structures</button>
				<p class="description">Imports the bundled JSON (field groups + post types + taxonomies) into ACF as editable objects (optional — CPTs already work via code).</p>
			</form>
		</div>
		<?php
	}
}
