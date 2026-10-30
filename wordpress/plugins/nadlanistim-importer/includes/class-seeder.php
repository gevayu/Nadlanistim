<?php
/**
 * Demo-content seeder — inserts the reference (Next.js) content as starter CPT posts so the
 * client opens a populated site and edits real items instead of a blank one.
 *
 * Idempotent: every seeded post carries a unique `_nad_seed` meta key; re-running updates the
 * same posts instead of duplicating. Demo images are stored as a `nad_seed_img` URL meta
 * (no remote sideloading — fast and reliable); a real Featured Image, once set, takes
 * precedence in the widgets.
 *
 * @package nadlanistim-importer
 */

namespace NadlanistimImporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Seeder {

	const UNSPLASH = 'https://images.unsplash.com/photo-';

	private static function img( $id, $w = 1000 ) {
		return self::UNSPLASH . $id . '?w=' . $w . '&q=80';
	}

	/**
	 * Insert or update one seeded post.
	 *
	 * @return int post ID
	 */
	private static function upsert( $post_type, $seed_key, $title, $fields = array(), $img = '', $terms = array() ) {
		$existing = get_posts( array(
			'post_type'   => $post_type,
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_nad_seed',        // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => $seed_key,          // phpcs:ignore WordPress.DB.SlowDBQuery
		) );

		$postarr = array(
			'post_type'   => $post_type,
			'post_status' => 'publish',
			'post_title'  => $title,
		);
		if ( $existing ) {
			$postarr['ID'] = $existing[0];
			$id = wp_update_post( $postarr );
		} else {
			$id = wp_insert_post( $postarr );
		}
		if ( is_wp_error( $id ) || ! $id ) {
			return 0;
		}

		update_post_meta( $id, '_nad_seed', $seed_key );
		if ( $img ) {
			update_post_meta( $id, 'nad_seed_img', esc_url_raw( $img ) );
			// Also set a real Featured Image so the wp-admin panel shows it (and the client can
			// swap it there). Sideloaded once — idempotent by source URL — and only when the post
			// has no thumbnail yet, so re-seeding never re-downloads or clobbers a manual image.
			if ( ! has_post_thumbnail( $id ) ) {
				$att = self::sideload( $img, sanitize_title( $seed_key ) . '.jpg' );
				if ( $att ) {
					set_post_thumbnail( $id, $att );
				}
			}
		}
		if ( function_exists( 'update_field' ) ) {
			foreach ( $fields as $name => $value ) {
				update_field( $name, $value, $id );
			}
		} else {
			foreach ( $fields as $name => $value ) {
				update_post_meta( $id, $name, $value );
			}
		}
		foreach ( $terms as $taxonomy => $term ) {
			if ( $term ) {
				wp_set_object_terms( $id, $term, $taxonomy, false );
			}
		}
		return $id;
	}

	/** The post id previously seeded under $seed_key, or 0 — used to wire relationships. */
	private static function post_id_by_seed( $post_type, $seed_key ) {
		$ids = get_posts( array(
			'post_type'   => $post_type,
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_nad_seed',        // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => $seed_key,          // phpcs:ignore WordPress.DB.SlowDBQuery
		) );
		return $ids ? (int) $ids[0] : 0;
	}

	/**
	 * Download a remote image into the media library once and return its attachment ID.
	 *
	 * The rest of the demo content stores remote URLs and resolves them at query time, which is
	 * fine for throwaway card images. The article page is different: its avatar and cover are
	 * served through registered crop sizes, and WordPress can only generate those for files it
	 * actually holds. Pointing at a third-party host would also leave the client's approved
	 * layout depending on that host staying up.
	 *
	 * Keyed on the source URL so repeated seeding reuses the existing attachment instead of
	 * filling the library with copies.
	 */
	private static function sideload( $url, $filename ) {
		$existing = get_posts( array(
			'post_type'   => 'attachment',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_nad_seed_src',   // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => $url,              // phpcs:ignore WordPress.DB.SlowDBQuery
		) );
		if ( $existing ) {
			return (int) $existing[0];
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		// Reseeding now sideloads a Featured Image for every card, so give each download a fresh
		// budget rather than letting them accumulate against one PHP time limit.
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
		}

		$tmp = download_url( $url, 60 );
		if ( is_wp_error( $tmp ) ) {
			return 0;
		}

		$id = media_handle_sideload(
			array( 'name' => $filename, 'tmp_name' => $tmp ),
			0
		);

		if ( is_wp_error( $id ) ) {
			@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
			return 0;
		}

		update_post_meta( $id, '_nad_seed_src', esc_url_raw( $url ) );
		return (int) $id;
	}

	/**
	 * The sample article, reproducing the client's approved prototype exactly.
	 *
	 * Every value here matches https://nadlanistim.yuvalgeva.com/post so the WordPress-driven
	 * page is indistinguishable from the design when it is shown back to the client — the
	 * difference being that all of it is now editable.
	 *
	 * One deliberate divergence: the prototype puts the gradient accent on its h2 headings.
	 * The agreed hierarchy is that h2 is a plain section heading and only h3/h4 carry the
	 * accent, so the headings here are seeded without one.
	 */
	public static function seed_sample_article() {
		$cover_id  = self::sideload( self::img( '1486406146926-c627a92ad1ab', 1600 ), 'nadlanistim-tax-2026-cover.jpg' );
		$figure_id = self::sideload( self::img( '1554469384-e58fac16e23a', 1200 ), 'nadlanistim-tax-2026-figure.jpg' );
		$avatar_id = self::sideload( 'https://i.pravatar.cc/240?img=33', 'nadlanistim-author-daniel-cohen.jpg' );

		// The writer is a real נדלניסט in the index, not free text, so the flagship article keeps
		// its approved identity (עו״ד דניאל כהן) while the stripe becomes a live link to a profile.
		// Same avatar image so the meta byline and foot card are unchanged visually.
		$author_ref = self::upsert(
			'nad_nadlanist',
			'nad_sample_author',
			'עו״ד דניאל כהן',
			array(
				'role'  => 'עו״ד · מיסוי מקרקעין',
				'field' => 'משפט',
				'place' => 'תל אביב',
				'quote' => 'מלווה עסקאות נדל״ן, התחדשות עירונית ומיסוי מקרקעין מעל 12 שנה. חבר פעיל בקהילת הנדלניסטים.',
				'bio'   => "עו״ד דניאל כהן מתמחה במיסוי מקרקעין, התחדשות עירונית וליווי עסקאות נדל״ן מורכבות, עם למעלה מ‑12 שנות ניסיון.\nהוא כותב באופן קבוע בבית הידע של הקהילה ומלווה יזמים ומשקיעים בצמתים המשפטיים של הדרך.",
				'email' => 'daniel@nadlanistim.co.il',
			),
			'https://i.pravatar.cc/400?img=33'
		);
		if ( $author_ref ) {
			// Clean English slug for the author's profile (like the other directory people).
			wp_update_post( array( 'ID' => $author_ref, 'post_name' => 'daniel-cohen' ) );
		}

		$body = array(
			array(
				'acf_fc_layout' => 'paragraph',
				'text'          => 'רפורמת המיסוי שנכנסה לתוקף בתחילת 2026 משנה את כללי המשחק עבור משקיעים, יזמים ובעלי דירות. בין אם אתם מחזיקים נכס יחיד או תיק נכסים שלם — כדאי להבין מה השתנה לפני העסקה הבאה.',
			),
			array(
				'acf_fc_layout' => 'paragraph',
				'text'          => 'במאמר הזה נפרק את השינויים המרכזיים, נסביר למי הם רלוונטיים, ונראה איך לתכנן את המהלכים בצורה חכמה כדי לא לשלם מס מיותר.',
			),
			array( 'acf_fc_layout' => 'heading', 'level' => 'h2', 'text' => 'מה השתנה במס השבח', 'accent' => '' ),
			array(
				'acf_fc_layout' => 'paragraph',
				'text'          => 'המדרגות עודכנו, והפטור הליניארי קיבל הגדרה מחודשת. עבור מי שמכר דירה שנייה, ההשפעה יכולה להגיע לעשרות אלפי שקלים — לכאן או לכאן.',
			),
			array(
				'acf_fc_layout' => 'list',
				'ordered'       => '0',
				'items'         => "עדכון מדרגות המס לפי שווי העסקה.\nשינוי בתנאי הפטור לדירה יחידה.\nהקלות ממוקדות לפרויקטים של התחדשות עירונית.",
			),
			array(
				'acf_fc_layout' => 'quote',
				'text'          => '״התכנון המיסויי הנכון מתחיל הרבה לפני החתימה — הוא מתחיל ברגע שאתם שוקלים לקנות.״',
			),
			array( 'acf_fc_layout' => 'heading', 'level' => 'h2', 'text' => 'למי זה באמת משנה', 'accent' => '' ),
			array(
				'acf_fc_layout' => 'paragraph',
				'text'          => 'למשקיעים מרובי־נכסים, ליזמי התחדשות עירונית ולמוכרי דירה שנייה — שלושת אלה ירגישו את השינוי הכי חזק. השורה התחתונה: בדיקה מקדימה עם איש מקצוע יכולה לחסוך הרבה כסף וכאב ראש.',
			),
			array(
				'acf_fc_layout' => 'image',
				'image'         => $figure_id ?: '',
				'caption'       => 'ליווי מקצועי בעסקה — ההבדל בין רווח לרווח גדול יותר.',
			),
		);

		$id = self::upsert(
			'nad_article',
			'sample-tax-2026',
			'מיסוי מקרקעין 2026 — מה השתנה ולמי זה משנה',
			array(
				'title_main'       => 'מיסוי מקרקעין 2026 —',
				'title_accent'     => 'מה השתנה ולמי זה משנה',
				'excerpt'          => 'כל מה שמשקיעים ובעלי דירות צריכים להבין על מס שבח, מס רכישה והפטורים החדשים.',
				// The prototype prints "9 דק׳ קריאה". The computed estimate for this body lands
				// lower, so the override is set to keep the page identical to the approved design.
				'read_minutes'     => 9,
				'content_type'     => 'מדריך',
				// Primary author source: the linked נדלניסט record. The manual fields below stay as
				// the resolver's fallback and keep the homepage/legacy paths intact.
				'author_nadlanist' => $author_ref ?: '',
				'author_name'      => 'עו״ד דניאל כהן',
				'author_avatar'    => $avatar_id ?: '',
				'author_firm'      => 'משרד כהן ושות׳',
				'author_specialty' => 'מיסוי נדל״ן',
				'author_bio'       => 'מלווה עסקאות נדל״ן, התחדשות עירונית ומיסוי מקרקעין מעל 12 שנה. חבר פעיל בקהילת הנדלניסטים.',
				'body'             => $body,
			),
			'',
			array(
				'nad_article_cat' => 'רגולציה',
				'nad_article_tag' => array( 'מיסוי', 'התחדשות עירונית', 'רגולציה', 'מס שבח' ),
			)
		);

		if ( ! $id ) {
			return 0;
		}

		if ( $cover_id ) {
			set_post_thumbnail( $id, $cover_id );
		}

		// The design shows "יוני 2026"; the date is read from the publish date, so it is set
		// here rather than stored as a field.
		wp_update_post( array( 'ID' => $id, 'post_date' => '2026-06-15 09:00:00', 'post_date_gmt' => '2026-06-15 06:00:00' ) );

		return 1;
	}

