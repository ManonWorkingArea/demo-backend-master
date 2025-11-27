<template>
  <Form
    v-if="recordId"
    mode="edit"
    :recordId="recordId"
    @saved="handleSaved"
    @cancel="handleCancel"
  />
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Form from './Form.vue'

export default {
  name: 'SupplierEdit',
  components: {
    Form
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const recordId = computed(() => {
      return route.params.id || route.query.id || null
    })

    const handleSaved = (result) => {
      console.log('[Supplier Edit] Record updated:', result)
      
      if (window.$toast) {
        window.$toast.success(
          result.status === 'draft' 
            ? 'บันทึกร่างเรียบร้อยแล้ว' 
            : 'แก้ไขข้อมูลผู้ขายเรียบร้อยแล้ว'
        )
      }
      
      if (result.status !== 'draft') {
        router.push('/purchase/suppliers')
      }
    }

    const handleCancel = () => {
      router.push('/purchase/suppliers')
    }

    return {
      recordId,
      handleSaved,
      handleCancel
    }
  }
}
</script>

