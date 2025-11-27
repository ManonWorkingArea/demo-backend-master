<template>
  <div class="finance-manager">
    <!-- Manager Header -->
    <div class="manager-header">
      <div class="header-content">
        <div class="title-section">
          <h2>
            <i class="fas fa-calculator"></i>
            การจัดการการเงิน (Finance Management)
          </h2>
          <p class="subtitle">จัดการใบแจ้งหนี้ การชำระเงิน และรายงานทางการเงิน</p>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-outline" @click="refreshData">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            รีเฟรช
          </button>
          <button class="btn btn-primary" @click="showCreateForm = true">
            <i class="fas fa-plus"></i>
            สร้างเอกสารใหม่
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="fas fa-file-invoice"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalInvoices }}</h3>
          <p>ใบแจ้งหนี้ทั้งหมด</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="fas fa-money-check-alt"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.paid }}</h3>
          <p>ชำระแล้ว</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.pending }}</h3>
          <p>รอชำระ</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatCurrency(stats.totalRevenue) }}</h3>
          <p>รายได้รวม</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="empty-state">
        <i class="fas fa-calculator"></i>
        <h3>ยินดีต้อนรับสู่ระบบจัดการการเงิน</h3>
        <p>ระบบพร้อมใช้งาน UI ทุกส่วนใช้งานได้แล้ว<br>ฟีเจอร์การจัดการข้อมูลจะพัฒนาในเฟสถัดไป</p>
        <button class="btn btn-primary" @click="showCreateForm = true">
          <i class="fas fa-plus"></i>
          ทดสอบสร้างเอกสาร
        </button>
      </div>
    </div>

    <!-- Simple Modal for Demo -->
    <div v-if="showCreateForm" class="modal-overlay" @click="showCreateForm = false">
      <div class="modal-content" @click.stop>
        <h3>สร้างเอกสารการเงินใหม่</h3>
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
import { TransactionEngine, TRANSACTION_TYPES } from '../../../core'

export default {
  name: 'FinanceManager',
  setup() {
    // Core Engine
    const engine = new TransactionEngine()
    
    // Reactive State
    const financeDocuments = ref([])
    const loading = ref(false)
    
    // Form States
    const showCreateForm = ref(false)

    // Computed Stats
    const stats = computed(() => {
      return {
        totalInvoices: financeDocuments.value.length,
        paid: financeDocuments.value.filter(doc => doc.paymentStatus === 'paid').length,
        pending: financeDocuments.value.filter(doc => doc.paymentStatus === 'unpaid').length,
        totalRevenue: financeDocuments.value.reduce((sum, doc) => sum + (doc.totalAmount || 0), 0)
      }
    })

    // Load finance data
    const loadFinanceData = async () => {
      loading.value = true
      try {
        const result = await engine.getAll(TRANSACTION_TYPES.FINANCE)
        financeDocuments.value = result || []
      } catch (error) {
        console.error('Error loading finance data:', error)
        financeDocuments.value = []
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
      loadFinanceData()
    }

    // Initialize
    onMounted(() => {
      loadFinanceData()
    })

    return {
      // Data
      financeDocuments,
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
@import '../../../shared/manager-styles.css';

.finance-manager {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
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

/* Loading spinner animation */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>