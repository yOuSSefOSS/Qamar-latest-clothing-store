// --- DATABASE ---
// This is your new "back-end". All your products live here.
const productDatabase = [
    {
        id: "p1",
        name: "Classic Men Hoodie",
        price: 550.00,
        imageUrl: "Products/Hoodies/Cairokee M.jpg", // Use your existing image paths
        category: "Hoodie", // Category for filtering
        description: "Our signature hoodie offers the perfect blend of style and comfort. Made from a soft, durable cotton blend, it's perfect for everyday wear.",
        colors: [
            { name: "black", value: "#000" },
            { name: "gray", value: "#808080" },
            { name: "navy", value: "#000080" }
        ],
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "p2",
        name: "Classic Women Hoodie",
        price: 600.00,
        imageUrl: "Products/Hoodies/Cairokee F.webp",
        category: "Hoodie", // Category for filtering
        description: "A comfortable and stylish hoodie designed for a flattering fit. Made from a lightweight, breathable fabric, it's perfect for any season.",
        colors: [
            { name: "black", value: "#000" },
            { name: "pink", value: "#FFC0CB" },
            { name: "white", value: "#FFFFFF" }
        ],
        sizes: ["XS", "S", "M", "L"]
    },
    {
        id: "p3",
        name: "Basic Unisex T-Shirt",
        price: 250.00,
        imageUrl: "Products/T-shirts/Cairokee.jpg",
        category: "T-Shirt", // Category for filtering
        description: "A versatile and comfortable t-shirt that's a staple for any wardrobe. Made from 100% premium cotton, it's soft and breathable.",
        colors: [
            { name: "white", value: "#FFFFFF" },
            { name: "black", value: "#000" },
            { name: "gray", value: "#808080" }
        ],
        sizes: ["S", "M", "L", "XL"]
    }
    // Add more products here just by copying the format!
];

// --- GLOBAL VARIABLES ---
let cart = []; // This array will hold our cart items

// --- DOM ELEMENTS ---
const productGridContainer = document.getElementById('products-grid-container');
const productModal = document.getElementById('product-modal');
const productModalBody = document.getElementById('product-modal-body');
const productModalClose = document.getElementById('product-modal-close');

const cartModal = document.getElementById('cart-modal');
const cartNavLink = document.getElementById('cart-nav-link');
const cartModalClose = document.getElementById('cart-modal-close');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');

const showAllBtn = document.getElementById('show-all-btn'); // Button to clear filter

// --- FUNCTIONS ---

/**
 * Renders products to the grid.
 * Can be filtered by category.
 */
function renderProductGrid(categoryFilter = null) {
    productGridContainer.innerHTML = ''; // Clear the grid first

    // Filter the database if a category is provided
    let productsToRender;
    if (categoryFilter) {
        productsToRender = productDatabase.filter(p => p.category === categoryFilter);
        showAllBtn.style.display = 'inline-block'; // Show the 'Show All' button
    } else {
        productsToRender = productDatabase;
        showAllBtn.style.display = 'none'; // Hide the 'Show All' button
    }

    // Render the filtered products
    productsToRender.forEach(product => {
        const cardHTML = `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-card-image">
                    <img src="${product.imageUrl}" alt="${product.name}">
                </div>
                <div class="product-card-info">
                    <h3>${product.name}</h3>
                    <p>${product.price.toFixed(2)} EGP</p>
                </div>
            </div>
        `;
        productGridContainer.innerHTML += cardHTML;
    });
    
    // After creating cards, add click listeners
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            openProductModal(card.dataset.productId);
        });
    });
}

/**
 * Opens the modal with details for a specific product
 */
function openProductModal(productId) {
    const product = productDatabase.find(p => p.id === productId);
    if (!product) return; // Safety check

    // Generate HTML for color options
    const colorsHTML = product.colors.map((color, index) => `
        <label>
            <input type="radio" name="color" value="${color.name}" ${index === 0 ? 'checked' : ''}>
            <span class="color-swatch" style="background-color: ${color.value}; ${color.name === 'white' ? 'border: 2px solid #ccc;' : ''}" title="${color.name}"></span>
        </label>
    `).join('');

    // Generate HTML for size options
    const sizesHTML = product.sizes.map((size, index) => `
        <label>
            <input type="radio" name="size" value="${size}" ${index === 0 ? 'checked' : ''}>
            <span class="size-box">${size}</span>
        </label>
    `).join('');

    // Set the full modal content
    productModalBody.innerHTML = `
        <div class="product-modal-image">
            <img src="${product.imageUrl}" alt="${product.name}">
        </div>
        <div class="product-modal-info">
            <h1>${product.name}</h1>
            <p class="product-modal-price">${product.price.toFixed(2)} EGP</p>
            <p class="product-modal-description">${product.description}</p>
            
            <form id="add-to-cart-form" data-product-id="${product.id}">
                <div class="options-group">
                    <h4>Color:</h4>
                    <div class="radio-buttons">${colorsHTML}</div>
                </div>
                <div class="options-group">
                    <h4>Size:</h4>
                    <div class="radio-buttons">${sizesHTML}</div>
                </div>
                <button type="submit" class="btn btn-full">Add to Cart</button>
            </form>
        </div>
    `;
    
    productModal.classList.add('active'); // Show the modal
    
    // Add submit listener for the new form
    document.getElementById('add-to-cart-form').addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page from reloading
        addToCart(e.target.dataset.productId);
    });
}

