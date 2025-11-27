<template>
  <div class="production-qc-detail">
    <h2>QC Detail</h2>
    <!-- QC inspection detail view -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Production QC Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'ProductionQcDetail',
  setup() {
    const getProductionModule = () => {
      return window.ERP_CORE?.modules?.production || {}
    }

    const production = getProductionModule()
    
    return {
      QC_STATES: production.QC_STATES || {},
      QC_TEST_TYPES: production.QC_TEST_TYPES || {}
    }
  }
}
</script>