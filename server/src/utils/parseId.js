import HttpError from './HttpError.js';

const MAX_INT = 2_147_483_647;

export default function parseId(value, message = 'ID tidak valid') {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0 || id > MAX_INT) {
        throw new HttpError(400, message);
    }

    return id;
}