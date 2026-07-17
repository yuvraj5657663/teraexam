import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAdmin } from "../middlewares/require-admin";
import { uploadFileBuffer } from "../lib/cloudinary";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// NOT part of the OpenAPI contract — multipart/form-data binary bodies don't
// round-trip cleanly through the Zod/react-query codegen in this repo. The
// frontend calls this endpoint directly with fetch() + FormData.
router.post("/admin/uploads", requireAdmin, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "Missing file" });
    return;
  }

  try {
    const url = await uploadFileBuffer(req.file.buffer, req.file.originalname);
    res.json({ url });
  } catch (err) {
    req.log.error({ err }, "Cloudinary upload failed");
    res.status(502).json({ error: "Upload failed" });
  }
});

export default router;
