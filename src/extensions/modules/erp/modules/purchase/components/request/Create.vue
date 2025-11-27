<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600">กำลังประมวลผล...</p>
      </div>
    </div>
    
    <!-- Form Component -->
    <PurchaseRequestForm 
      v-else-if="!isDestroyed"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    
    <!-- Fallback State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import PurchaseRequestForm from './PurchaseRequestForm.vue'

const router = useRouter()
const isDestroyed = ref(false)
const loading = ref(false)

// ✅ ป้องกัน DOM errors เมื่อ component ถูก unmount
onUnmounted(() => {
  isDestroyed.value = true
})

const handleSubmit = async (submitResult) => {
  // ✅ ตรวจสอบว่า component ยังอยู่หรือไม่
  if (isDestroyed.value) {
    console.log('[Create.vue] Component already destroyed, skipping handler')
    return
  }
  
  console.log('[Create.vue] handleSubmit called with:', submitResult)
  
  try {
    loading.value = true
    
    if (submitResult && submitResult.success) {
      console.log('[Create.vue] Purchase request created successfully')
      
      // ✅ รอให้ DOM update เสร็จก่อน redirect
      await nextTick()
      
      // ✅ เพิ่ม delay เล็กน้อยเพื่อให้ UI settle และ database sync
      setTimeout(async () => {
        if (!isDestroyed.value) {
          const requestId = submitResult.data?.id || submitResult.data?._id
          if (requestId) {
            console.log('[Create.vue] Navigating to detail page with ID:', requestId)
            // ✅ ไปหน้า detail ของ request ที่สร้างใหม่ (ใช้ชื่อ route ที่ถูกต้อง)
            router.push({ 
              name: 'purchase-pr-detail', 
              params: { id: requestId } 
            })
          } else {
            console.log('[Create.vue] No ID found, navigating to list')
            // ✅ ไปหน้า list ถ้าไม่มี ID (ใช้ชื่อ route ที่ถูกต้อง)
            router.push({ name: 'purchase-purchase-request' })
          }
        }
      }, 200) // เพิ่ม delay จาก 100ms เป็น 200ms
      
    } else if (submitResult && submitResult.success === false) {
      console.error('[Create.vue] Purchase request creation failed:', submitResult.error)
      // Error message จะแสดงจาก PurchaseRequestForm แล้ว
      loading.value = false
    } else {
      console.warn('[Create.vue] Unexpected submit result:', submitResult)
      loading.value = false
    }
  } catch (error) {
    console.error('[Create.vue] Error handling submit:', error)
    loading.value = false
  }
}

const handleCancel = () => {
  if (isDestroyed.value) return
  
  loading.value = true
  
  // ✅ รอให้ DOM update เสร็จก่อน redirect
  nextTick(() => {
    router.push({ name: 'purchase-purchase-request' })
  })
}
</script>

