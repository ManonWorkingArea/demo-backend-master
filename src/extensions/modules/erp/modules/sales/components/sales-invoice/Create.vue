<template>
  <div class="redirect-notice">
    <h2>📄 Sales Invoice Create</h2>
    <p>This component is now handled by the central Sales Order Create component.</p>
    <p>Redirecting to unified document creation...</p>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SalesInvoiceCreateRedirect',
  setup() {
    const router = useRouter()
    
    onMounted(() => {
      // Redirect to central sales order create
      router.replace('/sales/sales-order/create')
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