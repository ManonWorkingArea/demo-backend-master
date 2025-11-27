# 🎛️ AccountingSettings - Dynamic Account Mapping Guide

## ภาพรวม
**AccountingSettings** เป็นระบบจัดการผังบัญชีแบบ **Dynamic** ที่ช่วยให้คุณสามารถ:
- ✅ ปรับเปลี่ยน Account Code ได้ตามต้องการ
- ✅ ไม่ต้อง Hardcode ในโค้ด
- ✅ รองรับมาตรฐานบัญชีที่แตกต่างกัน
- ✅ ตั้งค่าผ่าน UI ได้เลย (ไม่ต้องแก้โค้ด)

---

## 🚀 การใช้งาน

### 1️⃣ **Initialize Settings (ทำครั้งเดียวตอน App Start)**

```javascript
// ใน main.js หรือ App.vue
import accountingService from '@/services/AccountingService'

// Initialize ครั้งเดียวตอนเริ่มแอพ
await accountingService.initialize()
```

---

### 2️⃣ **ใช้งานใน AccountingService (อัตโนมัติ)**

```javascript
// AccountingService จะดึง Account จาก Settings อัตโนมัติ
await accountingService.postSalesOrder(salesOrder)

// ภายในจะทำงานแบบนี้:
const ar = this.getAccount('accounts_receivable')  // → { code: '1120', name: '...' }
const revenue = this.getAccount('sales_revenue')   // → { code: '4100', name: '...' }
```

**ข้อดี:** ไม่ต้องแก้โค้ดเลย แค่เปลี่ยนที่ Settings!

---

### 3️⃣ **ดูการตั้งค่าปัจจุบัน**

```javascript
import accountingSettings from '@/services/AccountingSettings'

// โหลด Settings
await accountingSettings.loadSettings()

// ดูรายการทั้งหมด
const allAccounts = accountingSettings.getAllAccounts()
console.table(allAccounts)

// ดูตามประเภท
const assets = accountingSettings.getAccountsByType('asset')
const revenues = accountingSettings.getAccountsByType('revenue')
```

---

### 4️⃣ **เปลี่ยน Account Code (ปรับตามมาตรฐานบริษัท)**

```javascript
import accountingSettings from '@/services/AccountingSettings'

// โหลด Settings ก่อน
await accountingSettings.loadSettings()

// เปลี่ยนรหัสลูกหนี้การค้าจาก 1120 เป็น 1200
await accountingSettings.updateAccount(
  'accounts_receivable',  // Key
  '1200',                 // Code ใหม่
  'Trade Receivables',    // Name ใหม่ (ถ้าต้องการ)
  'ลูกหนี้การค้า'          // Name ภาษาไทย
)

// จากนี้ AccountingService จะใช้ 1200 แทน 1120 อัตโนมัติ! ✅
```

---

### 5️⃣ **เพิ่ม Account ใหม่**

```javascript
// เพิ่มบัญชีใหม่ เช่น "ค่าโฆษณา Facebook"
await accountingSettings.addAccount(
  'facebook_ads',              // Key (ใช้ในโค้ด)
  '5223',                      // Account Code
  'Facebook Advertising',      // Name (EN)
  'ค่าโฆษณา Facebook',         // Name (TH)
  'expense'                    // Type
)

// ใช้งานใน AccountingService
const fbAds = this.getAccount('facebook_ads')
// → { code: '5223', name: 'Facebook Advertising', name_th: 'ค่าโฆษณา Facebook' }
```

---

### 6️⃣ **รีเซ็ตเป็นค่า Default**

```javascript
// กรณีตั้งค่าผิดพลาด สามารถรีเซ็ตได้
await accountingSettings.resetToDefault()
console.log('✅ Reset to Default Thai Accounting Standards')
```

---

## 🎨 **สร้างหน้า Settings UI**

### ตัวอย่าง Vue Component สำหรับตั้งค่า

