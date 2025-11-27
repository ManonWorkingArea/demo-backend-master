<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white mb-10">
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <h3 class="text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-dollar-sign text-green-500"></i>
            Currency Settings - ตั้งค่าสกุลเงิน
          </h3>
          <p class="text-sm text-gray-600 mt-1">กำหนดสกุลเงินและอัตราแลกเปลี่ยน</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Currency Settings Form -->
      <div class="space-y-6">
        <!-- Base Currency -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-home text-blue-600"></i>
            Base Currency - สกุลเงินหลัก
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Currency Code / รหัสสกุลเงิน
              </label>
              <select
                v-model="currencySettings.base_currency"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="THB">THB - Thai Baht (บาท)</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="SGD">SGD - Singapore Dollar</option>
                <option value="MYR">MYR - Malaysian Ringgit</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Currency Symbol / สัญลักษณ์
              </label>
              <input
                v-model="currencySettings.base_currency_symbol"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="฿"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Decimal Places / ทศนิยม
              </label>
              <input
                v-model.number="currencySettings.decimal_places"
                type="number"
                min="0"
                max="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="2"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Decimal Separator / ตัวคั่นทศนิยม
              </label>
              <select
                v-model="currencySettings.decimal_separator"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value=".">Dot (.)</option>
                <option value=",">Comma (,)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Thousand Separator / ตัวคั่นหลักพัน
              </label>
              <select
                v-model="currencySettings.thousand_separator"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value=",">Comma (,)</option>
                <option value=".">Dot (.)</option>
                <option value=" ">Space ( )</option>
                <option value="">None</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Symbol Position / ตำแหน่งสัญลักษณ์
              </label>
              <select
                v-model="currencySettings.symbol_position"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="before">Before (฿ 100)</option>
                <option value="after">After (100 ฿)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Foreign Currency -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-globe text-indigo-600"></i>
            Foreign Currency - สกุลเงินต่างประเทศ
          </h4>
          <div class="space-y-3">
            <div>
              <label class="flex items-center space-x-2">
                <input
                  v-model="currencySettings.enable_multi_currency"
                  type="checkbox"
                  class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable Multi-Currency / เปิดใช้งานหลายสกุลเงิน</span>
              </label>
            </div>
            <div>
              <label class="flex items-center space-x-2">
                <input
                  v-model="currencySettings.auto_update_exchange_rate"
                  type="checkbox"
                  class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span class="text-sm font-medium text-gray-700">Auto Update Exchange Rate / อัพเดตอัตราแลกเปลี่ยนอัตโนมัติ</span>
              </label>
            </div>
            <div v-if="currencySettings.auto_update_exchange_rate">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Exchange Rate Source / แหล่งข้อมูลอัตราแลกเปลี่ยน
              </label>
              <select
                v-model="currencySettings.exchange_rate_source"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="bot">Bank of Thailand (ธนาคารแห่งประเทศไทย)</option>
                <option value="manual">Manual Entry (กรอกเอง)</option>
                <option value="api">External API</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Exchange Rate Settings -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-exchange-alt text-purple-600"></i>
            Exchange Rate - อัตราแลกเปลี่ยน
          </h4>
          <div class="space-y-4">
            <!-- USD -->
            <div class="grid grid-cols-3 gap-4 items-center">
              <div class="font-medium text-gray-700">USD (US Dollar)</div>
              <input
                v-model.number="currencySettings.exchange_rates.USD"
                type="number"
                step="0.0001"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="35.50"
              />
              <span class="text-sm text-gray-500">1 USD = X THB</span>
            </div>
            <!-- EUR -->
            <div class="grid grid-cols-3 gap-4 items-center">
              <div class="font-medium text-gray-700">EUR (Euro)</div>
              <input
                v-model.number="currencySettings.exchange_rates.EUR"
                type="number"
                step="0.0001"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="38.50"
              />
              <span class="text-sm text-gray-500">1 EUR = X THB</span>
            </div>
            <!-- GBP -->
            <div class="grid grid-cols-3 gap-4 items-center">
              <div class="font-medium text-gray-700">GBP (British Pound)</div>
              <input
                v-model.number="currencySettings.exchange_rates.GBP"
                type="number"
                step="0.0001"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="44.50"
              />
              <span class="text-sm text-gray-500">1 GBP = X THB</span>
            </div>
            <!-- JPY -->
            <div class="grid grid-cols-3 gap-4 items-center">
              <div class="font-medium text-gray-700">JPY (Japanese Yen)</div>
              <input
                v-model.number="currencySettings.exchange_rates.JPY"
                type="number"
                step="0.0001"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="0.24"
              />
              <span class="text-sm text-gray-500">1 JPY = X THB</span>
            </div>
          </div>
        </div>

        <!-- Rounding -->
        <div class="border rounded-lg p-4">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-calculator text-cyan-600"></i>
            Rounding - การปัดเศษ
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rounding Method / วิธีปัดเศษ
              </label>
              <select
                v-model="currencySettings.rounding_method"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="round">Round (ปัดเศษ)</option>
                <option value="floor">Floor (ปัดลง)</option>
                <option value="ceil">Ceiling (ปัดขึ้น)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Rounding Precision / ความละเอียดการปัดเศษ
              </label>
              <select
                v-model="currencySettings.rounding_precision"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="0.01">0.01 (สตางค์)</option>
                <option value="0.25">0.25 (25 สตางค์)</option>
                <option value="1">1.00 (บาท)</option>
              </select>
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
          @click="saveCurrencySettings"
          :disabled="saving"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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
  name: 'CurrencySettingsForm',

  data() {
    return {
      saving: false,
      currencySettings: {
        // Base Currency
        base_currency: 'THB',
        base_currency_symbol: '฿',
        decimal_places: 2,
        decimal_separator: '.',
        thousand_separator: ',',
        symbol_position: 'before',
        
        // Multi-Currency
        enable_multi_currency: false,
        auto_update_exchange_rate: false,
        exchange_rate_source: 'bot',
        
        // Exchange Rates
        exchange_rates: {
          USD: 35.50,
          EUR: 38.50,
          GBP: 44.50,
          JPY: 0.24
        },
        
        // Rounding
        rounding_method: 'round',
        rounding_precision: '0.01'
      }
    }
  },

  async mounted() {
    accountingSettings.initialize(this)
    await this.loadCurrencySettings()
  },

  methods: {
    async loadCurrencySettings() {
      try {
        const saved = await accountingSettings.getConfig('accounting.currency_settings')
        if (saved) {
          this.currencySettings = { ...this.currencySettings, ...saved }
          console.log('✅ Loaded Currency Settings from Database')
        }
      } catch (error) {
        console.error('Failed to load currency settings:', error)
      }
    },

    async saveCurrencySettings() {
      this.saving = true
      try {
        await accountingSettings.saveConfig(
          'accounting.currency_settings',
          this.currencySettings,
          {
            name: 'Currency Settings Configuration',
            description: 'การตั้งค่าสกุลเงินและอัตราแลกเปลี่ยน'
          }
        )

        this.$swal({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึกการตั้งค่าสกุลเงินเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        })

        this.$emit('saved')
      } catch (error) {
        console.error('Failed to save currency settings:', error)
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
