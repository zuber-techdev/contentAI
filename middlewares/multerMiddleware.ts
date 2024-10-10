import { NextApiResponse } from "next";
import { NextApiRequestWithFile } from "../types/nextApiRequestWithFile";
import { NextFunction } from "express";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const finalFileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    cb(null, finalFileName);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image files are allowed."));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter,
});

export const multerMiddleware = (
  req: NextApiRequestWithFile,
  res: NextApiResponse,
  next: NextFunction
) => {
  return new Promise((resolve, reject) => {
    upload.single("profileImage")(req as any, res as any, (err: any) => {
      if (err instanceof multer.MulterError) {
        // Handle multer-specific errors
        if (err.code === "LIMIT_FILE_SIZE") {
          reject(new Error("File too large. Maximum file size is 10MB."));
        } else {
          reject(err);
        }
      } else if (err) {
        reject(err);
      }
      resolve(true);
    });
  }).then(() => next());
};
