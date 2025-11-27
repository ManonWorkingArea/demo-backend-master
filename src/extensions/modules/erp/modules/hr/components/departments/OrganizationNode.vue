<template>
  <div class="organization-node relative">
    <!-- Node Row -->
    <div class="flex items-center gap-2 group relative">
      
      <!-- Connector Lines (for non-root) -->
      <template v-if="!isRoot">
        <!-- Horizontal line -->
        <div class="absolute -left-6 top-1/2 w-6 h-px bg-gray-300"></div>
        
        <!-- Vertical line patch for last child (L-shape) -->
        <div v-if="isLastChild" class="absolute -left-[25px] top-1/2 bottom-0 w-[2px] bg-gray-50"></div>
      </template>

      <!-- Expand/Collapse Button -->
      <button 
        v-if="node.children && node.children.length > 0"
        @click="toggleChildren"
        class="relative z-10 w-5 h-5 flex items-center justify-center bg-white border border-gray-300 rounded-full text-gray-500 hover:text-purple-600 hover:border-purple-400 transition-colors shadow-sm flex-shrink-0"
      >
        <i :class="showChildren ? 'fas fa-minus' : 'fas fa-plus'" class="text-[10px]"></i>
      </button>
      
      <!-- Spacer for leaf node -->
      <div v-else class="w-5 flex-shrink-0 flex justify-center">
        <div class="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
      </div>
      
      <!-- Node Card -->
      <div 
        class="flex-1 flex items-center gap-3 border rounded-lg px-3 py-2 transition-all group/card min-w-[250px] relative"
        :class="[
           isDragOver ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200' : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md',
           !isRoot ? 'cursor-move' : ''
        ]"
        :draggable="!isRoot"
        @dragstart="onDragStart($event, node)"
        @dragover.prevent="onDragOver"
        @drop="onDrop($event, node)"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
      >
        <!-- Avatar -->
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
          {{ getPositionInitials(node.position_name) }}
        </div>
        
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm text-gray-800 truncate">
            {{ node.position_name }}
          </div>
          <div class="text-[10px] text-gray-500 truncate flex items-center gap-1">
            <span class="bg-gray-100 px-1.5 rounded text-gray-600">{{ node.position_code }}</span>
            <span :class="getLevelBadgeClass(node.level)" class="px-1.5 rounded">
              {{ getLevelText(node.level) }}
            </span>
          </div>
        </div>
        
        <!-- Permissions Count (Compact) -->
        <div class="flex items-center gap-2 text-[10px] text-gray-400 border-l border-gray-100 pl-2">
          <div class="flex flex-col items-center" title="Read Access">
            <i class="fas fa-eye text-blue-400 mb-0.5"></i>
            <span>{{ countPermissions(node.permissions, 'read') }}</span>
          </div>
          <div class="flex flex-col items-center" title="Write Access">
            <i class="fas fa-edit text-amber-400 mb-0.5"></i>
            <span>{{ countPermissions(node.permissions, 'write') }}</span>
          </div>
        </div>
        
        <!-- Actions (Hover) -->
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity bg-white pl-2 shadow-[-10px_0_10px_white]">
            <button 
              @click="$emit('add-child', node)"
              class="w-6 h-6 flex items-center justify-center text-green-600 hover:bg-green-50 rounded transition-colors"
              title="เพิ่มตำแหน่งย่อย"
            >
              <i class="fas fa-plus text-xs"></i>
            </button>
            <button 
              @click="togglePermissions"
              class="w-6 h-6 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="จัดการสิทธิ์"
            >
              <i class="fas fa-shield-alt text-xs"></i>
            </button>
            <button 
              @click="$emit('edit', node)"
              class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="แก้ไข"
            >
              <i class="fas fa-edit text-xs"></i>
            </button>
            <button 
              @click="$emit('remove', node)"
              class="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 rounded transition-colors"
              title="ลบ"
            >
              <i class="fas fa-trash text-xs"></i>
            </button>
        </div>
      </div>
    </div>
    
    <!-- Permissions Panel -->
    <div v-if="showPermissions" class="ml-12 mt-2 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-md relative z-20">
        <div class="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            <i class="fas fa-shield-alt text-purple-500 mr-1"></i>
            สิทธิ์การเข้าถึง
          </span>
          <button 
            @click="showPermissions = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
        
        <div v-if="departmentPermissions.length === 0" class="text-xs text-gray-500 text-center py-6">
          ไม่มีสิทธิ์ที่กำหนด
        </div>
        
        <div v-else class="p-2 max-h-60 overflow-y-auto space-y-1">
          <div
            v-for="perm in departmentPermissions"
            :key="`${perm.module}_${perm.menu_key}`"
            class="flex items-center justify-between gap-2 px-2 py-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-700 truncate">{{ perm.menu_title }}</p>
            </div>
            
            <div class="flex items-center gap-2">
              <label class="flex items-center cursor-pointer" title="อ่าน">
                <input 
                  type="checkbox" 
                  :checked="hasPermission(perm, 'read')"
                  @change="updatePermission(perm, 'read', $event.target.checked)"
                  class="w-3.5 h-3.5 text-blue-600 rounded focus:ring-1"
                />
                <i class="fas fa-eye text-blue-500 text-xs ml-1"></i>
              </label>
              
              <label class="flex items-center cursor-pointer" title="แก้ไข">
                <input 
                  type="checkbox" 
                  :checked="hasPermission(perm, 'write')"
                  @change="updatePermission(perm, 'write', $event.target.checked)"
                  class="w-3.5 h-3.5 text-amber-600 rounded focus:ring-1"
                />
                <i class="fas fa-edit text-amber-500 text-xs ml-1"></i>
              </label>
              
              <label class="flex items-center cursor-pointer" title="แสดง">
                <input 
                  type="checkbox" 
                  :checked="hasPermission(perm, 'visible')"
                  @change="updatePermission(perm, 'visible', $event.target.checked)"
                  class="w-3.5 h-3.5 text-green-600 rounded focus:ring-1"
                />
                <i class="fas fa-eye-slash text-green-500 text-xs ml-1"></i>
              </label>
            </div>
          </div>
        </div>
        
        <div v-if="departmentPermissions.length > 0" class="border-t border-gray-200 px-3 py-2 bg-gray-50 flex justify-end">
          <button 
            @click="savePermissions"
            class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1 transition-colors"
          >
            <i class="fas fa-save text-xs"></i>
            บันทึก
          </button>
        </div>
    </div>
    
    <!-- Children Container -->
    <div v-if="showChildren && node.children && node.children.length > 0" class="ml-6 pl-6 border-l border-gray-300 space-y-3 pt-3 relative">
      <OrganizationNode
        v-for="(child, index) in node.children" 
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :department-permissions="departmentPermissions"
        :is-last-child="index === node.children.length - 1"
        :is-root="false"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @remove="$emit('remove', $event)"
        @update-permissions="$emit('update-permissions', $event)"
        @node-drop="$emit('node-drop', $event)"
        @node-drag-start="$emit('node-drag-start', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrganizationNode',
  
  props: {
    node: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    departmentPermissions: {
      type: Array,
      default: () => []
    },
    isLastChild: {
      type: Boolean,
      default: false
    },
    isRoot: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      showPermissions: false,
      showChildren: true,
      localPermissions: [],
      isDragOver: false,
      dragCounter: 0
    }
  },
  
  mounted() {
    // Initialize local permissions from node
    this.localPermissions = JSON.parse(JSON.stringify(this.node.permissions || []))
  },
  
  methods: {
    onDragStart(event, node) {
      if (this.isRoot) return // Prevent dragging root
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.dropEffect = 'move'
      event.dataTransfer.setData('application/json', JSON.stringify(node))
      this.$emit('node-drag-start', node)
    },
    
    onDragEnter() {
      this.dragCounter++
      this.isDragOver = true
    },
    
    onDragLeave() {
      this.dragCounter--
      if (this.dragCounter === 0) {
        this.isDragOver = false
      }
    },
    
    onDragOver() {
      // Allow drop
      // event.preventDefault() is handled by @dragover.prevent in template
    },
    
    onDrop(event, targetNode) {
      this.isDragOver = false
      this.dragCounter = 0
      const data = event.dataTransfer.getData('application/json')
      if (data) {
        try {
          const draggedNode = JSON.parse(data)
          // Prevent dropping on itself
          if (draggedNode.id !== targetNode.id) {
            this.$emit('node-drop', { draggedNode, targetNode })
          }
        } catch (e) {
          console.error('Drop error', e)
        }
      }
    },

    getPositionInitials(name) {
      if (!name) return '?'
      const words = name.split(' ')
      if (words.length >= 2) {
        return words[0][0] + words[1][0]
      }
      return name.substring(0, 2)
    },
    
    getLevelBadgeClass(level) {
      const classes = {
        executive: 'bg-purple-100 text-purple-800',
        director: 'bg-red-100 text-red-800',
        manager: 'bg-blue-100 text-blue-800',
        supervisor: 'bg-cyan-100 text-cyan-800',
        staff: 'bg-gray-100 text-gray-800'
      }
      return classes[level] || 'bg-gray-100 text-gray-800'
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
    
    countPermissions(permissions, type) {
      if (!permissions) return 0
      return permissions.filter(p => p[type] === true).length
    },
    
    toggleChildren() {
      this.showChildren = !this.showChildren
    },
    
    togglePermissions() {
      this.showPermissions = !this.showPermissions
    },
    
    hasPermission(perm, type) {
      const existing = this.localPermissions.find(
        p => p.module === perm.module && p.menu_key === perm.menu_key
      )
      return existing ? existing[type] === true : false
    },
    
    updatePermission(perm, type, value) {
      let existing = this.localPermissions.find(
        p => p.module === perm.module && p.menu_key === perm.menu_key
      )
      
      if (!existing) {
        existing = {
          module: perm.module,
          menu_key: perm.menu_key,
          menu_title: perm.menu_title,
          read: false,
          write: false,
          visible: true
        }
        this.localPermissions.push(existing)
      }
      
      existing[type] = value
      
      // Auto-enable read if write is enabled
      if (type === 'write' && value) {
        existing.read = true
      }
    },
    
    savePermissions() {
      // Filter out permissions with no read/write access
      const validPermissions = this.localPermissions.filter(p => p.read || p.write)
      
      this.$emit('update-permissions', {
        nodeId: this.node.id,
        permissions: validPermissions
      })
      
      this.showPermissions = false
      
      this.$swal?.fire({
        title: 'สำเร็จ!',
        text: 'บันทึกสิทธิ์เรียบร้อยแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
    }
  }
}
</script>

<style scoped>
.organization-node {
  position: relative;
}
</style>
