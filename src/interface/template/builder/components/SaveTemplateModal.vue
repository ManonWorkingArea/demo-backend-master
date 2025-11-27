<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-md shadow-xl border border-gray-200 rounded-lg overflow-hidden">
      <!-- Modal Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'save']" class="h-3 w-3 text-white" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900">บันทึกเป็น Block Template</h2>
              <p class="text-xs text-gray-500">บันทึก Row นี้เป็น Template เพื่อใช้งานในภายหลัง</p>
            </div>
          </div>
          <button
            @click="$emit('cancel')"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            :disabled="savingTemplate"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="px-4 py-4">
        <!-- Template Name -->
        <div class="mb-4">
          <label for="templateName" class="block text-sm font-medium text-gray-700 mb-2">
            ชื่อ Template <span class="text-red-500">*</span>
          </label>
          <input
            id="templateName"
            v-model="localTemplateName"
            type="text"
            placeholder="เช่น Header Section, Hero Banner, Contact Form"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            :disabled="savingTemplate"
            maxlength="100"
          />
          <p class="text-xs text-gray-500 mt-1">{{ localTemplateName.length }}/100 ตัวอักษร</p>
        </div>

        <!-- Template Description -->
        <div class="mb-4">
          <label for="templateDescription" class="block text-sm font-medium text-gray-700 mb-2">
            คำอธิบาย (ไม่บังคับ)
          </label>
          <textarea
            id="templateDescription"
            v-model="localTemplateDescription"
            rows="3"
            placeholder="อธิบายการใช้งานหรือรายละเอียดของ Template นี้"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            :disabled="savingTemplate"
            maxlength="300"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ localTemplateDescription.length }}/300 ตัวอักษร</p>
        </div>

        <!-- Row Info -->
        <div v-if="savingRowIndex !== null && rowInfo" class="mb-4">
          <h3 class="text-sm font-medium text-gray-900 mb-2">ข้อมูล Row:</h3>
          <div class="bg-gray-50 rounded-lg p-3 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">Row Index:</span>
              <span class="font-mono text-gray-900">{{ savingRowIndex }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">Columns:</span>
              <span class="text-gray-900">{{ rowInfo.columns?.length || 0 }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">Grid:</span>
              <span class="text-gray-900">{{ rowInfo.col || 'Auto' }}</span>
            </div>
            <div v-if="rowInfo.text" class="flex justify-between text-xs">
              <span class="text-gray-600">Text:</span>
              <span class="text-gray-900 truncate ml-2">{{ rowInfo.text }}</span>
            </div>
          </div>
        </div>

        <!-- Info Note -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div class="flex items-start space-x-2">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="h-4 w-4 text-blue-600 mt-0.5" />
            <div class="text-xs text-blue-800">
              <p class="font-medium">ข้อมูลที่จะบันทึก:</p>
              <p>Template จะรวมข้อมูลทั้งหมดของ Row รวมถึง Columns, Content Objects, และ Style Settings</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end space-x-2">
        <button
          @click="$emit('cancel')"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          :disabled="savingTemplate"
        >
          ยกเลิก
        </button>
        <button
          @click="$emit('save')"
          class="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center"
          :disabled="savingTemplate || !localTemplateName.trim()"
        >
          <div v-if="savingTemplate" class="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
          <font-awesome-icon v-else :icon="['fas', 'save']" class="h-3.5 w-3.5 mr-1.5" />
          {{ savingTemplate ? 'กำลังบันทึก...' : 'บันทึก Template' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SaveTemplateModal",
  props: {
    visible: { type: Boolean, default: false },
    savingRowIndex: { type: [Number, null], default: null },
    templateName: { type: String, default: '' },
    templateDescription: { type: String, default: '' },
    savingTemplate: { type: Boolean, default: false },
    rowInfo: { type: Object, default: null },
  },
  emits: ['save', 'cancel', 'update:templateName', 'update:templateDescription'],
  data() {
    return {
      localTemplateName: this.templateName,
      localTemplateDescription: this.templateDescription,
    };
  },
  watch: {
    templateName(newVal) {
      this.localTemplateName = newVal;
    },
    templateDescription(newVal) {
      this.localTemplateDescription = newVal;
    },
    localTemplateName(newVal) {
      this.$emit('update:templateName', newVal);
    },
    localTemplateDescription(newVal) {
      this.$emit('update:templateDescription', newVal);
    },
  },
};
</script> 