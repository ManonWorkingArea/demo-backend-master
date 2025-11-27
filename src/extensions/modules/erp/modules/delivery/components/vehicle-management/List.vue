<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Vehicle & Driver Management</h1>
            <p class="mt-2 text-gray-600">จัดการพาหนะและพนักงานขับรถ</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="addVehicle"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              เพิ่มพาหนะ
            </button>
            <button 
              @click="refreshData"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-sync mr-2"></i>
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/delivery/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Delivery Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Vehicle Management</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="vehicle-management-list">
      <!-- Vehicle and driver dashboard -->
    </div>
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Vehicle Management List
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'VehicleManagementList',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const delivery = getDeliveryModule()
    
    return {
      VEHICLE_TYPES: delivery.VEHICLE_TYPES || {},
      VEHICLE_STATES: delivery.VEHICLE_STATES || {},
      DRIVER_STATES: delivery.DRIVER_STATES || {}
    }
  }
}
</script>