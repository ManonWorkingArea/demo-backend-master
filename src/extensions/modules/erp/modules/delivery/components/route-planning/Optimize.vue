<template>
  <div class="route-planning-optimize">
    <h2>Route Optimization</h2>
    <!-- Route optimization interface -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Route Planning Optimize
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'RoutePlanningOptimize',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const delivery = getDeliveryModule()
    
    return {
      OPTIMIZATION_TYPES: delivery.OPTIMIZATION_TYPES || {},
      ROUTE_ALGORITHMS: delivery.ROUTE_ALGORITHMS || {}
    }
  }
}
</script>