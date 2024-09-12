import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(__dirname, 'uploads');

// Check if the uploads directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Define an absolute path for file uploads
const uploadPath = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Save the file in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Append a timestamp to the filename to avoid overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// Set up the multer instance for file uploads
const upload = multer({
  storage: storage
});

export default upload;
