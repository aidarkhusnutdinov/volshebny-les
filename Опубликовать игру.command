#!/bin/bash
# Публикация «Волшебного леса» на GitHub Pages.
# Двойной клик: коммитит все изменения, пушит в GitHub и печатает ссылку на игру.
# При первом запуске сам создаёт публичный репозиторий и включает Pages.
set -e
cd "$(dirname "$0")"

REPO="volshebny-les"
BRANCH=$(git branch --show-current)

echo "=== Волшебный лес → GitHub Pages ==="

# 1. Закоммитить всё, что изменилось
git add -A
if ! git diff --cached --quiet; then
  git commit -m "Публикация $(date '+%Y-%m-%d %H:%M')"
  echo "✓ Изменения закоммичены"
else
  echo "✓ Новых изменений нет"
fi

# 2. Первый запуск: создать репозиторий на GitHub
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "→ Создаю репозиторий $REPO на GitHub…"
  gh repo create "$REPO" --public --source=. --remote=origin
fi

OWNER=$(gh api user -q .login)

# 3. Запушить
git push -u origin "$BRANCH"
echo "✓ Код отправлен на GitHub"

# 4. Включить GitHub Pages (ветка $BRANCH, корень). 409 = уже включены.
gh api "repos/$OWNER/$REPO/pages" \
  -X POST -f "source[branch]=$BRANCH" -f "source[path]=/" >/dev/null 2>&1 \
  && echo "✓ GitHub Pages включены" \
  || echo "✓ GitHub Pages уже были включены"

URL="https://$OWNER.github.io/$REPO/"
echo ""
echo "=== ГОТОВО ==="
echo "Игра: $URL"
echo "(после первой публикации страница появляется через 1-2 минуты)"
open "$URL"
