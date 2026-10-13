#!/bin/zsh
cd "${0:A:h}/.." || exit 1
export PATH="/opt/homebrew/opt/node@24/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
node scripts/seed-community.mjs
read -r "?Press Enter to close."
