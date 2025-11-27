<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <form class="p-2 border rounded-md shadow-sm">
        <div class="mb-2">
          <label class="block popup-label font-semibold mb-1">{{ localItem.name || 'Radio Group' }}</label>
          <div :class="localItem.inline ? 'flex flex-wrap gap-x-4 gap-y-1' : 'space-y-1'">
            <div v-for="(option, index) in localItem.options" :key="option.id || index" class="flex items-center">
              <input
                type="radio"
                :name="localItem.name"
                :id="(option.id || index) + '_preview'"
                :value="option.value"
                :checked="option.value === localItem.defaultOption"
                :required="localItem.required"
                class="popup-radio mr-1.5"
              />
              <label :for="(option.id || index) + '_preview'" class="text-xs text-gray-600">{{ option.label }}</label>
            </div>
          </div>
          <span v-if="localItem.required" class="text-xs text-red-500">* Required</span>
          <p v-if="!localItem.options || localItem.options.length === 0" class="text-xs text-gray-400 mt-1">No options configured.</p>
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
              <i class="fas fa-dot-circle text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Radio Button Group Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของ radio group</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-3">
            <div>
              <label class="popup-label block font-semibold mb-1">Group Name (Label):</label>
              <input v-model="localItem.name" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., Preferred Contact Method"/>
            </div>
            <div>
              <label class="popup-label block font-semibold mb-1">Required Error Message:</label>
              <input v-model="localItem.reqError" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., Please select an option"/>
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-3">
            <label class="popup-label block mb-2 font-semibold">Radio Options:</label>
            <div v-if="!localItem.options || localItem.options.length === 0" class="text-sm text-gray-500 py-2 px-3 border rounded-md bg-gray-50">
              No options added yet. Click "Add Option" to begin.
            </div>
            <div v-for="(option, index) in localItem.options" :key="option.id" class="option-item mb-2 p-2.5 border rounded-md" :class="[index % 2 === 0 ? 'bg-white' : 'bg-gray-50']">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 mb-2">
                <div>
                  <label class="popup-label block text-xs font-medium text-gray-700 mb-0.5">{{ index + 1 }}. Option Label:</label>
                  <input v-model="option.label" type="text" class="w-full text-sm popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="Label shown to user"/>
                </div>
                <div>
                  <label class="popup-label block text-xs font-medium text-gray-700 mb-0.5">Option Value:</label>
                  <input v-model="option.value" type="text" class="w-full text-sm popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="Value for this option"/>
                </div>
              </div>
              <div class="mb-2">
                <label class="popup-label block text-xs font-medium text-gray-700 mb-0.5">Description (Optional):</label>
                <input v-model="option.description" type="text" class="w-full text-sm popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="Brief description for the option"/>
              </div>
              <div class="flex items-center justify-end space-x-1.5 text-xs">
                <label class="flex items-center mr-auto">
                    <input v-model="localItem.defaultOption" :value="option.value" type="radio" class="popup-radio mr-1" :name="'defaultOpt_' + localItem.id"/>
                    <span class="popup-label text-xs">Default</span>
                </label>
                <button @click="moveRadioOptionUp(index)" :disabled="index === 0" class="option-btn">
                  <font-awesome-icon :icon="['fas', 'arrow-up']"/>
                </button>
                <button @click="moveRadioOptionDown(index)" :disabled="index === localItem.options.length - 1" class="option-btn">
                  <font-awesome-icon :icon="['fas', 'arrow-down']"/>
                </button>
                <button @click="cloneRadioOption(index)" class="option-btn">
                  <font-awesome-icon :icon="['fas', 'clone']"/> Clone
                </button>
                <button @click="deleteRadioOption(index)" class="option-btn text-red-600 hover:text-red-700">
                  <font-awesome-icon :icon="['fas', 'trash']"/> Delete
                </button>
              </div>
            </div>
            <button @click="addRadioOption" class="mt-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
              <font-awesome-icon :icon="['fas', 'plus']" class="mr-1"/> Add Option
            </button>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-4 pt-3 border-t border-gray-200">
            <label class="popup-label block mb-1 font-semibold">Additional Settings:</label>
            <div class="flex flex-wrap gap-x-6 gap-y-2">
              <div class="flex items-center">
                <input v-model="localItem.required" type="checkbox" id="radio_required" class="popup-checkbox mr-2" />
                <label for="radio_required" class="popup-label text-sm">Required</label>
              </div>
              <div class="flex items-center">
                <input v-model="localItem.inline" type="checkbox" id="radio_inline" class="popup-checkbox mr-2" />
                <label for="radio_inline" class="popup-label text-sm">Display Inline</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons'; // Import all solid icons
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas); // Add all solid icons to the library

