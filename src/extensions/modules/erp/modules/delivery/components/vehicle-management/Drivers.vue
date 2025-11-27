<template>
  <div class="vehicle-management-drivers">
    <h2>Driver Management</h2>
    <!-- Driver list and management -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Vehicle Management Drivers
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'VehicleManagementDrivers',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const delivery = getDeliveryModule()
    
    return {
      DRIVER_STATES: delivery.DRIVER_STATES || {},
      LICENSE_TYPES: delivery.LICENSE_TYPES || {}
    }
  }
}
</script>