<?php
/**
 * Plugin Name: Nadlanistim Forms
 * Description: The site's forms post here. Job, collaboration and directory forms become drafts; every form emails the site manager, and draft emails carry a one-click link that publishes the draft.
 *
 * Lives in wp-content/mu-plugins on nadlanistim-cms.bold-move.co.il. Source of truth: wordpress/ in the site repo.
 * Needs NADLANISTIM_REVALIDATE_SECRET in wp-config (same value as REVALIDATE_SECRET on Vercel). The Next.js server
 * sends it with every submission, so only the site can post here; it also signs the approve links.
 * Mail goes through wp_mail (FluentSMTP) to the "הגדרות אתר" contact email, else the admin email.
 *
 * POST /wp-json/nadlanistim/v1/forms/{job|collab|nadlanist|contact|recap}  -> { ok: true } or a WP_Error
 * GET  /wp-json/nadlanistim/v1/forms/approve?post=<id>&sig=<hmac>          -> publishes the draft, back to its edit screen
 */

const NADLANISTIM_FORMS_LIMIT  = 5;   // Submissions per visitor IP...
const NADLANISTIM_FORMS_WINDOW = 600; // ...per 10 minutes.

/** ['a', 'b'] -> ['a' => 'a', 'b' => 'b']: a select whose labels are also the stored values. */
function nadlanistim_forms_same( array $values ) {
	return array_combine( $values, $values );
}

/**
 * What each form sends. Field keys are the form's input names.
 * type: text | textarea | email | tel | url | slug | list (comma separated in, one per line out) | select
 * select options: what the form sends => what WordPress stores ('' = no matching WordPress value).
 * acf: the ACF field name it fills on the draft; post: it becomes the draft's title.
 */
