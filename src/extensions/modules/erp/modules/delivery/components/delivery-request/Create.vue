<template>
  <div class="delivery-request-create">
    <h2>Create Delivery Request</h2>
    <!-- Delivery request creation form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Delivery Request Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'DeliveryRequestCreate',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const getSalesModule = () => {
      return window.ERP_CORE?.modules?.sales || {}
    }

    const delivery = getDeliveryModule()
    const sales = getSalesModule()
    
    return {
      DELIVERY_STATES: delivery.DELIVERY_STATES || {},
      DELIVERY_TYPES: delivery.DELIVERY_TYPES || {},
      SALES_ORDER_STATES: sales.SALES_ORDER_STATES || {}
    }
  }
}
</script>