<?php
/**
 * Nadlanistim ACF field groups — one per content type.
 *
 * The post title is the item's main heading and the FEATURED IMAGE is its image, so the
 * field groups only carry the extra fields each section needs. Simple field types only
 * (text / textarea / url / date / true_false) so nothing here depends on ACF Pro — it all
 * reads with the free plugin and imports cleanly on the Pro staging site.
 *
 * Registered via acf_add_local_field_group() so the fields work the moment the plugin is
 * active; the Admin tool can also write DB copies (acf_import_field_group) so they show as
 * editable groups in ACF → Field Groups on staging.
 *
 * @package nadlanistim-importer
 */

namespace NadlanistimImporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Fields {

	public static function init() {
		add_action( 'acf/init', array( __CLASS__, 'register' ) );
		// Priority 20: after ACF has written its values, so we read what was just saved.
		add_action( 'acf/save_post', array( __CLASS__, 'sync_article_title' ), 20 );
	}

	/**
	 * Compose the WordPress post title from the two article title fields.
	 *
	 * The design splits the heading across two colours, so the client edits it as two boxes —
	 * but post_title is still what the admin list, the search box, the browser tab and every
	 * card elsewhere on the site display, and it is what the slug is generated from. Leaving
	 * it to the client to type a third time is how those end up blank or contradicting the
	 * article they point at.
	 *
	 * Written straight to the table because wp_update_post() would re-enter save_post and
	 * recurse.
	 */
	public static function sync_article_title( $post_id ) {
		// Options pages pass a string id; every other post type is not ours.
		if ( ! is_numeric( $post_id ) || 'nad_article' !== get_post_type( $post_id ) ) {
			return;
		}

		$main   = trim( (string) get_field( 'title_main', $post_id ) );
		$accent = trim( (string) get_field( 'title_accent', $post_id ) );
		$full   = trim( $main . ' ' . $accent );

		if ( '' === $full || get_post_field( 'post_title', $post_id ) === $full ) {
			return;
		}

		global $wpdb;
		$wpdb->update( $wpdb->posts, array( 'post_title' => $full ), array( 'ID' => $post_id ) );
		clean_post_cache( $post_id );
	}