function nadlanistim_forms_specs() {
	return array(
		'job'       => array(
			'post_type' => 'nad_job',
			'subject'   => 'משרה חדשה לאישור',
			'fields'    => array(
				'kind'         => array( 'label' => 'סוג מודעה', 'type' => 'select', 'required' => true, 'options' => array( 'offer' => 'משרה פתוחה', 'seek' => 'מחפש/ת עבודה' ) ),
				'title'        => array( 'label' => 'כותרת', 'type' => 'text', 'required' => true, 'post' => true ),
				'type'         => array(
					'label'    => 'סוג עבודה',
					'type'     => 'select',
					'required' => true,
					'acf'      => 'employment',
					'options'  => array( 'משרה מלאה' => 'full', 'משרה חלקית' => 'part', 'פרילנס' => 'freelance', 'התנדבות' => 'volunteering', 'שותפות' => 'partnership' ),
				),
				'area'         => array( 'label' => 'מיקום', 'type' => 'select', 'required' => true, 'acf' => 'location', 'options' => nadlanistim_forms_same( array( 'תל אביב', 'מרכז', 'צפון', 'דרום', 'ירושלים', 'מרחוק' ) ) ),
				'field'        => array( 'label' => 'תחום עיסוק', 'type' => 'select', 'required' => true, 'acf' => 'field', 'options' => nadlanistim_forms_same( array( 'ניהול', 'שיווק', 'תיווך', 'שמאות', 'הנדסה', 'מימון', 'טכנולוגיה' ) ) ),
				'description'  => array( 'label' => 'תיאור', 'type' => 'textarea', 'required' => true, 'acf' => 'description' ),
				'requirements' => array( 'label' => 'דרישות', 'type' => 'textarea', 'acf' => 'requirements' ),
				'tags'         => array( 'label' => 'תגיות', 'type' => 'list', 'acf' => 'tags' ),
				'name'         => array( 'label' => 'שם / חברה', 'type' => 'text', 'required' => true, 'acf' => 'publisher' ),
				'phone'        => array( 'label' => 'טלפון', 'type' => 'tel', 'required' => true, 'acf' => 'contact_phone' ),
				'email'        => array( 'label' => 'אימייל', 'type' => 'email', 'required' => true, 'acf' => 'contact_email' ),
			),
		),
		'collab'    => array(
			'post_type' => 'nad_collab',
			'subject'   => 'שיתוף פעולה חדש לאישור',
			'fixed'     => array( 'board_tab' => 'looking', 'published_date' => current_time( 'Ymd' ) ),
			'fields'    => array(
				'title'       => array( 'label' => 'כותרת', 'type' => 'text', 'required' => true, 'post' => true ),
				'type'        => array( 'label' => 'סוג שיתוף הפעולה', 'type' => 'select', 'required' => true, 'acf' => 'type', 'options' => nadlanistim_forms_same( array( 'קרקע', 'בנייה', 'שיפוצים', 'השקעות', 'טכנולוגיה' ) ) ),
				'role'        => array(
					'label'    => 'תפקיד נדרש',
					'type'     => 'select',
					'required' => true,
					'acf'      => 'looking',
					'options'  => array( 'שותף פיננסי' => 'financial', 'שותף מקצועי' => 'profession', 'שותף לעסקת יזמות' => '', 'קבלן' => 'contractor', 'יועץ' => 'proptech' ),
				),
				'area'        => array( 'label' => 'אזור', 'type' => 'select', 'required' => true, 'acf' => 'place', 'options' => nadlanistim_forms_same( array( 'צפון', 'מרכז', 'דרום', 'ירושלים', 'כל הארץ' ) ) ),
				'invest'      => array(
					'label'    => 'רמת השקעה',
					'type'     => 'select',
					'required' => true,
					'acf'      => 'invest',
					'options'  => array( 'עד 100K' => '100k', 'עד 500K' => '500k', 'מיליון+' => '1m', 'ללא השקעה כספית' => 'none' ),
				),
				'stage'       => array(
					'label'    => 'שלב הפרויקט',
					'type'     => 'select',
					'required' => true,
					'acf'      => 'stage',
					'options'  => array( 'רעיון' => 'idea', 'תכנון' => 'permits', 'ביצוע' => 'exec', 'מתקדם' => 'advanced' ),
				),
				'description' => array( 'label' => 'תיאור', 'type' => 'textarea', 'required' => true, 'acf' => 'description' ),
				'name'        => array( 'label' => 'שם', 'type' => 'text', 'required' => true, 'acf' => 'by' ),
				'phone'       => array( 'label' => 'טלפון', 'type' => 'tel', 'required' => true, 'acf' => 'phone' ),
				'email'       => array( 'label' => 'אימייל', 'type' => 'email', 'required' => true, 'acf' => 'email' ),
			),
		),
		'nadlanist' => array(
			'post_type' => 'nad_nadlanist',
			'subject'   => 'פרופיל חדש במדריך לאישור',
			'fields'    => array(
				'name'     => array( 'label' => 'שם מלא', 'type' => 'text', 'required' => true, 'post' => true ),
				'role'     => array( 'label' => 'תפקיד', 'type' => 'text', 'required' => true, 'acf' => 'role' ),
				'field'    => array( 'label' => 'תחום עיסוק', 'type' => 'select', 'required' => true, 'acf' => 'field', 'options' => nadlanistim_forms_same( array( 'יזמות', 'השקעות', 'שיווק', 'ייעוץ', 'אדריכלות', 'תיווך', 'שמאות', 'מימון', 'פרופטק', 'משפט' ) ) ),
				'area'     => array( 'label' => 'מיקום', 'type' => 'select', 'required' => true, 'acf' => 'place', 'options' => nadlanistim_forms_same( array( 'תל אביב', 'מרכז', 'צפון', 'דרום', 'ירושלים', 'כל הארץ' ) ) ),
				'quote'    => array( 'label' => 'ציטוט', 'type' => 'text', 'required' => true, 'acf' => 'quote' ),
				'bio'      => array( 'label' => 'קצת עליי', 'type' => 'textarea', 'required' => true, 'acf' => 'bio' ),
				'email'    => array( 'label' => 'אימייל', 'type' => 'email', 'required' => true, 'acf' => 'email' ),
				// No ACF field for these yet: they reach the manager by email only.
				'phone'    => array( 'label' => 'טלפון', 'type' => 'tel' ),
				'linkedin' => array( 'label' => 'לינקדאין', 'type' => 'url' ),
			),
		),
		'contact'   => array(
			'subject' => 'פנייה מהאתר',
			'fields'  => array(
				'source'  => array( 'label' => 'טופס', 'type' => 'select', 'options' => array( 'contact' => 'צרו קשר', 'home' => 'הרשמה לקהילה בעמוד הבית' ) ),
				'name'    => array( 'label' => 'שם', 'type' => 'text', 'required' => true ),
				'email'   => array( 'label' => 'אימייל', 'type' => 'email', 'required' => true ),
				'phone'   => array( 'label' => 'טלפון', 'type' => 'tel' ),
				'field'   => array( 'label' => 'תחום עיסוק', 'type' => 'text' ),
				'message' => array( 'label' => 'הודעה', 'type' => 'textarea' ),
			),
		),
		'recap'     => array(
			'subject' => 'בקשה לחומרי אירוע',
			'fields'  => array(
				'email' => array( 'label' => 'אימייל', 'type' => 'email', 'required' => true ),
				'event' => array( 'label' => 'אירוע', 'type' => 'slug', 'required' => true ),
			),
		),
	);
}

