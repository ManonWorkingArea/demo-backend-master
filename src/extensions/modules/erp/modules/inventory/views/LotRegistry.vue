<!-- Lot Registry Management Page -->
<template>
  <div class="lot-registry-page">
    <!-- Page Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-layer-group mr-3 text-blue-600"></i>
              จัดการ Lot Registry
            </h1>
            <p class="text-gray-600 mt-1">จัดการสต็อกสินค้าแบบ Lot สำหรับผ้า</p>
          </div>
          
          <!-- Quick Actions -->
          <div class="flex items-center space-x-3">
            <div class="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
              <i class="fas fa-info-circle text-blue-600 mr-2"></i>
              <span class="text-sm text-blue-700">รูปแบบ: XXX-XXX-XXX-XXXXX</span>
            </div>
            
            <button
              @click="refreshData"
              :disabled="refreshing"
              class="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i :class="refreshing ? 'fas fa-spinner fa-spin' : 'fas fa-sync'" class="mr-2"></i>
              {{ refreshing ? 'กำลังโหลด...' : 'รีเฟรช' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-gray-50">
      <div class="px-6 py-6">
        <!-- Navigation Breadcrumb -->
        <nav class="flex mb-6" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li>
              <router-link to="/inventory" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-boxes mr-1"></i>
                คลังสินค้า
              </router-link>
            </li>
            <li>
              <i class="fas fa-chevron-right text-gray-400 mx-2"></i>
            </li>
            <li>
              <span class="text-gray-900 font-medium">Lot Registry</span>
            </li>
          </ol>
        </nav>

        <!-- Lot Registry List Component -->
        <LotRegistryList />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { LotRegistryList } from '../components/lot-registry'

export default {
  name: 'LotRegistryPage',
  components: {
    LotRegistryList
  },
  setup() {
    const refreshing = ref(false)
    
    const refreshData = async () => {
      refreshing.value = true
      
      try {
        // Force refresh by emitting to child component
        window.dispatchEvent(new CustomEvent('refresh-lot-registry'))
        
        // Simulate loading delay
        setTimeout(() => {
          refreshing.value = false
        }, 1000)
      } catch (error) {
        console.error('❌ Error refreshing data:', error)
        refreshing.value = false
      }
    }
    
    return {
      refreshing,
      refreshData
    }
  }
}
</script>

<style scoped>
.lot-registry-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}
</style>