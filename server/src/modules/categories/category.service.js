import prisma from '../../lib/prisma.js';
import HttpError from '../../utils/HttpError.js';

export async function listCategories() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { menus: true } } },
    });

    return categories.map((category) => ({
        id: category.id,
        name: category.name,
        menuCount: category._count.menus,
    }));
}

async function ensureNameAvailable(name, excludeId) {
    const where = { name: { equals: name, mode: 'insensitive' } };

    if (excludeId) {
        where.id = { not: excludeId };
    }

    const existing = await prisma.category.findFirst({ where });

    if (existing) {
        throw new HttpError(409, 'Kategori sudah ada');
    }
}

async function findCategoryOrThrow(id) {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
        throw new HttpError(404, 'Kategori tidak ditemukan');
    }

    return category;
}

export async function createCategory(data) {
    await ensureNameAvailable(data.name);
    return prisma.category.create({ data });
}

export async function updateCategory(id, data) {
    await findCategoryOrThrow(id);
    await ensureNameAvailable(data.name, id);
    return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id) {
    await findCategoryOrThrow(id);

    const menuCount = await prisma.menu.count({ where: { categoryId: id } });

    if (menuCount > 0) {
        throw new HttpError(409, 'Kategori masih memiliki menu');
    }

    await prisma.category.delete({ where: { id } });
}