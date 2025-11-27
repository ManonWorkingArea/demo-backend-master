/**
 * Accounting Settings - การตั้งค่าผังบัญชีแบบ Dynamic
 * ใช้สำหรับกำหนด Account Code ที่ใช้ในแต่ละประเภทธุรกรรม
 * สามารถปรับเปลี่ยนได้ตามความต้องการของแต่ละบริษัท
 * 
 * วิธีใช้งาน:
 * 1. โหลด Settings: await accountingSettings.loadSettings()
 * 2. ดึง Account Code: accountingSettings.getAccountCode('sales.revenue')
 * 3. บันทึก Settings: await accountingSettings.saveSettings(newSettings)
 */

class AccountingSettings {
  constructor() {
    this.moduleName = 'accounting'
    this.settings = null
    this.accountTypes = null
    this.apiRequest = null // Will be set via initialize()
    this.clientKey = null // API client key
    
    // Storage keys for configs collection
    this.ACCOUNT_MAPPING_KEY = 'accounting.account_mapping'
    this.ACCOUNT_TYPES_KEY = 'accounting.account_types'
    this.COMPANY_INFO_KEY = 'accounting.company_info'
    this.DEFAULT_ACCOUNTS_KEY = 'accounting.default_accounts'
    this.TAX_SETTINGS_KEY = 'accounting.tax_settings'
    this.CURRENCY_SETTINGS_KEY = 'accounting.currency_settings'
    this.FISCAL_YEAR_SETTINGS_KEY = 'accounting.fiscal_year_settings'
    this.FISCAL_PERIODS_KEY = 'accounting.fiscal_periods'
    
    // ค่า Default สำหรับ Fiscal Year (ปีบัญชี)
    this.defaultFiscalYear = {
      fiscal_year: '2025',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      status: 'active', // active, closed
      description: 'ปีบัญชี 2025',
      created_at: new Date().toISOString()
    }
    
    // ค่า Default สำหรับ Fiscal Periods (งวดบัญชี) - แบ่งตามเดือน
    this.defaultFiscalPeriods = [
      { period: '01', fiscal_year: '2025', name: 'มกราคม 2025', start_date: '2025-01-01', end_date: '2025-01-31', status: 'open' },
      { period: '02', fiscal_year: '2025', name: 'กุมภาพันธ์ 2025', start_date: '2025-02-01', end_date: '2025-02-28', status: 'open' },
      { period: '03', fiscal_year: '2025', name: 'มีนาคม 2025', start_date: '2025-03-01', end_date: '2025-03-31', status: 'open' },
      { period: '04', fiscal_year: '2025', name: 'เมษายน 2025', start_date: '2025-04-01', end_date: '2025-04-30', status: 'open' },
      { period: '05', fiscal_year: '2025', name: 'พฤษภาคม 2025', start_date: '2025-05-01', end_date: '2025-05-31', status: 'open' },
      { period: '06', fiscal_year: '2025', name: 'มิถุนายน 2025', start_date: '2025-06-01', end_date: '2025-06-30', status: 'open' },
      { period: '07', fiscal_year: '2025', name: 'กรกฎาคม 2025', start_date: '2025-07-01', end_date: '2025-07-31', status: 'open' },
      { period: '08', fiscal_year: '2025', name: 'สิงหาคม 2025', start_date: '2025-08-01', end_date: '2025-08-31', status: 'open' },
      { period: '09', fiscal_year: '2025', name: 'กันยายน 2025', start_date: '2025-09-01', end_date: '2025-09-30', status: 'open' },
      { period: '10', fiscal_year: '2025', name: 'ตุลาคม 2025', start_date: '2025-10-01', end_date: '2025-10-31', status: 'open' },
      { period: '11', fiscal_year: '2025', name: 'พฤศจิกายน 2025', start_date: '2025-11-01', end_date: '2025-11-30', status: 'open' },
      { period: '12', fiscal_year: '2025', name: 'ธันวาคม 2025', start_date: '2025-12-01', end_date: '2025-12-31', status: 'open' }
    ]
    
    // ค่า Default สำหรับประเภทบัญชี
    this.defaultAccountTypes = {
      asset: {
        name: 'Asset',
        name_th: 'สินทรัพย์',
        code_prefix: '1',
        color: '#10b981',
        description: 'ทรัพย์สินที่บริษัทเป็นเจ้าของ'
      },
      liability: {
        name: 'Liability',
        name_th: 'หนี้สิน',
        code_prefix: '2',
        color: '#ef4444',
        description: 'หนี้สินที่บริษัทต้องชำระ'
      },
      equity: {
        name: 'Equity',
        name_th: 'ทุน',
        code_prefix: '3',
        color: '#8b5cf6',
        description: 'ทุนของเจ้าของกิจการ'
      },
      revenue: {
        name: 'Revenue',
        name_th: 'รายได้',
        code_prefix: '4',
        color: '#3b82f6',
        description: 'รายได้จากการดำเนินงาน'
      },
      expense: {
        name: 'Expense',
        name_th: 'ค่าใช้จ่าย',
        code_prefix: '5',
        color: '#f97316',
        description: 'ค่าใช้จ่ายในการดำเนินงาน'
      }
    }
    
    // ค่า Default สำหรับระบบบัญชีมาตรฐานไทย
    this.defaultSettings = {
      // ========================================
      // ASSETS - สินทรัพย์
      // ========================================
      cash: {
        code: '1010',
        name: 'Cash on Hand',
        name_th: 'เงินสด',
        type: 'asset'
      },
      bank: {
        code: '1020',
        name: 'Bank Account',
        name_th: 'เงินฝากธนาคาร',
        type: 'asset'
      },
      accounts_receivable: {
        code: '1120',
        name: 'Accounts Receivable - Trade',
        name_th: 'ลูกหนี้การค้า',
        type: 'asset'
      },
      input_vat: {
        code: '1180',
        name: 'Input VAT Receivable',
        name_th: 'ภาษีซื้อรอเครดิต',
        type: 'asset'
      },
      inventory: {
        code: '1310',
        name: 'Inventory - Merchandise',
        name_th: 'สินค้าคงเหลือ',
        type: 'asset'
      },
      raw_materials: {
        code: '1311',
        name: 'Raw Materials Inventory',
        name_th: 'วัตถุดิบคงเหลือ',
        type: 'asset'
      },
      work_in_process: {
        code: '1320',
        name: 'Work in Process Inventory',
        name_th: 'สินค้าระหว่างผลิต',
        type: 'asset'
      },
      finished_goods: {
        code: '1330',
        name: 'Finished Goods Inventory',
        name_th: 'สินค้าสำเร็จรูป',
        type: 'asset'
      },
      accumulated_depreciation: {
        code: '1410',
        name: 'Accumulated Depreciation',
        name_th: 'ค่าเสื่อมราคาสะสม',
        type: 'asset'
      },

      // Fixed Assets - สินทรัพย์ถาวร
      fixed_assets: {
        code: '1500',
        name: 'Fixed Assets',
        name_th: 'สินทรัพย์ถาวร',
        type: 'asset'
      },
      land: {
        code: '1510',
        name: 'Land',
        name_th: 'ที่ดิน',
        type: 'asset'
      },
      building: {
        code: '1520',
        name: 'Building',
        name_th: 'อาคาร',
        type: 'asset'
      },
      machinery: {
        code: '1530',
        name: 'Machinery',
        name_th: 'เครื่องจักร',
        type: 'asset'
      },
      equipment: {
        code: '1540',
        name: 'Equipment',
        name_th: 'อุปกรณ์',
        type: 'asset'
      },
      vehicle: {
        code: '1550',
        name: 'Vehicle',
        name_th: 'ยานพาหนะ',
        type: 'asset'
      },
      furniture: {
        code: '1560',
        name: 'Furniture & Fixtures',
        name_th: 'เฟอร์นิเจอร์และติดตั้ง',
        type: 'asset'
      },
      computer: {
        code: '1570',
        name: 'Computer Equipment',
        name_th: 'อุปกรณ์คอมพิวเตอร์',
        type: 'asset'
      },

      // ========================================
      // LIABILITIES - หนี้สิน
      // ========================================
      accounts_payable: {
        code: '2110',
        name: 'Accounts Payable - Trade',
        name_th: 'เจ้าหนี้การค้า',
        type: 'liability'
      },
      short_term_loan: {
        code: '2120',
        name: 'Short-term Loan Payable',
        name_th: 'เงินกู้ยืมระยะสั้น',
        type: 'liability'
      },
      output_vat: {
        code: '2150',
        name: 'Output VAT Payable',
        name_th: 'ภาษีขายค้างจ่าย',
        type: 'liability'
      },
      withholding_tax: {
        code: '2160',
        name: 'Withholding Tax Payable',
        name_th: 'ภาษีหัก ณ ที่จ่าย',
        type: 'liability'
      },
      social_security: {
        code: '2170',
        name: 'Social Security Payable',
        name_th: 'ประกันสังคมค้างจ่าย',
        type: 'liability'
      },
      wages_payable: {
        code: '2180',
        name: 'Wages Payable',
        name_th: 'ค่าแรงงานค้างจ่าย',
        type: 'liability'
      },
      interest_payable: {
        code: '2190',
        name: 'Interest Payable',
        name_th: 'ดอกเบี้ยค้างจ่าย',
        type: 'liability'
      },
      long_term_loan: {
        code: '2510',
        name: 'Long-term Loan Payable',
        name_th: 'เงินกู้ยืมระยะยาว',
        type: 'liability'
      },

      // ========================================
      // EQUITY - ทุน (Capital & Retained Earnings)
      // ========================================
      capital: {
        code: '3110',
        name: 'Paid-in Capital',
        name_th: 'ทุนจดทะเบียน',
        type: 'equity'
      },
      retained_earnings: {
        code: '3210',
        name: 'Retained Earnings',
        name_th: 'กำไรสะสม',
        type: 'equity'
      },
      current_year_profit: {
        code: '3310',
        name: 'Current Year Profit/Loss',
        name_th: 'กำไร(ขาดทุน)สุทธิประจำปี',
        type: 'equity'
      },

      // ========================================
      // REVENUE - รายได้
      // ========================================
      sales_revenue: {
        code: '4110',
        name: 'Sales Revenue',
        name_th: 'รายได้จากการขาย',
        type: 'revenue'
      },
      service_revenue: {
        code: '4120',
        name: 'Service Revenue',
        name_th: 'รายได้ค่าบริการ',
        type: 'revenue'
      },
      rental_income: {
        code: '4130',
        name: 'Rental Income',
        name_th: 'รายได้ค่าเช่า',
        type: 'revenue'
      },
      discount_received: {
        code: '4140',
        name: 'Discount Received',
        name_th: 'ส่วนลดรับ',
        type: 'revenue'
      },
      gain_on_disposal: {
        code: '4200',
        name: 'Gain on Asset Disposal',
        name_th: 'กำไรจากการขายสินทรัพย์',
        type: 'revenue'
      },
      shipping_revenue: {
        code: '4300',
        name: 'Shipping Revenue',
        name_th: 'รายได้ค่าขนส่ง',
        type: 'revenue'
      },
      interest_income: {
        code: '4400',
        name: 'Interest Income',
        name_th: 'ดอกเบี้ยรับ',
        type: 'revenue'
      },
      dividend_income: {
        code: '4500',
        name: 'Dividend Income',
        name_th: 'เงินปันผลรับ',
        type: 'revenue'
      },
      exchange_gain: {
        code: '4600',
        name: 'Foreign Exchange Gain',
        name_th: 'กำไรจากอัตราแลกเปลี่ยน',
        type: 'revenue'
      },
      other_income: {
        code: '4910',
        name: 'Other Income',
        name_th: 'รายได้อื่น',
        type: 'revenue'
      },

      // ========================================
      // EXPENSES - ค่าใช้จ่าย
      // ========================================
      
      // Cost of Goods Sold
      cogs: {
        code: '5110',
        name: 'Cost of Goods Sold',
        name_th: 'ต้นทุนขาย',
        type: 'expense'
      },
      manufacturing_overhead: {
        code: '5150',
        name: 'Manufacturing Overhead',
        name_th: 'ค่าโสหุ้ยการผลิต',
        type: 'expense'
      },

      // Selling Expenses (5200-5299)
      selling_expense: {
        code: '5200',
        name: 'Selling Expenses',
        name_th: 'ค่าใช้จ่ายขาย',
        type: 'expense'
      },
      salary_expense: {
        code: '5210',
        name: 'Salary Expense',
        name_th: 'ค่าเงินเดือน',
        type: 'expense'
      },
      advertising: {
        code: '5220',
        name: 'Advertising Expense',
        name_th: 'ค่าโฆษณา',
        type: 'expense'
      },
      marketing: {
        code: '5221',
        name: 'Marketing Expense',
        name_th: 'ค่าการตลาด',
        type: 'expense'
      },
      promotion: {
        code: '5222',
        name: 'Promotion Expense',
        name_th: 'ค่าส่งเสริมการขาย',
        type: 'expense'
      },
      commission: {
        code: '5230',
        name: 'Sales Commission',
        name_th: 'ค่าคอมมิชชั่น',
        type: 'expense'
      },
      travel: {
        code: '5240',
        name: 'Travel Expense',
        name_th: 'ค่าเดินทาง',
        type: 'expense'
      },
      shipping_expense: {
        code: '5250',
        name: 'Shipping & Delivery Expense',
        name_th: 'ค่าขนส่งและจัดส่ง',
        type: 'expense'
      },

      // Administrative Expenses (5300-5399)
      admin_expense: {
        code: '5300',
        name: 'Administrative Expenses',
        name_th: 'ค่าใช้จ่ายบริหาร',
        type: 'expense'
      },
      rent: {
        code: '5310',
        name: 'Rent Expense',
        name_th: 'ค่าเช่า',
        type: 'expense'
      },
      utilities: {
        code: '5310',
        name: 'Utilities Expense',
        name_th: 'ค่าสาธารณูปโภค',
        type: 'expense'
      },
      office_supplies: {
        code: '5330',
        name: 'Office Supplies Expense',
        name_th: 'ค่าเครื่องเขียน',
        type: 'expense'
      },
      insurance: {
        code: '5340',
        name: 'Insurance Expense',
        name_th: 'ค่าประกัน',
        type: 'expense'
      },
      professional_fees: {
        code: '5350',
        name: 'Professional Fees',
        name_th: 'ค่าที่ปรึกษา',
        type: 'expense'
      },
      maintenance: {
        code: '5360',
        name: 'Maintenance & Repair Expense',
        name_th: 'ค่าซ่อมบำรุง',
        type: 'expense'
      },
      communication: {
        code: '5370',
        name: 'Telephone & Internet',
        name_th: 'ค่าโทรศัพท์และอินเทอร์เน็ต',
        type: 'expense'
      },

      // Depreciation & Other
      depreciation: {
        code: '5410',
        name: 'Depreciation Expense',
        name_th: 'ค่าเสื่อมราคา',
        type: 'expense'
      },
      amortization: {
        code: '5420',
        name: 'Amortization Expense',
        name_th: 'ค่าตัดจำหน่าย',
        type: 'expense'
      },
      bad_debt: {
        code: '5510',
        name: 'Bad Debt Expense',
        name_th: 'หนี้สูญและหนี้สงสัยจะสูญ',
        type: 'expense'
      },
      tax_expense: {
        code: '5610',
        name: 'Tax Expense',
        name_th: 'ค่าใช้จ่ายภาษี',
        type: 'expense'
      },
      bank_fees: {
        code: '5710',
        name: 'Bank Fees & Charges',
        name_th: 'ค่าธรรมเนียมธนาคาร',
        type: 'expense'
      },

      // Loss & Other Expenses (6xxx)
      loss_on_disposal: {
        code: '6100',
        name: 'Loss on Asset Disposal',
        name_th: 'ขาดทุนจากการขายสินทรัพย์',
        type: 'expense'
      },
      interest_expense: {
        code: '6200',
        name: 'Interest Expense',
        name_th: 'ดอกเบี้ยจ่าย',
        type: 'expense'
      },
      exchange_loss: {
        code: '6250',
        name: 'Foreign Exchange Loss',
        name_th: 'ขาดทุนจากอัตราแลกเปลี่ยน',
        type: 'expense'
      },
      miscellaneous_expense: {
        code: '6300',
        name: 'Miscellaneous Expense',
        name_th: 'ค่าใช้จ่ายเบ็ดเตล็ด',
        type: 'expense'
      }
    }
  }

