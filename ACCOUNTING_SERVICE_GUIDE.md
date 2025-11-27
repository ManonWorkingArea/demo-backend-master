# 📘 AccountingService Usage Guide

## ภาพรวม
`AccountingService` เป็น **Centralized Service** ที่รวมฟังก์ชันบันทึกบัญชีทุกประเภทไว้ในที่เดียว รับประกันว่าทุก Transaction จะถูกบันทึกเป็น Journal Entry จริงๆ

**อัพเดทล่าสุด:** ครอบคลุมทุกมิติ 24 ฟังก์ชัน รองรับทุกโมดูลในระบบ ERP

---

## 🎯 ฟังก์ชันหลักทั้งหมด (24 ฟังก์ชัน)

### 📦 **PHASE 1: Sales & Purchase (6 ฟังก์ชัน)**

### 📦 **PHASE 1: Sales & Purchase (6 ฟังก์ชัน)**

### 1️⃣ **postSalesOrder(salesOrder)** - บันทึกยอดขาย
```javascript
import accountingService from '@/services/AccountingService'

// เมื่อสร้าง Sales Order
const salesOrder = {
  id: 'SO001',
  order_number: 'SO-2025-0001',
  order_date: '2025-01-15',
  customer_name: 'บริษัท ABC จำกัด',
  subtotal: 10000,
  vat_amount: 700,
  total: 10700
}

await accountingService.postSalesOrder(salesOrder)
```

**Journal Entry ที่สร้าง:**
```
Dr: ลูกหนี้การค้า (1120)         10,700
    Cr: รายได้จากการขาย (4100)           10,000
    Cr: ภาษีขาย VAT (2150)                   700
```

---

### 2️⃣ **postReceipt(receipt)** - บันทึกรับชำระเงิน
```javascript
// เมื่อลูกค้าชำระเงิน
const receipt = {
  id: 'RC001',
  receipt_number: 'RC-2025-0001',
  receipt_date: '2025-01-20',
  customer_name: 'บริษัท ABC จำกัด',
  amount: 10700,
  payment_method: 'transfer' // 'cash' หรือ 'transfer'
}

await accountingService.postReceipt(receipt)
```

**Journal Entry ที่สร้าง:**
```
Dr: ธนาคาร (1020)               10,700
    Cr: ลูกหนี้การค้า (1120)            10,700
```

---

### 3️⃣ **postPurchaseOrder(purchaseOrder)** - บันทึกยอดซื้อ
```javascript
// เมื่อสร้าง Purchase Order
const purchaseOrder = {
  id: 'PO001',
  po_number: 'PO-2025-0001',
  order_date: '2025-01-10',
  supplier_name: 'บริษัท XYZ จำกัด',
  subtotal: 50000,
  vat_amount: 3500,
  total: 53500
}

await accountingService.postPurchaseOrder(purchaseOrder)
```

**Journal Entry ที่สร้าง:**
```
Dr: สินค้าคงเหลือ (1310)        50,000
Dr: ภาษีซื้อ VAT (1180)          3,500
    Cr: เจ้าหนี้การค้า (2110)           53,500
```

---

### 4️⃣ **postPayment(payment)** - บันทึกจ่ายชำระเงิน
```javascript
// เมื่อจ่ายเงินให้ซัพพลายเออร์
const payment = {
  id: 'PY001',
  payment_number: 'PY-2025-0001',
  payment_date: '2025-01-25',
  supplier_name: 'บริษัท XYZ จำกัด',
  amount: 53500,
  payment_method: 'transfer'
}

await accountingService.postPayment(payment)
```

**Journal Entry ที่สร้าง:**
```
Dr: เจ้าหนี้การค้า (2110)       53,500
    Cr: ธนาคาร (1020)                   53,500
```

---

### 5️⃣ **postDeliveryWithCOGS(delivery, cogsAmount)** - บันทึกส่งของ + COGS
```javascript
// เมื่อส่งสินค้าให้ลูกค้า
const delivery = {
  id: 'DL001',
  delivery_number: 'DL-2025-0001',
  delivery_date: '2025-01-22',
  customer_name: 'บริษัท ABC จำกัด',
  order_number: 'SO-2025-0001'
}

const cogsAmount = 7500 // ต้นทุนที่แท้จริงของสินค้า (คำนวณจาก FIFO/Average)

await accountingService.postDeliveryWithCOGS(delivery, cogsAmount)
```

