# 📦 คู่มือการใช้งาน Inventory Service

> **เวอร์ชัน:** 2.0  
> **อัปเดตล่าสุด:** 24 พฤศจิกายน 2025  
> **สำหรับ:** Developer และ System Integrator

---

## 📋 สารบัญ

1. [การเริ่มต้นใช้งาน](#การเริ่มต้นใช้งาน)
2. [Product Management](#product-management)
3. [Stock Location Management](#stock-location-management)
4. [Lot Tracking System](#lot-tracking-system)
5. [Stock Movement](#stock-movement)
6. [Stock Reservation](#stock-reservation)
7. [Inventory Balance](#inventory-balance)
8. [Error Handling](#error-handling)

---

## การเริ่มต้นใช้งาน

### Installation & Initialization

```javascript
import { inventoryService } from '@/services/InventoryService'

// Method 1: ใช้ผ่าน ERP_CORE (แนะนำ)
const inventory = window.ERP_CORE.inventory

// Method 2: ใช้ในคอมโพเนนต์ Vue
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const inventoryService = instance.appContext.config.globalProperties.$Inventory

// Method 3: Initialize manually
inventoryService.initialize(app.config.globalProperties)
```

### ตรวจสอบสถานะการเชื่อมต่อ

```javascript
if (!inventoryService.isReady()) {
  console.error('InventoryService not initialized')
  throw new Error('Service not ready')
}

console.log('✅ InventoryService ready')
```

---

## Product Management

### 1. ดึงสินค้าทั้งหมด

```javascript
/**
 * ดึงรายการสินค้าทั้งหมด (ไม่รวม soft deleted)
 * @returns {Promise<Array>} รายการสินค้าพร้อม inventory balance
 */
const getAllProducts = async () => {
  try {
    const products = await inventoryService.getAllProducts()
    
    console.log(`พบสินค้า ${products.length} รายการ`)
    
    // โครงสร้างข้อมูล
    products.forEach(product => {
      console.log({
        id: product._id,
        sku: product.sku,
        name: product.product_name,
        category: product.category,
        unit_price: product.unit_price,
        // Inventory Balance (ถ้ามี)
        qty_on_hand: product.qty_on_hand,
        qty_available: product.qty_available,
        qty_reserved: product.qty_reserved
      })
    })
    
    return products
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

### 2. ดึงสินค้าตาม ID พร้อมข้อมูล Inventory

```javascript
/**
 * ดึงข้อมูลสินค้าครบถ้วน พร้อม Balance, Lots, Movements, Reservations
 * @param {string} productId - ID ของสินค้า
 */
const getProductDetails = async (productId) => {
  try {
    const data = await inventoryService.getProductWithInventoryData(productId)
    
    console.log('📦 Product Data:', {
      id: data.id,
      sku: data.sku,
      name: data.product_name,
      current_stock: data.current_stock,
      available_stock: data.available_stock,
      reserved_stock: data.reserved_stock,
      
      // Inventory Balance
      balance: data.balance,
      
      // Lot Tracking (ถ้ามี)
      lots: data.lots,
      total_lots: data.lots?.length,
      
      // Stock Movements
      movements: data.movements,
      
      // Reservations
      reservations: data.reservations
    })
    
    return data
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

### 3. สร้างสินค้าใหม่

```javascript
/**
 * สร้างสินค้าใหม่
 */
const createNewProduct = async () => {
  try {
    const productData = {
      sku: 'SKU-2024-001',
      product_code: 'PROD-001',
      product_name: 'ผ้าฝ้าย สีกรม 152cm',
      description: 'ผ้าฝ้าย 100% คุณภาพดี',
      category: 'textile',
      unit: 'เมตร',
      unit_price: 120,
      cost_price: 80,
      
      // Textile specific
      model_code: '402',
      color_code: '177',
      fabric_width_cm: 152,
      fabric_type: 'cotton',
      fabric_composition: 'cotton 100%',
      
      // Status
      status: 'active',
      
      // Optional
      barcode: '8859012345678',
      min_stock_level: 100,
      max_stock_level: 1000,
      reorder_point: 200
    }
    
    const result = await inventoryService.createProduct(productData)
    console.log('✅ สร้างสินค้าสำเร็จ:', result._id)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 4. แก้ไขสินค้า

```javascript
const updateProduct = async (productId, updates) => {
  try {
    const result = await inventoryService.updateProduct(productId, {
      unit_price: 150,
      status: 'active',
      description: 'อัปเดตคำอธิบาย'
    })
    
    console.log('✅ อัปเดตสำเร็จ')
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 5. ลบสินค้า (Soft Delete)

```javascript
/**
 * Soft Delete - เปลี่ยน status = 'deleted'
 * ข้อมูลยังอยู่ในระบบ แต่ไม่แสดงในรายการทั่วไป
 */
const deleteProduct = async (productId) => {
  try {
    await inventoryService.deleteProduct(productId)
    console.log('✅ ลบสินค้าสำเร็จ (soft delete)')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

/**
 * กู้คืนสินค้าที่ถูก soft delete
 */
const restoreProduct = async (productId) => {
  try {
    await inventoryService.restoreProduct(productId, 'active')
    console.log('✅ กู้คืนสินค้าสำเร็จ')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 6. ค้นหาสินค้าด้วย Barcode

```javascript
/**
 * ค้นหาจาก barcode, SKU, product_code หรือ lot_code
 */
const searchProduct = async (barcode) => {
  try {
    const result = await inventoryService.searchProductByBarcode(barcode)
    
    if (result.found_in === 'product') {
      console.log('🔍 พบสินค้า:', result.product.product_name)
    } else if (result.found_in === 'lot') {
      console.log('🔍 พบ Lot:', result.lot.lot_code)
      console.log('   สินค้า:', result.product.product_name)
    } else {
      console.log('❌ ไม่พบข้อมูล')
    }
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

---

## Stock Location Management

### 1. ดึงคลังทั้งหมด

```javascript
/**
 * ดึงรายการคลังสินค้าทั้งหมด
 */
const getAllLocations = async () => {
  try {
    const locations = await inventoryService.getAllStockLocations()
    
    locations.forEach(loc => {
      console.log({
        code: loc.code,
        name: loc.name,
        type: loc.type, // 'warehouse' | 'scrap' | 'sample' | 'virtual'
        zone: loc.zone,
        status: loc.status,
        capacity: loc.capacity,
        current_usage: loc.current_usage
      })
    })
    
    return locations
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 2. สร้างคลังใหม่

```javascript
const createLocation = async () => {
  try {
    const locationData = {
      code: 'WH-01',
      name: 'คลังหลัก ชั้น 1',
      type: 'warehouse', // warehouse, scrap, sample, virtual
      zone: 'A',
      building: 'Building 1',
      floor: '1',
      capacity: 10000,
      capacity_unit: 'sqm',
      status: 'active',
      
      // Optional
      description: 'คลังเก็บสินค้าหลัก',
      address: '123 ถนนพระราม 4',
      climate_controlled: true,
      security_level: 'high'
    }
    
    const result = await inventoryService.createStockLocation(locationData)
    console.log('✅ สร้างคลังสำเร็จ:', result.code)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 3. สร้างคลัง Scrap/Sample

```javascript
/**
 * สร้างคลังสำหรับเก็บของเสีย (Scrap)
 */
const createScrapLocation = async () => {
  const scrapData = {
    code: 'SCRAP-01',
    name: 'คลังของเสีย',
    type: 'scrap', // ✅ สำคัญ: ต้องเป็น 'scrap'
    zone: 'Z',
    status: 'active',
    description: 'เก็บสินค้าที่เสียหาย ไม่นับสต็อก'
  }
  
  return await inventoryService.createStockLocation(scrapData)
}

/**
 * สร้างคลังสำหรับเก็บตัวอย่าง (Sample)
 */
const createSampleLocation = async () => {
  const sampleData = {
    code: 'SAMPLE-01',
    name: 'คลังตัวอย่าง',
    type: 'sample', // ✅ สำคัญ: ต้องเป็น 'sample'
    zone: 'S',
    status: 'active',
    description: 'เก็บตัวอย่างสินค้า ไม่นับสต็อกขาย'
  }
  
  return await inventoryService.createStockLocation(sampleData)
}
```

---

## Lot Tracking System

### 1. สร้าง Lot ใหม่

```javascript
/**
 * สร้าง Lot Tracking Record
 */
const createLot = async (productId) => {
  try {
    const lotData = {
      product_id: productId,
      sku: 'SKU-2024-001',
      product_name: 'ผ้าฝ้าย สีกรม 152cm',
      
      // Lot Code
      lot_code: '08883',
      full_lot_code: '402177152-08883', // จะ auto-generate ถ้าไม่ระบุ
      
      // Textile Info
      model_code: '402',
      color_code: '177',
      fabric_width_cm: 152,
      
      // Quantity
      original_meters: 100,
      remaining_meters: 100,
      weight_kg: 30,
      weight_per_meter: 0.3,
      
      // Location
      location_code: 'WH-01',
      rack_position: 'A-001',
      
      // Supplier
      supplier_name: 'บริษัท ABC',
      supplier_id: 'SUPPLIER-001',
      
      // Purchase Info
      purchase_order_id: 'PO-2024-001',
      unit_cost: 80,
      unit_price: 120,
      
      // Dates
      received_date: '2024-11-24',
      manufactured_date: '2024-11-20',
      
      // Quality
      quality_grade: 'A',
      roll_condition: 'full',
      
      // Status
      status: 'available',
      
      // Optional
      notes: 'คุณภาพดีเยี่ยม'
    }
    
    const result = await inventoryService.addLotTracking(lotData)
    console.log('✅ สร้าง Lot สำเร็จ:', result.lot_code)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 2. ดึงข้อมูล Lot ทั้งหมดของสินค้า

```javascript
/**
 * ดึง Lots พร้อมข้อมูลการจอง และ scrap/sample breakdown
 */
const getProductLots = async (productId) => {
  try {
    const lots = await inventoryService.getLotTracking(productId)
    
    lots.forEach(lot => {
      console.log({
        lot_code: lot.lot_code,
        full_lot_code: lot.full_lot_code,
        
        // Stock Info
        remaining_meters: lot.remaining_meters,
        reserved_meters: lot.reserved_meters,
        available_meters: lot.remaining_meters - lot.reserved_meters,
        
        // Reservation Breakdown
        temporary_reserved_meters: lot.temporary_reserved_meters, // unpaid + deposit
        permanent_reserved_meters: lot.permanent_reserved_meters, // paid
        
        // Scrap/Sample/Defective Breakdown
        scrap_meters: lot.scrap_meters,        // ของเสีย
        sample_meters: lot.sample_meters,      // ตัวอย่าง
        defective_meters: lot.defective_meters, // ชำรุด
        
        // Location
        location_code: lot.location_code,
        rack_position: lot.rack_position,
        
        // Supplier
        supplier_name: lot.supplier_name,
        
        // Dates
        received_date: lot.received_date,
        
        // Status
        status: lot.status,
        roll_condition: lot.roll_condition
      })
    })
    
    return lots
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 3. แก้ไข Lot

```javascript
const updateLot = async (lotId) => {
  try {
    const updates = {
      remaining_meters: 80,
      location_code: 'WH-02',
      rack_position: 'B-005',
      roll_condition: 'partial',
      notes: 'ย้ายตำแหน่งแล้ว'
    }
    
    const result = await inventoryService.updateLotTracking(lotId, updates)
    console.log('✅ อัปเดต Lot สำเร็จ')
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 4. ลบ Lot

```javascript
/**
 * Soft Delete Lot (แนะนำ)
 */
const deleteLot = async (lotId) => {
  try {
    await inventoryService.deleteLotTracking(lotId, false)
    console.log('✅ ลบ Lot สำเร็จ (soft delete)')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

/**
 * Permanent Delete Lot (ระวัง!)
 */
const permanentDeleteLot = async (lotId) => {
  try {
    await inventoryService.deleteLotTracking(lotId, true)
    console.log('✅ ลบ Lot ถาวรสำเร็จ')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

---

## Stock Movement

### 1. รับเข้าสินค้าพร้อมสร้าง Lot

```javascript
/**
 * รับเข้าสินค้า + สร้าง Lot + Stock Movement + Update Balance
 * ใช้สำหรับ: Goods Receipt, Purchase Order Receipt
 */
const receiveGoods = async () => {
  try {
    const receiptData = {
      // Product Info
      product_id: 'product_xxx',
      sku: 'SKU-2024-001',
      product_name: 'ผ้าฝ้าย สีกรม 152cm',
      
      // Lot Info
      lot_code: '08884',
      quantity: 100, // เมตร
      weight_kg: 30,
      unit: 'เมตร',
      unit_price: 80,
      
      // Location
      location_code: 'WH-01',
      rack_position: 'A-002',
      
      // Supplier
      supplier_name: 'บริษัท XYZ',
      purchase_order_id: 'PO-2024-002',
      
      // Receipt Info
      received_date: '2024-11-24',
      received_by: 'admin',
      notes: 'รับเข้าปกติ'
    }
    
    const result = await inventoryService.receiveGoodsWithLotTracking(receiptData)
    
    console.log('✅ รับเข้าสินค้าสำเร็จ:')
    console.log('   Lot ID:', result.lot_tracking._id)
    console.log('   Movement ID:', result.stock_movement._id)
    console.log('   Balance Updated:', result.inventory_balance ? 'Yes' : 'No')
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 2. ตัดสต็อค (Cut/Issue Stock)

```javascript
/**
 * ตัดสต็อคจาก Lot สำหรับการขาย
 */
const cutStock = async () => {
  try {
    const cutData = {
      lot_id: 'lot_xxx',
      reservation_id: 'reservation_xxx', // optional
      cut_meters: 10.5,
      notes: 'ตัดขายให้ลูกค้า A'
    }
    
    const result = await inventoryService.cutLotStock(cutData)
    
    console.log('✅ ตัดสต็อคสำเร็จ:')
    console.log('   Lot remaining:', result.lot_updated.remaining_meters)
    console.log('   Movement created:', result.movement_created._id)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 3. รับสินค้าคืน (Return Stock)

```javascript
/**
 * รับคืนสินค้า - 3 ประเภท
 * 1. refund - คืนเงิน (นับสต็อกกลับเข้า)
 * 2. exchange - เปลี่ยนสินค้า (นับสต็อกกลับเข้า)
 * 3. defective - ของชำรุด (ไม่นับสต็อก)
 */

// ✅ ตัวอย่าง 1: รับคืนสินค้าปกติ (เข้าคลังหลัก)
const returnToWarehouse = async () => {
  try {
    const returnData = {
      lot_id: 'lot_xxx',
      movement_id: 'movement_xxx', // reference ไปยัง movement ที่ขายไป
      
      return_meters: 5,
      return_type: 'refund', // refund | exchange | defective
      reason: 'ลูกค้าไม่ต้องการ',
      customer_name: 'บริษัท ABC',
      
      // ✅ Location ที่รับคืนเข้า
      return_location_code: 'WH-01',
      location_type: 'warehouse',
      count_in_stock: true, // ✅ นับสต็อก
      
      notes: 'สภาพดี นับกลับเข้าสต็อก'
    }
    
    const result = await inventoryService.returnLotStock(returnData)
    console.log('✅ รับคืนเข้าคลังสำเร็จ')
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// ✅ ตัวอย่าง 2: รับคืนเข้าคลังของเสีย (Scrap)
const returnToScrap = async () => {
  try {
    const returnData = {
      lot_id: 'lot_xxx',
      return_meters: 5,
      return_type: 'defective',
      reason: 'สินค้าเสียหาย',
      
      // ✅ เข้า Scrap Location
      return_location_code: 'SCRAP-01',
      location_type: 'scrap',
      is_scrap_return: true,    // ✅ Flag ของเสีย
      count_in_stock: false,     // ✅ ไม่นับสต็อก (สำคัญ!)
      
      notes: 'ผ้าขาด ไม่สามารถขายได้'
    }
    
    const result = await inventoryService.returnLotStock(returnData)
    
    console.log('✅ บันทึกของเสียสำเร็จ:')
    console.log('   Location:', result.movement_created.location_code)
    console.log('   Scrap qty updated:', result.balance_updated.scrap_qty)
    console.log('   Stock NOT counted back:', !result.movement_created.count_in_stock)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// ✅ ตัวอย่าง 3: รับคืนเข้าคลังตัวอย่าง (Sample)
const returnToSample = async () => {
  try {
    const returnData = {
      lot_id: 'lot_xxx',
      return_meters: 2,
      return_type: 'refund',
      reason: 'เก็บไว้เป็นตัวอย่าง',
      
      // ✅ เข้า Sample Location
      return_location_code: 'SAMPLE-01',
      location_type: 'sample',
      is_sample: true,           // ✅ Flag ตัวอย่าง
      count_in_stock: false,     // ✅ ไม่นับสต็อกขาย
      
      notes: 'เก็บไว้โชว์ลูกค้า'
    }
    
    const result = await inventoryService.returnLotStock(returnData)
    console.log('✅ บันทึกตัวอย่างสำเร็จ')
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

---

## Stock Reservation

### 1. จองสต็อค (Manual Reservation)

```javascript
/**
 * จองสต็อคจาก Lot
 * ใช้สำหรับ: Quotation, Sales Order, Manual Hold
 */
const reserveStock = async () => {
  try {
    const reservationData = {
      // Lot Info
      lot_id: 'lot_xxx',
      product_id: 'product_xxx',
      product_code: 'SKU-2024-001',
      product_name: 'ผ้าฝ้าย สีกรม 152cm',
      lot_code: '08883',
      
      // Reservation Amount
      reservation_type: 'meters', // meters | weight | rolls
      reserved_meters: 10.5,
      reserved_weight_kg: 3.15,
      
      // Status
      payment_status: 'unpaid', // unpaid | deposit | paid
      status: 'not_paid',
      
      // Customer
      customer_name: 'บริษัท XYZ',
      customer_id: 'customer_xxx',
      
      // Reference Document
      reference_type: 'quotation', // quotation | invoice | sales_order | manual
      reference_id: 'quotation_xxx',
      reference_number: 'QT-2024-001',
      
      // Location
      location: 'WH-01',
      
      // Dates (auto-set if not provided)
      // reserved_date: auto = now
      // expiry_date: auto = +7 days (for unpaid only)
      
      notes: 'จองให้ลูกค้า XYZ',
      reserved_by: 'admin'
    }
    
    const result = await inventoryService.reserveLotStock(reservationData)
    
    console.log('✅ จองสต็อคสำเร็จ:')
    console.log('   Reservation ID:', result.reservation._id)
    console.log('   Lot reserved meters:', result.lot_updated.reserved_meters)
    console.log('   Expires at:', result.reservation.expiry_date)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 2. ยกเลิกการจอง

```javascript
/**
 * ยกเลิกการจอง (คืน qty กลับ lot)
 */
const cancelReservation = async (reservationId) => {
  try {
    const result = await inventoryService.cancelLotReservation(reservationId)
    
    console.log('✅ ยกเลิกการจองสำเร็จ:')
    console.log('   Reservation status:', result.reservation.status)
    console.log('   Lot reserved meters:', result.lot_updated.reserved_meters)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 3. ยืนยันการชำระเงิน (Unpaid → Paid)

```javascript
/**
 * อัปเดตสถานะจอง เมื่อลูกค้าชำระเงินแล้ว
 * ใช้เมื่อ: Quotation → Invoice (Paid)
 */
const confirmPayment = async (quotationId, invoiceId) => {
  try {
    const result = await inventoryService.confirmReservationPayment(quotationId, invoiceId)
    
    console.log('✅ ยืนยันการชำระเงินสำเร็จ:')
    console.log(`   Updated ${result.updated_count} reservations`)
    console.log('   Status: unpaid → paid')
    console.log('   Expiry date: removed (permanent reservation)')
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 4. ดูรายการจองทั้งหมดของ Lot

```javascript
/**
 * ดึงรายการจองของ Lot
 */
const getLotReservations = async (lotId) => {
  try {
    const reservations = await inventoryService.getLotReservations(lotId)
    
    reservations.forEach(res => {
      console.log({
        id: res._id,
        reserved_meters: res.reserved_meters,
        payment_status: res.payment_status,
        status: res.status,
        customer_name: res.customer_name,
        reference_number: res.reference_number,
        expiry_date: res.expiry_date,
        created_at: res.created_at
      })
    })
    
    return reservations
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 5. ยกเลิกการจองที่หมดอายุอัตโนมัติ

```javascript
/**
 * ยกเลิกการจองที่ status = 'not_paid' และหมดอายุเกิน 7 วัน
 * ควรรันเป็น Cron Job ทุกวัน
 */
const cancelExpiredReservations = async () => {
  try {
    const result = await inventoryService.cancelExpiredReservations()
    
    console.log('✅ ยกเลิกการจองหมดอายุ:')
    console.log(`   Cancelled ${result.cancelled_count} reservations`)
    console.log(`   Lots updated: ${result.lots_updated_count}`)
    console.log(`   Balances updated: ${result.balances_updated_count}`)
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

---

## Inventory Balance

### 1. ดึง Balance ของสินค้า

```javascript
/**
 * ดึง Inventory Balance
 */
const getBalance = async (productId) => {
  try {
    const balance = await inventoryService.getInventoryBalance(productId)
    
    console.log({
      product_id: balance.product_id,
      product_code: balance.product_code,
      
      // Stock Quantities
      qty_on_hand: balance.qty_on_hand,       // สต็อกรวมทั้งหมด
      qty_available: balance.qty_available,   // พร้อมใช้ = on_hand - reserved
      qty_reserved: balance.qty_reserved,     // จองไว้
      
      // Scrap/Sample/Defective
      scrap_qty: balance.scrap_qty,           // ของเสีย
      sample_qty: balance.sample_qty,         // ตัวอย่าง
      defective_qty: balance.defective_qty,   // ชำรุด
      
      // Lot Details
      lot_details: balance.lot_details,
      
      // Costs
      avg_unit_cost: balance.avg_unit_cost,
      total_value: balance.total_value,
      
      // Movements Summary
      total_movements_in: balance.total_movements_in,
      total_movements_out: balance.total_movements_out,
      
      // Last Update
      last_movement_date: balance.last_movement_date,
      last_calculated: balance.last_calculated
    })
    
    return balance
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

### 2. อัปเดต Balance

```javascript
/**
 * อัปเดต Balance (ปกติจะ auto-update จาก movements)
 * ใช้เฉพาะกรณีพิเศษ เช่น Stock Adjustment
 */
const updateBalance = async (productId) => {
  try {
    const balanceData = {
      product_id: productId,
      sku: 'SKU-2024-001',
      product_name: 'ผ้าฝ้าย สีกรม 152cm',
      unit: 'เมตร',
      
      quantity_change: 10, // เพิ่ม/ลด จำนวน
      unit_cost: 80,
      
      lot_details: {
        lot_id: 'lot_xxx',
        lot_code: '08883',
        qty_on_hand: 100,
        qty_available: 90,
        qty_reserved: 10
      },
      
      updated_by: 'admin'
    }
    
    const result = await inventoryService.updateProductBalance(balanceData)
    console.log('✅ อัปเดต Balance สำเร็จ')
    
    return result
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

---

## Error Handling

### Best Practices

```javascript
/**
 * แนะนำให้ใช้ try-catch และ validate input
 */
const safeOperation = async () => {
  // 1. Check service ready
  if (!inventoryService.isReady()) {
    throw new Error('InventoryService not initialized')
  }
  
  // 2. Validate input
  if (!productId || productId.trim() === '') {
    throw new Error('Product ID is required')
  }
  
  // 3. Perform operation with error handling
  try {
    const result = await inventoryService.getProduct(productId)
    
    if (!result) {
      console.warn('⚠️ Product not found')
      return null
    }
    
    console.log('✅ Success')
    return result
    
  } catch (error) {
    // 4. Handle specific errors
    if (error.message.includes('not found')) {
      console.error('❌ ไม่พบข้อมูลสินค้า')
      // Show user-friendly message
    } else if (error.message.includes('network')) {
      console.error('❌ ปัญหาการเชื่อมต่อ')
      // Retry logic
    } else {
      console.error('❌ Error:', error.message)
      // Log to error tracking service
    }
    
    throw error // Re-throw for upstream handling
  }
}
```

### Common Error Messages

| Error | สาเหตุ | วิธีแก้ |
|-------|--------|---------|
| `InventoryService not initialized` | ยังไม่ได้ initialize service | เรียก `initialize()` ก่อน |
| `Client key is required` | ไม่มี clientKey | ตรวจสอบ `window.ERP_CORE.clientKey` |
| `Product not found` | ไม่มีสินค้าใน DB | ตรวจสอบ product_id |
| `Lot not found` | ไม่มี lot ใน DB | ตรวจสอบ lot_id |
| `Insufficient stock` | สต็อกไม่พอ | ตรวจสอบ remaining_meters |
| `Cannot return more than sold` | คืนเกินที่ขาย | ตรวจสอบ return_meters vs quantity_sold |

---

## 📝 สรุป

### ✅ ฟังก์ชันหลักที่ควรรู้

**Product:**
- `getAllProducts()` - ดึงสินค้าทั้งหมด
- `getProductWithInventoryData(id)` - ดึงข้อมูลครบถ้วน
- `searchProductByBarcode(barcode)` - ค้นหาด้วย barcode

**Lot:**
- `getLotTracking(productId)` - ดึง lots พร้อม reservation + scrap
- `addLotTracking(data)` - สร้าง lot ใหม่
- `updateLotTracking(id, data)` - แก้ไข lot

**Movement:**
- `receiveGoodsWithLotTracking(data)` - รับเข้าสินค้า
- `cutLotStock(data)` - ตัดสต็อค
- `returnLotStock(data)` - รับคืนสินค้า (รองรับ scrap/sample)

**Reservation:**
- `reserveLotStock(data)` - จองสต็อค
- `cancelLotReservation(id)` - ยกเลิกการจอง
- `confirmReservationPayment(quotationId, invoiceId)` - ยืนยันชำระเงิน

**Balance:**
- `getInventoryBalance(productId)` - ดึง balance
- `updateProductBalance(data)` - อัปเดต balance

---

## 🔗 เอกสารเพิ่มเติม

- [LOT_TRACKING_GUIDE.md](./LOT_TRACKING_GUIDE.md) - คู่มือระบบ Lot Tracking
- [STOCK_LOCATION_GUIDE.md](./STOCK_LOCATION_GUIDE.md) - คู่มือคลังสินค้า
- [RESERVATION_GUIDE.md](./RESERVATION_GUIDE.md) - คู่มือระบบจองสต็อค
- [SCRAP_SAMPLE_GUIDE.md](./SCRAP_SAMPLE_GUIDE.md) - คู่มือจัดการของเสีย/ตัวอย่าง

---

**📧 ติดต่อ:** ERP Development Team  
**📅 อัปเดตล่าสุด:** 24 พฤศจิกายน 2025
