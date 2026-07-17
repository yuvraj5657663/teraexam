---
name: Stale TS project-reference declarations hide new exports
description: Adding exports to a composite lib package (e.g. Drizzle schema barrel) doesn't typecheck correctly in a consumer unless the referenced project's declarations are rebuilt.
---

In a TS project-references monorepo, a lib package like `@workspace/db` can have `composite: true` and emit
declaration-only output to `dist/`. If you add new exports to that package's source (e.g. new schema tables)
and then typecheck only the consumer package directly (`tsc -p artifacts/<app>/tsconfig.json --noEmit`), TS
can resolve the stale `dist/*.d.ts` files instead of the fresh source, and report `has no exported member`
for things that clearly exist in source.

**Why:** The consumer's own `tsc -p ... --noEmit` invocation doesn't rebuild referenced project declarations;
only `tsc --build` (project-reference aware) does, and only the root-level `typecheck` script in this
template invokes `tsc --build` first.

**How to apply:** After changing a referenced lib package's exports, run the workspace root's `pnpm run
typecheck` (which runs `tsc --build` for libs first) rather than the individual artifact's `typecheck`
script in isolation. If errors persist, delete stale `*.tsbuildinfo` and `dist/*.d.ts` files for the lib
package and retry.
