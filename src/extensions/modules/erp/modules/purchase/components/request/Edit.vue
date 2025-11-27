<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
    </div>
  </div>
  
  <PurchaseRequestForm 
    v-else-if="formData"
    :initialData="formData"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
  
  <div v-else class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
      <p class="text-gray-600">ไม่พบข้อมูลใบขอซื้อ</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PurchaseRequestForm from './PurchaseRequestForm.vue'

/**
 * ✅ CORE-ONLY ACCESS HELPER
 * เข้าถึง ERP_CORE ผ่าน global window object เท่านั้น
 */
const getCore = () => {
  if (typeof window !== 'undefined' && window.ERP_CORE) {
    return window.ERP_CORE
  }
  throw new Error('[Edit] ERP_CORE not available - must use Core-Only Access pattern')
}

const router = useRouter()
const route = useRoute()

const requestId = ref(route.params.id)
const formData = ref(null)
const loading = ref(true)

const loadData = async () => {
  try {
    const core = getCore()
    // ใช้ core.engine.read แทน window.ERP_CORE.engine.read
    const result = await core.engine.read('purchase', requestId.value)
    
    if (result && result.success && result.data) {
      formData.value = result.data
    } else {
      core.showNotification('error', 'ไม่พบข้อมูลใบขอซื้อ', 'Purchase Request')
    }
  } catch (error) {
    const core = getCore()
    core.showNotification('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message, 'Purchase Request')
    console.error('Load purchase request error:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (updatedData) => {
  try {
    const core = getCore()
    // ใช้ core.engine.update แทน window.ERP_CORE.engine.update
    const result = await core.engine.update('purchase', requestId.value, updatedData, 'user')
    
    if (result && result.success) {
      core.showNotification('success', 'แก้ไขใบขอซื้อสำเร็จ', 'Purchase Request')
      // ไปหน้ารายละเอียดใบขอซื้อ
      router.push(`/purchase/purchase-request/${requestId.value}`)
    } else {
      core.showNotification('error', result?.message || 'เกิดข้อผิดพลาดในการบันทึก', 'Purchase Request')
    }
  } catch (error) {
    const core = getCore()
    core.showNotification('error', 'เกิดข้อผิดพลาดในการบันทึก: ' + error.message, 'Purchase Request')
    console.error('Update purchase request error:', error)
  }
}

const handleCancel = () => {
  // กลับไปหน้ารายละเอียดใบขอซื้อ
  router.push(`/purchase/purchase-request/${requestId.value}`)
}

onMounted(() => {
  loadData()
})
</script>