	/**
	 * Seed everything. Returns [ post_type => count ].
	 */
	public static function seed() {
		$counts = array();
		$counts['nad_community'] = self::seed_communities();
		$counts['nad_nadlanist'] = self::seed_nadlanistim();
		$counts['nad_nadlanist'] += self::seed_youth(); // נבחרת הצעירים — nad_nadlanist in the "צעירים" cohort
		$counts['nad_job']       = self::seed_jobs();
		$counts['nad_job']      += self::seed_job_status_samples();
		$counts['nad_collab']    = self::seed_collabs();
		$counts['nad_collab']   += self::seed_collab_tab_samples();
		$counts['nad_deal']      = self::seed_deals();
		$counts['nad_podcast']   = self::seed_podcasts();
		$counts['nad_event']     = self::seed_events();
		self::seed_event_singles(); // enrich the 3 representative events with the single-page sections
		$counts['nad_article']   = self::seed_articles();
		// Runs last: it upserts a fully-populated article on top of the simpler seeded set,
		// and it sideloads real files, so it should not block the rest if the host blocks
		// outbound requests.
		$counts['nad_article'] += self::seed_sample_article();
		$counts['nad_sponsor']  = self::seed_sponsors();
		return $counts;
	}

	private static function seed_communities() {
		// [ slug, name, tagline, members, cover-img, about (2 paragraphs, \n between), [gallery imgs] ]
		$communities = array(
			array( 'young-entrepreneurs', 'יזמים צעירים', 'הדור הבא של היזמות — לומדים, טועים וצומחים יחד.', 412, '1540575467063-178a50c2df87',
				"קהילת היזמים הצעירים היא הבית של מי שרק מתחיל את דרכו בעולם הייזום — ושל מי שכבר רץ ורוצה להאיץ. כאן חולקים ידע, מכשולים ופתרונות, בלי פוזות.\nמהעסקה הראשונה ועד הפרויקט החמישי — הקהילה מלווה את החברים בכל שלב, עם מנטורים בכירים שהיו פעם בדיוק באותו מקום.",
				array( '1556157382-97eda2d62296', '1551836022-d5d88e9218df', '1505373877841-8d25f7d46678' ) ),
			array( 'women-investors', 'משקיעות', 'נשים שמובילות בעולם ההשקעות והנדל״ן.', 268, '1551836022-d5d88e9218df',
				"קהילת המשקיעות נבנתה כדי לתת במה, ידע וביטחון לנשים בעולם ההשקעות — עולם שעדיין נשלט לרוב על ידי גברים.\nכאן מדברים על עסקאות אמיתיות, על ניהול סיכונים ועל בניית עצמאות כלכלית — בשפה, בקצב ובאווירה שמתאימים לחברות הקהילה.",
				array( '1556157382-97eda2d62296', '1505373877841-8d25f7d46678', '1540575467063-178a50c2df87' ) ),
			array( 'urban-renewal', 'התחדשות עירונית', 'פינוי־בינוי, תמ״א 38 והמורכבות שמאחוריהם.', 331, '1545324418-cc1a3fa10c00',
				"התחדשות עירונית היא אחד התחומים המורכבים והמתגמלים בנדל״ן — וקהילה זו מרכזת את היזמים, עורכי הדין והמתכננים שחיים אותו יום־יום.\nמגיבוש בעלי דירות ועד קבלת היתרים, החברים חולקים ניסיון מהשטח, טעויות שכדאי להימנע מהן, ושותפויות שנולדות בתוך הקהילה.",
				array( '1545324418-cc1a3fa10c00', '1582407947304-fd86f028f716', '1448630360428-65456885c650' ) ),
			array( 'commercial-real-estate', 'נדל״ן מסחרי', 'משרדים, מסחר ולוגיסטיקה — מהצד העסקי.', 224, '1486406146926-c627a92ad1ab',
				"קהילת הנדל״ן המסחרי עוסקת בעולם של משרדים, מרכזי מסחר, לוגיסטיקה ותעשייה — עם היגיון עסקי שונה לגמרי מזה של המגורים.\nהחברים מנתחים עסקאות, שוכרים ותשואות, ומשתפים ידע על ניהול נכסים מניבים בקנה מידה גדול.",
				array( '1486406146926-c627a92ad1ab', '1448630360428-65456885c650', '1582407947304-fd86f028f716' ) ),
			array( 'overseas-real-estate', 'נדל״ן בחו״ל', 'השקעות מעבר לים — הזדמנויות וסיכונים.', 189, '1582407947304-fd86f028f716',
				"השקעה בנדל״ן מעבר לים פותחת עולם של הזדמנויות — אבל גם מלכודות של רגולציה, מיסוי וניהול מרחוק.\nהקהילה מחברת בין משקיעים ישראלים לבין אנשי שטח ביעדים החמים, ומשתפת ניסיון אמיתי מהמדינות השונות.",
				array( '1582407947304-fd86f028f716', '1486406146926-c627a92ad1ab', '1545324418-cc1a3fa10c00' ) ),
			array( 'proptech', 'פרופטק', 'טכנולוגיה שמשנה את כללי המשחק בנדל״ן.', 156, '1518770660439-4636190af475',
				"קהילת הפרופטק היא מפגש בין עולם הנדל״ן המסורתי לבין הטכנולוגיה שמשנה אותו — מסטארטאפים ועד כלים שכבר בשימוש יומיומי.\nיזמים, מפתחים ומשקיעים חולקים כאן רעיונות, מוצרים ושותפויות, ומזהים את הטרנדים הבאים לפני כולם.",
				array( '1518770660439-4636190af475', '1556157382-97eda2d62296', '1551836022-d5d88e9218df' ) ),
			array( 'finance-mortgages', 'מימון ומשכנתאות', 'כל הצד הפיננסי של העסקה במקום אחד.', 203, '1554469384-e58fac16e23a',
				"מאחורי כל עסקת נדל״ן טובה עומד מבנה מימון חכם. קהילת המימון עוסקת במשכנתאות, קרנות חוב, הון פרטי וכל מה שביניהם.\nבנקאים, יועצים ומנהלי קרנות מפצחים יחד דוחות אפס, מבני עסקה ותנאי מימון — ומחברים בין הון להזדמנויות.",
				array( '1554469384-e58fac16e23a', '1486406146926-c627a92ad1ab', '1551836022-d5d88e9218df' ) ),
			array( 'appraisal', 'שמאות מקרקעין', 'המומחים להערכת שווי ובדיקות נאותות.', 142, '1554469384-e58fac16e23a',
				"שמאי המקרקעין הם העיניים המקצועיות של כל עסקה. הקהילה מרכזת את המומחים להערכת שווי, בדיקות נאותות וליווי פיננסי.\nהחברים מדברים על מתודולוגיה, על מקרי קצה ועל השוק המשתנה — ומחדדים יחד את הסטנדרט המקצועי.",
				array( '1554469384-e58fac16e23a', '1545324418-cc1a3fa10c00', '1448630360428-65456885c650' ) ),
			array( 'architecture-design', 'אדריכלות ועיצוב', 'המתכננים שמעצבים את המרחב שלנו.', 167, '1559223607-a43c990c692c',
				"קהילת האדריכלות והעיצוב מפגישה את המתכננים שמעצבים את הבניינים, החללים והערים שבהם אנחנו חיים.\nמבנייה ירוקה ועד עיצוב פנים, החברים חולקים השראה, פתרונות תכנוניים ושיתופי פעולה עם יזמים.",
				array( '1559223607-a43c990c692c', '1545324418-cc1a3fa10c00', '1556761175-5973dc0f32e7' ) ),
			array( 'income-property', 'נדל״ן מניב', 'תשואה שוטפת וניהול נכסים לטווח ארוך.', 245, '1582407947304-fd86f028f716',
				"נדל״ן מניב זה מרתון, לא ספרינט. הקהילה עוסקת בבניית תיק נכסים שמייצר תשואה שוטפת ויציבה לאורך שנים.\nהחברים חולקים אסטרטגיות ניהול, סיפורי שוכרים, וכלים למקסום תזרים ומינימום כאב ראש.",
				array( '1582407947304-fd86f028f716', '1486406146926-c627a92ad1ab', '1545324418-cc1a3fa10c00' ) ),
		);

		$n = 0;
		foreach ( $communities as $i => $c ) {
			$happenings = "📅 | מפגש חודשי | מפגש פיזי אחת לחודש של קהילת " . $c[1] . " — הרצאה, דיון ונטוורקינג.\n"
				. "💬 | קבוצת וואטסאפ פעילה | שאלות, תשובות והזדמנויות שקורות בזמן אמת, כל יום.\n"
				. "🎓 | מומחים אורחים | מפגשי עומק עם המובילים בתחום, רק לחברי הקהילה.\n"
				. "🤝 | שיתוף עסקאות | חברי הקהילה חולקים עסקאות, שותפויות והזדמנויות ראשונים.";
			$id = self::upsert(
				'nad_community',
				'comm_' . ( $i + 1 ),
				$c[1],
				array( 'tagline' => $c[2], 'members_count' => $c[3], 'about' => $c[5], 'happenings' => $happenings ),
				self::img( $c[4], 1200 )
			);
			if ( ! $id ) {
				continue;
			}
			$n++;
			// Clean English slug for /community/<slug>.
			if ( get_post_field( 'post_name', $id ) !== $c[0] ) {
				wp_update_post( array( 'ID' => $id, 'post_name' => $c[0] ) );
			}
			// "מהשטח" gallery.
			if ( function_exists( 'update_field' ) ) {
				$gids = array();
				foreach ( $c[6] as $g ) {
					$aid = self::sideload( self::img( $g, 800 ), 'comm-' . $c[0] . '-' . substr( $g, 0, 12 ) . '.jpg' );
					if ( $aid ) {
						$gids[] = $aid;
					}
				}
				if ( $gids ) {
					update_field( 'gallery', $gids, $id );
				}
			}
		}
		return $n;
	}

