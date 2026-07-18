import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAdmin } from "../middlewares/require-admin";
import { uploadFileBuffer } from "../lib/cloudinary";

const router: IRouter = Router();

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${file.mimetype}' is not allowed. Only PDF and images are accepted.`));
    }
  },
});

router.post(
  "/admin/uploads",
  requireAdmin,
  upload.single("file"),
  async (req, res, next): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Missing file", code: "VALIDATION_ERROR" });
        return;
      }

      const url = await uploadFileBuffer(req.file.buffer, req.file.originalname);
      res.json({ url });
    } catch (err) {
      req.log.error({ err }, "Cloudinary upload failed");
      next(err);
    }
  },
);

export default router;
