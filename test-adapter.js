/**
 * Test Adapter - ทดสอบการแปลงข้อมูล Purchase Request
 */

import { adaptPurchaseRequest } from './src/extensions/modules/erp/core/components/document/adapters/PurchaseRequestAdapter.js'

// ข้อมูลจริงจาก Database
const purchaseRequestFromDB = {
    "_id": "690eea99f5cbf1a8243324be",
    "purchase_request_code": "PRX202500001",
    "description": "qwdqwdqwdqwd",
    "department": "IT",
    "requested_by": "qwdqwd",
    "priority": "normal",
    "purchase_type": "stock_replenishment",
    "category": "raw_materials",
    "expected_delivery_date": "2025-11-08T00:00:00.000Z",
    "justification": "qwdqwdqwd",
    "items": [
        {
            "product_id": "690e599318848ad06add19b2",
            "sku": "WEFWEFWEFWEFWEFWEFWEFWFE",
            "product_name": "wefwefwefwefwefwef",
            "current_stock": 0,
            "min_stock": 5,
            "reorder_point": 5,
            "unit": "ชิ้น",
            "quantity": 1,
            "unit_price": 500,
            "total": 500,
            "specifications": "wefwefwefwefwefwef",
            "is_new_product": false
        }
    ],
    "subtotal": 500,
    "tax_amount": 35,
    "total_amount": 535,
    "delivery_address": "qwdqwdqwd",
    "supplier_suggestion": "qwdqwd",
    "payment_terms": "30_days",
    "budget_code": "qwdqwd",
    "cost_center": "CC001",
    "notes": "รับเข้าสินค้าครบถ้วนแล้ว",
    "inventory_impact": true,
    "auto_update_stock": true,
    "status": "complete",
    "workflow_state": "complete",
    "state": "pending_approval",
    "created_by": "user",
    "updated_by": "warehouse_staff",
    "createdAt": "2025-11-08T07:00:41.345Z",
    "updatedAt": "2025-11-08T15:17:34.086Z",
    "updated_date": "2025-11-08T07:00:44.514Z",
    "updated_at": "2025-11-08T15:17:33.435Z"
}

console.log('📋 ทดสอบการแปลงข้อมูล Purchase Request')
console.log('=' .repeat(80))

// แปลงข้อมูล
const standardDocument = adaptPurchaseRequest(purchaseRequestFromDB)

console.log('\n✅ ผลลัพธ์การแปลง:\n')
console.log(JSON.stringify(standardDocument, null, 2))

console.log('\n' + '='.repeat(80))
console.log('📊 สรุปข้อมูลสำคัญ:')
console.log('='.repeat(80))
console.log(`🔢 Document Number: ${standardDocument.documentNumber}`)
console.log(`📅 Document Date: ${standardDocument.documentDate}`)
console.log(`📊 Status: ${standardDocument.documentStatus}`)
console.log(`👤 Issuer: ${standardDocument.issuer.name} (${standardDocument.issuer.department})`)
console.log(`📦 Items: ${standardDocument.items.length} รายการ`)
console.log(`💰 Subtotal: ${standardDocument.financial.subtotal.toLocaleString()} บาท`)
console.log(`📈 VAT (${standardDocument.financial.vatRate}%): ${standardDocument.financial.vatAmount.toLocaleString()} บาท`)
console.log(`💵 Grand Total: ${standardDocument.financial.grandTotal.toLocaleString()} บาท`)
console.log(`📍 Cost Center: ${standardDocument.additional.costCenter}`)
console.log(`🎯 Priority: ${standardDocument.additional.priority}`)
console.log(`📝 Purchase Type: ${standardDocument.additional.purchaseType}`)
console.log(`📂 Category: ${standardDocument.additional.category}`)

console.log('\n📦 รายการสินค้า:')
standardDocument.items.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.productCode} - ${item.productName}`)
  console.log(`     จำนวน: ${item.quantity} ${item.unit} × ${item.unitPrice.toLocaleString()} = ${item.total.toLocaleString()} บาท`)
  console.log(`     รายละเอียด: ${item.description}`)
})

console.log('\n' + '='.repeat(80))
console.log('✅ ทดสอบเสร็จสิ้น!')
