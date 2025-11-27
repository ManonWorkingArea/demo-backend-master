<template>
  <div class="tab-content">
    <div
      class="content-editor overflow-auto bg-white rounded-lg h-full"
    >
      <!-- Section Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'cog']" class="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Option Configuration</h3>
            <p class="text-sm text-gray-500">ตั้งค่าช่องว่างและระยะห่างของเนื้อหา</p>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 space-y-6">
        <!-- Custom ID & Class Section -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'tag']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Custom Identifiers</span>
            </div>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Custom ID</label>
                <input
                  :value="selectedItem.customId"
                  @input="$emit('update-selected-item-property', { property: 'customId', value: $event.target.value })"
                  type="text"
                  placeholder="เช่น my-element-id"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Custom Class</label>
                <input
                  :value="selectedItem.customClass"
                  @input="$emit('update-selected-item-property', { property: 'customClass', value: $event.target.value })"
                  type="text"
                  placeholder="เช่น my-custom-class"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Padding Section -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'expand-arrows-alt']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Padding Configuration</span>
            </div>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-5 gap-4">
              <!-- Set All Toggle -->
              <div class="flex items-center space-y-2">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    :checked="setAllPadding"
                    @change="$emit('update-local-data', { key: 'setAllPadding', value: $event.target.checked })"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">Set All</span>
                </label>
              </div>

              <!-- Individual Padding Controls -->
              <template v-if="!setAllPadding">
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Left</label>
                  <input
                    :value="selectedItem.paddingLeft"
                    @input="$emit('update-selected-item-property', { property: 'paddingLeft', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Top</label>
                  <input
                    :value="selectedItem.paddingTop"
                    @input="$emit('update-selected-item-property', { property: 'paddingTop', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Right</label>
                  <input
                    :value="selectedItem.paddingRight"
                    @input="$emit('update-selected-item-property', { property: 'paddingRight', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Bottom</label>
                  <input
                    :value="selectedItem.paddingBottom"
                    @input="$emit('update-selected-item-property', { property: 'paddingBottom', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </template>

              <!-- All Padding Control -->
              <template v-else>
                <div class="col-span-4 space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">All Sides</label>
                  <input
                    :value="paddingValue"
                    @input="$emit('update-set-all-value', {key: 'paddingValue', value: $event.target.value})"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Margin Section -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'arrows-alt']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Margin Configuration</span>
            </div>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-5 gap-4">
              <!-- Set All Toggle -->
              <div class="flex items-center space-y-2">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    :checked="setAllMargin"
                    @change="$emit('update-local-data', { key: 'setAllMargin', value: $event.target.checked })"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">Set All</span>
                </label>
              </div>

              <!-- Individual Margin Controls -->
              <template v-if="!setAllMargin">
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Left</label>
                  <input
                    :value="selectedItem.marginLeft"
                    @input="$emit('update-selected-item-property', { property: 'marginLeft', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Top</label>
                  <input
                    :value="selectedItem.marginTop"
                    @input="$emit('update-selected-item-property', { property: 'marginTop', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Right</label>
                  <input
                    :value="selectedItem.marginRight"
                    @input="$emit('update-selected-item-property', { property: 'marginRight', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Bottom</label>
                  <input
                    :value="selectedItem.marginBottom"
                    @input="$emit('update-selected-item-property', { property: 'marginBottom', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </template>

              <!-- All Margin Control -->
              <template v-else>
                <div class="col-span-4 space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">All Sides</label>
                  <input
                    :value="marginValue"
                    @input="$emit('update-set-all-value', {key: 'marginValue', value: $event.target.value})"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Inner Padding Section (for Row type only) -->
        <div v-if="selectedItem.type === 'row'" class="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div class="flex items-center space-x-2">
              <font-awesome-icon :icon="['fas', 'layer-group']" class="h-4 w-4 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Inner Padding Configuration</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">ตั้งค่าช่องว่างและระยะห่างของเนื้อหาด้านใน</p>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-5 gap-4">
              <!-- Set All Toggle -->
              <div class="flex items-center space-y-2">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    :checked="setAllInnerPadding"
                    @change="$emit('update-local-data', { key: 'setAllInnerPadding', value: $event.target.checked })"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">Set All</span>
                </label>
              </div>

              <!-- Individual Inner Padding Controls -->
              <template v-if="!setAllInnerPadding">
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Left</label>
                  <input
                    :value="selectedItem.paddingInnerLeft"
                    @input="$emit('update-selected-item-property', { property: 'paddingInnerLeft', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Top</label>
                  <input
                    :value="selectedItem.paddingInnerTop"
                    @input="$emit('update-selected-item-property', { property: 'paddingInnerTop', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Right</label>
                  <input
                    :value="selectedItem.paddingInnerRight"
                    @input="$emit('update-selected-item-property', { property: 'paddingInnerRight', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Bottom</label>
                  <input
                    :value="selectedItem.paddingInnerBottom"
                    @input="$emit('update-selected-item-property', { property: 'paddingInnerBottom', value: $event.target.value })"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </template>

              <!-- All Inner Padding Control -->
              <template v-else>
                <div class="col-span-4 space-y-2">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">All Sides</label>
                  <input
                    :value="paddingInnerValue"
                    @input="$emit('update-set-all-value', {key: 'paddingInnerValue', value: $event.target.value})"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptionsTab',
  props: {
    selectedItem: {
      type: Object,
      required: true,
    },
    paddingValue: {
      type: String,
      default: "",
    },
    marginValue: {
      type: String,
      default: "",
    },
    paddingInnerValue: {
        type: String,
        default: "",
    },
    setAllPadding: {
      type: Boolean,
      default: false,
    },
    setAllMargin: {
      type: Boolean,
      default: false,
    },
    setAllInnerPadding: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update-selected-item-property', 'update-local-data', 'update-set-all-value'],
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style> 