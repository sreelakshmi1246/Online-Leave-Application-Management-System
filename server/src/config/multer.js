import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ensure uploads folders exist
const uploadsRoot = path.resolve('uploads');
const attachmentsDir = path.join(uploadsRoot, 'attachments');
const csvDir = path.join(uploadsRoot, 'csv');

[uploadsRoot, attachmentsDir, csvDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storageAttachments = multer.diskStorage({
  destination: (req, file, cb) => cb(null, attachmentsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`);
  }
});

const storageCSV = multer.diskStorage({
  destination: (req, file, cb) => cb(null, csvDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.csv';
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const uploadAttachments = multer({ storage: storageAttachments });
export const uploadCSV = multer({ storage: storageCSV });
