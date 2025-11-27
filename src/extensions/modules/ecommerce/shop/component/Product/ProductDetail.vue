<template>
    <div>
      <h2>Product Detail</h2>
      <div>
        <label for="productSku">Product SKU:</label>
        <input id="productSku" v-model="testSku" placeholder="Enter Product SKU" />
        <button @click="loadProductBySku">Load Product By SKU</button>
      </div>
  
      <div v-if="singleProduct">
        <h3>{{ singleProduct.name }}</h3>
        <div v-html="formatPrice(singleProduct.salePrice, singleProduct.price)"></div>
        <p>{{ singleProduct.description }}</p>
  
        <div v-if="singleProduct.type === 'variation'">
          <div v-for="(attribute, index) in variationAttributes" :key="index">
            <h4>{{ attribute.name }}</h4>
            <span
              v-for="(value, i) in attribute.values"
              :key="i"
              @click="selectAttribute(attribute.code, value.code)"
              :class="{ 'size-selected': selectedAttributes[attribute.code] === value.code }"
            >
              {{ value.name }}
            </span>
          </div>
  
          <div v-if="selectedSubProduct">
            <h4>Selected Sub-Product SKU: {{ selectedSubProduct.sku }}</h4>
            <div v-html="formatPrice(selectedSubProduct.salePrice, selectedSubProduct.price)"></div>
            <p>
              Availability:
              <span :style="{ color: selectedSubProduct.stock > 0 ? 'green' : 'red' }">{{ selectedSubProduct.stock }} in stock</span>
            </p>
  
            <label for="quantity">Quantity:</label>
            <input id="quantity" type="number" v-model.number="quantity" @input="validateQuantity" :max="selectedSubProduct.stock" />
  
            <p>Total Price: ${{ calculateTotalPrice(selectedSubProduct.salePrice, quantity) }}</p>
  
            <button @click="handleAddToCart(selectedSubProduct.sku)">Add to Cart</button>
          </div>
        </div>
  
        <div v-else>
          <label for="quantity">Quantity:</label>
          <input id="quantity" type="number" v-model.number="quantity" @input="validateQuantity" :max="singleProduct.stock" />
          <p>Total Price: ${{ calculateTotalPrice(singleProduct.salePrice, quantity) }}</p>
          <button @click="handleAddToCart(singleProduct.sku)">Add to Cart</button>
        </div>
      </div>
  
      <div v-if="cart.length > 0">
        <h2>Cart</h2>
        <ul>
          <li v-for="(item, index) in cart" :key="index">
            <span v-if="item.type === 'product'">
              Product ID: {{ item.itemId }}, SKU: {{ item.sku || 'N/A' }}, Quantity: {{ item.quantity }}
            </span>
            <span v-if="item.type === 'coupon'">
              Coupon Code: {{ item.sku }}, Discount: {{ item.quantity }}
            </span>
            <span v-if="item.type === 'shipping'">
              Shipping Method: {{ item.sku }}, Cost: {{ item.quantity }}
            </span>
            <span v-if="item.type === 'fee'">
              Fee Description: {{ item.sku }}, Amount: {{ item.quantity }}
            </span>
            <button @click="handleRemoveFromCart(item.itemId, item.sku)">Remove</button>
          </li>
        </ul>
        <p>Total Cart Value: ${{ cartTotal }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { getProductOrSubProductBySku, fetchCart, addToCart, removeFromCart, calculateCartTotal } from './shop_admin.js';
  
  export default {
    data() {
      return {
        singleProduct: null,
        testSku: '',
        variationAttributes: [],
        selectedAttributes: {},
        selectedSubProduct: null,
        quantity: 1,
        cart: [],
        cartTotal: '0.00',
      };
    },
    methods: {
      async loadProductBySku() {
        try {
          const product = await getProductOrSubProductBySku(this.testSku);
          this.singleProduct = product.mainProduct || product;
          this.variationAttributes = this.singleProduct.variationAttributes || [];
          this.selectedAttributes = product.attributes || {};
          this.selectedSubProduct = product.mainProduct ? product : null;
          this.updatePriceRange();
          if (this.selectedSubProduct) {
            this.selectedSubProduct.salePrice = this.calculateSalePrice(this.selectedSubProduct);
          }
        } catch (error) {
          console.error('Error loading product by SKU:', error);
        }
      },
      selectAttribute(attributeName, value) {
        this.selectedAttributes = {
          ...this.selectedAttributes,
          [attributeName]: value,
        };
        this.updateSelectedSubProduct();
      },
      updateSelectedSubProduct() {
        if (Object.keys(this.selectedAttributes).length === this.variationAttributes.length) {
          this.selectedSubProduct = this.findSubProduct(this.selectedAttributes);
          this.quantity = 1; // Reset quantity when a new sub-product is selected
          if (this.selectedSubProduct) {
            this.selectedSubProduct.salePrice = this.calculateSalePrice(this.selectedSubProduct);
          }
        } else {
          this.selectedSubProduct = null;
        }
      },
      findSubProduct(selectedAttributes) {
        return this.singleProduct.subProducts.find(subProduct =>
          Object.keys(selectedAttributes).every(key => subProduct.attributes[key] === selectedAttributes[key])
        ) || null;
      },
      updatePriceRange() {
        if (this.singleProduct.subProducts) {
          const prices = this.singleProduct.subProducts.map(sub => sub.salePrice || sub.price);
          this.singleProduct.salePriceRange = `$${Math.min(...prices).toFixed(2)} - $${Math.max(...prices).toFixed(2)}`;
        }
      },
      calculateSalePrice(product) {
        const salePrice = product.salePrice ? product.salePrice : product.price;
        return parseFloat(salePrice.toFixed(2));
      },
      formatPrice(salePrice, originalPrice) {
        salePrice = salePrice || originalPrice; // Fallback to original price if sale price is not set
  
        if (salePrice === originalPrice) {
          return `<span style="color: green;">$${parseFloat(salePrice).toFixed(2)}</span>`;
        }
  
        const savings = parseFloat((originalPrice - salePrice).toFixed(2));
        const savingsPercentage = parseFloat(((savings / originalPrice) * 100).toFixed(0));
  
        return `
          <span style="text-decoration: line-through; color: grey;">$${parseFloat(originalPrice).toFixed(2)}</span>
          <span style="color: green;">$${parseFloat(salePrice).toFixed(2)}</span>
          <small style="color: grey;">Save: $${savings} (${savingsPercentage}%)</small>
        `;
      },
      validateQuantity() {
        const stock = this.selectedSubProduct ? this.selectedSubProduct.stock : this.singleProduct.stock;
        if (this.quantity > stock) {
          this.quantity = stock;
        } else if (this.quantity < 1) {
          this.quantity = 1;
        }
      },
      calculateTotalPrice(salePrice, quantity) {
        salePrice = salePrice || this.singleProduct.price; // Fallback to original price if sale price is not set
        return (salePrice * quantity).toFixed(2);
      },
      async handleAddToCart(sku) {
        const stock = this.selectedSubProduct ? this.selectedSubProduct.stock : this.singleProduct.stock;
        const itemId = this.singleProduct._id;
        const result = await addToCart(itemId, sku, this.quantity, stock);
  
        if (result.includes('exceeds available stock')) {
          alert(result);
        } else {
          await this.refreshCart(); // Refresh the cart data
          alert(result);
        }
      },
      async handleRemoveFromCart(itemId, sku) {
        const result = await removeFromCart(itemId, sku);
        await this.refreshCart(); // Refresh the cart data
        alert(result);
      },
      async refreshCart() {
        this.cart = await fetchCart();
        this.cartTotal = await calculateCartTotal();
      },
    },
    async mounted() {
      await this.refreshCart();
    }
  };
  </script>
  