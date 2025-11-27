<template>
    <section class="border border-gray-400">
      <h2>Cart</h2>
      <button @click="loadCart">Load Cart</button>
      <div v-if="cart.items.products.length || cart.items.coupons.length || cart.items.fees.length">
        <h3>Cart Items</h3>
        <ul>
          <li v-for="item in cart.items.products" :key="item.sku">
            {{ item.name }} ({{ item.sku }}) - {{ currency.symbol }}{{ item.salePrice }} x {{ item.quantity }}
            <button @click="removeFromCart(item.sku, 'products')">Remove</button>
            <div class="quantity-control">
              <button @click="decreaseCartQuantity(item)" :disabled="item.quantity <= 1">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseCartQuantity(item)" :disabled="item.quantity >= item.stock">+</button>
            </div>
          </li>
        </ul>
  
        <h3>Applied Coupons</h3>
        <ul>
          <li v-for="coupon in cart.items.coupons" :key="coupon.code">
            {{ coupon.code }} - {{ coupon.value }} {{ coupon.mode === 'percent' ? '%' : currency.symbol }}
            <button @click="removeCoupon(coupon.code)">Remove Coupon</button>
          </li>
        </ul>
  
        <h3>Fees</h3>
        <ul>
          <li v-for="fee in cart.items.fees" :key="fee.code">
            {{ fee.code }} + {{ currency.symbol }}{{ fee.amount }}
          </li>
        </ul>
  
        <p>Subtotal: {{ currency.symbol }}{{ subtotal }}</p>
        <p>Discount: -{{ currency.symbol }}{{ totalDiscount }}</p>
        <p>Total: {{ currency.symbol }}{{ cartTotal }}</p>
        <button @click="showCheckout">Proceed to Checkout</button>
      </div>
    </section>
  </template>
  
  <script>
  import {
    fetchCart,
    removeFromCart,
    getProductOrSubProductBySku,
    updateCartItemQuantity,
    removeCouponFromCart,
    calculateCartTotal
  } from './shop_front';
  
  export default {
    props: ['currency'],
    data() {
      return {
        cart: { items: { products: [], coupons: [], fees: [] } },
        subtotal: 0,
        totalDiscount: 0,
        cartTotal: 0,
      };
    },
    methods: {
      showCheckout() {
        this.$emit('showCheckout');
      },
      async loadCart() {
        try {
          let cart = await fetchCart();
          if (!cart) {
            cart = { items: { products: [], coupons: [], fees: [] } };
          }
          this.cart = {
            items: {
              products: cart.items.products.map(item => ({
                ...item,
                productId: item.productId || item._id,
              })),
              coupons: cart.items.coupons || [],
              fees: cart.items.fees || [],
            }
          };
          await this.calculateCartTotal();
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      },
      async updateQuantity(sku, quantity, type) {
        try {
          const response = await updateCartItemQuantity(sku, quantity, type);
          console.log(response);
          await this.loadCart();
        } catch (error) {
          console.error('Error updating quantity:', error);
        }
      },
      async increaseCartQuantity(item) {
        const product = await getProductOrSubProductBySku(item.sku);
        if (item.quantity < product.stock) {
          await this.updateQuantity(item.sku, item.quantity + 1, 'products');
        }
      },
      async decreaseCartQuantity(item) {
        if (item.quantity > 1) {
          await this.updateQuantity(item.sku, item.quantity - 1, 'products');
        }
      },
      async removeFromCart(sku, type) {
        try {
          const response = await removeFromCart(sku, type);
          console.log(response);
          await this.loadCart();
        } catch (error) {
          console.error('Error removing from cart:', error);
        }
      },
      async removeCoupon(code) {
        try {
          const response = await removeCouponFromCart(code);
          console.log(response);
          await this.loadCart();
        } catch (error) {
          console.error('Error removing coupon:', error);
        }
      },
      async calculateCartTotal() {
        const { subtotal, totalDiscount, cartTotal } = await calculateCartTotal(this.cart);
        this.subtotal = subtotal;
        this.totalDiscount = totalDiscount;
        this.cartTotal = cartTotal;
      }
    },
    async mounted() {
      await this.loadCart();
    }
  };
  </script>
  
  <style scoped>
  .quantity-control {
    display: flex;
    align-items: center;
  }
  
  .quantity-control button {
    width: 30px;
    height: 30px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    cursor: pointer;
  }
  
  .quantity-control button:disabled {
    cursor: not-allowed;
    background-color: #e0e0e0;
  }
  
  .quantity-control span {
    width: 40px;
    text-align: center;
    font-size: 16px;
  }
  </style>
  