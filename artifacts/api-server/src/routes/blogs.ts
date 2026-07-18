import { Router, type IRouter } from "express";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db, blogsTable } from "@workspace/db";
import {
  ListBlogsResponse,
  GetBlogParams,
  GetBlogResponse,
  AdminListBlogsResponse,
  CreateBlogBody,
  CreateBlogResponse,
  UpdateBlogParams,
  UpdateBlogBody,
  UpdateBlogResponse,
  DeleteBlogParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import { withDateStrings } from "../lib/dates";
import { parsePagination, paginate } from "../lib/pagination";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Public: list published blogs (with pagination)
// ---------------------------------------------------------------------------
router.get("/blogs", async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const category = typeof req.query["category"] === "string" ? req.query["category"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [eq(blogsTable.status, "published")];
    if (search) {
      conditions.push(
        or(
          ilike(blogsTable.title, `%${search}%`),
          ilike(blogsTable.excerpt, `%${search}%`),
        )!,
      );
    }
    if (category) {
      conditions.push(eq(blogsTable.category, category));
    }

    const whereClause = and(...conditions);

    const [blogs, [totalRow]] = await Promise.all([
      db
        .select()
        .from(blogsTable)
        .where(whereClause)
        .orderBy(desc(blogsTable.publishedAt), desc(blogsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(blogsTable).where(whereClause),
    ]);

    const parsed = ListBlogsResponse.parse(blogs);
    res.json(paginate(parsed, totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Public: get single published blog
// ---------------------------------------------------------------------------
router.get("/blogs/:id", async (req, res, next): Promise<void> => {
  try {
    const params = GetBlogParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid blog ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [blog] = await db
      .select()
      .from(blogsTable)
      .where(and(eq(blogsTable.id, params.data.id), eq(blogsTable.status, "published")));

    if (!blog) {
      res.status(404).json({ error: "Blog not found", code: "NOT_FOUND" });
      return;
    }

    res.json(GetBlogResponse.parse(blog));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Public: get all blog categories
// ---------------------------------------------------------------------------
router.get("/blogs/categories", async (_req, res): Promise<void> => {
  try {
    const result = await db
      .select({ category: blogsTable.category })
      .from(blogsTable)
      .where(eq(blogsTable.status, "published"))
      .groupBy(blogsTable.category)
      .orderBy(blogsTable.category);

    const categories = (result as unknown as Array<{ category: string }>).map((r) => r.category);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories", code: "SERVER_ERROR" });
  }
});

// ---------------------------------------------------------------------------
// Admin: list all blogs (with pagination)
// ---------------------------------------------------------------------------
router.get("/admin/blogs", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [];
    if (status === "draft" || status === "published") {
      conditions.push(eq(blogsTable.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(blogsTable.title, `%${search}%`),
          ilike(blogsTable.excerpt, `%${search}%`),
        )!,
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [blogs, [totalRow]] = await Promise.all([
      db
        .select()
        .from(blogsTable)
        .where(whereClause)
        .orderBy(desc(blogsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(blogsTable).where(whereClause),
    ]);

    const parsed = AdminListBlogsResponse.parse(blogs);
    res.json(paginate(parsed, totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin: create blog
// ---------------------------------------------------------------------------
router.post("/admin/blogs", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateBlogBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const values = withDateStrings(parsed.data, ["publishedAt"]);
    const [blog] = await db.insert(blogsTable).values(values).returning();

    res.status(201).json(CreateBlogResponse.parse(blog));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin: update blog
// ---------------------------------------------------------------------------
router.patch("/admin/blogs/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = UpdateBlogParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid blog ID", code: "VALIDATION_ERROR" });
      return;
    }

    const parsed = UpdateBlogBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const values = withDateStrings(parsed.data, ["publishedAt"]);
    const [blog] = await db
      .update(blogsTable)
      .set(values)
      .where(eq(blogsTable.id, params.data.id))
      .returning();

    if (!blog) {
      res.status(404).json({ error: "Blog not found", code: "NOT_FOUND" });
      return;
    }

    res.json(UpdateBlogResponse.parse(blog));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin: delete blog
// ---------------------------------------------------------------------------
router.delete("/admin/blogs/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = DeleteBlogParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid blog ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [blog] = await db.delete(blogsTable).where(eq(blogsTable.id, params.data.id)).returning();

    if (!blog) {
      res.status(404).json({ error: "Blog not found", code: "NOT_FOUND" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;