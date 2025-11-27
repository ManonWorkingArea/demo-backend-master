# Universal Document Component - Design Concept

## 🎯 Concept Overview

**หลักการ:** ทุกเอกสารในระบบ ERP ใช้ Template เดียวกัน เพราะข้อมูลทั้งหมดถูกแปลงเป็น **Standard Document Schema** แล้ว

## 📋 Current State (ก่อนปรับปรุง)

```
❌ แยก Component ตามประเภทเอกสาร
├── PurchaseRequestDocument.vue
├── QuotationDocument.vue
├── InvoiceDocument.vue
├── SalesOrderDocument.vue
└── ... (10+ components)

ปัญหา:
- Code ซ้ำซ้อน
- แก้ไขยาก ต้องแก้หลาย component
- Layout ไม่เหมือนกัน
- Hard to maintain
```

## ✅ New Concept (หลังปรับปรุง)

```
✅ Component เดียว รองรับทุกประเภทเอกสาร
└── UniversalDocument.vue
    ├── รับ Standard Document Schema
    ├── แสดงผลตาม documentType
    └── ปรับเฉพาะรายละเอียดที่แตกต่าง

ข้อดี:
- Code แค่ที่เดียว
- แก้ไขง่าย
- Layout เหมือนกัน 100%
- Easy to maintain
```

## 🏗️ Architecture

### 1. Data Flow
```
Database (Raw Data)
    ↓
Adapter (PurchaseRequestAdapter, QuotationAdapter, InvoiceAdapter)
    ↓
Standard Document Schema
    ↓
UniversalDocument.vue (Single Template)
    ↓
Rendered Document
```

