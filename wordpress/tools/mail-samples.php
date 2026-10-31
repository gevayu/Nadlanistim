<?php
/**
 * One sample of every email the site sends, to check language and direction. Run from the WordPress root:
 *
 *   wp eval-file mail-samples.php capture            nothing leaves the server; prints each email and any English in it
 *   wp eval-file mail-samples.php send you@example.com  every sample goes to that one address, subject marked "[דוגמה N]"
 *
 * Nothing is created: the form emails are rebuilt with the same mail function and sample values, and the
 * WooCommerce emails reuse the newest order. Side effects: a fresh password-reset key for the sample user.
 */

$mode = isset( $args[0] ) ? $args[0] : 'capture';
$to   = isset( $args[1] ) ? sanitize_email( $args[1] ) : '';
if ( 'send' === $mode && ! is_email( $to ) ) {
	WP_CLI::error( 'send needs an address: wp eval-file mail-samples.php send you@example.com' );
}

$n    = 0;
$seen = array();

/** Three or more English words in a row, after links and addresses are taken out. */
function nad_samples_english( $html ) {
	$text = preg_replace( '#<(style|script|head)[^>]*>.*?</\1>#is', ' ', (string) $html );
	$text = html_entity_decode( wp_strip_all_tags( $text ), ENT_QUOTES, 'UTF-8' );
	$text = preg_replace( '#https?://\S+|\S+@\S+#', ' ', $text );
	preg_match_all( "/[A-Za-z][A-Za-z']+(?:[\s,.:;!?&-]+[A-Za-z][A-Za-z']+){2,}/", $text, $m );
	return array_values( array_unique( array_map( 'trim', $m[0] ) ) );
}

// Runs after the site's own RTL filter, so what is checked is what would be sent.
add_filter(
	'wp_mail',
	function ( $atts ) use ( $mode, $to, &$n, &$seen ) {
		++$n;
		$seen[] = array( $n, is_array( $atts['to'] ) ? implode( ',', $atts['to'] ) : $atts['to'], $atts['subject'], nad_samples_english( $atts['subject'] . "\n" . $atts['message'] ) );
		if ( 'send' === $mode ) {
			$atts['to']      = $to;
			$atts['subject'] = '[דוגמה ' . $n . '] ' . $atts['subject'];
			$headers         = is_array( $atts['headers'] ) ? $atts['headers'] : explode( "\n", str_replace( "\r\n", "\n", (string) $atts['headers'] ) );
			$atts['headers'] = array_values( array_filter( $headers, fn( $h ) => ! preg_match( '/^\s*(cc|bcc)\s*:/i', $h ) ) );
		}
		return $atts;
	},
	PHP_INT_MAX
);
if ( 'capture' === $mode ) {
	add_filter( 'pre_wp_mail', '__return_true' );
}

function nad_samples_step( $label, $fn ) {
	try {
		$fn();
		WP_CLI::log( '* ' . $label );
	} catch ( Throwable $e ) {
		WP_CLI::warning( $label . ': ' . $e->getMessage() );
	}
}

$user = get_user_by( 'email', $to ? $to : get_option( 'admin_email' ) );
if ( ! $user ) {
	$admins = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
	$user   = $admins[0];
}

/* WordPress and the site's login system */
nad_samples_step( 'אימות מייל בהרשמה', function () use ( $user ) {
	delete_transient( 'nad_verify_sent_' . $user->ID );
	nadlanistim_auth_send_verify( $user );
} );
nad_samples_step( 'איפוס סיסמה', fn() => retrieve_password( $user->user_login ) );
nad_samples_step( 'חשבון חדש (למשתמש ולמנהל)', fn() => wp_new_user_notification( $user->ID, null, 'both' ) );
nad_samples_step( 'הודעה למנהל על סיסמה שהוחלפה', fn() => wp_password_change_notification( $user ) );

