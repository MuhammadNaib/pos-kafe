import express from 'express';
import HttpError from './utils/HttpError.js';
import errorHandler from './middlewares/errorHandler.js';
import categoryRoutes from './modules/categories/category.routes.js';
import menuRoutes from './modules/menus/menu.routes.js';
import uploadRoutes, { UPLOAD_DIR } from './modules/uploads/upload.routes.js';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes.js';
import { requireAuth, requireRole } from './middlewares/auth.js';
import userRoutes from './modules/users/user.routes.js';

const app = express();

app.use(express.json());
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/menus', requireAuth, menuRoutes);
app.use('/api/uploads', requireAuth, requireRole('ADMIN'), uploadRoutes);
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api/uploads', requireAuth, requireRole('ADMIN'), uploadRoutes);
app.use('/api/users', requireAuth, requireRole('ADMIN'), userRoutes);

app.use((req, res, next) => {
    next(new HttpError(404, 'Rute tidak ditemukan'));
});

app.use(errorHandler);

export default app;