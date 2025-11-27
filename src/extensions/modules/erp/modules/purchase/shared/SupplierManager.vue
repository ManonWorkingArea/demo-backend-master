<template>
  <div class="supplier-manager">
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/purchase/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Purchase Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Supplier Master</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">
            <i class="fas fa-users"></i>
            การจัดการผู้ขาย (Supplier Management)
          </h1>
          <p class="subtitle">จัดการข้อมูลผู้ขาย ผู้จัดหา และผู้ให้บริการ</p>
        </div>
        
        <div class="header-actions">
          <button @click="openCreateForm" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            เพิ่มผู้ขายใหม่
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users" style="color: #4299e1;"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">ผู้ขายทั้งหมด</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-check-circle" style="color: #48bb78;"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.active }}</div>
          <div class="stat-label">ใช้งานอยู่</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock" style="color: #ed8936;"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">รอการอนุมัติ</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-star" style="color: #f6e05e;"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.excellent }}</div>
          <div class="stat-label">ประเมินดีเยี่ยม</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="filter-group">
          <label class="filter-label">สถานะ:</label>
          <select v-model="statusFilter" class="filter-select">
            <option value="">ทั้งหมด</option>
            <option v-for="(label, value) in supplierStatusLabels" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">ประเภท:</label>
          <select v-model="typeFilter" class="filter-select">
            <option value="">ทั้งหมด</option>
            <option v-for="(label, value) in supplierTypeLabels" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">การประเมิน:</label>
          <select v-model="ratingFilter" class="filter-select">
            <option value="">ทั้งหมด</option>
            <option v-for="(label, value) in supplierRatingLabels" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </div>
        
        <div class="search-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาผู้ขาย..."
            class="search-input"
          />
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>
    </div>

    <!-- Test Data Buttons -->
    <div class="test-actions">
      <button @click="testCreateSupplier" class="btn btn-outline">
        <i class="fas fa-flask"></i>
        🧪 สร้างผู้ขายทดสอบ
      </button>
      <button @click="testCreateInternationalSupplier" class="btn btn-outline">
        <i class="fas fa-globe"></i>
        🧪 สร้างผู้ขายต่างประเทศ
      </button>
    </div>

    <!-- Suppliers Table -->
    <div class="table-container">
      <div class="table-header">
        <h3 class="table-title">
          <i class="fas fa-list"></i>
          รายการผู้ขาย ({{ filteredSuppliers.length }} รายการ)
        </h3>
      </div>
      
      <div class="table-wrapper">
        <table class="suppliers-table">
          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อผู้ขาย</th>
              <th>ประเภท</th>
              <th>ผู้ติดต่อ</th>
              <th>สถานะ</th>
              <th>การประเมิน</th>
              <th>วงเงินเครดิต</th>
              <th>วันที่สร้าง</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="suppliers.length === 0">
              <td colspan="9" class="no-data">
                <div class="no-data-content">
                  <i class="fas fa-inbox"></i>
                  <p>ยังไม่มีข้อมูลผู้ขาย</p>
                  <button @click="openCreateForm" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    เพิ่มผู้ขายแรก
                  </button>
                </div>
              </td>
            </tr>
            <tr v-for="supplier in filteredSuppliers" :key="supplier.id">
              <td>
                <div class="supplier-code">
                  {{ supplier.supplier_code }}
                </div>
              </td>
              <td>
                <div class="supplier-info">
                  <div class="supplier-name">{{ supplier.name }}</div>
                  <div class="supplier-contact" v-if="supplier.contact_person">
                    <i class="fas fa-user"></i>
                    {{ supplier.contact_person }}
                  </div>
                </div>
              </td>
              <td>
                <span class="type-badge" :class="`type-${supplier.type}`">
                  {{ formatType(supplier.type) }}
                </span>
              </td>
              <td>
                <div class="contact-info">
                  <div v-if="supplier.phone">
                    <i class="fas fa-phone"></i>
                    {{ supplier.phone }}
                  </div>
                  <div v-if="supplier.email">
                    <i class="fas fa-envelope"></i>
                    {{ supplier.email }}
                  </div>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="`status-${supplier.status}`">
                  {{ formatStatus(supplier.status) }}
                </span>
              </td>
              <td>
                <span class="rating-badge" :class="`rating-${supplier.rating || 'unrated'}`">
                  {{ formatRating(supplier.rating || 'unrated') }}
                </span>
              </td>
              <td>
                <div class="credit-info">
                  {{ formatCurrency(supplier.credit_limit || 0) }}
                  <div class="credit-terms" v-if="supplier.payment_terms">
                    {{ formatPaymentTerms(supplier.payment_terms) }}
                  </div>
                </div>
              </td>
              <td>
                <div class="date-info">
                  {{ formatDate(supplier.created_at) }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn-icon btn-primary" 
                    :title="`ดูรายละเอียด ${supplier.supplier_code}`"
                    @click="viewSupplierDetail(supplier.id)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    v-if="['pending', 'active', 'inactive'].includes(supplier.status)"
                    class="btn-icon btn-outline" 
                    :title="`แก้ไข ${supplier.supplier_code}`"
                    @click="editSupplier(supplier.id)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    v-if="supplier.status === 'pending'"
                    class="btn-icon btn-success" 
                    :title="`อนุมัติ ${supplier.supplier_code}`"
                    @click="approveSupplier(supplier.id)"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    v-if="!['blacklisted', 'suspended'].includes(supplier.status)"
                    class="btn-icon btn-danger" 
                    :title="`ลบ ${supplier.supplier_code}`"
                    @click="deleteSupplier(supplier.id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ✅ CORE COMPLIANT SUPPLIER MANAGER - Supplier Management
 * ใช้ Core-Only Access ตาม AI Guidelines
 * - ใช้ getCore() helper function
 * - ไม่มี direct business logic  
 * - จัดการ CRUD ผ่าน ERP_CORE.engine
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  SUPPLIER_TYPES,
  SUPPLIER_STATUS,
  SUPPLIER_RATING,
  SUPPLIER_TYPE_LABELS,
  SUPPLIER_STATUS_LABELS,
  SUPPLIER_RATING_LABELS,
  PAYMENT_TERMS_LABELS
} from '../../../core/masterdata/supplier/schema.js'

