<template>
  <!-- Loading State -->
  <div v-if="loading" class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-sm p-12 text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">กำลังโหลดข้อมูลสินค้า</h3>
      <p class="text-gray-600">กรุณารอสักครู่...</p>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-sm p-12 text-center">
      <i class="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <div class="flex justify-center space-x-3">
        <button 
          @click="loadProduct"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <i class="fas fa-redo mr-2"></i>
          ลองใหม่
        </button>
        <router-link 
          to="/inventory/products"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          กลับไปรายการ
        </router-link>
      </div>
    </div>
  </div>

  <!-- Form Content -->
  <ProductForm 
    v-else-if="product"
    mode="edit"
    :product="product"
    @save="onProductSaved"
    @cancel="onCancel"
  />
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductForm from './shared/Form.vue'

export default {
  name: 'ProductEdit',
  components: {
    ProductForm
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    // State
    const loading = ref(false)
    const product = ref(null)
    const error = ref(null)

    // Methods
    const loadProduct = async () => {
      const productId = route.params.id
      if (!productId) {
        error.value = 'ไม่พบรหัสสินค้า'
        return
      }

      loading.value = true
      error.value = null

      try {
        console.log('🔍 Loading product for edit:', productId)
        
        // ✅ ใช้ InventoryService แทน engine.read
        const productData = await window.ERP_CORE.inventory.getProduct(productId)
        
        if (productData) {
          product.value = productData
          console.log('✅ Product loaded for edit:', product.value)
        } else {
          error.value = 'ไม่พบข้อมูลสินค้า'
          console.error('❌ Failed to load product')
        }
      } catch (err) {
        error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า: ' + err.message
        console.error('❌ Error loading product:', err)
      } finally {
        loading.value = false
      }
    }

    const onProductSaved = (updatedProduct) => {
      console.log('Product updated:', updatedProduct)
      // Navigate to the product detail page
      if (updatedProduct && updatedProduct.id) {
        router.push(`/inventory/products/${updatedProduct.id}`)
      } else {
        router.push('/inventory/products')
      }
    }

    const onCancel = () => {
      // Navigate back to product detail or list
      if (product.value && product.value.id) {
        router.push(`/inventory/products/${product.value.id}`)
      } else {
        router.push('/inventory/products')
      }
    }

    // Lifecycle
    onMounted(() => {
      // ✅ Initialize InventoryService with component instance
      if (window.ERP_CORE?.inventory) {
        try {
          const instance = getCurrentInstance()
          const componentProxy = instance?.proxy || instance
          
          window.ERP_CORE.inventory.initialize(componentProxy)
          console.log('[Product Edit] ✅ InventoryService initialized')
        } catch (error) {
          console.error('[Product Edit] ❌ Failed to initialize InventoryService:', error)
        }
      }
      
      loadProduct()
    })

    return {
      loading,
      product,
      error,
      loadProduct,
      onProductSaved,
      onCancel
    }
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>