/* Site forms, rebuilt with sample values (the real handlers would save drafts) */
$manager = nadlanistim_forms_manager();
$buttons = '<p>' . nadlanistim_forms_button( home_url( '/' ), 'לאישור ופרסום' ) . nadlanistim_forms_button( admin_url(), 'לעריכת הטיוטה', false ) . '</p>';
$approve = array( $buttons, nadlanistim_forms_note( 'האישור מפרסם את הטיוטה כמו שהיא. לשינויים, ערכו קודם ופרסמו ממסך העריכה.' ) );
nad_samples_step( 'טופס צרו קשר', fn() => nadlanistim_forms_mail( $manager, 'פנייה מהאתר: ישראל ישראלי', 'פנייה חדשה מטופס צרו קשר.', array( 'שם' => 'ישראל ישראלי', 'אימייל' => 'israel@example.com', 'טלפון' => '050-0000000', 'הודעה' => 'הודעה לדוגמה.' ), array( nadlanistim_forms_note( 'תשובה למייל הזה תגיע ישירות לפונה.' ) ) ) );
nad_samples_step( 'משרה חדשה לאישור', fn() => nadlanistim_forms_mail( $manager, 'משרה חדשה לאישור: מנהל/ת פרויקטים', 'נשמרה טיוטה חדשה מהאתר. היא לא תופיע באתר עד שתאשרו.', array( 'סוג מודעה' => 'משרה פתוחה', 'כותרת' => 'מנהל/ת פרויקטים', 'מיקום' => 'מרכז' ), $approve ) );
nad_samples_step( 'שיתוף פעולה חדש לאישור', fn() => nadlanistim_forms_mail( $manager, 'שיתוף פעולה חדש לאישור: קרקע בשרון', 'נשמרה טיוטה חדשה מהאתר. היא לא תופיע באתר עד שתאשרו.', array( 'כותרת' => 'קרקע בשרון', 'אזור' => 'שרון' ), array_merge( $approve, array( nadlanistim_forms_note( 'הטופס לא מעביר תמונות. אם צריך תמונה, בקשו אותה בתשובה למייל הזה.' ) ) ) ) );
nad_samples_step( 'פרופיל חדש במדריך (למנהל)', fn() => nadlanistim_forms_mail( $manager, 'פרופיל חדש במדריך לאישור: ישראל ישראלי', 'נשמרה טיוטה חדשה מהאתר. היא לא תופיע באתר עד שתאשרו.', array( 'שם מלא' => 'ישראל ישראלי', 'תפקיד' => 'שמאי' ), $approve ) );
nad_samples_step( 'פרופיל חדש מהאזור האישי (למנהל)', fn() => nadlanistim_forms_mail( $manager, 'פרופיל חדש במדריך לאישור: ישראל ישראלי', 'חבר בקהילה יצר פרופיל מהאזור האישי באתר. הפרופיל לא יופיע במדריך עד שתאשרו.', array( 'שם' => 'ישראל ישראלי', 'תפקיד' => 'שמאי', 'תחום' => 'שמאות', 'מיקום' => 'מרכז', 'אימייל' => 'israel@example.com' ), $approve ) );
nad_samples_step( 'פרופיל חדש במדריך (למצטרף)', fn() => nadlanistim_forms_mail( $manager, 'קיבלנו את הפרופיל שלכם למדריך הנדלניסטים', 'היי ישראל ישראלי, הפרופיל הגיע אלינו. אחרי שנעבור עליו הוא יעלה למדריך, בדרך כלל תוך 48 שעות.', array(), array( '<p>רוצים לתקן משהו? ענו למייל הזה.</p>', '<p>צוות הנדלניסטים</p>' ) ) );
nad_samples_step( 'חומרי אירוע (למבקש)', fn() => nadlanistim_forms_mail( $manager, 'החומרים מהאירוע כנס הנדלניסטים', 'היי, ביקשתם את החומרים מכנס הנדלניסטים. הנה הם:', array(), array( '<ul><li><a href="' . esc_url( home_url( '/' ) ) . '">מצגת הכנס</a></li></ul>', '<p>צוות הנדלניסטים</p>' ) ) );
nad_samples_step( 'בקשת הצטרפות (למנהל)', fn() => nadlanistim_forms_mail( $manager, 'בקשת הצטרפות חדשה: ישראל ישראלי', 'בקשת הצטרפות חדשה מעמוד ההצטרפות באתר.', array( 'שם' => 'ישראל ישראלי', 'מסלול' => 'חודשי' ), array( nadlanistim_forms_note( 'המשתמש נפתח במצב ממתין. תשובה למייל הזה תגיע ישירות למבקש.' ) ) ) );

/* WooCommerce, on the newest order */
if ( function_exists( 'WC' ) ) {
	add_filter( 'woocommerce_new_order_email_allows_resend', '__return_true' );
	$orders = wc_get_orders( array( 'limit' => 1, 'orderby' => 'date', 'order' => 'DESC' ) );
	$order  = $orders ? $orders[0] : null;
	foreach ( WC()->mailer()->get_emails() as $email ) {
		$label = 'WooCommerce: ' . $email->id . ( $email->is_enabled() ? '' : ' (כבוי)' );
		if ( ! $email->is_enabled() ) {
			WP_CLI::log( '- ' . $label );
			continue;
		}
		if ( 'customer_reset_password' === $email->id ) {
			nad_samples_step( $label, fn() => $email->trigger( $user->user_login, get_password_reset_key( $user ) ) );
		} elseif ( 'customer_new_account' === $email->id ) {
			nad_samples_step( $label, fn() => $email->trigger( $user->ID, '', false ) );
		} elseif ( 'customer_note' === $email->id && $order ) {
			nad_samples_step( $label, fn() => $email->trigger( array( 'order_id' => $order->get_id(), 'customer_note' => 'הערה לדוגמה מהצוות.' ) ) );
		} elseif ( $order && preg_match( '/order|invoice/', $email->id ) ) {
			nad_samples_step( $label, fn() => $email->trigger( $order->get_id(), $order ) );
		} else {
			WP_CLI::log( '- ' . $label . ' (דילוג: אין לו טריגר פשוט)' );
		}
	}
}

WP_CLI::log( '' );
foreach ( $seen as $s ) {
	WP_CLI::log( $s[0] . ' | ' . $s[1] . ' | ' . $s[2] . ( $s[3] ? ' | EN: ' . implode( ' ¦ ', $s[3] ) : '' ) );
}
