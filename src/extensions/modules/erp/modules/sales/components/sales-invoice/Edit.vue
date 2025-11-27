<template>
  <div class="redirect-notice">
    <h2>📄 Sales Invoice Edit</h2>
    <p>This component is now handled by the central Sales Order Edit component.</p>
    <p>Redirecting to unified document editor...</p>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'SalesInvoiceEditRedirect',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    onMounted(() => {
      // Redirect to central sales order edit with same ID
      const id = route.params.id
      router.replace(`/sales/sales-order/${id}/edit`)
    })
    
    return {}
  }
}
</script>

<style scoped>
.redirect-notice {
  padding: 40px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px;
}
</style>