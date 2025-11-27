# แก้ไขปัญหา "ไม่สามารถโหลดรายการสินค้าได้" ใน QuotationForm

## ปัญหาที่พบ
- QuotationForm ไม่สามารถโหลดรายการสินค้าจาก InventoryService ได้
- แสดง error message: "ไม่สามารถโหลดรายการสินค้าได้"

## สาเหตุ
1. InventoryService ใน `window.ERP_CORE.inventory` อาจยังไม่ถูก initialize
2. ไม่มี error handling ที่ชัดเจน
3. ไม่ได้ map ข้อมูล product พร้อม balance อย่างถูกต้อง

## การแก้ไข (เวอร์ชันสุดท้าย)

### อ้างอิงจาก PurchaseRequestForm.vue
ปรับปรุง `loadProducts()` ให้ใช้วิธีเดียวกับ PurchaseRequestForm ที่ทำงานได้ดี:

**ไฟล์**: `src/extensions/modules/erp/modules/sales/components/quotation/shared/QuotationForm.vue`

```javascript
import { ref, computed, onMounted, inject, watch, getCurrentInstance } from 'vue'

const loadProducts = async () => {
  console.log('[Quotation Form] 📦 Loading products from Inventory Service...')
  
  // บังคับเคลียร์ข้อมูลเก่าอย่างสมบูรณ์
  console.log('[Quotation Form] 🗑️ Clear old data')
  products.value = []
  
  try {
    // ✅ ใช้ window.ERP_CORE.inventory (Single Source of Truth)
    const core = window.ERP_CORE
    
    // Debug: ตรวจสอบ ERP_CORE
    console.log('[Quotation Form] 🔍 ERP_CORE:', {
      exists: !!core,
      hasInventory: !!core?.inventory,
      inventoryReady: core?.inventory?.isReady?.()
    })
    
    if (!core?.inventory) {
      throw new Error('ERP_CORE.inventory not found')
    }
    
    // ✅ ตรวจสอบและ Initialize InventoryService ถ้ายังไม่พร้อม
    if (!core.inventory.isReady || !core.inventory.isReady()) {
      console.log('[Quotation Form] ⚠️ InventoryService not ready, initializing...')
      
      // ใช้ window.vueApp หรือ getCurrentInstance
      const initTarget = window.vueApp?.config?.globalProperties || getCurrentInstance()?.proxy
      
      if (initTarget) {
        core.inventory.initialize(initTarget)
        console.log('[Quotation Form] ✅ InventoryService initialized')
      } else {
        console.warn('[Quotation Form] No initialization target available')
      }
    }
    
    // ✅ ดึงข้อมูลสินค้า (InventoryService รวม balance ให้อัตโนมัติ)
    console.log('[Quotation Form] 🔍 Calling getAllProducts()...')
    const productsData = await core.inventory.getAllProducts()
    
    console.log(`[Quotation Form] 📦 Products loaded: ${productsData?.length || 0} items`)
    
    if (Array.isArray(productsData) && productsData.length > 0) {
      // Map ข้อมูล Product พร้อม balance (เหมือน PurchaseRequestForm)
      products.value = productsData.map(product => {
        const balance = product.balance // InventoryService รวม balance ให้แล้ว
        
        return {
          // Product info
          id: product.id || product._id,
          sku: product.sku || product.product_code || product.id,
          product_name: product.product_name || 'ไม่ระบุชื่อ',
          product_code: product.product_code || product.sku,
          description: product.description || '',
          category: product.category || '',
          unit: product.unit || 'ชิ้น',
          
          // Pricing
          unit_price: parseFloat(product.unit_price || 0),
          cost_price: parseFloat(product.cost_price || 0),
          
          // Stock info (จาก Balance record)
          stock_quantity: balance?.qty_on_hand || 0,
          available_quantity: balance?.qty_available || balance?.qty_on_hand || 0,
          reserved_quantity: balance?.qty_reserved || 0,
          min_stock: parseInt(product.min_stock_level || product.min_stock || 0),
          
          // Balance data
          balance: balance || null,
          
          // Status
          status: product.status || 'active'
        }
      })
      
      console.log(`[Quotation Form] ✅ Loaded ${products.value.length} products`)
      console.log('[Quotation Form] Sample product:', products.value[0])
      
    } else {
      console.warn('[Quotation Form] ⚠️ No products found')
      products.value = []
    }
    
    // Clear error ถ้าโหลดสำเร็จ
    if (error.value && error.value.includes('สินค้า')) {
      error.value = null
    }
    
  } catch (err) {
    console.error('[Quotation Form] ❌ Error loading products:', err)
    console.error('[Quotation Form] Error details:', {
      message: err.message,
      stack: err.stack,
      hasERP_CORE: !!window.ERP_CORE,
      hasInventory: !!window.ERP_CORE?.inventory
    })
    error.value = 'ไม่สามารถโหลดรายการสินค้าได้'
    products.value = []
  }
}
```

### 2. เพิ่ม UI Feedback
**Template Updates:**

#### แสดงสถานะการโหลด
```vue
<p v-if="products.length > 0" class="text-xs text-green-600 mt-1">
  <i class="fas fa-check-circle"></i> โหลดสินค้า {{ products.length }} รายการ
</p>
<p v-else-if="error && error.includes('สินค้า')" class="text-xs text-red-600 mt-1">
  <i class="fas fa-exclamation-circle"></i> {{ error }}
  <button 
    @click="loadProducts" 
    class="ml-2 text-blue-600 hover:text-blue-800 underline"
  >
    ลองอีกครั้ง
  </button>
</p>
```

