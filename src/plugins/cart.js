import { getStock } from './stock.js';
import storageManager from '@/plugins/storage';

const userSession   = storageManager.get('session');
const configs       = storageManager.get('configs');

const login         = userSession?.login;
let userData        = null;
let cartID          = null;

if (login) {
  userData = userSession.user;
}

const CART_ENDPOINT = 'https://gateway.cloudrestfulapi.com/api/cart';
let items = [];

export async function fetchCartAPI() {
  try {
    const resAPI = await fetch(`${CART_ENDPOINT}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json','client-token-key':configs.key },
      body: JSON.stringify({
        method: 'find',
        args: [
          {
            $and: [
              { userID: userData._id.toString() },
            ],
          },
        ],
        paging: { page: 1, limit: 200 },
      }),
    });

    if (resAPI.ok) {
        const cartItems   = await resAPI.json();
        items             = cartItems.data[0];
        cartID            = items ? items._id : null;
    } else {
        console.error('Failed to fetch cart data.');
    }
  } catch (error) {
    console.error(error);
  }
}

export async function fetchCart() {
    try {
      const resAPI = await fetch(`${CART_ENDPOINT}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','client-token-key':configs.key },
        body: JSON.stringify({
          method: 'find',
          args: [
            {
              $and: [
                { userID: userData._id.toString() },
              ],
            },
          ],
          paging: { page: 1, limit: 200 },
        }),
      });
  
      if (resAPI.ok) {
        const cartItems = await resAPI.json();
        return cartItems.data[0];
      } else {
        console.error('Failed to fetch cart data.');
      }
    } catch (error) {
      console.error(error);
    }
}

async function addUserCartAPI(item) {
  try {
    const resAPI = await fetch(`${CART_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json','client-token-key':configs.key
      },
      body: JSON.stringify({
        data: {
          products: [{
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }],
          createdAt: new Date().toISOString(),
          userID: userData._id.toString(),
        },
        options: {},
      }),
    });

    if (resAPI.ok) {
        await resAPI.json();
        await fetchCartAPI();
    } else {
        console.error('Failed to add item to cart in API.');
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateCartItemAPI(item, index) {
    console.log("updateCartItemAPI");
    try {
      items.products[index].quantity = item.quantity;
  
      const resAPI = await fetch(`${CART_ENDPOINT}/${cartID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json','client-token-key':configs.key
        },
        body: JSON.stringify({
          data: {
            products: items.products,
          },
          options: {},
        }),
      });
  
      if (resAPI.ok) {
        await fetchCartAPI();
      } else {
        console.error('Failed to update item in cart in API.');
      }
    } catch (error) {
      console.error(error);
    }
}
  
async function addCartItemAPI(item) {
    console.log("addCartItemAPI");
    try {
      const resAPI = await fetch(`${CART_ENDPOINT}/${cartID}`, {
        method: 'PUT', // Use POST method instead of PUT to add a new item
        headers: {
          'Content-Type': 'application/json','client-token-key':configs.key
        },
        body: JSON.stringify({
          data: {
            products: [...items.products, item],
          },
          options: {},
        }),
      });
  
      if (resAPI.ok) {
        await resAPI.json();
        await fetchCartAPI();
      } else {
        console.error('Failed to add item to cart in API.'); // Update the error message
      }
    } catch (error) {
      console.error(error);
    }
}

export async function removeFromCart(product) {
  try {
    const index = items.products.findIndex((p) => p.productId === product.productId);
    if (index !== -1) {
      items.products.splice(index, 1);
      await updateCartAPI(); // Update the cart in the API
    }
  } catch (error) {
    console.error(error);
  }
}

export async function updateQuantity(product, quantityChange) {
  try {
    console.log("Update Stock");
    const index = items.products.findIndex((p) => p.productId === product.productId);
    if (index !== -1) {
      items.products[index].quantity += quantityChange;

      if (items.products[index].quantity <= 0) {
        await removeFromCart(product);
      } else {
        await updateCartAPI(); // Update the cart in the API
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateCartAPI() {
  try {
    const resAPI = await fetch(`${CART_ENDPOINT}/${cartID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json','client-token-key':configs.key
      },
      body: JSON.stringify({
        data: {
          products: items.products,
        },
        options: {},
      }),
    });

    if (resAPI.ok) {
      await fetchCartAPI();
    } else {
      console.error('Failed to update cart in API.');
    }
  } catch (error) {
    console.error(error);
  }
}

export async function addToCart(item, quantity) {
  try {
    await fetchCartAPI(); // Fetch the cart data from the API

    const stock = await getStock(item.productId);

    if (stock >= quantity) {
      //let existingItem = null;

      if (cartID) {
        console.log("Has Cart ID");
        if (items && items.products && Array.isArray(items.products)) {
          const existingItemIndex = items.products.findIndex((product) => product.productId === item.productId);
          console.log("items", items);
          console.log("existingItemIndex", existingItemIndex);
          if (existingItemIndex !== -1) {
            const existingItem = items.products[existingItemIndex];
            existingItem.quantity += quantity;
            await updateCartItemAPI(existingItem, existingItemIndex);
          } else {
            await addCartItemAPI(item);
          }
        }
      }      
      else
      {
        const newItem = {
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: quantity,
        };
        await addUserCartAPI(newItem);
      }
      return 'Item added to cart.';
    } else {
      return 'Item is out of stock.';
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to add item to cart.');
  }
}

if (login) {
  fetchCartAPI();
}