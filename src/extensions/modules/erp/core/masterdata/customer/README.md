# Customer Master Data Module

โมดูลจัดการข้อมูลลูกค้าสำหรับระบบ ERP

## การใช้งาน

### 1. การสร้างลูกค้าใหม่

```javascript
import { ERP_CORE } from '../core/index.js'

// สร้างลูกค้าบุคคลธรรมดา
const individualCustomer = {
  customer_name: 'คุณสมชาย ใจดี',
  customer_type: 'individual',
  phone: '081-234-5678',
  email: 'somchai@example.com',
  address: '123 ถนนสุขุมวิท',
  district: 'คลองตัน',
  province: 'กรุงเทพมหานคร',
  postal_code: '10110'
}

const result = await ERP_CORE.engine.create('customer', individualCustomer, 'user_id')

// สร้างลูกค้าบริษัท
const companyCustomer = {
  customer_name: 'บริษัท ABC จำกัด',
  customer_type: 'company',
  contact_person: 'คุณสมหญิง จริงใจ',
  phone: '02-123-4567',
  email: 'contact@abc.co.th',
  tax_id: '1234567890123',
  vat_registration: true,
  credit_limit: 500000,
  payment_terms: 'net_30'
}

const companyResult = await ERP_CORE.engine.create('customer', companyCustomer, 'user_id')
```

### 2. การค้นหาและจัดการลูกค้า

```javascript
// ค้นหาลูกค้าทั้งหมด
const allCustomers = await ERP_CORE.engine.list('customer')

// ค้นหาลูกค้าตาม ID
const customer = await ERP_CORE.engine.read('customer', 'customer_id')

// อัปเดตข้อมูลลูกค้า
const updates = {
  credit_limit: 1000000,
  status: 'vip'
}
await ERP_CORE.engine.update('customer', 'customer_id', updates, 'user_id')

// เปลี่ยนสถานะลูกค้า
await ERP_CORE.engine.changeState('customer', 'customer_id', 'suspended', 'user_id')
```

### 3. การใช้ Customer Functions

```javascript
import { CustomerFunctions } from './index.js'

// สร้างรหัสลูกค้า
const customerCode = CustomerFunctions.generateCustomerCode({ sequence: 1 })
// ผลลัพธ์: CUS20241008001

// ตรวจสอบข้อมูลลูกค้า
const validation = CustomerFunctions.validateCustomerData(customerData)
if (!validation.isValid) {
  console.log('Errors:', validation.errors)
}

// ใช้ template ลูกค้า
const customerTemplate = CustomerFunctions.applyCustomerTemplate('company', {
  customer_name: 'บริษัท XYZ จำกัด'
})

// คำนวณวงเงินเครดิต
const creditLimit = CustomerFunctions.calculateCreditLimit('wholesale', 10000000)

// ตรวจสอบลูกค้าซ้ำ
const duplicateCheck = CustomerFunctions.checkDuplicateCustomer(newCustomer, existingCustomers)
```

## โครงสร้างข้อมูล

### ข้อมูลพื้นฐาน
- `customer_code`: รหัสลูกค้า (Auto-generated)
- `customer_name`: ชื่อลูกค้า/บริษัท
- `customer_type`: ประเภทลูกค้า (individual, company, government, ngo)
- `contact_person`: ชื่อผู้ติดต่อหลัก

### ข้อมูลติดต่อ
- `phone`: หมายเลขโทรศัพท์
- `mobile`: หมายเลขมือถือ
- `email`: อีเมล
- `website`: เว็บไซต์

### ที่อยู่
- `address`: ที่อยู่
- `district`: เขต/อำเภอ
- `province`: จังหวัด
- `postal_code`: รหัษไปรษณีย์
- `country`: ประเทศ

### ข้อมูลทางธุรกิจ
- `tax_id`: เลขประจำตัวผู้เสียภาษี
- `branch_code`: รหัสสาขา
- `vat_registration`: จดทะเบียน VAT

### เครดิตและการชำระเงิน
- `credit_limit`: วงเงินเครดิต
- `credit_days`: วันเครดิต
- `payment_terms`: เงื่อนไขการชำระเงิน
- `currency`: สกุลเงิน

### การจัดหมวดหมู่
- `customer_group`: กลุ่มลูกค้า (retail, wholesale, distributor, vip, government, export)
- `sales_channel`: ช่องทางการขาย
- `priority_level`: ระดับความสำคัญ

## กลุ่มลูกค้า

### Retail (ลูกค้าปลีก)
- วงเงินเครดิต: 10,000 บาท
- วันเครดิต: 7 วัน
- การชำระเงิน: เงินสด

### Wholesale (ลูกค้าขายส่ง)
- วงเงินเครดิต: 100,000 บาท
- วันเครดิต: 30 วัน
- ส่วนลด: 5%

### Distributor (ตัวแทนจำหน่าย)
- วงเงินเครดิต: 500,000 บาท
- วันเครดิต: 45 วัน
- ส่วนลด: 10%

### VIP (ลูกค้า VIP)
- วงเงินเครดิต: 1,000,000 บาท
- วันเครดิต: 60 วัน
- ส่วนลด: 15%

### Government (หน่วยงานรัฐ)
- วงเงินเครดิต: 2,000,000 บาท
- วันเครดิต: 90 วัน
- ขั้นตอนพิเศษ: ใช่

### Export (ลูกค้าส่งออก)
- วงเงินเครดิต: 500,000 บาท
- วันเครดิต: 30 วัน
- การชำระเงิน: เงินล่วงหน้า

## สถานะลูกค้า

1. **Active**: ใช้งานปกติ
2. **Inactive**: หยุดใช้งานชั่วคราว
3. **Suspended**: ระงับการใช้งาน (เช่น เกินวงเงินเครดิต)
4. **Blacklisted**: ขึ้นบัญชีดำ (ไม่สามารถขายให้ได้)

## การตรวจสอบข้อมูล

### ข้อมูลที่จำเป็น
- ชื่อลูกค้า
- ประเภทลูกค้า

### รูปแบบข้อมูล
- เลขประจำตัวผู้เสียภาษี: 13 หลัก
- รหัสไปรษณีย์: 5 หลัก
- หมายเลขโทรศัพท์: ตัวเลข, +, -, (, ), ช่องว่าง
- อีเมล: รูปแบบอีเมลที่ถูกต้อง

## การใช้งานร่วมกับโมดูลอื่น

### Sales Module
- เชื่อมโยงกับใบเสนอราคา
- ใช้ในการสร้าง Sales Order
- คำนวณส่วนลดและราคาพิเศษ

### Finance Module
- ติดตาม Account Receivable
- จัดการเครดิตและการชำระเงิน
- สร้างใบแจ้งหนี้และใบเสร็จ

### CRM Module
- ประวัติการติดต่อ
- การติดตามลูกค้า
- การวิเคราะห์พฤติกรรมลูกค้า