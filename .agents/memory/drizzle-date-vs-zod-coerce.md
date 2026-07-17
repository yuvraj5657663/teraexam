---
name: Drizzle date-string columns vs Orval-generated Zod date coercion
description: Orval turns OpenAPI `format: date` into `zod.coerce.date()` (a JS Date), which is incompatible with Drizzle `date(..., { mode: "string" })` columns.
---

When an OpenAPI schema field has `format: date`, Orval's Zod plugin generates `zod.coerce.date()`, so a
validated request body has real `Date` objects for those fields. If the corresponding Drizzle column is
declared with `date(..., { mode: "string" })` (common when you want plain `YYYY-MM-DD` semantics without
timezone surprises), passing the parsed body straight into `db.insert(...)`/`db.update(...).set(...)` fails
to typecheck (`Type 'Date' is not assignable to type 'string | ...'`).

**Why:** The two libraries disagree on the JS representation of a date-only value, and this mismatch only
surfaces at the DB call site, not at the Zod parse site — easy to miss until a full workspace typecheck runs.

**How to apply:** Before inserting/updating, convert any `Date` fields back to `YYYY-MM-DD` strings
(`value.toISOString().slice(0, 10)`). Write one small shared helper per backend package that takes the parsed
body and a list of date-field keys, and returns a version with those keys typed as `string` — reuse it in
every route that writes date fields, rather than repeating inline conversions.
