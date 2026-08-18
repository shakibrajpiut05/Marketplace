import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.resolve(
  "uploads/documents"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const baseName = path
      .basename(
        file.originalname,
        extension
      )
      .replace(/[^a-zA-Z0-9-_]/g, "-");

    cb(
      null,
      `${Date.now()}-${baseName}${extension}`
    );
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, JPG, PNG and WEBP files are allowed"
      )
    );
  }
};

export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});