	private static function seed_nadlanistim() {
		// The community index / directory people. Each is a full profile backing /nadlanistim and
		// /nadlanist/<slug>, and also feeds the homepage "meet our people" marquee (name/role/quote).
		// [ slug, pravatar-id, name, role, field, place, quote, bio[], email ]
		$items = array(
			array(
				'avi-cohen', 12, 'אבי כהן', 'יזם נדל״ן ומנטור', 'יזמות', 'תל אביב',
				'מאמין בכוחה של קהילה לשינוי וצמיחה אישית ומקצועית.',
				array(
					'אבי כהן הוא יזם נדל״ן ותיק עם למעלה מ‑20 שנות ניסיון בתחום. הוא החל את דרכו כמשקיע קטן והפך לאחד השמות המובילים בענף, עם פרויקטים מוצלחים למגורים ומסחר ברחבי הארץ. אבי ידוע בגישתו החדשנית ובמחויבותו לקהילה.',
					'מה שהביא אותי לקהילה הוא הרצון לחלוק ידע וניסיון עם דור היזמים הבא, וללמוד מנקודות מבט חדשות. אני מאמין בכוחה של קהילה תומכת ליצירת הזדמנויות וצמיחה הדדית.',
					'הישג מיוחד שאני גאה בו הוא פרויקט ״גני העיר״ בתל אביב, ששילב בנייה ירוקה עם עיצוב מודרני, והפך למודל לחיקוי בתעשייה.',
					'בתחביבים שלי אני אוהב לטייל בטבע, לקרוא ספרי היסטוריה ולשחק שחמט. אני מאמין שאיזון בין עבודה לחיים אישיים הוא המפתח להצלחה.',
				),
				'avi@nadlanistim.co.il',
			),
			array(
				'sara-levi', 5, 'שרה לוי', 'מומחית לשיווק דיגיטלי בנדל״ן', 'שיווק', 'מרכז',
				'התשוקה שלי היא לחבר בין אנשים לנכסים, דרך חדשנות.',
				array(
					'שרה מובילה אסטרטגיות שיווק דיגיטלי לחברות נדל״ן מובילות, עם התמחות בבניית קמפיינים שממירים עניין לעסקאות.',
					'אני כאן כדי לעזור ליזמים ולמתווכים להבין את הכוח של הדיגיטל — ולהשתמש בו נכון כדי לבלוט בשוק רווי.',
				),
				'sara@nadlanistim.co.il',
			),
			array(
				'david-mizrahi', 33, 'דוד מזרחי', 'יועץ השקעות נדל״ן', 'ייעוץ', 'כל הארץ',
				'אני כאן כדי לעזור לכם למצוא את ההשקעה הבאה שלכם.',
				array(
					'דוד מלווה משקיעים פרטיים ומוסדיים באיתור, ניתוח וסגירת עסקאות נדל״ן — מהפריפריה ועד המרכז.',
					'הגישה שלי פשוטה: נתונים לפני רגש, ותכנון לפני חתימה. ככה בונים תיק נכסים שמחזיק לאורך זמן.',
				),
				'david@nadlanistim.co.il',
			),
			array(
				'rachel-cohen', 24, 'רחל כהן', 'אדריכלית ומעצבת פנים', 'אדריכלות', 'ירושלים',
				'יוצרת חללים שמשלבים פונקציונליות ויופי.',
				array(
					'רחל מתכננת מבני מגורים ומסחר, עם דגש על בנייה ירוקה, אור טבעי ושימוש חכם בשטח.',
					'אני מאמינה שאדריכלות טובה לא רק נראית טוב — היא משנה את איך שאנשים חיים ועובדים במרחב.',
				),
				'rachel@nadlanistim.co.il',
			),
			array(
				'yossi-levi', 53, 'יוסי לוי', 'מתווך נדל״ן בכיר', 'תיווך', 'הרצליה',
				'מוצא את הבית המושלם לכל לקוח, בכל פעם מחדש.',
				array(
					'יוסי מתמחה בתיווך נכסי יוקרה במרכז הארץ, עם היכרות עמוקה של השוק ורשת קשרים רחבה.',
					'בשבילי תיווך זה קודם כל אמון. לקוח מרוצה חוזר, וממליץ — וזה כל הסיפור.',
				),
				'yossi@nadlanistim.co.il',
			),
			array(
				'michal-mizrahi', 47, 'מיכל מזרחי', 'שמאית מקרקעין', 'שמאות', 'כל הארץ',
				'מספקת הערכות שווי מדויקות ואמינות לכל סוגי הנכסים.',
				array(
					'מיכל שמאית מקרקעין מוסמכת, המלווה עסקאות, פרויקטים ובדיקות נאותות עבור גופים פרטיים ומוסדיים.',
					'דיוק ואובייקטיביות הם הבסיס לעבודה שלי — כי החלטה טובה מתחילה בהערכה נכונה.',
				),
				'michal@nadlanistim.co.il',
			),
		);
		$n = 0;
		foreach ( $items as $i => $it ) {
			list( $slug, $img, $name, $role, $field, $place, $quote, $bio, $email ) = $it;
			$id = self::upsert(
				'nad_nadlanist',
				'nad_' . $i,
				$name,
				array(
					'role'  => $role,
					'field' => $field,
					'place' => $place,
					'quote' => $quote,
					'bio'   => implode( "\n", $bio ),
					'email' => $email,
				),
				'https://i.pravatar.cc/400?img=' . $img
			);
			if ( $id ) {
				wp_update_post( array( 'ID' => $id, 'post_name' => $slug ) );
				$n++;
			}
		}
		return $n;
	}

	/**
	 * Seed "נבחרת הנדלניסטים הצעירים" — youth-team members. They are nad_nadlanist posts in the
	 * "צעירים" cohort (nad_cohort), which is what separates the /youth page from the main directory
	 * (/nadlanistim). Content comes from includes/youth-seed-data.php (generated from
	 * app/youth/data.ts). Featured image sideloaded from the pravatar portrait.
	 */
	private static function seed_youth() {
		$youth = include __DIR__ . '/youth-seed-data.php';
		if ( ! is_array( $youth ) ) {
			return 0;
		}
		$n = 0;
		foreach ( $youth as $m ) {
			$id = self::upsert(
				'nad_nadlanist',
				'youth_' . $m['slug'],
				$m['name'],
				array(
					'role'      => $m['role'],
					'field'     => $m['field'],
					'place'     => $m['place'],
					'one_liner' => $m['one_liner'],
					'quote'     => $m['quote'],
					'bio'       => $m['bio'],
					'focus'     => $m['focus'],
					'email'     => $m['email'],
				),
				'https://i.pravatar.cc/400?img=' . (int) $m['img'],
				array( 'nad_cohort' => 'צעירים' )
			);
			if ( ! $id ) {
				continue;
			}
			$n++;
			if ( get_post_field( 'post_name', $id ) !== $m['slug'] ) {
				wp_update_post( array( 'ID' => $id, 'post_name' => $m['slug'] ) );
			}
		}
		return $n;
	}