function nadlanistim_forms_error( $message, $status = 400, $code = 'nadlanistim_invalid' ) {
	return new WP_Error( $code, $message, array( 'status' => $status ) );
}

/** Sanitized value, '' for an empty optional field, or a WP_Error whose Hebrew message the site shows as is. */
function nadlanistim_forms_clean( array $f, $raw ) {
	$v     = is_scalar( $raw ) ? trim( (string) $raw ) : '';
	$label = $f['label'];
	if ( '' === $v ) {
		return empty( $f['required'] ) ? '' : nadlanistim_forms_error( 'לא מילאתם את השדה ' . $label . '.' );
	}
	$max = 200;
	switch ( $f['type'] ) {
		case 'select':
			return array_key_exists( $v, $f['options'] ) ? $v : nadlanistim_forms_error( 'בשדה ' . $label . ' צריך לבחור ערך מהרשימה.' );
		case 'email':
			$v = sanitize_email( $v );
			return ( is_email( $v ) && strlen( $v ) <= 100 ) ? $v : nadlanistim_forms_error( 'כתובת האימייל לא תקינה.' );
		case 'tel':
			$v = sanitize_text_field( $v );
			return preg_match( '/^[0-9+()\-\s]{7,20}$/', $v ) ? $v : nadlanistim_forms_error( 'מספר הטלפון לא תקין.' );
		case 'url':
			$v = esc_url_raw( $v, array( 'http', 'https' ) );
			return ( preg_match( '#^https?://#i', $v ) && strlen( $v ) <= 300 ) ? $v : nadlanistim_forms_error( 'הקישור בשדה ' . $label . ' לא תקין.' );
		case 'slug':
			// sanitize_text_field would strip the %xx octets of a Hebrew slug; sanitize_title keeps them.
			$v = sanitize_title( $v );
			break;
		case 'textarea':
			$v   = sanitize_textarea_field( $v );
			$max = 5000;
			break;
		case 'list':
			$v   = implode( "\n", array_filter( array_map( 'trim', explode( ',', sanitize_text_field( $v ) ) ), 'strlen' ) );
			$max = 500;
			break;
		default:
			$v = sanitize_text_field( $v );
	}
	if ( '' === $v ) {
		return empty( $f['required'] ) ? '' : nadlanistim_forms_error( 'לא מילאתם את השדה ' . $label . '.' );
	}
	return mb_strlen( $v ) > $max ? nadlanistim_forms_error( 'השדה ' . $label . ' ארוך מדי.' ) : $v;
}

