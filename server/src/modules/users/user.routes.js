import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import parseId from '../../utils/parseId.js';
import { createUserSchema, updateUserSchema } from './user.schema.js';
import * as userService from './user.service.js';

const router = Router();

router.get('/', async (req, res) => {
    res.json(await userService.listUsers());
});

router.post('/', validate(createUserSchema), async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
});

router.put('/:id', validate(updateUserSchema), async (req, res) => {
    const user = await userService.updateUser(parseId(req.params.id), req.body, req.user.id);
    res.json(user);
});

export default router;