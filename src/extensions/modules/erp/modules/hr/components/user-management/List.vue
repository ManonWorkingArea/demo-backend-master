<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fas fa-users-cog text-indigo-500"></i>
              User Management - จัดการบัญชีผู้ใช้
            </h1>
            <p class="mt-2 text-gray-600">จัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และความปลอดภัย</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="searchUsers"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-refresh mr-2"></i>
              รีเฟรช
            </button>
            <button 
              @click="createUser"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-user-plus mr-2"></i>
              สร้าง User Account
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
                <span class="text-sm font-medium text-gray-500">User Management</span>
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
        <!-- Total Users -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">ผู้ใช้ทั้งหมด</p>
              <p class="text-3xl font-bold mt-2">{{ summary.total }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-users text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Active Users -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">ใช้งานได้</p>
              <p class="text-3xl font-bold mt-2">{{ summary.active }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-user-check text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Inactive Users -->
        <div class="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-100 text-sm font-medium">ระงับใช้งาน</p>
              <p class="text-3xl font-bold mt-2">{{ summary.inactive }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-user-times text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Logged In Today -->
        <div class="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-cyan-100 text-sm font-medium">เข้าใช้งานวันนี้</p>
              <p class="text-3xl font-bold mt-2">{{ summary.logged_in_today }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full p-3">
              <i class="fas fa-sign-in-alt text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <!-- Search Box -->
          <div class="lg:col-span-2">
            <div class="relative">
              <input 
                type="text" 
                v-model="filters.search"
                placeholder="ค้นหาชื่อผู้ใช้, อีเมล..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Role Filter -->
          <div>
            <select v-model="filters.role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">ทุก Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="supervisor">Supervisor</option>
              <option value="employee">Employee</option>
              <option value="accountant">Accountant</option>
              <option value="sales">Sales</option>
              <option value="purchase">Purchase</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select v-model="filters.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">ทุกสถานะ</option>
              <option value="active">ใช้งานได้</option>
              <option value="inactive">ระงับการใช้งาน</option>
              <option value="locked">ถูกล็อค</option>
            </select>
          </div>

          <!-- Employee Filter -->
          <div>
            <select v-model="filters.employee_id" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">ทุกพนักงาน</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.employee_code }} - {{ emp.full_name }}
              </option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2">
            <button 
              @click="searchUsers"
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

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p class="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="users.length === 0" class="text-center py-12">
          <i class="fas fa-user-slash text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 text-lg">ไม่พบข้อมูลผู้ใช้</p>
        </div>

        <!-- Data Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รูปโปรไฟล์</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้ใช้</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แผนก</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การเข้าใช้งานล่าสุด</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <img 
                    :src="user.avatar || user.employee?.avatar || '/default-avatar.png'" 
                    :alt="user.name"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">{{ user.username }}</div>
                  <div class="text-sm text-gray-500">{{ user.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div v-if="user.department_names && user.department_names.length > 0" class="flex flex-wrap gap-1">
                    <span 
                      v-for="(deptName, index) in user.department_names" 
                      :key="index"
                      class="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                    >
                      {{ deptName }}
                    </span>
                  </div>
                  <span v-else class="text-gray-400">ไม่มีแผนก</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-for="role in user.roles" 
                      :key="role"
                      :class="getRoleBadgeClass(role)"
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ getRoleText(role) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span v-if="user.last_login_at" class="text-gray-900">
                    {{ formatDateTime(user.last_login_at) }}
                  </span>
                  <span v-else class="text-gray-400">ยังไม่เคยเข้าใช้</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(user.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusText(user.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex space-x-2">
                    <button 
                      @click="viewDetail(user.id)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="ดูรายละเอียด"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      v-if="canEdit(user)"
                      @click="editUser(user.id)"
                      class="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="canManagePermissions(user)"
                      @click="managePermissions(user.id)"
                      class="text-purple-600 hover:text-purple-900 transition-colors"
                      title="จัดการสิทธิ์"
                    >
                      <i class="fas fa-key"></i>
                    </button>
                    <button 
                      v-if="canToggleStatus(user)"
                      @click="toggleUserStatus(user)"
                      :class="user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                      class="transition-colors"
                      :title="user.status === 'active' ? 'ระงับใช้งาน' : 'เปิดใช้งาน'"
                    >
                      <i :class="user.status === 'active' ? 'fas fa-user-lock' : 'fas fa-user-check'"></i>
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
  name: 'UserManagementList',
  data() {
    return {
      loading: false,
      users: [],
      employees: [],
      summary: {
        total: 0,
        active: 0,
        inactive: 0,
        logged_in_today: 0
      },
      filters: {
        search: '',
        role: '',
        status: '',
        employee_id: ''
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
    console.log('🎯 [UserList] Component mounted')
    
    // Initialize HRService via ERP_CORE
    if (window.ERP_CORE?.hr) {
      window.ERP_CORE.hr.initialize(this)
    }
    
    await this.loadUsers()
    await this.loadSummary()
  },
  methods: {
    async loadUsers(page = 1) {
      this.loading = true
      try {
        console.log('📤 [UserList] Loading users from ERP database...')
        
        // ✅ ดึงจาก ERP users collection
        const result = await window.ERP_CORE.hr.getERPUsers()
        
        let users = []
        if (result.success) {
          users = result.data || []
          console.log('✅ [UserList] Loaded ERP users from database:', users.length)
        } else {
          console.error('❌ [UserList] Failed to load ERP users:', result.error)
        }

        // Apply local filters (since HRService already filters by parent)
        if (this.filters.search) {
          const search = this.filters.search.toLowerCase()
          users = users.filter(user => 
            user.username?.toLowerCase().includes(search) ||
            user.firstname?.toLowerCase().includes(search) ||
            user.lastname?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)
          )
        }

        if (this.filters.role) {
          users = users.filter(user => user.role === this.filters.role)
        }

        if (this.filters.status) {
          users = users.filter(user => user.status === this.filters.status)
        }

        if (this.filters.employee_id) {
          users = users.filter(user => user.employee_id === this.filters.employee_id)
        }

        // Process user data
        users = users.map(user => ({
          ...user,
          id: user._id || user.id,
          first_name: user.firstname || user.first_name || '',
          last_name: user.lastname || user.last_name || '',
          name: `${user.firstname || user.first_name || ''} ${user.lastname || user.last_name || ''}`.trim(),
          roles: Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []),
          status: user.status || 'active',
          last_login_at: user.last_login || user.updated_at || null
        }))

        console.log('📊 [UserList] Processed users:', users.length)

        // Pagination
        const total = users.length
        const per_page = this.pagination.per_page
        const start = (page - 1) * per_page
        const end = start + per_page

        this.users = users.slice(start, end)
        this.pagination = {
          current_page: page,
          per_page: per_page,
          total: total,
          last_page: Math.ceil(total / per_page)
        }

      } catch (error) {
        console.error('❌ [UserList] Load users error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้: ' + error.message, 'error')
      } finally {
        this.loading = false
      }
    },

    async loadEmployees() {
      try {
        // Use ERP CORE data instead of API call
        if (window.ERP_CORE?.modules?.hr?.getEmployees) {
          this.employees = await window.ERP_CORE.modules.hr.getEmployees()
        } else {
          this.employees = window.ERP_CORE?.data?.employees || []
        }
        
        // Add full_name property
        this.employees = this.employees.map(emp => ({
          ...emp,
          full_name: `${emp.first_name} ${emp.last_name}`
        }))
      } catch (error) {
        console.error('Load employees error:', error)
      }
    },

    async loadSummary() {
      try {
        console.log('📊 [UserList] Loading summary from ERP users...')
        
        // ✅ ใช้ getERPUsers() แทน getUsers()
        const result = await window.ERP_CORE.hr.getERPUsers()
        
        if (result.success) {
          const users = result.data || []
          this.summary = {
            total: users.length,
            active: users.filter(u => u.status === 'active' || !u.status).length,
            inactive: users.filter(u => u.status === 'inactive').length,
            logged_in_today: 0 // TODO: Implement in backend
          }
        } else {
          this.summary = {
            total: 0,
            active: 0,
            inactive: 0,
            logged_in_today: 0
          }
        }
        
        console.log('✅ [UserList] Summary:', this.summary)
      } catch (error) {
        console.error('❌ [UserList] Load summary error:', error)
      }
    },

    async toggleUserStatus(user) {
      try {
        const action = user.status === 'active' ? 'deactivate' : 'activate'
        const actionText = user.status === 'active' ? 'ระงับใช้งาน' : 'เปิดใช้งาน'
        
        const result = await this.$swal?.fire({
          title: `ยืนยัน${actionText}`,
          text: `คุณต้องการ${actionText} User: ${user.username} หรือไม่?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก'
        })

        if (result?.isConfirmed) {
          // Use ERP CORE method
          if (window.ERP_CORE?.modules?.hr?.toggleUserStatus) {
            const response = await window.ERP_CORE.modules.hr.toggleUserStatus(user.id, action)
            
            if (response.success) {
              this.$swal?.fire({
                title: 'สำเร็จ!',
                text: `${actionText} User เรียบร้อยแล้ว`,
                icon: 'success'
              })
              await this.loadUsers(this.pagination.current_page)
              await this.loadSummary()
            }
          }
        }
      } catch (error) {
        console.error('Toggle user status error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถเปลี่ยนสถานะได้', 'error')
      }
    },

    searchUsers() {
      this.loadUsers(1)
    },

    resetFilters() {
      this.filters = {
        search: '',
        role: '',
        status: '',
        employee_id: ''
      }
      this.loadUsers(1)
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.loadUsers(page)
      }
    },

    createUser() {
      this.$router.push({ name: 'hr-user-create' })
    },

    viewDetail(id) {
      this.$router.push({ name: 'hr-user-detail', params: { id } })
    },

    editUser(id) {
      this.$router.push({ name: 'hr-user-edit', params: { id } })
    },

    managePermissions(id) {
      this.$router.push({ name: 'hr-user-permissions', params: { id } })
    },

    canEdit(user) {
      return user.id !== this.getCurrentUserId() // Can't edit own account from here
    },

    canManagePermissions() {
      return true // Admin can manage all permissions
    },

    canToggleStatus(user) {
      return user.id !== this.getCurrentUserId() // Can't disable own account
    },

    getCurrentUserId() {
      return this.$store?.state?.auth?.user?.id || 0
    },

    getRoleBadgeClass(role) {
      const classes = {
        admin: 'bg-red-100 text-red-800',
        manager: 'bg-blue-100 text-blue-800',
        hr: 'bg-cyan-100 text-cyan-800',
        supervisor: 'bg-yellow-100 text-yellow-800',
        employee: 'bg-gray-100 text-gray-800',
        accountant: 'bg-green-100 text-green-800',
        sales: 'bg-purple-100 text-purple-800',
        purchase: 'bg-orange-100 text-orange-800'
      }
      return classes[role] || 'bg-gray-100 text-gray-800'
    },

    getRoleText(role) {
      const texts = {
        admin: 'Admin',
        manager: 'Manager',
        hr: 'HR',
        supervisor: 'Supervisor',
        employee: 'Employee',
        accountant: 'Accountant',
        sales: 'Sales',
        purchase: 'Purchase'
      }
      return texts[role] || role
    },

    getStatusBadgeClass(status) {
      const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-yellow-100 text-yellow-800',
        locked: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    },

    getStatusText(status) {
      const texts = {
        active: 'ใช้งานได้',
        inactive: 'ระงับการใช้งาน',
        locked: 'ถูกล็อค'
      }
      return texts[status] || status
    },

    formatDateTime(datetime) {
      if (!datetime) return '-'
      return new Date(datetime).toLocaleString('th-TH')
    }
  }
}
</script>

<style scoped>
/* Empty - Tailwind CSS handles all styling */
</style>