	private static function seed_jobs() {
		// Full postings for the board + the single job page. Each is a community posting credited
		// to a person (מפרסם), with a "type of ad" (employment). description holds paragraphs
		// (blank line between), requirements/tags are one item per line.
		// [ title, publisher, employment, location, description, requirements[], tags[], email,
		//   phone, homepage-tag, img-frag, post-date, field(תחום עיסוק) ]
		$items = array(
			array(
				'מנהל/ת פרויקטים בנדל״ן', 'אבי כהן', 'full', 'תל אביב',
				"אנו מחפשים מנהל/ת פרויקטים מנוסה ומוכשר/ת להצטרף לצוות הדינמי שלנו. התפקיד כולל ניהול פרויקטים מורכבים בתחום הנדל״ן, החל משלב התכנון הראשוני, דרך הליווי והביצוע בשטח, ועד למסירה הסופית ללקוח. המועמד/ת תהיה אחראי/ת על עמידה בלוחות זמנים, ניהול תקציב, תיאום בין גורמים שונים (קבלנים, אדריכלים, מהנדסים), ובקרת איכות.\n\nהתפקיד דורש יכולות ניהוליות גבוהות, ראייה מערכתית, יכולת פתרון בעיות ויחסי אנוש מצוינים. הזדמנות מצוינת להשתלב בחברה מובילה בתחומה ולהיות חלק מפרויקטים משמעותיים המשפיעים על נוף העיר.",
				array( 'ניסיון מוכח של 3 שנים לפחות בניהול פרויקטים בתחום הנדל״ן.', 'השכלה רלוונטית (הנדסה אזרחית, אדריכלות, ניהול פרויקטים).', 'יכולת עבודה עצמאית ובצוות.', 'שליטה מלאה בתוכנות MS Project ו‑Office.', 'רישיון נהיגה בתוקף.', 'יכולת הגעה עצמאית לאתרי הפרויקטים.' ),
				array( 'ניסיון', 'תל אביב', 'משרה מלאה', 'ניהול פרויקטים', 'נדל״ן' ),
				'jobs@nadlanistim.co.il', '050-1234567', 'קריירה · ניהול', '1556157382-97eda2d62296', '2023-11-15', 'ניהול',
			),
			array(
				'יועץ/ת שיווק דיגיטלי', 'שרה לוי', 'freelance', 'מרחוק',
				'מחפשים יועץ/ת שיווק דיגיטלי לבניית אסטרטגיות וניהול קמפיינים לחברות נדל״ן. עבודה מרחוק בגמישות מלאה, מול לקוחות מובילים בענף.',
				array( 'ניסיון של שנתיים לפחות בשיווק דיגיטלי.', 'שליטה בפלטפורמות פרסום (Google, Meta).', 'יכולת ניתוח נתונים והפקת תובנות.', 'יתרון לניסיון בתחום הנדל״ן.' ),
				array( 'שיווק דיגיטלי', 'מרחוק', 'פרילנס', 'קמפיינים' ),
				'sara@nadlanistim.co.il', '052-2345678', 'קריירה · שיווק', '1507003211169-0a1dd7228f2d', '2023-11-14', 'שיווק',
			),
			array(
				'שותף/ה למיזם סטארט-אפ נדל״ן', 'דוד מזרחי', 'partnership', 'תל אביב',
				'מיזם פרופטק בתחום הנדל״ן מחפש שותף/ה טכנולוגי/ת עם ניסיון בפיתוח פלטפורמות דיגיטליות. הזדמנות להיכנס כשותף/ה מהיום הראשון ולבנות מוצר משמעותי.',
				array( 'ניסיון בפיתוח מוצרי SaaS.', 'הבנה עסקית וראייה יזמית.', 'יכולת עבודה בסביבת סטארט-אפ.', 'יתרון להיכרות עם שוק הנדל״ן.' ),
				array( 'סטארט-אפ', 'שותפות', 'פרופטק', 'טכנולוגיה' ),
				'david@nadlanistim.co.il', '053-3456789', 'שותפות · סטארט-אפ', '1521119989659-a83eee488004', '2023-11-13', 'טכנולוגיה',
			),
			array(
				'מתנדב/ת לפרויקט שיפוץ קהילתי', 'רחל כהן', 'volunteering', 'ירושלים',
				'פרויקט קהילתי בירושלים מחפש מתנדבים עם ידע בשיפוצים קלים. הזדמנות לתרום לקהילה, להכיר אנשים חדשים מהתחום ולעשות טוב.',
				array( 'ידע בסיסי בשיפוצים קלים.', 'זמינות לימי עבודה בסופי שבוע.', 'רוח התנדבותית ועבודת צוות.' ),
				array( 'התנדבות', 'קהילה', 'ירושלים', 'שיפוצים' ),
				'rachel@nadlanistim.co.il', '054-4567890', 'התנדבות · קהילה', '1551836022-d5d88e9218df', '2023-11-12', 'הנדסה',
			),
			array(
				'מתווך/ת נדל״ן למשרד בוטיק', 'יוסי לוי', 'part', 'הרצליה',
				'משרד תיווך בוטיק בהרצליה מגייס מתווך/ת עם רישיון וניסיון. סביבת עבודה יוקרתית, תיק לקוחות איכותי ותנאים מצוינים.',
				array( 'רישיון תיווך בתוקף.', 'ניסיון של שנה לפחות בתיווך.', 'יכולת מכירה ושירותיות גבוהה.', 'ייצוגיות ותקשורת בין-אישית מצוינת.' ),
				array( 'תיווך', 'הרצליה', 'משרה חלקית', 'מכירות' ),
				'yossi@nadlanistim.co.il', '055-5678901', 'קריירה · תיווך', '1554469384-e58fac16e23a', '2023-11-11', 'תיווך',
			),
			array(
				'שמאי/ת מקרקעין עצמאי/ת', 'מיכל מזרחי', 'services', 'כל הארץ',
				'שמאית מקרקעין מוסמכת מציעה שירותי הערכת שווי לנכסים בכל הארץ. עבודה מול פרטיים, יזמים וגופים מוסדיים, בזמינות גבוהה ובמקצועיות.',
				array( 'תעודת שמאי/ת מקרקעין מוסמך/ת.', 'ניסיון בהערכת נכסים מגוונים.', 'זמינות לעבודה בכל הארץ.' ),
				array( 'שמאות', 'מקרקעין', 'שירותים', 'כל הארץ' ),
				'michal@nadlanistim.co.il', '056-6789012', 'שירותים · שמאות', '1486406146926-c627a92ad1ab', '2023-11-10', 'שמאות',
			),
		);
		$n      = 0;
		$seeded = array();
		foreach ( $items as $i => $it ) {
			list( $title, $publisher, $employment, $location, $desc, $reqs, $tags, $email, $phone, $tag, $frag, $date, $field ) = $it;
			$id = self::upsert(
				'nad_job',
				'job_' . $i,
				$title,
				array(
					'publisher'     => $publisher,
					// The homepage jobs card shows a company; a personal posting stands in as its
					// own publisher so that card is not left blank.
					'company'       => $publisher,
					'employment'    => $employment,
					'location'      => $location,
					'field'         => $field,
					'description'   => $desc,
					'requirements'  => implode( "\n", $reqs ),
					'tags'          => implode( "\n", $tags ),
					'contact_email' => $email,
					'contact_phone' => $phone,
					'tag'           => $tag,
				),
				self::img( $frag, 1100 )
			);
			if ( $id ) {
				// The board card shows the publish date (DD.MM.YYYY); set it to match the prototype.
				wp_update_post( array( 'ID' => $id, 'post_date' => $date . ' 09:00:00', 'post_date_gmt' => $date . ' 06:00:00' ) );
				$seeded[] = array( 'id' => $id, 'title' => $title );
				$n++;
			}
		}

		// Reconcile each slug with its (possibly changed) title. WordPress keeps the original
		// post_name when a title changes on update, so a retitled demo job keeps a stale slug —
		// the /jobs/<slug> URL then does not match the job. Two passes: first park every job on a
		// throwaway slug so the real ones are freed, then assign the title-based slug — otherwise
		// a job claiming a slug another job still holds would get a "-2" suffix.
		foreach ( $seeded as $k => $s ) {
			wp_update_post( array( 'ID' => $s['id'], 'post_name' => 'nadjob-tmp-' . $k ) );
		}
		foreach ( $seeded as $s ) {
			wp_update_post( array( 'ID' => $s['id'], 'post_name' => sanitize_title( $s['title'] ) ) );
		}

		return $n;
	}

	/**
	 * Two sample jobs in non-published states, so the דרושים panel shows the review workflow —
	 * "חדש" (just submitted) and "ממתין לאישור" (pending) next to the published ones. They stay
	 * OFF the public board (only published jobs are shown there). Remove once real member
	 * submissions exist.
	 */
	private static function seed_job_status_samples() {
		// [ key, status, days-old, title, publisher, employment, location, desc ]
		// "New" is a time flag (< nad_job_new_days, default 7): the fresh sample shows חדש + its
		// status; the older one shows only ממתין לאישור — so the panel demonstrates both pills and
		// the "new" pill vanishing. Both are pending, so neither leaks onto the public board.
		$samples = array(
			array( 'job_sample_new', 'pending', 0, 'דוגמה — משרה שהוגשה היום (חדש + ממתין לאישור)', 'אבי כהן', 'full', 'תל אביב', 'משרת דוגמה שהוגשה זה עתה — מציגה את שתי התוויות: ״חדש״ (זמנית) ו״ממתין לאישור״.' ),
			array( 'job_sample_pending', 'pending', 20, 'דוגמה — משרה שהוגשה מזמן (ממתין לאישור בלבד)', 'שרה לוי', 'freelance', 'מרחוק', 'משרת דוגמה שהוגשה לפני זמן — תווית ״חדש״ כבר נעלמה, נשארת רק ״ממתין לאישור״.' ),
		);
		$n = 0;
		foreach ( $samples as $s ) {
			list( $key, $status, $days, $title, $publisher, $employment, $location, $desc ) = $s;
			$id = self::upsert(
				'nad_job',
				$key,
				$title,
				array(
					'publisher'   => $publisher,
					'company'     => $publisher,
					'employment'  => $employment,
					'location'    => $location,
					'description' => $desc,
				)
			);
			if ( $id ) {
				// upsert() publishes at "now"; set the demo status + a creation date `$days` old.
				$gmt = gmdate( 'Y-m-d H:i:s', time() - ( $days * DAY_IN_SECONDS ) );
				wp_update_post( array( 'ID' => $id, 'post_status' => $status, 'post_date' => $gmt, 'post_date_gmt' => $gmt ) );
				$n++;
			}
		}
		return $n;
	}

