import multer from "multer";

const uploadPath = "./uploads/";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now}-${file.originalname}`;
        cb(null, fileName)
    }
})

export default upload = multer({
    storage: storage
});