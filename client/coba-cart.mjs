import { cartReducer, hitungTotal, hitungJumlahItem } from './src/lib/cart.js';

const americano = { id: 1, name: 'Americano', price: 18000 };
const kopiSusu = { id: 2, name: 'Kopi Susu Aren', price: 22000 };

let keranjang = [];
keranjang = cartReducer(keranjang, { type: 'tambah', menu: americano });
keranjang = cartReducer(keranjang, { type: 'tambah', menu: americano });
keranjang = cartReducer(keranjang, { type: 'tambah', menu: kopiSusu });
console.log(keranjang, hitungTotal(keranjang), hitungJumlahItem(keranjang));

keranjang = cartReducer(keranjang, { type: 'kurangi', menuId: 2 });
console.log(keranjang);