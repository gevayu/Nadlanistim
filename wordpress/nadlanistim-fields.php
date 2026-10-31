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

		// "הגדרות אתר" → the homepage's images and "מי אנחנו" block. An empty field hides its part on the site.
		$image = function ( $name, $label, $instructions, $width = '50' ) {
			return array(
				'key'           => 'field_nad_' . $name,
				'label'         => $label,
				'name'          => $name,
				'type'          => 'image',
				'return_format' => 'url',
				'preview_size'  => 'medium',
				'instructions'  => $instructions,
				'wrapper'       => array( 'width' => $width ),
			);
		};
		acf_add_local_field_group(
			array(
				'key'                => 'group_nad_settings_home',
				'title'              => 'עמוד הבית: תמונות ו"מי אנחנו"',
				'fields'             => array(
					$image( 'home_hero_image', 'תמונת רקע להירו', 'התמונה הגדולה בראש עמוד הבית. רוחב 2400 פיקסלים לפחות.', '100' ),
					array(
						'key'          => 'field_nad_home_about_title',
						'label'        => 'כותרת "מי אנחנו"',
						'name'         => 'home_about_title',
						'type'         => 'textarea',
						'rows'         => 3,
						'new_lines'    => '',
						'instructions' => 'שורה לכל שורה בכותרת. השורה האחרונה מודגשת בצבע.',
						'wrapper'      => array( 'width' => '40' ),
					),
					array(
						'key'          => 'field_nad_home_about_text',
						'label'        => 'פסקאות',
						'name'         => 'home_about_text',
						'type'         => 'textarea',
						'rows'         => 4,
						'new_lines'    => '',
						'instructions' => 'פסקה בכל שורה. {מספר חברים} מוחלף במספר הראשון מ"מספרים" למעלה, כך שהוא תמיד תואם.',
						'wrapper'      => array( 'width' => '60' ),
					),
					array(
						'key'          => 'field_nad_home_about_points',
						'label'        => 'נקודות',
						'name'         => 'home_about_points',
						'type'         => 'textarea',
						'rows'         => 4,
						'new_lines'    => '',
						'instructions' => 'נקודה בכל שורה. המספור (01, 02...) נוסף לבד.',
					),
					$image( 'home_about_image_large', 'תמונה גדולה', 'התמונה הראשית ליד "מי אנחנו".' ),
					$image( 'home_about_image_small', 'תמונה קטנה', 'התמונה הקטנה שעולה על הגדולה.' ),
					array(
						'key'          => 'field_nad_home_about_badge_number',
						'label'        => 'תג: מספר',
						'name'         => 'home_about_badge_number',
						'type'         => 'number',
						'min'          => 0,
						'instructions' => 'המספר הגדול בתג שעל התמונות. ריק = בלי תג.',
						'wrapper'      => array( 'width' => '30' ),
					),
					array(
						'key'          => 'field_nad_home_about_badge_text',
						'label'        => 'תג: טקסט',
						'name'         => 'home_about_badge_text',
						'type'         => 'textarea',
						'rows'         => 2,
						'new_lines'    => '',
						'instructions' => 'מתחת למספר. שורה לכל שורה, למשל "שנים" ואז "של קהילה".',
						'wrapper'      => array( 'width' => '70' ),
					),
					$image( 'home_featured_bg', 'רקע "האירוע המרכזי"', 'תמונת הרקע של האירוע המוצג בעמוד הבית.', '100' ),
				),
				'location'           => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'nadlanistim-settings' ) ) ),
				'show_in_graphql'    => 1,
				'graphql_field_name' => 'homeContent',
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
					// A banner replaces the logo and text line; the strip keeps the sponsor's link.
					array(
						'key'           => 'field_nad_sp_' . $key . '_banner_desktop',
						'label'         => 'באנר לדסקטופ',
						'name'          => 'banner_desktop',
						'type'          => 'image',
						'return_format' => 'url',
						'preview_size'  => 'medium',
						'mime_types'    => 'jpg,jpeg,png,webp,gif',
						'instructions'  => '1920×320 פיקסלים. כשיש באנר, הוא מוצג במקום הלוגו והטקסט.',
						'wrapper'       => array( 'width' => '50' ),
					),
					array(
						'key'           => 'field_nad_sp_' . $key . '_banner_mobile',
						'label'         => 'באנר למובייל',
						'name'          => 'banner_mobile',
						'type'          => 'image',
						'return_format' => 'url',
						'preview_size'  => 'medium',
						'mime_types'    => 'jpg,jpeg,png,webp,gif',
						'instructions'  => '1080×540 פיקסלים. בלי באנר למובייל, הטלפון מציג את באנר הדסקטופ.',
						'wrapper'       => array( 'width' => '50' ),
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

// "חומת תשלום": for each members' area, what a visitor without a paying membership gets. The site reads it
// through GraphQL (lib/paywall.ts); a paying member always sees everything. Defaults match what the site did before.
add_action(
	'acf/init',
	function () {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}
		$open     = 'פתוח לכולם';
		$blur     = 'אורחים רואים מטושטש';
		$redirect = 'חברים בלבד, אורחים מועברים';
		$area     = function ( $key, $title, $where, $buttons, $guest, $can_blur, $default ) use ( $open, $blur, $redirect ) {
			$choices = $can_blur ? array( 'open' => $open, 'blur' => $blur, 'redirect' => $redirect ) : array( 'open' => $open, 'redirect' => $redirect );
			return array(
				'key'        => 'field_nad_pw_' . $key,
				'label'      => $title,
				'name'       => $key,
				'type'       => 'group',
				'layout'     => 'block',
				'sub_fields' => array(
					array(
						'key'     => 'field_nad_pw_' . $key . '_about',
						'label'   => '',
						'name'    => '',
						'type'    => 'message',
						'message' => '<span class="nad-pw-where" dir="ltr">' . esc_html( $where ) . '</span> · ' . esc_html( $buttons ) . ( $guest ? '<br><span class="nad-pw-guest">' . esc_html( $guest ) . '</span>' : '' ),
					),
					array(
						'key'           => 'field_nad_pw_' . $key . '_access',
						'label'         => 'מי שאינו חבר משלם',
						'name'          => 'access',
						'type'          => 'button_group',
						'choices'       => $choices,
						'default_value' => $default,
						'layout'        => 'horizontal',
						'wrapper'       => array( 'width' => '55' ),
					),
					array(
						'key'               => 'field_nad_pw_' . $key . '_to',
						'label'             => 'מועבר אל',
						'name'              => 'to',
						'type'              => 'radio',
						'choices'           => array( 'join' => 'עמוד ההצטרפות', 'login' => 'עמוד ההתחברות', 'custom' => 'קישור אחר' ),
						'default_value'     => 'join',
						'layout'            => 'horizontal',
						'wrapper'           => array( 'width' => '45' ),
						'conditional_logic' => array( array( array( 'field' => 'field_nad_pw_' . $key . '_access', 'operator' => '==', 'value' => 'redirect' ) ) ),
					),
					array(
						'key'               => 'field_nad_pw_' . $key . '_custom',
						'label'             => 'הקישור',
						'name'              => 'custom_url',
						'type'              => 'url',
						'placeholder'       => 'https://',
						'conditional_logic' => array(
							array(
								array( 'field' => 'field_nad_pw_' . $key . '_access', 'operator' => '==', 'value' => 'redirect' ),
								array( 'field' => 'field_nad_pw_' . $key . '_to', 'operator' => '==', 'value' => 'custom' ),
							),
						),
					),
				),
			);
		};
		acf_add_local_field_group(
			array(
				'key'                => 'group_nad_paywall',
				'title'              => 'מי רואה מה',
				'fields'             => array(
					array(
						'key'     => 'field_nad_pw_intro',
						'label'   => '',
						'name'    => '',
						'type'    => 'message',
						'message' => 'לכל אזור באתר בוחרים מה מקבל מי שאינו חבר משלם: רואה הכל, רואה מטושטש, או מועבר לעמוד אחר. חבר מחובר עם חברות פעילה רואה תמיד הכל. השינוי עולה לאתר מיד עם השמירה.',
					),
					$area( 'job_new', 'פרסום משרה', '/job-new', 'הכפתור "פרסם משרה פתוחה" בלוח הדרושים', '', false, 'redirect' ),
					$area( 'jobs_board', 'לוח הדרושים', '/jobs', 'התפריט "קריירה" ועמוד הבית', '', false, 'open' ),
					$area( 'collab_new', 'פרסום שיתוף פעולה', '/collaboration-new', 'הכפתור "פרסם שיתוף פעולה" בלוח שיתופי הפעולה', '', false, 'open' ),
					$area( 'collab_board', 'לוח שיתופי הפעולה', '/collaborations', 'התפריט "חדר העסקאות"', 'מטושטש: הכרטיסים גלויים, שם המפרסם והחברה מוסתרים.', true, 'blur' ),
					$area( 'collab_page', 'עמוד שיתוף פעולה', '/collaboration/...', 'הכרטיסים בלוח שיתופי הפעולה', 'מטושטש: רואים את מה שבכרטיס, והפרטים, אנשי הקשר ושם המפרסם מוסתרים.', true, 'blur' ),
					$area( 'nadlanist_page', 'עמוד נדלניסט', '/nadlanist/...', 'הכרטיסים ב"הכר את הנדלניסט" ובעמוד הבית', 'מטושטש: רואים את הכרטיס מהמדריך, ושאר הפרופיל מוסתר.', true, 'blur' ),
					$area( 'nadlanist_new', 'הצטרפות למדריך ולנבחרת', '/nadlanist-new', 'הכפתורים "הצטרף למדריך" ו"הגישו מועמדות" לנבחרת הצעירים', '', false, 'redirect' ),
					array(
						'key'           => 'field_nad_pw_join_to',
						'label'         => 'כל כפתורי "הצטרפו לקהילה" מובילים אל',
						'name'          => 'join_to',
						'type'          => 'radio',
						'choices'       => array( 'join' => 'עמוד ההצטרפות באתר', 'custom' => 'קישור אחר' ),
						'default_value' => 'join',
						'layout'        => 'horizontal',
						'instructions'  => 'גם "עמוד ההצטרפות" שנבחר באזורים למעלה מוביל לכאן.',
					),
					array(
						'key'               => 'field_nad_pw_join_custom',
						'label'             => 'הקישור',
						'name'              => 'join_custom_url',
						'type'              => 'url',
						'placeholder'       => 'https://',
						'conditional_logic' => array( array( array( 'field' => 'field_nad_pw_join_to', 'operator' => '==', 'value' => 'custom' ) ) ),
					),
				),
				'location'           => array( array( array( 'param' => 'options_page', 'operator' => '==', 'value' => 'nadlanistim-paywall' ) ) ),
				'show_in_graphql'    => 1,
				'graphql_field_name' => 'paywall',
			)
		);
	}
);

add_action(
	'acf/init',
	function () {
		if ( ! function_exists( 'acf_add_options_sub_page' ) ) {
			return;
		}
		acf_add_options_sub_page(
			array(
				'page_title'         => 'חומת תשלום',
				'menu_title'         => 'חומת תשלום',
				'menu_slug'          => 'nadlanistim-paywall',
				'parent_slug'        => 'nadlanistim-settings',
				'capability'         => 'edit_posts',
				'show_in_graphql'    => true,
				'graphql_type_name'  => 'PaywallSettings',
				'graphql_field_name' => 'paywallSettings',
			)
		);
	},
	99
);

// The area's address and buttons read as a quiet line under its name, not as a block of text.
add_action(
	'admin_head',
	function () {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || false === strpos( (string) $screen->id, 'nadlanistim-paywall' ) ) {
			return;
		}
		echo '<style>.nad-pw-where{font-weight:600;color:#4b3fd6}.nad-pw-guest{color:#5d6878;font-size:12.5px}'
			. '.acf-field-group>.acf-label label{font-size:15px}.acf-field-group>.acf-input>.acf-fields{border-radius:10px}</style>';
	}
);
