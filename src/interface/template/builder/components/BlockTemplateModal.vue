<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-4xl shadow-xl border border-gray-200 rounded-lg overflow-hidden">
      <!-- Modal Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'layer-group']" class="h-3 w-3 text-white" />
            </div>
            <div>
              <h2 v-if="!showTemplatePreview" class="text-base font-semibold text-gray-900">เลือก Block Template</h2>
              <h2 v-else class="text-base font-semibold text-gray-900">รายละเอียด Template</h2>
              <p v-if="!showTemplatePreview" class="text-xs text-gray-500">เลือก Template ที่บันทึกไว้เพื่อดูรายละเอียด</p>
              <p v-else class="text-xs text-gray-500">ตรวจสอบรายละเอียดก่อนใช้งาน Template</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            :disabled="isLoading"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div class="flex h-[70vh]">
        <!-- Template List (ซ้าย) -->
        <div v-if="!showTemplatePreview" class="w-full px-4 py-4 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p class="text-sm text-gray-500 mt-3">กำลังโหลด Block Templates...</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!templates || templates.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <font-awesome-icon :icon="['fas', 'layer-group']" class="h-8 w-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">ยังไม่มี Block Templates</h3>
            <p class="text-sm text-gray-500 mb-4">บันทึก Row เป็น Template เพื่อใช้งานในภายหลัง</p>
          </div>

          <!-- Template List -->
          <div v-else class="grid grid-cols-3 gap-3">
            <div
              v-for="template in templates"
              :key="template._id"
              @click="$emit('show-details', template)"
              class="group flex flex-col p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200 hover:shadow-md h-32"
            >
              <!-- Template Header -->
              <div class="flex items-start justify-between mb-2">
                <div class="w-8 h-8 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                  <font-awesome-icon :icon="['fas', 'layer-group']" class="h-4 w-4 text-purple-600" />
                </div>
                <font-awesome-icon 
                  :icon="['fas', 'chevron-right']" 
                  class="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" 
                />
              </div>
              <!-- Template Info -->
              <div class="flex-1 overflow-hidden">
                <h3 class="text-sm font-semibold text-gray-900 mb-1 truncate">{{ template.name }}</h3>
                <div class="flex items-center gap-3 mb-2">
                  <div class="text-xs text-gray-500 flex items-center">
                    <i class="fas fa-columns text-gray-400 mr-1"></i>
                    {{ template.metadata?.columns_count || 0 }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ new Date(template.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' }) }}
                  </div>
                </div>
                <p v-if="template.description" class="text-xs text-gray-600 line-clamp-2 leading-tight">
                  {{ template.description }}
                </p>
                <p v-else class="text-xs text-gray-400 italic">ไม่มีคำอธิบาย</p>
              </div>
              <!-- Template Footer -->
              <div class="mt-2 pt-2 border-t border-gray-100">
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span class="truncate mr-1">{{ template.owner_name || 'ไม่ระบุ' }}</span>
                  <span class="bg-gray-100 px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap">{{ template.category || 'row' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Template Preview (ขวา) -->
        <div v-if="showTemplatePreview && selectedTemplate" class="w-full flex flex-col">
          <!-- Preview Header -->
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div class="flex items-center justify-between">
              <button
                @click="$emit('back-to-list')"
                class="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-3 w-3 mr-2" />
                กลับรายการ
              </button>
              <div class="text-xs text-gray-500">
                {{ selectedTemplate.type || 'row_template' }}
              </div>
            </div>
          </div>

          <!-- Template Details -->
          <div class="flex-1 overflow-y-auto px-4 py-4">
            <!-- Template Header Info -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'layer-group']" class="h-6 w-6 text-purple-600" />
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ selectedTemplate.name }}</h3>
                  <p v-if="selectedTemplate.description" class="text-sm text-gray-600 mb-3">
                    {{ selectedTemplate.description }}
                  </p>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">ผู้สร้าง:</span>
                      <span class="font-medium ml-1">{{ selectedTemplate.owner_name || 'ไม่ระบุ' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">วันที่สร้าง:</span>
                      <span class="font-medium ml-1">{{ new Date(selectedTemplate.created_at).toLocaleDateString('th-TH') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Template Structure -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">โครงสร้าง Template</h4>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-xs text-gray-500 mb-1">Columns</div>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ selectedTemplate.metadata?.columns_count || selectedTemplate.data?.columns?.length || 0 }}
                  </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-xs text-gray-500 mb-1">Grid System</div>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ selectedTemplate.metadata?.grid_columns || selectedTemplate.data?.col || 'Auto' }}
                  </div>
                </div>
              </div>
              <!-- Responsive Settings -->
              <div v-if="selectedTemplate.metadata?.responsive_settings" class="mb-4">
                <div class="text-xs text-gray-500 mb-2">Responsive Support</div>
                <div class="flex space-x-3">
                  <span class="flex items-center text-xs">
                    <i class="fas fa-mobile-alt mr-1" :class="selectedTemplate.metadata.responsive_settings.mobile ? 'text-green-500' : 'text-gray-300'"></i>
                    Mobile
                  </span>
                  <span class="flex items-center text-xs">
                    <i class="fas fa-tablet-alt mr-1" :class="selectedTemplate.metadata.responsive_settings.tablet ? 'text-green-500' : 'text-gray-300'"></i>
                    Tablet
                  </span>
                  <span class="flex items-center text-xs">
                    <i class="fas fa-laptop mr-1" :class="selectedTemplate.metadata.responsive_settings.laptop ? 'text-green-500' : 'text-gray-300'"></i>
                    Laptop
                  </span>
                  <span class="flex items-center text-xs">
                    <i class="fas fa-desktop mr-1" :class="selectedTemplate.metadata.responsive_settings.desktop ? 'text-green-500' : 'text-gray-300'"></i>
                    Desktop
                  </span>
                </div>
              </div>
              <!-- Background Info -->
              <div v-if="selectedTemplate.metadata?.has_background" class="text-xs text-gray-600">
                <i class="fas fa-palette text-gray-400 mr-1"></i>
                มีการตั้งค่า Background
              </div>
            </div>

            <!-- Column Details -->
            <div v-if="selectedTemplate.data?.columns" class="bg-white border border-gray-200 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">รายละเอียด Columns</h4>
              <div class="space-y-2">
                <div
                  v-for="(column, index) in selectedTemplate.data.columns"
                  :key="index"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div class="text-sm">
                    <span class="font-medium">Column {{ index + 1 }}</span>
                    <span v-if="column.text" class="text-gray-500 ml-2">({{ column.text }})</span>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ column.object?.length || 0 }} objects
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview Actions -->
          <div class="bg-gray-50 border-t border-gray-200 px-4 py-3">
            <div class="flex items-center justify-between">
              <button
                @click="$emit('close-preview')"
                class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <div class="flex space-x-2">
                <button
                  @click="$emit('use-template', selectedTemplate)"
                  class="px-4 py-1.5 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" class="h-3.5 w-3.5 mr-1.5" />
                  ใช้ Template นี้
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer (แสดงเฉพาะตอนไม่มี preview) -->
      <div v-if="!showTemplatePreview" class="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end">
        <button
          @click="$emit('close')"
          class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          :disabled="isLoading"
        >
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BlockTemplateModal",
  props: {
    visible: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    templates: { type: Array, default: () => [] },
    selectedTemplate: { type: Object, default: null },
    showTemplatePreview: { type: Boolean, default: false },
  },
  emits: [
    'select',
    'close',
    'show-details',
    'close-preview',
    'use-template',
    'back-to-list',
  ],
};
</script> 