/**
 * Test Quotation Adapter - ทดสอบการแปลงข้อมูล Quotation
 */

import { adaptQuotation } from './src/extensions/modules/erp/core/components/document/adapters/QuotationAdapter.js'

// ข้อมูล Quotation จริงจาก Database (แปลงจาก Purchase Request)
const quotationFromDB = {
    "_id": "6911424b6c4520126a8b4828",
    "quote_number": "SQX20250003",
    "quotation_date": "2025-11-10",
    "expiry_date": "2025-12-10",
    "customer_id": "69111392d04c13d4086ccb9c",
    "customer_name": "บริษัท ABC จำกัด",
    "customer_address": "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    "customer_phone": "02-123-4567",
    "customer_email": "contact@abc.com",
    "customer_tax_id": "0123456789012",
    "status": "draft",
    "items": [
        {
            "product_id": "690efbfdf5cbf1a8243324c1",
            "sku": "QWDQWDQW",
            "product_code": "PROD-001",
            "product_name": "คอมพิวเตอร์ออลอินวัน 27 นิ้ว",
            "description": "คอมพิวเตอร์ออลอินวัน 27 นิ้ว (Intel Core i7, RAM 16GB, SSD 512GB)",
            "specification": "- CPU: Intel Core i7-12700\n- RAM: 16GB DDR4\n- Storage: 512GB NVMe SSD\n- Display: 27\" 4K IPS\n- Warranty: 3 Years",
            "quantity": 10,
            "unit": "เครื่อง",
            "unit_price": 35000,
            "discount": 0,
            "discount_type": "percent",
            "total": 350000,
            "warranty": "3 ปี",
            "is_full_roll": false
        },
        {
            "product_id": "690efbfdf5cbf1a8243324c2",
            "sku": "KEY-MOUSE-001",
            "product_code": "ACC-002",
            "product_name": "ชุดคีย์บอร์ดและเมาส์ไwireless",
            "description": "ชุดคีย์บอร์ดและเมาส์ไร้สาย (Logitech MK850)",
            "specification": "- แบรนด์: Logitech\n- รุ่น: MK850\n- การเชื่อมต่อ: Wireless 2.4GHz + Bluetooth\n- แบตเตอรี่: AAA x 4",
            "quantity": 10,
            "unit": "ชุด",
            "unit_price": 2500,
            "discount": 10,
            "discount_type": "percent",
            "total": 22500,
            "warranty": "1 ปี"
        },
        {
            "product_id": "690efbfdf5cbf1a8243324c3",
            "sku": "MONITOR-001",
            "product_code": "MON-003",
            "product_name": "จอมอนิเตอร์ 24 นิ้ว Full HD",
            "description": "จอมอนิเตอร์ 24 นิ้ว Full HD IPS (Dell P2422H)",
            "specification": "- ขนาด: 24 นิ้ว\n- ความละเอียด: 1920x1080 Full HD\n- Panel: IPS\n- Refresh Rate: 60Hz\n- พอร์ต: HDMI, DisplayPort, VGA",
            "quantity": 5,
            "unit": "เครื่อง",
            "unit_price": 6500,
            "discount": 500,
            "discount_type": "amount",
            "total": 30000,
            "warranty": "3 ปี"
        }
    ],
    "notes": "1. ราคารวม VAT 7% แล้ว\n2. ฟรีค่าติดตั้งและอบรมการใช้งาน\n3. รับประกันสินค้าตามเงื่อนไขของผู้ผลิต\n4. การส่งมอบภายใน 7-14 วันทำการหลังยืนยันคำสั่งซื้อ",
    "remarks": "ขอบคุณสำหรับความสนใจ หากมีข้อสงสัยกรุณาติดต่อกลับ",
    "subtotal": 402500,
    "vat_rate": 7,
    "vat_amount": 28175,
    "total_amount": 430675,
    "payment_terms": "50% มัดจำ 50% ก่อนส่งมอบ",
    "delivery_terms": "ส่งฟรีในเขต กทม. และปริมณฑล",
    "delivery_days": "7-14 วันทำการ",
    "warranty_terms": "รับประกันตามมาตรฐานของผู้ผลิต",
    "installation_service": true,
    "sales_person": "คุณสมชาย ใจดี",
    "company_name": "บริษัท XYZ Technology จำกัด",
    "company_address": "456 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310",
    "company_tax_id": "0987654321098",
    "company_phone": "02-987-6543",
    "company_email": "sales@xyztech.com",
    "type": "sales",
    "subtype": "quotation",
    "documentType": "quotation",
    "createdAt": "2025-11-10T01:39:23.931Z",
    "created_at": "2025-11-10T01:39:23.931Z",
    "created_by": "sales_user",
    "updatedAt": "2025-11-10T01:40:10.156Z",
    "updated_at": "2025-11-10T01:40:09.950Z"
}

