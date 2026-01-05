const detailContainer = document.getElementById('detail-container');
const productId = getProductIdFromURL();

if (productId) {
    fetchProductDetail(productId);
} else {
    detailContainer.innerHTML = '<p>유효하지 않은 상품 ID입니다.</p>';
}
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
async function fetchProductDetail(id) {
    try {
        const response = await fetch(`http://192.168.0.114:3000/api/products/${id}`);
        if (!response.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
        const product = await response.json();
        renderProductDetail(product);
    } catch (error) {
        console.error(error);
        detailContainer.innerHTML = `<p>${error.message}</p>`;
    }
}
function renderProductDetail(product) {
    detailContainer.innerHTML = `
        <div class="product-detail">
            <img class="product-image" src="${product.image}" alt="${product.name}">
            <div class="product-shell">
                <h2 class="product-name">${product.name}</h2>
                <p class="seller-name">판매자: ${product.seller?.store_name || product.seller?.name || ''}</p>
                <p class="price">가격: ${product.price}원</p>
                <p class="delivery-charge">배송비: ${product.shipping_fee}원</p>
                <p class="stock">재고: ${product.stock}개</p>
                <div class="quantity-selector">
                    <button id="decrease-qty">-</button>
                    <input type="text" id="quantity" value="1" readonly>
                    <button id="increase-qty">+</button>
                </div>
                <p class="total-price" id="total-price">총 가격: ${product.price + product.shipping_fee}원</p>
                <button id="buy-now">바로 구매</button>
                <button id="add-to-cart">장바구니에 추가</button>
            </div>
        </div>
        <div class="detail-info-container">
            <div class="button-container">버튼</div>
            <div class="review-container">리뷰</div>
            <div class="qna-container">Q&A</div>
            <div class="Return-Exchange-container">반품/교환정보</div>
        </div>
        <div class="product-info">
            <p>${product.info}</p>
        </div>
    `;
    // 수량 선택 및 총 가격 계산 기능 추가
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const totalPriceEl = document.getElementById('total-price');
    let quantity = 1;
    decreaseBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityInput.value = quantity;
            totalPriceEl.textContent = `총 가격: ${(product.price + product.shipping_fee) * quantity}원`;
        }
    });
    increaseBtn.addEventListener('click', () => {
        if (quantity < product.stock) {
            quantity++;
            quantityInput.value = quantity;
            totalPriceEl.textContent = `총 가격: ${(product.price + product.shipping_fee) * quantity}원`;
        }
    });
    // 구매 버튼 클릭 시
    const buyNowBtn = document.getElementById('buy-now');
    buyNowBtn.addEventListener('click', async () => {
        const confirmBuy = confirm(`${product.name} ${quantity}개를 바로 구매하시겠습니까?`);
        if (!confirmBuy) return;
        // 로그인 토큰 가져오기 (예: localStorage)
        const token = localStorage.getItem('access');
        try {
            const res = await fetch('http://192.168.0.114:3000/api/order/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : undefined
                },
                body: JSON.stringify({
                    order_type: 'direct_order',
                    product_id: product.id,
                    quantity
                })
            });
            if (!res.ok) throw new Error('주문 저장 실패');
        } catch (err) {
            alert('주문 저장 중 오류 발생: ' + err.message);
            return;
        }
        window.location.href = '/order.html';
    });
    // 장바구니 버튼 클릭시
    const addToCartBtn = document.getElementById('add-to-cart');
    addToCartBtn.addEventListener('click', async () => {
        // 로그인 토큰 가져오기 (예: localStorage)
        const token = localStorage.getItem('access');
        try {
            const res = await fetch('http://192.168.0.114:3000/api/cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : undefined
                },
                body: JSON.stringify({ product_id: product.id, quantity })
            });
            if (!res.ok) throw new Error('장바구니 저장 실패');
        } catch (err) {
            alert('장바구니 저장 중 오류 발생: ' + err.message);
            return;
        }
        const confirmGoCart = confirm(`${product.name} ${quantity}개를 장바구니에 추가합니다.\n장바구니로 바로 가시겠습니까?`);
        if (confirmGoCart) {
            window.location.href = '/cart.html';
        }
    });
    
}