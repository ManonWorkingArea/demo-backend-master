<template>
  <div class="route-planning-create">
    <h2>Create Route</h2>
    <!-- Route creation form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Route Planning Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'RoutePlanningCreate',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const delivery = getDeliveryModule()
    
    return {
      ROUTE_STATES: delivery.ROUTE_STATES || {},
      VEHICLE_TYPES: delivery.VEHICLE_TYPES || {}
    }
  }
}
</script>