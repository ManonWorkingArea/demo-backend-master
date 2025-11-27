<template>
  <div class="bg-gray-50 flex package-management-container h-full">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 h-[65px]">
          <h2 class="text-lg font-semibold text-gray-900">Contract</h2>
          <button 
            @click="handleAssignPackage"
            :disabled="hasActiveContract"
            :class="[
              'p-2 rounded-lg transition-colors duration-200',
              hasActiveContract 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:bg-blue-50'
            ]"
            :title="hasActiveContract ? 'มี Contract อยู่แล้ว ไม่สามารถ Assign เพิ่มได้' : 'Assign Package'"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="text-gray-600 text-xs font-medium">ทั้งหมด</div>
              <div class="text-gray-900 text-lg font-bold">{{ contractStats.totalContracts || 0 }}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="text-gray-600 text-xs font-medium">เปิดใช้งาน</div>
              <div class="text-gray-900 text-lg font-bold">{{ contractStats.activeContracts || 0 }}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="text-gray-600 text-xs font-medium">รายได้รวม</div>
              <div class="text-gray-900 text-sm font-bold">฿{{ (contractStats.totalRevenue || 0).toLocaleString() }}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="text-gray-600 text-xs font-medium">Package</div>
              <div class="text-gray-900 text-lg font-bold">{{ availablePackages.length || 0 }}</div>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="space-y-1">
            <button
              v-for="item in sidebarMenuItems"
              :key="item.value"
              @click="selectFilter(item.value)"
              :class="[
                'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                activeFilter === item.value 
                  ? 'bg-gray-100 text-gray-700 border-l-4 border-gray-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center gap-3">
                <i :class="item.icon"></i>
                <span>{{ item.label }}</span>
              </div>
              <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {{ item.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Collection Info -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div v-if="collection" class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div class="flex items-center space-x-3 mb-2">
              <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-gray-900 truncate">{{ collection.siteName || 'Collection' }}</h3>
                <p class="text-xs text-gray-500">{{ collection.siteType || 'Standard' }}</p>
              </div>
              <div :class="collection.status ? 'bg-emerald-400' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></div>
            </div>
            <div class="text-xs text-gray-500">
              <div class="truncate">ID: {{ collection._id?.slice(-8) }}</div>
              <div>{{ formatDate(collection.created_at) }}</div>
            </div>
          </div>
        </div>

        <!-- Expiring Soon Alert -->
        <div v-if="contractLifecycleStats && contractLifecycleStats.expiringSoon > 0" class="px-4 py-4 border-b border-gray-200">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-medium text-gray-800 mb-1">
                  Contract หมดอายุเร็วๆ นี้
                </h3>
                <p class="text-xs text-gray-700 mb-2">
                  มี {{ contractLifecycleStats.expiringSoon }} Contract ที่จะหมดอายุในอีก 30 วัน
                </p>
                <div v-if="contractLifecycles && contractLifecycles.length > 0" class="space-y-1">
                  <div 
                    v-for="lifecycle in contractLifecycles.filter(l => l.isExpiringSoon).slice(0, 2)" 
                    :key="lifecycle.contractId"
                    class="bg-white border border-gray-200 rounded p-2 text-xs"
                  >
                    <div class="font-medium text-gray-900 truncate">{{ lifecycle.packageName }}</div>
                    <div class="text-gray-600 font-bold">{{ lifecycle.remainingDays }} วันคงเหลือ</div>
                  </div>
                  <div v-if="contractLifecycles.filter(l => l.isExpiringSoon).length > 2" class="text-xs text-gray-600 text-center">
                    และอีก {{ contractLifecycles.filter(l => l.isExpiringSoon).length - 2 }} รายการ...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-4">
          <div class="space-y-2">
            <button 
              @click="goBackToCollectionDetail"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <i class="fas fa-arrow-left"></i>
              <span>กลับไป Collection</span>
            </button>
            <button 
              @click="refreshData"
              :disabled="loading"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <i :class="['fas', loading ? 'fa-spinner fa-spin' : 'fa-refresh']"></i>
              <span>{{ loading ? 'กำลังโหลด...' : 'รีเฟรช' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-full">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3 h-[65px]">
        <div class="flex items-center justify-between h-full">
          <button
            @click="showMobileSidebar = true"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <i class="fas fa-bars"></i>
          </button>
          <h1 class="text-lg font-semibold text-gray-900">Package Management</h1>
          <button 
            @click="handleAssignPackage"
            :disabled="hasActiveContract"
            :class="[
              'p-2 rounded-lg transition-colors',
              hasActiveContract 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:bg-blue-50'
            ]"
            :title="hasActiveContract ? 'มี Contract อยู่แล้ว ไม่สามารถ Assign เพิ่มได้' : 'Assign Package'"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <!-- Compact Header Section -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Left: Collection Info -->
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-semibold text-gray-900 truncate">
                  {{ collection?.siteName || 'Package Management' }}
                </h1>
                <div v-if="collection" :class="collection.status ? 'bg-emerald-400' : 'bg-gray-400'" class="w-2 h-2 rounded-full flex-shrink-0"></div>
              </div>
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span v-if="collection">{{ collection.siteType || 'Collection' }}</span>
                <span class="font-mono">ID: {{ collection?._id?.slice(-8) || '...' }}</span>
                <span v-if="collection">{{ formatDate(collection.created_at) }}</span>
                <span v-if="ownershipInfo?.customerInfo?.name" class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  {{ ownershipInfo.customerInfo.name }}
                </span>
                <div class="flex items-center">
                  <div class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                  System Online
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right: Status & Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Billing Status -->
            <div v-if="ownershipInfo?.billingStatus" class="hidden md:flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                 :class="[
                   ownershipInfo.billingStatus.isReady 
                     ? 'bg-green-100 text-green-700' 
                     : 'bg-amber-100 text-amber-700'
                 ]">
              <div :class="[
                'w-1.5 h-1.5 rounded-full',
                ownershipInfo.billingStatus.isReady ? 'bg-green-500' : 'bg-amber-500'
              ]"></div>
              <span>{{ ownershipInfo.billingStatus.isReady ? 'บิลพร้อม' : 'บิลไม่พร้อม' }}</span>
            </div>
            
            <!-- Ownership Status -->
            <div v-if="ownershipInfo" class="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                 :class="[
                   isOwnershipCompleteForBilling() 
                     ? 'bg-blue-100 text-blue-700' 
                     : 'bg-amber-100 text-amber-700'
                 ]">
              <div :class="[
                'w-1.5 h-1.5 rounded-full',
                isOwnershipCompleteForBilling() ? 'bg-blue-500' : 'bg-amber-500'
              ]"></div>
              <span>{{ isOwnershipCompleteForBilling() ? 'เจ้าของครบ' : 'เจ้าของไม่ครบ' }}</span>
            </div>
            <div v-else class="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>ไม่มีเจ้าของ</span>
            </div>

            <!-- Action Buttons -->
            <button 
              @click="generateFinancialHealthReport"
              :disabled="loadingFinancialReport"
              class="hidden md:flex items-center gap-1 px-2 py-1 text-xs text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
              title="รายงานการเงิน"
            >
              <i class="fas fa-chart-line"></i>
              <span>{{ loadingFinancialReport ? 'กำลังสร้าง...' : 'รายงาน' }}</span>
            </button>
            
            <button 
              @click="handleAssignPackage"
              :disabled="hasActiveContract"
              :class="[
                'flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors',
                hasActiveContract 
                  ? 'text-gray-400 bg-gray-200 cursor-not-allowed' 
                  : 'text-white bg-indigo-600 hover:bg-indigo-700'
              ]"
              :title="hasActiveContract ? 'มี Contract อยู่แล้ว ไม่สามารถ Assign เพิ่มได้' : 'Assign Package'"
            >
              <i class="fas fa-plus text-xs"></i>
              <span class="hidden sm:inline">Assign</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1">
        <div class="p-4 space-y-4">
          <!-- Contract Exists Alert -->
          <div v-if="hasActiveContract" class="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-blue-800">มี Contract อยู่แล้ว</p>
                <p class="text-xs text-blue-600 mt-1">Collection นี้มี Contract อยู่แล้ว {{ contractStats.totalContracts }} รายการ ไม่สามารถ Assign Package เพิ่มได้</p>
              </div>
            </div>
          </div>

          <!-- Missing Ownership Alert (Only show if no ownership info) -->
          <div v-if="!ownershipInfo && !loading" class="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <div>
                  <p class="text-sm font-medium text-amber-800">ยังไม่มีข้อมูลเจ้าของ</p>
                  <p class="text-xs text-amber-600 mt-1">จำเป็นสำหรับการออกเอกสารทางการเงิน</p>
                </div>
              </div>
              <button 
                @click="$router.push(`/origin/collection/detail/${this.collectionId}?tab=ownership`)"
                class="px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
              >
                เพิ่มข้อมูลเจ้าของ
              </button>
            </div>
          </div>

          <!-- Incomplete Ownership Alert -->
          <div v-if="ownershipInfo && !isOwnershipCompleteForBilling()" class="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <div>
                  <p class="text-sm font-medium text-amber-800">ข้อมูลเจ้าของไม่ครบถ้วน</p>
                  <p class="text-xs text-amber-600 mt-1">ข้อมูลบางส่วนยังไม่ครบสำหรับการออกบิล</p>
                </div>
              </div>
              <button 
                @click="$router.push(`/origin/collection/detail/${this.collectionId}?tab=ownership`)"
                class="px-3 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
              >
                แก้ไขข้อมูล
              </button>
            </div>
            <div v-if="ownershipInfo.billingStatus?.missingInfo?.length" class="mt-3 ml-8">
              <p class="text-xs font-medium text-amber-700 mb-2">ข้อมูลที่ขาด:</p>
              <ul class="text-xs text-amber-600 space-y-1">
                <li v-for="missing in ownershipInfo.billingStatus.missingInfo.slice(0, 3)" :key="missing" class="flex items-center">
                  <div class="w-1 h-1 bg-amber-400 rounded-full mr-2"></div>
                  {{ missing }}
                </li>
                <li v-if="ownershipInfo.billingStatus.missingInfo.length > 3" class="text-xs text-amber-500">
                  และอีก {{ ownershipInfo.billingStatus.missingInfo.length - 3 }} รายการ...
                </li>
              </ul>
            </div>
          </div>

          <!-- Ownership Information -->
          <div v-if="ownershipInfo" class="pt-0">
            <h4 class="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <div class="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              ข้อมูลเจ้าของ
              <!-- Billing Status Indicator ย้ายมาไว้ในหัวข้อ -->
              <div class="ml-3 flex items-center">
                <div :class="['w-2 h-2 rounded-full mr-2', ownershipInfo.billingStatus?.isReady ? 'bg-emerald-500' : 'bg-amber-500']"></div>
                                 <span class="text-sm font-medium" :class="ownershipInfo.billingStatus?.isReady ? 'text-emerald-700' : 'text-amber-700'">
                   {{ ownershipInfo.billingStatus?.isReady ? 'พร้อมออกบิล' : 'ข้อมูลไม่ครบถ้วน' }}
                 </span>
              </div>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Customer Information -->
              <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <label class="block text-xs font-medium text-slate-600 mb-2">ข้อมูลลูกค้า</label>
                <p class="text-sm font-semibold text-slate-900 mb-1">{{ ownershipInfo.customerInfo?.name || 'ไม่ระบุ' }}</p>
                <p class="text-xs text-slate-600">{{ ownershipInfo.customerInfo?.email || '' }}</p>
                <p class="text-xs text-slate-600">{{ ownershipInfo.customerInfo?.phone || '' }}</p>
                <p v-if="ownershipInfo.customerInfo?.taxId" class="text-xs text-slate-600">เลขประจำตัวผู้เสียภาษี: {{ ownershipInfo.customerInfo.taxId }}</p>
              </div>

              <!-- Billing Address -->
              <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <label class="block text-xs font-medium text-slate-600 mb-2">ที่อยู่การเรียกเก็บเงิน</label>
                <div v-if="ownershipInfo.billingAddress">
                  <p class="text-sm font-semibold text-slate-900 mb-1">{{ ownershipInfo.billingAddress.street || 'ไม่ระบุ' }}</p>
                  <p class="text-xs text-slate-600">{{ ownershipInfo.billingAddress.city || '' }} {{ ownershipInfo.billingAddress.state || '' }}</p>
                  <p class="text-xs text-slate-600">{{ ownershipInfo.billingAddress.postalCode || '' }} {{ ownershipInfo.billingAddress.country || '' }}</p>
                </div>
                <p v-else class="text-sm font-semibold text-slate-900">ไม่ระบุ</p>
              </div>

              <!-- Organization -->
              <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <label class="block text-xs font-medium text-slate-600 mb-2">องค์กร</label>
                <p class="text-sm font-semibold text-slate-900 mb-1">{{ ownershipInfo.organization?.name || 'ไม่ระบุ' }}</p>
                <p v-if="ownershipInfo.organization?.taxId" class="text-xs text-slate-600">เลขผู้เสียภาษี: {{ ownershipInfo.organization.taxId }}</p>
                <p v-if="ownershipInfo.organization?.type" class="text-xs text-slate-600">ประเภท: {{ ownershipInfo.organization.type }}</p>
              </div>
            </div>
            
            <!-- ข้อมูลที่ขาดหายไป (แสดงเฉพาะเมื่อข้อมูลไม่ครบ) -->
            <div v-if="!ownershipInfo.billingStatus?.isReady && ownershipInfo.billingStatus?.missingInfo?.length" class="mt-4 p-4 rounded-lg border bg-amber-50 border-amber-100">
              <p class="text-xs font-medium text-amber-700 mb-2">ข้อมูลที่ขาด:</p>
              <ul class="text-xs text-amber-600 space-y-1">
                <li v-for="missing in ownershipInfo.billingStatus.missingInfo" :key="missing" class="flex items-center">
                  <div class="w-1 h-1 bg-amber-400 rounded-full mr-2"></div>
                  {{ missing }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Loading Ownership -->
          <div v-else-if="loadingOwnership" class="pt-6 border-t border-gray-100">
            <div class="flex items-center justify-center py-8">
              <div class="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mr-3"></div>
              <span class="text-sm text-gray-600">กำลังโหลดข้อมูลเจ้าของ...</span>
            </div>
          </div>

          <!-- No Ownership Info -->
          <div v-else class="pt-6 border-t border-gray-100">
            <div class="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <div class="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-amber-800">ยังไม่มีข้อมูลเจ้าของ</p>
                  <p class="text-xs text-amber-600 mt-1">จำเป็นสำหรับการออกเอกสารทางการเงิน</p>
                  <button 
                    @click="$router.push(`/origin/collection/detail/${this.collectionId}?tab=ownership`)"
                    class="mt-3 text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-md transition-colors"
                  >
                    เพิ่มข้อมูลเจ้าของ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Contract & Subscription Data -->
          <div class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Contract & Subscription</h2>
              <div class="flex items-center space-x-3">
                <!-- Ownership Status Indicator -->
                <div class="flex items-center space-x-2">
                  <div v-if="ownershipInfo" class="flex items-center">
                    <div :class="[
                      'w-2 h-2 rounded-full mr-2',
                      isOwnershipCompleteForBilling() ? 'bg-green-500' : 'bg-yellow-500'
                    ]"></div>
                    <span :class="[
                      'text-xs font-medium px-2 py-1 rounded-full',
                      isOwnershipCompleteForBilling() ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    ]">
                      {{ isOwnershipCompleteForBilling() ? 'ข้อมูลเจ้าของครบถ้วน' : 'ข้อมูลเจ้าของไม่ครบ' }}
                    </span>
                  </div>
                  <div v-else class="flex items-center">
                    <div class="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <span class="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">ไม่มีข้อมูลเจ้าของ</span>
                  </div>
                </div>

                <!-- Financial Health Report Button -->
                <button 
                  @click="generateFinancialHealthReport"
                  :disabled="loadingFinancialReport"
                  class="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
                  title="สร้างรายงานสถานะการเงิน"
                >
                  <span v-if="loadingFinancialReport">กำลังสร้างรายงาน...</span>
                  <span v-else>📊 รายงานการเงิน</span>
                </button>
                
                <!-- Refresh Data Button -->
                <button 
                  @click="loadContractData"
                  :disabled="loadingContracts"
                  class="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-50"
                >
                  <span v-if="loadingContracts">กำลังโหลด...</span>
                  <span v-else>รีเฟรชข้อมูล</span>
                </button>
              </div>
            </div>

            <!-- Package Dashboard -->
          <PackageDashboard 
              :contract-stats="contractStats"
              :contract-lifecycle-stats="contractLifecycleStats"
              :available-packages-count="availablePackages.length"
              :loading="loading"
              :loading-lifecycles="loadingLifecycles"
              :has-active-contract="hasActiveContract"
              @assign-package="handleAssignPackage"
              @view-financial-report="showFinancialReportModal = true"
              @refresh-data="refreshData"
              @refresh-lifecycle="loadContractLifecycles"
            />

            <!-- Contract Details Section -->
            <div v-if="contractData && contractData.contracts.length > 0" class="mb-6">
              <h3 class="text-base font-semibold text-gray-900 mb-3">📋 Contract Details</h3>
              
              <div 
                v-for="contract in contractData.contracts" 
                :key="contract._id"
                class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
              >
                <!-- Compact Contract Header -->
                <div class="border-b border-gray-100 pb-3 mb-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <h4 class="text-lg font-semibold text-gray-900">{{ contract.packageName }} Contract</h4>
                      <span 
                        :class="[
                          'px-2 py-1 text-xs font-medium rounded-full',
                          contract.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : contract.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-700'
                            : contract.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        ]"
                      >
                        {{ getStatusText(contract.status) }}
                      </span>
                    </div>
                    <div class="text-right">
                      <div class="text-xl font-bold text-blue-600">฿{{ formatPrice(contract.basePrice) }}</div>
                      <div class="text-xs text-gray-500">{{ getBillingCycleText(contract.billingCycle) }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Contract #{{ contract.contractNumber }}</span>
                    <span>{{ contract.packageDescription }}</span>
                  </div>
        </div>

                <!-- Compact Information Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
                  <!-- Basic Information -->
                  <div class="bg-gray-50 rounded-md p-3 border border-gray-100">
                    <h5 class="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
                      ข้อมูลพื้นฐาน
                    </h5>
                    <div class="space-y-1 text-xs">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Contract ID:</span>
                        <span class="font-mono text-gray-900">{{ contract._id?.slice(-8) || 'N/A' }}</span>
            </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Collection ID:</span>
                        <span class="font-mono text-gray-900">{{ contract.collectionId?.slice(-8) || 'N/A' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Package ID:</span>
                        <span class="font-mono text-gray-900">{{ contract.packageId?.slice(-8) || 'N/A' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">สกุลเงิน:</span>
                        <span class="font-medium text-gray-900">{{ contract.currency || 'THB' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Contract Terms -->
                  <div class="bg-gray-50 rounded-md p-3 border border-gray-100">
                    <h5 class="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      เงื่อนไขสัญญา
                    </h5>
                    <div class="space-y-1 text-xs">
                      <div class="flex justify-between">
                        <span class="text-gray-600">ระยะเวลา:</span>
                        <span class="font-medium text-gray-900">
                          {{ contract.contractTerms?.duration || 'N/A' }} 
                          {{ contract.contractTerms?.durationType === 'months' ? 'เดือน' : 'ปี' }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">ต่ออายุอัตโนมัติ:</span>
                        <span class="font-medium" :class="contract.contractTerms?.autoRenewal ? 'text-green-600' : 'text-gray-600'">
                          {{ contract.contractTerms?.autoRenewal ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">เงื่อนไขการชำระ:</span>
                        <span class="font-medium text-gray-900">{{ contract.contractTerms?.paymentTerms || 'N/A' }} วัน</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">รอบบิล:</span>
                        <span class="font-medium text-gray-900">{{ getBillingCycleText(contract.billingCycle) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Contract Age Information -->
                  <div class="bg-gray-50 rounded-md p-3 border border-gray-100">
                    <h5 class="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      อายุ Contract ปัจจุบัน
                    </h5>
                    
                    <!-- Contract Lifecycle Info -->
                    <div v-if="getContractLifecycleInfo(contract._id)" class="space-y-1 text-xs">
                      <div class="flex justify-between">
                        <span class="text-gray-600">วันสิ้นสุดปัจจุบัน:</span>
                        <span class="font-medium text-gray-900">
                          {{ getContractLifecycleInfo(contract._id).currentEndDate ? formatDate(getContractLifecycleInfo(contract._id).currentEndDate) : 'ไม่กำหนด' }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">วันคงเหลือ:</span>
                        <span 
                          :class="[
                            'font-bold text-xs',
                            getContractLifecycleInfo(contract._id).remainingDays <= 30 
                              ? 'text-red-600' 
                              : getContractLifecycleInfo(contract._id).remainingDays <= 90
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          ]"
                        >
                          {{ getContractLifecycleInfo(contract._id).remainingDays }} วัน
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">ใช้ไปแล้ว:</span>
                        <span class="font-medium text-gray-900">{{ getContractLifecycleInfo(contract._id).usedDays }} วัน</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">อัพเดตล่าสุด:</span>
                        <span class="font-medium text-gray-900">
                          {{ getContractLifecycleInfo(contract._id).lastUpdated ? formatDate(getContractLifecycleInfo(contract._id).lastUpdated) : 'ไม่มีข้อมูล' }}
                        </span>
                      </div>
                    </div>
                    
                    <div v-else class="text-center text-gray-500 text-xs py-2">
                      ไม่มีข้อมูลอายุ Contract
                    </div>
                  </div>

                  <!-- User Information -->
                  <div class="bg-gray-50 rounded-md p-3 border border-gray-100">
                    <h5 class="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      ผู้ดำเนินการ
                    </h5>
                    <div class="space-y-1 text-xs">
                      <div class="flex justify-between">
                        <span class="text-gray-600">สร้างโดย:</span>
                        <span class="font-medium text-gray-900">{{ contract.createdBy || 'user' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">เปิดใช้โดย:</span>
                        <span class="font-medium text-gray-900">{{ contract.activatedBy || 'user' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Compact Notes and Actions -->
                <div v-if="contract.activationNotes || contract.notes" class="bg-yellow-50 rounded-md p-3 border border-yellow-100 mb-3">
                  <h5 class="text-xs font-semibold text-yellow-800 mb-2 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    หมายเหตุ
                  </h5>
                  <div class="text-xs">
                    <div v-if="contract.activationNotes" class="mb-1">
                      <span class="text-yellow-700 font-medium">Activation Notes:</span>
                      <p class="text-yellow-900 mt-1">{{ contract.activationNotes }}</p>
                    </div>
                    <div v-if="contract.notes">
                      <span class="text-yellow-700 font-medium">General Notes:</span>
                      <p class="text-yellow-900 mt-1">{{ contract.notes }}</p>
                    </div>
                  </div>
                </div>

                <!-- Contract Actions -->
                <div class="border-t border-gray-100 pt-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500">การดำเนินการ:</span>
            <button 
                        v-if="contract.status === 'active' || contract.status === 'inactive'"
                        @click.stop="showCancelContractModal(contract)"
                        class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                      >
                        ยกเลิก Contract
                      </button>
                                            <button
                        @click.stop="openContractDocumentModal(contract)"
                        class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                        title="ดูและพิมพ์ใบสัญญา"
                      >
                        📄 ใบสัญญา
                      </button>
                      <button
                        @click.stop="openContractEditModal(contract)"
                        class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        title="แก้ไขข้อมูล Contract"
                      >
                        แก้ไข Contract
                      </button>
                      <button
                        @click.stop="validateContractBusinessRules(contract)"
                        class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                        title="ตรวจสอบกฎธุรกิจ"
                      >
                        ตรวจสอบกฎ
                      </button>
          </div>
                    <div class="text-xs text-gray-500">
                      Contract Age: เริ่มงาน{{ formatSubscriptionAge(contract.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subscriptions List -->
            <div v-if="contractData && contractData.contracts.length > 0" class="mb-6">
              <h3 class="text-base font-semibold text-gray-900 mb-3">🔄 Subscriptions & Billing</h3>
              <div class="space-y-3">
                <div 
                  v-for="contract in contractData.contracts" 
                  :key="contract._id + '_subscriptions'"
                  class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <!-- Compact Subscriptions Header -->
                  <div class="border-b border-gray-100 pb-2 mb-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <h4 class="text-sm font-medium text-gray-900">{{ contract.packageName }} - Subscriptions</h4>
                        <p class="text-xs text-gray-500">Contract: {{ contract.contractNumber }}</p>
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ contract.subscriptions?.length || 0 }} Subscription(s)
                      </div>
                    </div>
                  </div>

                  <!-- Subscriptions -->
                  <div v-if="contract.subscriptions && contract.subscriptions.length > 0">
                    <div class="space-y-3">
                      <div 
                        v-for="subscription in contract.subscriptions" 
                        :key="subscription._id"
                        class="bg-gray-50 rounded p-3 border border-gray-100"
                      >
                        <!-- Compact Subscription Header -->
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-medium text-gray-900">
                              Period #{{ subscription.periodNumber || 1 }}
                            </span>
                            <span 
                              :class="[
                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                                subscription.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                                subscription.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' :
                                subscription.status === 'inactive' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              ]"
                            >
                              {{ getStatusText(subscription.status) }}
                            </span>
                            <span v-if="subscription.hasTrialPeriod" class="text-xs text-blue-600">
                              Trial: {{ subscription.trialDays }}วัน
                            </span>
                            
                            <!-- Compact Action Buttons -->
                            <div class="flex gap-1">
                              <button
                                v-if="subscription.status === 'inactive'"
                                @click.stop="handleActivateSubscription(subscription, contract)"
                                class="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded hover:bg-green-200 transition-colors"
                                title="ยืนยันและเปิดใช้งาน"
                              >
                                ยืนยัน
                              </button>

                              <button
                                v-if="subscription.status === 'active' || subscription.status === 'trial'"
                                @click.stop="showRenewSubscriptionModal(subscription, contract)"
                                class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
                                title="ต่ออายุ"
                              >
                                ต่ออายุ
                              </button>

                              <button
                                v-if="subscription.status === 'active' || subscription.status === 'trial'"
                                @click.stop="openSubscriptionManageModal(subscription, 'pause')"
                                class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded hover:bg-orange-200 transition-colors"
                                title="หยุดชั่วคราว"
                              >
                                หยุด
                              </button>

                              <button
                                v-if="subscription.status === 'paused'"
                                @click.stop="openSubscriptionManageModal(subscription, 'resume')"
                                class="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded hover:bg-green-200 transition-colors"
                                title="เริ่มใหม่"
                              >
                                เริ่ม
                              </button>

                              <button
                                v-if="subscription.status === 'active' || subscription.status === 'trial'"
                                @click.stop="openSubscriptionManageModal(subscription, 'changePlan')"
                                class="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded hover:bg-purple-200 transition-colors"
                                title="เปลี่ยน Plan"
                              >
                                เปลี่ยน Plan
                              </button>
                            </div>
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ formatDateRange(subscription.periodStart, subscription.periodEnd) }}
                          </div>
                        </div>

                        <!-- Compact Subscription Details -->
                        <div class="mb-2">
                          <!-- Essential Info Only -->
                          <div class="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2 text-xs">
                            <div>
                              <span class="text-gray-500">ราคาพื้นฐาน:</span>
                              <div class="font-medium text-gray-900">฿{{ formatPrice(subscription.basePrice) }}</div>
                            </div>
                            <div>
                              <span class="text-gray-500">รอบบิล:</span>
                              <div class="font-medium text-gray-900">{{ getBillingCycleText(subscription.billingCycle) }}</div>
                            </div>
                            <div>
                              <span class="text-gray-500">สกุลเงิน:</span>
                              <div class="font-medium text-gray-900">{{ subscription.currency || 'THB' }}</div>
                            </div>
                            <div>
                              <span class="text-gray-500">Subscription ID:</span>
                              <div class="font-mono text-xs text-gray-700">{{ subscription._id?.slice(-8) || 'N/A' }}</div>
                            </div>
                            <div>
                              <span class="text-gray-500">ระยะเวลาคงเหลือ:</span>
                              <div 
                                :class="[
                                  'font-medium text-xs',
                                  getRemainingDays(subscription.periodEnd) <= 7 ? 'text-red-600' :
                                  getRemainingDays(subscription.periodEnd) <= 30 ? 'text-orange-600' :
                                  'text-green-600'
                                ]"
                              >
                                {{ formatRemainingDays(subscription.periodEnd) }}
                              </div>
                            </div>
                            <div v-if="subscription.metadata?.source">
                              <span class="text-gray-500">แหล่งที่มา:</span>
                              <div class="font-medium text-xs" :class="subscription.metadata.source === 'subscription_renewal' ? 'text-blue-600' : 'text-gray-700'">
                                {{ subscription.metadata.source === 'subscription_renewal' ? 'การต่ออายุ' : 'สร้างใหม่' }}
                              </div>
                            </div>
                          </div>

                          <!-- Additional Info (Condensed) -->
                          <div v-if="subscription.metadata?.createdBy || subscription.setupFee > 0 || subscription.discountAmount > 0" class="flex items-center gap-4 text-xs text-gray-600 mb-2">
                            <span v-if="subscription.metadata?.createdBy">
                              แหล่งโดย: <span class="font-medium">{{ subscription.metadata.createdBy }}</span>
                            </span>
                            <span v-if="subscription.setupFee > 0" class="text-orange-600">
                              ค่าติดตั้ง: ฿{{ formatPrice(subscription.setupFee) }}
                            </span>
                            <span v-if="subscription.discountAmount > 0" class="text-green-600">
                              ส่วนลด: ฿{{ formatPrice(subscription.discountAmount) }}
                            </span>
                            <span class="font-medium" :class="subscription.metadata?.autoRenewal ? 'text-green-600' : 'text-gray-600'">
                              {{ subscription.metadata?.autoRenewal ? 'ต่ออายุอัตโนมัติ' : 'ไม่ต่ออายุอัตโนมัติ' }}
                            </span>
                          </div>
                        </div>

                        <!-- Compact Invoices & Receipts -->
                        <div class="flex items-center gap-4 text-xs">
                          <!-- Invoices -->
                          <div class="flex items-center gap-1">
                            <span class="text-gray-500">Invoices:</span>
                            <div v-if="subscription.invoices && subscription.invoices.length > 0" class="flex gap-1">
                              <div 
                                v-for="invoice in subscription.invoices" 
                                :key="invoice._id"
                                class="flex items-center gap-1 bg-white rounded px-2 py-0.5 border border-gray-200 hover:bg-gray-50"
                              >
                                <span>{{ invoice.invoiceNumber }}</span>
                                <span 
                                  :class="[
                                    'px-1 py-0.5 rounded text-xs font-medium',
                                    invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                    invoice.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' :
                                    invoice.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                    'bg-red-100 text-red-700'
                                  ]"
                                >
                                  {{ getStatusText(invoice.status) }}
                                </span>
                                <span class="font-medium">฿{{ formatPrice(invoice.amount) }}</span>
                                <button 
                                  @click.stop="showInvoiceModal(invoice)"
                                  class="ml-1 p-0.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                  title="ดูใบแจ้งหนี้"
                                >
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div v-else-if="subscription.invoiceId" class="flex items-center gap-1">
                              <span class="text-orange-600">ID: {{ subscription.invoiceId }}</span>
                              <button 
                                @click.stop="loadInvoiceData(subscription.invoiceId)"
                                class="text-xs text-orange-700 hover:text-orange-900 underline"
                                title="โหลดข้อมูล Invoice"
                              >
                                โหลด
                              </button>
                            </div>
                            <span v-else class="text-gray-400">-</span>
                          </div>

                          <!-- Receipts -->
                          <div class="flex items-center gap-1">
                            <span class="text-gray-500">Receipts:</span>
                            <div v-if="subscription.receipts && subscription.receipts.length > 0" class="flex gap-1">
                              <div 
                                v-for="receipt in subscription.receipts" 
                                :key="receipt._id"
                                class="flex items-center gap-1 bg-green-50 rounded px-2 py-0.5 border border-green-200 hover:bg-green-100"
                              >
                                <span>{{ receipt.receiptNumber }}</span>
                                <span class="font-medium">฿{{ formatPrice(receipt.amount) }}</span>
                                <span class="text-green-600">{{ formatDate(receipt.createdAt) }}</span>
                                <button 
                                  @click.stop="showReceiptModal(receipt)"
                                  class="ml-1 p-0.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                                  title="ดูใบเสร็จรับเงิน"
                                >
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <span v-else class="text-gray-400">-</span>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
                
                  <!-- No Subscriptions -->
                  <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <h4 class="text-lg font-medium text-gray-900 mb-2">ยังไม่มี Subscription</h4>
                    <p class="text-sm text-gray-600 mb-4">Contract นี้ยังไม่มี Subscription ที่สร้างขึ้น</p>
                    <button 
                      @click.stop="createNewSubscription(contract)"
                      class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      สร้าง Subscription ใหม่
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Contracts -->
            <div v-else-if="contractData && (!contractData.contracts || contractData.contracts.length === 0)" class="text-center py-8">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-gray-500">ยังไม่มี Contract ในระบบ</p>
              <p class="text-sm text-gray-400 mt-1">กรุณาเลือก Package เพื่อสร้าง Contract ใหม่</p>
        </div>

        <!-- Loading State -->
            <div v-if="loadingContracts" class="text-center py-8">
              <div class="inline-flex items-center space-x-2">
                <div class="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <span class="text-gray-600">กำลังโหลดข้อมูล Contract...</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="showMobileSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="showMobileSidebar = false"
    ></div>

    <!-- Mobile Sidebar -->
    <div 
      :class="showMobileSidebar ? 'translate-x-0' : '-translate-x-full'"
      class="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 z-50 lg:hidden transform transition-transform duration-300 ease-in-out"
    >
      <!-- Mobile Sidebar Content (Same as desktop sidebar) -->
      <div class="flex flex-col h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0 h-[65px]">
          <h2 class="text-lg font-semibold text-gray-900">Package Management</h2>
          <button @click="showMobileSidebar = false" class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="text-gray-600 text-xs font-medium">ทั้งหมด</div>
              <div class="text-gray-900 text-lg font-bold">{{ contractStats.totalContracts || 0 }}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="text-gray-600 text-xs font-medium">เปิดใช้งาน</div>
              <div class="text-gray-900 text-lg font-bold">{{ contractStats.activeContracts || 0 }}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="text-gray-600 text-xs font-medium">รายได้รวม</div>
              <div class="text-gray-900 text-sm font-bold">฿{{ (contractStats.totalRevenue || 0).toLocaleString() }}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="text-gray-600 text-xs font-medium">Package</div>
              <div class="text-gray-900 text-lg font-bold">{{ availablePackages.length || 0 }}</div>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <div class="space-y-1">
            <button
              v-for="item in sidebarMenuItems"
              :key="item.value"
              @click="selectFilter(item.value); showMobileSidebar = false"
              :class="[
                'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                activeFilter === item.value 
                  ? 'bg-gray-100 text-gray-700 border-l-4 border-gray-500' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center gap-3">
                <i :class="item.icon"></i>
                <span>{{ item.label }}</span>
              </div>
              <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {{ item.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Expiring Soon Alert (Mobile) -->
        <div v-if="contractLifecycleStats && contractLifecycleStats.expiringSoon > 0" class="px-4 py-4 border-b border-gray-200">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-medium text-gray-800 mb-1">
                  Contract หมดอายุเร็วๆ นี้
                </h3>
                <p class="text-xs text-gray-700 mb-2">
                  มี {{ contractLifecycleStats.expiringSoon }} Contract ที่จะหมดอายุในอีก 30 วัน
                </p>
                <div v-if="contractLifecycles && contractLifecycles.length > 0" class="space-y-1">
                  <div 
                    v-for="lifecycle in contractLifecycles.filter(l => l.isExpiringSoon).slice(0, 2)" 
                    :key="lifecycle.contractId"
                    class="bg-white border border-gray-200 rounded p-2 text-xs"
                  >
                    <div class="font-medium text-gray-900 truncate">{{ lifecycle.packageName }}</div>
                    <div class="text-gray-600 font-bold">{{ lifecycle.remainingDays }} วันคงเหลือ</div>
                  </div>
                  <div v-if="contractLifecycles.filter(l => l.isExpiringSoon).length > 2" class="text-xs text-gray-600 text-center">
                    และอีก {{ contractLifecycles.filter(l => l.isExpiringSoon).length - 2 }} รายการ...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

          <!-- Package Assignment Modal Component -->
          <PackageAssignmentModal
            :show="showPackageAssignmentModal"
            :available-packages="availablePackages"
            :loading="loadingPackages"
            @close="showPackageAssignmentModal = false"
            @select-package="selectPackage"
          />

          <!-- Package Configuration Modal -->
          <div v-if="showPackageConfigModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <!-- Modal Header -->
              <div class="border-b border-gray-200 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900">ตั้งค่า Package</h2>
                    <p class="text-sm text-gray-500 mt-1">{{ selectedPackage?.name }}</p>
                  </div>
                  <button 
                    @click="cancelPackageConfig"
                    class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="p-6 space-y-6">
                <!-- Package Summary -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="font-medium text-gray-900 mb-2">Package ที่เลือก</h3>
                  <div class="text-sm text-gray-600">
                    <p><strong>{{ selectedPackage?.name }}</strong></p>
                    <p>{{ selectedPackage?.description }}</p>
                  </div>
                </div>

                <!-- Billing Cycle Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">รอบการเรียกเก็บเงิน</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div 
                      v-for="cycle in ['monthly', 'quarterly', 'yearly']" 
                      :key="cycle"
                      class="relative"
                    >
                      <input 
                        type="radio" 
                        :id="cycle" 
                        :value="cycle" 
                        v-model="packageConfig.billingCycle"
                        class="sr-only"
                      >
                      <label 
                        :for="cycle" 
                        :class="[
                          'block w-full p-3 border rounded-lg cursor-pointer transition-colors',
                          packageConfig.billingCycle === cycle 
                            ? 'border-gray-500 bg-gray-50 text-gray-700' 
                            : 'border-gray-300 hover:border-gray-400'
                        ]"
                      >
                        <div class="text-sm font-medium">
                          {{ cycle === 'monthly' ? 'รายเดือน' : cycle === 'quarterly' ? 'รายไตรมาส' : 'รายปี' }}
                        </div>
                        <div class="text-lg font-bold mt-1">
                          ฿{{ formatPrice(getCyclePrice(cycle)) }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ cycle === 'monthly' ? '/เดือน' : cycle === 'quarterly' ? '/3 เดือน' : '/ปี' }}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Contract Start Date -->
                <div>
                  <label for="contractStartDate" class="block text-sm font-medium text-gray-700 mb-2">
                    วันที่เริ่มสัญญา
                  </label>
                  <input 
                    type="date" 
                    id="contractStartDate"
                    v-model="packageConfig.contractStartDate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    :min="new Date().toISOString().split('T')[0]"
                  >
                </div>

                <!-- Trial Period -->
                <div>
                  <label for="trialDays" class="block text-sm font-medium text-gray-700 mb-2">
                    ระยะเวลาทดลองใช้งาน (วัน)
                  </label>
                  <div class="flex items-center space-x-3">
                                          <input 
                        type="number" 
                        id="trialDays"
                        v-model.number="packageConfig.trialDays"
                        min="0"
                        max="90"
                        class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      >
                    <span class="text-sm text-gray-500">วัน (0 = ไม่มีระยะทดลองใช้)</span>
                  </div>
                  <div v-if="packageConfig.trialDays > 0" class="mt-2 p-3 bg-gray-50 rounded-md">
                    <div class="text-sm text-gray-700">
                      <p><strong>ระยะทดลองใช้:</strong> {{ packageConfig.contractStartDate }} ถึง {{ getTrialEndDate() }}</p>
                      <p><strong>เริ่มเรียกเก็บเงิน:</strong> {{ getBillingStartDate() }}</p>
                    </div>
                  </div>
                </div>

                <!-- Contract Duration -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาสัญญา</label>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <input 
                        type="number" 
                        v-model.number="packageConfig.duration"
                        min="1"
                        max="60"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      >
                    </div>
                    <div>
                      <select 
                        v-model="packageConfig.durationType"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      >
                        <option value="months">เดือน</option>
                        <option value="years">ปี</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Auto Renewal -->
                <div>
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="packageConfig.autoRenewal"
                      class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    >
                    <span class="ml-2 text-sm text-gray-700">ต่ออายุสัญญาอัตโนมัติ</span>
                  </label>
                  <p class="text-xs text-gray-500 mt-1">เมื่อสัญญาหมดอายุจะทำการต่ออายุอัตโนมัติด้วยเงื่อนไขเดิม</p>
                </div>

                <!-- Summary -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="font-medium text-gray-900 mb-2">สรุปการตั้งค่า</h3>
                  <div class="text-sm text-gray-700 space-y-1">
                    <p><strong>Package:</strong> {{ selectedPackage?.name }}</p>
                    <p><strong>รอบบิล:</strong> {{ getBillingCycleText() }} (฿{{ formatPrice(getSelectedCyclePrice()) }})</p>
                    <p><strong>เริ่มสัญญา:</strong> {{ formatDate(packageConfig.contractStartDate) }}</p>
                    <p v-if="packageConfig.trialDays > 0">
                      <strong>ทดลองใช้:</strong> {{ packageConfig.trialDays }} วัน (ฟรี)
                    </p>
                    <p><strong>ระยะเวลาสัญญา:</strong> {{ packageConfig.duration }} {{ packageConfig.durationType === 'months' ? 'เดือน' : 'ปี' }}</p>
                    <p><strong>ต่ออายุอัตโนมัติ:</strong> {{ packageConfig.autoRenewal ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Modal Footer -->
              <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
                <button 
                  @click="cancelPackageConfig"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ย้อนกลับ
                </button>
                <button 
                  @click="assignContract"
                  :disabled="loading"
                  class="px-6 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="loading">กำลังสร้าง Contract...</span>
                  <span v-else>สร้าง Contract</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Loading Overlay -->
          <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
            <div class="bg-white rounded-lg shadow-lg p-6 mx-4">
              <div class="flex items-center space-x-3">
                <div class="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                            <div>
                  <h3 class="text-sm font-medium text-gray-900">กำลังโหลดข้อมูล</h3>
                  <p class="text-xs text-gray-500">กรุณารอสักครู่...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Activate Contract Confirmation Modal -->
          <div v-if="showActivateModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] min-h-0 overflow-hidden flex flex-col">
              <!-- Modal Header -->
              <div class="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span v-if="isRenewalMode" class="text-sm">🔄</span>
                      <span v-else class="text-sm">✅</span>
                    </div>
                    <div>
                      <h2 class="text-base font-semibold text-gray-900">
                        <span v-if="isRenewalMode">ยืนยันการต่ออายุ Subscription</span>
                        <span v-else>ยืนยัน Subscription</span>
                      </h2>
                      <p class="text-xs text-gray-500">กรุณาตรวจสอบข้อมูลและกรอกรายละเอียดให้ครบถ้วน</p>
                    </div>
                  </div>
                  <button 
                    @click="closeActivateModal"
                    class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="px-4 py-3 overflow-y-auto flex-1">
                <!-- Full Width Top Section -->
                <div class="mb-4">
                  <!-- Subscription Information -->
                  <div v-if="subscriptionToActivate && contractContext" class="bg-white border border-gray-200 rounded-lg p-4">
                    <!-- Package Header -->
                    <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <span class="text-gray-600 text-sm">📦</span>
                        </div>
                        <div>
                          <h3 class="text-base font-semibold text-gray-900">{{ contractContext.packageName }}</h3>
                          <p class="text-xs text-gray-500">{{ contractContext.contractNumber }}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-xl font-bold text-gray-900">฿{{ formatPrice(subscriptionToActivate.basePrice) }}</div>
                        <div class="text-xs text-gray-500">/{{ getBillingCycleText(subscriptionToActivate.billingCycle) }}</div>
                      </div>
                    </div>
                    
                    <!-- Package Details Grid -->
                    <div class="grid grid-cols-4 gap-3 mt-3">
                      <div class="text-center">
                        <div class="text-xs text-gray-400 mb-1">Period</div>
                        <div class="font-medium text-gray-900">#{{ subscriptionToActivate.periodNumber || 1 }}</div>
                      </div>
                      <div v-if="!isRenewalMode" class="text-center">
                        <div class="text-xs text-gray-400 mb-1">Trial</div>
                        <div class="font-medium text-gray-900">{{ subscriptionToActivate.trialDays || 0 }} วัน</div>
                      </div>
                      <div v-if="isRenewalMode" class="text-center">
                        <div class="text-xs text-gray-400 mb-1">ประเภท</div>
                        <div class="font-medium text-gray-900">ต่ออายุ</div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-400 mb-1">สถานะ</div>
                        <div class="font-medium text-amber-600">รอยืนยัน</div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-400 mb-1">Cycle</div>
                        <div class="font-medium text-gray-900">{{ getBillingCycleText(subscriptionToActivate.billingCycle) }}</div>
                      </div>
                    </div>
                      
                  </div>

                  <!-- Additional Items -->
                  <div v-if="hasSubscriptionAdditionalItems()" class="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">📋 รายการบริการเพิ่มเติม</h4>
                    <div class="space-y-1">
                      <div v-for="(item, index) in getSubscriptionAdditionalItems()" :key="index" class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">{{ item.description }}</span>
                        <span class="font-medium text-gray-900">{{ item.quantity }}x ฿{{ formatPrice(item.unitPrice) }}</span>
                      </div>
                      <div class="border-t border-gray-300 pt-2 mt-2">
                        <div class="flex justify-between font-semibold text-gray-900">
                          <span>รวมค่าบริการเพิ่มเติม:</span>
                          <span>฿{{ formatPrice(getSubscriptionAdditionalAmount()) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Renewal Bonus -->
                  <div v-if="isRenewalMode && previousSubscriptionId" class="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">🎁 โบนัสจาก Subscription เดิม</h4>
                    <div class="text-sm text-gray-600 space-y-1">
                      <div>• Subscription เดิมจะถูกยกเลิกหลังยืนยันการชำระเงิน</div>
                      <div>• วันคงเหลือจะถูกเพิ่มเข้า Subscription ใหม่</div>
                      <div>• รับประกันความต่อเนื่องของบริการ</div>
                    </div>
                  </div>

                  <!-- Summary Section -->
                  <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                    <h4 class="font-medium text-gray-700 mb-2 text-sm">📝 สรุปการยืนยัน</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                      <div v-if="subscriptionToActivate?.hasTrialPeriod && subscriptionToActivate?.trialDays > 0">
                        • เริ่มระยะทดลองใช้ {{ subscriptionToActivate.trialDays }} วัน
                      </div>
                      <div v-else>
                        • เริ่มให้บริการทันที (ไม่มีระยะทดลองใช้)
                      </div>
                      <div>• สร้าง Invoice สำหรับการชำระเงิน</div>
                      <div>• ส่งอีเมลยืนยันให้ลูกค้า (ถ้าระบุอีเมล)</div>
                      <div>• เปิดใช้งานบริการตามแพ็คเกจที่เลือก</div>
                    </div>
                  </div>
                </div>

                <!-- Two Column Layout for Payment & Service Configuration -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <!-- Payment Information Section -->
                  <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 class="font-medium text-gray-700 mb-3 text-sm">
                      💳 ข้อมูลการชำระเงิน
                    </h4>
                   
                   <!-- Payment Method -->
                   <div class="mb-3">
                     <label class="block text-xs font-medium text-gray-700 mb-1">ช่องทางการชำระเงิน *</label>
                     <select 
                       v-model="activationConfig.paymentMethod" 
                       class="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                       required
                     >
                       <option value="">เลือกช่องทางการชำระเงิน</option>
                       <option value="bank_transfer">โอนเงินผ่านธนาคาร</option>
                       <option value="credit_card">บัตรเครดิต</option>
                       <option value="debit_card">บัตรเดบิต</option>
                       <option value="e_wallet">กระเป๋าเงินอิเล็กทรอนิกส์</option>
                       <option value="cash">เงินสด</option>
                       <option value="cheque">เช็ค</option>
                       <option value="other">อื่นๆ</option>
                     </select>
                   </div>

                   <!-- Payment Reference -->
                   <div class="mb-3">
                     <label class="block text-xs font-medium text-gray-700 mb-1">หมายเลขอ้างอิง/Transaction ID</label>
                     <input 
                       v-model="activationConfig.paymentReference"
                       type="text"
                       class="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                       placeholder="เช่น หมายเลขโอน, Transaction ID, หมายเลขเช็ค"
                     >
                   </div>

                   <!-- Payment Date -->
                   <div class="mb-3">
                     <label class="block text-xs font-medium text-gray-700 mb-1">วันที่ชำระเงิน</label>
                     <input 
                       v-model="activationConfig.paymentDate"
                       type="date"
                       class="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                     >
                   </div>

                   <!-- Payment Amount -->
                   <div class="mb-3">
                     <label class="block text-xs font-medium text-gray-700 mb-1">จำนวนเงินที่ชำระ</label>
                     
                     <!-- Amount Breakdown (if has additional items) -->
                     <div v-if="hasSubscriptionAdditionalItems()" class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                       <h5 class="text-sm font-medium text-blue-800 mb-2">รายละเอียดค่าใช้จ่าย</h5>
                       <div class="space-y-1 text-sm">
                         <div class="flex justify-between">
                           <span class="text-blue-700">ค่าบริการหลัก ({{ contractContext?.packageName || 'Package' }}):</span>
                           <span class="font-medium">฿{{ formatPrice(subscriptionToActivate?.basePrice || 0) }}</span>
                         </div>
                         <div class="flex justify-between">
                           <span class="text-blue-700">ค่าบริการเพิ่มเติม:</span>
                           <span class="font-medium">฿{{ formatPrice(getSubscriptionAdditionalAmount()) }}</span>
                         </div>
                         <div class="border-t border-blue-300 pt-1 mt-2">
                           <div class="flex justify-between font-medium">
                             <span class="text-blue-800">ยอดรวมทั้งสิ้น:</span>
                             <span class="text-blue-800">฿{{ formatPrice(getSubscriptionTotalAmount()) }}</span>
                           </div>
                         </div>
                       </div>
                     </div>
                     
                     <div class="relative">
                       <input 
                         v-model.number="activationConfig.paymentAmount"
                         type="number"
                         step="0.01"
                         min="0"
                         class="w-full border border-gray-300 rounded-md px-3 py-2 pr-12 text-sm"
                         :placeholder="subscriptionToActivate ? getSubscriptionTotalAmount() : '0'"
                       >
                       <span class="absolute right-3 top-2 text-sm text-gray-500">THB</span>
                     </div>
                     
                     <p class="text-xs text-gray-500 mt-1">
                       <span v-if="hasSubscriptionAdditionalItems()">
                         ยอดแนะนำ: ฿{{ formatPrice(getSubscriptionTotalAmount()) }} (รวมค่าบริการเพิ่มเติม)
                       </span>
                       <span v-else>
                         ยอดแนะนำ: ฿{{ formatPrice(subscriptionToActivate?.basePrice || 0) }} (ค่าบริการหลัก)
                       </span>
                     </p>
                   </div>
                  </div>

                  <!-- Service Configuration Section -->
                  <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 class="font-medium text-gray-700 mb-3 text-sm">
                      ⚙️ การตั้งค่าบริการ
                    </h4>
                   
                   <!-- Service Start Date -->
                   <div class="mb-3">
                     <label class="block text-xs font-medium text-gray-700 mb-1">วันที่เริ่มให้บริการ</label>
                     <input 
                       v-model="activationConfig.serviceStartDate"
                       type="date"
                       class="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                     >
                   </div>

                   <!-- Auto Renewal -->
                   <div class="mb-3">
                     <label class="flex items-center">
                       <input 
                         v-model="activationConfig.autoRenewal"
                         type="checkbox"
                         class="mr-2 w-3 h-3"
                       >
                       <span class="text-xs">เปิดใช้งานการต่ออายุอัตโนมัติ</span>
                     </label>
                   </div>

                   <!-- Notification Preferences -->
                   <div class="mb-3">
                     <label class="block text-xs font-medium text-gray-700 mb-1">การแจ้งเตือน</label>
                     <div class="space-y-1">
                       <label class="flex items-center">
                         <input 
                           v-model="activationConfig.emailNotifications"
                           type="checkbox"
                           class="mr-2 w-3 h-3"
                         >
                         <span class="text-xs">แจ้งเตือนทางอีเมล</span>
                       </label>
                       <label class="flex items-center">
                         <input 
                           v-model="activationConfig.smsNotifications"
                           type="checkbox"
                           class="mr-2 w-3 h-3"
                         >
                         <span class="text-xs">แจ้งเตือนทาง SMS</span>
                       </label>
                     </div>
                   </div>
                  </div>
                </div>

                <!-- Additional Notes - Full Width -->
                <div class="bg-white border border-gray-200 rounded-lg p-3 mt-4">
                  <h4 class="font-medium text-gray-700 mb-2 text-sm">
                    📝 หมายเหตุเพิ่มเติม
                  </h4>
                  <textarea 
                    v-model="activationConfig.notes"
                    rows="2"
                    class="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    placeholder="ระบุรายละเอียดเพิ่มเติม เงื่อนไขพิเศษ หรือข้อตกลงอื่นๆ"
                  ></textarea>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-t border-gray-200 flex-shrink-0">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <!-- Payment Summary (Left side) -->
                  <div class="text-xs text-gray-600">
                    <div v-if="subscriptionToActivate" class="space-y-1">
                      <div class="flex items-center">
                        <span>ยอดรวม:</span>
                        <span class="ml-2 font-semibold text-base text-green-600">
                          ฿{{ formatPrice(hasSubscriptionAdditionalItems() ? getSubscriptionTotalAmount() : (subscriptionToActivate?.basePrice || 0)) }}
                        </span>
                      </div>
                      <div v-if="activationConfig.paymentMethod" class="text-xs text-gray-500">
                        ชำระผ่าน: {{ getPaymentMethodText(activationConfig.paymentMethod) }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Buttons (Right side) -->
                  <div class="flex space-x-2">
                    <button 
                      @click="closeActivateModal"
                      class="px-4 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      @click="confirmActivateSubscription"
                      :disabled="!activationConfig.paymentMethod || loading"
                      class="px-4 py-1 text-xs font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      <span v-if="loading" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังดำเนินการ...
                      </span>
                      <span v-else class="flex items-center">
                        <span class="mr-1">✅</span>
                        ยืนยันและเปิดใช้งาน
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cancel Contract Confirmation Modal -->
          <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
              <!-- Modal Header -->
              <div class="bg-white border-b border-gray-200 px-4 py-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span class="text-sm">⚠️</span>
                    </div>
                    <div>
                      <h2 class="text-base font-semibold text-gray-900">ยกเลิก Contract</h2>
                    </div>
                  </div>
                  <button 
                    @click="closeCancelModal"
                    class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="px-4 py-3">
                <!-- Contract Information -->
                <div v-if="contractToCancel" class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <div class="flex items-center pb-3 border-b border-gray-100">
                    <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <span class="text-gray-600 text-sm">📦</span>
                    </div>
                    <div>
                      <h3 class="text-base font-semibold text-gray-900">{{ contractToCancel.packageName }}</h3>
                      <p class="text-xs text-gray-500">{{ contractToCancel.contractNumber }}</p>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 mt-3">{{ contractToCancel.packageDescription }}</p>
                </div>

                <!-- Warning Section -->
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 class="font-medium text-gray-700 mb-2 text-sm">⚠️ คำเตือน: การดำเนินการนี้ไม่สามารถย้อนกลับได้!</h4>
                  <p class="text-sm text-gray-600 mb-2">การยกเลิก Contract จะลบข้อมูลต่อไปนี้:</p>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Contract ทั้งหมด</li>
                    <li>• Subscriptions ทั้งหมด</li>
                    <li>• Invoices ทั้งหมด</li>
                    <li>• Receipts ทั้งหมด</li>
                  </ul>
                </div>

                <!-- Cancel Type -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 class="font-medium text-gray-700 mb-3 text-sm">ประเภทการยกเลิก</h4>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input 
                        type="radio" 
                        v-model="cancellationConfig.type" 
                        value="soft"
                        class="mr-2 w-3 h-3"
                      >
                      <span class="text-sm text-gray-600">เปลี่ยนสถานะเป็น "ยกเลิก" (เก็บข้อมูลไว้)</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="radio" 
                        v-model="cancellationConfig.type" 
                        value="hard"
                        class="mr-2 w-3 h-3"
                      >
                      <span class="text-sm text-gray-600">ลบข้อมูลทั้งหมดออกจากระบบ</span>
                    </label>
                  </div>
                </div>

                <!-- Cancel Reason -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 class="font-medium text-gray-700 mb-3 text-sm">เหตุผลในการยกเลิก</h4>
                  <select 
                    v-model="cancellationConfig.reason" 
                    class="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                  >
                    <option value="">เลือกเหตุผล</option>
                    <option value="user_request">ผู้ใช้ขอยกเลิก</option>
                    <option value="payment_failure">ไม่สามารถชำระเงินได้</option>
                    <option value="service_discontinue">หยุดการให้บริการ</option>
                    <option value="technical_issue">ปัญหาทางเทคนิค</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                <!-- Additional Notes -->
                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 class="font-medium text-gray-700 mb-3 text-sm">หมายเหตุเพิ่มเติม</h4>
                  <textarea 
                    v-model="cancellationConfig.notes"
                    rows="3"
                    class="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                  ></textarea>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-t border-gray-200 flex justify-end space-x-2">
                <button 
                  @click="closeCancelModal"
                  class="px-4 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  @click="confirmCancelContract"
                  :disabled="!cancellationConfig.reason || loading"
                  class="px-4 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="loading">กำลังดำเนินการ...</span>
                  <span v-else>ยืนยันการยกเลิก</span>
                </button>
              </div>
            </div>
          </div>


          <!-- Renew Subscription Modal -->
          <div v-if="showRenewModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <!-- Modal Header -->
              <div class="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span class="text-sm">🔄</span>
                    </div>
                    <div>
                      <h2 class="text-base font-semibold text-gray-900">ต่ออายุ Subscription</h2>
                      <p class="text-xs text-gray-500">กรุณาตรวจสอบข้อมูลและกรอกรายละเอียดให้ครบถ้วน</p>
                    </div>
                  </div>
                  <button 
                    @click="closeRenewModal"
                    class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="px-4 py-3 overflow-y-auto flex-1">
                <!-- Current Subscription Info -->
                <div v-if="subscriptionToRenew && renewContractContext" class="mb-4 bg-white border border-gray-200 rounded-lg p-4">
                  <h4 class="font-medium text-gray-700 mb-3 text-sm">ข้อมูล Subscription ปัจจุบัน</h4>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-600">Package:</span>
                      <span class="ml-2 font-medium">{{ renewContractContext.packageName }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Contract:</span>
                      <span class="ml-2 font-medium">{{ renewContractContext.contractNumber }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Period:</span>
                      <span class="ml-2 font-medium">#{{ subscriptionToRenew.periodNumber || 1 }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">สถานะ:</span>
                      <span class="ml-2 font-medium">{{ getStatusText(subscriptionToRenew.status) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">วันหมดอายุ:</span>
                      <span class="ml-2 font-medium">{{ formatDate(subscriptionToRenew.periodEnd) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">วันคงเหลือ:</span>
                      <span class="ml-2 font-medium text-green-600">{{ getRemainingDays(subscriptionToRenew.periodEnd) }} วัน</span>
                    </div>
                  </div>
                </div>

                <!-- Renew Configuration -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Left Column -->
                  <div>
                    <!-- Billing Cycle -->
                    <div class="mb-6">
                      <label class="block text-sm font-medium text-gray-700 mb-3">รอบการเรียกเก็บเงิน</label>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div 
                          v-for="cycle in ['monthly', 'quarterly', 'yearly']" 
                          :key="cycle"
                          class="relative"
                        >
                          <input 
                            type="radio" 
                            :id="`renew-${cycle}`" 
                            :value="cycle" 
                            v-model="renewConfig.billingCycle"
                            @change="updateRenewPricing"
                            class="sr-only"
                          >
                          <label 
                            :for="`renew-${cycle}`" 
                            :class="[
                              'block w-full p-3 border rounded-lg cursor-pointer transition-colors',
                              renewConfig.billingCycle === cycle 
                                ? 'border-gray-500 bg-gray-50 text-gray-700' 
                                : 'border-gray-300 hover:border-gray-400'
                            ]"
                          >
                            <div class="text-sm font-medium">
                              {{ cycle === 'monthly' ? 'รายเดือน' : cycle === 'quarterly' ? 'รายไตรมาส' : 'รายปี' }}
                      </div>
                          <div class="text-lg font-bold mt-1">
                            ฿{{ formatPrice(getRenewCyclePrice(cycle)) }}
                      </div>
                          <div class="text-xs text-gray-500">
                            {{ cycle === 'monthly' ? '/เดือน' : cycle === 'quarterly' ? '/3 เดือน' : '/ปี' }}
                    </div>
                        </label>
                    </div>
                  </div>
                </div>

                    <!-- Duration -->
                    <div class="mb-6">
                      <label class="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาต่ออายุ</label>
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <input 
                            type="number" 
                            v-model.number="renewConfig.duration"
                            @input="updateRenewPricing"
                            min="1"
                            max="60"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                          >
                </div>
                      <div>
                        <select 
                          v-model="renewConfig.durationType"
                          @change="updateRenewPricing"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        >
                          <option value="months">เดือน</option>
                          <option value="years">ปี</option>
                        </select>
                </div>
              </div>
            </div>


                </div>

                <!-- Right Column -->
                <div>
                  <!-- Pricing Summary -->
                  <div class="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 class="font-medium text-gray-700 mb-3 text-sm">สรุปราคา</h4>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span>ค่าแพ็คเกจ ({{ renewConfig.duration }} {{ renewConfig.durationType === 'months' ? 'เดือน' : 'ปี' }}):</span>
                        <span class="font-medium">฿{{ formatPrice(renewConfig.basePrice) }}</span>
                      </div>
                      <div v-if="renewConfig.additionalTotal > 0" class="flex justify-between">
                        <span>รายการเพิ่มเติม:</span>
                        <span class="font-medium">฿{{ formatPrice(renewConfig.additionalTotal) }}</span>
                      </div>
                      <div v-if="getRemainingDays(subscriptionToRenew?.periodEnd) > 0" class="flex justify-between text-gray-600">
                        <span>วันคงเหลือจาก Subscription เดิม ({{ getRemainingDays(subscriptionToRenew?.periodEnd) }} วัน):</span>
                        <span class="font-medium">รวมให้</span>
                      </div>
                      <div class="border-t pt-2 flex justify-between text-base font-bold text-gray-900">
                        <span>รวมทั้งสิ้น:</span>
                        <span>฿{{ formatPrice(renewConfig.totalAmount) }}</span>
                      </div>
            </div>
          </div>

                     <!-- Service Configuration -->
                     <div class="mb-4">
                       <h4 class="font-medium text-gray-700 mb-3 text-sm">การตั้งค่าบริการ</h4>
                       
                       <!-- Auto Renewal -->
                       <div class="mb-4">
                         <label class="flex items-center">
                           <input 
                             v-model="renewConfig.autoRenewal"
                             type="checkbox"
                             class="mr-2"
                           >
                           <span class="text-sm">เปิดใช้งานการต่ออายุอัตโนมัติ</span>
                         </label>
                       </div>
                     </div>

                     <!-- Additional Notes -->
                     <div class="mb-4">
                       <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุเพิ่มเติม</label>
                       <textarea 
                         v-model="renewConfig.notes"
                         rows="3"
                         class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                         placeholder="ระบุรายละเอียดเพิ่มเติม เงื่อนไขพิเศษ หรือข้อตกลงอื่นๆ"
                       ></textarea>
                     </div>
                  </div>
                </div>
              </div>

              <!-- Additional Items Section (Full Width) -->
              <div class="mb-4 px-4">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-medium text-gray-900">รายการเพิ่มเติม</h4>
                  <button 
                    @click="addAdditionalItem"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    เพิ่มรายการ
                  </button>
                </div>
                
                <div v-if="renewConfig.additionalItems.length === 0" class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p class="text-sm text-gray-500 mb-2">ไม่มีรายการเพิ่มเติม</p>
                  <p class="text-xs text-gray-400">คลิกปุ่ม "เพิ่มรายการ" เพื่อเพิ่มรายการบริการเสริมหรือค่าใช้จ่ายเพิ่มเติม</p>
                </div>
                
                <div v-else class="space-y-4">
                  <div v-for="(item, index) in renewConfig.additionalItems" :key="index" 
                       class="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <!-- Item Header -->
                    <div class="flex items-center justify-between mb-3">
                      <h5 class="text-sm font-medium text-gray-700">รายการที่ {{ index + 1 }}</h5>
                      <button 
                        @click="removeAdditionalItem(index)"
                        class="inline-flex items-center p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="ลบรายการ"
                      >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Item Details -->
                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    <!-- Description (Full width on mobile, 6 cols on desktop) -->
                    <div class="lg:col-span-6">
                      <label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียดรายการ</label>
                      <input 
                        v-model="item.description"
                        type="text"
                        placeholder="ระบุรายละเอียด เช่น ค่าบริการเพิ่มเติม, ค่าติดตั้ง, ค่าปรับแต่ง"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                    </div>
                    
                    <!-- Quantity -->
                    <div class="lg:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">จำนวน</label>
                      <input 
                        v-model.number="item.quantity"
                        @input="updateRenewPricing"
                        type="number"
                        min="1"
                        placeholder="1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                    </div>
                    
                    <!-- Unit Price -->
                    <div class="lg:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">ราคาต่อหน่วย</label>
                      <div class="relative">
                        <input 
                          v-model.number="item.unitPrice"
                          @input="updateRenewPricing"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                        <span class="absolute right-3 top-2 text-sm text-gray-500">THB</span>
                      </div>
                    </div>
                    
                    <!-- Total -->
                    <div class="lg:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">รวม</label>
                      <div class="px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm font-medium text-green-700 text-center">
                        ฿{{ formatPrice((item.quantity || 0) * (item.unitPrice || 0)) }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Calculation Display -->
                  <div class="mt-2 text-xs text-gray-500 text-right">
                    {{ item.quantity || 0 }} × ฿{{ formatPrice(item.unitPrice || 0) }} = ฿{{ formatPrice((item.quantity || 0) * (item.unitPrice || 0)) }}
                  </div>
                </div>
                
                <!-- Additional Items Summary -->
                <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div class="flex justify-between items-center text-sm">
                    <span class="font-medium text-green-800">รวมรายการเพิ่มเติม ({{ renewConfig.additionalItems.length }} รายการ):</span>
                    <span class="font-bold text-green-700">฿{{ formatPrice(renewConfig.additionalTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>

              <!-- Modal Footer -->
              <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-t border-gray-200 flex-shrink-0">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <!-- Payment Summary (Left side) -->
                  <div class="text-xs text-gray-600">
                    <div v-if="renewConfig" class="space-y-1">
                      <div class="flex items-center">
                        <span>ยอดรวม:</span>
                        <span class="ml-2 font-semibold text-base text-green-600">
                          ฿{{ formatPrice(renewConfig.totalAmount || 0) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Buttons (Right side) -->
                  <div class="flex space-x-2">
                    <button 
                      @click="closeRenewModal"
                      class="px-4 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      @click="createRenewSubscription"
                      :disabled="loading"
                      class="px-4 py-1 text-xs font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      <span v-if="loading" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังสร้าง...
                      </span>
                      <span v-else class="flex items-center">
                        <span class="mr-1">🔄</span>
                        สร้าง Subscription ใหม่
                      </span>
                    </button>
                  </div>
                </div>
              </div>
                 </div>
          </div>

          <!-- Contract Edit Modal -->
          <div v-if="showContractEditModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <!-- Modal Header -->
              <div class="bg-white border-b border-gray-200 px-4 py-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span class="text-sm">🔧</span>
                    </div>
                    <div>
                      <h2 class="text-base font-semibold text-gray-900">แก้ไข Contract</h2>
                    </div>
                  </div>
                  <button 
                    @click="closeContractEditModal"
                    class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Modal Content -->
              <div v-if="contractToEdit" class="px-4 py-3 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div class="space-y-4">
                  <!-- Contract Info -->
                  <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center pb-3 border-b border-gray-100">
                      <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-gray-600 text-sm">📦</span>
                      </div>
                      <div>
                        <h3 class="text-base font-semibold text-gray-900">{{ contractToEdit.packageName }}</h3>
                        <p class="text-xs text-gray-500">{{ contractToEdit.contractNumber }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Edit Form -->
                  <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 class="font-medium text-gray-700 mb-4 text-sm">ข้อมูลการแก้ไข</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <!-- Base Price -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ราคาพื้นฐาน</label>
                        <div class="relative">
                          <input 
                            v-model.number="contractEditConfig.basePrice"
                            type="number"
                            step="0.01"
                            min="0"
                            class="w-full px-2 py-1 pr-12 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                          >
                          <span class="absolute right-3 top-1 text-xs text-gray-500">THB</span>
                        </div>
                      </div>

                      <!-- Billing Cycle -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">รอบการเรียกเก็บ</label>
                        <select 
                          v-model="contractEditConfig.billingCycle"
                          class="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                        >
                          <option value="monthly">รายเดือน</option>
                          <option value="quarterly">รายไตรมาส</option>
                          <option value="yearly">รายปี</option>
                        </select>
                      </div>

                      <!-- Currency -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">สกุลเงิน</label>
                        <select 
                          v-model="contractEditConfig.currency"
                          class="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                        >
                          <option value="THB">THB (บาท)</option>
                          <option value="USD">USD (ดอลลาร์)</option>
                          <option value="EUR">EUR (ยูโร)</option>
                        </select>
                      </div>

                      <!-- Modified By -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">แก้ไขโดย</label>
                        <input 
                          v-model="contractEditConfig.modifiedBy"
                          type="text"
                          class="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Contract Terms -->
                  <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 class="font-medium text-gray-700 mb-3 text-sm">เงื่อนไข Contract</h4>
                    <textarea 
                      v-model="contractEditConfig.contractTerms"
                      rows="4"
                      class="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      placeholder="ระบุเงื่อนไขและข้อตกลงของ Contract..."
                    ></textarea>
                  </div>

                  <!-- Change Reason -->
                  <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 class="font-medium text-gray-700 mb-3 text-sm">เหตุผลในการแก้ไข *</h4>
                    <input 
                      v-model="contractEditConfig.changeReason"
                      type="text"
                      required
                      class="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      placeholder="ระบุเหตุผลในการแก้ไข Contract นี้..."
                    >
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-t border-gray-200 flex justify-end space-x-2">
                <button 
                  @click="closeContractEditModal"
                  class="px-4 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  @click="editContract"
                  :disabled="loading || !contractEditConfig.changeReason"
                  class="px-4 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="loading">กำลังบันทึก...</span>
                  <span v-else>บันทึกการแก้ไข</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Subscription Management Modal -->
          <div v-if="showSubscriptionManageModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <!-- Modal Header -->
              <div class="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span v-if="subscriptionManageAction === 'pause'" class="text-sm">⏸️</span>
                      <span v-else-if="subscriptionManageAction === 'resume'" class="text-sm">▶️</span>
                      <span v-else-if="subscriptionManageAction === 'changePlan'" class="text-sm">🔄</span>
                    </div>
                    <div>
                      <h2 class="text-base font-semibold text-gray-900">
                        <span v-if="subscriptionManageAction === 'pause'">หยุด Subscription</span>
                        <span v-else-if="subscriptionManageAction === 'resume'">เริ่ม Subscription ใหม่</span>
                        <span v-else-if="subscriptionManageAction === 'changePlan'">เปลี่ยน Package</span>
                      </h2>
                      <p class="text-xs text-gray-500">กรุณาตรวจสอบข้อมูลและกรอกรายละเอียดให้ครบถ้วน</p>
                    </div>
                  </div>
                  <button 
                    @click="closeSubscriptionManageModal"
                    class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

                <!-- Modal Content -->
              <div v-if="subscriptionToManage" class="px-4 py-3 overflow-y-auto flex-1">
                <!-- Subscription Info -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 class="font-medium text-gray-700 mb-2 text-sm">Subscription ที่จัดการ</h4>
                  <p class="text-sm text-gray-600">Period #{{ subscriptionToManage.periodNumber || 1 }} - {{ subscriptionToManage.packageName }}</p>
                  <p class="text-xs text-gray-500">ID: {{ subscriptionToManage._id }}</p>
                </div>

                <!-- Pause Configuration -->
                <div v-if="subscriptionManageAction === 'pause'" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มหยุด</label>
                      <input 
                        v-model="pauseResumeConfig.pauseStartDate"
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
              </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุดการหยุด (ไม่บังคับ)</label>
                      <input 
                        v-model="pauseResumeConfig.pauseEndDate"
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
            </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">เหตุผลในการหยุด</label>
                    <input 
                      v-model="pauseResumeConfig.reason"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="ระบุเหตุผล เช่น ลูกค้าขอหยุดชั่วคราว, ปรับปรุงระบบ"
                    >
                  </div>
                </div>

                <!-- Resume Configuration -->
                <div v-if="subscriptionManageAction === 'resume'" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มใหม่</label>
                    <input 
                      v-model="pauseResumeConfig.resumeDate"
                      type="date"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                  </div>
                </div>

                <!-- Change Plan Configuration -->
                <div v-if="subscriptionManageAction === 'changePlan'" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Package ใหม่</label>
                      <input 
                        v-model="planChangeConfig.newPackageName"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="ชื่อ Package ใหม่"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">ราคาใหม่</label>
                      <div class="relative">
                        <input 
                          v-model.number="planChangeConfig.newPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                        <span class="absolute right-3 top-2 text-sm text-gray-500">THB</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Package ID ใหม่</label>
                    <input 
                      v-model="planChangeConfig.newPackageId"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Package ID ใหม่"
                    >
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
                <button 
                  @click="closeSubscriptionManageModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  @click="subscriptionManageAction === 'pause' ? pauseSubscription() : subscriptionManageAction === 'resume' ? resumeSubscription() : changeSubscriptionPlan()"
                  :disabled="loading"
                  class="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="loading">กำลังดำเนินการ...</span>
                  <span v-else-if="subscriptionManageAction === 'pause'">หยุด Subscription</span>
                  <span v-else-if="subscriptionManageAction === 'resume'">เริ่ม Subscription</span>
                  <span v-else-if="subscriptionManageAction === 'changePlan'">เปลี่ยน Package</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Payment Management Modal -->
    <div v-if="showPaymentManageModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <!-- Modal Header -->
        <div class="bg-red-50 px-6 py-4 border-b border-red-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-red-900">
              <span v-if="paymentManageAction === 'overdue'">🚨 จัดการ Invoice เกินกำหนด</span>
              <span v-else-if="paymentManageAction === 'failed'">❌ จัดการการชำระเงินล้มเหลว</span>
              <span v-else-if="paymentManageAction === 'refund'">💰 ดำเนินการคืนเงิน</span>
            </h3>
            <button 
              @click="closePaymentManageModal"
              class="p-2 text-red-400 hover:text-red-600 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

          <!-- Modal Content -->
        <div v-if="invoiceToManage" class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <!-- Invoice Info -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 class="font-medium text-gray-900 mb-2">Invoice ที่จัดการ</h4>
            <p class="text-sm text-gray-600">{{ invoiceToManage.invoiceNumber }} - ฿{{ formatPrice(invoiceToManage.amount) }}</p>
            <p class="text-xs text-gray-500">สถานะ: {{ getStatusText(invoiceToManage.status) }}</p>
          </div>

          <!-- Overdue Configuration -->
          <div v-if="paymentManageAction === 'overdue'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เหตุผลที่เกินกำหนด</label>
              <input 
                v-model="paymentManageConfig.reason"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="ระบุเหตุผล เช่น ลูกค้าไม่ชำระตามกำหนด"
              >
        </div>
      </div>

          <!-- Failed Payment Configuration -->
          <div v-if="paymentManageAction === 'failed'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">เหตุผลที่ล้มเหลว</label>
                <input 
                  v-model="paymentManageConfig.failureReason"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="เช่น บัตรหมดอายุ, ยอดเงินไม่เพียงพอ"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ช่องทางการชำระ</label>
                <select 
                  v-model="paymentManageConfig.paymentMethod"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">เลือกช่องทาง</option>
                  <option value="credit_card">บัตรเครดิต</option>
                  <option value="bank_transfer">โอนเงิน</option>
                  <option value="e_wallet">กระเป๋าเงินอิเล็กทรอนิกส์</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">รหัสข้อผิดพลาด</label>
                <input 
                  v-model="paymentManageConfig.errorCode"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="เช่น CARD_DECLINED"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนครั้งที่ลองใหม่</label>
                <input 
                  v-model.number="paymentManageConfig.maxRetries"
                  type="number"
                  min="1"
                  max="5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
              </div>
            </div>
          </div>

          <!-- Refund Configuration -->
          <div v-if="paymentManageAction === 'refund'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนเงินที่คืน</label>
                <div class="relative">
                  <input 
                    v-model.number="paymentManageConfig.refundAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    :max="invoiceToManage.amount"
                    class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                  <span class="absolute right-3 top-2 text-sm text-gray-500">THB</span>
                </div>
              </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทการคืนเงิน</label>
                <select 
                  v-model="paymentManageConfig.refundType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="full">คืนเงินเต็มจำนวน</option>
                  <option value="partial">คืนเงินบางส่วน</option>
                </select>
            </div>
          </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เหตุผลในการคืนเงิน</label>
              <input 
                v-model="paymentManageConfig.refundReason"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="ระบุเหตุผล เช่น ลูกค้าไม่พอใจบริการ, ยกเลิกการใช้งาน"
              >
        </div>
            <div class="flex items-center">
              <input 
                v-model="paymentManageConfig.cancelSubscription"
                type="checkbox"
                id="cancelSubscription"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              >
              <label for="cancelSubscription" class="ml-2 block text-sm text-gray-700">
                ยกเลิก Subscription ที่เกี่ยวข้องด้วย
              </label>
      </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
          <button 
            @click="closePaymentManageModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            @click="paymentManageAction === 'overdue' ? handleOverdueInvoice() : paymentManageAction === 'failed' ? handleFailedPayment() : processRefund()"
            :disabled="loading"
            class="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">กำลังดำเนินการ...</span>
            <span v-else-if="paymentManageAction === 'overdue'">ทำเครื่องหมายเกินกำหนด</span>
            <span v-else-if="paymentManageAction === 'failed'">บันทึกการล้มเหลว</span>
            <span v-else-if="paymentManageAction === 'refund'">ดำเนินการคืนเงิน</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Validation Results Modal -->
    <div v-if="showValidationModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="bg-white px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">ผลการตรวจสอบกฎธุรกิจ</h3>
            </div>
            <button 
              @click="closeValidationModal"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div v-if="validationResults" class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <!-- Validation Status -->
          <div class="mb-6 text-center">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div class="mb-3">
                <span v-if="validationResults.isValid" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                  ผ่านการตรวจสอบ
                </span>
                <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800 border border-gray-400">
                  ไม่ผ่านการตรวจสอบ
                </span>
              </div>
              <p class="text-sm text-gray-600">ประเภท: {{ validationType }}</p>
            </div>
          </div>

          <!-- Errors -->
          <div v-if="validationResults.errors && validationResults.errors.length > 0" class="mb-6">
            <h4 class="font-medium text-gray-900 mb-3 text-sm">ข้อผิดพลาด</h4>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <ul class="space-y-2">
                <li v-for="error in validationResults.errors" :key="error" class="text-sm text-gray-700 flex items-start">
                  <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Warnings -->
          <div v-if="validationResults.warnings && validationResults.warnings.length > 0" class="mb-6">
            <h4 class="font-medium text-gray-900 mb-3 text-sm">คำเตือน</h4>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <ul class="space-y-2">
                <li v-for="warning in validationResults.warnings" :key="warning" class="text-sm text-gray-700 flex items-start">
                  <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {{ warning }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Suggestions -->
          <div v-if="validationResults.suggestions && validationResults.suggestions.length > 0" class="mb-6">
            <h4 class="font-medium text-gray-900 mb-3 text-sm">ข้อเสนอแนะ</h4>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <ul class="space-y-2">
                <li v-for="suggestion in validationResults.suggestions" :key="suggestion" class="text-sm text-gray-700 flex items-start">
                  <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button 
            @click="closeValidationModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>

    <!-- Financial Health Report Modal Component -->
    <FinancialHealthReportModal
      :show="showFinancialReportModal"
      :financial-report="financialReport"
      @close="closeFinancialReportModal"
    />

    <!-- Document Preview Modal Component (Invoice & Receipt) -->
    <DocumentPreviewModal
      :show="showInvoiceDetailModal"
      :document="selectedInvoice"
      document-type="invoice"
      :ownership-info="ownershipInfo"
      @close="closeInvoiceModal"
      @manage-payment="handleInvoicePaymentManagement"
    />

    <DocumentPreviewModal
      :show="showReceiptDetailModal"
      :document="selectedReceipt"
      document-type="receipt"
      :ownership-info="ownershipInfo"
      @close="closeReceiptModal"
    />

    <!-- Contract Document Modal -->
    <ContractDocumentModal
      :show="showContractDocumentModal"
      :contract="selectedContract"
      :ownership-info="ownershipInfo"
      @close="closeContractDocumentModal"
      @edit-customer-info="handleEditCustomerInfo"
      @activate-contract="handleActivateContract"
    />

  </div>
</template>

<script>
import ServiceManager from './function/ServiceManager.js';
import DocumentPreviewModal from './component/DocumentPreviewModal.vue';
import ContractDocumentModal from './component/ContractDocumentModal.vue';
import PackageDashboard from './component/PackageDashboard.vue';
import FinancialHealthReportModal from './component/FinancialHealthReportModal.vue';
import PackageAssignmentModal from './component/PackageAssignmentModal.vue';

export default {
  name: 'PackageManagement',
  components: {
    DocumentPreviewModal,
    ContractDocumentModal,
    PackageDashboard,
    FinancialHealthReportModal,
    PackageAssignmentModal
  },
  props: {
    collectionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      hostkey: this.$Key,
      collection: null,
      serviceManager: null,
      loading: false,
      
      // Package Assignment Modal
      showPackageAssignmentModal: false,
      availablePackages: [],
      loadingPackages: false,
      
      // Package Configuration Modal
      showPackageConfigModal: false,
      selectedPackage: null,
      packageConfig: {
        billingCycle: 'monthly',
        contractStartDate: '',
        trialDays: 0,
        autoRenewal: false,
        duration: 12,
        durationType: 'months'
      },
      
      // Contract Data
      contractData: null,
      contractStats: {
        totalContracts: 0,
        activeContracts: 0,
        inactiveContracts: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
        overdueRevenue: 0,
        averageMonthlyRevenue: 0
      },
      loadingContracts: false,

      // Subscription Activation Modal
      showActivateModal: false,
      subscriptionToActivate: null,
      contractContext: null,
      isRenewalMode: false, // Flag to distinguish between activation and renewal
      previousSubscriptionId: null, // For renewal mode
      activationConfig: {
        // Payment Information
        paymentMethod: '',
        paymentReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentAmount: 0,
        
        // Customer Information
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        taxId: '',
        
        // Service Configuration
        serviceStartDate: new Date().toISOString().split('T')[0],
        autoRenewal: false,
        emailNotifications: true,
        smsNotifications: false,
        
        // Additional
        notes: '',
        activatedBy: 'user'
      },

      // Contract Cancellation Modal
      showCancelModal: false,
      contractToCancel: null,
      cancellationConfig: {
        type: 'soft', // 'soft' หรือ 'hard'
        reason: '',
        notes: '',
        cancelledBy: 'user'
      },
      
      // Invoice Modal
      showInvoiceDetailModal: false,
      selectedInvoice: null,

      // Receipt Modal
      showReceiptDetailModal: false,
      selectedReceipt: null,

      // Contract Document Modal
      showContractDocumentModal: false,
      selectedContract: null,

      // Renew Subscription Modal
      showRenewModal: false,
      subscriptionToRenew: null,
      renewContractContext: null,
      

      
      renewConfig: {
        // Billing Configuration
        billingCycle: 'monthly',
        duration: 1,
        durationType: 'months',
        
        // Additional Items
        additionalItems: [],
        
        // Pricing
        basePrice: 0,
        additionalTotal: 0,
        totalAmount: 0,
        
        // Service Configuration
        autoRenewal: false,
        
        // Additional
        notes: ''
      },
      
      // Development flag
      isDevelopment: process.env.NODE_ENV === 'development',
      
      // Contract Lifecycle Data
      contractLifecycles: null,
      contractLifecycleStats: null,
      loadingLifecycles: false,

      // Contract Modification
      showContractEditModal: false,
      contractToEdit: null,
      contractEditConfig: {
        basePrice: 0,
        billingCycle: 'monthly',
        currency: 'THB',
        contractTerms: '',
        modifiedBy: 'user',
        changeReason: ''
      },

      // Advanced Subscription Management
      showSubscriptionManageModal: false,
      subscriptionToManage: null,
      subscriptionManageAction: '', // 'pause', 'resume', 'changePlan'
      
      // Pause/Resume Configuration
      pauseResumeConfig: {
        pauseStartDate: new Date().toISOString().split('T')[0],
        pauseEndDate: '',
        reason: '',
        pausedBy: 'user',
        resumeDate: new Date().toISOString().split('T')[0],
        resumedBy: 'user'
      },

      // Plan Change Configuration
      planChangeConfig: {
        newPackageId: '',
        newPackageName: '',
        newPrice: 0,
        newBillingCycle: 'monthly',
        changedBy: 'user'
      },

      // Payment Management
      showPaymentManageModal: false,
      invoiceToManage: null,
      paymentManageAction: '', // 'overdue', 'failed', 'refund'
      
      paymentManageConfig: {
        // Overdue configuration
        reason: '',
        markedBy: 'user',
        
        // Failed payment configuration
        failureReason: '',
        paymentMethod: '',
        errorCode: '',
        errorMessage: '',
        maxRetries: 3,
        
        // Refund configuration
        refundAmount: 0,
        refundReason: '',
        refundType: 'full', // 'full' or 'partial'
        refundMethod: 'original_payment_method',
        cancelSubscription: false,
        processedBy: 'user'
      },

      // Business Rules Validation
      showValidationModal: false,
      validationResults: null,
      validationType: '', // 'contract' or 'subscription'

      // Financial Health Report
      showFinancialReportModal: false,
      financialReport: null,
      loadingFinancialReport: false,

      // Ownership Information
      ownershipInfo: null,
      loadingOwnership: false,
      ownershipService: null,
      collectionService: null,

      // Sidebar Configuration
      showMobileSidebar: false,
      activeFilter: 'all',
      sidebarMenuItems: [
        { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-list', count: 0 },
        { value: 'active', label: 'เปิดใช้งาน', icon: 'fas fa-check-circle', count: 0 },
        { value: 'inactive', label: 'ปิดใช้งาน', icon: 'fas fa-times-circle', count: 0 },
        { value: 'expired', label: 'หมดอายุ', icon: 'fas fa-clock', count: 0 },
        { value: 'pending', label: 'รอดำเนินการ', icon: 'fas fa-hourglass-half', count: 0 }
      ]
    };
  },
  computed: {
    // Safe getters for contractStats
    safeContractStats() {
      return this.contractStats || {
        totalContracts: 0,
        activeContracts: 0,
        inactiveContracts: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
        overdueRevenue: 0,
        averageMonthlyRevenue: 0
      };
    },

    // Check if there are active contracts
    hasActiveContract() {
      // Check if there are any contracts (total contracts > 0)
      if (this.contractStats && this.contractStats.totalContracts > 0) {
        return true;
      }
      
      // Also check contractData.contracts array as backup
      if (this.contractData && this.contractData.contracts && this.contractData.contracts.length > 0) {
        return true;
      }
      
      return false;
    }
  },
  async mounted() {
    // Initialize ServiceManager
    this.serviceManager = new ServiceManager(this.hostkey);
    
    // Initialize Collection and Ownership Services
    await this.initializeServices();
    
    // Load data
    await this.loadData();
  },
  
  watch: {
    // Load packages when modal opens
    showPackageAssignmentModal(newValue) {
      if (newValue) {
        this.loadAvailablePackages();
      }
    }
  },
  methods: {
    // Initialize Services
    async initializeServices() {
      try {
        // Dynamically import Collection and Ownership services
        const { default: CollectionService } = await import('./function/service/CollectionService.js');
        const { default: OwnershipService } = await import('./function/service/OwnershipService.js');
        
        this.collectionService = new CollectionService(this.hostkey);
        this.ownershipService = new OwnershipService(this.hostkey);
        
        console.log('✅ Collection and Ownership services initialized');
      } catch (error) {
        console.error('❌ Error initializing services:', error);
        this.showErrorMessage('ไม่สามารถเชื่อมต่อกับระบบจัดการข้อมูลเจ้าของได้');
      }
    },

    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadCollection(),
          this.loadContractData(),
          this.loadOwnershipInfo()
        ]);
        
        // Initialize sidebar counts after loading data
        this.updateSidebarCounts();
      } catch (error) {
        console.error('Error loading package management data:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadCollection() {
      try {
        const response = await fetch(`https://gateway.cloudrestfulapi.com/api/hostname/${this.collectionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': this.hostkey
          }
        });

        if (response.ok) {
          this.collection = await response.json();
          console.log('Collection loaded:', this.collection);
        } else {
          throw new Error(`Failed to load collection: ${response.status}`);
        }
      } catch (error) {
        console.error('Error loading collection:', error);
        throw error;
      }
    },

    async refreshData() {
      console.log('Refreshing data...');
      await this.loadData();
      this.updateSidebarCounts();
    },

    // Load Ownership Information
    async loadOwnershipInfo() {
      if (!this.serviceManager) {
        console.warn('ServiceManager not initialized, skipping ownership load');
        return;
      }

      this.loadingOwnership = true;
      try {
        console.log('Loading ownership information for collection:', this.collectionId);
        
        // Use ServiceManager to get ownership info
        const ownershipInfo = await this.serviceManager.getOwnershipForDocuments(this.collectionId);
        
        if (ownershipInfo && ownershipInfo.customerInfo) {
          this.ownershipInfo = ownershipInfo;
          
          // เพิ่มข้อมูล ownership เข้าไปใน collection object เพื่อส่งไปยัง child components
          if (this.collection) {
            this.collection.ownershipInfo = ownershipInfo;
          }
          
          console.log('✅ Ownership information loaded:', this.ownershipInfo);
        } else {
          console.log('ℹ️ No ownership information found for this collection');
          this.ownershipInfo = null;
          
          // Clear ownership info from collection if no data found
          if (this.collection) {
            this.collection.ownershipInfo = null;
          }
        }
      } catch (error) {
        console.error('❌ Error loading ownership information:', error);
        this.ownershipInfo = null;
      } finally {
        this.loadingOwnership = false;
      }
    },

    // Contract Data Methods
    async loadContractData() {
      if (!this.serviceManager) {
        console.error('ServiceManager not available');
        return;
      }

      this.loadingContracts = true;
      try {
        console.log('Loading contract data via ServiceManager (single aggregate)...');
        
        // Single call to get all contract data
        const contractResult = await this.serviceManager.getContractWithSubscriptions(this.collectionId);
        
        if (contractResult.success) {
          this.contractData = contractResult;
          console.log('✅ Contract data loaded:', {
            contracts: contractResult.totalContracts,
            subscriptions: contractResult.totalSubscriptions,
            invoices: contractResult.totalInvoices,
            receipts: contractResult.totalReceipts
          });

          // Calculate statistics from the same data (no additional API call)
          this.contractStats = this.serviceManager.calculateContractStatistics(contractResult);
          console.log('✅ Contract statistics calculated:', this.contractStats);

          // Load contract lifecycle data
          await this.loadContractLifecycles();
        } else {
          console.warn('Failed to load contract data');
          this.contractData = { contracts: [] };
          this.contractStats = this.serviceManager.getEmptyStats();
        }
      } catch (error) {
        console.error('❌ Error loading contract data:', error);
        this.contractData = { contracts: [] };
        this.contractStats = this.serviceManager.getEmptyStats();
        this.showErrorMessage('ไม่สามารถโหลดข้อมูล Contract ได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loadingContracts = false;
      }
    },

    // Contract Lifecycle Methods
    async loadContractLifecycles() {
      if (!this.serviceManager) {
        console.error('ServiceManager not available');
        return;
      }

      this.loadingLifecycles = true;
      try {
        console.log('Loading contract lifecycles...');
        
        // Get lifecycle data for all contracts
        const lifecycleResult = await this.serviceManager.calculateMultipleContractLifecycles(this.collectionId);
        
        if (lifecycleResult.success) {
          this.contractLifecycles = lifecycleResult.contracts;
          this.contractLifecycleStats = lifecycleResult.summary;
          
          console.log('✅ Contract lifecycles loaded:', {
            total: lifecycleResult.summary.total,
            active: lifecycleResult.summary.active,
            expiringSoon: lifecycleResult.summary.expiringSoon,
            averageRemainingDays: lifecycleResult.summary.averageRemainingDays
          });
        } else {
          console.warn('Failed to load contract lifecycles');
          this.contractLifecycles = [];
          this.contractLifecycleStats = null;
        }
      } catch (error) {
        console.error('❌ Error loading contract lifecycles:', error);
        this.contractLifecycles = [];
        this.contractLifecycleStats = null;
      } finally {
        this.loadingLifecycles = false;
      }
    },

    async getContractLifecycle(contractId) {
      if (!this.serviceManager) {
        console.error('ServiceManager not available');
        return null;
      }

      try {
        const lifecycleResult = await this.serviceManager.calculateContractLifecycle(contractId);
        if (lifecycleResult.success) {
          return lifecycleResult.lifecycle;
        }
      } catch (error) {
        console.error('Error getting contract lifecycle:', error);
      }
      return null;
    },

    // Package Management Methods
    async loadAvailablePackages() {
      if (!this.serviceManager || !this.serviceManager.package) {
        console.error('ServiceManager or PackageService not available');
        return;
      }

      this.loadingPackages = true;
      try {
        console.log('Loading available packages via ServiceManager...');
        
        // Use ServiceManager to get available packages
        const packages = await this.serviceManager.package.getAvailable();
        
        if (packages && Array.isArray(packages)) {
          this.availablePackages = packages;
          console.log('✅ Loaded packages:', packages.length);
        } else {
          console.warn('No packages returned or invalid format');
          this.availablePackages = [];
        }
      } catch (error) {
        console.error('❌ Error loading packages:', error);
        this.availablePackages = [];
        
        // Show user-friendly error
        this.showErrorMessage('ไม่สามารถโหลดรายการ Package ได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loadingPackages = false;
      }
    },

    selectPackage(selectedPackage) {
      console.log('Package selected:', selectedPackage);
      
      // Store selected package
      this.selectedPackage = selectedPackage;
      
      // Reset and initialize configuration
      this.packageConfig = {
        billingCycle: selectedPackage.pricing.defaultCycle || 'monthly',
        contractStartDate: new Date().toISOString().split('T')[0], // Today
        trialDays: selectedPackage.trial?.defaultDays || 0,
        autoRenewal: false,
        duration: 12,
        durationType: 'months'
      };
      
      // Close package selection modal and open configuration modal
      this.showPackageAssignmentModal = false;
      this.showPackageConfigModal = true;
    },

    async assignContract() {
      if (!this.selectedPackage || !this.packageConfig) {
        this.showErrorMessage('กรุณาเลือก Package และกำหนดค่าให้ครบถ้วน');
        return;
      }

      // Check ownership information for contract generation
      if (!this.ownershipInfo) {
        const confirmWithoutOwnership = confirm(
          'ไม่พบข้อมูลเจ้าของ การสร้าง Contract และ Invoice อาจไม่สมบูรณ์\n\nต้องการดำเนินการต่อหรือไม่?'
        );
        if (!confirmWithoutOwnership) {
          return;
        }
      }

      try {
        this.loading = true;

        // Calculate actual start date (after trial period)
        const contractStartDate = new Date(this.packageConfig.contractStartDate);
        const actualStartDate = new Date(contractStartDate);
        actualStartDate.setDate(actualStartDate.getDate() + this.packageConfig.trialDays);

        // Prepare data for ServiceManager with ownership information
        const assignmentData = {
          collectionId: this.collection._id,
          packageId: this.selectedPackage._id,
          packageName: this.selectedPackage.name,
          packageDescription: this.selectedPackage.description,
          
          // Pricing from selected cycle
          basePrice: this.getSelectedCyclePrice(),
          currency: 'THB',
          billingCycle: this.packageConfig.billingCycle,
          
          // Contract dates
          contractStartDate: this.packageConfig.contractStartDate,
          startDate: actualStartDate.toISOString(),
          
          // Trial settings
          trialDays: this.packageConfig.trialDays,
          hasTrialPeriod: this.packageConfig.trialDays > 0,
          
          // Contract terms
          duration: this.packageConfig.duration,
          durationType: this.packageConfig.durationType,
          autoRenewal: this.packageConfig.autoRenewal,
          
          // Ownership information for contract and billing
          ownershipInfo: this.ownershipInfo,
          
          createdBy: 'user'
        };

        console.log('🎯 Sending package assignment to ServiceManager:', assignmentData);

        // Call ServiceManager business flow
        const result = await this.serviceManager.assignPackageToCollection(assignmentData);
        
        if (result.success) {
          const trialText = this.packageConfig.trialDays > 0 
            ? ` (รวมระยะเวลาทดลองใช้ ${this.packageConfig.trialDays} วัน)` 
            : '';
          
          this.showSuccessMessage(
            `เลือก Package "${this.selectedPackage.name}" เรียบร้อยแล้ว! ` +
            `รอบบิล: ${this.getBillingCycleText()} ` +
            `เริ่มสัญญา: ${this.formatDate(this.packageConfig.contractStartDate)}${trialText}`
          );
          console.log('🎉 Assignment result:', result);
        } else {
          throw new Error('Package assignment failed');
        }
        
        // Close modal and refresh data
        this.showPackageConfigModal = false;
        this.selectedPackage = null;
        await this.refreshData();

      } catch (error) {
        console.error('❌ Error assigning contract:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการกำหนด Contract กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loading = false;
      }
    },

    cancelPackageConfig() {
      this.showPackageConfigModal = false;
      this.selectedPackage = null;
      this.showPackageAssignmentModal = true; // Go back to package selection
    },

    async confirmPackageSelection(pkg) {
      // Simple confirmation dialog
      const message = `คุณต้องการเลือก Package "${pkg.name}" ราคา ฿${this.formatPrice(pkg.pricing.basePrice)}/เดือน ใช่หรือไม่?`;
      return confirm(message);
    },

    // Handle assign package with contract check
    handleAssignPackage() {
      if (this.hasActiveContract) {
        this.showErrorMessage('มี Contract อยู่แล้ว ไม่สามารถ Assign Package เพิ่มได้');
        return;
      }
      this.showPackageAssignmentModal = true;
    },

    // Navigation methods
    goBackToCollectionDetail() {
      try {
        if (window.history.length > 1 && document.referrer.includes('/collection/detail/')) {
          this.$router.go(-1);
        } else {
          this.$router.push(`/origin/collection/detail/${this.collectionId}`);
        }
      } catch (error) {
        console.error('Error navigating back:', error);
        this.$router.push(`/origin/collection/detail/${this.collectionId}`);
      }
    },

    // Utility methods (using ServiceManager)
    getStatusClass(status) {
      return this.serviceManager.constructor.getStatusClass(status);
    },

    formatDate(dateString) {
      return this.serviceManager.constructor.formatDate(dateString);
    },

    formatPrice(price) {
      return this.serviceManager.constructor.formatPrice(price);
    },

    // Calculate subscription age (days since period start)
    getSubscriptionAge(periodStart) {
      return this.serviceManager.constructor.getSubscriptionAge(periodStart);
    },

    // Calculate remaining days until period end
    getRemainingDays(periodEnd) {
      return this.serviceManager.constructor.getRemainingDays(periodEnd);
    },

    // Get contract next renewal date (from active subscription)
    getContractNextRenewal(contract) {
      return this.serviceManager.constructor.getContractNextRenewal(contract);
    },

    // Format subscription age text
    formatSubscriptionAge(periodStart) {
      return this.serviceManager.constructor.formatSubscriptionAge(periodStart);
    },

    // Get Payment Method Text for display
    getPaymentMethodText(method) {
      const methods = {
        'bank_transfer': 'โอนเงินผ่านธนาคาร',
        'credit_card': 'บัตรเครดิต',
        'debit_card': 'บัตรเดบิต',
        'e_wallet': 'กระเป๋าเงินอิเล็กทรอนิกส์',
        'cash': 'เงินสด',
        'cheque': 'เช็ค',
        'other': 'อื่นๆ'
      };
      return methods[method] || method;
    },

    // Format remaining days text
    formatRemainingDays(periodEnd) {
      return this.serviceManager.constructor.formatRemainingDays(periodEnd);
    },

    // Format contract renewal info (แบบปกติ ไม่มีโบนัส)
    formatContractRenewalInfo(contract) {
      return this.serviceManager.constructor.formatContractRenewalInfo(contract);
    },

    // Package configuration helper methods
    getSelectedCyclePrice() {
      if (!this.selectedPackage || !this.selectedPackage.pricing) {
        return 0;
      }

      const cycle = this.packageConfig.billingCycle;
      const billingCycles = this.selectedPackage.pricing.billingCycles;
      
      if (billingCycles && billingCycles[cycle]) {
        return billingCycles[cycle].price;
      }
      
      return this.selectedPackage.pricing.basePrice || 0;
    },

    // Get price for specific cycle
    getCyclePrice(cycle) {
      if (!this.selectedPackage || !this.selectedPackage.pricing) {
        console.warn('getCyclePrice: No selectedPackage or pricing data');
        return 0;
      }

      console.log('getCyclePrice debug:', {
        cycle,
        selectedPackage: this.selectedPackage,
        pricing: this.selectedPackage.pricing
      });

      const billingCycles = this.selectedPackage.pricing.billingCycles;
      
      if (billingCycles && billingCycles[cycle]) {
        console.log(`getCyclePrice: Found price for ${cycle}:`, billingCycles[cycle].price);
        return billingCycles[cycle].price;
      }
      
      // Fallback: calculate price based on base price and cycle multiplier
      const basePrice = this.selectedPackage.pricing.basePrice || 0;
      
             // If no specific billing cycle pricing, calculate based on multipliers
       // You might want to apply discounts for longer periods
       switch (cycle) {
         case 'monthly':
           return basePrice;
         case 'quarterly':
           // Apply 5% discount for quarterly
           return Math.round(basePrice * 3 * 0.95);
         case 'yearly':
           // Apply 10% discount for yearly
           return Math.round(basePrice * 12 * 0.90);
         default:
           return basePrice;
       }
    },

    getBillingCycleText(cycle = null) {
      const targetCycle = cycle || this.packageConfig.billingCycle;
      return this.serviceManager.constructor.getBillingCycleText(targetCycle);
    },

    getTrialEndDate() {
      return this.serviceManager.constructor.getTrialEndDate(
        this.packageConfig.contractStartDate, 
        this.packageConfig.trialDays
      );
    },

    getBillingStartDate() {
      return this.serviceManager.constructor.getBillingStartDate(
        this.packageConfig.contractStartDate, 
        this.packageConfig.trialDays
      );
    },

    // Status and formatting helper methods
    getStatusText(status) {
      const statusMap = {
        'inactive': 'รอยืนยัน',
        'active': 'ใช้งาน',
        'trial': 'ทดลองใช้',
        'pending_payment': 'รอชำระเงิน',
        'cancelled': 'ยกเลิกแล้ว',
        'expired': 'หมดอายุ',
        'draft': 'ร่าง',
        'paid': 'ชำระแล้ว',
        'sent': 'ส่งแล้ว',
        'overdue': 'เกินกำหนด'
      };
      return statusMap[status] || status;
    },

    // Load Invoice Data
    async loadInvoiceData(invoiceId) {
      try {
        console.log('Loading invoice data for:', invoiceId);
        const result = await this.serviceManager.invoice.getById(invoiceId);
        if (result.success) {
          console.log('Invoice loaded:', result.data);
          // You could update the contract data here or show a modal
          this.$toast.success('โหลดข้อมูล Invoice สำเร็จ');
          } else {
          console.warn('Failed to load invoice:', result.error);
          this.$toast.error('ไม่สามารถโหลดข้อมูล Invoice ได้');
        }
      } catch (error) {
        console.error('Error loading invoice:', error);
        this.$toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล Invoice');
      }
    },

    // Subscription Activation Methods
    handleActivateSubscription(subscription, contract) {
      console.log('Handling subscription activation:', subscription);
      console.log('Subscription._id:', subscription._id);
      console.log('Subscription.metadata:', subscription.metadata);
      
      // Check if this is a renewal subscription
      const isRenewal = subscription.metadata?.source === 'subscription_renewal';
      const previousSubscriptionId = subscription.metadata?.renewedFrom;
      
      console.log('Is renewal:', isRenewal);
      console.log('Previous subscription ID:', previousSubscriptionId);
      
      if (isRenewal && previousSubscriptionId) {
        console.log('This is a renewal subscription, showing renewal activation modal');
        this.showRenewalActivationModal(subscription, contract, previousSubscriptionId);
        } else {
        console.log('This is a regular subscription, showing regular activation modal');
        this.showActivateSubscriptionModal(subscription, contract);
      }
    },

    showActivateSubscriptionModal(subscription, contract) {
      console.log('Showing activate modal for subscription:', subscription);
      console.log('Contract context:', contract);
      this.subscriptionToActivate = subscription;
      this.contractContext = contract;
      
      // Calculate total amount including additional items from invoice
      let totalAmount = subscription.basePrice || 0;
      
      // If subscription has invoice with items, use the invoice total
      if (subscription.invoices && subscription.invoices.length > 0) {
        const latestInvoice = subscription.invoices[0]; // Assuming first is latest
        if (latestInvoice.amount) {
          totalAmount = latestInvoice.amount;
        }
      }
      
      this.activationConfig = {
        // Payment Information
        paymentMethod: '',
        paymentReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentAmount: totalAmount,
        
        // Customer Information - ใช้ข้อมูลจาก ownership หรือ collection เป็น fallback
        customerName: this.getCustomerName(),
        customerEmail: this.getCustomerEmail(),
        customerPhone: this.getCustomerPhone(),
        taxId: this.getCustomerTaxId(),
        
        // Service Configuration
        serviceStartDate: new Date().toISOString().split('T')[0],
        autoRenewal: subscription.metadata?.autoRenewal || false,
        emailNotifications: true,
        smsNotifications: false,
        
        // Additional
        notes: '',
        activatedBy: 'user'
      };
      this.showActivateModal = true;
    },

    // Show activation modal for renewal subscription (reuse same modal)
    showRenewalActivationModal(renewalSubscription, contract, oldSubscriptionId) {
      console.log('Showing renewal activation modal for subscription:', renewalSubscription);
      console.log('Contract context:', contract);
      console.log('Previous subscription ID:', oldSubscriptionId);
      console.log('Renewal subscription _id:', renewalSubscription._id);
      console.log('Renewal subscription id:', renewalSubscription.id);
      
      this.subscriptionToActivate = renewalSubscription;
      this.contractContext = contract;
      this.isRenewalMode = true;
      this.previousSubscriptionId = oldSubscriptionId;
      
      // Calculate total amount including additional items from invoice
      let totalAmount = renewalSubscription.basePrice || 0;
      
      // If subscription has invoice with items, use the invoice total
      if (renewalSubscription.invoices && renewalSubscription.invoices.length > 0) {
        const latestInvoice = renewalSubscription.invoices[0]; // Assuming first is latest
        if (latestInvoice.amount) {
          totalAmount = latestInvoice.amount;
        }
      }
      
      this.activationConfig = {
        // Payment Information
        paymentMethod: '',
        paymentReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentAmount: totalAmount,
        
        // Customer Information - ใช้ข้อมูลจาก ownership หรือ collection เป็น fallback
        customerName: this.getCustomerName(),
        customerEmail: this.getCustomerEmail(),
        customerPhone: this.getCustomerPhone(),
        taxId: this.getCustomerTaxId(),
        
        // Service Configuration
        serviceStartDate: new Date().toISOString().split('T')[0],
        autoRenewal: renewalSubscription.metadata?.autoRenewal || false,
        emailNotifications: true,
        smsNotifications: false,
        
        // Additional
        notes: '',
        activatedBy: 'user'
      };
      this.showActivateModal = true;
    },

    closeActivateModal() {
      this.showActivateModal = false;
      this.subscriptionToActivate = null;
      this.contractContext = null;
      this.isRenewalMode = false;
      this.previousSubscriptionId = null;
      this.activationConfig = {
        // Payment Information
        paymentMethod: '',
        paymentReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentAmount: 0,
        
        // Customer Information
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        taxId: '',
        
        // Service Configuration
        serviceStartDate: new Date().toISOString().split('T')[0],
        autoRenewal: false,
        emailNotifications: true,
        smsNotifications: false,
        
        // Additional
        notes: '',
        activatedBy: 'user'
      };
    },

    async confirmActivateSubscription() {
      if (!this.subscriptionToActivate) {
        this.showErrorMessage('ไม่พบข้อมูล Subscription ที่ต้องการยืนยัน');
        return;
      }

      try {
        this.loading = true;
        
        if (this.isRenewalMode) {
          const subscriptionId = this.subscriptionToActivate._id || this.subscriptionToActivate.id;
          console.log('✅ Confirming renewal subscription:', subscriptionId);
          console.log('Previous subscription ID:', this.previousSubscriptionId);
          await this.confirmRenewalSubscription();
        } else {
          const subscriptionId = this.subscriptionToActivate._id || this.subscriptionToActivate.id;
          console.log('✅ Activating regular subscription:', subscriptionId);
          await this.confirmRegularSubscription();
        }

          } catch (error) {
        console.error('❌ Error in subscription confirmation:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการยืนยัน Subscription กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loading = false;
      }
    },

    async confirmRegularSubscription() {
      console.log('Processing regular subscription activation...');
      
      const activationData = {
        // Payment Information
        paymentMethod: this.activationConfig.paymentMethod,
        paymentReference: this.activationConfig.paymentReference,
        paymentDate: this.activationConfig.paymentDate,
        paymentAmount: this.activationConfig.paymentAmount,
        
        // Customer Information
        customerName: this.activationConfig.customerName,
        customerEmail: this.activationConfig.customerEmail,
        customerPhone: this.activationConfig.customerPhone,
        taxId: this.activationConfig.taxId,
        
        // Service Configuration
        serviceStartDate: this.activationConfig.serviceStartDate,
        autoRenewal: this.activationConfig.autoRenewal,
        emailNotifications: this.activationConfig.emailNotifications,
        smsNotifications: this.activationConfig.smsNotifications,
        
        // Additional
        notes: this.activationConfig.notes,
        activatedBy: this.activationConfig.activatedBy
      };

      const subscriptionId = this.subscriptionToActivate._id || this.subscriptionToActivate.id;
      const result = await this.serviceManager.activateSubscription(
        subscriptionId, 
        activationData
      );
      
      if (result.success) {
        const statusText = result.updatedData.subscription.status === 'trial' ? 'ทดลองใช้' : 'รอชำระเงิน';
        
        const paymentMethodText = {
          'bank_transfer': 'โอนเงินผ่านธนาคาร',
          'credit_card': 'บัตรเครดิต',
          'debit_card': 'บัตรเดบิต',
          'e_wallet': 'กระเป๋าเงินอิเล็กทรอนิกส์',
          'cash': 'เงินสด',
          'cheque': 'เช็ค',
          'other': 'อื่นๆ'
        }[this.activationConfig.paymentMethod] || this.activationConfig.paymentMethod;

        this.showSuccessMessage(
          `🎉 ยืนยัน Subscription เรียบร้อยแล้ว!\n\n` +
          `📋 ข้อมูลการบริการ:\n` +
          `• Package: ${this.contractContext?.packageName || 'N/A'}\n` +
          `• Period: #${this.subscriptionToActivate.periodNumber || 1} → ${statusText}\n` +
          `• Contract: ${this.contractContext?.contractNumber || 'N/A'}\n\n` +
          `💳 ข้อมูลการชำระเงิน:\n` +
          `• ช่องทาง: ${paymentMethodText}\n` +
          `• จำนวนเงิน: ฿${this.formatPrice(this.activationConfig.paymentAmount)}\n` +
          `• วันที่ชำระ: ${this.formatDate(this.activationConfig.paymentDate)}\n` +
          (this.activationConfig.paymentReference ? `• หมายเลขอ้างอิง: ${this.activationConfig.paymentReference}\n` : '') +
          `\n👤 ลูกค้า: ${this.activationConfig.customerName || 'ไม่ระบุ'}\n` +
          `📅 เริ่มให้บริการ: ${this.formatDate(this.activationConfig.serviceStartDate)}`
        );
      } else {
        throw new Error('Subscription activation failed');
      }

      // Close modal and refresh data
      this.closeActivateModal();
      await this.refreshData();
    },

    async confirmRenewalSubscription() {
      console.log('Processing renewal subscription confirmation...');
      console.log('Subscription to activate:', this.subscriptionToActivate);
      console.log('Subscription ID:', this.subscriptionToActivate?._id);
      console.log('Checking previous subscription:', this.previousSubscriptionId);
      
      // Validate subscription ID
      const subscriptionId = this.subscriptionToActivate?._id || this.subscriptionToActivate?.id;
      if (!subscriptionId) {
        throw new Error('Subscription ID is missing or invalid');
      }
      console.log('Using subscription ID:', subscriptionId);
      
      // Step 1: Get previous subscription และคำนวณวันคงเหลือ
      let previousSubscription = null;
      let remainingDays = 0;
      
      if (this.previousSubscriptionId) {
        try {
          const prevResult = await this.serviceManager.subscription.getById(this.previousSubscriptionId);
          
          // Check if result is the subscription object directly or wrapped in success/data structure
          if (prevResult.success !== undefined) {
            // Result has success property - use standard format
            if (prevResult.success) {
              previousSubscription = prevResult.data;
            }
          } else if (prevResult._id) {
            // Result is the subscription object directly
            previousSubscription = prevResult;
          }
          
          if (previousSubscription) {
            remainingDays = this.getRemainingDays(previousSubscription.periodEnd);
            console.log('Previous subscription found:', previousSubscription);
            console.log('Remaining days:', remainingDays);
          }
      } catch (error) {
          console.warn('Could not fetch previous subscription:', error);
        }
      }

      // Step 2: Prepare renewal activation data
      const renewalActivationData = {
        // Payment Information
        paymentMethod: this.activationConfig.paymentMethod,
        paymentReference: this.activationConfig.paymentReference,
        paymentDate: this.activationConfig.paymentDate,
        paymentAmount: this.activationConfig.paymentAmount,
        
        // Customer Information
        customerName: this.activationConfig.customerName,
        customerEmail: this.activationConfig.customerEmail,
        customerPhone: this.activationConfig.customerPhone,
        taxId: this.activationConfig.taxId,
        
        // Service Configuration
        serviceStartDate: this.activationConfig.serviceStartDate,
        autoRenewal: this.activationConfig.autoRenewal,
        emailNotifications: this.activationConfig.emailNotifications,
        smsNotifications: this.activationConfig.smsNotifications,
        
        // Renewal-specific data
        isRenewal: true,
        previousSubscriptionId: this.previousSubscriptionId,
        remainingDaysBonus: remainingDays,
        
        // Additional
        notes: this.activationConfig.notes,
        activatedBy: this.activationConfig.activatedBy
      };

      // Step 3: Activate new subscription with renewal logic
      const result = await this.serviceManager.activateRenewalSubscription(
        subscriptionId,
        renewalActivationData
      );
      
      if (result.success) {
        const paymentMethodText = {
          'bank_transfer': 'โอนเงินผ่านธนาคาร',
          'credit_card': 'บัตรเครดิต',
          'debit_card': 'บัตรเดบิต',
          'e_wallet': 'กระเป๋าเงินอิเล็กทรอนิกส์',
          'cash': 'เงินสด',
          'cheque': 'เช็ค',
          'other': 'อื่นๆ'
        }[this.activationConfig.paymentMethod] || this.activationConfig.paymentMethod;

        this.showSuccessMessage(
          `🎉 ยืนยันการต่ออายุ Subscription เรียบร้อยแล้ว!\n\n` +
          `📋 ข้อมูลการต่ออายุ:\n` +
          `• Package: ${this.contractContext?.packageName || 'N/A'}\n` +
          `• Period ใหม่: #${this.subscriptionToActivate.periodNumber || 1} → เปิดใช้งาน\n` +
          `• Contract: ${this.contractContext?.contractNumber || 'N/A'}\n` +
          (remainingDays > 0 ? `• วันคงเหลือจาก Subscription เดิม: ${remainingDays} วัน\n` : '') +
          (result.cancelledSubscription ? `• Subscription เดิม: ยกเลิกแล้ว\n` : '') +
          `\n💳 ข้อมูลการชำระเงิน:\n` +
          `• ช่องทาง: ${paymentMethodText}\n` +
          `• จำนวนเงิน: ฿${this.formatPrice(this.activationConfig.paymentAmount)}\n` +
          `• วันที่ชำระ: ${this.formatDate(this.activationConfig.paymentDate)}\n` +
          (this.activationConfig.paymentReference ? `• หมายเลขอ้างอิง: ${this.activationConfig.paymentReference}\n` : '') +
          `\n👤 ลูกค้า: ${this.activationConfig.customerName || 'ไม่ระบุ'}\n` +
          `📅 เริ่มให้บริการ: ${this.formatDate(this.activationConfig.serviceStartDate)}`
        );
      } else {
        throw new Error(result.error || 'Renewal subscription activation failed');
      }

      // Close modal and refresh data
      this.closeActivateModal();
      console.log('🔄 Refreshing data after renewal activation...');
      await this.refreshData();
      console.log('✅ Data refresh completed after renewal');
    },

    // Contract Cancellation Methods
    showCancelContractModal(contract) {
      console.log('Showing cancel modal for contract:', contract);
      this.contractToCancel = contract;
      this.cancellationConfig = {
        type: 'soft',
        reason: '',
        notes: '',
        cancelledBy: 'user'
      };
      this.showCancelModal = true;
    },

    // Contract Edit Methods
    showEditContractModal(contract) {
      console.log('Showing edit modal for contract:', contract);
      // Implementation for editing contract
      this.$toast.info(`แก้ไข Contract: ${contract.contractNumber} (ฟีเจอร์นี้จะพัฒนาในอนาคต)`);
    },

    // Create New Subscription for Contract
    createNewSubscription(contract) {
      console.log('Creating new subscription for contract:', contract);
      // Implementation for creating new subscription
      this.$toast.info(`สร้าง Subscription ใหม่สำหรับ Contract: ${contract.contractNumber} (ฟีเจอร์นี้จะพัฒนาในอนาคต)`);
    },

    closeCancelModal() {
      this.showCancelModal = false;
      this.contractToCancel = null;
      this.cancellationConfig = {
        type: 'soft',
        reason: '',
        notes: '',
        cancelledBy: 'user'
      };
    },

    async confirmCancelContract() {
      if (!this.contractToCancel || !this.cancellationConfig.reason) {
        this.showErrorMessage('กรุณาระบุเหตุผลในการยกเลิก');
        return;
      }

      try {
        this.loading = true;
        console.log('🗑️ Cancelling contract:', this.contractToCancel._id);
        console.log('Cancellation config:', this.cancellationConfig);

        const cancellationData = {
          reason: this.cancellationConfig.reason,
          notes: this.cancellationConfig.notes,
          cancelledBy: this.cancellationConfig.cancelledBy
        };

        let result;
        if (this.cancellationConfig.type === 'hard') {
          // Hard delete - ลบข้อมูลทั้งหมด
          result = await this.serviceManager.cancelContractAndRelatedData(
            this.contractToCancel._id, 
            cancellationData
          );
          
          if (result.success) {
            const summary = `ลบข้อมูลเรียบร้อยแล้ว:
• Contract: 1
• Subscriptions: ${result.deletedData.subscriptions.length}
• Invoices: ${result.deletedData.invoices.length}
• Receipts: ${result.deletedData.receipts.length}`;

            if (result.errors.length > 0) {
              console.warn('Some errors occurred:', result.errors);
              this.showErrorMessage(`ลบข้อมูลส่วนใหญ่เรียบร้อยแล้ว แต่มีข้อผิดพลาดบางส่วน: ${result.errors.join(', ')}`);
            } else {
              this.showSuccessMessage(`ยกเลิก Contract เรียบร้อยแล้ว!\n\n${summary}`);
            }
          } else {
            throw new Error('Contract cancellation failed');
          }
        } else {
          // Soft delete - เปลี่ยนสถานะเป็น cancelled
          result = await this.serviceManager.cancelContract(
            this.contractToCancel._id, 
            cancellationData
          );
          
          if (result.success) {
            this.showSuccessMessage(
              `เปลี่ยนสถานะ Contract เป็น "ยกเลิก" เรียบร้อยแล้ว!\n\n` +
              `• Contract: ${this.contractToCancel.contractNumber}\n` +
              `• Subscriptions ที่อัปเดต: ${result.updatedData.subscriptions.length}`
            );
          } else {
            throw new Error('Contract status update failed');
          }
        }

        // Close modal and refresh data
        this.closeCancelModal();
        await this.refreshData();

      } catch (error) {
        console.error('❌ Error cancelling contract:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการยกเลิก Contract กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loading = false;
      }
    },

    formatDateRange(startDate, endDate) {
      return this.serviceManager.constructor.formatDateRange(startDate, endDate);
    },

    // Invoice Modal Methods
    showInvoiceModal(invoice) {
      console.log('Showing invoice modal:', invoice);
      // ปิด modal อื่นๆ ก่อนเปิด invoice modal
      this.closeAllModals();
      this.selectedInvoice = invoice;
      this.showInvoiceDetailModal = true;
    },

    closeInvoiceModal() {
      this.showInvoiceDetailModal = false;
      this.selectedInvoice = null;
    },

    // ปิด modal ทั้งหมด
    closeAllModals() {
      this.showContractEditModal = false;
      this.showActivateModal = false;
      this.showCancelModal = false;
      this.showRenewModal = false;
      this.showSubscriptionManageModal = false;
      this.showPaymentManageModal = false;
      this.showValidationModal = false;
      this.showFinancialReportModal = false;
      this.showPackageAssignmentModal = false;
      this.showPackageConfigModal = false;
      this.showInvoiceDetailModal = false;
      this.showReceiptDetailModal = false;
    },

    // Handle payment management from Invoice Modal
    handleInvoicePaymentManagement(action, invoice) {
      console.log('🔧 Handling payment management:', action, invoice);
      
      // Set up payment management modal
      this.invoiceToManage = invoice;
      this.paymentManageAction = action;
      
      // Initialize config based on action
      if (action === 'overdue') {
        this.paymentManageConfig.reason = '';
        this.paymentManageConfig.markedBy = 'user';
      } else if (action === 'failed') {
        this.paymentManageConfig.failureReason = '';
        this.paymentManageConfig.paymentMethod = '';
        this.paymentManageConfig.errorCode = '';
        this.paymentManageConfig.errorMessage = '';
        this.paymentManageConfig.maxRetries = 3;
      } else if (action === 'refund') {
        this.paymentManageConfig.refundAmount = invoice.amount || 0;
        this.paymentManageConfig.refundReason = '';
        this.paymentManageConfig.refundType = 'full';
      }
      
      // Close invoice modal and show payment management modal
      this.closeInvoiceModal();
      this.showPaymentManageModal = true;
    },



    // Receipt Modal Methods
    async showReceiptModal(receipt) {
      console.log('🧾 Showing receipt modal:', receipt);
      
      // ปิด modal อื่นๆ ก่อนเปิด receipt modal
      this.closeAllModals();
      
      try {
        // โหลดข้อมูล receipt ใหม่จาก API เพื่อให้ได้ข้อมูลล่าสุด (รวม customerInfo)
        if (this.serviceManager && this.serviceManager.receipt) {
          console.log('🔄 Loading latest receipt data from API...');
          const latestReceiptData = await this.serviceManager.receipt.getById(receipt._id || receipt.id);
          
          if (latestReceiptData) {
            console.log('✅ Latest receipt data loaded:', latestReceiptData);
            console.log('🧾 Customer info in latest receipt:', latestReceiptData.customerInfo);
            this.selectedReceipt = latestReceiptData;
          } else {
            console.warn('⚠️ Could not load latest receipt data, using original');
            this.selectedReceipt = receipt;
          }
        } else {
          console.warn('⚠️ ServiceManager or receipt service not available, using original data');
          this.selectedReceipt = receipt;
        }
      } catch (error) {
        console.error('❌ Error loading latest receipt data:', error);
        console.log('🔄 Fallback to original receipt data');
        this.selectedReceipt = receipt;
      }
      
      this.showReceiptDetailModal = true;
    },

    // Renew Subscription Methods
    showRenewSubscriptionModal(subscription, contract) {
      console.log('Showing renew modal for subscription:', subscription);
      this.subscriptionToRenew = subscription;
      this.renewContractContext = contract;
      
      // Initialize renew config with current subscription data
      this.renewConfig = {
        billingCycle: subscription.billingCycle || 'monthly',
        duration: 1,
        durationType: 'months',
        additionalItems: [],
        basePrice: 0,
        additionalTotal: 0,
        totalAmount: 0,
        paymentMethod: '',
        paymentReference: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentAmount: 0,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        taxId: '',
        serviceStartDate: new Date().toISOString().split('T')[0],
        autoRenewal: subscription.metadata?.autoRenewal || false,
        emailNotifications: true,
        smsNotifications: false,
        notes: '',
        renewedBy: 'user'
      };
      
      this.updateRenewPricing();
      this.showRenewModal = true;
    },

    closeRenewModal() {
      this.showRenewModal = false;
      this.subscriptionToRenew = null;
      this.renewContractContext = null;
      this.renewConfig = {
        billingCycle: 'monthly',
        duration: 1,
        durationType: 'months',
        additionalItems: [],
        basePrice: 0,
        additionalTotal: 0,
        totalAmount: 0,
        autoRenewal: false,
        notes: ''
      };
    },

    // Create Renew Subscription (same flow as regular subscribe)
    async createRenewSubscription() {
      if (!this.subscriptionToRenew || !this.renewContractContext) {
        this.showErrorMessage('ข้อมูล Subscription ไม่ครบถ้วน');
        return;
      }

      try {
        this.loading = true;
        console.log('🔄 Creating renewal subscription:', this.subscriptionToRenew._id);
        console.log('Renew config:', this.renewConfig);

        // คำนวณวันคงเหลือจาก subscription เดิม
        const remainingDays = this.getRemainingDays(this.subscriptionToRenew.periodEnd);
        
        // Prepare renewal data - ใช้ข้อมูลจาก contract เดิมแต่เพิ่ม subscription ใหม่
        const renewalData = {
          // ใช้ collection เดียวกับ subscription เดิม
          collectionId: this.subscriptionToRenew.collectionId,
          packageId: this.subscriptionToRenew.packageId,
          packageName: this.subscriptionToRenew.packageName,
          packageDescription: this.subscriptionToRenew.packageDescription,
          
          // Contract info - ใช้ contract เดิม
          existingContractId: this.subscriptionToRenew.contractId,
          isRenewal: true,
          
          // Billing configuration ใหม่
          billingCycle: this.renewConfig.billingCycle,
          duration: this.renewConfig.duration,
          durationType: this.renewConfig.durationType,
          
          // Pricing ใหม่ (รวม additional items)
          basePrice: this.renewConfig.basePrice,
          additionalItems: this.renewConfig.additionalItems || [],
          additionalTotal: this.renewConfig.additionalTotal,
          totalAmount: this.renewConfig.totalAmount,
          
          // วันคงเหลือจาก subscription เดิม
          remainingDays: remainingDays,
          
          // Service Configuration
          autoRenewal: this.renewConfig.autoRenewal,
          
          // Additional metadata
          notes: this.renewConfig.notes,
          renewedBy: 'user',
          previousSubscriptionId: this.subscriptionToRenew._id,
          
          // Period information
          periodNumber: (this.subscriptionToRenew.periodNumber || 1) + 1,
          startDate: new Date().toISOString(),
          createdBy: 'user'
        };

        // Call ServiceManager to renew subscription
        const result = await this.serviceManager.renewSubscription(renewalData);
        
        if (result.success) {
          this.showSuccessMessage(
            `🎉 ต่ออายุ Subscription เรียบร้อยแล้ว!\n\n` +
            `📋 ข้อมูลการต่ออายุ:\n` +
            `• Package: ${this.renewContractContext?.packageName || 'N/A'}\n` +
            `• Subscription เดิม: จะยกเลิกเมื่อยืนยันการชำระเงิน\n` +
            `• Subscription ใหม่: Period #${result.newSubscription.periodNumber || 1}\n` +
            `• Contract: ${this.renewContractContext?.contractNumber || 'N/A'}\n` +
            `• สถานะ: รอการชำระเงิน\n\n` +
            `📅 วันคงเหลือจาก Subscription เดิม: ${remainingDays} วัน\n` +
            `📅 ระยะเวลาใหม่: ${this.renewConfig.duration} ${this.renewConfig.durationType === 'months' ? 'เดือน' : 'ปี'}\n` +
            `💰 ยอดรวม: ฿${this.formatPrice(this.renewConfig.totalAmount)}\n` +
            (this.renewConfig.additionalItems?.length > 0 ? `📦 รายการเพิ่มเติม: ${this.renewConfig.additionalItems.length} รายการ\n` : '') +
            `\n📄 Invoice: ${result.invoice?.invoiceNumber || 'N/A'}\n` +
            `ℹ️ คุณสามารถกดปุ่ม "ยืนยัน" เพื่อชำระเงินและเปิดใช้งานได้`
          );
        } else {
          throw new Error(result.error || 'Subscription renewal failed');
        }

        // Close modal and refresh data
        this.closeRenewModal();
        await this.refreshData();

      } catch (error) {
        console.error('❌ Error renewing subscription:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการต่ออายุ Subscription กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loading = false;
      }
    },

    getRenewCyclePrice(cycle) {
      if (!this.subscriptionToRenew) return 0;
      
      // Use current subscription's base price as reference
      const basePrice = this.subscriptionToRenew.basePrice || 0;
      
      switch (cycle) {
        case 'monthly':
          return basePrice;
        case 'quarterly':
          return basePrice * 3 * 0.95; // 5% discount
        case 'yearly':
          return basePrice * 12 * 0.9; // 10% discount
        default:
          return basePrice;
      }
    },

    updateRenewPricing() {
      if (!this.subscriptionToRenew) return;
      
      // Calculate base price
      const cyclePrice = this.getRenewCyclePrice(this.renewConfig.billingCycle);
      let totalMonths = this.renewConfig.duration;
      
      if (this.renewConfig.durationType === 'years') {
        totalMonths *= 12;
      }
      
      // Calculate periods based on billing cycle
      let periods = totalMonths;
      if (this.renewConfig.billingCycle === 'quarterly') {
        periods = Math.ceil(totalMonths / 3);
      } else if (this.renewConfig.billingCycle === 'yearly') {
        periods = Math.ceil(totalMonths / 12);
      }
      
      this.renewConfig.basePrice = cyclePrice * periods;
      
      // Calculate additional items total
      this.renewConfig.additionalTotal = this.renewConfig.additionalItems.reduce((total, item) => {
        return total + ((item.quantity || 0) * (item.unitPrice || 0));
      }, 0);
      
      // Calculate total amount
      this.renewConfig.totalAmount = this.renewConfig.basePrice + this.renewConfig.additionalTotal;
    },

    addAdditionalItem() {
      this.renewConfig.additionalItems.push({
        description: '',
        quantity: 1,
        unitPrice: 0
      });
    },

    removeAdditionalItem(index) {
      this.renewConfig.additionalItems.splice(index, 1);
      this.updateRenewPricing();
    },

    closeReceiptModal() {
      this.showReceiptDetailModal = false;
      this.selectedReceipt = null;
    },
    
    // Invoice Modal Helper Methods (using ServiceManager)
    getBasePackageAmount() {
      return this.serviceManager.constructor.getBasePackageAmount(this.selectedInvoice?.items || []);
    },

    getAdditionalItemsAmount() {
      return this.serviceManager.constructor.getAdditionalItemsAmount(this.selectedInvoice?.items || []);
    },

    getAdditionalItemsCount() {
      const items = this.selectedInvoice?.items || [];
      return Math.max(0, items.length - 1);
    },

    hasAdditionalItems() {
      return this.serviceManager.constructor.hasAdditionalItems(this.selectedInvoice?.items || []);
    },

    // Receipt Modal Helper Methods (using ServiceManager)
    getReceiptAdditionalItemsAmount() {
      return this.serviceManager.constructor.getAdditionalItemsAmount(this.selectedReceipt?.items || []);
    },

    hasReceiptAdditionalItems() {
      return this.serviceManager.constructor.hasAdditionalItems(this.selectedReceipt?.items || []);
    },

    // Subscription Activation Modal Helper Methods
    hasSubscriptionAdditionalItems() {
      if (!this.subscriptionToActivate?.invoices || this.subscriptionToActivate.invoices.length === 0) {
        return false;
      }
      
      const latestInvoice = this.subscriptionToActivate.invoices[0];
      return latestInvoice?.items && latestInvoice.items.length > 1;
    },

    getSubscriptionAdditionalAmount() {
      if (!this.hasSubscriptionAdditionalItems()) {
        return 0;
      }
      
      const latestInvoice = this.subscriptionToActivate.invoices[0];
      // Sum all items except the first one (base package)
      return latestInvoice.items.slice(1).reduce((total, item) => {
        return total + (item.amount || 0);
      }, 0);
    },

    getSubscriptionTotalAmount() {
      if (!this.subscriptionToActivate?.invoices || this.subscriptionToActivate.invoices.length === 0) {
        return this.subscriptionToActivate?.basePrice || 0;
      }
      
      const latestInvoice = this.subscriptionToActivate.invoices[0];
      return latestInvoice?.amount || this.subscriptionToActivate?.basePrice || 0;
    },

    getSubscriptionAdditionalItems() {
      if (!this.hasSubscriptionAdditionalItems()) {
        return [];
      }
      
      const latestInvoice = this.subscriptionToActivate.invoices[0];
      // Return all items except the first one (base package)
      return latestInvoice.items.slice(1);
    },

    // Contract Lifecycle Helper Methods
    getContractLifecycleInfo(contractId) {
      if (!this.contractLifecycles || !Array.isArray(this.contractLifecycles)) {
        return null;
      }
      return this.contractLifecycles.find(lifecycle => lifecycle.contractId === contractId);
    },

    getLifecycleStatusText(status) {
      return this.serviceManager.constructor.getLifecycleStatusText(status);
    },

    getRemainingDaysColor(remainingDays) {
      return this.serviceManager.constructor.getRemainingDaysColor(remainingDays);
    },

    // ===== CONTRACT MODIFICATION METHODS =====

    // Open Contract Edit Modal
    openContractEditModal(contract) {
      this.contractToEdit = contract;
      this.contractEditConfig = {
        basePrice: contract.basePrice || 0,
        billingCycle: contract.billingCycle || 'monthly',
        currency: contract.currency || 'THB',
        contractTerms: contract.contractTerms || '',
        modifiedBy: 'user',
        changeReason: ''
      };
      this.showContractEditModal = true;
    },

    // Close Contract Edit Modal
    closeContractEditModal() {
      this.showContractEditModal = false;
      this.contractToEdit = null;
      this.contractEditConfig = {
        basePrice: 0,
        billingCycle: 'monthly',
        currency: 'THB',
        contractTerms: '',
        modifiedBy: 'user',
        changeReason: ''
      };
    },

    // Edit Contract
    async editContract() {
      if (!this.contractToEdit) {
        this.showErrorMessage('ไม่พบข้อมูล Contract ที่ต้องการแก้ไข');
        return;
      }

      try {
        this.loading = true;
        const contractId = this.contractToEdit._id || this.contractToEdit.id;
        
        const result = await this.serviceManager.editContract(contractId, this.contractEditConfig);
        
        if (result.success) {
          this.showSuccessMessage(
            `🎉 แก้ไข Contract เรียบร้อยแล้ว!\n\n` +
            `📋 รายละเอียดการแก้ไข:\n` +
            `• Contract: ${this.contractToEdit.contractNumber}\n` +
            `• Version: ${result.versionHistory.previousVersion} → ${result.versionHistory.version}\n` +
            `• เหตุผล: ${this.contractEditConfig.changeReason}\n` +
            `• แก้ไขโดย: ${this.contractEditConfig.modifiedBy}\n\n` +
            `${result.affectedSubscriptions ? `⚠️ Subscription ที่อาจได้รับผลกระทบ: ${result.affectedSubscriptions.length} รายการ` : ''}`
          );
          
          this.closeContractEditModal();
          await this.refreshData();
        } else {
          throw new Error('Contract modification failed');
        }
      } catch (error) {
        console.error('❌ Error editing contract:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการแก้ไข Contract กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loading = false;
      }
    },

    // Update Contract Pricing
    async updateContractPricing(contractId, pricingData) {
      try {
        this.loading = true;
        const result = await this.serviceManager.updateContractPricing(contractId, pricingData);
        
        if (result.success) {
          this.showSuccessMessage(
            `💰 อัพเดตราคา Contract เรียบร้อยแล้ว!\n\n` +
            `📋 รายละเอียด:\n` +
            `• ราคาเดิม: ฿${this.formatPrice(result.pricingChange.oldPrice)}\n` +
            `• ราคาใหม่: ฿${this.formatPrice(result.pricingChange.newPrice)}\n` +
            `• มีผลตั้งแต่: ${result.pricingChange.effectiveDate}`
          );
          await this.refreshData();
        }
      } catch (error) {
        console.error('❌ Error updating contract pricing:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการอัพเดตราคา Contract');
      } finally {
        this.loading = false;
      }
    },

    // ===== ADVANCED SUBSCRIPTION MANAGEMENT METHODS =====

    // Open Subscription Management Modal
    openSubscriptionManageModal(subscription, action) {
      this.subscriptionToManage = subscription;
      this.subscriptionManageAction = action;
      
      // Reset configurations
      if (action === 'pause' || action === 'resume') {
        this.pauseResumeConfig = {
          pauseStartDate: new Date().toISOString().split('T')[0],
          pauseEndDate: '',
          reason: '',
          pausedBy: 'user',
          resumeDate: new Date().toISOString().split('T')[0],
          resumedBy: 'user'
        };
      } else if (action === 'changePlan') {
        this.planChangeConfig = {
          newPackageId: '',
          newPackageName: '',
          newPrice: subscription.basePrice || 0,
          newBillingCycle: subscription.billingCycle || 'monthly',
          changedBy: 'user'
        };
      }
      
      this.showSubscriptionManageModal = true;
    },

    // Close Subscription Management Modal
    closeSubscriptionManageModal() {
      this.showSubscriptionManageModal = false;
      this.subscriptionToManage = null;
      this.subscriptionManageAction = '';
    },

    // Pause Subscription
    async pauseSubscription() {
      if (!this.subscriptionToManage) {
        this.showErrorMessage('ไม่พบข้อมูล Subscription ที่ต้องการหยุด');
        return;
      }

      try {
        this.loading = true;
        const subscriptionId = this.subscriptionToManage._id || this.subscriptionToManage.id;
        
        const result = await this.serviceManager.pauseSubscription(subscriptionId, this.pauseResumeConfig);
        
        if (result.success) {
          this.showSuccessMessage(
            `⏸️ หยุด Subscription เรียบร้อยแล้ว!\n\n` +
            `📋 รายละเอียด:\n` +
            `• Subscription ID: ${subscriptionId}\n` +
            `• วันที่หยุด: ${this.formatDate(result.pauseDetails.pauseStartDate)}\n` +
            `• เหตุผล: ${this.pauseResumeConfig.reason}\n` +
            `• วันคงเหลือตอนหยุด: ${result.pauseDetails.remainingDaysAtPause} วัน`
          );
          
          this.closeSubscriptionManageModal();
          await this.refreshData();
        }
      } catch (error) {
        console.error('❌ Error pausing subscription:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการหยุด Subscription กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loading = false;
      }
    },

    // Resume Subscription
    async resumeSubscription() {
      if (!this.subscriptionToManage) {
        this.showErrorMessage('ไม่พบข้อมูล Subscription ที่ต้องการเริ่มใหม่');
        return;
      }

      try {
        this.loading = true;
        const subscriptionId = this.subscriptionToManage._id || this.subscriptionToManage.id;
        
        const result = await this.serviceManager.resumeSubscription(subscriptionId, this.pauseResumeConfig);
        
        if (result.success) {
          this.showSuccessMessage(
            `▶️ เริ่ม Subscription ใหม่เรียบร้อยแล้ว!\n\n` +
            `📋 รายละเอียด:\n` +
            `• Subscription ID: ${subscriptionId}\n` +
            `• วันที่เริ่มใหม่: ${this.formatDate(this.pauseResumeConfig.resumeDate)}\n` +
            `• ระยะเวลาที่หยุด: ${result.pauseDuration} วัน\n` +
            `• วันสิ้นสุดใหม่: ${this.formatDate(result.newPeriodEnd)}`
          );
          
          this.closeSubscriptionManageModal();
          await this.refreshData();
        }
      } catch (error) {
        console.error('❌ Error resuming subscription:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการเริ่ม Subscription ใหม่ กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loading = false;
      }
    },

    // Change Subscription Plan
    async changeSubscriptionPlan() {
      if (!this.subscriptionToManage || !this.planChangeConfig.newPackageId) {
        this.showErrorMessage('กรุณาเลือก Package ใหม่');
        return;
      }

      try {
        this.loading = true;
        const subscriptionId = this.subscriptionToManage._id || this.subscriptionToManage.id;
        
        const result = await this.serviceManager.changeSubscriptionPlan(subscriptionId, this.planChangeConfig);
        
        if (result.success) {
          const proratedText = result.proratedAmount > 0 
            ? `เพิ่มเติม ฿${this.formatPrice(result.proratedAmount)}` 
            : result.proratedAmount < 0 
              ? `คืนเงิน ฿${this.formatPrice(Math.abs(result.proratedAmount))}` 
              : 'ไม่มีค่าใช้จ่ายเพิ่มเติม';

          this.showSuccessMessage(
            `🔄 เปลี่ยน Package เรียบร้อยแล้ว!\n\n` +
            `📋 รายละเอียด:\n` +
            `• Package เดิม: ${this.subscriptionToManage.packageName}\n` +
            `• Package ใหม่: ${this.planChangeConfig.newPackageName}\n` +
            `• ราคาเดิม: ฿${this.formatPrice(result.calculationDetails.oldPrice)}\n` +
            `• ราคาใหม่: ฿${this.formatPrice(result.calculationDetails.newPrice)}\n` +
            `• วันคงเหลือ: ${result.calculationDetails.remainingDays} วัน\n` +
            `• ${proratedText}\n` +
            `${result.proratedInvoice ? `• Invoice ID: ${result.proratedInvoice.invoiceNumber}` : ''}`
          );
          
          this.closeSubscriptionManageModal();
          await this.refreshData();
        }
      } catch (error) {
        console.error('❌ Error changing subscription plan:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการเปลี่ยน Package กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loading = false;
      }
    },

    // ===== PAYMENT MANAGEMENT METHODS =====

    // Open Payment Management Modal
    openPaymentManageModal(invoice, action) {
      this.invoiceToManage = invoice;
      this.paymentManageAction = action;
      
      // Reset configuration
      this.paymentManageConfig = {
        reason: '',
        markedBy: 'user',
        failureReason: '',
        paymentMethod: '',
        errorCode: '',
        errorMessage: '',
        maxRetries: 3,
        refundAmount: invoice?.amount || 0,
        refundReason: '',
        refundType: 'full',
        refundMethod: 'original_payment_method',
        cancelSubscription: false,
        processedBy: 'user'
      };
      
      this.showPaymentManageModal = true;
    },

    // Close Payment Management Modal
    closePaymentManageModal() {
      this.showPaymentManageModal = false;
      this.invoiceToManage = null;
      this.paymentManageAction = '';
    },

    // Handle Overdue Invoice
    async handleOverdueInvoice() {
      if (!this.invoiceToManage) {
        this.showErrorMessage('ไม่พบข้อมูล Invoice ที่ต้องการจัดการ');
        return;
      }

      try {
        this.loading = true;
        const invoiceId = this.invoiceToManage._id || this.invoiceToManage.id;
        
        const result = await this.serviceManager.handleOverdueInvoice(invoiceId, {
          reason: this.paymentManageConfig.reason,
          markedBy: this.paymentManageConfig.markedBy
        });
        
        if (result.success) {
          this.showSuccessMessage(
            `💳 จัดการ Invoice เกินกำหนดเรียบร้อยแล้ว!\n\n` +
            `📋 รายละเอียด:\n` +
            `• Invoice: ${this.invoiceToManage.invoiceNumber}\n` +
            `• วันเกินกำหนด: ${result.invoice.overdueDays} วัน\n` +
            `• การดำเนินการ: ${result.actions.join(', ')}\n` +
            `• เหตุผล: ${this.paymentManageConfig.reason}`
          );
          
          this.closePaymentManageModal();
          await this.refreshData();
        }
      } catch (error) {
        console.error('❌ Error handling overdue invoice:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการจัดการ Invoice เกินกำหนด');
      } finally {
        this.loading = false;
      }
    },

    // Handle Failed Payment
    async handleFailedPayment() {
      if (!this.invoiceToManage) {
        this.showErrorMessage('ไม่พบข้อมูล Invoice ที่ต้องการจัดการ');
        return;
      }

      try {
        this.loading = true;
        const invoiceId = this.invoiceToManage._id || this.invoiceToManage.id;
        
        const result = await this.serviceManager.handleFailedPayment(invoiceId, {
          reason: this.paymentManageConfig.failureReason,
          paymentMethod: this.paymentManageConfig.paymentMethod,
          errorCode: this.paymentManageConfig.errorCode,
          errorMessage: this.paymentManageConfig.errorMessage,
          maxRetries: this.paymentManageConfig.maxRetries
        });
        
        if (result.success) {
          this.showSuccessMessage(
            `💳 จัดการการชำระเงินล้มเหลวเรียบร้อยแล้ว!\n\n` +
            `📋 รายละเอียด:\n` +
            `• Invoice: ${this.invoiceToManage.invoiceNumber}\n` +
            `• ครั้งที่ล้มเหลว: ${result.invoice.metadata?.paymentAttempts || 1}\n` +
            `• ${result.retryScheduled ? `วันลองใหม่: ${this.formatDate(result.nextRetryDate)}` : 'หมดจำนวนครั้งที่กำหนด'}\n` +
            `• เหตุผล: ${this.paymentManageConfig.failureReason}`
          );
          
          this.closePaymentManageModal();
          await this.refreshData();
        }
      } catch (error) {
        console.error('❌ Error handling failed payment:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการจัดการการชำระเงินล้มเหลว');
      } finally {
        this.loading = false;
      }
    },

    // Process Refund
    async processRefund() {
      if (!this.invoiceToManage) {
        this.showErrorMessage('ไม่พบข้อมูล Invoice ที่ต้องการคืนเงิน');
        return;
      }

      try {
        this.loading = true;
        const invoiceId = this.invoiceToManage._id || this.invoiceToManage.id;
        
        const result = await this.serviceManager.processRefund(invoiceId, {
          amount: this.paymentManageConfig.refundAmount,
          reason: this.paymentManageConfig.refundReason,
          type: this.paymentManageConfig.refundType,
          method: this.paymentManageConfig.refundMethod,
          cancelSubscription: this.paymentManageConfig.cancelSubscription,
          processedBy: this.paymentManageConfig.processedBy
        });
        
        if (result.success) {
          this.showSuccessMessage(
            `💰 ดำเนินการคืนเงินเรียบร้อยแล้ว!\n\n` +
            `📋 รายละเอียด:\n` +
            `• Invoice เดิม: ${this.invoiceToManage.invoiceNumber}\n` +
            `• จำนวนคืนเงิน: ฿${this.formatPrice(result.refundAmount)}\n` +
            `• ประเภท: ${this.paymentManageConfig.refundType === 'full' ? 'คืนเงินเต็มจำนวน' : 'คืนเงินบางส่วน'}\n` +
            `• Refund Invoice: ${result.refundInvoice.invoiceNumber}\n` +
            `• เหตุผล: ${this.paymentManageConfig.refundReason}\n` +
            `${this.paymentManageConfig.cancelSubscription ? '• ยกเลิก Subscription แล้ว' : ''}`
          );
          
          this.closePaymentManageModal();
          await this.refreshData();
        }
      } catch (error) {
        console.error('❌ Error processing refund:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการดำเนินการคืนเงิน');
      } finally {
        this.loading = false;
      }
    },

    // ===== BUSINESS RULES & VALIDATION METHODS =====

    // Validate Contract Business Rules
    async validateContractBusinessRules(contractData) {
      try {
        this.loading = true;
        const validation = this.serviceManager.validateContractBusinessRules(contractData);
        
        this.validationResults = validation;
        this.validationType = 'contract';
        this.showValidationModal = true;
        
        return validation;
      } catch (error) {
        console.error('❌ Error validating contract business rules:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการตรวจสอบกฎธุรกิจ');
      } finally {
        this.loading = false;
      }
    },

    // Validate Subscription Business Rules
    async validateSubscriptionBusinessRules(subscriptionData) {
      try {
        this.loading = true;
        const validation = await this.serviceManager.validateSubscriptionBusinessRules(subscriptionData);
        
        this.validationResults = validation;
        this.validationType = 'subscription';
        this.showValidationModal = true;
        
        return validation;
      } catch (error) {
        console.error('❌ Error validating subscription business rules:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการตรวจสอบกฎธุรกิจ');
      } finally {
        this.loading = false;
      }
    },

    // Close Validation Modal
    closeValidationModal() {
      this.showValidationModal = false;
      this.validationResults = null;
      this.validationType = '';
    },

    // ===== FINANCIAL HEALTH REPORT METHODS =====

    // Generate Financial Health Report
    async generateFinancialHealthReport() {
      try {
        this.loadingFinancialReport = true;
        this.financialReport = await this.serviceManager.getFinancialHealthReport(this.collectionId);
        this.showFinancialReportModal = true;
      } catch (error) {
        console.error('❌ Error generating financial health report:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการสร้างรายงานสถานะการเงิน');
      } finally {
        this.loadingFinancialReport = false;
      }
    },

    // Close Financial Report Modal
    closeFinancialReportModal() {
      this.showFinancialReportModal = false;
      this.financialReport = null;
    },



    // ===== HELPER METHODS =====

    // Ownership Helper Methods (using ServiceManager)
    getOwnershipDisplayName() {
      return this.serviceManager.constructor.getOwnershipDisplayName(this.ownershipInfo);
    },

    getOwnershipBillingContact() {
      return this.ownershipInfo?.customerInfo || null;
    },

    getOwnershipTaxId() {
      return this.serviceManager.constructor.getCustomerTaxId(this.ownershipInfo);
    },

    getOwnershipAddress() {
      return this.serviceManager.constructor.getOwnershipAddress(this.ownershipInfo);
    },

    isOwnershipCompleteForBilling() {
      return this.serviceManager.constructor.isOwnershipCompleteForBilling(this.ownershipInfo);
    },

    getOwnershipForDocuments() {
      return this.serviceManager.constructor.getOwnershipForDocuments(this.ownershipInfo);
    },

    // Customer Info Helper Methods for Subscription Modal
    getCustomerName() {
      return this.serviceManager.constructor.getCustomerName(this.ownershipInfo, this.collection);
    },

    getCustomerEmail() {
      return this.serviceManager.constructor.getCustomerEmail(this.ownershipInfo, this.collection);
    },

    getCustomerPhone() {
      return this.serviceManager.constructor.getCustomerPhone(this.ownershipInfo, this.collection);
    },

    getCustomerTaxId() {
      return this.serviceManager.constructor.getCustomerTaxId(this.ownershipInfo, this.collection);
    },

    // Validate Invoice Business Rules (enhanced with ownership)
    validateInvoiceBusinessRules(invoice) {
      const validation = this.serviceManager.constructor.validateInvoiceBusinessRules(invoice, this.ownershipInfo);

      // Show validation results
      this.validationResults = validation;
      this.validationType = 'invoice';
      this.showValidationModal = true;

      return validation;
    },

    // Message Methods (Simple implementations)
    // ===== CONTRACT DOCUMENT METHODS =====

    // Open Contract Document Modal
    openContractDocumentModal(contract) {
      console.log('Opening contract document modal for:', contract);
      this.selectedContract = contract;
      this.showContractDocumentModal = true;
    },

    // Close Contract Document Modal
    closeContractDocumentModal() {
      this.showContractDocumentModal = false;
      this.selectedContract = null;
    },

    // Handle Edit Customer Info from Contract Document
    handleEditCustomerInfo() {
      console.log('Redirecting to edit customer info...');
      this.closeContractDocumentModal();
      // Here you could redirect to ownership editing or show ownership modal
      this.showSuccessMessage('กรุณาแก้ไขข้อมูลลูกค้าในหน้า Collection Detail > Ownership');
    },

    // Handle Activate Contract from Contract Document
    async handleActivateContract(contract) {
      console.log('Activating contract from document modal:', contract);
      
      try {
        this.loading = true;
        const result = await this.serviceManager.activateContract(contract._id, {
          activatedBy: 'user',
          activationDate: new Date().toISOString(),
          notes: 'เปิดใช้งานจากใบสัญญา'
        });

        if (result.success) {
          this.showSuccessMessage(
            `✅ เปิดใช้งาน Contract เรียบร้อยแล้ว!\n\n` +
            `📋 รายละเอียด:\n` +
            `• Contract: ${contract.contractNumber}\n` +
            `• Package: ${contract.packageName}\n` +
            `• สถานะ: เปิดใช้งานแล้ว\n` +
            `• เปิดใช้โดย: user`
          );
          
          this.closeContractDocumentModal();
          await this.refreshData();
        } else {
          throw new Error('Contract activation failed');
        }
      } catch (error) {
        console.error('❌ Error activating contract:', error);
        this.showErrorMessage('เกิดข้อผิดพลาดในการเปิดใช้งาน Contract กรุณาลองใหม่อีกครั้ง');
      } finally {
        this.loading = false;
      }
    },

    // ===== UTILITY METHODS =====

    showSuccessMessage(message) {
      // Simple alert for now - can be replaced with toast notification
      alert(`✅ ${message}`);
      console.log('✅ Success:', message);
    },

    showErrorMessage(message) {
      // Simple alert for now - can be replaced with toast notification  
      alert(`❌ ${message}`);
      console.error('❌ Error:', message);
    },

    // ===== SIDEBAR METHODS =====

    // Sidebar methods
    selectFilter(filter) {
      this.activeFilter = filter;
      this.updateSidebarCounts();
    },

    toggleMobileSidebar() {
      this.showMobileSidebar = !this.showMobileSidebar;
    },

    updateSidebarCounts() {
      if (this.contractData && this.contractData.contracts) {
        const contracts = this.contractData.contracts;
        
        this.sidebarMenuItems.forEach(item => {
          switch (item.value) {
            case 'all':
              item.count = contracts.length;
              break;
            case 'active':
              item.count = contracts.filter(c => c.status === 'active').length;
              break;
            case 'inactive':
              item.count = contracts.filter(c => c.status === 'inactive').length;
              break;
            case 'expired':
              item.count = contracts.filter(c => c.status === 'expired').length;
              break;
            case 'pending':
              item.count = contracts.filter(c => c.status === 'pending').length;
              break;
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.package-management-container {
  min-height: 100vh;
  overflow: visible;
}

.sidebar-desktop {
  @apply hidden lg:flex lg:w-64 lg:flex-col;
}

.main-content {
  @apply flex-1 flex flex-col min-w-0 h-full;
}

.content-area {
  @apply flex-1;
}

/* Sidebar menu item active state */
.sidebar-menu-item {
  @apply transition-all duration-200;
}

.sidebar-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
}

.sidebar-menu-item.active::before {
  width: 4px;
}

/* Mobile sidebar animation */
@media (max-width: 1023px) {
  .mobile-sidebar-enter {
    transform: translateX(-100%);
  }
  
  .mobile-sidebar-enter-active {
    transition: transform 0.3s ease-in-out;
  }
  
  .mobile-sidebar-enter-to {
    transform: translateX(0);
  }
  
  .mobile-sidebar-leave {
    transform: translateX(0);
  }
  
  .mobile-sidebar-leave-active {
    transition: transform 0.3s ease-in-out;
  }
  
  .mobile-sidebar-leave-to {
    transform: translateX(-100%);
  }
}

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

button,
.transition-colors {
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .grid {
    gap: 1rem;
  }
  
  .rounded-lg {
    border-radius: 0.5rem;
  }
}
</style>