export default {
  name: 'SupplierManager',
  setup() {
    const router = useRouter()
    
    // ✅ Core-Only Access Helper
    const getCore = () => {
      if (typeof window !== 'undefined' && window.ERP_CORE) {
        return window.ERP_CORE
      }
      throw new Error('ERP_CORE not available')
    }

    // ✅ State
    const suppliers = ref([])
    const loading = ref(false)
    
    // ✅ Filters
    const statusFilter = ref('')
    const typeFilter = ref('')
    const ratingFilter = ref('')
    const searchQuery = ref('')

    // ✅ Labels
    const supplierTypeLabels = SUPPLIER_TYPE_LABELS
    const supplierStatusLabels = SUPPLIER_STATUS_LABELS
    const supplierRatingLabels = SUPPLIER_RATING_LABELS

    // ✅ Computed Properties
    const stats = computed(() => {
      const total = suppliers.value.length
      const active = suppliers.value.filter(s => s.status === SUPPLIER_STATUS.ACTIVE).length
      const pending = suppliers.value.filter(s => s.status === SUPPLIER_STATUS.PENDING).length
      const excellent = suppliers.value.filter(s => s.rating === SUPPLIER_RATING.EXCELLENT).length
      
      return { total, active, pending, excellent }
    })

    const filteredSuppliers = computed(() => {
      let filtered = suppliers.value

      // Filter by status
      if (statusFilter.value) {
        filtered = filtered.filter(s => s.status === statusFilter.value)
      }

      // Filter by type
      if (typeFilter.value) {
        filtered = filtered.filter(s => s.type === typeFilter.value)
      }

      // Filter by rating
      if (ratingFilter.value) {
        filtered = filtered.filter(s => s.rating === ratingFilter.value)
      }

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(s => 
          s.name?.toLowerCase().includes(query) ||
          s.supplier_code?.toLowerCase().includes(query) ||
          s.contact_person?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    // ✅ Data Loading
    const refreshData = async () => {
      try {
        loading.value = true
        const core = getCore()
        const result = await core.engine.list('supplier')
        
        if (result.success) {
          suppliers.value = result.data || []
          console.log('[Supplier Manager] Loaded suppliers:', suppliers.value.length)
        } else {
          console.error('[Supplier Manager] Failed to load:', result.message)
          if (window.$toast) {
            window.$toast.error('ไม่สามารถโหลดข้อมูลผู้ขายได้')
          }
        }
      } catch (error) {
        console.error('[Supplier Manager] Load error:', error)
        if (window.$toast) {
          window.$toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        }
      } finally {
        loading.value = false
      }
    }

    // ✅ Navigation Functions
    const openCreateForm = () => {
      router.push('/purchase/suppliers/new')
    }

    const editSupplier = (id) => {
      router.push({ 
        name: 'purchase-supplier-edit', 
        params: { id } 
      })
    }

    const viewSupplierDetail = (id) => {
      router.push({
        name: 'purchase-supplier-detail',
        params: { id }
      })
    }

    // ✅ Actions
    const approveSupplier = async (id) => {
      if (!confirm('ต้องการอนุมัติผู้ขายนี้หรือไม่?')) return

      try {
        const core = getCore()
        const result = await core.engine.update('supplier', id, {
          status: SUPPLIER_STATUS.ACTIVE,
          approved_at: new Date(),
          updated_at: new Date()
        })

        if (result.success) {
          console.log('[Supplier Manager] Supplier approved:', result.data)
          if (window.$toast) {
            window.$toast.success('อนุมัติผู้ขายเรียบร้อยแล้ว')
          }
          refreshData()
        } else {
          throw new Error(result.message)
        }
      } catch (error) {
        console.error('[Supplier Manager] Approve error:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถอนุมัติผู้ขายได้: ' + error.message)
        }
      }
    }

    const deleteSupplier = async (id) => {
      // หาข้อมูลผู้ขายเพื่อแสดงชื่อใน confirmation
      const supplier = suppliers.value.find(s => s.id === id)
      const supplierName = supplier ? supplier.name || supplier.supplier_code : 'ผู้ขายนี้'
      
      if (!confirm(`ต้องการลบ ${supplierName} หรือไม่?\n\nการลบจะไม่สามารถยกเลิกได้!`)) return

      try {
        const core = getCore()
        const result = await core.engine.delete('supplier', id)

        if (result.success) {
          console.log('[Supplier Manager] Supplier deleted:', id)
          if (window.$toast) {
            window.$toast.success(`ลบ ${supplierName} เรียบร้อยแล้ว`)
          }
          refreshData()
        } else {
          throw new Error(result.message)
        }
      } catch (error) {
        console.error('[Supplier Manager] Delete error:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถลบผู้ขายได้: ' + error.message)
        }
      }
    }

    // ✅ Test Data Functions
    const testCreateSupplier = async () => {
      const sampleData = {
        supplier_code: `DOM${Date.now().toString().slice(-5)}`,
        name: 'บริษัท ผู้ขายทดสอบ จำกัด',
        type: SUPPLIER_TYPES.DOMESTIC,
        status: SUPPLIER_STATUS.ACTIVE,
        contact_person: 'คุณทดสอบ ผู้ขาย',
        phone: '02-123-4567',
        email: 'test@supplier.com',
        address: '123 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ',
        province: 'กรุงเทพมหานคร',
        postal_code: '10100',
        country: 'ไทย',
        tax_id: '1234567890123',
        payment_terms: 'net_30',
        currency: 'THB',
        credit_limit: 100000,
        credit_days: 30,
        discount_percentage: 5,
        lead_time_days: 7,
        rating: SUPPLIER_RATING.GOOD,
        is_active: true,
        requires_po: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      try {
        const core = getCore()
        const result = await core.engine.create('supplier', sampleData)
        
        if (result.success) {
          console.log('[Supplier Manager] Test supplier created:', result.data)
          if (window.$toast) {
            window.$toast.success('สร้างผู้ขายทดสอบเรียบร้อยแล้ว')
          }
          refreshData()
        } else {
          throw new Error(result.message)
        }
      } catch (error) {
        console.error('[Supplier Manager] Create test supplier error:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถสร้างผู้ขายทดสอบได้: ' + error.message)
        }
      }
    }

    const testCreateInternationalSupplier = async () => {
      const sampleData = {
        supplier_code: `INT${Date.now().toString().slice(-5)}`,
        name: 'ABC International Trading Co.',
        type: SUPPLIER_TYPES.INTERNATIONAL,
        status: SUPPLIER_STATUS.PENDING,
        contact_person: 'Mr. John Smith',
        phone: '+1-555-123-4567',
        email: 'john@abctrading.com',
        address: '123 Main Street, Business District',
        province: 'California',
        postal_code: '90210',
        country: 'United States',
        payment_terms: 'net_45',
        currency: 'USD',
        credit_limit: 500000,
        credit_days: 45,
        discount_percentage: 3,
        lead_time_days: 30,
        rating: SUPPLIER_RATING.UNRATED,
        is_active: true,
        requires_po: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      try {
        const core = getCore()
        const result = await core.engine.create('supplier', sampleData)
        
        if (result.success) {
          console.log('[Supplier Manager] Test international supplier created:', result.data)
          if (window.$toast) {
            window.$toast.success('สร้างผู้ขายต่างประเทศทดสอบเรียบร้อยแล้ว')
          }
          refreshData()
        } else {
          throw new Error(result.message)
        }
      } catch (error) {
        console.error('[Supplier Manager] Create international supplier error:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถสร้างผู้ขายต่างประเทศได้: ' + error.message)
        }
      }
    }

    // ✅ Formatters
    const formatStatus = (status) => {
      return SUPPLIER_STATUS_LABELS[status] || status
    }

    const formatType = (type) => {
      return SUPPLIER_TYPE_LABELS[type] || type
    }

    const formatRating = (rating) => {
      return SUPPLIER_RATING_LABELS[rating] || rating
    }

    const formatPaymentTerms = (terms) => {
      return PAYMENT_TERMS_LABELS[terms] || terms
    }

    const formatCurrency = (amount, currency = 'THB') => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: currency
      }).format(amount)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // ✅ Lifecycle
    onMounted(() => {
      refreshData()
    })

    return {
      // Data
      suppliers,
      loading,
      
      // Filters
      statusFilter,
      typeFilter, 
      ratingFilter,
      searchQuery,
      
      // Labels
      supplierTypeLabels,
      supplierStatusLabels,
      supplierRatingLabels,
      
      // Computed
      stats,
      filteredSuppliers,
      
      // Methods
      refreshData,
      openCreateForm,
      editSupplier,
      viewSupplierDetail,
      approveSupplier,
      deleteSupplier,
      testCreateSupplier,
      testCreateInternationalSupplier,
      
      // Formatters
      formatStatus,
      formatType,
      formatRating,
      formatPaymentTerms,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
.supplier-manager {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

.page-header {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.header-content {
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title i {
  color: #4299e1;
  font-size: 24px;
}

.subtitle {
  color: #718096;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  color: #718096;
  font-size: 14px;
}

.filters-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.filters-container {
  padding: 20px 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-weight: 500;
  color: #4a5568;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

.search-group {
  position: relative;
  margin-left: auto;
}

.search-input {
  padding: 8px 12px 8px 35px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.test-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 20px 30px;
  border-bottom: 1px solid #e2e8f0;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-wrapper {
  overflow-x: auto;
}

.suppliers-table {
  width: 100%;
  border-collapse: collapse;
}

.suppliers-table th {
  background: #f7fafc;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.suppliers-table td {
  padding: 15px;
  border-bottom: 1px solid #f7fafc;
  vertical-align: top;
}

.supplier-code {
  font-family: monospace;
  font-weight: 600;
  color: #2d3748;
}

.supplier-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.supplier-name {
  font-weight: 500;
  color: #2d3748;
}

.supplier-contact {
  font-size: 12px;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 4px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #718096;
}

.contact-info div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.credit-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.credit-terms {
  font-size: 11px;
  color: #718096;
}

.date-info {
  font-size: 12px;
  color: #718096;
}

.type-badge,
.status-badge,
.rating-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active { background: #c6f6d5; color: #22543d; }
.status-inactive { background: #e2e8f0; color: #4a5568; }
.status-pending { background: #fef5e7; color: #c05621; }
.status-suspended { background: #fed7d7; color: #c53030; }
.status-blocked { background: #fed7d7; color: #c53030; }
.status-blacklisted { background: #2d3748; color: white; }

.type-domestic { background: #bee3f8; color: #2a69ac; }
.type-international { background: #c6f6d5; color: #22543d; }
.type-manufacturer { background: #e9d8fd; color: #553c9a; }
.type-distributor { background: #fef5e7; color: #c05621; }
.type-service { background: #fed7e2; color: #b83280; }
.type-individual { background: #f7fafc; color: #4a5568; }

.rating-excellent { background: #c6f6d5; color: #22543d; }
.rating-good { background: #bee3f8; color: #2a69ac; }
.rating-average { background: #fef5e7; color: #c05621; }
.rating-poor { background: #fed7d7; color: #c53030; }
.rating-unrated { background: #e2e8f0; color: #4a5568; }

.action-buttons {
  display: flex;
  gap: 5px;
}

.btn-icon {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.btn-icon.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-icon.btn-outline {
  background: white;
  color: #4a5568;
  border: 1px solid #d1d5db;
}

.btn-icon.btn-success {
  background: #48bb78;
  color: white;
}

.btn-icon.btn-danger {
  background: #f56565;
  color: white;
}

.btn-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
}

.btn-outline {
  background: white;
  color: #4a5568;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f7fafc;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: #718096;
}

.no-data-content i {
  font-size: 48px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .supplier-manager {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .filters-container {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .search-group {
    margin-left: 0;
  }
  
  .search-input {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>