<template>
  <DepartmentForm :departmentId="departmentId" />
</template>

<script>
import DepartmentForm from './Form.vue'

export default {
  name: 'DepartmentEdit',
  components: {
    DepartmentForm
  },
  computed: {
    departmentId() {
      return this.$route.params.id
    }
  }
}
</script>
