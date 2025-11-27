<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-md shadow-xl border border-gray-200 rounded-lg overflow-hidden">
      <!-- Modal Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'upload']" class="h-3 w-3 text-white" />
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-900">นำเข้าข้อมูล Builder</h2>
              <p class="text-xs text-gray-500">ยืนยันการนำเข้าข้อมูลจากไฟล์ JSON</p>
            </div>
          </div>
          <button
            @click="$emit('cancel')"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="px-4 py-4">
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-900 mb-2">ข้อมูลไฟล์:</h3>
          <div class="bg-gray-50 rounded-lg p-3 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">ชื่อไฟล์:</span>
              <span class="font-mono text-gray-900">{{ importFileName }}</span>
            </div>
            <div v-if="importData?.metadata?.title" class="flex justify-between text-xs">
              <span class="text-gray-600">ชื่อ:</span>
              <span class="text-gray-900">{{ importData.metadata.title }}</span>
            </div>
            <div v-if="importData?.metadata?.exportDate" class="flex justify-between text-xs">
              <span class="text-gray-600">วันที่ส่งออก:</span>
              <span class="text-gray-900">{{ new Date(importData.metadata.exportDate).toLocaleDateString('th-TH') }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">จำนวน Rows:</span>
              <span class="text-gray-900">{{ importData?.builder?.length || 0 }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-600">CSS:</span>
              <span class="text-gray-900">{{ importData?.css?.length || 0 }} ตัวอักษร</span>
            </div>
          </div>
        </div>

        <!-- Import Mode Selection -->
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-900 mb-3">โหมดการนำเข้า:</h3>
          <div class="space-y-3">
            <!-- Replace Mode -->
            <label class="flex items-start space-x-3 cursor-pointer">
              <input 
                v-model="localImportMode" 
                type="radio" 
                value="replace" 
                class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
              />
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas', 'sync-alt']" class="h-4 w-4 text-red-600" />
                  <span class="text-sm font-medium text-gray-900">แทนที่ทั้งหมด (Replace)</span>
                </div>
                <p class="text-xs text-gray-600 mt-1">ลบข้อมูลปัจจุบันทั้งหมดและแทนที่ด้วยข้อมูลใหม่</p>
                <div class="bg-red-50 border border-red-200 rounded p-2 mt-2">
                  <p class="text-xs text-red-700">⚠️ ข้อมูลปัจจุบัน {{ rowsCount }} rows จะถูกลบ</p>
                </div>
              </div>
            </label>

            <!-- Append Mode -->
            <label class="flex items-start space-x-3 cursor-pointer">
              <input 
                v-model="localImportMode" 
                type="radio" 
                value="append" 
                class="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4 text-green-600" />
                  <span class="text-sm font-medium text-gray-900">เพิ่มต่อท้าย (Append)</span>
                </div>
                <p class="text-xs text-gray-600 mt-1">เพิ่มข้อมูลใหม่ต่อจากข้อมูลปัจจุบัน</p>
                <div class="bg-green-50 border border-green-200 rounded p-2 mt-2">
                  <p class="text-xs text-green-700">
                    ✅ ข้อมูลปัจจุบัน {{ rowsCount }} rows + ข้อมูลใหม่ {{ importData?.builder?.length || 0 }} rows 
                    = รวม {{ rowsCount + (importData?.builder?.length || 0) }} rows
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- CSS Handling Note -->
        <div class="mb-4" v-if="importData?.css">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="flex items-start space-x-2">
              <font-awesome-icon :icon="['fas', 'code']" class="h-4 w-4 text-blue-600 mt-0.5" />
              <div class="text-xs text-blue-800">
                <p class="font-medium">เกี่ยวกับ CSS:</p>
                <p v-if="localImportMode === 'replace'">CSS จะถูกแทนที่ทั้งหมด</p>
                <p v-else>CSS จะถูกเพิ่มต่อจาก CSS ปัจจุบัน (อาจมีความซ้ำซ้อน)</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="localImportMode === 'replace'" class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div class="flex items-start space-x-2">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-4 w-4 text-amber-600 mt-0.5" />
            <div class="text-xs text-amber-800">
              <p class="font-medium">คำเตือน:</p>
              <p>การแทนที่จะลบข้อมูลปัจจุบันทั้งหมด กรุณาแน่ใจว่าได้บันทึกงานที่สำคัญแล้ว</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end space-x-2">
        <button
          @click="$emit('cancel')"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          @click="$emit('confirm')"
          class="px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'check']" class="h-3.5 w-3.5 mr-1.5" />
          ยืนยันการนำเข้า
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImportModal",
  props: {
    visible: { type: Boolean, default: false },
    importData: { type: Object, default: null },
    importFileName: { type: String, default: '' },
    importMode: { type: String, default: 'replace' },
    rowsCount: { type: Number, default: 0 },
  },
  emits: ['confirm', 'cancel', 'update:importMode'],
  data() {
    return {
      localImportMode: this.importMode
    };
  },
  watch: {
    importMode(newVal) {
      this.localImportMode = newVal;
    },
    localImportMode(newVal) {
      this.$emit('update:importMode', newVal);
    }
  }
};
</script> 