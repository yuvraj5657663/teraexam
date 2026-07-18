import { Router, type IRouter } from "express";
import { and, count, desc, eq, or, ilike } from "drizzle-orm";
import { db, admitCardsTable } from "@workspace/db";
import {
  ListAdmitCardsResponse,
  GetAdmitCardParams,
  GetAdmitCardResponse,
  AdminListAdmitCardsResponse,
  CreateAdmitCardBody,
  CreateAdmitCardResponse,
  UpdateAdmitCardParams,
  UpdateAdmitCardBody,
  UpdateAdmitCardResponse,
  DeleteAdmitCardParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import { withDateStrings } from "../lib/dates";
import { parsePagination, paginate } from "../lib/pagination";

const router: IRouter = Router();

router.get("/admit-cards", async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [eq(admitCardsTable.status, "published")];
    if (search) {
      conditions.push(
        or(
          ilike(admitCardsTable.title, `%${search}%`),
          ilike(admitCardsTable.organization, `%${search}%`),
          ilike(admitCardsTable.examName, `%${search}%`),
        )!,
      );
    }

    const whereClause = and(...conditions);
    const [admitCards, [totalRow]] = await Promise.all([
      db
        .select()
        .from(admitCardsTable)
        .where(whereClause)
        .orderBy(desc(admitCardsTable.examDate))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(admitCardsTable).where(whereClause),
    ]);

    res.json(paginate(ListAdmitCardsResponse.parse(admitCards), totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

router.get("/admit-cards/:id", async (req, res, next): Promise<void> => {
  try {
    const params = GetAdmitCardParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid admit card ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [admitCard] = await db
      .select()
      .from(admitCardsTable)
      .where(and(eq(admitCardsTable.id, params.data.id), eq(admitCardsTable.status, "published")));

    if (!admitCard) {
      res.status(404).json({ error: "Admit card not found", code: "NOT_FOUND" });
      return;
    }

    res.json(GetAdmitCardResponse.parse(admitCard));
  } catch (err) {
    next(err);
  }
});

router.get("/admin/admit-cards", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
    const { page, limit, offset } = parsePagination(req);

    const conditions = [];
    if (status === "draft" || status === "published") {
      conditions.push(eq(admitCardsTable.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(admitCardsTable.title, `%${search}%`),
          ilike(admitCardsTable.organization, `%${search}%`),
          ilike(admitCardsTable.examName, `%${search}%`),
        )!,
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [admitCards, [totalRow]] = await Promise.all([
      db
        .select()
        .from(admitCardsTable)
        .where(whereClause)
        .orderBy(desc(admitCardsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(admitCardsTable).where(whereClause),
    ]);

    res.json(paginate(AdminListAdmitCardsResponse.parse(admitCards), totalRow?.value ?? 0, { page, limit, offset }));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/admit-cards", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateAdmitCardBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const values = withDateStrings(parsed.data, ["examDate"]);
    const [admitCard] = await db.insert(admitCardsTable).values(values).returning();

    res.status(201).json(CreateAdmitCardResponse.parse(admitCard));
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/admit-cards/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = UpdateAdmitCardParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid admit card ID", code: "VALIDATION_ERROR" });
      return;
    }

    const parsed = UpdateAdmitCardBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const values = withDateStrings(parsed.data, ["examDate"]);
    const [admitCard] = await db
      .update(admitCardsTable)
      .set(values)
      .where(eq(admitCardsTable.id, params.data.id))
      .returning();

    if (!admitCard) {
      res.status(404).json({ error: "Admit card not found", code: "NOT_FOUND" });
      return;
    }

    res.json(UpdateAdmitCardResponse.parse(admitCard));
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/admit-cards/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = DeleteAdmitCardParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid admit card ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [admitCard] = await db
      .delete(admitCardsTable)
      .where(eq(admitCardsTable.id, params.data.id))
      .returning();

    if (!admitCard) {
      res.status(404).json({ error: "Admit card not found", code: "NOT_FOUND" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
