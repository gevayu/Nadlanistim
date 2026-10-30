<?php
/*
Plugin Name: Nadlanistim Importer
Plugin URI:  https://github.com/gevayu/Nadlanistim
Description: Registers the נדלניסטים content model (CPTs, taxonomies, ACF field groups) and
             seeds the reference demo content. Separate from the Nadlanistim Widgets plugin.
             Tools → Nadlanistim Data.
Version:     1.47.0
Author:      Nadlanistim
Text Domain: nadlanistim-importer
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NADLANISTIM_IMPORTER_VERSION', '1.47.0' );
define( 'NADLANISTIM_IMPORTER_FILE', __FILE__ );
define( 'NADLANISTIM_IMPORTER_PATH', plugin_dir_path( __FILE__ ) );
define( 'NADLANISTIM_IMPORTER_URL', plugin_dir_url( __FILE__ ) );

require_once NADLANISTIM_IMPORTER_PATH . 'includes/class-post-types.php';
require_once NADLANISTIM_IMPORTER_PATH . 'includes/class-fields.php';
require_once NADLANISTIM_IMPORTER_PATH . 'includes/class-options.php';
require_once NADLANISTIM_IMPORTER_PATH . 'includes/class-seeder.php';
require_once NADLANISTIM_IMPORTER_PATH . 'includes/class-admin.php';
require_once NADLANISTIM_IMPORTER_PATH . 'includes/class-members.php';

// CPTs/taxonomies register on every load (guarded fallback so content exists with or
// without ACF). Field groups register into ACF's local store when ACF is present.
\NadlanistimImporter\Post_Types::init();
\NadlanistimImporter\Fields::init();
// No-op on free ACF: options pages and repeaters are both Pro-only, and Options::available()
// gates every hook it registers.
\NadlanistimImporter\Options::init();

if ( is_admin() ) {
	\NadlanistimImporter\Admin::init();
	\NadlanistimImporter\Members::init();
}