function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default {
  name: 'RadioboxElement',
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
      localItem: { options: [] }, // Ensure options is an array
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          id: generateUid(), // Add an ID to the main item for unique radio group names if needed
          name: '',
          reqError: '',
          options: [],
          defaultOption: null, // Store the value of the default option
          required: false,
          inline: false,
        };
        const currentItem = newItem && typeof newItem === 'object' ? newItem : {};
        const parsedItem = JSON.parse(JSON.stringify(currentItem));
        
        // Ensure options in parsedItem are also initialized with an id
        if (parsedItem.options && Array.isArray(parsedItem.options)) {
            parsedItem.options = parsedItem.options.map(opt => ({ id: generateUid(), ...opt }));
        } else {
            parsedItem.options = [];
        }

        this.localItem = { ...defaults, ...parsedItem };

        // If defaultOption was stored as an index, try to convert it to value
        // This is a bit tricky if values are not unique or change. Storing value is more robust.
        // For now, if defaultOption is an index and options exist, map it.
        // However, the template is now binding defaultOption to option.value directly.
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
    addRadioOption() {
      if (!this.localItem.options) {
        this.localItem.options = [];
      }
      const newIndex = this.localItem.options.length;
      this.localItem.options.push({
        id: generateUid(), // Unique ID for v-for key and DOM elements
        label: `Option ${newIndex + 1}`,
        value: `option_${newIndex + 1}`,
        description: ''
      });
    },
    deleteRadioOption(index) {
      if (this.localItem.options[index].value === this.localItem.defaultOption) {
          this.localItem.defaultOption = null; // Clear default if it was this option
      }
      this.localItem.options.splice(index, 1);
    },
    cloneRadioOption(index) {
      const originalOption = this.localItem.options[index];
      const clonedOption = {
        ...JSON.parse(JSON.stringify(originalOption)),
        id: generateUid(), // New unique ID
        label: `${originalOption.label} (Copy)`,
      };
      this.localItem.options.splice(index + 1, 0, clonedOption);
    },
    moveRadioOptionUp(index) {
      if (index > 0) {
        const option = this.localItem.options.splice(index, 1)[0];
        this.localItem.options.splice(index - 1, 0, option);
      }
    },
    moveRadioOptionDown(index) {
      if (index < this.localItem.options.length - 1) {
        const option = this.localItem.options.splice(index, 1)[0];
        this.localItem.options.splice(index + 1, 0, option);
      }
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
  padding: 0.375rem 0.625rem; /* Slightly smaller padding for denser UI */
  font-size: 0.8125rem; /* Slightly smaller font for denser UI */
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

.option-item .option-btn {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    background-color: #f3f4f6; /* gray-100 */
    border: 1px solid #e5e7eb; /* gray-200 */
    font-size: 0.75rem; /* text-xs */
    color: #374151; /* gray-700 */
    transition: background-color 0.15s ease-in-out;
}
.option-item .option-btn:hover:not(:disabled) {
    background-color: #e5e7eb; /* gray-200 */
}
.option-item .option-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.section-group { margin-bottom: 0.75rem; }
</style> 