/** permission_callback: only the Next.js server knows the shared secret. */
function nadlanistim_forms_from_site( WP_REST_Request $req ) {
	$given = (string) $req->get_header( 'x-nadlanistim-secret' );
	return defined( 'NADLANISTIM_REVALIDATE_SECRET' ) && '' !== $given && hash_equals( (string) NADLANISTIM_REVALIDATE_SECRET, $given );
}

/** Every request comes from the site's server, so the visitor's IP travels in a header the secret vouches for. */
function nadlanistim_forms_ip( WP_REST_Request $req ) {
	$ip = (string) $req->get_header( 'x-nadlanistim-client-ip' );
	if ( filter_var( $ip, FILTER_VALIDATE_IP ) ) {
		return $ip;
	}
	return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
}

function nadlanistim_forms_sig( $post_id ) {
	return hash_hmac( 'sha256', 'approve:' . (int) $post_id, (string) NADLANISTIM_REVALIDATE_SECRET );
}

function nadlanistim_forms_manager() {
	$to = function_exists( 'get_field' ) ? (string) get_field( 'contact_email', 'option' ) : '';
	return is_email( $to ) ? $to : get_option( 'admin_email' );
}

/** ACF field name -> key across the post type's field groups, so a name shared with another post type cannot pick the wrong field. */
function nadlanistim_forms_acf_keys( $post_type ) {
	$keys = array();
	if ( function_exists( 'acf_get_field_groups' ) ) {
		foreach ( acf_get_field_groups( array( 'post_type' => $post_type ) ) as $group ) {
			foreach ( (array) acf_get_fields( $group ) as $field ) {
				$keys[ $field['name'] ] = $field['key'];
			}
		}
	}
	return $keys;
}

/** Event download lines are "name | url"; only real http(s) links count. */
function nadlanistim_forms_event_links( $event_id ) {
	$raw   = function_exists( 'get_field' ) ? (string) get_field( 'downloads', $event_id, false ) : '';
	$links = array();
	foreach ( preg_split( '/\r\n|\r|\n/', $raw ) as $line ) {
		$parts = array_map( 'trim', explode( '|', $line ) );
		$url   = isset( $parts[1] ) ? esc_url_raw( $parts[1], array( 'http', 'https' ) ) : '';
		if ( preg_match( '#^https?://#i', $url ) ) {
			$links[] = array( 'name' => '' !== $parts[0] ? $parts[0] : $url, 'url' => $url );
		}
	}
	return $links;
}

function nadlanistim_forms_button( $url, $text, $primary = true ) {
	$style = $primary
		? 'display:inline-block;padding:10px 20px;margin:0 0 8px 8px;background:#5b3fd6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold'
		: 'display:inline-block;padding:10px 20px;margin:0 0 8px 8px;border:1px solid #5b3fd6;color:#5b3fd6;text-decoration:none;border-radius:6px';
	return '<a href="' . esc_url( $url ) . '" style="' . $style . '">' . esc_html( $text ) . '</a>';
}

/** $rows: label => plain text value. $blocks: ready HTML (buttons, notes) after the table. */
function nadlanistim_forms_mail( $to, $subject, $intro, array $rows, array $blocks = array(), $reply_to = '' ) {
	$html = '<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111111;text-align:right">';
	$html .= '<p>' . esc_html( $intro ) . '</p>';
	if ( $rows ) {
		$html .= '<table cellpadding="8" style="border-collapse:collapse;margin:0 0 16px">';
		foreach ( $rows as $label => $value ) {
			$html .= '<tr style="border-bottom:1px solid #eeeeee"><th align="right" valign="top" style="color:#666666;font-weight:normal;white-space:nowrap">' . esc_html( $label ) . '</th>'
				. '<td>' . nl2br( esc_html( $value ) ) . '</td></tr>';
		}
		$html .= '</table>';
	}
	$html .= implode( '', $blocks ) . '</div>';

	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	if ( is_email( $reply_to ) ) {
		$headers[] = 'Reply-To: ' . $reply_to;
	}
	$sent = wp_mail( $to, $subject, $html, $headers );
	if ( ! $sent ) {
		error_log( 'Nadlanistim Forms: mail to ' . $to . ' failed: ' . $subject );
	}
	return $sent;
}

