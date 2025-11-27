<template>
  <div class="package-dashboard">
    <!-- Statistics Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Contract Statistics -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">Contract กำหนด</h3>
              <p class="text-xs text-gray-500">สัญญาที่มีอยู่</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-2xl font-bold text-blue-600">{{ contractStats?.contracts?.total || 0 }}</span>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-green-600">✅ ใช้งาน: {{ contractStats?.contracts?.active || 0 }}</span>
            <span class="text-yellow-600">⏸️ รอดำเนิน: {{ contractStats?.contracts?.inactive || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Subscription Statistics -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">Subscription กำหนด</h3>
              <p class="text-xs text-gray-500">การสมัครสมาชิก</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-2xl font-bold text-green-600">{{ contractStats?.subscriptions?.total || 0 }}</span>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-green-600">● ใช้งาน: {{ contractStats?.subscriptions?.active || 0 }}</span>
            <span class="text-yellow-600">● รอดำเนิน: {{ contractStats?.subscriptions?.pending_payment || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Invoice Statistics -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">Invoice กำหนด</h3>
              <p class="text-xs text-gray-500">ใบแจ้งหนี้</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-2xl font-bold text-purple-600">{{ contractStats?.invoices?.total || 0 }}</span>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-green-600">💰 ชำระแล้ว: {{ contractStats?.invoices?.paid || 0 }}</span>
            <span class="text-yellow-600">⏰ รอชำระ: {{ contractStats?.invoices?.pending_payment || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Financial Summary -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 rounded-lg mr-3">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">฿{{ formatPrice(contractStats?.financial?.totalRevenue || 0) }}</h3>
              <p class="text-xs text-gray-500">รายได้รวม</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-orange-600">
              💰 รอดำเนิน: ฿{{ formatPrice(contractStats?.financial?.pendingAmount || 0) }}
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import ServiceManager from '../function/ServiceManager.js';

export default {
  name: 'PackageDashboard',
  
  props: {
    contractStats: {
      type: Object,
      default: null
    },
    contractLifecycleStats: {
      type: Object,
      default: null
    },
    availablePackagesCount: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingLifecycles: {
      type: Boolean,
      default: false
    }
  },

  emits: [
    'assign-package',
    'view-financial-report', 
    'refresh-data',
    'refresh-lifecycle'
  ],

  computed: {
    /**
     * จำนวนรายการที่รอดำเนินการ
     */
    pendingCount() {
      if (!this.contractStats) return 0;
      
      return (
        (this.contractStats.contracts?.inactive || 0) +
        (this.contractStats.subscriptions?.pending_payment || 0) +
        (this.contractStats.invoices?.pending_payment || 0) +
        (this.contractStats.invoices?.overdue || 0)
      );
    },

    /**
     * จำนวนรายการที่ดำเนินการเสร็จแล้ว
     */
    completedCount() {
      if (!this.contractStats) return 0;
      
      return (
        (this.contractStats.contracts?.active || 0) +
        (this.contractStats.subscriptions?.active || 0) +
        (this.contractStats.invoices?.paid || 0) +
        (this.contractStats.receipts?.total || 0)
      );
    },

    /**
     * อัตรารายได้ต่อเดือน (ประมาณการ)
     */
    revenueRate() {
      if (!this.contractStats?.financial?.totalRevenue) return 'N/A';
      
      // ประมาณการรายได้ต่อเดือนจากรายได้รวม
      const totalRevenue = this.contractStats.financial.totalRevenue;
      const activeContracts = this.contractStats.contracts?.active || 1;
      const monthlyRate = totalRevenue / Math.max(activeContracts, 1);
      
      return `฿${this.formatPrice(monthlyRate)}`;
    },

    /**
     * คะแนนสุขภาพของระบบ (0-100)
     */
    healthScore() {
      if (!this.contractStats) return 0;
      
      let score = 100;
      
      // ลดคะแนนตามปัญหาต่างๆ
      const overdueInvoices = this.contractStats.invoices?.overdue || 0;
      const totalInvoices = this.contractStats.invoices?.total || 1;
      const overdueRate = (overdueInvoices / totalInvoices) * 100;
      
      if (overdueRate > 20) score -= 30;
      else if (overdueRate > 10) score -= 15;
      
      const pendingRate = (this.pendingCount / Math.max(this.completedCount + this.pendingCount, 1)) * 100;
      if (pendingRate > 30) score -= 20;
      else if (pendingRate > 15) score -= 10;
      
      return Math.max(0, Math.round(score));
    },

    /**
     * สีของ Health Score
     */
    healthScoreColor() {
      if (this.healthScore >= 80) return 'text-green-600';
      if (this.healthScore >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
  },

  methods: {
    /**
     * จัดรูปแบบราคา
     */
    formatPrice(price) {
      return ServiceManager.formatPrice(price);
    }
  }
};
</script>

<style scoped>
/* Custom animations */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-soft {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Hover effects */
.group:hover .group-hover\:bg-indigo-200 {
  background-color: rgb(199 210 254);
}

.group:hover .group-hover\:bg-green-200 {
  background-color: rgb(187 247 208);
}

.group:hover .group-hover\:bg-gray-200 {
  background-color: rgb(229 231 235);
}
</style> 