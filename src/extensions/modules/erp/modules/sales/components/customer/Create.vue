<template>
  <CustomerFormSimple
    mode="create"
    @saved="handleSaved"
    @cancel="handleCancel"
  />
</template>

<script>
import CustomerFormSimple from './FormSimple.vue'
import { useRouter } from 'vue-router'

/**
 * ✅ CUSTOMER CREATE - Simple wrapper for FormSimple in create mode
 */
export default {
  name: 'CustomerCreate',
  components: {
    CustomerFormSimple
  },
  setup() {
    const router = useRouter()

    const handleSaved = (result) => {
      if (result.success && result.data?.id) {
        router.push(`/sales/customers/${result.data.id}`)
      } else {
        router.push('/sales/customers')
      }
    }

    const handleCancel = () => {
      router.push('/sales/customers')
    }

    return {
      handleSaved,
      handleCancel
    }
  }
}
</script>