function nadlanistim_forms_note( $text ) {
	return '<p style="color:#666666;font-size:13px">' . esc_html( $text ) . '</p>';
}

function nadlanistim_forms_submit( $form, WP_REST_Request $req ) {
	$specs = nadlanistim_forms_specs();
	$spec  = $specs[ $form ];

	// Honeypot: people never see the "website" field, bots fill it. They get a fake success and nothing happens.
	if ( '' !== trim( (string) $req->get_param( 'website' ) ) ) {
		return array( 'ok' => true );
	}

	$limit_key = 'nadlanistim_forms_' . md5( nadlanistim_forms_ip( $req ) );
	$hits      = get_transient( $limit_key );
	if ( ! is_array( $hits ) ) {
		$hits = array( 'n' => 0, 'until' => time() + NADLANISTIM_FORMS_WINDOW );
	}
	if ( $hits['n'] >= NADLANISTIM_FORMS_LIMIT ) {
		return nadlanistim_forms_error( 'שלחתם כמה טפסים ברצף. נסו שוב בעוד 10 דקות.', 429, 'nadlanistim_rate_limit' );
	}

	$values = array();
	foreach ( $spec['fields'] as $name => $f ) {
		$value = nadlanistim_forms_clean( $f, $req->get_param( $name ) );
		if ( is_wp_error( $value ) ) {
			return $value;
		}
		$values[ $name ] = $value;
	}

	$event = null;
	if ( 'recap' === $form ) {
		$event = get_page_by_path( $values['event'], OBJECT, 'nad_event' );
		if ( ! $event || 'publish' !== $event->post_status ) {
			return nadlanistim_forms_error( 'לא מצאנו את האירוע. רעננו את העמוד ונסו שוב.' );
		}
	}

	// Only valid submissions count toward the limit.
	$hits['n']++;
	set_transient( $limit_key, $hits, max( 1, $hits['until'] - time() ) );

	// What the manager reads: the visitor's own wording for each filled field.
	$rows  = array();
	$notes = array();
	$title = '';
	foreach ( $spec['fields'] as $name => $f ) {
		if ( '' === $values[ $name ] ) {
			continue;
		}
		$stored = 'select' === $f['type'] ? $f['options'][ $values[ $name ] ] : $values[ $name ];
		// A select with no ACF field (job kind, contact source) shows its readable label instead of the code.
		$rows[ $f['label'] ] = ( 'select' === $f['type'] && empty( $f['acf'] ) ) ? $stored : $values[ $name ];
		if ( ! empty( $f['post'] ) ) {
			$title = $values[ $name ];
		}
		if ( ! empty( $f['acf'] ) && '' === $stored ) {
			$notes[] = 'בוורדפרס אין ערך שמתאים ל' . $f['label'] . ' "' . $values[ $name ] . '". בחרו ערך בעריכה.';
		}
	}
	$manager = nadlanistim_forms_manager();
	$visitor = isset( $values['email'] ) ? $values['email'] : '';

	// Contact and recap: email only.
	if ( empty( $spec['post_type'] ) ) {
		if ( 'recap' === $form ) {
			$event_title = get_the_title( $event );
			$links       = nadlanistim_forms_event_links( $event->ID );
			$rows        = array( 'אימייל' => $visitor, 'אירוע' => $event_title );
			if ( $links ) {
				$items = '';
				foreach ( $links as $link ) {
					$items .= '<li><a href="' . esc_url( $link['url'] ) . '">' . esc_html( $link['name'] ) . '</a></li>';
				}
				$ok = nadlanistim_forms_mail(
					$visitor,
					'החומרים מהאירוע ' . $event_title,
					'היי, ביקשתם את החומרים מ' . $event_title . '. הנה הם:',
					array(),
					array( '<ul>' . $items . '</ul>', '<p>צוות הנדלניסטים</p>' ),
					$manager
				);
				if ( ! $ok ) {
					return nadlanistim_forms_error( 'לא הצלחנו לשלוח את המייל. נסו שוב בעוד כמה דקות.', 500, 'nadlanistim_mail_failed' );
				}
				$notes[] = 'שלחנו לכתובת הזאת ' . count( $links ) . ' קישורים להורדה.';
			} else {
				$notes[] = 'באירוע הזה אין קישורים להורדה, אז לא נשלח כלום. שלחו את החומרים ידנית בתשובה למייל הזה.';
			}
			$subject = $spec['subject'] . ': ' . $event_title;
			$intro   = 'בקשה לחומרים מהאירוע ' . $event_title . '.';
		} else {
			$home    = 'home' === $values['source'];
			$subject = ( $home ? 'בקשת הצטרפות מהאתר' : $spec['subject'] ) . ': ' . $values['name'];
			$intro   = $home ? 'בקשת הצטרפות מהטופס בעמוד הבית.' : 'פנייה חדשה מטופס צרו קשר.';
			$notes[] = 'תשובה למייל הזה תגיע ישירות לפונה.';
		}
		$blocks = array_map( 'nadlanistim_forms_note', $notes );
		if ( ! nadlanistim_forms_mail( $manager, $subject, $intro, $rows, $blocks, $visitor ) && 'contact' === $form ) {
			return nadlanistim_forms_error( 'לא הצלחנו לשלוח את ההודעה. נסו שוב בעוד כמה דקות.', 500, 'nadlanistim_mail_failed' );
		}
		return array( 'ok' => true );
	}

	// Job, collab, nadlanist: a draft first, then the manager email that approves it.
	$post_id = wp_insert_post(
		array(
			'post_type'   => $spec['post_type'],
			'post_status' => 'draft',
			'post_title'  => $title,
		),
		true
	);
	if ( is_wp_error( $post_id ) ) {
		error_log( 'Nadlanistim Forms: draft ' . $form . ' failed: ' . $post_id->get_error_message() );
		return nadlanistim_forms_error( 'לא הצלחנו לשמור את הטופס. נסו שוב בעוד כמה דקות.', 500, 'nadlanistim_save_failed' );
	}

	$keys = nadlanistim_forms_acf_keys( $spec['post_type'] );
	$acf  = isset( $spec['fixed'] ) ? $spec['fixed'] : array();
	foreach ( $spec['fields'] as $name => $f ) {
		if ( empty( $f['acf'] ) || '' === $values[ $name ] ) {
			continue;
		}
		$acf[ $f['acf'] ] = 'select' === $f['type'] ? $f['options'][ $values[ $name ] ] : $values[ $name ];
	}
	foreach ( $acf as $name => $value ) {
		if ( '' === $value ) {
			continue;
		}
		if ( function_exists( 'update_field' ) ) {
			update_field( isset( $keys[ $name ] ) ? $keys[ $name ] : $name, $value, $post_id );
		} else {
			update_post_meta( $post_id, $name, $value );
		}
	}

	// The board filters by these taxonomies. Tag the draft with the terms that already exist; never create new ones.
	if ( 'collab' === $form ) {
		foreach ( array( 'nad_region' => $values['area'], 'nad_collab_type' => $values['type'] ) as $tax => $name ) {
			$term = '' !== $name ? get_term_by( 'name', $name, $tax ) : false;
			if ( $term ) {
				wp_set_object_terms( $post_id, array( (int) $term->term_id ), $tax );
			} elseif ( '' !== $name ) {
				$notes[] = 'אין בוורדפרס מונח "' . $name . '" לסינון. תייגו את הטיוטה ידנית.';
			}
		}
	}

	if ( 'job' === $form && 'seek' === $values['kind'] ) {
		$notes[] = 'זו מודעת חיפוש עבודה. באתר אין עדיין סימון לסוג הזה, אז היא תוצג בלוח כמשרה פתוחה.';
	}
	if ( 'job' !== $form ) {
		$notes[] = 'הטופס לא מעביר תמונות. אם צריך תמונה, בקשו אותה בתשובה למייל הזה.';
	}
	$approve = add_query_arg(
		array( 'post' => $post_id, 'sig' => nadlanistim_forms_sig( $post_id ) ),
		rest_url( 'nadlanistim/v1/forms/approve' )
	);
	$blocks  = array(
		'<p>' . nadlanistim_forms_button( $approve, 'לאישור ופרסום' ) . nadlanistim_forms_button( admin_url( 'post.php?post=' . $post_id . '&action=edit' ), 'לעריכת הטיוטה', false ) . '</p>',
		nadlanistim_forms_note( 'האישור מפרסם את הטיוטה כמו שהיא. לשינויים, ערכו קודם ופרסמו ממסך העריכה.' ),
	);
	$blocks  = array_merge( $blocks, array_map( 'nadlanistim_forms_note', $notes ) );
	// The draft is saved, so a failed manager email is logged but the visitor still sees success.
	nadlanistim_forms_mail( $manager, $spec['subject'] . ': ' . $title, 'נשמרה טיוטה חדשה מהאתר. היא לא תופיע באתר עד שתאשרו.', $rows, $blocks, $visitor );

	if ( 'nadlanist' === $form ) {
		nadlanistim_forms_mail(
			$visitor,
			'קיבלנו את הפרופיל שלכם למדריך הנדלניסטים',
			'היי ' . $title . ', הפרופיל הגיע אלינו. אחרי שנעבור עליו הוא יעלה למדריך, בדרך כלל תוך 48 שעות.',
			array(),
			array( '<p>רוצים לתקן משהו? ענו למייל הזה.</p>', '<p>צוות הנדלניסטים</p>' ),
			$manager
		);
	}
	return array( 'ok' => true );
}

