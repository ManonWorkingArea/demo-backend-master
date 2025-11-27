<template>
  <div class="delivery-order-detail">
    <h2>Delivery Order Detail</h2>
    <!-- Delivery order detail view -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Delivery Order Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'DeliveryOrderDetail',
  setup() {
    const getSalesModule = () => {
      return window.ERP_CORE?.modules?.sales || {}
    }

    const sales = getSalesModule()
    
    return {
      DELIVERY_ORDER_STATES: sales.DELIVERY_ORDER_STATES || {}
    }
  }
}
</script>