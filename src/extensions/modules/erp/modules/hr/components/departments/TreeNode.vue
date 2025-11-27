<template>
  <li>
    <!-- Node Card (using <a> tag like example) -->
    <a href="#" @click.prevent>
      <OrganizationNode
        :node="node"
        :department-permissions="departmentPermissions"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @remove="$emit('remove', $event)"
        @update-permissions="$emit('update-permissions', $event)"
      />
    </a>
    
    <!-- Children -->
    <ul v-if="node.children && node.children.length > 0">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :department-permissions="departmentPermissions"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @remove="$emit('remove', $event)"
        @update-permissions="$emit('update-permissions', $event)"
      />
    </ul>
  </li>
</template>

<script>
import OrganizationNode from './OrganizationNode.vue'

export default {
  name: 'TreeNode',
  components: {
    OrganizationNode
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    departmentPermissions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['add-child', 'edit', 'remove', 'update-permissions']
}
</script>

<style scoped>
/* No styles needed - will use global tree styles */
</style>
