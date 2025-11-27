<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Delivery Settings</h1>
            <p class="mt-2 text-gray-600">ตั้งค่าระบบจัดส่ง</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="saveSettings"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-save mr-2"></i>
              บันทึก
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
                <span class="text-sm font-medium text-gray-500">Settings</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="delivery-settings">
      <!-- System configuration settings -->
    </div>
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT - Delivery Settings
 * ใช้ Dynamic Module Loading
 */
export default {
  name: 'DeliverySettings',
  setup() {
    const getDeliveryModule = () => {
      return window.ERP_CORE?.modules?.delivery || {}
    }

    const delivery = getDeliveryModule()
    
    return {
      SETTING_CATEGORIES: delivery.SETTING_CATEGORIES || {},
      DEFAULT_VALUES: delivery.DEFAULT_VALUES || {}
    }
  }
}
</script>