	private static function seed_collabs() {
		// Collaboration postings for the board + the single collaboration page. Each is credited to
		// a person (מפרסם) with a role, states the partner sought (looking), investment level and
		// stage. description holds paragraphs (blank line between), looking_list one item per line.
		// The slug is the prototype's English slug (the /collaboration/<slug> URL), not the title.
		// [ slug, title, looking, invest, stage, place, by, by_role, description, looking_list[],
		//   tags[], email, phone, img-frag, date ]
		$items = array(
			array(
				'pinui-binui-givat-shmuel', 'פינוי־בינוי, גבעת שמואל', 'financial', '1m', 'permits',
				'גבעת שמואל, מרכז', 'איתי לבנון', 'יזם, לבנון נדל״ן',
				"פרויקט פינוי־בינוי בשל בגבעת שמואל, 240 יחידות דיור, בשלב תכנון מתקדם ולקראת הגשת בקשה להיתר. הקרקע מאותרת, בעלי הדירות מגובשים, ורוב החתימות כבר בידינו.\n\nאנחנו מחפשים שותף פיננסי אסטרטגי שיצטרף למיזם — לא רק כמשקיע פסיבי, אלא כמי שרוצה להיות חלק מפרויקט דגל עם תשואה ברורה ולוח זמנים ריאלי.",
				array( 'שותף/ה עם יכולת השקעה של מיליון ₪ ומעלה.', 'ניסיון או היכרות עם תחום ההתחדשות העירונית — יתרון.', 'ראייה ארוכת טווח ושותפות אמיתית לאורך הפרויקט.' ),
				array( 'התחדשות עירונית', 'פינוי־בינוי', 'מרכז', 'שותף פיננסי' ),
				'itay@nadlanistim.co.il', '050-1234567', '1545324418-cc1a3fa10c00', '2023-11-15',
			),
			array(
				'mercantile-rosh-haayin', 'מתחם מסחרי, ראש העין', 'profession', '500k', 'idea',
				'ראש העין, מרכז', 'נועה ברגר', 'יזמית, ברגר השקעות',
				"הזדמנות לרכישת קרקע מסחרית באזור צומח בראש העין, עם פוטנציאל להקמת מתחם מסחר ומשרדים. המיזם בשלב גיבוש ראשוני ומחפש שותף מקצועי שיוביל אותו קדימה.\n\nמתאים למי שמכיר את התחום המסחרי ורוצה להיכנס בשלב מוקדם, עם השפעה על התכנון והאופי של הפרויקט.",
				array( 'שותף/ה עם ניסיון בייזום מסחרי.', 'יכולת להשקיע עד 500K ולהוביל תכנון.', 'היכרות עם רשויות התכנון באזור המרכז — יתרון.' ),
				array( 'קרקע יזמית', 'מסחרי', 'מרכז', 'שותף מקצועי' ),
				'noa@nadlanistim.co.il', '050-2345678', '1486406146926-c627a92ad1ab', '2023-11-14',
			),
			array(
				'luxury-tower-ramat-gan', 'מגדל יוקרה, רמת גן', 'contractor', '1m', 'exec',
				'רמת גן, מרכז', 'רן מימון', 'מנכ״ל, מימון בנייה',
				"מגדל יוקרה בן 32 קומות ברמת גן, בשלב ביצוע. אנחנו מחפשים קבלן מבצע מנוסה להשלמת שלבי השלד והגמר בלוח זמנים צפוף.\n\nפרויקט מוגדר, מתוקצב ומאושר — נדרש שותף ביצוע אמין עם צוותים זמינים ויכולת עמידה באבני דרך.",
				array( 'קבלן רשום עם ניסיון במגדלי מגורים.', 'צוותי שלד וגמר זמינים.', 'יכולת עמידה בלוחות זמנים ובתקני איכות.' ),
				array( 'בנייה', 'מגדל יוקרה', 'מרכז', 'קבלן' ),
				'ran@nadlanistim.co.il', '050-3456789', '1448630360428-65456885c650', '2023-11-13',
			),
			array(
				'proptech-management-platform', 'פלטפורמת ניהול נכסים', 'proptech', 'none', 'advanced',
				'כל הארץ', 'שירה אלוני', 'מייסדת, PropAI',
				"סטארטאפ פרופטק עם מוצר בשל לניהול תיקי נכסים, מחפש יועץ/ת מהתעשייה שיצטרף כשותף אסטרטגי (אדוויזר) בתמורה לאקוויטי.\n\nלא נדרשת השקעה כספית — נדרשים ידע, קשרים בענף וליווי בכניסה לשוק הישראלי.",
				array( 'היכרות עמוקה עם שוק הנדל״ן והפרופטק.', 'רשת קשרים רלוונטית לגיוס לקוחות ראשונים.', 'זמינות לליווי חודשי ולפגישות אסטרטגיה.' ),
				array( 'טכנולוגיה', 'פרופטק', 'אדוויזרי', 'אקוויטי' ),
				'shira@nadlanistim.co.il', '050-4567890', '1518770660439-4636190af475', '2023-11-12',
			),
			array(
				'agri-land-north', 'קרקע חקלאית להפשרה', 'land', '100k', 'idea',
				'צפון', 'דוד מזרחי', 'יועץ השקעות נדל״ן',
				"הזדמנות כניסה מוקדמת לקרקע חקלאית בצפון עם פוטנציאל הפשרה עתידי. עסקה למשקיעים סבלניים שמחפשים כניסה בסכום נמוך יחסית.\n\nמחפשים שותפים לקבוצת רכישה קטנה, שיתחלקו בסיכון ובפוטנציאל לאורך זמן.",
				array( 'שותפים לקבוצת רכישה, כניסה מ‑100K.', 'הבנה של סיכוני קרקע חקלאית ואופק ארוך.', 'רצון להיות חלק מקבוצה מגובשת.' ),
				array( 'קרקע', 'השבחה', 'צפון', 'קבוצת רכישה' ),
				'david@nadlanistim.co.il', '050-5678901', '1500382017468-9049fed747ef', '2023-11-11',
			),
			array(
				'real-estate-debt-fund', 'קרן חוב נדל״ן', 'investor', '1m', 'building',
				'מרכז', 'יואב פרידמן', 'מנכ״ל, פרידמן השקעות',
				"הקמת קרן חוב נדל״ן פרטית עם גיוס ראשון של 120M ₪. הקרן תממן פרויקטים יזמיים בליווי פיננסי, ומחפשת משקיעים שותפים לסבב ההקמה.\n\nמתאים למשקיעים מתוחכמים שמחפשים חשיפה לנדל״ן דרך חוב מובטח, עם תשואה יציבה ופיזור סיכונים.",
				array( 'משקיעים כשירים, כניסה ממיליון ₪.', 'אופק השקעה בינוני עד ארוך.', 'הבנה של מכשירי חוב וליווי פיננסי.' ),
				array( 'השקעות', 'קרן חוב', 'מרכז', 'משקיע שותף' ),
				'yoav@nadlanistim.co.il', '050-6789012', '1582407947304-fd86f028f716', '2023-11-10',
			),
		);
		// The "סוג" (type / domain) shown in the single-page meta row — free text, per the prototype.
		$types = array(
			'pinui-binui-givat-shmuel'     => 'התחדשות עירונית',
			'mercantile-rosh-haayin'       => 'קרקע יזמית',
			'luxury-tower-ramat-gan'       => 'בנייה',
			'proptech-management-platform' => 'טכנולוגיה',
			'agri-land-north'              => 'קרקע',
			'real-estate-debt-fund'        => 'השקעות',
		);
		$n = 0;
		foreach ( $items as $i => $it ) {
			list( $slug, $title, $looking, $invest, $stage, $place, $by, $by_role, $desc, $looking_list, $tags, $email, $phone, $frag, $date ) = $it;
			$id = self::upsert(
				'nad_collab',
				'collab_' . $i,
				$title,
				array(
					'looking'        => $looking,
					'board_tab'      => 'looking', // the 6 reference collabs live under "מחפש שותף".
					'type'           => isset( $types[ $slug ] ) ? $types[ $slug ] : '',
					'invest'         => $invest,
					'stage'          => $stage,
					'place'          => $place,
					'by'             => $by,
					'by_role'        => $by_role,
					'published_date' => $date,
					'description'    => $desc,
					'looking_list'   => implode( "\n", $looking_list ),
					'tags'           => implode( "\n", $tags ),
					'email'          => $email,
					'phone'          => $phone,
				),
				self::img( $frag, 1100 )
			);
			if ( $id ) {
				// Keep the prototype English slug + set the publish date (board orders by date).
				wp_update_post( array( 'ID' => $id, 'post_name' => $slug, 'post_date' => $date . ' 09:00:00', 'post_date_gmt' => $date . ' 06:00:00' ) );
				$n++;
			}
		}
		return $n;
	}

