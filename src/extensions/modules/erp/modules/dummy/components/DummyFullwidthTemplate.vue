<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="w-full px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Fullwidth Template</h1>
            <p class="mt-2 text-gray-600">Template แบบเต็มความกว้างหน้าจอ เหมาะสำหรับตาราง Dashboard</p>
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

    <!-- Main Content - Fullwidth -->
    <div class="w-full px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-blue-100 p-3 rounded-lg">
              <i class="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-gray-900">12,543</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="fas fa-chart-line text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Revenue</p>
              <p class="text-2xl font-bold text-gray-900">$84,532</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-purple-100 p-3 rounded-lg">
              <i class="fas fa-shopping-cart text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Orders</p>
              <p class="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-yellow-100 p-3 rounded-lg">
              <i class="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending</p>
              <p class="text-2xl font-bold text-gray-900">56</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-red-100 p-3 rounded-lg">
              <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Issues</p>
              <p class="text-2xl font-bold text-gray-900">7</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="bg-indigo-100 p-3 rounded-lg">
              <i class="fas fa-star text-indigo-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Rating</p>
              <p class="text-2xl font-bold text-gray-900">4.9</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Large Data Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">ตารางข้อมูลแบบเต็มความกว้าง</h2>
            <div class="flex space-x-3">
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <select class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>ทั้งหมด</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" class="rounded">
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="i in 25" :key="i" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" class="rounded">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ 1000 + i }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe {{ i }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">john{{ i }}@example.com</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Engineering</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Developer</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="i % 3 === 0 ? 'bg-green-100 text-green-800' : i % 2 === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'">
                    {{ i % 3 === 0 ? 'Active' : i % 2 === 0 ? 'Pending' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-10-08</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-09-15</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex space-x-2">
                    <button class="text-indigo-600 hover:text-indigo-900 text-xs">Edit</button>
                    <button class="text-red-600 hover:text-red-900 text-xs">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              แสดง <strong>1-25</strong> จาก <strong>500</strong> รายการ
            </div>
            <div class="flex space-x-2">
              <button class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Previous</button>
              <button class="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
              <button class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">2</button>
              <button class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">3</button>
              <button class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummyFullwidthTemplate',
  
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Fullwidth Template' }
      ]
    }
  }
}
</script>

<style scoped>
/* Custom styles for fullwidth layout */
.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>