	public static function register() {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}
		foreach ( self::groups() as $group ) {
			acf_add_local_field_group( $group );
		}
		// Flexible Content is ACF Pro only. Guarded so a free install still gets everything
		// else rather than fataling on an unknown field type.
		if ( function_exists( 'acf_get_field_type' ) && acf_get_field_type( 'flexible_content' ) ) {
			acf_add_local_field_group( self::article_body_group() );
		}
	}

	/** One Flexible Content layout: a named block the client can stack. */
	private static function layout( $key, $name, $label, $sub_fields ) {
		return array(
			'key'        => $key,
			'name'       => $name,
			'label'      => $label,
			'display'    => 'block',
			'sub_fields' => $sub_fields,
		);
	}

	/**
	 * The article body.
	 *
	 * A separate group so it sits in its own box below the details, and Flexible Content
	 * rather than the WordPress editor because the design styles a fixed, small set of
	 * elements. An open HTML editor would let the client paste markup the stylesheet has no
	 * rules for, which renders unformatted with nothing to explain why — these eight layouts
	 * are exactly what post.css supports, so anything the client can build, the design can
	 * render.
	 *
	 * Heading accent follows the hierarchy: h2 is the section heading and stays one colour;
	 * h3/h4 are sub-headings and take the gradient continuation, same as the title. The accent
	 * input is hidden unless the chosen level actually uses it.
	 */
	private static function article_body_group() {
		return array(
			'key'                => 'group_nad_article_body',
			'title'              => 'גוף הכתבה',
			'location'           => self::loc( 'nad_article' ),
			'menu_order'         => 10,
			'position'           => 'normal',
			'style'              => 'default',
			'active'             => true,
			'show_in_graphql'    => 1,
			'graphql_field_name' => 'articleBody',
			'graphql_types'      => array( 'Article' ),
			'fields'             => array(
				array(
					'key'          => 'field_nad_art_body',
					'label'        => 'תוכן',
					'name'         => 'body',
					'type'         => 'flexible_content',
					'instructions' => 'מוסיפים בלוקים לפי הסדר הרצוי. אפשר לגרור כדי לשנות סדר.',
					'button_label' => 'הוספת בלוק',
					'layouts'      => array(

						self::layout( 'layout_nad_p', 'paragraph', 'פסקה', array(
							array( 'key' => 'field_nad_body_p', 'label' => 'טקסט', 'name' => 'text', 'type' => 'textarea', 'rows' => 4, 'new_lines' => '' ),
						) ),

						self::layout( 'layout_nad_h', 'heading', 'כותרת', array(
							array(
								'key'           => 'field_nad_body_h_level',
								'label'         => 'רמה',
								'name'          => 'level',
								'type'          => 'select',
								'instructions'  => 'h2 — כותרת ראשית בגוף הכתבה, בצבע אחיד. h3/h4 — כותרות משנה, עם המשך בצבע מודגש.',
								'choices'       => array( 'h2' => 'h2 — כותרת ראשית', 'h3' => 'h3 — כותרת משנה', 'h4' => 'h4 — כותרת משנה קטנה' ),
								'default_value' => 'h2',
								'return_format' => 'value',
							),
							array( 'key' => 'field_nad_body_h_text', 'label' => 'טקסט', 'name' => 'text', 'type' => 'text' ),
							array(
								'key'               => 'field_nad_body_h_accent',
								'label'             => 'המשך בצבע מודגש',
								'name'              => 'accent',
								'type'              => 'text',
								'instructions'      => 'ממשיך את הכותרת באותה שורה. אפשר להשאיר ריק.',
								// h2 is the section heading and carries no accent, so the field
								// only appears for the levels that actually render one.
								'conditional_logic' => array(
									array( array( 'field' => 'field_nad_body_h_level', 'operator' => '!=', 'value' => 'h2' ) ),
								),
							),
						) ),

						self::layout( 'layout_nad_list', 'list', 'רשימה', array(
							array(
								'key'           => 'field_nad_body_list_type',
								'label'         => 'סוג',
								'name'          => 'ordered',
								'type'          => 'select',
								'choices'       => array( '0' => 'תבליטים', '1' => 'מספור' ),
								'default_value' => '0',
								'return_format' => 'value',
							),
							array( 'key' => 'field_nad_body_list_items', 'label' => 'פריטים', 'name' => 'items', 'type' => 'textarea', 'rows' => 5, 'new_lines' => '', 'instructions' => 'פריט בכל שורה.' ),
						) ),

						self::layout( 'layout_nad_quote', 'quote', 'ציטוט', array(
							array( 'key' => 'field_nad_body_quote', 'label' => 'טקסט', 'name' => 'text', 'type' => 'textarea', 'rows' => 3, 'new_lines' => '', 'instructions' => 'מוצג בהדגשה עם פס צבעוני. אין צורך להוסיף מרכאות — הן חלק מהעיצוב.' ),
						) ),

						self::layout( 'layout_nad_img', 'image', 'תמונה', array(
							array( 'key' => 'field_nad_body_img', 'label' => 'תמונה', 'name' => 'image', 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'medium', 'instructions' => 'כל גודל מתאים — התמונה תותאם אוטומטית לרוחב הכתבה.' ),
							array(
								'key'               => 'field_nad_body_img_cap',
								'label'             => 'כיתוב',
								'name'              => 'caption',
								'type'              => 'text',
								'instructions'      => 'מוצג ממורכז מתחת לתמונה.',
								// Only asked for once there is an image to caption.
								'conditional_logic' => array(
									array( array( 'field' => 'field_nad_body_img', 'operator' => '!=empty' ) ),
								),
							),
						) ),
					),
				),
			),
		);
	}

	private static function loc( $post_type ) {
		return array( array( array( 'param' => 'post_type', 'operator' => '==', 'value' => $post_type ) ) );
	}

	/**
	 * Field helpers.
	 *
	 * Every helper takes an `$instructions` string, and it is not optional by convention —
	 * the client fills these in without a developer present, and an unlabelled "תגית" or
	 * "תקופה" box is the difference between correct content and a support call. Where a value
	 * shows up in a fixed-width chip or card, the instruction says so, because the layout
	 * cannot absorb an essay.
	 *
	 * `$extra` merges last so any single field can override (required, maxlength, choices…).
	 */
	private static function field( $type, $key, $name, $label, $instructions = '', $extra = array() ) {
		return array_merge(
			array(
				'key'          => $key,
				'label'        => $label,
				'name'         => $name,
				'type'         => $type,
				'instructions' => $instructions,
			),
			$extra
		);
	}

	private static function text( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field( 'text', $key, $name, $label, $instructions, $extra );
	}
	private static function textarea( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field( 'textarea', $key, $name, $label, $instructions, array_merge( array( 'rows' => 3, 'new_lines' => '' ), $extra ) );
	}
	private static function url( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field( 'url', $key, $name, $label, $instructions, $extra );
	}
	private static function email( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field( 'email', $key, $name, $label, $instructions, $extra );
	}
	private static function number( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field( 'number', $key, $name, $label, $instructions, $extra );
	}
	private static function date( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field( 'date_picker', $key, $name, $label, $instructions, array_merge( array( 'display_format' => 'd/m/Y', 'return_format' => 'Ymd', 'first_day' => 0 ), $extra ) );
	}
	private static function bool( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field( 'true_false', $key, $name, $label, $instructions, array_merge( array( 'ui' => 1 ), $extra ) );
	}

	/**
	 * Image field.
	 *
	 * `return_format => url` keeps get_field() returning a plain URL in PHP, but it does NOT
	 * change the GraphQL shape: WPGraphQL for ACF always exposes an image as a media
	 * connection edge, so querying it directly needs `logo { node { sourceUrl } }`. Rather
	 * than push that nesting into every Next.js mapper, nadlanistim-headless registers a flat
	 * `…Url` String alongside each of these (see IMAGE_FIELDS there) — the same trick already
	 * used for `imageUrl`. Add a field here and you must add it there too.
	 *
	 * Where a post's main picture is concerned the FEATURED IMAGE is still the source of
	 * truth; these are only for a second image, or a logo that is not the card's photo.
	 */
	private static function image( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field( 'image', $key, $name, $label, $instructions, array_merge( array( 'return_format' => 'url', 'preview_size' => 'medium', 'library' => 'all' ), $extra ) );
	}

	/**
	 * A list of short strings, entered one per line.
	 *
	 * Deliberately a textarea rather than a Pro Repeater. A repeater returns an array of
	 * objects over GraphQL while a textarea returns a string, so using one would make the
	 * schema — and every Next.js mapper — depend on which ACF tier happens to be installed.
	 * These are all flat lists of plain strings, so the repeater UI buys nothing but that
	 * coupling. The front end splits on newlines.
	 */
	private static function lines( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field(
			'textarea',
			$key,
			$name,
			$label,
			$instructions,
			array_merge( array( 'rows' => 5, 'new_lines' => '' ), $extra )
		);
	}

	/** Single-choice dropdown. `$choices` is value => label; values are what reach GraphQL. */
	private static function select( $key, $name, $label, $choices, $instructions = '', $extra = array() ) {
		return self::field(
			'select',
			$key,
			$name,
			$label,
			$instructions,
			array_merge( array( 'choices' => $choices, 'allow_null' => 1, 'ui' => 0, 'return_format' => 'value' ), $extra )
		);
	}

	/**
	 * Gallery of images (ACF Pro). A media picker for an ordered set of images.
	 *
	 * `return_format => id` so get_field() hands back attachment IDs; nadlanistim-headless
	 * flattens those to a plain [String] of URLs (see GALLERY_FIELDS there) — the list analogue
	 * of the image() `…Url` trick, so the Next mappers get a clean array of URLs. Add a gallery
	 * here and you must add it there too.
	 */
	private static function gallery( $key, $name, $label, $instructions = '', $extra = array() ) {
		return self::field( 'gallery', $key, $name, $label, $instructions, array_merge( array( 'return_format' => 'id', 'library' => 'all', 'insert' => 'append' ), $extra ) );
	}

	private static function group( $key, $title, $post_type, $fields ) {
		return array_merge(
			array(
				'key'        => $key,
				'title'      => $title,
				'fields'     => $fields,
				'location'   => self::loc( $post_type ),
				'menu_order' => 0,
				'position'   => 'normal',
				'style'      => 'default',
				'active'     => true,
			),
			self::graphql( $post_type )
		);
	}

	/**
	 * GraphQL exposure for a field group, derived from the post type's GraphQL name so the
	 * two can never drift: nad_event => field `eventFields` on type `Event`.
	 *
	 * `graphql_types` is set explicitly rather than relying on
	 * map_graphql_types_from_location_rules — the location rules are evaluated at request
	 * time and silently produce an empty type list if the post type is registered late,
	 * which shows up as a missing field in the schema rather than an error.
	 *
	 * Inert without WPGraphQL for ACF: plain ACF ignores the extra keys.
	 */
	private static function graphql( $post_type ) {
		if ( empty( Post_Types::GRAPHQL[ $post_type ] ) ) {
			return array();
		}
		$single = Post_Types::GRAPHQL[ $post_type ][0];
		return array(
			'show_in_graphql'    => 1,
			'graphql_field_name' => $single . 'Fields',
			'graphql_types'      => array( ucfirst( $single ) ),
		);
	}

	/**
	 * All field groups, one per content type.
	 *
	 * Labels and instructions are Hebrew because the client enters the content and the admin
	 * is a Hebrew RTL site; the `name` keys stay ASCII snake_case because they become the
	 * GraphQL field names the Next.js queries read.
	 *
	 * Field NAMES already consumed by the front end (role, quote, event_date, time_label,
	 * place, description, is_accent, is_past, tag, company, location, period, partners,
	 * audio_url, excerpt, author, read_time, is_featured, link_url) are a contract with
	 * lib/wp/queries.ts — relabel them freely, but renaming one breaks the homepage.
	 */
	public static function groups() {
		return array(
			self::group( 'group_nad_community', 'פרטי קהילה', 'nad_community', array(
				self::text( 'field_nad_comm_tagline', 'tagline', 'משפט מלווה', 'שורה אחת שמופיעה מתחת לשם הקהילה בכרטיס. עד ~60 תווים.' ),
				self::number( 'field_nad_comm_members', 'members_count', 'מספר חברים', 'מספר בלבד, ללא פסיקים או טקסט. מוצג ככיתוב על הכרטיס.', array( 'min' => 0 ) ),
				self::image( 'field_nad_comm_logo', 'logo', 'לוגו הקהילה', 'לוגו מרובע. אם לא הועלה לוגו — תוצג התמונה הראשית, ואם גם היא חסרה יוצג סמל ברירת המחדל.' ),
				self::lines( 'field_nad_comm_about', 'about', 'על הקהילה', 'פסקה בכל שורה. שורה ריקה מפרידה בין פסקאות בעמוד הקהילה.' ),
				self::lines( 'field_nad_comm_happenings', 'happenings', 'מה קורה בקהילה', 'פריט בכל שורה בפורמט: אימוג׳י | כותרת | תיאור. לדוגמה: 📅 | מפגש חודשי | מפגש פיזי אחת לחודש.' ),
				self::gallery( 'field_nad_comm_gallery', 'gallery', 'גלריה (מהשטח)', 'תמונות מהקהילה. התמונה הראשית (רקע ההירו) נלקחת מהתמונה המרכזית של הפוסט.' ),
				self::url( 'field_nad_comm_link', 'link_url', 'קישור', 'קישור מלא (כולל https://) לקבוצת הוואטסאפ או לעמוד הקהילה. אפשר להשאיר ריק.' ),
			) ),

			// One post type for BOTH the נדלניסטים directory and the youth page — the two are
			// separated by the "שיוך" (cohort) taxonomy, not by a duplicate post type.
			self::group( 'group_nad_nadlanist', 'פרטי נדלניסט/ית', 'nad_nadlanist', array(
				self::text( 'field_nad_nad_role', 'role', 'תפקיד', 'לדוגמה: יזם נדל״ן ומנטור. מוצג מתחת לשם בכרטיס.', array( 'required' => 1 ) ),
				self::select( 'field_nad_nad_field', 'field', 'תחום עיסוק', array(
					'יזמות'    => 'יזמות',
					'השקעות'   => 'השקעות',
					'שיווק'    => 'שיווק',
					'ייעוץ'    => 'ייעוץ',
					'אדריכלות' => 'אדריכלות',
					'תיווך'    => 'תיווך',
					'שמאות'    => 'שמאות',
					'מימון'    => 'מימון',
					'פרופטק'   => 'פרופטק',
					'משפט'     => 'משפט',
				), 'תחום העיסוק. קובע את הסינון ״תחום עיסוק״ באינדקס הנדלניסטים, ומוצג בעמוד האישי.' ),
				self::number( 'field_nad_nad_age', 'age', 'גיל', 'רלוונטי בעיקר לעמוד הצעירים. אפשר להשאיר ריק — הגיל פשוט לא יוצג.', array( 'min' => 0, 'max' => 120 ) ),
				self::text( 'field_nad_nad_place', 'place', 'מיקום', 'עיר או אזור, לדוגמה: תל אביב.' ),
				self::text( 'field_nad_nad_oneliner', 'one_liner', 'שורת פתיחה', 'משפט אחד שמסכם את הפעילות. מוצג בכרטיס בעמוד הצעירים. עד ~90 תווים.' ),
				self::textarea( 'field_nad_nad_quote', 'quote', 'ציטוט', 'ציטוט אישי קצר. מוצג במרכאות — אין צורך להוסיף אותן.' ),
				self::lines( 'field_nad_nad_bio', 'bio', 'ביוגרפיה', 'פסקה בכל שורה. מוצג בעמוד האישי.' ),
				self::lines( 'field_nad_nad_focus', 'focus', 'התמחויות (נבחרת הצעירים)', 'תגית בכל שורה. מוצגות כתגיות בעמוד חבר/ת נבחרת הצעירים.' ),
				self::email( 'field_nad_nad_email', 'email', 'אימייל', 'מוצג כקישור יצירת קשר בעמוד האישי.' ),
			) ),

			self::group( 'group_nad_event', 'פרטי אירוע', 'nad_event', array(
				self::date( 'field_nad_evt_date', 'event_date', 'תאריך האירוע', 'בוחרים מהלוח. היום והחודש מוצגים בתגית התאריך על הכרטיס.', array( 'required' => 1 ) ),
				self::text( 'field_nad_evt_time', 'time_label', 'שעה', 'טקסט חופשי, לדוגמה: 19:00 או 19:00–22:00.' ),
				self::text( 'field_nad_evt_place', 'place', 'מיקום', 'לדוגמה: האנגר 11, נמל ת״א.' ),
				self::textarea( 'field_nad_evt_desc', 'description', 'תיאור', 'שתיים-שלוש שורות שמופיעות על כרטיס האירוע.' ),
				self::lines( 'field_nad_evt_agenda', 'agenda', 'לוח זמנים', 'שורה לכל סעיף, לדוגמה: 19:00 — התכנסות ורישום.' ),
				self::url( 'field_nad_evt_cta', 'cta_url', 'קישור הרשמה', 'קישור מלא לטופס ההרשמה. אם ריק — כפתור ההרשמה לא יוצג.' ),
				self::bool( 'field_nad_evt_accent', 'is_accent', 'אירוע מודגש', 'מציג את הכרטיס בעיצוב בולט. מומלץ להדליק לאירוע אחד בלבד בכל זמן נתון.' ),
				self::bool( 'field_nad_evt_past', 'is_past', 'אירוע שהתקיים', 'הדלקה מעבירה את האירוע מ״אירועים קרובים״ ל״אירועי עבר״.' ),

				// ── עמוד אירוע (כנס/מאסטרקלאס) ──
				self::text( 'field_nad_evt_price', 'price', 'כמה עולה', 'לדוגמה: חינם לחברי קהילה / 50₪.' ),
				self::text( 'field_nad_evt_audience', 'audience', 'למי זה מתאים', 'לדוגמה: יזמים, משקיעים ובעלי מקצוע.' ),
				self::lines( 'field_nad_evt_features', 'features', 'מה מחכה באירוע', 'פריט בכל שורה בפורמט: אימוג׳י | כותרת | תיאור. לדוגמה: 🤝 | נטוורקינג | היכרות עם עוד נדלניסטים.' ),
				self::text( 'field_nad_evt_spk_name', 'speaker_name', 'שם המנחה', 'לדוגמה: רן מימון.' ),
				self::text( 'field_nad_evt_spk_role', 'speaker_role', 'תפקיד המנחה', 'לדוגמה: מנכ״ל, מימון בנייה.' ),
				self::image( 'field_nad_evt_spk_photo', 'speaker_photo', 'תמונת המנחה', 'תמונת פורטרט של המנחה.' ),
				self::textarea( 'field_nad_evt_spk_bio', 'speaker_bio', 'על המנחה', 'פסקה קצרה על המנחה.' ),
				self::text( 'field_nad_evt_spk_quote', 'speaker_quote', 'ציטוט המנחה', 'ציטוט קצר — מוצג במרכאות, אין צורך להוסיף אותן.' ),
				self::url( 'field_nad_evt_spk_link', 'speaker_link', 'קישור המנחה', 'קישור לפרופיל / לינקדאין של המנחה.' ),
				self::lines( 'field_nad_evt_testi', 'testimonials', 'המלצות (עמוד אירוע)', 'המלצה בכל שורה בפורמט: ציטוט | שם.' ),
				self::lines( 'field_nad_evt_faq', 'faq', 'שאלות נפוצות (עמוד אירוע)', 'שאלה בכל שורה.' ),

				// ── עמוד מסיבה ──
				self::text( 'field_nad_evt_dress', 'dress_code', 'דרֶס קוד', 'לדוגמה: Smart casual / לבן.' ),
				self::text( 'field_nad_evt_entry', 'entry', 'כניסה', 'לדוגמה: חינם לחברי קהילה / 80₪.' ),
				self::lines( 'field_nad_evt_vibe', 'vibe', 'מילות וייב (מרקי)', 'מילה בכל שורה. לדוגמה: מוזיקה, בר פתוח, ריקודים.' ),
				self::lines( 'field_nad_evt_timeline', 'timeline', 'ציר זמן (מסיבה)', 'שורה בכל שלב בפורמט: שעה | כותרת | תיאור.' ),
				self::lines( 'field_nad_evt_lineup', 'lineup', 'ליין-אפ (מסיבה)', 'שורה לכל אמן בפורמט: שם | תפקיד. התמונות נלקחות מגלריית הליין-אפ, לפי סדר.' ),
				self::gallery( 'field_nad_evt_lineup_ph', 'lineup_photos', 'תמונות ליין-אפ', 'תמונה לכל אמן, באותו סדר של הליין-אפ.' ),
				self::gallery( 'field_nad_evt_party_gal', 'party_gallery', 'גלריית מסיבה', 'תמונות מהמסיבה.' ),
				self::lines( 'field_nad_evt_party_q', 'party_quotes', 'ציטוטים (מסיבה)', 'ציטוט בכל שורה בפורמט: ציטוט | שם.' ),
				self::lines( 'field_nad_evt_party_faq', 'party_faq', 'שאלות נפוצות (מסיבה)', 'שאלה בכל שורה.' ),

				// ── עמוד סיכום אירוע ──
				self::gallery( 'field_nad_evt_rc_gal', 'recap_gallery', 'גלריית סיכום', 'תמונות מהאירוע שהתקיים.' ),
				self::lines( 'field_nad_evt_takeaways', 'takeaways', 'תובנות מרכזיות', 'תובנה בכל שורה בפורמט: כותרת | תיאור.' ),
				self::url( 'field_nad_evt_video', 'video_url', 'קישור וידאו', 'קישור להקלטה / רגעי השיא.' ),
				self::image( 'field_nad_evt_video_thumb', 'video_thumb', 'תמונת וידאו', 'תמונה ממוזערת לנגן הווידאו.' ),
				self::lines( 'field_nad_evt_rc_testi', 'recap_testimonials', 'המלצות (סיכום)', 'המלצה בכל שורה בפורמט: ציטוט | שם | תפקיד. התמונות נלקחות מגלריית ההמלצות, לפי סדר.' ),
				self::gallery( 'field_nad_evt_rc_av', 'recap_avatars', 'תמונות ממליצים (סיכום)', 'תמונת פנים לכל ממליץ, באותו סדר של ההמלצות.' ),
				self::lines( 'field_nad_evt_downloads', 'downloads', 'חומרים להורדה', 'פריט בכל שורה בפורמט: שם | קישור.' ),
			) ),

			self::group( 'group_nad_deal', 'פרטי עסקה', 'nad_deal', array(
				self::text( 'field_nad_deal_tag', 'tag', 'תגית', 'קטגוריה קצרה שמופיעה כתווית על הכרטיס, לדוגמה: התחדשות עירונית. 1–3 מילים.' ),
				self::textarea( 'field_nad_deal_desc', 'description', 'תיאור', 'שתיים-שלוש שורות על העסקה.' ),
				self::text( 'field_nad_deal_period', 'period', 'תקופה', 'טווח הזמן של הפרויקט, לדוגמה: 2024–2026.' ),
				self::text( 'field_nad_deal_partners', 'partners', 'שותפים', 'שמות השותפים מופרדים בפסיק.' ),
			) ),

			self::group( 'group_nad_job', 'פרטי משרה', 'nad_job', array(
				self::text( 'field_nad_job_tag', 'tag', 'תגית', 'תווית קצרה על הכרטיס בעמוד הבית, לדוגמה: קריירה · משרת ניהול.' ),
				self::text( 'field_nad_job_publisher', 'publisher', 'מפרסם/ת', 'השם שיוצג על הכרטיס בלוח הדרושים כמי שמפרסם/ת את המודעה. לדוגמה: אבי כהן.', array( 'required' => 1 ) ),
				self::text( 'field_nad_job_company', 'company', 'חברה', 'שם החברה המגייסת. מוצג בכרטיס בעמוד הבית. אפשר להשאיר ריק למודעה שמפרסם אדם פרטי.' ),
				self::text( 'field_nad_job_location', 'location', 'מיקום', 'לדוגמה: תל אביב, או מרחוק.' ),
				self::select( 'field_nad_job_field', 'field', 'תחום עיסוק', array(
					'ניהול'     => 'ניהול',
					'שיווק'     => 'שיווק',
					'תיווך'     => 'תיווך',
					'שמאות'     => 'שמאות',
					'הנדסה'     => 'הנדסה',
					'מימון'     => 'מימון',
					'טכנולוגיה' => 'טכנולוגיה',
				), 'תחום העיסוק של המשרה. נבחר בטופס פרסום משרה, וקובע את הסינון ״תחום עיסוק״ בלוח הדרושים.' ),
				self::select( 'field_nad_job_employment', 'employment', 'סוג מודעה', array(
					'full'         => 'משרה מלאה',
					'part'         => 'משרה חלקית',
					'freelance'    => 'פרילנס',
					'partnership'  => 'שותפות עסקית',
					'volunteering' => 'התנדבות',
					'services'     => 'מציעים שירותים',
				), 'נבחר מרשימה. מוצג ככיתוב ״סוג עבודה״ על הכרטיס, וקובע את הסינון בלוח הדרושים.' ),
				self::textarea( 'field_nad_job_desc', 'description', 'תיאור המשרה', 'תיאור המשרה. פסקה בכל שורה — מוצג בעמוד המשרה תחת ״תיאור המשרה״, ובתקציר על הכרטיס בלוח.' ),
				self::lines( 'field_nad_job_reqs', 'requirements', 'דרישות', 'דרישה בכל שורה. מוצג כרשימת תבליטים בעמוד המשרה.' ),
				self::lines( 'field_nad_job_tags', 'tags', 'תגיות', 'תגית בכל שורה. מוצגות ככפתורים בעמוד המשרה, לדוגמה: ניסיון, ניהול פרויקטים, נדל״ן.' ),
				self::email( 'field_nad_job_email', 'contact_email', 'אימייל ליצירת קשר', 'לשם יישלחו המועמדויות. מוצג בעמוד המשרה תחת ״פרטי התקשרות״.' ),
				self::text( 'field_nad_job_phone', 'contact_phone', 'טלפון ליצירת קשר', 'אופציונלי, לדוגמה: 050-1234567.' ),
			) ),

			self::group( 'group_nad_podcast', 'פרטי פרק', 'nad_podcast', array(
				self::number( 'field_nad_pod_num', 'episode_number', 'מספר פרק', 'מספר בלבד. הפרקים מסודרים לפי המספר הזה, מהגבוה לנמוך.', array( 'min' => 1 ) ),
				self::textarea( 'field_nad_pod_desc', 'description', 'תיאור', 'שתיים-שלוש שורות על הפרק.' ),
				self::text( 'field_nad_pod_guests', 'guests', 'אורחים', 'שמות האורחים מופרדים בפסיק.' ),
				self::text( 'field_nad_pod_duration', 'duration', 'אורך', 'בפורמט דקות:שניות, לדוגמה: 48:12.' ),
				self::text( 'field_nad_pod_date', 'air_date', 'תאריך שידור', 'טקסט חופשי, מוצג על הכרטיס ובעמוד הפרק. לדוגמה: יוני 2026.' ),
				self::lines( 'field_nad_pod_notes', 'notes', 'נקודות מהפרק', 'נקודה בכל שורה.' ),
				self::url( 'field_nad_pod_src', 'audio_src', 'קישור לקובץ שמע (MP3)', 'קישור ישיר לקובץ MP3 (מאוחסן בכל מקום — לא צריך להעלות לאתר). זה מה שמתנגן בנגן שבעמוד הפרק. אם ריק, לא מוצג נגן.' ),
				self::url( 'field_nad_pod_audio', 'audio_url', 'קישור חיצוני (ספוטיפיי/אפל)', 'קישור לעמוד הפרק בספוטיפיי / אפל. משמש את כפתור ״האזינו ב-Spotify״.' ),
			) ),

			// The title is two fields because the design renders it in two colours, the second
			// carrying a gradient fill. They are concatenated INLINE, so the heading still flows
			// and wraps as a single string — the split is an input convenience, not a line break.
			// The WordPress post title is composed from both on save (sync_article_title) so the
			// admin list, search and every card elsewhere keep showing the whole title.
			self::group( 'group_nad_article', 'פרטי כתבה', 'nad_article', array(
				self::text( 'field_nad_art_title_main', 'title_main', 'כותרת', 'החלק בצבע הרגיל. לדוגמה: מיסוי מקרקעין 2026 —', array( 'required' => 1 ) ),
				self::text( 'field_nad_art_title_accent', 'title_accent', 'המשך הכותרת (בצבע מודגש)', 'ממשיך את הכותרת באותה שורה — לא יורד לשורה נפרדת ולא מוצג קטן יותר. לדוגמה: מה השתנה ולמי זה משנה. אפשר להשאיר ריק.' ),
				self::textarea( 'field_nad_art_excerpt', 'excerpt', 'תקציר', 'שתיים-שלוש שורות שמופיעות על הכרטיס ברשימת הכתבות.' ),
				self::number( 'field_nad_art_readmin', 'read_minutes', 'זמן קריאה (דקות)', 'מחושב אוטומטית מאורך הכתבה — יש למלא רק כדי לדרוס את החישוב, למשל בכתבה עתירת תמונות.', array( 'min' => 1, 'max' => 120 ) ),
				self::bool( 'field_nad_art_featured', 'is_featured', 'כתבה מובילה', 'מציג את הכתבה בכרטיס הגדול בראש המדור. מומלץ להדליק לכתבה אחת בלבד.' ),
				self::select( 'field_nad_art_type', 'content_type', 'סוג תוכן', array(
					'מדריך'      => 'מדריך',
					'הסבר'       => 'הסבר',
					'מחקר'       => 'מחקר',
					'Case Study' => 'Case Study',
				), 'התגית שמופיעה על תמונת הכתבה בארכיון (בית הידע). אפשר להשאיר ריק.' ),

				/*
				 * Author — a reference to a נדלניסט/ית in the index.
				 *
				 * Admins enter the article, but the writer shown in the stripe is CHOSEN from the
				 * נדלניסטים directory (nad_nadlanist), and the stripe links through to that
				 * person's profile. Name, photo, role and bio are read from the linked record by
				 * author_value() in nadlanistim-headless, so there is one source of truth and
				 * nothing to keep in sync by hand.
				 *
				 * The free-text fields below stay as a manual fallback — for a guest writer who is
				 * not in the index, and as the pre-membership stand-in. The resolver prefers, in
				 * order: the linked נדלניסט, then the WordPress post author's filled profile, then
				 * these fields. The whole cluster moves as one unit.
				 */
				self::field( 'message', 'field_nad_art_author_msg', '', 'פרטי הכותב/ת', array(
					'message'   => 'בוחרים את הכותב/ת מתוך אינדקס הנדלניסטים — השם, התמונה, התפקיד והביו נמשכים אוטומטית מהעמוד האישי, ורצועת הכותב/ת בכתבה מקושרת אליו. השדות הידניים נועדו רק לכותב/ת אורח/ת שאינו/ה מופיע/ה באינדקס.',
					'new_lines' => 'wpautop',
				) ),
				self::field( 'post_object', 'field_nad_art_author_ref', 'author_nadlanist', 'כותב/ת מהאינדקס', 'בוחרים נדלניסט/ית מאינדקס הנדלניסטים. אם נבחר — הרצועה מוצגת ומקושרת לעמוד האישי, והשדות הידניים למטה אינם נחוצים.', array(
					'post_type'     => array( 'nad_nadlanist' ),
					'return_format' => 'id',
					'multiple'      => 0,
					'allow_null'    => 1,
					'ui'            => 1,
				) ),
				self::text( 'field_nad_art_author_name', 'author_name', 'שם הכותב/ת', 'לדוגמה: עו״ד דניאל כהן.' ),
				self::image( 'field_nad_art_author_av', 'author_avatar', 'תמונת הכותב/ת', 'כל גודל מתאים — התמונה תיחתך אוטומטית לריבוע.' ),
				self::text( 'field_nad_art_author_firm', 'author_firm', 'משרד / חברה', 'החלק הראשון בשורת התפקיד. לדוגמה: משרד כהן ושות׳.' ),
				self::text( 'field_nad_art_author_spec', 'author_specialty', 'תחום התמחות', 'החלק השני בשורת התפקיד. לדוגמה: מיסוי נדל״ן. המפריד (·) בין השניים נוסף אוטומטית — אין להקליד אותו.' ),
				self::textarea( 'field_nad_art_author_bio', 'author_bio', 'אודות הכותב/ת', 'פסקה קצרה שמוצגת בתיבה בסוף הכתבה.', array( 'rows' => 3 ) ),
				self::url( 'field_nad_art_author_li', 'author_linkedin', 'לינקדאין של הכותב/ת', 'קישור מלא. שמור לשימוש עתידי — לא מוצג בעיצוב הנוכחי.' ),
				self::url( 'field_nad_art_author_ig', 'author_instagram', 'אינסטגרם של הכותב/ת', 'קישור מלא. שמור לשימוש עתידי — לא מוצג בעיצוב הנוכחי.' ),

				// Legacy: still read by the homepage articles section (articleFields.author /
				// readTime). Kept so wiring the article page does not break the homepage.
				self::text( 'field_nad_art_author', 'author', 'שם כותב/ת (שדה ישן)', 'שדה ישן שנקרא בעמוד הבית. אין צורך למלא בכתבות חדשות.' ),
				self::text( 'field_nad_art_readtime', 'read_time', 'זמן קריאה (שדה ישן)', 'שדה ישן שנקרא בעמוד הבית. אין צורך למלא בכתבות חדשות.' ),
			) ),

			// New: the classifieds board that app/collaborations/data.ts used to hold.
			self::group( 'group_nad_collab', 'פרטי שיתוף פעולה', 'nad_collab', array(
				self::select( 'field_nad_col_looking', 'looking', 'מחפש/ת', array(
					'financial'  => 'שותף פיננסי',
					'profession' => 'שותף מקצועי',
					'contractor' => 'קבלן מבצע',
					'proptech'   => 'יועץ פרופטק',
					'land'       => 'שותף לקרקע',
					'investor'   => 'משקיע שותף',
				), 'נבחר מרשימה כדי שהסינון בעמוד שיתופי הפעולה יעבוד.', array( 'required' => 1 ) ),
				self::select( 'field_nad_col_board_tab', 'board_tab', 'קטגוריה בלוח', array(
					'looking' => 'מחפש שותף',
					'active'  => 'פרויקטים פעילים',
					'success' => 'סיפורי הצלחה',
				), 'קובע תחת איזו לשונית שיתוף הפעולה מופיע בלוח. ברירת מחדל: מחפש שותף.', array( 'required' => 1 ) ),
				self::select( 'field_nad_col_invest', 'invest', 'היקף השקעה', array(
					'none' => 'ללא השקעה כספית',
					'100k' => 'עד 100K',
					'500k' => 'עד 500K',
					'1m'   => 'מיליון ₪ ומעלה',
				), 'טווח ההשקעה הנדרש מהשותף.' ),
				self::select( 'field_nad_col_stage', 'stage', 'שלב הפרויקט', array(
					'idea'     => 'רעיון ראשוני',
					'permits'  => 'תכנון והיתרים',
					'building' => 'תכנון והקמה',
					'advanced' => 'מוצר מתקדם',
					'exec'     => 'ביצוע',
				), 'השלב שבו הפרויקט נמצא היום.' ),
				self::text( 'field_nad_col_type', 'type', 'סוג', 'תחום שיתוף הפעולה. מוצג בשורת הפרטים בעמוד שיתוף הפעולה, לדוגמה: התחדשות עירונית, בנייה, קרקע.' ),
				self::text( 'field_nad_col_place', 'place', 'מיקום', 'עיר או יישוב. את האזור הרחב יש לבחור בתיבת ״אזור״ בצד.' ),
				self::text( 'field_nad_col_by', 'by', 'שם המפרסם/ת', 'השם שיוצג על הכרטיס כמי שמפרסם את שיתוף הפעולה.', array( 'required' => 1 ) ),
				self::text( 'field_nad_col_byrole', 'by_role', 'תפקיד המפרסם/ת', 'לדוגמה: יזם, לבנון נדל״ן.' ),
				self::date( 'field_nad_col_date', 'published_date', 'תאריך פרסום', 'בוחרים מהלוח. מוצג על הכרטיס.' ),
				self::lines( 'field_nad_col_desc', 'description', 'תיאור', 'פסקה בכל שורה.' ),
				self::lines( 'field_nad_col_looking_list', 'looking_list', 'מה מחפשים', 'נקודה בכל שורה. מוצג כרשימת תבליטים.' ),
				self::lines( 'field_nad_col_tags', 'tags', 'תגיות', 'תגית בכל שורה. מוצגות ככפתורים בעמוד שיתוף הפעולה.' ),
				self::email( 'field_nad_col_email', 'email', 'אימייל ליצירת קשר', 'מוצג ככפתור יצירת קשר בעמוד שיתוף הפעולה.' ),
				self::text( 'field_nad_col_phone', 'phone', 'טלפון ליצירת קשר', 'לדוגמה: 050-1234567.' ),
			) ),

			// New: sponsors were a hardcoded array in HomeV6. As a post type the client can add
			// and reorder them, and a sponsor with no logo still renders as its name.
			self::group( 'group_nad_sponsor', 'פרטי שותף', 'nad_sponsor', array(
				self::image( 'field_nad_spo_logo', 'logo', 'לוגו', 'רצוי PNG או SVG על רקע שקוף. אם לא הועלה לוגו — יוצג שם השותף כטקסט.' ),
				self::select( 'field_nad_spo_tier', 'tier', 'סוג שותפות', array(
					'main'  => 'שותף ראשי',
					'event' => 'שותף אירוע',
				), 'קובע באיזו רצועת שותפים הלוגו מופיע.', array( 'required' => 1 ) ),
				self::url( 'field_nad_spo_url', 'website_url', 'קישור לאתר', 'קישור מלא כולל https://. אם ריק — הלוגו לא יהיה לחיץ.' ),
			) ),
		);
	}
}
