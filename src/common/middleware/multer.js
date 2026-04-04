
import multer from "multer";
import fs from "node:fs";

export const multer_local = ({ custom_path = "general", custom_types = [] } = {}) => {

    const full_path = `uploads/${custom_path}`
    if (!fs.existsSync(full_path)) {
        fs.mkdirSync(full_path, { recursive: true })
    }
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, full_path)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + "_" + file.originalname)
        }
    })
    const fileFilter = (req, file, cb) => {
        if (!custom_types.includes(file.mimetype)) {
           return cb(new Error("invalid file type"))
        }
        cb(null, true)
    }
    const upload = multer({ storage, fileFilter });
    return upload;
}


export const multer_host = (custom_types = [] ) => {
    const storage = multer.diskStorage({
    })
    const fileFilter = (req, file, cb) => {
        if (!custom_types.includes(file.mimetype)) {
            cb(new Error("invalid file type"))
        }
        cb(null, true)
    }
    const upload = multer({ storage, fileFilter });
    return upload;
}