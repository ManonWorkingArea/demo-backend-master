<template>
  <div class="sales-manager">
    <!-- Manager Header -->
    <div class="manager-header">
      <div class="header-content">
        <div class="title-section">
          <h2>
            <i class="fas fa-shopping-cart"></i>
            การจัดการขาย (Sales Management)
          </h2>
          <p class="subtitle">จัดการใบเสนอราคา ใบสั่งขาย และติดตามการขาย</p>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-outline btn-sm" @click="debugStats">
            <i class="fas fa-bug"></i>
            Debug
          </button>
          <button class="btn btn-outline btn-sm" @click="debugStatistics">
            <i class="fas fa-chart-bar"></i>
            Debug Stats
          </button>
          <button class="btn btn-outline" @click="refreshData">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            รีเฟรช
          </button>
          <button class="btn btn-primary" @click="$router.push('/sales/sales-order/create')">
            <i class="fas fa-plus"></i>
            สร้างใบขายใหม่
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.quoted }}</h3>
          <p>ใบเสนอราคา + ร่าง</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.confirmed }}</h3>
          <p>ใบสั่งขายยืนยัน</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="fas fa-shipping-fast"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.pendingDelivery }}</h3>
          <p>รอจัดส่ง</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatCurrency(stats.todaySales) }}</h3>
          <p>ยอดขายวันนี้</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>กำลังโหลดข้อมูลการขาย...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="sales.length === 0" class="empty-state">
        <i class="fas fa-shopping-cart"></i>
        <h3>ยังไม่มีใบขายในระบบ</h3>
        <p>เริ่มต้นด้วยการสร้างใบขายแรกของคุณ</p>
        <button class="btn btn-primary" @click="$router.push('/sales/sales-order/create')">
          <i class="fas fa-plus"></i>
          สร้างใบขายใหม่
        </button>
      </div>
      
      <!-- Sales Orders Table -->
      <div v-else class="sales-table-container">
        <div class="table-header">
          <h3>รายการใบขาย</h3>
          <div class="table-actions">
            <input 
              type="text" 
              placeholder="ค้นหาใบขาย..." 
              class="search-input"
            >
            <select class="filter-select">
              <option value="">สถานะทั้งหมด</option>
              <option value="draft">ร่าง</option>
              <option value="quoted">เสนอราคา</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="shipped">จัดส่งแล้ว</option>
              <option value="completed">สำเร็จ</option>
            </select>
          </div>
        </div>
        
        <div class="table-wrapper">
          <table class="sales-table">
            <thead>
              <tr>
                <th>เลขที่ใบขาย</th>
                <th>ลูกค้า</th>
                <th>วันที่</th>
                <th>รายการ</th>
                <th>ยอดรวม</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in sales" :key="order.id">
                <td>
                  <div class="order-number">
                    <strong>{{ order.order_number }}</strong>
                  </div>
                </td>
                <td>
                  <div class="customer-info">
                    <div class="customer-name">{{ order.customer_name || order.customer?.customer_name }}</div>
                    <div class="customer-phone" v-if="order.customer_phone || order.customer?.customer_phone">
                      {{ order.customer_phone || order.customer?.customer_phone }}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="order-date">
                    {{ formatDate(order.order_date || order.created_at) }}
                  </div>
                </td>
                <td>
                  <div class="items-count">
                    {{ (order.items || []).length }} รายการ
                  </div>
                </td>
                <td>
                  <div class="total-amount">
                    {{ formatCurrency(order.total_amount || order.subtotal) }}
                  </div>
                </td>
                <td>
                  <span class="status-badge" :class="getStatusClass(order.status)">
                    {{ getStatusText(order.status) }}
                  </span>
                  <div class="debug-info" v-if="true" style="font-size: 10px; color: #888; margin-top: 2px;">
                    Status: {{ order.status || 'undefined' }}<br>
                    Date: {{ order.order_date || order.created_at || 'no date' }}
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" title="ดูรายละเอียด" @click="handleView(order)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="แก้ไข" v-if="order.status === 'draft'" @click="handleEdit(order)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="พิมพ์">
                      <i class="fas fa-print"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Simple Modal for Demo -->
    <div v-if="showCreateForm" class="modal-overlay" @click="showCreateForm = false">
      <div class="modal-content" @click.stop>
        <h3>สร้างใบขายใหม่</h3>
        <p>ฟีเจอร์นี้จะพัฒนาในเฟสถัดไป</p>
        <div class="form-actions">
          <button @click="showCreateForm = false" class="btn btn-secondary">
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { salesService } from '@/services/SalesService.js'

