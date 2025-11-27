import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
import Flow from '@/extensions/modules/system/setup/component/flow/Flow.js';// Make sure the path to Flow class is correct

const Request = new requestClient(false);
const configs = storageManager.get('configs');
const session = storageManager.get('session');

// Fetch a list of all products
const fetchProducts = async () => {
  const response = await Request.POST('product/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error('Failed to fetch products');
};

// Fetch prices
const fetchPrices = async () => {
  const response = await Request.POST('product_price/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
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

// Get product list with sale prices
const getProductsListWithSalePrice = async () => {
  const products = await fetchProducts();
  const priceList = await fetchPrices();
  return products.map(product => {
    product.salePrice = getSalePrice(product, priceList);
    return product;
  });
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

// Fetch all auto-assign coupons
const fetchAutoAssignCoupons = async () => {
  try {
    const response = await Request.POST('coupon/query', { method: 'find', args: [{ autoAssign: true }, { unit: session.current._id }] }, configs.key);
    if (response.status === 200) return response.data;
    throw new Error('Failed to fetch auto-assign coupons');
  } catch (error) {
    console.error('Error fetching auto-assign coupons:', error);
    throw error;
  }
};

// Fetch all fee items
const fetchFees = async () => {
  try {
    const response = await Request.POST('product_fee/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
    if (response.status === 200) return response.data;
    throw new Error('Failed to fetch fees');
  } catch (error) {
    console.error('Error fetching fees:', error);
    throw error;
  }
};

// Apply a coupon to the cart
const applyCoupon = async (code) => {
  try {
    const coupon = await fetchCoupons(code);
    if (!coupon) {
      throw new Error(`Coupon with code ${code} not found`);
    }
    let cart = await fetchCartOnly();
    if (!cart) {
      cart = await createCart();
    }
    const existingCoupon = cart.items.coupons.find(item => item.code === coupon.code);

    if (existingCoupon) {
      return 'Coupon already applied!';
    }

    let subtotal = 0;
    let totalQuantity = 0;

    for (const item of cart.items.products) {
      const product = await getProductOrSubProductBySku(item.sku);
      subtotal += product.salePrice * item.quantity;
      totalQuantity += item.quantity;
    }

    // Check if the coupon meets the subtotal condition
    if (coupon.enableSubtotalLimit) {
      if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
        return `Subtotal must be at least ${coupon.minSubtotal} to apply this coupon.`;
      }
      if (coupon.maxSubtotal && subtotal > coupon.maxSubtotal) {
        return `Subtotal must be no more than ${coupon.maxSubtotal} to apply this coupon.`;
      }
    }

    // Check if the coupon meets the quantity condition
    if (coupon.enableQuantityLimit) {
      if (coupon.minQuantity && totalQuantity < coupon.minQuantity) {
        return `Minimum quantity must be at least ${coupon.minQuantity} to apply this coupon.`;
      }
      if (coupon.maxQuantity && totalQuantity > coupon.maxQuantity) {
        return `Maximum quantity must be no more than ${coupon.maxQuantity} to apply this coupon.`;
      }
    }

    cart.items.coupons.push(coupon);
    const response = await Request.PUT(`cart/${cart._id}`, { data: { ...cart, _id: undefined } }, configs.key);
    if (response.status === 200) return `Coupon ${code} applied to the cart!`;
    throw new Error('Failed to apply coupon');
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
};

// Remove a coupon from the cart
const removeCouponFromCart = async (code) => {
  try {
    let cart = await fetchCartOnly();
    if (!cart) {
      throw new Error('Cart not found');
    }

    const couponIndex = cart.items.coupons.findIndex(item => item.code === code);

    if (couponIndex !== -1) {
      cart.items.coupons.splice(couponIndex, 1);
      const response = await Request.PUT(`cart/${cart._id}`, { data: { ...cart, _id: undefined } }, configs.key);
      if (response.status === 200) return `Removed coupon ${code} from the cart!`;
      throw new Error('Failed to remove coupon');
    } else {
      return 'Coupon not found in the cart!';
    }
  } catch (error) {
    console.error('Error removing coupon:', error);
    throw error;
  }
};

// Calculate the total of the cart, applying any coupons if available
const calculateCartTotal = async (cart) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalFees = 0;
  const couponDiscounts = [];
  const feeDetails = [];
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  for (const item of cart.items.products) {
    const product = await getProductOrSubProductBySku(item.sku);
    subtotal += product.salePrice * item.quantity;
  }

  for (const coupon of cart.items.coupons) {
    let couponDiscount = 0;

    // Check if the coupon is within the valid date range
    if (coupon.enableDueDate) {
      if (coupon.startDate && currentDate < coupon.startDate) continue;
      if (coupon.endDate && currentDate > coupon.endDate) continue;
    }

    // Check if the coupon meets the subtotal condition
    if (coupon.enableSubtotalLimit) {
      if (coupon.minSubtotal && subtotal < coupon.minSubtotal) continue;
      if (coupon.maxSubtotal && subtotal > coupon.maxSubtotal) continue;
    }

    // Check if the coupon meets the quantity condition
    if (coupon.enableQuantityLimit) {
      const totalQuantity = cart.items.products.reduce((sum, item) => sum + item.quantity, 0);
      if (coupon.minQuantity && totalQuantity < coupon.minQuantity) continue;
      if (coupon.maxQuantity && totalQuantity > coupon.maxQuantity) continue;
    }

    // Apply the coupon discount
    if (coupon.mode === 'fix') {
      couponDiscount = coupon.value;
    } else if (coupon.mode === 'percent') {
      couponDiscount = (subtotal * coupon.value) / 100;
    }

    // Ensure the discount does not exceed the max discount value
    if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
      couponDiscount = coupon.maxDiscount;
    }

    totalDiscount += couponDiscount;
    couponDiscounts.push({ code: coupon.code, discount: couponDiscount.toFixed(2) });
  }

  // Fetch fees and apply based on conditions
  const fees = await fetchFees();
  //cart.items.fees = [];

  for (const fee of fees) {
    let applicableCondition = null;

    // Select the condition with the highest total_price that is still applicable
    for (const condition of fee.conditions) {
      if (subtotal >= condition.total_price) {
        if (!applicableCondition || condition.total_price > applicableCondition.total_price) {
          applicableCondition = condition;
        }
      }
    }

    if (applicableCondition) {
      const feeAmount = applicableCondition.mode === 'fix' ? applicableCondition.fee_value : (subtotal * applicableCondition.fee_value / 100);
      totalFees += feeAmount;
      feeDetails.push({ code: fee.code, amount: feeAmount.toFixed(2) });
    }
  }

  const cartTotal = (subtotal - totalDiscount + totalFees).toFixed(2);
  return {
    subtotal: subtotal.toFixed(2),
    totalDiscount: totalDiscount.toFixed(2),
    totalFees: totalFees.toFixed(2),
    cartTotal,
    couponDiscounts,
    feeDetails
  };
};

// Calculate subtotal, total quantity, and update cart items with price and salePrice
const calculateCartSubtotalAndQuantity = async (products) => {
  let subtotal = 0;
  let totalQuantity = 0;
  const updatedProducts = [];

  for (const item of products) {
    const product = await getProductOrSubProductBySku(item.sku);
    subtotal += product.salePrice * item.quantity;
    totalQuantity += item.quantity;

    // Add the price and salePrice to the item
    updatedProducts.push({
      ...item,
      price: product.price,
      salePrice: product.salePrice
    });
  }

  return { subtotal, totalQuantity, updatedProducts };
};

/// Load cart and apply auto-assign coupons and fees
const loadCart = async () => {
  try {
    let cart = await fetchCartOnly();
    
    // Check if the cart has a valid _id, if not create a new cart
    if (!cart._id) {
      cart = await createCart();
    }

    if (!cart || !cart._id) {
      throw new Error('Failed to load or create a valid cart.');
    }

    // Calculate the subtotal, total quantity, and update cart items
    const { subtotal, totalQuantity, updatedProducts } = await calculateCartSubtotalAndQuantity(cart.items.products);
    
    // Update the cart items with the new data
    cart.items.products = updatedProducts;

    // Apply auto-assign coupons
    const autoAssignCoupons = await fetchAutoAssignCoupons();
    for (const coupon of autoAssignCoupons) {
      // Check if the coupon meets the subtotal condition
      if (coupon.enableSubtotalLimit) {
        if (coupon.minSubtotal && subtotal < coupon.minSubtotal) continue;
        if (coupon.maxSubtotal && subtotal > coupon.maxSubtotal) continue;
      }

      // Check if the coupon meets the quantity condition
      if (coupon.enableQuantityLimit) {
        if (coupon.minQuantity && totalQuantity < coupon.minQuantity) continue;
        if (coupon.maxQuantity && totalQuantity > coupon.maxQuantity) continue;
      }

      // Apply the coupon if all conditions are met
      const existingCoupon = cart.items.coupons.find(item => item.code === coupon.code);
      if (!existingCoupon) {
        cart.items.coupons.push(coupon);
      }
    }

    // Fetch fees and apply based on conditions
    const fees = await fetchFees();
    // Clear existing fees
    cart.items.fees = [];

    for (const fee of fees) {
      let applicableCondition = null;

      // Select the condition with the highest total_price that is still applicable
      for (const condition of fee.conditions) {
        if (subtotal >= condition.total_price) {
          if (!applicableCondition || condition.total_price > applicableCondition.total_price) {
            applicableCondition = condition;
          }
        }
      }

      if (applicableCondition) {
        cart.items.fees.push({
          code: fee.code,
          type: fee.type,
          amount: applicableCondition.mode === 'fix' ? applicableCondition.fee_value : (subtotal * applicableCondition.fee_value / 100),
        });
      }
    }

    const response = await Request.PUT(`cart/${cart._id}`, { data: { ...cart, _id: undefined } }, configs.key);
    if (response.status !== 200) {
      throw new Error('Failed to update the cart.');
    }
    return cart;
  } catch (error) {
    console.error('Error in loadCart:', error);
    throw error;
  }
};

// Fetch cart without loading auto-assign coupons and fees
const fetchCartOnly = async () => {
  const response = await Request.POST('cart/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
  if (response.status === 200 && response.data.length > 0) {
    const cart = response.data[0];
    cart.items = cart.items || { products: [], coupons: [], fees: [] };
    return cart;
  }
  return { items: { products: [], coupons: [], fees: [] } };
};

// Fetch cart and load it with auto-assign coupons and fees
const fetchCart = async () => {
  return await loadCart();
};

// Create a new cart
const createCart = async () => {
  try {
    const cart = { items: { products: [], coupons: [], fees: [] }, unit: session.current._id };
    const response = await Request.POST('cart/', { data: cart }, configs.key);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to create cart');
  } catch (error) {
    console.error('Error in createCart:', error);
    throw error;
  }
};

// Add or update an item in the cart
const addToCart = async (sku, quantity, stock, productId, type = 'products') => {
  try {
    let cart = await fetchCart();

    if (!cart) {
      cart = await createCart();
    }

    const existingCartItem = cart.items[type].find(item => item.productId === productId && item.sku === sku);

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (newQuantity > stock && type === 'products') {
        return 'Quantity exceeds available stock!';
      }
      existingCartItem.quantity = newQuantity;
    } else {
      if (quantity > stock && type === 'products') {
        return 'Quantity exceeds available stock!';
      }
      const cartItem = { sku, quantity, type, unit: session.current._id, productId };
      cart.items[type].push(cartItem);
    }

    const response = await Request.PUT(`cart/${cart._id}`, { data: { ...cart, _id: undefined } }, configs.key);
    if (response.status === 200) return `Added ${quantity} item(s) to the cart!`;
    throw new Error('Failed to add cart item');
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Update the quantity of a product in the cart
const updateCartItemQuantity = async (sku, desiredQuantity, type = 'products') => {
  try {
    let cart = await fetchCart();
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items[type].find(item => item.sku === sku);
    if (!item) {
      throw new Error('Item not found in the cart');
    }

    const product = await getProductOrSubProductBySku(sku);
    
    if (desiredQuantity > product.stock) {
      return `Maximum available stock is ${product.stock}.`;
    }

    item.quantity = desiredQuantity;
    if (item.quantity < 1) {
      cart.items[type] = cart.items[type].filter(item => item.sku !== sku);
    }

    const response = await Request.PUT(`cart/${cart._id}`, { data: { ...cart, _id: undefined } }, configs.key);
    if (response.status === 200) return `Updated quantity to ${desiredQuantity}`;
    throw new Error('Failed to update cart item quantity');
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

// Remove an item from the cart
const removeFromCart = async (sku, type = 'products') => {
  try {
    let cart = await fetchCart();
    if (!cart) {
      throw new Error('Cart not found');
    }

    const itemIndex = cart.items[type].findIndex(item => item.sku === sku);

    if (itemIndex !== -1) {
      cart.items[type].splice(itemIndex, 1);
      const response = await Request.PUT(`cart/${cart._id}`, { data: { ...cart, _id: undefined } }, configs.key);
      if (response.status === 200) return `Removed item(s) from the cart!`;
      throw new Error('Failed to remove cart item');
    } else {
      return 'Item not found in the cart!';
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Fetch a coupon by code
const fetchCoupons = async (code) => {
  try {
    const response = await Request.POST('coupon/query', { method: 'find', args: [{ code: code }, { unit: session.current._id }] }, configs.key);
    if (response.status === 200 && response.data.length > 0) return response.data[0];
    throw new Error(`Failed to fetch coupon with code ${code}`);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    throw error;
  }
};

// Fetch all payment gateways
const fetchPaymentGateways = async () => {
  try {
    const response = await Request.POST('store_payment/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
    if (response.status === 200) return response.data;
    throw new Error('Failed to fetch payment gateways');
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    throw error;
  }
};

// Fetch flow by ID
const fetchFlowById = async (flowId) => {
  try {
    const response = await Request.GET(`flow/${flowId}`, configs.key, true);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to fetch flow by ID');
  } catch (error) {
    console.error('Error fetching flow by ID:', error);
    throw error;
  }
};

// Fetch configuration
const loadConfig = async () => {
  try {
    const response = await Request.POST(
      'shop_config/query',
      { method: 'find', args: [{ unit: session.current._id || configs.siteID }] },
      configs.key
    );
    if (response.status === 200 && response.data.length > 0) {
      return response.data[0];
    }
    throw new Error('Failed to load configuration');
  } catch (error) {
    console.error('Error loading configuration:', error);
    throw error;
  }
};

// Execute flow by ID and action key
const do_flow = async (actionKey, initialData) => {
  try {
    const config = await loadConfig();
    const flowId = config.action_flow[actionKey];
    if (!flowId) {
      throw new Error(`No flow found for action key: ${actionKey}`);
    }
    const flowData = await fetchFlowById(flowId);
    const flow = new Flow(flowData.steps);
    await flow.run(initialData); // Ensure this method returns a Promise
  } catch (error) {
    console.error('Error executing flow:', error);
    throw error; // Rethrow error to handle it in the calling function
  }
};

// Create a new order
const createOrder = async (orderDetails) => {
  try {
  
    // Generate the order code
    const code = await generateOrderCode();
    const order = {
      unit: session.current._id,
      billingAddress: orderDetails.billingAddress,
      shippingAddress: orderDetails.shippingAddress,
      paymentMethod: orderDetails.paymentMethod,
      requestFullTaxBill: orderDetails.requestFullTaxBill,
      requestGiftWrap: orderDetails.requestGiftWrap,
      giftMessage: orderDetails.giftMessage,
      status: orderDetails.status,
      code,

      // Data Amount
      discount: orderDetails.discount,
      fee: orderDetails.fee,
      subtotal: orderDetails.subtotal,
      total: orderDetails.total,
    };

    const response = await Request.POST('shop_orders', { data: order }, configs.key);
    if (response.status === 200) return response.data;
    throw new Error('Failed to create order');
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Create order summary in shop_orders
const createOrderSummary = async (orders, orderDetails) => {
  try {
    const orderSummary = {
      unit: session.current._id,
      billingAddress: orderDetails.billingAddress,
      shippingAddress: orderDetails.shippingAddress,
      paymentMethod: orderDetails.paymentMethod,
      requestFullTaxBill: orderDetails.requestFullTaxBill,
      requestGiftWrap: orderDetails.requestGiftWrap,
      giftMessage: orderDetails.giftMessage,
      items: orderDetails.cart.items.products,
      discounts: orderDetails.cart.items.coupons,
      status: orderDetails.status,

      // Relate data from orders
      ordersId: orders._id,
      code: orders.code,

      // Data Amount
      discount: orderDetails.discount,
      fee: orderDetails.fee,
      subtotal: orderDetails.subtotal,
      total: orderDetails.total,
    };

    const response = await Request.POST('shop_order', { data: orderSummary }, configs.key);
    if (response.status === 200) return response.data;
    throw new Error('Failed to create order summary');
  } catch (error) {
    console.error('Error creating order summary:', error);
    throw error;
  }
};

// Fetch the default order status for a payment gateway
const fetchDefaultOrderStatus = async (dataItem) => {
  try {
    const response = await Request.GET(`shop_order_status/${dataItem}`, configs.key, true);
    if (response.status === 200) return response.data;
    throw new Error('Failed to fetch default order status');
  } catch (error) {
    console.error('Error fetching default order status:', error);
    throw error;
  }
};

const generateOrderCode = async (config = null) => {
  if (!config) {
    const response = await Request.POST('shop_config/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
    if (response.status === 200 && response.data.length > 0) {
      config = response.data[0].custom_order_code;
      config._id = response.data[0]._id; // Store config ID to update it later
    } else {
      throw new Error('Failed to fetch configuration');
    }
  }

  // If order_code_index is not set, initialize it
  if (typeof config.order_code_index === 'undefined') {
    config.order_code_index = 0;
  }

  // Use current order_code_index for generating the code
  const index = config.order_code_index;
  const date = new Date();
  let orderCode = '';
  let autoNumber = config.autoNumber + index;

  for (const group of config.groups) {
    if (group.type === 'text') {
      orderCode += group.value.padEnd(group.digits, ' ');
    } else if (group.type === 'year') {
      const year = group.format === '4' ? date.getFullYear().toString() : date.getFullYear().toString().slice(-2);
      orderCode += year;
    } else if (group.type === 'month') {
      orderCode += ('0' + (date.getMonth() + 1)).slice(-2);
    } else if (group.type === 'auto') {
      orderCode += autoNumber.toString().padStart(group.digits, '0');
    }
  }

  // Increment order_code_index
  config.order_code_index += 1;

  // Update the config in the database
  try {
    await Request.PUT(`shop_config/${config._id}`, { data: { custom_order_code: config, _id: undefined } }, configs.key);
  } catch (error) {
    console.error('Error updating order_code_index:', error);
  }

  return orderCode;
};

// Fetch currency configuration
const getCurrencyConfig = async () => {
  try {
    const response = await Request.POST('shop_config/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
    if (response.status === 200 && response.data.length > 0 && response.data[0].currency) {
      const { name, code, symbol } = response.data[0].currency;
      return { name, code, symbol };
    }
    throw new Error('Failed to fetch currency configuration');
  } catch (error) {
    console.error('Error fetching currency configuration:', error);
    throw error;
  }
};

// Fetch catalog mode configuration
const getCatalogModeConfig = async () => {
  try {
    const response = await Request.POST('shop_config/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
    if (response.status === 200 && response.data.length > 0) {
      const { catalog_mode, call_me_button, button_text, contact_method } = response.data[0];
      return { catalog_mode, call_me_button, button_text, contact_method };
    }
    throw new Error('Failed to fetch catalog mode configuration');
  } catch (error) {
    console.error('Error fetching catalog mode configuration:', error);
    throw error;
  }
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

// Fetch a list of all inventories
const fetchInventories = async () => {
  const response = await Request.POST('inventory/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error('Failed to fetch inventories');
};

// Fetch a list of all categories
const fetchCategories = async () => {
  const response = await Request.POST('product_category/query', { method: 'find', args: [{ unit: session.current._id }] }, configs.key);
  if (response.status === 200) return response.data;
  throw new Error('Failed to fetch categories');
};

export {
  fetchPrices,
  fetchInventories,
  fetchCategories,
  getSalePrice,
  getProductsListWithSalePrice,
  getProductOrSubProductBySku,
  fetchCartOnly,
  fetchCart,
  createCart,
  addToCart,
  updateStock,
  updateCartItemQuantity,
  removeFromCart,
  fetchCoupons,
  applyCoupon,
  removeCouponFromCart,
  calculateCartTotal,
  loadCart,
  fetchPaymentGateways,
  createOrder,
  createOrderSummary,
  fetchDefaultOrderStatus,
  generateOrderCode,
  getCurrencyConfig,
  getCatalogModeConfig,
  do_flow // Export the do_flow function
};
