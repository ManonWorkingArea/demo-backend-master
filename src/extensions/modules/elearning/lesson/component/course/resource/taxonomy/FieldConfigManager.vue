<template>
  <div v-if="visible" class="mt-4 p-3 border border-gray-200 rounded-lg bg-white">
    <div class="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
      <h4 class="text-sm font-medium text-gray-700">
        การตั้งค่าฟิลด์สำหรับ Terms
      </h4>
      <button @click="addFieldConfig" type="button" class="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
        เพิ่มฟิลด์
      </button>
    </div>
    
    <div v-if="fieldConfig.length === 0" class="text-center py-6 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
      <p class="text-sm text-gray-600 mb-2">ยังไม่มีฟิลด์เพิ่มเติม</p>
      <p class="text-xs text-gray-500">คลิก "เพิ่มฟิลด์" เพื่อสร้างฟิลด์แรกของคุณ</p>
    </div>
    
    <div v-else class="space-y-2">
      <div v-for="(field, index) in fieldConfig" :key="field.id" 
           class="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h5 class="font-medium text-gray-900 text-sm">{{ field.label }}</h5>
              <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                {{ field.key }}
              </span>
              <span v-if="field.required" class="text-red-500 text-xs">*</span>
              <span v-if="field.unique" class="text-orange-600 text-xs">(ไม่ซ้ำ)</span>
            </div>
            <div class="text-xs text-gray-600">
              <span class="font-medium">ประเภท:</span> {{ getFieldTypeLabel(field.type) }}
              <span v-if="field.type === 'select' && field.options.length > 0" class="ml-3">
                <span class="font-medium">ตัวเลือก:</span> {{ field.options.map(o => o.label).join(', ') }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1 ml-3">
            <!-- Move Up Button -->
            <button v-if="index > 0" @click="moveFieldUp(index)" 
                    class="p-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    title="ย้ายขึ้น">
              <i class="fas fa-chevron-up text-xs"></i>
            </button>
            <!-- Move Down Button -->
            <button v-if="index < fieldConfig.length - 1" @click="moveFieldDown(index)" 
                    class="p-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    title="ย้ายลง">
              <i class="fas fa-chevron-down text-xs"></i>
            </button>
            <!-- Edit Button -->
            <button @click="editFieldConfig(field)" 
                    class="p-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded transition-colors"
                    title="แก้ไข">
              <i class="fas fa-edit text-xs"></i>
            </button>
            <!-- Delete Button -->
            <button @click="removeFieldConfig(field.id)" 
                    class="p-1 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                    title="ลบ">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Field Configuration Modal -->
    <div v-if="showFieldConfigModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div class="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl min-w-[500px] max-w-[600px] border border-gray-200">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <h3 class="text-sm font-semibold text-gray-900">
            {{ editingFieldId ? 'แก้ไขฟิลด์' : 'เพิ่มฟิลด์ใหม่' }}สำหรับ Terms
          </h3>
          <button @click="closeFieldConfigModal" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-4 max-h-[70vh] overflow-y-auto">
          <div class="space-y-3">
            <!-- Field Label -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ชื่อฟิลด์ *
              </label>
              <input 
                v-model="fieldConfigForm.label" 
                type="text" 
                placeholder="เช่น รูปภาพ, คำอธิบาย, สถานะ"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Field Key -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Key (สำหรับระบบ) *
              </label>
              <input 
                v-model="fieldConfigForm.key" 
                type="text" 
                placeholder="เช่น image, description, status (ภาษาอังกฤษ ไม่มีช่องว่าง)"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              <small class="text-gray-500 text-xs mt-1">
                ใช้เป็น key สำหรับเก็บข้อมูล ควรเป็นภาษาอังกฤษ
              </small>
            </div>

            <!-- Field Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ประเภทฟิลด์ *
              </label>
              <select v-model="fieldConfigForm.type" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="input">Input - ช่องกรอกข้อความ</option>
                <option value="textarea">Textarea - ช่องกรอกข้อความหลายบรรทัด</option>
                <option value="select">Select - ตัวเลือก Dropdown</option>
                <option value="status">Status - True/False</option>
                <option value="image">Image - รูปภาพ</option>
              </select>
            </div>

            <!-- Options for Select type -->
            <div v-if="fieldConfigForm.type === 'select'" class="border border-gray-200 rounded-md p-3 bg-gray-50">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ตัวเลือก:
              </label>
              <div v-for="(option, index) in fieldConfigForm.options" :key="index" 
                   class="flex gap-2 mb-2 items-center">
                <input 
                  v-model="option.label" 
                  type="text" 
                  placeholder="ป้ายกำกับ (ที่ผู้ใช้เห็น)"
                  class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <input 
                  v-model="option.value" 
                  type="text" 
                  placeholder="ค่า (ที่เก็บในระบบ)"
                  class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
                <button @click="removeSelectOption(index)" 
                        class="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors">
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
              <button @click="addSelectOption" type="button" 
                      class="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                เพิ่มตัวเลือก
              </button>
            </div>

            <!-- Field Options -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Required Field -->
              <div class="flex items-center p-2 border border-gray-200 rounded-md bg-red-50">
                <input 
                  v-model="fieldConfigForm.required" 
                  type="checkbox" 
                  class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mr-2"
                />
                <div>
                  <label class="font-medium text-gray-900 text-sm">
                    ฟิลด์บังคับ (Required)
                  </label>
                  <small class="text-gray-600 text-xs block">ผู้ใช้จะต้องกรอกข้อมูลในฟิลด์นี้</small>
                </div>
              </div>

              <!-- Unique Field -->
              <div class="flex items-center p-2 border border-gray-200 rounded-md bg-orange-50">
                <input 
                  v-model="fieldConfigForm.unique" 
                  type="checkbox" 
                  class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mr-2"
                />
                <div>
                  <label class="font-medium text-gray-900 text-sm">
                    ข้อมูลไม่ซ้ำ (Unique)
                  </label>
                  <small class="text-gray-600 text-xs block">ระบบจะเช็คว่าข้อมูลในฟิลด์นี้ไม่ซ้ำกันในกลุ่ม taxonomy เดียวกัน</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end gap-2 p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <button @click="closeFieldConfigModal" class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium">
            ยกเลิก
          </button>
          <button @click="saveFieldConfig" class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            {{ editingFieldId ? 'บันทึกการแก้ไข' : 'เพิ่มฟิลด์' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import toast from '@/plugins/ToastUI.js'
import dialog from '@/plugins/Dialog.js'

export default {
  name: 'FieldConfigManager',
  
  props: {
    fieldConfig: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: true
    }
  },

  emits: ['update:fieldConfig'],

  setup(props, { emit }) {
    const showFieldConfigModal = ref(false)
    const editingFieldId = ref(null)
    const fieldConfigForm = ref({
      type: 'input',
      label: '',
      key: '',
      required: false,
      unique: false,
      options: []
    })

    const getFieldTypeLabel = (type) => {
      const labels = {
        input: 'ช่องกรอกข้อความ',
        textarea: 'ช่องกรอกข้อความหลายบรรทัด', 
        select: 'ตัวเลือก Dropdown',
        status: 'สถานะ True/False',
        image: 'รูปภาพ'
      }
      return labels[type] || type
    }

    const addFieldConfig = () => {
      fieldConfigForm.value = {
        type: 'input',
        label: '',
        key: '',
        required: false,
        unique: false,
        options: []
      }
      editingFieldId.value = null
      showFieldConfigModal.value = true
    }

    const saveFieldConfig = () => {
      if (!fieldConfigForm.value.label.trim() || !fieldConfigForm.value.key.trim()) {
        toast({ type: 'error', message: 'กรุณากรอกชื่อฟิลด์และ Key', autohide: true })
        return
      }

      // Check for duplicate keys (exclude current editing field)
      const isDuplicateKey = props.fieldConfig.some(f => 
        f.key === fieldConfigForm.value.key.trim() && f.id !== editingFieldId.value
      )
      
      if (isDuplicateKey) {
        toast({ type: 'error', message: 'Key ซ้ำ กรุณาใช้ Key อื่น', autohide: true })
        return
      }

      if (editingFieldId.value) {
        // Update existing field
        const updatedConfig = props.fieldConfig.map(f => 
          f.id === editingFieldId.value 
            ? {
                ...fieldConfigForm.value,
                label: fieldConfigForm.value.label.trim(),
                key: fieldConfigForm.value.key.trim(),
                id: editingFieldId.value
              }
            : f
        )
        emit('update:fieldConfig', updatedConfig)
        toast({ type: 'success', message: 'แก้ไขฟิลด์สำเร็จ', autohide: true })
      } else {
        // Add new field
        const newField = {
          ...fieldConfigForm.value,
          label: fieldConfigForm.value.label.trim(),
          key: fieldConfigForm.value.key.trim(),
          id: Date.now() // temporary ID for frontend
        }

        const updatedConfig = [...props.fieldConfig, newField]
        emit('update:fieldConfig', updatedConfig)
        toast({ type: 'success', message: 'เพิ่มฟิลด์สำเร็จ', autohide: true })
      }
      
      closeFieldConfigModal()
    }

    const removeFieldConfig = (fieldId) => {
      const field = props.fieldConfig.find(f => f.id === fieldId)
      const fieldName = field ? field.label : 'ฟิลด์นี้'
      
      dialog.confirm({
        title: 'ยืนยันการลบฟิลด์',
        message: `คุณแน่ใจหรือไม่ที่จะลบฟิลด์ "${fieldName}"?`,
        confirm: () => {
          const updatedConfig = props.fieldConfig.filter(f => f.id !== fieldId)
          emit('update:fieldConfig', updatedConfig)
          toast({ type: 'success', message: `ลบฟิลด์ "${fieldName}" สำเร็จ`, autohide: true })
        },
        cancel: () => {
          // ไม่ทำอะไร
        }
      })
    }

    const closeFieldConfigModal = () => {
      showFieldConfigModal.value = false
      editingFieldId.value = null
      fieldConfigForm.value = {
        type: 'input',
        label: '',
        key: '',
        required: false,
        unique: false,
        options: []
      }
    }

    const addSelectOption = () => {
      fieldConfigForm.value.options.push({ label: '', value: '' })
    }

    const removeSelectOption = (index) => {
      fieldConfigForm.value.options.splice(index, 1)
    }

    const moveFieldUp = (index) => {
      if (index > 0) {
        const updatedConfig = [...props.fieldConfig]
        const temp = updatedConfig[index]
        updatedConfig[index] = updatedConfig[index - 1]
        updatedConfig[index - 1] = temp
        emit('update:fieldConfig', updatedConfig)
        toast({ type: 'success', message: 'ย้ายฟิลด์ขึ้นสำเร็จ', autohide: true })
      }
    }

    const moveFieldDown = (index) => {
      if (index < props.fieldConfig.length - 1) {
        const updatedConfig = [...props.fieldConfig]
        const temp = updatedConfig[index]
        updatedConfig[index] = updatedConfig[index + 1]
        updatedConfig[index + 1] = temp
        emit('update:fieldConfig', updatedConfig)
        toast({ type: 'success', message: 'ย้ายฟิลด์ลงสำเร็จ', autohide: true })
      }
    }

    const editFieldConfig = (field) => {
      fieldConfigForm.value = {
        type: field.type,
        label: field.label,
        key: field.key,
        required: field.required,
        unique: field.unique,
        options: field.options.map(o => ({ ...o }))
      }
      editingFieldId.value = field.id
      showFieldConfigModal.value = true
    }

    return {
      showFieldConfigModal,
      editingFieldId,
      fieldConfigForm,
      getFieldTypeLabel,
      addFieldConfig,
      saveFieldConfig,
      removeFieldConfig,
      closeFieldConfigModal,
      addSelectOption,
      removeSelectOption,
      moveFieldUp,
      moveFieldDown,
      editFieldConfig
    }
  }
}
</script>

<style scoped>
/* Component-specific styles if needed */
</style> 