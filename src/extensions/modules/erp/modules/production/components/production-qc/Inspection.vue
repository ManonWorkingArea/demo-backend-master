<template>
  <div class="production-qc-inspection">
    <h2>QC Inspection</h2>
    <!-- Quality inspection interface -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Production QC Inspection
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'ProductionQcInspection',
  setup() {
    const getProductionModule = () => {
      return window.ERP_CORE?.modules?.production || {}
    }

    const production = getProductionModule()
    
    return {
      QC_STATES: production.QC_STATES || {},
      QC_TEST_TYPES: production.QC_TEST_TYPES || {},
      QC_STANDARDS: production.QC_STANDARDS || {}
    }
  }
}
</script>