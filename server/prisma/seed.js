import prisma from '../src/lib/prisma.js';

const categories = [
    {
        name: 'Kopi',
        menus: [
            { name: 'Kopi Susu Gula Aren', price: 22000, stock: 50 },
            { name: 'Americano', price: 18000, stock: 50 },
        ],
    },
    {
        name: 'Non-Kopi',
        menus: [
            { name: 'Matcha Latte', price: 25000, stock: 40 },
            { name: 'Cokelat Panas', price: 23000, stock: 40 },
        ],
    },
    {
        name: 'Makanan',
        menus: [
            { name: 'Nasi Goreng Kampung', price: 28000, stock: 20 },
            { name: 'Mie Goreng Spesial', price: 25000, stock: 20 },
        ],
    },
    {
        name: 'Snack',
        menus: [
            { name: 'Kentang Goreng', price: 18000, stock: 3 },
            { name: 'Pisang Goreng', price: 15000, stock: 25 },
        ],
    },
];

async function main() {
    await prisma.menu.deleteMany();
    await prisma.category.deleteMany();

    for (const category of categories) {
        await prisma.category.create({
            data: {
                name: category.name,
                menus: { create: category.menus },
            },
        });
    }

    console.log(`Seed selesai: ${categories.length} kategori dibuat.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());