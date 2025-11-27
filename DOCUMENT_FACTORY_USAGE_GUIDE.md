# 📚 Document Factory Usage Guide

## สรุประบบ Standard Document Schema + Adapter Pattern

ระบบนี้ทำให้คุณสามารถแปลงข้อมูลจากฐานข้อมูล (ที่มีหลายรูปแบบ) เป็นโครงสร้างมาตรฐานเดียวกัน เพื่อส่งไปยัง Document Preview System

---

## 🏗️ โครงสร้างระบบ

```
src/extensions/modules/erp/core/components/document/
├── schemas/
│   └── StandardDocumentSchema.js    # โครงสร้างข้อมูลมาตรฐาน
├── adapters/
│   ├── PurchaseRequestAdapter.js    # แปลงข้อมูลใบขอซื้อ
│   ├── InvoiceAdapter.js            # แปลงข้อมูลใบแจ้งหนี้
│   └── QuotationAdapter.js          # แปลงข้อมูลใบเสนอราคา
└── DocumentFactory.js                # ตัวกลางจัดการทั้งหมด
```

---

## 📋 Standard Document Schema

โครงสร้างข้อมูลมาตรฐานที่ครอบคลุมทุกประเภทเอกสาร:

```javascript
{
  // เอกสาร
  documentType: 'purchase_request',
  documentNumber: 'PR-2024-001',
  documentDate: '2024-11-24',
  documentStatus: 'approved',
  
  // บริษัท
  company: {
    name: 'บริษัท ABC จำกัด',
    address: '...',
    taxId: '...'
  },
  
  // ผู้ออกเอกสาร
  issuer: {
    name: 'John Doe',
    department: 'IT',
    position: 'Manager'
  },
  
  // คู่ค้า (vendor/customer)
  partner: {
    type: 'vendor',
    name: '...',
    address: '...'
  },
  
  // รายการสินค้า
  items: [
    {
      lineNumber: 1,
      productCode: 'P001',
      productName: 'Laptop',
      quantity: 2,
      unitPrice: 25000,
      total: 50000
    }
  ],
  
  // สรุปการเงิน
  financial: {
    subtotal: 50000,
    vatRate: 7,
    vatAmount: 3500,
    grandTotal: 53500
  },
  
  // อื่นๆ...
}
```

---

## 🚀 วิธีการใช้งาน

### **1. ใน Detail.vue - แปลงข้อมูลก่อนส่งไปแสดง**

```javascript
// ใน Detail.vue
import { createStandardDocument } from '@/core/components/document/DocumentFactory.js'

const previewDocument = async (documentType) => {
  if (!requestData.value) return
  
  try {
    const core = getCore()
    
    // 🎯 แปลงข้อมูลจาก DB เป็น Standard Document
    const standardDocument = createStandardDocument(
      'purchase_request',     // ประเภทเอกสาร
      requestData.value       // ข้อมูลจาก Database
    )
    
    console.log('✅ Standard Document:', standardDocument)
    
    // สร้าง DocumentPreview
    const DocumentPreview = core.components.DocumentPreview
    const { createApp, h } = await import('vue')
    
    const app = createApp({
      render() {
        return h(DocumentPreview, {
          show: true,
          documentType: 'purchase_request',
          documentData: standardDocument,    // ✅ ส่งข้อมูลมาตรฐาน
          title: 'ใบขอซื้อ'
        })
      }
    })
    
    // Mount component
    const container = document.createElement('div')
    document.body.appendChild(container)
    app.mount(container)
    
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### **2. การใช้งานแบบง่าย (Auto-detect)**

```javascript
import { createDocumentSmart } from '@/core/components/document/DocumentFactory.js'

// ระบบจะตรวจหาประเภทเอกสารอัตโนมัติ
const standardDocument = createDocumentSmart(requestData.value)
```

### **3. Batch Processing (หลายเอกสาร)**

```javascript
import { createStandardDocuments } from '@/core/components/document/DocumentFactory.js'

const documents = [
  { type: 'purchase_request', data: pr1Data },
  { type: 'invoice', data: inv1Data },
  { type: 'quotation', data: quo1Data }
]

const standardDocuments = createStandardDocuments(documents)
```

---

## 🔄 Flow การทำงาน

```
1. Database (MongoDB/PostgreSQL)
   ↓ Query data
   
2. Detail.vue - loadData()
   ↓ Get raw data
   requestData = {
     purchase_request_code: 'PR-2024-001',
     items: [...],
     ...
   }
   
3. Detail.vue - previewDocument()
   ↓ Transform data
   standardDocument = createStandardDocument('purchase_request', requestData)
   
4. DocumentFactory.js
   ↓ Use PurchaseRequestAdapter
   adaptPurchaseRequest(requestData)
   
5. Standard Document Created ✅
   {
     documentNumber: 'PR-2024-001',
     items: [...],
     financial: { grandTotal: 53500 },
     ...
   }
   
6. DocumentPreview.vue
   ↓ Receive standard data
   props.documentData = standardDocument
   
7. PurchaseRequestDocument.vue
   ↓ Use props.data
   const document = props.data  // ✅ Standard format!
