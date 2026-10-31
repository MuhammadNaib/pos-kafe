import express from 'express';
import HttpError from './utils/HttpError.js';
import errorHandler from './middlewares/errorHandler.js';
import categoryRoutes from './modules/categories/category.routes.js';
import menuRoutes from './modules/menus/menu.routes.js';
import uploadRoutes, { UPLOAD_DIR } from './modules/uploads/upload.routes.js';

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/uploads', express.static(UPLOAD_DIR));

app.use((req, res, next) => {
    next(new HttpError(404, 'Rute tidak ditemukan'));
});

app.use(errorHandler);

export default app;