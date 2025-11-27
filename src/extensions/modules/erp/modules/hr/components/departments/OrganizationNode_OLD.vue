<template>
  <div class="org-node" :class="{ 'has-children': hasChildren }">
    <!-- Node Content -->
    <div class="node-wrapper">
      <!-- Expand/Collapse Button -->
      <button 
        v-if="hasChildren"
        @click="toggleChildren"
        class="expand-btn"
      >
        <i :class="showChildren ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" class="text-xs"></i>
      </button>
      
      <!-- Node Card -->
      <div class="node-card group">
        <!-- Avatar -->
        <div class="node-avatar">
          {{ getPositionInitials(node.position_name) }}
        </div>
        
        <!-- Info -->
        <div class="node-info">
          <div class="node-title">{{ node.position_name }}</div>
          <div class="node-subtitle">{{ node.position_code }}</div>
        </div>
        
        <!-- Stats & Badge -->
        <div class="node-stats">
          <span :class="getLevelBadgeClass(node.level)" class="level-badge">
            {{ getLevelText(node.level) }}
          </span>
          <div class="perm-stats">
            <span><i class="fas fa-eye text-blue-500"></i> {{ countPermissions(node.permissions, 'read') }}</span>
            <span><i class="fas fa-edit text-amber-500"></i> {{ countPermissions(node.permissions, 'write') }}</span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="node-actions">
          <button @click="$emit('add-child', node)" title="เพิ่มตำแหน่งย่อย">
            <i class="fas fa-plus"></i>
          </button>
          <button @click="togglePermissions" title="จัดการสิทธิ์">
            <i class="fas fa-shield-alt"></i>
          </button>
          <button @click="$emit('edit', node)" title="แก้ไข">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="$emit('remove', node)" title="ลบ">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        
        <!-- Children Count -->
        <div v-if="hasChildren" class="children-count">
          <i class="fas fa-users text-purple-500"></i>
          <span>{{ node.children.length }}</span>
        </div>
      </div>
    </div>
    
    <!-- Permissions Panel -->
    <div v-if="showPermissions" class="permissions-panel">
      <div class="panel-header">
        <span>
          <i class="fas fa-shield-alt text-purple-500 mr-1"></i>
          สิทธิ์การเข้าถึง
        </span>
        <button @click="showPermissions = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div v-if="departmentPermissions.length === 0" class="panel-empty">
        ไม่มีสิทธิ์ที่กำหนด
      </div>
      
      <div v-else class="panel-content">
        <div
          v-for="perm in departmentPermissions"
          :key="`${perm.module}_${perm.menu_key}`"
          class="perm-item"
        >
          <div class="perm-title">{{ perm.menu_title }}</div>
          
          <div class="perm-checks">
            <label title="อ่าน">
              <input 
                type="checkbox" 
                :checked="hasPermission(perm, 'read')"
                @change="updatePermission(perm, 'read', $event.target.checked)"
              />
              <i class="fas fa-eye text-blue-500"></i>
            </label>
            
            <label title="แก้ไข">
              <input 
                type="checkbox" 
                :checked="hasPermission(perm, 'write')"
                @change="updatePermission(perm, 'write', $event.target.checked)"
              />
              <i class="fas fa-edit text-amber-500"></i>
            </label>
            
            <label title="แสดง">
              <input 
                type="checkbox" 
                :checked="hasPermission(perm, 'visible')"
                @change="updatePermission(perm, 'visible', $event.target.checked)"
              />
              <i class="fas fa-eye-slash text-green-500"></i>
            </label>
          </div>
        </div>
      </div>
      
      <div v-if="departmentPermissions.length > 0" class="panel-footer">
        <button @click="savePermissions" class="save-btn">
          <i class="fas fa-save"></i>
          บันทึก
        </button>
      </div>
    </div>
    
    <!-- Children -->
    <div v-if="showChildren && hasChildren" class="node-children">
      <OrganizationNode
        v-for="child in node.children" 
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :department-permissions="departmentPermissions"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @remove="$emit('remove', $event)"
        @update-permissions="$emit('update-permissions', $event.nodeId, $event.permissions)"
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
    }
  },
  data() {
    return {
      showChildren: true,
      showPermissions: false,
      localPermissions: {}
    }
  },
  computed: {
    hasChildren() {
      return this.node.children && this.node.children.length > 0
    }
  },
  methods: {
    toggleChildren() {
      this.showChildren = !this.showChildren
    },
    togglePermissions() {
      this.showPermissions = !this.showPermissions
      if (this.showPermissions) {
        this.loadPermissions()
      }
    },
    loadPermissions() {
      this.localPermissions = {}
      if (this.node.permissions && Array.isArray(this.node.permissions)) {
        this.node.permissions.forEach(perm => {
          const key = `${perm.module}_${perm.menu_key}`
          this.localPermissions[key] = { ...perm }
        })
      }
    },
    hasPermission(perm, type) {
      const key = `${perm.module}_${perm.menu_key}`
      if (this.localPermissions[key]) {
        return this.localPermissions[key][type] === true
      }
      return false
    },
    updatePermission(perm, type, value) {
      const key = `${perm.module}_${perm.menu_key}`
      if (!this.localPermissions[key]) {
        this.localPermissions[key] = {
          module: perm.module,
          menu_key: perm.menu_key,
          menu_title: perm.menu_title,
          read: false,
          write: false,
          visible: false
        }
      }
      this.localPermissions[key][type] = value
    },
    async savePermissions() {
      const permissions = Object.values(this.localPermissions)
      this.$emit('update-permissions', this.node.db_id || this.node.id, permissions)
      this.showPermissions = false
    },
    getPositionInitials(name) {
      if (!name) return '?'
      const words = name.split(' ')
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    },
    getLevelText(level) {
      const levels = {
        'executive': 'ผู้บริหาร',
        'manager': 'ผู้จัดการ',
        'supervisor': 'หัวหน้างาน',
        'staff': 'พนักงาน'
      }
      return levels[level] || level
    },
    getLevelBadgeClass(level) {
      const classes = {
        'executive': 'bg-purple-100 text-purple-700',
        'manager': 'bg-blue-100 text-blue-700',
        'supervisor': 'bg-green-100 text-green-700',
        'staff': 'bg-gray-100 text-gray-700'
      }
      return classes[level] || 'bg-gray-100 text-gray-700'
    },
    countPermissions(permissions, type) {
      if (!permissions || !Array.isArray(permissions)) return 0
      return permissions.filter(p => p[type] === true).length
    }
  }
}
</script>

