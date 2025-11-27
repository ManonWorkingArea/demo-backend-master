<template>
  <FormComplete
    mode="create"
    @saved="handleSaved"
    @cancel="handleCancel"
  />
</template>

<script>
/**
 * ✅ SIMPLIFIED SUPPLIER ADD COMPONENT 
 * ใช้ FormSimple.vue component ที่เรียบง่าย
 */
import { useRouter } from 'vue-router'
import FormComplete from './FormComplete.vue'

export default {
  name: 'SupplierAdd',
  components: {
    FormComplete
  },
  setup() {
    const router = useRouter()

    // ✅ Event Handlers
    const handleSaved = (result) => {
      console.log('[Supplier Add] Record created:', result)
      
      // Show success message (handled in FormSimple)
      // Navigate back to supplier list
      router.push({
        name: 'purchase-suppliers',
        query: { 
          created: result.data.id || 'new',
          status: 'success'
        }
      })
    }

    const handleCancel = () => {
      console.log('[Supplier Add] Cancelled')
      
      // Navigate back to supplier list
      router.push({ name: 'purchase-suppliers' })
    }

    return {
      handleSaved,
      handleCancel
    }
  }
}
</script>

