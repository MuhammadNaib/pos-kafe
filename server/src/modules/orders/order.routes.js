import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { createOrderSchema } from './order.schema.js';
import * as orderService from './order.service.js';

const router = Router();

router.post('/', validate(createOrderSchema), async (req, res) => {
  const order = await orderService.createCashOrder(req.body, req.user.id);
  res.status(201).json(order);
});

export default router;