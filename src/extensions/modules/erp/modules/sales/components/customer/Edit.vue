<template>
  <CustomerFormSimple
    mode="edit"
    :record-id="$route.params.id"
    @saved="handleSaved"
    @cancel="handleCancel"
  />
</template>

<script>
import CustomerFormSimple from './FormSimple.vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * ✅ CUSTOMER EDIT - Simple wrapper for FormSimple in edit mode
 */
export default {
  name: 'CustomerEdit',
  components: {
    CustomerFormSimple
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const handleSaved = (result) => {
      const customerId = result.data?.id || route.params.id
      if (customerId) {
        router.push(`/sales/customers/${customerId}`)
      } else {
        router.push('/sales/customers')
      }
    }

    const handleCancel = () => {
      const customerId = route.params.id
      if (customerId) {
        router.push(`/sales/customers/${customerId}`)
      } else {
        router.push('/sales/customers')
      }
    }

    return {
      handleSaved,
      handleCancel
    }
  }
}
</script>