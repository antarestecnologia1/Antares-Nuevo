import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

export const JOB_CV_UPLOAD_MAX_BYTES = 6 * 1024 * 1024;

/**
 * multipart/form-data campo `attachment` (hoja de vida).
 */
export function jobApplicationCvMultipart() {
  return FileInterceptor("attachment", {
    storage: memoryStorage(),
    limits: { fileSize: JOB_CV_UPLOAD_MAX_BYTES }
  });
}
