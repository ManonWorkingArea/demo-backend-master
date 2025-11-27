<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
              <i class="fas fa-calendar-alt text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Fiscal Periods - งวดบัญชี</h1>
              <p class="text-sm text-gray-600 mt-1">จัดการงวดบัญชีและการปิดงวด</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="loadFromDefaults"
              class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              title="โหลดข้อมูลต้นฉบับจาก Code (ไม่บันทึก Database)"
            >
              <i class="fas fa-code mr-2"></i>
              Load Defaults
            </button>
            <button
              @click="syncToDatabase"
              class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              title="บันทึกข้อมูลต้นฉบับไป Database"
            >
              <i class="fas fa-cloud-upload-alt mr-2"></i>
              Sync to DB
            </button>
            <button
              @click="resetDatabase"
              class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              title="ลบข้อมูลจาก Database และโหลดต้นฉบับ"
            >
              <i class="fas fa-trash-restore mr-2"></i>
              Reset DB
            </button>
            <button
              @click="loadData"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <i class="fas fa-refresh mr-2"></i>
              Refresh
            </button>
            <button
              @click="createPeriod"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <i class="fas fa-plus mr-2"></i>
              New Period
            </button>
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
          <span class="text-gray-900 font-medium">Fiscal Periods</span>
        </nav>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Current Period -->
        <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Current Period</p>
              <p class="text-2xl font-bold">{{ currentPeriod?.name || 'N/A' }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-calendar-check text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Open Periods -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium mb-1">Open Periods</p>
              <p class="text-3xl font-bold">{{ openPeriodsCount }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-lock-open text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Closed Periods -->
        <div class="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-100 text-sm font-medium mb-1">Closed Periods</p>
              <p class="text-3xl font-bold">{{ closedPeriodsCount }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-lock text-2xl"></i>
            </div>
          </div>
        </div>

        <!-- Fiscal Year -->
        <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium mb-1">Fiscal Year</p>
              <p class="text-3xl font-bold">{{ fiscalYear?.fiscal_year || 'N/A' }}</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <i class="fas fa-calendar text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Periods Table -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
        </div>

        <!-- Empty State -->
        <div v-else-if="periods.length === 0" class="p-12">
          <div class="text-center">
            <i class="fas fa-calendar-alt text-gray-300 text-6xl mb-4"></i>
            <h3 class="text-xl font-bold text-gray-700 mb-2">No Fiscal Periods Found</h3>
            <p class="text-gray-500 mb-6">Create your first fiscal period to get started</p>
            <button
              @click="initializeDefaultPeriods"
              class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-plus mr-2"></i>
              Initialize Default Periods
            </button>
          </div>
        </div>

        <!-- Periods Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiscal Year
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="period in periods" :key="`${period.fiscal_year}-${period.period}`" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">{{ period.period }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{ period.name }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-500">{{ period.fiscal_year }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-500">{{ formatDate(period.start_date) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-500">{{ formatDate(period.end_date) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="period.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ period.status === 'open' ? 'Open' : 'Closed' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    v-if="period.status === 'open'"
                    @click="closePeriod(period)"
                    class="text-red-600 hover:text-red-900 mr-3"
                    title="Close Period"
                  >
                    <i class="fas fa-lock"></i>
                  </button>
                  <button
                    v-else
                    @click="reopenPeriod(period)"
                    class="text-green-600 hover:text-green-900 mr-3"
                    title="Reopen Period"
                  >
                    <i class="fas fa-lock-open"></i>
                  </button>
                  <button
                    @click="viewPeriod(period)"
                    class="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// AccountingSettings จาก window.ERP_CORE (ประกาศใน main.js)
const accountingSettings = window.ERP_CORE.accounting

export default {
  name: 'FiscalPeriodsList',
  
  data() {
    return {
      loading: false,
      periods: [],
      fiscalYear: null,
      currentPeriod: null
    }
  },

  computed: {
    openPeriodsCount() {
      return this.periods.filter(p => p.status === 'open').length
    },
    
    closedPeriodsCount() {
      return this.periods.filter(p => p.status === 'closed').length
    }
  },

  async mounted() {
    console.log('🚀 Fiscal Periods List component loaded')
    await accountingSettings.initialize(this)
    await this.loadData()
  },

  methods: {
    async loadData() {
      this.loading = true
      try {
        // โหลด Fiscal Year
        this.fiscalYear = await accountingSettings.loadFiscalYear()
        console.log('✅ Fiscal Year loaded:', this.fiscalYear)
        
        // โหลด Fiscal Periods
        this.periods = await accountingSettings.loadFiscalPeriods()
        console.log('✅ Fiscal Periods loaded:', this.periods.length, 'periods')
        
        // หา Current Period
        this.currentPeriod = accountingSettings.getCurrentPeriod()
        console.log('📅 Current Period:', this.currentPeriod)
      } catch (error) {
        console.error('❌ Failed to load data:', error)
        this.$swal?.fire('Error', 'Failed to load fiscal periods data', 'error')
      } finally {
        this.loading = false
      }
    },

    async initializeDefaultPeriods() {
      const result = await this.$swal?.fire({
        title: 'Initialize Default Periods?',
        html: `
          <div class="text-left">
            <p class="mb-3">จะสร้างงวดบัญชีเริ่มต้น:</p>
            <ul class="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li><strong>Fiscal Year:</strong> 2025</li>
              <li><strong>Period Type:</strong> Monthly (12 เดือน)</li>
              <li><strong>Start Date:</strong> 1 มกราคม 2025</li>
              <li><strong>End Date:</strong> 31 ธันวาคม 2025</li>
              <li><strong>Status:</strong> All Open</li>
            </ul>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Initialize',
        cancelButtonText: 'Cancel'
      })

      if (result?.isConfirmed) {
        try {
          this.loading = true
          
          // สร้าง Fiscal Year และ Periods
          const { fiscalYear, periods } = await accountingSettings.createFiscalYear(
            '2025',
            '2025-01-01',
            '2025-12-31',
            'monthly'
          )
          
          await this.loadData()
          
          this.$swal?.fire({
            icon: 'success',
            title: 'Success!',
            text: `Created fiscal year ${fiscalYear.fiscal_year} with ${periods.length} periods`
          })
        } catch (error) {
          console.error('Failed to initialize:', error)
          this.$swal?.fire('Error', error.message, 'error')
        } finally {
          this.loading = false
        }
      }
    },

    async loadFromDefaults() {
      const result = await this.$swal?.fire({
        title: 'โหลดข้อมูลต้นฉบับ?',
        html: `
          <div class="text-left">
            <p class="mb-2">จะโหลดข้อมูล Fiscal Periods มาตรฐานจาก Code</p>
            <ul class="text-sm text-gray-600 list-disc pl-5">
              <li><strong>ไม่บันทึก</strong> ลง Database</li>
              <li>แสดงข้อมูลชั่วคราวเท่านั้น</li>
              <li>Fiscal Year: 2025</li>
              <li>Periods: 12 เดือน (มกราคม - ธันวาคม)</li>
            </ul>
            <p class="mt-3 text-yellow-600">💡 ถ้าต้องการบันทึกลง DB ให้กด "Sync to DB" ภายหลัง</p>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'โหลดเลย',
        cancelButtonText: 'ยกเลิก'
      })

      if (result?.isConfirmed) {
        try {
          this.loading = true
          
          // โหลดข้อมูล default จาก code
          this.fiscalYear = accountingSettings.defaultFiscalYear
          this.periods = [...accountingSettings.defaultFiscalPeriods]
          this.currentPeriod = accountingSettings.getCurrentPeriod()
          
          console.log('✅ Loaded default periods:', this.periods.length)
          
          this.$swal?.fire({
            icon: 'success',
            title: 'โหลดสำเร็จ!',
            html: `
              <p>โหลดข้อมูลต้นฉบับ ${this.periods.length} งวดแล้ว</p>
              <p class="text-sm text-gray-600 mt-2">
                ⚠️ ข้อมูลยังไม่ได้บันทึกลง Database<br/>
                กด "Sync to DB" เพื่อบันทึก
              </p>
            `
          })
        } catch (error) {
          console.error('Load error:', error)
          this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
        } finally {
          this.loading = false
        }
      }
    },

    async syncToDatabase() {
      const result = await this.$swal?.fire({
        title: 'บันทึกลง Database?',
        html: `
          <div class="text-left">
            <p class="mb-2">จะบันทึกข้อมูลต้นฉบับไป Database</p>
            <ul class="text-sm text-gray-600 list-disc pl-5">
              <li>บันทึก Fiscal Year 2025</li>
              <li>บันทึก Fiscal Periods 12 งวด</li>
              <li><strong>เขียนทับ</strong> ข้อมูลเดิมใน Database</li>
              <li>ใช้ข้อมูลจาก Code เป็นมาตรฐาน</li>
            </ul>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, บันทึกเลย',
        confirmButtonColor: '#7c3aed',
        cancelButtonText: 'ยกเลิก'
      })

      if (result?.isConfirmed) {
        try {
          this.loading = true
          
          // บันทึก Fiscal Year
          await accountingSettings.saveFiscalYear(accountingSettings.defaultFiscalYear)
          
          // บันทึก Fiscal Periods
          await accountingSettings.saveFiscalPeriods(accountingSettings.defaultFiscalPeriods)
          
          // โหลดข้อมูลใหม่จาก Database
          await this.loadData()
          
          this.$swal?.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ!',
            text: `บันทึก Fiscal Year และ ${this.periods.length} งวดลง Database เรียบร้อย`
          })
        } catch (error) {
          console.error('Sync error:', error)
          this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
        } finally {
          this.loading = false
        }
      }
    },

    async resetDatabase() {
      const result = await this.$swal?.fire({
        title: 'ลบและรีเซ็ต Database?',
        html: `
          <div class="text-left">
            <p class="mb-2 text-red-600 font-semibold">⚠️ การกระทำนี้จะ:</p>
            <ul class="text-sm list-disc pl-5 space-y-1">
              <li><strong class="text-red-600">ลบข้อมูล</strong> Fiscal Year และ Periods ทั้งหมดใน Database</li>
              <li>โหลดข้อมูลต้นฉบับจาก Code</li>
              <li><strong>บันทึก</strong> ข้อมูลต้นฉบับลง Database</li>
              <li>รีเซ็ตกลับเป็นค่าเริ่มต้น (2025, 12 งวด)</li>
            </ul>
            <p class="mt-3 text-orange-600 font-medium">
              ⚡ งวดบัญชีที่สร้างเองจะหายทั้งหมด!
            </p>
          </div>
        `,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบและรีเซ็ต',
        confirmButtonColor: '#dc2626',
        cancelButtonText: 'ยกเลิก'
      })

      if (result?.isConfirmed) {
        try {
          this.loading = true
          
          // ลบข้อมูลเดิมและบันทึกค่า default
          await accountingSettings.deleteConfig(accountingSettings.FISCAL_YEAR_SETTINGS_KEY)
          await accountingSettings.deleteConfig(accountingSettings.FISCAL_PERIODS_KEY)
          
          // บันทึกข้อมูล default
          await accountingSettings.saveFiscalYear(accountingSettings.defaultFiscalYear)
          await accountingSettings.saveFiscalPeriods(accountingSettings.defaultFiscalPeriods)
          
          // โหลดข้อมูลใหม่
          await this.loadData()
          
          this.$swal?.fire({
            icon: 'success',
            title: 'รีเซ็ตสำเร็จ!',
            text: `ลบข้อมูลเดิมและบันทึก Fiscal Periods มาตรฐานแล้ว (${this.periods.length} งวด)`
          })
        } catch (error) {
          console.error('Reset error:', error)
          this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
        } finally {
          this.loading = false
        }
      }
    },

    async closePeriod(period) {
      const result = await this.$swal?.fire({
        title: 'Close Period?',
        html: `
          <div class="text-left">
            <p class="mb-2">คุณต้องการปิดงวดบัญชีนี้หรือไม่?</p>
            <div class="bg-gray-50 rounded p-3 text-sm">
              <p><strong>Period:</strong> ${period.name}</p>
              <p><strong>Date:</strong> ${this.formatDate(period.start_date)} - ${this.formatDate(period.end_date)}</p>
            </div>
            <p class="mt-3 text-red-600 text-sm">
              ⚠️ เมื่อปิดงวดแล้ว จะไม่สามารถบันทึกรายการย้อนหลังได้
            </p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Close Period',
        confirmButtonColor: '#dc2626',
        cancelButtonText: 'Cancel'
      })

      if (result?.isConfirmed) {
        try {
          await accountingSettings.closePeriod(period.fiscal_year, period.period)
          await this.loadData()
          
          this.$swal?.fire({
            icon: 'success',
            title: 'Period Closed!',
            text: `${period.name} has been closed successfully`
          })
        } catch (error) {
          console.error('Failed to close period:', error)
          this.$swal?.fire('Error', error.message, 'error')
        }
      }
    },

    async reopenPeriod(period) {
      const result = await this.$swal?.fire({
        title: 'Reopen Period?',
        html: `
          <div class="text-left">
            <p class="mb-2">คุณต้องการเปิดงวดบัญชีนี้ใหม่หรือไม่?</p>
            <div class="bg-gray-50 rounded p-3 text-sm">
              <p><strong>Period:</strong> ${period.name}</p>
              <p><strong>Date:</strong> ${this.formatDate(period.start_date)} - ${this.formatDate(period.end_date)}</p>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Reopen',
        confirmButtonColor: '#059669',
        cancelButtonText: 'Cancel'
      })

      if (result?.isConfirmed) {
        try {
          await accountingSettings.reopenPeriod(period.fiscal_year, period.period)
          await this.loadData()
          
          this.$swal?.fire({
            icon: 'success',
            title: 'Period Reopened!',
            text: `${period.name} has been reopened successfully`
          })
        } catch (error) {
          console.error('Failed to reopen period:', error)
          this.$swal?.fire('Error', error.message, 'error')
        }
      }
    },

    viewPeriod(period) {
      this.$swal?.fire({
        title: 'Period Details',
        html: `
          <div class="text-left space-y-3">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-gray-500 mb-1">Period</p>
                <p class="font-semibold">${period.period}</p>
              </div>
              <div>
                <p class="text-gray-500 mb-1">Fiscal Year</p>
                <p class="font-semibold">${period.fiscal_year}</p>
              </div>
              <div>
                <p class="text-gray-500 mb-1">Start Date</p>
                <p class="font-semibold">${this.formatDate(period.start_date)}</p>
              </div>
              <div>
                <p class="text-gray-500 mb-1">End Date</p>
                <p class="font-semibold">${this.formatDate(period.end_date)}</p>
              </div>
              <div>
                <p class="text-gray-500 mb-1">Status</p>
                <p class="font-semibold">
                  <span class="${period.status === 'open' ? 'text-green-600' : 'text-gray-600'}">
                    ${period.status === 'open' ? '🟢 Open' : '🔒 Closed'}
                  </span>
                </p>
              </div>
              ${period.closed_at ? `
                <div>
                  <p class="text-gray-500 mb-1">Closed At</p>
                  <p class="font-semibold text-sm">${new Date(period.closed_at).toLocaleString('th-TH')}</p>
                </div>
              ` : ''}
            </div>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Close'
      })
    },

    createPeriod() {
      this.$swal({
        icon: 'info',
        title: 'Create New Period',
        text: 'This feature will be implemented soon. Use "Initialize Default Periods" to create periods for a fiscal year.'
      })
    },

    formatDate(dateStr) {
      if (!dateStr) return 'N/A'
      const date = new Date(dateStr)
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>
