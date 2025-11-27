<template>
  <div class="product-details-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-box-open"></i>
          รายละเอียดสินค้า
        </h2>
        <div class="header-actions">
          <button 
            @click="$emit('edit', product)" 
            class="btn-action btn-edit"
            title="แก้ไขสินค้า"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button 
            @click="$emit('close')" 
            class="btn-action btn-close"
            title="ปิด"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>กำลังโหลดข้อมูลสินค้า...</p>
        </div>

        <div v-else-if="product" class="product-details">
          <!-- Status Badge -->
          <div class="status-section">
            <div class="status-badge" :class="`status-${product.status}`">
              <i :class="getStatusIcon(product.status)"></i>
              {{ formatStatus(product.status) }}
            </div>
            <div class="last-updated">
              <i class="fas fa-clock"></i>
              อัปเดตล่าสุด: {{ formatDateTime(product.updated_at) }}
            </div>
          </div>

          <!-- Basic Information -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              ข้อมูลพื้นฐาน
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">รหัสสินค้า</label>
                <div class="detail-value code-value">
                  <span>{{ product.product_code || product.sku || 'ไม่ระบุ' }}</span>
                  <button 
                    v-if="product.product_code || product.sku"
                    @click="copyToClipboard(product.product_code || product.sku)"
                    class="btn-copy"
                    title="คัดลอก"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              
              <div class="detail-item">
                <label class="detail-label">SKU</label>
                <div class="detail-value code-value">
                  <span>{{ product.sku || 'ไม่ระบุ' }}</span>
                  <button 
                    v-if="product.sku"
                    @click="copyToClipboard(product.sku)"
                    class="btn-copy"
                    title="คัดลอก"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              
              <div class="detail-item full-width">
                <label class="detail-label">ชื่อสินค้า</label>
                <div class="detail-value product-name">
                  {{ product.product_name || product.name || 'ไม่ระบุ' }}
                </div>
              </div>
              
              <div class="detail-item full-width" v-if="product.description">
                <label class="detail-label">คำอธิบาย</label>
                <div class="detail-value description">
                  {{ product.description }}
                </div>
              </div>
            </div>
          </div>

          <!-- Inventory & Pricing -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-calculator"></i>
              สต็อกและราคา
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">หน่วยนับ</label>
                <div class="detail-value">
                  <i class="fas fa-cube"></i>
                  {{ product.unit || 'ชิ้น' }}
                </div>
              </div>
              
              <div class="detail-item">
                <label class="detail-label">ราคาต่อหน่วย</label>
                <div class="detail-value price-value">
                  <i class="fas fa-tag"></i>
                  {{ formatCurrency(product.unit_price || 0) }}
                </div>
              </div>
              
              <div class="detail-item">
                <label class="detail-label">สต็อกปัจจุบัน</label>
                <div class="detail-value stock-value" :class="getStockLevelClass(currentStock, product.min_stock)">
                  <i :class="getStockIcon(currentStock, product.min_stock)"></i>
                  {{ formatNumber(currentStock) }} {{ product.unit || 'ชิ้น' }}
                </div>
              </div>
              
              <div class="detail-item">
                <label class="detail-label">สต็อกขั้นต่ำ</label>
                <div class="detail-value">
                  <i class="fas fa-exclamation-triangle"></i>
                  {{ formatNumber(product.min_stock || 0) }} {{ product.unit || 'ชิ้น' }}
                </div>
              </div>
            </div>

            <!-- Stock Alert -->
            <div v-if="showStockAlert" class="stock-alert" :class="stockAlertType">
              <i :class="stockAlertIcon"></i>
              <div class="alert-content">
                <div class="alert-title">{{ stockAlertTitle }}</div>
                <div class="alert-message">{{ stockAlertMessage }}</div>
              </div>
            </div>
          </div>

          <!-- Category & Supplier -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-tags"></i>
              หมวดหมู่และผู้จำหน่าย
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label class="detail-label">หมวดหมู่</label>
                <div class="detail-value category-value">
                  <i class="fas fa-folder"></i>
                  {{ formatCategory(product.category) }}
                </div>
              </div>
              
              <div class="detail-item">
                <label class="detail-label">ผู้จำหน่าย</label>
                <div class="detail-value supplier-value">
                  <i class="fas fa-building"></i>
                  <span>{{ product.supplier || 'ไม่ระบุ' }}</span>
                  <span v-if="product.supplier_id" class="supplier-id">
                    (ID: {{ product.supplier_id }})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity History -->
          <div class="detail-section" v-if="activityHistory && activityHistory.length > 0">
            <h3 class="section-title">
              <i class="fas fa-history"></i>
              ประวัติการเคลื่อนไหว
              <span class="activity-count">({{ activityHistory.length }} รายการ)</span>
            </h3>
            <div class="activity-timeline">
              <div 
                v-for="(activity, index) in activityHistory.slice(0, 5)" 
                :key="index"
                class="activity-item"
              >
                <div class="activity-icon" :class="`activity-${activity.type}`">
                  <i :class="getActivityIcon(activity.type)"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.description }}</div>
                  <div class="activity-meta">
                    <span class="activity-date">{{ formatDateTime(activity.timestamp) }}</span>
                    <span v-if="activity.user" class="activity-user">
                      โดย {{ activity.user }}
                    </span>
                    <span v-if="activity.quantity" class="activity-quantity">
                      จำนวน: {{ formatNumber(activity.quantity) }} {{ product.unit || 'ชิ้น' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-if="activityHistory.length > 5" class="activity-more">
                <button @click="showAllActivity = !showAllActivity" class="btn-link">
                  <i :class="showAllActivity ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                  {{ showAllActivity ? 'ซ่อน' : `ดูเพิ่มเติม (${activityHistory.length - 5} รายการ)` }}
                </button>
              </div>
              
              <!-- Extended Activity List -->
              <div v-if="showAllActivity" class="activity-extended">
                <div 
                  v-for="(activity, index) in activityHistory.slice(5)" 
                  :key="`ext-${index}`"
                  class="activity-item"
                >
                  <div class="activity-icon" :class="`activity-${activity.type}`">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.description }}</div>
                    <div class="activity-meta">
                      <span class="activity-date">{{ formatDateTime(activity.timestamp) }}</span>
                      <span v-if="activity.user" class="activity-user">
                        โดย {{ activity.user }}
                      </span>
                      <span v-if="activity.quantity" class="activity-quantity">
                        จำนวน: {{ formatNumber(activity.quantity) }} {{ product.unit || 'ชิ้น' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Transactions -->
          <div class="detail-section" v-if="relatedTransactions && relatedTransactions.length > 0">
            <h3 class="section-title">
              <i class="fas fa-exchange-alt"></i>
              ธุรกรรมที่เกี่ยวข้อง
              <span class="transaction-count">({{ relatedTransactions.length }} รายการ)</span>
            </h3>
            <div class="transaction-list">
              <div 
                v-for="transaction in relatedTransactions.slice(0, 3)" 
                :key="transaction.id"
                class="transaction-item"
              >
                <div class="transaction-type" :class="`type-${transaction.type}`">
                  <i :class="getTransactionIcon(transaction.type)"></i>
                  {{ formatTransactionType(transaction.type) }}
                </div>
                <div class="transaction-info">
                  <div class="transaction-quantity">
                    {{ transaction.type === 'stock_out' ? '-' : '+' }}{{ formatNumber(transaction.quantity) }}
                    {{ product.unit || 'ชิ้น' }}
                  </div>
                  <div class="transaction-date">{{ formatDateTime(transaction.created_at) }}</div>
                </div>
              </div>
              
              <div v-if="relatedTransactions.length > 3" class="transaction-more">
                <button @click="$emit('view-transactions', product)" class="btn-link">
                  <i class="fas fa-external-link-alt"></i>
                  ดูธุรกรรมทั้งหมด ({{ relatedTransactions.length }} รายการ)
                </button>
              </div>
            </div>
          </div>

          <!-- System Information -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-database"></i>
              ข้อมูลระบบ
            </h3>
            <div class="detail-grid system-info">
              <div class="detail-item">
                <label class="detail-label">วันเวลาที่สร้าง</label>
                <div class="detail-value">
                  <i class="fas fa-calendar-plus"></i>
                  {{ formatDateTime(product.created_at) }}
                </div>
              </div>
              
              <div class="detail-item">
                <label class="detail-label">อัปเดตล่าสุด</label>
                <div class="detail-value">
                  <i class="fas fa-calendar-check"></i>
                  {{ formatDateTime(product.updated_at) }}
                </div>
              </div>
              
              <div class="detail-item" v-if="product.id">
                <label class="detail-label">Product ID</label>
                <div class="detail-value code-value">
                  <span>{{ product.id }}</span>
                  <button 
                    @click="copyToClipboard(product.id)"
                    class="btn-copy"
                    title="คัดลอก"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="error-state">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>ไม่พบข้อมูลสินค้า</h3>
          <p>ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="footer-actions">
          <button 
            @click="refreshData" 
            class="btn btn-outline"
            :disabled="loading"
          >
            <i class="fas fa-sync" :class="{ 'fa-spin': loading }"></i>
            รีเฟรช
          </button>
          
          <button 
            @click="$emit('edit', product)" 
            class="btn btn-primary"
            :disabled="!product || loading"
          >
            <i class="fas fa-edit"></i>
            แก้ไขสินค้า
          </button>
          
          <button 
            @click="$emit('close')" 
            class="btn btn-outline"
          >
            <i class="fas fa-times"></i>
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'ProductDetails',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'edit', 'view-transactions'],
  setup(props) {
    
    // State
    const loading = ref(false)
    const currentStock = ref(0)
    const activityHistory = ref([])
    const relatedTransactions = ref([])
    const showAllActivity = ref(false)
    
    // Computed
    const showStockAlert = computed(() => {
      const stock = currentStock.value
      const minStock = props.product?.min_stock || 0
      return stock <= minStock
    })
    
    const stockAlertType = computed(() => {
      const stock = currentStock.value
      const minStock = props.product?.min_stock || 0
      
      if (stock === 0) return 'alert-danger'
      if (stock <= minStock * 0.5) return 'alert-warning'
      if (stock <= minStock) return 'alert-info'
      return 'alert-success'
    })
    
    const stockAlertIcon = computed(() => {
      const stock = currentStock.value
      if (stock === 0) return 'fas fa-times-circle'
      if (stock <= (props.product?.min_stock || 0)) return 'fas fa-exclamation-triangle'
      return 'fas fa-check-circle'
    })
    
    const stockAlertTitle = computed(() => {
      const stock = currentStock.value
      const minStock = props.product?.min_stock || 0
      
      if (stock === 0) return 'สินค้าหมด'
      if (stock <= minStock * 0.5) return 'สต็อกต่ำมาก'
      if (stock <= minStock) return 'สต็อกใกล้หมด'
      return 'สต็อกปกติ'
    })
    
    const stockAlertMessage = computed(() => {
      const stock = currentStock.value
      const minStock = props.product?.min_stock || 0
      const unit = props.product?.unit || 'ชิ้น'
      
      if (stock === 0) {
        return `สินค้าหมดสต็อก กรุณาเติมสต็อกให้อย่างน้อย ${minStock} ${unit}`
      }
      if (stock <= minStock * 0.5) {
        return `สต็อกต่ำมาก เหลือเพียง ${stock} ${unit} (ต่ำกว่า 50% ของขั้นต่ำ)`
      }
      if (stock <= minStock) {
        return `สต็อกใกล้หมด เหลือ ${stock} ${unit} (ขั้นต่ำ: ${minStock} ${unit})`
      }
      return `สต็อกเพียงพอ มี ${stock} ${unit} (ขั้นต่ำ: ${minStock} ${unit})`
    })
    
    // Methods
    const formatStatus = (status) => {
      const statusLabels = {
        'active': 'ใช้งาน',
        'inactive': 'ไม่ใช้งาน',
        'discontinued': 'หยุดผลิต',
        'draft': 'ร่าง'
      }
      return statusLabels[status] || status
    }
    
    const getStatusIcon = (status) => {
      const statusIcons = {
        'active': 'fas fa-check-circle',
        'inactive': 'fas fa-pause-circle',
        'discontinued': 'fas fa-times-circle',
        'draft': 'fas fa-edit'
      }
      return statusIcons[status] || 'fas fa-question-circle'
    }
    
    const formatDateTime = (dateString) => {
      if (!dateString) return 'ไม่ระบุ'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'ไม่ระบุ'
      }
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount || 0)
    }
    
    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH').format(number || 0)
    }
    
    const formatCategory = (category) => {
      const categoryLabels = {
        'General': 'ทั่วไป',
        'Electronics': 'อิเล็กทรอนิกส์',
        'Food & Beverage': 'อาหารและเครื่องดื่ม',
        'Clothing & Fashion': 'เสื้อผ้าและแฟชั่น',
        'Tools & Equipment': 'เครื่องมือและอุปกรณ์',
        'Materials & Supplies': 'วัสดุและอุปกรณ์',
        'Office Supplies': 'อุปกรณ์สำนักงาน',
        'Medical & Health': 'การแพทย์และสุขภาพ',
        'Automotive': 'ยานยนต์',
        'Home & Garden': 'บ้านและสวน'
      }
      return categoryLabels[category] || category
    }
    
    const getStockLevelClass = (stock, minStock) => {
      if (stock === 0) return 'stock-empty'
      if (stock <= minStock * 0.5) return 'stock-critical'
      if (stock <= minStock) return 'stock-low'
      return 'stock-normal'
    }
    
    const getStockIcon = (stock, minStock) => {
      if (stock === 0) return 'fas fa-times-circle'
      if (stock <= minStock * 0.5) return 'fas fa-exclamation-triangle'
      if (stock <= minStock) return 'fas fa-exclamation-circle'
      return 'fas fa-check-circle'
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        'created': 'fas fa-plus-circle',
        'updated': 'fas fa-edit',
        'stock_in': 'fas fa-arrow-down',
        'stock_out': 'fas fa-arrow-up',
        'adjustment': 'fas fa-balance-scale',
        'transfer': 'fas fa-exchange-alt'
      }
      return icons[type] || 'fas fa-circle'
    }
    
    const getTransactionIcon = (type) => {
      const icons = {
        'stock_in': 'fas fa-arrow-down text-green-500',
        'stock_out': 'fas fa-arrow-up text-red-500',
        'adjustment': 'fas fa-balance-scale text-blue-500',
        'transfer': 'fas fa-exchange-alt text-purple-500'
      }
      return icons[type] || 'fas fa-circle'
    }
    
    const formatTransactionType = (type) => {
      const typeLabels = {
        'stock_in': 'รับเข้า',
        'stock_out': 'จ่ายออก',
        'adjustment': 'ปรับปรุง',
        'transfer': 'โอนย้าย'
      }
      return typeLabels[type] || type
    }
    
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        console.log('📋 Copied to clipboard:', text)
        
        if (window.$toast) {
          window.$toast.success('คัดลอกแล้ว: ' + text)
        }
      } catch (error) {
        console.error('❌ Failed to copy:', error)
        
        // Fallback method
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (window.$toast) {
          window.$toast.info('คัดลอกแล้ว')
        }
      }
    }
    
    const loadCurrentStock = async () => {
      if (!props.product?.id) return
      
      try {
        console.log('📊 Loading current stock for product:', props.product.id)
        
        if (window.ERP_CORE?.engine) {
          const inventoryResult = await window.ERP_CORE.engine.list('inventory', {
            filters: { product_id: props.product.id }
          })
          
          if (inventoryResult?.success && inventoryResult?.data?.length > 0) {
            const totalStock = inventoryResult.data.reduce((sum, item) => {
              return sum + (Number(item.quantity) || 0)
            }, 0)
            
            currentStock.value = totalStock
            console.log('✅ Current stock loaded:', totalStock)
          } else {
            currentStock.value = 0
            console.log('📦 No inventory records found')
          }
        } else {
          currentStock.value = 0
        }
        
      } catch (error) {
        console.error('❌ Error loading stock:', error)
        currentStock.value = 0
      }
    }
    
    const loadActivityHistory = async () => {
      if (!props.product?.id) return
      
      try {
        console.log('📈 Loading activity history for product:', props.product.id)
        
        const activities = []
        
        // Add creation activity
        if (props.product.created_at) {
          activities.push({
            type: 'created',
            description: 'สร้างข้อมูลสินค้า',
            timestamp: props.product.created_at,
            user: 'System'
          })
        }
        
        // Add update activity
        if (props.product.updated_at && props.product.updated_at !== props.product.created_at) {
          activities.push({
            type: 'updated',
            description: 'อัปเดตข้อมูลสินค้า',
            timestamp: props.product.updated_at,
            user: 'System'
          })
        }
        
        // Load from transaction history if available
        if (window.ERP_CORE?.engine) {
          const transactionResult = await window.ERP_CORE.engine.list('inventory', {
            filters: { product_id: props.product.id },
            limit: 10,
            sort: { created_at: -1 }
          })
          
          if (transactionResult?.success && transactionResult?.data) {
            transactionResult.data.forEach(transaction => {
              activities.push({
                type: transaction.transaction_type || 'stock_in',
                description: `${transaction.transaction_type === 'stock_out' ? 'จ่ายออก' : 'รับเข้า'}สินค้า`,
                timestamp: transaction.created_at,
                user: transaction.created_by || 'System',
                quantity: transaction.quantity
              })
            })
          }
        }
        
        // Sort by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        
        activityHistory.value = activities
        console.log('✅ Activity history loaded:', activities.length, 'items')
        
      } catch (error) {
        console.error('❌ Error loading activity history:', error)
        activityHistory.value = []
      }
    }
    
    const loadRelatedTransactions = async () => {
      if (!props.product?.id) return
      
      try {
        console.log('🔄 Loading related transactions for product:', props.product.id)
        
        if (window.ERP_CORE?.engine) {
          const result = await window.ERP_CORE.engine.list('inventory', {
            filters: { product_id: props.product.id },
            limit: 10,
            sort: { created_at: -1 }
          })
          
          if (result?.success && result?.data) {
            relatedTransactions.value = result.data
            console.log('✅ Related transactions loaded:', result.data.length)
          } else {
            relatedTransactions.value = []
          }
        } else {
          relatedTransactions.value = []
        }
        
      } catch (error) {
        console.error('❌ Error loading transactions:', error)
        relatedTransactions.value = []
      }
    }
    
    const refreshData = async () => {
      loading.value = true
      
      try {
        await Promise.all([
          loadCurrentStock(),
          loadActivityHistory(),
          loadRelatedTransactions()
        ])
        
        console.log('🔄 Product details refreshed')
        
        if (window.$toast) {
          window.$toast.success('รีเฟรชข้อมูลแล้ว')
        }
      } catch (error) {
        console.error('❌ Error refreshing data:', error)
        
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการรีเฟรชข้อมูล')
        }
      } finally {
        loading.value = false
      }
    }
    
    // Watchers
    watch(() => props.product, (newProduct) => {
      if (newProduct?.id) {
        refreshData()
      }
    }, { immediate: true })
    
    // Lifecycle
    onMounted(() => {
      if (props.product?.id) {
        refreshData()
      }
    })
    
    return {
      // State
      loading,
      currentStock,
      activityHistory,
      relatedTransactions,
      showAllActivity,
      
      // Computed
      showStockAlert,
      stockAlertType,
      stockAlertIcon,
      stockAlertTitle,
      stockAlertMessage,
      
      // Methods
      formatStatus,
      getStatusIcon,
      formatDateTime,
      formatCurrency,
      formatNumber,
      formatCategory,
      getStockLevelClass,
      getStockIcon,
      getActivityIcon,
      getTransactionIcon,
      formatTransactionType,
      copyToClipboard,
      refreshData
    }
  }
}
</script>