**Journal Entry ที่สร้าง:**
```
Dr: ต้นทุนขาย (5100)             7,500
    Cr: สินค้าคงเหลือ (1310)            7,500
```

---

### 🏭 **PHASE 2: Production Module (4 ฟังก์ชัน)** ✨ **ใหม่!**

### 14️⃣ **postRawMaterialsIssue(production)** - เบิกวัตถุดิบเข้าผลิต
```javascript
const production = {
  id: 'PRD001',
  production_number: 'PRD-2025-0001',
  issue_date: '2025-01-15',
  product_name: 'โต๊ะไม้',
  materials_cost: 15000
}

await accountingService.postRawMaterialsIssue(production)
```

**Journal Entry:**
```
Dr: สินค้าระหว่างผลิต (1320)    15,000
    Cr: วัตถุดิบคงเหลือ (1311)          15,000
```

---

### 15️⃣ **postDirectLabor(labor)** - บันทึกค่าแรงงานทางตรง
```javascript
const labor = {
  production_id: 'PRD001',
  production_number: 'PRD-2025-0001',
  date: '2025-01-16',
  product_name: 'โต๊ะไม้',
  labor_cost: 5000,
  hours: 20
}

await accountingService.postDirectLabor(labor)
```

**Journal Entry:**
```
Dr: สินค้าระหว่างผลิต (1320)     5,000
    Cr: ค่าแรงงานค้างจ่าย (2180)         5,000
```

---

### 16️⃣ **postManufacturingOverhead(overhead)** - บันทึกค่าโสหุ้ยการผลิต
```javascript
const overhead = {
  production_id: 'PRD001',
  production_number: 'PRD-2025-0001',
  date: '2025-01-17',
  description: 'ค่าไฟฟ้าโรงงาน + ค่าเสื่อมเครื่องจักร',
  overhead_cost: 3000
}

await accountingService.postManufacturingOverhead(overhead)
```

**Journal Entry:**
```
Dr: สินค้าระหว่างผลิต (1320)     3,000
    Cr: ค่าโสหุ้ยการผลิต (5150)         3,000
```

---

### 17️⃣ **postProductionCompletion(production)** - การผลิตเสร็จสมบูรณ์
```javascript
const production = {
  id: 'PRD001',
  production_number: 'PRD-2025-0001',
  completion_date: '2025-01-20',
  product_name: 'โต๊ะไม้',
  quantity: 10,
  unit: 'ตัว',
  total_production_cost: 23000 // วัตถุดิบ 15,000 + แรงงาน 5,000 + โสหุ้ย 3,000
}

await accountingService.postProductionCompletion(production)
```

**Journal Entry:**
```
Dr: สินค้าสำเร็จรูป (1330)      23,000
    Cr: สินค้าระหว่างผลิต (1320)       23,000
```

---

### 🚚 **PHASE 3: Delivery & Shipping (1 ฟังก์ชัน)** ✨ **ใหม่!**

### 18️⃣ **postShippingExpense(shipping)** - บันทึกค่าขนส่ง

**กรณีที่ 1: บริษัทรับผิดชอบค่าขนส่ง (Expense)**
```javascript
const shipping = {
  delivery_id: 'DL001',
  delivery_number: 'DL-2025-0001',
  date: '2025-01-22',
  customer_name: 'บริษัท ABC',
  amount: 500,
  payment_method: 'transfer',
  charge_to_customer: false, // บริษัทจ่าย
  carrier: 'Kerry Express'
}

await accountingService.postShippingExpense(shipping)
```

**Journal Entry:**
```
Dr: ค่าขนส่ง (5250)              500
    Cr: ธนาคาร (1020)                   500
```

**กรณีที่ 2: เก็บจากลูกค้า (Revenue)**
```javascript
const shipping = {
  delivery_id: 'DL001',
  delivery_number: 'DL-2025-0001',
  date: '2025-01-22',
  customer_name: 'บริษัท ABC',
  amount: 500,
  charge_to_customer: true // ลูกค้าจ่าย
}

await accountingService.postShippingExpense(shipping)
```

**Journal Entry:**
```
Dr: ลูกหนี้การค้า (1120)         500
    Cr: รายได้ค่าขนส่ง (4300)          500
```

---

### 💼 **PHASE 4: Expense by Department (2 ฟังก์ชัน)** ✨ **ใหม่!**

