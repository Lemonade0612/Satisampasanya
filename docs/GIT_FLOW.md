# Git Flow

| Branch | Created from | Merges into | Purpose |
|---|---|---|---|
| `main` | — | — | Production code only. Every merge is tagged (`v1.0.0`). |
| `develop` | `main` | — | Integration branch for development. |
| `feature/<name>` | `develop` | `develop` | One feature per branch. |
| `release/<version>` | `develop` | `main` + `develop` | Release prep — bugfixes only. |
| `hotfix/<version>` | `main` | `main` + `develop` | Urgent production fixes. |

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
git tag -a v1.0.0 -m "Release 1.0.0"
git checkout develop && git merge --no-ff release/1.0.0
git branch -d release/1.0.0
git push origin main develop --tags
```

## Hotfix

```bash
git checkout -b hotfix/1.0.1 main
# fix, commit
git checkout main && git merge --no-ff hotfix/1.0.1
git tag -a v1.0.1 -m "Hotfix 1.0.1"
git checkout develop && git merge --no-ff hotfix/1.0.1
git branch -d hotfix/1.0.1
git push origin main develop --tags
```

## Rules

- Never commit directly to `main` or `develop` — use PRs.
- Branch names: `feature/`, `release/`, `hotfix/` prefixes, lowercase-kebab.
