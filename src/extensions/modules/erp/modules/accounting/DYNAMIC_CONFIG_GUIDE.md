# 📘 Accounting Module - การใช้งาน Dynamic Configuration

## 🎯 Overview

โมดูลบัญชีรองรับการตั้งค่าแบบ Dynamic ผ่าน **AccountingSettings Service** ซึ่งช่วยให้ผู้ใช้สามารถปรับแต่งค่าต่างๆ ได้ผ่าน UI โดยไม่ต้องแก้ไขโค้ด

---

## 🔧 การใช้งานใน Components

### **วิธีที่ 1: ใช้ Mixin (แนะนำ)**

```vue
<script>
import accountingConfigMixin from '../mixins/accountingConfigMixin'

export default {
  mixins: [accountingConfigMixin],
  
  async mounted() {
    // โหลด config ทั้งหมด
    await this.loadAllConfigs()
    
    // ตอนนี้สามารถใช้ได้เลย
    console.log(this.companyInfo)
    console.log(this.taxSettings)
    console.log(this.currencySettings)
  },
  
  methods: {
    createInvoice() {
      // ใช้ข้อมูลบริษัท
      const company = this.getCompanyInfoForDocument()
      
      // คำนวณ VAT
      const { vat, total } = this.calculateVAT(10000)
      
      // Format ตัวเลข
      const formatted = this.formatCurrency(total)
      
      return {
        company_name: company.name,
        tax_id: company.tax_id,
        amount: formatted
      }
    }
  }
}
</script>
```

### **วิธีที่ 2: ใช้ Service โดยตรง**

```vue
<script>
import accountingSettings from '@/services/AccountingSettings'

export default {
  data() {
    return {
      companyInfo: null,
      taxSettings: null
    }
  },
  
  async mounted() {
    // Initialize service
    accountingSettings.initialize(this)
    
    // โหลดข้อมูล
    this.companyInfo = await accountingSettings.getConfig('accounting.company_info')
    this.taxSettings = await accountingSettings.getConfig('accounting.tax_settings')
  }
}
</script>
```

### **วิธีที่ 3: ใช้ Helper Functions**

```vue
<script>
import { formatCurrency, calculateVAT, getCompanyInfoForDocument } from '../utils/accountingHelpers'

export default {
  data() {
    return {
      currencySettings: null
    }
  },
  
  methods: {
    displayAmount(amount) {
      return formatCurrency(amount, this.currencySettings)
    }
  }
}
</script>
```

---

## 📦 Available Configs

### **1. Company Info** - `accounting.company_info`
```javascript
{
  company_name_en: 'Company Ltd.',
  company_name_th: 'บริษัท ... จำกัด',
  tax_id: '0-0000-00000-00-0',
  branch: '00000',
  address: 'ที่อยู่',
  city: 'เขต',
  province: 'จังหวัด',
  postal_code: '10000',
  phone: '02-xxx-xxxx',
  email: 'info@company.com',
  website: 'https://company.com',
  logo_url: 'https://...'
}
```

**ใช้งาน:**
```javascript
// Mixin
const company = this.getCompanyInfoForDocument()

// Helper
import { getCompanyInfoForDocument } from '../utils/accountingHelpers'
const company = getCompanyInfoForDocument(this.companyInfo)
```

---

### **2. Account Types** - `accounting.account_types`
```javascript
{
  asset: { name: 'Asset', name_th: 'สินทรัพย์', code_prefix: '1', color: 'green' },
  liability: { name: 'Liability', name_th: 'หนี้สิน', code_prefix: '2', color: 'red' },
  // ...
}
```

**ใช้งาน:**
```javascript
// Mixin
await this.loadAccountTypes()
const assetType = this.getAccountTypeInfo('asset')

// Service
await accountingSettings.loadAccountTypes()
const types = accountingSettings.getAllAccountTypes()

// Helper
import { getAccountTypeName, getAccountTypeColor } from '../utils/accountingHelpers'
const name = getAccountTypeName(accountTypes, 'asset', 'th')
const color = getAccountTypeColor(accountTypes, 'asset')
```

---

### **3. Default Accounts** - `accounting.default_accounts`
```javascript
{
  cash: '1010',
  bank: '1020',
  accounts_receivable: '1110',
  accounts_payable: '2110',
  vat_payable: '2150',
  sales_revenue: '4110',
  // ...
}
```

**ใช้งาน:**
```javascript
// Mixin
await this.loadDefaultAccounts()
const cashAccount = this.getDefaultAccount('cash') // '1010'

// Service
const defaults = await accountingSettings.getConfig('accounting.default_accounts')
const bankAccount = defaults.bank
```

---

### **4. Tax Settings** - `accounting.tax_settings`
```javascript
{
  vat_enabled: true,
  vat_rate: 7,
  vat_calculation_method: 'exclusive', // or 'inclusive'
  wht_enabled: true,
  wht_service_rate: 3,
  wht_goods_rate: 1,
  // ...
}
```

