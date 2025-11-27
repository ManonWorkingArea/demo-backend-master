<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
        <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header Section -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <i class="fas fa-sitemap text-purple-500"></i>
                จัดผังองค์กร - {{ department?.name }}
              </h1>
              <p class="mt-2 text-gray-600">กำหนดโครงสร้างตำแหน่ง สิทธิ์การเข้าถึง และลำดับการรายงาน</p>
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
                @click="saveOrganizationChart"
                :disabled="saving"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center disabled:opacity-50"
              >
                <i :class="saving ? 'fa-spinner fa-spin' : 'fa-save'" class="fas mr-2"></i>
                {{ saving ? 'กำลังบันทึก...' : 'บันทึกผังองค์กร' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Organization Tree -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">โครงสร้างองค์กร</h2>
                <button 
                  @click="addRootPosition"
                  class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center"
                >
                  <i class="fas fa-plus mr-2"></i>
                  เพิ่มตำแหน่งหัวหน้า
                </button>
              </div>

              <!-- Empty State -->
              <div v-if="orgChart.length === 0" class="text-center py-12">
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

          <!-- Sidebar - Department Info & Instructions -->
          <div class="space-y-6">
            <!-- Department Info -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">ข้อมูลแผนก</h3>
              <div class="space-y-3 text-sm">
                <div>
                  <span class="text-gray-500">รหัส:</span>
                  <p class="text-gray-900 font-medium">{{ department?.code }}</p>
                </div>
                <div>
                  <span class="text-gray-500">ชื่อแผนก:</span>
                  <p class="text-gray-900 font-medium">{{ department?.name }}</p>
                </div>
                <div>
                  <span class="text-gray-500">สถานะ:</span>
                  <span 
                    :class="department?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="inline-flex px-2 py-1 rounded text-xs font-semibold"
                  >
                    {{ department?.status === 'active' ? 'ใช้งาน' : 'ระงับ' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Statistics -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">สถิติ</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600 text-sm">จำนวนตำแหน่ง</span>
                  <span class="text-2xl font-bold text-purple-600">{{ totalPositions }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600 text-sm">ระดับความลึก</span>
                  <span class="text-2xl font-bold text-blue-600">{{ maxDepth }}</span>
                </div>
              </div>
            </div>

            <!-- Instructions -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <i class="fas fa-info-circle"></i>
                วิธีการใช้งาน
              </h3>
              <ul class="text-xs text-blue-800 space-y-2">
                <li class="flex items-start gap-2">
                  <i class="fas fa-check-circle mt-0.5 text-blue-600"></i>
                  <span>เพิ่มตำแหน่งหัวหน้าแผนก (Root Position) เป็นอันดับแรก</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="fas fa-check-circle mt-0.5 text-blue-600"></i>
                  <span>เพิ่มตำแหน่งย่อยใต้แต่ละตำแหน่งได้ไม่จำกัดระดับ</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="fas fa-check-circle mt-0.5 text-blue-600"></i>
                  <span>กำหนดสิทธิ์ Read/Write ต่อเมนูที่แผนกมีสิทธิ์เข้าถึง</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="fas fa-check-circle mt-0.5 text-blue-600"></i>
                  <span>ติ๊กเลือกว่าจะแสดงหรือซ่อนเมนูย่อย</span>
                </li>
                <li class="flex items-start gap-2">
                  <i class="fas fa-check-circle mt-0.5 text-blue-600"></i>
                  <span>ตำแหน่งที่อยู่สูงกว่าจะดูแลภาพรวมของตำแหน่งที่ต่ำกว่า</span>
                </li>
              </ul>
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

export default {
  name: 'OrganizationChart',
  components: {
    OrganizationNode,
    PositionModal
  },
  
  data() {
    return {
      loading: false,
      saving: false,
      department: null,
      departmentPermissions: [], // เมนูที่ department มีสิทธิ์เข้าถึง
      availablePositions: [], // รายการ positions ทั้งหมด
      orgChart: [], // โครงสร้างองค์กร (tree structure)
      showPositionModal: false,
      editingNode: null,
      editingParentId: null,
      saveTimeout: null // สำหรับ debounce
    }
  },
  
  computed: {
    departmentId() {
      return this.$route.params.id
    },
    
    totalPositions() {
      return this.countNodes(this.orgChart)
    },
    
    maxDepth() {
      return this.calculateMaxDepth(this.orgChart, 0)
    }
  },
  
  async mounted() {
    // Initialize services (same as Detail.vue)
    if (window.ERP_CORE?.departments) {
      window.ERP_CORE.departments.initialize(this)
    }
    if (window.ERP_CORE?.positions) {
      window.ERP_CORE.positions.initialize(this)
    }
    
    await this.loadData()
  },
  
  watch: {
    // Watch route params changes to reload data
    '$route.params.id': {
      handler(newId, oldId) {
        if (newId && newId !== oldId) {
          this.loadData()
        }
      },
      immediate: false
    }
  },
  
  methods: {
    async loadData() {
      this.loading = true
      try {
        // Use computed departmentId (same as Detail.vue)
        const id = this.departmentId
        
        if (!id) {
          console.error('❌ [OrganizationChart] No department ID in route params')
          this.goBack()
          return
        }
        
        // Load department details (EXACTLY same as Detail.vue)
        this.department = await window.ERP_CORE.departments.getDepartmentById(id)
        
        if (!this.department) {
          console.error('❌ [OrganizationChart] Department not found')
          this.$swal?.fire('ผิดพลาด!', 'ไม่พบข้อมูลแผนก', 'error')
          this.goBack()
          return
        }
        
        console.log('✅ [OrganizationChart] Department loaded:', this.department.name)
        
        // ✅ Use module_access from API response (EXACTLY same logic as Detail.vue)
        if (this.department.module_access && Array.isArray(this.department.module_access)) {
          console.log('✅ [OrganizationChart] Using module_access from API')
        } else {
          // Fallback: Load from localStorage if API doesn't return it
          console.log('⚠️ [OrganizationChart] Fallback to localStorage')
          const access = await window.ERP_CORE.departments.getDepartmentModuleAccess(id)
          this.department.module_access = access.filter(m => m.access)
        }
        
        // Load available positions
        this.availablePositions = await window.ERP_CORE.positions.getPositions({ status: 'active' })
        
        // Extract department permissions (menus that department can access)
        this.departmentPermissions = this.extractDepartmentPermissions()
        
        console.log('✅ [OrganizationChart] Loaded', this.departmentPermissions.length, 'permissions')
        
        // Load existing organization chart
        await this.loadOrganizationChart()
        
      } catch (error) {
        console.error('❌ [OrganizationChart] Load error:', error)
        this.$swal?.fire('ผิดพลาด!', 'ไม่สามารถโหลดข้อมูลได้: ' + error.message, 'error')
        this.goBack()
      } finally {
        this.loading = false
      }
    },
    
    extractDepartmentPermissions() {
      // Extract all menus from department.module_access (same as Detail.vue logic)
      const permissions = []
      
      if (!this.department) {
        console.warn('⚠️ [OrganizationChart] No department data')
        return permissions
      }
      
      const moduleAccess = this.department.module_access
      
      if (!moduleAccess || !Array.isArray(moduleAccess) || moduleAccess.length === 0) {
        console.warn('⚠️ [OrganizationChart] No module_access available. Please set department permissions first.')
        return permissions
      }
      
      moduleAccess.forEach(accessItem => {
        const moduleName = accessItem.module
        const menus = accessItem.menus || []
        
        if (!moduleName || !Array.isArray(menus)) {
          return
        }
        
        menus.forEach(menuKey => {
          const menuTitle = this.getMenuTitle(moduleName, menuKey)
          permissions.push({
            module: moduleName,
            menu_key: menuKey,
            menu_title: menuTitle
          })
        })
      })
      
      return permissions
    },
    
    getMenuTitle(moduleName, menuKey) {
      // Get menu title from ERP_CORE.menuRegistry
      const menuRegistry = window.ERP_CORE?.menus?.registry || {}
      const moduleMenus = menuRegistry[moduleName]?.items || []
      const menu = moduleMenus.find(m => m.key === menuKey)
      return menu?.title || menuKey
    },
    
    async loadOrganizationChart() {
      try {
        const departmentId = this.department.id || this.department._id
        
        console.log('📊 [OrganizationChart] Loading org chart for department:', departmentId)
        
        // Load from API - department_position_permission collection
        this.orgChart = await window.ERP_CORE.departments.getOrganizationChart(departmentId)
        
        console.log('✅ [OrganizationChart] Loaded org chart:', this.orgChart.length, 'root positions')
      } catch (error) {
        console.error('❌ [OrganizationChart] Load org chart error:', error)
        this.orgChart = []
      }
    },
    
    async handleNodeDrop({ draggedNode, targetNode }) {
      // 1. Check if target is descendant of dragged node (Circular dependency)
      if (this.isDescendant(draggedNode.id, targetNode.id)) {
        this.$swal?.fire('ทำไม่ได้', 'ไม่สามารถย้ายตำแหน่งไปอยู่ใต้ตำแหน่งย่อยของตัวเองได้', 'error')
        return
      }
      
      // 2. Check if target is already the parent
      if (draggedNode.parent_position_id === targetNode.db_id) {
        return // No change
      }

      // 3. Confirm
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
        // 4. Update API
        const updateData = {
            department_id: this.departmentId,
            position_id: draggedNode.position_id,
            position_code: draggedNode.position_code,
            position_name: draggedNode.position_name,
            level: draggedNode.level,
            parent_position_id: targetNode.db_id, // New Parent
            permissions: draggedNode.permissions
        }
        
        await window.ERP_CORE.departments.updatePositionPermission(
            draggedNode.db_id,
            updateData
        )
        
        this.$swal?.fire('สำเร็จ', 'ย้ายตำแหน่งเรียบร้อยแล้ว', 'success')
        
        // 5. Reload
        await this.loadOrganizationChart()
        
      } catch (error) {
        console.error('Move error:', error)
        this.$swal?.fire('ผิดพลาด', 'ไม่สามารถย้ายตำแหน่งได้: ' + error.message, 'error')
      }
    },
    
    isDescendant(draggedId, targetId) {
       // Find dragged node in tree
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
       
       // Check if targetId exists in draggedNodeObj's children recursively
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
      this.editingParentId = null  // ไม่มี parent → root
      this.showPositionModal = true
    },
    
    addChildPosition(parentNode) {
      this.editingNode = null
      this.editingParentId = parentNode.db_id  // ใช้ MongoDB _id ของ parent โดยตรง
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
          // 🗑️ DELETE: มี db_id → DELETE จาก API
          console.log('🗑️ [OrganizationChart] Deleting position:', node.db_id)
          
          await window.ERP_CORE.departments.deletePositionPermission(node.db_id)
          
          this.$swal?.fire('สำเร็จ!', 'ลบตำแหน่งเรียบร้อยแล้ว', 'success')
        }
        
        // ลบจาก local state
        this.removeNodeById(node.id)
        
      } catch (error) {
        console.error('❌ [OrganizationChart] Delete error:', error)
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
          if (nodes[i].children && removeFromArray(nodes[i].children)) {
            return true
          }
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
        if (this.editingNode && this.editingNode.db_id) {
          // ✏️ EDIT MODE: มี db_id → PUT (UPDATE)
          console.log('✏️ [OrganizationChart] Updating position:', this.editingNode.db_id)
          
          const updateData = {
            department_id: this.departmentId,
            position_id: nodeData.position_id,
            position_code: nodeData.position_code,
            position_name: nodeData.position_name,
            level: nodeData.level,
            parent_position_id: this.editingNode.parent_position_id || null,
            permissions: nodeData.permissions
          }
          
          await window.ERP_CORE.departments.updatePositionPermission(
            this.editingNode.db_id,
            updateData
          )
          
          // Update local state
          this.updateNodeById(this.editingNode.id, nodeData)
          
          this.$swal?.fire('สำเร็จ!', 'แก้ไขตำแหน่งเรียบร้อยแล้ว', 'success')
          
        } else {
          // ➕ ADD MODE: ไม่มี db_id → POST (INSERT)
          console.log('➕ [OrganizationChart] Adding new position')
          console.log('   Parent ID:', this.editingParentId || 'null (root)')
          
          const insertData = {
            department_id: this.departmentId,
            position_id: nodeData.position_id,
            position_code: nodeData.position_code,
            position_name: nodeData.position_name,
            level: nodeData.level,
            parent_position_id: this.editingParentId || null,  // ✅ ง่ายๆ: มี parent ใส่ _id, ไม่มีใส่ null
            permissions: nodeData.permissions
          }
          
          const result = await window.ERP_CORE.departments.createPositionPermission(insertData)
          
          console.log('✅ Created with _id:', result._id || result.id)
          
          // Add to local state with db_id from API response
          const newNode = {
            id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            db_id: result._id || result.id,
            ...nodeData,
            parent_position_id: this.editingParentId || null,
            children: []
          }
          
          if (this.editingParentId) {
            // เพิ่มเป็น child
            this.addNodeToParent(this.editingParentId, newNode)
          } else {
            // เพิ่มเป็น root
            this.orgChart.push(newNode)
          }
          
          this.$swal?.fire('สำเร็จ!', 'เพิ่มตำแหน่งเรียบร้อยแล้ว', 'success')
        }
        
        this.closePositionModal()
        
      } catch (error) {
        console.error('❌ [OrganizationChart] Save error:', error)
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
          if (node.children && updateInArray(node.children)) {
            return true
          }
        }
        return false
      }
      
      updateInArray(this.orgChart)
    },
    
    addNodeToParent(parentDbId, newNode) {
      // ✅ Simple: หา parent จาก db_id แล้วเพิ่ม child เข้าไป
      const addToArray = (nodes) => {
        for (let node of nodes) {
          if (node.db_id === parentDbId) {
            if (!node.children) node.children = []
            node.children.push(newNode)
            return true
          }
          if (node.children && addToArray(node.children)) {
            return true
          }
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
          if (node.children && updateInArray(node.children)) {
            return true
          }
        }
        return false
      }
      
      updateInArray(this.orgChart)
      
      // 🔥 บันทึกลง API แบบ debounced
      console.log('💾 [OrganizationChart] Scheduling save after permission update...')
      this.debouncedSave()
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
    },
    
    async saveOrganizationChart() {
      // ป้องกันการบันทึกซ้ำซ้อน
      if (this.saving) {
        console.log('⏸️ [OrganizationChart] Already saving, skip...')
        return
      }
      
      this.saving = true
      try {
        const departmentId = this.department.id || this.department._id
        
        console.log('💾 [OrganizationChart] Saving org chart:', {
          department_id: departmentId,
          positions_count: this.countNodes(this.orgChart)
        })
        
        // Save to API - department_position_permission collection
        const response = await window.ERP_CORE.departments.saveOrganizationChart(
          departmentId,
          this.orgChart
        )
        
        if (response.success) {
          this.$swal?.fire({
            title: 'สำเร็จ!',
            text: response.message || 'บันทึกผังองค์กรเรียบร้อยแล้ว',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          })
          
          // Reload org chart to get updated data with IDs
          await this.loadOrganizationChart()
        } else {
          throw new Error(response.message || 'ไม่สามารถบันทึกได้')
        }
        
      } catch (error) {
        console.error('❌ [OrganizationChart] Save error:', error)
        this.$swal?.fire('ผิดพลาด!', 'ไม่สามารถบันทึกได้: ' + error.message, 'error')
      } finally {
        this.saving = false
      }
    },
    
    // เพิ่มฟังก์ชัน debounced save
    debouncedSave() {
      // ยกเลิก timeout เก่า
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout)
      }
      
      // ตั้ง timeout ใหม่
      this.saveTimeout = setTimeout(() => {
        this.saveOrganizationChart()
      }, 1000) // รอ 1 วินาทีหลังจากการเปลี่ยนแปลงล่าสุด
    },
    
    goBack() {
      // Navigate back to department detail (same as Detail.vue logic)
      const id = this.department?.id || this.department?._id || this.departmentId
      this.$router.push({ 
        name: 'hr-department-detail', 
        params: { id } 
      })
    }
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
