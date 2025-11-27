<template>
  <div class="shipment-tracking-detail">
    <h2>Shipment Detail</h2>
    <!-- Detailed shipment tracking view -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Shipment Tracking Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'ShipmentTrackingDetail',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const delivery = getDeliveryModule()
    
    return {
      SHIPMENT_STATES: delivery.SHIPMENT_STATES || {},
      TRACKING_EVENTS: delivery.TRACKING_EVENTS || {}
    }
  }
}
</script>