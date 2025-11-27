<template>
  <div class="customer-manager">
    <!-- Header Section -->
    <div class="manager-header">
      <div class="header-content">
        <div class="title-section">
          <h1>
            <i class="fas fa-users"></i>
            จัดการลูกค้า
          </h1>
          <p class="subtitle">
            ระบบจัดการข้อมูลลูกค้า เครดิต และประวัติการซื้อ
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="refreshData" class="btn btn-outline" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            รีเฟรช
          </button>
          
          <router-link to="/sales/customers/new" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            เพิ่มลูกค้าใหม่
          </router-link>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-content">
        <div class="search-group">
          <div class="search-input">
            <i class="fas fa-search"></i>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="ค้นหาลูกค้า (รหัส, ชื่อ, เบอร์โทร, อีเมล)"
              @input="handleSearch"
            />
          </div>
        </div>
        
        <div class="filter-controls">
          <div class="filter-group">
            <label>สถานะ</label>
            <select v-model="filters.status" @change="applyFilters">
              <option value="">ทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="suspended">ระงับการใช้งาน</option>
              <option value="blacklisted">บัญชีดำ</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>กลุ่มลูกค้า</label>
            <select v-model="filters.customer_group" @change="applyFilters">
              <option value="">ทั้งหมด</option>
              <option value="retail">ลูกค้าปลีก</option>
              <option value="wholesale">ลูกค้าส่ง</option>
              <option value="distributor">ผู้จัดจำหน่าย</option>
              <option value="vip">ลูกค้า VIP</option>
              <option value="regular">ลูกค้าทั่วไป</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>ประเภท</label>
            <select v-model="filters.customer_type" @change="applyFilters">
              <option value="">ทั้งหมด</option>
              <option value="individual">บุคคลธรรมดา</option>
              <option value="corporate">นิติบุคคล</option>
              <option value="government">หน่วยงานราชการ</option>
              <option value="non-profit">องค์กรไม่แสวงหากำไร</option>
            </select>
          </div>
          
          <button @click="clearFilters" class="btn btn-outline btn-sm">
            <i class="fas fa-times"></i>
            ล้างตัวกรอง
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section" v-if="stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">ลูกค้าทั้งหมด</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon active">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.active }}</div>
            <div class="stat-label">ใช้งาน</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon credit">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formatCurrency(stats.totalCredit) }}</div>
            <div class="stat-label">วงเงินเครดิตรวม</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon outstanding">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formatCurrency(stats.totalOutstanding) }}</div>
            <div class="stat-label">ยอดค้างชำระรวม</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer List -->
    <div class="list-section">
      <div class="list-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>กำลังโหลดข้อมูลลูกค้า...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{{ error }}</p>
          <button @click="loadCustomers" class="btn btn-primary">
            <i class="fas fa-redo"></i>
            ลองใหม่
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCustomers.length === 0 && !loading" class="empty-state">
          <i class="fas fa-users"></i>
          <h3>ไม่พบข้อมูลลูกค้า</h3>
          <p v-if="searchTerm || hasActiveFilters">ไม่พบลูกค้าที่ตรงกับเงื่อนไขการค้นหา</p>
          <p v-else>ยังไม่มีลูกค้าในระบบ เริ่มต้นโดยเพิ่มลูกค้าใหม่</p>
          
          <div class="empty-actions">
            <button v-if="searchTerm || hasActiveFilters" @click="clearFilters" class="btn btn-outline">
              <i class="fas fa-times"></i>
              ล้างการค้นหา
            </button>
            
            <router-link to="/sales/customers/new" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              เพิ่มลูกค้าแรก
            </router-link>
          </div>
        </div>

        <!-- Customer Table -->
        <div v-else class="customers-table-container">
          <table class="customers-table">
            <thead>
              <tr>
                <th @click="toggleSort('customer_code')" class="sortable">
                  รหัสลูกค้า
                  <i class="fas fa-sort" :class="getSortClass('customer_code')"></i>
                </th>
                <th @click="toggleSort('name')" class="sortable">
                  ชื่อลูกค้า
                  <i class="fas fa-sort" :class="getSortClass('name')"></i>
                </th>
                <th>ประเภท</th>
                <th>กลุ่ม</th>
                <th>ติดต่o</th>
                <th class="text-right">เครดิต</th>
                <th class="text-right">ค้างชำระ</th>
                <th>สถานะ</th>
                <th class="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in paginatedCustomers" :key="customer.id" class="customer-row">
                <td>
                  <div class="customer-code">
                    <strong>{{ customer.customer_code }}</strong>
                  </div>
                </td>
                
                <td>
                  <div class="customer-name">
                    <div class="name">{{ customer.name }}</div>
                    <div v-if="customer.contact_person" class="contact">
                      {{ customer.contact_person }}
                    </div>
                  </div>
                </td>
                
                <td>
                  <span class="customer-type">{{ getCustomerTypeText(customer.customer_type) }}</span>
                </td>
                
                <td>
                  <span class="customer-group" :class="`group-${customer.customer_group}`">
                    {{ getCustomerGroupText(customer.customer_group) }}
                  </span>
                </td>
                
                <td>
                  <div class="contact-info">
                    <div v-if="customer.phone" class="phone">
                      <i class="fas fa-phone"></i>
                      {{ customer.phone }}
                    </div>
                    <div v-if="customer.email" class="email">
                      <i class="fas fa-envelope"></i>
                      {{ customer.email }}
                    </div>
                  </div>
                </td>
                
                <td class="text-right">
                  <div class="credit-amount">
                    {{ formatCurrency(customer.credit_limit) }}
                  </div>
                </td>
                
                <td class="text-right">
                  <div class="outstanding-amount" :class="{ 'over-limit': isOverLimit(customer) }">
                    {{ formatCurrency(customer.outstanding_balance) }}
                  </div>
                </td>
                
                <td>
                  <span class="status-badge" :class="`status-${customer.status}`">
                    {{ getStatusText(customer.status) }}
                  </span>
                </td>
                
                <td class="text-center">
                  <div class="action-buttons">
                    <router-link :to="`/sales/customers/${customer.id}`" class="btn btn-sm btn-outline" title="ดูรายละเอียด">
                      <i class="fas fa-eye"></i>
                    </router-link>
                    
                    <router-link :to="`/sales/customers/${customer.id}/edit`" class="btn btn-sm btn-primary" title="แก้ไข">
                      <i class="fas fa-edit"></i>
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-section">
          <div class="pagination-info">
            แสดง {{ startItem }}-{{ endItem }} จาก {{ filteredCustomers.length }} รายการ
          </div>
          
          <div class="pagination-controls">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="btn btn-sm btn-outline"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <span class="page-info">
              หน้า {{ currentPage }} จาก {{ totalPages }}
            </span>
            
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="btn btn-sm btn-outline"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'CustomerManager',
  setup() {
    // ✅ Get ERP Core instance
    const getCore = () => {
      if (window.ERP_CORE) {
        return window.ERP_CORE
      }
      throw new Error('ERP_CORE not available')
    }
    // State
    const loading = ref(true)
    const error = ref(null)
    const customers = ref([])
    const searchTerm = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const sortField = ref('name')
    const sortDirection = ref('asc')
    
    // Filters
    const filters = ref({
      status: '',
      customer_group: '',
      customer_type: ''
    })

    // Computed
    const stats = computed(() => {
      if (customers.value.length === 0) return null
      
      const total = customers.value.length
      const active = customers.value.filter(c => c.status === 'active').length
      const totalCredit = customers.value.reduce((sum, c) => sum + (c.credit_limit || 0), 0)
      const totalOutstanding = customers.value.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0)
      
      return {
        total,
        active,
        totalCredit,
        totalOutstanding
      }
    })

    const hasActiveFilters = computed(() => {
      return Object.values(filters.value).some(value => value !== '')
    })

    const filteredCustomers = computed(() => {
      let result = [...customers.value]

      // Apply search
      if (searchTerm.value) {
        const search = searchTerm.value.toLowerCase()
        result = result.filter(customer => 
          customer.customer_code?.toLowerCase().includes(search) ||
          customer.name?.toLowerCase().includes(search) ||
          customer.phone?.toLowerCase().includes(search) ||
          customer.email?.toLowerCase().includes(search) ||
          customer.contact_person?.toLowerCase().includes(search)
        )
      }

      // Apply filters
      if (filters.value.status) {
        result = result.filter(customer => customer.status === filters.value.status)
      }
      
      if (filters.value.customer_group) {
        result = result.filter(customer => customer.customer_group === filters.value.customer_group)
      }
      
      if (filters.value.customer_type) {
        result = result.filter(customer => customer.customer_type === filters.value.customer_type)
      }

      // Apply sorting
      result.sort((a, b) => {
        const aValue = a[sortField.value] || ''
        const bValue = b[sortField.value] || ''
        
        if (sortDirection.value === 'asc') {
          return aValue.toString().localeCompare(bValue.toString())
        } else {
          return bValue.toString().localeCompare(aValue.toString())
        }
      })

      return result
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredCustomers.value.length / itemsPerPage.value)
    })

    const paginatedCustomers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredCustomers.value.slice(start, end)
    })

    const startItem = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1
    })

    const endItem = computed(() => {
      const end = currentPage.value * itemsPerPage.value
      return Math.min(end, filteredCustomers.value.length)
    })

    // Methods
    const loadCustomers = async () => {
      loading.value = true
      error.value = null

      try {
        console.log('[Customer Manager] Loading customers...')
        
        // ✅ ใช้ Core-Only Access
        const core = getCore()
        console.log('[Customer Manager] Loading customers via Core-Only Access')
        
        // ✅ เรียกใช้ TransactionEngine ด้วย CUSTOMER transaction type
        const result = await core.executeModuleFunction('transactionEngine', 'list', 'customer')
        
        console.log('[Customer Manager] Transaction result:', result)
        
        if (result.success) {
          customers.value = result.data || []
          console.log('[Customer Manager] Loaded customers:', customers.value.length)
        } else {
          console.error('[Customer Manager] Failed to load customers:', result.error)
          customers.value = []
          error.value = result.error || result.message || 'ไม่สามารถโหลดข้อมูลลูกค้าได้'
        }
      } catch (err) {
        console.error('[Customer Manager] Load error:', err)
        error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า'
        customers.value = []
      } finally {
        loading.value = false
      }
    }

    const refreshData = () => {
      loadCustomers()
    }

    const handleSearch = () => {
      currentPage.value = 1
    }

    const applyFilters = () => {
      currentPage.value = 1
    }

    const clearFilters = () => {
      searchTerm.value = ''
      filters.value = {
        status: '',
        customer_group: '',
        customer_type: ''
      }
      currentPage.value = 1
    }

    const toggleSort = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }

    const getSortClass = (field) => {
      if (sortField.value !== field) return ''
      return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const getCustomerTypeText = (type) => {
      const typeMap = {
        'individual': 'บุคคลธรรมดา',
        'corporate': 'นิติบุคคล',
        'government': 'หน่วยงานราชการ',
        'non-profit': 'องค์กรไม่แสวงหากำไร'
      }
      return typeMap[type] || '-'
    }

    const getCustomerGroupText = (group) => {
      const groupMap = {
        'retail': 'ปลีก',
        'wholesale': 'ส่ง',
        'distributor': 'จัดจำหน่าย',
        'vip': 'VIP',
        'regular': 'ทั่วไป'
      }
      return groupMap[group] || '-'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'active': 'ใช้งาน',
        'inactive': 'ไม่ใช้งาน',
        'suspended': 'ระงับ',
        'blacklisted': 'บัญชีดำ'
      }
      return statusMap[status] || '-'
    }

    const isOverLimit = (customer) => {
      const limit = customer.credit_limit || 0
      const outstanding = customer.outstanding_balance || 0
      return limit > 0 && outstanding > limit
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0)
    }

    // Watch for filter changes to reset pagination
    watch([searchTerm, filters], () => {
      currentPage.value = 1
    }, { deep: true })

    // Lifecycle
    onMounted(() => {
      loadCustomers()
    })

    return {
      loading,
      error,
      customers,
      searchTerm,
      currentPage,
      filters,
      stats,
      hasActiveFilters,
      filteredCustomers,
      paginatedCustomers,
      totalPages,
      startItem,
      endItem,
      loadCustomers,
      refreshData,
      handleSearch,
      applyFilters,
      clearFilters,
      toggleSort,
      getSortClass,
      goToPage,
      getCustomerTypeText,
      getCustomerGroupText,
      getStatusText,
      isOverLimit,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.customer-manager {
  min-height: 100vh;
  background: #f7fafc;
}

/* Header */
.manager-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 24px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section h1 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-section h1 i {
  color: #4299e1;
}

.subtitle {
  margin: 0;
  color: #718096;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Filter Section */
.filter-section {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 0;
}

.filter-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.search-input input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.search-input input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: #718096;
}

.filter-group select {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

/* Stats Section */
.stats-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #4a5568;
  font-size: 20px;
}

.stat-icon.active {
  background: #c6f6d5;
  color: #22543d;
}

.stat-icon.credit {
  background: #bee3f8;
  color: #2c5282;
}

.stat-icon.outstanding {
  background: #fed7d7;
  color: #c53030;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

/* List Section */
.list-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.list-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Loading/Error/Empty States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.loading-state i,
.error-state i,
.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.error-state i {
  color: #e53e3e;
}

.empty-state i {
  color: #cbd5e0;
}

.error-state h3,
.empty-state h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

/* Table */
.customers-table-container {
  overflow-x: auto;
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
}

.customers-table th,
.customers-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.customers-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.customers-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.customers-table th.sortable:hover {
  color: #2d3748;
}

.customers-table th.sortable i {
  margin-left: 6px;
  opacity: 0.5;
}

.customer-row:hover {
  background: #f7fafc;
}

.customer-code strong {
  color: #2d3748;
  font-weight: 600;
}

.customer-name .name {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 2px;
}

.customer-name .contact {
  font-size: 12px;
  color: #718096;
}

.customer-type {
  font-size: 12px;
  color: #4a5568;
}

.customer-group {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.customer-group.group-vip {
  background: #fef5e7;
  color: #d69e2e;
}

.customer-group.group-wholesale {
  background: #e6fffa;
  color: #319795;
}

.customer-group.group-retail {
  background: #ebf8ff;
  color: #3182ce;
}

.contact-info .phone,
.contact-info .email {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #718096;
  margin-bottom: 2px;
}

.contact-info i {
  width: 12px;
}

.credit-amount,
.outstanding-amount {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.outstanding-amount.over-limit {
  color: #e53e3e;
}

.status-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.status-active {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.status-inactive {
  background: #e2e8f0;
  color: #4a5568;
}

.status-badge.status-suspended {
  background: #fefcbf;
  color: #744210;
}

.status-badge.status-blacklisted {
  background: #fed7d7;
  color: #c53030;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
}

.pagination-info {
  font-size: 14px;
  color: #718096;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-info {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
  border-color: #3182ce;
}

.btn-outline {
  background: transparent;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-content {
    gap: 12px;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .customers-table {
    font-size: 12px;
  }
  
  .customers-table th,
  .customers-table td {
    padding: 8px;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 12px;
  }
}
</style>