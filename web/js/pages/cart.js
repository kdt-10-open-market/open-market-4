import { loadCSS, loadCartItemElem } from "/js/common/dom-utils.js";

loadCSS('/styles/components/cart-item.css');

createCartItems();

async function createCartItems() {
  const results = await fetchProducts();
  const cartItems = document.getElementById("cart-items");
  for (const cartItemInfo of results) {
    const cartItem = await loadCartItemElem("/components/cart-item.html", cartItemInfo);
    cartItems.appendChild(cartItem);
  }
}

// GET /api/products 호출하여 상품 목록 표시
async function fetchProducts(searchTerm = "") {
  const url = `http://localhost:3000/api/products?page=1&page_size=20${searchTerm ? `&search=${searchTerm}` : ""
    }`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}