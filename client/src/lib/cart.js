export const MAKS_JUMLAH = 99;

export function cartReducer(items, action) {
    switch (action.type) {
        case 'tambah': {
            const { menu } = action;
            const ada = items.find((item) => item.menuId === menu.id);

            if (!ada) {
                return [...items, { menuId: menu.id, name: menu.name, price: menu.price, quantity: 1 }];
            }

            return items.map((item) =>
                item.menuId === menu.id ? { ...item, quantity: Math.min(item.quantity + 1, MAKS_JUMLAH) } : item,
            );
        }

        case 'kurangi':
            return items
                .map((item) => (item.menuId === action.menuId ? { ...item, quantity: item.quantity - 1 } : item))
                .filter((item) => item.quantity > 0);

        case 'hapus':
            return items.filter((item) => item.menuId !== action.menuId);

        case 'kosongkan':
            return [];

        default:
            throw new Error(`Aksi keranjang tidak dikenal: ${action.type}`);
    }
}

export function hitungTotal(items) {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function hitungJumlahItem(items) {
    return items.reduce((jumlah, item) => jumlah + item.quantity, 0);
}