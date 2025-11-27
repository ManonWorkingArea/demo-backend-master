import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';

const Request = new requestClient(false);
const configs = storageManager.get('configs');
const session = storageManager.get('session');

// Fetch a list of all products
const fetchProducts = async () => {
  const response = await Request.POST('product/query', { method: 'find', args: [{ $and: [{ unit: session.current._id }] }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error('Failed to fetch products');
};

// Fetch a single product by SKU
const fetchProductBySku = async (sku) => {
  const response = await Request.POST('product/query', { method: 'find', args: [{ $and: [{ sku: sku }, { unit: session.current._id }] }] }, configs.key);
  if (response.status === 200 && response.data.length > 0) return response.data[0];
  throw new Error(`Failed to fetch product with SKU ${sku}`);
};

// Fetch a single product or sub-product by SKU
const getProductOrSubProductBySku = async (sku) => {
  if (!sku) {
    throw new Error('SKU is null');
  }

  const products = await fetchProducts();
  const priceList = await fetchPrices();

  for (const product of products) {
    if (product.sku === sku) {
      product.salePrice = getSalePrice(product, priceList);
      if (product.subProducts && product.subProducts.length > 0) {
        product.subProducts = product.subProducts.map(subProduct => ({
          ...subProduct,
          salePrice: getSalePrice(subProduct, priceList, product.categories)
        }));
      }
      return product;
    }

    if (product.subProducts && product.subProducts.length > 0) {
      for (const subProduct of product.subProducts) {
        if (subProduct.sku === sku) {
          subProduct.salePrice = getSalePrice(subProduct, priceList, product.categories);
          subProduct.mainProduct = { ...product, salePrice: getSalePrice(product, priceList) };
          return subProduct;
        }
      }
    }
  }
  throw new Error(`Failed to fetch product or sub-product with SKU ${sku}`);
};

// Fetch a list of all inventories
const fetchInventories = async () => {
  const response = await Request.POST('inventory/query', { method: 'find', args: [{ $and: [{ unit: session.current._id }] }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error('Failed to fetch inventories');
};

// Fetch a single inventory by ID
const fetchSingleInventory = async (inventoryId) => {
  const response = await Request.GET(`inventory/${inventoryId}`, configs.key);
  if (response.status === 200) return response.data;
  throw new Error(`Failed to fetch inventory with ID ${inventoryId}`);
};

// Fetch products within a specific inventory
const fetchProductsInInventory = async (inventoryId) => {
  const response = await Request.POST('product/query', { method: 'find', args: [{ $and: [{ inventoryId: inventoryId }, { unit: session.current._id }] }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error(`Failed to fetch products for inventory with ID ${inventoryId}`);
};

// Fetch a list of all categories
const fetchCategories = async () => {
  const response = await Request.POST('product_category/query', { method: 'find', args: [{ $and: [{ unit: session.current._id }] }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error('Failed to fetch categories');
};

// Fetch a single category by ID
const fetchSingleCategory = async (categoryId) => {
  const response = await Request.GET(`product_category/${categoryId}`, configs.key);
  if (response.status === 200) return response.data;
  throw new Error(`Failed to fetch category with ID ${categoryId}`);
};

// Fetch products within a specific category
const fetchProductsInCategory = async (categoryId) => {
  const response = await Request.POST('product/query', { method: 'find', args: [{ $and: [{ categories: categoryId }, { unit: session.current._id }] }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error(`Failed to fetch products for category with ID ${categoryId}`);
};

// Fetch a list of all prices
const fetchPrices = async () => {
  const response = await Request.POST('product_price/query', { method: 'find', args: [{ $and: [{ unit: session.current._id }] }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error('Failed to fetch prices');
};

// Calculate the sale price of a product
const getSalePrice = (product, priceList, mainProductCategories = []) => {
  const categories = product.categories && product.categories.length > 0 ? product.categories : mainProductCategories;
  const priceConfig = priceList.find(price => categories.includes(price.category));
  if (!priceConfig) return product.price;

  let salePrice = product.price;
  if (priceConfig.mode === 'fix') {
    salePrice = priceConfig.value;
  } else if (priceConfig.mode === 'percent') {
    salePrice = product.price - (product.price * priceConfig.value / 100);
  }
  return parseFloat(salePrice.toFixed(2));
};

// Update the stock of a sub-product
const updateStock = async (sku, action, value) => {
  const products = await fetchProducts();
  let subProductFound = false;
  let updatedProduct = null;

  for (const product of products) {
    if (product.subProducts && product.subProducts.length > 0) {
      for (const subProduct of product.subProducts) {
        if (subProduct.sku === sku) {
          if (action === 'in') {
            subProduct.stock += value;
          } else if (action === 'out') {
            subProduct.stock -= value;
            if (subProduct.stock < 0) subProduct.stock = 0; // Prevent negative stock
          } else if (action === 'adjust') {
            subProduct.stock = value; // Adjust stock to a specific value
          }
          updatedProduct = subProduct;
          subProductFound = true;
          break;
        }
      }
    }
    if (subProductFound) {
      const response = await Request.PUT(`product/${product._id}`, { data: { subProducts: product.subProducts } }, configs.key);
      if (response.status === 200) return updatedProduct;
      throw new Error('Failed to update stock');
    }
  }

  if (!subProductFound) {
    throw new Error(`Failed to find sub-product with SKU ${sku}`);
  }
};

// Cart management
const fetchCart = async () => {
  const response = await Request.POST('cart/query', { method: 'find', args: [{ $and: [{ unit: session.current._id }] }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error('Failed to fetch cart');
};

// Add an item to the cart
const addToCart = async (itemId, sku, quantity, stock, type = 'product') => {
    const cart = await fetchCart();
    const existingCartItem = cart.find(item => item.itemId === itemId && item.sku === sku && item.type === type);
  
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (newQuantity > stock && type === 'product') {
        return 'Quantity exceeds available stock!';
      }
      existingCartItem.quantity = newQuantity;
      const updatedCartItem = { ...existingCartItem };
      delete updatedCartItem._id;
      const response = await Request.PUT(`cart/${existingCartItem._id}`, { data: updatedCartItem }, configs.key);
      if (response.status === 200) return `Updated ${quantity} item(s) in the cart!`;
      throw new Error('Failed to update cart item');
    } else {
      if (quantity > stock && type === 'product') {
        return 'Quantity exceeds available stock!';
      }
      const cartItem = { itemId, sku, quantity, type, unit: session.current._id };
      const response = await Request.POST('cart/', { data: cartItem }, configs.key);
      if (response.status === 200) return `Added ${quantity} item(s) to the cart!`;
      throw new Error('Failed to add cart item');
    }
  };
  
  // Adjust other cart-related functions accordingly to handle the new item types...
  

const removeFromCart = async (productId, sku) => {
  const cart = await fetchCart();
  const cartItem = cart.find(item => item.productId === productId && item.sku === sku);
  if (cartItem) {
    const response = await Request.DELETE(`cart/${cartItem._id}`, '', configs.key);
    if (response.status === 200) return `Removed item(s) from the cart!`;
    throw new Error('Failed to remove cart item');
  } else {
    return 'Item not found in the cart!';
  }
};

const calculateCartTotal = async () => {
  const cart = await fetchCart();
  let total = 0;

  for (const item of cart) {
    try {
      const product = await getProductOrSubProductBySku(item.sku);
      total += product.salePrice * item.quantity;
    } catch (error) {
      console.error(`Error calculating total for SKU ${item.sku}:`, error);
    }
  }

  return total.toFixed(2);
};

export {
  fetchProducts,
  fetchProductBySku,
  getProductOrSubProductBySku,
  fetchInventories,
  fetchSingleInventory,
  fetchProductsInInventory,
  fetchCategories,
  fetchSingleCategory,
  fetchProductsInCategory,
  fetchPrices,
  getSalePrice,
  updateStock,
  fetchCart,
  addToCart,
  removeFromCart,
  calculateCartTotal
};
