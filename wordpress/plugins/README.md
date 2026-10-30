# Deployed CMS plugins

These folders mirror the custom plugins running on nadlanistim-cms.bold-move.co.il
(`~/files/wp-content/plugins/`). They were copied byte for byte from the server on
2026-10-30. The tarballs were checked against the server's sha256 before extraction.

| Folder | Plugin | Version |
| --- | --- | --- |
| `nadlanistim-headless-core/` | Nadlanistim Headless | 1.31.0 |
| `nadlanistim-importer/` | Nadlanistim Importer | 1.47.0 |

The server is the source of truth. If you change a plugin on the server, copy it back here,
and the other way round.

Not copied: `nadlanistim-headless/` (an older 1.22.0 upload whose only file is named
`nadlanistim-headless\nadlanistim-headless.php`, a Windows path packed into the zip) and
`nadlanistim-widgets/` (Elementor widgets for the old site, not part of the headless setup).
