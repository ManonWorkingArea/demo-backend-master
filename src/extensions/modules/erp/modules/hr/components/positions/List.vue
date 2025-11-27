<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-briefcase text-indigo-500"></i>
              Position Management - จัดการตำแหน่งงาน
            </h1>
            <p class="mt-2 text-gray-600">จัดการตำแหน่งงานและโครงสร้างอัตรากำลัง</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="loadPositions"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-refresh mr-2"></i>
              รีเฟรช
            </button>
            <button 
              @click="createPosition"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              เพิ่มตำแหน่งใหม่
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
                <span class="text-sm font-medium text-gray-500">Positions</span>
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
        <!-- Total Positions -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">ตำแหน่งทั้งหมด</p>
              <p class="text-3xl font-bold mt-2">{{ summary.total }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-briefcase text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Active Positions -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">ตำแหน่งที่เปิดรับ</p>
              <p class="text-3xl font-bold mt-2">{{ summary.active }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-check-circle text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Vacant Positions -->
        <div class="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm font-medium">ตำแหน่งว่าง</p>
              <p class="text-3xl font-bold mt-2">{{ summary.vacant }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-user-plus text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Filled Positions -->
        <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium">ตำแหน่งที่มีคน</p>
              <p class="text-3xl font-bold mt-2">{{ summary.filled }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-user-check text-2xl"></i>
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
                placeholder="ค้นหารหัส หรือชื่อตำแหน่ง..."
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
              @click="searchPositions"
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

      <!-- Positions Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="positions.length === 0" class="text-center py-12">
          <i class="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 text-lg">ไม่พบข้อมูลตำแหน่งงาน</p>
          <button 
            @click="createPosition"
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <i class="fas fa-plus mr-2"></i>
            เพิ่มตำแหน่งใหม่
          </button>
        </div>

        <!-- Data Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสตำแหน่ง</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อตำแหน่ง</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระดับ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="position in positions" :key="position.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ position.code }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ position.name }}</div>
                  <div v-if="position.description" class="text-sm text-gray-500">{{ position.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="position.level" :class="getLevelBadgeClass(position.level)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getLevelText(position.level) }}
                  </span>
                  <span v-else class="text-sm text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(position.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusText(position.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex space-x-2">
                    <button 
                      @click="viewDetail(position.id)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="ดูรายละเอียด"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      @click="editPosition(position.id)"
                      class="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="deletePosition(position.id)"
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
      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-700">
          แสดง <span class="font-medium">{{ ((pagination.current_page - 1) * pagination.per_page) + 1 }}</span> - 
          <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span> 
          จาก <span class="font-medium">{{ pagination.total }}</span> รายการ
        </div>
        <nav class="flex space-x-2">
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
            :key="page"
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
  name: 'PositionsList',
  data() {
    return {
      loading: false,
      positions: [],
      summary: {
        total: 0,
        active: 0,
        vacant: 0,
        filled: 0
      },
      filters: {
        search: '',
        status: '',
        level: ''
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
    // Initialize PositionService via ERP_CORE
    if (window.ERP_CORE?.positions) {
      window.ERP_CORE.positions.initialize(this)
    }
    
    await this.loadPositions()
    await this.loadSummary()
  },
  methods: {
    async loadPositions(page = 1) {
      this.loading = true
      try {
        // Use ERP_CORE.positions
        const positions = await window.ERP_CORE.positions.getPositions({
          status: this.filters.status,
          search: this.filters.search,
          level: this.filters.level
        })

        // ตรวจสอบว่าได้ array กลับมา
        if (!Array.isArray(positions)) {
          console.error('getPositions did not return an array:', positions)
          this.positions = []
          this.pagination.total = 0
          this.pagination.last_page = 1
          this.pagination.current_page = 1
          return
        }

        // Pagination
        this.pagination.total = positions.length
        this.pagination.last_page = Math.max(1, Math.ceil(positions.length / this.pagination.per_page))
        this.pagination.current_page = Math.min(page, this.pagination.last_page)

        const start = (this.pagination.current_page - 1) * this.pagination.per_page
        const end = start + this.pagination.per_page
        this.positions = positions.slice(start, end)
        
        console.log('✅ Loaded positions:', this.positions.length, 'Page:', this.pagination.current_page)
      } catch (error) {
        console.error('Load positions error:', error)
        this.positions = []
        this.pagination.total = 0
        this.pagination.last_page = 1
        this.pagination.current_page = 1
      } finally {
        this.loading = false
      }
    },

    async loadSummary() {
      try {
        const positions = await window.ERP_CORE.positions.getPositions()

        this.summary = {
          total: positions.length,
          active: positions.filter(pos => pos.status === 'active').length,
          vacant: positions.filter(pos => {
            const empCount = pos.employees_count || 0
            const maxCount = pos.max_headcount || 0
            return maxCount > 0 && empCount < maxCount
          }).length,
          filled: positions.filter(pos => (pos.employees_count || 0) > 0).length
        }
      } catch (error) {
        console.error('Load summary error:', error)
      }
    },

    searchPositions() {
      this.loadPositions(1)
    },

    resetFilters() {
      this.filters = {
        search: '',
        department_id: '',
        status: ''
      }
      this.loadPositions(1)
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.loadPositions(page)
      }
    },

    createPosition() {
      this.$router.push({ name: 'hr-position-create' })
    },

    viewDetail(id) {
      this.$router.push({ name: 'hr-position-detail', params: { id } })
    },

    editPosition(id) {
      this.$router.push({ name: 'hr-position-edit', params: { id } })
    },

    async deletePosition(id) {
      try {
        const result = await this.$swal?.fire({
          title: 'ยืนยันการลบ',
          text: 'คุณต้องการลบตำแหน่งนี้หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#dc3545'
        })

        if (result?.isConfirmed) {
          await window.ERP_CORE.positions.deletePosition(id)
          
          this.$swal?.fire({
            title: 'สำเร็จ!',
            text: 'ลบตำแหน่งเรียบร้อยแล้ว',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          })
          
          await this.loadPositions(this.pagination.current_page)
          await this.loadSummary()
        }
      } catch (error) {
        console.error('Delete position error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบตำแหน่งได้', 'error')
      }
    },

    getLevelBadgeClass(level) {
      const classes = {
        executive: 'bg-purple-100 text-purple-800',
        manager: 'bg-blue-100 text-blue-800',
        supervisor: 'bg-cyan-100 text-cyan-800',
        senior: 'bg-green-100 text-green-800',
        junior: 'bg-yellow-100 text-yellow-800',
        staff: 'bg-gray-100 text-gray-800'
      }
      return classes[level] || 'bg-gray-100 text-gray-800'
    },

    getLevelText(level) {
      const texts = {
        executive: 'Executive',
        manager: 'Manager',
        supervisor: 'Supervisor',
        senior: 'Senior',
        junior: 'Junior',
        staff: 'Staff'
      }
      return texts[level] || level
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
    },

    formatNumber(number) {
      return new Intl.NumberFormat('th-TH').format(number)
    }
  }
}
</script>

<style scoped>
/* Empty - Tailwind CSS handles all styling */
</style>