<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-lg">
              <i class="fas fa-chart-bar text-cyan-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Financial Reports - รายงานทางการเงิน</h1>
              <p class="text-sm text-gray-600 mt-1">รายงานงบการเงินและรายงานทางบัญชี</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex items-center space-x-2 text-sm">
          <router-link to="/" class="text-gray-500 hover:text-gray-700 transition-colors">
            <i class="fas fa-home"></i>
            <span class="ml-1">Home</span>
          </router-link>
          <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <router-link to="/accounting" class="text-gray-500 hover:text-gray-700 transition-colors">
            Accounting
          </router-link>
          <i class="fas fa-chevron-right text-gray-400 text-xs"></i>
          <span class="text-gray-900 font-medium">Financial Reports</span>
        </nav>
      </div>
    </div>

    <!-- Reports Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Balance Sheet -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openReport('balance-sheet')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <i class="fas fa-balance-scale text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Balance Sheet</h3>
              <p class="text-sm text-gray-500">งบดุล</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">รายงานสินทรัพย์ หนี้สิน และส่วนของเจ้าของ</p>
        </div>

        <!-- Income Statement -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openReport('income-statement')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <i class="fas fa-chart-line text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Income Statement</h3>
              <p class="text-sm text-gray-500">งบกำไรขาดทุน</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">รายงานรายได้ ค่าใช้จ่าย และกำไร(ขาดทุน)</p>
        </div>

        <!-- Cash Flow -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openReport('cash-flow')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg">
              <i class="fas fa-money-bill-wave text-teal-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Cash Flow Statement</h3>
              <p class="text-sm text-gray-500">งบกระแสเงินสด</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">รายงานกระแสเงินสดรับ-จ่าย</p>
        </div>

        <!-- Trial Balance -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openReport('trial-balance')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <i class="fas fa-book text-purple-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Trial Balance</h3>
              <p class="text-sm text-gray-500">งบทดลอง</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">รายงานยอดคงเหลือของบัญชี</p>
        </div>

        <!-- General Ledger Report -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openReport('general-ledger')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
              <i class="fas fa-book-open text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">General Ledger</h3>
              <p class="text-sm text-gray-500">สมุดบัญชีแยกประเภท</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">รายงานบัญชีแยกประเภททั้งหมด</p>
        </div>

        <!-- Accounts Payable Report -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openReport('ap-report')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
              <i class="fas fa-file-invoice-dollar text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">AP Report</h3>
              <p class="text-sm text-gray-500">รายงานเจ้าหนี้</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">รายงานหนี้สินที่ต้องชำระ</p>
        </div>

        <!-- Accounts Receivable Report -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openReport('ar-report')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <i class="fas fa-file-invoice text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">AR Report</h3>
              <p class="text-sm text-gray-500">รายงานลูกหนี้</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">รายงานลูกหนี้ที่ต้องรับชำระ</p>
        </div>

        <!-- Tax Report -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openReport('tax-report')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg">
              <i class="fas fa-receipt text-amber-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Tax Report</h3>
              <p class="text-sm text-gray-500">รายงานภาษี</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">รายงานภาษีซื้อ/ขาย และหัก ณ ที่จ่าย</p>
        </div>

        <!-- Fixed Assets Report -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openReport('fixed-assets-report')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg">
              <i class="fas fa-building text-pink-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Fixed Assets Report</h3>
              <p class="text-sm text-gray-500">รายงานสินทรัพย์ถาวร</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">รายงานสินทรัพย์และค่าเสื่อมราคา</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FinancialReportsList',
  methods: {
    openReport(reportType) {
      this.$swal({
        icon: 'info',
        title: 'Generate Report',
        text: `Generate ${reportType} report - This feature will be implemented soon`
      })
    }
  },
  mounted() {
    console.log('Financial Reports List component loaded')
  }
}
</script>
