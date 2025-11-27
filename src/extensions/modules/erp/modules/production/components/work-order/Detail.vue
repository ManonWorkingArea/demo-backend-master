<template>
  <div class="work-order-detail">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-tasks"></i>
          รายละเอียด Work Order
        </h1>
        <div class="header-meta" v-if="workOrder">
          <span class="order-number">{{ workOrder.order_number }}</span>
          <span class="divider">•</span>
          <span class="customer">{{ workOrder.customer_name }}</span>
        </div>
        
        <div class="header-actions">
          <!-- ปุ่มย้อนกลับสถานะ -->
          <button 
            v-if="canRevertStatus"
            class="btn btn-warning" 
            @click="revertToPreviousStatus"
          >
            <i class="fas fa-undo"></i>
            ย้อนกลับสถานะ
          </button>
          
          <button 
            v-if="workOrder?.status === 'ready-to-ship'" 
            class="btn btn-success" 
            @click="goToDelivery"
          >
            <i class="fas fa-shipping-fast"></i>
            จัดส่งสินค้า
          </button>
          <button class="btn btn-outline" @click="printWorkOrder">
            <i class="fas fa-print"></i>
            พิมพ์
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
      <button class="btn btn-primary" @click="loadWorkOrder">
        <i class="fas fa-refresh"></i>
        ลองใหม่
      </button>
    </div>

    <!-- Work Order Content -->
    <div v-else-if="workOrder" class="work-order-content">
      
      <!-- Status Section -->
      <div class="status-section">
        <div class="current-status">
          <span class="status-label">สถานะปัจจุบัน:</span>
          <span class="status-badge" :class="getStatusClass(workOrder.status)">
            {{ getStatusText(workOrder.status) }}
          </span>
        </div>
        
        <div class="status-actions">
          <button 
            v-for="action in availableActions" 
            :key="action.status"
            @click="changeStatus(action.status)"
            class="btn btn-sm"
            :class="action.class"
            :disabled="loading || processingStatus || (action.status === 'picked' && !canCompleteWork)"
          >
            <i :class="action.icon"></i>
            {{ action.label }}
            <span v-if="action.status === 'picked' && !canCompleteWork" class="btn-disabled-note">
              (ต้องตัดสต็อครายการที่มีการจองให้ครบก่อน)
            </span>
          </button>
        </div>
      </div>

      <!-- Work Order Information Grid -->
      <div class="work-order-info-grid">
        <!-- Basic Information -->
        <div class="info-card">
          <h3>
            <i class="fas fa-info-circle"></i>
            ข้อมูลทั่วไป
          </h3>
          <div class="info-content">
            <div class="info-row">
              <label>เลขที่ Work Order:</label>
              <span>{{ workOrder.order_number }}</span>
            </div>
            <div class="info-row">
              <label>ลูกค้า:</label>
              <span>{{ workOrder.customer_name }}</span>
            </div>
            <div class="info-row" v-if="workOrder.sales_order_id">
              <label>เลขที่ใบขาย:</label>
              <span class="sales-order-link" @click="viewSalesOrder">
                <i class="fas fa-external-link-alt"></i>
                {{ workOrder.sales_order_number || workOrder.sales_order_id }}
              </span>
            </div>
            <div class="info-row" v-if="workOrder.due_date">
              <label>กำหนดส่ง:</label>
              <span>{{ formatDate(workOrder.due_date) }}</span>
            </div>
            <div class="info-row">
              <label>ความสำคัญ:</label>
              <span class="priority-badge" :class="getPriorityClass(workOrder.priority)">
                {{ getPriorityText(workOrder.priority) }}
              </span>
            </div>
            <div class="info-row">
              <label>คลังสินค้า:</label>
              <span>{{ workOrder.warehouse || 'main' }}</span>
            </div>
            <div class="info-row" v-if="workOrder.assigned_to">
              <label>ผู้รับผิดชอบ:</label>
              <span>{{ workOrder.assigned_to }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="info-card">
          <h3>
            <i class="fas fa-clock"></i>
            Timeline
          </h3>
          <div class="timeline-content">
            <div class="timeline-item" v-if="workOrder.createdAt">
              <div class="timeline-marker created"></div>
              <div class="timeline-content">
                <strong>สร้าง Work Order</strong>
                <div class="timeline-time">{{ formatDateTime(workOrder.createdAt) }}</div>
              </div>
            </div>
            <div class="timeline-item" v-if="workOrder.started_at">
              <div class="timeline-marker started"></div>
              <div class="timeline-content">
                <strong>เริ่มหยิบสินค้า</strong>
                <div class="timeline-time">{{ formatDateTime(workOrder.started_at) }}</div>
              </div>
            </div>
            <div class="timeline-item" v-if="workOrder.picked_at">
              <div class="timeline-marker picked"></div>
              <div class="timeline-content">
                <strong>หยิบสินค้าเสร็จ</strong>
                <div class="timeline-time">{{ formatDateTime(workOrder.picked_at) }}</div>
              </div>
            </div>
            <div class="timeline-item" v-if="workOrder.ready_at">
              <div class="timeline-marker ready"></div>
              <div class="timeline-content">
                <strong>เตรียมส่งเรียบร้อย</strong>
                <div class="timeline-time">{{ formatDateTime(workOrder.ready_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Reservations Section -->
      <div class="reservations-section" v-if="workOrder.inventory_reservations && workOrder.inventory_reservations.length">
        <h3>
          <i class="fas fa-link"></i>
          การจองสต็อกที่เชื่อมโยง
        </h3>
        
        <div class="reservations-summary">
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">รายการจองทั้งหมด:</span>
              <span class="stat-value">{{ workOrder.inventory_reservations.length }} รายการ</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">จำนวนรวม:</span>
              <span class="stat-value">{{ totalReservedQuantity }} หน่วย</span>
            </div>
          </div>
        </div>
        
        <div class="table-wrapper">
          <table class="reservations-table">
            <thead>
              <tr>
                <th>Inventory ID</th>
                <th>สินค้า</th>
                <th>จำนวนจอง</th>
                <th>หน่วย</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reservation in workOrder.inventory_reservations" :key="reservation.inventory_id">
                <td>
                  <span class="inventory-id">{{ reservation.inventory_id }}</span>
                </td>
                <td>
                  <div class="product-info">
                    <strong>{{ reservation.product_name || 'ไม่ระบุชื่อ' }}</strong>
                    <div class="product-code" v-if="reservation.sku">
                      SKU: {{ reservation.sku }}
                    </div>
                  </div>
                </td>
                <td class="text-center">{{ reservation.reserved_quantity || 0 }}</td>
                <td class="text-center">{{ reservation.unit || 'ชิ้น' }}</td>
                <td class="notes-cell">{{ reservation.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sales Order Information -->
      <div class="sales-order-section" v-if="salesOrderData">
        <h3>
          <i class="fas fa-file-invoice"></i>
          ข้อมูลใบขายที่เกี่ยวข้อง
        </h3>
        
        <div class="sales-order-info-grid">
          <div class="sales-info-card">
            <h4>รายละเอียดใบขาย</h4>
            <div class="info-content">
              <div class="info-row">
                <label>เลขที่ใบขาย:</label>
                <span>{{ salesOrderData.order_number || salesOrderData.orderNumber || '-' }}</span>
              </div>
              <div class="info-row">
                <label>วันที่สร้าง:</label>
                <span>{{ formatDate(salesOrderData.order_date || salesOrderData.created_date) }}</span>
              </div>
              <div class="info-row">
                <label>สถานะใบขาย:</label>
                <span class="status-badge" :class="getSalesOrderStatusClass(salesOrderData.status)">
                  {{ getSalesOrderStatusText(salesOrderData.status) }}
                </span>
              </div>
              <div class="info-row" v-if="salesOrderData.totalAmount || salesOrderData.total">
                <label>ยอดรวม:</label>
                <span>{{ formatCurrency(salesOrderData.totalAmount || salesOrderData.total) }}</span>
              </div>
            </div>
          </div>
          
          <div class="sales-info-card">
            <h4>ข้อมูลลูกค้า</h4>
            <div class="info-content">
              <div class="info-row">
                <label>ชื่อลูกค้า:</label>
                <span>{{ salesOrderData.customerName || salesOrderData.customer_name || '-' }}</span>
              </div>
              <div class="info-row" v-if="salesOrderData.customer_phone">
                <label>เบอร์โทร:</label>
                <span>{{ salesOrderData.customer_phone }}</span>
              </div>
              <div class="info-row" v-if="salesOrderData.customer_email">
                <label>อีเมล:</label>
                <span>{{ salesOrderData.customer_email }}</span>
              </div>
              <div class="info-row" v-if="salesOrderData.due_date">
                <label>กำหนดส่ง:</label>
                <span>{{ formatDate(salesOrderData.due_date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="items-section">
        <h3>
          <i class="fas fa-list"></i>
          รายการสินค้าที่ต้องหยิบ
        </h3>
        
        <!-- แสดงข้อมูลจากการจองสต็อก (inventory_reservations) -->
        <div class="table-wrapper" v-if="workOrder.inventory_reservations && workOrder.inventory_reservations.length">
          <table class="items-table">
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>จำนวนที่ต้องหยิบ</th>
                <th>หยิบแล้ว</th>
                <th>หน่วย</th>
                <th>Inventory ID</th>
                <th>สถานะ</th>
                <th v-if="canPickItems">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(reservation, index) in workOrder.inventory_reservations" :key="reservation.inventory_id">
                <td>
                  <div class="item-info">
                    <strong>{{ reservation.product_name || 'ไม่ระบุชื่อ' }}</strong>
                    <div class="item-code" v-if="reservation.sku">
                      SKU: {{ reservation.sku }}
                    </div>
                  </div>
                </td>
                <td class="text-center">{{ reservation.reserved_quantity || 0 }}</td>
                <td class="text-center">
                  <span :class="getReservationQuantityClass(reservation)">
                    {{ reservation.picked_quantity || 0 }}
                  </span>
                </td>
                <td class="text-center">{{ reservation.unit || 'ชิ้น' }}</td>
                <td class="text-center">
                  <span class="inventory-id">{{ reservation.inventory_id }}</span>
                </td>
                <td class="text-center">
                  <span class="item-status-badge" :class="getReservationStatusClass(reservation.status)">
                    {{ getReservationStatusText(reservation.status) }}
                  </span>
                </td>
                <td v-if="canPickItems" class="text-center">
                  <button 
                    v-if="reservation.status === 'reserved' || reservation.status === 'pending' || reservation.status === 'picking'"
                    @click="pickReservationItem(index)"
                    class="btn btn-sm"
                    :class="{
                      'btn-success': reservation.status === 'reserved' || reservation.status === 'pending',
                      'btn-warning': reservation.status === 'picking'
                    }"
                    :disabled="processingItem === index"
                  >
                    <i class="fas fa-cut"></i>
                    <span v-if="processingItem === index">กำลังประมวลผล...</span>
                    <span v-else-if="reservation.status === 'picking'">ตัดสต็อค</span>
                    <span v-else>หยิบ & ตัดสต็อค</span>
                  </button>
                  <span v-else-if="reservation.status === 'picked'" class="text-success">
                    <i class="fas fa-check-circle"></i>
                    ตัดสต็อคแล้ว
                  </span>
                  <span v-else class="text-muted">
                    <i class="fas fa-minus-circle"></i>
                    ไม่สามารถดำเนินการ
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- แสดงข้อความเมื่อไม่มีการจอง -->
        <div v-else class="no-items-message">
          <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>ไม่มีรายการสินค้าที่ต้องหยิบ</strong>
            <p>ยังไม่มีการจองสต็อกสำหรับ Work Order นี้ กรุณาตรวจสอบการจองสต็อกในระบบก่อนดำเนินการหยิบสินค้า</p>
          </div>
        </div>

        <!-- Progress Summary -->
        <div class="progress-summary" v-if="workOrder.inventory_reservations && workOrder.inventory_reservations.length">
          <!-- Reservations Progress -->
          <div class="progress-section">
            <h4>ความคืบหน้าการจอง:</h4>
            <div class="progress-info">
              <span>ตัดสต็อคแล้ว: {{ pickedReservationsCount }} / {{ totalReservationsCount }} รายการจอง</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: reservationProgressPercentage + '%' }"></div>
              </div>
              <span>{{ Math.round(reservationProgressPercentage) }}%</span>
            </div>
          </div>

          <!-- Items Progress -->
          <div class="progress-section" v-if="workOrder.items && workOrder.items.length">
            <h4>ความคืบหน้ารายการสินค้า:</h4>
            <div class="progress-info">
              <span>หยิบแล้ว: {{ totalQuantityStats.picked }} / {{ totalQuantityStats.required }} หน่วย ({{ pickedItemsCount }} / {{ totalItemsCount }} รายการ)</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: totalQuantityStats.percentage + '%' }"></div>
              </div>
              <span>{{ totalQuantityStats.percentage }}%</span>
            </div>
          </div>

          <!-- Status Notes -->
          <div v-if="workOrder.status === 'picking' && !canCompleteReservationWork" class="progress-note">
            <i class="fas fa-info-circle"></i>
            ต้องตัดสต็อคสินค้าให้ครบทุกรายการที่มีการจองก่อนจึงจะสามารถเปลี่ยนเป็น "หยิบเสร็จแล้ว" ได้
          </div>
        </div>
      </div>

      <!-- Activities Section -->
      <div class="activities-section" v-if="allActivityLogs && allActivityLogs.length">
        <h3>
          <i class="fas fa-history"></i>
          ประวัติการทำงาน
        </h3>
        
        <div class="activities-list">
          <div 
            v-for="(activity, index) in allActivityLogs" 
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon" :class="getActivityIconClass(activity.action)">
              <i :class="getActivityIcon(activity.action)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-header">
                <span class="activity-action">{{ activity.description }}</span>
                <span class="activity-time">{{ formatDateTime(activity.timestamp) }}</span>
              </div>
              <div class="activity-details">
                <span class="activity-user" v-if="activity.user">{{ activity.user }}</span>
                <span class="activity-notes" v-if="activity.notes">{{ activity.notes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Change Modal -->
    <div v-show="showStatusModal" class="modal-overlay" @click="cancelStatusChange">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>เปลี่ยนสถานะ Work Order</h3>
          <button @click="cancelStatusChange" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>ต้องการเปลี่ยนสถานะเป็น <strong>{{ getStatusText(pendingStatus) }}</strong> ใช่หรือไม่?</p>
          
          <div class="form-group">
            <label>หมายเหตุ (ไม่บังคับ):</label>
            <textarea 
              v-model="statusNotes" 
              class="form-control"
              rows="3"
              placeholder="ระบุหมายเหตุเพิ่มเติม..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cancelStatusChange" class="btn btn-secondary">
            ยกเลิก
          </button>
          <button @click="confirmStatusChange" class="btn btn-primary" :disabled="processingStatus">
            <i v-show="processingStatus" class="fas fa-spinner fa-spin"></i>
            <i v-show="!processingStatus" class="fas fa-check"></i>
            {{ processingStatus ? 'กำลังบันทึก...' : 'ยืนยัน' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TransactionEngine } from '../../../../core/Engine'
import { TRANSACTION_TYPES } from '../../../../core/Types.js'

export default {
  name: 'WorkOrderDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // Data
    const workOrder = ref(null)
    const salesOrderData = ref(null)
    const loading = ref(true)
    const error = ref('')
    
    // Status change modal
    const showStatusModal = ref(false)
    const pendingStatus = ref('')
    const statusNotes = ref('')
    const processingStatus = ref(false)
    const processingItem = ref(null)
    
    // Transaction engine
    const engine = new TransactionEngine('local')
    
    // Status definitions
    const statusDefinitions = {
      'pending': {
        label: 'รอดำเนินการ',
        class: 'status-pending',
        nextActions: [
          { status: 'picking', label: 'เริ่มหยิบสินค้า', class: 'btn-info', icon: 'fas fa-play' }
        ]
      },
      'picking': {
        label: 'กำลังหยิบสินค้า',
        class: 'status-picking',
        nextActions: [
          { status: 'picked', label: 'หยิบเสร็จแล้ว', class: 'btn-warning', icon: 'fas fa-check' }
        ]
      },
      'picked': {
        label: 'หยิบเสร็จแล้ว',
        class: 'status-picked',
        nextActions: [
          { status: 'ready-to-ship', label: 'เตรียมส่ง', class: 'btn-success', icon: 'fas fa-truck' }
        ]
      },
      'ready-to-ship': {
        label: 'เตรียมส่งเรียบร้อย',
        class: 'status-ready',
        nextActions: []
      }
    }

    // Computed
    const availableActions = computed(() => {
      if (!workOrder.value?.status) return []
      const currentStatus = statusDefinitions[workOrder.value.status]
      return currentStatus ? currentStatus.nextActions : []
    })

    const canPickItems = computed(() => {
      // ต้องเป็นสถานะ picking และมีการจองสต็อค
      const hasReservations = workOrder.value?.inventory_reservations && 
                              workOrder.value.inventory_reservations.length > 0
      
      console.log('🔍 Can Pick Items Check:', {
        status: workOrder.value?.status,
        hasReservations: hasReservations,
        reservationsCount: workOrder.value?.inventory_reservations?.length || 0,
        canPick: workOrder.value?.status === 'picking' && hasReservations
      })
      
      return workOrder.value?.status === 'picking' && hasReservations
    })

    const canCompleteWork = computed(() => {
      if (!workOrder.value?.items || workOrder.value?.status !== 'picking') return false
      
      // ตรวจสอบว่าทุกรายการถูกตัดสต็อคแล้วหรือไม่
      const allItemsPicked = workOrder.value.items.every(item => item.status === 'picked')
      
      console.log('🔍 Can Complete Work Check:', {
        workOrderStatus: workOrder.value?.status,
        totalItems: workOrder.value?.items?.length,
        allItemsPicked: allItemsPicked,
        itemStatuses: workOrder.value?.items?.map(item => ({ 
          name: item.product_name, 
          status: item.status 
        }))
      })
      
      return allItemsPicked
    })

    // ตรวจสอบว่า item แต่ละรายการมีการจองหรือไม่
    const hasItemReservation = (item) => {
      if (!workOrder.value?.inventory_reservations || workOrder.value.inventory_reservations.length === 0) {
        return false
      }

      // ค้นหาการจองที่ตรงกับ item นี้
      const reservation = workOrder.value.inventory_reservations.find(res => 
        res.product_id === item.product_id || 
        res.sku === item.sku ||
        (item.sku && res.sku === item.sku) ||
        (item.product_code && res.sku === item.product_code)
      )

      const hasReservation = !!reservation

      console.log('🔍 Item Reservation Check:', {
        itemName: item.product_name,
        itemSku: item.sku,
        itemProductId: item.product_id,
        hasReservation: hasReservation,
        reservationFound: reservation ? {
          inventory_id: reservation.inventory_id,
          product_id: reservation.product_id,
          sku: reservation.sku,
          reserved_quantity: reservation.reserved_quantity
        } : null
      })

      return hasReservation
    }

    // รับข้อมูลการจองของ item
    const getItemReservation = (item) => {
      if (!workOrder.value?.inventory_reservations || workOrder.value.inventory_reservations.length === 0) {
        return null
      }

      return workOrder.value.inventory_reservations.find(res => 
        res.product_id === item.product_id || 
        res.sku === item.sku ||
        (item.sku && res.sku === item.sku) ||
        (item.product_code && res.sku === item.product_code)
      )
    }

    const pickedItemsCount = computed(() => {
      if (!workOrder.value?.items) return 0
      
      // Force reactivity by accessing the entire items array
      const items = [...workOrder.value.items]
      
      // คำนวณจากจำนวนที่ตัดสต็อคจริง (picked_quantity)
      let totalPicked = 0
      let totalRequired = 0
      
      for (const item of items) {
        const pickedQty = item.picked_quantity || 0
        const requiredQty = item.required_quantity || item.quantity || 0
        
        totalPicked += pickedQty
        totalRequired += requiredQty
      }
      
      // คำนวณ percentage ของการหยิบสินค้า
      const pickedPercentage = totalRequired > 0 ? (totalPicked / totalRequired) : 0
      
      console.log('📊 Items Progress Debug:', {
        totalItems: items.length,
        totalRequired: totalRequired,
        totalPicked: totalPicked,
        pickedPercentage: Math.round(pickedPercentage * 100) + '%',
        workOrderStatus: workOrder.value?.status,
        itemDetails: items.map(item => ({ 
          name: item.product_name, 
          status: item.status,
          required: item.required_quantity || item.quantity || 0,
          picked: item.picked_quantity || 0
        }))
      })
      
      // ส่งคืนจำนวน item ที่หยิบครบแล้ว (picked_quantity >= required_quantity)
      return items.filter(item => {
        const pickedQty = item.picked_quantity || 0
        const requiredQty = item.required_quantity || item.quantity || 0
        return pickedQty >= requiredQty && requiredQty > 0
      }).length
    })

    const totalItemsCount = computed(() => {
      return workOrder.value?.items?.length || 0
    })

    const progressPercentage = computed(() => {
      if (totalItemsCount.value === 0) return 0
      const percentage = (pickedItemsCount.value / totalItemsCount.value) * 100
      console.log('📈 Progress Percentage:', percentage + '%')
      return percentage
    })

    // คำนวณจำนวนรวมของการหยิบสินค้า
    const totalQuantityStats = computed(() => {
      if (!workOrder.value?.items) return { required: 0, picked: 0, percentage: 0 }
      
      const items = workOrder.value.items
      let totalRequired = 0
      let totalPicked = 0
      
      for (const item of items) {
        totalRequired += item.required_quantity || item.quantity || 0
        totalPicked += item.picked_quantity || 0
      }
      
      const percentage = totalRequired > 0 ? (totalPicked / totalRequired) * 100 : 0
      
      return {
        required: totalRequired,
        picked: totalPicked,
        percentage: Math.round(percentage)
      }
    })

    const allActivityLogs = computed(() => {
      const dbLogs = workOrder.value?.activityLog || []
      const localLogs = workOrder.value?._localActivityLog || []
      
      console.log('🔍 Activity Logs Debug:', {
        dbLogs: dbLogs.length,
        localLogs: localLogs.length,
        workOrderId: workOrder.value?.id,
        status: workOrder.value?.status
      })
      
      // Combine and sort by timestamp
      const combined = [...dbLogs, ...localLogs].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
      
      console.log('📝 Combined Activity Logs:', combined)
      return combined
    })

    const totalReservedQuantity = computed(() => {
      if (!workOrder.value?.inventory_reservations || workOrder.value.inventory_reservations.length === 0) return 0
      return workOrder.value.inventory_reservations.reduce((total, reservation) => {
        return total + (reservation.reserved_quantity || 0)
      }, 0)
    })

    // Progress computations for reservations
    const pickedReservationsCount = computed(() => {
      if (!workOrder.value?.inventory_reservations) return 0
      
      const reservations = [...workOrder.value.inventory_reservations]
      const pickedCount = reservations.filter(res => res.status === 'picked').length
      
      console.log('📊 Reservations Progress:', {
        totalReservations: reservations.length,
        pickedReservations: pickedCount,
        workOrderStatus: workOrder.value?.status
      })
      
      return pickedCount
    })

    const totalReservationsCount = computed(() => {
      return workOrder.value?.inventory_reservations?.length || 0
    })

    const reservationProgressPercentage = computed(() => {
      if (totalReservationsCount.value === 0) return 0
      const percentage = (pickedReservationsCount.value / totalReservationsCount.value) * 100
      return percentage
    })

    const canCompleteReservationWork = computed(() => {
      if (!workOrder.value?.inventory_reservations || workOrder.value?.status !== 'picking') return false
      
      const allReservationsPicked = workOrder.value.inventory_reservations.every(res => res.status === 'picked')
      
      console.log('🔍 Can Complete Reservation Work Check:', {
        workOrderStatus: workOrder.value?.status,
        totalReservations: workOrder.value?.inventory_reservations?.length,
        allReservationsPicked: allReservationsPicked
      })
      
      return allReservationsPicked
    })

    const canRevertStatus = computed(() => {
      const status = workOrder.value?.status
      // สามารถย้อนกลับได้เฉพาะสถานะที่ไม่ใช่ pending
      return status && status !== 'pending' && status !== 'complete'
    })

    const previousStatusMap = {
      'picking': 'pending',
      'picked': 'picking', 
      'ready': 'picked',
      'complete': 'ready'
    }

    // Methods
    const loadWorkOrder = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const workOrderId = route.params.id
        const result = await engine.read('work-order', workOrderId)
        
        if (result.success && result.data) {
          workOrder.value = result.data
          console.log('🎯 Work Order loaded:', {
            id: result.data.id,
            order_number: result.data.order_number,
            status: result.data.status,
            items_count: result.data.items?.length || 0,
            inventory_reservations_count: result.data.inventory_reservations?.length || 0,
            sales_order_id: result.data.sales_order_id
          })
          
          // Debug ข้อมูล items ที่มาจากฐานข้อมูล
          if (workOrder.value.items && workOrder.value.items.length > 0) {
            console.log('📋 Work Order Items:', workOrder.value.items)
          }
          
          // Debug ข้อมูล inventory_reservations ที่มาจากฐานข้อมูล  
          if (workOrder.value.inventory_reservations && workOrder.value.inventory_reservations.length > 0) {
            console.log('📦 Existing Inventory Reservations:', workOrder.value.inventory_reservations)
          }
          
          // ✅ ตรวจสอบและสร้างข้อมูลการจอง หากยังไม่มี
          await ensureInventoryReservations()
          
          // ✅ เชื่อมโยงข้อมูลสินค้าจริงๆ กับ inventory reservations
          if (workOrder.value.inventory_reservations && workOrder.value.inventory_reservations.length > 0) {
            await enrichReservationsWithProductData()
          }
          
          // โหลดข้อมูล Sales Order ที่เกี่ยวข้อง
          if (workOrder.value.sales_order_id) {
            await loadSalesOrderData(workOrder.value.sales_order_id)
          }
          
          // เพิ่ม initial activity log ถ้ายังไม่มี
          if (!workOrder.value._localActivityLog || workOrder.value._localActivityLog.length === 0) {
            workOrder.value._localActivityLog = [{
              action: 'created',
              description: `Work Order สร้างเรียบร้อยแล้ว`,
              user: 'ระบบ',
              timestamp: workOrder.value.created_at || new Date().toISOString(),
              notes: `Work Order ${workOrder.value.order_number} ถูกสร้างขึ้น`
            }]
          }
        } else {
          error.value = result.error || 'ไม่พบข้อมูล Work Order'
        }
      } catch (err) {
        console.error('Error loading work order:', err)
        error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }

    const loadSalesOrderData = async (salesOrderId) => {
      try {
        console.log('📋 Loading Sales Order data:', salesOrderId)
        
        const result = await engine.read('sales', salesOrderId)
        
        if (result.success && result.data) {
          salesOrderData.value = result.data
          console.log('✅ Sales Order data loaded:', result.data)
        } else {
          console.warn('⚠️ Failed to load Sales Order data:', result.error)
          salesOrderData.value = null
        }
      } catch (error) {
        console.error('❌ Error loading Sales Order data:', error)
        salesOrderData.value = null
      }
    }

    const ensureInventoryReservations = async () => {
      try {
        console.log('🔍 Ensuring inventory reservations exist...')
        
        // ถ้ามีการจองอยู่แล้ว ก็ไม่ต้องทำอะไร
        if (workOrder.value?.inventory_reservations && workOrder.value.inventory_reservations.length > 0) {
          console.log('✅ Inventory reservations already exist:', workOrder.value.inventory_reservations.length)
          return
        }
        
        // ถ้าไม่มีการจอง แต่มี items ให้สร้างการจองจาก items
        if (workOrder.value?.items && workOrder.value.items.length > 0) {
          console.log('🔄 Creating inventory reservations from Work Order items...')
          
          const reservations = []
          
          for (const item of workOrder.value.items) {
            // สร้าง reservation สำหรับ item แต่ละรายการ
            const reservation = {
              inventory_id: `WO-${workOrder.value.id}-${item.product_id || item.sku || Date.now()}`,
              product_id: item.product_id,
              product_name: item.product_name,
              sku: item.sku || item.product_code,
              reserved_quantity: item.required_quantity || item.quantity || 1,
              picked_quantity: item.picked_quantity || 0,
              unit: item.unit || 'piece',
              status: item.status === 'picked' ? 'picked' : (item.status === 'picking' ? 'picking' : 'reserved'),
              notes: `จองสำหรับ Work Order ${workOrder.value.order_number}`,
              created_date: new Date().toISOString(),
              work_order_id: workOrder.value.id
            }
            
            reservations.push(reservation)
          }
          
          // อัปเดต Work Order ด้วยข้อมูลการจองที่สร้างใหม่
          workOrder.value.inventory_reservations = reservations
          
          console.log('✅ Created inventory reservations from items:', reservations.length, reservations)
          
          // ใช้ข้อมูล inventory_reservations ใน memory เท่านั้น 
          // ไม่ต้องบันทึกลงฐานข้อมูลเพื่อหลีกเลี่ยงปัญหา schema validation
          console.log('💾 Using inventory reservations in memory only (not saving to database)')
        } else {
          console.log('⚠️ No items found in Work Order to create reservations from')
        }
        
      } catch (error) {
        console.error('❌ Error ensuring inventory reservations:', error)
      }
    }

    const enrichReservationsWithProductData = async () => {
      try {
        console.log('🔍 Enriching inventory reservations with product data...')
        
        if (!workOrder.value?.inventory_reservations || workOrder.value.inventory_reservations.length === 0) {
          return
        }
        
        // โหลดข้อมูลสินค้าทั้งหมด
        const productsResult = await engine.list('product')
        const products = productsResult?.data || []
        
        console.log(`📦 Found ${products.length} products in database`)
        
        // เชื่อมโยงข้อมูลสินค้ากับ reservation แต่ละรายการ
        const enrichedReservations = []
        
        for (const reservation of workOrder.value.inventory_reservations) {
          console.log(`🔍 Processing reservation:`, reservation)
          
          // ค้นหาข้อมูลสินค้าจาก product_id
          let productData = products.find(p => p.id === reservation.product_id)
          
          // ถ้าไม่เจอให้ลองค้นหาจาก SKU หรือ code
          if (!productData && reservation.sku) {
            productData = products.find(p => 
              p.sku === reservation.sku || 
              p.code === reservation.sku ||
              p.product_code === reservation.sku
            )
          }
          
          // สร้าง enriched reservation พร้อมข้อมูลสินค้า
          const enrichedReservation = {
            ...reservation,
            // ข้อมูลสินค้าจาก Product table
            sku: productData?.sku || productData?.code || reservation.sku || 'UNKNOWN',
            product_name: productData?.name || reservation.product_name || 'ไม่ทราบชื่อสินค้า',
            product_code: productData?.code || productData?.sku || reservation.sku || 'UNKNOWN',
            category: productData?.category || null,
            brand: productData?.brand || null,
            unit: productData?.unit || reservation.unit || 'ชิ้น',
            description: productData?.description || null,
            // ข้อมูลการจอง
            reserved_quantity: reservation.reserved_quantity || 0,
            // สถานะข้อมูล
            product_found: !!productData,
            original_notes: reservation.notes
          }
          
          enrichedReservations.push(enrichedReservation)
          
          console.log(`✅ Enriched reservation:`, {
            inventory_id: reservation.inventory_id,
            product_id: reservation.product_id,
            product_name: enrichedReservation.product_name,
            sku: enrichedReservation.sku,
            product_found: enrichedReservation.product_found
          })
        }
        
        // อัปเดต inventory_reservations ด้วยข้อมูลที่ enriched แล้ว
        workOrder.value.inventory_reservations = enrichedReservations
        
        console.log(`🎉 Successfully enriched ${enrichedReservations.length} inventory reservations with product data`)
        
      } catch (error) {
        console.error('❌ Error enriching reservations with product data:', error)
      }
    }

    const viewSalesOrder = () => {
      if (workOrder.value?.sales_order_id) {
        // Navigate to sales order detail page
        window.open(`/sales/sales-order/${workOrder.value.sales_order_id}`, '_blank')
      }
    }

    const changeStatus = (newStatus) => {
      pendingStatus.value = newStatus
      statusNotes.value = ''
      showStatusModal.value = true
    }

    const confirmStatusChange = async () => {
      if (processingStatus.value) return
      
      try {
        processingStatus.value = true
        
        // ตรวจสอบเงื่อนไขพิเศษสำหรับสถานะ 'picked'
        if (pendingStatus.value === 'picked' && !canCompleteWork.value) {
          alert('ไม่สามารถเปลี่ยนเป็น "หยิบเสร็จแล้ว" ได้ เนื่องจากยังตัดสต็อคไม่ครบทุกรายการ')
          return
        }
        
        console.log(`🔄 เปลี่ยนสถานะจาก "${getStatusText(workOrder.value.status)}" เป็น "${getStatusText(pendingStatus.value)}"`)
        
        // เตรียม activity log entry (เก็บ local)
        const activityEntry = {
          action: 'status_change',
          description: `เปลี่ยนสถานะจาก "${getStatusText(workOrder.value.status)}" เป็น "${getStatusText(pendingStatus.value)}"`,
          user: 'ผู้ใช้ระบบ',
          timestamp: new Date().toISOString(),
          notes: statusNotes.value || null,
          from_status: workOrder.value.status,
          to_status: pendingStatus.value
        }
        
        // อัปเดต item status ตาม work order status
        let updatedItems = [...(workOrder.value.items || [])]
        if (pendingStatus.value === 'picked') {
          // เมื่อ work order เป็น picked ให้ทุก item เป็น picked
          updatedItems = updatedItems.map(item => ({
            ...item,
            status: 'picked',
            picked_quantity: item.required_quantity || item.quantity || 0
          }))
        } else if (pendingStatus.value === 'picking') {
          // เมื่อเริ่ม picking ให้ทุก item เป็น picking
          updatedItems = updatedItems.map(item => ({
            ...item,
            status: 'picking'
          }))
        }
        
        // ส่งเฉพาะฟิลด์ที่จำเป็น (ตาม schema) + items
        const updateData = {
          status: pendingStatus.value,
          notes: statusNotes.value || workOrder.value.notes || '',
          items: updatedItems
        }
        
        const result = await engine.update('work-order', workOrder.value.id, updateData)
        
        if (!result.success) {
          throw new Error(result.error || 'ไม่สามารถอัพเดทข้อมูลได้')
        }
        
        console.log(`✅ เปลี่ยนสถานะเป็น "${getStatusText(pendingStatus.value)}" เรียบร้อยแล้ว`)
        
        // ปิด modal ก่อน
        showStatusModal.value = false
        
        // อัปเดตข้อมูล local
        const updatedWorkOrder = result.data || {
          ...workOrder.value,
          status: pendingStatus.value,
          items: updatedItems // ใช้ items ที่อัปเดตแล้ว
        }
        
        // ให้แน่ใจว่า items ถูกอัปเดต
        if (result.data && result.data.items) {
          updatedWorkOrder.items = updatedItems // Override ด้วย items ใหม่
        }
        
        // เก็บ activity log ใน local
        const existingActivityLog = updatedWorkOrder._localActivityLog || workOrder.value._localActivityLog || []
        updatedWorkOrder._localActivityLog = [...existingActivityLog, activityEntry]
        
        // อัปเดต workOrder แบบ reactive
        workOrder.value = updatedWorkOrder
        
        console.log('✅ Status & Items updated:', {
          newStatus: pendingStatus.value,
          totalLogs: workOrder.value._localActivityLog.length,
          itemsUpdated: updatedItems.length,
          itemStatuses: updatedItems.map(item => ({ name: item.product_name, status: item.status }))
        })
        
      } catch (err) {
        console.error('Error changing status:', err)
        console.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ:', err.message)
        showStatusModal.value = false
      } finally {
        processingStatus.value = false
      }
    }

    const cancelStatusChange = () => {
      showStatusModal.value = false
      pendingStatus.value = ''
      statusNotes.value = ''
    }

    const pickItem = async (itemIndex) => {
      try {
        processingItem.value = itemIndex
        
        // อัพเดทสถานะ item เป็น picking
        const updatedItems = [...workOrder.value.items]
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          status: 'picking'
        }
        
        // เตรียม activity log entry
        const activityEntry = {
          timestamp: new Date().toISOString(),
          user: 'ผู้ใช้ระบบ',
          action: 'item_pick_start',
          description: `เริ่มหยิบสินค้า: ${updatedItems[itemIndex].product_name}`,
          notes: `เริ่มหยิบสินค้า ${updatedItems[itemIndex].product_name} จำนวน ${updatedItems[itemIndex].required_quantity} ${updatedItems[itemIndex].unit}`
        }
        
        const updateData = {
          items: updatedItems
        }
        
        const result = await engine.update('work-order', workOrder.value.id, updateData)
        
        if (result.success) {
          // อัปเดตข้อมูล local พร้อม items ใหม่
          const updatedWorkOrder = result.data || {
            ...workOrder.value,
            items: updatedItems
          }
          
          // ให้แน่ใจว่า items ถูก merge ถูกต้อง
          if (result.data && result.data.items) {
            updatedWorkOrder.items = updatedItems // Override กับ items ที่อัปเดตแล้ว
          }
          
          // เก็บ activity log ใน local
          const existingActivityLog = updatedWorkOrder._localActivityLog || workOrder.value._localActivityLog || []
          updatedWorkOrder._localActivityLog = [...existingActivityLog, activityEntry]
          
          // อัปเดต workOrder แบบ reactive
          workOrder.value = updatedWorkOrder
          
          console.log('✅ Item picking started and activity logged:', {
            newEntry: activityEntry,
            totalLogs: workOrder.value._localActivityLog.length,
            itemName: updatedItems[itemIndex].product_name,
            itemStatus: updatedItems[itemIndex].status
          })
        } else {
          throw new Error(result.error || 'ไม่สามารถอัพเดทสถานะสินค้าได้')
        }
        
      } catch (error) {
        console.error('Error picking item:', error)
        alert('เกิดข้อผิดพลาด: ' + error.message)
      } finally {
        processingItem.value = null
      }
    }

    const confirmPick = async (itemIndex) => {
      console.log('🎯 [DEBUG] confirmPick called with itemIndex:', itemIndex)
      
      // ป้องกันการกดปุ่มซ้ำขณะประมวลผล
      if (processingItem.value !== null) {
        console.log('⏳ [DEBUG] Already processing item:', processingItem.value)
        return
      }
      
      try {
        processingItem.value = itemIndex
        console.log('🔒 [DEBUG] Set processing item to:', itemIndex)
        
        const item = workOrder.value.items[itemIndex]
        
        console.log('🔄 [DEBUG] Starting stock cut for item:', {
          product_name: item.product_name,
          sku: item.sku,
          product_id: item.product_id,
          required_quantity: item.required_quantity,
          unit: item.unit,
          workOrderId: workOrder.value.id,
          warehouse: workOrder.value.warehouse
        })
        
        // ✅ เช็คว่ามีการจองก่อน - ถ้าไม่มีให้หยุด
        console.log('🔍 [DEBUG] Checking reservation for item...')
        console.log('📋 [DEBUG] Work order reservations:', workOrder.value?.inventory_reservations)
        
        const itemReservation = getItemReservation(item)
        console.log('🔎 [DEBUG] Found item reservation:', itemReservation)
        
        if (!itemReservation) {
          console.error('❌ [DEBUG] No reservation found for item:', item)
          throw new Error(`ไม่พบการจองสำหรับสินค้า ${item.product_name} - ไม่สามารถตัดสต็อคได้`)
        }
        
        console.log('✅ [DEBUG] Found reservation for item:', itemReservation)
        
        // ✅ ตัดสต็อคจริงจาก Balance
        console.log('🔄 [DEBUG] Starting balance cut process...')
        console.log('🔧 [DEBUG] Engine instance:', engine)
        
        let stockCutSuccess = false
        let stockBefore = 0
        let stockAfter = 0
        const reservedQuantity = itemReservation.reserved_quantity || 0
        let reservationRecord = null
        
        console.log('📊 [DEBUG] Initial variables:', {
          stockCutSuccess,
          stockBefore,
          stockAfter,
          reservedQuantity
        })
        
        // ✅ Helper functions (จาก GoodsReceipt.vue)
        const mapUnitToThai = (unit) => {
          const unitMap = {
            'piece': 'ชิ้น',
            'pieces': 'ชิ้น',
            'set': 'ชุด',
            'box': 'กล่อง',
            'pack': 'แพ็ค',
            'kg': 'กิโลกรัม',
            'kilogram': 'กิโลกรัม',
            'g': 'กรัม',
            'gram': 'กรัม',
            'l': 'ลิตร',
            'liter': 'ลิตร',
            'm': 'เมตร',
            'meter': 'เมตร',
            'roll': 'ม้วน',
            'bottle': 'ขวด',
            'bag': 'ถุง'
          }
          return unitMap[unit?.toLowerCase()] || unit || 'ชิ้น'
        }

        const normalizeCategory = (category) => {
          if (!category) return 'general'
          
          const categoryMap = {
            'electronics': 'electronics',
            'electronic': 'electronics',
            'อิเล็กทรอนิกส์': 'electronics',
            'food': 'food_beverage',
            'food & beverage': 'food_beverage',
            'อาหารและเครื่องดื่ม': 'food_beverage',
            'clothing': 'clothing_fashion',
            'fashion': 'clothing_fashion',
            'เสื้อผ้า': 'clothing_fashion',
            'tools': 'tools_equipment',
            'equipment': 'tools_equipment',
            'เครื่องมือ': 'tools_equipment',
            'general': 'general',
            'ทั่วไป': 'general',
            'office': 'office_supplies',
            'supplies': 'office_supplies',
            'เครื่องเขียน': 'office_supplies'
          }
          
          const normalized = categoryMap[category.toLowerCase()] || category.toLowerCase()
          console.log(`📂 Category normalized: "${category}" → "${normalized}"`)
          return normalized
        }
        
        try {
          // ✅ ตรวจสอบ inventory record จริงจาก reservation
          console.log("🔗 Looking up reservation inventory record...")
          
          if (itemReservation.inventory_id) {
            const inventoryResult = await engine.read('inventory', itemReservation.inventory_id)
            if (inventoryResult.success && inventoryResult.data) {
              reservationRecord = inventoryResult.data
              
              // ตรวจสอบสถานะ - ต้องยังไม่เป็น 'complete'
              if (reservationRecord.status === 'complete') {
                console.warn(`⚠️ Reservation already completed - cannot cut stock again`)
                alert(`การจองสำหรับสินค้า ${item.product_name} ถูกใช้งานแล้ว ไม่สามารถตัดสต็อกซ้ำได้`)
                return
              }
              
              console.log(`✅ Found active reservation record:`, reservationRecord)
            } else {
              throw new Error(`ไม่สามารถโหลดข้อมูลการจอง ID: ${itemReservation.inventory_id}`)
            }
          } else {
            throw new Error(`ไม่มี inventory_id ในการจอง`)
          }
          
          // ✅ หาข้อมูล Balance ปัจจุบัน
          console.log('📋 [DEBUG] About to call engine.list for inventory_balance...')
          const balanceResult = await engine.list('inventory_balance')
          console.log('📊 [DEBUG] Balance list result:', balanceResult)
          
          const balances = balanceResult?.data || []
          console.log('📦 [DEBUG] Found balances:', balances.length)
          
          console.log('[DEBUG] Looking for balance:', {
            product_id: item.product_id,
            sku: item.sku,
            product_name: item.product_name,
            reservedQuantity: reservedQuantity
          })
          
          // ค้นหาจาก product_id, sku, หรือ product_code
          let existingBalance = balances.find(b => 
            b.product_id === item.product_id || 
            b.sku === item.sku ||
            b.product_code === item.sku ||
            (item.product_id && b.product_id === item.product_id) ||
            (item.sku && (b.sku === item.sku || b.product_code === item.sku))
          )
          
          console.log(`📊 Found balance for ${item.product_id || item.sku}:`, existingBalance)
          
          // ถ้าไม่พบ Balance ให้สร้างใหม่
          if (!existingBalance) {
            console.log(`⚡ Creating new balance for ${item.sku}...`)
            
            // ตรวจสอบข้อมูลที่จำเป็น
            if (!item.sku) {
              throw new Error(`ไม่สามารถสร้าง Balance ได้: ไม่มี SKU สำหรับสินค้า ${item.product_name}`)
            }
            
            const newBalanceData = {
              product_id: item.product_id || item.sku,
              product_code: item.sku || item.product_id || 'UNKNOWN',
              sku: item.sku || item.product_id || 'UNKNOWN',
              product_name: item.product_name || 'Unknown Product',
              qty_on_hand: 0,
              qty_reserved: 0,
              qty_available: 0,
              qty_allocated: 0,
              qty_committed: 0,
              warehouse: workOrder.value.warehouse || 'main',
              location: item.location || 'default',
              unit: mapUnitToThai(item.unit),
              category: normalizeCategory(item.category),
              cost_per_unit: 0,
              value_on_hand: 0,
              last_calculated: new Date().toISOString(),
              created_date: new Date().toISOString(),
              updated_date: new Date().toISOString(),
              created_by: 'work_order_system',
              updated_by: 'work_order_system',
              status: 'active'
            }
            
            console.log(`📋 Creating balance with data:`, newBalanceData)
            
            const createResult = await engine.create('inventory_balance', newBalanceData, 'work_order_system')
            
            if (createResult.success) {
              existingBalance = createResult.data
              console.log(`✅ Created new balance:`, existingBalance)
            } else {
              console.error(`❌ Failed to create balance:`, createResult)
              throw new Error(`ไม่สามารถสร้าง Balance ใหม่ได้: ${createResult.error}`)
            }
          }
          
          if (existingBalance) {
            stockBefore = existingBalance.qty_on_hand || 0
            
            // ✅ ประกาศตัวแปรทั้งหมดที่จำเป็นก่อนใช้งาน
            let actualCutQuantity = item.required_quantity // จำนวนที่จะตัดจริง
            const currentReserved = existingBalance.qty_reserved || 0
            let updatedQuantity = 0
            let newReserved = currentReserved
            let newAvailable = 0
            
            // ✅ ตรวจสอบว่ามีสต็อกพอหรือไม่ โดยพิจารณา reservation และตัดตามจำนวนที่จองไว้
            
            if (reservedQuantity > 0) {
              // ✅ กรณีมีการจองไว้ - ตัดตามจำนวนที่จอง
              actualCutQuantity = Math.min(item.required_quantity, reservedQuantity)
              
              if (reservedQuantity >= item.required_quantity) {
                console.log(`✅ Using full reservation: ${actualCutQuantity} ${item.unit} from ${reservedQuantity} reserved`)
              } else {
                console.log(`✅ Using partial reservation: ${actualCutQuantity} ${item.unit} from ${reservedQuantity} reserved`)
                
                const remaining = item.required_quantity - actualCutQuantity
                if (remaining > 0) {
                  const shouldContinueWithExtra = confirm(
                    `การจองมีเพียง ${reservedQuantity} ${item.unit} แต่ต้องการ ${item.required_quantity} ${item.unit}\n\n` +
                    `จะตัดจากการจอง: ${actualCutQuantity} ${item.unit}\n` +
                    `ยังขาดอีก: ${remaining} ${item.unit}\n\n` +
                    `ต้องการตัดเพิ่มจากสต็อกทั่วไปหรือไม่?`
                  )
                  
                  if (shouldContinueWithExtra) {
                    actualCutQuantity = item.required_quantity // ตัดเต็มจำนวน
                    console.log(`✅ User approved cutting additional ${remaining} ${item.unit} from general stock`)
                  } else {
                    console.log(`📋 User chose to cut only reserved quantity: ${actualCutQuantity} ${item.unit}`)
                  }
                }
              }
            } else if (stockBefore < item.required_quantity) {
              // กรณีไม่มีการจองและสต็อกไม่พอ
              const shouldContinue = confirm(`⚠️ ไม่มีการจองและสต็อกไม่เพียงพอ!\n\nมีอยู่: ${stockBefore} ${item.unit}\nต้องการ: ${item.required_quantity} ${item.unit}\nจะทำให้สต็อกติดลบ ${Math.abs(stockBefore - item.required_quantity)} ${item.unit}\n\nต้องการดำเนินการต่อหรือไม่?`)
              
              if (!shouldContinue) {
                throw new Error(`ยกเลิกการตัดสต็อค: ผู้ใช้เลือกไม่ดำเนินการเนื่องจากสต็อกไม่พอ`)
              }
              
              console.warn(`⚠️ Proceeding with negative stock: ${stockBefore} → ${stockBefore - actualCutQuantity}`)
            } else {
              console.log(`✅ Sufficient stock without reservation: ${stockBefore} >= ${item.required_quantity}`)
            }
            
            // ✅ อัปเดตค่าการคำนวณใหม่ตามจำนวนที่ตัดจริง
            stockAfter = stockBefore - actualCutQuantity
            updatedQuantity = stockAfter
            
            // ปรับ reserved ถ้าจำเป็น (ลด reserved เมื่อตัดสต็อค)
            if (currentReserved > 0) {
              // ลด reserved ตามจำนวนที่ตัด (แต่ไม่ให้ติดลบ)
              newReserved = Math.max(0, currentReserved - actualCutQuantity)
            }
            
            newAvailable = Math.max(0, updatedQuantity - newReserved)
            
            // เตือนเมื่อสต็อกต่ำ
            if (stockAfter <= 5) {
              console.warn(`⚠️ Low stock warning: ${item.product_name} will have only ${stockAfter} ${item.unit} remaining`)
            }
            
            const updateData = {
              qty_on_hand: updatedQuantity,
              qty_reserved: newReserved,
              qty_available: newAvailable,
              last_calculated: new Date().toISOString(),
              updated_date: new Date().toISOString(),
              updated_by: 'work_order_system'
            }
            
            console.log(`📝 Updating balance:`, {
              balanceId: existingBalance.id,
              before: {
                qty_on_hand: stockBefore,
                qty_reserved: currentReserved,
                qty_available: existingBalance.qty_available
              },
              after: updateData,
              cutQuantity: item.required_quantity
            })
            
            console.log('💾 [DEBUG] About to update balance with data:', updateData)
            const updateResult = await engine.update('inventory_balance', existingBalance.id, updateData)
            console.log('📊 [DEBUG] Balance update result:', updateResult)
            
            if (updateResult.success) {
              stockCutSuccess = true
              console.log(`✅ [DEBUG] Balance updated successfully: ${stockBefore} → ${stockAfter} (Reserved: ${currentReserved} → ${newReserved})`)
              
              // ✅ อัปเดต reservation record เป็น 'complete' เพื่อป้องกันการตัดสต็อกซ้ำ
              if (reservationRecord && reservedQuantity > 0) {
                try {
                  const usedQuantity = Math.min(item.required_quantity, reservedQuantity)
                  
                  console.log(`📝 Updating reservation record to complete:`, {
                    reservationId: reservationRecord.id,
                    originalQuantity: reservationRecord.quantity,
                    usedQuantity: usedQuantity,
                    workOrderId: workOrder.value.id
                  })
                  
                  // ✅ เปลี่ยนสถานะเป็น 'complete' เพื่อป้องกันการใช้งานซ้ำ (ใช้เฉพาะฟิลด์ที่ schema อนุญาต)
                  const reservationUpdateData = {
                    status: 'complete', // เปลี่ยนเป็น complete แทน used
                    notes: `${reservationRecord.notes || ''} | Completed in Work Order ${workOrder.value.order_number || workOrder.value.id} - Used ${usedQuantity} ${item.unit}`,
                    updated_date: new Date().toISOString(),
                    updated_by: 'work_order_system'
                  }
                  
                  const reservationUpdateResult = await engine.update('inventory', reservationRecord.id, reservationUpdateData)
                  
                  if (reservationUpdateResult.success) {
                    console.log(`✅ Reservation marked as complete: ${usedQuantity} ${item.unit} (ID: ${reservationRecord.id})`)
                    
                    // ✅ อัปเดต local data ใน work order ด้วย
                    if (workOrder.value.inventory_reservations) {
                      const localReservation = workOrder.value.inventory_reservations.find(res => 
                        res.inventory_id === reservationRecord.id || res.product_id === item.product_id
                      )
                      if (localReservation) {
                        localReservation.status = 'complete'
                        // ลบฟิลด์ที่ไม่รู้จัก - ใช้เฉพาะข้อมูลที่ schema อนุญาต
                        localReservation.notes = `${localReservation.notes || ''} | Used ${usedQuantity} ${item.unit || 'ชิ้น'} in WO ${workOrder.value.order_number || workOrder.value.id}`
                        console.log(`✅ Updated local reservation data for product ${item.product_id}`)
                      }
                    }
                  } else {
                    console.warn(`⚠️ Failed to update reservation to complete:`, reservationUpdateResult.error)
                  }
                  
                } catch (reservationError) {
                  console.warn(`⚠️ Reservation completion failed:`, reservationError.message)
                  // ไม่หยุดกระบวนการหลัก
                }
              }
              
              // ✅ สร้าง inventory stock_movement record (แบบ GoodsReceipt.vue)
              // ✅ แปลงหน่วยให้ตรงกับ validation schema
              const mapUnitToThai = (unit) => {
                const unitMap = {
                  'piece': 'ชิ้น',
                  'pieces': 'ชิ้น',
                  'set': 'ชุด',
                  'box': 'กล่อง',
                  'pack': 'แพ็ค',
                  'kg': 'กิโลกรัม',
                  'kilogram': 'กิโลกรัม',
                  'g': 'กรัม',
                  'gram': 'กรัม',
                  'l': 'ลิตร',
                  'liter': 'ลิตร',
                  'm': 'เมตร',
                  'meter': 'เมตร',
                  'roll': 'ม้วน',
                  'bottle': 'ขวด',
                  'bag': 'ถุง'
                }
                return unitMap[unit?.toLowerCase()] || unit || 'ชิ้น'
              }
              
              const movementUnit = mapUnitToThai(item.unit)
              
              const movementData = {
                subtype: 'stock_movement',
                product_id: item.product_id,
                product_code: item.product_code || item.sku,
                sku: item.sku,
                product_name: item.product_name,
                movement_type: 'issue', // ใช้ 'issue' สำหรับการจ่ายออก
                transaction_type: 'out',
                quantity: actualCutQuantity,
                unit: movementUnit,
                unit_price: 0, // ราคาต่อหน่วย (ถ้ามี)
                reference_type: 'work_order',
                reference_id: workOrder.value.id,
                reference_number: workOrder.value.order_number || workOrder.value.id,
                work_order_id: workOrder.value.id,
                sales_order_id: workOrder.value.sales_order_id,
                reservation_id: reservationRecord?.id,
                notes: `Stock issued for Work Order ${workOrder.value.order_number || workOrder.value.id}${reservedQuantity > 0 ? ` (from reservation: ${reservedQuantity} ${movementUnit})` : ''}`,
                movement_date: new Date().toISOString(),
                created_by: 'work_order_system',
                status: 'completed'
              }
              
              console.log('📦 [DEBUG] About to create inventory movement with data:', movementData)
              console.log('🔧 [DEBUG] TRANSACTION_TYPES.INVENTORY:', TRANSACTION_TYPES.INVENTORY)
              
              const movementResult = await engine.create(TRANSACTION_TYPES.INVENTORY, movementData, 'work_order_system')
              console.log('📋 [DEBUG] Inventory movement creation result:', movementResult)
              
              if (movementResult.success) {
                console.log('✅ [DEBUG] Successfully created inventory movement record:', movementResult.data?.id)
                
                // ✅ Update Balance using ERP_CORE.balance (แบบ GoodsReceipt.vue)
                try {
                  console.log(`📊 Updating balance for product ${item.sku} using ERP_CORE.balance...`)
                  
                  if (window.ERP_CORE && window.ERP_CORE.balance) {
                    // Normalize and validate category
                    const normalizedCategory = normalizeCategory(item.category)
                    
                    // Clean product data for balance management (only valid balance fields)
                    const productData = {
                      id: item.product_id,
                      sku: item.sku,
                      product_name: item.product_name,
                      unit: mapUnitToThai(item.unit),
                      category: normalizedCategory,
                      status: item.status || 'active'
                    }
                    
                    console.log(`📦 Product data for balance:`, productData)
                    
                    // Try to ensure product balance exists
                    try {
                      await window.ERP_CORE.balance.ensureProductBalance(productData, {
                        updatedBy: 'work_order_system'
                      })
                      console.log(`✅ Product balance ensured for ${item.sku}`)
                    } catch (ensureError) {
                      console.warn(`⚠️ Could not ensure balance for ${item.sku}:`, ensureError.message)
                      // Continue with movement update anyway
                    }
                    
                    // Enhanced movement data with proper categorization and Balance-compatible format
                    const enhancedMovementData = {
                      ...movementData,
                      product_code: item.product_code || item.sku,
                      category: normalizedCategory,
                      movement_type: 'OUT', // Convert 'issue' to 'OUT' for Balance calculation
                      unit_cost: 0, // Balance helper expects 'unit_cost' not 'unit_price'
                      total_value: actualCutQuantity * 0
                    }
                    
                    // Try to update balance from movement
                    try {
                      await window.ERP_CORE.balance.updateBalanceFromMovement(enhancedMovementData, {
                        updatedBy: 'work_order_system'
                      })
                      console.log(`✅ Balance updated successfully from movement for ${item.sku}`)
                    } catch (movementError) {
                      console.warn(`⚠️ Could not update balance from movement for ${item.sku}:`, movementError.message)
                      
                      // Fallback: Try direct balance recalculation
                      try {
                        if (window.ERP_CORE.balance.recalculateProductBalance) {
                          await window.ERP_CORE.balance.recalculateProductBalance(item.product_id, {
                            updatedBy: 'work_order_system'
                          })
                          console.log(`✅ Fallback: Balance recalculated for ${item.sku}`)
                        }
                      } catch (recalcError) {
                        console.error(`❌ Fallback balance recalculation failed for ${item.sku}:`, recalcError.message)
                      }
                    }
                    
                  } else {
                    console.warn('⚠️ ERP_CORE.balance not available - balance update skipped')
                  }
                  
                } catch (balanceError) {
                  console.error(`❌ Balance update failed for ${item.sku}:`, balanceError.message)
                  console.error('Full balance error:', balanceError)
                  // Don't stop the process, continue
                }
                
              } else {
                console.error('❌ [DEBUG] Failed to create inventory movement:', movementResult.error)
                throw new Error(`ไม่สามารถสร้าง inventory movement ได้: ${movementResult.error}`)
              }
              
            } else {
              throw new Error(updateResult.error || 'ไม่สามารถอัปเดต Balance ได้')
            }
          } else {
            throw new Error(`ไม่พบข้อมูล Balance สำหรับสินค้า ${item.sku}`)
          }
          
        } catch (balanceError) {
          console.error(`❌ Stock cut failed for ${item.sku}:`, balanceError)
          alert(`เกิดข้อผิดพลาดในการตัดสต็อก: ${balanceError.message}`)
          return
        }
        
        // อัพเดทสถานะ item เป็น picked (หลังจากตัดสต็อกสำเร็จแล้ว)
        const updatedItems = [...workOrder.value.items]
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          status: 'picked',
          picked_quantity: item.required_quantity,
          cut_at: new Date().toISOString(),
          stock_before: stockBefore,
          stock_after: stockAfter,
          stock_cut_success: stockCutSuccess
        }
        
        // เตรียม activity log entry พร้อมข้อมูลการตัดสต็อก
        const reservationInfo = reservedQuantity > 0 ? ` | จองไว้: ${reservedQuantity} ${item.unit}` : ''
        const activityEntry = {
          timestamp: new Date().toISOString(),
          user: 'ผู้ใช้ระบบ',
          action: 'item_picked',
          description: `ตัดสต็อคสินค้า: ${item.product_name}`,
          notes: `ตัดสต็อคสินค้า ${item.product_name} จำนวน ${item.required_quantity} ${item.unit} เรียบร้อย (สต็อกก่อน: ${stockBefore}, หลัง: ${stockAfter}${reservationInfo})`
        }
        
        const updateData = {
          items: updatedItems
        }
        
        const result = await engine.update('work-order', workOrder.value.id, updateData)
        
        if (result.success) {
          // อัปเดตข้อมูล local พร้อม items ใหม่
          const updatedWorkOrder = result.data || {
            ...workOrder.value,
            items: updatedItems
          }
          
          // ให้แน่ใจว่า items ถูก merge ถูกต้อง
          if (result.data && result.data.items) {
            updatedWorkOrder.items = updatedItems // Override กับ items ที่อัปเดตแล้ว
          }
          
          // เก็บ activity log ใน local
          const existingActivityLog = updatedWorkOrder._localActivityLog || workOrder.value._localActivityLog || []
          updatedWorkOrder._localActivityLog = [...existingActivityLog, activityEntry]
          
          // อัปเดต workOrder แบบ reactive
          workOrder.value = updatedWorkOrder
          
          console.log('✅ Item picked and activity logged:', {
            newEntry: activityEntry,
            totalLogs: workOrder.value._localActivityLog.length,
            itemName: item.product_name,
            updatedItemStatus: updatedItems[itemIndex].status,
            allItemStatuses: workOrder.value.items.map(i => ({ name: i.product_name, status: i.status })),
            stockMovement: { before: stockBefore, after: stockAfter, quantity: item.required_quantity }
          })
          
          // ✅ Final Balance Recalculation (แบบ GoodsReceipt.vue)
          try {
            console.log('🔄 Performing final balance recalculation...')
            
            if (window.ERP_CORE && window.ERP_CORE.balance && window.ERP_CORE.balance.recalculateProductBalance) {
              // Final recalculation to ensure accuracy
              try {
                await window.ERP_CORE.balance.recalculateProductBalance(item.product_id, {
                  updatedBy: 'work_order_system'
                })
                console.log(`✅ Final balance recalculated for product ID: ${item.product_id}`)
              } catch (recalcError) {
                console.warn(`⚠️ Final recalculation failed for product ${item.product_id}:`, recalcError.message)
              }
            } else {
              console.log('ℹ️ Final balance recalculation not available or skipped')
            }
            
          } catch (error) {
            console.error('❌ Final balance recalculation error:', error)
            // This is optional, so don't fail the entire process
          }
          
          // แจ้งเตือนความสำเร็จ
          const successMessage = `🎉 ตัดสต็อคเรียบร้อยแล้ว!\n\n` +
            `สินค้า: ${item.product_name}\n` +
            `จำนวน: ${item.required_quantity} ${mapUnitToThai(item.unit)}\n` +
            `สต็อกก่อน: ${stockBefore}\n` +
            `สต็อกหลัง: ${stockAfter}\n` +
            `${reservedQuantity > 0 ? `จากการจอง: ${reservedQuantity} ${mapUnitToThai(item.unit)}\n` : ''}` +
            `\n✅ Inventory Movement สร้างเรียบร้อย\n` +
            `✅ Balance อัปเดตเรียบร้อย`
          
          console.log(successMessage)
          
          // Force re-render
          await nextTick()
          
          // ตรวจสอบว่าหยิบครบทุกรายการแล้วหรือไม่
          const allPicked = updatedItems.every(item => item.status === 'picked')
          if (allPicked && workOrder.value.status === 'picking') {
            // เปลี่ยนสถานะ work order เป็น picked อัตโนมัติ
            changeStatus('picked')
          }
        } else {
          throw new Error(result.error || 'ไม่สามารถตัดสต็อคได้')
        }
        
      } catch (error) {
        console.error('❌ [DEBUG] Error confirming pick:', error)
        
        // แสดงข้อความแจ้งเตือนที่เข้าใจง่าย
        let errorMessage = 'เกิดข้อผิดพลาดในการตัดสต็อค'
        if (error.message) {
          errorMessage += ': ' + error.message
        }
        
        alert(errorMessage)
        
        // Log error details for debugging
        console.error('🐛 [DEBUG] Full error details:', {
          error: error,
          stack: error.stack,
          item: workOrder.value?.items?.[itemIndex],
          workOrderId: workOrder.value?.id,
          timestamp: new Date().toISOString(),
          processingItem: processingItem.value
        })
      } finally {
        console.log('🔓 [DEBUG] Releasing processing lock, was:', processingItem.value)
        // รีเซ็ต processing state เสมอ
        processingItem.value = null
      }
    }

    const refreshData = () => {
      loadWorkOrder()
    }

    const printWorkOrder = () => {
      window.print()
    }

    const goToDelivery = () => {
      // นำทางไปยังหน้า Delivery Queue พร้อมกับ Work Order ID
      router.push(`/delivery/delivery-queue?workOrderId=${workOrder.value.id}`)
    }

    const revertToPreviousStatus = async () => {
      try {
        const currentStatus = workOrder.value?.status
        if (!currentStatus) return
        
        const previousStatus = previousStatusMap[currentStatus]
        if (!previousStatus) {
          alert('ไม่สามารถย้อนกลับสถานะได้')
          return
        }
        
        // แสดงการยืนยัน
        const confirmed = confirm(`ต้องการย้อนกลับสถานะจาก "${getStatusText(currentStatus)}" เป็น "${getStatusText(previousStatus)}" หรือไม่?`)
        if (!confirmed) return
        
        console.log(`🔄 Reverting status from "${currentStatus}" to "${previousStatus}"`)
        
        // เตรียมข้อมูลสำหรับอัปเดต
        const updateData = {
          status: previousStatus
        }
        
        // ถ้าย้อนกลับจาก picked เป็น picking ต้องรีเซ็ต reservation status
        if (currentStatus === 'picked' && previousStatus === 'picking') {
          console.log('🔄 Resetting reservation statuses to picking')
          
          if (workOrder.value.inventory_reservations) {
            workOrder.value.inventory_reservations.forEach(reservation => {
              if (reservation.status === 'picked') {
                reservation.status = 'picking'
                reservation.picked_quantity = 0
              }
            })
            
            // อัปเดต items ให้ส่วนที่ picked กลับเป็น pending
            if (workOrder.value.items) {
              workOrder.value.items.forEach(item => {
                if (item.status === 'picked') {
                  item.status = 'pending'
                  item.picked_quantity = 0
                }
              })
              updateData.items = workOrder.value.items
            }
          }
        }
        
        // บันทึกการเปลี่ยนแปลง
        const result = await engine.update(TRANSACTION_TYPES.WORK_ORDER, workOrder.value.id, updateData)
        
        if (result.success) {
          workOrder.value.status = previousStatus
          
          // อัปเดตข้อมูล local
          if (updateData.items) {
            workOrder.value.items = updateData.items
          }
          
          console.log(`✅ Status reverted to "${previousStatus}" successfully`)
          
          // เพิ่ม activity log
          const activityEntry = {
            timestamp: new Date().toISOString(),
            user: 'ผู้ใช้ระบบ',
            action: 'status_revert',
            description: `ย้อนกลับสถานะจาก "${getStatusText(currentStatus)}" เป็น "${getStatusText(previousStatus)}"`,
            from_status: currentStatus,
            to_status: previousStatus
          }
          
          const existingActivityLog = workOrder.value._localActivityLog || []
          workOrder.value._localActivityLog = [...existingActivityLog, activityEntry]
          
          // Force reactivity update
          workOrder.value = { ...workOrder.value }
          
        } else {
          console.error('❌ Failed to revert status:', result.error)
          alert('ไม่สามารถย้อนกลับสถานะได้: ' + result.error)
        }
        
      } catch (error) {
        console.error('❌ Error reverting status:', error)
        alert('เกิดข้อผิดพลาด: ' + error.message)
      }
    }

    // ฟังก์ชันสำหรับจัดการ Inventory Reservations
    const pickReservationItem = async (reservationIndex) => {
      try {
        console.log('🎯 [DEBUG] pickReservationItem called with index:', reservationIndex)
        
        // ป้องกันการกดปุ่มซ้ำขณะประมวลผล
        if (processingItem.value !== null) {
          console.log('🚫 [DEBUG] Another item is being processed, ignoring click')
          return
        }
        
        const reservation = workOrder.value.inventory_reservations[reservationIndex]
        if (!reservation) {
          console.error('❌ [DEBUG] Reservation not found at index:', reservationIndex)
          return
        }
        
        console.log('🔒 [DEBUG] Processing reservation:', {
          inventory_id: reservation.inventory_id,
          current_status: reservation.status,
          reserved_quantity: reservation.reserved_quantity
        })
        
        // ถ้าสถานะเป็น picking อยู่แล้ว ให้ดำเนินการตัดสต็อคทันที
        if (reservation.status === 'picking') {
          console.log('🎯 [DEBUG] Status is already picking, proceeding to stock cut...')
          await confirmReservationPick(reservationIndex)
          return
        }
        
        // เปลี่ยนสถานะเป็น picking ชั่วคราว
        reservation.status = 'picking'
        
        // Force reactivity update
        workOrder.value.inventory_reservations = [...workOrder.value.inventory_reservations]
        
        console.log('✅ [DEBUG] Reservation status changed to picking, now confirming pick...')
        
        // ✅ ดำเนินการตัดสต็อคทันที (แทนที่จะรอกดปุ่ม "ตัดสต็อค")
        await confirmReservationPick(reservationIndex)
        
      } catch (error) {
        console.error('❌ [DEBUG] Error in pickReservationItem:', error)
        alert('เกิดข้อผิดพลาด: ' + error.message)
        // Reset processing state on error
        processingItem.value = null
      }
      // ไม่ต้อง finally เพราะ confirmReservationPick จะจัดการ processing state
    }

    const confirmReservationPick = async (reservationIndex) => {
      try {
        console.log('🎯 [DEBUG] confirmReservationPick called with index:', reservationIndex)
        
        // ป้องกันการกดปุ่มซ้ำขณะประมวลผล
        if (processingItem.value !== null) {
          console.log('🚫 [DEBUG] Another item is being processed, ignoring click')
          return
        }
        
        const reservation = workOrder.value.inventory_reservations[reservationIndex]
        if (!reservation) {
          console.error('❌ [DEBUG] Reservation not found at index:', reservationIndex)
          return
        }
        
        processingItem.value = reservationIndex
        console.log('🔒 [DEBUG] Confirming pick for reservation:', reservation.inventory_id)
        
        // เปลี่ยนสถานะเป็น picked และอัปเดต picked_quantity
        reservation.status = 'picked'
        reservation.picked_quantity = reservation.reserved_quantity
        
        // ✅ ดำเนินการตัดสต็อคจริงในระบบ inventory
        try {
          console.log('🔪 [DEBUG] About to cut stock for reservation:', {
            inventory_id: reservation.inventory_id,
            product_id: reservation.product_id,
            product_name: reservation.product_name,
            picked_quantity: reservation.picked_quantity,
            reserved_quantity: reservation.reserved_quantity
          })
          
          await performActualStockCut(reservation)
          console.log('✅ [DEBUG] Stock cut completed successfully')
        } catch (stockError) {
          console.error('❌ [DEBUG] Stock cut failed:', stockError)
          // Rollback reservation status
          reservation.status = 'picking'
          reservation.picked_quantity = 0
          alert(`เกิดข้อผิดพลาดในการตัดสต็อค: ${stockError.message}`)
          return
        }
        
        // ✅ อัปเดตข้อมูลการตัดสต็อคใน Work Order items
        await updateWorkOrderItems(reservation)
        
        // Force reactivity update
        workOrder.value.inventory_reservations = [...workOrder.value.inventory_reservations]
        
        // ตรวจสอบว่าทุก reservation ถูก picked แล้วหรือไม่
        const allReservationsPicked = workOrder.value.inventory_reservations.every(res => res.status === 'picked')
        
        console.log('🔍 [DEBUG] All reservations picked check:', {
          totalReservations: workOrder.value.inventory_reservations.length,
          pickedReservations: workOrder.value.inventory_reservations.filter(res => res.status === 'picked').length,
          allPicked: allReservationsPicked
        })
        
        // ถ้าทุก reservation ถูก picked แล้ว ให้เปลี่ยนสถานะ Work Order เป็น picked
        if (allReservationsPicked && workOrder.value.status === 'picking') {
          console.log('🎉 [DEBUG] All reservations picked, changing Work Order status to picked')
          
          // ส่งเฉพาะการเปลี่ยนแปลงสถานะ ไม่ต้องส่ง inventory_reservations
          const updateData = {
            status: 'picked'
          }
          
          const result = await engine.update('work-order', workOrder.value.id, updateData)
          
          if (result.success) {
            workOrder.value.status = 'picked'
            console.log('✅ [DEBUG] Work Order status updated to picked')
          } else {
            console.error('❌ [DEBUG] Failed to update Work Order status:', result.error)
          }
        }
        
        console.log('✅ [DEBUG] Reservation pick confirmed')
        
      } catch (error) {
        console.error('❌ [DEBUG] Error in confirmReservationPick:', error)
        alert('เกิดข้อผิดพลาด: ' + error.message)
      } finally {
        processingItem.value = null
      }
    }

    // ฟังก์ชันสำหรับอัปเดต Work Order items หลังตัดสต็อค
    const updateWorkOrderItems = async (reservation) => {
      try {
        console.log('📝 [WORK ORDER ITEMS] Updating Work Order items after stock cut:', reservation)
        
        if (!workOrder.value.items || workOrder.value.items.length === 0) {
          console.log('⚠️ [WORK ORDER ITEMS] No items found in Work Order to update')
          return
        }
        
        // หา item ที่ตรงกับ reservation นี้
        const itemIndex = workOrder.value.items.findIndex(item => 
          item.product_id === reservation.product_id ||
          item.sku === reservation.sku ||
          (item.product_code && item.product_code === reservation.sku)
        )
        
        if (itemIndex === -1) {
          console.log('⚠️ [WORK ORDER ITEMS] No matching item found for reservation:', reservation)
          return
        }
        
        const item = workOrder.value.items[itemIndex]
        const quantityPicked = reservation.picked_quantity || reservation.reserved_quantity
        
        // อัปเดตข้อมูลการตัดสต็อค
        const updatedItem = {
          ...item,
          picked_quantity: (item.picked_quantity || 0) + quantityPicked,
          status: 'picked',
          last_picked_date: new Date().toISOString(),
          stock_cut_history: [
            ...(item.stock_cut_history || []),
            {
              date: new Date().toISOString(),
              quantity: quantityPicked,
              reservation_id: reservation.inventory_id,
              notes: `ตัดสต็อค ${quantityPicked} ${normalizeUnit(reservation.unit)} จาก reservation ${reservation.inventory_id}`
            }
          ]
        }
        
        // อัปเดต item ใน array
        workOrder.value.items[itemIndex] = updatedItem
        
        console.log('📝 [WORK ORDER ITEMS] Updated item:', {
          item_index: itemIndex,
          product_name: item.product_name,
          old_picked_quantity: item.picked_quantity || 0,
          new_picked_quantity: updatedItem.picked_quantity,
          quantity_added: quantityPicked
        })
        
        // บันทึกการเปลี่ยนแปลงลงฐานข้อมูล (เอา last_updated ออกเพราะ schema ไม่รองรับ)
        const updateData = {
          items: workOrder.value.items
        }
        
        const result = await engine.update(TRANSACTION_TYPES.WORK_ORDER, workOrder.value.id, updateData)
        
        if (result.success) {
          console.log('✅ [WORK ORDER ITEMS] Work Order items updated successfully')
        } else {
          console.error('❌ [WORK ORDER ITEMS] Failed to update Work Order items:', result.error)
          // ไม่ throw error เพราะตัดสต็อคสำเร็จแล้ว
        }
        
      } catch (error) {
        console.error('❌ [WORK ORDER ITEMS] Error updating Work Order items:', error)
        // ไม่ throw error เพราะตัดสต็อคสำเร็จแล้ว
      }
    }

    // ฟังก์ชันแปลงหน่วยให้ตรงกับ schema
    const normalizeUnit = (unit) => {
      if (!unit) return 'ชิ้น'
      
      const unitMapping = {
        'piece': 'ชิ้น',
        'pcs': 'ชิ้น',
        'ชิ้น': 'ชิ้น',
        'set': 'ชุด',
        'ชุด': 'ชุด',
        'box': 'กล่อง',
        'กล่อง': 'กล่อง',
        'pack': 'แพ็ค',
        'แพ็ค': 'แพ็ค',
        'kg': 'กิโลกรัม',
        'กิโลกรัม': 'กิโลกรัม',
        'g': 'กรัม',
        'กรัม': 'กรัม',
        'l': 'ลิตร',
        'liter': 'ลิตร',
        'ลิตร': 'ลิตร',
        'm': 'เมตร',
        'meter': 'เมตร',
        'เมตร': 'เมตร',
        'roll': 'ม้วน',
        'ม้วน': 'ม้วน',
        'bottle': 'ขวด',
        'ขวด': 'ขวด',
        'bag': 'ถุง',
        'ถุง': 'ถุง'
      }
      
      return unitMapping[unit.toLowerCase()] || 'ชิ้น'
    }

    // ฟังก์ชันสำหรับการตัดสต็อคจริง
    const performActualStockCut = async (reservation) => {
      try {
        console.log('🔪 [STOCK CUT] Starting actual stock cut for:', reservation)
        
        const quantityToDeduct = reservation.picked_quantity || reservation.reserved_quantity
        
        // 1. สร้างรายการตัดสต็อค (inventory out transaction)
        const stockOutData = {
          movement_type: 'issue',  // ✅ แก้ไขจาก 'out' เป็น 'issue'
          transaction_type: 'work_order',
          reference_type: 'work-order',
          reference_id: workOrder.value.id,
          reference_number: workOrder.value.order_number,
          
          product_id: reservation.product_id,
          product_code: reservation.sku,
          product_name: reservation.product_name,
          
          quantity: quantityToDeduct,
          unit: normalizeUnit(reservation.unit || 'ชิ้น'),  // ✅ แก้ไข unit ให้ถูก schema
          
          notes: `ตัดสต็อคสำหรับ Work Order ${workOrder.value.order_number} - ${reservation.product_name}`,
          
          // Metadata
          work_order_id: workOrder.value.id,
          reservation_id: reservation.inventory_id,
          
          // Timestamps
          transaction_date: new Date().toISOString(),
          created_date: new Date().toISOString()
        }
        
        console.log('📤 [STOCK CUT] Creating inventory out transaction:', stockOutData)
        
        // สร้าง inventory transaction
        const inventoryResult = await engine.create(TRANSACTION_TYPES.INVENTORY, stockOutData)
        
        if (!inventoryResult.success) {
          console.error('❌ [STOCK CUT] Failed to create inventory transaction:', inventoryResult.error)
          throw new Error(`ไม่สามารถสร้างรายการตัดสต็อคได้: ${inventoryResult.error}`)
        }
        
        console.log('✅ [STOCK CUT] Inventory out transaction created:', inventoryResult.data.id)
        
        // 2. เคลียร์การจอง - อัปเดต reservation record ให้เป็น 'used'
        if (reservation.inventory_id && reservation.inventory_id.startsWith('inventory_')) {
          try {
            console.log('🔄 [STOCK CUT] Clearing reservation:', reservation.inventory_id)
            
            const clearReservationData = {
              status: 'used',
              used_quantity: quantityToDeduct,
              used_date: new Date().toISOString(),
              work_order_id: workOrder.value.id,
              notes: `${reservation.notes || ''} | Used in Work Order ${workOrder.value.order_number} - Qty: ${quantityToDeduct}`
            }
            
            const reservationResult = await engine.update(TRANSACTION_TYPES.INVENTORY, reservation.inventory_id, clearReservationData)
            
            if (reservationResult.success) {
              console.log('✅ [STOCK CUT] Reservation cleared successfully')
            } else {
              console.warn('⚠️ [STOCK CUT] Failed to clear reservation, but stock cut was successful:', reservationResult.error)
            }
            
          } catch (reservationError) {
            console.warn('⚠️ [STOCK CUT] Reservation clearing failed, but stock cut was successful:', reservationError)
          }
        }
        
        // 3. อัปเดต Product Balance หากมี product_id
        if (reservation.product_id) {
          try {
            console.log('📊 [STOCK CUT] Updating product balance for:', reservation.product_id)
            
            // ค้นหา balance record โดยใช้ product_id
            const allBalancesResult = await engine.list('inventory_balance')
            console.log('🔍 [STOCK CUT] All balances:', allBalancesResult.data?.length || 0)
            console.log('🔍 [STOCK CUT] Looking for product_id:', reservation.product_id)
            
            const currentBalance = allBalancesResult.data?.find(balance => balance.product_id === reservation.product_id)
            console.log('🔍 [STOCK CUT] Found balance:', currentBalance)
            
            if (currentBalance) {
              const newOnHand = Math.max(0, (currentBalance.qty_on_hand || 0) - quantityToDeduct)
              const newReserved = Math.max(0, (currentBalance.qty_reserved || 0) - quantityToDeduct)
              
              const balanceUpdateData = {
                qty_on_hand: newOnHand,
                qty_reserved: newReserved,
                last_movement_date: new Date().toISOString()
              }
              
              console.log('📊 [STOCK CUT] Updating balance:', {
                product_id: reservation.product_id,
                old_on_hand: currentBalance.qty_on_hand,
                new_on_hand: newOnHand,
                old_reserved: currentBalance.qty_reserved,
                new_reserved: newReserved,
                deducted: quantityToDeduct
              })
              
              const updateBalanceResult = await engine.update('inventory_balance', currentBalance.id, balanceUpdateData)
              
              if (updateBalanceResult.success) {
                console.log('✅ [STOCK CUT] Product balance updated successfully')
              } else {
                console.warn('⚠️ [STOCK CUT] Failed to update product balance:', updateBalanceResult.error)
              }
            } else {
              console.warn('⚠️ [STOCK CUT] Could not find product balance to update')
            }
            
          } catch (balanceError) {
            console.warn('⚠️ [STOCK CUT] Product balance update failed:', balanceError)
          }
        }
        
        // อัปเดตข้อมูลใน reservation
        reservation.stock_cut_transaction_id = inventoryResult.data.id
        reservation.stock_cut_date = new Date().toISOString()
        
        console.log('🎉 [STOCK CUT] Complete stock cut process finished successfully')
        return inventoryResult.data
        
      } catch (error) {
        console.error('❌ [STOCK CUT] Error in performActualStockCut:', error)
        throw error
      }
    }

    // Utility functions for reservations
    const getReservationQuantityClass = (reservation) => {
      if (reservation.status === 'picked') return 'text-success'
      if (reservation.status === 'picking') return 'text-warning'
      return 'text-muted'
    }

    const getReservationStatusText = (status) => {
      const statuses = {
        'reserved': 'จองแล้ว',
        'pending': 'รอหยิบ',
        'picking': 'กำลังหยิบ',
        'picked': 'ตัดสต็อคแล้ว'
      }
      return statuses[status] || status
    }

    const getReservationStatusClass = (status) => {
      const classes = {
        'reserved': 'item-status-pending',
        'pending': 'item-status-pending', 
        'picking': 'item-status-picking',
        'picked': 'item-status-picked'
      }
      return classes[status] || 'item-status-pending'
    }

    // Utility functions
    const getStatusText = (status) => {
      return statusDefinitions[status]?.label || status
    }

    const getStatusClass = (status) => {
      return statusDefinitions[status]?.class || 'status-default'
    }

    const getPriorityText = (priority) => {
      const priorities = {
        'high': 'สูง',
        'normal': 'ปกติ',
        'low': 'ต่ำ'
      }
      return priorities[priority] || priority
    }

    const getPriorityClass = (priority) => {
      return `priority-${priority}`
    }

    const getItemStatusText = (status) => {
      const statuses = {
        'pending': 'รอหยิบ',
        'picking': 'กำลังหยิบ',
        'picked': 'ตัดสต็อคแล้ว'
      }
      return statuses[status] || status
    }

    const getItemStatusClass = (status) => {
      return `item-status-${status}`
    }

    const getQuantityClass = (item) => {
      if (item.status === 'picked') return 'text-success'
      if (item.status === 'picking') return 'text-warning'
      return 'text-muted'
    }

    const getActivityIcon = (action) => {
      const icons = {
        'created': 'fas fa-plus-circle',
        'status_change': 'fas fa-exchange-alt',
        'item_pick_start': 'fas fa-hand-paper',
        'item_picked': 'fas fa-check-circle'
      }
      return icons[action] || 'fas fa-circle'
    }

    const getActivityIconClass = (action) => {
      const classes = {
        'created': 'activity-created',
        'status_change': 'activity-status',
        'item_pick_start': 'activity-pick',
        'item_picked': 'activity-complete'
      }
      return classes[action] || 'activity-default'
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch {
        return dateString
      }
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return dateString
      }
    }

    const formatCurrency = (amount) => {
      if (!amount) return '฿0'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount)
    }

    const getSalesOrderStatusText = (status) => {
      const statusTexts = {
        'draft': 'ร่าง',
        'quoted': 'เสนอราคา',
        'confirmed': 'ยืนยันแล้ว',
        'delivered': 'จัดส่งแล้ว',
        'invoiced': 'ออกใบแจ้งหนี้แล้ว',
        'complete': 'เสร็จสิ้น'
      }
      return statusTexts[status] || status
    }

    const getSalesOrderStatusClass = (status) => {
      const statusClasses = {
        'draft': 'sales-status-draft',
        'quoted': 'sales-status-quoted',
        'confirmed': 'sales-status-confirmed',
        'delivered': 'sales-status-delivered',
        'invoiced': 'sales-status-invoiced',
        'complete': 'sales-status-complete'
      }
      return statusClasses[status] || 'sales-status-default'
    }

    // Initialize
    onMounted(() => {
      loadWorkOrder()
    })

    return {
      // Data
      workOrder,
      salesOrderData,
      loading,
      error,
      
      // Status modal
      showStatusModal,
      pendingStatus,
      statusNotes,
      processingStatus,
      processingItem,
      
      // Computed
      availableActions,
      canPickItems,
      canCompleteWork,
      pickedItemsCount,
      totalItemsCount,
      progressPercentage,
      totalQuantityStats,
      allActivityLogs,
      totalReservedQuantity,
      pickedReservationsCount,
      totalReservationsCount,
      reservationProgressPercentage,
      canCompleteReservationWork,
      canRevertStatus,
      
      // Methods
      loadWorkOrder,
      loadSalesOrderData,
      ensureInventoryReservations,
      enrichReservationsWithProductData,
      viewSalesOrder,
      changeStatus,
      confirmStatusChange,
      cancelStatusChange,
      pickItem,
      confirmPick,
      pickReservationItem,
      confirmReservationPick,
      updateWorkOrderItems,
      normalizeUnit,
      performActualStockCut,
      refreshData,
      printWorkOrder,
      goToDelivery,
      revertToPreviousStatus,
      hasItemReservation,
      getItemReservation,
      
      // Utilities
      getStatusText,
      getStatusClass,
      getPriorityText,
      getPriorityClass,
      getItemStatusText,
      getItemStatusClass,
      getQuantityClass,
      getReservationQuantityClass,
      getReservationStatusText,
      getReservationStatusClass,
      getActivityIcon,
      getActivityIconClass,
      formatDate,
      formatDateTime,
      formatCurrency,
      getSalesOrderStatusText,
      getSalesOrderStatusClass
    }
  }
}
</script>

<style scoped>
.work-order-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 15px;
}

.header-content h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.header-content h1 i {
  margin-right: 10px;
  color: #3498db;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.order-number {
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-state i {
  font-size: 2rem;
  color: #3498db;
  margin-bottom: 15px;
}

.error-state i {
  font-size: 2rem;
  color: #e74c3c;
  margin-bottom: 15px;
}

.status-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.current-status {
  margin-bottom: 15px;
}

.status-label {
  font-weight: 600;
  margin-right: 10px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-pending { background: #f8f9fa; color: #6c757d; }
.status-picking { background: #fff3cd; color: #856404; }
.status-picked { background: #d4edda; color: #155724; }
.status-ready { background: #d1ecf1; color: #0c5460; }

.status-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.work-order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .work-order-info-grid {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-card h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.info-card h3 i {
  margin-right: 8px;
  color: #3498db;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #7f8c8d;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.priority-high { background: #ffebee; color: #c62828; }
.priority-normal { background: #e8f5e8; color: #2e7d32; }
.priority-low { background: #f3e5f5; color: #7b1fa2; }

.timeline-content {
  padding: 0;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-marker.created { background: #3498db; }
.timeline-marker.started { background: #f39c12; }
.timeline-marker.picked { background: #27ae60; }
.timeline-marker.ready { background: #9b59b6; }

.timeline-content strong {
  color: #2c3e50;
  font-size: 0.9rem;
}

.timeline-time {
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-top: 2px;
}

.items-section, .activities-section, .reservations-section, .sales-order-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.items-section h3, .activities-section h3, .reservations-section h3, .sales-order-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

.items-section h3 i, .activities-section h3 i, .reservations-section h3 i, .sales-order-section h3 i {
  margin-right: 10px;
  color: #3498db;
}

.table-wrapper {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  margin-bottom: 20px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.items-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.items-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.items-table tbody tr:hover {
  background: #f8f9fa;
}

.item-info strong {
  color: #2c3e50;
}

.item-code {
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-top: 2px;
}

.item-status-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.item-status-pending { background: #f8f9fa; color: #6c757d; }
.item-status-picking { background: #fff3cd; color: #856404; }
.item-status-picked { background: #d4edda; color: #155724; }

.progress-summary {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.progress-section {
  margin-bottom: 15px;
}

.progress-section:last-child {
  margin-bottom: 0;
}

.progress-section h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
  color: #495057;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.progress-note {
  margin-top: 10px;
  padding: 8px 12px;
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  color: #004085;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-note i {
  color: #0066cc;
}

.warning-note {
  background: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.warning-note i {
  color: #f39c12;
}

.activities-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid #ecf0f1;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.activity-created { background: #e3f2fd; color: #1976d2; }
.activity-status { background: #fff3e0; color: #f57c00; }
.activity-pick { background: #f3e5f5; color: #7b1fa2; }
.activity-complete { background: #e8f5e8; color: #388e3c; }
.activity-default { background: #f5f5f5; color: #757575; }

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.activity-action {
  font-weight: 600;
  color: #2c3e50;
}

.activity-time {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.activity-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.activity-user {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.activity-notes {
  color: #495057;
  font-size: 0.85rem;
}

/* Modal styles */
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

.modal-dialog {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
}

.btn-close:hover {
  color: #495057;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

/* Button styles */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

/* Delivery Button Animation */
.btn-success {
  transition: all 0.3s ease;
  position: relative;
}

.btn-success i.fa-shipping-fast {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-1px);
  }
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #117a8b;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
  border: 1px solid #ffc107;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
  border-color: #d39e00;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
}

.btn-outline {
  background: white;
  color: #6c757d;
  border: 1px solid #ced4da;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

/* Button disabled note */
.btn-disabled-note {
  display: block;
  font-size: 0.7rem;
  font-weight: normal;
  opacity: 0.8;
  margin-top: 2px;
}

/* Sales Order Link */
.sales-order-link {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.sales-order-link:hover {
  color: #0056b3;
}

/* Reservations Section */
.reservations-summary {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}

.summary-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1rem;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.reservations-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.reservations-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.reservations-table tbody tr:hover {
  background: #f8f9fa;
}

.inventory-id {
  background: #e9ecef;
  color: #495057;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.8rem;
}

.product-info strong {
  color: #2c3e50;
}

.product-code {
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 2px;
}

.notes-cell {
  max-width: 200px;
  font-size: 0.85rem;
  color: #495057;
  word-wrap: break-word;
}

/* Sales Order Section */
.sales-order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .sales-order-info-grid {
    grid-template-columns: 1fr;
  }
}

.sales-info-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  border: 1px solid #dee2e6;
}

.sales-info-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

/* Sales Order Status Badges */
.sales-status-draft { background: #f8f9fa; color: #6c757d; }
.sales-status-quoted { background: #fff3cd; color: #856404; }
.sales-status-confirmed { background: #d4edda; color: #155724; }
.sales-status-delivered { background: #e2e3ff; color: #383d41; }
.sales-status-invoiced { background: #fff3cd; color: #856404; }
.sales-status-complete { background: #d1ecf1; color: #0c5460; }
.sales-status-default { background: #e9ecef; color: #6c757d; }

/* Utility classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-success { color: #28a745; }
.text-warning { color: #ffc107; }
.text-muted { color: #6c757d; }

/* No reservation note */
.no-reservation-note {
  font-size: 0.8rem;
  color: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 4px 8px;
  background: #f8d7da;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

/* Reservation badges */
.reservation-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.reservation-available {
  background: #d4edda;
  color: #155724;
}

.reservation-none {
  background: #f8d7da;
  color: #721c24;
}

/* No items message */
.no-items-message {
  padding: 20px;
  text-align: center;
}

.alert {
  padding: 15px;
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 15px;
}

.alert-warning {
  background: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.alert i {
  margin-right: 10px;
  font-size: 1.1rem;
}

.alert strong {
  display: block;
  margin-bottom: 5px;
  font-size: 1rem;
}

.alert p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}
</style>