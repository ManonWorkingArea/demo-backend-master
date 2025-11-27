<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <h3 class="text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-building text-blue-500"></i>
            Company Information - ข้อมูลบริษัท
          </h3>
          <p class="text-sm text-gray-600 mt-1">ข้อมูลบริษัทสำหรับเอกสารและภาษี</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Company Info Form -->
      <div class="space-y-6">
        <!-- Company Name -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Company Name (EN) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="companyInfo.company_name_en"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Company Name Ltd."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ชื่อบริษัท (TH) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="companyInfo.company_name_th"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="บริษัท ... จำกัด"
            />
          </div>
        </div>

        <!-- Tax ID & Branch -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tax ID / เลขประจำตัวผู้เสียภาษี <span class="text-red-500">*</span>
            </label>
            <input
              v-model="companyInfo.tax_id"
              type="text"
              maxlength="13"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="0-0000-00000-00-0"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Branch / สาขา
            </label>
            <input
              v-model="companyInfo.branch"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="00000 (สำนักงานใหญ่)"
            />
          </div>
        </div>

        <!-- Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Address / ที่อยู่ <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="companyInfo.address"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="เลขที่ ถนน ตำบล/แขวง"
          ></textarea>
        </div>

        <!-- City, Province, Postal Code -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              City / อำเภอ/เขต
            </label>
            <input
              v-model="companyInfo.city"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Province / จังหวัด <span class="text-red-500">*</span>
            </label>
            <input
              v-model="companyInfo.province"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Postal Code / รหัสไปรษณีย์ <span class="text-red-500">*</span>
            </label>
            <input
              v-model="companyInfo.postal_code"
              type="text"
              maxlength="5"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Contact Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Phone / โทรศัพท์
            </label>
            <input
              v-model="companyInfo.phone"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="02-xxx-xxxx"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email / อีเมล
            </label>
            <input
              v-model="companyInfo.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="company@example.com"
            />
          </div>
        </div>

        <!-- Website -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Website / เว็บไซต์
          </label>
          <input
            v-model="companyInfo.website"
            type="url"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://www.example.com"
          />
        </div>

        <!-- Logo URL (Optional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Logo URL (Optional)
          </label>
          <input
            v-model="companyInfo.logo_url"
            type="url"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/logo.png"
          />
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
          @click="saveCompanyInfo"
          :disabled="saving"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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
  name: 'CompanyInfoForm',

  data() {
    return {
      saving: false,
      companyInfo: {
        company_name_en: '',
        company_name_th: '',
        tax_id: '',
        branch: '00000',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        phone: '',
        email: '',
        website: '',
        logo_url: ''
      }
    }
  },

  async mounted() {
    accountingSettings.initialize(this)
    await this.loadCompanyInfo()
  },

  methods: {
    async loadCompanyInfo() {
      try {
        const savedInfo = await accountingSettings.getConfig('accounting.company_info')
        if (savedInfo) {
          this.companyInfo = { ...this.companyInfo, ...savedInfo }
          console.log('✅ Loaded Company Info from Database')
        }
      } catch (error) {
        console.error('Failed to load company info:', error)
      }
    },

    async saveCompanyInfo() {
      // Validation
      if (!this.companyInfo.company_name_en || !this.companyInfo.company_name_th) {
        this.$swal({
          icon: 'error',
          title: 'กรุณากรอกข้อมูล',
          text: 'กรุณากรอกชื่อบริษัท (EN และ TH)'
        })
        return
      }

      if (!this.companyInfo.tax_id) {
        this.$swal({
          icon: 'error',
          title: 'กรุณากรอกข้อมูล',
          text: 'กรุณากรอกเลขประจำตัวผู้เสียภาษี'
        })
        return
      }

      this.saving = true
      try {
        await accountingSettings.saveConfig(
          'accounting.company_info',
          this.companyInfo,
          {
            name: 'Company Information',
            description: 'ข้อมูลบริษัทสำหรับเอกสารและภาษี'
          }
        )

        this.$swal({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึกข้อมูลบริษัทเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        })

        this.$emit('saved')
      } catch (error) {
        console.error('Failed to save company info:', error)
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
