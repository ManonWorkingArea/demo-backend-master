<template>
  <div>
    <h1>Product Manager</h1>
    <button @click="fetchProducts">Load Products</button>
    <ul>
      <li v-for="(product, index) in productList" :key="product._id">
        <span>
          {{ product.name }} ({{ product.sku }}) - ${{ product.price }} - 
          <span v-html="formatPrice(product)"></span>
          {{ calculateTotalStock(product) }} in stock - {{ product.status }} - {{ product.type }} - {{ getInventoryName(product.inventoryId) }}
        </span>
        <button @click="prepareEditProduct(product)">Update</button>
        <button @click="removeProduct(product._id, index)">Delete</button>
        <ul v-if="product.type === 'variation'">
          <li v-for="(subProduct, subIndex) in product.subProducts" :key="subIndex">
            <span>{{ subProduct.name }} ({{ subProduct.sku }}) - <span v-html="formatPrice(subProduct, product.price)"></span> - {{ subProduct.stock }} in stock - {{ subProduct.status }}</span>
            <button @click="removeSubProduct(product._id, subProduct._id, subIndex)">Remove Sub-Product</button>
          </li>
        </ul>
      </li>
    </ul>
    <div v-if="showProductConfig">
      <h2>Edit Product</h2>
      <label for="productName">Name</label>
      <input id="productName" v-model="productData.name" placeholder="Name" />

      <label for="productSku">SKU</label>
      <input id="productSku" v-model="productData.sku" placeholder="SKU" />

      <label for="productPrice">Price</label>
      <input id="productPrice" v-model="productData.price" type="number" placeholder="Price" />

      <label for="productStock">Stock</label>
      <input id="productStock" v-model="productData.stock" type="number" placeholder="Stock" :disabled="productData.type === 'variation'" />

      <label for="productStatus">Status</label>
      <select id="productStatus" v-model="productData.status">
        <option value="pending">Pending</option>
        <option value="draft">Draft</option>
        <option value="public">Public</option>
        <option value="trash">Trash</option>
      </select>

      <label for="productType">Type</label>
      <select id="productType" v-model="productData.type">
        <option value="simple">Simple</option>
        <option value="digital">Digital</option>
        <option value="variation">Variation</option>
      </select>

      <label for="productInventory">Inventory</label>
      <select id="productInventory" v-model="productData.inventoryId">
        <option v-for="inventory in inventoryList" :key="inventory._id" :value="inventory._id">{{ inventory.name }}</option>
      </select>

      <h3>Categories</h3>
      <ul>
        <li v-for="category in nestedCategoryList" :key="category._id">
          <input type="checkbox" :value="category._id" v-model="productData.categories" />
          {{ category.name }}
          <ul v-if="category.subCategories && category.subCategories.length">
            <li v-for="subCategory in category.subCategories" :key="subCategory._id">
              <input type="checkbox" :value="subCategory._id" v-model="productData.categories" />
              {{ subCategory.name }}
            </li>
          </ul>
        </li>
      </ul>

      <div v-if="productData.type === 'variation'">
        <h3>Variation Attributes</h3>
        <div v-for="(attr, index) in productData.variationAttributes" :key="index">
          <input v-model="attr.name" placeholder="Attribute Name (e.g., Size)" />
          <input v-model="attr.code" placeholder="Attribute Code (e.g., size)" />
          <select v-model="attr.displayType">
            <option value="text">Text</option>
            <option value="color">Color</option>
            <option value="image">Image</option>
          </select>
          <div>
            <div v-for="(value, valIndex) in attr.values" :key="valIndex">
              <input v-if="attr.displayType === 'text'" v-model="value.name" placeholder="Attribute Value Name (e.g., S, M, L)" />
              <input v-if="attr.displayType === 'text'" v-model="value.code" placeholder="Attribute Value Code (e.g., S, M, L)" />

              <input v-if="attr.displayType === 'color'" v-model="value.display" type="color" />
              <input v-if="attr.displayType === 'color'" v-model="value.name" placeholder="Attribute Value Name (e.g., Red, Blue)" />
              <input v-if="attr.displayType === 'color'" v-model="value.code" placeholder="Attribute Value Name (e.g., Red, Blue)" />
              
              <input v-if="attr.displayType === 'image'" v-model="value.name" placeholder="Attribute Value Name" />
              <input v-if="attr.displayType === 'image'" type="file" @change="handleFileUpload($event, index, valIndex)" />
            </div>
            <button @click="addAttrValue(index)">Add Value</button>
          </div>
        </div>

        <div>
          <h4>Add New Attribute</h4>
          <input v-model="newAttribute.name" placeholder="Attribute Name" />
          <input v-model="newAttribute.code" placeholder="Attribute Code" />
          <select v-model="newAttribute.displayType">
            <option value="text">Text</option>
            <option value="color">Color</option>
            <option value="image">Image</option>
          </select>
          <div>
            <div v-for="(value, index) in newAttribute.values" :key="index">
              <input v-if="newAttribute.displayType === 'text'" v-model="value.name" placeholder="Attribute Value Name" />
              <input v-if="newAttribute.displayType === 'text'" v-model="value.code" placeholder="Attribute Value Code" />

              <input v-if="newAttribute.displayType === 'color'" v-model="value.display" type="color" />
              <input v-if="newAttribute.displayType === 'color'" v-model="value.name" placeholder="Attribute Value Name (e.g., Red, Blue)" />
              <input v-if="newAttribute.displayType === 'color'" v-model="value.code" placeholder="Attribute Value Name (e.g., Red, Blue)" />
              
              <input v-if="newAttribute.displayType === 'image'" v-model="value.name" placeholder="Attribute Value Name" />
              <input v-if="newAttribute.displayType === 'image'" type="file" @change="handleFileUpload($event, null, index)" />
            </div>
            <button @click="addNewAttrValue">Add Value</button>
          </div>
          <button @click="addVariationAttribute">Add Attribute</button>
        </div>
      </div>

      <div v-if="productData.subProducts.length">
        <h3>Sub-Products</h3>
        <div v-for="(subProduct, subIndex) in productData.subProducts" :key="subIndex">
          <h4>{{ subProduct.name }}</h4>
          <label for="subProductName">Sub-Product Name</label>
          <input v-model="subProduct.name" placeholder="Sub-Product Name" />

          <label for="subProductSku">Sub-Product SKU</label>
          <input v-model="subProduct.sku" placeholder="Sub-Product SKU" />

          <label for="subProductPrice">Sub-Product Price</label>
          <input v-model="subProduct.price" type="number" placeholder="Sub-Product Price" />

          <label for="subProductStock">Sub-Product Stock</label>
          <input v-model="subProduct.stock" type="number" placeholder="Sub-Product Stock" />

          <label for="subProductStatus">Sub-Product Status</label>
          <select id="subProductStatus" v-model="subProduct.status">
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="public">Public</option>
            <option value="trash">Trash</option>
          </select>

          <div v-for="(attr, index) in productData.variationAttributes" :key="index">
            <select v-model="subProduct.attributes[attr.code]" @change="updateSubProductNameAndSku(subProduct)">
              <option v-for="value in attr.values" :key="value.code" :value="value.code">
                <template v-if="attr.displayType === 'text'">
                  {{ value.name }}
                </template>
                <template v-if="attr.displayType === 'color'">
                  <span :style="{ backgroundColor: value.code, display: 'inline-block', width: '20px', height: '20px' }"></span> {{ value.name }}
                </template>
                <template v-if="attr.displayType === 'image'">
                  <img :src="value.code" :alt="value.name" style="width: 20px; height: 20px;" /> {{ value.name }}
                </template>
              </option>
            </select>
          </div>
        </div>
      </div>

      <button @click="updateProduct">Save Changes</button>
      <button @click="generateSubProducts">Generate Sub-Products</button>
    </div>
    <div>
      <h2>Add Product</h2>
      <label for="newProductName">Name</label>
      <input id="newProductName" v-model="newProduct.name" placeholder="Name" />

      <label for="newProductSku">SKU</label>
      <input id="newProductSku" v-model="newProduct.sku" placeholder="SKU" />

      <label for="newProductPrice">Price</label>
      <input id="newProductPrice" v-model="newProduct.price" type="number" placeholder="Price" />

      <label for="newProductStock">Stock</label>
      <input id="newProductStock" v-model="newProduct.stock" type="number" placeholder="Stock" />

      <label for="newProductStatus">Status</label>
      <select id="newProductStatus" v-model="newProduct.status">
        <option value="pending">Pending</option>
        <option value="draft">Draft</option>
        <option value="public">Public</option>
        <option value="trash">Trash</option>
      </select>

      <label for="newProductType">Type</label>
      <select id="newProductType" v-model="newProduct.type">
        <option value="simple">Simple</option>
        <option value="digital">Digital</option>
        <option value="variation">Variation</option>
      </select>

      <label for="newProductInventory">Inventory</label>
      <select id="newProductInventory" v-model="newProduct.inventoryId">
        <option v-for="inventory in inventoryList" :key="inventory._id" :value="inventory._id">{{ inventory.name }}</option>
      </select>

      <h3>Categories</h3>
      <ul>
        <li v-for="category in nestedCategoryList" :key="category._id">
          <input type="checkbox" :value="category._id" v-model="newProduct.categories" />
          {{ category.name }}
          <ul v-if="category.subCategories && category.subCategories.length">
            <li v-for="subCategory in category.subCategories" :key="subCategory._id">
              <input type="checkbox" :value="subCategory._id" v-model="newProduct.categories" />
              {{ subCategory.name }}
            </li>
          </ul>
        </li>
      </ul>

      <button @click="addProduct">Add Product</button>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';

