<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-sitemap text-indigo-500"></i>
              Department Management - จัดการแผนก/ฝ่าย
            </h1>
            <p class="mt-2 text-gray-600">จัดการข้อมูลแผนกและฝ่ายในองค์กร</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="loadDepartments"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-refresh mr-2"></i>
              รีเฟรช
            </button>
            <button 
              @click="createDepartment"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              เพิ่มแผนกใหม่
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
                <span class="text-sm font-medium text-gray-500">Departments</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Departments -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">แผนกทั้งหมด</p>
              <p class="text-3xl font-bold mt-2">{{ summary.total }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-sitemap text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Active Departments -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">แผนกที่ใช้งาน</p>
              <p class="text-3xl font-bold mt-2">{{ summary.active }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-check-circle text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Inactive Departments -->
        <div class="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm font-medium">แผนกที่ระงับ</p>
              <p class="text-3xl font-bold mt-2">{{ summary.inactive }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-times-circle text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Employees -->
        <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium">พนักงานทั้งหมด</p>
              <p class="text-3xl font-bold mt-2">{{ summary.employees_count }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-users text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search Box -->
          <div class="lg:col-span-2">
            <div class="relative">
              <input 
                type="text" 
                v-model="filters.search"
                placeholder="ค้นหารหัส หรือชื่อแผนก..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <select v-model="filters.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">ทุกสถานะ</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ระงับการใช้งาน</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2">
            <button 
              @click="searchDepartments"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-search"></i>
            </button>
            <button 
              @click="resetFilters"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Departments Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="departments.length === 0" class="text-center py-12">
          <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 text-lg">ไม่พบข้อมูลแผนก</p>
          <button 
            @click="createDepartment"
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            เพิ่มแผนกใหม่
          </button>
        </div>

        <!-- Data Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสแผนก</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อแผนก</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หัวหน้าแผนก</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนพนักงาน</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="dept in departments" :key="dept.id || dept._id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ dept.code || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ dept.name || '-' }}</div>
                  <div v-if="dept.description" class="text-sm text-gray-500">{{ dept.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="dept.manager && dept.manager.full_name" class="flex items-center">
                    <img 
                      v-if="dept.manager.avatar" 
                      :src="dept.manager.avatar" 
                      :alt="dept.manager.full_name"
                      class="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <div class="text-sm text-gray-900">{{ dept.manager.full_name }}</div>
                  </div>
                  <span v-else class="text-sm text-gray-400">ไม่มีหัวหน้าแผนก</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <i class="fas fa-users text-gray-400 mr-2"></i>
                    <span class="text-sm text-gray-900">{{ dept.employees_count || 0 }} คน</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(dept.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusText(dept.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex space-x-2">
                    <button 
                      @click="viewDetail(dept.id || dept._id)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="ดูรายละเอียด"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      @click="editDepartment(dept.id || dept._id)"
                      class="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="viewEmployees(dept.id || dept._id)"
                      class="text-green-600 hover:text-green-900 transition-colors"
                      title="ดูพนักงาน"
                    >
                      <i class="fas fa-users"></i>
                    </button>
                    <button 
                      @click="deleteDepartment(dept.id || dept._id)"
                      class="text-red-600 hover:text-red-900 transition-colors"
                      title="ลบ"
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

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-700">
          แสดง <span class="font-medium">{{ ((pagination.current_page - 1) * pagination.per_page) + 1 }}</span> - 
          <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span> 
          จาก <span class="font-medium">{{ pagination.total }}</span> รายการ
        </div>
        <nav v-if="pagination.last_page > 1" class="flex space-x-2">
          <button
            @click="goToPage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            :class="pagination.current_page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            ก่อนหน้า
          </button>
          <button
            v-for="page in visiblePages"
            :key="'page-' + page"
            @click="goToPage(page)"
            :class="page === pagination.current_page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            class="px-4 py-2 rounded-lg transition-colors"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            :class="pagination.current_page >= pagination.last_page ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            ถัดไป
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DepartmentList',
  data() {
    return {
      loading: false,
      departments: [],
      summary: {
        total: 0,
        active: 0,
        inactive: 0,
        employees_count: 0
      },
      filters: {
        search: '',
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
      const current = this.pagination.current_page || 1
      const last = this.pagination.last_page || 1
      
      // ป้องกันค่าผิดปกติ
      if (last < 1) return [1]
      
      for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
        pages.push(i)
      }
      
      return pages.length > 0 ? pages : [1]
    }
  },
  async mounted() {
    // Initialize DepartmentService via ERP_CORE
    if (window.ERP_CORE?.departments) {
      window.ERP_CORE.departments.initialize(this)
    }
    
    await this.loadDepartments()
    await this.loadSummary()
  },
  methods: {
    async loadDepartments(page = 1) {
      this.loading = true
      try {
        // Use ERP_CORE.departments
        const departments = await window.ERP_CORE.departments.getDepartments({
          status: this.filters.status,
          search: this.filters.search
        })

        // ตรวจสอบว่าได้ array กลับมา
        if (!Array.isArray(departments)) {
          console.error('getDepartments did not return an array:', departments)
          this.departments = []
          this.pagination.total = 0
          this.pagination.last_page = 1
          this.pagination.current_page = 1
          return
        }

        // Pagination
        this.pagination.total = departments.length
        this.pagination.last_page = Math.max(1, Math.ceil(departments.length / this.pagination.per_page))
        this.pagination.current_page = Math.min(page, this.pagination.last_page)

        const start = (this.pagination.current_page - 1) * this.pagination.per_page
        const end = start + this.pagination.per_page
        this.departments = departments.slice(start, end)
        
        console.log('✅ Loaded departments:', this.departments.length, 'Page:', this.pagination.current_page)
      } catch (error) {
        console.error('Load departments error:', error)
        this.departments = []
        this.pagination.total = 0
        this.pagination.last_page = 1
        this.pagination.current_page = 1
      } finally {
        this.loading = false
      }
    },

    async loadSummary() {
      try {
        const departments = await window.ERP_CORE.departments.getDepartments()

        this.summary = {
          total: departments.length,
          active: departments.filter(dept => dept.status === 'active').length,
          inactive: departments.filter(dept => dept.status === 'inactive').length,
          employees_count: departments.reduce((sum, dept) => sum + (dept.employees_count || 0), 0)
        }
      } catch (error) {
        console.error('Load summary error:', error)
      }
    },

    searchDepartments() {
      this.loadDepartments(1)
    },

    resetFilters() {
      this.filters = {
        search: '',
        status: ''
      }
      this.loadDepartments(1)
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.loadDepartments(page)
      }
    },

    createDepartment() {
      this.$router.push({ name: 'hr-department-create' })
    },

    viewDetail(id) {
      this.$router.push({ name: 'hr-department-detail', params: { id } })
    },

    editDepartment(id) {
      this.$router.push({ name: 'hr-department-edit', params: { id } })
    },

    viewEmployees(id) {
      this.$router.push({ name: 'hr-employees', query: { department_id: id } })
    },

    async deleteDepartment(id) {
      try {
        const result = await this.$swal?.fire({
          title: 'ยืนยันการลบ',
          text: 'คุณต้องการลบแผนกนี้หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#dc3545'
        })

        if (result?.isConfirmed) {
          // Use ERP_CORE.departments
          const response = await window.ERP_CORE.departments.deleteDepartment(id)
          
          if (response.success) {
            this.$swal?.fire({
              title: 'สำเร็จ!',
              text: 'ลบแผนกเรียบร้อยแล้ว',
              icon: 'success'
            })
            await this.loadDepartments(this.pagination.current_page)
            await this.loadSummary()
          }
        }
      } catch (error) {
        console.error('Delete department error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบแผนกได้', 'error')
      }
    },

    getStatusBadgeClass(status) {
      const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    },

    getStatusText(status) {
      const texts = {
        active: 'ใช้งาน',
        inactive: 'ระงับการใช้งาน'
      }
      return texts[status] || status
    }
  }
}
</script>

<style scoped>
/* Empty - Tailwind CSS handles all styling */
</style>