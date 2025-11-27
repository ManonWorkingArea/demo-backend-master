<template>
  <div class="redirect-notice">
    <h2>📄 Sales Invoice Detail</h2>
    <p>This component is now handled by the central Sales Order Detail component.</p>
    <p>Redirecting to unified document view...</p>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'SalesInvoiceDetailRedirect',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    onMounted(() => {
      // Redirect to central sales order detail with same ID
      const id = route.params.id
      router.replace(`/sales/sales-order/${id}`)
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