<template>
  <Form 
    mode="create"
    @saved="handleSaved"
    @cancel="handleCancel"
  />
</template>
 
<script>
import { useRouter } from 'vue-router'
import Form from './Form.vue'

export default {
  name: 'SupplierNew',
  components: {
    Form
  },
  setup() {
    const router = useRouter()

    const handleSaved = (result) => {
      console.log('[Supplier New] Record created:', result)
      
      if (window.$toast) {
        window.$toast.success(
          result.status === 'draft' 
            ? 'บันทึกร่างผู้ขายเรียบร้อยแล้ว' 
            : 'เพิ่มผู้ขายเรียบร้อยแล้ว'
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
      handleSaved,
      handleCancel
    }
  }
}
</script>