```vue
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">ตั้งค่าผังบัญชี (Account Mapping)</h1>

    <!-- Filter by Type -->
    <div class="mb-4">
      <select v-model="filterType" class="border px-4 py-2 rounded">
        <option value="">ทั้งหมด</option>
        <option value="asset">สินทรัพย์ (Assets)</option>
        <option value="liability">หนี้สิน (Liabilities)</option>
        <option value="revenue">รายได้ (Revenue)</option>
        <option value="expense">ค่าใช้จ่าย (Expenses)</option>
      </select>
    </div>

    <!-- Account List -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 border">Key</th>
            <th class="px-4 py-2 border">Account Code</th>
            <th class="px-4 py-2 border">Account Name (EN)</th>
            <th class="px-4 py-2 border">Account Name (TH)</th>
            <th class="px-4 py-2 border">Type</th>
            <th class="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(account, key) in filteredAccounts" :key="key">
            <td class="px-4 py-2 border font-mono text-sm">{{ key }}</td>
            <td class="px-4 py-2 border">
              <input 
                v-model="account.code" 
                class="border px-2 py-1 w-24"
                @change="markAsChanged(key)"
              />
            </td>
            <td class="px-4 py-2 border">
              <input 
                v-model="account.name" 
                class="border px-2 py-1 w-full"
                @change="markAsChanged(key)"
              />
            </td>
            <td class="px-4 py-2 border">
              <input 
                v-model="account.name_th" 
                class="border px-2 py-1 w-full"
                @change="markAsChanged(key)"
              />
            </td>
            <td class="px-4 py-2 border">
              <span class="px-2 py-1 rounded text-xs" :class="getTypeBadgeClass(account.type)">
                {{ account.type }}
              </span>
            </td>
            <td class="px-4 py-2 border">
              <button 
                v-if="changedKeys.includes(key)"
                @click="saveAccount(key)"
                class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                บันทึก
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex gap-4">
      <button 
        @click="saveAllChanges"
        class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
      >
        💾 บันทึกทั้งหมด
      </button>
      
      <button 
        @click="resetToDefault"
        class="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
      >
        🔄 รีเซ็ตเป็นค่า Default
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import accountingSettings from '@/services/AccountingSettings'
import Swal from 'sweetalert2'

const accounts = ref({})
const filterType = ref('')
const changedKeys = ref([])

onMounted(async () => {
  await loadSettings()
})

const loadSettings = async () => {
  try {
    accounts.value = await accountingSettings.loadSettings()
  } catch (error) {
    Swal.fire('ผิดพลาด!', error.message, 'error')
  }
}

const filteredAccounts = computed(() => {
  if (!filterType.value) return accounts.value
  
  const filtered = {}
  Object.keys(accounts.value).forEach(key => {
    if (accounts.value[key].type === filterType.value) {
      filtered[key] = accounts.value[key]
    }
  })
  return filtered
})

const markAsChanged = (key) => {
  if (!changedKeys.value.includes(key)) {
    changedKeys.value.push(key)
  }
}

const saveAccount = async (key) => {
  try {
    const account = accounts.value[key]
    await accountingSettings.updateAccount(
      key, 
      account.code, 
      account.name, 
      account.name_th
    )
    
    changedKeys.value = changedKeys.value.filter(k => k !== key)
    Swal.fire('สำเร็จ!', `บันทึก ${key} เรียบร้อย`, 'success')
  } catch (error) {
    Swal.fire('ผิดพลาด!', error.message, 'error')
  }
}

const saveAllChanges = async () => {
  try {
    await accountingSettings.saveSettings(accounts.value)
    changedKeys.value = []
    Swal.fire('สำเร็จ!', 'บันทึกการเปลี่ยนแปลงทั้งหมดเรียบร้อย', 'success')
  } catch (error) {
    Swal.fire('ผิดพลาด!', error.message, 'error')
  }
}

const resetToDefault = async () => {
  const result = await Swal.fire({
    title: 'ยืนยันการรีเซ็ต?',
    text: 'จะรีเซ็ตผังบัญชีเป็นค่า Default (มาตรฐานไทย)',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'รีเซ็ต',
    cancelButtonText: 'ยกเลิก'
  })

  if (result.isConfirmed) {
    try {
      await accountingSettings.resetToDefault()
      await loadSettings()
      changedKeys.value = []
      Swal.fire('สำเร็จ!', 'รีเซ็ตเป็นค่า Default เรียบร้อย', 'success')
    } catch (error) {
      Swal.fire('ผิดพลาด!', error.message, 'error')
    }
  }
}

const getTypeBadgeClass = (type) => {
  const classes = {
    'asset': 'bg-blue-100 text-blue-800',
    'liability': 'bg-red-100 text-red-800',
    'equity': 'bg-purple-100 text-purple-800',
    'revenue': 'bg-green-100 text-green-800',
    'expense': 'bg-orange-100 text-orange-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}
</script>
```

---

## 📋 **Default Account Mapping (มาตรฐานไทย)**

