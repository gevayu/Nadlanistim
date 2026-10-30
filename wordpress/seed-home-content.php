<?php
/**
 * Fills "הגדרות אתר" → "עמוד הבית: תמונות ו"מי אנחנו"" (nadlanistim-fields.php) with what the homepage showed
 * while it was written in code, and copies its 4 Unsplash images into the media library.
 *
 * Fills only empty fields, so a second run never overwrites an editor's change.
 * On the server: wp eval-file seed-home-content.php
 */

if ( ! function_exists( 'update_field' ) ) {
	WP_CLI::error( 'ACF is not active.' );
}
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$text = array(
	'home_about_title'        => "לא פיד.\nלא פורטל.\nקהילה.",
	'home_about_text'         => "הנדלניסטים היא קהילה מקצועית של מעל {מספר חברים} אנשי נדל״ן בישראל - אנשים שמייצרים יחד עסקאות, פרויקטים, ידע והזדמנויות.\nאנחנו לא עוד מקום לקרוא בו תוכן. אנחנו המקום שבו אנשי הנדל״ן הכי טובים בישראל נפגשים, מכירים, ועושים עסקים.",
	'home_about_points'       => "חיבורים ישירים בין אנשי מקצוע\nאירועי נטוורקינג פרימיום\nלמידה ושיתוף ידע ברמה הגבוהה בענף\nהזדמנויות עסקיות שמתחילות בקהילה",
	'home_about_badge_number' => 7,
	'home_about_badge_text'   => "שנים\nשל קהילה",
);

// field => [source, file name in the media library, title]
$images = array(
	'home_hero_image'        => array( 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2400&q=80', 'home-hero.jpg', 'עמוד הבית: הירו' ),
	'home_about_image_large' => array( 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80', 'home-about-large.jpg', 'עמוד הבית: מי אנחנו (גדולה)' ),
	'home_about_image_small' => array( 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=900&q=80', 'home-about-small.jpg', 'עמוד הבית: מי אנחנו (קטנה)' ),
	'home_featured_bg'       => array( 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=2400&q=80', 'home-featured-bg.jpg', 'עמוד הבית: רקע האירוע המרכזי' ),
);

foreach ( $text as $name => $value ) {
	if ( '' !== (string) get_field( $name, 'option', false ) ) {
		WP_CLI::log( "$name: kept" );
		continue;
	}
	update_field( $name, $value, 'option' );
	WP_CLI::log( "$name: filled" );
}

foreach ( $images as $name => list( $url, $file, $title ) ) {
	if ( get_field( $name, 'option', false ) ) {
		WP_CLI::log( "$name: kept" );
		continue;
	}
	// The Unsplash URLs carry no file extension, so the file is downloaded first and named here.
	$tmp = download_url( $url );
	if ( is_wp_error( $tmp ) ) {
		WP_CLI::warning( "$name: " . $tmp->get_error_message() );
		continue;
	}
	$id = media_handle_sideload( array( 'name' => $file, 'tmp_name' => $tmp ), 0, $title );
	if ( is_wp_error( $id ) ) {
		wp_delete_file( $tmp );
		WP_CLI::warning( "$name: " . $id->get_error_message() );
		continue;
	}
	update_field( $name, $id, 'option' );
	WP_CLI::log( "$name: attachment $id" );
}
