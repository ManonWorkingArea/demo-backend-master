<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">รายละเอียดลูกค้า</h1>
            <p class="mt-2 text-gray-600">ข้อมูลลูกค้า {{ customerData?.name || '' }}</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="editCustomer"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-edit mr-2"></i>
              แก้ไข
            </button>
            <button 
              v-if="canDelete"
              @click="deleteCustomer"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-trash mr-2"></i>
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-lg p-6">
              <div class="h-6 bg-gray-200 rounded mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          <div class="space-y-6">
            <div class="bg-white rounded-lg p-6">
              <div class="h-6 bg-gray-200 rounded mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
          <i class="fas fa-exclamation-triangle text-red-600 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button 
            @click="loadCustomerData"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-redo mr-2"></i>
            ลองใหม่
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลพื้นฐาน</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">รหัสลูกค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-mono">{{ customerData?.customer_code || '-' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อลูกค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-medium">{{ customerData?.name || '-' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทลูกค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ customerTypeText }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">กลุ่มลูกค้า</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ customerGroupText }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <span
                      :class="getStatusClass(customerData?.status)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ statusText }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เลขประจำตัวผู้เสียภาษี</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ customerData?.tax_id || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลติดต่อ</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ผู้ติดต่อ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ customerData?.contact_person || '-' }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <a v-if="customerData?.phone" :href="`tel:${customerData.phone}`" class="text-blue-600 hover:text-blue-700">
                      {{ customerData.phone }}
                    </a>
                    <span v-else class="text-gray-900">-</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <a v-if="customerData?.email" :href="`mailto:${customerData.email}`" class="text-blue-600 hover:text-blue-700">
                      {{ customerData.email }}
                    </a>
                    <span v-else class="text-gray-900">-</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เว็บไซต์</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <a v-if="customerData?.website" :href="customerData.website" target="_blank" class="text-blue-600 hover:text-blue-700">
                      {{ customerData.website }}
                    </a>
                    <span v-else class="text-gray-900">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ที่อยู่</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 gap-6">
                <div v-if="customerData?.address">
                  <label class="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ customerData.address }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div v-if="customerData?.province">
                    <label class="block text-sm font-medium text-gray-700 mb-2">จังหวัด</label>
                    <div class="p-3 bg-gray-50 rounded-lg border">
                      <p class="text-gray-900">{{ customerData.province }}</p>
                    </div>
                  </div>
                  <div v-if="customerData?.postal_code">
                    <label class="block text-sm font-medium text-gray-700 mb-2">รหัสไปรษณีย์</label>
                    <div class="p-3 bg-gray-50 rounded-lg border">
                      <p class="text-gray-900">{{ customerData.postal_code }}</p>
                    </div>
                  </div>
                  <div v-if="customerData?.country">
                    <label class="block text-sm font-medium text-gray-700 mb-2">ประเทศ</label>
                    <div class="p-3 bg-gray-50 rounded-lg border">
                      <p class="text-gray-900">{{ customerData.country }}</p>
                    </div>
                  </div>
                </div>
                <div v-if="!customerData?.address" class="text-center py-8 text-gray-500">
                  <i class="fas fa-map-marker-alt text-4xl mb-4 opacity-50"></i>
                  <p>ไม่มีข้อมูลที่อยู่</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Credit Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลเครดิต</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">เงื่อนไขการชำระเงิน</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900">{{ paymentTermsText }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">วงเงินเครดิต</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold text-lg">{{ formatCurrency(customerData?.credit_limit) }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ยอดค้างชำระ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold" :class="{ 'text-red-600': isOverCreditLimit }">
                      {{ formatCurrency(customerData?.outstanding_balance) }}
                    </p>
                  </div>
                </div>
                <div v-if="customerData?.credit_limit > 0">
                  <label class="block text-sm font-medium text-gray-700 mb-2">เครดิตคงเหลือ</label>
                  <div class="p-3 bg-gray-50 rounded-lg border">
                    <p class="text-gray-900 font-semibold text-green-600">{{ formatCurrency(remainingCredit) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status & Actions -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">สถานะ</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="text-center">
                <span
                  :class="getStatusClass(customerData?.status)"
                  class="inline-flex px-4 py-2 text-sm font-semibold rounded-full"
                >
                  {{ statusText?.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Meta Information -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">ข้อมูลระบบ</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สร้าง</label>
                <p class="text-sm text-gray-600">{{ formatDate(customerData?.created_date) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">แก้ไขล่าสุด</label>
                <p class="text-sm text-gray-600">{{ formatDate(customerData?.updated_date) }}</p>
              </div>
              <div v-if="customerData?.created_by">
                <label class="block text-sm font-medium text-gray-700 mb-1">สร้างโดย</label>
                <p class="text-sm text-gray-600">{{ customerData.created_by }}</p>
              </div>
              <div v-if="customerData?.updated_by">
                <label class="block text-sm font-medium text-gray-700 mb-1">แก้ไขโดย</label>
                <p class="text-sm text-gray-600">{{ customerData.updated_by }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h3 class="text-lg font-semibold mb-4">สถิติ</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm opacity-90">วงเงินเครดิต</span>
                <span class="font-semibold">{{ formatCurrency(customerData?.credit_limit || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm opacity-90">ยอดค้างชำระ</span>
                <span class="font-semibold">{{ formatCurrency(customerData?.outstanding_balance || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm opacity-90">เครดิตคงเหลือ</span>
                <span class="font-semibold">{{ formatCurrency(remainingCredit) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm opacity-90">สถานะ</span>
                <span class="font-semibold">{{ statusText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'CustomerDetail',
  components: {
    ErpBreadcrumb
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const error = ref(null)
    const customerData = ref(null)

    // ✅ Safe SalesService injection
    let salesService = null
    try {
      salesService = inject('salesService')
      if (!salesService) {
        console.log('[Customer Detail] No injected SalesService, will import dynamically')
      }
    } catch (err) {
      console.log('[Customer Detail] Injection failed, will import SalesService:', err.message)
    }

    // Breadcrumb
    const breadcrumbNav = computed(() => {
      return [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
        { name: 'Customers', path: '/sales/customers', icon: 'fas fa-users' },
        { name: customerData.value?.name || 'Customer Detail' }
      ]
    })

    // Computed properties
    const statusClass = computed(() => {
      const status = customerData.value?.status
      return {
        'status-active': status === 'active',
        'status-inactive': status === 'inactive',
        'status-suspended': status === 'suspended',
        'status-blacklisted': status === 'blacklisted'
      }
    })

    const statusText = computed(() => {
      const statusMap = {
        'active': 'ใช้งาน',
        'inactive': 'ไม่ใช้งาน',
        'suspended': 'ระงับการใช้งาน',
        'blacklisted': 'บัญชีดำ'
      }
      return statusMap[customerData.value?.status] || '-'
    })

    const customerTypeText = computed(() => {
      const typeMap = {
        'individual': 'บุคคลธรรมดา',
        'corporate': 'นิติบุคคล',
        'government': 'หน่วยงานราชการ',
        'non-profit': 'องค์กรไม่แสวงหากำไร'
      }
      return typeMap[customerData.value?.customer_type] || '-'
    })

    const customerGroupText = computed(() => {
      const groupMap = {
        'retail': 'ลูกค้าปลีก',
        'wholesale': 'ลูกค้าส่ง',
        'distributor': 'ผู้จัดจำหน่าย',
        'vip': 'ลูกค้า VIP',
        'regular': 'ลูกค้าทั่วไป'
      }
      return groupMap[customerData.value?.customer_group] || '-'
    })

    const paymentTermsText = computed(() => {
      const termsMap = {
        'cash': 'เงินสด',
        'credit_7': 'เครดิต 7 วัน',
        'credit_15': 'เครดิต 15 วัน',
        'credit_30': 'เครดิต 30 วัน',
        'credit_45': 'เครดิต 45 วัน',
        'credit_60': 'เครดิต 60 วัน',
        'credit_90': 'เครดิต 90 วัน'
      }
      return termsMap[customerData.value?.payment_terms] || '-'
    })

    const remainingCredit = computed(() => {
      const limit = customerData.value?.credit_limit || 0
      const outstanding = customerData.value?.outstanding_balance || 0
      return Math.max(0, limit - outstanding)
    })

    const isOverCreditLimit = computed(() => {
      const limit = customerData.value?.credit_limit || 0
      const outstanding = customerData.value?.outstanding_balance || 0
      return limit > 0 && outstanding > limit
    })

    const canDelete = computed(() => {
      // Can delete if customer has no outstanding balance and no transactions
      return customerData.value?.outstanding_balance === 0
    })

    // Methods
    const loadCustomerData = async () => {
      const customerId = route.params.id
      if (!customerId) {
        error.value = 'ไม่พบรหัสลูกค้า'
        loading.value = false
        return
      }

      try {
        console.log('[Customer Detail] Loading customer:', customerId)
        
        // ✅ Use SalesService to get customer data
        let result
        if (salesService && salesService.getCustomer) {
          console.log('[Customer Detail] Using injected SalesService...')
          result = await salesService.getCustomer(customerId)
        } else {
          // ✅ Dynamic import if not available
          console.log('[Customer Detail] Importing SalesService dynamically...')
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.getCustomer(customerId)
        }
        
        if (result && result.id) {
          customerData.value = result
          console.log('[Customer Detail] Loaded customer data:', result)
        } else {
          throw new Error('ไม่พบข้อมูลลูกค้า')
        }
      } catch (err) {
        console.error('[Customer Detail] Load error:', err)
        error.value = err.message || 'ไม่สามารถโหลดข้อมูลลูกค้าได้'
      } finally {
        loading.value = false
      }
    }

    const editCustomer = () => {
      const customerId = route.params.id
      console.log(`🔗 Navigating to edit customer: /sales/customers/${customerId}/edit`)
      router.push(`/sales/customers/${customerId}/edit`)
    }

    const deleteCustomer = async () => {
      if (!confirm('คุณแน่ใจว่าต้องการลบลูกค้านี้?')) {
        return
      }

      try {
        const customerId = route.params.id
        console.log(`🗑️ Deleting customer: ${customerId}`)
        
        // ✅ Use SalesService to delete customer
        let result
        if (salesService && salesService.deleteCustomer) {
          console.log('[Customer Detail] Using injected SalesService for delete...')
          result = await salesService.deleteCustomer(customerId)
        } else {
          // ✅ Dynamic import if not available
          console.log('[Customer Detail] Importing SalesService dynamically for delete...')
          const { salesService: newSalesService } = await import('@/services/SalesService.js')
          if (!newSalesService.isReady()) {
            newSalesService.initialize(window.vueApp?.config?.globalProperties)
          }
          result = await newSalesService.deleteCustomer(customerId)
        }
        
        if (result && result.success) {
          console.log('✅ Customer deleted successfully')
          
          // Show success notification using Vue Toast if available
          if (window.$toast) {
            window.$toast.success('ลบลูกค้าเรียบร้อยแล้ว')
          }
          
          // Navigate to customer list
          router.push('/sales/customers')
        } else {
          throw new Error(result?.message || 'ไม่สามารถลบลูกค้าได้')
        }
      } catch (err) {
        console.error('❌ Error deleting customer:', err)
        
        // Show error notification using Vue Toast if available
        if (window.$toast) {
          window.$toast.error(err.message || 'ไม่สามารถลบลูกค้าได้')
        } else {
          alert(`เกิดข้อผิดพลาด: ${err.message}`)
        }
      }
    }

    // Utility methods
    const getStatusClass = (status) => {
      const statusClasses = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-yellow-100 text-yellow-800',
        blacklisted: 'bg-red-100 text-red-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2
      }).format(amount || 0)
    }

    const formatDate = (date) => {
      if (!date) return '-'
      
      try {
        const d = new Date(date)
        return new Intl.DateTimeFormat('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(d)
      } catch (err) {
        return '-'
      }
    }

    // Lifecycle
    onMounted(() => {
      loadCustomerData()
    })

    return {
      loading,
      error,
      customerData,
      breadcrumbNav,
      statusClass,
      statusText,
      customerTypeText,
      customerGroupText,
      paymentTermsText,
      remainingCredit,
      isOverCreditLimit,
      canDelete,
      loadCustomerData,
      editCustomer,
      deleteCustomer,
      getStatusClass,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Custom animations */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Hover animations */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>