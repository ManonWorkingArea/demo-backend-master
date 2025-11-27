<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <form class="p-2 border rounded-md shadow-sm">
        <div class="mb-2">
          <label :for="localItem.name" class="block popup-label font-semibold mb-1">{{ localItem.name || 'Input Field' }}</label>
          <input
            :id="localItem.name"
            :type="localItem.inputType || 'text'"
            :name="localItem.name"
            :placeholder="localItem.placeholder"
            :required="localItem.required"
            :maxlength="localItem.maxLength || undefined"
            :minlength="localItem.minLength || undefined"
            :pattern="localItem.pattern || undefined"
            class="popup-input w-full"
          />
          <span v-if="localItem.required" class="text-xs text-red-500">* Required</span>
        </div>
      </form>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-pen text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Input Field Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของ input field</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label class="popup-label block mb-1 font-semibold">Field Name (Label):</label>
              <input
                v-model="localItem.name"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., First Name"
              />
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Placeholder:</label>
              <input
                v-model="localItem.placeholder"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Enter your first name"
              />
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Input Type:</label>
              <select v-model="localItem.inputType" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                <option value="text">Text</option>
                <option value="password">Password</option>
                <option value="name">[Form] Name</option>
                <option value="email">[Form] Email</option>
                <option value="mobile">[Form] Mobile</option>
                <option value="taxID">[Form] Tax ID</option>
                <option value="taxName">[Form] Tax Name</option>
                <option value="number">Number</option>
              </select>
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Required Error Message:</label>
              <input
                v-model="localItem.reqError"
                type="text"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., This field is required"
              />
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Max Length:</label>
              <input
                v-model.number="localItem.maxLength"
                type="number"
                min="0"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Min Length:</label>
              <input
                v-model.number="localItem.minLength"
                type="number"
                min="0"
                class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-200">
            <div class="flex items-center">
              <input v-model="localItem.required" type="checkbox" id="input_required" class="popup-checkbox mr-2" />
              <label for="input_required" class="popup-label font-semibold">Required</label>
            </div>
            <div class="flex items-center">
              <input v-model="localItem.remoteValid" type="checkbox" id="input_remoteValid" class="popup-checkbox mr-2" />
              <label for="input_remoteValid" class="popup-label font-semibold">Remote Validation</label>
            </div>
            <div class="flex items-center">
              <input v-model="localItem.SyncData" type="checkbox" id="input_syncData" class="popup-checkbox mr-2" />
              <label for="input_syncData" class="popup-label font-semibold">Sync Data</label>
            </div>
          </div>
          <div v-if="localItem.remoteValid" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mt-3 pt-3 border-t border-gray-200">
            <div>
              <label class="popup-label block mb-1 font-semibold">Remote Validation Collection:</label>
              <input v-model="localItem.remoteValidCollection" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., users"/>
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Remote Validation Key:</label>
              <input v-model="localItem.remoteValidKey" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., email"/>
            </div>
          </div>
          <div v-if="localItem.SyncData" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mt-3 pt-3 border-t border-gray-200">
            <div>
              <label class="popup-label block mb-1 font-semibold">Sync Data Location:</label>
              <input v-model="localItem.SyncDataLocation" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., profile.user_info"/>
            </div>
            <div>
              <label class="popup-label block mb-1 font-semibold">Sync Data Key:</label>
              <input v-model="localItem.SyncDataKey" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., firstName"/>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'InputElement',
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
      localItem: {},
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          name: '',
          placeholder: '',
          reqError: '',
          inputType: 'text',
          maxLength: null,
          minLength: null,
          required: false,
          remoteValid: false,
          remoteValidCollection: '',
          remoteValidKey: '',
          SyncData: false,
          SyncDataLocation: '',
          SyncDataKey: '',
          pattern: '' // Added pattern as it was in original preview
        };
        const currentItem = newItem && typeof newItem === 'object' ? newItem : {};
        this.localItem = { ...defaults, ...JSON.parse(JSON.stringify(currentItem)) };
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
  created() {
    // Fallback initialization if item watcher hasn't run or item is initially empty
    if (Object.keys(this.localItem).length === 0) {
        const defaults = {
          name: '',
          placeholder: '',
          reqError: '',
          inputType: 'text',
          maxLength: null,
          minLength: null,
          required: false,
          remoteValid: false,
          remoteValidCollection: '',
          remoteValidKey: '',
          SyncData: false,
          SyncDataLocation: '',
          SyncDataKey: '',
          pattern: ''
        };
        const currentItem = this.item && typeof this.item === 'object' ? this.item : {};
        this.localItem = { ...defaults, ...JSON.parse(JSON.stringify(currentItem)) };
    }
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
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem; /* text-sm */
  border-radius: 0.25rem; /* rounded-sm */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  background-color: white; /* Ensure bg for dark mode themes if needed */
}
.popup-input:focus {
 outline: 2px solid transparent;
 outline-offset: 2px;
 --tw-ring-offset-shadow: var(--tw-ring-offset-width, 0px) 0 0 0 var(--tw-ring-offset-color, #fff), var(--tw-ring-shadow, 0 0 #0000);
 --tw-ring-shadow: 0 0 0 calc(1px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color, #3b82f6);
 box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
 border-color: #3b82f6; /* focus:border-indigo-500 */
}

.popup-checkbox {
  height: 1rem; 
  width: 1rem;
  border-radius: 0.25rem; /* rounded */
  border-color: #d1d5db; /* gray-300 */
  color: #4f46e5; /* indigo-600 */
}

/* .section-group { 
  padding-bottom: 0.75rem; 
} */
</style> 