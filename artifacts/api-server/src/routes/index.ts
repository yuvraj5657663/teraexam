import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import homeRouter from "./home";
import jobsRouter from "./jobs";
import resultsRouter from "./results";
import admitCardsRouter from "./admit-cards";
import syllabusRouter from "./syllabus";
import subjectsRouter from "./subjects";
import topicsRouter from "./topics";
import questionsRouter from "./questions";
import scrapedItemsRouter from "./scraped-items";
import uploadsRouter from "./uploads";
import adminDashboardRouter from "./admin-dashboard";
import blogsRouter from "./blogs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(homeRouter);
router.use(jobsRouter);
router.use(resultsRouter);
router.use(admitCardsRouter);
router.use(syllabusRouter);
router.use(subjectsRouter);
router.use(topicsRouter);
router.use(questionsRouter);
router.use(scrapedItemsRouter);
router.use(uploadsRouter);
router.use(adminDashboardRouter);
router.use(blogsRouter);

export default router;
