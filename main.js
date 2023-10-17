const getURL = "https://fakestoreapi.com/products";

class Cart {
  constructor() {
    this.items = this.loadCart();
  }

  addItem(item) {
    this.items.push(item);
    this.saveCart();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.items));
    renderCartItems(updateCartCount); 
    showCartPopup("Item added to the cart!");
  }

  getCartItems() {
    return this.loadCart();
  }

  loadCart() {
    const cart = localStorage.getItem("cart");
    if (cart) {
      return JSON.parse(cart);
    } else {
      return [];
    }
  }
}

const cart = new Cart();

async function fetchData(url) {
  const response = await fetch(url);
  return await response.json();
}

async function fetchProducts() {
  renderProducts(await fetchData(getURL));
}

async function fetchCategories() {
  renderCategories(await fetchData(`${getURL}/categories`));
}

function renderCategories(categories) {
  const container = document.querySelector("#categories-container");
  const ul = document.createElement("ul");
  ul.classList.add("flex", "flex-wrap", "gap-6");

  const createLink = (category) => {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = category;
    a.classList.add("text-inherit", "hover:text-orange-500");
    a.addEventListener("click", () => filterProductsByCategory(category));
    return a;
  };

  const allProductsLink = createLink("All Products");
  allProductsLink.addEventListener("click", fetchProducts);

  const liElements = [
    allProductsLink,
    ...categories.map((category) => {
      const li = document.createElement("li");
      li.classList.add("capitalize");
      li.appendChild(createLink(category));
      return li;
    }),
  ];

  ul.append(...liElements);
  container.appendChild(ul);
}

async function filterProductsByCategory(category) {
  const filteredProducts = (await fetchData(getURL)).filter(
    (product) => product.category.toLowerCase() === category.toLowerCase()
  );
  renderProducts(filteredProducts);
}

function renderProducts(products) {
  const container = document.querySelector("#products-container");
  container.innerHTML = "";

  products.forEach((product) => {
    const productElement = createProductElement(product);
    container.appendChild(productElement);
  });
}

function createStarElement() {
  const star = document.createElement("i");
  star.classList.add("ph-fill", "ph-star", "text-orange-500");
  return star;
}

function renderStarRating(rating) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < rating) {
      stars.push(createStarElement());
    } else {
      const star = createStarElement();
      star.classList.add("text-gray-300");
      stars.push(star);
    }
  }
  return stars;
}

function createProductElement(product) {
  const productElementDiv = document.createElement("div");
  productElementDiv.classList.add(
    "product",
    "flex",
    "flex-col",
    "justify-between",
    "gap-6"
  );
  productElementDiv.innerHTML = `
    <div class="flex flex-col gap-4">
      <img src="${
        product.image
      }" alt="Bild på Produkter" class="w-24 h-24 object-contain self-center">
      <h3 class="flex text-lg font-medium line-clamp-2">${product.title}</h3>
      <p class="text-gray-500 text-sm leading-relaxed line-clamp-4">${
        product.description
      }</p>
    </div>
    <div class="flex flex-col gap-4">
      <span class="text-red-600 font-medium text-lg">$${product.price.toFixed(
        2
      )}</span>
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1">
          ${renderStarRating(product.rating.rate)
            .map((star) => star.outerHTML)
            .join("")}
        </span>
        <span class="text-sm opacity-50">out of ${
          product.rating.count
        } reviews</span>
      </div>
      <div class="flex flex-col md:flex-row gap-2"><button class="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded" id="buy-button">See product</button>
        <button class="flex items-center justify-center border border-neutral-900/50 hover:bg-orange-500 hover:border-transparent text-neutral-900 hover:text-white font-medium py-2 px-4 rounded" id="add-to-cart-button"><i class="text-2xl ph ph-shopping-cart"></i></button>
      </div>
    </div>
  `;

  const buyButton = productElementDiv.querySelector("#buy-button");
  buyButton.addEventListener("click", () => openProductModal(product));

  const addToCartButton = productElementDiv.querySelector(
    "#add-to-cart-button"
  );
  addToCartButton.addEventListener("click", () => addtoCart(product));

  return productElementDiv;
}

function renderCartItems(updateCartCount) {
  const cart = new Cart();
  const cartItems = cart.getCartItems();
  if (cartItems.length > 0) {
    renderShoppingCartSidebar(cartItems);
  } else {
    document.querySelector(
      "#cart-container"
    ).innerHTML = `<span class="text-white/75">Your cart is empty</span>`;
  }


  if (updateCartCount) {
    updateCartCount(cartItems.length);
  }
}

