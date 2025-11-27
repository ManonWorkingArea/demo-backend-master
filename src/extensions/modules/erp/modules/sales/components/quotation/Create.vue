<template>
  <QuotationForm 
    mode="create"
    @saved="handleSaved"
    @navigate="handleNavigate"
  />
</template>

<script>
import QuotationForm from './shared/QuotationForm.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'QuotationCreate',
  components: {
    QuotationForm
  },
  setup() {
    const router = useRouter()

    const handleSaved = (result) => {
      console.log('[Quotation Create] Quotation saved:', result)
      // Additional logic if needed
    }

    const handleNavigate = (navigation) => {
      console.log('[Quotation Create] Navigation requested:', navigation)
      if (navigation.route && router) {
        router.push(navigation.route)
      }
    }

    return {
      handleSaved,
      handleNavigate
    }
  }
}
</script>