console.log('📋 ทดสอบการแปลงข้อมูล Quotation')
console.log('='.repeat(80))

// แปลงข้อมูล
const standardDocument = adaptQuotation(quotationFromDB)

console.log('\n✅ ผลลัพธ์การแปลง:\n')
console.log(JSON.stringify(standardDocument, null, 2))

console.log('\n' + '='.repeat(80))
console.log('📊 สรุปข้อมูลสำคัญ:')
console.log('='.repeat(80))
console.log(`🔢 Document Number: ${standardDocument.documentNumber}`)
console.log(`📅 Document Date: ${standardDocument.documentDate}`)
console.log(`📊 Status: ${standardDocument.documentStatus}`)
console.log(`🏢 Company: ${standardDocument.company.name}`)
console.log(`👤 Sales Person: ${standardDocument.issuer.name}`)
console.log(`🏪 Customer: ${standardDocument.partner.name}`)
console.log(`📦 Items: ${standardDocument.items.length} รายการ`)
console.log(`💰 Subtotal: ${standardDocument.financial.subtotal.toLocaleString()} บาท`)
console.log(`📈 VAT (${standardDocument.financial.vatRate}%): ${standardDocument.financial.vatAmount.toLocaleString()} บาท`)
console.log(`💵 Grand Total: ${standardDocument.financial.grandTotal.toLocaleString()} บาท`)
console.log(`📑 Pagination: ${standardDocument.metadata.pagination.totalPages} หน้า (${standardDocument.metadata.pagination.itemsPerPage} รายการ/หน้า)`)
console.log(`💳 Payment Terms: ${standardDocument.payment.terms}`)
console.log(`🚚 Delivery Terms: ${standardDocument.additional.remarks}`)

console.log('\n📦 รายการสินค้า:')
standardDocument.items.forEach((item, index) => {
  const discountText = item.discount > 0 ? ` (ส่วนลด ${item.discount}%)` : ''
  console.log(`  ${index + 1}. ${item.productCode} - ${item.productName}${discountText}`)
  console.log(`     จำนวน: ${item.quantity} ${item.unit} × ${item.unitPrice.toLocaleString()} = ${item.total.toLocaleString()} บาท`)
  console.log(`     รายละเอียด: ${item.description}`)
})

console.log('\n📝 เงื่อนไข:')
console.log(`  - การชำระเงิน: ${standardDocument.payment.terms}`)
console.log(`  - การส่งมอบ: ${standardDocument.delivery.method || 'ไม่ระบุ'}`)
console.log(`  - วันที่คาดว่าส่งมอบ: ${standardDocument.delivery.expectedDate || 'ไม่ระบุ'}`)

console.log('\n' + '='.repeat(80))
console.log('✅ ทดสอบเสร็จสิ้น!')
console.log('\n💡 วิธีใช้ใน Browser Console:')
console.log('  const standardDoc = createStandardDocument("quotation", quotationData)')
console.log('  console.log(standardDoc)')

