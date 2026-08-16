#!/usr/bin/env sh
set -eu
repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mkdir -p "$repo_dir/release"
cp "$repo_dir/progs/cha-han.html" "$repo_dir/release/index.html"
printf '%s\n' 'Built release/index.html'
