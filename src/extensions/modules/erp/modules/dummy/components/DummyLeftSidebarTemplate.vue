<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Main Layout with Left Sidebar -->
    <div class="flex min-h-[calc(100vh-60px)]">
      <!-- Left Sidebar -->
      <aside class="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0">
        <div class="p-6">
          <!-- Search -->
          <div class="mb-6">
            <input 
              type="text" 
              placeholder="ค้นหาเมนู..." 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <!-- Navigation Menu -->
          <nav class="space-y-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Navigation</h3>
            
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700">
              <i class="fas fa-home mr-3 text-blue-600"></i>
              Dashboard
            </a>
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
              <i class="fas fa-users mr-3 text-gray-400"></i>
              Users
            </a>
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
              <i class="fas fa-shopping-cart mr-3 text-gray-400"></i>
              Orders
            </a>
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
              <i class="fas fa-chart-bar mr-3 text-gray-400"></i>
              Analytics
            </a>
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
              <i class="fas fa-cog mr-3 text-gray-400"></i>
              Settings
            </a>
          </nav>

          <!-- Quick Stats -->
          <div class="mt-8">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</h3>
            <div class="space-y-3">
              <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                <div class="flex items-center justify-between">
                  <span class="text-sm">Today's Sales</span>
                  <i class="fas fa-arrow-up text-xs"></i>
                </div>
                <div class="text-lg font-bold">$12,543</div>
                <div class="text-xs text-blue-100">+15% from yesterday</div>
              </div>
              
              <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
                <div class="flex items-center justify-between">
                  <span class="text-sm">New Orders</span>
                  <i class="fas fa-shopping-bag text-xs"></i>
                </div>
                <div class="text-lg font-bold">48</div>
                <div class="text-xs text-green-100">+5 from last hour</div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="mt-8">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h3>
            <div class="space-y-3">
              <div class="flex items-center text-sm">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                <span class="text-gray-600 text-xs">New user registered</span>
              </div>
              <div class="flex items-center text-sm">
                <div class="w-2 h-2 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
                <span class="text-gray-600 text-xs">Order #1234 completed</span>
              </div>
              <div class="flex items-center text-sm">
                <div class="w-2 h-2 bg-yellow-400 rounded-full mr-2 flex-shrink-0"></div>
                <span class="text-gray-600 text-xs">Payment pending</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 min-w-0">
        <!-- Header Section -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Left Sidebar Template</h1>
                <p class="mt-2 text-gray-600">Template แบบมี sidebar ซ้าย เหมาะสำหรับ application</p>
              </div>
              <div class="flex space-x-3">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center">
                  <i class="fas fa-plus mr-2"></i>
                  เพิ่มใหม่
                </button>
                <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  <i class="fas fa-download mr-2"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 lg:p-8">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center">
                <div class="bg-purple-100 p-3 rounded-lg">
                  <i class="fas fa-users text-purple-600 text-xl"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Users</p>
                  <p class="text-2xl font-bold text-gray-900">2,543</p>
                  <p class="text-sm text-green-600">+12% this month</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center">
                <div class="bg-green-100 p-3 rounded-lg">
                  <i class="fas fa-chart-line text-green-600 text-xl"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">$84,532</p>
                  <p class="text-sm text-green-600">+8% this month</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center">
                <div class="bg-blue-100 p-3 rounded-lg">
                  <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Orders</p>
                  <p class="text-2xl font-bold text-gray-900">1,234</p>
                  <p class="text-sm text-blue-600">+24% this month</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Chart Card -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
              <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 text-center">
                <i class="fas fa-chart-area text-4xl text-blue-500 mb-4"></i>
                <p class="text-gray-600">Chart component จะอยู่ตรงนี้</p>
                <p class="text-sm text-gray-500">เช่น Chart.js, D3.js หรือ library อื่นๆ</p>
              </div>
            </div>

            <!-- Recent Orders -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
              <div class="space-y-4">
                <div v-for="i in 5" :key="i" class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <i class="fas fa-shopping-bag text-gray-500"></i>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Order #{{ 1000 + i }}</p>
                      <p class="text-xs text-gray-500">Customer {{ i }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900">${{ (Math.random() * 1000).toFixed(2) }}</p>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Table -->
          <div class="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Transaction History</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="i in 10" :key="i" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ 1000 + i }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe {{ i }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ (Math.random() * 1000).toFixed(2) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Success
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-10-08</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button class="text-indigo-600 hover:text-indigo-900">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummyLeftSidebarTemplate',
  
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Left Sidebar Template' }
      ]
    }
  }
}
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 1024px) {
  aside {
    display: none;
  }
}
</style>