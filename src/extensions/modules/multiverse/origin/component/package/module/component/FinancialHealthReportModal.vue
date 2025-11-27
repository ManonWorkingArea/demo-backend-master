<template>
  <!-- Financial Health Report Modal -->
  <div v-if="show" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="bg-white px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">รายงานสถานะการเงิน</h3>
          </div>
          <button 
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div v-if="financialReport" class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Overall Health Score -->
        <div class="mb-6 text-center">
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div class="text-4xl font-bold mb-2 text-gray-900">
              {{ financialReport.overall.healthScore }}
            </div>
            <div class="text-sm text-gray-600 mb-3">Health Score</div>
            <span :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', getHealthStatusBadgeClass(financialReport.overall.status)]">
              {{ financialReport.overall.status === 'healthy' ? 'สุขภาพดี' : 
                 financialReport.overall.status === 'warning' ? 'ต้องระวัง' : 'วิกฤต' }}
            </span>
          </div>
        </div>

        <!-- Financial Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">รายได้รวม</h4>
            <div class="text-xl font-bold text-gray-900">฿{{ formatPrice(financialReport.overall.totalRevenue) }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">รอชำระ</h4>
            <div class="text-xl font-bold text-gray-700">฿{{ formatPrice(financialReport.overall.pendingAmount) }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">เกินกำหนด</h4>
            <div class="text-xl font-bold text-gray-600">฿{{ formatPrice(financialReport.overall.overdueAmount) }}</div>
          </div>
        </div>

        <!-- Statistics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Contracts -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h4 class="font-medium text-gray-900 mb-3 text-sm">Contracts</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">ทั้งหมด:</span>
                <span class="font-medium text-gray-900">{{ financialReport.contracts.total }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">ใช้งาน:</span>
                <span class="font-medium text-gray-900">{{ financialReport.contracts.active }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">อัตราใช้งาน:</span>
                <span class="font-medium text-gray-900">{{ financialReport.contracts.activePercentage }}%</span>
              </div>
            </div>
          </div>

          <!-- Subscriptions -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h4 class="font-medium text-gray-900 mb-3 text-sm">Subscriptions</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">ทั้งหมด:</span>
                <span class="font-medium text-gray-900">{{ financialReport.subscriptions.total }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">ใช้งาน:</span>
                <span class="font-medium text-gray-900">{{ financialReport.subscriptions.active }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">ทดลองใช้:</span>
                <span class="font-medium text-gray-900">{{ financialReport.subscriptions.trial }}</span>
              </div>
            </div>
          </div>

          <!-- Invoices -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h4 class="font-medium text-gray-900 mb-3 text-sm">Invoices</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">ทั้งหมด:</span>
                <span class="font-medium text-gray-900">{{ financialReport.invoices.total }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">ชำระแล้ว:</span>
                <span class="font-medium text-gray-900">{{ financialReport.invoices.paid }} ({{ financialReport.invoices.paidPercentage }}%)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">เกินกำหนด:</span>
                <span class="font-medium text-gray-900">{{ financialReport.invoices.overdue }} ({{ financialReport.invoices.overduePercentage }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerts -->
        <div v-if="financialReport.alerts && financialReport.alerts.length > 0" class="mb-6">
          <h4 class="font-medium text-gray-900 mb-3 text-sm">การแจ้งเตือน</h4>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <ul class="space-y-2">
              <li v-for="alert in financialReport.alerts" :key="alert" class="text-sm text-gray-700 flex items-start">
                <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {{ alert }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="financialReport.recommendations && financialReport.recommendations.length > 0" class="mb-6">
          <h4 class="font-medium text-gray-900 mb-3 text-sm">คำแนะนำ</h4>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <ul class="space-y-2">
              <li v-for="recommendation in financialReport.recommendations" :key="recommendation" class="text-sm text-gray-700 flex items-start">
                <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Report Info -->
        <div class="text-xs text-gray-500 text-center">
          รายงานสร้างเมื่อ: {{ formatDate(financialReport.generatedAt) }}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FinancialHealthReportModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    financialReport: {
      type: Object,
      default: null
    }
  },
  
  emits: ['close'],
  
  methods: {
    // Get Health Score Color
    getHealthScoreColor(score) {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    },

    // Get Health Status Badge Class
    getHealthStatusBadgeClass(status) {
      switch (status) {
        case 'healthy':
          return 'bg-gray-100 text-gray-700 border border-gray-300';
        case 'warning':
          return 'bg-gray-200 text-gray-800 border border-gray-400';
        case 'critical':
          return 'bg-gray-300 text-gray-900 border border-gray-500';
        default:
          return 'bg-gray-100 text-gray-700 border border-gray-300';
      }
    },

    // Format Price
    formatPrice(value) {
      if (!value) return '0.00';
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },

    // Format Date
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
</script> 