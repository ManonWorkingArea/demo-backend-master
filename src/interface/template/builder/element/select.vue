<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <form class="p-2 border rounded-md shadow-sm">
        <div class="mb-2">
          <label class="block popup-label font-semibold mb-1">{{ localItem.name || 'Select Dropdown' }}<span v-if="localItem.required" class="text-xs text-red-500 ml-1">* จำเป็น</span><span v-if="localItem.multiple" class="text-xs text-blue-500 ml-1">(Multiple)</span></label>
          <select
            :name="localItem.name"
            :multiple="localItem.multiple"
            :required="localItem.required"
            class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option v-if="localItem.placeholder" :disabled="localItem.disableFirstOption" :selected="!localItem.options.some(opt => opt.selected)" value="">
              {{ localItem.placeholder }}
            </option>
            <option v-for="(option, index) in localItem.options" :key="option.id || index" :value="option.value" :selected="option.selected">
              {{ option.label }}
            </option>
          </select>
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
              <i class="fas fa-caret-square-down text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Select (Dropdown) Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของ select dropdown</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-3">
            <div>
              <label class="popup-label block font-semibold mb-1">Field Name (Label):</label>
              <input v-model="localItem.name" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., Country, Category"/>
            </div>
            <div>
              <label class="popup-label block font-semibold mb-1">Required Error Message:</label>
              <input v-model="localItem.reqError" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., Please select a country"/>
            </div>
            <div class="md:col-span-2">
              <label class="popup-label block font-semibold mb-1">Placeholder Text (for first disabled option):</label>
              <input v-model="localItem.placeholder" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., -- Select an Option --"/>
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-3">
            <label class="popup-label block mb-2 font-semibold">Options:</label>
            <div v-if="!localItem.options || localItem.options.length === 0" class="text-sm text-gray-500 py-2 px-3 border rounded-md bg-gray-50">
              No options added yet. Click "Add Option" to begin.
            </div>
            <div v-for="(option, index) in localItem.options" :key="option.id" class="option-item mb-1.5 p-2.5 border rounded-md" :class="[index % 2 === 0 ? 'bg-white' : 'bg-gray-50']">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 mb-1.5">
                <div>
                  <label class="popup-label block text-xs font-medium text-gray-700 mb-0.5">{{ index + 1 }}. Option Label (Text shown):</label>
                  <input v-model="option.label" type="text" class="w-full text-sm popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label class="popup-label block text-xs font-medium text-gray-700 mb-0.5">Option Value:</label>
                  <input v-model="option.value" type="text" class="w-full text-sm popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
              <div class="flex items-center justify-end space-x-1.5 text-xs">
                <label class="flex items-center mr-auto">
                  <input type="checkbox" v-model="option.selected" class="popup-checkbox mr-1" />
                  <span class="popup-label text-xs">Selected by default</span>
                </label>
                <button @click="moveSelectOptionUp(index)" :disabled="index === 0" class="option-btn">
                  <font-awesome-icon :icon="['fas', 'arrow-up']"/>
                </button>
                <button @click="moveSelectOptionDown(index)" :disabled="index === localItem.options.length - 1" class="option-btn">
                  <font-awesome-icon :icon="['fas', 'arrow-down']"/>
                </button>
                <button @click="cloneSelectOption(index)" class="option-btn">
                  <font-awesome-icon :icon="['fas', 'clone']"/> Clone
                </button>
                <button @click="deleteSelectOption(index)" class="option-btn text-red-600 hover:text-red-700">
                  <font-awesome-icon :icon="['fas', 'trash']"/> Delete
                </button>
              </div>
            </div>
            <button @click="addSelectOption" class="mt-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
              <font-awesome-icon :icon="['fas', 'plus']" class="mr-1"/> Add Option
            </button>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-4 pt-3 border-t border-gray-200">
            <label class="popup-label block mb-1 font-semibold">Additional Settings:</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              <div class="flex items-center">
                <input v-model="localItem.required" type="checkbox" id="select_required" class="popup-checkbox mr-2" />
                <label for="select_required" class="popup-label text-sm">Required</label>
              </div>
              <div class="flex items-center">
                <input v-model="localItem.multiple" type="checkbox" id="select_multiple" class="popup-checkbox mr-2" />
                <label for="select_multiple" class="popup-label text-sm">Allow Multiple Selections</label>
              </div>
              <div class="flex items-center">
                <input v-model="localItem.disableFirstOption" type="checkbox" id="select_disable_first" class="popup-checkbox mr-2" />
                <label for="select_disable_first" class="popup-label text-sm">Disable First Option (as placeholder)</label>
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
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default {
  name: 'SelectElement',
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
      localItem: { options: [] },
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          id: generateUid(),
          name: '',
          reqError: '',
          options: [],
          placeholder: '',
          required: false,
          multiple: false,
          disableFirstOption: false,
        };
        const currentItem = newItem && typeof newItem === 'object' ? newItem : {};
        const parsedItem = JSON.parse(JSON.stringify(currentItem));
        
        if (parsedItem.options && Array.isArray(parsedItem.options)) {
            parsedItem.options = parsedItem.options.map(opt => ({
                 id: generateUid(), 
                 selected: opt.selected || false, // For default selection of an option
                 ...opt 
            }));
        } else {
            parsedItem.options = [];
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
    addSelectOption() {
      if (!this.localItem.options) {
        this.localItem.options = [];
      }
      const newIndex = this.localItem.options.length;
      this.localItem.options.push({
        id: generateUid(),
        label: `Option ${newIndex + 1}`,
        value: `option_${newIndex + 1}`,
        selected: false,
      });
    },
    deleteSelectOption(index) {
      this.localItem.options.splice(index, 1);
    },
    cloneSelectOption(index) {
      const originalOption = this.localItem.options[index];
      const clonedOption = {
        ...JSON.parse(JSON.stringify(originalOption)),
        id: generateUid(),
        label: `${originalOption.label} (Copy)`,
      };
      this.localItem.options.splice(index + 1, 0, clonedOption);
    },
    moveSelectOptionUp(index) {
      if (index > 0) {
        const option = this.localItem.options.splice(index, 1)[0];
        this.localItem.options.splice(index - 1, 0, option);
      }
    },
    moveSelectOptionDown(index) {
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
.popup-checkbox {
  height: 1rem; 
  width: 1rem;
  border-radius: 0.25rem; 
  border-color: #d1d5db; 
  color: #4f46e5; 
}

.option-item .option-btn {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    background-color: #f3f4f6; 
    border: 1px solid #e5e7eb; 
    font-size: 0.75rem; 
    color: #374151; 
    transition: background-color 0.15s ease-in-out;
}
.option-item .option-btn:hover:not(:disabled) {
    background-color: #e5e7eb; 
}
.option-item .option-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.section-group { margin-bottom: 0.75rem; }
</style> 