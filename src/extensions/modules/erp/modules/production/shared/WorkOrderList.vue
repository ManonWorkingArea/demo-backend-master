<template>
  <div class="work-order-list">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-tasks"></i>
          จัดการ Work Orders
        </h1>
        
        <div class="header-actions">
          <button class="btn btn-outline" @click="refreshData">
            <i class="fas fa-refresh"></i>
            รีเฟรช
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>สถานะ:</label>
          <select v-model="filters.status" @change="applyFilters" class="filter-select">
            <option value="">ทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="picking">กำลังหยิบสินค้า</option>
            <option value="picked">หยิบเสร็จแล้ว</option>
            <option value="ready-to-ship">เตรียมส่งเรียบร้อย</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>ความสำคัญ:</label>
          <select v-model="filters.priority" @change="applyFilters" class="filter-select">
            <option value="">ทั้งหมด</option>
            <option value="high">สูง</option>
            <option value="normal">ปกติ</option>
            <option value="low">ต่ำ</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>ค้นหา:</label>
          <input 
            v-model="filters.search" 
            @input="applyFilters"
            placeholder="เลขที่ Work Order หรือชื่อลูกค้า"
            class="filter-input"
          >
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <div class="stat-card pending">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.pending }}</div>
          <div class="stat-label">รอดำเนินการ</div>
        </div>
      </div>
      
      <div class="stat-card picking">
        <div class="stat-icon">
          <i class="fas fa-hand-paper"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.picking }}</div>
          <div class="stat-label">กำลังหยิบสินค้า</div>
        </div>
      </div>
      
      <div class="stat-card picked">
        <div class="stat-icon">
          <i class="fas fa-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.picked }}</div>
          <div class="stat-label">หยิบเสร็จแล้ว</div>
        </div>
      </div>
      
      <div class="stat-card ready">
        <div class="stat-icon">
          <i class="fas fa-truck"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.ready }}</div>
          <div class="stat-label">เตรียมส่งเรียบร้อย</div>
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
      <button class="btn btn-primary" @click="loadWorkOrders">
        <i class="fas fa-refresh"></i>
        ลองใหม่
      </button>
    </div>

    <!-- Work Orders Table -->
    <div v-else class="table-section">
      <div class="table-header">
        <h3>
          <i class="fas fa-list"></i>
          รายการ Work Orders ({{ filteredWorkOrders.length }})
        </h3>
      </div>
      
      <div class="table-wrapper" v-if="filteredWorkOrders.length > 0">
        <table class="work-orders-table">
          <thead>
            <tr>
              <th>เลขที่ Work Order</th>
              <th>ลูกค้า</th>
              <th>สถานะ</th>
              <th>ความสำคัญ</th>
              <th>จำนวนรายการ</th>
              <th>ความคืบหน้า</th>
              <th>กำหนดส่ง</th>
              <th>สร้างเมื่อ</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="workOrder in filteredWorkOrders" :key="workOrder.id">
              <td>
                <div class="order-number">
                  <strong>{{ workOrder.order_number }}</strong>
                  <div class="order-id">{{ workOrder.id }}</div>
                </div>
              </td>
              <td>
                <div class="customer-info">
                  {{ workOrder.customer_name || '-' }}
                </div>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(workOrder.status)">
                  {{ getStatusText(workOrder.status) }}
                </span>
              </td>
              <td>
                <span class="priority-badge" :class="getPriorityClass(workOrder.priority)">
                  {{ getPriorityText(workOrder.priority) }}
                </span>
              </td>
              <td class="text-center">
                {{ workOrder.items?.length || 0 }}
              </td>
              <td>
                <div class="progress-info">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: getProgressPercentage(workOrder) + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">
                    {{ getPickedItemsCount(workOrder) }}/{{ workOrder.items?.length || 0 }}
                  </span>
                </div>
              </td>
              <td>
                <div class="due-date" :class="getDueDateClass(workOrder.due_date)">
                  {{ formatDate(workOrder.due_date) }}
                </div>
              </td>
              <td>
                <div class="created-date">
                  {{ formatDate(workOrder.createdAt) }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="viewWorkOrder(workOrder.id)"
                    class="btn btn-sm btn-primary"
                  >
                    <i class="fas fa-eye"></i>
                    ดูรายละเอียด
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>ไม่พบ Work Orders</h3>
        <p>ยังไม่มี Work Orders ในระบบ หรือไม่ตรงกับเงื่อนไขการค้นหา</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { TransactionEngine } from '../../../core/Engine'

export default {
  name: 'WorkOrderList',
  setup() {
    const router = useRouter()
    
    // Data
    const workOrders = ref([])
    const loading = ref(true)
    const error = ref('')
    
    // Filters
    const filters = reactive({
      status: '',
      priority: '',
      search: ''
    })
    
    // Transaction engine
    const engine = new TransactionEngine('local')
    
    // Computed
    const filteredWorkOrders = computed(() => {
      let filtered = [...workOrders.value]
      
      // Filter by status
      if (filters.status) {
        filtered = filtered.filter(wo => wo.status === filters.status)
      }
      
      // Filter by priority
      if (filters.priority) {
        filtered = filtered.filter(wo => wo.priority === filters.priority)
      }
      
      // Filter by search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        filtered = filtered.filter(wo => 
          wo.order_number?.toLowerCase().includes(searchTerm) ||
          wo.customer_name?.toLowerCase().includes(searchTerm) ||
          wo.id?.toLowerCase().includes(searchTerm)
        )
      }
      
      // Sort by created date (newest first)
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })
    
    const stats = computed(() => {
      const counts = {
        pending: 0,
        picking: 0,
        picked: 0,
        ready: 0
      }
      
      workOrders.value.forEach(wo => {
        switch (wo.status) {
          case 'pending':
            counts.pending++
            break
          case 'picking':
            counts.picking++
            break
          case 'picked':
            counts.picked++
            break
          case 'ready-to-ship':
            counts.ready++
            break
        }
      })
      
      return counts
    })
    
    // Methods
    const loadWorkOrders = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const result = await engine.list('work-order')
        
        if (result.success && result.data) {
          workOrders.value = result.data
          console.log('📋 Work Orders loaded:', result.data.length)
        } else {
          error.value = result.error || 'ไม่สามารถโหลดข้อมูลได้'
        }
      } catch (err) {
        console.error('Error loading work orders:', err)
        error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      } finally {
        loading.value = false
      }
    }
    
    const refreshData = () => {
      loadWorkOrders()
    }
    
    const applyFilters = () => {
      // Filters are reactive, so the computed will update automatically
      console.log('Filters applied:', filters)
    }
    
    const viewWorkOrder = (workOrderId) => {
      router.push(`/production/work-order/${workOrderId}`)
    }
    
    const getPickedItemsCount = (workOrder) => {
      if (!workOrder.items) return 0
      return workOrder.items.filter(item => item.status === 'picked').length
    }
    
    const getProgressPercentage = (workOrder) => {
      if (!workOrder.items || workOrder.items.length === 0) return 0
      const pickedCount = getPickedItemsCount(workOrder)
      return (pickedCount / workOrder.items.length) * 100
    }
    
    // Utility functions
    const getStatusText = (status) => {
      const statuses = {
        'pending': 'รอดำเนินการ',
        'picking': 'กำลังหยิบสินค้า',
        'picked': 'หยิบเสร็จแล้ว', 
        'ready-to-ship': 'เตรียมส่งเรียบร้อย'
      }
      return statuses[status] || status
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'pending': 'status-pending',
        'picking': 'status-picking',
        'picked': 'status-picked',
        'ready-to-ship': 'status-ready'
      }
      return classes[status] || 'status-default'
    }
    
    const getPriorityText = (priority) => {
      const priorities = {
        'high': 'สูง',
        'normal': 'ปกติ',
        'low': 'ต่ำ'
      }
      return priorities[priority] || priority || 'ปกติ'
    }
    
    const getPriorityClass = (priority) => {
      return `priority-${priority || 'normal'}`
    }
    
    const getDueDateClass = (dueDate) => {
      if (!dueDate) return ''
      
      const due = new Date(dueDate)
      const now = new Date()
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'overdue'
      if (diffDays <= 1) return 'due-soon'
      if (diffDays <= 3) return 'due-warning'
      return ''
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
    
    // Initialize
    onMounted(() => {
      loadWorkOrders()
    })
    
    return {
      // Data
      workOrders,
      loading,
      error,
      filters,
      
      // Computed
      filteredWorkOrders,
      stats,
      
      // Methods
      loadWorkOrders,
      refreshData,
      applyFilters,
      viewWorkOrder,
      getPickedItemsCount,
      getProgressPercentage,
      
      // Utilities
      getStatusText,
      getStatusClass,
      getPriorityText,
      getPriorityClass,
      getDueDateClass,
      formatDate
    }
  }
}
</script>

