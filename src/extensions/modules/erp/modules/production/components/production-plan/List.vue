<template>
  <div class="production-manager">
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/production/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Production Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Production Plan</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Manager Header -->
    <div class="manager-header">
      <div class="header-content">
        <div class="title-section">
          <h2>
            <i class="fas fa-industry"></i>
            การจัดการการผลิต (Production Management)
          </h2>
          <p class="subtitle">จัดการใบสั่งผลิต BOM และติดตามการผลิต</p>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-outline" @click="refreshData">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            รีเฟรช
          </button>
          <button class="btn btn-primary" @click="showCreateForm = true">
            <i class="fas fa-plus"></i>
            สร้างใบสั่งผลิตใหม่
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.planned }}</h3>
          <p>วางแผนแล้ว</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="fas fa-play-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.inProgress }}</h3>
          <p>กำลังผลิต</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.completed }}</h3>
          <p>ผลิตเสร็จ</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatCurrency(stats.totalCost) }}</h3>
          <p>ต้นทุนรวม</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-grid">
        <div class="action-card" @click="$router.push('/production/work-orders/manage')">
          <div class="action-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="action-content">
            <h4>จัดการ Work Orders</h4>
            <p>สร้าง Work Order จาก Sales Order ที่ยืนยันแล้ว</p>
            <span class="action-arrow">
              <i class="fas fa-arrow-right"></i>
            </span>
          </div>
        </div>

        <div class="action-card" @click="$router.push('/production/work-orders')">
          <div class="action-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="action-content">
            <h4>รายการ Work Orders</h4>
            <p>ดูและติดตาม Work Order ทั้งหมด</p>
            <span class="action-arrow">
              <i class="fas fa-arrow-right"></i>
            </span>
          </div>
        </div>

        <div class="action-card" @click="$router.push('/production/production-progress')">
          <div class="action-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="action-content">
            <h4>ความคืบหน้าการผลิต</h4>
            <p>ติดตามความคืบหน้าและสถานะการผลิต</p>
            <span class="action-arrow">
              <i class="fas fa-arrow-right"></i>
            </span>
          </div>
        </div>

        <div class="action-card" @click="$router.push('/production/production-qc')">
          <div class="action-icon">
            <i class="fas fa-search"></i>
          </div>
          <div class="action-content">
            <h4>Production QC</h4>
            <p>ตรวจสอบคุณภาพและออกใบรับรอง</p>
            <span class="action-arrow">
              <i class="fas fa-arrow-right"></i>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="empty-state">
        <i class="fas fa-industry"></i>
        <h3>ยินดีต้อนรับสู่ระบบจัดการการผลิต</h3>
        <p>ระบบพร้อมใช้งาน UI ทุกส่วนใช้งานได้แล้ว<br>ฟีเจอร์การจัดการข้อมูลจะพัฒนาในเฟสถัดไป</p>
        <div class="main-actions">
          <button class="btn btn-primary" @click="$router.push('/production/work-orders/manage')">
            <i class="fas fa-tasks"></i>
            จัดการ Work Orders
          </button>
          <button class="btn btn-outline" @click="showCreateForm = true">
            <i class="fas fa-plus"></i>
            ทดสอบสร้างใบสั่งผลิต
          </button>
        </div>
      </div>
    </div>

    <!-- Simple Modal for Demo -->
    <div v-if="showCreateForm" class="modal-overlay" @click="showCreateForm = false">
      <div class="modal-content" @click.stop>
        <h3>สร้างใบสั่งผลิตใหม่</h3>
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
import { ref, computed, onMounted } from 'vue'
import { TransactionEngine } from '../../../../core/Engine.js'
import { TRANSACTION_TYPES } from '../../../../core/Types.js'

export default {
  name: 'ProductionManager',
  setup() {
    // Core Engine
    const engine = new TransactionEngine()
    
    // Reactive State
    const productions = ref([])
    const loading = ref(false)
    
    // Form States
    const showCreateForm = ref(false)

    // Computed Stats
    const stats = computed(() => {
      return {
        planned: productions.value.filter(p => p.state === 'planned').length,
        inProgress: productions.value.filter(p => p.state === 'in_progress').length,
        completed: productions.value.filter(p => p.state === 'completed').length,
        totalCost: productions.value.reduce((sum, p) => sum + (p.totalCost || 0), 0)
      }
    })

    // Load production data
    const loadProductions = async () => {
      loading.value = true
      try {
        const result = await engine.list(TRANSACTION_TYPES.PRODUCTION)
        productions.value = result.data || []
      } catch (error) {
        console.error('Error loading productions:', error)
        productions.value = []
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

    // Refresh data
    const refreshData = () => {
      loadProductions()
    }

    // Initialize
    onMounted(() => {
      loadProductions()
    })

    return {
      // Data
      productions,
      loading,
      
      // Form states
      showCreateForm,
      
      // Computed
      stats,
      
      // Methods
      formatCurrency,
      refreshData
    }
  }
}
</script>

<style scoped>
/* Import shared manager styles */
@import '../../../../shared/manager-styles.css';

.production-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 30px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: #3498db;
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.action-content h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.action-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.action-arrow {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  color: #bdc3c7;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.action-card:hover .action-arrow {
  color: #3498db;
  transform: translateY(-50%) translateX(4px);
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.main-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
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

/* Loading spinner animation */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>