<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb -->
    <ErpBreadcrumb :nav="breadcrumbNav" />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">แก้ไข Invoice</h1>
        <p class="text-gray-600">ฟีเจอร์นี้กำลังพัฒนา - Invoice ไม่ควรแก้ไขหลังจากสร้างแล้ว</p>
        <p class="text-sm text-gray-500 mt-2">
          หากต้องการแก้ไขข้อมูล ควรยกเลิก Invoice นี้และสร้างใหม่จาก Quotation
        </p>
        
        <div class="mt-6">
          <button 
            @click="$router.back()"
            class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
          >
            <i class="fas fa-arrow-left mr-2"></i>กลับ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ErpBreadcrumb } from '@/extensions/modules/erp'

export default {
  name: 'InvoiceEdit',
  components: {
    ErpBreadcrumb
  },
  setup() {
    const breadcrumbNav = ref([
      { name: 'Home', path: '/', icon: 'fas fa-home' },
      { name: 'Sales', path: '/sales', icon: 'fas fa-shopping-cart' },
      { name: 'Invoices', path: '/sales/invoice', icon: 'fas fa-file-invoice-dollar' },
      { name: 'Edit Invoice' }
    ])
    
    return {
      breadcrumbNav
    }
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>
