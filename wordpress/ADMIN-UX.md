# Nadlanistim admin UX

Source: `wordpress/nadlanistim-admin.php` (mu-plugin). Off by default; see "Switch" at the end.

## Who uses it

Two or three people on the Nadlanistim team, Hebrew speakers, not technical. They open wp-admin a few times a week to:

1. Approve what came in from the site's forms: jobs, collaborations, member profiles. Forms save a draft and email the manager.
2. Fix a member's profile (role, photo, communities, open to work).
3. Publish an event and fill the sections its page shows; after the event, switch it to a recap with photos.
4. Swap sponsors and the homepage numbers and texts.
5. Check who paid (tickets, monthly and yearly membership).

Yuval and the agency (administrators) need everything else; staff do not.

## Audit of the stock admin (2026-10-30, nadlanistim-cms)

| Finding | Effect on staff |
|---|---|
| Admin is English and LTR (site language en_US, no Hebrew language pack installed), while every content type label is Hebrew | Mixed directions everywhere, "Add New" next to "אירוע חדש/ה" |
| Editing a nadlanist, job or collaboration redirects to the public sign-up form (`/nadlanist-new?edit=...&token=...`, Headless plugin, old front-end contract). The current site ignores `edit`, so the form opens empty. "Add new" does the same | Staff cannot edit members, jobs or collaborations in WordPress at all |
| The importer's Status column links "pending" to `/jobs/<slug>?token=...` on the site, which no longer exists. The column shows to administrators only | No working approve action in the admin |
| "View" links: nadlanists go to `/profile?as=`, jobs to `/jobs/<slug>`, podcast, deals and sponsors to the backend domain | Wrong or dead pages |
| 37 top-level menu items for an administrator; content types sit between Comments and WooCommerce, ungrouped, with Hello (theme), Analytics, Marketing, Tools, ACF, GraphQL, Plugins around them | Hard to find the five things they need |
| Dashboard: "Welcome to WordPress", WooCommerce setup, Quick Draft, Redis stats, iCount error | Nothing about this site |
| Event edit screen: one ACF box with 35 fields, about 8,000px tall, mixing the event page, the party page and the recap page; an empty WordPress editor and Excerpt box above it that the site never reads | Staff scroll and guess which field shows where |
| Event list shows publish date, not event date; no image, no place | Upcoming and past events look the same |
| Orders live two levels deep under WooCommerce | Not found |

## Patterns borrowed (Mobbin)

- Shopify admin home: action chips with counts at the top ("Fulfill orders 4"), nav groups with small section labels, count badges on nav items. Used for the home chips and the menu.
- Squarespace and GitBook home: a task list in rows on the main column, a "your site" panel beside it. Used for the home layout; rows, not a card grid.
- Reddit mod queue and Circle moderation: one queue, each row carries its approve action inline. Used for "ממתינים לאישור".
- beehiiv post settings: settings split into tabs by destination (Post, Email, Website). Used for the event screen: tabs by the page the fields feed.

## Information architecture

Menu, in order of use, with a small group label above each group:

- מרכז הניהול (new home)
- תוכן: אירועים, כתבות, פודקאסט
- קהילה: נדלניסטים, קהילות
- לוחות: דרושים, שיתופי פעולה, חדר העסקאות
- שותפים ונותני חסות
- חנות: הזמנות (direct link to WooCommerce orders), מוצרים וכרטיסים
- אתר: הגדרות אתר, מדיה
- מערכת (administrators only): everything WordPress and the plugins add, unchanged

