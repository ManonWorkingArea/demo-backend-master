<template>
  <div class="stock-reservation-detail">
    <h2>Stock Reservation Detail</h2>
    <!-- Reservation detail view -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Reservation Detail
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockReservationDetail',
  setup() {
    const getInventoryModule = () => {
      return window.ERP_CORE?.modules?.inventory || {}
    }

    const inventory = getInventoryModule()
    
    return {
      RESERVATION_STATES: inventory.RESERVATION_STATES || {}
    }
  }
}
</script>