import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { createOrderSchema } from './order.schema.js';
import * as orderService from './order.service.js';
import HttpError from '../../utils/HttpError.js';
import parseId from '../../utils/parseId.js';

const router = Router();

router.post('/', validate(createOrderSchema), async (req, res) => {
  const order = await orderService.createCashOrder(req.body, req.user.id);
  res.status(201).json(order);
});

function parseTanggal(value) {
  if (value === undefined || value === '') return undefined;

  const tanggal = new Date(value);

  if (typeof value !== 'string' || Number.isNaN(tanggal.getTime())) {
    throw new HttpError(400, 'Rentang tanggal tidak valid');
  }

  return tanggal;
}

router.get('/', async (req, res) => {
  const orders = await orderService.listOrders({
    from: parseTanggal(req.query.from),
    to: parseTanggal(req.query.to),
    user: req.user,
  });
  res.json(orders);
});

router.get('/:id', async (req, res) => {
  const order = await orderService.getOrder(parseId(req.params.id), req.user);
  res.json(order);
});

export default router;