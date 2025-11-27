<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
              <i class="fas fa-cog text-gray-600 text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Accounting Settings - ตั้งค่าบัญชี</h1>
              <p class="text-sm text-gray-600 mt-1">จัดการการตั้งค่าระบบบัญชี</p>
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
          <span class="text-gray-900 font-medium">Settings</span>
        </nav>
      </div>
    </div>

    <!-- Settings Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Company Information -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openCompanyInfoModal">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <i class="fas fa-building text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Company Info</h3>
              <p class="text-sm text-gray-500">ข้อมูลบริษัท</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">ตั้งค่าข้อมูลบริษัทสำหรับเอกสารและภาษี</p>
        </div>

        <!-- Accounting Policies -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openSetting('policies')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <i class="fas fa-clipboard-list text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Policies</h3>
              <p class="text-sm text-gray-500">นโยบายบัญชี</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">ตั้งค่านโยบายทางบัญชี</p>
        </div>

        <!-- Default Accounts -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openDefaultAccountsModal">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <i class="fas fa-link text-purple-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Default Accounts</h3>
              <p class="text-sm text-gray-500">บัญชีเริ่มต้น</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">กำหนดบัญชีเริ่มต้นสำหรับรายการ</p>
        </div>

        <!-- Account Types -->
        <div 
          @click="openAccountTypesModal" 
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
        >
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-lg">
              <i class="fas fa-tags text-cyan-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Account Types</h3>
              <p class="text-sm text-gray-500">ประเภทผังบัญชี</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">จัดการประเภทบัญชี เช่น สินทรัพย์ หนี้สิน รายได้ ค่าใช้จ่าย</p>
        </div>

        <!-- Number Series -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openSetting('number-series')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <i class="fas fa-hashtag text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Number Series</h3>
              <p class="text-sm text-gray-500">รูปแบบเลขที่เอกสาร</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">ตั้งค่ารูปแบบเลขที่เอกสาร</p>
        </div>

        <!-- Tax Settings -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openTaxSettingsModal">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg">
              <i class="fas fa-percentage text-amber-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Tax Settings</h3>
              <p class="text-sm text-gray-500">ตั้งค่าภาษี</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">กำหนดอัตราภาษีและประเภทภาษี</p>
        </div>

        <!-- Currency Settings -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openCurrencySettingsModal">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg">
              <i class="fas fa-dollar-sign text-teal-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Currency</h3>
              <p class="text-sm text-gray-500">สกุลเงิน</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">ตั้งค่าสกุลเงินและอัตราแลกเปลี่ยน</p>
        </div>

        <!-- Fiscal Year Settings -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openFiscalYearModal">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
              <i class="fas fa-calendar-alt text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Fiscal Year</h3>
              <p class="text-sm text-gray-500">ปีบัญชี</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">กำหนดงวดปีบัญชี</p>
        </div>

        <!-- Integration Settings -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openSetting('integration')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg">
              <i class="fas fa-plug text-pink-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Integration</h3>
              <p class="text-sm text-gray-500">เชื่อมต่อระบบ</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">ตั้งค่าการเชื่อมต่อกับระบบอื่น</p>
        </div>

        <!-- Backup & Restore -->
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer" @click="openSetting('backup')">
          <div class="flex items-center space-x-4 mb-4">
            <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
              <i class="fas fa-database text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Backup & Restore</h3>
              <p class="text-sm text-gray-500">สำรองข้อมูล</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">สำรองและกู้คืนข้อมูลบัญชี</p>
        </div>
      </div>
    </div>

    <!-- Account Types Modal -->
    <div v-if="showAccountTypesModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white mb-10">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <div>
            <h3 class="text-2xl font-bold flex items-center gap-2">
              <i class="fas fa-tags text-cyan-500"></i>
              Account Types - ประเภทผังบัญชี
            </h3>
            <p class="text-sm text-gray-600 mt-1">จัดการประเภทบัญชีแบบ Dynamic</p>
          </div>
          <button @click="closeAccountTypesModal" class="text-gray-400 hover:text-gray-600 text-2xl">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-2 mb-4">
          <button 
            @click="resetAccountTypesToDefault"
            class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg font-medium transition-colors inline-flex items-center text-sm"
          >
            <i class="fas fa-undo mr-2"></i>
            Reset Default
          </button>
          <button 
            @click="loadAccountTypes"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors inline-flex items-center text-sm"
          >
            <i class="fas fa-refresh mr-2"></i>
            Refresh
          </button>
          <button
            @click="openAddTypeModal"
            class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors inline-flex items-center text-sm"
          >
            <i class="fas fa-plus mr-2"></i>
            เพิ่มประเภท
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loadingTypes" class="flex items-center justify-center py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
        </div>

        <!-- Account Types Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
          <div 
            v-for="type in accountTypesList" 
            :key="type.key"
            :class="getCardClass(type.color)"
            class="rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div :class="getIconBgClass(type.color)" class="flex items-center justify-center w-10 h-10 rounded-lg">
                  <i class="fas fa-tag text-lg" :class="getIconClass(type.color)"></i>
                </div>
                <div>
                  <h3 class="text-base font-bold text-gray-900">{{ type.name }}</h3>
                  <p class="text-xs text-gray-600">{{ type.name_th }}</p>
                </div>
              </div>
              <div class="flex space-x-1">
                <button @click="editAccountType(type)" class="text-blue-600 hover:text-blue-900 p-1">
                  <i class="fas fa-edit text-sm"></i>
                </button>
                <button @click="deleteAccountType(type)" class="text-red-600 hover:text-red-900 p-1">
                  <i class="fas fa-trash text-sm"></i>
                </button>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">Key:</span>
                <code class="bg-gray-100 px-2 py-0.5 rounded text-xs">{{ type.key }}</code>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">Prefix:</span>
                <span class="font-mono font-semibold">{{ type.code_prefix }}</span>
              </div>
              <div class="text-xs text-gray-600 mt-2">
                {{ type.description }}
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="accountTypesList.length === 0" class="col-span-full text-center py-12">
            <i class="fas fa-tags text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500">ไม่พบประเภทบัญชี</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Type Form Modal -->
    <div v-if="showTypeFormModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-[60]">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h3 class="text-xl font-bold">{{ editingType ? 'แก้ไขประเภทบัญชี' : 'เพิ่มประเภทบัญชีใหม่' }}</h3>
          <button @click="closeTypeFormModal" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveAccountType" class="space-y-4">
          <div v-if="!editingType">
            <label class="block text-sm font-medium mb-1">Key <span class="text-red-500">*</span></label>
            <input
              v-model="typeForm.key"
              type="text"
              required
              pattern="[a-z_]+"
              class="w-full px-3 py-2 border rounded-lg font-mono"
              placeholder="asset"
            />
            <p class="text-xs text-gray-500 mt-1">ใช้ตัวพิมพ์เล็ก a-z และ _ เท่านั้น</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Name (EN) <span class="text-red-500">*</span></label>
            <input
              v-model="typeForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="Asset"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Name (TH) <span class="text-red-500">*</span></label>
            <input
              v-model="typeForm.name_th"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="สินทรัพย์"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Code Prefix <span class="text-red-500">*</span></label>
            <input
              v-model="typeForm.code_prefix"
              type="text"
              required
              maxlength="2"
              class="w-full px-3 py-2 border rounded-lg font-mono"
              placeholder="1"
            />
            <p class="text-xs text-gray-500 mt-1">รหัสนำหน้าบัญชี เช่น 1=สินทรัพย์, 2=หนี้สิน</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Color <span class="text-red-500">*</span></label>
            <select v-model="typeForm.color" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">เลือกสี</option>
              <option value="green">🟢 Green - เขียว</option>
              <option value="red">🔴 Red - แดง</option>
              <option value="purple">🟣 Purple - ม่วง</option>
              <option value="blue">🔵 Blue - น้ำเงิน</option>
              <option value="orange">🟠 Orange - ส้ม</option>
              <option value="yellow">🟡 Yellow - เหลือง</option>
              <option value="pink">🩷 Pink - ชมพู</option>
              <option value="cyan">🩵 Cyan - ฟ้า</option>
              <option value="gray">⚫ Gray - เทา</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description <span class="text-red-500">*</span></label>
            <textarea
              v-model="typeForm.description"
              required
              rows="3"
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="คำอธิบายประเภทบัญชี"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" @click="closeTypeFormModal" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
              ยกเลิก
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Company Info Modal -->
  <CompanyInfoForm 
    v-if="showCompanyInfoModal"
    @close="closeCompanyInfoModal"
    @saved="onCompanyInfoSaved"
  />

  <!-- Default Accounts Modal -->
  <DefaultAccountsForm
    v-if="showDefaultAccountsModal"
    @close="closeDefaultAccountsModal"
    @saved="onDefaultAccountsSaved"
  />

  <!-- Tax Settings Modal -->
  <TaxSettingsForm
    v-if="showTaxSettingsModal"
    @close="closeTaxSettingsModal"
    @saved="onTaxSettingsSaved"
  />

  <!-- Currency Settings Modal -->
  <CurrencySettingsForm
    v-if="showCurrencySettingsModal"
    @close="closeCurrencySettingsModal"
    @saved="onCurrencySettingsSaved"
  />

  <!-- Fiscal Year Settings Modal -->
  <FiscalYearSettingsForm
    v-if="showFiscalYearModal"
    @close="closeFiscalYearModal"
    @saved="onFiscalYearSaved"
  />
