<?php
/**
 * Site-wide settings — the chrome that is not a post.
 *
 * Navigation, footer, contact details, the marquee, the stat counters and the homepage
 * section headings all live in code today (app/v6/HomeV6.tsx, SiteHeader.tsx, SiteFooter.tsx).
 * None of it is editorial in the post sense, so it has no post type; it belongs on an ACF
 * options page.
 *
 * ACF PRO IS REQUIRED for this file to do anything: acf_add_options_page() and the repeater
 * field type are both Pro-only. Everything here is guarded, so on a free-ACF install the
 * settings screen simply does not appear and the front end keeps its built-in values — the
 * same degradation every other part of the headless build uses. Staging has Pro, so this
 * lights up there.
 *
 * @package nadlanistim-importer
 */

namespace NadlanistimImporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Options {

	/** ACF option page slug; also the GraphQL root field the front end reads. */
	const SLUG = 'nadlanistim-settings';

	public static function init() {
		add_action( 'acf/init', array( __CLASS__, 'register_page' ) );
		add_action( 'acf/init', array( __CLASS__, 'register_fields' ), 20 );
	}

	/** True only on ACF Pro — repeaters and options pages both come from the same package. */
	public static function available() {
		return function_exists( 'acf_add_options_page' ) && function_exists( 'acf_get_field_type' ) && acf_get_field_type( 'repeater' );
	}

	public static function register_page() {
		if ( ! self::available() ) {
			return;
		}
		acf_add_options_page(
			array(
				'page_title'      => 'הגדרות אתר',
				'menu_title'      => 'הגדרות אתר',
				'menu_slug'       => self::SLUG,
				'capability'      => 'edit_posts',
				'position'        => 59,
				'icon_url'        => 'dashicons-admin-settings',
				'redirect'        => false,
				// Exposes the whole page as a single root field in GraphQL.
				'show_in_graphql' => true,
				'graphql_field_name' => 'siteSettings',
			)
		);
	}

	/** Repeater rows are plain sub-field arrays; this keeps the nesting readable below. */
	private static function repeater( $key, $name, $label, $instructions, $sub_fields, $extra = array() ) {
		return array_merge(
			array(
				'key'          => $key,
				'label'        => $label,
				'name'         => $name,
				'type'         => 'repeater',
				'instructions' => $instructions,
				'layout'       => 'table',
				'button_label' => 'הוספת שורה',
				'sub_fields'   => $sub_fields,
			),
			$extra
		);
	}

	private static function sub( $type, $key, $name, $label, $instructions = '', $extra = array() ) {
		return array_merge(
			array( 'key' => $key, 'label' => $label, 'name' => $name, 'type' => $type, 'instructions' => $instructions ),
			$extra
		);
	}

	private static function tab( $key, $label ) {
		return array( 'key' => $key, 'label' => $label, 'type' => 'tab', 'placement' => 'top' );
	}

