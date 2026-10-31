#!/bin/bash
# Installs mu-plugins from a commit of this repo, on the server:
#   bash install.sh <commit> <name>:<sha12> [<name>:<sha12> ...]     e.g. forms:1a2b3c4d5e6f for nadlanistim-forms.php
# Every file is downloaded, linted and matched to its sha256 (first 12) before any file is replaced.
# The file it replaces is kept in ~/tmp-nad as nadlanistim-<name>.php.bak-<date>. Nothing is deleted.
set -e
commit=$1
shift
mu=~/files/wp-content/mu-plugins
mkdir -p ~/tmp-nad
for pair in "$@"; do
	name=${pair%%:*}
	sha=${pair##*:}
	curl -sfo ~/tmp-nad/new-$name.php "https://raw.githubusercontent.com/gevayu/Nadlanistim/$commit/wordpress/nadlanistim-$name.php"
	php -l ~/tmp-nad/new-$name.php > /dev/null
	got=$(sha256sum ~/tmp-nad/new-$name.php | cut -c1-12)
	[ "$got" = "$sha" ] || { echo "sha mismatch for $name: $got, nothing installed"; exit 1; }
done
stamp=$(date +%Y%m%d-%H%M)
for pair in "$@"; do
	name=${pair%%:*}
	cp $mu/nadlanistim-$name.php ~/tmp-nad/nadlanistim-$name.php.bak-$stamp
	cp ~/tmp-nad/new-$name.php $mu/nadlanistim-$name.php
	echo "installed $name $(sha256sum $mu/nadlanistim-$name.php | cut -c1-12), backup bak-$stamp"
done
