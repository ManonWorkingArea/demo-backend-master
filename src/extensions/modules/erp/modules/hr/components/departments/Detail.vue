<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
        <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!department" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลแผนก</h2>
        <p class="text-gray-600 mb-4">แผนกที่คุณค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <button 
          @click="goBack"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          กลับไปรายการแผนก
        </button>
      </div>
    </div>

    <!-- Detail Content -->
    <div v-else>
      <!-- Header Section -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <i class="fas fa-sitemap text-indigo-500"></i>
                รายละเอียดแผนก
              </h1>
              <p class="mt-2 text-gray-600">ข้อมูลแผนกและพนักงานในสังกัด</p>
            </div>
            <div class="flex space-x-3">
              <button 
                @click="goBack"
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <i class="fas fa-arrow-left mr-2"></i>
                กลับ
              </button>
              <button 
                @click="editDepartment"
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <i class="fas fa-edit mr-2"></i>
                แก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Basic Information Card -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <i class="fas fa-info-circle text-blue-500"></i>
                ข้อมูลพื้นฐาน
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">รหัสแผนก</label>
                  <p class="text-lg font-semibold text-gray-900">{{ department.code }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">ชื่อแผนก</label>
                  <p class="text-lg font-semibold text-gray-900">{{ department.name }}</p>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-500 mb-1">คำอธิบาย</label>
                  <p class="text-gray-900">{{ department.description || 'ไม่มีคำอธิบาย' }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">สถานะ</label>
                  <span 
                    :class="department.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    <i :class="department.status === 'active' ? 'fa-check-circle' : 'fa-times-circle'" class="fas mr-2"></i>
                    {{ department.status === 'active' ? 'ใช้งาน' : 'ระงับการใช้งาน' }}
                  </span>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1">จำนวนพนักงาน</label>
                  <p class="text-lg font-semibold text-gray-900">
                    <i class="fas fa-users text-gray-400 mr-2"></i>
                    {{ department.employees_count || 0 }} คน
                  </p>
                </div>
              </div>
            </div>

            <!-- Module Access Card -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <i class="fas fa-shield-alt text-green-500"></i>
                สิทธิ์การเข้าถึงโมดูล
              </h2>

              <div v-if="moduleAccess.length === 0" class="text-center py-8 text-gray-500">
                <i class="fas fa-lock text-4xl mb-3"></i>
                <p>ไม่มีสิทธิ์เข้าถึงโมดูลใดๆ</p>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="module in moduleAccess"
                  :key="module.module"
                  class="border-2 border-green-500 bg-green-50 rounded-lg overflow-hidden"
                >
                  <!-- Module Header -->
                  <div class="p-4 bg-green-100 border-b border-green-200">
                    <div class="flex items-center gap-3">
                      <div class="bg-green-500 text-white w-12 h-12 rounded-lg flex items-center justify-center">
                        <i :class="`fas fa-${getModuleIcon(module.module)}`"></i>
                      </div>
                      <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">{{ getModuleName(module.module) }}</h3>
                        <p class="text-sm text-gray-600">{{ getModuleDescription(module.module) }}</p>
                      </div>
                      <div class="text-sm text-gray-600">
                        <i class="fas fa-check-circle text-green-600 mr-1"></i>
                        {{ getModuleMenuCount(module) }} เมนู
                      </div>
                    </div>
                  </div>

                  <!-- Module Menus -->
                  <div class="p-4">
                    <div v-if="getGrantedMenus(module).length > 0" class="space-y-2">
                      <div class="text-sm font-medium text-gray-700 mb-3">เมนูที่สามารถเข้าถึง:</div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div
                          v-for="menu in getGrantedMenus(module)"
                          :key="menu.key"
                          class="flex flex-col bg-white p-2 rounded border border-gray-200"
                        >
                          <div class="flex items-center gap-2 text-sm text-gray-700">
                            <i :class="`fas fa-${menu.icon} text-gray-400`"></i>
                            <span>{{ menu.title }}</span>
                          </div>
                          
                          <!-- Submenus Display -->
                          <div v-if="menu.children && menu.children.length > 0" class="mt-2 pl-6 space-y-1 border-l-2 border-gray-100 ml-1">
                            <div 
                              v-for="child in menu.children" 
                              :key="child.key"
                              class="text-xs text-gray-500 flex items-center gap-1"
                            >
                              <i class="fas fa-circle text-[6px] text-gray-300"></i>
                              {{ child.title }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-500 italic">
                      ไม่มีข้อมูลเมนูย่อย
                    </div>
                  </div>

                  <!-- Access Info -->
                  <div v-if="module.granted_at" class="px-4 pb-3">
                    <div class="text-xs text-gray-500">
                      <i class="fas fa-clock mr-1"></i>
                      ให้สิทธิ์เมื่อ: {{ formatDate(module.granted_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Organization Chart Section -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <i class="fas fa-sitemap text-purple-500"></i>
                  ผังองค์กร
                </h2>
                <div class="flex gap-2">
                  <button 
                    @click="addRootPosition"
                    class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center"
                  >
                    <i class="fas fa-plus mr-2"></i>
                    เพิ่มตำแหน่งหัวหน้า
                  </button>
                  <button 
                    @click="saveOrganizationChart"
                    :disabled="saving"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center disabled:opacity-50"
                  >
                    <i :class="saving ? 'fa-spinner fa-spin' : 'fa-save'" class="fas mr-2"></i>
                    {{ saving ? 'กำลังบันทึก...' : 'บันทึกผัง' }}
                  </button>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="orgChart.length === 0" class="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <i class="fas fa-sitemap text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg mb-4">ยังไม่มีโครงสร้างองค์กร</p>
                <button 
                  @click="addRootPosition"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
                >
                  <i class="fas fa-plus mr-2"></i>
                  เพิ่มตำแหน่งหัวหน้าแผนก
                </button>
              </div>

              <!-- Organization Tree -->
              <div v-else class="space-y-4">
                <OrganizationNode
                  v-for="(node, index) in orgChart"
                  :key="node.id"
                  :node="node"
                  :department-permissions="departmentPermissions"
                  :available-positions="availablePositions"
                  :is-last-child="index === orgChart.length - 1"
                  :is-root="true"
                  @add-child="addChildPosition"
                  @edit="editPosition"
                  @remove="removePosition"
                  @update-permissions="updateNodePermissions"
                  @node-drop="handleNodeDrop"
                />
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Quick Stats -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">สถิติโดยรวม</h3>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">พนักงานทั้งหมด</span>
                  <span class="text-2xl font-bold text-blue-600">{{ department.employees_count || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">โมดูลที่เข้าถึงได้</span>
                  <span class="text-2xl font-bold text-green-600">{{ moduleAccess.length }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">เมนูทั้งหมด</span>
                  <span class="text-2xl font-bold text-purple-600">{{ totalMenuCount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">ตำแหน่งทั้งหมด</span>
                  <span class="text-2xl font-bold text-indigo-600">{{ totalPositions }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">ระดับความลึกผัง</span>
                  <span class="text-2xl font-bold text-pink-600">{{ maxDepth }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">การดำเนินการ</h3>
              
              <div class="space-y-3">
                <button 
                  @click="editDepartment"
                  class="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  <i class="fas fa-edit mr-2"></i>
                  แก้ไขข้อมูล
                </button>
                <button 
                  @click="viewEmployees"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  <i class="fas fa-users mr-2"></i>
                  ดูรายชื่อพนักงาน
                </button>
                <button 
                  @click="deleteDepartment"
                  class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  <i class="fas fa-trash mr-2"></i>
                  ลบแผนก
                </button>
              </div>
            </div>

            <!-- Metadata -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">ข้อมูลเพิ่มเติม</h3>
              
              <div class="space-y-3 text-sm">
                <div>
                  <span class="text-gray-500">สร้างเมื่อ:</span>
                  <p class="text-gray-900">{{ formatDate(department.created_at) }}</p>
                </div>
                <div>
                  <span class="text-gray-500">แก้ไขล่าสุด:</span>
                  <p class="text-gray-900">{{ formatDate(department.updated_at) }}</p>
                </div>
                <div v-if="department.created_by">
                  <span class="text-gray-500">สร้างโดย:</span>
                  <p class="text-gray-900">{{ department.created_by }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Add/Edit Position Modal -->
    <PositionModal
      v-if="showPositionModal"
      :node="editingNode"
      :available-positions="availablePositions"
      :department-permissions="departmentPermissions"
      @close="closePositionModal"
      @save="savePositionNode"
    />
  </div>
</template>

<script>
import OrganizationNode from './OrganizationNode.vue'
import PositionModal from './PositionModal.vue'
// Import menuRegistry directly as fallback
import menuRegistry from '../../../../config/menuRegistry.js'

export default {
  name: 'DepartmentDetail',
  components: {
    OrganizationNode,
    PositionModal
  },
  data() {
    return {
      loading: true,
      department: null,
      moduleAccess: [],
      moduleMenusCache: {}, // Cache for module menus
      
      // Org Chart Data
      saving: false,
      departmentPermissions: [],
      availablePositions: [],
      orgChart: [],
      showPositionModal: false,
      editingNode: null,
      editingParentId: null,
      saveTimeout: null
    }
  },
  computed: {
    totalMenuCount() {
      return this.moduleAccess.reduce((total, module) => {
        return total + this.getModuleMenuCount(module)
      }, 0)
    },
    totalPositions() {
      return this.countNodes(this.orgChart)
    },
    maxDepth() {
      return this.calculateMaxDepth(this.orgChart, 0)
    }
  },
  async mounted() {
    if (window.ERP_CORE?.departments) {
      window.ERP_CORE.departments.initialize(this)
    }
    if (window.ERP_CORE?.positions) {
      window.ERP_CORE.positions.initialize(this)
    }
    await this.loadDepartment()
    await this.loadAllModuleMenus()
    
    // Load Org Chart Data
    if (this.department) {
      this.availablePositions = await window.ERP_CORE.positions.getPositions({ status: 'active' })
      this.departmentPermissions = this.extractDepartmentPermissions()
      await this.loadOrganizationChart()
    }
  },
  methods: {
    async loadDepartment() {
      try {
        const id = this.$route.params.id
        this.department = await window.ERP_CORE.departments.getDepartmentById(id)
        
        if (this.department) {
          // ✅ ใช้ module_access จาก API response โดยตรง
          if (this.department.module_access && Array.isArray(this.department.module_access)) {
            this.moduleAccess = this.department.module_access.filter(m => m.access)
            console.log('✅ Module access loaded from API:', this.moduleAccess)
          } else {
            // Fallback: เรียก getDepartmentModuleAccess ถ้า API ไม่มี module_access
            const access = await window.ERP_CORE.departments.getDepartmentModuleAccess(id)
            this.moduleAccess = access.filter(m => m.access)
            console.log('✅ Module access loaded from localStorage:', this.moduleAccess)
          }
        }
      } catch (error) {
        console.error('Load department error:', error)
      } finally {
        this.loading = false
      }
    },

    async loadAllModuleMenus() {
      // Load menus for all modules with access
      for (const module of this.moduleAccess) {
        const menus = await this.fetchModuleMenus(module.module)
        this.moduleMenusCache[module.module] = menus
      }
      // Force reactivity update
      this.moduleMenusCache = { ...this.moduleMenusCache }
    },

    async fetchModuleMenus(moduleKey) {
      try {
        let menuItems = []

        // 1. Try ERP_CORE.menus (Standard Registry)
        if (window.ERP_CORE?.menus) {
          const moduleMenu = window.ERP_CORE.menus.get(moduleKey)
          if (moduleMenu && moduleMenu.menuItems) {
            menuItems = moduleMenu.menuItems
          }
        }

        // 2. Fallback to Direct Import (menuRegistry)
        if (menuItems.length === 0 && menuRegistry) {
          console.log(`🔄 Loading menus for ${moduleKey} via direct import`)
          const config = await menuRegistry.loadModuleMenuConfig(moduleKey)
          if (config && Array.isArray(config)) {
            menuItems = config
          } else if (config && config.menuItems) {
            menuItems = config.menuItems
          }
        }

        // 3. Fallback to ERP_CORE.modules (Legacy)
        if (menuItems.length === 0 && window.ERP_CORE?.modules) {
          const menuConfig = await window.ERP_CORE.modules.getModuleConfig(moduleKey, 'menuConfig')
          if (menuConfig && menuConfig.menuItems) {
            menuItems = menuConfig.menuItems
          }
        }

        if (menuItems.length > 0) {
          const mapMenu = (menu) => ({
            key: menu.key,
            title: menu.label || menu.title,
            icon: menu.icon || 'circle',
            to: menu.to,
            type: menu.type || 'page',
            children: menu.children ? menu.children.map(mapMenu) : []
          })
          
          return menuItems
            .filter(menu => menu.key !== 'back')
            .map(mapMenu)
        }
        
        console.warn(`⚠️ No menu config found for module: ${moduleKey}`)
        return []
      } catch (error) {
        console.error(`Error loading menus for ${moduleKey}:`, error)
        return []
      }
    },

    getGrantedMenus(moduleAccessItem) {
      const allMenus = this.moduleMenusCache[moduleAccessItem.module] || []
      const grantedKeys = moduleAccessItem.menus || []
      
      // Filter menus where key is in grantedKeys
      // Note: This currently checks top-level keys. 
      // If submenus need to be displayed, we might need recursive checking or flattening.
      return allMenus.filter(menu => grantedKeys.includes(menu.key))
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
      return icons[moduleKey] || 'cube'
    },
    
    getModuleName(moduleKey) {
      const names = {
        hr: 'Human Resources',
        accounting: 'Accounting',
        sales: 'Sales',
        inventory: 'Inventory',
        purchase: 'Purchase',
        finance: 'Finance',
        delivery: 'Delivery',
        production: 'Production'
      }
      return names[moduleKey] || moduleKey
    },

    getModuleDescription(moduleKey) {
      const descriptions = {
        hr: 'บริหารทรัพยากรบุคคล',
        accounting: 'บัญชีและการเงิน',
        sales: 'การขายและลูกค้า',
        inventory: 'จัดการสินค้าคงคลัง',
        purchase: 'จัดซื้อและซัพพลายเออร์',
        finance: 'การเงินและงบประมาณ',
        delivery: 'จัดส่งและโลจิสติกส์',
        production: 'การผลิต'
      }
      return descriptions[moduleKey] || ''
    },

    getModuleMenus(moduleKey) {
      // Return cached menus synchronously
      return this.moduleMenusCache[moduleKey] || []
    },

    getModuleMenuCount(module) {
      // Return count of granted menus
      if (typeof module === 'object' && module.menus) {
        return module.menus.length
      }
      // Fallback for legacy usage (if any)
      return 0
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    editDepartment() {
      this.$router.push({ 
        name: 'hr-department-edit', 
        params: { id: this.department.id || this.department._id } 
      })
    },
    
    manageOrganizationChart() {
      // Removed as it is now integrated
    },
    
    viewEmployees() {
      this.$router.push({ 
        name: 'hr-employees', 
        query: { department_id: this.department.id || this.department._id } 
      })
    },
    
    async deleteDepartment() {
      try {
        const result = await this.$swal?.fire({
          title: 'ยืนยันการลบ',
          text: 'คุณต้องการลบแผนกนี้หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#dc3545'
        })

        if (result?.isConfirmed) {
          const response = await window.ERP_CORE.departments.deleteDepartment(
            this.department.id || this.department._id
          )
          
          if (response.success) {
            await this.$swal?.fire({
              title: 'สำเร็จ!',
              text: 'ลบแผนกเรียบร้อยแล้ว',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            })
            this.$router.push({ name: 'hr-departments' })
          } else {
            throw new Error(response.message || 'ไม่สามารถลบได้')
          }
        }
      } catch (error) {
        console.error('Delete department error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
      }
    },
    
    goBack() {
      this.$router.push({ name: 'hr-departments' })
    },

    // ==========================================
    // Organization Chart Methods
    // ==========================================
    
    extractDepartmentPermissions() {
      const permissions = []
      if (!this.department?.module_access) return permissions
      
      this.department.module_access.forEach(accessItem => {
        if (!accessItem.access) return
        const moduleName = accessItem.module
        const menus = accessItem.menus || []
        
        // Get full menu list for this module from cache
        const moduleMenus = this.moduleMenusCache[moduleName] || []
        
        menus.forEach(menuKey => {
          // Find the menu object to get title and children
          const menuObj = moduleMenus.find(m => m.key === menuKey)
          
          const permObj = {
            module: moduleName,
            menu_key: menuKey,
            menu_title: menuObj?.title || this.getMenuTitle(moduleName, menuKey),
            children: []
          }
          
          if (menuObj && menuObj.children && menuObj.children.length > 0) {
             permObj.children = menuObj.children.map(child => ({
                module: moduleName,
                menu_key: child.key,
                menu_title: child.title
             }))
          }
          
          permissions.push(permObj)
        })
      })
      return permissions
    },
    
    getMenuTitle(moduleName, menuKey) {
      const menuRegistry = window.ERP_CORE?.menus?.registry || {}
      const moduleMenus = menuRegistry[moduleName]?.items || []
      const menu = moduleMenus.find(m => m.key === menuKey)
      return menu?.title || menuKey
    },

    async loadOrganizationChart() {
      try {
        const departmentId = this.department.id || this.department._id
        this.orgChart = await window.ERP_CORE.departments.getOrganizationChart(departmentId)
      } catch (error) {
        console.error('Load org chart error:', error)
        this.orgChart = []
      }
    },

    async handleNodeDrop({ draggedNode, targetNode }) {
      if (this.isDescendant(draggedNode.id, targetNode.id)) {
        this.$swal?.fire('ทำไม่ได้', 'ไม่สามารถย้ายตำแหน่งไปอยู่ใต้ตำแหน่งย่อยของตัวเองได้', 'error')
        return
      }
      if (draggedNode.parent_position_id === targetNode.db_id) return

      const result = await this.$swal?.fire({
        title: 'ยืนยันการย้าย',
        text: `ต้องการย้าย "${draggedNode.position_name}" ไปอยู่ใต้ "${targetNode.position_name}" หรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ย้าย',
        cancelButtonText: 'ยกเลิก'
      })
      
      if (!result.isConfirmed) return

      try {
        const updateData = {
            department_id: this.department.id || this.department._id,
            position_id: draggedNode.position_id,
            position_code: draggedNode.position_code,
            position_name: draggedNode.position_name,
            level: draggedNode.level,
            parent_position_id: targetNode.db_id,
            permissions: draggedNode.permissions
        }
        
        await window.ERP_CORE.departments.updatePositionPermission(draggedNode.db_id, updateData)
        this.$swal?.fire('สำเร็จ', 'ย้ายตำแหน่งเรียบร้อยแล้ว', 'success')
        await this.loadOrganizationChart()
      } catch (error) {
        this.$swal?.fire('ผิดพลาด', 'ไม่สามารถย้ายตำแหน่งได้: ' + error.message, 'error')
      }
    },

    isDescendant(draggedId, targetId) {
       const findNode = (nodes, id) => {
         for (const node of nodes) {
           if (node.id === id) return node
           if (node.children) {
             const found = findNode(node.children, id)
             if (found) return found
           }
         }
         return null
       }
       const draggedNodeObj = findNode(this.orgChart, draggedId)
       if (!draggedNodeObj) return false
       
       const checkChildren = (node) => {
         if (!node.children) return false
         for (const child of node.children) {
           if (child.id === targetId) return true
           if (checkChildren(child)) return true
         }
         return false
       }
       return checkChildren(draggedNodeObj)
    },

    addRootPosition() {
      this.editingNode = null
      this.editingParentId = null
      this.showPositionModal = true
    },
    
    addChildPosition(parentNode) {
      this.editingNode = null
      this.editingParentId = parentNode.db_id
      this.showPositionModal = true
    },
    
    editPosition(node) {
      this.editingNode = { ...node }
      this.editingParentId = null
      this.showPositionModal = true
    },
    
    async removePosition(node) {
      const result = await this.$swal?.fire({
        title: 'ยืนยันการลบ',
        text: `ต้องการลบตำแหน่ง "${node.position_name}" และตำแหน่งย่อยทั้งหมดหรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc3545'
      })
      
      if (!result.isConfirmed) return
      
      try {
        if (node.db_id) {
          await window.ERP_CORE.departments.deletePositionPermission(node.db_id)
          this.$swal?.fire('สำเร็จ!', 'ลบตำแหน่งเรียบร้อยแล้ว', 'success')
        }
        this.removeNodeById(node.id)
      } catch (error) {
        this.$swal?.fire('ผิดพลาด!', 'ไม่สามารถลบข้อมูลได้: ' + error.message, 'error')
      }
    },
    
    removeNodeById(nodeId) {
      const removeFromArray = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === nodeId) {
            nodes.splice(i, 1)
            return true
          }
          if (nodes[i].children && removeFromArray(nodes[i].children)) return true
        }
        return false
      }
      removeFromArray(this.orgChart)
    },
    
    closePositionModal() {
      this.showPositionModal = false
      this.editingNode = null
      this.editingParentId = null
    },
    
    async savePositionNode(nodeData) {
      try {
        const departmentId = this.department.id || this.department._id
        
        if (this.editingNode && this.editingNode.db_id) {
          const updateData = {
            department_id: departmentId,
            position_id: nodeData.position_id,
            position_code: nodeData.position_code,
            position_name: nodeData.position_name,
            level: nodeData.level,
            parent_position_id: this.editingNode.parent_position_id || null,
            permissions: nodeData.permissions
          }
          await window.ERP_CORE.departments.updatePositionPermission(this.editingNode.db_id, updateData)
          this.updateNodeById(this.editingNode.id, nodeData)
          this.$swal?.fire('สำเร็จ!', 'แก้ไขตำแหน่งเรียบร้อยแล้ว', 'success')
        } else {
          const insertData = {
            department_id: departmentId,
            position_id: nodeData.position_id,
            position_code: nodeData.position_code,
            position_name: nodeData.position_name,
            level: nodeData.level,
            parent_position_id: this.editingParentId || null,
            permissions: nodeData.permissions
          }
          const result = await window.ERP_CORE.departments.createPositionPermission(insertData)
          
          const newNode = {
            id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            db_id: result._id || result.id,
            ...nodeData,
            parent_position_id: this.editingParentId || null,
            children: []
          }
          
          if (this.editingParentId) {
            this.addNodeToParent(this.editingParentId, newNode)
          } else {
            this.orgChart.push(newNode)
          }
          this.$swal?.fire('สำเร็จ!', 'เพิ่มตำแหน่งเรียบร้อยแล้ว', 'success')
        }
        this.closePositionModal()
      } catch (error) {
        this.$swal?.fire('ผิดพลาด!', 'ไม่สามารถบันทึกข้อมูลได้: ' + error.message, 'error')
      }
    },
    
    updateNodeById(nodeId, newData) {
      const updateInArray = (nodes) => {
        for (let node of nodes) {
          if (node.id === nodeId) {
            Object.assign(node, newData)
            return true
          }
          if (node.children && updateInArray(node.children)) return true
        }
        return false
      }
      updateInArray(this.orgChart)
    },
    
    addNodeToParent(parentDbId, newNode) {
      const addToArray = (nodes) => {
        for (let node of nodes) {
          if (node.db_id === parentDbId) {
            if (!node.children) node.children = []
            node.children.push(newNode)
            return true
          }
          if (node.children && addToArray(node.children)) return true
        }
        return false
      }
      addToArray(this.orgChart)
    },
    
    updateNodePermissions(arg1, arg2) {
      let nodeId, permissions
      if (typeof arg1 === 'object' && arg1.nodeId) {
         nodeId = arg1.nodeId
         permissions = arg1.permissions
      } else {
         nodeId = arg1
         permissions = arg2
      }

      const updateInArray = (nodes) => {
        for (let node of nodes) {
          if (node.id === nodeId) {
            node.permissions = permissions
            return true
          }
          if (node.children && updateInArray(node.children)) return true
        }
        return false
      }
      updateInArray(this.orgChart)
      this.debouncedSave()
    },
    
    async saveOrganizationChart() {
      if (this.saving) return
      this.saving = true
      try {
        const departmentId = this.department.id || this.department._id
        const response = await window.ERP_CORE.departments.saveOrganizationChart(departmentId, this.orgChart)
        if (response.success) {
          this.$swal?.fire({
            title: 'สำเร็จ!',
            text: 'บันทึกผังองค์กรเรียบร้อยแล้ว',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          })
          await this.loadOrganizationChart()
        } else {
          throw new Error(response.message || 'ไม่สามารถบันทึกได้')
        }
      } catch (error) {
        this.$swal?.fire('ผิดพลาด!', 'ไม่สามารถบันทึกได้: ' + error.message, 'error')
      } finally {
        this.saving = false
      }
    },
    
    debouncedSave() {
      if (this.saveTimeout) clearTimeout(this.saveTimeout)
      this.saveTimeout = setTimeout(() => {
        this.saveOrganizationChart()
      }, 1000)
    },

    countNodes(nodes) {
      let count = 0
      for (let node of nodes) {
        count++
        if (node.children) {
          count += this.countNodes(node.children)
        }
      }
      return count
    },
    
    calculateMaxDepth(nodes, currentDepth) {
      if (nodes.length === 0) return currentDepth
      
      let maxChildDepth = currentDepth
      for (let node of nodes) {
        if (node.children && node.children.length > 0) {
          const childDepth = this.calculateMaxDepth(node.children, currentDepth + 1)
          maxChildDepth = Math.max(maxChildDepth, childDepth)
        }
      }
      
      return maxChildDepth + (nodes.length > 0 ? 1 : 0)
    }
  }
}
</script>

<style scoped>
/* Tailwind CSS handles all styling */
</style>
