<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white mb-10">
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <h3 class="text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-file-invoice text-yellow-500"></i>
            Tax Settings - ตั้งค่าภาษี
          </h3>
          <p class="text-sm text-gray-600 mt-1">กำหนดอัตราภาษีและการคำนวณ</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Tax Settings Form -->
      <div class="space-y-6">
        <!-- VAT Settings -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-percentage text-yellow-600"></i>
            VAT - ภาษีมูลค่าเพิ่ม
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                VAT Rate (%) / อัตราภาษีมูลค่าเพิ่ม
              </label>
              <input
                v-model.number="taxSettings.vat_rate"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="7"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                VAT Calculation / การคำนวณ VAT
              </label>
              <select
                v-model="taxSettings.vat_calculation_method"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="exclusive">Exclusive (ราคาไม่รวม VAT)</option>
                <option value="inclusive">Inclusive (ราคารวม VAT)</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="flex items-center space-x-2">
                <input
                  v-model="taxSettings.vat_enabled"
                  type="checkbox"
                  class="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable VAT / เปิดใช้งาน VAT</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Withholding Tax Settings -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-cut text-orange-600"></i>
            Withholding Tax - ภาษีหัก ณ ที่จ่าย
          </h4>
          <div class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  WHT Rate (%) - Service / บริการ
                </label>
                <input
                  v-model.number="taxSettings.wht_service_rate"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="3"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  WHT Rate (%) - Goods / สินค้า
                </label>
                <input
                  v-model.number="taxSettings.wht_goods_rate"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  WHT Rate (%) - Rent / ค่าเช่า
                </label>
                <input
                  v-model.number="taxSettings.wht_rent_rate"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="5"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  WHT Rate (%) - Transport / ขนส่ง
                </label>
                <input
                  v-model.number="taxSettings.wht_transport_rate"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="1"
                />
              </div>
            </div>
            <div>
              <label class="flex items-center space-x-2">
                <input
                  v-model="taxSettings.wht_enabled"
                  type="checkbox"
                  class="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable Withholding Tax / เปิดใช้งานภาษีหัก ณ ที่จ่าย</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Tax ID Format -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-id-card text-blue-600"></i>
            Tax ID Format
          </h4>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tax ID Format / รูปแบบเลขประจำตัวผู้เสียภาษี
              </label>
              <input
                v-model="taxSettings.tax_id_format"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="X-XXXX-XXXXX-XX-X"
              />
              <p class="text-xs text-gray-500 mt-1">X = Digit (ตัวเลข)</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Branch Code Format / รูปแบบรหัสสาขา
              </label>
              <input
                v-model="taxSettings.branch_code_format"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="XXXXX (00000 = สำนักงานใหญ่)"
              />
            </div>
          </div>
        </div>

        <!-- Tax Invoice Settings -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-file-invoice-dollar text-green-600"></i>
            Tax Invoice Settings
          </h4>
          <div class="space-y-3">
            <div>
              <label class="flex items-center space-x-2">
                <input
                  v-model="taxSettings.auto_generate_tax_invoice"
                  type="checkbox"
                  class="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span class="text-sm font-medium text-gray-700">Auto Generate Tax Invoice / สร้างใบกำกับภาษีอัตโนมัติ</span>
              </label>
            </div>
            <div>
              <label class="flex items-center space-x-2">
                <input
                  v-model="taxSettings.require_tax_invoice_for_vat"
                  type="checkbox"
                  class="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span class="text-sm font-medium text-gray-700">Require Tax Invoice for VAT / บังคับใบกำกับภาษีสำหรับ VAT</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-2 mt-6 pt-4 border-t">
        <button
          @click="$emit('close')"
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <i class="fas fa-times mr-2"></i>
          Cancel
        </button>
        <button
          @click="saveTaxSettings"
          :disabled="saving"
          class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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
  name: 'TaxSettingsForm',

  data() {
    return {
      saving: false,
      taxSettings: {
        // VAT
        vat_enabled: true,
        vat_rate: 7,
        vat_calculation_method: 'exclusive',
        
        // Withholding Tax
        wht_enabled: true,
        wht_service_rate: 3,
        wht_goods_rate: 1,
        wht_rent_rate: 5,
        wht_transport_rate: 1,
        
        // Tax ID
        tax_id_format: 'X-XXXX-XXXXX-XX-X',
        branch_code_format: 'XXXXX',
        
        // Tax Invoice
        auto_generate_tax_invoice: true,
        require_tax_invoice_for_vat: true
      }
    }
  },

  async mounted() {
    accountingSettings.initialize(this)
    await this.loadTaxSettings()
  },

  methods: {
    async loadTaxSettings() {
      try {
        const saved = await accountingSettings.getConfig('accounting.tax_settings')
        if (saved) {
          this.taxSettings = { ...this.taxSettings, ...saved }
          console.log('✅ Loaded Tax Settings from Database')
        }
      } catch (error) {
        console.error('Failed to load tax settings:', error)
      }
    },

    async saveTaxSettings() {
      this.saving = true
      try {
        await accountingSettings.saveConfig(
          'accounting.tax_settings',
          this.taxSettings,
          {
            name: 'Tax Settings Configuration',
            description: 'การตั้งค่าภาษีและอัตราการคำนวณ'
          }
        )

        this.$swal({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึกการตั้งค่าภาษีเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        })

        this.$emit('saved')
      } catch (error) {
        console.error('Failed to save tax settings:', error)
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
