<template>
    <div>
      <h1>Inventory Manager</h1>
      <button @click="fetchInventories">Load Inventories</button>
      <ul>
        <li v-for="(inventory, index) in inventoryList" :key="inventory._id">
          <span>{{ inventory.name }} ({{ inventory.code }}) - Location: {{ inventory.location }}</span>
          <button @click="prepareEditInventory(inventory)">Update</button>
          <button @click="removeInventory(inventory._id, index)">Delete</button>
          <ul v-if="inventory.products && inventory.products.length">
            <li v-for="(product, productIndex) in inventory.products" :key="product._id">
              <span>{{ productIndex }} {{ product.name }} ({{ product.sku }}) - ${{ product.price }} - {{ product.stock }} in stock - {{ product.status }} - {{ product.type }}</span>
              <button @click="removeProductFromInventory(inventory._id, product._id, productIndex)">Remove Product</button>
            </li>
          </ul>
        </li>
      </ul>
      <div v-if="showInventoryConfig">
        <h2>Edit Inventory</h2>
        <label for="inventoryName">Name</label>
        <input id="inventoryName" v-model="inventoryData.name" placeholder="Name" />
  
        <label for="inventoryCode">Code</label>
        <input id="inventoryCode" v-model="inventoryData.code" placeholder="Code" />
  
        <label for="inventoryLocation">Location</label>
        <input id="inventoryLocation" v-model="inventoryData.location" placeholder="Location" />
  
        <button @click="updateInventory">Save Changes</button>
      </div>
      <div>
        <h2>Add Inventory</h2>
        <label for="newInventoryName">Name</label>
        <input id="newInventoryName" v-model="newInventory.name" placeholder="Name" />
  
        <label for="newInventoryCode">Code</label>
        <input id="newInventoryCode" v-model="newInventory.code" placeholder="Code" />
  
        <label for="newInventoryLocation">Location</label>
        <input id="newInventoryLocation" v-model="newInventory.location" placeholder="Location" />
  
        <button @click="addInventory">Add Inventory</button>
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
        inventoryList: [],
        inventoryData: { _id: '', name: '', code: '', location: '' },
        newInventory: { name: '', code: '', location: '' },
        showInventoryConfig: false,
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
      };
    },
    methods: {
      async fetchInventories() {
        try {
          const response = await Request.POST('inventory/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
          if (response.status === 200) {
            this.inventoryList = response.data;
            await this.loadProductsForInventories();
          }
        } catch (error) {
          console.error('Error fetching inventories:', error);
        }
      },
      async loadProductsForInventories() {
        try {
          const inventoriesWithProducts = await Promise.all(this.inventoryList.map(async inventory => {
            const response = await Request.POST('product/query', { method: 'find', args: [{ $and: [{ inventoryId: inventory._id }] }] }, this.configs.key);
            return response.status === 200 ? { ...inventory, products: response.data } : inventory;
          }));
          this.inventoryList = inventoriesWithProducts;
        } catch (error) {
          console.error('Error loading products for inventories:', error);
        }
      },
      prepareEditInventory(inventory) {
        this.inventoryData = { ...inventory };
        this.showInventoryConfig = true;
      },
      async updateInventory() {
        try {
          const response = await Request.PUT(`inventory/${this.inventoryData._id}`, { data: { ...this.inventoryData, _id: undefined } }, this.configs.key);
          if (response.status === 200) {
            await this.fetchInventories();
            this.showInventoryConfig = false;
            this.resetInventoryData();
          }
        } catch (error) {
          console.error('Error updating inventory:', error);
        }
      },
      async removeInventory(inventoryId, index) {
        try {
          const inventory = this.inventoryList.find(inv => inv._id === inventoryId);
          if (inventory && inventory.products && inventory.products.length > 0) {
            alert('Cannot delete inventory because it has products assigned.');
            return;
          }
          
          const response = await Request.DELETE(`inventory/${inventoryId}`, '', this.configs.key);
          if (response.status === 200) this.inventoryList.splice(index, 1);
        } catch (error) {
          console.error('Error deleting inventory:', error);
        }
      },
      async addInventory() {
        try {
          const response = await Request.POST('inventory/', { data: { ...this.newInventory, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
          if (response.status === 200) {
            this.inventoryList.push(response.data);
            this.resetNewInventory();
          }
        } catch (error) {
          console.error('Error adding inventory:', error);
        }
      },
      async removeProductFromInventory(inventoryId, productId, productIndex) {
        try {
          const inventory = this.inventoryList.find(inv => inv._id === inventoryId);
          if (inventory) {
            inventory.products.splice(productIndex, 1);
            const response = await Request.PUT(`inventory/${inventoryId}`, { data: { products: inventory.products } }, this.configs.key);
            if (response.status === 200) {
              await this.fetchInventories();
            }
          }
        } catch (error) {
          console.error('Error removing product from inventory:', error);
        }
      },
      resetNewInventory() {
        this.newInventory = { name: '', code: '', location: '' };
      },
      resetInventoryData() {
        this.inventoryData = { _id: '', name: '', code: '', location: '' };
      },
    },
    async mounted() {
      await this.fetchInventories();
    }
  };
  </script>
  