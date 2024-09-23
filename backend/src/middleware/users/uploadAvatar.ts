import fs from "fs";
import multer from "multer";
import path from "path";
import { Request, Response, NextFunction } from 'express';

const avatarUpload = (req: Request, res: Response, next: NextFunction) => {
  
  const up_folder = path.join(__dirname, "../../assets/userAvatars");

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(up_folder)) {
        fs.mkdirSync(up_folder, { recursive: true });
      }
      cb(null, up_folder);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });

   // File filter to check for the field name
    const fileFilter = (req: Request, file: Express.Multer.File, cb: (error: (Error | null), acceptFile?: boolean) => void) => {
    // First check the fieldname
    if (file.fieldname !== 'avatar') {
      return cb(new Error('Invalid fieldname'), false); // Stop further checks if fieldname is wrong
    }
  
    // Then check the file type (mimetype)
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'), false); // Reject invalid file types
    }
  };
  

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 20 * 1024 * 1024,
    },
    fileFilter:fileFilter
  });

  /*  This allows us to parse multipart/form-data    */
  upload.any()(req, res, (err) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: err.message,
      });
    } else {
      next();
    }
  });
}

export default avatarUpload;