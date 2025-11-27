<template>
  <!-- Package Assignment Modal -->
  <div v-if="show" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="bg-white px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">เลือก Package</h3>
              <p class="text-xs text-gray-500">พบ {{ availablePackages.length }} แพ็คเกจ</p>
            </div>
          </div>
          <button 
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">กำลังโหลดรายการ Package...</p>
        </div>

        <!-- Package List -->
        <div v-else-if="availablePackages.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div 
            v-for="pkg in availablePackages" 
            :key="pkg._id"
            class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
            @click="selectPackage(pkg)"
          >
            <!-- Package Header -->
            <div class="mb-3">
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-base font-semibold text-gray-900 truncate">{{ pkg.name }}</h4>
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded flex-shrink-0">Package</span>
              </div>
              <p class="text-gray-600 text-xs line-clamp-2">{{ pkg.description }}</p>
            </div>

            <!-- Pricing -->
            <div class="mb-3">
              <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div class="text-center mb-2">
                  <div class="text-xl font-bold text-gray-900">
                    ฿{{ formatPrice(pkg.pricing.basePrice) }}
                  </div>
                  <span class="text-gray-500 text-xs">/เดือน</span>
                </div>
                
                <!-- Billing Cycles - Compact -->
                <div v-if="pkg.pricing.billingCycles && pkg.pricing.billingCycles.length > 0" class="space-y-1">
                  <div 
                    v-for="cycle in pkg.pricing.billingCycles.slice(0, 2)" 
                    :key="cycle.type"
                    class="flex justify-between text-xs text-gray-600"
                  >
                    <span>{{ cycle.label.replace('รายเดือน', 'ม.').replace('รายไตรมาส', 'ไตร.').replace('รายปี', 'ปี') }}:</span>
                    <div>
                      <span class="font-medium">฿{{ formatPrice(cycle.price) }}</span>
                      <span v-if="cycle.discount > 0" class="text-green-600 ml-1">(-{{ cycle.discount }}%)</span>
                    </div>
                  </div>
                  <div v-if="pkg.pricing.billingCycles.length > 2" class="text-center">
                    <span class="text-xs text-gray-400">+{{ pkg.pricing.billingCycles.length - 2 }} รอบอื่น</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Limits - Compact Grid -->
            <div class="mb-3">
              <h5 class="text-xs font-medium text-gray-900 mb-2">ขีดจำกัด</h5>
              <div class="grid grid-cols-2 gap-1.5 text-xs">
                <div class="bg-gray-50 rounded p-1.5">
                  <div class="text-gray-500 text-xs">Assets</div>
                  <div class="font-medium text-gray-900 text-xs">
                    {{ pkg.limits.maxAssets === -1 ? '∞' : formatNumber(pkg.limits.maxAssets) }}
                  </div>
                </div>
                <div class="bg-gray-50 rounded p-1.5">
                  <div class="text-gray-500 text-xs">Users</div>
                  <div class="font-medium text-gray-900 text-xs">
                    {{ pkg.limits.maxUsers === -1 ? '∞' : formatNumber(pkg.limits.maxUsers) }}
                  </div>
                </div>
                <div class="bg-gray-50 rounded p-1.5">
                  <div class="text-gray-500 text-xs">Storage</div>
                  <div class="font-medium text-gray-900 text-xs">{{ formatStorage(pkg.limits.storageGB) }}</div>
                </div>
                <div class="bg-gray-50 rounded p-1.5">
                  <div class="text-gray-500 text-xs">Bandwidth</div>
                  <div class="font-medium text-gray-900 text-xs">{{ formatStorage(pkg.limits.bandwidth) }}</div>
                </div>
              </div>
            </div>

            <!-- Features - Compact List -->
            <div class="mb-3">
              <h5 class="text-xs font-medium text-gray-900 mb-2">คุณสมบัติ</h5>
              <div class="space-y-1">
                <div v-if="pkg.limits.customDomain" class="flex items-center text-xs text-gray-700">
                  <svg class="w-2.5 h-2.5 mr-1.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Custom Domain
                </div>
                <div v-if="pkg.limits.sslCertificate" class="flex items-center text-xs text-gray-700">
                  <svg class="w-2.5 h-2.5 mr-1.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  SSL Certificate
                </div>
                <div v-if="pkg.limits.apiAccess" class="flex items-center text-xs text-gray-700">
                  <svg class="w-2.5 h-2.5 mr-1.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  API Access
                </div>
                <div v-if="pkg.limits.prioritySupport" class="flex items-center text-xs text-gray-700">
                  <svg class="w-2.5 h-2.5 mr-1.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Priority Support
                </div>
              </div>
            </div>

            <!-- Select Button -->
            <button 
              @click="selectPackage(pkg)"
              class="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors"
            >
              เลือกและตั้งค่า
            </button>
          </div>
        </div>

        <!-- No Packages -->
        <div v-else class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบ Package ที่พร้อมใช้งาน</h3>
          <p class="text-gray-500 text-sm">กรุณาติดต่อผู้ดูแลระบบเพื่อขอข้อมูลเพิ่มเติม</p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex justify-end">
          <button 
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PackageAssignmentModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    availablePackages: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close', 'select-package'],
  
  methods: {
    selectPackage(selectedPackage) {
      this.$emit('select-package', selectedPackage);
    },

    // Format Price
    formatPrice(value) {
      if (!value) return '0.00';
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },

    // Format Number
    formatNumber(value) {
      if (!value) return '0';
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      return value.toString();
    },

    // Format Storage
    formatStorage(value) {
      if (!value) return '0 GB';
      if (value >= 1024) {
        return (value / 1024).toFixed(1) + ' TB';
      }
      return value + ' GB';
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 