### 2. UniversalDocument.vue Structure
```vue
<template>
  <div class="universal-document a4-document">
    
    <!-- HEADER -->
    <div class="document-head">
      <div class="header-logo">
        <img :src="data.company.logo" />
      </div>
      <div class="header-title">
        {{ getDocumentTitle(data.documentType) }}
      </div>
      <div class="header-info">
        <div>เลขที่: {{ data.documentNumber }}</div>
        <div>วันที่: {{ formatDate(data.documentDate) }}</div>
      </div>
    </div>
    
    <!-- COMPANY & PARTNER INFO -->
    <div class="document-sub-head">
      <div class="company-section">
        <h3>{{ getIssuerLabel(data.documentType) }}</h3>
        <div>{{ data.company.name }}</div>
        <div>{{ data.company.address }}</div>
        <div>เลขประจำตัวผู้เสียภาษี: {{ data.company.taxId }}</div>
      </div>
      
      <div class="partner-section">
        <h3>{{ getPartnerLabel(data.documentType) }}</h3>
        <div>{{ data.partner.name }}</div>
        <div>{{ data.partner.address }}</div>
        <div v-if="data.partner.taxId">เลขประจำตัวผู้เสียภาษี: {{ data.partner.taxId }}</div>
      </div>
    </div>
    
    <!-- ITEMS TABLE -->
    <div class="document-main-content">
      <table class="items-table">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>รหัสสินค้า</th>
            <th>รายการ</th>
            <th>จำนวน</th>
            <th>หน่วย</th>
            <th>ราคา/หน่วย</th>
            <th>จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in displayItems" :key="item.lineNumber">
            <td>{{ item.lineNumber }}</td>
            <td>{{ item.productCode }}</td>
            <td>{{ item.productName }}</td>
            <td>{{ formatNumber(item.quantity) }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ formatCurrency(item.unitPrice) }}</td>
            <td>{{ formatCurrency(item.total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- SUMMARY (Last Page Only) -->
    <div v-if="isLastPage" class="document-footer">
      <div class="summary-section">
        <div>ยอดรวม: {{ formatCurrency(data.financial.subtotal) }}</div>
        <div>ภาษี {{ data.financial.vatRate }}%: {{ formatCurrency(data.financial.vatAmount) }}</div>
        <div class="grand-total">รวมทั้งสิ้น: {{ formatCurrency(data.financial.grandTotal) }}</div>
      </div>
      
      <!-- Signatures (Different per document type) -->
      <div class="signatures-section">
        <div v-for="sig in getSignatures(data.documentType)" :key="sig.label">
          <div class="signature-label">{{ sig.label }}</div>
          <div class="signature-line"></div>
          <div class="signature-date">วันที่: _______________</div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true  // Standard Document Schema
  },
  pageNumber: Number,
  totalPages: Number,
  itemsPerPage: {
    type: Number,
    default: 12
  }
})

const isLastPage = computed(() => props.pageNumber === props.totalPages)

const displayItems = computed(() => {
  const start = (props.pageNumber - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.data.items.slice(start, end)
})

// Dynamic labels based on document type
const getDocumentTitle = (type) => {
  const titles = {
    'purchase_request': 'ใบขอซื้อ (PURCHASE REQUEST)',
    'quotation': 'ใบเสนอราคา (QUOTATION)',
    'invoice': 'ใบแจ้งหนี้/ใบกำกับภาษี (INVOICE)',
    'sales_order': 'ใบสั่งขาย (SALES ORDER)',
    'purchase_order': 'ใบสั่งซื้อ (PURCHASE ORDER)',
    'delivery_note': 'ใบส่งของ (DELIVERY NOTE)',
    'receipt': 'ใบรับสินค้า (GOODS RECEIPT)'
  }
  return titles[type] || type.toUpperCase()
}

const getIssuerLabel = (type) => {
  // Purchase documents: ผู้ขอซื้อ/ผู้ซื้อ
  if (type.includes('purchase') || type.includes('request')) return 'ผู้ขอซื้อ'
  // Sales documents: ผู้ขาย
  if (type.includes('quotation') || type.includes('invoice') || type.includes('sales')) return 'ผู้ขาย'
  return 'ข้อมูลบริษัท'
}

const getPartnerLabel = (type) => {
  // Purchase documents: ผู้ขาย/Vendor
  if (type.includes('purchase') || type.includes('request')) return 'ผู้ขาย (Vendor)'
  // Sales documents: ลูกค้า
  if (type.includes('quotation') || type.includes('invoice') || type.includes('sales')) return 'ลูกค้า (Customer)'
  return 'คู่ค้า'
}

const getSignatures = (type) => {
  const signatures = {
    'purchase_request': [
      { label: 'ผู้ขอซื้อ' },
      { label: 'ผู้อนุมัติ' },
      { label: 'ผู้จัดการ' }
    ],
    'quotation': [
      { label: 'ผู้เสนอราคา' },
      { label: 'ผู้อนุมัติ' }
    ],
    'invoice': [
      { label: 'ผู้ออกเอกสาร' },
      { label: 'ผู้รับเงิน' },
      { label: 'ผู้อนุมัติ' }
    ]
  }
  return signatures[type] || [{ label: 'ผู้รับผิดชอบ' }]
}

// Format helpers
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('th-TH')
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('th-TH').format(num || 0)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}
</script>
```

## 🔄 Migration Plan

### Phase 1: Create UniversalDocument.vue
- [x] Standard Document Schema created
- [x] Adapters created (PurchaseRequest, Quotation, Invoice)
- [x] Document Factory created
- [ ] **Create UniversalDocument.vue**
- [ ] Test with all 3 document types

### Phase 2: Update Document Registry
```javascript
// document/index.js
import UniversalDocument from './UniversalDocument.vue'

export const DocumentComponents = {
  // ✅ Universal component for all documents
  UniversalDocument,
  
  // ⚠️ Legacy components (will be deprecated)
  PurchaseRequestDocument, // Use UniversalDocument instead
  QuotationDocument,       // Use UniversalDocument instead
  InvoiceDocument,         // Use UniversalDocument instead
}

// Helper to get component
export function getDocumentComponent(documentType) {
  // Always return UniversalDocument
  return UniversalDocument
}
```

### Phase 3: Update DocumentPreview.vue
```javascript
// OLD way
const component = documentType === 'purchase_request' 
  ? PurchaseRequestDocument 
  : documentType === 'quotation'
    ? QuotationDocument
    : InvoiceDocument

// NEW way (Universal)
const component = UniversalDocument
const standardData = createStandardDocument(documentType, rawData)
```

