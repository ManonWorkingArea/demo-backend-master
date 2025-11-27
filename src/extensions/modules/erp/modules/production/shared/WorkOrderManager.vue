<template>
  <div class="work-order-manager">
    <!-- Manager Header -->
    <div class="manager-header">
      <div class="header-content">
        <div class="title-section">
          <h2>
            <i class="fas fa-tasks"></i>
            จัดการ Work Orders
          </h2>
          <p class="subtitle">สร้าง Work Order จาก Sales Order ที่ยืนยันแล้ว</p>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-success btn-sm" @click="createTestSalesOrder">
            <i class="fas fa-plus"></i>
            สร้าง Test Sales Order
          </button>
          <button class="btn btn-outline" @click="refreshData">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            รีเฟรช
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>เกิดข้อผิดพลาด</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadData">
        <i class="fas fa-refresh"></i>
        ลองใหม่
      </button>
    </div>

    <!-- Stats Overview -->
    <div v-else class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ confirmedOrders.length }}</h3>
          <p>Order ที่ยืนยันแล้ว</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="fas fa-tasks"></i>
        </div>
        <div class="stat-content">
          <h3>{{ existingWorkOrders.length }}</h3>
          <p>Work Order ที่มีอยู่</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ availableForWorkOrder.length }}</h3>
          <p>พร้อมสร้าง Work Order</p>
        </div>
      </div>
    </div>

    <!-- Confirmed Orders List -->
    <div v-if="!loading && !error" class="confirmed-orders-section">
      <div class="section-header">
        <h3>
          <i class="fas fa-check-circle"></i>
          Order ที่ยืนยันแล้ว
        </h3>
        <p class="section-description">รายการ Sales Order ที่ยืนยันแล้วและพร้อมสร้าง Work Order</p>
      </div>

      <!-- Debug Information -->
      <div v-if="true" class="debug-info" style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-family: monospace; font-size: 12px;">
        <h4>Debug Information:</h4>
        <p><strong>Total Sales Orders:</strong> {{ salesOrders.length }}</p>
        <p><strong>Confirmed Orders:</strong> {{ confirmedOrders.length }}</p>
        <p><strong>Available for Work Order:</strong> {{ availableForWorkOrder.length }}</p>
        <div v-if="salesOrders.length > 0">
          <h5>Sales Orders Status:</h5>
          <ul>
            <li v-for="order in salesOrders" :key="order.id">
              ID: {{ order.id }}, Status: "{{ order.status }}", Customer: {{ order.customerName || order.customer_name || 'N/A' }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="confirmedOrders.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>ไม่มี Order ที่ยืนยันแล้ว</h3>
        <p>ยังไม่มี Sales Order ที่ยืนยันแล้วในระบบ</p>
        <div style="margin-top: 20px; text-align: left;">
          <h4>กำลังค้นหา Sales Orders ที่มี status:</h4>
          <ul>
            <li>confirmed (ยืนยันแล้ว)</li>
            <li>delivered (จัดส่งแล้ว)</li>
            <li>completed (เสร็จสิ้น)</li>
            <li>in_production (อยู่ในขั้นตอนการผลิต)</li>
          </ul>
        </div>
      </div>

      <!-- Orders Table -->
      <div v-else class="orders-table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>ลูกค้า</th>
              <th>วันที่ยืนยัน</th>
              <th>จำนวนรายการ</th>
              <th>มูลค่า</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in confirmedOrders" :key="order.id" class="order-row">
              <td>
                <div class="order-number">
                  <strong>{{ order.order_number || order.orderNumber || '#' + order.id }}</strong>
                </div>
              </td>
              <td>
                <div class="customer-info">
                  <strong>{{ order.customer_name || order.customerName || 'ไม่ระบุ' }}</strong>
                  <div v-if="order.customer_phone" class="customer-phone">
                    {{ order.customer_phone }}
                  </div>
                </div>
              </td>
              <td>
                <div class="order-date">
                  {{ formatDate(order.confirmed_date || order.order_date || order.created_date) }}
                </div>
              </td>
              <td>
                <div class="items-count">
                  <i class="fas fa-box"></i>
                  {{ getItemsCount(order) }} รายการ
                </div>
              </td>
              <td>
                <div class="order-total">
                  ฿{{ formatNumber(order.total_amount || order.totalAmount || 0) }}
                </div>
              </td>
              <td>
                <span class="status-badge" :class="'status-' + order.status">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <!-- ถ้ามี Work Order แล้ว แสดงปุ่มดู -->
                  <button 
                    v-if="hasWorkOrder(order.id)"
                    class="btn btn-sm btn-info"
                    @click="viewWorkOrder(order.id)"
                    title="ดู Work Order"
                  >
                    <i class="fas fa-eye"></i>
                    ดู Work Order
                  </button>
                  
                  <!-- ถ้ายังไม่มี Work Order แสดงปุ่มสร้าง -->
                  <button 
                    v-else
                    class="btn btn-sm btn-primary"
                    @click="createWorkOrder(order)"
                    :disabled="creatingWorkOrder === order.id"
                    title="สร้าง Work Order"
                  >
                    <i class="fas fa-spinner fa-spin" v-if="creatingWorkOrder === order.id"></i>
                    <i class="fas fa-plus" v-else></i>
                    {{ creatingWorkOrder === order.id ? 'กำลังสร้าง...' : 'สร้าง Work Order' }}
                  </button>
                  
                  <!-- ปุ่มดูรายละเอียด Order -->
                  <button 
                    class="btn btn-sm btn-outline"
                    @click="viewOrderDetail(order)"
                    title="ดูรายละเอียด Sales Order"
                  >
                    <i class="fas fa-info-circle"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="showOrderDetail" class="modal-overlay" @click="closeOrderDetail">
      <div class="modal-content order-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-shopping-cart"></i>
            รายละเอียด Sales Order
          </h3>
          <button class="btn-close" @click="closeOrderDetail">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedOrder">
          <!-- Order Info -->
          <div class="order-info-section">
            <div class="info-grid">
              <div class="info-item">
                <label>Order Number:</label>
                <span>{{ selectedOrder.order_number || selectedOrder.orderNumber || '#' + selectedOrder.id }}</span>
              </div>
              <div class="info-item">
                <label>ลูกค้า:</label>
                <span>{{ selectedOrder.customer_name || selectedOrder.customerName || 'ไม่ระบุ' }}</span>
              </div>
              <div class="info-item">
                <label>วันที่ยืนยัน:</label>
                <span>{{ formatDate(selectedOrder.confirmed_date || selectedOrder.order_date) }}</span>
              </div>
              <div class="info-item">
                <label>Status:</label>
                <span class="status-badge" :class="'status-' + selectedOrder.status">
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="items-section">
            <h4>
              <i class="fas fa-box"></i>
              รายการสินค้า
            </h4>
            
            <div class="items-table-container">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>จำนวน</th>
                    <th>หน่วย</th>
                    <th>ราคา/หน่วย</th>
                    <th>รวม</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in getOrderItems(selectedOrder)" :key="item.id || item.product_id">
                    <td>
                      <div class="product-info">
                        <strong>{{ item.product_name || item.name || 'ไม่ระบุ' }}</strong>
                        <div v-if="item.product_code" class="product-code">
                          รหัส: {{ item.product_code }}
                        </div>
                      </div>
                    </td>
                    <td class="quantity">{{ item.quantity || 0 }}</td>
                    <td class="unit">{{ item.unit || 'ชิ้น' }}</td>
                    <td class="price">฿{{ formatNumber(item.unit_price || item.price || 0) }}</td>
                    <td class="total">฿{{ formatNumber((item.quantity || 0) * (item.unit_price || item.price || 0)) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="4"><strong>รวมทั้งหมด:</strong></td>
                    <td class="total"><strong>฿{{ formatNumber(selectedOrder.total_amount || selectedOrder.totalAmount || 0) }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeOrderDetail">
            ปิด
          </button>
          <button 
            v-if="!hasWorkOrder(selectedOrder.id)"
            class="btn btn-primary" 
            @click="createWorkOrder(selectedOrder)"
            :disabled="creatingWorkOrder === selectedOrder.id"
          >
            <i class="fas fa-spinner fa-spin" v-if="creatingWorkOrder === selectedOrder.id"></i>
            <i class="fas fa-plus" v-else></i>
            {{ creatingWorkOrder === selectedOrder.id ? 'กำลังสร้าง...' : 'สร้าง Work Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionEngine } from '../../../core/Engine'
import { TRANSACTION_TYPES } from '../../../core/Types'

export default {
  name: 'WorkOrderManager',
  setup() {
    const router = useRouter()
    
    // Core Engine
    const engine = new TransactionEngine('local')
    
    // Reactive State
    const salesOrders = ref([])
    const workOrders = ref([])
    const loading = ref(true)
    const error = ref('')
    const creatingWorkOrder = ref(null)
    
    // Modal State
    const showOrderDetail = ref(false)
    const selectedOrder = ref(null)

    // Computed
    const confirmedOrders = computed(() => {
      const filtered = salesOrders.value.filter(order => {
        const isConfirmed = order.status === 'confirmed' || 
                           order.status === 'delivered' || 
                           order.status === 'completed' ||
                           order.status === 'in_production'  // เพิ่ม in_production
        if (isConfirmed) {
          console.log('✅ Found confirmed order:', order)
        }
        return isConfirmed
      })
      console.log('📊 Total confirmed orders:', filtered.length)
      return filtered
    })

    const existingWorkOrders = computed(() => {
      return workOrders.value || []
    })

    const availableForWorkOrder = computed(() => {
      return confirmedOrders.value.filter(order => !hasWorkOrder(order.id))
    })

    // Methods
    const loadData = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // Load Sales Orders using correct transaction type
        const salesResult = await engine.list(TRANSACTION_TYPES.SALES)
        salesOrders.value = salesResult.data || []
        
        // Load Work Orders
        const workOrderResult = await engine.list(TRANSACTION_TYPES.WORK_ORDER)
        workOrders.value = workOrderResult.data || []
        
        console.log('📋 Loaded sales orders:', salesOrders.value.length)
        console.log('📋 Sales orders data:', salesOrders.value)
        console.log('📋 Loaded work orders:', workOrders.value.length)
        
        // Debug: Check confirmed orders
        const confirmed = salesOrders.value.filter(order => 
          order.status === 'confirmed' || 
          order.status === 'delivered' || 
          order.status === 'completed'
        )
        console.log('📋 Confirmed orders found:', confirmed.length, confirmed)
        
      } catch (err) {
        console.error('❌ Error loading data:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }

    const hasWorkOrder = (salesOrderId) => {
      return workOrders.value.some(wo => wo.sales_order_id === salesOrderId)
    }

    const getWorkOrderBySalesId = (salesOrderId) => {
      return workOrders.value.find(wo => wo.sales_order_id === salesOrderId)
    }

    const createWorkOrder = async (order) => {
      try {
        creatingWorkOrder.value = order.id
        
        // Generate Work Order Number
        const workOrderNumber = `WO-${Date.now()}`
        
        // Debug: ตรวจสอบข้อมูลต้นฉบับ
        const orderItems = getOrderItems(order)
        console.log('🔍 Original Sales Order Items:', orderItems)
        console.log('🔍 First item details:', orderItems[0])
        
        // Prepare Work Order data
        const workOrderData = {
          order_number: workOrderNumber,
          sales_order_id: order.id,
          sales_order_number: order.order_number || order.orderNumber,
          customer_name: order.customer_name || order.customerName,
          customer_phone: order.customer_phone || '',
          status: 'pending',
          priority: 'normal',
          items: getOrderItems(order).map(item => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            product_id: item.productId || item.product_id || '',
            product_name: item.productName || item.product_name || item.name || '',
            product_code: item.sku || item.product_code || '',
            sku: item.sku || item.product_code || '',
            quantity: item.quantity || 0,
            unit: item.unit || 'ชิ้น',
            unit_price: item.unitPrice || item.unit_price || item.price || 0,
            picked_quantity: 0,
            status: 'pending'
          })),
          total_amount: order.total_amount || order.totalAmount || 0,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          notes: `สร้างจาก Sales Order: ${order.order_number || order.orderNumber}`,
          activities: [
            {
              id: Math.random().toString(36).substr(2, 9),
              type: 'created',
              description: 'สร้าง Work Order จาก Sales Order',
              user: 'System',
              timestamp: new Date().toISOString()
            }
          ]
        }
        
        // Debug: ตรวจสอบข้อมูลหลัง mapping
        console.log('📋 Work Order Data (after mapping):', workOrderData)
        console.log('📦 Mapped Items:', workOrderData.items)
        console.log('💰 First item price:', workOrderData.items[0]?.unit_price)
        
        // Create Work Order
        const result = await engine.create(TRANSACTION_TYPES.WORK_ORDER, workOrderData)
        
        if (result.success) {
          // Refresh data
          await loadData()
          
          // Close modal if open
          if (showOrderDetail.value && selectedOrder.value?.id === order.id) {
            closeOrderDetail()
          }
          
          // Navigate to Work Order detail
          router.push(`/production/work-order/${result.data.id}`)
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้าง Work Order ได้')
        }
        
      } catch (err) {
        console.error('❌ Error creating work order:', err)
        alert('เกิดข้อผิดพลาดในการสร้าง Work Order: ' + err.message)
      } finally {
        creatingWorkOrder.value = null
      }
    }

    const viewWorkOrder = (salesOrderId) => {
      const workOrder = getWorkOrderBySalesId(salesOrderId)
      if (workOrder) {
        router.push(`/production/work-order/${workOrder.id}`)
      }
    }

    const viewOrderDetail = (order) => {
      selectedOrder.value = order
      showOrderDetail.value = true
    }

    const closeOrderDetail = () => {
      showOrderDetail.value = false
      selectedOrder.value = null
    }

    const refreshData = () => {
      loadData()
    }

    const createTestSalesOrder = async () => {
      try {
        const testOrderData = {
          id: Date.now().toString(),
          orderNumber: `SO-${Date.now()}`,
          customerName: 'ไฟไฟ ไฟไฟ',
          customer_phone: '123-456-7890',
          status: 'confirmed',
          order_date: new Date().toISOString(),
          confirmed_date: new Date().toISOString(),
          totalAmount: 10700,
          items: [
            {
              id: '1',
              product_id: 'P001',
              product_name: 'สินค้าทดสอบ 1',
              product_code: 'TEST001',
              quantity: 1,
              unit: 'ชิ้น',
              unit_price: 10700,
              price: 10700
            }
          ]
        }
        
        const result = await engine.create(TRANSACTION_TYPES.SALES, testOrderData)
        
        if (result.success) {
          console.log('✅ Created test sales order:', result.data)
          await loadData() // Refresh data
          alert('สร้าง Test Sales Order สำเร็จ!')
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้าง Test Sales Order ได้')
        }
        
      } catch (err) {
        console.error('❌ Error creating test sales order:', err)
        alert('เกิดข้อผิดพลาดในการสร้าง Test Sales Order: ' + err.message)
      }
    }

    const getOrderItems = (order) => {
      return order.items || order.orderItems || []
    }

    const getItemsCount = (order) => {
      const items = getOrderItems(order)
      return items.length
    }

    const getStatusText = (status) => {
      const statusMap = {
        'draft': 'ร่าง',
        'quoted': 'เสนอราคา',
        'confirmed': 'ยืนยันแล้ว',
        'in_production': 'อยู่ในการผลิต',
        'delivered': 'จัดส่งแล้ว',
        'completed': 'เสร็จสิ้น',
        'cancelled': 'ยกเลิก'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return dateString
      }
    }

    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(number || 0)
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      // Data
      salesOrders,
      workOrders,
      loading,
      error,
      creatingWorkOrder,
      showOrderDetail,
      selectedOrder,
      
      // Computed
      confirmedOrders,
      existingWorkOrders,
      availableForWorkOrder,
      
      // Methods
      loadData,
      hasWorkOrder,
      createWorkOrder,
      viewWorkOrder,
      viewOrderDetail,
      closeOrderDetail,
      refreshData,
      createTestSalesOrder,
      getOrderItems,
      getItemsCount,
      getStatusText,
      formatDate,
      formatNumber
    }
  }
}
</script>

<style scoped>
.work-order-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Manager Header */
.manager-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.title-section h2 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-section h2 i {
  color: #3498db;
}

.subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Section Header */
.section-header h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-description {
  margin: 0 0 20px 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

/* Orders Table */
.orders-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.orders-table td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.order-row:hover {
  background: #f8f9fa;
}

.order-number strong {
  color: #2c3e50;
  font-size: 1rem;
}

.customer-info strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 4px;
}

.customer-phone {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.order-date {
  color: #7f8c8d;
}

.items-count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
}

.order-total {
  font-weight: 600;
  color: #28a745;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-confirmed {
  background: #d4edda;
  color: #155724;
}

.status-in_production {
  background: #fff3cd;
  color: #856404;
}

.status-delivered {
  background: #cce5ff;
  color: #004085;
}

.status-completed {
  background: #d1ecf1;
  color: #0c5460;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Loading & Error States */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-state i {
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 16px;
}

.error-state i, .empty-state i {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 16px;
}

.empty-state i {
  color: #bdc3c7;
}

.loading-state p, .error-state p, .empty-state p {
  color: #7f8c8d;
  margin: 8px 0;
}

.error-state h3, .empty-state h3 {
  color: #2c3e50;
  margin: 0 0 8px 0;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.btn-close:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Order Info */
.order-info-section {
  margin-bottom: 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
}

.info-item span {
  color: #2c3e50;
}

/* Items Section */
.items-section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.items-table-container {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
}

.items-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f3f4;
}

.items-table tbody tr:last-child td {
  border-bottom: none;
}

.product-info strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 4px;
}

.product-code {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.quantity, .unit, .price, .total {
  text-align: right;
}

.price, .total {
  font-weight: 500;
}

.total-row {
  background: #f8f9fa;
  font-weight: 600;
}

.total-row td {
  border-top: 2px solid #e9ecef;
  border-bottom: none;
}

/* Responsive */
@media (max-width: 768px) {
  .work-order-manager {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .orders-table-container {
    overflow-x: auto;
  }
  
  .orders-table {
    min-width: 800px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>