function createCartItemElement(product, quantity) {
  const cartItem = document.createElement("div");
  cartItem.classList.add(
    "cart-item",
    "flex",
    "items-center",
    "justify-between",
    "gap-6"
  );
  cartItem.innerHTML = `
    <div class="flex gap-4 items-center">
      <div class="flex gap-4 px-4 py-3 items-center border border-white/20 rounded-md">
        <button id="remove-item" class="ph ph-minus aspect-square text-2xl" data-title="${product}"></button>
        <span class="text-white">${quantity}</span>
        <button id="add-item" class="ph ph-plus aspect-square text-2xl" data-title="${product}"></button>
      </div>
      <span class="capitalize">${product}</span>
    </div>
  `;
  return cartItem;
}

function renderShoppingCartSidebar(cartItems) {
  const cartContainer = document.querySelector("#cart-container");
  cartContainer.innerHTML = "";

  const shoppingCartProducts = new Map();
  cartItems.forEach((item) => {
    if (shoppingCartProducts.has(item.title)) {
      shoppingCartProducts.set(
        item.title,
        shoppingCartProducts.get(item.title) + 1
      );
    } else {
      shoppingCartProducts.set(item.title, 1);
    }
  });

  shoppingCartProducts.forEach((value, key) => {
    const itemElement = createCartItemElement(key, value);
    cartContainer.appendChild(itemElement);
  });
}

function createCartPopupElement(message) {
  const popupDiv = document.createElement("div");
  popupDiv.classList.add(
    "fixed",
    "bottom-4",
    "left-4",
    "p-4",
    "bg-gray-900",
    "text-white",
    "text-sm",
    "rounded-md",
    "shadow-lg",
    "z-50"
  );
  popupDiv.textContent = message;
  return popupDiv;
}

let currentPopup = null;

function showCartPopup(message) {
  if (currentPopup) {
    currentPopup.remove();
  }
  const popup = createCartPopupElement(message);
  document.body.appendChild(popup);
  currentPopup = popup;
  setTimeout(() => {
    popup.remove();
    currentPopup = null;
  }, 3000);
}

function addtoCart(product) {

  if (product.category) {
    const cart = new Cart();
    cart.addItem(product);
    showCartPopup(`Added ${product.title} to the cart!`);
  }
}

function removeFromCart(product) {
  const cart = new Cart();
  const cartItems = cart.getCartItems();
  const index = cartItems.findIndex((item) => item.title === product);
  cart.removeItem(index);

  showCartPopup(`Removed ${product} from the cart!`);

  document.querySelector("#cart-container").innerHTML = "";
  renderCartItems(updateCartCount);
}

const cartContainer = document.querySelector("#cart-container");
cartContainer.addEventListener("click", (event) => {
  if (event.target.id === "remove-item") {
    const product = event.target.dataset.title;
    removeFromCart(product);
  } else if (event.target.id === "add-item") {
    const product = event.target.dataset.title;
    addtoCart(product);
  }
});

function openProductModal(product) {
  const modal = document.querySelector("#product-modal");
  modal.classList.remove("hidden");
  const modalContent = document.querySelector("#modal-content");

  const modalHTML = `
    <div class="fixed inset-0 flex items-center justify-center">
      <div class="container md:max-w-4xl mx-auto p-6 bg-white rounded-md shadow-lg">
        <div class="flex flex-col gap-4 md:gap-6 lg:gap-8 md:flex-row justify-center">
          <img src="${
            product.image
          }" alt="Bild på Produkter" class="w-24 h-24 object-contain self-center">
          <div class="flex flex-col gap-4"> 
            <h3 class="flex text-lg">${product.title}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">${
              product.description
            }</p>
            <span class="text-red-600 font-medium text-lg">$${product.price.toFixed(
              2
            )}</span>
          </div>
        </div>
        <div class "flex justify-end gap-4">
          <button id="close-modal" class="close-button">
            <i class="ph ph-x"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  modalContent.innerHTML = modalHTML;

  addCloseModalListener();
}

function addCloseModalListener() {
  const closeModalButton = document.querySelector("#close-modal");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeProductModal);
  }
}

function closeProductModal() {
  document.querySelector("#product-modal").classList.add("hidden");
}

const menuButton = document.querySelector("#menu-button");
const closeButton = document.querySelector("#close-button");
const cartButton = document.querySelector("#cart-button");
const shoppingCart = document.querySelector("#shopping-cart");

function toggleShoppingCart() {
  shoppingCart.classList.toggle("hidden");
  shoppingCart.classList.toggle("fixed");
}

menuButton.addEventListener("click", toggleShoppingCart);
cartButton.addEventListener("click", toggleShoppingCart);
closeButton.addEventListener("click", toggleShoppingCart);


function updateCartCount(count) {
  const cartCount = document.querySelector("#cart-count");
  cartCount.textContent = count;
}

function initializeApp() {
  renderCartItems(updateCartCount); 
  fetchProducts();
  fetchCategories();

 
  updateCartCount(cart.getCartItems().length);
}

initializeApp();

