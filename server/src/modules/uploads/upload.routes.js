import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import HttpError from '../../utils/HttpError.js';

export const UPLOAD_DIR = path.resolve(import.meta.dirname, '../../../uploads');

const EKSTENSI = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

const upload = multer({
    storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => cb(null, `${randomUUID()}${EKSTENSI[file.mimetype]}`),
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (EKSTENSI[file.mimetype]) {
            return cb(null, true);
        }
        cb(new HttpError(400, 'File harus berupa gambar JPG, PNG, atau WEBP'));
    },
});

function uploadImage(req, res, next) {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            const message =
                err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran gambar maksimal 2 MB' : 'Upload gambar tidak valid';
            return next(new HttpError(400, message));
        }
        next(err);
    });
}

const router = Router();

router.post('/', uploadImage, (req, res) => {
    if (!req.file) {
        throw new HttpError(400, 'Gambar wajib diunggah');
    }

    res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default router;