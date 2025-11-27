<template>
  <div>
    <h1>Store</h1>

    <!-- Section for Loading Products by SKU -->
    <section>
      <h2>Load Product by SKU</h2>
      <div>
        <label for="productSku">Product SKU:</label>
        <input id="productSku" v-model="productSku" placeholder="Enter Product SKU" />
        <button @click="loadProductBySku">Load Product By SKU</button>
      </div>

      <!-- Display Product Details -->
      <div v-if="singleProduct" class="border border-gray-400">
        <h2>{{ singleProduct.name }}</h2>
        <div>
          <div v-if="selectedSubProduct">
            <span v-if="selectedSubProduct.salePrice < selectedSubProduct.price">
              <span class="regular-price">{{ currency.symbol }}{{ selectedSubProduct.price }}</span>
              <span class="sale-price">{{ currency.symbol }}{{ selectedSubProduct.salePrice }}</span>
            </span>
            <span v-else>{{ currency.symbol }}{{ selectedSubProduct.price }}</span>
          </div>
          <div v-else>
            <span v-if="singleProduct.salePrice < singleProduct.price">
              <span class="regular-price">{{ currency.symbol }}{{ singleProduct.price }}</span>
              <span class="sale-price">{{ currency.symbol }}{{ singleProduct.salePrice }}</span>
            </span>
            <span v-else>{{ currency.symbol }}{{ singleProduct.price }}</span>
          </div>
        </div>
        <p>{{ singleProduct.description }}</p>

        <!-- Updated Attribute Display -->
        <div v-for="(attribute, index) in variationAttributes" :key="index">
          <h3>{{ attribute.name }}</h3>
          <div v-if="attribute.displayType === 'text'">
            <span
              v-for="(value, i) in attribute.values"
              :key="i"
              @click="selectAttribute(attribute.code, value.code)"
              :class="{ 'size-selected': selectedAttributes[attribute.code] === value.code }"
              class="attribute-option"
              :style="{ paddingTop: '2px', textAlign: 'center' }"
            >{{ value.name }}</span>
          </div>
          <div v-if="attribute.displayType === 'color'">
            <div
              v-for="(value, i) in attribute.values"
              :key="i"
              @click="selectAttribute(attribute.code, value.code)"
              :class="{ 'size-selected': selectedAttributes[attribute.code] === value.code }"
              class="attribute-option rounded-full"
              :style="{ backgroundColor:'#484848', display: 'inline-block', marginBottom: '5px', textAlign: 'center' }"
            >
              <div :style="{ backgroundColor: value.display, width: '24px', height: '24px', margin: '1px' }" class="rounded-full"></div>
              <small class="text-gray-500">{{ value.name }}</small>
            </div>
          </div>
          <div v-if="attribute.displayType === 'image'">
            <span
              v-for="(value, i) in attribute.values"
              :key="i"
              @click="selectAttribute(attribute.code, value.code)"
              :class="{ 'size-selected': selectedAttributes[attribute.code] === value.code }"
              class="attribute-option"
            >
              <img :src="value.code" :alt="value.name" style="width: 30px; height: 30px;" />
            </span>
          </div>
        </div>

        <div v-if="selectedSubProduct">
          <h4>Selected : {{ selectedSubProduct.sku }}</h4>
          <span>{{ currency.symbol }}{{ selectedSubProduct.salePrice }}</span>
          <p>Availability: <span :style="{ color: selectedSubProduct.stock > 0 ? 'green' : 'red' }">{{ selectedSubProduct.stock }} in stock</span></p>
        </div>

        <div v-if="allAttributesSelected || singleProduct.type !== 'variation'">
          <div v-if="singleProduct.type !== 'variation'">
            <p>Availability: <span :style="{ color: singleProduct.stock > 0 ? 'green' : 'red' }">{{ singleProduct.stock }} in stock</span></p>
          </div>
          <div class="quantity-control" v-if="!catalogMode">
            <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
            <span>{{ quantity }}</span>
            <button @click="increaseQuantity" :disabled="quantity >= maxQuantity">+</button>
          </div>
          <button v-if="!catalogMode" @click="addToCart">Add to Cart</button>
          <button v-else-if="catalogMode && callMeButton" @click="contactUs">{{ buttonText }}</button>
        </div>
      </div>
      <div id="cart-respond"></div>
    </section>

    <hr>

    <!-- Section for Listing Products -->
    <section>
      <h2>Products</h2>
      <button @click="loadProducts">Load Products</button>
      <div v-if="products.length">
        <h3>Product List</h3>
        <ul>
          <li v-for="product in products" :key="product._id">
            {{ product.name }} ({{ product.sku }}) - {{ currency.symbol }}{{ product.salePrice }} - Stock: {{ product.stock }}
            <button v-if="!catalogMode" @click="addToCart(product)">Add to Cart</button>
            <button v-else-if="catalogMode && callMeButton" @click="contactUs">{{ buttonText }}</button>
          </li>
        </ul>
      </div>
    </section>

    <hr>

    <!-- Section for Managing Cart -->
    <section class="border border-gray-400 mb-2">
      <h2>Cart</h2>
      <button @click="loadCart">Load Cart</button>
      <div v-if="cart.items.products.length || cart.items.coupons.length || cart.items.fees.length">
        <h3>Cart Items</h3>
        <ul>
          <li v-for="item in cart.items.products" :key="item.sku" class="border-b border-gray-300 mb-1 mt-1">
            {{ item.name }} ({{ item.sku }}) - {{ currency.symbol }}{{ item.salePrice }} x {{ item.quantity }}
            <button @click="removeFromCart(item.sku, 'products')">Remove</button>
            <div class="quantity-control" v-if="!catalogMode">
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
        <button v-if="!catalogMode" @click="showCheckout">Proceed to Checkout</button>
      </div>
    </section>

    <hr>

    <!-- Section for Applying Coupons -->
    <section>
      <h2>Apply Coupon</h2>
      <div>
        <label for="couponCode">Coupon Code:</label>
        <input id="couponCode" v-model="couponCode" placeholder="Enter Coupon Code" />
        <button @click="applyCoupon">Apply Coupon</button>
      </div>
    </section>

    <checkout-form v-if="isCheckoutVisible"
    :cart="cart"
    :subtotal="subtotal"
    :totalDiscount="totalDiscount"
    :cartTotal="cartTotal" />
  </div>
