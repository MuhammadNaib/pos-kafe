import parseId from '../../utils/parseId.js';
import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { categorySchema } from './category.schema.js';
import * as categoryService from './category.service.js';

const router = Router();

router.get('/', async (req, res) => {
    const categories = await categoryService.listCategories();
    res.json(categories);
});

router.post('/', validate(categorySchema), async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
});

router.put('/:id', validate(categorySchema), async (req, res) => {
    const id = parseId(req.params.id);
    const category = await categoryService.updateCategory(id, req.body);
    res.json(category);
});

router.delete('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    await categoryService.deleteCategory(id);
    res.status(204).end();
});

export default router;