  /**
   * Initialize with Vue app instance (for $Request service)
   * @param {Object} vueAppOrInstance - Vue app.config.globalProperties or component instance
   */
  initialize(vueAppOrInstance) {
    // Try to get $Request from various sources
    if (vueAppOrInstance?.$Request && typeof vueAppOrInstance.$Request === 'object') {
      this.apiRequest = vueAppOrInstance.$Request
      
      // ✅ ดึง clientKey จาก ERP_CORE (Single Source of Truth)
      this.clientKey = window.ERP_CORE?.clientKey || vueAppOrInstance.$Key || null
      this.initialized = true
      
      console.log('✅ AccountingSettings initialized with API ($Request from component)', {
        hasClientKey: !!this.clientKey,
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'fallback'
      })
    } else if (vueAppOrInstance?.appContext?.config?.globalProperties?.$Request) {
      this.apiRequest = vueAppOrInstance.appContext.config.globalProperties.$Request
      
      // ✅ ดึง clientKey จาก ERP_CORE (Single Source of Truth)
      this.clientKey = window.ERP_CORE?.clientKey || vueAppOrInstance.appContext.config.globalProperties.$Key || null
      this.initialized = true
      
      console.log('✅ AccountingSettings initialized with API (from appContext)', {
        hasClientKey: !!this.clientKey,
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'fallback'
      })
    } else if (typeof window !== 'undefined' && window.vueApp?.$Request) {
      this.apiRequest = window.vueApp.$Request
      
      // ✅ ดึง clientKey จาก ERP_CORE (Single Source of Truth)
      this.clientKey = window.ERP_CORE?.clientKey || window.vueApp.$Key || null
      this.initialized = true
      
      console.log('✅ AccountingSettings initialized with API (from window.vueApp)', {
        hasClientKey: !!this.clientKey,
        source: window.ERP_CORE?.clientKey ? 'ERP_CORE' : 'fallback'
      })
    } else {
      console.error('❌ AccountingSettings: No $Request service found!')
      console.log('Available properties:', Object.keys(vueAppOrInstance || {}))
      this.initialized = false
    }
  }