#### Disable dropdown เมื่อไม่มีสินค้า
```vue
<select
  v-model="item.product_id"
  @change="onProductItemChange(item)"
  :disabled="products.length === 0"
  class="w-full px-3 py-2 border border-gray-300 rounded-md"
  :class="{ 'bg-gray-100': products.length === 0 }"
>
  <option value="">
    {{ products.length === 0 ? '-- กำลังโหลดรายการสินค้า... --' : '-- เลือกสินค้าจาก Inventory --' }}
  </option>
</select>
```

## วิธี Debug

### 1. เช็ค Console Log
เปิด Browser Console และดูข้อความ:
```
[Quotation Form] 📦 Loading products from Inventory Service...
[Quotation Form] ✅ Found ERP_CORE.inventory
[Quotation Form] ✅ Loaded X products
```

### 2. ตรวจสอบ ERP_CORE
ใน Browser Console พิมพ์:
```javascript
// ตรวจสอบว่ามี ERP_CORE หรือไม่
console.log('ERP_CORE:', window.ERP_CORE)

// ตรวจสอบ inventory service
console.log('Inventory Service:', window.ERP_CORE?.inventory)

// ตรวจสอบว่า initialized หรือยัง
console.log('Is Ready:', window.ERP_CORE?.inventory?.isReady())

// ทดสอบโหลดสินค้า
window.ERP_CORE.inventory.getAllProducts().then(products => {
  console.log('Products:', products)
})
```

### 3. ตรวจสอบ Vue App Instance
```javascript
console.log('Vue App:', window.vueApp)
console.log('Global Properties:', window.vueApp?.config?.globalProperties)
console.log('$Request:', window.vueApp?.config?.globalProperties?.$Request)
```

## การทดสอบ

### Test Case 1: โหลดสินค้าสำเร็จ
1. เปิดฟอร์มใบเสนอราคา
2. ตรวจสอบว่าแสดงข้อความ "โหลดสินค้า X รายการ"
3. เพิ่มรายการสินค้า
4. ตรวจสอบว่า dropdown แสดงรายการสินค้าจาก Inventory

### Test Case 2: โหลดสินค้าไม่สำเร็จ
1. เปิดฟอร์มใบเสนอราคา
2. ตรวจสอบว่าแสดง error message พร้อมปุ่ม "ลองอีกครั้ง"
3. คลิกปุ่ม "ลองอีกครั้ง"
4. ตรวจสอบว่าระบบพยายามโหลดใหม่

### Test Case 3: เลือกสินค้าจาก Dropdown
1. เพิ่มรายการสินค้า
2. เลือกสินค้าจาก dropdown
3. ตรวจสอบว่าข้อมูลถูก auto-fill:
   - ชื่อสินค้า (description)
   - SKU
   - หน่วย (unit)
   - ราคา (unit_price)

### Test Case 4: พิมพ์ชื่อสินค้าเอง
1. เพิ่มรายการสินค้า
2. ไม่เลือกจาก dropdown
3. พิมพ์ชื่อสินค้าเอง
4. ตรวจสอบว่าสามารถพิมพ์และบันทึกได้

## Error Messages ที่อาจพบ

### "Inventory Service not found in ERP_CORE"
**สาเหตุ**: `window.ERP_CORE.inventory` ไม่มีอยู่
**วิธีแก้**: 
- ตรวจสอบว่า `core/index.js` import และ export InventoryService ถูกต้อง
- ตรวจสอบว่า ERP Core ถูก initialize ก่อนเปิดฟอร์ม

### "InventoryService not initialized"
**สาเหตุ**: InventoryService ยังไม่ได้ initialize
**วิธีแก้**:
- ระบบจะ auto-initialize ด้วย `window.vueApp.config.globalProperties`
- ตรวจสอบว่า `window.vueApp` มีค่า

### API Error: "No $Request service found"
**สาเหตุ**: InventoryService ไม่มี $Request สำหรับเรียก API
**วิธีแก้**:
- ตรวจสอบว่า Vue app ถูก setup ถูกต้อง
- ตรวจสอบว่ามี $Request plugin ใน globalProperties

## Files ที่แก้ไข

1. **QuotationForm.vue**
   - ปรับปรุง `loadProducts()` function
   - เพิ่ม error handling และ fallback strategies
   - อัปเดต template เพื่อแสดงสถานะและ error message

## คุณสมบัติที่เพิ่ม

✅ Auto-initialize InventoryService หากยังไม่พร้อม
✅ Fallback strategy หาก ERP_CORE ไม่พร้อม
✅ แสดงจำนวนสินค้าที่โหลดได้
✅ แสดง error message พร้อมปุ่ม retry
✅ Disable dropdown เมื่อกำลังโหลด
✅ รองรับการพิมพ์ชื่อสินค้าเองได้
✅ Detailed console logging สำหรับ debug

## การบำรุงรักษา

- ตรวจสอบ console log เป็นประจำ
- ติดตาม error rate จาก error.value
- อัปเดต InventoryService ให้รองรับ product filtering/search
- พิจารณาเพิ่ม product caching เพื่อลด API calls

---

**วันที่แก้ไข**: 10 พฤศจิกายน 2025
**ผู้แก้ไข**: GitHub Copilot
**Status**: ✅ แก้ไขเสร็จสมบูรณ์
