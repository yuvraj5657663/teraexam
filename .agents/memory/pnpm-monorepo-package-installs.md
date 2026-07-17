---
name: Installing packages into a specific pnpm workspace package
description: The generic install-package tool/callback can fail with ERR_PNPM_ADDING_TO_ROOT when the target is a specific artifact or lib, not the workspace root.
---

In this pnpm-workspace monorepo, adding a dependency that's only needed by one artifact or lib package (e.g.
`jsonwebtoken`, `multer`, `tsx` for a one-off script) should be scoped to that package.

**Why:** The generic package-install tooling sometimes attempts a root-level `pnpm add`, which fails with
`ERR_PNPM_ADDING_TO_ROOT` in workspaces that block root dependency additions by policy.

**How to apply:** Use `pnpm --filter @workspace/<package-name> add <pkg>` (and `-D` for dev deps) via shell
directly when installing into a specific artifact or lib package, rather than relying on the generic
install-package callback for scoped installs.
