# 📦 คู่มือการ Migrate QuotationForm ไปใช้ QuotationProductModal

> **วันที่สร้าง:** 24 พฤศจิกายน 2025  
> **สถานะ:** In Progress  
> **จุดประสงค์:** แยก Product Selection Modal ออกมาเป็น Component ใหม่ที่ใช้ InventoryService อย่างถูกต้อง

---

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. สร้าง QuotationProductModal.vue ใหม่
- **ไฟล์:** `src/extensions/modules/erp/modules/sales/components/quotation/shared/QuotationProductModal.vue`
- **Features:**
  - ✅ ใช้ `inject('inventoryService')` เพื่อดึง InventoryService
  - ✅ โหลดสินค้าด้วย `inventoryService.getAllProducts()`
  - ✅ โหลด lots พร้อม reservations ด้วย `inventoryService.getLotsWithReservations(productId)`
  - ✅ แสดงข้อมูล available, reserved อย่างถูกต้องจากคำนวณของ InventoryService
  - ✅ รองรับ Textile และ Non-Textile products
  - ✅ แยก logic ทั้งหมดออกจาก QuotationForm

### 2. เปลี่ยน Import และ Component Registration
- **ไฟล์:** `QuotationForm.vue`
```javascript
// เดิม
import ProductInventoryModal from './ProductInventoryModal.vue'

// ใหม่
import QuotationProductModal from './QuotationProductModal.vue'
```

```javascript
// เดิม
components: {
  ErpBreadcrumb,
  ProductInventoryModal
},

// ใหม่
components: {
  ErpBreadcrumb,
  QuotationProductModal
},
```

### 3. เปลี่ยน Template
```vue
<!-- เดิม -->
<ProductInventoryModal
  v-model="showInventoryModal"
  :products="products"
  @select-product="selectProduct"
  @select-product-with-lot="selectProductWithLot"
/>

<!-- ใหม่ -->
<QuotationProductModal
  v-model="showInventoryModal"
  @select-product="selectProduct"
  @select-product-with-lot="selectProductWithLot"
/>
```
**หมายเหตุ:** ลบ `:products="products"` ออก เพราะ QuotationProductModal โหลดเอง

---

## 🔧 สิ่งที่ต้องแก้ไขต่อ

### 1. ลบ State Variables ที่ไม่จำเป็นออก

**ใน `setup()` function:**

```javascript
// ❌ ลบตัวแปรเหล่านี้ออก
const products = ref([])  // ลบ - QuotationProductModal จัดการเอง
const lotReservations = ref({})  // ลบ - QuotationProductModal จัดการเอง
```

```javascript
// ✅ เก็บเฉพาะสิ่งที่จำเป็น
const loading = ref(false)
const navigating = ref(false)
const error = ref(null)
const successMessage = ref(null)
const customers = ref([])
const selectedCustomer = ref(null)
const codePreview = ref('')
const codeGenerationInfo = ref('')

// Modal state
const showInventoryModal = ref(false)

// Lot Method Modal state (สำหรับเลือกวิธีการสั่งซื้อ)
const showLotMethodModal = ref(false)
const selectedProductForMethod = ref(null)
const selectedLotForMethod = ref(null)
```

---

### 2. ลบฟังก์ชันที่ไม่จำเป็นออก

**❌ ลบฟังก์ชันเหล่านี้ทั้งหมด:**

```javascript
// ลบฟังก์ชัน loadProducts (บรรทัด 1240-1340)
const loadProducts = async () => { ... }

// ลบฟังก์ชัน loadLotReservations (บรรทัด 1395-1490)
const loadLotReservations = async () => { ... }

// ลบฟังก์ชัน getAvailableMeters (บรรทัด 1492-1500)
const getAvailableMeters = (lot) => { ... }

// ลบฟังก์ชัน isLotFullyReserved (บรรทัด 1502-1505)
const isLotFullyReserved = (lot) => { ... }

// ลบฟังก์ชัน getLotReservationStatus (บรรทัด 1507-1530)
const getLotReservationStatus = (lot) => { ... }

// ลบฟังก์ชัน getProductTotalReserved (บรรทัด 1640-1660)
const getProductTotalReserved = (product) => { ... }

// ลบฟังก์ชัน getProductTotalAvailable (บรรทัด 1662-1695)
const getProductTotalAvailable = (product) => { ... }
```

---

### 3. ปรับปรุงฟังก์ชัน showProductModal

**แทนที่ฟังก์ชันเดิม (บรรทัด 1340-1392) ด้วย:**

```javascript
// ✅ Modal Functions
const showProductModal = async () => {
  console.log('[Quotation Form] 🔍 Opening product selection modal...')
  
  // Show modal (QuotationProductModal จะโหลดข้อมูลเอง)
  showInventoryModal.value = true
}
```