### Phase 4: Deprecate Old Components
- Mark old components as deprecated
- Update all usages to UniversalDocument
- Remove old components after testing

## 📊 Benefits Comparison

| Feature | Old (Multiple Components) | New (Universal) |
|---------|--------------------------|-----------------|
| **Components** | 10+ files | 1 file |
| **Code Lines** | ~12,000 lines | ~1,200 lines |
| **Consistency** | ❌ แตกต่างกัน | ✅ เหมือนกัน 100% |
| **Maintenance** | ❌ แก้ 10+ ที่ | ✅ แก้ที่เดียว |
| **New Document** | ❌ สร้าง component ใหม่ | ✅ เพิ่ม adapter เท่านั้น |
| **Testing** | ❌ ต้องทดสอบทุก component | ✅ ทดสอบ component เดียว |
| **Performance** | ⚠️ Load หลาย component | ✅ Load component เดียว |

## 🎨 Customization Strategy

แม้ใช้ template เดียวกัน แต่สามารถ customize ได้:

### 1. Dynamic Labels
```javascript
// ป้ายกำกับเปลี่ยนตามประเภท
getIssuerLabel('purchase_request')  // "ผู้ขอซื้อ"
getIssuerLabel('quotation')         // "ผู้ขาย"
getIssuerLabel('invoice')           // "ผู้ขาย"
```

### 2. Conditional Sections
```vue
<!-- แสดงเฉพาะเอกสารบางประเภท -->
<div v-if="data.documentType === 'invoice'" class="tax-info">
  <!-- Tax invoice specific info -->
</div>

<div v-if="data.documentType.includes('purchase')" class="vendor-info">
  <!-- Purchase specific info -->
</div>
```

### 3. Dynamic Signatures
```javascript
// ลายเซ็นต่างกันตามประเภทเอกสาร
getSignatures('purchase_request')  // [ผู้ขอซื้อ, ผู้อนุมัติ, ผู้จัดการ]
getSignatures('quotation')         // [ผู้เสนอราคา, ผู้อนุมัติ]
getSignatures('invoice')           // [ผู้ออกเอกสาร, ผู้รับเงิน, ผู้อนุมัติ]
```

### 4. CSS Variables
```javascript
// สีและ style ต่างกันตามประเภท
const cssVars = computed(() => ({
  '--header-color': data.documentType === 'invoice' ? '#dc2626' : '#2563eb',
  '--accent-color': data.documentType === 'quotation' ? '#7c3aed' : '#059669'
}))
```

## 🚀 Implementation Steps

1. **สร้าง UniversalDocument.vue**
   - Copy template จาก PurchaseRequestDocument.vue
   - แทนที่ hard-coded values ด้วย Standard Schema fields
   - เพิ่ม dynamic labels และ conditional sections

2. **Update DocumentPreview.vue**
   - ใช้ UniversalDocument แทน specific components
   - ส่ง Standard Document Schema เสมอ

3. **Test ทุก Document Type**
   - Purchase Request
   - Quotation
   - Invoice
   - Sales Order
   - Purchase Order

4. **Deprecate Old Components**
   - เก็บไว้ชั่วคราวเพื่อ backward compatibility
   - ลบออกใน version ถัดไป

## 📝 Example Usage

```javascript
// ทุก document type ใช้วิธีเดียวกัน
const standardDocument = createStandardDocument(documentType, rawData)

// Render
h(UniversalDocument, {
  data: standardDocument,
  pageNumber: 1,
  totalPages: 2,
  itemsPerPage: 12
})
```

## ✅ Success Criteria

- [ ] UniversalDocument.vue created
- [ ] Works with Purchase Request
- [ ] Works with Quotation
- [ ] Works with Invoice
- [ ] Layout identical across all types
- [ ] Labels change correctly per type
- [ ] Signatures correct per type
- [ ] Performance acceptable
- [ ] Old components deprecated
- [ ] Documentation updated

---

**Status:** 🟡 In Progress
**Next Step:** Create UniversalDocument.vue
**Priority:** High