  /**
   * Get configuration from API
   */
  async getConfig(configKey) {
    if (!this.apiRequest) {
      throw new Error('AccountingSettings not initialized. Please call initialize(vueApp) first.')
    }

    try {
      console.log('🔍 getConfig called with:', configKey)
      // ใช้ aggregate pipeline เพื่อ filter ข้อมูล
      const response = await this.apiRequest.POST('configs/aggregate', {
        pipeline: [
          {
            $match: {
              config_key: configKey
            }
          }
        ]
      }, this.clientKey)
      
      console.log('📦 getConfig response:', response)
      console.log('📦 getConfig response.data:', response.data)
      
      // Response เป็น {data: [...], status: 200}
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('✅ Found config data:', response.data[0].config_data)
        return response.data[0].config_data
      }
      console.log('⚠️ No config found, returning null')
      return null
    } catch (error) {
      console.error(`❌ Failed to get config from API: ${error.message}`)
      throw error
    }
  }

  /**
   * Save configuration to API
   */
  async saveConfig(configKey, configData, metadata = {}) {
    if (!this.apiRequest) {
      throw new Error('AccountingSettings not initialized. Please call initialize(vueApp) first.')
    }

    try {
      // 1. GET เพื่อเช็คว่ามีข้อมูลอยู่แล้วหรือไม่
      const getResponse = await this.apiRequest.POST('configs/aggregate', {
        pipeline: [
          {
            $match: {
              config_key: configKey
            }
          }
        ]
      }, this.clientKey)
      
      console.log('='.repeat(80))
      console.log('🔍 CHECKING EXISTING CONFIG FOR:', configKey)
      console.log('📦 RESPONSE:', getResponse)
      console.log('📦 RESPONSE.DATA:', getResponse.data)
      console.log('📦 IS ARRAY:', Array.isArray(getResponse.data))
      console.log('📦 LENGTH:', getResponse.data?.length)
      console.log('='.repeat(80))
      
      const payload = {
        data: {
          config_key: configKey,
          module: this.moduleName,
          category: configKey.split('.')[1],
          config_data: configData,
          name: metadata.name || null,
          description: metadata.description || null,
          version: metadata.version || '1.0.0',
          is_public: metadata.is_public || false,
          is_system: metadata.is_system || false
        }
      }
      
      let response
      
      // 2. ถ้ามีข้อมูลแล้ว → ใช้ PUT /:id (response.data เป็น array)
      if (getResponse && getResponse.data && Array.isArray(getResponse.data) && getResponse.data.length > 0) {
        const existingId = getResponse.data[0]._id
        console.log('✏️ Updating existing config with ID:', existingId)
        response = await this.apiRequest.PUT(`configs/${existingId}`, payload, this.clientKey)
      } 
      // 3. ถ้าไม่มีข้อมูล → ใช้ POST
      else {
        console.log('➕ Creating new config')
        response = await this.apiRequest.POST('configs', payload, this.clientKey)
      }
      
      // เช็ค response (เช็คแค่ status 200 หรือมี _id)
      if (response && (response.status === 200 || response._id)) {
        console.log('✅ Config saved successfully')
        return true
      }
      throw new Error(response?.message || 'Failed to save config')
    } catch (error) {
      console.error(`❌ Failed to save config to API: ${error.message}`)
      throw error
    }
  }

  /**
   * Delete configuration from API
   */
  async deleteConfig(configKey) {
    if (!this.apiRequest) {
      throw new Error('AccountingSettings not initialized. Please call initialize(vueApp) first.')
    }

    try {
      console.log(`🗑️ Deleting config: ${configKey}`)
      
      // 1. GET เพื่อหา ID
      const getResponse = await this.apiRequest.POST('configs/aggregate', {
        pipeline: [
          {
            $match: {
              config_key: configKey
            }
          }
        ]
      }, this.clientKey)
      
      // 2. ถ้าเจอ ให้ DELETE
      if (getResponse && getResponse.data && Array.isArray(getResponse.data) && getResponse.data.length > 0) {
        const existingId = getResponse.data[0]._id
        console.log(`🗑️ Deleting config with ID: ${existingId}`)
        
        const response = await this.apiRequest.DELETE(`configs/${existingId}`, this.clientKey)
        
        if (response && response.status === 200) {
          console.log('✅ Config deleted successfully')
          return true
        }
      } else {
        console.log('ℹ️ No config found to delete')
        return true
      }
      
      return false
    } catch (error) {
      console.error(`❌ Failed to delete config: ${error.message}`)
      throw error
    }
  }

  /**
   * โหลด Settings จาก Database
   * ถ้ายังไม่มี จะใช้ค่า Default
   */
  /**
   * 🚀 โหลด Settings ทั้งหมดด้วย Aggregation Pipeline (1 request!)
   * ใช้สำหรับโหลดทุกอย่างครั้งเดียว: account_mapping, account_types, company_info, etc.
   */
  async loadAllSettingsWithAggregate() {
    try {
      if (!this.apiRequest) {
        throw new Error('API Request not initialized. Please call initialize() first.')
      }

      // 🔥 ใช้ aggregate เพื่อดึงข้อมูลทั้งหมดครั้งเดียว
      const result = await this.apiRequest.POST('configs/aggregate', {
        pipeline: [
          {
            $match: {
              config_key: {
                $regex: '^(accounting\\.|number_series\\.)',
                $options: 'i'
              }
            }
          },
          {
            $project: {
              _id: 1,
              config_key: 1,
              config_data: 1,
              name: 1,
              description: 1,
              updated_at: 1
            }
          }
        ]
      }, this.clientKey)

      console.log('[AccountingSettings] 🚀 Aggregate result:', result?.data?.length || 0, 'items')

      // แปลง Array เป็น Object แบบ { config_key: {value, metadata} }
      const settingsMap = {}
      if (result?.data && Array.isArray(result.data)) {
        result.data.forEach(item => {
          settingsMap[item.config_key] = {
            value: item.config_data,
            metadata: {
              name: item.name,
              description: item.description
            },
            updated_at: item.updated_at
          }
        })
      }

      // เก็บไว้ใน this.settings สำหรับการเข้าถึงแบบเดิม
      this.settings = settingsMap

      // ดึง account_mapping ออกมา (ถ้ามี)
      const accountMapping = settingsMap[this.ACCOUNT_MAPPING_KEY]?.value
      if (accountMapping && Object.keys(accountMapping).length > 0) {
        console.log('✅ Loaded Accounting Settings from Database')
      } else {
        console.log('✅ Using Default Accounting Settings')
      }

      return settingsMap
    } catch (error) {
      console.error('❌ Failed to load settings with aggregate:', error)
      this.settings = {}
      throw error
    }
  }

  async loadSettings() {
    try {
      const savedSettings = await this.getConfig(this.ACCOUNT_MAPPING_KEY)
      
      if (savedSettings && Object.keys(savedSettings).length > 0) {
        this.settings = savedSettings
        console.log('✅ Loaded Accounting Settings from Database')
      } else {
        // ใช้ค่า Default
        this.settings = { ...this.defaultSettings }
        console.log('✅ Using Default Accounting Settings')
      }
      
      return this.settings
    } catch (error) {
      console.warn('⚠️ Failed to load settings, using default:', error.message)
      this.settings = { ...this.defaultSettings }
      return this.settings
    }
  }

  /**
   * โหลด Account Types จาก Database
   */
  async loadAccountTypes() {
    try {
      const savedTypes = await this.getConfig(this.ACCOUNT_TYPES_KEY)
      
      if (savedTypes && Object.keys(savedTypes).length > 0) {
        this.accountTypes = savedTypes
        console.log('✅ Loaded Account Types from Database')
      } else {
        // ใช้ค่า Default
        this.accountTypes = { ...this.defaultAccountTypes }
        console.log('✅ Using Default Account Types')
      }
      
      return this.accountTypes
    } catch (error) {
      console.warn('⚠️ Failed to load account types, using default:', error.message)
      this.accountTypes = { ...this.defaultAccountTypes }
      return this.accountTypes
    }
  }

  /**
   * บันทึก Account Types ลง Database
   */
  async saveAccountTypes(newTypes) {
    try {
      this.accountTypes = newTypes
      await this.saveConfig(this.ACCOUNT_TYPES_KEY, newTypes, {
        name: 'Account Types Configuration',
        description: 'ประเภทบัญชีทั้งหมดในระบบ'
      })
      console.log('✅ Account Types Saved')
      return true
    } catch (error) {
      console.error('❌ Failed to save Account Types:', error.message)
      throw error
    }
  }

  /**
   * โหลด Company Info จาก Database
   */
  async loadCompanyInfo() {
    try {
      const savedInfo = await this.getConfig(this.COMPANY_INFO_KEY)
      
      if (savedInfo) {
        console.log('✅ Loaded Company Info from Database')
        return savedInfo
      }
      
      console.log('ℹ️ No Company Info found')
      return null
    } catch (error) {
      console.warn('⚠️ Failed to load Company Info:', error.message)
      return null
    }
  }

  /**
   * บันทึก Company Info ลง Database
   */
  async saveCompanyInfo(companyInfo) {
    try {
      await this.saveConfig(this.COMPANY_INFO_KEY, companyInfo, {
        name: 'Company Information',
        description: 'ข้อมูลบริษัทสำหรับเอกสารและภาษี'
      })
      console.log('✅ Company Info Saved')
      return true
    } catch (error) {
      console.error('❌ Failed to save Company Info:', error.message)
      throw error
    }
  }

  /**
   * บันทึก Settings ลง Database
   */
  async saveSettings(newSettings) {
    try {
      this.settings = newSettings
      await this.saveConfig(this.ACCOUNT_MAPPING_KEY, newSettings, {
        name: 'Account Mapping Configuration',
        description: 'ผังบัญชีทั้งหมดในระบบ'
      })
      console.log('✅ Accounting Settings Saved')
      return true
    } catch (error) {
      console.error('❌ Failed to save Accounting Settings:', error.message)
      throw error
    }
  }

  /**
   * ดึง Account Code ตาม Key
   * @param {string} key - ชื่อ key เช่น 'cash', 'sales_revenue'
   * @returns {string} - Account Code เช่น '1010'
   */
  getAccountCode(key) {
    if (!this.settings) {
      throw new Error('Settings not loaded. Please call loadSettings() first.')
    }

    if (!this.settings[key]) {
      console.warn(`⚠️ Account key "${key}" not found in settings`)
      return null
    }

    return this.settings[key].code
  }

  /**
   * ดึง Account Name ตาม Key
   */
  getAccountName(key) {
    if (!this.settings) {
      throw new Error('Settings not loaded. Please call loadSettings() first.')
    }

    if (!this.settings[key]) {
      console.warn(`⚠️ Account key "${key}" not found in settings`)
      return null
    }

    return this.settings[key].name
  }

  /**
   * ดึง Account ทั้งหมด (Code + Name) ตาม Key
   */
  getAccount(key) {
    if (!this.settings) {
      throw new Error('Settings not loaded. Please call loadSettings() first.')
    }

    if (!this.settings[key]) {
      console.warn(`⚠️ Account key "${key}" not found in settings`)
      return { code: null, name: null }
    }

    return {
      code: this.settings[key].code,
      name: this.settings[key].name,
      name_th: this.settings[key].name_th
    }
  }

  /**
   * อัพเดท Account Code เดียว
   */
  async updateAccount(key, code, name, name_th = null, type = null) {
    try {
      if (!this.settings) {
        await this.loadSettings()
      }

      if (!this.settings[key]) {
        throw new Error(`Account key "${key}" not found`)
      }

      this.settings[key].code = code
      this.settings[key].name = name
      if (name_th) {
        this.settings[key].name_th = name_th
      }
      if (type) {
        this.settings[key].type = type
      }

      await this.saveSettings(this.settings)
      console.log(`✅ Updated account: ${key} → ${code}`)
      return true
    } catch (error) {
      console.error('❌ Failed to update account:', error.message)
      throw error
    }
  }

  /**
   * เพิ่ม Account ใหม่
   */
  async addAccount(key, code, name, name_th, type) {
    try {
      if (!this.settings) {
        await this.loadSettings()
      }

      if (this.settings[key]) {
        throw new Error(`Account key "${key}" already exists`)
      }

      this.settings[key] = {
        code,
        name,
        name_th,
        type
      }

      await this.saveSettings(this.settings)
      console.log(`✅ Added new account: ${key} (${code})`)
      return true
    } catch (error) {
      console.error('❌ Failed to add account:', error.message)
      throw error
    }
  }

  /**
   * รีเซ็ตเป็นค่า Default
   */
  async resetToDefault() {
    try {
      this.settings = { ...this.defaultSettings }
      await this.saveSettings(this.settings)
      console.log('✅ Reset to Default Settings')
      return true
    } catch (error) {
      console.error('❌ Failed to reset settings:', error.message)
      throw error
    }
  }

  /**
   * ดึงรายการ Account ทั้งหมด
   */
  getAllAccounts() {
    if (!this.settings) {
      throw new Error('Settings not loaded. Please call loadSettings() first.')
    }
    return this.settings
  }

  /**
   * ดึง Account ตามประเภท (asset, liability, equity, revenue, expense)
   */
  getAccountsByType(type) {
    if (!this.settings) {
      throw new Error('Settings not loaded. Please call loadSettings() first.')
    }

    const accounts = {}
    Object.keys(this.settings).forEach(key => {
      if (this.settings[key].type === type) {
        accounts[key] = this.settings[key]
      }
    })

    return accounts
  }

  // ========================================
  // Account Types Management
  // ========================================

  /**
   * ดึงรายการ Account Types ทั้งหมด
   */
  getAllAccountTypes() {
    if (!this.accountTypes) {
      throw new Error('Account Types not loaded. Please call loadAccountTypes() first.')
    }
    return this.accountTypes
  }

  /**
   * ดึง Account Type ตาม Key
   */
  getAccountType(key) {
    if (!this.accountTypes) {
      throw new Error('Account Types not loaded. Please call loadAccountTypes() first.')
    }

    if (!this.accountTypes[key]) {
      console.warn(`⚠️ Account type key "${key}" not found`)
      return null
    }

    return this.accountTypes[key]
  }

  /**
   * เพิ่ม Account Type ใหม่
   */
  async addAccountType(key, name, name_th, code_prefix, color, description) {
    try {
      if (!this.accountTypes) {
        await this.loadAccountTypes()
      }

      if (this.accountTypes[key]) {
        throw new Error(`Account type key "${key}" already exists`)
      }

      this.accountTypes[key] = {
        name,
        name_th,
        code_prefix,
        color,
        description
      }

      await this.saveAccountTypes(this.accountTypes)
      console.log(`✅ Added new account type: ${key}`)
      return true
    } catch (error) {
      console.error('❌ Failed to add account type:', error.message)
      throw error
    }
  }

  /**
   * อัพเดท Account Type
   */
  async updateAccountType(key, name, name_th, code_prefix, color, description) {
    try {
      if (!this.accountTypes) {
        await this.loadAccountTypes()
      }

      if (!this.accountTypes[key]) {
        throw new Error(`Account type key "${key}" not found`)
      }

      this.accountTypes[key] = {
        name,
        name_th,
        code_prefix,
        color,
        description
      }

      await this.saveAccountTypes(this.accountTypes)
      console.log(`✅ Updated account type: ${key}`)
      return true
    } catch (error) {
      console.error('❌ Failed to update account type:', error.message)
      throw error
    }
  }

  /**
   * ลบ Account Type
   */
  async deleteAccountType(key) {
    try {
      if (!this.accountTypes) {
        await this.loadAccountTypes()
      }

      if (!this.accountTypes[key]) {
        throw new Error(`Account type key "${key}" not found`)
      }

      delete this.accountTypes[key]
      await this.saveAccountTypes(this.accountTypes)
      console.log(`✅ Deleted account type: ${key}`)
      return true
    } catch (error) {
      console.error('❌ Failed to delete account type:', error.message)
      throw error
    }
  }

  /**
   * รีเซ็ต Account Types เป็นค่า Default
   */
  async resetAccountTypesToDefault() {
    try {
      this.accountTypes = { ...this.defaultAccountTypes }
      await this.saveAccountTypes(this.accountTypes)
      console.log('✅ Reset Account Types to Default')
      return true
    } catch (error) {
      console.error('❌ Failed to reset account types:', error.message)
      throw error
    }
  }

  // ========================================
  // Fiscal Year Management
  // ========================================

  /**
   * โหลด Fiscal Year Settings
   */
  async loadFiscalYear() {
    try {
      const savedFiscalYear = await this.getConfig(this.FISCAL_YEAR_SETTINGS_KEY)
      
      if (savedFiscalYear) {
        console.log('✅ Loaded Fiscal Year from Database')
        return savedFiscalYear
      }
      
      console.log('ℹ️ No Fiscal Year found, using default')
      return this.defaultFiscalYear
    } catch (error) {
      console.warn('⚠️ Failed to load Fiscal Year:', error.message)
      return this.defaultFiscalYear
    }
  }

  /**
   * บันทึก Fiscal Year Settings
   */
  async saveFiscalYear(fiscalYearData) {
    try {
      await this.saveConfig(this.FISCAL_YEAR_SETTINGS_KEY, fiscalYearData, {
        name: 'Fiscal Year Settings',
        description: `ปีบัญชี ${fiscalYearData.fiscal_year}`
      })
      console.log('✅ Fiscal Year Saved')
      return true
    } catch (error) {
      console.error('❌ Failed to save Fiscal Year:', error.message)
      throw error
    }
  }

  /**
   * สร้าง Fiscal Year ใหม่พร้อม Periods
   */
  async createFiscalYear(year, startDate, endDate, periodType = 'monthly') {
    try {
      // สร้าง Fiscal Year
      const fiscalYear = {
        fiscal_year: year,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        period_type: periodType, // monthly, quarterly, custom
        description: `ปีบัญชี ${year}`,
        created_at: new Date().toISOString()
      }
      
      await this.saveFiscalYear(fiscalYear)
      
      // สร้าง Fiscal Periods อัตโนมัติ
      const periods = this.generateFiscalPeriods(year, startDate, endDate, periodType)
      await this.saveFiscalPeriods(periods)
      
      console.log(`✅ Created Fiscal Year ${year} with ${periods.length} periods`)
      return { fiscalYear, periods }
    } catch (error) {
      console.error('❌ Failed to create Fiscal Year:', error.message)
      throw error
    }
  }

  /**
   * สร้าง Fiscal Periods อัตโนมัติ
   */
  generateFiscalPeriods(year, startDate, endDate, periodType = 'monthly') {
    const periods = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (periodType === 'monthly') {
      // สร้าง 12 เดือน
      const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 
        'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
        'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ]
      
      for (let month = 0; month < 12; month++) {
        const periodStart = new Date(start.getFullYear(), start.getMonth() + month, 1)
        const periodEnd = new Date(start.getFullYear(), start.getMonth() + month + 1, 0)
        
        // ตรวจสอบว่าอยู่ในช่วง Fiscal Year หรือไม่
        if (periodStart >= start && periodEnd <= end) {
          periods.push({
            period: String(month + 1).padStart(2, '0'),
            fiscal_year: year,
            name: `${monthNames[month]} ${year}`,
            start_date: periodStart.toISOString().split('T')[0],
            end_date: periodEnd.toISOString().split('T')[0],
            status: 'open',
            created_at: new Date().toISOString()
          })
        }
      }
    } else if (periodType === 'quarterly') {
      // สร้าง 4 ไตรมาส
      const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4']
      
      for (let quarter = 0; quarter < 4; quarter++) {
        const periodStart = new Date(start.getFullYear(), quarter * 3, 1)
        const periodEnd = new Date(start.getFullYear(), (quarter + 1) * 3, 0)
        
        if (periodStart >= start && periodEnd <= end) {
          periods.push({
            period: quarterNames[quarter],
            fiscal_year: year,
            name: `ไตรมาสที่ ${quarter + 1} ปี ${year}`,
            start_date: periodStart.toISOString().split('T')[0],
            end_date: periodEnd.toISOString().split('T')[0],
            status: 'open',
            created_at: new Date().toISOString()
          })
        }
      }
    }
    
    return periods
  }

  // ========================================
  // Fiscal Periods Management
  // ========================================

  /**
   * โหลด Fiscal Periods
   */
  async loadFiscalPeriods(fiscalYear = null) {
    try {
      const savedPeriods = await this.getConfig(this.FISCAL_PERIODS_KEY)
      
      if (savedPeriods && Array.isArray(savedPeriods)) {
        // Filter by fiscal year if specified
        const periods = fiscalYear 
          ? savedPeriods.filter(p => p.fiscal_year === fiscalYear)
          : savedPeriods
        
        console.log(`✅ Loaded ${periods.length} Fiscal Periods from Database`)
        return periods
      }
      
      console.log('ℹ️ No Fiscal Periods found, using default')
      return this.defaultFiscalPeriods
    } catch (error) {
      console.warn('⚠️ Failed to load Fiscal Periods:', error.message)
      return this.defaultFiscalPeriods
    }
  }

  /**
   * บันทึก Fiscal Periods
   */
  async saveFiscalPeriods(periods) {
    try {
      await this.saveConfig(this.FISCAL_PERIODS_KEY, periods, {
        name: 'Fiscal Periods',
        description: `งวดบัญชีทั้งหมด (${periods.length} งวด)`
      })
      console.log(`✅ Saved ${periods.length} Fiscal Periods`)
      return true
    } catch (error) {
      console.error('❌ Failed to save Fiscal Periods:', error.message)
      throw error
    }
  }

  /**
   * ดึง Period ปัจจุบันตามวันที่
   */
  getCurrentPeriod(date = new Date()) {
    const currentDate = typeof date === 'string' ? new Date(date) : date
    const dateStr = currentDate.toISOString().split('T')[0]
    
    const period = this.defaultFiscalPeriods.find(p => 
      dateStr >= p.start_date && dateStr <= p.end_date
    )
    
    return period || null
  }

  /**
   * ดึง Period จากวันที่ (จาก Database)
   * ใช้สำหรับตรวจสอบว่างวดเปิดอยู่หรือไม่ก่อนบันทึกรายการ
   */
  async getCurrentPeriodFromDate(date = new Date()) {
    try {
      const currentDate = typeof date === 'string' ? new Date(date) : date
      const dateStr = currentDate.toISOString().split('T')[0]
      const periods = await this.loadFiscalPeriods()
      
      if (!periods || periods.length === 0) {
        console.warn('⚠️ ไม่พบข้อมูล Fiscal Periods ในระบบ')
        return null
      }
      
      const period = periods.find(p => 
        dateStr >= p.start_date && dateStr <= p.end_date
      )
      
      if (!period) {
        console.warn(`⚠️ ไม่พบงวดบัญชีสำหรับวันที่: ${dateStr}`)
      }
      
      return period
    } catch (error) {
      console.error('❌ Error getting current period:', error.message)
      return null
    }
  }

  /**
   * ปิดงวดบัญชี
   */
  async closePeriod(fiscalYear, period) {
    try {
      const periods = await this.loadFiscalPeriods()
      const targetPeriod = periods.find(p => 
        p.fiscal_year === fiscalYear && p.period === period
      )
      
      if (!targetPeriod) {
        throw new Error(`Period ${period} of fiscal year ${fiscalYear} not found`)
      }
      
      if (targetPeriod.status === 'closed') {
        throw new Error('Period is already closed')
      }
      
      targetPeriod.status = 'closed'
      targetPeriod.closed_at = new Date().toISOString()
      
      await this.saveFiscalPeriods(periods)
      console.log(`✅ Closed period ${period} of fiscal year ${fiscalYear}`)
      return true
    } catch (error) {
      console.error('❌ Failed to close period:', error.message)
      throw error
    }
  }

  /**
   * เปิดงวดบัญชีใหม่
   */
  async reopenPeriod(fiscalYear, period) {
    try {
      const periods = await this.loadFiscalPeriods()
      const targetPeriod = periods.find(p => 
        p.fiscal_year === fiscalYear && p.period === period
      )
      
      if (!targetPeriod) {
        throw new Error(`Period ${period} of fiscal year ${fiscalYear} not found`)
      }
      
      targetPeriod.status = 'open'
      targetPeriod.reopened_at = new Date().toISOString()
      
      await this.saveFiscalPeriods(periods)
      console.log(`✅ Reopened period ${period} of fiscal year ${fiscalYear}`)
      return true
    } catch (error) {
      console.error('❌ Failed to reopen period:', error.message)
      throw error
    }
  }

  /**
   * ตรวจสอบว่างวดเปิดอยู่หรือไม่
   */
  async isPeriodOpen(fiscalYear, period) {
    const periods = await this.loadFiscalPeriods()
    const targetPeriod = periods.find(p => 
      p.fiscal_year === fiscalYear && p.period === period
    )
    return targetPeriod?.status === 'open'
  }
}

// Export Singleton Instance
const accountingSettings = new AccountingSettings()
export default accountingSettings