/**
 * Opens the shopping cart modal
 */
function openCartModal() {
    renderCart();
    cartModal.classList.add('active');
}

/**
 * Closes all active modals
 */
function closeModals() {
    productModal.classList.remove('active');
    cartModal.classList.remove('active');
}

/**
 * Adds the selected product to the 'cart' array
 */
function addToCart(productId) {
    const product = productDatabase.find(p => p.id === productId);
    const form = document.getElementById('add-to-cart-form');
    const selectedColor = form.querySelector('input[name="color"]:checked').value;
    const selectedSize = form.querySelector('input[name="size"]:checked').value;
    
    // Create a unique ID for this cart item
    const cartItemId = `${productId}_${selectedColor}_${selectedSize}`;

    // Check if this *exact* item (with same size/color) is already in cart
    const existingItem = cart.find(item => item.cartId === cartItemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            cartId: cartItemId,
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            color: selectedColor,
            size: selectedSize,
            quantity: 1
        });
    }
    
    // alert(`${product.name} (${selectedSize}, ${selectedColor}) was added to your cart!`); // <-- REMOVE THIS
    
    // --- NEW TOAST LOGIC ---
    // 1. Get the toast element
    const toast = document.getElementById('toast-notification');
    
    // 2. (Optional) Update text if you want it to be dynamic
    // const toastText = toast.querySelector('span');
    // toastText.textContent = `${product.name} added!`;

    // 3. Add the 'show' class to slide it up
    toast.classList.add('show');

    // 4. After 3 seconds, remove the 'show' class to slide it down
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // 3000 milliseconds = 3 seconds
    // --- END NEW TOAST LOGIC ---

    closeModals();
    updateCartCount();
}

/**
 * Renders all items from the 'cart' array into the cart modal
 */
function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is currently empty.</p>';
    } else {
        cartItemsContainer.innerHTML = ''; // Clear cart
        cart.forEach(item => {
            const itemHTML = `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.imageUrl}" alt="${item.name}">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>Size: ${item.size}, Color: ${item.color}</p>
                        <p>Qty: ${item.quantity}</p>
                    </div>
                    <div class="cart-item-details">
                        <p class="cart-item-price">${(item.price * item.quantity).toFixed(2)} EGP</p>
                        <button class="cart-item-remove" data-cart-id="${item.cartId}">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.innerHTML += itemHTML;
        });
        
        // Add click listeners for 'Remove' buttons
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', () => {
                removeFromCart(button.dataset.cartId);
            });
        });
    }
    
    // Update total price
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = `${total.toFixed(2)} EGP`;
}

/**
 * Removes an item from the cart by its unique cartId
 */
function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    renderCart(); // Re-render the cart
    updateCartCount(); // Update the header count
}

/**
 * Updates the little number on the cart icon
 */
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// --- EVENT LISTENERS (Initial Setup) ---

// Listen for when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Render all products on initial page load
    renderProductGrid(); 

    // Add listeners for collection cards
    document.querySelectorAll('.collection-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            renderProductGrid(category);
        });
    });

    // Add listener for 'Show All' button
    showAllBtn.addEventListener('click', () => {
        renderProductGrid(); // Call with no filter
    });

    // --- NEW: Find the checkout button INSIDE the cart modal ---
    const checkoutBtn = document.querySelector('#cart-modal .btn-full');
    
    checkoutBtn.addEventListener('click', () => {
        // 1. Check if cart is empty
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // 2. Save the cart to localStorage
        // JSON.stringify() turns the array into a string for storage
        localStorage.setItem('qamarCart', JSON.stringify(cart));

        // 3. Redirect to the new checkout page
        window.location.href = 'checkout.html';
    });
});


    // Add listener for 'Show All' button
    showAllBtn.addEventListener('click', () => {
        renderProductGrid(); // Call with no filter
    });
});

// Modal closing listeners
productModalClose.addEventListener('click', closeModals);
cartModalClose.addEventListener('click', closeModals);

// Close modal by clicking overlay
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeModals();
});
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) closeModals();
});

// Listen for cart icon click

cartNavLink.addEventListener('click', openCartModal);

