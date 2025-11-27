<template>
  <div class="customer-add">
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/sales" class="breadcrumb-item">
            <i class="fas fa-chart-line"></i>
            Sales
          </router-link>
          <i class="fas fa-chevron-right"></i>
          <router-link to="/sales/customers" class="breadcrumb-item">
            ลูกค้า
          </router-link>
          <i class="fas fa-chevron-right"></i>
          <span class="breadcrumb-current">เพิ่มลูกค้าใหม่</span>
        </div>
        
        <h1>
          <i class="fas fa-user-plus"></i>
          เพิ่มลูกค้าใหม่
        </h1>
      </div>
    </div>

    <div class="page-content">
      <!-- Debug Panel -->
      <div v-if="showDebug" class="debug-panel">
        <h3>🔧 Debug Information</h3>
        <p><strong>Component:</strong> CustomerAdd</p>
        <p><strong>Form Component:</strong> {{ CustomerForm ? 'Loaded' : 'Not Loaded' }}</p>
        <p><strong>Route:</strong> {{ $route.path }}</p>
        <button @click="showDebug = false" class="btn btn-sm">ปิด Debug</button>
      </div>
      
      <!-- Error Fallback -->
      <div v-if="formError" class="error-fallback">
        <div class="alert alert-error">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <strong>เกิดข้อผิดพลาดในการโหลดฟอร์ม</strong>
            <p>{{ formError }}</p>
            <button @click="retryForm" class="btn btn-outline btn-sm">ลองใหม่</button>
          </div>
        </div>
      </div>
      
      <!-- Main Form -->
      <CustomerForm
        v-else
        mode="create"
        @saved="handleSaved"
        @cancel="handleCancel"
        @error="handleFormError"
      />
      
      <!-- Debug Toggle -->
      <button 
        @click="showDebug = !showDebug" 
        class="debug-toggle"
        style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; background: #4299e1; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;"
      >
        🔧
      </button>
    </div>
  </div>
</template>

<script>
import CustomerForm from './FormSimple.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

/**
 * ✅ CUSTOMER ADD - Customer Addition Component
 * Complete customer creation with proper routing and error handling
 */
export default {
  name: 'CustomerAdd',
  components: {
    CustomerForm
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const showDebug = ref(false)
    const formError = ref(null)

    console.log('🚀 CustomerAdd component loaded')
    console.log('📦 CustomerForm component:', CustomerForm)
    console.log('🛣️ Current route:', route.path)

    const handleSaved = (result) => {
      console.log('✅ Customer saved successfully:', result)
      
      // Navigate to customer detail or list
      if (result.success && result.data?.id) {
        console.log(`🔗 Navigating to customer detail: /sales/customers/${result.data.id}`)
        router.push(`/sales/customers/${result.data.id}`)
      } else {
        console.log('🔗 Navigating to customer list')
        router.push('/sales/customers')
      }
    }

    const handleCancel = () => {
      console.log('❌ Customer add cancelled')
      // Navigate back to customer list
      router.push('/sales/customers')
    }

    const handleFormError = (error) => {
      console.error('❌ Form error:', error)
      formError.value = error.message || 'เกิดข้อผิดพลาดในฟอร์ม'
    }

    const retryForm = () => {
      console.log('🔄 Retrying form load')
      formError.value = null
    }

    return {
      CustomerForm,
      showDebug,
      formError,
      handleSaved,
      handleCancel,
      handleFormError,
      retryForm
    }
  }
}
</script>

<style scoped>
.customer-add {
  min-height: 100vh;
  background: #f7fafc;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #4299e1;
}

.breadcrumb-current {
  color: #2d3748;
  font-weight: 500;
}

.breadcrumb i.fas.fa-chevron-right {
  color: #cbd5e0;
  font-size: 12px;
}

.page-header h1 {
  margin: 0;
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header h1 i {
  color: #48bb78;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.debug-panel {
  background: #f0f8ff;
  border: 2px solid #4299e1;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.debug-panel h3 {
  margin: 0 0 12px 0;
  color: #2d3748;
}

.debug-panel p {
  margin: 4px 0;
  font-size: 14px;
}

.error-fallback {
  margin-bottom: 20px;
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
}

.alert-error {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  color: #c53030;
}

.alert i {
  font-size: 20px;
  margin-top: 2px;
}

.alert div {
  flex: 1;
}

.alert strong {
  display: block;
  margin-bottom: 4px;
}

.alert p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-outline {
  background: transparent;
  color: #4299e1;
  border-color: #4299e1;
}

.btn-outline:hover {
  background: #4299e1;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}
</style>