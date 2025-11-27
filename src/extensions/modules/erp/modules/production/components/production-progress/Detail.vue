<template>
  <div class="production-progress-detail">
    <h2>Production Progress Detail</h2>
    <!-- Detailed progress view -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Production Progress Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'ProductionProgressDetail',
  setup() {
    const getProductionModule = () => {
      return window.ERP_CORE?.modules?.production || {}
    }

    const production = getProductionModule()
    
    return {
      PROGRESS_STATES: production.PROGRESS_STATES || {},
      PRODUCTION_STEPS: production.PRODUCTION_STEPS || {}
    }
  }
}
</script>