const Request = new requestClient(false);

export default {
  data() {
    return {
      productList: [],
      inventoryList: [],
      categoryList: [],
      nestedCategoryList: [],
      priceList: [],
      productData: { 
        _id: '', name: '', sku: '', price: 0, stock: 0, status: 'pending', type: 'simple', 
        variationAttributes: [], subProducts: [], inventoryId: '', categories: [] 
      },
      subProductData: { 
        name: '', sku: '', price: 0, stock: 0, status: 'pending', attributes: {} 
      },
      newProduct: { 
        name: '', sku: '', price: 0, stock: 0, status: 'pending', type: 'simple', 
        variationAttributes: [], subProducts: [], inventoryId: '', categories: [] 
      },
      newAttribute: { 
        name: '', code: '', values: [{ name: '', code: '' }], displayType: 'text' 
      },
      showProductConfig: false,
      showSubProductConfig: false,
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
    };
  },
  watch: {
    'productData.price'(newPrice) {
      if (this.productData.type === 'variation') {
        this.productData.subProducts.forEach(subProduct => {
          subProduct.price = newPrice;
        });
      }
    }
  },
  methods: {
    async fetchProducts() {
      try {
        const productResponse = await Request.POST('product/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
        if (productResponse.status === 200) this.productList = productResponse.data;

        const inventoryResponse = await Request.POST('inventory/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
        if (inventoryResponse.status === 200) this.inventoryList = inventoryResponse.data;

        const categoryResponse = await Request.POST('product_category/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
        if (categoryResponse.status === 200) {
          this.categoryList = categoryResponse.data;
          this.nestedCategoryList = this.createNestedCategoryList(this.categoryList);
        }

        const priceResponse = await Request.POST('product_price/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
        if (priceResponse.status === 200) this.priceList = priceResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    createNestedCategoryList(categories) {
      const categoryMap = {};
      categories.forEach(category => {
        categoryMap[category._id] = { ...category, subCategories: [] };
      });

      const nestedList = [];
      categories.forEach(category => {
        if (category.parent) {
          if (categoryMap[category.parent]) {
            categoryMap[category.parent].subCategories.push(categoryMap[category._id]);
          }
        } else {
          nestedList.push(categoryMap[category._id]);
        }
      });

      return nestedList;
    },
    prepareEditProduct(product) {
      this.productData = { ...product, categories: [...product.categories] || [] };
      this.showProductConfig = true;
      this.showSubProductConfig = false;
    },
    prepareEditSubProduct(subProduct, subIndex) {
      this.subProductData = { ...subProduct };
      this.subProductData.index = subIndex;
      this.showSubProductConfig = true;
    },
    async updateProduct() {
      try {
        if (this.productData.type === 'variation') {
          this.productData.stock = this.calculateTotalStock(this.productData);
        }
        const response = await Request.PUT(`product/${this.productData._id}`, { data: { ...this.productData, _id: undefined } }, this.configs.key);
        if (response.status === 200) {
          await this.fetchProducts();
          this.showProductConfig = false;
          this.resetProductData();
        }
      } catch (error) {
        console.error('Error updating product:', error);
      }
    },
    async removeProduct(productId, index) {
      try {
        const response = await Request.DELETE(`product/${productId}`, '', this.configs.key);
        if (response.status === 200) this.productList.splice(index, 1);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    },
    async addProduct() {
      try {
        if (this.newProduct.type === 'variation') {
          this.newProduct.stock = this.calculateTotalStock(this.newProduct);
        }
        const response = await Request.POST('product/', { data: { ...this.newProduct, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
        if (response.status === 200) {
          this.productList.push(response.data);
          this.resetNewProduct();
        }
      } catch (error) {
        console.error('Error adding product:', error);
      }
    },
    async addSubProduct(productId) {
      const subProduct = {
        ...this.subProductData,
        name: this.generateVariationName(this.productData.name, this.subProductData.attributes),
        sku: this.generateVariationSKU(this.productData.sku, this.subProductData.attributes),
        price: this.productData.price,
      };
      try {
        this.productData.subProducts.push(subProduct);
        this.productData.stock = this.calculateTotalStock(this.productData);
        const response = await Request.PUT(`product/${productId}`, { data: { subProducts: this.productData.subProducts, stock: this.productData.stock } }, this.configs.key);
        if (response.status === 200) {
          await this.fetchProducts();
          this.showSubProductConfig = false;
          this.resetSubProductData();
        }
      } catch (error) {
        console.error('Error adding sub-product:', error);
      }
    },
    async removeSubProduct(productId, subProductId, subIndex) {
      try {
        const product = this.productList.find(p => p._id === productId);
        if (product) {
          product.subProducts.splice(subIndex, 1);
          const response = await Request.PUT(`product/${productId}`, { data: { subProducts: product.subProducts, stock: this.calculateTotalStock(product) } }, this.configs.key);
          if (response.status === 200) {
            await this.fetchProducts();
          }
        }
      } catch (error) {
        console.error('Error deleting sub-product:', error);
      }
    },
    async addVariationAttribute() {
      if (this.newAttribute.name && this.newAttribute.code && this.newAttribute.values.length > 0 && this.newAttribute.values[0].name !== '' && this.newAttribute.values[0].code !== '') {
        this.productData.variationAttributes.push({ ...this.newAttribute });
        this.resetNewAttribute();
        await this.updateProduct();
      } else {
        alert('Please provide a valid attribute name, code, and at least one value with name and code.');
      }
    },
    addAttrValue(attrIndex) {
      this.productData.variationAttributes[attrIndex].values.push({ name: '', code: '' });
    },
    addNewAttrValue() {
      this.newAttribute.values.push({ name: '', code: '' });
    },
    resetNewAttribute() {
      this.newAttribute = { name: '', code: '', values: [{ name: '', code: '' }], displayType: 'text' };
    },
    resetNewProduct() {
      this.newProduct = { name: '', sku: '', price: 0, stock: 0, status: 'pending', type: 'simple', variationAttributes: [], subProducts: [], inventoryId: '', categories: [] };
    },
    resetProductData() {
      this.productData = { _id: '', name: '', sku: '', price: 0, stock: 0, status: 'pending', type: 'simple', variationAttributes: [], subProducts: [], inventoryId: '', categories: [] };
    },
    resetSubProductData() {
      this.subProductData = { name: '', sku: '', price: 0, stock: 0, status: 'pending', attributes: {} };
    },
    generateVariationSKU(baseSku, attributes) {
      const attrCodes = Object.values(attributes).join('-');
      return `${baseSku}-${attrCodes}`;
    },
    generateVariationName(baseName, attributes) {
      const attrNames = Object.keys(attributes).map(attrKey => {
        const attribute = this.productData.variationAttributes.find(attr => attr.code === attrKey);
        if (attribute) {
          const attrValue = attribute.values.find(val => val.code === attributes[attrKey]);
          return attrValue ? attrValue.name : '';
        }
        return '';
      }).join(' ');
      return `${baseName} ${attrNames}`;
    },
    updateSubProductNameAndSku(subProduct) {
      subProduct.name = this.generateVariationName(this.productData.name, subProduct.attributes);
      subProduct.sku = this.generateVariationSKU(this.productData.sku, subProduct.attributes);
    },
    generateSubProducts() {
      const attributes = this.productData.variationAttributes;
      const combinations = this.getCombinations(attributes);
      const newSubProducts = combinations.map(combination => {
        const attributeObject = {};
        combination.forEach((value, index) => {
          attributeObject[attributes[index].code] = value;
        });
        return {
          name: this.generateVariationName(this.productData.name, attributeObject),
          sku: this.generateVariationSKU(this.productData.sku, attributeObject),
          price: this.productData.price,
          stock: 0,
          status: this.productData.status,
          attributes: attributeObject,
        };
      });

      const updatedSubProducts = [];
      newSubProducts.forEach(newSubProduct => {
        const existingSubProduct = this.productData.subProducts.find(subProduct => subProduct.sku === newSubProduct.sku);
        if (existingSubProduct) {
          updatedSubProducts.push({ ...existingSubProduct, ...newSubProduct });
        } else {
          updatedSubProducts.push(newSubProduct);
        }
      });

      this.productData.subProducts = updatedSubProducts;
      this.productData.stock = this.calculateTotalStock(this.productData);
      this.updateProduct();
    },
    getCombinations(attributes) {
      const attrValues = attributes.map(attr => attr.values.map(value => value.code));
      return this.cartesianProduct(attrValues);
    },
    cartesianProduct(arrays) {
      if (arrays.length === 0) return [[]];
      const [first, ...rest] = arrays;
      const restProduct = this.cartesianProduct(rest);
      return first.flatMap(d => restProduct.map(e => [d, ...e]));
    },
    calculateTotalStock(product) {
      if (product.type === 'variation') {
        return product.subProducts.reduce((total, subProduct) => total + subProduct.stock, 0);
      }
      return product.stock;
    },
    getInventoryName(inventoryId) {
      const inventory = this.inventoryList.find(inv => inv._id === inventoryId);
      return inventory ? inventory.name : 'Unknown';
    },
    getSalePrice(product) {
      const priceConfig = this.priceList.find(price => (product.categories || []).includes(price.category));
      if (!priceConfig) return null;

      let salePrice = product.price;
      if (priceConfig.mode === 'fix') {
        salePrice = priceConfig.value;
      } else if (priceConfig.mode === 'percent') {
        salePrice = product.price - (product.price * priceConfig.value / 100);
      }
      return parseFloat(salePrice.toFixed(2));
    },
    formatPrice(product, basePrice = null) {
      const salePrice = this.getSalePrice(product);
      if (salePrice === null) {
        return `$${parseFloat(product.price).toFixed(2)}`;
      }

      const originalPrice = basePrice !== null ? basePrice : product.price;
      const savings = parseFloat((originalPrice - salePrice).toFixed(2));
      const savingsPercentage = parseFloat(((savings / originalPrice) * 100).toFixed(0));

      return `
        <span style="text-decoration: line-through; color: grey;">$${parseFloat(originalPrice).toFixed(2)}</span>
        <span style="color: green;">$${parseFloat(salePrice).toFixed(2)}</span>
        <small style="color: grey;">Save: $${savings} (${savingsPercentage}%)</small>
      `;
    },
    handleFileUpload(event, attrIndex, valIndex) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        if (attrIndex !== null) {
          this.productData.variationAttributes[attrIndex].values[valIndex].code = imageUrl;
        } else {
          this.newAttribute.values[valIndex].code = imageUrl;
        }
      };
      reader.readAsDataURL(file);
    },
  },
  async mounted() {
    await this.fetchProducts();
  }
};
</script>
