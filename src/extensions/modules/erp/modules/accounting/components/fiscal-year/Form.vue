<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white mb-10">
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <h3 class="text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-calendar-alt text-indigo-500"></i>
            Fiscal Year - ปีบัญชี
          </h3>
          <p class="text-sm text-gray-600 mt-1">กำหนดงวดปีบัญชีและรอบบัญชี</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Fiscal Year Settings Form -->
      <div class="space-y-4">
        <!-- Fiscal Year Period & Accounting Periods Combined -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i class="fas fa-calendar-check text-indigo-600"></i>
            Fiscal Year & Periods - ปีบัญชีและงวดบัญชี
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Start Month / เดือนเริ่มต้น <span class="text-red-500">*</span>
              </label>
              <select
                v-model.number="fiscalSettings.fiscal_year_start_month"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="1">January - มกราคม</option>
                <option value="2">February - กุมภาพันธ์</option>
                <option value="3">March - มีนาคม</option>
                <option value="4">April - เมษายน</option>
                <option value="5">May - พฤษภาคม</option>
                <option value="6">June - มิถุนายน</option>
                <option value="7">July - กรกฎาคม</option>
                <option value="8">August - สิงหาคม</option>
                <option value="9">September - กันยายน</option>
                <option value="10">October - ตุลาคม</option>
                <option value="11">November - พฤศจิกายน</option>
                <option value="12">December - ธันวาคม</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Start Day / วันที่ <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="fiscalSettings.fiscal_year_start_day"
                type="number"
                min="1"
                max="31"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Current Year / ปีปัจจุบัน
              </label>
              <input
                v-model.number="fiscalSettings.current_fiscal_year"
                type="number"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="2025"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Year Format / รูปแบบ
              </label>
              <select
                v-model="fiscalSettings.fiscal_year_format"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="YYYY">YYYY (2025)</option>
                <option value="YY">YY (25)</option>
                <option value="YYYY-YYYY">YYYY-YYYY (2025-2026)</option>
                <option value="BBBB">พ.ศ. BBBB (2568)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Period Type / ประเภทงวด
              </label>
              <select
                v-model="fiscalSettings.period_type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="monthly">Monthly - รายเดือน (12 งวด)</option>
                <option value="quarterly">Quarterly - รายไตรมาส (4 งวด)</option>
                <option value="semi-annual">Semi-Annual - ราย 6 เดือน (2 งวด)</option>
                <option value="annual">Annual - รายปี (1 งวด)</option>
              </select>
            </div>
            <div class="flex items-center">
              <label class="flex items-center space-x-2">
                <input
                  v-model="fiscalSettings.auto_create_periods"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-gray-700">Auto Create Periods / สร้างงวดอัตโนมัติ</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Period Closing & Year-End Combined -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i class="fas fa-lock text-red-600"></i>
            Period Closing - การปิดงวด
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="flex items-center space-x-2">
                <input
                  v-model="fiscalSettings.prevent_posting_to_closed_period"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-gray-700">Prevent Posting to Closed Period / ป้องกันการบันทึกในงวดที่ปิดแล้ว</span>
              </label>
            </div>
            <div>
              <label class="flex items-center space-x-2">
                <input
                  v-model="fiscalSettings.auto_close_period"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-gray-700">Auto Close Period / ปิดงวดอัตโนมัติ</span>
              </label>
            </div>
            <div v-if="fiscalSettings.auto_close_period" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Auto Close After Days / ปิดงวดอัตโนมัติหลังจาก (วัน)
              </label>
              <input
                v-model.number="fiscalSettings.auto_close_days"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="30"
              />
            </div>
            <div>
              <label class="flex items-center space-x-2">
                <input
                  v-model="fiscalSettings.auto_create_retained_earnings"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-gray-700">Auto Create Retained Earnings / สร้างกำไรสะสมอัตโนมัติ</span>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Retained Earnings Account / บัญชีกำไรสะสม
              </label>
              <input
                v-model="fiscalSettings.retained_earnings_account"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="3510"
              />
            </div>
          </div>
        </div>

        <!-- Opening Balance & Historical Data Combined -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i class="fas fa-balance-scale text-green-600"></i>
            Opening Balance & History - ยอดยกมาและข้อมูลย้อนหลัง
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="flex items-center space-x-2 mb-2">
                <input
                  v-model="fiscalSettings.allow_opening_balance_adjustment"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-gray-700">Allow Opening Balance Adjustment / อนุญาตแก้ไขยอดยกมา</span>
              </label>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Opening Balance Account / บัญชียอดยกมา
              </label>
              <input
                v-model="fiscalSettings.opening_balance_account"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="3000"
              />
            </div>
            <div>
              <label class="flex items-center space-x-2 mb-2">
                <input
                  v-model="fiscalSettings.allow_backdated_transactions"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-gray-700">Allow Backdated Transactions / อนุญาตรายการย้อนหลัง</span>
              </label>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Keep History Years / เก็บประวัติ (ปี)
              </label>
              <input
                v-model.number="fiscalSettings.keep_history_years"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="7"
              />
              <p class="text-xs text-gray-500 mt-1">แนะนำ 7 ปีตามกฎหมาย</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-2 mt-4 pt-3 border-t">
        <button
          @click="$emit('close')"
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          <i class="fas fa-times mr-2"></i>
          Cancel
        </button>
        <button
          @click="saveFiscalSettings"
          :disabled="saving"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
        >
          <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'" class="mr-2"></i>
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// AccountingSettings จาก window.ERP_CORE (ประกาศใน main.js)
const accountingSettings = window.ERP_CORE.accounting