### 19️⃣ **postSellingExpense(expense)** - ค่าใช้จ่ายขาย
```javascript
const expense = {
  id: 'SE001',
  expense_number: 'SE-2025-0001',
  date: '2025-01-25',
  description: 'ค่าโฆษณา Facebook Ads',
  amount: 10000,
  payment_method: 'transfer',
  type: 'advertising' // advertising, commission, travel, marketing, promotion
}

await accountingService.postSellingExpense(expense)
```

**Journal Entry:**
```
Dr: ค่าโฆษณา (5220)           10,000
    Cr: ธนาคาร (1020)                 10,000
```

**ประเภทค่าใช้จ่ายขายที่รองรับ:**
- `advertising` → 5220: Advertising Expense
- `commission` → 5230: Sales Commission
- `travel` → 5240: Travel Expense
- `marketing` → 5221: Marketing Expense
- `promotion` → 5222: Promotion Expense

---

### 20️⃣ **postAdministrativeExpense(expense)** - ค่าใช้จ่ายบริหาร
```javascript
const expense = {
  id: 'AE001',
  expense_number: 'AE-2025-0001',
  date: '2025-01-28',
  description: 'ค่าเช่าสำนักงาน - มกราคม 2025',
  amount: 30000,
  payment_method: 'transfer',
  type: 'rent' // rent, utilities, office_supplies, insurance, professional_fees, maintenance, communication
}

await accountingService.postAdministrativeExpense(expense)
```

**Journal Entry:**
```
Dr: ค่าเช่า (5310)            30,000
    Cr: ธนาคาร (1020)                30,000
```

**ประเภทค่าใช้จ่ายบริหารที่รองรับ:**
- `rent` → 5310: Rent Expense
- `utilities` → 5320: Utilities Expense
- `office_supplies` → 5330: Office Supplies Expense
- `insurance` → 5340: Insurance Expense
- `professional_fees` → 5350: Professional Fees (ค่าที่ปรึกษา/บัญชี/กฎหมาย)
- `maintenance` → 5360: Maintenance & Repair Expense
- `communication` → 5370: Telephone & Internet

---

### 💰 **PHASE 5: Finance & Loan (4 ฟังก์ชัน)** ✨ **ใหม่!**

### 21️⃣ **postLoanReceived(loan)** - รับเงินกู้
```javascript
const loan = {
  id: 'LOAN001',
  loan_number: 'LOAN-2025-0001',
  loan_date: '2025-01-10',
  lender_name: 'ธนาคารกสิกรไทย',
  amount: 1000000,
  payment_method: 'transfer',
  term: 'long_term' // short_term (<1 ปี) หรือ long_term (>1 ปี)
}

await accountingService.postLoanReceived(loan)
```

**Journal Entry:**
```
Dr: ธนาคาร (1020)          1,000,000
    Cr: เงินกู้ระยะยาว (2510)     1,000,000
```

---

### 22️⃣ **postLoanPayment(payment)** - ชำระคืนเงินกู้
```javascript
const payment = {
  loan_id: 'LOAN001',
  loan_number: 'LOAN-2025-0001',
  payment_number: 'LP-2025-0001',
  payment_date: '2025-02-10',
  lender_name: 'ธนาคารกสิกรไทย',
  principal_amount: 50000,  // เงินต้น
  interest_amount: 5000,    // ดอกเบี้ย
  payment_method: 'transfer',
  loan_term: 'long_term',
  installment_number: 1
}

await accountingService.postLoanPayment(payment)
```

**Journal Entry:**
```
Dr: เงินกู้ระยะยาว (2510)      50,000
Dr: ดอกเบี้ยจ่าย (6200)         5,000
    Cr: ธนาคาร (1020)                 55,000
```

---

### 23️⃣ **postInterestIncome(interest)** - บันทึกดอกเบี้ยรับ
```javascript
const interest = {
  id: 'INT001',
  reference_number: 'INT-2025-0001',
  date: '2025-01-31',
  description: 'ดอกเบี้ยเงินฝากประจำ',
  amount: 2500,
  payment_method: 'transfer'
}

await accountingService.postInterestIncome(interest)
```

**Journal Entry:**
```
Dr: ธนาคาร (1020)               2,500
    Cr: ดอกเบี้ยรับ (4400)            2,500
```

---

