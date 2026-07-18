import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, topicsTable } from "@workspace/db";
import {
  ListTopicsBySubjectParams,
  ListTopicsBySubjectResponse,
  AdminListTopicsResponse,
  CreateTopicBody,
  CreateTopicResponse,
  UpdateTopicParams,
  UpdateTopicBody,
  UpdateTopicResponse,
  DeleteTopicParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.get("/subjects/:id/topics", async (req, res, next): Promise<void> => {
  try {
    const params = ListTopicsBySubjectParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid subject ID", code: "VALIDATION_ERROR" });
      return;
    }

    const topics = await db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.subjectId, params.data.id))
      .orderBy(asc(topicsTable.name));

    res.json(ListTopicsBySubjectResponse.parse(topics));
  } catch (err) {
    next(err);
  }
});

router.get("/admin/topics", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const subjectIdRaw = req.query["subjectId"];
    const subjectId =
      typeof subjectIdRaw === "string" && subjectIdRaw.length > 0 ? Number(subjectIdRaw) : undefined;

    const topics = await db
      .select()
      .from(topicsTable)
      .where(subjectId !== undefined ? eq(topicsTable.subjectId, subjectId) : undefined)
      .orderBy(asc(topicsTable.name));

    res.json(AdminListTopicsResponse.parse(topics));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/topics", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateTopicBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const [topic] = await db.insert(topicsTable).values(parsed.data).returning();
    res.status(201).json(CreateTopicResponse.parse(topic));
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/topics/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = UpdateTopicParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid topic ID", code: "VALIDATION_ERROR" });
      return;
    }

    const parsed = UpdateTopicBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const [topic] = await db
      .update(topicsTable)
      .set(parsed.data)
      .where(eq(topicsTable.id, params.data.id))
      .returning();

    if (!topic) {
      res.status(404).json({ error: "Topic not found", code: "NOT_FOUND" });
      return;
    }

    res.json(UpdateTopicResponse.parse(topic));
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/topics/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = DeleteTopicParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid topic ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [topic] = await db
      .delete(topicsTable)
      .where(eq(topicsTable.id, params.data.id))
      .returning();

    if (!topic) {
      res.status(404).json({ error: "Topic not found", code: "NOT_FOUND" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