</template>

<script>
// AccountingSettings จาก window.ERP_CORE (ประกาศใน main.js)
const accountingSettings = window.ERP_CORE.accounting

import CompanyInfoForm from '../company-info/Form.vue'
import DefaultAccountsForm from '../default-accounts/Form.vue'
import TaxSettingsForm from '../tax-settings/Form.vue'
import CurrencySettingsForm from '../currency/Form.vue'
import FiscalYearSettingsForm from '../fiscal-year/Form.vue'

export default {
  name: 'AccountingSettingsList',
  
  components: {
    CompanyInfoForm,
    DefaultAccountsForm,
    TaxSettingsForm,
    CurrencySettingsForm,
    FiscalYearSettingsForm
  },
  
  data() {
    return {
      showAccountTypesModal: false,
      showTypeFormModal: false,
      showCompanyInfoModal: false,
      showDefaultAccountsModal: false,
      showTaxSettingsModal: false,
      showCurrencySettingsModal: false,
      showFiscalYearModal: false,
      loadingTypes: false,
      accountTypesList: [],
      editingType: null,
      typeForm: {
        key: '',
        name: '',
        name_th: '',
        code_prefix: '',
        color: '',
        description: ''
      }
    }
  },

  methods: {
    openSetting(settingType) {
      // Handle number-series separately
      if (settingType === 'number-series') {
        this.$router.push({ name: 'accounting-number-series' })
        return
      }
      
      // Other settings show placeholder
      this.$swal({
        icon: 'info',
        title: 'Settings',
        text: `Open ${settingType} settings - This feature will be implemented soon`
      })
    },

    // Account Types Modal Methods
    async openAccountTypesModal() {
      this.showAccountTypesModal = true
      await this.loadAccountTypes()
    },

    closeAccountTypesModal() {
      this.showAccountTypesModal = false
      this.accountTypesList = []
    },

    // Company Info Modal Methods
    openCompanyInfoModal() {
      this.showCompanyInfoModal = true
    },

    closeCompanyInfoModal() {
      this.showCompanyInfoModal = false
    },

    onCompanyInfoSaved() {
      this.showCompanyInfoModal = false
    },

    // Default Accounts Modal Methods
    openDefaultAccountsModal() {
      this.showDefaultAccountsModal = true
    },

    closeDefaultAccountsModal() {
      this.showDefaultAccountsModal = false
    },

    onDefaultAccountsSaved() {
      this.showDefaultAccountsModal = false
    },

    // Tax Settings Modal Methods
    openTaxSettingsModal() {
      this.showTaxSettingsModal = true
    },

    closeTaxSettingsModal() {
      this.showTaxSettingsModal = false
    },

    onTaxSettingsSaved() {
      this.showTaxSettingsModal = false
    },

    // Currency Settings Modal Methods
    openCurrencySettingsModal() {
      this.showCurrencySettingsModal = true
    },

    closeCurrencySettingsModal() {
      this.showCurrencySettingsModal = false
    },

    onCurrencySettingsSaved() {
      this.showCurrencySettingsModal = false
    },

    // Fiscal Year Modal Methods
    openFiscalYearModal() {
      this.showFiscalYearModal = true
    },

    closeFiscalYearModal() {
      this.showFiscalYearModal = false
    },

    onFiscalYearSaved() {
      this.showFiscalYearModal = false
    },

    async loadAccountTypes() {
      this.loadingTypes = true
      try {
        await accountingSettings.loadAccountTypes()
        const data = accountingSettings.getAllAccountTypes()
        
        this.accountTypesList = Object.keys(data).map(key => ({
          key,
          ...data[key]
        }))
      } catch (error) {
        console.error('Load error:', error)
        this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
      } finally {
        this.loadingTypes = false
      }
    },

    async resetAccountTypesToDefault() {
      const result = await this.$swal?.fire({
        title: 'Reset to Default?',
        text: 'จะรีเซ็ตประเภทบัญชีเป็นค่า Default',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545'
      })

      if (result?.isConfirmed) {
        await accountingSettings.resetAccountTypesToDefault()
        await this.loadAccountTypes()
        this.$swal?.fire('สำเร็จ!', 'รีเซ็ตเรียบร้อย', 'success')
      }
    },

    openAddTypeModal() {
      this.editingType = null
      this.typeForm = { key: '', name: '', name_th: '', code_prefix: '', color: '', description: '' }
      this.showTypeFormModal = true
    },

    editAccountType(type) {
      this.editingType = type
      this.typeForm = {
        key: type.key,
        name: type.name,
        name_th: type.name_th,
        code_prefix: type.code_prefix,
        color: type.color,
        description: type.description
      }
      this.showTypeFormModal = true
    },

    closeTypeFormModal() {
      this.showTypeFormModal = false
      this.editingType = null
    },

    async saveAccountType() {
      try {
        if (this.editingType) {
          await accountingSettings.updateAccountType(
            this.editingType.key,
            this.typeForm.name,
            this.typeForm.name_th,
            this.typeForm.code_prefix,
            this.typeForm.color,
            this.typeForm.description
          )
          this.$swal?.fire('สำเร็จ!', 'แก้ไขเรียบร้อย', 'success')
        } else {
          await accountingSettings.addAccountType(
            this.typeForm.key,
            this.typeForm.name,
            this.typeForm.name_th,
            this.typeForm.code_prefix,
            this.typeForm.color,
            this.typeForm.description
          )
          this.$swal?.fire('สำเร็จ!', 'เพิ่มเรียบร้อย', 'success')
        }

        this.closeTypeFormModal()
        await this.loadAccountTypes()
      } catch (error) {
        this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
      }
    },

    async deleteAccountType(type) {
      const result = await this.$swal?.fire({
        title: 'ยืนยันการลบ?',
        text: `ลบประเภทบัญชี "${type.name_th}"`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545'
      })

      if (result?.isConfirmed) {
        try {
          await accountingSettings.deleteAccountType(type.key)
          this.$swal?.fire('สำเร็จ!', 'ลบเรียบร้อย', 'success')
          await this.loadAccountTypes()
        } catch (error) {
          this.$swal?.fire('เกิดข้อผิดพลาด!', error.message, 'error')
        }
      }
    },

    // Styling Helper Methods
    getCardClass(color) {
      const classes = {
        green: 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200',
        red: 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200',
        purple: 'bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200',
        blue: 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200',
        orange: 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200',
        yellow: 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200',
        pink: 'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200',
        cyan: 'bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200',
        gray: 'bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200'
      }
      return classes[color] || 'bg-white border border-gray-200'
    },

    getIconBgClass(color) {
      const classes = {
        green: 'bg-green-100',
        red: 'bg-red-100',
        purple: 'bg-purple-100',
        blue: 'bg-blue-100',
        orange: 'bg-orange-100',
        yellow: 'bg-yellow-100',
        pink: 'bg-pink-100',
        cyan: 'bg-cyan-100',
        gray: 'bg-gray-100'
      }
      return classes[color] || 'bg-gray-100'
    },

    getIconClass(color) {
      const classes = {
        green: 'text-green-600',
        red: 'text-red-600',
        purple: 'text-purple-600',
        blue: 'text-blue-600',
        orange: 'text-orange-600',
        yellow: 'text-yellow-600',
        pink: 'text-pink-600',
        cyan: 'text-cyan-600',
        gray: 'text-gray-600'
      }
      return classes[color] || 'text-gray-600'
    }
  },

  mounted() {
    // Initialize AccountingSettings with this component instance
    accountingSettings.initialize(this)
    console.log('Accounting Settings List component loaded')
  }
}
</script>
