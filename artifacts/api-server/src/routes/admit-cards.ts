import { Router, type IRouter } from "express";
import { and, desc, eq, or, ilike } from "drizzle-orm";
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

const router: IRouter = Router();

router.get("/admit-cards", async (req, res): Promise<void> => {
  const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;

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

  const admitCards = await db
    .select()
    .from(admitCardsTable)
    .where(and(...conditions))
    .orderBy(desc(admitCardsTable.examDate));

  res.json(ListAdmitCardsResponse.parse(admitCards));
});

router.get("/admit-cards/:id", async (req, res): Promise<void> => {
  const params = GetAdmitCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [admitCard] = await db
    .select()
    .from(admitCardsTable)
    .where(and(eq(admitCardsTable.id, params.data.id), eq(admitCardsTable.status, "published")));

  if (!admitCard) {
    res.status(404).json({ error: "Admit card not found" });
    return;
  }

  res.json(GetAdmitCardResponse.parse(admitCard));
});

router.get("/admin/admit-cards", requireAdmin, async (req, res): Promise<void> => {
  const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
  const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;

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

  const admitCards = await db
    .select()
    .from(admitCardsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(admitCardsTable.createdAt));

  res.json(AdminListAdmitCardsResponse.parse(admitCards));
});

router.post("/admin/admit-cards", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdmitCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const values = withDateStrings(parsed.data, ["examDate"]);
  const [admitCard] = await db.insert(admitCardsTable).values(values).returning();

  res.status(201).json(CreateAdmitCardResponse.parse(admitCard));
});

router.patch("/admin/admit-cards/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdmitCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAdmitCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const values = withDateStrings(parsed.data, ["examDate"]);
  const [admitCard] = await db
    .update(admitCardsTable)
    .set(values)
    .where(eq(admitCardsTable.id, params.data.id))
    .returning();

  if (!admitCard) {
    res.status(404).json({ error: "Admit card not found" });
    return;
  }

  res.json(UpdateAdmitCardResponse.parse(admitCard));
});

router.delete("/admin/admit-cards/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdmitCardParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [admitCard] = await db
    .delete(admitCardsTable)
    .where(eq(admitCardsTable.id, params.data.id))
    .returning();

  if (!admitCard) {
    res.status(404).json({ error: "Admit card not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