	/**
	 * Demo collaborations for the board's "פרויקטים פעילים" (active) and "סיפורי הצלחה" (success)
	 * tabs, so those tabs are not empty. Titled "דוגמה — …" and kept in their own seeder so they
	 * are obvious and easy to delete (Trash them in wp-admin) when the client wants them gone.
	 * [ slug, title, board_tab, looking, invest, stage, type, place, by, by_role, description,
	 *   looking_list[], tags[], email, phone, img-frag, date ]
	 */
	private static function seed_collab_tab_samples() {
		$items = array(
			array(
				'sample-active-netanya', 'דוגמה — מתחם דיור מוגן, נתניה', 'active', 'investor', '1m', 'building', 'דיור מוגן',
				'נתניה, מרכז', 'ליאור שגב', 'יזם, שגב פרויקטים',
				"פרויקט דיור מוגן בהקמה בנתניה, 180 יחידות, בשלב בנייה פעיל. השותפות סגורה ומתקדמת לפי לוח הזמנים; מוצג כאן כדוגמה ללשונית ״פרויקטים פעילים״.",
				array( 'שותף פיננסי מלווה לאורך הבנייה.', 'ניסיון בדיור מוגן — יתרון.' ),
				array( 'דיור מוגן', 'פרויקט פעיל', 'מרכז' ),
				'lior@nadlanistim.co.il', '050-7001001', '1512917774080-9991f1c4c750', '2023-11-09',
			),
			array(
				'sample-active-beer-sheva', 'דוגמה — התחדשות מרכז מסחרי, באר שבע', 'active', 'profession', '500k', 'exec', 'מסחרי',
				'באר שבע, דרום', 'דנה אבידן', 'מנהלת פרויקטים, אבידן קבוצה',
				"התחדשות מרכז מסחרי בבאר שבע, בשלב ביצוע. פרויקט פעיל עם צוות מגובש; מוצג כאן כדוגמה ללשונית ״פרויקטים פעילים״.",
				array( 'שותף מקצועי לניהול הביצוע.', 'היכרות עם השוק הדרומי — יתרון.' ),
				array( 'מסחרי', 'התחדשות', 'דרום' ),
				'dana@nadlanistim.co.il', '050-7002002', '1479839672679-a46483c0e7c8', '2023-11-08',
			),
			array(
				'sample-success-haifa', 'דוגמה — פרויקט מגורים שהושלם, חיפה', 'success', 'financial', '1m', 'exec', 'מגורים',
				'חיפה, צפון', 'עומר טל', 'יזם, טל בנייה',
				"פרויקט מגורים בן 90 יחידות בחיפה, הושלם ונמסר לדיירים. השותפות שנוצרה כאן הובילה לאקזיט מוצלח; מוצג כדוגמה ללשונית ״סיפורי הצלחה״.",
				array( 'שותפות פיננסית שליוותה מהתכנון ועד המסירה.', 'אמון ושקיפות לאורך כל הדרך.' ),
				array( 'מגורים', 'הושלם', 'צפון', 'סיפור הצלחה' ),
				'omer@nadlanistim.co.il', '050-7003003', '1449844908441-8829872d2607', '2023-11-07',
			),
			array(
				'sample-success-modiin', 'דוגמה — שותפות שהניבה אקזיט, מודיעין', 'success', 'investor', '1m', 'advanced', 'נדל״ן מניב',
				'מודיעין, מרכז', 'נועה קסטרו', 'שותפה מנהלת',
				"שותפות להקמת נכס מניב במודיעין שהבשילה לאקזיט מוצלח למשקיעים. מוצג כדוגמה ללשונית ״סיפורי הצלחה״.",
				array( 'משקיעים שותפים לטווח ארוך.', 'אסטרטגיית יציאה ברורה מראש.' ),
				array( 'נדל״ן מניב', 'אקזיט', 'מרכז', 'סיפור הצלחה' ),
				'noa.castro@nadlanistim.co.il', '050-7004004', '1554469384-e58fac16e23a', '2023-11-06',
			),
		);
		$n = 0;
		foreach ( $items as $i => $it ) {
			list( $slug, $title, $board_tab, $looking, $invest, $stage, $type, $place, $by, $by_role, $desc, $looking_list, $tags, $email, $phone, $frag, $date ) = $it;
			$id = self::upsert(
				'nad_collab',
				'collab_tab_sample_' . $i,
				$title,
				array(
					'looking'        => $looking,
					'board_tab'      => $board_tab,
					'type'           => $type,
					'invest'         => $invest,
					'stage'          => $stage,
					'place'          => $place,
					'by'             => $by,
					'by_role'        => $by_role,
					'published_date' => $date,
					'description'    => $desc,
					'looking_list'   => implode( "\n", $looking_list ),
					'tags'           => implode( "\n", $tags ),
					'email'          => $email,
					'phone'          => $phone,
				),
				self::img( $frag, 1100 )
			);
			if ( $id ) {
				wp_update_post( array( 'ID' => $id, 'post_name' => $slug, 'post_date' => $date . ' 09:00:00', 'post_date_gmt' => $date . ' 06:00:00' ) );
				$n++;
			}
		}
		return $n;
	}

	private static function seed_deals() {
		$items = array(
			array( '1545324418-cc1a3fa10c00', 'התחדשות עירונית', 'פינוי‑בינוי, גבעת שמואל', 'שיתוף פעולה בין 3 יזמים שנפגשו בקהילה. 240 יחידות.', '2024 — היום', '3 שותפים' ),
			array( '1486406146926-c627a92ad1ab', 'קרקע יזמית', 'מתחם מסחרי, ראש העין', 'קבוצת השקעה של 14 חברי קהילה. הון של 28M ש״ח.', '2023', '14 שותפים' ),
			array( '1448630360428-65456885c650', 'מגדל יוקרה', 'מגדל הברזל, רמת גן', 'שותפות יזמית בין שני חברים. 32 קומות, מסחר ומגורים.', '2022 — 2025', '2 שותפים' ),
			array( '1582407947304-fd86f028f716', 'קומבינציה', 'קרן חוב נדל״ן', 'קרן שהוקמה על ידי 4 חברי קהילה. 120M ש״ח גיוס ראשון.', '2024', '4 שותפים' ),
		);
		$n = 0;
		foreach ( $items as $i => $it ) {
			if ( self::upsert( 'nad_deal', 'deal_' . $i, $it[2], array( 'tag' => $it[1], 'description' => $it[3], 'period' => $it[4], 'partners' => $it[5] ), self::img( $it[0], 900 ) ) ) {
				$n++;
			}
		}
		return $n;
	}

