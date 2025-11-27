import storageManager from '@/plugins/storage';
const configs = storageManager.get('configs');

export async function getStock(productId) {
    try {
      const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/product/${productId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json','client-token-key':configs.key },
      });
  
      if (resAPI.ok) {
        const product = await resAPI.json();
        return product.stock;
      } else {
        // Handle error condition
      }
    } catch (error) {
      console.error(error);
    }
}

export async function updateStock(productId, quantity) {
  try {
    const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/product/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json','client-token-key':configs.key
      },
      body: JSON.stringify({
        data: {
          stock: quantity
        },
        options: {}
      })
    });

    if (resAPI.ok) {
      await resAPI.json();
      // Stock updated successfully
    } else {
      // Handle error condition
      console.error('Failed to update product stock.');
    }
  } catch (error) {
    console.error(error);
  }
}

export async function addStock(productId, quantity) {
  try {
    const currentStock = await getStock(productId);
    const newStock = currentStock + quantity;

    const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/product/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json','client-token-key':configs.key
      },
      body: JSON.stringify({
        data: {
          stock: newStock
        },
        options: {}
      })
    });

    if (resAPI.ok) {
      await resAPI.json();
      // Stock added successfully
    } else {
      // Handle error condition
      console.error('Failed to add product stock.');
    }
  } catch (error) {
    console.error(error);
  }
}

export async function removeStock(productId, quantity) {
  try {
    const currentStock = await getStock(productId);
    const newStock = currentStock - quantity;

    const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/product/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json','client-token-key':configs.key
      },
      body: JSON.stringify({
        data: {
          stock: newStock
        },
        options: {}
      })
    });

    if (resAPI.ok) {
      await resAPI.json();
      // Stock removed successfully
    } else {
      // Handle error condition
      console.error('Failed to remove product stock.');
    }
  } catch (error) {
    console.error(error);
  }
}
