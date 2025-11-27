<template>
  <div class="stock-reservation-create">
    <h2>Create Stock Reservation</h2>
    <!-- Reservation creation form -->
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Stock Reservation Create
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'StockReservationCreate',
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