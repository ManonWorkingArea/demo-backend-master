# InventoryManager - Purchase Orders Widget Update

## การปรับปรุงที่ทำ

### 1. เพิ่ม Widget แสดงจำนวน Purchase Orders ที่พร้อมรับเข้า

#### 📊 Stats Cards (เปลี่ยนจาก 4 columns เป็น 5 columns)
```vue
<!-- เดิม: lg:grid-cols-4 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
  
  <!-- เพิ่ม: Pending Purchase Orders Card -->
  <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" 
       @click="$router.push('/inventory/goods-receipt')">
    <div class="flex items-center">
      <div class="bg-orange-100 p-3 rounded-lg">
        <i class="fas fa-truck-loading text-orange-600 text-xl"></i>
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium text-gray-600">PO พร้อมรับเข้า</p>
        <p class="text-2xl font-bold text-gray-900">{{ pendingPOCount }}</p>
      </div>
    </div>
    <div class="mt-4">
      <span class="text-orange-500 text-sm font-medium">
        <i class="fas fa-clipboard-check mr-1"></i>Ready to Receive
      </span>
    </div>
  </div>
```

### 2. เพิ่มตัวเลขแสดงจำนวน PO ที่ปุ่ม "รับเข้าสินค้า"

#### 🔘 Button Badge
```vue
<button @click="$router.push('/inventory/goods-receipt')"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center relative">
  <i class="fas fa-truck-loading mr-2"></i>
  รับเข้าสินค้า
  <!-- Badge showing pending PO count -->
  <span v-if="pendingPOCount > 0" 
        class="ml-2 bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
    {{ pendingPOCount }}
  </span>
</button>
```

### 3. เพิ่ม Computed Property สำหรับนับ PO

#### 📊 JavaScript Logic
```javascript
// Computed for pending Purchase Orders count
const pendingPOCount = computed(() => {
  try {
    const approved = approvedPurchaseOrders.value || []
    return approved.filter(po => 
      po && 
      po.status === 'approved' && 
      po.workflow_state === 'approved' &&
      !po.goods_received // ยังไม่ได้รับเข้าสินค้า
    ).length
  } catch (error) {
    console.error('Error computing pending PO count:', error)
    return 0
  }
})
```

### 4. เพิ่มการโหลดข้อมูล PO ใน onMounted

#### 🚀 Mount Lifecycle
```javascript
onMounted(async () => {
  // โหลดข้อมูลทั้งหมด (สินค้า, Balance, Movements, และ Purchase Orders)
  await Promise.all([
    loadInventory(),
    loadBalance(),
    loadMovements(),
    loadApprovedPurchaseOrders() // เพิ่มการโหลด PO เพื่อแสดงจำนวนที่ปุ่มและ widget
  ])
  
  // Debug logs
  console.log('📊 Debug - Pending PO Count:', pendingPOCount.value)
})
```

## คุณสมบัติ

### ✅ Widget Card
- **คลิกได้**: คลิกที่ widget เพื่อไปยังหน้า Goods Receipt
- **Real-time Count**: แสดงจำนวน PO ที่พร้อมรับเข้าแบบ real-time
- **Visual Design**: ใช้สี Orange เพื่อแยกจาก widget อื่น
- **Icon**: ใช้ `fas fa-truck-loading` สอดคล้องกับการรับเข้าสินค้า

### ✅ Button Badge
- **Conditional Display**: แสดงเฉพาะเมื่อมี PO ที่พร้อมรับเข้า (> 0)
- **White Badge**: ใช้พื้นหลังสีขาวตัดกับปุ่มสีเขียว
- **Small Text**: ขนาดเล็กไม่รบกวนการใช้งาน

### ✅ Data Management
- **Automatic Refresh**: refresh ข้อมูล PO เมื่อ refresh data ทั้งหมด
- **Error Handling**: จัดการ error ทำให้ count แสดงเป็น 0 แทนที่จะ crash
- **Performance**: ใช้ computed property เพื่อ reactive updates

## การทำงาน

1. **Page Load**: โหลดข้อมูล PO พร้อมกับข้อมูลอื่น
2. **Count Calculation**: นับ PO ที่มี status='approved', workflow_state='approved', และยังไม่ได้ goods_received
3. **UI Update**: แสดงจำนวนใน widget และ button badge
4. **Navigation**: คลิก widget หรือ button เพื่อไปยังหน้า Goods Receipt
5. **Auto Refresh**: ข้อมูลจะ refresh เมื่อมีการเปลี่ยนแปลง

## สีและ Theme

- **Widget**: Orange theme (bg-orange-100, text-orange-600)
- **Button Badge**: White background with green text
- **Icons**: Consistent with existing design patterns

## การใช้งาน

ผู้ใช้จะเห็น:
1. **Dashboard Overview**: จำนวน PO ที่พร้อมรับเข้าใน Stats Cards
2. **Quick Action**: ตัวเลขที่ปุ่มรับเข้าสินค้าเพื่อบอกจำนวน pending items
3. **Direct Navigation**: คลิกเพื่อไปยัง Goods Receipt page ทันที

## Technical Notes

- ใช้ `TRANSACTION_TYPES.PURCHASE` เพื่อดึงข้อมูล Purchase Orders
- Filter เฉพาะ PO ที่ approved และยังไม่ได้รับเข้า
- Responsive design รองรับหน้าจอทุกขนาด
- ไม่มี breaking changes กับ existing functionality