Count badges (WordPress's own markup) on נדלניסטים, דרושים and שיתופי פעולה show items waiting for approval.

Hidden for users without `manage_options`: Dashboard, Pages, Comments, WooCommerce root, Analytics, Marketing, Payments, Hello, Appearance, Plugins, Tools, Settings, ACF, GraphQL. Administrators keep all of it.

## Home: מרכז הניהול

Replaces the dashboard (`index.php` redirects; administrators reach the old one with `?nad_classic=1`).

1. Chips: waiting for approval, events that need work, orders in the last 7 days. Each jumps to its section.
2. ממתינים לאישור: drafts and pending items of nadlanist, job and collaboration, newest first. Row: type, title, who sent it and when, a key detail. Actions: "אישור ופרסום" (POST, nonce, `publish_post` check, fires `save_post` so the site refreshes) and "עריכה". Empty state says where items come from.
3. אירועים שדורשים השלמה: upcoming events missing an image, place, time or description; past events not marked "התקיים"; past events with no recap gallery.
4. הזמנות אחרונות: last 6 orders (users who can edit orders only), read only.
5. Side column: every content area with published and waiting counts plus "הוספה"; quick links to the homepage, youth and sponsor settings; links to the live site pages.

## Lists

- Image column (featured image, ACF logo, or the seed image URL).
- פרטים column with the field staff look for: event date and place, member role, job publisher and location, collaboration author and place, episode number, sponsor tier.
- מצב column: badge (פורסם / ממתין לאישור / טיוטה) and an inline "אישור ופרסום" link with a nonce. Replaces the importer's Status column.
- "View" row action points to the right page on the live site, or is removed when the type has no page.
- Events sort by event date, newest first. Filters: cohort on nadlanists (includes "צעירים"), event type on events.

## Edit screens

- Native editing restored for nadlanist, job, collaboration (the Headless redirects are unhooked while the new UI is on).
- A bar above the title: status, "צפייה באתר" (published only, new tab), and for events which page the event shows on.
- Event fields split into four tabs at render time: פרטים בסיסיים, עמוד האירוע, עמוד מסיבה, סיכום אחרי האירוע, each opening with a line naming the page it feeds. The Importer's field group definition is untouched; the tabs exist only in the rendered screen (GET on post.php / post-new.php), never in saves, GraphQL or REST.
- The WordPress editor box is hidden on site content types when it is empty (the site reads ACF only; articles keep it when they hold text). The Excerpt box is removed on those types; the parent box on sponsors.

## Visual layer

- Sidebar in the site's navy (`#0C0E1A`), current item on violet `#6D28D9` (white text 7:1). Content on a cool off-white `#F5F6FA`, white panels with a 1px border, ink `#14162B`, secondary text `#565B73` (6.9:1 on white). Primary actions `#5B3FD6`, the same violet the approval emails use.
- Google Sans for the whole admin (every element but icon fonts and code), weights 400 to 700, the site's own files self-hosted from `wp-content/uploads/nadlanistim-admin/` (no CDN at runtime). They include Hebrew, so nothing falls back; if the files are missing, the system font stack takes over.
- Visible focus everywhere: 2px violet outline on light surfaces, cyan on the dark sidebar.
- Hebrew admin: when the switch is on and the he_IL language pack is installed, the admin loads in Hebrew (RTL) for that user. Front end, REST and GraphQL are unaffected.

## Copy rules

Plural address ("בחרו", "ערכו"), noun labels on buttons ("אישור ופרסום", "עריכה", "צפייה באתר"). Terms: טיוטה, ממתין לאישור, פורסם, נדלניסטים, נותני חסות. No em dash, no maqaf.

## Switch

Off by default; with it off the plugin adds no hooks except reading the switch.

- One administrator, own session: open any admin page with `?nad_admin_preview=1` (stored in user meta `nad_admin_preview`); `?nad_admin_preview=0` turns it off. Needs `manage_options`.
- Everyone: `wp option update nadlanistim_admin_ui 1` (back: `wp option update nadlanistim_admin_ui 0`).

The preview switch is a GET without a nonce on purpose: it only changes the viewer's own display preference.

## Known gaps

- No draft preview: the site has no `/api/preview`, so the Preview button is hidden on site content; "צפייה באתר" shows only for published items.
- Staff accounts do not exist yet (two administrators, two subscribers). Give the team the Shop manager role: it edits posts and sees orders, and the menu hides the rest.
- WooCommerce's own screens (orders, products) keep WooCommerce's layout; only the colors and font change.
- The month filter on lists still filters by publish date, not event date.
- The queue has no "reject" button; rejecting a submission means leaving it as a draft or moving it to trash from its edit screen.