---

### 4. ลบฟังก์ชัน onProductItemChange ออก

**ลบฟังก์ชันนี้ออก (บรรทัด 1698-1717):**

```javascript
// ❌ ลบทั้งหมด
const onProductItemChange = (item) => {
  if (!item.product_id) {
    return
  }
  
  const selectedProduct = products.value.find(p => p.id === item.product_id)
  
  if (selectedProduct) {
    item.description = selectedProduct.product_name
    item.sku = selectedProduct.sku
    item.unit_price = selectedProduct.unit_price
    item.unit = selectedProduct.unit
    item.max_quantity = selectedProduct.available_quantity || 0
    
    console.log('[Quotation Form] Product selected:', {
      sku: item.sku,
      name: item.description,
      price: item.unit_price,
      available: item.max_quantity
    })
  }
}
```

---

### 5. ลบการเรียกใช้ loadProducts() ใน onMounted

**ใน `onMounted` function (บรรทัด 1875-1945):**

```javascript
// เดิม
onMounted(async () => {
  console.log('[Quotation Form] Component mounted:', { mode: props.mode, recordId: props.recordId })
  
  try {
    await loadCustomers()
  } catch (err) {
    console.error('[Quotation Form] Error loading customers in onMounted:', err)
  }
  
  // ❌ ลบส่วนนี้ออก
  try {
    await loadProducts() // ลบ
  } catch (err) {
    console.error('[Quotation Form] Error loading products in onMounted:', err)
  }
  
  try {
    await updateCodePreview()
  } catch (err) {
    console.error('[Quotation Form] Error updating code preview in onMounted:', err)
  }
  
  // ... rest of onMounted
})

// ใหม่
onMounted(async () => {
  console.log('[Quotation Form] Component mounted:', { mode: props.mode, recordId: props.recordId })
  
  try {
    await loadCustomers()
  } catch (err) {
    console.error('[Quotation Form] Error loading customers in onMounted:', err)
  }
  
  // ✅ ลบการโหลด products ออก - QuotationProductModal จะจัดการเอง
  
  try {
    await updateCodePreview()
  } catch (err) {
    console.error('[Quotation Form] Error updating code preview in onMounted:', err)
  }
  
  // ... rest of onMounted
})
```

---

### 6. อัปเดต return statement

**ลบ exports ที่ไม่จำเป็นออกจาก return statement (บรรทัด 1952-2015):**

```javascript
return {
  loading,
  navigating,
  error,
  successMessage,
  customers,
  // ❌ ลบ: products,
  selectedCustomer,
  formData,
  subtotal,
  vatAmount,
  grandTotal,
  canSubmit,
  codePreview,
  codeGenerationInfo,
  breadcrumbNav,
  // Customer search
  customerSearchQuery,
  showCustomerDropdown,
  filteredCustomers,
  // Modal state
  showInventoryModal,
  // ❌ ลบ: lotReservations,
  // Lot Method Modal state
  showLotMethodModal,
  selectedProductForMethod,
  selectedLotForMethod,
  // Methods
  formatCurrency,
  addItem,
  removeItem,
  calculateItemTotal,
  onCustomerChange,
  // ❌ ลบ: onProductItemChange,
  // ❌ ลบ: loadProducts,
  // Customer search methods
  onCustomerInput,
  selectCustomer,
  hideCustomerDropdown,
  clearCustomer,
  formatCustomerStatus,
  // Code generation
  generateQuotationCode,
  loadQuotationNumberSeriesConfig,
  calculateNextQuotationSequence,
  updateCodePreview,
  submitForm,
  saveDraft,
  navigateBack,
  // Modal methods
  showProductModal,
  selectProduct,
  selectProductWithLot,
  confirmLotSelection,
  // ❌ ลบฟังก์ชันทั้งหมดเหล่านี้:
  // loadLotReservations,
  // getAvailableMeters,
  // isLotFullyReserved,
  // getLotReservationStatus,
  // getProductTotalReserved,
  // getProductTotalAvailable
}
```

---

### 7. ลบส่วนแสดงสถานะการโหลดสินค้าออกจาก Template

**ใน template (บรรทัด 330-340):**

