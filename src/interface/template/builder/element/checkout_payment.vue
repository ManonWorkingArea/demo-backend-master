<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 text-gray-400 pt-1">
            <!-- Heroicon name: outline/credit-card -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate" :title="localItem.name || 'Payment Options'">
              {{ localItem.name || 'Payment Options' }}
              <span v-if="localItem.required" class="text-xs text-red-500 ml-1">(Required)</span>
            </p>
            <div class="mt-1 space-y-1">
              <div v-for="(gateway, index) in localItem.gateways" :key="gateway.id || index" class="flex items-center">
                <input type="radio" :name="(localItem.name || 'payment_preview') + '_gateway'" :id="(gateway.id || index) + '_preview'" disabled class="popup-radio mr-1.5 text-gray-400"/>
                <label :for="(gateway.id || index) + '_preview'" class="text-xs text-gray-600">
                  {{ gateway.name }} <span v-if="gateway.description" class="text-gray-500">- {{ gateway.description }}</span>
                </label>
              </div>
            </div>
            <p v-if="!localItem.gateways || localItem.gateways.length === 0" class="text-xs text-gray-400 mt-1">No payment gateways configured.</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div
        class="content-editor overflow-auto p-4"
        style="
          min-height: 600px;
          max-height: 600px;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
          right: -20px;
        "
      >
        <!-- Header Section -->
        <div class="section-group mb-4">
          <div class="p-3 bg-gray-100 rounded-lg shadow-sm">
            <h2 class="text-lg font-semibold text-gray-800">Payment Gateway Configuration</h2>
            <p class="text-sm text-gray-600">
              Configure the list of payment gateways available for selection.
            </p>
          </div>
        </div>

        <!-- Add Payment Gateway Section -->
        <div class="section-group mb-5">
          <div class="p-3 bg-white rounded-lg shadow-sm border">
            <h3 class="text-md font-semibold text-gray-700 mb-2">Add New Gateway</h3>
            <div class="mb-2">
              <label class="popup-label block text-xs font-medium text-gray-600 mb-0.5">Gateway Name:</label>
              <input v-model="newGateway.name" type="text" class="popup-input w-full text-sm" placeholder="e.g., Credit Card, PayPal"/>
            </div>
            <div class="mb-3">
              <label class="popup-label block text-xs font-medium text-gray-600 mb-0.5">Description (Optional):</label>
              <input v-model="newGateway.description" type="text" class="popup-input w-full text-sm" placeholder="e.g., Pay with Visa/Mastercard"/>
            </div>
            <button @click="addPaymentGateway" class="w-full py-1.5 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
              <font-awesome-icon :icon="['fas', 'plus']" class="mr-1"/> Add Gateway
            </button>
          </div>
        </div>

        <!-- Gateway List Section -->
        <div class="section-group">
          <div class="p-3 bg-white rounded-lg shadow-sm border">
            <h3 class="text-md font-semibold text-gray-700 mb-2">Configured Gateways</h3>
            <div v-if="!localItem.gateways || localItem.gateways.length === 0" class="text-xs text-gray-500 text-center py-2">
              No gateways added yet.
            </div>
            <ul v-else class="space-y-1.5">
              <li v-for="(gateway, index) in localItem.gateways" :key="gateway.id" class="flex items-center justify-between p-2 bg-gray-50 rounded-md border text-sm">
                <div>
                  <h4 class="font-medium text-gray-700">{{ gateway.name }}</h4>
                  <p v-if="gateway.description" class="text-xs text-gray-500">{{ gateway.description }}</p>
                </div>
                <button @click="deletePaymentGateway(index)" class="text-red-500 hover:text-red-600 focus:outline-none p-1" title="Delete Gateway">
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-3.5 w-3.5" />
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="section-group mt-4 pt-3 border-t">
            <div class="flex items-center">
                <input v-model="localItem.required" type="checkbox" id="payment_required" class="popup-checkbox mr-2" />
                <label for="payment_required" class="popup-label text-sm">Required (User must select a payment option)</label>
            </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default {
  name: 'CheckoutPaymentElement',
  components: {
    FontAwesomeIcon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true, // 'edit' or 'preview'
    },
  },
  emits: ['update-item'],
  data() {
    return {
      localItem: { gateways: [] },
      newGateway: { name: '', description: '' },
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          id: generateUid(),
          name: 'Payment Options', // Default name for the element itself
          gateways: [],
          required: false,
        };
        const currentItem = newItem && typeof newItem === 'object' ? newItem : {};
        const parsedItem = JSON.parse(JSON.stringify(currentItem));

        if (parsedItem.gateways && Array.isArray(parsedItem.gateways)) {
          parsedItem.gateways = parsedItem.gateways.map(gw => ({ id: generateUid(), ...gw }));
        } else {
          parsedItem.gateways = [];
        }
        this.localItem = { ...defaults, ...parsedItem };
      },
      deep: true,
      immediate: true,
    },
    localItem: {
      handler(newItem) {
        this.$emit('update-item', JSON.parse(JSON.stringify(newItem)));
      },
      deep: true,
    },
  },
  methods: {
    addPaymentGateway() {
      if (!this.newGateway.name.trim()) {
        // Optionally, add an alert or user feedback here
        return;
      }
      if (!this.localItem.gateways) {
        this.localItem.gateways = [];
      }
      this.localItem.gateways.push({
        id: generateUid(),
        name: this.newGateway.name,
        description: this.newGateway.description,
      });
      this.newGateway.name = '';
      this.newGateway.description = '';
    },
    deletePaymentGateway(index) {
      this.localItem.gateways.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* text-sm */
}
.popup-input {
  border-width: 1px;
  border-color: #d1d5db; /* gray-300 */
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
  border-radius: 0.25rem; 
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
  background-color: white;
}
.popup-input:focus {
 outline: 2px solid transparent;
 outline-offset: 2px;
 --tw-ring-offset-shadow: var(--tw-ring-offset-width, 0px) 0 0 0 var(--tw-ring-offset-color, #fff), var(--tw-ring-shadow, 0 0 #0000);
 --tw-ring-shadow: 0 0 0 calc(1px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color, #3b82f6);
 box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
 border-color: #3b82f6; 
}
.popup-checkbox, .popup-radio {
  height: 1rem; 
  width: 1rem;
  border-radius: 0.25rem; 
  border-color: #d1d5db; 
  color: #4f46e5; 
}
.popup-radio { border-radius: 50%; }
.section-group { margin-bottom: 0.75rem; }
</style> 