**ใช้งาน:**
```javascript
// Mixin
const { vat, subtotal, total } = this.calculateVAT(10000)
const wht = this.calculateWithholdingTax(10000, 'service')

// Helper
import { calculateVAT, calculateWithholdingTax } from '../utils/accountingHelpers'
const vatResult = calculateVAT(10000, taxSettings, false)
const whtAmount = calculateWithholdingTax(10000, 'service', taxSettings)
```

---

### **5. Currency Settings** - `accounting.currency_settings`
```javascript
{
  base_currency: 'THB',
  base_currency_symbol: '฿',
  decimal_places: 2,
  decimal_separator: '.',
  thousand_separator: ',',
  symbol_position: 'before',
  rounding_method: 'round',
  // ...
}
```

**ใช้งาน:**
```javascript
// Mixin
const formatted = this.formatCurrency(10000.50) // "฿ 10,000.50"

// Helper
import { formatCurrency } from '../utils/accountingHelpers'
const amount = formatCurrency(10000.50, currencySettings, true)
```

---

### **6. Fiscal Year Settings** - `accounting.fiscal_year_settings`
```javascript
{
  fiscal_year_start_month: 1,
  fiscal_year_start_day: 1,
  current_fiscal_year: 2025,
  fiscal_year_format: 'YYYY',
  period_type: 'monthly',
  allow_backdated_transactions: false,
  // ...
}
```

**ใช้งาน:**
```javascript
// Mixin
const isAllowed = this.isBackdatedTransactionAllowed('2025-01-01')

// Helper
import { validateTransactionDate, getFiscalYear } from '../utils/accountingHelpers'
const errors = validateTransactionDate('2025-01-01', fiscalYearSettings)
const fiscalYear = getFiscalYear(new Date(), fiscalYearSettings)
```

---

## 🎨 ตัวอย่างการใช้งานจริง

### **สร้างใบเสร็จ/Invoice**

```vue
<template>
  <div class="invoice">
    <div class="company-header">
      <h1>{{ company.name_th }}</h1>
      <p>เลขที่ผู้เสียภาษี: {{ formatTaxID(company.tax_id) }}</p>
      <p>{{ company.address }}</p>
    </div>
    
    <table>
      <tr>
        <td>ยอดรวม</td>
        <td>{{ formatCurrency(subtotal) }}</td>
      </tr>
      <tr v-if="taxSettings.vat_enabled">
        <td>VAT {{ taxSettings.vat_rate }}%</td>
        <td>{{ formatCurrency(vat) }}</td>
      </tr>
      <tr>
        <td><strong>รวมทั้งสิ้น</strong></td>
        <td><strong>{{ formatCurrency(total) }}</strong></td>
      </tr>
    </table>
  </div>
</template>

<script>
import accountingConfigMixin from '../mixins/accountingConfigMixin'
import { formatTaxID } from '../utils/accountingHelpers'

export default {
  mixins: [accountingConfigMixin],
  
  data() {
    return {
      items: [
        { name: 'สินค้า A', price: 10000, quantity: 2 }
      ]
    }
  },
  
  async mounted() {
    await this.loadAllConfigs()
    this.calculateTotals()
  },
  
  computed: {
    company() {
      return this.getCompanyInfoForDocument()
    },
    
    subtotal() {
      return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }
  },
  
  methods: {
    formatTaxID,
    
    calculateTotals() {
      const result = this.calculateVAT(this.subtotal)
      this.vat = result.vat
      this.total = result.total
    }
  }
}
</script>
```

---

### **บันทึกรายการบัญชี**

```vue
<script>
import accountingConfigMixin from '../mixins/accountingConfigMixin'

export default {
  mixins: [accountingConfigMixin],
  
  data() {
    return {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        description: '',
        lines: []
      }
    }
  },
  
  async mounted() {
    await this.loadAllConfigs()
  },
  
  methods: {
    async saveJournalEntry() {
      // ตรวจสอบวันที่
      const dateErrors = this.validateDate(this.journalEntry.date)
      if (dateErrors.length > 0) {
        this.$swal.fire('ข้อผิดพลาด', dateErrors.join(', '), 'error')
        return
      }
      
      // ใช้บัญชีเริ่มต้น
      this.journalEntry.lines = [
        {
          account_code: this.getDefaultAccount('cash'),
          debit: 10000,
          credit: 0
        },
        {
          account_code: this.getDefaultAccount('sales_revenue'),
          debit: 0,
          credit: 10000
        }
      ]
      
      // บันทึก...
      await this.$Request.POST('/api/journal-entries', this.journalEntry, this.$Key)
    },
    
    validateDate(date) {
      const errors = []
      
      if (!this.isBackdatedTransactionAllowed(date)) {
        errors.push('ไม่อนุญาตให้บันทึกรายการย้อนหลัง')
      }
      
      if (this.isClosedPeriod(date)) {
        errors.push('งวดนี้ปิดแล้ว')
      }
      
      return errors
    }
  }
}
</script>
```

---

### **แสดงรายงาน**

