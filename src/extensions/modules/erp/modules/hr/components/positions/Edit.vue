<template>
  <div>
    <PositionForm :positionId="positionId" />
  </div>
</template>

<script>
import PositionForm from './Form.vue'

export default {
  name: 'PositionEdit',
  components: {
    PositionForm
  },
  computed: {
    positionId() {
      return this.$route.params.id
    }
  }
}
</script>