<style scoped>
.org-node {
  position: relative;
  display: block;
  text-align: left;
  margin: 0;
  padding: 0;
}

/* Node wrapper with vertical line */
.node-wrapper {
  position: relative;
  display: block;
  margin: 8px 0;
}

/* Vertical line going down from node */
.has-children > .node-wrapper::after {
  content: "";
  position: absolute;
  width: 2px;
  height: calc(100% + 8px);
  background: transparent;
  border-left: 2px dashed #d1d5db;
  bottom: -8px;
  left: 20px;
  z-index: 1;
}

/* Expand button */
.expand-btn {
  position: absolute;
  top: 16px;
  left: 0;
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: #6b7280;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #9ca3af;
}

/* Node card */
.node-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 2px solid #e9d5ff;
  border-radius: 12px;
  padding: 10px 16px;
  margin-left: 30px;
  transition: all 0.3s;
  z-index: 2;
}

.node-card:hover {
  border-color: #c084fc;
  box-shadow: 0 4px 12px rgba(192, 132, 252, 0.2);
}

.node-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
}

.node-info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.node-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.node-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.node-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-badge {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.perm-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.perm-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.node-card:hover .node-actions {
  opacity: 1;
}

.node-actions button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.node-actions button:nth-child(1) {
  color: #10b981;
}
.node-actions button:nth-child(1):hover {
  background: #d1fae5;
}

.node-actions button:nth-child(2) {
  color: #3b82f6;
}
.node-actions button:nth-child(2):hover {
  background: #dbeafe;
}

.node-actions button:nth-child(3) {
  color: #6b7280;
}
.node-actions button:nth-child(3):hover {
  background: #f3f4f6;
}

.node-actions button:nth-child(4) {
  color: #ef4444;
}
.node-actions button:nth-child(4):hover {
  background: #fee2e2;
}

.children-count {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 12px;
  color: #374151;
  flex-shrink: 0;
}

.children-count span {
  font-weight: 700;
}

/* Children container */
.node-children {
  position: relative;
  margin-left: 40px;
  margin-top: 4px;
  padding-left: 0;
}

/* Horizontal line connector for children */
.node-children > .org-node::before {
  content: "";
  position: absolute;
  width: 20px;
  height: 2px;
  background: transparent;
  border-top: 2px dashed #d1d5db;
  top: 26px;
  left: 0;
}

/* Permissions Panel */
.permissions-panel {
  margin: 12px 0 12px 30px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.panel-header {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.panel-header button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
}

.panel-header button:hover {
  color: #4b5563;
}

.panel-empty {
  padding: 24px;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
}

.panel-content {
  padding: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.perm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: background 0.2s;
}

.perm-item:hover {
  background: #f3f4f6;
}

.perm-title {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.perm-checks {
  display: flex;
  gap: 8px;
}

.perm-checks label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.perm-checks input[type="checkbox"] {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  cursor: pointer;
}

.perm-checks i {
  font-size: 12px;
}

.panel-footer {
  border-top: 1px solid #e5e7eb;
  padding: 8px 12px;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  background: #9333ea;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #7e22ce;
}

.save-btn i {
  font-size: 11px;
}
</style>
