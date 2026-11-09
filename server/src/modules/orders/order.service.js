import prisma from '../../lib/prisma.js';
import HttpError from '../../utils/HttpError.js';

const MAKS_JUMLAH = 99;

const orderSelect = {
  id: true,
  code: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  total: true,
  cashPaid: true,
  change: true,
  createdAt: true,
  cashier: { select: { id: true, name: true } },
  items: {
    orderBy: { id: 'asc' },
    select: { id: true, menuId: true, menuName: true, price: true, quantity: true, subtotal: true },
  },
};

export function formatOrderCode(id) {
  return `KS-${String(id).padStart(6, '0')}`;
}

function gabungkanItem(items) {
  const jumlahPerMenu = new Map();

  for (const { menuId, quantity } of items) {
    jumlahPerMenu.set(menuId, (jumlahPerMenu.get(menuId) ?? 0) + quantity);
  }

  return [...jumlahPerMenu].map(([menuId, quantity]) => {
    if (quantity > MAKS_JUMLAH) {
      throw new HttpError(400, 'Jumlah harus 1 sampai 99');
    }
    return { menuId, quantity };
  });
}

async function susunItemPesanan(items) {
  const daftar = gabungkanItem(items);
  const menus = await prisma.menu.findMany({
    where: { id: { in: daftar.map((item) => item.menuId) } },
  });
  const menuById = new Map(menus.map((menu) => [menu.id, menu]));

  return daftar.map(({ menuId, quantity }) => {
    const menu = menuById.get(menuId);

    if (!menu) {
      throw new HttpError(400, 'Menu tidak ditemukan');
    }

    if (!menu.isActive) {
      throw new HttpError(400, `Menu "${menu.name}" sudah tidak dijual`);
    }

    return {
      menuId,
      menuName: menu.name,
      price: menu.price,
      quantity,
      subtotal: menu.price * quantity,
    };
  });
}

export async function createCashOrder({ items, cashPaid }, cashierId) {
  const orderItems = await susunItemPesanan(items);
  const total = orderItems.reduce((jumlah, item) => jumlah + item.subtotal, 0);

  if (cashPaid < total) {
    throw new HttpError(400, 'Uang yang diterima kurang dari total');
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        total,
        cashPaid,
        change: cashPaid - total,
        cashierId,
        items: { create: orderItems },
      },
    });

    return tx.order.update({
      where: { id: order.id },
      data: { code: formatOrderCode(order.id) },
      select: orderSelect,
    });
  });
}

export async function listOrders({ from, to, user }) {
  const where = {};

  if (user.role !== 'ADMIN') {
    where.cashierId = user.id;
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      code: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
      createdAt: true,
      cashier: { select: { id: true, name: true } },
      items: { select: { quantity: true } },
    },
  });

  return orders.map(({ items, ...order }) => ({
    ...order,
    itemCount: items.reduce((jumlah, item) => jumlah + item.quantity, 0),
  }));
}

export async function getOrder(id, user) {
  const where = { id };

  if (user.role !== 'ADMIN') {
    where.cashierId = user.id;
  }

  const order = await prisma.order.findFirst({ where, select: orderSelect });

  if (!order) {
    throw new HttpError(404, 'Pesanan tidak ditemukan');
  }

  return order;
}