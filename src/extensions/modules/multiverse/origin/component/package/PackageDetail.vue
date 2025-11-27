<script>
import feather from 'feather-icons';
import storageManager from '@/plugins/storage';
import moment from 'moment';
moment().format();

export default {
  inject: ['apiServer'],
  data() {
    return {
      hostkey: this.$Key,
      packageData: {},
      collections: [],
      packageId: this.$route.params.id,
      loading_sources: true,
      activeTab: 'detail',
      lastRefresh: null,
      notifications: [],
      showQuickActions: false,
      quickActions: [
        { name: 'แก้ไขข้อมูล', icon: 'edit', action: 'edit' },
        { name: 'โคลนข้อมูล', icon: 'copy', action: 'clone' },
        { name: 'ส่งออกข้อมูล', icon: 'download', action: 'export' },
        { name: 'รีเฟรชข้อมูล', icon: 'refresh', action: 'refresh' }
      ],
      tabs: [
        { code: 'detail', name: 'รายละเอียด', description: 'ข้อมูลทั่วไปของ Package' },
        { code: 'pricing', name: 'แผนราคา', description: 'รายละเอียดแผนราคาและการเรียกเก็บเงิน' },
        { code: 'collections', name: 'Collections', description: 'รายการ Collection ที่ใช้ Package นี้' },
        { code: 'analytics', name: 'สถิติการใช้งาน', description: 'ข้อมูลการใช้งานและสถิติ' }
      ]
    }
  },
  methods: {
    dateTime(value) {
      return moment(value).format("DD/MM/YYYY hh:mm:ss");
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    formatPrice(price) {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    },
    getDefaultPrice() {
      if (!this.packageData.pricing) return 0;
      const defaultCycle = this.packageData.pricing.billingCycles?.find(
        cycle => cycle.type === this.packageData.pricing.defaultCycle
      );
      return defaultCycle ? defaultCycle.price : (this.packageData.pricing.basePrice || 0);
    },
    getBillingCycleIcon(type) {
      const icons = {
        monthly: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        quarterly: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        yearly: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      };
      return icons[type] || icons.monthly;
    },
    getDiscountColor(discount) {
      if (discount >= 15) return 'text-red-600 bg-red-50';
      if (discount >= 10) return 'text-orange-600 bg-orange-50';
      if (discount > 0) return 'text-yellow-600 bg-yellow-50';
      return 'text-gray-600 bg-gray-50';
    },
    getStatusColor(status) {
      const colors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800'
      };
      return colors[status] || colors.active;
    },
    getRelativeTime(date) {
      return moment(date).fromNow();
    },
    addNotification(type, message) {
      const notification = {
        id: Date.now() + Math.random(),
        type,
        message,
        timestamp: new Date()
      };
      this.notifications.unshift(notification);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 5000);
    },
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    },
    refreshData() {
      this.lastRefresh = new Date();
      this.getData();
      this.addNotification('success', 'รีเฟรชข้อมูลสำเร็จ');
    },
    exportData() {
      const data = {
        package: this.packageData,
        collections: this.collections,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `package-${this.packageData.name}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      this.addNotification('success', 'ส่งออกข้อมูลสำเร็จ');
    },
    async clonePackage() {
      try {
        this.addNotification('info', 'กำลังโคลนข้อมูล Package...');
        
        // Create a new package object based on current package data
        const clonedPackageData = {
          ...this.packageData,
          name: `${this.packageData.name} (Copy)`,
          _id: undefined, // Remove ID to create new record
          createdAt: undefined,
          updatedAt: undefined
        };

        // Send request to create new package
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/package", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'client-token-key': this.hostkey 
          },
          body: JSON.stringify({
            data: clonedPackageData
          })
        });

        if (response.ok) {
          const newPackage = await response.json();
          this.addNotification('success', 'โคลน Package สำเร็จ');
          
          // Navigate to the new cloned package
          setTimeout(() => {
            this.$router.push(`/origin/package/detail/${newPackage._id}`);
          }, 1500);
        } else {
          throw new Error('Failed to clone package');
        }
      } catch (error) {
        console.error('Clone error:', error);
        this.addNotification('error', 'เกิดข้อผิดพลาดในการโคลน Package');
      }
    },
    async handleQuickAction(action) {
      this.showQuickActions = false;
      
      switch (action) {
        case 'edit':
          this.$router.push(`/origin/package/edit/${this.packageId}`);
          break;
        case 'clone':
          await this.clonePackage();
          break;
        case 'export':
          this.exportData();
          break;
        case 'refresh':
          this.refreshData();
          break;
      }
    },
    async getData() {
      if (storageManager.get('session', 'login')) {
        try {
          this.loading_sources = false;
          
          // Get package data
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/package/" + this.packageId, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'client-token-key': this.hostkey },
          });

          const packageData = await resAPI.json();
          console.log("packageData", packageData);

          if (resAPI.status === 200) {
            // Get collections using this package
            const collectionsRes = await this.getCollectionsData();
            console.log("collectionsRes", collectionsRes);

            this.packageData = packageData;
            this.collections = collectionsRes || [];
            this.loading_sources = true;
          }

        } catch (error) {
          console.log(error);
          this.loading_sources = true;
        }
      }
    },
    async getCollectionsData() {
      try {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/hostname/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'client-token-key': this.hostkey },
          body: JSON.stringify({
            method: 'find',
            args: [
              {
                $and: [
                  { siteType: 'collection' },
                  { packageId: this.packageId }
                ]
              }
            ]
          })
        });

        const collectionsData = await resAPI.json();
        return collectionsData;

      } catch (error) {
        console.log(error);
        return [];
      }
    },
    updated() {
      feather.replace();
    },
  },
  async mounted() {
    try {
      await this.getData();
    } catch (error) {
      console.log(error);
    }
  },
  setup() {
    //console.log("Setup");
  },
};
</script>

<template>
  <div class="package-detail min-h-screen bg-gray-50">
    
    <!-- Loading Overlay -->
    <transition 
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="!loading_sources" class="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-lg p-6 mx-4">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">กำลังโหลดข้อมูล</h3>
              <p class="text-xs text-gray-500">โปรดรอสักครู่...</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <transition-group 
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div v-for="notification in notifications" :key="notification.id"
             :class="{
               'bg-green-50 border-green-200 text-green-800': notification.type === 'success',
               'bg-red-50 border-red-200 text-red-800': notification.type === 'error',
               'bg-yellow-50 border-yellow-200 text-yellow-800': notification.type === 'warning',
               'bg-blue-50 border-blue-200 text-blue-800': notification.type === 'info'
             }"
             class="max-w-sm p-4 border rounded-lg shadow-lg">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">{{ notification.message }}</p>
            <button @click="removeNotification(notification.id)" class="ml-2 text-gray-400 hover:text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button 
              @click="$router.push('/origin/package')"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Package Detail</h1>
              <p class="text-sm text-gray-600">จัดการและดูรายละเอียด Package</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center text-xs text-gray-500">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              System Online
            </div>
            
            <!-- Quick Actions Dropdown -->
            <div class="relative">
              <button 
                @click="showQuickActions = !showQuickActions"
                class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Quick Actions
                <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <div v-if="showQuickActions" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div class="py-1">
                  <button 
                    v-for="action in quickActions" 
                    :key="action.action"
                    @click="handleQuickAction(action.action)"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="action.icon === 'edit'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      <path v-else-if="action.icon === 'copy'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      <path v-else-if="action.icon === 'download'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      <path v-else-if="action.icon === 'refresh'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    {{ action.name }}
                  </button>
                </div>
              </div>
            </div>
            
            <button
              @click="refreshData"
              :disabled="!loading_sources"
              class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg 
                :class="['mr-2 h-4 w-4', { 'animate-spin': !loading_sources }]" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="bg-white">
      <div class="pl-6 pr-6 pt-6">
        <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div class="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-semibold text-gray-900">{{ packageData.name }}</h1>
            <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
              <p class="text-gray-500 text-sm">
                สร้างเมื่อ {{ dateTime(packageData.createdAt) }}
              </p>
              <span :class="getStatusColor(packageData.status ? 'active' : 'inactive')" class="inline-block px-2 py-1 text-xs font-medium rounded-full w-fit">
                {{ packageData.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
              </span>
              <p v-if="lastRefresh" class="text-gray-400 text-xs">
                อัพเดทล่าสุด: {{ getRelativeTime(lastRefresh) }}
              </p>
            </div>
          </div>
          
          <!-- Quick Stats -->
          <div class="flex space-x-8 text-sm">
            <div>
              <div class="text-lg font-medium text-gray-900">{{ formatPrice(getDefaultPrice()) }}</div>
              <div class="text-gray-500">ราคาเริ่มต้น</div>
            </div>
            <div>
              <div class="text-lg font-medium text-gray-900">{{ collections.length || 0 }}</div>
              <div class="text-gray-500">Collections</div>
            </div>
            <div>
              <div class="text-lg font-medium text-gray-900">{{ packageData.pricing?.billingCycles?.length || 0 }}</div>
              <div class="text-gray-500">แผนราคา</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mt-4">
          <nav class="flex space-x-8 border-b border-gray-200">
            <button
              v-for="tab in tabs"
              :key="tab.code"
              :class="{ 
                'border-gray-900 text-gray-900': activeTab === tab.code, 
                'border-transparent text-gray-500 hover:text-gray-700': activeTab !== tab.code 
              }"
              class="py-3 px-1 border-b-2 font-medium text-sm transition-colors"
              @click="activeTab = tab.code"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 md:px-6 py-6">
      
      <!-- Detail Tab -->
      <section v-if="activeTab === 'detail'" class="animate-fade-in">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Package Information -->
            <div class="bg-white border rounded p-4">
              <h2 class="text-lg font-medium text-gray-900 mb-4">ข้อมูล Package</h2>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt class="text-sm text-gray-500">ชื่อ Package</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ packageData.name }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500">ราคาพื้นฐาน</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatPrice(packageData.pricing?.basePrice || 0) }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500">แผนราคาเริ่มต้น</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ packageData.pricing?.billingCycles?.find(c => c.type === packageData.pricing?.defaultCycle)?.label || 'ไม่ระบุ' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500">สถานะ</dt>
                  <dd class="mt-1">
                    <span :class="getStatusColor(packageData.status ? 'active' : 'inactive')" class="inline-flex items-center px-2 py-1 rounded text-xs">
                      {{ packageData.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                    </span>
                  </dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm text-gray-500">คำอธิบาย</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ packageData.description || 'ไม่มีคำอธิบาย' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Pricing Plans Section -->
            <div v-if="packageData.pricing?.billingCycles?.length" class="bg-white rounded-lg border border-gray-200 hover-lift">
              <div class="p-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">แผนราคา</h2>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div v-for="cycle in packageData.pricing.billingCycles" :key="cycle.type" 
                       :class="['relative rounded-lg border-2 p-4 transition-all hover:shadow-md', 
                                cycle.type === packageData.pricing.defaultCycle ? 'border-purple-500 bg-purple-50' : 'border-gray-200']">
                    
                    <!-- Default Badge -->
                    <div v-if="cycle.type === packageData.pricing.defaultCycle" 
                         class="absolute -top-2 left-4 bg-purple-500 text-white px-2 py-1 text-xs font-medium rounded">
                      แนะนำ
                    </div>
                    
                    <!-- Discount Badge -->
                    <div v-if="cycle.discount > 0" 
                         :class="['absolute -top-2 right-4 px-2 py-1 text-xs font-medium rounded', getDiscountColor(cycle.discount)]">
                      ประหยัด {{ cycle.discount }}%
                    </div>

                    <div class="flex items-center mb-3">
                      <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getBillingCycleIcon(cycle.type)"/>
                      </svg>
                      <h3 class="text-lg font-semibold text-gray-900">{{ cycle.label }}</h3>
                    </div>
                    
                    <div class="mb-3">
                      <span class="text-2xl font-bold text-gray-900">{{ formatPrice(cycle.price) }}</span>
                      <span class="text-gray-500 text-sm ml-1">/ {{ cycle.duration }} วัน</span>
                    </div>
                    
                    <div class="text-sm text-gray-600 mb-3">
                      <p>ระยะเวลา: {{ cycle.duration }} วัน</p>
                      <p v-if="cycle.discount > 0" class="text-green-600 font-medium">
                        ประหยัด: {{ formatPrice(packageData.pricing.basePrice * (cycle.duration / 30) - cycle.price) }}
                      </p>
                    </div>
                    
                    <!-- Price per day calculation -->
                    <div class="text-xs text-gray-500 border-t pt-2">
                      ราคาต่อวัน: {{ formatPrice(Math.round(cycle.price / cycle.duration)) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Limits Section -->
            <div class="bg-white rounded-lg border border-gray-200 hover-lift">
              <div class="p-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">ข้อจำกัดการใช้งาน</h2>
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Assets สูงสุด</p>
                        <p class="text-xl font-bold text-blue-600">{{ packageData.limits?.maxAssets || 'ไม่จำกัด' }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">ผู้ใช้สูงสุด</p>
                        <p class="text-xl font-bold text-green-600">{{ packageData.limits?.maxUsers || 'ไม่จำกัด' }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0V4a1 1 0 011-1h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4z"/>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">พื้นที่จัดเก็บ</p>
                        <p class="text-xl font-bold text-purple-600">{{ packageData.limits?.storageGB || 'ไม่จำกัด' }} GB</p>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Bandwidth</p>
                        <p class="text-xl font-bold text-orange-600">{{ packageData.limits?.bandwidth || 'ไม่จำกัด' }} GB/เดือน</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Feature toggles -->
                <div v-if="packageData.limits" class="mt-6">
                  <h4 class="text-sm font-medium text-gray-500 mb-3">คุณสมบัติพิเศษ</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="flex items-center">
                      <svg 
                        :class="packageData.limits?.customDomain ? 'text-green-500' : 'text-red-500'" 
                        class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="packageData.limits?.customDomain" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      <span class="text-sm text-gray-700">Custom Domain</span>
                    </div>

                    <div class="flex items-center">
                      <svg 
                        :class="packageData.limits?.sslCertificate ? 'text-green-500' : 'text-red-500'" 
                        class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="packageData.limits?.sslCertificate" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      <span class="text-sm text-gray-700">SSL Certificate</span>
                    </div>

                    <div class="flex items-center">
                      <svg 
                        :class="packageData.limits?.apiAccess ? 'text-green-500' : 'text-red-500'" 
                        class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="packageData.limits?.apiAccess" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      <span class="text-sm text-gray-700">API Access</span>
                    </div>

                    <div class="flex items-center">
                      <svg 
                        :class="packageData.limits?.prioritySupport ? 'text-green-500' : 'text-red-500'" 
                        class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="packageData.limits?.prioritySupport" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      <span class="text-sm text-gray-700">Priority Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features Section -->
            <div v-if="packageData.features && packageData.features.length > 0" class="bg-white rounded-lg border border-gray-200 hover-lift">
              <div class="p-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">คุณสมบัติเพิ่มเติม</h2>
                <ul class="space-y-3">
                  <li v-for="(feature, index) in packageData.features" :key="index" class="flex items-center">
                    <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-sm text-gray-700">{{ feature }}</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            
            <!-- Quick Actions -->
            <div class="bg-white rounded-lg border border-gray-200 hover-lift">
              <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">การจัดการ</h3>
                <div class="space-y-3">
                  <button 
                    @click="$router.push(`/origin/package/edit/${packageId}`)"
                    class="w-full flex items-center px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    แก้ไขข้อมูล
                  </button>
                  <button 
                    @click="exportData"
                    class="w-full flex items-center px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    ส่งออกข้อมูล
                  </button>
                </div>
              </div>
            </div>

            <!-- Package Statistics -->
            <div class="bg-white rounded-lg border border-gray-200 hover-lift">
              <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">สถิติการใช้งาน</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"/>
                      </svg>
                      <span class="text-sm font-medium text-gray-700">Collections</span>
                    </div>
                    <span class="text-lg font-bold text-blue-600">{{ collections.length }}</span>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span class="text-sm font-medium text-gray-700">สร้างเมื่อ</span>
                    </div>
                    <span class="text-sm text-gray-600">{{ dateTime(packageData.createdAt) }}</span>
                  </div>

                  <div v-if="packageData.updatedAt" class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      <span class="text-sm font-medium text-gray-700">แก้ไขล่าสุด</span>
                    </div>
                    <span class="text-sm text-gray-600">{{ dateTime(packageData.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- Pricing Tab -->
      <section v-if="activeTab === 'pricing'" class="animate-fade-in">
        <div class="space-y-6">
          
          <!-- Pricing Overview -->
          <div class="bg-white rounded-lg border border-gray-200 hover-lift">
            <div class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">ภาพรวมราคา</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div class="flex items-center">
                    <svg class="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-500">ราคาพื้นฐาน</p>
                      <p class="text-xl font-bold text-blue-600">{{ formatPrice(packageData.pricing?.basePrice || 0) }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <div class="flex items-center">
                    <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-500">แผนราคา</p>
                      <p class="text-xl font-bold text-green-600">{{ packageData.pricing?.billingCycles?.length || 0 }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4">
                  <div class="flex items-center">
                    <svg class="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-500">ส่วนลดสูงสุด</p>
                      <p class="text-xl font-bold text-purple-600">
                        {{ Math.max(...(packageData.pricing?.billingCycles?.map(c => c.discount) || [0])) }}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Billing Cycles Detail -->
          <div v-if="packageData.pricing?.billingCycles?.length" class="bg-white rounded-lg border border-gray-200 hover-lift">
            <div class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">รายละเอียดแผนราคา</h2>
              
              <div class="space-y-4">
                <div v-for="cycle in packageData.pricing.billingCycles" :key="cycle.type" 
                     class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                  
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center">
                      <div :class="['w-10 h-10 rounded-full flex items-center justify-center mr-4',
                                   cycle.type === packageData.pricing.defaultCycle ? 'bg-purple-100' : 'bg-gray-100']">
                        <svg :class="['w-5 h-5', cycle.type === packageData.pricing.defaultCycle ? 'text-purple-600' : 'text-gray-600']" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getBillingCycleIcon(cycle.type)"/>
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                          {{ cycle.label }}
                          <span v-if="cycle.type === packageData.pricing.defaultCycle" 
                                class="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                            แนะนำ
                          </span>
                        </h3>
                        <p class="text-sm text-gray-500">ระยะเวลา {{ cycle.duration }} วัน</p>
                      </div>
                    </div>
                    
                    <div class="text-right">
                      <div class="text-2xl font-bold text-gray-900">{{ formatPrice(cycle.price) }}</div>
                      <div v-if="cycle.discount > 0" :class="['text-sm font-medium', getDiscountColor(cycle.discount)]">
                        ประหยัด {{ cycle.discount }}%
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">ราคาต่อวัน:</span>
                      <div class="font-medium">{{ formatPrice(Math.round(cycle.price / cycle.duration)) }}</div>
                    </div>
                    <div>
                      <span class="text-gray-500">ราคาต่อเดือน:</span>
                      <div class="font-medium">{{ formatPrice(Math.round(cycle.price / (cycle.duration / 30))) }}</div>
                    </div>
                    <div v-if="cycle.discount > 0">
                      <span class="text-gray-500">จำนวนที่ประหยัด:</span>
                      <div class="font-medium text-green-600">
                        {{ formatPrice(packageData.pricing.basePrice * (cycle.duration / 30) - cycle.price) }}
                      </div>
                    </div>
                    <div>
                      <span class="text-gray-500">ประเภท:</span>
                      <div class="font-medium capitalize">{{ cycle.type }}</div>
                    </div>
                  </div>

                  <!-- Progress bar for discount -->
                  <div v-if="cycle.discount > 0" class="mt-4">
                    <div class="flex justify-between text-xs text-gray-500 mb-1">
                      <span>ส่วนลด</span>
                      <span>{{ cycle.discount }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div :class="['h-2 rounded-full', getDiscountColor(cycle.discount)]" 
                           :style="`width: ${Math.min(cycle.discount, 20) * 5}%`"></div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <!-- Price Comparison -->
          <div v-if="packageData.pricing?.billingCycles?.length > 1" class="bg-white rounded-lg border border-gray-200 hover-lift">
            <div class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">เปรียบเทียบราคา</h2>
              
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แผน</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระยะเวลา</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคารวม</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาต่อวัน</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ส่วนลด</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประหยัด</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="cycle in packageData.pricing.billingCycles" :key="cycle.type"
                        :class="cycle.type === packageData.pricing.defaultCycle ? 'bg-purple-50' : ''">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <span class="text-sm font-medium text-gray-900">{{ cycle.label }}</span>
                          <span v-if="cycle.type === packageData.pricing.defaultCycle" 
                                class="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                            แนะนำ
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ cycle.duration }} วัน</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ formatPrice(cycle.price) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatPrice(Math.round(cycle.price / cycle.duration)) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span v-if="cycle.discount > 0" :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getDiscountColor(cycle.discount)]">
                          {{ cycle.discount }}%
                        </span>
                        <span v-else class="text-sm text-gray-500">-</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        <span v-if="cycle.discount > 0">
                          {{ formatPrice(packageData.pricing.basePrice * (cycle.duration / 30) - cycle.price) }}
                        </span>
                        <span v-else class="text-gray-500">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- Collections Tab -->
      <section v-if="activeTab === 'collections'" class="animate-fade-in">
        <div class="bg-white rounded-lg border border-gray-200 hover-lift">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Collections ที่ใช้ Package นี้</h2>
                <p class="text-gray-500 text-sm mt-1">รายการ Collection ที่เลือกใช้ Package นี้</p>
              </div>
              <div class="text-sm text-gray-500">
                ทั้งหมด {{ collections.length }} รายการ
              </div>
            </div>
          </div>
          
          <div class="border-t border-gray-100">
            <div v-if="collections.length === 0" class="p-12 text-center">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มี Collection</h3>
              <p class="text-gray-500">ยังไม่มี Collection ใดที่ใช้ Package นี้</p>
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div v-for="(collection, index) in collections" :key="index" 
                   class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-center space-x-4">
                  <img class="w-12 h-12 rounded-lg object-cover" :src="collection.loginLogo || 'https://via.placeholder.com/48'" alt="">
                  <div class="flex-1 min-w-0">
                    <p class="text-lg font-medium text-gray-900 truncate">
                      <a :href="`/origin/collection/detail/${collection._id}`" class="hover:text-indigo-600 transition-colors">
                        {{ collection.siteName }}
                      </a>
                    </p>
                    <p class="text-sm text-gray-500 truncate">{{ collection.hostname }}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <span class="text-xs text-gray-400">ID: {{ collection._id }}</span>
                      <span class="text-xs text-gray-400">สร้างเมื่อ: {{ dateTime(collection.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <a :href="`/origin/collection/detail/${collection._id}`" 
                       class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      ดูรายละเอียด
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Analytics Tab -->
      <section v-if="activeTab === 'analytics'" class="animate-fade-in">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg border border-gray-200 hover-lift">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">การใช้งานโดยรวม</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-700">Collections ทั้งหมด</span>
                  <span class="text-lg font-bold text-blue-600">{{ collections.length }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-700">สถานะ Package</span>
                  <span :class="getStatusColor(packageData.status ? 'active' : 'inactive')" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ packageData.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </span>
                </div>
                <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-700">แผนราคา</span>
                  <span class="text-lg font-bold text-purple-600">{{ packageData.pricing?.billingCycles?.length || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 hover-lift">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">ข้อมูลราคา</h3>
              <div class="space-y-4">
                <div class="p-3 bg-indigo-50 rounded-lg">
                  <p class="text-sm font-medium text-gray-700">ราคาพื้นฐาน</p>
                  <p class="text-lg font-bold text-indigo-600">{{ formatPrice(packageData.pricing?.basePrice || 0) }}</p>
                </div>
                <div class="p-3 bg-emerald-50 rounded-lg">
                  <p class="text-sm font-medium text-gray-700">แผนเริ่มต้น</p>
                  <p class="text-sm text-gray-600">
                    {{ packageData.pricing?.billingCycles?.find(c => c.type === packageData.pricing?.defaultCycle)?.label || 'ไม่ระบุ' }}
                  </p>
                </div>
                <div v-if="packageData.pricing?.billingCycles?.some(c => c.discount > 0)" class="p-3 bg-red-50 rounded-lg">
                  <p class="text-sm font-medium text-gray-700">ส่วนลดสูงสุด</p>
                  <p class="text-lg font-bold text-red-600">
                    {{ Math.max(...(packageData.pricing?.billingCycles?.map(c => c.discount) || [0])) }}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
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

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Enhanced button styles */
.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #fecaca;
}

.btn-danger:hover {
  background-color: #fee2e2;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.btn-icon {
  padding: 0.5rem;
  color: #9ca3af;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

/* Info card styling */
.info-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.info-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
  transform: translateY(-1px);
}

/* Copy button */
.copy-btn {
  color: #9ca3af;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

/* Enhanced status badge */
.status-badge-enhanced {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
}

/* Status badge colors */
.status-badge-enhanced.bg-green-100 {
  background-color: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.status-badge-enhanced.bg-green-100 .status-dot {
  background-color: #22c55e;
}

.status-badge-enhanced.bg-yellow-100 {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.status-badge-enhanced.bg-yellow-100 .status-dot {
  background-color: #f59e0b;
}

.status-badge-enhanced.bg-red-100 {
  background-color: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.status-badge-enhanced.bg-red-100 .status-dot {
  background-color: #ef4444;
}

/* Shadow utility */
.shadow-soft {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* Enhanced animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Simple scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 0.25rem;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 0.25rem;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Simple transitions */
button,
.transition-colors {
  transition: all 0.2s ease;
}

/* Hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Loading skeleton */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0f0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Status indicators */
.status-active {
  position: relative;
}

.status-active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid {
    gap: 1rem;
  }
  
  .rounded-lg {
    border-radius: 0.5rem;
  }
}

/* Grid responsive */
.grid-responsive {
  display: grid;
}

@media (max-width: 640px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
