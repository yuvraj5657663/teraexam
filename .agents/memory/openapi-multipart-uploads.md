---
name: OpenAPI multipart uploads break Orval/Zod codegen
description: Multipart/binary request bodies in an OpenAPI spec break Orval's react-query + Zod codegen in this monorepo.
---

Adding a `multipart/form-data` (file upload) path/schema to the shared `openapi.yaml` breaks the generated
`@workspace/api-client-react` and `@workspace/api-zod` codegen (`Cannot find name 'File'/'Blob'`, duplicate
exported type names).

**Why:** The Orval + Zod codegen pipeline used by this template targets JSON request/response bodies. It has
no clean handling for binary/multipart bodies, and Node's TS lib doesn't have `File`/`Blob` types available
by default in the generated server-side code.

**How to apply:** Do not add file-upload endpoints to the OpenAPI spec. Implement them directly in Express
(e.g. `multer` + memory storage, then stream to whatever storage provider — S3, Cloudinary, App Storage) as a
plain route outside the generated-hook contract. On the frontend, call the route with a raw `fetch()` +
`FormData`, manually attaching the bearer token — do not try to route it through a generated `use*` hook.
Leave a comment in `openapi.yaml` near the removed path explaining why, so a future agent doesn't re-add it.