export default {
  name: 'SalesManager',
  setup() {
    const router = useRouter()
    
    // Reactive State
    const sales = ref([])
    const loading = ref(false)
    
    // Form States
    const showCreateForm = ref(false)

    // Computed Stats
    const stats = computed(() => {
      try {
        const salesArray = Array.isArray(sales.value) ? sales.value : []
        console.log('📊 Computing stats for sales:', salesArray)
        
        const today = new Date().toDateString()
        console.log('📅 Today string:', today)
        
        // Count by status (รวม draft ด้วยเพราะเป็นใบเสนอราคา)
        const quoted = salesArray.filter(s => {
          const isQuoted = s && (s.status === 'quoted' || s.status === 'draft')
          if (isQuoted) console.log('✅ Quoted order:', s)
          return isQuoted
        }).length
        
        const confirmed = salesArray.filter(s => {
          const isConfirmed = s && (s.status === 'confirmed' || s.status === 'delivered' || s.status === 'completed')
          if (isConfirmed) console.log('✅ Confirmed order:', s)
          return isConfirmed
        }).length
        
        const pendingDelivery = salesArray.filter(s => {
          const isPending = s && (s.status === 'confirmed' || s.status === 'shipped')
          if (isPending) console.log('✅ Pending delivery:', s)
          return isPending
        }).length
        
        // Calculate today's sales
        const todaySalesItems = salesArray.filter(s => {
          if (!s) return false
          
          // Try different date fields from sales service structure
          const orderDate = s.order_date || s.created_at || s.createdAt
          if (!orderDate) {
            console.log('⚠️ No date found for order:', s)
            return false
          }
          
          const orderDateString = new Date(orderDate).toDateString()
          const isToday = orderDateString === today
          
          console.log(`📅 Order ${s.order_number || s.id}: ${orderDate} -> ${orderDateString}, isToday: ${isToday}`)
          
          return isToday
        })
        
        const todaySales = todaySalesItems.reduce((sum, s) => {
          const amount = s.total_amount || s.subtotal || 0
          console.log(`💰 Adding ${amount} from order ${s.order_number || s.id}`)
          return sum + amount
        }, 0)
        
        const result = {
          quoted,
          confirmed,
          pendingDelivery,
          todaySales
        }
        
        console.log('📊 Final stats:', result)
        return result
        
      } catch (error) {
        console.error('❌ Error computing sales stats:', error)
        return {
          quoted: 0,
          confirmed: 0,
          pendingDelivery: 0,
          todaySales: 0
        }
      }
    })

    // Load sales data
    const loadSales = async () => {
      loading.value = true
      try {
        console.log('🔄 Loading sales data via SalesService...')
        
        // Initialize service if not ready
        if (!salesService.isReady()) {
          // Try to get current Vue app context
          const app = getCurrentInstance()
          if (app) {
            salesService.initialize(app.appContext.config.globalProperties)
          } else {
            console.error('❌ Cannot initialize SalesService - no Vue app context')
            throw new Error('SalesService initialization failed')
          }
        }
        
        // Load sales orders
        const resultData = await salesService.getAllSalesOrders()
        sales.value = Array.isArray(resultData) ? resultData : []
        
        console.log('✅ Loaded sales orders via SalesService:', sales.value.length)
        
        // Debug each order
        sales.value.forEach((order, index) => {
          console.log(`📋 Order ${index + 1}:`, {
            id: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name || order.customer?.customer_name,
            status: order.status,
            total: order.total_amount || order.subtotal,
            orderDate: order.order_date,
            createdDate: order.created_at
          })
        })
        
      } catch (error) {
        console.error('❌ Error loading sales via SalesService:', error)
        sales.value = []
      } finally {
        loading.value = false
      }
    }

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('th-TH')
      } catch (error) {
        return dateString
      }
    }

    // Get status class
    const getStatusClass = (status) => {
      const statusClasses = {
        'draft': 'status-draft',
        'quoted': 'status-quoted',
        'confirmed': 'status-confirmed',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
      }
      return statusClasses[status] || 'status-draft'
    }

    // Get status text
    const getStatusText = (status) => {
      const statusTexts = {
        'draft': 'ร่าง',
        'quoted': 'เสนอราคา',
        'confirmed': 'ยืนยันแล้ว',
        'shipped': 'จัดส่งแล้ว',
        'delivered': 'ส่งมอบแล้ว',
        'completed': 'สำเร็จ',
        'cancelled': 'ยกเลิก'
      }
      return statusTexts[status] || status
    }

    // Debug stats
    const debugStats = () => {
      console.log('🔍 === SALES DEBUG INFO ===')
      console.log('Raw sales data:', sales.value)
      console.log('Current stats:', stats.value)
      console.log('Today date string:', new Date().toDateString())
      
      // Show detailed breakdown
      console.log('\n📊 DETAILED BREAKDOWN:')
      sales.value.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`)
        console.log('  - Order Number:', order.order_number)
        console.log('  - Customer:', order.customer_name || order.customer?.customer_name)
        console.log('  - Status:', order.status)
        console.log('  - Total Amount:', order.total_amount || order.subtotal)
        console.log('  - Order Date:', order.order_date)
        console.log('  - Created Date:', order.created_at)
        console.log('  - Raw Object:', order)
      })
      
      alert('Debug info logged to console. กด F12 เพื่อดู console')
    }

    // Debug statistics calculation
    const debugStatistics = () => {
      console.log('📈 === STATISTICS DEBUG ===')
      console.log('All sales data:', sales.value)
      
      const today = new Date().toISOString().split('T')[0]
      console.log('Today date for comparison:', today)
      
      // Check each status category
      const draftOrders = sales.value.filter(sale => sale.status === 'draft')
      const quotedOrders = sales.value.filter(sale => sale.status === 'quoted')  
      const confirmedOrders = sales.value.filter(sale => ['confirmed', 'completed'].includes(sale.status))
      const pendingDelivery = sales.value.filter(sale => sale.status === 'pending-delivery')
      
      console.log('\n📋 STATUS BREAKDOWN:')
      console.log('Draft orders (counted as quoted):', draftOrders.length, draftOrders)
      console.log('Quoted orders:', quotedOrders.length, quotedOrders)
      console.log('Combined quoted count:', draftOrders.length + quotedOrders.length)
      console.log('Confirmed/Completed orders:', confirmedOrders.length, confirmedOrders)
      console.log('Pending delivery:', pendingDelivery.length, pendingDelivery)
      
      // Today's sales analysis
      const todaysSales = sales.value.filter(sale => {
        const orderDate = new Date(sale.order_date || sale.created_at).toISOString().split('T')[0]
        const isToday = orderDate === today
        console.log(`Order ${sale.order_number || sale.id}: ${orderDate} === ${today}? ${isToday}`)
        return isToday
      })
      
      console.log('\n💰 TODAY\'S SALES:')
      console.log('Orders placed today:', todaysSales.length, todaysSales)
      
      const todayTotal = todaysSales.reduce((sum, sale) => {
        const amount = sale.total_amount || sale.subtotal || 0
        console.log(`Adding ${amount} from order ${sale.order_number || sale.id}`)
        return sum + amount
      }, 0)
      
      console.log('Today\'s total sales amount:', todayTotal)
      console.log('=== END STATISTICS DEBUG ===')
      
      alert('Statistics debug info logged to console. Check F12 console for details.')
    }

    // Refresh data
    const refreshData = () => {
      loadSales()
    }

    // Handle view order detail
    const handleView = (order) => {
      router.push(`/sales/sales-order/detail/${order.id}`)
    }

    // Handle edit order
    const handleEdit = (order) => {
      router.push(`/sales/sales-order/edit/${order.id}`)
    }

    // Initialize
    onMounted(() => {
      loadSales()
    })

    return {
      // Data
      sales,
      loading,
      
      // Form states
      showCreateForm,
      
      // Computed
      stats,
      
      // Methods
      formatCurrency,
      formatDate,
      getStatusClass,
      getStatusText,
      debugStats,
      debugStatistics,
      refreshData,
      handleView,
      handleEdit
    }
  }
}
</script>

<style scoped>
/* Import shared manager styles */
@import '../../../shared/manager-styles.css';

.sales-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Sales-specific state colors */
.status-draft { 
  background-color: #f8f9fa; 
  color: #6c757d; 
}

.status-quoted { 
  background-color: #e3f2fd; 
  color: #1976d2; 
}

.status-confirmed { 
  background-color: #e8f5e8; 
  color: #2e7d32; 
}

.status-delivered { 
  background-color: #fff3e0; 
  color: #ef6c00; 
}

.status-invoiced { 
  background-color: #f3e5f5; 
  color: #7b1fa2; 
}

.status-complete { 
  background-color: #e8f5e8; 
  color: #388e3c; 
}

/* Empty state styling */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 24px;
  color: #d1d5db;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 24px;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 32px 0;
  max-width: 500px;
  line-height: 1.6;
  font-size: 16px;
}

/* Form actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-state i {
  font-size: 32px;
  margin-bottom: 16px;
  color: #3b82f6;
}

/* Sales Table */
.sales-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h3 {
  margin: 0;
  color: #374151;
  font-size: 20px;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
}

.sales-table {
  width: 100%;
  border-collapse: collapse;
}

.sales-table th,
.sales-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.sales-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.sales-table tbody tr:hover {
  background: #f9fafb;
}

.order-number strong {
  color: #3b82f6;
  font-family: 'Monaco', 'Consolas', monospace;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  font-weight: 500;
  color: #374151;
}

.customer-phone {
  font-size: 12px;
  color: #6b7280;
}

.order-date {
  color: #374151;
  font-size: 14px;
}

.items-count {
  color: #6b7280;
  font-size: 14px;
}

.total-amount {
  font-weight: 600;
  color: #374151;
  text-align: right;
}

/* Status badges */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #6b7280;
}

.btn-icon:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin: 0 0 16px 0;
  color: #1e293b;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 14px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Loading spinner animation */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.btn-icon {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6c757d;
  font-size: 12px;
}

.btn-icon:hover {
  background: #007bff;
  border-color: #007bff;
  color: white;
  transform: translateY(-1px);
}

.btn-icon[title="แก้ไข"]:hover {
  background: #28a745;
  border-color: #28a745;
}

.btn-icon[title="พิมพ์"]:hover {
  background: #6c757d;
  border-color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .table-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .sales-table {
    font-size: 12px;
  }
  
  .sales-table th,
  .sales-table td {
    padding: 8px 12px;
  }
}
</style>