</template>

<script>
import {
  getProductsListWithSalePrice,
  getProductOrSubProductBySku,
  fetchCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  applyCoupon,
  removeCouponFromCart,
  calculateCartTotal,
  getCurrencyConfig,
  getCatalogModeConfig,
  do_flow
} from './shop_front';
import CheckoutForm from './Checkout.vue';

export default {
  data() {
    return {
      products: [],
      cart: { items: { products: [], coupons: [], fees: [] } },
      productSku: '',
      singleProduct: null,
      couponCode: '',
      subtotal: 0,
      totalDiscount: 0,
      cartTotal: 0,
      variationAttributes: [],
      selectedAttributes: {},
      selectedSubProduct: null,
      quantity: 1,
      isCheckoutVisible: false,
      currency: null,
      catalogMode: false,
      callMeButton: false,
      buttonText: '',
    };
  },
  components: {
    CheckoutForm
  },
  computed: {
    maxQuantity() {
      return this.selectedSubProduct ? this.selectedSubProduct.stock : this.singleProduct ? this.singleProduct.stock : 1;
    },
    allAttributesSelected() {
      return this.variationAttributes.every(attr => this.selectedAttributes[attr.code]);
    },
  },
  watch: {
    selectedAttributes: {
      deep: true,
      handler() {
        this.updateSelectedSubProduct();
      }
    }
  },
  async mounted() {
    try {
      this.currency = await getCurrencyConfig();
      const catalogConfig = await getCatalogModeConfig();
      this.catalogMode = catalogConfig.catalog_mode;
      this.callMeButton = catalogConfig.call_me_button;
      this.buttonText = catalogConfig.button_text;
      this.loadCart();
    } catch (error) {
      console.error('Error fetching configuration:', error);
    }
  },
  methods: {
    showCheckout() {
      this.isCheckoutVisible = true;
    },
    async loadProducts() {
      try {
        this.products = await getProductsListWithSalePrice();
      } catch (error) {
        console.error('Error loading products:', error);
      }
    },
    async loadProductBySku() {
      try {
        this.singleProduct = await getProductOrSubProductBySku(this.productSku);
        this.variationAttributes = this.singleProduct.variationAttributes || [];
        this.selectedAttributes = {};
        this.updatePriceRange();
      } catch (error) {
        console.error('Error loading product by SKU:', error);
      }
    },
    selectAttribute(attributeCode, valueCode) {
      this.selectedAttributes = {
        ...this.selectedAttributes,
        [attributeCode]: valueCode,
      };
    },
    updateSelectedSubProduct() {
      if (this.allAttributesSelected) {
        const selectedAttributes = this.selectedAttributes;
        this.selectedSubProduct = this.singleProduct.subProducts.find(subProduct =>
          Object.keys(selectedAttributes).every(key => subProduct.attributes[key] === selectedAttributes[key])
        ) || null;
      } else {
        this.selectedSubProduct = null;
      }
    },
    updatePriceRange() {
      if (this.singleProduct.subProducts && this.singleProduct.subProducts.length > 0) {
        const prices = this.singleProduct.subProducts.map(sub => sub.salePrice);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
          this.singleProduct.salePriceRange = `${this.currency.symbol}${minPrice}.00`;
        } else {
          this.singleProduct.salePriceRange = `${this.currency.symbol}${minPrice}.00 - ${this.currency.symbol}${maxPrice}.00`;
        }
      } else {
        const minPrice = this.singleProduct.salePrice;
        const maxPrice = this.singleProduct.salePrice;

        if (minPrice === maxPrice) {
          this.singleProduct.salePriceRange = `${this.currency.symbol}${minPrice}.00`;
        } else {
          this.singleProduct.salePriceRange = `${this.currency.symbol}${minPrice}.00 - ${this.currency.symbol}${maxPrice}.00`;
        }
      }
    },
    async addToCart(product) {
      try {
        const productToAdd = this.selectedSubProduct || this.singleProduct || product;
        const productId = this.selectedSubProduct ? this.singleProduct._id : productToAdd._id;
        const response = await addToCart(productToAdd.sku, this.quantity, productToAdd.stock, productId);
        console.log(response);
        await this.loadCart();
        // Create the array object to pass to do_flow
        const flowData = { ...productToAdd, quantity: this.quantity };
        await do_flow('add_to_cart', flowData);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
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
        const product = await getProductOrSubProductBySku(sku);
        let currentStock = product.stock;

        if (quantity > currentStock) {
          alert(`Quantity exceeds available stock! Maximum available stock is ${currentStock}.`);
          quantity = currentStock;
        }

        const response = await updateCartItemQuantity(sku, quantity, type);
        console.log(response);
        await this.loadCart();
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    },
    async increaseQuantity() {
      if (this.quantity < this.maxQuantity) {
        this.quantity += 1;
      }
    },
    async decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity -= 1;
      }
    },
    async increaseCartQuantity(item) {
      console.log("increaseCartQuantity", item);
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
    async applyCoupon() {
      try {
        const response = await applyCoupon(this.couponCode);
        console.log(response);
        await this.loadCart();
      } catch (error) {
        console.error('Error applying coupon:', error);
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
    },
    contactUs() {
      const method = this.contactMethod;
      if (method === 'lineid') {
        window.location.href = `https://line.me/R/ti/p/${this.buttonText}`;
      } else if (method === 'contactform') {
        // navigate to contact form
      } else if (method === 'email') {
        window.location.href = `mailto:${this.buttonText}`;
      }
    }
  }
};
</script>

<style scoped>
.attribute-option {
  border: 2px solid #cacaca;
  display: inline-block;
  width: 30px;
  height: 30px;
  margin: 0 5px;
  cursor: pointer;
}

.size-selected {
  border: 2px solid #007bff;
  width: 30px;
  height: 30px;
  margin: 0 5px;
  cursor: pointer;
}

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

.regular-price {
  text-decoration: line-through;
  color: #888;
  margin-right: 8px;
}

.sale-price {
  color: #000;
  font-weight: bold;
}
</style>
