<template>
  <div class="delivery-request-edit">
    <h2>Edit Delivery Request</h2>
    <!-- Delivery request edit form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Delivery Request Edit
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'DeliveryRequestEdit',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const delivery = getDeliveryModule()
    
    return {
      DELIVERY_STATES: delivery.DELIVERY_STATES || {},
      DELIVERY_TYPES: delivery.DELIVERY_TYPES || {}
    }
  }
}
</script>