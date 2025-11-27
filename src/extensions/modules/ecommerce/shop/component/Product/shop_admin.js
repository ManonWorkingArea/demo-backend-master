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

// Get product or sub-product by SKU (missing function)
const getProductOrSubProductBySku = async (sku) => {
  try {
    const product = await fetchProductBySku(sku);
    return { product, subProduct: null }; // Return format expected by frontend
  } catch (error) {
    throw new Error(`Failed to get product or sub-product with SKU ${sku}`);
  }
};

// Add to cart function (placeholder for admin)
// eslint-disable-next-line no-unused-vars
const addToCart = async (_productData) => {
  // This is admin side, cart functionality might not be needed
  // But we'll provide a placeholder to avoid import errors
  console.warn('addToCart called on admin side - this might not be intended');
  return { success: false, message: 'Cart functionality not available on admin side' };
};

// Remove from cart function (placeholder for admin)
// eslint-disable-next-line no-unused-vars
const removeFromCart = async (_itemId) => {
  console.warn('removeFromCart called on admin side - this might not be intended');
  return { success: false, message: 'Cart functionality not available on admin side' };
};

// Fetch cart function (placeholder for admin)
const fetchCart = async () => {
  console.warn('fetchCart called on admin side - this might not be intended');
  return { items: [], total: 0 };
};

// Calculate cart total function (placeholder for admin)
// eslint-disable-next-line no-unused-vars
const calculateCartTotal = (_cartItems) => {
  console.warn('calculateCartTotal called on admin side - this might not be intended');
  return 0;
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
  addToCart,
  removeFromCart,
  fetchCart,
  calculateCartTotal
};
