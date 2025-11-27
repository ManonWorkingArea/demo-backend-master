/**
 * Accounting Config Mixin
 * ใช้สำหรับโหลดและใช้งาน AccountingSettings ใน components ต่างๆ
 */
import accountingSettings from '@/services/AccountingSettings'

export default {
  data() {
    return {
      // Company Info
      companyInfo: null,
      
      // Account Types
      accountTypes: {},
      
      // Default Accounts
      defaultAccounts: {},
      
      // Tax Settings
      taxSettings: null,
      
      // Currency Settings
      currencySettings: null,
      
      // Fiscal Year Settings
      fiscalYearSettings: null,
      
      // Loading states
      configLoading: false,
      configLoaded: false
    }
  },

  async created() {
    // Initialize AccountingSettings
    accountingSettings.initialize(this)
  },

  methods: {
    /**
     * โหลด Config ทั้งหมด
     */
    async loadAllConfigs() {
      this.configLoading = true
      try {
        await Promise.all([
          this.loadCompanyInfo(),
          this.loadAccountTypes(),
          this.loadDefaultAccounts(),
          this.loadTaxSettings(),
          this.loadCurrencySettings(),
          this.loadFiscalYearSettings()
        ])
        this.configLoaded = true
        console.log('✅ Loaded all accounting configs')
      } catch (error) {
        console.error('❌ Failed to load configs:', error)
        throw error
      } finally {
        this.configLoading = false
      }
    },

    /**
     * โหลดข้อมูลบริษัท
     */
    async loadCompanyInfo() {
      try {
        this.companyInfo = await accountingSettings.getConfig('accounting.company_info')
        if (!this.companyInfo) {
          console.warn('⚠️ Company Info not configured')
        }
      } catch (error) {
        console.warn('⚠️ Failed to load Company Info:', error.message)
      }
    },

    /**
     * โหลดประเภทบัญชี
     */
    async loadAccountTypes() {
      try {
        await accountingSettings.loadAccountTypes()
        this.accountTypes = accountingSettings.getAllAccountTypes()
      } catch (error) {
        console.warn('⚠️ Failed to load Account Types:', error.message)
        this.accountTypes = accountingSettings.defaultAccountTypes
      }
    },

    /**
     * โหลดบัญชีเริ่มต้น
     */
    async loadDefaultAccounts() {
      try {
        this.defaultAccounts = await accountingSettings.getConfig('accounting.default_accounts')
        if (!this.defaultAccounts) {
          console.warn('⚠️ Default Accounts not configured')
          this.defaultAccounts = {}
        }
      } catch (error) {
        console.warn('⚠️ Failed to load Default Accounts:', error.message)
        this.defaultAccounts = {}
      }
    },

    /**
     * โหลดการตั้งค่าภาษี
     */
    async loadTaxSettings() {
      try {
        this.taxSettings = await accountingSettings.getConfig('accounting.tax_settings')
        if (!this.taxSettings) {
          console.warn('⚠️ Tax Settings not configured')
          // Default tax settings
          this.taxSettings = {
            vat_enabled: true,
            vat_rate: 7,
            vat_calculation_method: 'exclusive',
            wht_enabled: false
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to load Tax Settings:', error.message)
        this.taxSettings = {
          vat_enabled: true,
          vat_rate: 7,
          vat_calculation_method: 'exclusive'
        }
      }
    },

    /**
     * โหลดการตั้งค่าสกุลเงิน
     */
    async loadCurrencySettings() {
      try {
        this.currencySettings = await accountingSettings.getConfig('accounting.currency_settings')
        if (!this.currencySettings) {
          console.warn('⚠️ Currency Settings not configured')
          // Default currency settings
          this.currencySettings = {
            base_currency: 'THB',
            base_currency_symbol: '฿',
            decimal_places: 2,
            decimal_separator: '.',
            thousand_separator: ',',
            symbol_position: 'before'
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to load Currency Settings:', error.message)
        this.currencySettings = {
          base_currency: 'THB',
          base_currency_symbol: '฿',
          decimal_places: 2,
          decimal_separator: '.',
          thousand_separator: ',',
          symbol_position: 'before'
        }
      }
    },

    /**
     * โหลดการตั้งค่าปีบัญชี
     */
    async loadFiscalYearSettings() {
      try {
        this.fiscalYearSettings = await accountingSettings.getConfig('accounting.fiscal_year_settings')
        if (!this.fiscalYearSettings) {
          console.warn('⚠️ Fiscal Year Settings not configured')
          // Default fiscal year settings
          this.fiscalYearSettings = {
            fiscal_year_start_month: 1,
            fiscal_year_start_day: 1,
            current_fiscal_year: new Date().getFullYear(),
            period_type: 'monthly'
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to load Fiscal Year Settings:', error.message)
        this.fiscalYearSettings = {
          fiscal_year_start_month: 1,
          fiscal_year_start_day: 1,
          current_fiscal_year: new Date().getFullYear()
        }
      }
    },

    /**
     * คำนวณ VAT
     */
    calculateVAT(amount, isInclusive = false) {
      if (!this.taxSettings || !this.taxSettings.vat_enabled) {
        return { vat: 0, subtotal: amount, total: amount }
      }

      const vatRate = this.taxSettings.vat_rate / 100

      if (isInclusive || this.taxSettings.vat_calculation_method === 'inclusive') {
        // ราคารวม VAT
        const vat = amount - (amount / (1 + vatRate))
        const subtotal = amount - vat
        return { vat, subtotal, total: amount }
      } else {
        // ราคาไม่รวม VAT
        const vat = amount * vatRate
        const total = amount + vat
        return { vat, subtotal: amount, total }
      }
    },

    /**
     * คำนวณภาษีหัก ณ ที่จ่าย
     */
    calculateWithholdingTax(amount, type = 'service') {
      if (!this.taxSettings || !this.taxSettings.wht_enabled) {
        return 0
      }

      const rates = {
        service: this.taxSettings.wht_service_rate || 3,
        goods: this.taxSettings.wht_goods_rate || 1,
        rent: this.taxSettings.wht_rent_rate || 5,
        transport: this.taxSettings.wht_transport_rate || 1
      }

      const rate = (rates[type] || 0) / 100
      return amount * rate
    },

    /**
     * Format ตัวเลขเงิน
     */
    formatCurrency(amount, showSymbol = true) {
      if (!this.currencySettings) {
        return amount.toFixed(2)
      }

      const decimals = this.currencySettings.decimal_places || 2
      const decSep = this.currencySettings.decimal_separator || '.'
      const thousandSep = this.currencySettings.thousand_separator || ','
      const symbol = this.currencySettings.base_currency_symbol || '฿'

      // Round based on rounding method
      let rounded = amount
      if (this.currencySettings.rounding_method === 'floor') {
        rounded = Math.floor(amount * Math.pow(10, decimals)) / Math.pow(10, decimals)
      } else if (this.currencySettings.rounding_method === 'ceil') {
        rounded = Math.ceil(amount * Math.pow(10, decimals)) / Math.pow(10, decimals)
      } else {
        rounded = Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals)
      }

      // Format number
      let formatted = rounded.toFixed(decimals)
      
      // Add thousand separators
      const parts = formatted.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep)
      formatted = parts.join(decSep)

      if (!showSymbol) {
        return formatted
      }

      // Add currency symbol
      return this.currencySettings.symbol_position === 'before'
        ? `${symbol} ${formatted}`
        : `${formatted} ${symbol}`
    },

    /**
     * ดึงรหัสบัญชีเริ่มต้น
     */
    getDefaultAccount(accountKey) {
      return this.defaultAccounts[accountKey] || ''
    },

    /**
     * ดึง Account Type Info
     */
    getAccountTypeInfo(typeKey) {
      return this.accountTypes[typeKey] || null
    },

    /**
     * ตรวจสอบว่าอนุญาตให้บันทึกรายการย้อนหลังหรือไม่
     */
    isBackdatedTransactionAllowed(transactionDate) {
      if (!this.fiscalYearSettings) return true
      
      if (!this.fiscalYearSettings.allow_backdated_transactions) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const txDate = new Date(transactionDate)
        txDate.setHours(0, 0, 0, 0)
        
        return txDate >= today
      }
      
      return true
    },

    /**
     * ตรวจสอบว่าอยู่ในงวดที่ปิดแล้วหรือไม่
     */
    isClosedPeriod(/* transactionDate */) {
      // TODO: Implement period closing check
      return false
    },

    /**
     * ดึงข้อมูลบริษัทสำหรับใส่ในเอกสาร
     */
    getCompanyInfoForDocument() {
      if (!this.companyInfo) {
        return {
          name: 'Company Name',
          tax_id: '0-0000-00000-00-0',
          address: 'Address',
          phone: '',
          email: ''
        }
      }

      return {
        name: this.companyInfo.company_name_th || this.companyInfo.company_name_en,
        name_en: this.companyInfo.company_name_en,
        name_th: this.companyInfo.company_name_th,
        tax_id: this.companyInfo.tax_id,
        branch: this.companyInfo.branch || '00000',
        address: this.companyInfo.address,
        city: this.companyInfo.city,
        province: this.companyInfo.province,
        postal_code: this.companyInfo.postal_code,
        phone: this.companyInfo.phone,
        email: this.companyInfo.email,
        website: this.companyInfo.website,
        logo_url: this.companyInfo.logo_url
      }
    }
  }
}