	public static function register_fields() {
		if ( ! self::available() || ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		acf_add_local_field_group(
			array(
				'key'                => 'group_nad_settings',
				'title'              => 'הגדרות אתר',
				'location'           => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => self::SLUG ) ) ),
				'menu_order'         => 0,
				'position'           => 'normal',
				'style'              => 'default',
				'active'             => true,
				'show_in_graphql'    => 1,
				'graphql_field_name' => 'siteSettingsFields',
				'fields'             => array(

					self::tab( 'field_nad_set_tab_contact', 'יצירת קשר ורשתות' ),
					// This tab fills a gap that exists in the code today: apart from one email
					// address there is no phone, WhatsApp or social URL anywhere — every contact
					// chip on the homepage points at href="#".
					self::sub( 'email', 'field_nad_set_email', 'contact_email', 'אימייל', 'כתובת המייל הראשית של הקהילה.' ),
					self::sub( 'text', 'field_nad_set_phone', 'contact_phone', 'טלפון', 'לדוגמה: 03-5551234. אם ריק — לא יוצג.' ),
					self::sub( 'url', 'field_nad_set_whatsapp', 'whatsapp_url', 'וואטסאפ', 'קישור מלא, לדוגמה: https://wa.me/9725... אם ריק — הכפתור לא יוצג.' ),
					self::sub( 'url', 'field_nad_set_instagram', 'instagram_url', 'אינסטגרם', 'קישור מלא לפרופיל.' ),
					self::sub( 'url', 'field_nad_set_tiktok', 'tiktok_url', 'טיקטוק', 'קישור מלא לפרופיל.' ),
					self::sub( 'url', 'field_nad_set_linkedin', 'linkedin_url', 'לינקדאין', 'קישור מלא לעמוד.' ),

					self::tab( 'field_nad_set_tab_identity', 'זהות האתר' ),
					self::sub( 'image', 'field_nad_set_logo', 'logo', 'לוגו', 'מוצג בתפריט העליון ובתחתית העמוד. רצוי PNG שקוף.', array( 'return_format' => 'url', 'preview_size' => 'medium' ) ),
					self::sub( 'textarea', 'field_nad_set_tagline', 'tagline', 'משפט מלווה', 'הפסקה הקצרה שמופיעה בתחתית העמוד ליד הלוגו.', array( 'rows' => 2, 'new_lines' => '' ) ),
					self::sub( 'text', 'field_nad_set_copyright', 'copyright', 'שורת זכויות יוצרים', 'אם ריק — תיווצר אוטומטית עם השנה הנוכחית. עדיף להשאיר ריק כדי שלא תתיישן.' ),
					self::sub( 'url', 'field_nad_set_terms', 'terms_url', 'קישור לתנאי שימוש', 'כרגע הקישור באתר ריק — עד שתוזן כתובת, הוא לא יוביל לשום מקום.' ),
					self::sub( 'url', 'field_nad_set_privacy', 'privacy_url', 'קישור למדיניות פרטיות', 'כרגע הקישור באתר ריק.' ),
					// Read by nadlanistim-headless to redirect front-end visitors. A field rather
					// than a wp-config constant because managed hosts often give the client no
					// file access, and this is a value they may genuinely need to change.
					self::sub( 'url', 'field_nad_set_frontend', 'frontend_url', 'כתובת האתר הציבורי', 'כתובת ה-Vercel. מבקרים שאינם מחוברים יופנו לשם אוטומטית. להשארה ריקה כדי לכבות את ההפניה — למשל בזמן בדיקות.' ),

					self::tab( 'field_nad_set_tab_nav', 'תפריטים' ),
					self::repeater(
						'field_nad_set_nav',
						'nav_links',
						'תפריט עליון',
						'הקישורים בסרגל העליון. מומלץ עד 7 פריטים — מעבר לכך הסרגל נשבר במסכים צרים.',
						array(
							self::sub( 'text', 'field_nad_set_nav_label', 'label', 'כיתוב' ),
							self::sub( 'text', 'field_nad_set_nav_href', 'href', 'קישור', 'נתיב פנימי (/jobs) או עוגן בעמוד הבית (/#about).' ),
						),
						array( 'max' => 7 )
					),
					self::repeater(
						'field_nad_set_footer',
						'footer_columns',
						'עמודות תחתית',
						'העיצוב בנוי לארבע עמודות בדיוק. אפשר לשנות כותרות וקישורים בחופשיות.',
						array(
							self::sub( 'text', 'field_nad_set_footer_h', 'heading', 'כותרת העמודה' ),
							self::sub( 'textarea', 'field_nad_set_footer_links', 'links', 'קישורים', 'שורה לכל קישור, בפורמט: כיתוב | נתיב', array( 'rows' => 4, 'new_lines' => '' ) ),
						),
						array( 'min' => 4, 'max' => 4 )
					),

					self::tab( 'field_nad_set_tab_home', 'עמוד הבית' ),
					self::sub( 'textarea', 'field_nad_set_marquee', 'marquee', 'רצועת המילים הנעה', 'מילה או ביטוי בכל שורה. הרצועה מכפילה את עצמה, כך שכל כמות עובדת.', array( 'rows' => 6, 'new_lines' => '' ) ),
					self::repeater(
						'field_nad_set_stats',
						'stats',
						'מספרים',
						'ארבעה מדדים המוצגים ברצועת הנתונים. המספר חייב להיות ספרות בלבד — הוא מונפש בספירה עולה.',
						array(
							self::sub( 'number', 'field_nad_set_stat_count', 'count', 'מספר', '', array( 'min' => 0 ) ),
							self::sub( 'text', 'field_nad_set_stat_label', 'label', 'כיתוב' ),
							self::sub( 'text', 'field_nad_set_stat_suffix', 'suffix', 'סיומת', 'לדוגמה: + או %' ),
						),
						array( 'min' => 4, 'max' => 4 )
					),
					self::repeater(
						'field_nad_set_hero',
						'hero_lines',
						'כותרת ראשית',
						'שורה אחת בכל שדה — שלוש שורות בסך הכל. הפיצול לשורות הוא מה שמניע את אנימציית הכניסה, ולכן אין להזין את כל הכותרת בשורה אחת.',
						array(
							self::sub( 'text', 'field_nad_set_hero_line', 'line', 'שורה' ),
						),
						array( 'min' => 3, 'max' => 3 )
					),
					self::sub( 'textarea', 'field_nad_set_hero_sub', 'hero_sub', 'תת-כותרת', 'הפסקה מתחת לכותרת הראשית.', array( 'rows' => 2, 'new_lines' => '' ) ),
				),
			)
		);
	}
}
