<template>
  <div class="min-h-screen bg-gray-50">
    <div class="delivery-order-list">
      <h2>Delivery Order (DO)</h2>
      <!-- Delivery order list with tracking -->
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/sales/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Sales Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Delivery Order</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Delivery Order List
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'DeliveryOrderList',
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
      DELIVERY_STATES: delivery.DELIVERY_STATES || {},
      TRACKING_STATES: delivery.TRACKING_STATES || {}
    }
  }
}
</script>