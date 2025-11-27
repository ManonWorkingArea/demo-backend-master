<template>
  <QuotationForm 
    mode="edit"
    :record-id="quotationId"
    @saved="handleSaved"
    @navigate="handleNavigate"
  />
</template>

<script>
import QuotationForm from './shared/QuotationForm.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'QuotationEdit',
  components: {
    QuotationForm
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const quotationId = computed(() => route.params.id)

    const handleSaved = (result) => {
      console.log('[Quotation Edit] Quotation updated:', result)
      // Additional logic if needed
    }

    const handleNavigate = (navigation) => {
      console.log('[Quotation Edit] Navigation requested:', navigation)
      if (navigation.route && router) {
        router.push(navigation.route)
      }
    }

    return {
      quotationId,
      handleSaved,
      handleNavigate
    }
  }
}
</script>