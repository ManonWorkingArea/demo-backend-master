<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-id-badge text-blue-500"></i>
              Employee Management - จัดการข้อมูลพนักงาน
            </h1>
            <p class="mt-2 text-gray-600">จัดการข้อมูลพนักงาน แผนก ตำแหน่ง และเวลาทำงาน</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="searchEmployees"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-refresh mr-2"></i>
              รีเฟรช
            </button>
            <button 
              @click="createEmployee"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-user-plus mr-2"></i>
              เพิ่มพนักงานใหม่
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Home
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <router-link 
                  to="/hr/dashboard" 
                  class="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  HR Dashboard
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">Employee Management</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ summary.total }}</p>
              <p class="text-sm text-gray-600">พนักงานทั้งหมด</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-user-check text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ summary.active }}</p>
              <p class="text-sm text-gray-600">ทำงานอยู่</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-user-clock text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ summary.inactive }}</p>
              <p class="text-sm text-gray-600">หยุดงาน</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-user-times text-white text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ summary.resigned }}</p>
              <p class="text-sm text-gray-600">ลาออกแล้ว</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
            <div class="relative">
              <input
                v-model="filters.search"
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, อีเมล..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @keyup.enter="searchEmployees"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">แผนก</label>
            <select 
              v-model="filters.department"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกแผนก</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ตำแหน่ง</label>
            <select 
              v-model="filters.position"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกตำแหน่ง</option>
              <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                {{ pos.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
            <select 
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกสถานะ</option>
              <option value="active">ทำงานอยู่</option>
              <option value="inactive">หยุดงาน</option>
              <option value="resigned">ลาออก</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            {{ pagination.total }} พนักงาน
          </div>
          <div class="flex space-x-2">
            <button 
              @click="searchEmployees"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-search mr-2"></i>
              ค้นหา
            </button>
            <button 
              @click="resetFilters"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-undo mr-2"></i>
              ล้าง
            </button>
          </div>
        </div>
      </div>

      <!-- Employees Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="employees.length === 0" class="p-12 text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-users text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">ไม่มีข้อมูลพนักงาน</h3>
          <p class="text-gray-600 mb-4">เริ่มต้นโดยการเพิ่มพนักงานคนแรก</p>
          <button 
            @click="createEmployee"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-user-plus mr-2"></i>
            เพิ่มพนักงานใหม่
          </button>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รูปภาพ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสพนักงาน</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แผนก</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตำแหน่ง</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทร</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่เข้าทำงาน</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="employee in employees" 
                :key="employee.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <img 
                    :src="employee.avatar || '/default-avatar.png'" 
                    :alt="employee.full_name"
                    class="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ employee.employee_code }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ employee.full_name }}</div>
                  <div class="text-xs text-gray-500">{{ employee.nickname }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ employee.department?.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ employee.position?.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ employee.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ employee.phone }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(employee.start_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(employee.status)">
                    {{ getStatusText(employee.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button 
                      @click="viewDetail(employee.id)"
                      class="text-blue-600 hover:text-blue-900"
                      title="ดูรายละเอียด"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      v-if="canEdit(employee)"
                      @click="editEmployee(employee.id)"
                      class="text-yellow-600 hover:text-yellow-900"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="viewTimesheet(employee.id)"
                      class="text-green-600 hover:text-green-900"
                      title="เวลาทำงาน"
                    >
                      <i class="fas fa-clock"></i>
                    </button>
                    <button 
                      v-if="canManageUser(employee)"
                      @click="manageUser(employee.id)"
                      class="text-gray-600 hover:text-gray-900"
                      title="จัดการ User Account"
                    >
                      <i class="fas fa-user-cog"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="employees.length > 0" class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-600">
          แสดง {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} - 
          {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
          จาก {{ pagination.total }} รายการ
        </div>
        <div class="flex space-x-2">
          <button 
            @click="goToPage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              pagination.current_page <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            ]"
          >
            ก่อนหน้า
          </button>
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              pagination.current_page === page
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            ]"
          >
            {{ page }}
          </button>
          <button 
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              pagination.current_page >= pagination.last_page
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            ]"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeesList',
  data() {
    return {
      loading: false,
      employees: [],
      departments: [],
      positions: [],
      summary: {
        total: 0,
        active: 0,
        inactive: 0,
        resigned: 0
      },
      filters: {
        search: '',
        department: '',
        position: '',
        status: ''
      },
      pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1
      }
    }
  },
  computed: {
    visiblePages() {
      const pages = []
      const current = this.pagination.current_page
      const last = this.pagination.last_page
      
      for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  async mounted() {
    // Initialize HR module and sample data
    if (window.ERP_CORE?.modules?.hr?.init) {
      await window.ERP_CORE.modules.hr.init(this)
    }
    
    await this.loadDepartments()
    await this.loadPositions()
    await this.loadEmployees()
    await this.loadSummary()
  },
  methods: {
    async loadEmployees(page = 1) {
      this.loading = true
      try {
        // Use ERP CORE data instead of API call
        let employees = []
        
        if (window.ERP_CORE?.modules?.hr?.getEmployees) {
          employees = await window.ERP_CORE.modules.hr.getEmployees()
        } else {
          employees = window.ERP_CORE?.data?.employees || []
        }

        // Apply filters
        if (this.filters.search) {
          const search = this.filters.search.toLowerCase()
          employees = employees.filter(emp => 
            emp.first_name?.toLowerCase().includes(search) ||
            emp.last_name?.toLowerCase().includes(search) ||
            emp.employee_code?.toLowerCase().includes(search) ||
            emp.email?.toLowerCase().includes(search)
          )
        }

        if (this.filters.department) {
          employees = employees.filter(emp => emp.department_id === this.filters.department)
        }

        if (this.filters.position) {
          employees = employees.filter(emp => emp.position_id === this.filters.position)
        }

        if (this.filters.status) {
          employees = employees.filter(emp => emp.status === this.filters.status)
        }

        // Add department and position data
        employees = employees.map(emp => ({
          ...emp,
          full_name: `${emp.first_name} ${emp.last_name}`,
          department: this.departments.find(d => d.id === emp.department_id),
          position: this.positions.find(p => p.id === emp.position_id)
        }))

        // Pagination
        const total = employees.length
        const per_page = this.pagination.per_page
        const start = (page - 1) * per_page
        const end = start + per_page

        this.employees = employees.slice(start, end)
        this.pagination = {
          current_page: page,
          per_page: per_page,
          total: total,
          last_page: Math.ceil(total / per_page)
        }

      } catch (error) {
        console.error('Load employees error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถโหลดข้อมูลพนักงานได้', 'error')
      } finally {
        this.loading = false
      }
    },

    async loadDepartments() {
      try {
        // Use ERP CORE data instead of API call
        if (window.ERP_CORE?.modules?.hr?.getDepartments) {
          this.departments = await window.ERP_CORE.modules.hr.getDepartments()
        } else {
          this.departments = window.ERP_CORE?.data?.departments || []
        }
      } catch (error) {
        console.error('Load departments error:', error)
      }
    },

    async loadPositions() {
      try {
        // Use ERP CORE data instead of API call
        if (window.ERP_CORE?.modules?.hr?.getPositions) {
          this.positions = await window.ERP_CORE.modules.hr.getPositions()
        } else {
          this.positions = window.ERP_CORE?.data?.positions || []
        }
      } catch (error) {
        console.error('Load positions error:', error)
      }
    },

    async loadSummary() {
      try {
        // Calculate summary from ERP CORE data
        const employees = window.ERP_CORE?.data?.employees || []
        
        this.summary = {
          total: employees.length,
          active: employees.filter(emp => emp.status === 'active').length,
          inactive: employees.filter(emp => emp.status === 'inactive').length,
          resigned: employees.filter(emp => emp.status === 'resigned').length
        }
      } catch (error) {
        console.error('Load summary error:', error)
      }
    },

    searchEmployees() {
      this.loadEmployees(1)
    },

    resetFilters() {
      this.filters = {
        search: '',
        department: '',
        position: '',
        status: ''
      }
      this.loadEmployees(1)
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.loadEmployees(page)
      }
    },

    createEmployee() {
      this.$router.push({ name: 'hr-employee-create' })
    },

    viewDetail(id) {
      this.$router.push({ name: 'hr-employee-detail', params: { id } })
    },

    editEmployee(id) {
      this.$router.push({ name: 'hr-employee-edit', params: { id } })
    },

    viewTimesheet(id) {
      this.$router.push({ 
        name: 'hr-timesheet', 
        query: { employee_id: id }
      })
    },

    manageUser(id) {
      this.$router.push({ 
        name: 'hr-user-management', 
        query: { employee_id: id }
      })
    },

    canEdit(employee) {
      return ['active', 'inactive'].includes(employee.status)
    },

    canManageUser() {
      // Check if current user has admin/manager role
      return this.$store?.getters?.hasRole(['admin', 'manager']) || true
    },

    getStatusClass(status) {
      const classes = {
        active: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
        inactive: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
        resigned: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
      }
      return classes[status] || 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
    },

    getStatusText(status) {
      const texts = {
        active: 'ทำงานอยู่',
        inactive: 'หยุดงาน',
        resigned: 'ลาออกแล้ว'
      }
      return texts[status] || status
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('th-TH')
    }
  }
}
</script>

<style scoped>
/* Transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Loading animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>