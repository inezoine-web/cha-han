#!/usr/bin/env sh
set -eu
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
source_file="$repo_dir/progs/cha-han.html"
release_file="$repo_dir/release/index.html"

test -f "$source_file"
test -f "$release_file"
cmp "$source_file" "$release_file"
grep -Eiq '<!doctype html>' "$release_file"
grep -q '<meta name="viewport"' "$release_file"
grep -q '<canvas' "$release_file"
if grep -Eiq '<(script|link)[^>]+(src|href)="https?://' "$release_file"; then
  echo 'External script or stylesheet found; release must be self-contained.' >&2
  exit 1
fi
printf '%s\n' 'Static checks passed'
