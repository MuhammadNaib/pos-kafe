import prisma from '../../lib/prisma.js';
import HttpError from '../../utils/HttpError.js';

const menuSelect = {
    id: true,
    name: true,
    price: true,
    imageUrl: true,
    stock: true,
    minStock: true,
    isActive: true,
    category: { select: { id: true, name: true } },
};

async function ensureCategoryExists(categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!category) {
        throw new HttpError(400, 'Kategori tidak ditemukan');
    }
}

export async function createMenu(data) {
    await ensureCategoryExists(data.categoryId);
    return prisma.menu.create({ data, select: menuSelect });
}

export async function listMenus({ categoryId, includeInactive = false } = {}) {
    const where = {};

    if (!includeInactive) {
        where.isActive = true;
    }

    if (categoryId) {
        where.categoryId = categoryId;
    }

    return prisma.menu.findMany({ where, orderBy: { name: 'asc' }, select: menuSelect });
}

export async function getMenu(id) {
    const menu = await prisma.menu.findUnique({ where: { id }, select: menuSelect });

    if (!menu) {
        throw new HttpError(404, 'Menu tidak ditemukan');
    }

    return menu;
}

export async function updateMenu(id, data) {
    await getMenu(id);

    if (data.categoryId !== undefined) {
        await ensureCategoryExists(data.categoryId);
    }

    return prisma.menu.update({ where: { id }, data, select: menuSelect });
}

export async function deactivateMenu(id) {
    await getMenu(id);
    await prisma.menu.update({ where: { id }, data: { isActive: false } });
}