<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <i class="fas fa-shopping-bag mr-3 text-blue-600"></i>
              การจัดการจัดซื้อ (Purchase Management)
            </h1>
            <p class="mt-2 text-gray-600">จัดการใบขอซื้อ ใบสั่งซื้อ และการรับของ</p>
          </div>
          <div class="grid grid-cols-3 sm:flex sm:flex-row gap-3">
            <button 
              @click="refreshData"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              <span class="hidden sm:inline sm:ml-2">รีเฟรช</span>
            </button>
            <router-link 
              :to="{ name: 'purchase-pr-form-new' }" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-plus"></i>
              <span class="hidden sm:inline sm:ml-2">สร้างใบขอซื้อใหม่</span>
            </router-link>
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
                <span class="text-sm font-medium text-gray-500">Purchase Request (PR)</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <i class="fas fa-file-alt text-white text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">ใบขอซื้อร่าง</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.draft }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <i class="fas fa-check-circle text-white text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">อนุมัติแล้ว</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <i class="fas fa-truck-loading text-white text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">รับของแล้ว</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.received }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
                <i class="fas fa-dollar-sign text-white text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">มูลค่ารวม</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalValue) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาด้วยรหัส หรือรายละเอียด..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @input="debouncedSearch"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              v-model="statusFilter"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกสถานะ</option>
              <option value="draft">ร่าง</option>
              <option value="pending_approval">รออนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="received">รับของแล้ว</option>
              <option value="invoiced">ออกใบแจ้งหนี้แล้ว</option>
            </select>
          </div>

          <!-- Department Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select 
              v-model="departmentFilter"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกแผนก</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ filteredPurchases.length }} รายการ</span>
            <button 
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600">View:</label>
            <button 
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-th-large"></i>
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-if="purchases.length > 0">
        <!-- Bulk Actions -->
        <div v-if="selectedPurchases.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between">
            <span class="text-blue-800 font-medium">
              {{ selectedPurchases.length }} purchase request{{ selectedPurchases.length > 1 ? 's' : '' }} selected
            </span>
            <div class="flex space-x-2">
              <button 
                @click="bulkAction('approve')"
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Approve Selected
              </button>
              <button 
                @click="bulkAction('reject')"
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Reject Selected
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div class="bg-gray-200 h-4 rounded mb-4"></div>
            <div class="bg-gray-200 h-3 rounded mb-2"></div>
            <div class="bg-gray-200 h-3 rounded w-1/2"></div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="request in paginatedPurchases" 
            :key="request.id"
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer border border-gray-200"
            @click="viewPurchaseRequest(request._id)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ request.description || 'ไม่ระบุ' }}</h3>
                <p class="text-sm text-gray-500">#{{ request.id?.slice(-6) || 'N/A' }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  :checked="selectedPurchases.includes(request.id)"
                  @change="togglePurchaseSelection(request.id)"
                  @click.stop
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div class="relative">
                  <button 
                    @click.stop="toggleDropdown(request.id)"
                    class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <div 
                    v-if="dropdownOpen === request.id"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                  >
                    <div class="py-1">
                      <button 
                        @click="editPurchaseRequest(request.id)"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i class="fas fa-edit mr-2"></i>Edit
                      </button>
                      <button 
                        v-if="['draft', 'pending_approval'].includes(request.status)"
                        @click="approvePurchaseRequest(request.id)"
                        class="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                      >
                        <i class="fas fa-check mr-2"></i>Approve
                      </button>
                      <button 
                        v-if="['complete', 'received', 'invoiced'].includes(request.status?.toLowerCase())"
                        @click="resetPurchaseStatus(request.id)"
                        class="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                      >
                        <i class="fas fa-undo mr-2"></i>Reset Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <p class="text-sm text-gray-600">
                <i class="fas fa-user mr-2"></i>
                {{ request.requested_by || 'ไม่ระบุ' }}
              </p>
              <p class="text-sm text-gray-600">
                <i class="fas fa-building mr-2"></i>
                {{ request.department || 'ไม่ระบุ' }}
              </p>
              <p class="text-sm text-gray-600">
                <i class="fas fa-calendar mr-2"></i>
                {{ formatDate(request.created_at) }}
              </p>
              <p class="text-sm text-gray-600">
                <i class="fas fa-list mr-2"></i>
                {{ request.items?.length || 0 }} รายการ
                <span v-if="request.priority !== 'normal'" 
                      :class="getPriorityClass(request.priority)">
                  • {{ getPriorityText(request.priority) }}
                </span>
              </p>
            </div>

            <div class="flex items-center justify-between">
              <span 
                :class="getStatusClass(request.status)"
                class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ getStatusText(request.status) }}
              </span>
              <span class="text-lg font-semibold text-gray-900">
                {{ formatCurrency(request.total_amount || 0) }}
              </span>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    :checked="allPurchasesSelected"
                    @change="toggleAllPurchases"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Request
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="request in paginatedPurchases" 
                :key="request.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="viewPurchaseRequest(request._id)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="selectedPurchases.includes(request.id)"
                    @change="togglePurchaseSelection(request.id)"
                    @click.stop
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ request.description || 'ไม่ระบุ' }}</div>
                    <div class="text-sm text-gray-500">#{{ request.id?.slice(-6) || 'N/A' }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.requested_by || 'ไม่ระบุ' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {{ request.department || 'ไม่ระบุ' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="getStatusClass(request.status)"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getStatusText(request.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(request.total_amount || 0) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(request.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button 
                      @click.stop="editPurchaseRequest(request.id)"
                      class="text-blue-600 hover:text-blue-900"
                      :title="`แก้ไข #${request.id?.slice(-6)}`"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      v-if="['draft', 'pending_approval'].includes(request.status)"
                      @click.stop="approvePurchaseRequest(request.id)"
                      class="text-green-600 hover:text-green-900"
                      :title="`อนุมัติ #${request.id?.slice(-6)}`"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button 
                      v-if="['complete', 'received', 'invoiced'].includes(request.status?.toLowerCase())"
                      @click.stop="resetPurchaseStatus(request.id)"
                      class="text-yellow-600 hover:text-yellow-900"
                      :title="`Reset สถานะ #${request.id?.slice(-6)} กลับเป็น approved`"
                    >
                      <i class="fas fa-undo"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow-sm mt-6 border border-gray-200">
          <div class="text-sm text-gray-500">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredPurchases.length) }} 
            of {{ filteredPurchases.length }} results
          </div>
          
          <div class="flex items-center space-x-2">
            <button 
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium',
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            
            <button 
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State (แสดงเมื่อไม่มีข้อมูล) -->
      <div v-else class="flex flex-col items-center justify-center py-16 px-4">
        <div class="text-center">
          <i class="fas fa-shopping-bag text-6xl text-gray-300 mb-6"></i>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีใบขอซื้อ</h3>
          <p class="text-gray-600 mb-8 max-w-md">เริ่มต้นสร้างใบขอซื้อสินค้าเข้าสู่ระบบ<br>คลิกปุ่มด้านบนเพื่อสร้างใบขอซื้อใหม่</p>
          
          <!-- Purchase Flow Demo Buttons -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 max-w-4xl">
            <button 
              @click="testCreatePR"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-file-plus mr-2"></i>
              1. สร้าง PR (Draft)
            </button>

            <button 
              @click="testCreatePRPending"
              class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-clock mr-2"></i>
              2. สร้าง PR (รออนุมัติ)
            </button>
            
            <button 
              @click="testApprovePO"
              class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-check mr-2"></i>
              2. อนุมัติ Purchase Order
            </button>
            
            <button 
              @click="testReceiveGoods"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-warehouse mr-2"></i>
              3. รับสินค้าเข้าคลัง
            </button>
            
            <button 
              @click="testCreateAPInvoice"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <i class="fas fa-file-invoice-dollar mr-2"></i>
              4. สร้างใบแจ้งหนี้ AP
            </button>
          </div>

          <div class="bg-gray-50 rounded-lg p-6 mt-8 max-w-4xl">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 text-center">Purchase Flow Process:</h4>
            <div class="space-y-3">
              <div class="flex items-center bg-white p-4 rounded-lg border border-gray-200">
                <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mr-4">1</div>
                <span class="text-gray-800">createPurchaseRequest() → สร้างใบขอซื้อสินค้า</span>
              </div>
              <div class="flex items-center bg-white p-4 rounded-lg border border-gray-200">
                <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm mr-4">2</div>
                <span class="text-gray-800">approvePurchaseOrder() → ยืนยัน PO</span>
              </div>
              <div class="flex items-center bg-white p-4 rounded-lg border border-gray-200">
                <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mr-4">3</div>
                <span class="text-gray-800">receiveGoods() → รับของเข้าคลัง (สร้าง inventory_transaction)</span>
              </div>
              <div class="flex items-center bg-white p-4 rounded-lg border border-gray-200">
                <div class="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold text-sm mr-4">4</div>
                <span class="text-gray-800">createAPInvoice() → บันทึกใบแจ้งหนี้ผู้ขาย</span>
              </div>
            </div>
            <p class="text-sm text-gray-500 text-center mt-4 italic">อ้างอิง: TRANSACTION_TYPE.PURCHASE</p>
          </div>
          
          <!-- Debug Info -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 max-w-4xl">
            <h5 class="text-sm font-semibold text-yellow-800 mb-2">🛠️ Debug Tools:</h5>
            <p class="text-sm text-yellow-700">
              <strong>🔄 Reset Status Button:</strong> หลังจาก Purchase Order เปลี่ยนสถานะเป็น "complete", "received", หรือ "invoiced" 
              สามารถใช้ปุ่ม Reset เพื่อเปลี่ยนสถานะกลับเป็น "approved" สำหรับการทดสอบซ้ำ
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ✅ FIXED: window.ERP_CORE ใช้ API driver แล้ว (แก้ที่ core/index.js)
 */
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

