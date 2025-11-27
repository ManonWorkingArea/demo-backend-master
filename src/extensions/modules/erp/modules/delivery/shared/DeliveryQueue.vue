<template>
  <div class="delivery-queue">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-truck-loading"></i>
          คิวจัดส่งสินค้า
        </h1>
        <div class="header-meta">
          <span class="subtitle">Work Orders ที่พร้อมจัดส่ง และสร้างใบจัดส่ง</span>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-success btn-sm" @click="createTestWorkOrder">
            <i class="fas fa-plus"></i>
            สร้าง Test Work Order
          </button>
          <button class="btn btn-outline" @click="refreshData">
            <i class="fas fa-refresh"></i>
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
          <i class="fas fa-tasks"></i>
        </div>
        <div class="stat-content">
          <h3>{{ readyToShipOrders.length }}</h3>
          <p>พร้อมจัดส่ง</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="fas fa-shipping-fast"></i>
        </div>
        <div class="stat-content">
          <h3>{{ existingDeliveries.length }}</h3>
          <p>ใบจัดส่งที่มีอยู่</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ availableForDelivery.length }}</h3>
          <p>พร้อมสร้างใบจัดส่ง</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>฿{{ formatNumber(totalOrderValue) }}</h3>
          <p>มูลค่ารวม</p>
        </div>
      </div>
    </div>

    <!-- Debug Information -->
    <div v-if="true" class="debug-info" style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-family: monospace; font-size: 12px;">
      <h4>Debug Information:</h4>
      <p><strong>Total Work Orders:</strong> {{ workOrders.length }}</p>
      <p><strong>Ready to Ship:</strong> {{ readyToShipOrders.length }}</p>
      <p><strong>Existing Deliveries:</strong> {{ existingDeliveries.length }}</p>
      <div v-if="workOrders.length > 0">
        <h5>Work Orders Status:</h5>
        <ul>
          <li v-for="order in workOrders" :key="order.id">
            WO: {{ order.order_number }}, Status: "{{ order.status }}", Customer: {{ order.customer_name || 'N/A' }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Ready to Ship Work Orders -->
    <div v-if="!loading && !error" class="ready-orders-section">
      <div class="section-header">
        <h3>
          <i class="fas fa-truck-loading"></i>
          Work Orders พร้อมจัดส่ง
        </h3>
        <p class="section-description">รายการ Work Order ที่มีสถานะ "ready-to-ship" และพร้อมสร้างใบจัดส่ง</p>
      </div>

      <!-- Empty State -->
      <div v-if="readyToShipOrders.length === 0" class="empty-state">
        <i class="fas fa-truck-loading"></i>
        <h3>ไม่มี Work Order ที่พร้อมจัดส่ง</h3>
        <p>ยังไม่มี Work Order ที่มีสถานะ "ready-to-ship" ในระบบ</p>
        <div style="margin-top: 20px; text-align: left;">
          <h4>กำลังค้นหา Work Orders ที่มี status:</h4>
          <ul>
            <li>ready-to-ship (พร้อมจัดส่ง)</li>
          </ul>
        </div>
      </div>

      <!-- Work Orders Table -->
      <div v-else class="orders-table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Work Order</th>
              <th>Sales Order</th>
              <th>ลูกค้า</th>
              <th>จำนวนรายการ</th>
              <th>มูลค่า</th>
              <th>วันที่เสร็จ</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in readyToShipOrders" :key="order.id" class="order-row">
              <td>
                <div class="work-order-info">
                  <strong>{{ order.order_number }}</strong>
                  <div class="work-order-id">#{{ order.id }}</div>
                </div>
              </td>
              <td>
                <div class="sales-order-info">
                  <strong>{{ order.sales_order_number || 'N/A' }}</strong>
                </div>
              </td>
              <td>
                <div class="customer-info">
                  <strong>{{ order.customer_name || 'ไม่ระบุ' }}</strong>
                  <div v-if="order.customer_phone" class="customer-phone">
                    {{ order.customer_phone }}
                  </div>
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
                  ฿{{ formatNumber(order.total_amount || 0) }}
                </div>
              </td>
              <td>
                <div class="completed-date">
                  {{ formatDate(order.updated_date || order.created_date) }}
                </div>
              </td>
              <td>
                <span class="status-badge status-ready">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <!-- ถ้ามี Delivery แล้ว แสดงปุ่มดู -->
                  <button 
                    v-if="hasDelivery(order.id)"
                    class="btn btn-sm btn-info"
                    @click="viewDelivery(order.id)"
                    title="ดูใบจัดส่ง"
                  >
                    <i class="fas fa-eye"></i>
                    ดูใบจัดส่ง
                  </button>
                  
                  <!-- ถ้ายังไม่มี Delivery แสดงปุ่มสร้าง -->
                  <button 
                    v-else
                    class="btn btn-sm btn-primary"
                    @click="createDelivery(order)"
                    :disabled="creatingDelivery === order.id"
                    title="สร้างใบจัดส่ง"
                  >
                    <i class="fas fa-spinner fa-spin" v-if="creatingDelivery === order.id"></i>
                    <i class="fas fa-truck" v-else></i>
                    {{ creatingDelivery === order.id ? 'กำลังสร้าง...' : 'สร้างใบจัดส่ง' }}
                  </button>
                  
                  <!-- ปุ่มดูรายละเอียด Work Order -->
                  <button 
                    class="btn btn-sm btn-outline"
                    @click="viewWorkOrderDetail(order)"
                    title="ดูรายละเอียด Work Order"
                  >
                    <i class="fas fa-tasks"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Work Order Detail Modal -->
    <div v-if="showWorkOrderDetail" class="modal-overlay" @click="closeWorkOrderDetail">
      <div class="modal-content work-order-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-tasks"></i>
            รายละเอียด Work Order
          </h3>
          <button class="btn-close" @click="closeWorkOrderDetail">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedWorkOrder">
          <!-- Work Order Info -->
          <div class="work-order-info-section">
            <div class="info-grid">
              <div class="info-item">
                <label>Work Order Number:</label>
                <span>{{ selectedWorkOrder.order_number }}</span>
              </div>
              <div class="info-item">
                <label>Sales Order:</label>
                <span>{{ selectedWorkOrder.sales_order_number || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>ลูกค้า:</label>
                <span>{{ selectedWorkOrder.customer_name || 'ไม่ระบุ' }}</span>
              </div>
              <div class="info-item">
                <label>สถานะ:</label>
                <span class="status-badge" :class="'status-' + selectedWorkOrder.status">
                  {{ getStatusText(selectedWorkOrder.status) }}
                </span>
              </div>
              <div class="info-item">
                <label>วันที่สร้าง:</label>
                <span>{{ formatDate(selectedWorkOrder.created_date) }}</span>
              </div>
              <div class="info-item">
                <label>วันที่อัปเดต:</label>
                <span>{{ formatDate(selectedWorkOrder.updated_date) }}</span>
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
                    <th>จำนวนสั่ง</th>
                    <th>จำนวนเบิก</th>
                    <th>หน่วย</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in getWorkOrderItems(selectedWorkOrder)" :key="item.id">
                    <td>
                      <div class="product-info">
                        <strong>{{ item.product_name || 'ไม่ระบุ' }}</strong>
                        <div v-if="item.product_code" class="product-code">
                          รหัส: {{ item.product_code }}
                        </div>
                      </div>
                    </td>
                    <td class="quantity">{{ item.quantity || 0 }}</td>
                    <td class="picked-quantity">{{ item.picked_quantity || 0 }}</td>
                    <td class="unit">{{ item.unit || 'ชิ้น' }}</td>
                    <td>
                      <span class="item-status-badge" :class="'item-status-' + (item.status || 'pending')">
                        {{ getItemStatusText(item.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Activities -->
          <div v-if="selectedWorkOrder.activities && selectedWorkOrder.activities.length > 0" class="activities-section">
            <h4>
              <i class="fas fa-history"></i>
              กิจกรรม
            </h4>
            <div class="activities-list">
              <div v-for="activity in selectedWorkOrder.activities" :key="activity.id" class="activity-item">
                <div class="activity-icon" :class="'activity-' + activity.type">
                  <i class="fas fa-circle"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-meta">
                    <span class="activity-user">{{ activity.user }}</span>
                    <span class="activity-time">{{ formatDateTime(activity.timestamp) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeWorkOrderDetail">
            ปิด
          </button>
          <button 
            v-if="!hasDelivery(selectedWorkOrder.id)"
            class="btn btn-primary" 
            @click="createDelivery(selectedWorkOrder)"
            :disabled="creatingDelivery === selectedWorkOrder.id"
          >
            <i class="fas fa-spinner fa-spin" v-if="creatingDelivery === selectedWorkOrder.id"></i>
            <i class="fas fa-truck" v-else></i>
            {{ creatingDelivery === selectedWorkOrder.id ? 'กำลังสร้าง...' : 'สร้างใบจัดส่ง' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionEngine, TRANSACTION_TYPES } from '@/extensions/modules/erp'

// ใช้ ERP_CORE จาก window (ถูก inject ใน main.js)
const ERP_CORE = window.ERP_CORE
const { delivery, general } = ERP_CORE.utils

export default {
  name: 'DeliveryQueue',
  setup() {
    const router = useRouter()
    
    // Core Engine
    const engine = new TransactionEngine('local')
    
    // Reactive State
    const workOrders = ref([])
    const deliveries = ref([])
    const loading = ref(true)
    const error = ref('')
    const creatingDelivery = ref(null)
    
    // Modal State
    const showWorkOrderDetail = ref(false)
    const selectedWorkOrder = ref(null)

    // Computed
    const readyToShipOrders = computed(() => {
      const filtered = workOrders.value.filter(order => {
        const isReady = order.status === 'ready-to-ship'
        if (isReady) {
          console.log('✅ Found ready-to-ship order:', order)
        }
        return isReady
      })
      console.log('📦 Total ready-to-ship orders:', filtered.length)
      return filtered
    })

    const existingDeliveries = computed(() => {
      return deliveries.value || []
    })

    const availableForDelivery = computed(() => {
      return readyToShipOrders.value.filter(order => !hasDelivery(order.id))
    })

    const totalOrderValue = computed(() => {
      return readyToShipOrders.value.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    })

    // Methods
    const loadData = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // Load Work Orders
        const workOrderResult = await engine.list(TRANSACTION_TYPES.WORK_ORDER)
        workOrders.value = workOrderResult.data || []
        
        // Load Deliveries
        const deliveryResult = await engine.list(TRANSACTION_TYPES.DELIVERY)
        deliveries.value = deliveryResult.data || []
        
        console.log('📋 Loaded work orders:', workOrders.value.length)
        console.log('📋 Work orders data:', workOrders.value)
        console.log('📋 Loaded deliveries:', deliveries.value.length)
        
        // Debug: Check ready-to-ship orders
        const ready = workOrders.value.filter(order => order.status === 'ready-to-ship')
        console.log('📦 Ready-to-ship orders found:', ready.length, ready)
        
      } catch (err) {
        console.error('❌ Error loading data:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }

    const hasDelivery = (workOrderId) => {
      return deliveries.value.some(delivery => delivery.work_order_id === workOrderId)
    }

    const getDeliveryByWorkOrderId = (workOrderId) => {
      return deliveries.value.find(delivery => delivery.work_order_id === workOrderId)
    }

    const createDelivery = async (workOrder) => {
      try {
        creatingDelivery.value = workOrder.id
        
        // Generate Delivery Number using utils
        const deliveryNumber = general.generateReferenceNumber('DEL')
        
        // Prepare Delivery data
        const deliveryData = {
          delivery_number: deliveryNumber,
          work_order_id: workOrder.id,
          work_order_number: workOrder.order_number,
          sales_order_id: workOrder.sales_order_id,
          sales_order_number: workOrder.sales_order_number,
          customer_name: workOrder.customer_name || 'ลูกค้าทดสอบ',
          customer_phone: workOrder.customer_phone || '02-123-4567',
          customer_email: workOrder.customer_email || 'customer@test.com',
          customer_tax_id: workOrder.customer_tax_id || '1234567890123',
          status: 'scheduled',
          delivery_type: 'standard',
          shipping_method: 'delivery',
          priority: 'normal',
          shipping_address: {
            company: workOrder.customer_name || 'บริษัท ลูกค้าทดสอบ จำกัด',
            address1: '123 ถนนสุขุมวิท',
            address2: 'แขวงคลองตัน',
            city: 'กรุงเทพฯ',
            state: 'กรุงเทพมหานคร',
            postal_code: '10110',
            country: 'ประเทศไทย'
          },
          items: getWorkOrderItems(workOrder).map(item => ({
            id: item.id || general.generateReferenceNumber('ITM', { length: 6 }),
            product_id: item.product_id,
            product_name: item.product_name || 'สินค้าทดสอบ',
            product_code: item.product_code || general.generateReferenceNumber('SKU', { length: 6 }),
            description: item.description || 'รายละเอียดสินค้า',
            quantity: item.picked_quantity || item.quantity || 1,
            delivery_quantity: item.picked_quantity || item.quantity || 1,
            unit: item.unit || 'ชิ้น',
            unit_price: item.unit_price || 100,
            status: 'pending'
          })),
          total_amount: workOrder.total_amount || 1000,
          shipping_cost: delivery.calculateShippingCost(
            10, // total weight (kg)
            0.1, // total volume (m³)
            deliveryData.shipping_address || {},
            'delivery',
            { deliveryType: 'standard' }
          ),
          costs: {
            packaging_cost: delivery.calculatePackagingCost('box', 10, 0.1),
            handling_cost: Math.max((workOrder.total_amount || 1000) * 0.02, 20),
            insurance_cost: (workOrder.total_amount || 1000) * 0.001
          },
          discount_amount: 0,
          scheduled_date: new Date().toISOString().split('T')[0],
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          notes: `สร้างจาก Work Order: ${workOrder.order_number}`,
          activities: [
            {
              id: general.generateReferenceNumber('ACT', { length: 6 }),
              type: 'created',
              description: 'สร้างใบจัดส่งจาก Work Order',
              user: 'System',
              timestamp: new Date().toISOString()
            }
          ]
        }
        
        // Create Delivery
        const result = await engine.create(TRANSACTION_TYPES.DELIVERY, deliveryData)
        
        if (result.success) {
          // Refresh data
          await loadData()
          
          // Close modal if open
          if (showWorkOrderDetail.value && selectedWorkOrder.value?.id === workOrder.id) {
            closeWorkOrderDetail()
          }
          
          // Navigate to Delivery detail
          router.push(`/delivery/delivery-request/${result.data.id}`)
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้างใบจัดส่งได้')
        }
        
      } catch (err) {
        console.error('❌ Error creating delivery:', err)
        alert('เกิดข้อผิดพลาดในการสร้างใบจัดส่ง: ' + err.message)
      } finally {
        creatingDelivery.value = null
      }
    }

    const viewDelivery = (workOrderId) => {
      const delivery = getDeliveryByWorkOrderId(workOrderId)
      if (delivery) {
        router.push(`/delivery/detail/${delivery.id}`)
      }
    }

    const viewWorkOrderDetail = (workOrder) => {
      selectedWorkOrder.value = workOrder
      showWorkOrderDetail.value = true
    }

    const closeWorkOrderDetail = () => {
      showWorkOrderDetail.value = false
      selectedWorkOrder.value = null
    }

    const refreshData = () => {
      loadData()
    }

    const createTestWorkOrder = async () => {
      try {
        const testWorkOrderData = {
          id: Date.now().toString(),
          order_number: general.generateReferenceNumber('WO'),
          sales_order_id: general.generateReferenceNumber('SO', { length: 6 }),
          sales_order_number: general.generateReferenceNumber('SO', { length: 6 }),
          customer_name: 'ไฟไฟ ไฟไฟ',
          customer_phone: '123-456-7890',
          status: 'ready-to-ship',
          priority: 'normal',
          items: [
            {
              id: general.generateReferenceNumber('ITM', { length: 4 }),
              product_id: general.generateReferenceNumber('PRD', { length: 6 }),
              product_name: 'สินค้าทดสอบ 1',
              product_code: general.generateReferenceNumber('SKU', { length: 6 }),
              quantity: 2,
              picked_quantity: 2,
              unit: 'ชิ้น',
              unit_price: 5350,
              status: 'picked'
            }
          ],
          total_amount: 10700,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          notes: 'Test Work Order สำหรับทดสอบระบบจัดส่ง',
          activities: [
            {
              id: general.generateReferenceNumber('ACT', { length: 6 }),
              type: 'created',
              description: 'สร้าง Work Order ทดสอบ',
              user: 'System',
              timestamp: new Date().toISOString()
            },
            {
              id: general.generateReferenceNumber('ACT', { length: 6 }),
              type: 'picked',
              description: 'เบิกสินค้าเสร็จสิ้น - พร้อมจัดส่ง',
              user: 'System',
              timestamp: new Date().toISOString()
            }
          ]
        }
        
        const result = await engine.create(TRANSACTION_TYPES.WORK_ORDER, testWorkOrderData)
        
        if (result.success) {
          console.log('✅ Created test work order:', result.data)
          await loadData() // Refresh data
          alert('สร้าง Test Work Order สำเร็จ!')
        } else {
          throw new Error(result.error || 'ไม่สามารถสร้าง Test Work Order ได้')
        }
        
      } catch (err) {
        console.error('❌ Error creating test work order:', err)
        alert('เกิดข้อผิดพลาดในการสร้าง Test Work Order: ' + err.message)
      }
    }

    const getWorkOrderItems = (workOrder) => {
      return workOrder.items || []
    }

    const getItemsCount = (workOrder) => {
      const items = getWorkOrderItems(workOrder)
      return items.length
    }

    const getStatusText = (status) => {
      const statusMap = {
        'pending': 'รอดำเนินการ',
        'picking': 'กำลังเบิก',
        'picked': 'เบิกเสร็จ',
        'ready-to-ship': 'พร้อมจัดส่ง',
        'shipped': 'จัดส่งแล้ว',
        'completed': 'เสร็จสิ้น'
      }
      return statusMap[status] || status
    }

    const getItemStatusText = (status) => {
      const statusMap = {
        'pending': 'รอเบิก',
        'picking': 'กำลังเบิก',
        'picked': 'เบิกแล้ว',
        'ready': 'พร้อม'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return general.formatDate(dateString, 'short')
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      return general.formatDateTime(dateString)
    }

    const formatNumber = (number) => {
      return general.formatCurrency(number || 0, { symbol: false })
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      // Data
      workOrders,
      deliveries,
      loading,
      error,
      creatingDelivery,
      showWorkOrderDetail,
      selectedWorkOrder,
      
      // Computed
      readyToShipOrders,
      existingDeliveries,
      availableForDelivery,
      totalOrderValue,
      
      // Methods
      loadData,
      hasDelivery,
      createDelivery,
      viewDelivery,
      viewWorkOrderDetail,
      closeWorkOrderDetail,
      refreshData,
      createTestWorkOrder,
      getWorkOrderItems,
      getItemsCount,
      getStatusText,
      getItemStatusText,
      formatDate,
      formatDateTime,
      formatNumber
    }
  }
}
</script>

<style scoped>
.delivery-queue {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
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

.header-content h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h1 i {
  color: #e67e22;
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

.work-order-info strong {
  color: #2c3e50;
  font-size: 1rem;
}

.work-order-id {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.sales-order-info strong {
  color: #3498db;
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

.items-count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
}

.order-total {
  font-weight: 600;
  color: #27ae60;
}

.completed-date {
  color: #7f8c8d;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-ready {
  background: #d4edda;
  color: #155724;
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

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
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
  max-width: 900px;
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

/* Work Order Info */
.work-order-info-section {
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
  margin-bottom: 30px;
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

.quantity, .picked-quantity, .unit {
  text-align: center;
}

.item-status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
}

.item-status-pending {
  background: #f8d7da;
  color: #721c24;
}

.item-status-picking {
  background: #cce5ff;
  color: #004085;
}

.item-status-picked {
  background: #d4edda;
  color: #155724;
}

.item-status-ready {
  background: #d1ecf1;
  color: #0c5460;
}

/* Activities */
.activities-section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.activities-list {
  max-height: 200px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f4;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.6rem;
  flex-shrink: 0;
}

.activity-created {
  background: #28a745;
}

.activity-picked {
  background: #17a2b8;
}

.activity-ready {
  background: #ffc107;
  color: #000;
}

.activity-content {
  flex: 1;
}

.activity-description {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Responsive */
@media (max-width: 768px) {
  .delivery-queue {
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
    min-width: 900px;
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