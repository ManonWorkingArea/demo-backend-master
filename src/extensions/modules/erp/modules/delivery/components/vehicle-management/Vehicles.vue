<template>
  <div class="vehicle-management-vehicles">
    <h2>Vehicle Management</h2>
    <!-- Vehicle list and management -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Vehicle Management Vehicles
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'VehicleManagementVehicles',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const delivery = getDeliveryModule()
    
    return {
      VEHICLE_TYPES: delivery.VEHICLE_TYPES || {},
      VEHICLE_STATES: delivery.VEHICLE_STATES || {}
    }
  }
}
</script>