import { Router, type IRouter } from "express";
import { asc, eq, inArray } from "drizzle-orm";
import { db, questionsTable } from "@workspace/db";
import {
  ListQuestionsByTopicParams,
  ListQuestionsByTopicResponse,
  SubmitTopicAnswersParams,
  SubmitTopicAnswersBody,
  SubmitTopicAnswersResponse,
  AdminListQuestionsResponse,
  CreateQuestionBody,
  CreateQuestionResponse,
  UpdateQuestionParams,
  UpdateQuestionBody,
  UpdateQuestionResponse,
  DeleteQuestionParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

type QuestionRow = typeof questionsTable.$inferSelect;

// ---------------------------------------------------------------------------
// Public: list questions for practice (answers withheld)
// ---------------------------------------------------------------------------
router.get("/topics/:id/questions", async (req, res, next): Promise<void> => {
  try {
    const params = ListQuestionsByTopicParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid topic ID", code: "VALIDATION_ERROR" });
      return;
    }

    const questions = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.topicId, params.data.id))
      .orderBy(asc(questionsTable.id));

    // Strip correct answers for public API
    const practiceQuestions = questions.map((q: QuestionRow) => ({
      id: q.id,
      topicId: q.topicId,
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
    }));

    res.json(ListQuestionsByTopicResponse.parse(practiceQuestions));
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Public: submit answers and get scored results
// ---------------------------------------------------------------------------
router.post("/topics/:id/submit", async (req, res, next): Promise<void> => {
  try {
    const params = SubmitTopicAnswersParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid topic ID", code: "VALIDATION_ERROR" });
      return;
    }

    const parsed = SubmitTopicAnswersBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const questionIds = parsed.data.answers.map((a) => a.questionId);
    const questions = questionIds.length
      ? await db.select().from(questionsTable).where(inArray(questionsTable.id, questionIds))
      : [];

    const questionsById = new Map<number, QuestionRow>(
      questions.map((q: QuestionRow) => [q.id, q]),
    );

    let score = 0;
    const results = parsed.data.answers.map((answer) => {
      const question = questionsById.get(answer.questionId);
      const correctOption = question?.correctOptionIndex ?? -1;
      const correct = question != null && answer.selectedOption === correctOption;
      if (correct) score += 1;
      return {
        questionId: answer.questionId,
        correct,
        selectedOption: answer.selectedOption,
        correctOption,
        explanation: question?.explanation ?? null,
      };
    });

    res.json(
      SubmitTopicAnswersResponse.parse({
        score,
        total: parsed.data.answers.length,
        results,
      }),
    );
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin: list all questions (with answers)
// ---------------------------------------------------------------------------
router.get("/admin/questions", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const topicIdRaw = req.query["topicId"];
    const topicId =
      typeof topicIdRaw === "string" && topicIdRaw.length > 0 ? Number(topicIdRaw) : undefined;

    const questions = await db
      .select()
      .from(questionsTable)
      .where(topicId !== undefined ? eq(questionsTable.topicId, topicId) : undefined)
      .orderBy(asc(questionsTable.id));

    res.json(AdminListQuestionsResponse.parse(questions));
  } catch (err) {
    next(err);
  }
});

router.post("/admin/questions", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateQuestionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const [question] = await db.insert(questionsTable).values(parsed.data).returning();
    res.status(201).json(CreateQuestionResponse.parse(question));
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/questions/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = UpdateQuestionParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid question ID", code: "VALIDATION_ERROR" });
      return;
    }

    const parsed = UpdateQuestionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message, code: "VALIDATION_ERROR" });
      return;
    }

    const [question] = await db
      .update(questionsTable)
      .set(parsed.data)
      .where(eq(questionsTable.id, params.data.id))
      .returning();

    if (!question) {
      res.status(404).json({ error: "Question not found", code: "NOT_FOUND" });
      return;
    }

    res.json(UpdateQuestionResponse.parse(question));
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/questions/:id", requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const params = DeleteQuestionParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid question ID", code: "VALIDATION_ERROR" });
      return;
    }

    const [question] = await db
      .delete(questionsTable)
      .where(eq(questionsTable.id, params.data.id))
      .returning();

    if (!question) {
      res.status(404).json({ error: "Question not found", code: "NOT_FOUND" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
