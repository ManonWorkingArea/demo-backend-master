<template>
  <div class="taxonomy-selector">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-3">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-xs text-gray-600">กำลังโหลด...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded p-2">
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle text-red-600 mr-1 text-xs"></i>
        <span class="text-xs text-red-800">{{ error }}</span>
      </div>
      <button 
        @click="refreshTaxonomy" 
        class="mt-1 text-xs text-red-600 hover:text-red-700 underline"
      >
        ลองใหม่
      </button>
    </div>

    <!-- Taxonomy Groups -->
    <div v-else-if="taxonomyGroups.length > 0" class="space-y-3">
      <div 
        v-for="group in taxonomyGroups" 
        :key="group._id"
        class="bg-white border border-gray-200 rounded shadow-sm"
      >
        <!-- Group Header -->
        <div class="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <i class="fas fa-tags text-white text-sm"></i>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900">
                  {{ group.name }}
                  <span v-if="group.code" class="ml-2 text-xs text-gray-500 font-normal">({{ group.code }})</span>
                </h3>
                <p v-if="group.description" class="text-xs text-gray-600 mt-0.5">{{ group.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">
                {{ getSelectedTermsForGroup(group._id).length }}/{{ getTermsForGroup(group._id).length }}
              </span>
              <!-- Quick Add Term Button -->
              <button 
                @click="openQuickAddModal(group)"
                type="button"
                class="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                title="เพิ่ม Term ใหม่"
              >
                <i class="fas fa-plus text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="p-3">
          <!-- Search Box -->
          <div v-if="getTermsForGroup(group._id).length > 0" class="mb-2">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400 text-xs"></i>
              </div>
              <input
                v-model="searchQueries[group._id]"
                type="text"
                :placeholder="`ค้นหาใน ${group.name}...`"
                class="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Terms List -->
          <div class="terms-grid">
            <!-- Parent Terms with Children (each as a single card) -->
            <div 
              v-for="section in getTermsGrouped(group._id).parentSections" 
              :key="section.parent._id"
              class="terms-grid-item"
            >
              <!-- Parent Term -->
              <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
                <input
                  :type="getGroupSelectionMode(group) === 'single' ? 'radio' : 'checkbox'"
                  :name="getGroupSelectionMode(group) === 'single' ? `group-${group._id}` : undefined"
                  :checked="modelValue.includes(section.parent._id)"
                  @change="toggleTerm(section.parent._id, group._id)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div 
                  class="flex-1 min-w-0 cursor-pointer" 
                  @click="toggleTerm(section.parent._id, group._id)"
                >
                  <h4 class="text-sm font-semibold text-gray-900 truncate">
                    {{ section.parent.customData?.name || section.parent.customData?.ชื่อ || section.parent.name || 'ไม่มีชื่อ' }}
                  </h4>
                  <p v-if="section.parent.code || section.parent.customData?.รหัส" class="text-xs text-gray-500 truncate">
                    {{ section.parent.code || section.parent.customData?.รหัส }}
                  </p>
                </div>
                <!-- Selected indicator -->
                <div v-if="modelValue.includes(section.parent._id)" class="text-green-600">
                  <i class="fas fa-check-circle text-sm"></i>
                </div>
              </div>
              
              <!-- Sub Terms within the same card -->
              <div v-if="section.children.length > 0" class="pt-3">
                <div class="grid grid-cols-2 gap-1">
                  <div
                    v-for="childTerm in section.children"
                    :key="childTerm._id"
                    class="flex items-center gap-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <input
                      :type="getGroupSelectionMode(group) === 'single' ? 'radio' : 'checkbox'"
                      :name="getGroupSelectionMode(group) === 'single' ? `group-${group._id}` : undefined"
                      :checked="modelValue.includes(childTerm._id)"
                      @change="toggleTerm(childTerm._id, group._id)"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                    />
                    <div 
                      class="flex-1 min-w-0 cursor-pointer"
                      @click="toggleTerm(childTerm._id, group._id)"
                    >
                      <div class="text-sm font-semibold text-gray-800 truncate">
                        {{ childTerm.customData?.name || childTerm.customData?.ชื่อ || childTerm.name || 'ไม่มีชื่อ' }}
                      </div>
                      <div v-if="childTerm.code || childTerm.customData?.รหัส" class="text-xs text-gray-500 truncate">
                        {{ childTerm.code || childTerm.customData?.รหัส }}
                      </div>
                    </div>
                    <!-- Selected indicator for child -->
                    <div v-if="modelValue.includes(childTerm._id)" class="text-green-600 flex-shrink-0">
                      <i class="fas fa-check-circle text-sm"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Standalone Terms (no children) -->
            <div 
              v-for="term in getTermsGrouped(group._id).standaloneTerms"
              :key="term._id"
              class="terms-grid-item"
            >
              <div class="flex items-center gap-3">
                <input
                  :type="getGroupSelectionMode(group) === 'single' ? 'radio' : 'checkbox'"
                  :name="getGroupSelectionMode(group) === 'single' ? `group-${group._id}` : undefined"
                  :checked="modelValue.includes(term._id)"
                  @change="toggleTerm(term._id, group._id)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div 
                  class="flex-1 min-w-0 cursor-pointer"
                  @click="toggleTerm(term._id, group._id)"
                >
                  <h4 class="text-sm font-semibold text-gray-900 truncate">
                    {{ term.customData?.name || term.customData?.ชื่อ || term.name || 'ไม่มีชื่อ' }}
                  </h4>
                  <p v-if="term.code || term.customData?.รหัส" class="text-xs text-gray-500 truncate">
                    {{ term.code || term.customData?.รหัส }}
                  </p>
                </div>
                <!-- Selected indicator -->
                <div v-if="modelValue.includes(term._id)" class="text-green-600">
                  <i class="fas fa-check-circle text-sm"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="getTermsGrouped(group._id).parentSections.length === 0 && getTermsGrouped(group._id).standaloneTerms.length === 0" class="text-center py-4">
            <i class="fas fa-search text-gray-400 text-lg mb-1"></i>
            <p class="text-xs text-gray-500 mb-2">ไม่พบรายการ</p>
            <button 
              @click="openQuickAddModal(group)"
              type="button"
              class="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              เพิ่ม Term แรกในกลุ่มนี้
            </button>
          </div>

          <!-- Selected Terms for this Group -->
          <div v-if="getSelectedTermsForGroup(group._id).length > 0" class="mt-4 pt-3 border-t border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-700 flex items-center gap-2">
                <i class="fas fa-check-circle text-green-600"></i>
                รายการที่เลือก ({{ getSelectedTermsForGroup(group._id).length }})
              </h4>
              <button 
                @click="clearGroupSelections(group._id)"
                class="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                title="ล้างรายการในกลุ่มนี้"
              >
                <i class="fas fa-times mr-1"></i>
                ล้าง
              </button>
            </div>
            
            <!-- Tag Cloud for this group -->
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="termId in getSelectedTermsForGroup(group._id)" 
                :key="termId"
                class="group-tag-item inline-flex items-center gap-2 bg-white border border-green-300 rounded-full px-2.5 py-1 text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div class="flex items-center gap-1.5">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm font-medium text-gray-800">{{ getTermDisplayName(termId) }}</span>
                  <span v-if="getTermById(termId)?.code || getTermById(termId)?.customData?.รหัส" class="text-xs text-gray-500">
                    ({{ getTermById(termId)?.code || getTermById(termId)?.customData?.รหัส }})
                  </span>
                </div>
                <button 
                  @click="removeTerm(termId)"
                  class="ml-1 w-4 h-4 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200"
                  title="ลบ"
                >
                  <i class="fas fa-times text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-6">
      <i class="fas fa-tags text-gray-400 text-xl mb-2"></i>
      <h3 class="text-sm font-medium text-gray-900 mb-1">ไม่มี Taxonomy</h3>
      <p class="text-xs text-gray-500 mb-3">ยังไม่มี Taxonomy สำหรับ {{ contentTypeLabel || contentType }}</p>
      <button 
        @click="refreshTaxonomy" 
        class="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
      >
        <i class="fas fa-refresh mr-1"></i>
        รีเฟรช
      </button>
    </div>

    <!-- Global Summary (if there are selections across multiple groups) -->
    <div v-if="modelValue.length > 0 && taxonomyGroups.length > 1" class="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fas fa-list-check text-blue-600"></i>
          <span class="text-sm font-medium text-gray-700">
            สรุปรายการที่เลือกทั้งหมด: {{ modelValue.length }} รายการ
          </span>
        </div>
        <button 
          @click="clearAllSelections"
          class="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors duration-200 font-medium"
        >
          <i class="fas fa-times mr-1"></i>
          ล้างทั้งหมด
        </button>
      </div>
    </div>

    <!-- Quick Add Term Modal -->
    <div v-if="showQuickAddModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div class="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl min-w-[500px] max-w-[600px] border border-gray-200">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i class="fas fa-plus-circle text-green-600"></i>
            เพิ่ม Term ใหม่
          </h3>
          <button @click="closeQuickAddModal" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          <!-- Group Info -->
          <div v-if="selectedGroupForAdd" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2 text-blue-800">
              <i class="fas fa-tags"></i>
              <span class="font-medium">{{ selectedGroupForAdd.name }}</span>
              <span v-if="selectedGroupForAdd.code" class="text-blue-600 text-sm">({{ selectedGroupForAdd.code }})</span>
            </div>
            <p v-if="selectedGroupForAdd.description" class="text-blue-700 text-sm mt-1">{{ selectedGroupForAdd.description }}</p>
          </div>

          <!-- Quick Add Form -->
          <div class="space-y-4">
            <!-- Parent Term Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เป็น Sub Term ของ (ถ้ามี)</label>
              <div class="relative">
                <select v-model="quickAddForm.parentId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">-- เป็น Main Term (ไม่มี Parent) --</option>
                  <option 
                    v-for="parentTerm in getAvailableParentTerms()"
                    :key="parentTerm._id"
                    :value="parentTerm._id"
                  >
                    {{ parentTerm.customData?.name || parentTerm.customData?.ชื่อ || parentTerm.name || 'ไม่มีชื่อ' }}
                    <span v-if="parentTerm.code || parentTerm.customData?.รหัส"> ({{ parentTerm.code || parentTerm.customData?.รหัส }})</span>
                  </option>
                </select>
              </div>
            </div>

            <!-- Term Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ Term *
              </label>
              <input 
                v-model="quickAddForm.name" 
                type="text" 
                placeholder="ชื่อของ Term ใหม่"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                @keyup.enter="submitQuickAddTerm"
              />
            </div>

            <!-- Term Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                รหัส Term
              </label>
              <input 
                v-model="quickAddForm.code" 
                type="text" 
                placeholder="รหัสของ Term (ถ้ามี)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <small class="text-gray-500 text-xs mt-1">รหัสสำหรับอ้างอิง ไม่บังคับ</small>
            </div>

            <!-- Dynamic Custom Fields (if group has field config) -->
            <div v-if="selectedGroupForAdd && selectedGroupForAdd.fieldConfig && selectedGroupForAdd.fieldConfig.length > 0">
              <h4 class="text-sm font-medium text-gray-700 mb-2 pb-2 border-b border-gray-200">
                ฟิลด์เพิ่มเติม
              </h4>
              
              <div v-for="field in selectedGroupForAdd.fieldConfig" :key="field.key" class="mb-3">
                <!-- Input Field -->
                <div v-if="field.type === 'input'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500 ml-1">*</span>
                  </label>
                  <input 
                    v-model="quickAddForm.customData[field.key]"
                    type="text" 
                    :placeholder="field.label"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <!-- Textarea Field -->
                <div v-if="field.type === 'textarea'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500 ml-1">*</span>
                  </label>
                  <textarea 
                    v-model="quickAddForm.customData[field.key]"
                    rows="3"
                    :placeholder="field.label"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <!-- Select Field -->
                <div v-if="field.type === 'select'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500 ml-1">*</span>
                  </label>
                  <select 
                    v-model="quickAddForm.customData[field.key]"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- เลือก --</option>
                    <option 
                      v-for="option in field.options" 
                      :key="option.value" 
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <!-- Status Field -->
                <div v-if="field.type === 'status'">
                  <label class="flex items-center gap-2">
                    <input 
                      v-model="quickAddForm.customData[field.key]"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      true-value="true"
                      false-value="false"
                    />
                    <span class="text-sm font-medium text-gray-700">
                      {{ field.label }}
                      <span v-if="field.required" class="text-red-500 ml-1">*</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="quickAddLoading" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-blue-700 text-sm">กำลังเพิ่ม Term ใหม่...</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <button 
            @click="closeQuickAddModal" 
            :disabled="quickAddLoading"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button 
            @click="submitQuickAddTerm" 
            :disabled="quickAddLoading || !quickAddForm.name?.trim()"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-plus mr-1"></i>
            เพิ่ม Term
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTaxonomy } from '@/composables/useTaxonomy'
import toast from '@/plugins/ToastUI.js'

export default {
  name: 'TaxonomySelector',
  
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    contentType: {
      type: String,
      required: true
    },
    contentTypeLabel: {
      type: String,
      default: ''
    },
    maxSelections: {
      type: Number,
      default: null
    }
  },
  
  emits: ['update:modelValue'],
  
  setup(props, { emit }) {
    // ใช้ useTaxonomy composable ของตัวเองแทน
    const { 
      taxonomy, 
      getTermById, 
      getChildTerms: getChildTermsFromTaxonomy,
      loading,
      error
    } = useTaxonomy()
    
    // Debug logging
    console.log('TaxonomySelector setup - Content Type:', props.contentType)
    console.log('TaxonomySelector setup - Loading:', loading.value)
    console.log('TaxonomySelector setup - Error:', error.value)
    
    const searchQueries = ref({})
    const showQuickAddModal = ref(false)
    const quickAddLoading = ref(false)
    const selectedGroupForAdd = ref(null)
    
    // Quick Add Term form data
    const quickAddForm = ref({
      parentId: '',
      name: '',
      code: '',
      customData: {}
    })
    
    // Computed properties
    const taxonomyGroups = computed(() => {
      const groups = taxonomy.get(props.contentType)
      console.log('TaxonomySelector - Taxonomy Groups for', props.contentType, ':', groups)
      return groups
    })
    
    // Get group selection mode from taxonomy group configuration
    const getGroupSelectionMode = (group) => {
      return group.selectionMode || 'multiple'
    }
    
    // Get group selection limit from taxonomy group configuration
    const getGroupSelectionLimit = (group) => {
      return group.selectionLimit || 3
    }
    
    // Get terms for a specific group
    const getTermsForGroup = (groupId) => {
      const terms = taxonomy.getTerms(props.contentType).filter(term => term.taxonomy === groupId)
      console.log('TaxonomySelector - Terms for group', groupId, ':', terms)
      return terms
    }
    
    // Get root terms for a group (terms without parent)
    const getRootTermsForGroup = (groupId) => {
      return getTermsForGroup(groupId).filter(term => !term.parentId)
    }
    
    // Get child terms for a parent term
    const getChildTerms = (parentId) => {
      return getChildTermsFromTaxonomy(parentId)
    }
    
    // Get selected terms for a specific group
    const getSelectedTermsForGroup = (groupId) => {
      return props.modelValue.filter(termId => {
        const term = getTermById(termId)
        return term && term.taxonomy === groupId
      })
    }
    
    // Toggle term selection
    const toggleTerm = (termId, groupId) => {
      console.log('TaxonomySelector - Toggle term:', termId, 'in group:', groupId)
      const currentSelected = [...props.modelValue]
      const index = currentSelected.indexOf(termId)
      
      // Find the group to get selection mode
      const group = taxonomyGroups.value.find(g => g._id === groupId)
      if (!group) {
        console.warn('Group not found:', groupId)
        return
      }
      
      const selectionMode = getGroupSelectionMode(group)
      const selectionLimit = getGroupSelectionLimit(group)
      const selectedInGroup = getSelectedTermsForGroup(groupId)
      
      console.log('Selection mode:', selectionMode, 'Limit:', selectionLimit, 'Currently selected in group:', selectedInGroup.length)
      
      if (index === -1) {
        // Adding term
        let canAdd = true
        let message = ''
        
        if (selectionMode === 'single') {
          // Single selection mode: remove all other terms from the same group first
          const otherTermsInGroup = selectedInGroup.map(t => getTermById(t)?._id).filter(Boolean)
          otherTermsInGroup.forEach(id => {
            const idx = currentSelected.indexOf(id)
            if (idx !== -1) {
              currentSelected.splice(idx, 1)
              console.log('Removed other term in single mode:', id)
            }
          })
          // Add the new term
          currentSelected.push(termId)
          message = 'เลือกรายการใหม่ (โหมดเลือกได้หนึ่งรายการ)'
          
        } else if (selectionMode === 'limited') {
          // Limited selection mode: check if we've reached the limit for this group
          if (selectedInGroup.length >= selectionLimit) {
            canAdd = false
            message = `เลือกได้สูงสุด ${selectionLimit} รายการในกลุ่มนี้ กรุณาลบรายการเดิมก่อนเลือกใหม่`
            console.warn(`Selection limit reached for group ${groupId}: ${selectionLimit}`)
            
            toast({ 
              type: 'warning', 
              title: 'ถึงขีดจำกัดการเลือก',
              message: message, 
              autohide: true,
              duration: 4000
            })
          } else {
            currentSelected.push(termId)
            const remaining = selectionLimit - selectedInGroup.length - 1
            message = remaining > 0 
              ? `เลือกได้อีก ${remaining} รายการ` 
              : 'เลือกครบจำนวนสูงสุดแล้ว'
          }
          
        } else {
          // Multiple selection mode (default)
          // Check global max selections limit if specified
          if (props.maxSelections && currentSelected.length >= props.maxSelections) {
            canAdd = false
            message = `เลือกได้สูงสุด ${props.maxSelections} รายการทั้งหมด`
            console.warn('Global maximum selections reached:', props.maxSelections)
            
            toast({ 
              type: 'warning', 
              title: 'ถึงขีดจำกัดการเลือก',
              message: message, 
              autohide: true 
            })
          } else {
            currentSelected.push(termId)
            message = 'เพิ่มรายการเรียบร้อย'
          }
        }
        
        if (canAdd && message && selectionMode !== 'multiple') {
          toast({ 
            type: 'success', 
            message: message, 
            autohide: true,
            duration: 2000
          })
        }
        
      } else {
        // Removing term
        currentSelected.splice(index, 1)
        console.log('Removed term:', termId)
        
        if (selectionMode === 'limited') {
          const remaining = selectionLimit - getSelectedTermsForGroup(groupId).length + 1
          toast({ 
            type: 'info', 
            message: `ลบรายการแล้ว เลือกได้อีก ${remaining} รายการ`, 
            autohide: true,
            duration: 2000
          })
        }
      }
      
      console.log('TaxonomySelector - Emitting new selection:', currentSelected)
      emit('update:modelValue', currentSelected)
    }
    
    // Remove term from selection
    const removeTerm = (termId) => {
      const currentSelected = [...props.modelValue]
      const index = currentSelected.indexOf(termId)
      if (index !== -1) {
        currentSelected.splice(index, 1)
        emit('update:modelValue', currentSelected)
      }
    }
    
    // Get term display name
    const getTermDisplayName = (termId) => {
      const term = getTermById(termId)
      if (!term) return 'ไม่พบข้อมูล'
      
      // Try to get name from custom data
      if (term.customData) {
        return term.customData.name || term.customData.ชื่อ || term.name || 'ไม่มีชื่อ'
      }
      
      return term.name || 'ไม่มีชื่อ'
    }
    
    // Get term's group name
    const getTermGroupName = (termId) => {
      const term = getTermById(termId)
      if (!term) return ''
      
      const group = taxonomyGroups.value.find(g => g._id === term.taxonomy)
      return group ? group.name : 'ไม่ระบุกลุ่ม'
    }
    
    // Get group selection mode for a specific term
    const getGroupSelectionModeByTermId = (termId) => {
      const term = getTermById(termId)
      if (!term) return 'multiple'
      
      const group = taxonomyGroups.value.find(g => g._id === term.taxonomy)
      return group ? getGroupSelectionMode(group) : 'multiple'
    }
    
    // Clear all selections
    const clearAllSelections = () => {
      emit('update:modelValue', [])
      toast({ 
        type: 'success', 
        message: 'ล้างรายการที่เลือกทั้งหมดแล้ว', 
        autohide: true,
        duration: 2000
      })
    }
    
    // Clear selections for a specific group
    const clearGroupSelections = (groupId) => {
      const selectedInGroup = getSelectedTermsForGroup(groupId)
      const currentSelected = [...props.modelValue]
      
      // Remove all selected terms from this group
      selectedInGroup.forEach(termId => {
        const index = currentSelected.indexOf(termId)
        if (index !== -1) {
          currentSelected.splice(index, 1)
        }
      })
      
      emit('update:modelValue', currentSelected)
      
      // Find group name for toast message
      const group = taxonomyGroups.value.find(g => g._id === groupId)
      const groupName = group ? group.name : 'กลุ่มนี้'
      
      toast({ 
        type: 'success', 
        message: `ล้างรายการที่เลือกใน${groupName}แล้ว`, 
        autohide: true,
        duration: 2000
      })
    }
    
    // Refresh taxonomy data
    const refreshTaxonomy = async () => {
      console.log('TaxonomySelector - Refreshing taxonomy data...')
      // เรียกใช้ fetchTaxonomyData จาก composable
      if (taxonomy.fetchTaxonomyData) {
        await taxonomy.fetchTaxonomyData(true) // force refresh
      }
    }
    
    // Get terms organized by parent-child relationships
    const getTermsGrouped = (groupId) => {
      const allTerms = getTermsForGroup(groupId)
      console.log('getTermsGrouped - All terms for group', groupId, ':', allTerms)
      
      const query = searchQueries.value[groupId]
      
      // Filter by search if needed
      let filteredTerms = allTerms
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim()
        
        // Find all terms that match the search (both parent and child)
        const matchingTerms = allTerms.filter(term => {
          if (term.customData) {
            return Object.values(term.customData).some(value => {
              if (typeof value === 'string') {
                return value.toLowerCase().includes(searchTerm)
              }
              return false
            })
          }
          return false
        })
        
        // Include parent terms of matching child terms
        const matchingTermIds = new Set(matchingTerms.map(t => t._id))
        
        // Add parents of matching children
        matchingTerms.forEach(term => {
          if (term.parentId && !matchingTermIds.has(term.parentId)) {
            const parent = allTerms.find(t => t._id === term.parentId)
            if (parent) {
              matchingTerms.push(parent)
              matchingTermIds.add(parent._id)
            }
          }
        })
        
        // Add children of matching parents
        matchingTerms.forEach(term => {
          if (!term.parentId) { // if this is a parent term
            const children = allTerms.filter(t => t.parentId === term._id)
            children.forEach(child => {
              if (!matchingTermIds.has(child._id)) {
                matchingTerms.push(child)
                matchingTermIds.add(child._id)
              }
            })
          }
        })
        
        filteredTerms = matchingTerms
      }
      
      const rootTerms = filteredTerms.filter(term => !term.parentId)
      console.log('getTermsGrouped - Root terms:', rootTerms)
      
      const result = {
        parentSections: [], // Terms that have children
        standaloneTerms: [] // Terms that don't have children
      }
      
      rootTerms.forEach(rootTerm => {
        const children = filteredTerms.filter(term => term.parentId === rootTerm._id)
        console.log(`getTermsGrouped - Term "${rootTerm.name}" has ${children.length} children:`, children)
        
        if (children.length > 0) {
          // This root term has children, create a section
          result.parentSections.push({
            parent: rootTerm,
            children: children
          })
        } else {
          // This root term has no children, add to standalone
          result.standaloneTerms.push(rootTerm)
        }
      })
      
      console.log('getTermsGrouped - Final result:', result)
      return result
    }
    
    // Initialize on mount
    onMounted(() => {
      console.log('TaxonomySelector mounted for content type:', props.contentType)
      console.log('Initial loading state:', loading.value)
      console.log('Initial taxonomy groups:', taxonomyGroups.value)
    })
    
    // Open Quick Add Term modal
    const openQuickAddModal = (group) => {
      selectedGroupForAdd.value = group
      quickAddForm.value.parentId = ''
      quickAddForm.value.name = ''
      quickAddForm.value.code = ''
      quickAddForm.value.customData = {}
      showQuickAddModal.value = true
    }
    
    // Close Quick Add Term modal
    const closeQuickAddModal = () => {
      showQuickAddModal.value = false
    }
    
    // Get available parent terms for the select input in the Quick Add Term modal
    const getAvailableParentTerms = () => {
      const groupId = selectedGroupForAdd.value?._id
      if (!groupId) return []
      
      // Get all terms for the group
      const allTerms = getTermsForGroup(groupId)
      
      // Filter out terms that are already selected
      const selectedTermIds = new Set(props.modelValue)
      const availableTerms = allTerms.filter(term => !selectedTermIds.has(term._id))
      
      return availableTerms
    }
    
    // Submit Quick Add Term form
    const submitQuickAddTerm = async () => {
      if (quickAddLoading.value) return
      
      // Validate required fields
      if (!quickAddForm.value.name?.trim()) {
        toast({ 
          type: 'error', 
          message: 'กรุณากรอกชื่อ Term ใหม่', 
          autohide: true,
          duration: 3000
        })
        return
      }
      
      quickAddLoading.value = true
      const groupId = selectedGroupForAdd.value?._id
      const termData = {
        taxonomy: groupId,
        name: quickAddForm.value.name.trim(),
        code: quickAddForm.value.code?.trim() || '',
        parentId: quickAddForm.value.parentId || null,
        customData: quickAddForm.value.customData
      }
      
      try {
        // Call the API or composable function to add the new term
        const response = await taxonomy.addTerm(props.contentType, termData)
        console.log('Term added successfully:', response)
        
        // Update the modelValue with the new term ID
        emit('update:modelValue', [...props.modelValue, response._id])
        
        // Show success message
        toast({ 
          type: 'success', 
          message: 'เพิ่ม Term ใหม่เรียบร้อยแล้ว', 
          autohide: true,
          duration: 3000
        })
        
        // Close the modal
        closeQuickAddModal()
        
        // Refresh taxonomy data
        refreshTaxonomy()
        
      } catch (error) {
        console.error('Error adding term:', error)
        toast({ 
          type: 'error', 
          message: 'เกิดข้อผิดพลาดในการเพิ่ม Term ใหม่', 
          autohide: true,
          duration: 3000
        })
      } finally {
        quickAddLoading.value = false
      }
    }
    
    return {
      // Composable data
      taxonomy,
      loading,
      error,
      
      // Local state
      searchQueries,
      showQuickAddModal,
      quickAddLoading,
      selectedGroupForAdd,
      quickAddForm,
      
      // Computed
      taxonomyGroups,
      
      // Methods
      getTermById,
      getTermsForGroup,
      getRootTermsForGroup,
      getChildTerms,
      getSelectedTermsForGroup,
      toggleTerm,
      removeTerm,
      getTermDisplayName,
      getTermGroupName,
      getGroupSelectionMode,
      getGroupSelectionLimit,
      getGroupSelectionModeByTermId,
      clearAllSelections,
      clearGroupSelections,
      refreshTaxonomy,
      getTermsGrouped,
      openQuickAddModal,
      closeQuickAddModal,
      getAvailableParentTerms,
      submitQuickAddTerm
    }
  }
}
</script>

