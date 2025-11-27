<template>
  <div class="tab-content">
    <div
      class="content-editor overflow-auto bg-white rounded-lg h-full"
    >
      <!-- Section Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div class="flex items-center space-x-2">
          <font-awesome-icon :icon="['fas', 'code-branch']" class="h-4 w-4 text-blue-600" />
          <h3 class="text-base font-medium text-gray-900">เงื่อนไขการแสดงผล</h3>
        </div>
      </div>

      <div class="px-4 py-4 space-y-4">
        <template
          v-if="
            !selectedItem.logics ||
            !selectedItem.logics.some((logic) => logic.hasOwnProperty('request'))
          "
        >
          <!-- Logic Rules Section -->
          <div class="border border-gray-200 rounded-lg">
            <!-- Rules List -->
            <div class="divide-y divide-gray-100">
              <div
                v-for="(logicItem, index) in selectedItem.logics"
                :key="logicItem.uid"
                class="p-3 hover:bg-gray-50"
              >
                <div class="flex items-center space-x-3">
                  <!-- Source Selection -->
                  <div class="flex-1">
                    <div class="text-xs text-gray-500 mb-1">เมื่อเลือก</div>
                    <template v-if="!logicItem.default">
                      <select
                        :value="logicItem.default"
                        @change="$emit('update-logic-item-property', {index, property: 'default', value: $event.target.value})"
                        class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="" disabled>เลือกตัวเลือก</option>
                        <option
                          v-for="option in selectedItem.options"
                          :value="option.value"
                          :key="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                    </template>
                    <template v-else>
                      <div class="px-2 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm">
                        {{ getSelectedOptionLabel(logicItem.default) }}
                      </div>
                    </template>
                  </div>

                  <!-- Arrow -->
                  <div class="text-gray-400">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3 w-3" />
                  </div>

                  <!-- Target Selection -->
                  <div class="flex-1" v-if="logicItem.default">
                    <div class="text-xs text-gray-500 mb-1">กระทำกับ</div>
                    <template v-if="!logicItem.destination">
                      <select
                        :value="logicItem.destination"
                        @change="$emit('update-logic-item-property', {index, property: 'destination', value: allBuilderOptions.find(opt => opt.name === $event.target.value) || $event.target.value })"
                        class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="" disabled>เลือกเป้าหมาย</option>
                        <option
                          v-for="option in allBuilderOptions"
                          :value="option.name"
                          :key="option.name"
                        >
                          {{ option.name }}
                        </option>
                      </select>
                    </template>
                    <template v-else>
                      <div class="px-2 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm">
                        {{ logicItem.destination.name }}
                      </div>
                    </template>
                  </div>

                  <!-- Action Selection -->
                  <div class="flex-1" v-if="logicItem.destination">
                    <div class="text-xs text-gray-500 mb-1">การกระทำ</div>
                    <template v-if="!logicItem.method">
                      <select
                        :value="logicItem.method"
                        @change="$emit('set-logic-item-method', {index, methodValue: $event.target.value, originalSelectedItem: selectedItem})"
                        class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="" disabled>เลือกการกระทำ</option>
                        <option value="show">แสดง</option>
                        <option value="hide">ซ่อน</option>
                      </select>
                    </template>
                    <template v-else>
                      <div class="px-2 py-1.5 rounded text-sm flex items-center space-x-1"
                           :class="logicItem.method === 'show' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
                        <font-awesome-icon 
                          :icon="['fas', logicItem.method === 'show' ? 'eye' : 'eye-slash']" 
                          class="h-3 w-3" 
                        />
                        <span>{{ logicItem.method === 'show' ? 'แสดง' : 'ซ่อน' }}</span>
                      </div>
                    </template>
                  </div>

                  <!-- Delete Button -->
                  <button
                    @click="$emit('delete-logic-item', { index })"
                    class="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded text-xs flex items-center justify-center"
                    title="ลบเงื่อนไข"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Add Rule Button -->
            <div class="border-t border-gray-200 p-3">
              <button
                class="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                @click="$emit('add-new-logic-rule', {selectedItemOriginal: selectedItem})"
              >
                <font-awesome-icon :icon="['fas', 'plus']" class="h-3 w-3 mr-1" />
                เพิ่มเงื่อนไข
              </button>
            </div>
          </div>
        </template>

        <!-- Dependent Logic Display Section -->
        <template v-else>
          <div class="bg-amber-50 border border-amber-200 rounded-lg">
            <!-- Info Header -->
            <div class="bg-amber-100 border-b border-amber-200 px-3 py-2 rounded-t-lg">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas', 'info-circle']" class="h-4 w-4 text-amber-600" />
                <div>
                  <div class="text-sm font-medium text-amber-800">ถูกควบคุมจากฟอร์มอื่น</div>
                  <div class="text-xs text-amber-700">การแสดงผลขึ้นอยู่กับเงื่อนไขจากฟอร์มอื่น</div>
                </div>
              </div>
            </div>

            <!-- Logic Display Content -->
            <div class="divide-y divide-gray-100">
              <div
                v-for="logicItem in selectedItem.logics"
                :key="logicItem.uid"
                class="p-3"
              >
                <div class="flex items-center space-x-3">
                  <!-- Parent Form -->
                  <div class="flex-1">
                    <div class="text-xs text-gray-500 mb-1">ควบคุมโดย</div>
                    <div class="px-2 py-1.5 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      {{ logicItem._metadata?.parentName || getParentLogicObjectName(logicItem) }}
                    </div>
                  </div>

                  <!-- Arrow -->
                  <div class="text-gray-400">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3 w-3" />
                  </div>

                  <!-- Selected Value -->
                  <div class="flex-1">
                    <div class="text-xs text-gray-500 mb-1">เมื่อเลือก</div>
                    <div class="px-2 py-1.5 bg-gray-100 border border-gray-200 rounded text-sm">
                      {{ logicItem.default }}
                    </div>
                  </div>

                  <!-- Arrow -->
                  <div class="text-gray-400">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3 w-3" />
                  </div>

                  <!-- Action Result -->
                  <div class="flex-1">
                    <div class="text-xs text-gray-500 mb-1">การกระทำ</div>
                    <div class="px-2 py-1.5 rounded text-sm flex items-center space-x-1"
                         :class="logicItem.method === 'show' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
                      <font-awesome-icon 
                        :icon="['fas', logicItem.method === 'show' ? 'eye' : 'eye-slash']" 
                        class="h-3 w-3" 
                      />
                      <span>{{ logicItem.method === "show" ? "แสดง" : "ซ่อน" }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LogicTab',
  props: {
    selectedItem: {
      type: Object,
      required: true,
    },
    allBuilderOptions: {
      type: Array,
      default: () => [],
    },
    getParentLogicObjectNameFunction: {
      type: Function,
      required: true,
    }
  },
  emits: [
    'delete-logic-item',
    'update-logic-item-property',
    'set-logic-item-method',
    'add-new-logic-rule'
  ],
  methods: {
    getSelectedOptionLabel(value) {
      if (this.selectedItem && this.selectedItem.options) {
        const option = this.selectedItem.options.find(o => o.value === value);
        return option ? option.label : value;
      }
      return value;
    },
    getParentLogicObjectName(logicItem) {
      // ใช้ฟังก์ชั่นจาก parent component (Builder.vue)
      if (this.getParentLogicObjectNameFunction && typeof this.getParentLogicObjectNameFunction === 'function') {
        return this.getParentLogicObjectNameFunction(logicItem);
      }
      
      // ใช้ข้อมูลใหม่ (request: true)
      if (logicItem && logicItem.request === true && logicItem._metadata) {
        return logicItem._metadata.parentName || 'ไม่ระบุ';
      }
      
      // Fallback สำหรับรูปแบบเก่า
      if (logicItem && logicItem.request && typeof logicItem.request === 'object' && logicItem.request.parentUid) {
        return `UID: ${logicItem.request.parentUid}`;
      }
      
      return 'ไม่ระบุ';
    }
  }
};
</script>

<style scoped>
/* Component styles */
</style> 