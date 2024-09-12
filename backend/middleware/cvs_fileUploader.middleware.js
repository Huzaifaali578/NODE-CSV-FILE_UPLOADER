import multer from "multer";
import fs from "fs"

const uploadPath = "./uploads/";

// Ensure the directory exists
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true }); // Create the directory
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        // const fileName = `${Date.now}-${file.originalname}`;
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: storage
});

export default upload;