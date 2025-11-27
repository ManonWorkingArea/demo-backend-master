<template>
  <div class="delivery-order-create">
    <h2>Create Delivery Order</h2>
    <!-- Delivery order creation form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Delivery Order Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'DeliveryOrderCreate',
  setup() {
    const getSalesModule = () => {
      return window.ERP_CORE?.modules?.sales || {}
    }

    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const sales = getSalesModule()
    const delivery = getDeliveryModule()
    
    return {
      DELIVERY_ORDER_STATES: sales.DELIVERY_ORDER_STATES || {},
      DELIVERY_TYPES: delivery.DELIVERY_TYPES || {},
      VEHICLE_TYPES: delivery.VEHICLE_TYPES || {}
    }
  }
}
</script>