// ✅ Import Purchase Flow Functions (ไม่ใช้ createPurchaseRequest แล้ว)
import {
  approvePurchaseOrder,
  receiveGoods,
  createAPInvoice
} from '../../plugins/index.js'

export default {
  name: 'PurchaseManager',
  setup() {
    // ✅ Initialize PurchaseService
    const currentInstance = getCurrentInstance()
    const purchaseService = window.ERP_CORE.purchase
    
    // Initialize service if needed
    if (!purchaseService?.isReady?.()) {
      purchaseService?.initialize?.(currentInstance)
    }
    
    // Router
    const router = useRouter()
    
    // Reactive State
    const purchases = ref([])
    const loading = ref(false)
    const viewMode = ref('grid') // 'grid' or 'list'
    
    // Selection State
    const selectedPurchases = ref([])
    
    // Form States
    const showWorkflowModal = ref(false)
    const workflowAction = ref('')
    const selectedPurchase = ref(null)
    
    // Filter States
    const searchQuery = ref('')
    const statusFilter = ref('')
    const departmentFilter = ref('')
    const searchTimeout = ref(null)
    
    // Pagination States
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    
    // UI States
    const dropdownOpen = ref(null)

    // Computed Stats
    const stats = computed(() => {
      return {
        draft: purchases.value.filter(p => p.status === 'draft').length,
        approved: purchases.value.filter(p => p.status === 'approved').length,
        received: purchases.value.filter(p => p.status === 'received').length,
        totalValue: purchases.value.reduce((sum, p) => sum + (p.total_amount || 0), 0)
      }
    })

    // Computed Properties
    const filteredPurchases = computed(() => {
      let filtered = [...purchases.value]

      // Search filter
      if (searchQuery.value) {
        const searchTerm = searchQuery.value.toLowerCase()
        filtered = filtered.filter(p =>
          (p.description || '').toLowerCase().includes(searchTerm) ||
          (p.request_number || '').toLowerCase().includes(searchTerm) ||
          (p.id || '').toLowerCase().includes(searchTerm)
        )
      }

      // Status filter
      if (statusFilter.value) {
        filtered = filtered.filter(p => p.status === statusFilter.value)
      }

      // Department filter
      if (departmentFilter.value) {
        filtered = filtered.filter(p => p.department === departmentFilter.value)
      }

      return filtered
    })

    // Paginated Purchases
    const paginatedPurchases = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredPurchases.value.slice(start, end)
    })

    // Pagination Computed
    const totalPages = computed(() => {
      return Math.ceil(filteredPurchases.value.length / itemsPerPage.value)
    })

    const visiblePages = computed(() => {
      const current = currentPage.value
      const total = totalPages.value
      const delta = 2
      
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
      }

      if (current - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (current + delta < total - 1) {
        rangeWithDots.push('...', total)
      } else {
        rangeWithDots.push(total)
      }

      return rangeWithDots.filter((v, i, arr) => v !== arr[i - 1])
    })

    // Filter Helpers
    const hasActiveFilters = computed(() => {
      return searchQuery.value || statusFilter.value || departmentFilter.value
    })

    // Selection Helpers
    const allPurchasesSelected = computed(() => {
      return paginatedPurchases.value.length > 0 && 
             paginatedPurchases.value.every(p => selectedPurchases.value.includes(p.id))
    })

    // ✅ Load purchases data ผ่าน PurchaseService
    const loadPurchases = async () => {
      loading.value = true
      try {
        console.log('[PurchaseManager] Loading purchase requests via PurchaseService')
        
        // ✅ ใช้ PurchaseService แทน engine.aggregate  
        const result = await window.ERP_CORE.purchase.getAllPurchaseRequests()
        console.log('[PurchaseManager] Purchase requests result:', result)
        
        if (Array.isArray(result)) {
          purchases.value = result
          console.log('[PurchaseManager] Purchase requests count:', purchases.value.length)
          
          // ✅ Debug แสดงข้อมูล purchase บางตัว
          if (purchases.value.length > 0) {
            console.log('[PurchaseManager] First purchase sample:', purchases.value[0])
            console.log('[PurchaseManager] All purchase IDs:', purchases.value.map(p => p.id || p._id))
          }
        } else {
          console.error('[PurchaseManager] Unexpected aggregate result format:', result)
          purchases.value = []
        }
      } catch (error) {
        console.error('[PurchaseManager] Error loading purchases:', error)
        purchases.value = []
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

    // === PURCHASE FLOW FUNCTIONS ===

    /**
     * สร้างใบขอซื้อสินค้า
     */
    const handleCreatePurchaseRequest = async (requestData) => {
      loading.value = true
      try {
        // ✅ ใช้ PurchaseService แทน createPurchaseRequest จาก plugins
        const result = await purchaseService.createPurchaseRequest(requestData)
        
        if (result.success) {
          await loadPurchases() // Refresh data
          alert(result.message)
        } else {
          alert(`เกิดข้อผิดพลาด: ${result.message}`)
        }
      } catch (error) {
        console.error('Error creating purchase request:', error)
        alert('เกิดข้อผิดพลาดในการสร้างใบขอซื้อ')
      } finally {
        loading.value = false
      }
    }

    /**
     * ยืนยัน Purchase Order
     */
    const handleApprovePurchaseOrder = async (poId) => {
      if (!confirm('ต้องการอนุมัติ Purchase Order นี้หรือไม่?')) return

      loading.value = true
      try {
        const approvalData = {
          approved_by: 'current_user', // Should be from auth context
          notes: 'อนุมัติโดยระบบ'
        }

        const result = await approvePurchaseOrder(poId, approvalData)
        
        if (result.success) {
          await loadPurchases() // Refresh data
          alert(result.message)
        } else {
          alert(`เกิดข้อผิดพลาด: ${result.message}`)
        }
      } catch (error) {
        console.error('Error approving purchase order:', error)
        alert('เกิดข้อผิดพลาดในการอนุมัติ PO')
      } finally {
        loading.value = false
      }
    }

    /**
     * รับของเข้าคลัง
     */
    const handleReceiveGoods = async (poId, receiptData) => {
      loading.value = true
      try {
        const result = await receiveGoods(poId, receiptData)
        
        if (result.success) {
          await loadPurchases() // Refresh data
          alert(result.message)
          console.log('Inventory transactions created:', result.data.inventory_transactions)
        } else {
          alert(`เกิดข้อผิดพลาด: ${result.message}`)
        }
      } catch (error) {
        console.error('Error receiving goods:', error)
        alert('เกิดข้อผิดพลาดในการรับสินค้า')
      } finally {
        loading.value = false
      }
    }

    /**
     * สร้างใบแจ้งหนี้ AP
     */
    const handleCreateAPInvoice = async (poId, invoiceData) => {
      loading.value = true
      try {
        const result = await createAPInvoice(poId, invoiceData)
        
        if (result.success) {
          await loadPurchases() // Refresh data
          alert(result.message)
          console.log('AP Invoice created:', result.data.ap_invoice)
          console.log('Finance record created:', result.data.finance_record)
        } else {
          alert(`เกิดข้อผิดพลาด: ${result.message}`)
        }
      } catch (error) {
        console.error('Error creating AP invoice:', error)
        alert('เกิดข้อผิดพลาดในการสร้างใบแจ้งหนี้')
      } finally {
        loading.value = false
      }
    }

    // Demo functions for testing
    const testCreatePR = () => {
      const sampleData = {
        request_number: `PR-${Date.now().toString().slice(-6)}`,
        description: 'ใบขอซื้อทดสอบ',
        department: 'IT',
        vendor_name: 'บริษัทผู้ขายทดสอบ',
        items: [
          {
            description: 'สินค้าทดสอบ',
            quantity: 10,
            unit: 'ชิ้น',
            unit_price: 100,
            total_amount: 1000
          }
        ],
        total_amount: 1000,
        status: 'draft', // ✅ กำหนดสถานะเป็น draft เพื่อให้ปุ่มแก้ไขแสดง
        workflow_state: 'draft',
        created_by: 'test_user',
        justification: 'สำหรับการทดสอบระบบ',
        priority: 'normal'
      }
      handleCreatePurchaseRequest(sampleData)
    }

    const testCreatePRPending = () => {
      const sampleData = {
        request_number: `PR-${Date.now().toString().slice(-6)}`,
        description: 'ใบขอซื้อรออนุมัติ',
        department: 'HR',
        vendor_name: 'บริษัทผู้ขายรออนุมัติ',
        items: [
          {
            description: 'สินค้ารออนุมัติ',
            quantity: 5,
            unit: 'ชุด',
            unit_price: 2000,
            total_amount: 10000
          }
        ],
        total_amount: 10000,
        status: 'pending_approval', // ✅ สถานะรออนุมัติ
        workflow_state: 'pending_approval',
        created_by: 'test_user_2',
        justification: 'สำหรับการทดสอบการอนุมัติ',
        priority: 'urgent'
      }
      handleCreatePurchaseRequest(sampleData)
    }

    const testApprovePO = () => {
      if (purchases.value.length > 0) {
        const firstPO = purchases.value[0]
        handleApprovePurchaseOrder(firstPO.id)
      } else {
        alert('ไม่มี Purchase Order ให้ทดสอบ')
      }
    }

    const testReceiveGoods = () => {
      if (purchases.value.length > 0) {
        const approvedPO = purchases.value.find(p => p.status === 'approved')
        if (approvedPO) {
          const receiptData = {
            items: [
              {
                product_id: 'PROD001',
                received_quantity: 10,
                unit_price: 100
              }
            ],
            received_by: 'warehouse_user',
            warehouse_location: 'WH001',
            notes: 'รับสินค้าครบถ้วน'
          }
          handleReceiveGoods(approvedPO.id, receiptData)
        } else {
          alert('ไม่มี Purchase Order ที่อนุมัติแล้วให้ทดสอบ')
        }
      } else {
        alert('ไม่มีข้อมูล Purchase Order')
      }
    }

    const testCreateAPInvoice = () => {
      if (purchases.value.length > 0) {
        const receivedPO = purchases.value.find(p => p.status === 'received')
        if (receivedPO) {
          const invoiceData = {
            vendor_invoice_number: 'INV-TEST-001',
            invoice_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            items: [
              {
                product_id: 'PROD001',
                quantity: 10,
                unit_price: 100,
                total: 1000
              }
            ],
            subtotal: 1000,
            tax_amount: 70,
            total_amount: 1070,
            payment_terms: '30 days',
            created_by: 'accounting_user'
          }
          handleCreateAPInvoice(receivedPO.id, invoiceData)
        } else {
          alert('ไม่มี Purchase Order ที่รับสินค้าแล้วให้ทดสอบ')
        }
      } else {
        alert('ไม่มีข้อมูล Purchase Order')
      }
    }

    // Search & Filter Methods
    const debouncedSearch = () => {
      clearTimeout(searchTimeout.value)
      searchTimeout.value = setTimeout(() => {
        currentPage.value = 1
      }, 300)
    }

    const applyFilters = () => {
      currentPage.value = 1
    }

    const clearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      departmentFilter.value = ''
      currentPage.value = 1
    }

    // Selection Methods
    const togglePurchaseSelection = (purchaseId) => {
      const index = selectedPurchases.value.indexOf(purchaseId)
      if (index > -1) {
        selectedPurchases.value.splice(index, 1)
      } else {
        selectedPurchases.value.push(purchaseId)
      }
    }

    const toggleAllPurchases = () => {
      if (allPurchasesSelected.value) {
        // Unselect all purchases on current page
        paginatedPurchases.value.forEach(purchase => {
          const index = selectedPurchases.value.indexOf(purchase.id)
          if (index > -1) {
            selectedPurchases.value.splice(index, 1)
          }
        })
      } else {
        // Select all purchases on current page
        paginatedPurchases.value.forEach(purchase => {
          if (!selectedPurchases.value.includes(purchase.id)) {
            selectedPurchases.value.push(purchase.id)
          }
        })
      }
    }

    // Pagination Methods
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    // Bulk Actions
    const bulkAction = (action) => {
      if (selectedPurchases.value.length === 0) return

      switch (action) {
        case 'approve':
          console.log('Bulk approve:', selectedPurchases.value)
          if (confirm(`คุณแน่ใจหรือไม่ที่จะอนุมัติ ${selectedPurchases.value.length} ใบขอซื้อ?`)) {
            // Implement bulk approval logic
            alert('Bulk approval feature - coming soon!')
          }
          break
        case 'reject':
          console.log('Bulk reject:', selectedPurchases.value)
          if (confirm(`คุณแน่ใจหรือไม่ที่จะปฏิเสธ ${selectedPurchases.value.length} ใบขอซื้อ?`)) {
            // Implement bulk rejection logic
            alert('Bulk rejection feature - coming soon!')
          }
          break
      }
    }

    // UI Methods
    const toggleDropdown = (purchaseId) => {
      dropdownOpen.value = dropdownOpen.value === purchaseId ? null : purchaseId
    }



    // Navigation functions
    const openCreateForm = () => {
      router.push('/purchase/purchase-request/new')
    }

    const editPurchaseRequest = (id) => {
      router.push({ 
        name: 'purchase-pr-form-edit', 
        params: { id } 
      })
    }

    // Refresh data
    const refreshData = () => {
      loadPurchases()
    }

    // Table Helper Functions
    const getStatusClass = (status) => {
      const statusClasses = {
        'draft': 'status-draft',
        'pending_approval': 'status-pending',
        'approved': 'status-approved',
        'received': 'status-received',
        'invoiced': 'status-invoiced'
      }
      return statusClasses[status] || 'status-default'
    }

    const getStatusText = (status) => {
      const statusTexts = {
        'draft': 'ร่าง',
        'pending_approval': 'รออนุมัติ',
        'approved': 'อนุมัติแล้ว',
        'received': 'รับของแล้ว',
        'invoiced': 'ออกใบแจ้งหนี้แล้ว',
        'complete': 'เสร็จสิ้น'
      }
      return statusTexts[status] || status
    }

    const getPriorityClass = (priority) => {
      const priorityClasses = {
        'low': 'priority-low',
        'normal': 'priority-normal',
        'high': 'priority-high',
        'urgent': 'priority-urgent'
      }
      return priorityClasses[priority] || 'priority-normal'
    }

    const getPriorityText = (priority) => {
      const priorityTexts = {
        'low': 'ต่ำ',
        'normal': 'ปกติ',
        'high': 'สูง',
        'urgent': 'เร่งด่วน'
      }
      return priorityTexts[priority] || priority
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'ไม่ระบุ'
      const date = new Date(dateString)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Table Actions
    const viewPurchaseRequest = (id) => {
      router.push({ 
        name: 'purchase-pr-detail', 
        params: { id } 
      })
    }

    const approvePurchaseRequest = async (id) => {
      if (!confirm('ต้องการอนุมัติใบขอซื้อนี้หรือไม่?')) return
      await handleApprovePurchaseOrder(id)
    }

    /**
     * Reset Purchase Order Status (Debug Function)
     * เปลี่ยนสถานะ PO กลับเป็น approved เพื่อทดสอบซ้ำ
     */
    const resetPurchaseStatus = async (id) => {
      const purchase = purchases.value.find(p => p.id === id)
      if (!purchase) {
        alert('ไม่พบข้อมูล Purchase Order')
        return
      }

      const confirmed = confirm(`ต้องการเปลี่ยนสถานะ Purchase Order "${purchase.request_number || purchase.id}" กลับเป็น "approved" หรือไม่?\n\nการกระทำนี้เป็นเพื่อการทดสอบเท่านั้น`)
      
      if (!confirmed) return

      loading.value = true
      try {
        console.log('🔄 Resetting Purchase Order status to approved for testing...')
        
        // ✅ อัปเดตสถานะ Purchase Order กลับเป็น approved ผ่าน PurchaseService
        const updateData = {
          status: 'approved',
          workflow_state: 'approved',
          updated_date: new Date().toISOString(),
          updated_by: 'debug_user',
          notes: `[DEBUG] Status reset to approved for testing - ${new Date().toLocaleString()}`
        }

        // ✅ ใช้ PurchaseService แทน engine.update
        const result = await window.ERP_CORE.purchase.updatePurchaseRequest(id, updateData)

        if (result.success) {
          alert(`✅ เปลี่ยนสถานะ Purchase Order เป็น "approved" เรียบร้อยแล้ว!\nสามารถทดสอบรับเข้าสินค้าได้อีกครั้ง`)
          
          // Refresh data
          await loadPurchases()
        } else {
          throw new Error(result.error || 'Failed to reset purchase status')
        }

      } catch (error) {
        console.error('❌ Error resetting purchase status:', error)
        alert(`เกิดข้อผิดพลาดในการเปลี่ยนสถานะ Purchase Order: ${error.message}`)
      } finally {
        loading.value = false
      }
    }

    // Initialize
    onMounted(() => {
      loadPurchases()
    })

    return {
      // Data
      purchases,
      loading,
      viewMode,
      
      // Form states
      showWorkflowModal,
      workflowAction,
      selectedPurchase,
      
      // Selection states
      selectedPurchases,
      
      // Filter states
      searchQuery,
      statusFilter,
      departmentFilter,
      
      // Pagination states
      currentPage,
      itemsPerPage,
      
      // UI states
      dropdownOpen,
      
      // Computed
      stats,
      filteredPurchases,
      paginatedPurchases,
      totalPages,
      visiblePages,
      hasActiveFilters,
      allPurchasesSelected,
      
      // Methods
      formatCurrency,
      refreshData,
      
      // Search & Filter Methods
      debouncedSearch,
      applyFilters,
      clearFilters,
      
      // Selection Methods
      togglePurchaseSelection,
      toggleAllPurchases,
      
      // Pagination Methods
      goToPage,
      
      // Bulk Actions
      bulkAction,
      
      // UI Methods
      toggleDropdown,
      
      // Navigation functions
      openCreateForm,
      editPurchaseRequest,
      
      // Table functions
      getStatusClass,
      getStatusText,
      getPriorityClass,
      getPriorityText,
      formatDate,
      viewPurchaseRequest,
      approvePurchaseRequest,
      resetPurchaseStatus,
      
      // Purchase Flow Functions
      handleCreatePurchaseRequest,
      handleApprovePurchaseOrder,
      handleReceiveGoods,
      handleCreateAPInvoice,
      
      // Demo Functions
      testCreatePR,
      testCreatePRPending,
      testApprovePO,
      testReceiveGoods,
      testCreateAPInvoice
    }
  }
}
</script>

<style scoped>
/* Loading animation */
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

/* Status badge styles */
.bg-green-100 { background-color: #dcfce7; }
.text-green-800 { color: #166534; }
.bg-yellow-100 { background-color: #fef3c7; }
.text-yellow-800 { color: #92400e; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-800 { color: #1f2937; }
.bg-blue-100 { background-color: #dbeafe; }
.text-blue-800 { color: #1e40af; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-800 { color: #991b1b; }
.bg-purple-100 { background-color: #f3e8ff; }
.text-purple-800 { color: #6b21a8; }

/* Loading spinner animation */
.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


</style>