/** The manager's one-click link: publishes the draft, then opens its edit screen with a notice. */
function nadlanistim_forms_approve( WP_REST_Request $req ) {
	$post_id = absint( $req['post'] );
	if ( ! defined( 'NADLANISTIM_REVALIDATE_SECRET' ) || ! $post_id || ! hash_equals( nadlanistim_forms_sig( $post_id ), (string) $req['sig'] ) ) {
		return nadlanistim_forms_error( 'הקישור לא תקין.', 403, 'nadlanistim_bad_link' );
	}
	$post  = get_post( $post_id );
	$types = array( 'nad_job', 'nad_collab', 'nad_nadlanist' );
	if ( ! $post || ! in_array( $post->post_type, $types, true ) ) {
		return nadlanistim_forms_error( 'הטיוטה לא נמצאה. אולי היא נמחקה.', 404, 'nadlanistim_not_found' );
	}
	$notice = 'skipped';
	if ( 'draft' === $post->post_status ) {
		// Fires save_post, so the revalidate plugin refreshes the site.
		$done = wp_update_post( array( 'ID' => $post_id, 'post_status' => 'publish' ), true );
		if ( is_wp_error( $done ) ) {
			return nadlanistim_forms_error( 'הפרסום נכשל. פרסמו ממסך העריכה.', 500, 'nadlanistim_publish_failed' );
		}
		$notice = 'published';
	}
	$res = new WP_REST_Response( null, 302 );
	$res->header( 'Location', add_query_arg( 'nadlanistim_approved', $notice, admin_url( 'post.php?post=' . $post_id . '&action=edit' ) ) );
	return $res;
}

