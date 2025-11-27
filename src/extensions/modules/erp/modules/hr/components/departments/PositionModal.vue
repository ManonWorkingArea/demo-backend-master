<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="bg-purple-600 text-white px-6 py-4 rounded-t-lg">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          <i class="fas fa-briefcase"></i>
          {{ isEditMode ? 'แก้ไขตำแหน่ง' : 'เพิ่มตำแหน่งใหม่' }}
        </h2>
      </div>
      
      <!-- Body -->
      <div class="p-6">
        <form @submit.prevent="handleSubmit">
          <!-- Select Position -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              เลือกตำแหน่ง <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.position_id"
              @change="onPositionChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">-- เลือกตำแหน่ง --</option>
              <option 
                v-for="position in availablePositions" 
                :key="position._id || position.id" 
                :value="position._id || position.id"
              >
                {{ position.code }} - {{ position.name }}
              </option>
            </select>
          </div>
          
          <!-- Position Details (Read-only preview) -->
          <div v-if="selectedPosition" class="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">ข้อมูลตำแหน่ง</h3>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-500">รหัส:</span>
                <p class="text-gray-900 font-medium">{{ selectedPosition.code }}</p>
              </div>
              <div>
                <span class="text-gray-500">ชื่อตำแหน่ง:</span>
                <p class="text-gray-900 font-medium">{{ selectedPosition.name }}</p>
              </div>
              <div v-if="selectedPosition.level">
                <span class="text-gray-500">ระดับ:</span>
                <p class="text-gray-900 font-medium">{{ getLevelText(selectedPosition.level) }}</p>
              </div>
              <div v-if="selectedPosition.description" class="col-span-3">
                <span class="text-gray-500">คำอธิบาย:</span>
                <p class="text-gray-900">{{ selectedPosition.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- Initial Permissions Setup -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ตั้งค่าสิทธิ์เริ่มต้น (สามารถปรับแก้ได้ภายหลัง)
            </label>
            
            <div v-if="groupedPermissions.length === 0" class="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded">
              แผนกนี้ยังไม่มีสิทธิ์เข้าถึงเมนูใดๆ
            </div>
            
            <!-- Accordion for each module -->
            <div v-else class="space-y-2">
              <div
                v-for="group in groupedPermissions"
                :key="group.module"
                class="border border-gray-200 rounded-lg overflow-hidden"
              >
                <!-- Module Header (Accordion Toggle) -->
                <button
                  type="button"
                  @click="toggleModule(group.module)"
                  class="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                      <i :class="`fas fa-${getModuleIcon(group.module)}`"></i>
                    </div>
                    <div class="text-left">
                      <h4 class="font-semibold text-gray-900">{{ getModuleName(group.module) }}</h4>
                      <p class="text-xs text-gray-600">{{ group.permissions.length }} เมนู</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">
                      {{ countModulePermissions(group.module) }}/{{ group.permissions.length }} เลือก
                    </span>
                    <i 
                      :class="expandedModules.includes(group.module) ? 'fa-chevron-up' : 'fa-chevron-down'" 
                      class="fas text-gray-400"
                    ></i>
                  </div>
                </button>
                
                <!-- Module Menus (Expandable Content) -->
                <div 
                  v-show="expandedModules.includes(group.module)"
                  class="p-4 bg-white"
                >
                  <!-- Select All / Deselect All -->
                  <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <span class="text-sm font-medium text-gray-700">เลือกเมนู</span>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        @click="selectAllType(group.module, 'read')"
                        class="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded"
                      >
                        <i class="fas fa-eye mr-1"></i>อ่านทั้งหมด
                      </button>
                      <button
                        type="button"
                        @click="selectAllType(group.module, 'write')"
                        class="text-xs text-yellow-600 hover:text-yellow-800 px-2 py-1 hover:bg-yellow-50 rounded"
                      >
                        <i class="fas fa-edit mr-1"></i>แก้ไขทั้งหมด
                      </button>
                      <div class="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                      <button
                        type="button"
                        @click="selectAllMenus(group.module, true)"
                        class="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 hover:bg-purple-50 rounded"
                      >
                        <i class="fas fa-check-double mr-1"></i>เลือกทั้งหมด
                      </button>
                      <button
                        type="button"
                        @click="selectAllMenus(group.module, false)"
                        class="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        <i class="fas fa-times mr-1"></i>ยกเลิกทั้งหมด
                      </button>
                    </div>
                  </div>
                  
                  <!-- Menus in 3 columns -->
                  <div class="grid grid-cols-3 gap-3">
                    <div
                      v-for="perm in group.permissions"
                      :key="`${perm.module}_${perm.menu_key}`"
                      class="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors"
                    >
                      <div class="mb-2">
                        <p class="text-sm font-medium text-gray-900 mb-1">{{ perm.menu_title }}</p>
                      </div>
                      
                      <div class="flex flex-row flex-wrap gap-3">
                        <!-- Read Permission -->
                        <label class="flex items-center gap-1.5 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            :checked="getPermissionValue(perm, 'read')"
                            @change="updatePermissionValue(perm, 'read', $event.target.checked)"
                            class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span class="text-xs text-gray-700 group-hover:text-blue-700 whitespace-nowrap">
                            <i class="fas fa-eye text-blue-600 mr-0.5"></i> อ่าน
                          </span>
                        </label>
                        
                        <!-- Write Permission -->
                        <label class="flex items-center gap-1.5 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            :checked="getPermissionValue(perm, 'write')"
                            @change="updatePermissionValue(perm, 'write', $event.target.checked)"
                            class="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                          />
                          <span class="text-xs text-gray-700 group-hover:text-yellow-700 whitespace-nowrap">
                            <i class="fas fa-edit text-yellow-600 mr-0.5"></i> แก้ไข
                          </span>
                        </label>
                        
                        <!-- Visible Toggle -->
                        <label class="flex items-center gap-1.5 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            :checked="getPermissionValue(perm, 'visible')"
                            @change="updatePermissionValue(perm, 'visible', $event.target.checked)"
                            class="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span class="text-xs text-gray-700 group-hover:text-green-700 whitespace-nowrap">
                            <i class="fas fa-eye text-green-600 mr-0.5"></i> แสดง
                          </span>
                        </label>
                      </div>

                      <!-- Submenus -->
                      <div v-if="perm.children && perm.children.length > 0" class="mt-3 pt-3 border-t border-gray-200 space-y-3">
                        <div v-for="child in perm.children" :key="child.menu_key" class="bg-white rounded p-2 border border-gray-100">
                          <p class="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <i class="fas fa-level-up-alt fa-rotate-90 text-gray-400"></i>
                            {{ child.menu_title }}
                          </p>
                          <div class="flex flex-row flex-wrap gap-3 pl-4">
                            <!-- Child Read -->
                            <label class="flex items-center gap-1.5 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                :checked="getPermissionValue(child, 'read')"
                                @change="updatePermissionValue(child, 'read', $event.target.checked)"
                                class="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span class="text-[10px] text-gray-600 group-hover:text-blue-700 whitespace-nowrap">
                                อ่าน
                              </span>
                            </label>
                            
                            <!-- Child Write -->
                            <label class="flex items-center gap-1.5 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                :checked="getPermissionValue(child, 'write')"
                                @change="updatePermissionValue(child, 'write', $event.target.checked)"
                                class="w-3.5 h-3.5 text-yellow-600 rounded focus:ring-yellow-500"
                              />
                              <span class="text-[10px] text-gray-600 group-hover:text-yellow-700 whitespace-nowrap">
                                แก้ไข
                              </span>
                            </label>
                            
                            <!-- Child Visible -->
                            <label class="flex items-center gap-1.5 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                :checked="getPermissionValue(child, 'visible')"
                                @change="updatePermissionValue(child, 'visible', $event.target.checked)"
                                class="w-3.5 h-3.5 text-green-600 rounded focus:ring-green-500"
                              />
                              <span class="text-[10px] text-gray-600 group-hover:text-green-700 whitespace-nowrap">
                                แสดง
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button"
              @click="$emit('close')"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-times mr-2"></i>
              ยกเลิก
            </button>
            <button 
              type="submit"
              :disabled="!formData.position_id"
              class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-check mr-2"></i>
              {{ isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มตำแหน่ง' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PositionModal',
  
  props: {
    node: {
      type: Object,
      default: null
    },
    availablePositions: {
      type: Array,
      default: () => []
    },
    departmentPermissions: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      formData: {
        position_id: '',
        permissions: {}
      },
      expandedModules: [] // Modules that are expanded in accordion
    }
  },
  
  computed: {
    isEditMode() {
      return !!this.node
    },
    
    selectedPosition() {
      if (!this.formData.position_id) return null
      return this.availablePositions.find(
        p => (p._id || p.id) === this.formData.position_id
      )
    },
    
    groupedPermissions() {
      // Group permissions by module
      const groups = {}
      
      console.log('📊 [groupedPermissions] departmentPermissions:', this.departmentPermissions)
      console.log('📊 [groupedPermissions] departmentPermissions.length:', this.departmentPermissions.length)
      
      this.departmentPermissions.forEach(perm => {
        console.log('📊 [groupedPermissions] Processing perm:', perm)
        if (!groups[perm.module]) {
          groups[perm.module] = {
            module: perm.module,
            permissions: []
          }
        }
        groups[perm.module].permissions.push(perm)
      })
      
      const result = Object.values(groups)
      console.log('📊 [groupedPermissions] Grouped result:', result)
      console.log('📊 [groupedPermissions] Result length:', result.length)
      
      return result
    }
  },
  
  mounted() {
    console.log('🔧 [PositionModal] Mounted')
    console.log('🔧 [PositionModal] departmentPermissions:', this.departmentPermissions)
    console.log('🔧 [PositionModal] availablePositions:', this.availablePositions)
    
    this.initializeForm()
    
    console.log('🔧 [PositionModal] groupedPermissions:', this.groupedPermissions)
    console.log('🔧 [PositionModal] formData.permissions:', this.formData.permissions)
    
    // Auto-expand first module
    if (this.groupedPermissions.length > 0) {
      this.expandedModules = [this.groupedPermissions[0].module]
      console.log('🔧 [PositionModal] Auto-expanded module:', this.expandedModules)
    } else {
      console.warn('⚠️ [PositionModal] No grouped permissions found')
    }
  },
  
  methods: {
    initializeForm() {
      // Initialize permissions object using Vue.set for reactivity
      const permissions = {}
      
      this.departmentPermissions.forEach(perm => {
        const key = this.getPermKey(perm)
        permissions[key] = {
          module: perm.module,
          menu_key: perm.menu_key,
          menu_title: perm.menu_title,
          read: false,
          write: false,
          visible: true
        }
      })
      
      // Set all at once
      this.formData.permissions = permissions
      
      // If editing, load existing data
      if (this.isEditMode) {
        this.formData.position_id = this.node.position_id
        
        // Load existing permissions
        if (this.node.permissions && Array.isArray(this.node.permissions)) {
          this.node.permissions.forEach(perm => {
            const key = this.getPermKey(perm)
            if (this.formData.permissions[key]) {
              // Ensure all boolean values are properly loaded
              this.formData.permissions[key] = {
                module: perm.module,
                menu_key: perm.menu_key,
                menu_title: perm.menu_title,
                read: !!perm.read,
                write: !!perm.write,
                visible: perm.visible !== undefined ? !!perm.visible : true
              }
            }
          })
        }
      }
    },
    
    getPermKey(perm) {
      return `${perm.module}_${perm.menu_key}`
    },
    
    onPositionChange() {
      // Reset permissions when position changes (except in edit mode)
      if (!this.isEditMode) {
        const permissions = {}
        this.departmentPermissions.forEach(perm => {
          const key = this.getPermKey(perm)
          permissions[key] = {
            module: perm.module,
            menu_key: perm.menu_key,
            menu_title: perm.menu_title,
            read: false,
            write: false,
            visible: true
          }
        })
        this.formData.permissions = permissions
      }
    },
    
    getPermissionValue(perm, type) {
      const key = this.getPermKey(perm)
      const permData = this.formData.permissions[key]
      return permData ? permData[type] : false
    },
    
    updatePermissionValue(perm, type, value) {
      const key = this.getPermKey(perm)
      if (this.formData.permissions[key]) {
        this.formData.permissions[key][type] = value
        
        const p = this.formData.permissions[key]
        
        if (type === 'visible') {
          if (value) {
            p.read = true
            p.write = true
          } else {
            p.read = false
            p.write = false
          }
        } else {
          // Handle read/write changes
          if (type === 'write' && value) {
            p.read = true
          }
          
          if (p.read || p.write) {
            p.visible = true
          } else {
            p.visible = false
          }
        }
      }
    },
    
    toggleModule(moduleName) {
      const index = this.expandedModules.indexOf(moduleName)
      if (index > -1) {
        this.expandedModules.splice(index, 1)
      } else {
        this.expandedModules.push(moduleName)
      }
    },
    
    selectAllType(moduleName, type) {
      const group = this.groupedPermissions.find(g => g.module === moduleName)
      if (!group) return
      
      group.permissions.forEach(perm => {
        const key = this.getPermKey(perm)
        if (this.formData.permissions[key]) {
          const p = this.formData.permissions[key]
          
          if (type === 'read') {
             p.read = true
             p.visible = true
          } else if (type === 'write') {
             p.write = true
             p.read = true
             p.visible = true
          }
        }
      })
    },
    
    selectAllMenus(moduleName, select) {
      const group = this.groupedPermissions.find(g => g.module === moduleName)
      if (!group) return
      
      group.permissions.forEach(perm => {
        const key = this.getPermKey(perm)
        if (this.formData.permissions[key]) {
          if (select) {
            this.formData.permissions[key].read = true
            this.formData.permissions[key].write = true
            this.formData.permissions[key].visible = true
          } else {
            this.formData.permissions[key].read = false
            this.formData.permissions[key].write = false
            this.formData.permissions[key].visible = false
            this.formData.permissions[key].visible = false
          }
        }
      })
    },
    
    countModulePermissions(moduleName) {
      const group = this.groupedPermissions.find(g => g.module === moduleName)
      if (!group) return 0
      
      let count = 0
      group.permissions.forEach(perm => {
        const key = this.getPermKey(perm)
        const permData = this.formData.permissions[key]
        if (permData && (permData.read || permData.write)) {
          count++
        }
      })
      return count
    },
    
    getModuleIcon(moduleKey) {
      const icons = {
        hr: 'users',
        accounting: 'calculator',
        sales: 'shopping-cart',
        inventory: 'boxes',
        purchase: 'shopping-bag',
        finance: 'money-bill-wave',
        delivery: 'truck',
        production: 'industry'
      }
      return icons[moduleKey] || 'folder'
    },
    
    getModuleName(moduleKey) {
      const names = {
        hr: 'ทรัพยากรบุคคล',
        accounting: 'บัญชี',
        sales: 'การขาย',
        inventory: 'คลังสินค้า',
        purchase: 'จัดซื้อ',
        finance: 'การเงิน',
        delivery: 'จัดส่ง',
        production: 'การผลิต'
      }
      return names[moduleKey] || moduleKey
    },
    
    getLevelText(level) {
      const texts = {
        executive: 'Executive',
        director: 'Director',
        manager: 'Manager',
        supervisor: 'Supervisor',
        staff: 'Staff'
      }
      return texts[level] || level
    },
    
    handleSubmit() {
      if (!this.selectedPosition) {
        this.$swal?.fire('ผิดพลาด!', 'กรุณาเลือกตำแหน่ง', 'error')
        return
      }
      
      // Convert permissions object to array (include ALL permissions, not just read/write)
      // This ensures visible=false is saved correctly
      const permissions = Object.values(this.formData.permissions)
      
      console.log('📤 [PositionModal] Submitting permissions:', permissions)
      console.log('📤 [PositionModal] Total permissions:', permissions.length)
      console.log('📤 [PositionModal] Sample permission:', permissions[0])
      
      const nodeData = {
        position_id: this.formData.position_id,
        position_code: this.selectedPosition.code,
        position_name: this.selectedPosition.name,
        level: this.selectedPosition.level,
        permissions: permissions
      }
      
      // ⭐ เก็บ db_id ถ้าเป็นการ edit (มี node.db_id อยู่แล้ว)
      if (this.isEditMode && this.node.db_id) {
        nodeData.db_id = this.node.db_id
        console.log('📤 [PositionModal] Edit mode - preserving db_id:', nodeData.db_id)
      }
      
      this.$emit('save', nodeData)
    }
  }
}
</script>

<style scoped>
/* Modal overlay animation */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