```vue
<script>
import accountingConfigMixin from '../mixins/accountingConfigMixin'
import { formatFiscalYear, getPeriodName } from '../utils/accountingHelpers'

export default {
  mixins: [accountingConfigMixin],
  
  data() {
    return {
      reportData: []
    }
  },
  
  async mounted() {
    await this.loadAllConfigs()
    await this.loadReport()
  },
  
  methods: {
    async loadReport() {
      const fiscalYear = this.fiscalYearSettings.current_fiscal_year
      const periodType = this.fiscalYearSettings.period_type
      
      console.log(`Loading report for ${formatFiscalYear(fiscalYear, this.fiscalYearSettings.fiscal_year_format)}`)
      console.log(`Period: ${getPeriodName(1, periodType, 'th')}`)
      
      // โหลดข้อมูล...
    },
    
    displayAmount(amount) {
      return this.formatCurrency(amount)
    }
  }
}
</script>
```

---

## 🔄 Mixin Methods Reference

### **Loading Methods**
- `loadAllConfigs()` - โหลด config ทั้งหมด
- `loadCompanyInfo()` - โหลดข้อมูลบริษัท
- `loadAccountTypes()` - โหลดประเภทบัญชี
- `loadDefaultAccounts()` - โหลดบัญชีเริ่มต้น
- `loadTaxSettings()` - โหลดการตั้งค่าภาษี
- `loadCurrencySettings()` - โหลดการตั้งค่าสกุลเงิน
- `loadFiscalYearSettings()` - โหลดการตั้งค่าปีบัญชี

### **Calculation Methods**
- `calculateVAT(amount, isInclusive)` - คำนวณ VAT
- `calculateWithholdingTax(amount, type)` - คำนวณภาษีหัก ณ ที่จ่าย
- `formatCurrency(amount, showSymbol)` - Format ตัวเลขเงิน

### **Getter Methods**
- `getDefaultAccount(accountKey)` - ดึงรหัสบัญชีเริ่มต้น
- `getAccountTypeInfo(typeKey)` - ดึงข้อมูล Account Type
- `getCompanyInfoForDocument()` - ดึงข้อมูลบริษัทสำหรับเอกสาร

### **Validation Methods**
- `isBackdatedTransactionAllowed(date)` - ตรวจสอบรายการย้อนหลัง
- `isClosedPeriod(date)` - ตรวจสอบงวดปิด

---

## 📚 Helper Functions Reference

Import: `import { functionName } from '../utils/accountingHelpers'`

### **Currency**
- `formatCurrency(amount, currencySettings, showSymbol)`

### **Tax**
- `calculateVAT(amount, taxSettings, isInclusive)`
- `calculateWithholdingTax(amount, type, taxSettings)`
- `formatTaxID(taxId, format)`

### **Fiscal Year**
- `isDateInFiscalYear(date, fiscalYearSettings)`
- `getFiscalYear(date, fiscalYearSettings)`
- `formatFiscalYear(year, format)`
- `validateTransactionDate(date, fiscalYearSettings)`
- `getPeriodName(periodNumber, periodType, language)`

### **Account Types**
- `getAccountTypeColor(accountTypes, typeKey)`
- `getAccountTypeName(accountTypes, typeKey, language)`
- `generateAccountCode(typeKey, accountTypes, existingCodes)`

### **Company**
- `getCompanyInfoForDocument(companyInfo)`

---

## ⚠️ Important Notes

1. **ต้อง Initialize ก่อนใช้งาน:**
   ```javascript
   accountingSettings.initialize(this)
   ```

2. **ใช้ async/await:**
   ```javascript
   await this.loadAllConfigs()
   ```

3. **ตรวจสอบ null:**
   ```javascript
   if (this.companyInfo) {
     // ใช้งาน
   }
   ```

4. **Default Values:**
   - Mixin มี default values ให้อัตโนมัติ
   - ถ้าไม่มี config จะใช้ค่า default

5. **Error Handling:**
   ```javascript
   try {
     await this.loadAllConfigs()
   } catch (error) {
     console.error('Failed to load configs:', error)
   }
   ```

---

## 🎯 Best Practices

1. **โหลดครั้งเดียวใน mounted():**
   ```javascript
   async mounted() {
     await this.loadAllConfigs()
   }
   ```

2. **Cache ใน component:**
   - Config ถูก cache ใน component data
   - ไม่ต้องโหลดซ้ำทุกครั้ง

3. **ใช้ Helper Functions:**
   - สำหรับ stateless operations
   - ใช้ใน computed properties

4. **Validation ก่อนบันทึก:**
   ```javascript
   const errors = validateTransactionDate(date, this.fiscalYearSettings)
   if (errors.length > 0) {
     // แสดง error
   }
   ```

---

## 🚀 Next Steps

1. ดู examples ใน components ต่างๆ
2. ทดสอบใน development environment
3. ตั้งค่าผ่าน `/accounting/settings`
4. ใช้งานในโมดูลจริง

---

Happy Coding! 🎉