add_action(
	'rest_api_init',
	function () {
		foreach ( array_keys( nadlanistim_forms_specs() ) as $form ) {
			register_rest_route(
				'nadlanistim/v1',
				'/forms/' . $form,
				array(
					'methods'             => 'POST',
					'permission_callback' => 'nadlanistim_forms_from_site',
					'callback'            => function ( WP_REST_Request $req ) use ( $form ) {
						return nadlanistim_forms_submit( $form, $req );
					},
				)
			);
		}
		register_rest_route(
			'nadlanistim/v1',
			'/forms/approve',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => 'nadlanistim_forms_approve',
			)
		);
	}
);

add_action(
	'admin_notices',
	function () {
		$state = isset( $_GET['nadlanistim_approved'] ) ? sanitize_key( wp_unslash( $_GET['nadlanistim_approved'] ) ) : '';
		if ( 'published' === $state ) {
			echo '<div class="notice notice-success is-dismissible"><p>פורסם. האתר יתעדכן תוך דקה.</p></div>';
		} elseif ( 'skipped' === $state ) {
			echo '<div class="notice notice-warning is-dismissible"><p>לא פורסם: הפוסט כבר לא טיוטה. בדקו את הסטטוס בתיבת הפרסום.</p></div>';
		}
	}
);

