# Git Flow

```
feature/*  →  develop  →  main  →  production
                          (stable)   (live, tagged)
```

| Branch | Created from | Merges into | Purpose |
|---|---|---|---|
| `production` | `main` | — | Live deployed code only. Every merge is tagged (`v1.0.0`). |
| `main` | — | `production` | Stable, tested code ready to deploy. |
| `develop` | `main` | — | Integration branch for development. |
| `feature/<name>` | `develop` | `develop` | One feature per branch. |
| `release/<version>` | `develop` | `main` + `develop` | Release prep — bugfixes only. |
| `hotfix/<version>` | `production` | `production` + `main` + `develop` | Urgent production fixes. |

## Feature

```bash
git checkout develop && git pull
git checkout -b feature/my-feature
# ...work, commit...
git push -u origin feature/my-feature   # open PR into develop
```

## Release

```bash
git checkout -b release/1.0.0 develop
# only bugfixes here
git checkout main && git merge --no-ff release/1.0.0
git checkout develop && git merge --no-ff release/1.0.0
git branch -d release/1.0.0
git push origin main develop
```

## Deploy to production

```bash
git checkout production && git merge --no-ff main
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin production --tags
```

## Hotfix

```bash
git checkout -b hotfix/1.0.1 production
# fix, commit
git checkout production && git merge --no-ff hotfix/1.0.1
git tag -a v1.0.1 -m "Hotfix 1.0.1"
git checkout main && git merge --no-ff hotfix/1.0.1
git checkout develop && git merge --no-ff hotfix/1.0.1
git branch -d hotfix/1.0.1
git push origin production main develop --tags
```

## Rules

- Never commit directly to `production`, `main` or `develop` — use PRs.
- Branch names: `feature/`, `release/`, `hotfix/` prefixes, lowercase-kebab.
