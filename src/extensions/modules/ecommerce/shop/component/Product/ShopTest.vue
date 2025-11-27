<template>
    <div>
      <h1>Shop Test Interface</h1>
      
      <!-- Section for Loading Products by SKU -->
      <section>
        <h2>Load Product by SKU</h2>
        <div>
          <label for="productSku">Product SKU:</label>
          <input id="productSku" v-model="testSku" placeholder="Enter Product SKU" />
          <button @click="loadProductBySku">Load Product By SKU</button>
        </div>
  
        <!-- Display Product Details -->
        <div v-if="singleProduct">
          <h2>{{ singleProduct.name }}</h2>
          <div>
            <span v-if="singleProduct.salePriceRange">{{ singleProduct.salePriceRange }}</span>
            <span v-else>${{ singleProduct.salePrice }}</span>
          </div>
          <p>{{ singleProduct.description }}</p>
  
          <div v-for="(attribute, index) in variationAttributes" :key="index">
            <h3>{{ attribute.name }}</h3>
            <div v-if="attribute.name.toLowerCase() === 'color'">
              <span v-for="(value, i) in attribute.values" :key="i" @click="selectAttribute(attribute.name, value.code)" :style="{ backgroundColor: value.code, border: selectedAttributes[attribute.name] === value.code ? '2px solid black' : '1px solid grey' }" class="color-circle"></span>
            </div>
            <div v-else>
              <span v-for="(value, i) in attribute.values" :key="i" @click="selectAttribute(attribute.name, value.code)" :class="{ 'size-selected': selectedAttributes[attribute.name] === value.code }">{{ value.name }}</span>
            </div>
          </div>
  
          <div v-if="selectedSubProduct">
            <h4>Selected Sub-Product SKU: {{ selectedSubProduct.sku }}</h4>
            <span>${{ selectedSubProduct.salePrice }}</span>
            <p>Availability: <span :style="{ color: selectedSubProduct.stock > 0 ? 'green' : 'red' }">{{ selectedSubProduct.stock }} in stock</span></p>
          </div>
          <div v-else>
            <span>${{ singleProduct.salePrice }}</span>
          </div>
  
          <div>
            <input type="number" v-model.number="quantity" :max="maxQuantity" min="1" />
            <button @click="addToCart">Add to Cart</button>
          </div>
        </div>
      </section>
  
      <hr>
  
      <!-- Section for Updating Stock -->
      <section>
        <h2>Update Stock</h2>
        <div>
          <label for="updateSku">Product SKU:</label>
          <input id="updateSku" v-model="updateSku" placeholder="Enter Product SKU" />
        </div>
        <div>
          <label for="updateAction">Action:</label>
          <select id="updateAction">
            <option value="in">In</option>
            <option value="out">Out</option>
            <option value="adjust">Adjust</option>
          </select>
        </div>
        <div>
          <label for="updateValue">Value:</label>
          <input id="updateValue" v-model="updateValue" type="number" placeholder="Enter Value" />
        </div>
        <button @click="adjustStock">Update Stock</button>
      </section>
  
      <hr>
  
      <!-- Section for Listing Products -->
      <section>
        <h2>List Products</h2>
        <button @click="loadProducts">Load Products</button>
        <div v-if="products.length">
          <h3>Product List</h3>
          <ul>
            <li v-for="product in products" :key="product._id">
              {{ product.name }} ({{ product.sku }}) - ${{ product.salePrice }} - Stock: {{ product.stock }}
            </li>
          </ul>
        </div>
      </section>
  
      <hr>
  
      <!-- Section for Listing Inventories -->
      <section>
        <h2>List Inventories</h2>
        <button @click="loadInventories">Load Inventories</button>
        <div v-if="inventories.length">
          <h3>Inventory List</h3>
          <ul>
            <li v-for="inventory in inventories" :key="inventory._id">
              {{ inventory.name }} ({{ inventory.code }})
            </li>
          </ul>
        </div>
      </section>
  
      <hr>
  
      <!-- Section for Listing Categories -->
      <section>
        <h2>List Categories</h2>
        <button @click="loadCategories">Load Categories</button>
        <div v-if="categories.length">
          <h3>Category List</h3>
          <ul>
            <li v-for="category in categories" :key="category._id">
              {{ category.name }} ({{ category.code }})
            </li>
          </ul>
        </div>
      </section>
  
      <hr>
  
      <!-- Section for Listing Prices -->
      <section>
        <h2>List Prices</h2>
        <button @click="loadPrices">Load Prices</button>
        <div v-if="prices.length">
          <h3>Price List</h3>
          <ul>
            <li v-for="price in prices" :key="price._id">
              {{ price.name }} ({{ price.code }}) - ${{ price.value }} ({{ price.mode }})
            </li>
          </ul>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  import {
    getProductsListWithSalePrice,
    getProductOrSubProductBySku,
    fetchInventories,
    fetchCategories,
    fetchPrices
  } from './shop_front.js';  // Ensure the path matches the location of shop.js

  import {
    updateStock
  } from './shop_admin.js';  // Ensure the path matches the location of shop.js
  
  export default {
    data() {
      return {
        products: [],
        singleProduct: null,
        inventories: [],
        categories: [],
        prices: [],
        testSku: '', // Input for testing with an actual SKU
        updateSku: '', // Input for updating stock by SKU
        updateAction: 'in', // Action for updating stock (in, out, or adjust)
        updateValue: 0, // Value for updating stock
        variationAttributes: [],
        selectedAttributes: {},
        selectedSubProduct: null,
        quantity: 1,
      };
    },
    computed: {
      maxQuantity() {
        return this.selectedSubProduct ? this.selectedSubProduct.stock : this.singleProduct ? this.singleProduct.stock : 1;
      },
    },
    methods: {
      async loadProducts() {
        try {
          this.products = await getProductsListWithSalePrice();
        } catch (error) {
          console.error('Error loading products:', error);
        }
      },
      async loadProductBySku() {
        try {
          const product = await getProductOrSubProductBySku(this.testSku);
          this.singleProduct = product;
          this.variationAttributes = product.variationAttributes || [];
          this.selectedAttributes = {};
          this.updatePriceRange();
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
        const selectedAttributes = this.selectedAttributes;
        this.selectedSubProduct = this.singleProduct.subProducts.find(subProduct => 
          Object.keys(selectedAttributes).every(key => subProduct.attributes[key] === selectedAttributes[key])
        ) || null;
      },
      updatePriceRange() {
        const prices = this.singleProduct.subProducts.map(sub => sub.salePrice);
        this.singleProduct.salePriceRange = `$${Math.min(...prices)}.00 - $${Math.max(...prices)}.00`;
      },
      async adjustStock() {
        try {
          const updatedProduct = await updateStock(this.updateSku, this.updateAction, parseInt(this.updateValue));
          console.log('Updated product stock:', updatedProduct);
          this.loadProducts(); // Refresh the product list to show updated stock
        } catch (error) {
          console.error('Error updating stock:', error);
        }
      },
      async loadInventories() {
        try {
          this.inventories = await fetchInventories();
        } catch (error) {
          console.error('Error loading inventories:', error);
        }
      },
      async loadCategories() {
        try {
          this.categories = await fetchCategories();
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      },
      async loadPrices() {
        try {
          this.prices = await fetchPrices();
        } catch (error) {
          console.error('Error loading prices:', error);
        }
      },
      addToCart() {
        if (this.quantity > this.maxQuantity) {
          alert(`Cannot add more than ${this.maxQuantity} items to the cart.`);
          return;
        }
        // Handle add to cart logic
        console.log('Added to cart:', this.selectedSubProduct ? this.selectedSubProduct : this.singleProduct, 'Quantity:', this.quantity);
      }
    },
  };
  </script>