<style scoped>
.work-order-list {
  padding: 20px;
  max-width: 1400px;
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
  align-items: center;
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

.header-actions {
  display: flex;
  gap: 10px;
}

.filters-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filters-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.filter-select, .filter-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 150px;
}

.filter-input {
  min-width: 250px;
}

.filter-select:focus, .filter-input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.stat-card.pending .stat-icon {
  background: #f8f9fa;
  color: #6c757d;
}

.stat-card.picking .stat-icon {
  background: #fff3cd;
  color: #856404;
}

.stat-card.picked .stat-icon {
  background: #d4edda;
  color: #155724;
}

.stat-card.ready .stat-icon {
  background: #d1ecf1;
  color: #0c5460;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 2px;
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

.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.table-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

.table-header h3 i {
  margin-right: 10px;
  color: #3498db;
}

.table-wrapper {
  overflow-x: auto;
}

.work-orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.work-orders-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.work-orders-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.work-orders-table tbody tr:hover {
  background: #f8f9fa;
}

.order-number strong {
  color: #2c3e50;
}

.order-id {
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-top: 2px;
}

.customer-info {
  color: #2c3e50;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-pending { background: #f8f9fa; color: #6c757d; }
.status-picking { background: #fff3cd; color: #856404; }
.status-picked { background: #d4edda; color: #155724; }
.status-ready { background: #d1ecf1; color: #0c5460; }

.priority-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.priority-high { background: #ffebee; color: #c62828; }
.priority-normal { background: #e8f5e8; color: #2e7d32; }
.priority-low { background: #f3e5f5; color: #7b1fa2; }

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #495057;
  white-space: nowrap;
}

.due-date {
  font-size: 0.9rem;
}

.due-date.overdue {
  color: #dc3545;
  font-weight: 600;
}

.due-date.due-soon {
  color: #fd7e14;
  font-weight: 600;
}

.due-date.due-warning {
  color: #ffc107;
  font-weight: 600;
}

.created-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #dee2e6;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #6c757d;
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

.btn-outline {
  background: white;
  color: #6c757d;
  border: 1px solid #ced4da;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

/* Utility classes */
.text-center { text-align: center; }
.text-right { text-align: right; }

/* Responsive */
@media (max-width: 768px) {
  .work-order-list {
    padding: 10px;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-input, .filter-select {
    min-width: auto;
    width: 100%;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .work-orders-table {
    font-size: 0.8rem;
  }
  
  .work-orders-table th,
  .work-orders-table td {
    padding: 8px;
  }
}
</style>