<template>
  <div class="shop-actions-container">
    <h1>Shop Actions</h1>
    <ul class="group-list">
      <li v-for="(group, groupIndex) in actions" :key="groupIndex" class="group-item">
        <strong>{{ group.name }}</strong>
        <ul class="action-list">
          <li v-for="(action, actionIndex) in group.items" :key="actionIndex" class="action-item">
            <div class="action-content">
              <strong>{{ action.name }}</strong>
              <div class="custom-select-wrapper">
                <div class="custom-select" @click="toggleSelect(action.key)">
                  <span>{{ getSelectedItemName(action.key) }}</span>
                  <div class="custom-select-dropdown" v-if="dropdownVisible[action.key]">
                    <input 
                      type="text" 
                      v-model="searchKeyword[action.key]" 
                      placeholder="Search..."
                      @click.stop
                    />
                    <ul>
                      <li v-for="option in filteredFlowOptions(action.key)" :key="option._id">
                        <div v-if="option.type === 'group'" class="group-item">
                          <strong>{{ option.name }}</strong>
                          <ul>
                            <li 
                              v-for="subOption in option.items || []" 
                              :key="subOption._id" 
                              @click.stop="selectItem(action.key, subOption)">
                              {{ subOption.name }} ({{ subOption.steps?.length || 0 }} steps)
                            </li>
                          </ul>
                        </div>
                        <div v-else @click.stop="selectItem(action.key, option)">
                          {{ option.name }} ({{ option.steps?.length || 0 }} steps)
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <button v-if="isItemSelected(action.key)" @click="editItem(action.key)" class="edit-button">Edit</button>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
<script>
import requestClient from '@/plugins/requestClient';
import storageManager from '@/plugins/storage';

const Request = new requestClient(false);
const configs = storageManager.get('configs');
const session = storageManager.get('session');

export default {
  data() {
    return {
      actions: [
        {
          name: 'Stock Management',
          key: 'stock_management',
          items: [
            { name: 'Stock Movement', key: 'stock_movement' },
            { name: 'Change Status', key: 'change_status' },
          ],
        },
        {
          name: 'Cart Management',
          key: 'cart_management',
          items: [
            { name: 'Add To Cart', key: 'add_to_cart' },
            { name: 'Complete Order', key: 'complete_order' },
          ],
        },
        {
          name: 'Checkout',
          key: 'checkout',
          items: [
            { name: 'Place Order', key: 'place_order' },
            { name: 'Before Checkout', key: 'before_checkout' },
            { name: 'After Checkout', key: 'after_checkout' },
          ],
        },
      ],
      flowOptions: [],
      selectedItems: {},
      dropdownVisible: {},
      searchKeyword: {},
      configId: null,
    };
  },
  methods: {
    async fetchFlowData() {
      try {
        const response = await Request.POST(
          'flow/query',
          {
            method: 'find',
            args: [{ unit: session.current._id || configs.siteID }],
          },
          configs.key
        );
        if (response.status === 200) {
          this.flowOptions = response.data;
        }
      } catch (error) {
        console.error('Error fetching flow data:', error);
      }
    },
    async loadConfig() {
      try {
        const response = await Request.POST(
          'shop_config/query',
          { method: 'find', args: [{ unit: session.current._id || configs.siteID }] },
          configs.key
        );
        if (response.status === 200 && response.data.length > 0) {
          const config = response.data[0];
          if (config.action_flow) {
            this.selectedItems = { ...config.action_flow };
          }
          this.configId = config._id;
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    },
    toggleSelect(actionKey) {
      this.dropdownVisible = {
        ...this.dropdownVisible,
        [actionKey]: !this.dropdownVisible[actionKey]
      };
      this.searchKeyword = {
        ...this.searchKeyword,
        [actionKey]: ''
      };
    },
    selectItem(actionKey, option) {
      this.selectedItems = {
        ...this.selectedItems,
        [actionKey]: option._id
      };
      this.dropdownVisible = {
        ...this.dropdownVisible,
        [actionKey]: false
      };
      this.saveConfig();
    },
    getSelectedItemName(actionKey) {
      const selectedId = this.selectedItems[actionKey];
      const selectedItem = this.flowOptions.find(option => option._id === selectedId);
      return selectedItem ? selectedItem.name : 'Select an item';
    },
    filteredFlowOptions(actionKey) {
      const keyword = this.searchKeyword[actionKey]?.toLowerCase() || '';
      return this.flowOptions.map(option => {
        if (option.type === 'group') {
          const filteredItems = option.items?.filter(subOption =>
            subOption.name.toLowerCase().includes(keyword)
          ) || [];
          return {
            ...option,
            items: filteredItems
          };
        }
        return option;
      }).filter(option => 
        option.name.toLowerCase().includes(keyword) || (option.items?.length > 0)
      );
    },
    async saveConfig() {
      if (!this.configId) return;
      try {
        const response = await Request.PUT(
          `shop_config/${this.configId}`,
          {
            data: {
              action_flow: this.selectedItems,
              unit: session.current._id || configs.siteID
            },
          },
          configs.key
        );
        if (response.status !== 200) {
          console.error('Error saving config:', response);
        }
      } catch (error) {
        console.error('Error saving config:', error);
      }
    },
    isItemSelected(actionKey) {
      return this.selectedItems[actionKey] != null;
    },
    editItem(actionKey) {
      const itemId = this.selectedItems[actionKey];
      if (itemId) {
        this.$router.push(`/setup/workflow?itemid=${itemId}&back=/shop/config`);
      }
    }
  },
  async mounted() {
    await this.loadConfig();
    await this.fetchFlowData();
  }
};
</script>
<style scoped>
.shop-actions-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.group-list {
  list-style: none;
  padding: 0;
}

.group-item {
  margin-bottom: 20px;
}

.group-item > strong {
  font-size: 18px;
  display: block;
  margin-bottom: 10px;
}

.action-list {
  list-style: none;
  padding: 0;
  margin-left: 20px;
}

.action-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-content {
  display: flex;
  align-items: center;
  width: 70%;
}

.custom-select-wrapper {
  position: relative;
  display: inline-block;
  width: 200px;
  margin-left: 10px;
}

.custom-select {
  display: block;
  padding: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
}

.custom-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  z-index: 1000;
}

.custom-select-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.custom-select-dropdown li {
  padding: 5px;
  cursor: pointer;
}

.custom-select-dropdown li.group-item {
  font-weight: bold;
  background-color: #e0e0e0;
}

.custom-select-dropdown li:hover {
  background-color: #f0f0f0;
}

.edit-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
  text-align: center;
  width: 20%;
}

.edit-button:hover {
  background-color: #0056b3;
}
</style>