	private static function seed_podcasts() {
		// Full episodes from includes/podcast-seed-data.php (generated from app/podcast/data.ts).
		$episodes = include __DIR__ . '/podcast-seed-data.php';
		if ( ! is_array( $episodes ) ) {
			return 0;
		}
		$n = 0;
		foreach ( $episodes as $i => $e ) {
			$id = self::upsert(
				'nad_podcast',
				'pod_' . $i,
				$e['title'],
				array(
					'episode_number' => $e['num'],
					'description'    => $e['desc'],
					'guests'         => $e['guests'],
					'duration'       => $e['duration'],
					'air_date'       => $e['date'],
					'notes'          => $e['notes'],
				),
				self::img( $e['img'], 900 )
			);
			if ( ! $id ) {
				continue;
			}
			$n++;
			if ( get_post_field( 'post_name', $id ) !== $e['slug'] ) {
				wp_update_post( array( 'ID' => $id, 'post_name' => $e['slug'] ) );
			}
			// Demo: a direct MP3 URL on the first episode so the on-page player is testable. The
			// client sets their own MP3 link per episode in "קישור לקובץ שמע (MP3)" — no site upload.
			if ( 0 === $i && function_exists( 'update_field' ) ) {
				update_field( 'audio_src', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', $id );
			}
		}
		return $n;
	}

	private static function seed_events() {
		// Upcoming — [date Ymd, event_type, accent, title, desc, place, time, img]
		$upcoming = array(
			array( '20260528', 'ארוחת ערב סגורה', false, 'שולחן עגול — יזמי התחדשות עירונית', '20 יזמים. שולחן אחד. נושאים חמים בתעשייה. רק לחברי קהילה.', 'מסעדת מסה, תל אביב', '20:00', '1414235077428-338989a2e8c0' ),
			array( '20260604', 'מאסטרקלאס', false, 'קרנות חוב פרטיות — A to Z', 'שלוש שעות עומק עם מנהלי שלוש הקרנות המובילות בארץ.', 'WeWork גינדי, ת״א', '09:30', '1505373877841-8d25f7d46678' ),
			array( '20260614', 'הכנס השנתי', true, 'כנס הנדלניסטים 2026', 'היום הגדול של הקהילה. 42 מרצים. 3 פאנלים. 800 משתתפים.', 'אקספו תל אביב', '09:00 — 21:00', '1587825140708-dfaf72ae4b04' ),
			array( '20260702', 'סיור מקצועי', false, 'סיור בפרויקטים החדשים בתל אביב', 'סיור מודרך עם היזמים — ארבעה מגדלים בלב העיר.', 'נקודת מפגש — שרונה', '16:00', '1486406146926-c627a92ad1ab' ),
			array( '20260703', 'מסיבה', false, 'מסיבת הקיץ של הנדלניסטים 2026', 'לילה אחד. הבר פתוח, המוזיקה חזקה, וכל מי שמזיז את הנדל״ן בישראל — על רחבת ריקודים אחת.', 'Rooftop TLV, תל אביב', '21:00 עד מאוחר', '1492684223066-81342ee5ff30' ),
		);
		// Past — [date Ymd, event_type, title, desc, place, img]
		$past = array(
			array( '20250515', 'הכנס השנתי', 'כנס הנדלניסטים 2025', 'יום שלם של פאנלים, עסקאות ונטוורקינג עם מיטב אנשי הענף.', 'אקספו תל אביב', '1540575467063-178a50c2df87' ),
			array( '20250320', 'משלחת בינלאומית', 'משלחת נדל״ן לדובאי', 'חמישה ימים, עשרים חברי קהילה, ושוק שמשנה את כללי המשחק.', 'דובאי, איחוד האמירויות', '1512453979798-5ea266f8880c' ),
			array( '20241210', 'ערב חברים', 'חמש שנים לקהילה — ערב גאלה', 'חגגנו חמש שנים יחד עם כל מי שבנה את הקהילה מהיום הראשון.', 'האנגר 11, נמל ת״א', '1511795409834-ef04bbd61622' ),
		);
		// Volunteer — [date Ymd, title, desc, place, img] (event_type is always התנדבות)
		$volunteer = array(
			array( '20250202', 'שיפוץ מרכז קהילתי', 'מתנדבי הקהילה שיפצו מרכז נוער בשכונה.', 'יפו', '1556761175-5973dc0f32e7' ),
			array( '20250112', 'ייעוץ נדל״ן לזוגות צעירים', 'ערב ייעוץ חינמי עם מיטב היועצים בקהילה.', 'אונליין', '1559223607-a43c990c692c' ),
			array( '20241105', 'סדנת אוריינות פיננסית', 'סדנה פתוחה לקהל הרחב בנושא השקעות נדל״ן.', 'תל אביב', '1582407947304-fd86f028f716' ),
		);
		$n = 0;
		foreach ( $upcoming as $i => $e ) {
			if ( self::upsert( 'nad_event', 'evt_up_' . $i, $e[3],
				array( 'event_date' => $e[0], 'description' => $e[4], 'place' => $e[5], 'time_label' => $e[6], 'is_accent' => $e[2] ? 1 : 0, 'is_past' => 0 ),
				self::img( $e[7], 900 ), array( 'nad_event_type' => $e[1] ) ) ) {
				$n++;
			}
		}
		foreach ( $past as $i => $e ) {
			if ( self::upsert( 'nad_event', 'evt_past_' . $i, $e[2],
				array( 'event_date' => $e[0], 'description' => $e[3], 'place' => $e[4], 'is_accent' => 0, 'is_past' => 1 ),
				self::img( $e[5], 900 ), array( 'nad_event_type' => $e[1] ) ) ) {
				$n++;
			}
		}
		foreach ( $volunteer as $i => $e ) {
			if ( self::upsert( 'nad_event', 'evt_vol_' . $i, $e[1],
				array( 'event_date' => $e[0], 'description' => $e[2], 'place' => $e[3], 'is_accent' => 0, 'is_past' => 1 ),
				self::img( $e[4], 900 ), array( 'nad_event_type' => 'התנדבות' ) ) ) {
				$n++;
			}
		}
		return $n;
	}

	/** Sideload a list of remote image URLs and return their attachment IDs (dropping failures). */
	private static function sideload_ids( $urls, $prefix ) {
		$ids = array();
		foreach ( $urls as $i => $url ) {
			$aid = self::sideload( $url, $prefix . '-' . $i . '.jpg' );
			if ( $aid ) {
				$ids[] = $aid;
			}
		}
		return $ids;
	}

	/**
	 * Enrich the three representative events with the single-page sections (the /event, /event-party
	 * and /event-recap designs). Text sections are stored as delimited `lines`; images (speaker,
	 * DJ lineup, galleries, avatars, video thumb) are sideloaded and stored in image/gallery fields.
	 * Runs after seed_events(), so the three posts already exist; matched by their seed keys.
	 */
	private static function seed_event_singles() {
		if ( ! function_exists( 'update_field' ) ) {
			return 0;
		}
		$conf  = self::post_id_by_seed( 'nad_event', 'evt_up_2' );   // כנס 2026 (accent) → /event
		$party = self::post_id_by_seed( 'nad_event', 'evt_up_4' );   // מסיבת הקיץ 2026 → /event-party
		$recap = self::post_id_by_seed( 'nad_event', 'evt_past_0' ); // כנס 2025 → /event-recap

		if ( $conf ) {
			update_field( 'price', 'חינם לחברי קהילה / 50₪', $conf );
			update_field( 'audience', 'יזמים, משקיעים ובעלי מקצוע', $conf );
			update_field( 'features', "✨ | תוכן/כלי/שיטה | תיאור קצר של הערך.\n🎯 | תרגול מעשי | מה בדיוק נעשה.\n🤝 | נטוורקינג | היכרות עם עוד נדלניסטים ורחבת רשת מקצועית.\n🎁 | חומרים לקחת הביתה | מצגת + מסמכים.\n🧀 | אוכל/שתייה | פיצה, בירה וחיבורים סביב.", $conf );
			update_field( 'speaker_name', 'רן מימון', $conf );
			update_field( 'speaker_role', 'מנכ״ל, מימון בנייה', $conf );
			$sp = self::sideload( 'https://i.pravatar.cc/320?img=53', 'event-speaker.jpg' );
			if ( $sp ) {
				update_field( 'speaker_photo', $sp, $conf );
			}
			update_field( 'speaker_bio', 'בעל ניסיון של מעל 15 שנה בליווי וגיוס קרנות חוב פרטיות. ליווה עשרות עסקאות ופרויקטים, ומחזיק בהיכרות מעמיקה עם השוק המוסדי והפרטי כאחד.', $conf );
			update_field( 'speaker_quote', 'הצלחה בנדל״ן מתחילה בהבנה אמיתית של הכסף שמאחורי העסקה.', $conf );
			update_field( 'speaker_link', '#', $conf );
			update_field( 'testimonials', "האירוע היה פצצה! יצאתי עם 3 כלים חדשים שכבר יישמתי. | שירה אלוני, פרופטק\nנהניתי כל רגע, חיבורים אמיתיים. תודה! | רן מימון, מנכ״ל", $conf );
			update_field( 'faq', "האירוע מתאים גם למתחילים?\nמה לעשות אם אני לא יכול/ה להגיע ברגע האחרון?\nהאם האירוע מוקלט?\nהאם יש חניה במקום?\nאיך אפשר ליצור קשר לשאלות נוספות?", $conf );
		}

		if ( $party ) {
			update_field( 'dress_code', 'Smart casual / לבן', $party );
			update_field( 'entry', 'חינם לחברי קהילה / 80₪', $party );
			update_field( 'vibe', "מוזיקה\nבר פתוח\nנטוורקינג\nריקודים\nהפתעות\nDJ סטים\nאפטר עד הסוף", $party );
			update_field( 'timeline', "21:00 | פתיחת דלתות + בר | מתחממים עם קוקטייל וזיהוי פנים מהקהילה.\n22:00 | DJ סט פתיחה | הביטים מתחילים, הרחבה מתמלאת.\n23:00 | סט ראשי + הפתעה | הרגע שכולם מחכים לו.\n00:30 | אפטר | ממשיכים עד שמכבים את האורות.", $party );
			update_field( 'lineup', "DJ נועם | House / Groove\nDJ שירה | Hits & Throwbacks\nLive: רן מימון | סט סקסופון חי", $party );
			$lineup_ph = self::sideload_ids( array( 'https://i.pravatar.cc/400?img=15', 'https://i.pravatar.cc/400?img=33', 'https://i.pravatar.cc/400?img=52' ), 'dj' );
			if ( $lineup_ph ) {
				update_field( 'lineup_photos', $lineup_ph, $party );
			}
			$party_urls = array();
			foreach ( array( '1470225620780-dba8ba36b745', '1516450360452-9312f5e86fc7', '1429962714451-bb934ecdc4ec', '1514525253161-7a46d19cd819', '1459749411175-04bf5292ceea', '1492684223066-81342ee5ff30' ) as $g ) {
				$party_urls[] = self::img( $g, 700 );
			}
			$party_gal = self::sideload_ids( $party_urls, 'party' );
			if ( $party_gal ) {
				update_field( 'party_gallery', $party_gal, $party );
			}
			update_field( 'party_quotes', "הכי כיף שהיה. רקדנו עד 3, וגם סגרתי עסקה. | נועה ברגר\nסוף סוף אירוע נדל״ן שבא בלי עניבה. | אלון שמיר\nהאנשים, המוזיקה, הוייב — מושלם. | שירה אלוני", $party );
			update_field( 'party_faq', "מה גיל הכניסה?\nיש חניה בקרבת מקום?\nאפשר להביא מלווה שאינו חבר קהילה?\nמה קורה אם יורד גשם? (יש אזור מקורה)", $party );
		}

		if ( $recap ) {
			$recap_urls = array();
			foreach ( array( '1540575467063-178a50c2df87', '1511795409834-ef04bbd61622', '1505373877841-8d25f7d46678', '1556761175-5973dc0f32e7', '1559223607-a43c990c692c', '1591115765373-5207764f72e7' ) as $g ) {
				$recap_urls[] = self::img( $g, 700 );
			}
			$rc_gal = self::sideload_ids( $recap_urls, 'recap' );
			if ( $rc_gal ) {
				update_field( 'recap_gallery', $rc_gal, $recap );
			}
			update_field( 'takeaways', "השוק מתאזן — ההזדמנויות עוברות לפריפריה | הנתונים שהוצגו מראים שינוי ברור באזורי הביקוש, עם פוטנציאל תשואה גבוה מחוץ למרכז.\nמימון חכם מנצח מימון זול | מבנה העסקה והגמישות מול הבנקים חשובים לא פחות מהריבית עצמה.\nקהילה היא יתרון תחרותי | רוב העסקאות שנסגרו השנה התחילו מהיכרות אישית בתוך הקהילה.", $recap );
			update_field( 'video_url', '#', $recap );
			$vt = self::sideload( self::img( '1587825140708-dfaf72ae4b04', 1600 ), 'recap-video.jpg' );
			if ( $vt ) {
				update_field( 'video_thumb', $vt, $recap );
			}
			update_field( 'recap_testimonials', "פשוט שווה כל דקה. | נועה ברגר | יזמית\nהאירוע היה מועיל, למדתי המון. | רן מימון | מנכ״ל\nחיבורים שהתחילו ויהפכו לעסקאות. | שירה אלוני | מייסדת\nאני כבר מחכה לאירוע הבא. | אלון שמיר | סמנכ״ל", $recap );
			$rc_av = self::sideload_ids( array( 'https://i.pravatar.cc/80?img=47', 'https://i.pravatar.cc/80?img=53', 'https://i.pravatar.cc/80?img=24', 'https://i.pravatar.cc/80?img=12' ), 'recap-av' );
			if ( $rc_av ) {
				update_field( 'recap_avatars', $rc_av, $recap );
			}
			update_field( 'downloads', "מצגת האירוע (PDF) | #\nרשימת משימות ליישום (Checklist) | #\nקישורים וכלים שהוזכרו (Link List) | #", $recap );
		}

		return 3;
	}

	/**
	 * Split a title into its two colour parts on an em dash, the way the design does.
	 *
	 * A title with no dash goes entirely in the first part and renders one colour, which is a
	 * valid state. Returns [ main, accent ].
	 */
	private static function split_title( $title ) {
		$parts = preg_split( '/\s+—\s+/u', $title, 2 );
		if ( count( $parts ) === 2 ) {
			return array( trim( $parts[0] ) . ' —', trim( $parts[1] ) );
		}
		return array( trim( $title ), '' );
	}

	/**
	 * Seed the article cards, each now a full article so its /article/[slug] page renders
	 * completely rather than showing an empty template.
	 *
	 * These were card-only stubs before the single article page existed — category, excerpt
	 * and a read-time string, nothing more. Now that every card links to a detail page, each
	 * needs the full field set: split title, cover, author cluster, body and tags. The body is
	 * generated demo copy; the client replaces it, but a seeded article should look complete
	 * when the page is shown back to them.
	 */
	private static function seed_articles() {
		// [ seed_key, category, title, excerpt, author, cover-id, avatar#, firm, specialty, featured, tags[], content_type ]
		$items = array(
			array( 'art_0', 'ניתוח שוק', 'איפה נסגרות עכשיו עסקאות הקרקע הכי טובות?', 'מיפוי של 18 חודשים אחרונים בשוק הקרקעות הפרטי — והאזורים שמתחתם הפעילות שקטה אבל הרווחיות גבוהה.', 'אלון שמיר', '1486325212027-8081e485255e', 12, 'שמיר נכסים', 'ניתוח שוק ונדל״ן', true, array( 'קרקעות', 'ניתוח שוק', 'השקעות' ), 'מחקר' ),
			array( 'art_1', 'רגולציה', 'חוק התחדשות עירונית 2026 — מה צריך לדעת', 'כל מה שיזמים ובעלי דירות חייבים להבין לפני שנכנסים לפרויקט.', 'עו״ד דניאל כהן', '1523217582562-09d0def993a6', 33, 'משרד כהן ושות׳', 'מיסוי נדל״ן', false, array( 'התחדשות עירונית', 'רגולציה', 'משפט' ), 'מדריך' ),
			array( 'art_2', 'פרופטק', '5 פלטפורמות שמשנות את עולם המכרזים', 'הכלים הדיגיטליים שמקצרים את הדרך מהמכרז ועד הזכייה.', 'שירה אלוני', '1551288049-bebda4e38f71', 47, 'PropTech IL', 'טכנולוגיות נדל״ן', false, array( 'פרופטק', 'טכנולוגיה', 'מכרזים' ), 'הסבר' ),
			array( 'art_3', 'מימון', 'קרנות חוב נדל״ן — איך לבחור נכון', 'מה ההבדל בין הקרנות, ואיך מזהים את הסיכון האמיתי.', 'רן מימון', '1554224155-6726b3ff858f', 5, 'מימון ושות׳ ייעוץ', 'מימון והשקעות', false, array( 'מימון', 'השקעות', 'קרנות' ), 'Case Study' ),
		);

		$n = 0;
		foreach ( $items as $i => $a ) {
			list( $key, $cat, $title, $excerpt, $author, $cover_frag, $avatar_num, $firm, $specialty, $featured, $tags, $type ) = $a;
			// Credit each article to a seeded נדלניסט so the author stripe is a live relationship,
			// not free text. seed_nadlanistim() runs first, so nad_0..nad_3 already exist.
			$author_ref = self::post_id_by_seed( 'nad_nadlanist', 'nad_' . $i );
			list( $main, $accent ) = self::split_title( $title );

			$cover_id  = self::sideload( self::img( $cover_frag, 1600 ), 'nadlanistim-' . $key . '-cover.jpg' );
			$avatar_id = self::sideload( 'https://i.pravatar.cc/240?img=' . $avatar_num, 'nadlanistim-' . $key . '-author.jpg' );

			// Demo body: an intro built from the excerpt, then a heading, a point list and a
			// closing paragraph — enough that the layout's every block type is exercised.
			$body = array(
				array( 'acf_fc_layout' => 'paragraph', 'text' => $excerpt ),
				array( 'acf_fc_layout' => 'paragraph', 'text' => 'בכתבה זו נעבור על הנקודות המרכזיות, נבחן מה השתנה לאחרונה, ונראה כיצד להיערך בצורה נכונה. התוכן נכתב עבור חברי קהילת הנדלניסטים ומתעדכן מעת לעת.' ),
				array( 'acf_fc_layout' => 'heading', 'level' => 'h2', 'text' => 'הנקודות המרכזיות', 'accent' => '' ),
				array(
					'acf_fc_layout' => 'list',
					'ordered'       => '0',
					'items'         => "מה חשוב לבדוק לפני שמתחילים.\nאילו גורמים משפיעים על הכדאיות.\nהיכן מסתתרים הסיכונים העיקריים.",
				),
				array( 'acf_fc_layout' => 'paragraph', 'text' => 'השורה התחתונה: היערכות מוקדמת וליווי מקצועי חוסכים זמן וכסף. מומלץ להתייעץ עם אנשי מקצוע מהקהילה לפני קבלת החלטות.' ),
			);

			$id = self::upsert(
				'nad_article',
				$key,
				$title,
				array(
					'title_main'       => $main,
					'title_accent'     => $accent,
					'excerpt'          => $excerpt,
					'author_name'      => $author,
					'author_avatar'    => $avatar_id ?: '',
					'author_firm'      => $firm,
					'author_specialty' => $specialty,
					'author_bio'       => $author . ' — חבר/ת פעיל/ה בקהילת הנדלניסטים, מלווה עסקאות ומשתף/ת ידע מקצועי.',
					'body'             => $body,
					'is_featured'      => $featured ? 1 : 0,
					'content_type'     => $type,
					// The author stripe: a relationship to a נדלניסט in the index. The resolver reads
					// name/photo/role/bio from that record and links the stripe to their profile.
					'author_nadlanist' => $author_ref ?: '',
					// Legacy fields kept populated so the homepage still works, and as the manual
					// fallback the resolver uses when no נדלניסט is linked.
					'author'           => $author,
				),
				'',
				array(
					'nad_article_cat' => $cat,
					'nad_article_tag' => $tags,
				)
			);

			if ( $id ) {
				if ( $cover_id ) {
					set_post_thumbnail( $id, $cover_id );
				}
				$n++;
			}
		}
		return $n;
	}

	/**
	 * Sponsors — the two logo strips on the home page (main partners + event sponsors) were a
	 * hardcoded array in HomeV6. Seeding them into nad_sponsor gives the client an editable panel
	 * (add / remove / reorder, swap a logo) while the home keeps its approved look.
	 *
	 * Logos are sideloaded from the deployed front-end assets (…/v6-assets/sponsors/*), including
	 * SVG — allowed only for the duration of this method, then the filters are removed so the
	 * site's normal upload policy is unchanged. menu_order preserves the design's left-to-right
	 * order (reorderable in wp-admin via the Order field). Sponsors seeded WITHOUT a logo file
	 * (צ׳ריטון / גורניצקי / גושן ארנון) render as their name — the design's own fallback.
	 */
	private static function seed_sponsors() {
		$base = 'https://nadlanistim-phi.vercel.app/v6-assets/sponsors/';
		// [ seed_key, name, tier, logo-file ('' = name only), website ]
		$items = array(
			array( 'spo_shikun',    'שיכון ובינוי', 'main',  'shikun.webp',  'https://www.shikunbinui.com/' ),
			array( 'spo_azorim',    'אזורים',        'main',  'azorim.png',   'https://www.azorim.co.il/' ),
			array( 'spo_donitz',    'דוניץ',         'main',  'donitz.png',   '' ),
			array( 'spo_aura',      'אאורה',         'main',  'aura.png',     '' ),
			array( 'spo_chariton',  'צ׳ריטון',       'main',  '',             '' ),
			array( 'spo_africa',    'אפריקה ישראל',  'main',  'africa.svg',   '' ),
			array( 'spo_leumi',     'בנק לאומי',     'event', 'leumi.png',    'https://www.leumi.co.il/' ),
			array( 'spo_deloitte',  'דלויט',         'event', 'deloitte.svg', 'https://www2.deloitte.com/il/he.html' ),
			array( 'spo_ey',        'EY',            'event', 'ey.svg',       'https://www.ey.com/en_il' ),
			array( 'spo_kpmg',      'KPMG',          'event', 'kpmg.svg',     'https://kpmg.com/il/he/home.html' ),
			array( 'spo_pwc',       'PWC',           'event', 'pwc.svg',      'https://www.pwc.com/il/he.html' ),
			array( 'spo_gornitzky', 'גורניצקי',      'event', '',             '' ),
			array( 'spo_herzog',    'הרצוג פוקס',    'event', 'herzog.png',   'https://www.herzoglaw.co.il/' ),
			array( 'spo_goshen',    'גושן ארנון',    'event', '',             '' ),
		);

		// SVG is blocked by WordPress by default. Allow it only while this method runs so the
		// SVG logos sideload; the site's upload policy is restored on the way out.
		$allow_svg = function ( $mimes ) {
			$mimes['svg'] = 'image/svg+xml';
			return $mimes;
		};
		$fix_svg = function ( $data, $file, $filename ) {
			if ( preg_match( '/\.svg$/i', (string) $filename ) ) {
				$data['ext']  = 'svg';
				$data['type'] = 'image/svg+xml';
			}
			return $data;
		};
		add_filter( 'upload_mimes', $allow_svg );
		add_filter( 'wp_check_filetype_and_ext', $fix_svg, 10, 3 );

		$n = 0;
		foreach ( $items as $order => $s ) {
			list( $key, $name, $tier, $file, $site ) = $s;
			$id = self::upsert(
				'nad_sponsor',
				$key,
				$name,
				array(
					'tier'        => $tier,
					'website_url' => $site,
				)
			);
			if ( ! $id ) {
				continue;
			}
			// Preserve the design's order (main strip, then event) — editable via the Order field.
			wp_update_post( array( 'ID' => $id, 'menu_order' => (int) $order ) );
			// Sideload the logo into the media library and point the ACF image field at it, but
			// only when the sponsor has no logo yet — a logo swapped in wp-admin is never clobbered.
			if ( $file && function_exists( 'update_field' ) && ! get_field( 'logo', $id ) ) {
				$att = self::sideload( $base . $file, sanitize_title( $key ) . '-' . $file );
				if ( $att ) {
					update_field( 'logo', $att, $id );
				}
			}
			$n++;
		}

		remove_filter( 'upload_mimes', $allow_svg );
		remove_filter( 'wp_check_filetype_and_ext', $fix_svg, 10 );
		return $n;
	}
}