```

---

## 💡 ข้อดีของระบบนี้

### **1. ความสอดคล้อง (Consistency)**
- ทุกเอกสารใช้โครงสร้างเดียวกัน
- Component ไม่ต้องรู้จักรูปแบบ DB แต่ละประเภท

### **2. ง่ายต่อการบำรุงรักษา (Maintainability)**
- แก้ไข adapter ที่เดียว กระทบทั้งระบบ
- เพิ่มเอกสารใหม่ได้ง่าย

### **3. การแยกความรับผิดชอบ (Separation of Concerns)**
- Business Logic → Adapters
- UI Logic → Components
- Data Structure → Schema

### **4. Testability**
- Test adapter แยกอิสระ
- Mock data ได้ง่าย

### **5. Flexibility**
- รองรับ DB หลายรูปแบบ
- เพิ่ม field ใหม่ได้โดยไม่กระทบ Component

---

## 🎯 ตัวอย่างการใช้งานเต็มรูปแบบ

### **ใน Detail.vue:**

```javascript
<script setup>
import { createStandardDocument } from '@/core/components/document/DocumentFactory.js'

const loadData = async () => {
  // โหลดข้อมูลจาก API
  const result = await window.ERP_CORE.purchase.getPurchaseRequest(requestId.value)
  
  if (result) {
    requestData.value = {
      purchase_request_code: result.purchase_request_code,
      request_date: result.request_date,
      requester: result.requested_by,
      department: result.department,
      items: result.items,
      total_amount: result.total_amount,
      // ... ข้อมูลอื่นๆ จาก DB
    }
  }
}

const previewDocument = async (documentType) => {
  if (!requestData.value) return
  
  const core = getCore()
  
  // ✅ แปลงข้อมูลเป็นมาตรฐาน
  const standardDocument = createStandardDocument(
    'purchase_request',
    requestData.value,
    {
      validate: true  // ตรวจสอบความถูกต้อง
    }
  )
  
  // แสดง DocumentPreview พร้อมข้อมูลมาตรฐาน
  const DocumentPreview = core.components.DocumentPreview
  const { createApp, h } = await import('vue')
  
  const app = createApp({
    render() {
      return h(DocumentPreview, {
        show: true,
        documentType: 'purchase_request',
        documentData: standardDocument,  // ✅ ข้อมูลมาตรฐาน
        title: 'ใบขอซื้อ'
      })
    }
  })
  
  const container = document.createElement('div')
  document.body.appendChild(container)
  app.mount(container)
}
</script>
```

### **ใน PurchaseRequestDocument.vue:**

```javascript
<script>
export default {
  props: {
    data: {
      type: Object,
      required: true  // ✅ รับข้อมูลมาตรฐาน
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    // ✅ ใช้ props.data โดยตรง (มาตรฐานแล้ว!)
    const document = computed(() => props.data || {})
    
    const documentNumber = computed(() => document.value.documentNumber)
    const items = computed(() => document.value.items || [])
    const grandTotal = computed(() => document.value.financial?.grandTotal || 0)
    
    return {
      document,
      documentNumber,
      items,
      grandTotal
    }
  }
}
</script>

<template>
  <div class="purchase-request-document">
    <h1>{{ document.documentNumber }}</h1>
    <p>ผู้ขอซื้อ: {{ document.issuer.name }}</p>
    <p>แผนก: {{ document.issuer.department }}</p>
    
    <table>
      <tr v-for="item in items" :key="item.lineNumber">
        <td>{{ item.productCode }}</td>
        <td>{{ item.productName }}</td>
        <td>{{ item.quantity }}</td>
        <td>{{ item.total }}</td>
      </tr>
    </table>
    
    <p>รวมทั้งสิ้น: {{ grandTotal }}</p>
  </div>
</template>
```

---

## 🛠️ การเพิ่ม Adapter ใหม่

```javascript
// ใน adapters/SalesOrderAdapter.js
import { createEmptyDocument, calculateFinancials } from '../schemas/StandardDocumentSchema.js'

export function adaptSalesOrder(salesOrderData) {
  const document = createEmptyDocument('sales_order')
  
  // Map ข้อมูล
  document.documentNumber = salesOrderData.so_number
  document.documentDate = salesOrderData.so_date
  document.partner.name = salesOrderData.customer_name
  // ...
  
  return document
}

// ใน DocumentFactory.js
import { adaptSalesOrder } from './adapters/SalesOrderAdapter.js'

const AdapterRegistry = {
  // ...existing adapters
  'sales_order': adaptSalesOrder,  // ✅ เพิ่ม adapter ใหม่
}
```

---

## 🎨 Best Practices

1. **ใช้ Factory เสมอ** - อย่าเรียก adapter โดยตรง
2. **Validate ข้อมูล** - ใช้ `validateDocument()` ก่อนส่งไป UI
3. **Handle Errors** - ตรวจสอบ null/undefined
4. **Log ทุกขั้นตอน** - ง่ายต่อ debug
5. **Test Adapters** - เขียน unit test สำหรับแต่ละ adapter

---

## 📊 สรุป

ระบบนี้ช่วยให้:
- ✅ แปลงข้อมูลจาก DB หลายรูปแบบเป็นมาตรฐานเดียว
- ✅ Components ใช้ข้อมูลรูปแบบเดียวกันทั้งหมด
- ✅ เพิ่ม/แก้ไขเอกสารใหม่ได้ง่าย
- ✅ แยก business logic ออกจาก UI
- ✅ ทดสอบและบำรุงรักษาง่ายขึ้น

**Happy Coding! 🚀**