<style scoped>
.taxonomy-selector {
  @apply space-y-4;
}

/* Table-like grid layout */
.terms-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.terms-grid-item {
  background-color: white;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
  transition: background-color 0.2s ease;
}

.terms-grid-item:hover {
  background-color: #f9fafb;
}

.terms-grid-item:nth-child(2n) {
  border-right: none;
}

/* Tag Cloud Styles */
.tag-item {
  animation: fadeInScale 0.3s ease-out;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #d1fae5;
}

.tag-item:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Tag remove button animation */
.tag-item button:hover {
  transform: scale(1.1);
}

/* Simple card styling */
.bg-white.border.border-gray-200.rounded-lg.shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bg-white.border.border-gray-200.rounded-lg.shadow-sm:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Simple input styling */
input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Simple button styling */
button:hover {
  transition: all 0.2s ease;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Progress bar */
.transition-all {
  transition: all 0.3s ease;
}

/* Responsive grid */
@media (max-width: 640px) {
  .grid.grid-cols-1.md\\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Clean focus states */
button:focus, input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

/* Simple hover effects */
.hover\\:bg-red-50:hover {
  background-color: #fef2f2;
}

.hover\\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.hover\\:text-red-700:hover {
  color: #b91c1c;
}

/* Text truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Spacing */
.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

/* Minimal styling for clean look */
.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

/* Responsive tag cloud */
@media (max-width: 640px) {
  .tag-item {
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
  }
  
  .tag-item span:last-child {
    display: none; /* Hide group name on small screens */
  }
}

/* Modal styles */
.fixed.inset-0.bg-black.bg-opacity-50.backdrop-blur-sm {
  backdrop-filter: blur(10px);
}

.bg-white.rounded-lg.shadow-xl {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.p-4.border-b.border-gray-200 {
  border-bottom-width: 1px;
}

.p-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.rounded-t-lg {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.rounded-b-lg {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

/* Input and select styles in modal */
input:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Button styles in modal */
.bg-green-600 {
  background-color: #4caf50;
}

.bg-green-700 {
  background-color: #388e3c;
}

.text-green-600 {
  color: #4caf50;
}

.text-green-700 {
  color: #388e3c;
}

.hover\\:bg-green-700:hover {
  background-color: #388e3c;
}

.disabled\\:opacity-50 {
  opacity: 0.5;
}

.disabled\\:cursor-not-allowed {
  cursor: not-allowed;
}
</style>