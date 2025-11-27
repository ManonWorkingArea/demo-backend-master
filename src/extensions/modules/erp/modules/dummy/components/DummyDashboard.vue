<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Dummy Module Dashboard</h1>
            <p class="mt-2 text-gray-600">Template dashboard สำหรับโมดูลใหม่</p>
          </div>
          <div class="grid grid-cols-3 sm:flex sm:flex-row gap-3">
            <router-link 
              to="/dummy/items/new"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-plus mr-2"></i>
              เพิ่มใหม่
            </router-link>
            <button 
              @click="exportData"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-download mr-2"></i>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Items Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-blue-100 p-3 rounded-lg">
              <i class="fas fa-cubes text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalItems }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-green-500 text-sm font-medium">+12%</span>
            <span class="text-gray-600 text-sm ml-1">from last month</span>
          </div>
        </div>

        <!-- Active Items Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeItems }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-green-500 text-sm font-medium">+8%</span>
            <span class="text-gray-600 text-sm ml-1">from last month</span>
          </div>
        </div>

        <!-- Pending Items Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-yellow-100 p-3 rounded-lg">
              <i class="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pendingItems }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-yellow-500 text-sm font-medium">-2%</span>
            <span class="text-gray-600 text-sm ml-1">from last month</span>
          </div>
        </div>

        <!-- Revenue Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-purple-100 p-3 rounded-lg">
              <i class="fas fa-chart-line text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Value</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalValue) }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-green-500 text-sm font-medium">+15%</span>
            <span class="text-gray-600 text-sm ml-1">from last month</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Items -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Recent Items</h3>
                <router-link 
                  to="/dummy/items" 
                  class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <div v-if="loading" class="space-y-4">
                <div v-for="i in 5" :key="i" class="animate-pulse">
                  <div class="flex items-center space-x-4">
                    <div class="bg-gray-200 h-12 w-12 rounded-lg"></div>
                    <div class="flex-1">
                      <div class="bg-gray-200 h-4 rounded mb-2"></div>
                      <div class="bg-gray-200 h-3 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="space-y-4">
                <div 
                  v-for="item in recentItems" 
                  :key="item.id"
                  class="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  @click="goToItem(item.id)"
                >
                  <div class="bg-blue-100 p-3 rounded-lg">
                    <i class="fas fa-cube text-blue-600"></i>
                  </div>
                  <div class="ml-4 flex-1">
                    <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                    <p class="text-sm text-gray-500">{{ item.code }} • {{ item.type }}</p>
                  </div>
                  <div class="text-right">
                    <span 
                      :class="getStatusClass(item.status)"
                      class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ item.status }}
                    </span>
                    <p class="text-sm text-gray-500 mt-1">{{ formatDate(item.updated_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions & Info -->
        <div class="space-y-8">
          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <button 
                @click="quickAction('add')"
                class="w-full flex items-center p-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div class="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg">
                  <i class="fas fa-plus text-blue-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">Add New Item</p>
                  <p class="text-sm text-gray-500">Create a new item</p>
                </div>
              </button>
              
              <button 
                @click="quickAction('import')"
                class="w-full flex items-center p-3 text-left hover:bg-green-50 rounded-lg transition-colors group"
              >
                <div class="bg-green-100 group-hover:bg-green-200 p-2 rounded-lg">
                  <i class="fas fa-upload text-green-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">Import Data</p>
                  <p class="text-sm text-gray-500">Import from CSV/Excel</p>
                </div>
              </button>
              
              <button 
                @click="quickAction('export')"
                class="w-full flex items-center p-3 text-left hover:bg-purple-50 rounded-lg transition-colors group"
              >
                <div class="bg-purple-100 group-hover:bg-purple-200 p-2 rounded-lg">
                  <i class="fas fa-download text-purple-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">Export Report</p>
                  <p class="text-sm text-gray-500">Download data</p>
                </div>
              </button>
              
              <router-link 
                to="/dummy/templates"
                class="w-full flex items-center p-3 text-left hover:bg-indigo-50 rounded-lg transition-colors group"
              >
                <div class="bg-indigo-100 group-hover:bg-indigo-200 p-2 rounded-lg">
                  <i class="fas fa-th-large text-indigo-600"></i>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">Browse Templates</p>
                  <p class="text-sm text-gray-500">View layout templates</p>
                </div>
              </router-link>
            </div>
          </div>

          <!-- Module Info -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h3 class="text-lg font-semibold mb-2">Module Information</h3>
            <div class="space-y-2 text-sm opacity-90">
              <p><i class="fas fa-info-circle mr-2"></i>Version: 1.0.0</p>
              <p><i class="fas fa-calendar mr-2"></i>Last Updated: {{ formatDate(new Date()) }}</p>
              <p><i class="fas fa-user mr-2"></i>Created by: System Admin</p>
            </div>
            <button 
              @click="showSettings"
              class="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-medium transition-all"
            >
              <i class="fas fa-cog mr-2"></i>
              Module Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MODULE_UTILS } from '../plugins/index.js'
import { ErpBreadcrumb } from '../../../ui-kit/index.js'

export default {
  name: 'DummyDashboard',
  
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      loading: true,
      stats: {
        totalItems: 0,
        activeItems: 0,
        pendingItems: 0,
        totalValue: 0
      },
      recentItems: [],
      breadcrumbNav: [
        {
          text: 'Dummy Module',
          to: '/dummy',
          icon: 'fas fa-cube'
        },
        {
          text: 'Dashboard',
          active: true
        }
      ]
    }
  },

  async mounted() {
    await this.loadDashboardData()
  },

  methods: {
    async loadDashboardData() {
      try {
        this.loading = true
        
        // Simulate API calls - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - replace with real API responses
        this.stats = {
          totalItems: 1247,
          activeItems: 1156,
          pendingItems: 91,
          totalValue: 2547830.50
        }

        this.recentItems = [
          {
            id: 1,
            name: 'Sample Item 1',
            code: 'SI-001',
            type: 'Type A',
            status: 'active',
            updated_at: new Date()
          },
          {
            id: 2,
            name: 'Sample Item 2',
            code: 'SI-002',
            type: 'Type B',
            status: 'pending',
            updated_at: new Date()
          },
          {
            id: 3,
            name: 'Sample Item 3',
            code: 'SI-003',
            type: 'Type A',
            status: 'active',
            updated_at: new Date()
          }
        ]
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        this.loading = false
      }
    },

    formatCurrency(amount) {
      return MODULE_UTILS.formatCurrency(amount)
    },

    formatDate(date) {
      return MODULE_UTILS.formatDate(date)
    },

    getStatusClass(status) {
      const statusClasses = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800',
        draft: 'bg-blue-100 text-blue-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    },

    goToItem(id) {
      this.$router.push(`/dummy/items/${id}`)
    },

    quickAction(action) {
      switch (action) {
        case 'add':
          this.$router.push('/dummy/items/new')
          break
        case 'import':
          // Handle import action
          console.log('Import action')
          break
        case 'export':
          // Handle export action
          console.log('Export action')
          break
      }
    },

    showSettings() {
      this.$router.push('/dummy/settings')
    },

    exportData() {
      // Handle export functionality
      console.log('Exporting data...')
      // You can implement actual export logic here
      alert('Export functionality - implement as needed')
    }
  }
}
</script>

<style scoped>
/* Custom animations */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Hover animations */
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

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>