### 24️⃣ **postInterestExpenseAccrual(interest)** - บันทึกดอกเบี้ยค้างจ่าย
```javascript
const interest = {
  loan_id: 'LOAN001',
  loan_number: 'LOAN-2025-0001',
  date: '2025-01-31',
  description: 'ดอกเบี้ยค้างจ่าย - มกราคม 2025',
  amount: 8333 // 1,000,000 * 10% / 12 เดือน
}

await accountingService.postInterestExpenseAccrual(interest)
```

**Journal Entry:**
```
Dr: ดอกเบี้ยจ่าย (6200)          8,333
    Cr: ดอกเบี้ยค้างจ่าย (2190)       8,333
```

---

## 🔧 Utility Functions
```javascript
// เมื่อมีค่าใช้จ่ายต่างๆ
const expense = {
  id: 'EX001',
  expense_number: 'EX-2025-0001',
  expense_date: '2025-01-18',
  description: 'ค่าเช่าสำนักงาน - มกราคม 2025',
  amount: 25000,
  payment_method: 'transfer',
  expense_account_code: '5310', // (Optional) ระบุบัญชีค่าใช้จ่าย
  expense_account_name: 'Rent Expense'
}

await accountingService.postExpense(expense)
```

**Journal Entry ที่สร้าง:**
```
Dr: ค่าเช่า (5310)              25,000
    Cr: ธนาคาร (1020)                   25,000
```

---

## 🔧 Utility Functions

### ดึงรายการบัญชีทั้งหมด
```javascript
const allEntries = await accountingService.getAllJournalEntries()
console.log(allEntries)
```

### ดึงรายการบัญชีตาม Reference
```javascript
// หา Journal Entry ที่เกี่ยวข้องกับ Sales Order
const entries = await accountingService.getJournalEntriesByReference('sales_order', 'SO001')
```

### ยกเลิกรายการบัญชี (Reversing Entry)
```javascript
// สร้างรายการกลับบัญชี (สลับ Dr/Cr)
const reversedEntry = await accountingService.createReversingEntry('JE20250115001')
```

### ลบรายการบัญชี
```javascript
await accountingService.deleteJournalEntry('JE20250115001')
```

---

## 🚀 วิธีใช้ในแต่ละ Module

### 📦 **Sales Module** (Form.vue)
```vue
<script setup>
import accountingService from '@/services/AccountingService'

const saveSalesOrder = async () => {
  try {
    // 1. บันทึก Sales Order ลง Sales Module
    const salesOrder = await saveSalesOrderToDatabase(formData)
    
    // 2. บันทึกบัญชีอัตโนมัติ ✅
    await accountingService.postSalesOrder(salesOrder)
    
    Swal.fire('สำเร็จ!', 'บันทึกยอดขายและบัญชีเรียบร้อย', 'success')
  } catch (error) {
    Swal.fire('ผิดพลาด!', error.message, 'error')
  }
}
</script>
```

### 💰 **Receipt Module** (ReceiptForm.vue)
```vue
<script setup>
import accountingService from '@/services/AccountingService'

const saveReceipt = async () => {
  try {
    // 1. บันทึกใบเสร็จ
    const receipt = await saveReceiptToDatabase(formData)
    
    // 2. บันทึกบัญชีอัตโนมัติ ✅
    await accountingService.postReceipt(receipt)
    
    Swal.fire('สำเร็จ!', 'บันทึกใบเสร็จและบัญชีเรียบร้อย', 'success')
  } catch (error) {
    Swal.fire('ผิดพลาด!', error.message, 'error')
  }
}
</script>
```

### 🛒 **Purchase Module** (PurchaseForm.vue)
```vue
<script setup>
import accountingService from '@/services/AccountingService'

const savePurchaseOrder = async () => {
  try {
    // 1. บันทึก Purchase Order
    const po = await savePurchaseOrderToDatabase(formData)
    
    // 2. บันทึกบัญชีอัตโนมัติ ✅
    await accountingService.postPurchaseOrder(po)
    
    // 3. อัพเดทสต็อกสินค้า
    await updateInventoryStock(po.items)
    
    Swal.fire('สำเร็จ!', 'บันทึก PO, สต็อก, และบัญชีเรียบร้อย', 'success')
  } catch (error) {
    Swal.fire('ผิดพลาด!', error.message, 'error')
  }
}
</script>
```