```vue
<!-- เดิม -->
<div>
  <h3 class="text-lg font-semibold text-gray-900">รายการสินค้า/บริการ</h3>
  <p class="text-sm text-gray-600">เพิ่มรายการสินค้าหรือบริการในใบเสนอราคา</p>
  <!-- Show product count or error -->
  <p v-if="products.length > 0" class="text-xs text-green-600 mt-1">
    <i class="fas fa-check-circle"></i> โหลดสินค้า {{ products.length }} รายการ
  </p>
  <p v-else-if="error && error.includes('สินค้า')" class="text-xs text-red-600 mt-1">
    <i class="fas fa-exclamation-circle"></i> {{ error }}
    <button @click="loadProducts" class="ml-2 text-blue-600 hover:text-blue-800 underline">
      ลองอีกครั้ง
    </button>
  </p>
</div>

<!-- ใหม่ -->
<div>
  <h3 class="text-lg font-semibold text-gray-900">รายการสินค้า/บริการ</h3>
  <p class="text-sm text-gray-600">เพิ่มรายการสินค้าหรือบริการในใบเสนอราคา</p>
  <!-- ✅ ลบส่วนแสดงสถานะสินค้าออก เพราะ QuotationProductModal จัดการเอง -->
</div>
```

---

## 📋 สรุปไฟล์ที่ต้องแก้ไข

| ไฟล์ | สถานะ | การเปลี่ยนแปลง |
|------|-------|---------------|
| `QuotationProductModal.vue` | ✅ สร้างเสร็จ | Component ใหม่ที่ใช้ InventoryService |
| `QuotationForm.vue` | ⚠️ แก้ไขบางส่วน | ต้องลบโค้ดที่ไม่จำเป็นออก (ตามคู่มือนี้) |

---

## 🎯 ประโยชน์ของการ Migrate

### ✅ Separation of Concerns
- QuotationForm มุ่งเน้นเฉพาะการจัดการใบเสนอราคา
- QuotationProductModal มุ่งเน้นเฉพาะการเลือกสินค้า

### ✅ ใช้ InventoryService อย่างถูกต้อง
- ดึงข้อมูลผ่าน `getAllProducts()` และ `getLotsWithReservations()`
- ข้อมูล available, reserved คำนวณโดย InventoryService
- ไม่ต้องจัดการ logic ซ้ำซ้อนใน QuotationForm

### ✅ Code Reusability
- QuotationProductModal สามารถนำไปใช้ในฟอร์มอื่นได้ (เช่น SalesOrder, Invoice)
- Logic การเลือกสินค้ารวมศูนย์ในที่เดียว

### ✅ Easier Maintenance
- แก้ไข logic การเลือกสินค้าในที่เดียว
- QuotationForm สั้นลงและอ่านง่ายขึ้น

---

## ⚠️ สิ่งที่ต้องระวัง

### 1. การส่ง props
```javascript
// ❌ ไม่ต้องส่ง products props อีกต่อไป
<QuotationProductModal :products="products" />

// ✅ ถูกต้อง - ไม่ส่ง products
<QuotationProductModal />
```

### 2. การใช้ inventoryService
```javascript
// QuotationProductModal inject เอง
const inventoryService = inject('inventoryService', null)

// ไม่ต้องส่งจาก parent component
```

### 3. Events ที่ emit
```javascript
// ✅ เหมือนเดิม - ไม่ต้องเปลี่ยน
@select-product="selectProduct"
@select-product-with-lot="selectProductWithLot"
```

---

## 🧪 การทดสอบหลัง Migrate

### 1. ทดสอบการเปิด Modal
- [ ] คลิกปุ่ม "เลือกจากคลัง" แล้ว modal เปิด
- [ ] สินค้าโหลดออกมาครบถ้วน
- [ ] Filter ทำงานถูกต้อง

### 2. ทดสอบการเลือกสินค้า Non-Textile
- [ ] เลือกสินค้าทั่วไป แล้วเพิ่มเข้าฟอร์มได้
- [ ] ข้อมูลราคา, หน่วย ถูกต้อง

### 3. ทดสอบการเลือกสินค้า Textile
- [ ] เลือกสินค้าผ้า แล้วแสดง lots
- [ ] แสดงข้อมูล available, reserved ถูกต้อง
- [ ] เลือก lot แล้วเลือกวิธีการ (full_roll / custom_meters) ได้
- [ ] เพิ่มเข้าฟอร์มด้วยจำนวนที่ถูกต้อง

### 4. ทดสอบการสร้างใบเสนอราคา
- [ ] เพิ่มสินค้าได้ทั้ง textile และ non-textile
- [ ] คำนวณยอดรวมถูกต้อง
- [ ] บันทึกใบเสนอราคาสำเร็จ

---

## 📞 ติดต่อ / ช่วยเหลือ

หากพบปัญหาหรือมีคำถาม:
1. ตรวจสอบ Console ว่ามี error อะไร
2. ตรวจสอบว่า InventoryService inject สำเร็จหรือไม่
3. ตรวจสอบว่าลบฟังก์ชันที่ไม่จำเป็นออกหมดแล้วหรือยัง

---

**อัปเดตล่าสุด:** 24 พฤศจิกายน 2025
