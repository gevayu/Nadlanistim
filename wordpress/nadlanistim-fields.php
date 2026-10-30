<?php
/**
 * Plugin Name: Nadlanistim Extra Fields
 * Description: ACF fields the site needs beyond the Nadlanistim Importer plugin's own groups.
 *
 * Lives in wp-content/mu-plugins on nadlanistim-cms.bold-move.co.il. Source of truth: wordpress/ in the site repo.
 * Kept apart from the Importer plugin, whose source is not in the repo, so an update of it cannot drop these.
 */

add_action(
	'acf/init',
	function () {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		// A deal card on the homepage ("חדר העסקאות") opens this link.
		acf_add_local_field_group(
			array(
				'key'                => 'group_nad_deal_extra',
				'title'              => 'קישור העסקה',
				'fields'             => array(
					array(
						'key'          => 'field_nad_deal_link',
						'label'        => 'קישור',
						'name'         => 'link',
						'type'         => 'text',
						'instructions' => 'לאן הכרטיס בעמוד הבית מוביל: נתיב באתר, לדוגמה /collaboration/pinui-binui-givat-shmuel, או קישור מלא. אם ריק, הכרטיס מוביל ללוח שיתופי הפעולה.',
					),
				),
				'location'           => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'nad_deal' ) ) ),
				'position'           => 'side',
				'show_in_graphql'    => 1,
				'graphql_field_name' => 'dealLink',
				'graphql_types'      => array( 'Deal' ),
			)
		);

		// Profile extras a member also edits from /my-account on the site.
		acf_add_local_field_group(
			array(
				'key'                => 'group_nad_nadlanist_extra',
				'title'              => 'רשתות, חיפוש עבודה וקהילות',
				'fields'             => array(
					array( 'key' => 'field_nad_nad_linkedin', 'label' => 'לינקדאין', 'name' => 'linkedin', 'type' => 'url' ),
					array( 'key' => 'field_nad_nad_instagram', 'label' => 'אינסטגרם', 'name' => 'instagram', 'type' => 'url' ),
					array(
						'key'          => 'field_nad_nad_otw',
						'label'        => 'Open to work',
						'name'         => 'open_to_work',
						'type'         => 'true_false',
						'ui'           => 1,
						'instructions' => 'מסגרת ירוקה עם #OPENTOWORK סביב התמונה במדריך ובפרופיל.',
					),
					array(
						'key'           => 'field_nad_nad_communities',
						'label'         => 'הקהילות שלי',
						'name'          => 'communities',
						'type'          => 'relationship',
						'post_type'     => array( 'nad_community' ),
						'return_format' => 'id',
						'filters'       => array( 'search' ),
						'instructions'  => 'הקהילות שהחבר/ה חלק מהן. מוצג בקרוסלת החברים של כל קהילה.',
					),
				),
				'location'           => array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => 'nad_nadlanist' ) ) ),
				'show_in_graphql'    => 1,
				'graphql_field_name' => 'nadlanistExtra',
				'graphql_types'      => array( 'Nadlanist' ),
			)
		);

		// "הגדרות אתר" → the youth team page's own copy.
		acf_add_local_field_group(
			array(
				'key'                => 'group_nad_settings_youth',
				'title'              => 'עמוד נבחרת הצעירים',
				'fields'             => array(
					array(
						'key'           => 'field_nad_set_youth_hero',
						'label'         => 'תמונת רקע',
						'name'          => 'youth_hero',
						'type'          => 'image',
						'return_format' => 'url',
						'preview_size'  => 'medium',
					),
					array(
						'key'          => 'field_nad_set_youth_max_age',
						'label'        => 'גיל מקסימלי',
						'name'         => 'youth_max_age',
						'type'         => 'number',
						'min'          => 0,
						'instructions' => 'מופיע בעמוד הנבחרת ובבאנר בעמוד הבית: "מתחת לגיל ...".',
					),
					array(
						'key'          => 'field_nad_set_youth_intro',
						'label'        => 'מה זה בעצם?',
						'name'         => 'youth_intro',
						'type'         => 'textarea',
						'rows'         => 4,
						'new_lines'    => '',
						'instructions' => 'הפסקה שמסבירה מה היא הנבחרת.',
					),
				),
				'location'           => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'nadlanistim-settings' ) ) ),
				'show_in_graphql'    => 1,
				'graphql_field_name' => 'youthSettings',
			)
		);

		// "הגדרות אתר" → "חסויות": the sponsor strips. Name, logo and link come from the chosen
		// "נותני חסות" post, so a logo is kept in one place; the slot adds its own line and an on/off switch.
		// The page itself is registered at priority 99 (below), after the Importer's parent page.
		$slot = function ( $key, $name, $label, $where ) {
			return array(
				'key'          => 'field_nad_sp_' . $key,
				'label'        => $label,
				'name'         => $name,
				'type'         => 'group',
				'layout'       => 'block',
				'instructions' => $where,
				'sub_fields'   => array(
					array(
						'key'           => 'field_nad_sp_' . $key . '_active',
						'label'         => 'פעיל',
						'name'          => 'active',
						'type'          => 'true_false',
						'ui'            => 1,
						'default_value' => 0,
						'instructions'  => 'כבוי, או בלי נותן חסות: הפס לא מוצג.',
						'wrapper'       => array( 'width' => '20' ),
					),
					array(
						'key'           => 'field_nad_sp_' . $key . '_sponsor',
						'label'         => 'נותן החסות',
						'name'          => 'sponsor',
						'type'          => 'post_object',
						'post_type'     => array( 'nad_sponsor' ),
						'return_format' => 'id',
						'allow_null'    => 1,
						'ui'            => 1,
						'instructions'  => 'השם, הלוגו והקישור נלקחים מהפוסט של נותן החסות. נותן חסות חדש מוסיפים קודם ב"נותני חסות".',
						'wrapper'       => array( 'width' => '40' ),
					),
					array(
						'key'          => 'field_nad_sp_' . $key . '_text',
						'label'        => 'שורת טקסט',
						'name'         => 'text',
						'type'         => 'text',
						'maxlength'    => 120,
						'instructions' => 'משפט קצר ליד הלוגו. לא חובה.',
						'wrapper'      => array( 'width' => '40' ),
					),
				),
			);
		};

		acf_add_local_field_group(
			array(
				'key'                => 'group_nad_sponsorships',
				'title'              => 'פסי חסות',
				'fields'             => array(
					$slot( 'top', 'sponsor_strip_top', 'חסות 1: פס עליון', 'מוצג בכל עמוד פנימי, מתחת לשורת הניווט (פירורי הלחם).' ),
					$slot( 'events', 'sponsor_strip_events', 'חסות 2: פס תחתון', 'מוצג בתחתית עמוד הבית, עמוד האירועים, לוח שיתופי הפעולה ובית הידע.' ),
				),
				'location'           => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'nadlanistim-sponsorships' ) ) ),
				'show_in_graphql'    => 1,
				'graphql_field_name' => 'sponsorSlots',
			)
		);
	}
);

// Registered after the Importer's "הגדרות אתר" page: WordPress links a parent menu to itself only when
// the parent exists before its first sub page, otherwise "הגדרות אתר" would open "חסויות".
add_action(
	'acf/init',
	function () {
		if ( ! function_exists( 'acf_add_options_sub_page' ) ) {
			return;
		}
		acf_add_options_sub_page(
			array(
				'page_title'         => 'חסויות',
				'menu_title'         => 'חסויות',
				'menu_slug'          => 'nadlanistim-sponsorships',
				'parent_slug'        => 'nadlanistim-settings',
				'capability'         => 'edit_posts',
				'show_in_graphql'    => true,
				'graphql_type_name'  => 'Sponsorships',
				'graphql_field_name' => 'sponsorships',
			)
		);
	},
	99
);

// The Importer plugin labels the "building" stage "תכנון והקמה", too close to "תכנון והיתרים".
// Relabelled here so a plugin update cannot bring the old name back; the stored value stays "building".
add_filter(
	'acf/load_field/key=field_nad_col_stage',
	function ( $field ) {
		if ( isset( $field['choices']['building'] ) ) {
			$field['choices']['building'] = 'בנייה';
		}
		return $field;
	}
);
