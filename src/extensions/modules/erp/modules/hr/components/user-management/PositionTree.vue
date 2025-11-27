<template>
  <div class="position-tree">
    <div v-for="node in nodeList" :key="node.db_id || node.id" class="position-node">
      <div class="node-content">
        <label class="radio-label" :class="{ 'is-selected': value === (node.db_id || node.id) }">
          <input 
            type="radio" 
            :name="name" 
            :value="node.db_id || node.id" 
            :checked="value === (node.db_id || node.id)"
            @change="$emit('input', node.db_id || node.id)"
          >
          <span class="position-name">
            {{ node.position_name || node.name }}
            <span v-if="node.position_code || node.code" class="position-code">({{ node.position_code || node.code }})</span>
          </span>
        </label>
      </div>
      
      <!-- Recursive Children -->
      <div v-if="node.children && node.children.length > 0" class="node-children">
        <position-tree 
          :nodes="node.children" 
          :value="value" 
          :name="name"
          @input="$emit('input', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PositionTree',
  props: {
    nodes: {
      type: [Array, Object],
      default: () => []
    },
    value: {
      type: [String, Number],
      default: ''
    },
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    nodeList() {
      if (Array.isArray(this.nodes)) {
        return this.nodes
      } else if (this.nodes && typeof this.nodes === 'object') {
        return [this.nodes]
      }
      return []
    }
  }
}
</script>

<style scoped>
.position-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.position-node {
  display: flex;
  flex-direction: column;
}

.node-content {
  display: flex;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
  width: 100%;
}

.radio-label:hover {
  background-color: #f3f4f6;
}

.radio-label.is-selected {
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.radio-label input[type="radio"] {
  margin: 0;
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
  cursor: pointer;
}

.position-name {
  font-size: 14px;
}

.position-code {
  color: #6b7280;
  font-size: 12px;
  margin-left: 4px;
}

.node-children {
  margin-left: 24px; /* Indentation */
  padding-left: 12px;
  border-left: 1px solid #e5e7eb;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>