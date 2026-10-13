#!/bin/zsh
cd "${0:A:h}/.." || exit 1
export PATH="/opt/homebrew/opt/node@24/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null; then
  echo "Install Node.js 24 or later once, then open this launcher again."
  read -r "?Press Enter to close."
  exit 1
fi
python3 -m venv --system-site-packages translation/.venv || exit 1
translation/.venv/bin/python -m pip install -r translation/requirements.txt || exit 1
node scripts/start-ai.mjs --download
