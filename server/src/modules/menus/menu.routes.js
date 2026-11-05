import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { requireRole } from '../../middlewares/auth.js';
import parseId from '../../utils/parseId.js';
import { menuSchema, menuUpdateSchema } from './menu.schema.js';
import * as menuService from './menu.service.js';

const router = Router();
const hanyaAdmin = requireRole('ADMIN');

router.get('/', async (req, res) => {
    const { categoryId, includeInactive } = req.query;

    const menus = await menuService.listMenus({
        categoryId: categoryId === undefined ? undefined : parseId(categoryId, 'Kategori tidak valid'),
        includeInactive: includeInactive === 'true',
    });

    res.json(menus);
});

router.get('/:id', async (req, res) => {
    const menu = await menuService.getMenu(parseId(req.params.id));
    res.json(menu);
});

router.post('/', hanyaAdmin, validate(menuSchema), async (req, res) => {
    const menu = await menuService.createMenu(req.body);
    res.status(201).json(menu);
});

router.put('/:id', hanyaAdmin, validate(menuUpdateSchema), async (req, res) => {
    const menu = await menuService.updateMenu(parseId(req.params.id), req.body);
    res.json(menu);
});

router.delete('/:id', hanyaAdmin, async (req, res) => {
    await menuService.deactivateMenu(parseId(req.params.id));
    res.status(204).end();
});

export default router;