### 🚚 **Delivery Module** (DeliveryForm.vue)
```vue
<script setup>
import accountingService from '@/services/AccountingService'

const saveDelivery = async () => {
  try {
    // 1. บันทึก Delivery
    const delivery = await saveDeliveryToDatabase(formData)
    
    // 2. คำนวณ COGS (FIFO/Average)
    const cogsAmount = await calculateCOGS(delivery.items)
    
    // 3. บันทึกบัญชีอัตโนมัติ ✅
    await accountingService.postDeliveryWithCOGS(delivery, cogsAmount)
    
    Swal.fire('สำเร็จ!', 'บันทึกการส่งของและ COGS เรียบร้อย', 'success')
  } catch (error) {
    Swal.fire('ผิดพลาด!', error.message, 'error')
  }
}
</script>
```

---

## ✅ ข้อดีของวิธีนี้

### 1. **100% มั่นใจว่าบัญชีถูกบันทึก**
- เรียกฟังก์ชันตรงๆ ไม่ผ่าน Event
- มี Try-Catch รอบทุก Transaction
- มี Console Log เพื่อ Debug

### 2. **Validation ครบถ้วน**
- ตรวจสอบ Debit = Credit อัตโนมัติ
- ตรวจสอบข้อมูลครบถ้วนก่อนบันทึก
- Throw Error ชัดเจนเมื่อมีปัญหา

### 3. **Audit Trail สมบูรณ์**
- บันทึก Reference Type + ID ทุกรายการ
- สามารถค้นหาย้อนกลับได้
- มี Reversing Entry สำหรับยกเลิก

### 4. **ใช้งานง่าย**
- Import มาเรียกใช้เลย
- Parameters ชัดเจน
- มี JSDoc Comment ครบทุกฟังก์ชัน

---

## 📊 Flow การทำงานจริง

```
[Sales Order Form]
      ↓
  saveSalesOrder()
      ↓
  ✅ accountingService.postSalesOrder() ← เรียกตรงนี้!
      ↓
  Journal Entry ถูกบันทึก
      ↓
  แสดงข้อความสำเร็จ
```

**ไม่มี Event Bus! ไม่ต้อง Emit! เรียกตรงๆ เลย!** 🎯

---

## 🔍 ตัวอย่างการ Debug

```javascript
// ตรวจสอบว่ามี Journal Entry ถูกสร้างไหม
const entries = await accountingService.getAllJournalEntries()
console.table(entries)

// ตรวจสอบว่า Sales Order มี Journal Entry แล้วไหม
const salesEntries = await accountingService.getJournalEntriesByReference('sales_order', 'SO001')
if (salesEntries.length > 0) {
  console.log('✅ บัญชีถูกบันทึกแล้ว')
} else {
  console.log('❌ ยังไม่มีบัญชี')
}
```

---

## 🎓 Best Practices

### ✅ ทำ
```javascript
// เรียกทันทีหลังบันทึก Transaction
await accountingService.postSalesOrder(salesOrder)
```

### ❌ ไม่ทำ
```javascript
// ไม่ควรใช้ setTimeout หรือ Promise แบบไม่รอผลลัพธ์
setTimeout(() => {
  accountingService.postSalesOrder(salesOrder) // อันตราย!
}, 1000)
```

---

## 🛡️ Error Handling

```javascript
try {
  await accountingService.postSalesOrder(salesOrder)
} catch (error) {
  // กรณี Debit != Credit
  if (error.message.includes('not balanced')) {
    Swal.fire('ผิดพลาด!', 'รายการบัญชีไม่สมดุล กรุณาตรวจสอบจำนวนเงิน', 'error')
  }
  // กรณีอื่นๆ
  else {
    console.error('Accounting Error:', error)
    Swal.fire('ผิดพลาด!', 'ไม่สามารถบันทึกบัญชีได้: ' + error.message, 'error')
  }
}
```

---

## 🎯 สรุป

**AccountingService ช่วยให้:**
1. ✅ มั่นใจ 100% ว่าบัญชีถูกบันทึก
2. ✅ เรียกใช้ง่าย ไม่ซับซ้อน
3. ✅ มี Validation และ Error Handling ครบ
4. ✅ มี Audit Trail สมบูรณ์
5. ✅ ใช้ได้กับทุก Module ในระบบ

**ไม่ต้องใช้ Event Bus! เรียกตรงๆ มั่นใจได้ 100%!** 🚀