| Key | Code | Name (TH) | Type |
|-----|------|-----------|------|
| cash | 1010 | เงินสด | asset |
| bank | 1020 | เงินฝากธนาคาร | asset |
| accounts_receivable | 1120 | ลูกหนี้การค้า | asset |
| input_vat | 1180 | ภาษีซื้อรอเครดิต | asset |
| inventory | 1310 | สินค้าคงเหลือ | asset |
| accounts_payable | 2110 | เจ้าหนี้การค้า | liability |
| output_vat | 2150 | ภาษีขายค้างจ่าย | liability |
| sales_revenue | 4100 | รายได้จากการขาย | revenue |
| cogs | 5100 | ต้นทุนขาย | expense |
| salary_expense | 5210 | ค่าเงินเดือน | expense |
| rent | 5310 | ค่าเช่า | expense |

**รวมทั้งหมด: 45+ Accounts** 

---

## 🎯 **Use Cases (กรณีใช้งานจริง)**

### **กรณีที่ 1: บริษัทใช้รหัสบัญชีเป็น 6 หลัก**
```javascript
// ปรับจาก 1120 เป็น 112000
await accountingSettings.updateAccount('accounts_receivable', '112000', 'Accounts Receivable - Trade')

// ทุกธุรกรรมจะใช้ 112000 อัตโนมัติ
```

### **กรณีที่ 2: บริษัทแยกบัญชีธนาคารหลายบัญชี**
```javascript
// เพิ่มบัญชีใหม่
await accountingSettings.addAccount('bank_kbank', '1021', 'Kasikorn Bank', 'ธนาคารกสิกรไทย', 'asset')
await accountingSettings.addAccount('bank_scb', '1022', 'Siam Commercial Bank', 'ธนาคารไทยพาณิชย์', 'asset')

// ใช้งานใน AccountingService
const kbank = this.getAccount('bank_kbank')
```

### **กรณีที่ 3: รองรับมาตรฐานบัญชีต่างประเทศ**
```javascript
// เปลี่ยนเป็นมาตรฐาน US GAAP
await accountingSettings.updateAccount('accounts_receivable', '1200', 'Accounts Receivable')
await accountingSettings.updateAccount('accounts_payable', '2000', 'Accounts Payable')
```

---

## ✅ **ข้อดีของระบบ Dynamic Account Mapping**

### 1. **ไม่ต้องแก้โค้ด**
- เปลี่ยนผังบัญชีผ่าน UI ได้เลย
- ไม่ต้อง Deploy ใหม่

### 2. **รองรับหลายมาตรฐาน**
- มาตรฐานไทย (Thai GAAP)
- มาตรฐานสากล (IFRS)
- มาตรฐานอเมริกา (US GAAP)
- มาตรฐานกำหนดเอง

### 3. **ปรับตามธุรกิจได้**
- SME: ใช้ผังบัญชีแบบง่าย
- Enterprise: ใช้ผังบัญชีแบบละเอียด
- Holding Company: ผังบัญชีรวมหลายบริษัท

### 4. **Audit Trail สมบูรณ์**
- เห็นประวัติการเปลี่ยนแปลง
- รู้ว่าใครเปลี่ยนเมื่อไหร่

---

## 🎓 **Best Practices**

### ✅ ทำ
```javascript
// 1. Initialize ตอนเริ่ม App
await accountingService.initialize()

// 2. ใช้ getAccount() ทุกครั้ง (ไม่ Hardcode)
const revenue = this.getAccount('sales_revenue')

// 3. Backup Settings ก่อนเปลี่ยนแปลง
const backup = accountingSettings.getAllAccounts()
```

### ❌ ไม่ทำ
```javascript
// ❌ ห้าม Hardcode Account Code
items: [{ account_code: '1120', ... }]

// ✅ ใช้ Settings แทน
const ar = this.getAccount('accounts_receivable')
items: [{ account_code: ar.code, account_name: ar.name, ... }]
```

---

## 🚀 **สรุป**

**AccountingSettings = ระบบผังบัญชีแบบ Dynamic ที่:**
- ✅ ปรับเปลี่ยนได้ง่าย
- ✅ รองรับทุกมาตรฐาน
- ✅ ไม่ต้องแก้โค้ด
- ✅ มี UI สำหรับตั้งค่า
- ✅ Backup/Restore ได้

**เหมาะสำหรับ:**
- บริษัทที่มีธุรกิจหลายแบบ
- บริษัทที่อยู่หลายประเทศ
- ระบบ ERP ที่ต้องรองรับหลายลูกค้า
- Software House ที่ขายระบบให้หลายบริษัท

**พร้อมใช้งานแล้วครับ!** 🎉