/*
 * /join-apply belongs to the Headless plugin: it opens a pending subscriber and nothing else.
 * From here it also gets a per-visitor limit and an email to the site manager, without touching that plugin.
 */
function nadlanistim_forms_is_join( WP_REST_Request $req ) {
	return '/nadlanistim/v1/join-apply' === $req->get_route() && 'POST' === $req->get_method();
}

add_filter(
	'rest_pre_dispatch',
	function ( $result, $server, $req ) {
		if ( null !== $result || ! nadlanistim_forms_is_join( $req ) ) {
			return $result;
		}
		// The visitor's IP header is trusted only when the site's secret came with it.
		$ip  = nadlanistim_forms_from_site( $req ) ? nadlanistim_forms_ip( $req ) : ( isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '' );
		$key = 'nadlanistim_join_' . md5( $ip );
		$n   = (int) get_transient( $key );
		if ( $n >= NADLANISTIM_FORMS_LIMIT ) {
			return nadlanistim_forms_error( 'שלחתם כמה בקשות ברצף. נסו שוב בעוד 10 דקות.', 429, 'nadlanistim_rate_limit' );
		}
		set_transient( $key, $n + 1, NADLANISTIM_FORMS_WINDOW );
		return $result;
	},
	10,
	3
);

add_filter(
	'rest_post_dispatch',
	function ( $response, $server, $req ) {
		if ( ! nadlanistim_forms_is_join( $req ) || 200 !== $response->get_status() ) {
			return $response;
		}
		$p    = function ( $k ) use ( $req ) {
			return sanitize_textarea_field( (string) $req->get_param( $k ) );
		};
		$user = get_user_by( 'email', sanitize_email( $p( 'email' ) ) );
		$rows = array_filter(
			array(
				'שם'       => $p( 'name' ),
				'אימייל'   => $p( 'email' ),
				'טלפון'    => $p( 'phone' ),
				'תחום'     => $p( 'field' ),
				'מסלול'    => $p( 'track' ),
				'על עצמי' => $p( 'about' ),
			),
			'strlen'
		);
		$blocks = $user ? array( '<p>' . nadlanistim_forms_button( admin_url( 'user-edit.php?user_id=' . $user->ID ), 'לפרטי המשתמש', false ) . '</p>' ) : array();
		$blocks[] = nadlanistim_forms_note( 'המשתמש נפתח במצב ממתין. תשובה למייל הזה תגיע ישירות למבקש.' );
		nadlanistim_forms_mail( nadlanistim_forms_manager(), 'בקשת הצטרפות חדשה: ' . $p( 'name' ), 'בקשת הצטרפות חדשה מעמוד ההצטרפות באתר.', $rows, $blocks, $p( 'email' ) );
		return $response;
	},
	10,
	3
);