export default {
  name: 'FiscalYearSettingsForm',

  data() {
    return {
      saving: false,
      fiscalSettings: {
        // Fiscal Year Period
        fiscal_year_start_month: 1,
        fiscal_year_start_day: 1,
        current_fiscal_year: new Date().getFullYear(),
        fiscal_year_format: 'YYYY',
        
        // Accounting Periods
        period_type: 'monthly',
        auto_create_periods: true,
        
        // Period Closing
        prevent_posting_to_closed_period: true,
        auto_close_period: false,
        auto_close_days: 30,
        
        // Year-End Closing
        auto_create_retained_earnings: true,
        retained_earnings_account: '3510',
        
        // Opening Balance
        allow_opening_balance_adjustment: true,
        opening_balance_account: '3000',
        
        // Historical Data
        keep_history_years: 7,
        allow_backdated_transactions: false
      }
    }
  },

  async mounted() {
    accountingSettings.initialize(this)
    await this.loadFiscalSettings()
  },

  methods: {
    async loadFiscalSettings() {
      try {
        const saved = await accountingSettings.getConfig('accounting.fiscal_year_settings')
        if (saved) {
          this.fiscalSettings = { ...this.fiscalSettings, ...saved }
          console.log('✅ Loaded Fiscal Year Settings from Database')
        }
      } catch (error) {
        console.error('Failed to load fiscal year settings:', error)
      }
    },

    async saveFiscalSettings() {
      // Validation
      if (!this.fiscalSettings.fiscal_year_start_month || !this.fiscalSettings.fiscal_year_start_day) {
        this.$swal({
          icon: 'error',
          title: 'กรุณากรอกข้อมูล',
          text: 'กรุณาระบุเดือนและวันที่เริ่มต้นปีบัญชี'
        })
        return
      }

      if (this.fiscalSettings.fiscal_year_start_day < 1 || this.fiscalSettings.fiscal_year_start_day > 31) {
        this.$swal({
          icon: 'error',
          title: 'ข้อมูลไม่ถูกต้อง',
          text: 'วันที่เริ่มต้นต้องอยู่ระหว่าง 1-31'
        })
        return
      }

      this.saving = true
      try {
        await accountingSettings.saveConfig(
          'accounting.fiscal_year_settings',
          this.fiscalSettings,
          {
            name: 'Fiscal Year Settings Configuration',
            description: 'การตั้งค่าปีบัญชีและงวดบัญชี'
          }
        )

        this.$swal({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึกการตั้งค่าปีบัญชีเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        })

        this.$emit('saved')
      } catch (error) {
        console.error('Failed to save fiscal year settings:', error)
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'Failed to save config'
        })
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
