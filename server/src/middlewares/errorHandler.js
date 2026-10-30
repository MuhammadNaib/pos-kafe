import HttpError from '../utils/HttpError.js';

export default function errorHandler(err, req, res, next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ message: err.message });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Format JSON tidak valid' });
    }

    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
}