<style scoped>
/* Modal Styles */
.product-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.modal-title i {
  color: #3b82f6;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-action.btn-edit {
  background: #10b981;
  color: white;
}

.btn-action.btn-edit:hover {
  background: #059669;
}

.btn-action.btn-close {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-action.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

/* Loading and Error States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  font-size: 48px;
  color: #3b82f6;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #374151;
  margin: 0 0 8px 0;
}

.error-state p {
  color: #6b7280;
  margin: 0;
}

/* Product Details */
.product-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 14px;
}

.status-badge.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.status-discontinued {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.status-draft {
  background: #fef3c7;
  color: #92400e;
}

.last-updated {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Detail Sections */
.detail-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px 0;
}

.section-title i {
  color: #3b82f6;
  font-size: 14px;
}

.activity-count, .transaction-count {
  font-weight: 400;
  color: #6b7280;
  font-size: 14px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-grid.system-info {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-value i {
  color: #6b7280;
  font-size: 12px;
}

.code-value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.btn-copy {
  width: 24px;
  height: 24px;
  border: none;
  background: #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  font-size: 10px;
}

.btn-copy:hover {
  background: #cbd5e1;
  color: #374151;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.description {
  line-height: 1.5;
  color: #4b5563;
}

.price-value {
  font-size: 16px;
  font-weight: 600;
  color: #059669;
}

.stock-value {
  font-weight: 600;
}

.stock-value.stock-empty {
  color: #dc2626;
}

.stock-value.stock-critical {
  color: #ea580c;
}

.stock-value.stock-low {
  color: #ca8a04;
}

.stock-value.stock-normal {
  color: #059669;
}

.category-value {
  background: #ede9fe;
  color: #6b46c1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.supplier-value {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.supplier-id {
  font-size: 10px;
  color: #6b7280;
  font-family: monospace;
}

/* Stock Alert */
.stock-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.stock-alert.alert-danger {
  background: #fee2e2;
  border-left: 4px solid #dc2626;
}

.stock-alert.alert-warning {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.stock-alert.alert-info {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
}

.stock-alert i {
  font-size: 18px;
  margin-top: 2px;
}

.alert-danger i {
  color: #dc2626;
}

.alert-warning i {
  color: #f59e0b;
}

.alert-info i {
  color: #3b82f6;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.alert-danger .alert-title {
  color: #991b1b;
}

.alert-warning .alert-title {
  color: #92400e;
}

.alert-info .alert-title {
  color: #1e40af;
}

.alert-message {
  font-size: 13px;
  opacity: 0.8;
}

/* Activity Timeline */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  color: white;
}

.activity-icon.activity-created {
  background: #10b981;
}

.activity-icon.activity-updated {
  background: #3b82f6;
}

.activity-icon.activity-stock_in {
  background: #059669;
}

.activity-icon.activity-stock_out {
  background: #dc2626;
}

.activity-icon.activity-adjustment {
  background: #7c3aed;
}

.activity-icon.activity-transfer {
  background: #f59e0b;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-title {
  font-weight: 500;
  color: #374151;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.activity-date {
  color: #9ca3af;
}

.activity-user {
  color: #6b7280;
}

.activity-quantity {
  color: #059669;
  font-weight: 500;
}

.activity-more, .transaction-more {
  text-align: center;
  padding: 12px;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}

.btn-link:hover {
  color: #1d4ed8;
}

.activity-extended {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

/* Transaction List */
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.transaction-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
}

.transaction-type.type-stock_in {
  color: #059669;
}

.transaction-type.type-stock_out {
  color: #dc2626;
}

.transaction-type.type-adjustment {
  color: #7c3aed;
}

.transaction-type.type-transfer {
  color: #f59e0b;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.transaction-quantity {
  font-weight: 600;
  font-size: 14px;
}

.transaction-date {
  font-size: 12px;
  color: #6b7280;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .status-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .header-actions {
    order: -1;
    align-self: flex-end;
  }
  
  .footer-actions {
    width: 100%;
    justify-content: center;
  }
  
  .activity-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .transaction-info {
    align-items: flex-start;
  }
}

/* Utilities */
.text-green-500 {
  color: #10b981;
}

.text-red-500 {
  color: #ef4444;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-purple-500 {
  color: #8b5cf6;
}
</style>